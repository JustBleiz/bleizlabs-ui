import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './KpiValue.module.scss';

/**
 * KpiValue — universal large-number metric display molecule (Server Component
 * since v0.7.0; merged with PercentValue 2026-05-04 — single canonical
 * molecule dla wszystkich big-number metrics including percentages).
 *
 * @layer   molecule (display) — Server Component
 * @reclassified 2026-05-08 (E05.3 AMEND) — was `atom` until 0.13.0. Re-classified to `molecule` because internally composes AnimatedCounter conditionally + own SVG trend icons + threshold-color logic + value/unit/trend/benchmark layout. 11 props exceed atom ≤3 budget; molecule ≤7 budget still exceeded by 4 → flagged for follow-up split into `KpiValue` (basic) + `KpiValueWithTrend`/`KpiValueWithThreshold` molecule(s) in 0.14+ cycle. See `D:/OS/internal/bleizlabs-ui/work/2026-05_lib-audit-rebuild/docs/lib-audit-2026-05-08.md` §Phase C AMEND #3.
 * @tokens  --font-primary, --font-size-{3xl,4xl,5xl,sm}, --font-weight-{semibold,medium},
 *          --line-height-tight, --letter-spacing-{tighter,normal},
 *          --color-text-{primary,secondary,muted},
 *          --color-{success,warning,error,brand-500}, --space-{1,2}
 * @notes   `unit === '%'` is special-cased: the percent sign attaches tightly
 *          inside the value span (no `--space-1` gap, no `.unit` styling) —
 *          renders as `42%` not `42 %`. Other units render via separate
 *          small/muted span (legacy KpiValue behavior preserved). This
 *          reproduces ex-PercentValue visual identity post-merge (v0.7.0).
 * @deps    cn (lib). Zero icon-library deps per D5 — trend icons are inline
 *          SVG with optional `trend.icon` ReactNode slot for consumer override.
 *          Animation moved to {@link KpiValueAnimated} client wrapper.
 * @a11y    Pure presentational molecule — renders <div>. Default inline trend icon is
 *          decorative (`aria-hidden="true"`). Trend label conveys direction in text
 *          for screen readers. SCSS includes defensive baseline reduced-motion
 *          block. Consumers add `aria-label` / `role="status"` via spread when
 *          value is live data. For semantic wrapping, compose externally:
 *          `<article aria-label="..."><KpiValue ... /></article>` — KpiValue owns
 *          its own internal layout so asChild Slot pattern is intentionally not
 *          supported (drops 1 variation axis; `children?: never` enforces this).
 *
 * @serverSafe Default. Pure render of formatted value (or supplied ReactNode).
 *          For animated count-up use {@link KpiValueAnimated}.
 *
 * @merge   v0.7.0 absorbed PercentValue per `bleizlabs/feedback_audit_before_create_or_keep`
 *          — overlapping core (big-number value display + size scale + color
 *          scheme) z additive deltas. Percent semantics teraz expressed via
 *          `unit="%"` (auto-rendered tightly attached, no separator) +
 *          optional `decimals` + `thresholds`/`inverse` + `benchmark`.
 *
 * @example
 * // Plain numeric KPI
 * <KpiValue value={12500} unit="PLN" />
 *
 * @example
 * // Percentage (replaces ex-PercentValue) — `unit="%"` renders inline tight
 * <KpiValue value={42} unit="%" decimals={0} />
 *
 * @example
 * // Auto-tone color via thresholds (higher is better)
 * <KpiValue
 *   value={98}
 *   unit="%"
 *   color="auto"
 *   thresholds={{ success: 95, warning: 80 }}
 * />
 *
 * @example
 * // Auto-tone color (lower is better — escalation, error rate)
 * <KpiValue
 *   value={22}
 *   unit="%"
 *   color="auto"
 *   inverse
 *   thresholds={{ success: 15, warning: 30 }}
 *   benchmark="industry avg 20%"
 * />
 *
 * @example
 * // Trend indicator
 * <KpiValue
 *   value={42}
 *   unit="konwersji"
 *   trend={{ direction: 'up', label: '+12%' }}
 * />
 *
 * @example
 * // String fallback for missing data (decimals + thresholds skipped)
 * <KpiValue value="—" unit="brak danych" />
 *
 * @example
 * // Custom trend icon
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

export type KpiValueColor = 'primary' | 'success' | 'warning' | 'error' | 'brand';
export type KpiValueColorOrAuto = KpiValueColor | 'auto';
export type KpiValueSize = 'md' | 'lg' | 'xl';

const VALUE_COLOR_VAR: Record<KpiValueColor, string> = {
  primary: 'var(--color-text-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  brand: 'var(--color-brand-500)',
};

const SIZE_CLASS: Record<KpiValueSize, string> = {
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

/**
 * Derive resolved color from props. When `color='auto'` and `thresholds.success`
 * is provided AND `value` is a number, maps value to success/warning/error per
 * `inverse` direction; otherwise falls back to `'primary'`.
 */
