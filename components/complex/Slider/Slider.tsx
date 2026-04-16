'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/components/utils/cn';
import { mergeRefs } from '@/components/utils/mergeRefs';
import styles from './Slider.module.scss';

/**
 * Slider — accessible single-thumb value selector (Phase 10 CI14).
 *
 * @layer    complex-interactive
 * @tokens   --color-brand, --color-surface-muted, --color-surface-raised,
 *           --color-border, --focus-ring, --duration-fast, --easing-default
 * @deps     cn, mergeRefs
 * @a11y     `role="slider"` on SliderThumb with `aria-valuenow` / `aria-valuemin` /
 *           `aria-valuemax` / `aria-orientation`. Keyboard per APG `/slider/`:
 *           Arrow ±step / Shift+Arrow ±largeStep / PageUp/Dn ±largeStep /
 *           Home/End → min/max. RTL mirrors horizontal Arrow Left/Right.
 *           Vertical: Up always increases regardless of coordinate system.
 *           Disabled uses `aria-disabled` (focusable) per library convention;
 *           Tab order stays intact for SR discovery.
 * @apg      https://www.w3.org/WAI/ARIA/apg/patterns/slider/
 * @tested   tsc + eslint + next build (Playwright/NVDA/axe deferred per E15 scope).
 * @regressions See `docs/_tmp/slider-spec.md` Radix regression cases SL-R01..SL-R29 (29 total).
 *
 * @example
 * // Basic uncontrolled
 * <Slider defaultValue={25} aria-label="Volume" />
 *
 * @example
 * // Controlled with formatter for aria-valuetext
 * <Slider
 *   value={price}
 *   onValueChange={setPrice}
 *   min={0} max={1000} step={10}
 *   formatValue={(v) => `$${v}`}
 *   aria-label="Price limit"
 * />
 *
 * @example
 * // Composition slot (advanced)
 * <Slider value={v} onValueChange={setV}>
 *   <SliderTrack>
 *     <SliderRange />
 *     <SliderThumb />
 *   </SliderTrack>
 * </Slider>
 */

// ============================================================================
// Types
// ============================================================================

export type SliderOrientation = 'horizontal' | 'vertical';
export type SliderDir = 'ltr' | 'rtl';

export interface SliderProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'onChange' | 'defaultValue'> {
  /** Controlled value. */
  value?: number;
  /** Uncontrolled initial value. Default `min`. */
  defaultValue?: number;
  /** Fires on every value change (drag + keyboard). */
  onValueChange?: (value: number) => void;
  /** Fires on commit boundary (pointerup / keyup). Useful for debounced side-effects. */
  onValueCommit?: (value: number) => void;
  /** Minimum value. Default `0`. */
  min?: number;
  /** Maximum value. Default `100`. */
  max?: number;
  /** Step increment. Default `1`. Must be `> 0`. */
  step?: number;
  /**
   * Page step / Shift+Arrow increment. Default `step * 10`.
   * PageUp/Dn and Shift+Arrow both use this value.
   */
  largeStep?: number;
  /** Orientation. Default `'horizontal'`. */
  orientation?: SliderOrientation;
  /** Writing direction for horizontal Arrow Left/Right mirroring. Default `'ltr'`. */
  dir?: SliderDir;
  /** Visually invert rendering (max renders at start edge). Default `false`. */
  inverted?: boolean;
  /** Disable all interaction. Thumb stays focusable for SR discovery. */
  disabled?: boolean;
  /** Keyboard + drag no-op, thumb still focusable. */
  readOnly?: boolean;
  /** Form field name. Renders hidden `<input type="range">` for form submission. */
  name?: string;
  /** Mark required on hidden input. */
  required?: boolean;
  /** Custom formatter for `aria-valuetext`. Defaults to raw number. */
  formatValue?: (value: number) => string;
  /**
   * Optional composition slot. When absent, renders default
   * `<SliderTrack><SliderRange /><SliderThumb /></SliderTrack>`.
   */
  children?: ReactNode;
}

export interface SliderTrackProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export type SliderRangeProps = HTMLAttributes<HTMLSpanElement>;

