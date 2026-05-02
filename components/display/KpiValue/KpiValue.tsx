'use client';
// 'use client' — required because optional `animated` prop forwards to
// AnimatedCounter (which uses requestAnimationFrame + useState + matchMedia).
// Component itself is otherwise stateless; client boundary is the AnimatedCounter
// dependency. Consumers wrapping in RSC contexts: KpiValue creates the boundary.

import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { AnimatedCounter } from '../../specialized/AnimatedCounter/AnimatedCounter';
import { cn } from '../../utils/cn';
import styles from './KpiValue.module.scss';

/**
 * KpiValue — large numeric metric display with unit label and optional trend
 *
 * @layer   atom (display)
 * @tokens  --font-primary, --font-size-{3xl,4xl,5xl,sm}, --font-weight-{semibold,medium},
 *          --line-height-tight, --letter-spacing-{tighter,normal},
 *          --color-text-{primary,secondary,muted},
 *          --color-{success,warning,error,brand-500}, --space-{1,2}
 * @deps    AnimatedCounter (lib, conditional via `animated` prop), cn (lib).
 *          Zero icon-library deps per D5: trend icons are inline SVG with optional
 *          `trend.icon` ReactNode slot for consumer override.
 * @a11y    Pure presentational atom — renders <div>. Default inline trend icon is
 *          decorative (`aria-hidden="true"`). Trend label conveys direction in text
 *          for screen readers. AnimatedCounter handles `prefers-reduced-motion`
 *          internally; SCSS includes defensive baseline PRM block. Consumers add
 *          `aria-label` / `role="status"` via spread when value is live data.
 *          For semantic wrapping, compose externally:
 *          `<article aria-label="..."><KpiValue ... /></article>` — KpiValue owns
 *          its own internal layout so asChild Slot pattern is intentionally not
 *          supported (drops 1 variation axis; `children?: never` enforces this).
 *
 * @example
 * <KpiValue value={12500} unit="PLN" animated />
 *
 * @example
 * <KpiValue
 *   value={42}
 *   unit="konwersji"
 *   trend={{ direction: 'up', label: '+12%' }}
 *   animated
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

type TrendDirection = 'up' | 'down' | 'flat';

const TREND_CLASS: Record<TrendDirection, string> = {
  up: styles.trendUp!,
  down: styles.trendDown!,
  flat: styles.trendFlat!,
};

// Path-only data per direction; shared <svg> wrapper below collapses 6×
// duplicated SVG attrs into one definition (eval iter-1 IMPORTANT-3 fix).
const TREND_PATH: Record<TrendDirection, ReactNode> = {
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

function DefaultTrendIcon({ direction }: { direction: TrendDirection }) {
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
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'children'> {
  /** Main display value. Number enables animation; string renders as-is (e.g. `"—"`, `"N/A"`). */
  value: number | string;
  /** Unit label (e.g. `"PLN"`, `"%"`, `"konwersji"`). Renders inline-right of value as small/muted text. */
  unit?: string;
  /** Visual scale of the numeric value. Default `'lg'`. */
  size?: 'md' | 'lg' | 'xl';
  /** Color of the value. Default `'primary'`. */
  color?: 'primary' | 'success' | 'warning' | 'error' | 'brand';
  /** When `true`, animate count-up from 0 to value (effective only when `value` is a number). Default `false`. */
  animated?: boolean;
  /** Animation duration in ms (forwarded to AnimatedCounter). Default 1500. */
  duration?: number;
  /** Fraction digits for numeric formatting (forwarded to AnimatedCounter). Default 0. */
  decimals?: number;
  /** Locale for numeric formatting (BCP-47, forwarded to AnimatedCounter). Default `'pl-PL'`. */
  locale?: string;
  /** Optional trend indicator displayed in a row below the value. */
  trend?: {
    /** Trend direction — `up` (success/green), `down` (error/red), `flat` (muted). */
    direction: TrendDirection;
    /** Optional label text (e.g. `"+12%"`, `"-3 PLN"`). Renders next to trend icon. */
    label?: string;
    /** Optional icon slot. Default uses inline SVG matching direction. Consumer-provided node should be aria-hidden. */
    icon?: ReactNode;
  };
  /** Optional accessible label, applied to the root element. */
  'aria-label'?: string;
  /** Optional ARIA role (e.g. `"status"` for live data updates). */
  role?: string;
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
      animated = false,
      duration,
      decimals,
      locale,
      trend,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const valueColorVar = VALUE_COLOR_VAR[color];
    const isAnimatable = animated && typeof value === 'number';

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
            {isAnimatable ? (
              <AnimatedCounter
                value={value}
                duration={duration}
                decimals={decimals}
                locale={locale}
              />
            ) : (
              String(value)
            )}
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
