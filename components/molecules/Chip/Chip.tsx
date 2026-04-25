import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './Chip.module.scss';

/**
 * Chip — pill-shaped toggleable filter chip (Phase 7 molecule, v0.5.4).
 *
 * Promoted from scout-hub `2026-04_e05-ui-polish` B7 batches list status
 * filter row (12 raw `<button>` elements with custom pressed-state styling)
 * — the threshold for promotion per `rules/frontend/component-architecture.md`.
 *
 * Distinct from `Toggle`: Toggle is a generic on/off button (Bold, Italic);
 * Chip is the filter-row pattern with smaller dimensions, pill-only shape,
 * and brand-on-pressed semantics. Different mental model → different
 * component (per ToggleGroupFilter precedent).
 *
 * @layer   molecule
 * @tokens  --color-brand, --color-brand-subtle, --color-brand-strong,
 *          --color-surface, --color-surface-raised, --color-border-subtle,
 *          --color-text-{primary,secondary,muted}, --color-{success,warning,
 *          error,info,brand}-strong (for dot indicators), --space-{1,2,3},
 *          --font-size-xs, --font-weight-medium, --letter-spacing-wide,
 *          --radius-full, --duration-fast, --easing-default,
 *          --focus-ring (via mx.focus-ring mixin in SCSS)
 * @deps    cn, React: `forwardRef`, types `ButtonHTMLAttributes`, `ReactNode`
 * @a11y    Native `<button type="button" aria-pressed>` — keyboard
 *          activation (Space/Enter) + assistive-tech press semantics for
 *          free. Disabled state uses native `disabled`. The decorative
 *          dot (when `dot={true}`) carries `aria-hidden="true"` — meaning
 *          must be in the chip label text. Controlled-only — parent owns
 *          the `pressed` state, simplifying integration with
 *          `useState<string[]>` filter selection.
 *
 * @example
 * const [active, setActive] = useState<string[]>([]);
 * const toggle = (status: string) =>
 *   setActive(prev => prev.includes(status)
 *     ? prev.filter(s => s !== status)
 *     : [...prev, status]);
 *
 * <Chip
 *   pressed={active.includes('queued')}
 *   onPressedChange={() => toggle('queued')}
 * >
 *   Queued
 * </Chip>
 *
 * <Chip pressed={true} dot dotColor="success">Online</Chip>
 */
export type ChipSize = 'sm' | 'md';
export type ChipTone = 'default' | 'brand';
export type ChipDotColor =
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'muted';

export interface ChipProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'value' | 'defaultValue' | 'onChange' | 'children'
  > {
  /** Controlled pressed state. Required. */
  pressed: boolean;
  /** Pressed change callback (fires on click; receives the next value). */
  onPressedChange?: (pressed: boolean) => void;
  /** Size scale. Default `'md'`. */
  size?: ChipSize;
  /**
   * Pressed-state color tone. Default `'brand'` (brand-subtle background +
   * brand-strong text on pressed). `'default'` swaps to a neutral
   * surface-raised background + primary text — useful for filter rows
   * where the active state should not compete with brand CTAs.
   */
  tone?: ChipTone;
  /** Render a leading status dot. Default `false`. */
  dot?: boolean;
  /** Status dot color (only applies when `dot={true}`). Default `'brand'`. */
  dotColor?: ChipDotColor;
  /** Chip label text — visible accessible name. */
  children: ReactNode;
}

const SIZE_CLASS: Record<ChipSize, string> = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
};

const TONE_CLASS: Record<ChipTone, string> = {
  default: styles.toneDefault!,
  brand: styles.toneBrand!,
};

const DOT_COLOR_CLASS: Record<ChipDotColor, string> = {
  brand: styles.dotBrand!,
  success: styles.dotSuccess!,
  warning: styles.dotWarning!,
  error: styles.dotError!,
  info: styles.dotInfo!,
  muted: styles.dotMuted!,
};

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  {
    pressed,
    onPressedChange,
    size = 'md',
    tone = 'brand',
    dot = false,
    dotColor = 'brand',
    disabled,
    className,
    onClick,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={pressed}
      data-state={pressed ? 'on' : 'off'}
      disabled={disabled}
      className={cn(
        styles.root,
        SIZE_CLASS[size],
        TONE_CLASS[tone],
        pressed && styles.pressed,
        className,
      )}
      onClick={(event) => {
        onPressedChange?.(!pressed);
        onClick?.(event);
      }}
      {...rest}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cn(styles.dot, DOT_COLOR_CLASS[dotColor])}
        />
      ) : null}
      <span className={styles.label}>{children}</span>
    </button>
  );
});
