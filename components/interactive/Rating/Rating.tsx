'use client';

import {
  forwardRef,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './Rating.module.scss';

/**
 * Rating — APG radiogroup star-rating input primitive.
 *
 * Single-value input rendering a row of N stars; consumer picks one as
 * the rating. Implements the W3C APG `radio-rating` pattern (radiogroup
 * with roving tabindex), so keyboard navigation works exactly like
 * native radio buttons: Tab enters the group at the selected star, then
 * Arrow keys move + select, Home/End jump to the first/last star, and
 * Space/Enter activate the focused star.
 *
 * `readOnly` mode supports fractional values (e.g. `4.3` → 4 filled + 1
 * partial). Interactive mode commits whole-star increments only; the
 * caller can quantize externally if half-star input is required (rare
 * for product reviews, common for system-computed averages).
 *
 * @layer   interactive (molecule budget — 9 props within ≤7 ideal hard cap stretched by APG roving tabindex + form integration; per Slider/Toggle convention)
 * @tokens  --color-warning (filled), --color-border (empty outline),
 *          --color-text-muted (readOnly emphasis fallback), --space-4|5|6
 *          (sm|md|lg star sizing), --duration-fast + --easing-default
 *          (hover/active transitions; reduced-motion guard).
 * @deps    React (hooks + types), utils/cn. Inline SVG star — zero
 *          external icon library.
 * @apg     https://www.w3.org/WAI/ARIA/apg/patterns/radio/examples/radio-rating/
 * @a11y    Root `role="radiogroup"` with `aria-label` (REQUIRED unless
 *          `aria-labelledby` is supplied). Each star is `role="radio"`
 *          with `aria-checked` + roving `tabindex`. Hover preview is
 *          purely visual — screen readers announce committed value only.
 *          When `name` is provided, the component renders a hidden
 *          `<input>` so the value participates in native form submit.
 * @tested  Specs co-located in `tests/`. Playwright runtime execution
 *          deferred per 0.20.0 charts cycle precedent (specs ship,
 *          runtime batched into 0.21.x test-execution sprint).
 *
 * @example
 * // Uncontrolled, default 5 stars
 * <Rating aria-label="Rate product" defaultValue={4} onChange={(v) => log(v)} />
 *
 * @example
 * // Controlled, 10-star max, half-star display
 * <Rating aria-label="Driver rating" max={10} value={7.5} readOnly />
 *
 * @example
 * // Form integration via hidden input
 * <form>
 *   <Rating aria-label="Score" name="score" defaultValue={3} />
 *   <button type="submit">Submit</button>
 * </form>
 */
export type RatingSize = 'sm' | 'md' | 'lg';

export interface RatingProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** Controlled rating value. Use together with `onChange`. */
  value?: number;
  /** Uncontrolled initial value. Default `0` (no rating). */
  defaultValue?: number;
  /** Fires when the user commits a new value (click or keyboard activation). */
  onChange?: (value: number) => void;
  /** Number of stars. Default `5`. */
  max?: number;
  /**
   * Read-only mode — supports fractional values (rendered as partial
   * fills). No keyboard interaction; star group is announced but not
   * focusable. Default `false`.
   */
  readOnly?: boolean;
  /** Star size scale. Default `'md'`. */
  size?: RatingSize;
  /**
   * Form field name. When provided, a hidden `<input>` mirrors the
   * current value so the rating submits with the form.
   */
  name?: string;
  /**
   * When `true`, clicking the currently-selected star clears the value
   * back to `0` (toggle behavior). Default `true`.
   */
  allowClear?: boolean;
  /**
   * Accessible label for the radiogroup. REQUIRED unless `aria-labelledby`
   * is provided — without one, screen readers cannot announce the rating
   * purpose.
   */
  'aria-label'?: string;
  /** Alternative to `aria-label` — references an external label by id. */
  'aria-labelledby'?: string;
}

const SIZE_CLASS: Record<RatingSize, string> = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
};