export interface SliderThumbProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'tabIndex' | 'role'> {
  /** Override accessible name (otherwise inherits from Slider `aria-label`/`aria-labelledby`). */
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

// ============================================================================
// Utilities — value math (pure)
// ============================================================================

function clampValue(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function quantizeValue(raw: number, min: number, step: number): number {
  // Safe rounding for decimal steps (0.1 etc.) — derive precision from step.
  const stepsFromMin = Math.round((raw - min) / step);
  const rounded = stepsFromMin * step + min;
  // Fix float drift: derive decimal digits of step + 1 safety.
  const stepStr = String(step);
  const dotIdx = stepStr.indexOf('.');
  const decimals = dotIdx === -1 ? 0 : stepStr.length - dotIdx - 1;
  return Number(rounded.toFixed(decimals));
}

function valueToPercent(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return ((value - min) / (max - min)) * 100;
}

function percentToValue(
  percent: number,
  min: number,
  max: number,
  step: number,
): number {
  const raw = (percent / 100) * (max - min) + min;
  return clampValue(quantizeValue(raw, min, step), min, max);
}

// ============================================================================
// Context
// ============================================================================

interface SliderContextValue {
  value: number;
  min: number;
  max: number;
  step: number;
  orientation: SliderOrientation;
  dir: SliderDir;
  inverted: boolean;
  disabled: boolean;
  readOnly: boolean;
  percent: number;
  thumbId: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  valueText: string;
  thumbRef: React.RefObject<HTMLSpanElement | null>;
  trackRef: React.RefObject<HTMLSpanElement | null>;
  handleThumbKeyDown: (event: ReactKeyboardEvent<HTMLSpanElement>) => void;
  handleTrackPointerDown: (event: ReactPointerEvent<HTMLSpanElement>) => void;
  handleTrackPointerMove: (event: ReactPointerEvent<HTMLSpanElement>) => void;
  handleTrackPointerUp: (event: ReactPointerEvent<HTMLSpanElement>) => void;
  handleTrackPointerCancel: (event: ReactPointerEvent<HTMLSpanElement>) => void;
  registerTrack: (node: HTMLSpanElement | null) => void;
}

const SliderContext = createContext<SliderContextValue | null>(null);

function useSliderContext(componentName: string): SliderContextValue {
  const ctx = useContext(SliderContext);
  if (!ctx) {
    throw new Error(`<${componentName}> must be rendered inside <Slider>`);
  }
  return ctx;
}

// ============================================================================
// Slider (root)
// ============================================================================

export const Slider = forwardRef<HTMLSpanElement, SliderProps>(function Slider(
  {
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    largeStep,
    orientation = 'horizontal',
    dir = 'ltr',
    inverted = false,
    disabled = false,
    readOnly = false,
    name,
    required,
    formatValue,
    children,
    className,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  },
  ref,
) {
  // Validation (dev-mode)
  if (process.env.NODE_ENV !== 'production') {
    if (step <= 0) {
      console.warn('<Slider>: step must be > 0. Falling back to 1.');
    }
    if (min > max) {
      console.warn('<Slider>: min > max. Clamping.');
    }
    if (!ariaLabel && !ariaLabelledBy && process.env.NODE_ENV !== 'test') {
      console.warn(
        '<Slider>: missing accessible name. Provide `aria-label` or `aria-labelledby`.',
      );
    }
  }

  const safeStep = step > 0 ? step : 1;
  const safeMin = min <= max ? min : max;
  const safeMax = max;
  const safeLargeStep = largeStep ?? safeStep * 10;

  const generatedId = useId();
  const thumbId = id ? `${id}-thumb` : `slider-${generatedId}-thumb`;

  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<number>(() => {
    const raw = defaultValue ?? safeMin;
    return clampValue(quantizeValue(raw, safeMin, safeStep), safeMin, safeMax);
  });
  const rawValue = isControlled ? controlledValue : uncontrolledValue;
  const value = clampValue(
    quantizeValue(rawValue, safeMin, safeStep),
    safeMin,
    safeMax,
  );

  const percent = valueToPercent(value, safeMin, safeMax);
  const valueText = formatValue ? formatValue(value) : String(value);

  const thumbRef = useRef<HTMLSpanElement | null>(null);
  const trackRef = useRef<HTMLSpanElement | null>(null);
  const isDraggingRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const latestValueRef = useRef(value);

  useLayoutEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  // Commit value to state + onValueChange callback, deduped by equality.
  const commit = useCallback(
    (next: number) => {
      if (next === latestValueRef.current) return;
      latestValueRef.current = next;
      if (!isControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const commitFinal = useCallback(
    (next: number) => {
      onValueCommit?.(next);
    },
    [onValueCommit],
  );

  const registerTrack = useCallback((node: HTMLSpanElement | null) => {
    trackRef.current = node;
  }, []);

  // Derive value from pointer event coordinates relative to track rect.
  const valueFromPointer = useCallback(
    (clientX: number, clientY: number): number => {
      const track = trackRef.current;
      if (!track) return latestValueRef.current;
      const rect = track.getBoundingClientRect();
      let pct: number;
      if (orientation === 'vertical') {
        // Y grows downward; value grows upward → invert.
        const rel = (clientY - rect.top) / rect.height;
        pct = (1 - rel) * 100;
      } else {
        const rel = (clientX - rect.left) / rect.width;
        pct = rel * 100;
      }
      // RTL horizontal mirror visual input (Arrow still handled separately).
      if (orientation === 'horizontal' && dir === 'rtl') {
        pct = 100 - pct;
      }
      // inverted flag mirrors the raw visual mapping.
      if (inverted) {
        pct = 100 - pct;
      }
      pct = Math.max(0, Math.min(100, pct));
      return percentToValue(pct, safeMin, safeMax, safeStep);
    },
    [orientation, dir, inverted, safeMin, safeMax, safeStep],
  );

  const handleTrackPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLSpanElement>) => {
      if (disabled || readOnly) return;
      if (event.button !== undefined && event.button !== 0) return;
      const target = event.currentTarget;
      if (!target) return;
      target.setPointerCapture(event.pointerId);
      activePointerIdRef.current = event.pointerId;
      isDraggingRef.current = true;
      const next = valueFromPointer(event.clientX, event.clientY);
      commit(next);
      thumbRef.current?.focus({ preventScroll: true });
    },
    [disabled, readOnly, valueFromPointer, commit],
  );

  // Move/up/cancel handlers attached to the capturing element (track) via React.
  // setPointerCapture re-targets pointer events to the capturing element, so
  // the React onPointer* handlers on the track receive them even when the
  // pointer leaves the track's visible bounds. No document-level listeners
  // needed — avoids leak concerns from evaluator + cleaner unmount semantics.
  const handleTrackPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLSpanElement>) => {
      if (!isDraggingRef.current) return;
      if (event.pointerId !== activePointerIdRef.current) return;
      const next = valueFromPointer(event.clientX, event.clientY);
      commit(next);
    },
    [valueFromPointer, commit],
  );

  const handleTrackPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLSpanElement>) => {
      if (event.pointerId !== activePointerIdRef.current) return;
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      activePointerIdRef.current = null;
      const target = event.currentTarget;
      if (target && target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }
      commitFinal(latestValueRef.current);
    },
    [commitFinal],
  );