function deriveColor(
  value: number | string,
  color: KpiValueColorOrAuto,
  thresholds: KpiValueProps['thresholds'],
  inverse: boolean
): KpiValueColor {
  if (color !== 'auto') return color;
  if (typeof value !== 'number') return 'primary';
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

/**
 * Format static numeric value via toFixed + unit handling. Returns the
 * full value cell content (used when `renderValue` is absent). String
 * values pass through unformatted (e.g. `"—"`, `"N/A"`).
 *
 * `unit === '%'` is special-cased to attach tightly with no separator
 * (renders as part of the value span — matches ex-PercentValue visual
 * identity). Other units render via separate `.unit` small/muted span
 * (handled by parent caller, this function only returns the value text).
 */
function formatStaticValue(
  value: number | string,
  decimals: number | undefined
): string {
  if (typeof value === 'string') return value;
  if (decimals === undefined) return String(value);
  return value.toFixed(decimals);
}

export interface KpiValueProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Main display value. Number or string — both render as-is. For
   * animated count-up use {@link KpiValueAnimated}.
   */
  value: number | string;
  /**
   * Unit label (e.g. `"PLN"`, `"%"`, `"konwersji"`). Default rendering:
   * separate small/muted span right of value. **Special case:** when
   * `unit === '%'` the unit attaches tightly inside the value span
   * (renders as `"42%"`) — matches percent-display convention from
   * the legacy PercentValue atom (merged into KpiValue v0.7.0).
   */
  unit?: string;
  /** Visual scale of the numeric value. Default `'lg'`. */
  size?: KpiValueSize;
  /**
   * Color of the value. `'auto'` derives the color from `thresholds` +
   * `inverse` when `value` is numeric (otherwise falls back to
   * `'primary'`). Default `'primary'`.
   */
  color?: KpiValueColorOrAuto;
  /**
   * Number of fraction digits for static numeric formatting via
   * `value.toFixed(decimals)`. When omitted, numeric values render via
   * `String(value)` (preserves legacy KpiValue behavior). String values
   * always pass through unchanged. Useful both for percentages
   * (`<KpiValue value={4.7} unit="/5" decimals={1} />`) and currency
   * (`<KpiValue value={1234.5} decimals={2} unit="PLN" />`).
   */
  decimals?: number;
  /**
   * Threshold ranges for `color='auto'` derivation. Effective only when
   * `color='auto'` AND `value` is a number.
   *
   * Default semantics (`inverse=false`): `value >= success` → success;
   * `value >= warning` → warning; else error.
   *
   * Inverted (`inverse=true`): `value <= success` → success;
   * `value <= warning` → warning; else error.
   */
  thresholds?: { success?: number; warning?: number };
  /**
   * Reverses `thresholds` semantics for "lower is better" metrics
   * (escalation rate, error rate). Effective only with `color='auto'`
   * + `thresholds`. Default `false`.
   */
  inverse?: boolean;
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
   * Optional benchmark caption rendered below the trend row (or below
   * the value row when no trend). Useful for "industry avg X%" or
   * "target ≥ Y" annotations. Inherits the legacy PercentValue
   * `benchmark` prop after the v0.7.0 merge.
   */
  benchmark?: string;
  /**
   * Optional renderer for the value cell. When supplied, replaces the
   * default formatted output. {@link KpiValueAnimated} uses this slot
   * to inject `<AnimatedCounter>`. Consumers can also use it for
   * custom formatting (Intl.NumberFormat config) while keeping
   * KpiValue as a Server Component.
   *
   * Receives the numeric `decimals` resolution (or `0` fallback) so
   * the renderer can apply the same digit count consistently.
   */
  renderValue?: (value: number | string, decimals: number) => ReactNode;
  /** Optional accessible label, applied to the root element. */
  'aria-label'?: string;
  // Note: `role?: AriaRole` is provided by HTMLAttributes (not re-declared
  // to avoid widening to `string`). Use e.g. `role="status"` for live data.
  /**
   * @internal KpiValue owns its inner layout — children are not accepted.
   * For secondary content use `trend` / `benchmark` slots; for semantic
   * wrapping compose externally.
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
      decimals,
      thresholds,
      inverse = false,
      trend,
      benchmark,
      renderValue,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const resolvedColor = deriveColor(value, color, thresholds, inverse);
    const valueColorVar = VALUE_COLOR_VAR[resolvedColor];
    const effectiveDecimals = decimals ?? 0;
    const isPercentUnit = unit === '%';

    const valueNode = renderValue
      ? renderValue(value, effectiveDecimals)
      : isPercentUnit && typeof value === 'number'
      ? `${formatStaticValue(value, decimals)}%`
      : formatStaticValue(value, decimals);

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
          <span className={styles.value}>{valueNode}</span>
          {unit && !isPercentUnit && (
            <span className={styles.unit}>{unit}</span>
          )}
        </span>
        {trend && (
          <span className={cn(styles.trendRow, TREND_CLASS[trend.direction])}>
            {trend.icon ?? <DefaultTrendIcon direction={trend.direction} />}
            {trend.label && (
              <span className={styles.trendLabel}>{trend.label}</span>
            )}
          </span>
        )}
        {benchmark && (
          <span className={styles.benchmark}>{benchmark}</span>
        )}
      </div>
    );
  }
);