export const Rating = forwardRef<HTMLDivElement, RatingProps>(function Rating(
  {
    value: controlledValue,
    defaultValue = 0,
    onChange,
    max = 5,
    readOnly = false,
    size = 'md',
    name,
    allowClear = true,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  },
  ref,
) {
  const groupId = useId();
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = isControlled ? controlledValue! : uncontrolledValue;

  // Roving-tabindex tracking — the star at `focusedIndex` is the single
  // tab stop. When nothing is yet selected we make the FIRST star
  // focusable so Tab enters the group cleanly per APG initial-focus rule.
  const initialFocusIndex = useMemo(() => {
    if (value <= 0) return 0;
    const idx = Math.ceil(value) - 1;
    return Math.min(Math.max(idx, 0), max - 1);
  }, [value, max]);
  const [focusedIndexRaw, setFocusedIndex] = useState(initialFocusIndex);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  // Clamp on read — keeps `focusedIndex` always in `[0, max - 1]` even
  // when `max` changes externally, without a state-syncing effect (which
  // would violate React 19 `react-hooks/set-state-in-effect`).
  const focusedIndex = Math.min(Math.max(focusedIndexRaw, 0), max - 1);

  const starRefs = useRef<Array<HTMLSpanElement | null>>([]);
  // Note: length sync happens implicitly via the ref-callback prop on
  // each star — assigning at index `idx` grows the sparse array. Writing
  // `starRefs.current.length = max` during render would violate the
  // React 19 `react-hooks/refs` rule.

  const commit = useCallback(
    (next: number) => {
      if (readOnly) return;
      const clamped = Math.min(Math.max(next, 0), max);
      if (!isControlled) setUncontrolledValue(clamped);
      onChange?.(clamped);
    },
    [isControlled, max, onChange, readOnly],
  );

  const focusStar = useCallback((idx: number) => {
    const el = starRefs.current[idx];
    if (el) el.focus();
  }, []);

  const handleStarClick = useCallback(
    (idx: number) => {
      const newValue = idx + 1;
      if (allowClear && Math.round(value) === newValue) {
        commit(0);
      } else {
        commit(newValue);
      }
      setFocusedIndex(idx);
    },
    [allowClear, commit, value],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLSpanElement>, idx: number) => {
      if (readOnly) return;

      let next: number | null = null;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          next = (idx + 1) % max;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          next = (idx - 1 + max) % max;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = max - 1;
          break;
        case ' ':
        case 'Enter':
          event.preventDefault();
          handleStarClick(idx);
          return;
        default:
          return;
      }

      event.preventDefault();
      setFocusedIndex(next);
      // APG radiogroup: Arrow keys also CHECK the new option (select-on-
      // focus pattern, distinct from toolbar radiogroup which doesn't).
      commit(next + 1);
      focusStar(next);
    },
    [commit, focusStar, handleStarClick, max, readOnly],
  );

  const handlePointerEnter = useCallback(
    (_event: PointerEvent<HTMLSpanElement>, idx: number) => {
      if (readOnly) return;
      setHoverIndex(idx);
    },
    [readOnly],
  );

  const handleGroupPointerLeave = useCallback(() => {
    setHoverIndex(null);
  }, []);

  const stars = Array.from({ length: max }, (_, idx) => {
    const starValue = idx + 1;
    const previewValue = hoverIndex !== null ? hoverIndex + 1 : value;
    const isChecked = Math.round(value) === starValue;
    const fillRatio = clamp01(previewValue - idx);
    const isTabStop = idx === focusedIndex;

    return (
      <span
        key={idx}
        ref={(node) => {
          starRefs.current[idx] = node;
        }}
        role="radio"
        aria-checked={isChecked}
        aria-label={`${starValue} ${starValue === 1 ? 'star' : 'stars'}`}
        tabIndex={readOnly ? -1 : isTabStop ? 0 : -1}
        className={cn(styles.star, isChecked && styles.starChecked)}
        onClick={readOnly ? undefined : () => handleStarClick(idx)}
        onKeyDown={readOnly ? undefined : (event) => handleKeyDown(event, idx)}
        onPointerEnter={readOnly ? undefined : (event) => handlePointerEnter(event, idx)}
        onFocus={readOnly ? undefined : () => setFocusedIndex(idx)}
        style={{ ['--rating-star-fill' as never]: fillRatio }}
      >
        {/* Empty outline — bottom layer, always full */}
        <StarSvg className={styles.starOutline} />
        {/* Filled overlay — width capped by fillRatio to support
            fractional rendering in readOnly mode + hover preview */}
        <span className={styles.starFillClip} aria-hidden="true">
          <StarSvg className={styles.starFill} />
        </span>
      </span>
    );
  });

  return (
    <div
      ref={ref}
      role="radiogroup"
      id={groupId}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-readonly={readOnly || undefined}
      className={cn(styles.root, SIZE_CLASS[size], readOnly && styles.readOnly, className)}
      onPointerLeave={handleGroupPointerLeave}
      {...rest}
    >
      {stars}
      {name ? (
        <input
          type="hidden"
          name={name}
          value={value}
          // Hidden mirror — invisible to AT (the radiogroup is the
          // a11y surface). Native form submission picks this up.
        />
      ) : null}
    </div>
  );
});

function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function StarSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2.5l2.93 6.16 6.57.72-4.92 4.6 1.41 6.52L12 17.27l-5.99 3.23 1.41-6.52L2.5 9.38l6.57-.72L12 2.5z" />
    </svg>
  );
}
