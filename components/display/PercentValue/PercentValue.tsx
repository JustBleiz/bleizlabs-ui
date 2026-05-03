import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import styles from './PercentValue.module.scss';

/**
 * PercentValue — large percentage display atom with tone-derived color
 *
 * @layer   atom (display) — Server Component since v0.7.0
 * @tokens  --font-primary, --font-size-{3xl,4xl,5xl,sm}, --font-weight-{semibold,medium},
 *          --line-height-tight, --letter-spacing-{tighter,normal},
 *          --color-text-{primary,secondary,muted},
 *          --color-{success,warning,error,brand-500}, --space-{1,2}
 * @deps    cn (lib). Zero icon-library deps per D5. Symmetric pair with
 *          {@link KpiValue}. Animation moved to {@link PercentValueAnimated}
 *          client wrapper since v0.7.0 (was forced `'use client'` on this
 *          atom).
 * @a11y    Pure presentational atom — renders <div>. SCSS includes defensive
 *          baseline reduced-motion block. Consumers add `aria-label` /
 *          `role="status"` via spread when value is live data. For semantic
 *          wrapping, compose externally:
 *          `<article aria-label="..."><PercentValue ... /></article>`. Owns
 *          its inner layout — `children?: never` enforces this (drops 1 axis;
 *          mirrors KpiValue SRP decision).
 *
 * @serverSafe Default since v0.7.0. Pure render of `${value.toFixed(decimals)}%`
 *          (or supplied ReactNode). For animated count-up use
 *          {@link PercentValueAnimated}.
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

export type PercentValueTone = 'auto' | 'primary' | 'success' | 'warning' | 'error' | 'brand';
type ResolvedTone = Exclude<PercentValueTone, 'auto'>;

const VALUE_COLOR_VAR: Record<ResolvedTone, string> = {
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
  tone: PercentValueTone,
  thresholds: PercentValueProps['thresholds'],
  inverse: boolean
): ResolvedTone {
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
  tone?: PercentValueTone;
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
  /** Optional benchmark caption rendered below value (e.g. `"industry avg 20%"`, `"target ≥95%"`). */
  benchmark?: string;
  /**
   * Optional renderer for the percent cell. When supplied, replaces the
   * default `${value.toFixed(decimals)}%` output. {@link PercentValueAnimated}
   * uses this slot to inject `<AnimatedCounter>`. Consumers can also use
   * it for custom formatting while keeping PercentValue as a Server
   * Component.
   */
  renderValue?: (value: number, decimals: number) => ReactNode;
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
      benchmark,
      renderValue,
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
            {renderValue
              ? renderValue(value, decimals)
              : `${value.toFixed(decimals)}%`}
          </span>
        </span>
        {benchmark && <span className={styles.benchmark}>{benchmark}</span>}
      </div>
    );
  }
);
