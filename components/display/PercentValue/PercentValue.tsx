'use client';
// 'use client' — required because optional `animated` prop forwards to
// AnimatedCounter (which uses requestAnimationFrame + useState + matchMedia).
// Component itself is otherwise stateless; client boundary is the AnimatedCounter
// dependency. Mirrors KpiValue (D10) sister-atom pattern.

import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { AnimatedCounter } from '../../specialized/AnimatedCounter/AnimatedCounter';
import { cn } from '../../utils/cn';
import styles from './PercentValue.module.scss';

/**
 * PercentValue — large percentage display atom with tone-derived color
 *
 * @layer   atom (display)
 * @tokens  --font-primary, --font-size-{3xl,4xl,5xl,sm}, --font-weight-{semibold,medium},
 *          --line-height-tight, --letter-spacing-{tighter,normal},
 *          --color-text-{primary,secondary,muted},
 *          --color-{success,warning,error,brand-500}, --space-{1,2}
 * @deps    AnimatedCounter (lib, conditional via `animated` prop), cn (lib).
 *          Zero icon-library deps per D5. Symmetric pair with KpiValue (D10).
 * @a11y    Pure presentational atom — renders <div>. AnimatedCounter handles
 *          `prefers-reduced-motion` internally; SCSS includes defensive baseline
 *          PRM block. Consumers add `aria-label` / `role="status"` via spread
 *          when value is live data. For semantic wrapping, compose externally:
 *          `<article aria-label="..."><PercentValue ... /></article>`. Owns its
 *          inner layout — `children?: never` enforces this (drops 1 axis;
 *          mirrors KpiValue SRP decision).
 *
 * @example
 * <PercentValue value={42} />
 *
 * @example
 * // Auto tone — higher is better (e.g. uptime, satisfaction)
 * <PercentValue value={98} thresholds={{ success: 95, warning: 80 }} />
 *
 * @example
 * // Auto tone — lower is better (e.g. escalation, error rate)
 * <PercentValue
 *   value={22}
 *   inverse
 *   thresholds={{ success: 15, warning: 30 }}
 *   benchmark="industry avg 20%"
 *   animated
 * />
 *
 * @example
 * // Explicit tone override
 * <PercentValue value={50} tone="brand" size="xl" />
 *
 * @example
 * // Semantic wrapping
 * <article aria-label="Escalation rate">
 *   <PercentValue value={12} inverse thresholds={{ success: 15 }} />
 * </article>
 */

type ToneKey = 'primary' | 'success' | 'warning' | 'error' | 'brand';

const VALUE_COLOR_VAR: Record<ToneKey, string> = {
  primary: 'var(--color-text-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  brand: 'var(--color-brand-500)',
};

const SIZE_CLASS: Record<NonNullable<PercentValueProps['size']>, string> = {
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
  xl: styles.sizeXl!,
};

/**
 * Derive resolved tone from props. When `tone='auto'` and `thresholds.success`
 * is provided, maps value to success/warning/error per direction; otherwise
 * falls back to 'primary'.
 */
function deriveTone(
  value: number,
  tone: NonNullable<PercentValueProps['tone']>,
  thresholds: PercentValueProps['thresholds'],
  inverse: boolean
): ToneKey {
  if (tone !== 'auto') return tone;
  const success = thresholds?.success;
  const warning = thresholds?.warning;
  if (success === undefined) return 'primary';
  if (inverse) {
    if (value <= success) return 'success';
    if (warning !== undefined && value <= warning) return 'warning';
    return 'error';
  }
  if (value >= success) return 'success';
  if (warning !== undefined && value >= warning) return 'warning';
  return 'error';
}

export interface PercentValueProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Percentage value (0-100 expected; accepts any number for edge cases). */
  value: number;
  /** Visual scale of the percentage. Default `'lg'`. Mirrors KpiValue. */
  size?: 'md' | 'lg' | 'xl';
  /**
   * Color tone. `'auto'` (default) derives color from `thresholds` + `inverse`.
   * Explicit values override auto-derivation.
   */
  tone?: 'auto' | 'primary' | 'success' | 'warning' | 'error' | 'brand';
  /**
   * Threshold ranges for `tone='auto'` derivation. When omitted with auto, falls back to `'primary'`.
   * Default semantics (inverse=false): `value >= success` → success; `value >= warning` → warning; else error.
   * Inverted (inverse=true): `value <= success` → success; `value <= warning` → warning; else error.
   */
  thresholds?: { success?: number; warning?: number };
  /** When `true`, lower value = better (e.g. escalation rate, error rate). Default `false`. */
  inverse?: boolean;
  /** Fraction digits for percentage formatting. Default `0`. */
  decimals?: number;
  /** When `true`, animate count-up via AnimatedCounter. Default `false`. */
  animated?: boolean;
  /** Animation duration in ms (forwarded to AnimatedCounter). Default 1500. */
  duration?: number;
  /** Locale for numeric formatting (BCP-47, forwarded to AnimatedCounter). Default `'pl-PL'`. */
  locale?: string;
  /** Optional benchmark caption rendered below value (e.g. `"industry avg 20%"`, `"target ≥95%"`). */
  benchmark?: string;
  /** Optional accessible label, applied to the root element. */
  'aria-label'?: string;
  // Note: `role?: AriaRole` is provided by HTMLAttributes (not re-declared
  // to avoid widening to `string`). Use e.g. `role="status"` for live data.
  /**
   * @internal PercentValue owns its inner layout — children are not accepted.
   * For semantic wrapping compose externally; for additional context use `benchmark`.
   */
  children?: never;
}

export const PercentValue = forwardRef<HTMLDivElement, PercentValueProps>(
  function PercentValue(
    {
      value,
      size = 'lg',
      tone = 'auto',
      thresholds,
      inverse = false,
      decimals = 0,
      animated = false,
      duration,
      locale,
      benchmark,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const resolvedTone = deriveTone(value, tone, thresholds, inverse);
    const valueColorVar = VALUE_COLOR_VAR[resolvedTone];

    return (
      <div
        ref={ref}
        className={cn(styles.root, className)}
        style={
          {
            ...style,
            '--percent-value-color': valueColorVar,
          } as CSSProperties
        }
        {...rest}
      >
        <span className={cn(styles.valueRow, SIZE_CLASS[size])}>
          <span className={styles.percent}>
            {animated ? (
              <AnimatedCounter
                value={value}
                duration={duration}
                decimals={decimals}
                locale={locale}
                suffix="%"
              />
            ) : (
              `${value.toFixed(decimals)}%`
            )}
          </span>
        </span>
        {benchmark && <span className={styles.benchmark}>{benchmark}</span>}
      </div>
    );
  }
);
