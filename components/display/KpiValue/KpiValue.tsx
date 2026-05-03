import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './KpiValue.module.scss';

/**
 * KpiValue — large numeric metric display with unit label and optional trend
 *
 * @layer   atom (display) — Server Component since v0.7.0
 * @tokens  --font-primary, --font-size-{3xl,4xl,5xl,sm}, --font-weight-{semibold,medium},
 *          --line-height-tight, --letter-spacing-{tighter,normal},
 *          --color-text-{primary,secondary,muted},
 *          --color-{success,warning,error,brand-500}, --space-{1,2}
 * @deps    cn (lib). Zero icon-library deps per D5 — trend icons are inline
 *          SVG with optional `trend.icon` ReactNode slot for consumer override.
 *          Animation moved to {@link KpiValueAnimated} client wrapper since
 *          v0.7.0 (was forced `'use client'` on this atom).
 * @a11y    Pure presentational atom — renders <div>. Default inline trend icon is
 *          decorative (`aria-hidden="true"`). Trend label conveys direction in text
 *          for screen readers. SCSS includes defensive baseline reduced-motion
 *          block. Consumers add `aria-label` / `role="status"` via spread when
 *          value is live data. For semantic wrapping, compose externally:
 *          `<article aria-label="..."><KpiValue ... /></article>` — KpiValue owns
 *          its own internal layout so asChild Slot pattern is intentionally not
 *          supported (drops 1 variation axis; `children?: never` enforces this).
 *
 * @serverSafe Default since v0.7.0. Pure render of `String(value)` (or supplied
 *          ReactNode). For animated count-up use {@link KpiValueAnimated}.
 *
 * @example
 * <KpiValue value={12500} unit="PLN" />
 *
 * @example
 * <KpiValue
 *   value={42}
 *   unit="konwersji"
 *   trend={{ direction: 'up', label: '+12%' }}
 * />
 *
 * @example
 * // String fallback for missing data
 * <KpiValue value="—" unit="brak danych" />
 *
 * @example
 * // Custom trend icon (consumer-provided ReactNode — optional override)
 * <KpiValue
 *   value={42}
 *   unit="konwersji"
 *   trend={{
 *     direction: 'up',
 *     label: '+12%',
 *     icon: <span aria-hidden="true">▲</span>,
 *   }}
 * />
 *
 * @example
 * // Semantic wrapping
 * <article aria-label="Service uptime">
 *   <KpiValue value={98} unit="%" color="success" />
 * </article>
 */

const VALUE_COLOR_VAR: Record<NonNullable<KpiValueProps['color']>, string> = {
  primary: 'var(--color-text-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  brand: 'var(--color-brand-500)',
};

const SIZE_CLASS: Record<NonNullable<KpiValueProps['size']>, string> = {
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
  xl: styles.sizeXl!,
};

export type KpiTrendDirection = 'up' | 'down' | 'flat';

const TREND_CLASS: Record<KpiTrendDirection, string> = {
  up: styles.trendUp!,
  down: styles.trendDown!,
  flat: styles.trendFlat!,
};

// Path-only data per direction; shared <svg> wrapper below collapses 6×
// duplicated SVG attrs into one definition (eval iter-1 IMPORTANT-3 fix).
const TREND_PATH: Record<KpiTrendDirection, ReactNode> = {
  up: (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </>
  ),
  down: (
    <>
      <path d="M3 7l6 6 4-4 8 8" />
      <path d="M14 17h7v-7" />
    </>
  ),
  flat: <path d="M5 12h14" />,
};

function DefaultTrendIcon({ direction }: { direction: KpiTrendDirection }) {
  // Inline SVG — zero-dep per D5. Stroke 2, 14×14 to match lib icon sizing.
  // aria-hidden via parent span; <svg> here is purely decorative.
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {TREND_PATH[direction]}
    </svg>
  );
}

export interface KpiValueProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Main display value. Number or string — both render as-is. For
   * animated count-up use {@link KpiValueAnimated}. */
  value: number | string;
  /** Unit label (e.g. `"PLN"`, `"%"`, `"konwersji"`). Renders inline-right of value as small/muted text. */
  unit?: string;
  /** Visual scale of the numeric value. Default `'lg'`. */
  size?: 'md' | 'lg' | 'xl';
  /** Color of the value. Default `'primary'`. */
  color?: 'primary' | 'success' | 'warning' | 'error' | 'brand';
  /** Optional trend indicator displayed in a row below the value. */
  trend?: {
    /** Trend direction — `up` (success/green), `down` (error/red), `flat` (muted). */
    direction: KpiTrendDirection;
    /** Optional label text (e.g. `"+12%"`, `"-3 PLN"`). Renders next to trend icon. */
    label?: string;
    /** Optional icon slot. Default uses inline SVG matching direction. Consumer-provided node should be aria-hidden. */
    icon?: ReactNode;
  };
  /**
   * Optional renderer for the value cell. When supplied, replaces the
   * default `<span>{String(value)}</span>` output. {@link KpiValueAnimated}
   * uses this slot to inject `<AnimatedCounter>`. Consumers can also use
   * it for custom formatting (e.g. their own Intl.NumberFormat config)
   * while keeping KpiValue as a Server Component.
   */
  renderValue?: (value: number | string) => ReactNode;
  /** Optional accessible label, applied to the root element. */
  'aria-label'?: string;
  // Note: `role?: AriaRole` is provided by HTMLAttributes (not re-declared
  // to avoid widening to `string`). Use e.g. `role="status"` for live data.
  /**
   * @internal KpiValue owns its inner layout — children are not accepted.
   * For secondary content use `trend` slot; for semantic wrapping compose externally.
   */
  children?: never;
}

export const KpiValue = forwardRef<HTMLDivElement, KpiValueProps>(
  function KpiValue(
    {
      value,
      unit,
      size = 'lg',
      color = 'primary',
      trend,
      renderValue,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const valueColorVar = VALUE_COLOR_VAR[color];

    return (
      <div
        ref={ref}
        className={cn(styles.root, className)}
        style={
          {
            ...style,
            '--kpi-value-color': valueColorVar,
          } as CSSProperties
        }
        {...rest}
      >
        <span className={cn(styles.valueRow, SIZE_CLASS[size])}>
          <span className={styles.value}>
            {renderValue ? renderValue(value) : String(value)}
          </span>
          {unit && <span className={styles.unit}>{unit}</span>}
        </span>
        {trend && (
          <span className={cn(styles.trendRow, TREND_CLASS[trend.direction])}>
            {trend.icon ?? <DefaultTrendIcon direction={trend.direction} />}
            {trend.label && (
              <span className={styles.trendLabel}>{trend.label}</span>
            )}
          </span>
        )}
      </div>
    );
  }
);