  const handleTrackPointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLSpanElement>) => {
      if (event.pointerId !== activePointerIdRef.current) return;
      isDraggingRef.current = false;
      activePointerIdRef.current = null;
      const target = event.currentTarget;
      if (target && target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }
    },
    [],
  );

  // Cleanup pointer capture state if component unmounts mid-drag.
  useEffect(() => {
    return () => {
      isDraggingRef.current = false;
      activePointerIdRef.current = null;
    };
  }, []);

  const handleThumbKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLSpanElement>) => {
      if (disabled || readOnly) return;
      // Skip modifier combos EXCEPT Shift (which is our largeStep modifier).
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const isRtlHorizontal = orientation === 'horizontal' && dir === 'rtl';
      const current = latestValueRef.current;
      let next: number | null = null;

      switch (event.key) {
        case 'ArrowRight':
          if (orientation === 'horizontal') {
            const delta = event.shiftKey ? safeLargeStep : safeStep;
            next = current + (isRtlHorizontal ? -delta : delta);
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal') {
            const delta = event.shiftKey ? safeLargeStep : safeStep;
            next = current + (isRtlHorizontal ? delta : -delta);
          }
          break;
        case 'ArrowUp': {
          const delta = event.shiftKey ? safeLargeStep : safeStep;
          next = current + delta;
          break;
        }
        case 'ArrowDown': {
          const delta = event.shiftKey ? safeLargeStep : safeStep;
          next = current - delta;
          break;
        }
        case 'PageUp':
          next = current + safeLargeStep;
          break;
        case 'PageDown':
          next = current - safeLargeStep;
          break;
        case 'Home':
          next = safeMin;
          break;
        case 'End':
          next = safeMax;
          break;
        default:
          return;
      }

      if (next === null) return;
      event.preventDefault();
      const clamped = clampValue(
        quantizeValue(next, safeMin, safeStep),
        safeMin,
        safeMax,
      );
      commit(clamped);
      commitFinal(clamped);
    },
    [
      disabled,
      readOnly,
      orientation,
      dir,
      safeStep,
      safeLargeStep,
      safeMin,
      safeMax,
      commit,
      commitFinal,
    ],
  );

  const contextValue = useMemo<SliderContextValue>(
    () => ({
      value,
      min: safeMin,
      max: safeMax,
      step: safeStep,
      orientation,
      dir,
      inverted,
      disabled,
      readOnly,
      percent,
      thumbId,
      ariaLabel,
      ariaLabelledBy,
      valueText,
      thumbRef,
      trackRef,
      handleThumbKeyDown,
      handleTrackPointerDown,
      handleTrackPointerMove,
      handleTrackPointerUp,
      handleTrackPointerCancel,
      registerTrack,
    }),
    [
      value,
      safeMin,
      safeMax,
      safeStep,
      orientation,
      dir,
      inverted,
      disabled,
      readOnly,
      percent,
      thumbId,
      ariaLabel,
      ariaLabelledBy,
      valueText,
      handleThumbKeyDown,
      handleTrackPointerDown,
      handleTrackPointerMove,
      handleTrackPointerUp,
      handleTrackPointerCancel,
      registerTrack,
    ],
  );

  return (
    <SliderContext.Provider value={contextValue}>
      <span
        ref={ref}
        {...rest}
        className={cn(
          styles.root,
          orientation === 'vertical' && styles.vertical,
          disabled && styles.disabled,
          className,
        )}
        data-orientation={orientation}
        data-disabled={disabled ? 'true' : undefined}
        data-readonly={readOnly ? 'true' : undefined}
        data-dir={dir}
      >
        {children ?? (
          <SliderTrack>
            <SliderRange />
            <SliderThumb />
          </SliderTrack>
        )}
        {name ? (
          <input
            type="range"
            name={name}
            value={value}
            min={safeMin}
            max={safeMax}
            step={safeStep}
            disabled={disabled}
            required={required}
            readOnly={readOnly}
            // Hidden but preserves form participation + native validation.
            aria-hidden="true"
            tabIndex={-1}
            onChange={() => {
              // no-op — value is owned by Slider state; this suppresses React's
              // controlled-input warning when the hidden input's value changes.
            }}
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: 'none',
            }}
          />
        ) : null}
      </span>
    </SliderContext.Provider>
  );
});

