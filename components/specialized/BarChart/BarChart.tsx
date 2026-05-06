import {
  forwardRef,
  useId,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './BarChart.module.scss';

/**
 * BarChart — universal single-series bar chart (Phase 6 P9, Tier B, server-safe).
 *
 * Pure-CSS bar rendering (no SVG math, no chart dependency) driven by a
 * `--bar-height` custom property per column. Auto-detects ceiling from the
 * data (or accepts an explicit `max`), supports a per-bar `color` override,
 * and exposes an optional `highlightIndex` for "current period" accent
 * treatment without forcing time-series semantics on the API.
 *
 * @layer   atom (specialized)
 * @tokens  --color-{brand,success,warning,info,error} (tone palette mirrors
 *          UsageDonut DEFAULT_COLORS), --color-surface-raised (track
 *          background), --color-text-{primary,secondary,muted} (label +
 *          caption typography), --space-{2,3,4} (gaps + label rhythm),
 *          --radius-sm (bar top radius), --duration-normal +
 *          --easing-default (height growth + brightness hover), --focus-ring
 *          (per-bar focus outline), --font-size-xs (label size),
 *          --font-weight-medium (label weight)
 * @deps    cn, React: `forwardRef`, `useId`, `useMemo`, type imports
 *          `CSSProperties`, `HTMLAttributes<HTMLDivElement>`
 * @a11y    Renders a `<div role="img">` wrapper with `aria-label={caption}`
 *          and `aria-describedby` pointing to a visually-hidden `<table>`
 *          mirroring the data (WCAG H51 fallback for non-interactive charts).
 *          Each bar is a `<button type="button">` with a per-bar
 *          `aria-label` ("Jan: 1 250 PLN") so AT users can tab through and
 *          consumers can wrap individual bars in a Tooltip without breaking
 *          the contract. The visual decorative grid sits behind the table —
 *          the table is the canonical source of truth for AT.
 * @notes   The bar element is a `<button>` even in the non-interactive
 *          baseline. Rationale: future-proof for opt-in interactivity
 *          (Tooltip slot, click-to-filter) and for keyboard users who tab
 *          to each bar to hear its `aria-label`. A `<div role="presentation">`
 *          would force consumers to wrap a `<button>` themselves and re-emit
 *          the aria-label — duplicate work. Native `<button>` also gives us
 *          `:focus-visible` for free.
 *
 *          Tooltip is intentionally NOT a built-in. Consumers compose by
 *          rendering BarChart and overlaying their own Tooltip per bar via
 *          a wrapper component (see playground example 4). Keeps the
 *          dependency graph zero — D5/D25.
 *
 *          Multi-series (grouped/stacked bars) is out of scope for v0.7.0.
 *          Single-series MVP only. Escalate as a follow-up amendment if a
 *          consumer needs grouped bars.
 *
 *          `max` clamps the displayed height to the explicit ceiling even if
 *          a datum value exceeds it — matches MetricBar precedent so consumers
 *          can pin a known scale. Datum values <= 0 render as zero-height
 *          bars but still appear in the AT table.
 *
 *          A11y dual-source: per-bar `aria-label` announces the **clamped**
 *          value (matches what the bar visually represents); the
 *          visually-hidden `<table>` always reports the **raw** datum value
 *          (truth source). Consumers can rely on the table for full-fidelity
 *          AT output even when bars are capped to an explicit `max`.
 *
 *          Highlight gradient is brand-tone-coded by design — the gradient
 *          modulates `--bar-fill` opacity, so non-brand tones show the same
 *          chromatic identity as the rest of the series and rely on the
 *          ring + drop shadow for differentiation. This keeps the API
 *          single-token-per-tone (no `--color-success-strong` proliferation).
 *
 * @example
 * <BarChart
 *   data={[
 *     { label: 'Jan', value: 1250, period: '2026-01' },
 *     { label: 'Feb', value: 1840, period: '2026-02' },
 *     { label: 'Mar', value: 2100, period: '2026-03' },
 *   ]}
 *   caption="Monthly revenue (PLN)"
 *   highlightIndex={2}
 *   formatValue={(n) => n.toLocaleString('pl-PL') + ' PLN'}
 * />
 */

export interface BarChartDatum {
  /** Display label rendered below the bar (e.g. "Jan", "Q1"). */
  label: string;
  /** Numeric value — bar height is `(value / ceiling) * 100%` (clamped 0..ceiling). */
  value: number;
  /**
   * Optional row identifier — used as React key + a11y table row header.
   * Falls back to `label` when omitted. Provide when labels collide
   * (e.g. two months named "Jan" across years).
   */
  period?: string;
  /**
   * Optional CSS color override for this bar's fill (`var(--color-...)`,
   * a hex literal, or any valid CSS color). When omitted, the chart's
   * `tone` prop drives the fill.
   */
  color?: string;
}

export type BarChartTone =
  | 'brand'
  | 'success'
  | 'warning'
  | 'info'
  | 'error';

export interface BarChartProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'role' | 'aria-label' | 'aria-describedby'
  > {
  /** Data points rendered left-to-right as a single series. */
  data: BarChartDatum[];
  /**
   * Required accessible name. Used as `aria-label` on the chart wrapper
   * AND as `<caption>` on the visually-hidden data table (WCAG H51).
   */
  caption: string;
  /**
   * Explicit y-axis ceiling. Defaults to `Math.max(...values)` (or `1` when
   * the dataset is empty / all zero, to avoid divide-by-zero rendering).
   */
  max?: number;
  /**
   * Default bar fill color when a datum does not specify its own `color`.
   * Default `'brand'`.
   */
  tone?: BarChartTone;
  /**
   * Optional index of a single bar to render with accent treatment
   * (gradient fill + ring + shadow). Negative or out-of-range values are
   * silently ignored. Typical use: marking the "current period" in a
   * time-series chart.
   */
  highlightIndex?: number;
  /**
   * Numeric formatter applied to bar `aria-label`s and the AT table cells.
   * Defaults to `String(value)`.
   */
  formatValue?: (value: number) => string;
  /**
   * Pixel height of the chart plot area. Default `200`. Consumer can
   * raise/lower for hero or compact dashboard contexts.
   */
  height?: number;
  /** AT table column header for the period column. Default `'Period'`. */
  periodLabel?: string;
  /** AT table column header for the value column. Default `'Value'`. */
  valueLabel?: string;
}

const TONE_COLOR: Record<BarChartTone, string> = {
  brand: 'var(--color-brand)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
  error: 'var(--color-error)',
};

const defaultFormat = (n: number): string => String(n);

interface ComputedBar {
  key: string;
  label: string;
  clampedValue: number;
  heightPct: number;
  fill: string;
  isHighlight: boolean;
}

export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(
  function BarChart(
    {
      data,
      caption,
      max,
      tone = 'brand',
      highlightIndex,
      formatValue,
      height = 200,
      periodLabel = 'Period',
      valueLabel = 'Value',
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const tableId = useId();
    const format = formatValue ?? defaultFormat;

    const ceiling = useMemo(() => {
      if (max !== undefined && max > 0) return max;
      const computed = data.reduce(
        (m, d) => (d.value > m ? d.value : m),
        0,
      );
      return computed > 0 ? computed : 1;
    }, [data, max]);

    const bars = useMemo<ComputedBar[]>(() => {
      const toneFill = TONE_COLOR[tone];
      return data.map((d, i): ComputedBar => {
        const clampedValue = Math.max(0, Math.min(ceiling, d.value));
        const heightPct = (clampedValue / ceiling) * 100;
        const isHighlight = highlightIndex === i;
        return {
          key: `${i}-${d.period ?? d.label}`,
          label: d.label,
          clampedValue,
          heightPct,
          fill: d.color ?? toneFill,
          isHighlight,
        };
      });
    }, [data, ceiling, tone, highlightIndex]);

    const rootStyle = {
      ...style,
      '--bars-count': data.length,
      '--bar-chart-height': `${height}px`,
    } as CSSProperties;

    return (
      <div
        ref={ref}
        role="img"
        aria-label={caption}
        aria-describedby={tableId}
        className={cn(styles.root, className)}
        style={rootStyle}
        {...rest}
      >
        <div className={styles.grid} aria-hidden="true">
          {bars.map((bar) => {
            const barStyle = {
              '--bar-height': `${bar.heightPct}%`,
              '--bar-fill': bar.fill,
            } as CSSProperties;
            return (
              <div key={bar.key} className={styles.column}>
                <button
                  type="button"
                  className={cn(
                    styles.bar,
                    bar.isHighlight && styles.barHighlight,
                  )}
                  style={barStyle}
                  aria-label={`${bar.label}: ${format(bar.clampedValue)}`}
                >
                  <span className={styles.barFill} />
                </button>
                <span className={styles.label}>{bar.label}</span>
              </div>
            );
          })}
        </div>

        <table id={tableId} className={styles.srOnly}>
          <caption>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">{periodLabel}</th>
              <th scope="col">{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={`${i}-${d.period ?? d.label}`}>
                <th scope="row">{d.period ?? d.label}</th>
                <td>{format(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);