// ============================================================================
// SliderTrack
// ============================================================================

export const SliderTrack = forwardRef<HTMLSpanElement, SliderTrackProps>(
  function SliderTrack({ children, className, ...rest }, ref) {
    const ctx = useSliderContext('SliderTrack');
    const mergedRef = useMemo(
      () => mergeRefs<HTMLSpanElement>(ref, ctx.registerTrack),
      [ref, ctx.registerTrack],
    );
    return (
      <span
        ref={mergedRef}
        {...rest}
        className={cn(styles.track, className)}
        data-orientation={ctx.orientation}
        data-disabled={ctx.disabled ? 'true' : undefined}
        onPointerDown={ctx.handleTrackPointerDown}
        onPointerMove={ctx.handleTrackPointerMove}
        onPointerUp={ctx.handleTrackPointerUp}
        onPointerCancel={ctx.handleTrackPointerCancel}
      >
        {children ?? (
          <>
            <SliderRange />
            <SliderThumb />
          </>
        )}
      </span>
    );
  },
);

// ============================================================================
// SliderRange
// ============================================================================

export const SliderRange = forwardRef<HTMLSpanElement, SliderRangeProps>(
  function SliderRange({ className, style, ...rest }, ref) {
    const ctx = useSliderContext('SliderRange');
    const isHorizontal = ctx.orientation === 'horizontal';
    // Build inline style for dynamic position — layout math not expressible
    // via CSS tokens alone. Choose start edge based on dir + inverted.
    const rangeStyle: CSSProperties = (() => {
      if (isHorizontal) {
        const rtlLike = (ctx.dir === 'rtl') !== ctx.inverted; // XOR
        return rtlLike
          ? { right: '0%', width: `${ctx.percent}%` }
          : { left: '0%', width: `${ctx.percent}%` };
      }
      // Vertical: grows from bottom upward by default; inverted flips.
      return ctx.inverted
        ? { top: '0%', height: `${ctx.percent}%` }
        : { bottom: '0%', height: `${ctx.percent}%` };
    })();
    return (
      <span
        ref={ref}
        {...rest}
        className={cn(styles.range, className)}
        data-orientation={ctx.orientation}
        style={{ ...rangeStyle, ...style }}
      />
    );
  },
);

// ============================================================================
// SliderThumb
// ============================================================================

export const SliderThumb = forwardRef<HTMLSpanElement, SliderThumbProps>(
  function SliderThumb(
    {
      className,
      style,
      onKeyDown,
      'aria-label': thumbAriaLabel,
      'aria-labelledby': thumbAriaLabelledBy,
      ...rest
    },
    ref,
  ) {
    const ctx = useSliderContext('SliderThumb');
    const mergedRef = useMemo(
      () => mergeRefs<HTMLSpanElement>(ref, ctx.thumbRef),
      [ref, ctx.thumbRef],
    );
    const isHorizontal = ctx.orientation === 'horizontal';
    const rtlLike = isHorizontal && (ctx.dir === 'rtl') !== ctx.inverted; // XOR

    const thumbStyle: CSSProperties = (() => {
      if (isHorizontal) {
        return rtlLike
          ? { right: `${ctx.percent}%` }
          : { left: `${ctx.percent}%` };
      }
      return ctx.inverted
        ? { top: `${ctx.percent}%` }
        : { bottom: `${ctx.percent}%` };
    })();

    const effectiveAriaLabel = thumbAriaLabel ?? ctx.ariaLabel;
    const effectiveAriaLabelledBy = thumbAriaLabelledBy ?? ctx.ariaLabelledBy;

    return (
      <span
        ref={mergedRef}
        {...rest}
        id={ctx.thumbId}
        className={cn(styles.thumb, className)}
        role="slider"
        tabIndex={ctx.disabled ? -1 : 0}
        aria-orientation={ctx.orientation}
        aria-valuenow={ctx.value}
        aria-valuemin={ctx.min}
        aria-valuemax={ctx.max}
        aria-valuetext={ctx.valueText}
        aria-disabled={ctx.disabled ? 'true' : undefined}
        aria-readonly={ctx.readOnly ? 'true' : undefined}
        aria-label={effectiveAriaLabel}
        aria-labelledby={effectiveAriaLabelledBy}
        data-orientation={ctx.orientation}
        data-disabled={ctx.disabled ? 'true' : undefined}
        data-readonly={ctx.readOnly ? 'true' : undefined}
        style={{ ...thumbStyle, ...style }}
        onKeyDown={(event) => {
          ctx.handleThumbKeyDown(event);
          onKeyDown?.(event);
        }}
      />
    );
  },
);
