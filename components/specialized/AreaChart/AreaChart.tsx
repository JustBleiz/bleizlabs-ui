'use client';

/**
 * AreaChart — multi-series SVG area chart (line + filled region below)
 * with crosshair tooltip + keyboard data-point navigation + sr-only
 * `<table>` a11y fallback.
 *
 * @layer specialized (Phase 6, E01.2 of 0.20.0 Charts pack)
 * @apg   No canonical W3C "areachart" APG pattern. ARIA model synthesized
 *        from `role="img"` + `aria-describedby` → sr-only data table
 *        (WCAG H51), keyboard data-point navigation per Recharts/Mantine
 *        Charts a11y precedent. WCAG 2.5.5 (touch target ≥44×44) satisfied
 *        via transparent voronoi `<rect>` overlay per data point.
 * @tokens --color-{brand,success,warning,info,error} (DEFAULT_COLORS cycle,
 *         shared with LineChart), --color-border / --color-border-subtle
 *         / --color-border-strong (axes + grid + crosshair), --color-surface
 *         / --color-surface-raised (tooltip surface + point halo),
 *         --color-text-{primary,secondary,muted} (labels), --shadow-md
 *         (tooltip), --focus-ring (focused data point via mixin),
 *         --duration-{fast,normal} + --easing-default, --radius-sm (tooltip)
 *         / --radius-full (data points), --space-{1,2,3,4,6,8} (rhythm),
 *         --font-size-{xs,sm}, --font-weight-{regular,medium}. ZERO new
 *         design tokens (Charter R7). Component-local channels
 *         `--areachart-path-stroke-width` (2px), `--areachart-point-radius`
 *         (4px), `--areachart-fill-opacity` (0.3 default; capped via prop),
 *         `--areachart-grid-opacity` (1), `--areachart-aspect`,
 *         `--areachart-tooltip-{x,y}` mirror LineChart channels for
 *         consumer override without specificity wars.
 * @deps   cn (internal); inline math helpers (scaleLinear, getDomain,
 *         niceTicks, generateLinearPath, generateSmoothPath,
 *         generateAreaPath, normalizeX) — cloned from LineChart for klocek
 *         independence (independent semver, no cross-component coupling).
 *         ZERO external runtime deps.
 * @a11y   Root: `<div role="img" aria-labelledby={titleId} aria-describedby=
 *         "{descId} {tableId} [consumer]">`. Internal `<svg>` is
 *         `aria-hidden="true"` (presentation; data conveyed via the
 *         described-by chain). Sr-only `<table>` ALWAYS renders (even with
 *         `renderEmpty` shown) so AT users get full data alternative —
 *         caption=`title`, thead=[X column, ...series names], tbody=unified
 *         X values sorted (Date → epoch ms; number ascending; string →
 *         first-occurrence index), missing values rendered as `'—'`.
 *
 *         Per-point `<circle tabIndex={-1} aria-label="{seriesName},
 *         {xLabel}: {yValue}">` plus transparent voronoi `<rect>` overlay
 *         for touch-target. Roving tabindex: exactly one circle has
 *         `tabIndex=0` (matches focused state); arrow keys move it (Right/
 *         Left within series, Up/Down switch series, Home/End jump first/
 *         last point). Space/Enter fire `onPointClick`. Escape dismisses
 *         pinned tooltip.
 *
 *         Live region (`role="status" aria-live="polite"`) announces the
 *         focused point: "<series name>, <X label>: <y value>". Zero-width
 *         marker counter ensures AT re-announces on same-point re-focus.
 *
 *         Focus-ring is INSIDE `:focus-visible`. `aria-describedby` chains
 *         consumer-supplied + internal ids space-joined.
 *
 *         `prefers-reduced-motion: reduce` suppresses path-draw + fill
 *         fade-in + tooltip fade.
 * @budget 15 props on root — generic-data organism per Charter R2.1 layer
 *         classification (LineChart=13 + 2 new visual axes: `fillOpacity`,
 *         `gradient`). Stacked variant DEFERRED to 0.20.x follow-up — v1
 *         renders overlapping areas only (semi-transparent fill resolves
 *         the visual ambiguity per Recharts/Mantine default). Slots
 *         (`renderTooltip`, `renderEmpty`) cover the customization needs;
 *         remaining surface is data + a11y labelling + scales/format
 *         + animation opt-in + responsive + interaction callbacks.
 * @tested tsc --noEmit clean | next build clean. Playwright +
 *         axe-core + NVDA sweep DEFERRED to 0.20.x test-execution sprint
 *         per E15 Tabs / E05.4 Form precedent (specs ship alongside,
 *         execution batched).
 * @regressions tests/AreaChart.regression.spec.ts — AC-R01..R20 (planned,
 *              deferred per @tested).
 * @example
 *   <AreaChart
 *     title="Weekly leads"
 *     series={[{ name: 'LinkedIn', data: weekly }]}
 *   />
 *
 *   <AreaChart
 *     title="Lead source comparison"
 *     description="Last 12 weeks, weekly counts"
 *     series={[
 *       { name: 'LinkedIn', data: linkedin },
 *       { name: 'Cold email', data: coldEmail, color: 'var(--color-success)' },
 *     ]}
 *     fillOpacity={0.25}
 *     gradient
 *     onPointClick={(seriesId, idx) => router.push(`/leads?source=${seriesId}&week=${idx}`)}
 *   />
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './AreaChart.module.scss';

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

export type AreaChartInterpolation = 'linear' | 'smooth';

/**
 * Single data point on a series. X can be numeric (continuous), Date (time
 * axis), or string (categorical / ordinal). Lib normalizes to numeric domain
 * internally via `normalizeX`.
 *
 * - `x: number` — continuous numeric axis (e.g. week index).
 * - `x: Date` — time axis; lib converts via `.getTime()`.
 * - `x: string` — categorical / ordinal axis (e.g. "Q1", "Q2").
 *
 * `label?` overrides the AT table cell + tooltip X column when raw `x`
 * isn't human-readable (e.g. epoch ms → "Nov 2024").
 */
export interface AreaChartDatum {
  x: number | Date | string;
  y: number;
  label?: string;
}

/**
 * A single series rendered as one filled area (region under a connected
 * line) + N data points. Multi-series charts share the same X + Y scales
 * (auto-derived from union of all series unless `xAxis.domain` /
 * `yAxis.domain` overrides). Series render overlapping with semi-transparent
 * fill (per `fillOpacity` prop); stacked variant is a 0.20.x follow-up.
 */
export interface AreaChartSeries {
  /** Stable identifier (falls back to `name`, then `series-{index}`). */
  id?: string;
  /** Series display name shown in tooltip + AT table column header. */
  name?: string;
  /**
   * Series color. Any valid CSS color value. When omitted, lib cycles
   * through DEFAULT_COLORS (shared with LineChart for consistency).
   */
  color?: string;
  /** Ordered data points (left-to-right along X axis). MUST contain ≥1 point. */
  data: AreaChartDatum[];
}

export interface AreaChartAxisConfig {
  /** Custom tick formatter for axis labels + tooltip headers. */
  tickFormat?: (value: number | Date | string) => string;
  /** Hide this axis (line + ticks + labels). */
  hide?: boolean;
  /** Explicit domain override (auto-derived from data when omitted). */
  domain?: [number, number];
  /** Explicit tick values (auto-generated via niceTicks when omitted). */
  ticks?: number[];
}

export interface AreaChartTooltipContext {
  /** Focused/hovered series id. */
  seriesId: string;
  /** Focused/hovered series name. */
  seriesName: string;
  /** Series color. */
  color: string;
  /** Focused/hovered data point. */
  datum: AreaChartDatum;
  /** Index of the data point within its series. */
  pointIndex: number;
  /** All series + their value at the focused X (for "crosshair" tooltip). */
  allSeriesAtX: Array<{
    seriesId: string;
    seriesName: string;
    color: string;
    value: number | null;
  }>;
}

export interface AreaChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  /** Multi-series data. */
  series: AreaChartSeries[];
  /** Required for a11y — used as `<caption>` of sr-only table + chart title. */
  title: string;
  /** Optional description text (rendered into the AT description channel). */
  description?: string;
  /** Path interpolation. Default `'smooth'` (Catmull-Rom tension 0.5). */
  interpolation?: AreaChartInterpolation;
  /** Path-draw + fill-fade animation on mount. Default `true`. `prefers-reduced-motion` always wins. */
  animate?: boolean;
  /** Container aspect ratio (width / height). Default `16 / 9`. */
  aspectRatio?: number;
  /** Explicit container height in pixels (overrides aspectRatio). */
  height?: number;
  /** X axis customization. */
  xAxis?: AreaChartAxisConfig;
  /** Y axis customization. */
  yAxis?: AreaChartAxisConfig;
  /** Custom formatter for tooltip values (default: `defaultYFormat`). */
  tooltipFormat?: (value: number) => string;
  /** Slot for fully custom tooltip body. */
  renderTooltip?: (ctx: AreaChartTooltipContext) => ReactNode;
  /** Slot for custom empty state. Sr-only table still renders. */
  renderEmpty?: ReactNode | (() => ReactNode);
  /** Fires on Space/Enter on focused data point OR mouse click. */
  onPointClick?: (seriesId: string, pointIndex: number) => void;
  /** Fires on focus (keyboard) OR hover (mouse) of a data point. */
  onPointFocus?: (seriesId: string, pointIndex: number) => void;
  /**
   * Fill opacity (0..1). Default `0.3`. Clamped to [0, 1].
   *
   * - **Flat fill** (`gradient=false`, default): applied directly as
   *   per-series fill opacity. Lower values increase readability when 2+
   *   series overlap.
   * - **Gradient fill** (`gradient=true`): scales the gradient's TOP stop
   *   opacity by 2.5× (clamped to 1). E.g. `fillOpacity=0.3` → top stop
   *   `0.75`, baseline stop `0`. `fillOpacity=0.4` → top stop `1` (opaque),
   *   baseline `0`. Higher values produce more saturated peaks.
   */
  fillOpacity?: number;
  /**
   * When `true`, fill renders as a vertical linear gradient fading from
   * series color (at the data peak) to transparent (at the baseline) —
   * "sparkline / report" style fill. Default `false` (flat fill).
   * Gradient direction follows the area's bounding box (`objectBoundingBox`
   * SVG default): top of each area's bbox = peak, bottom = baseline.
   */
  gradient?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────
// Default colors (shared with LineChart for cross-chart consistency)
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_COLORS = [
  'var(--color-brand)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-info)',
  'var(--color-error)',
] as const;

function defaultColorForIndex(idx: number): string {
  return DEFAULT_COLORS[idx % DEFAULT_COLORS.length]!;
}

// ──────────────────────────────────────────────────────────────────────────
// Math helpers — pure functions, zero deps (cloned from LineChart for
// klocek independence — independent semver, no cross-component coupling)
// ──────────────────────────────────────────────────────────────────────────

function scaleLinear(
  domain: [number, number],
  range: [number, number],
): (v: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  if (span === 0) return () => (r0 + r1) / 2;
  return (v: number) => r0 + ((v - d0) / span) * (r1 - r0);
}

function getDomain(values: number[], padding = 0): [number, number] {
  if (values.length === 0) return [0, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    const pad = Math.abs(min) * 0.05 || 1;
    return [min - pad, max + pad];
  }
  const span = max - min;
  return [min - span * padding, max + span * padding];
}

function niceTicks(domain: [number, number], targetCount = 5): number[] {
  const [d0, d1] = domain;
  const span = d1 - d0;
  if (span === 0) return [d0];
  const roughStep = span / targetCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(roughStep))));
  const normalized = roughStep / magnitude;
  let step: number;
  if (normalized < 1.5) step = 1 * magnitude;
  else if (normalized < 3) step = 2 * magnitude;
  else if (normalized < 7) step = 5 * magnitude;
  else step = 10 * magnitude;
  const start = Math.ceil(d0 / step) * step;
  const end = Math.floor(d1 / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 1000; v += step) {
    ticks.push(Number(v.toFixed(10)));
  }
  return ticks;
}

function generateLinearPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  const first = points[0]!;
  if (points.length === 1) return `M ${first.x} ${first.y}`;
  const segments = points.slice(1).map((p) => `L ${p.x} ${p.y}`);
  return `M ${first.x} ${first.y} ${segments.join(' ')}`;
}

function generateSmoothPath(
  points: Array<{ x: number; y: number }>,
  tension = 0.5,
): string {
  if (points.length === 0) return '';
  const first = points[0]!;
  if (points.length === 1) return `M ${first.x} ${first.y}`;
  if (points.length === 2) {
    return `M ${first.x} ${first.y} L ${points[1]!.x} ${points[1]!.y}`;
  }
  const out: string[] = [`M ${first.x} ${first.y}`];
  const k = tension;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i === 0 ? points[i]! : points[i - 1]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = i + 2 < points.length ? points[i + 2]! : p2;
    const c1x = p1.x + ((p2.x - p0.x) * k) / 3;
    const c1y = p1.y + ((p2.y - p0.y) * k) / 3;
    const c2x = p2.x - ((p3.x - p1.x) * k) / 3;
    const c2y = p2.y - ((p3.y - p1.y) * k) / 3;
    out.push(`C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`);
  }
  return out.join(' ');
}

/**
 * Generate the closed filled-area path: top edge follows the line path
 * (linear or smooth), bottom edge runs along the baseline (typically y=0,
 * or yDomain[0] when domain is fully positive/negative). Path is closed
 * (Z) so SVG fill renders the region between line and baseline.
 *
 * Baseline strategy (matches Recharts default `dataMin >= 0 ? 0 : dataMin`):
 *   - If domain spans zero (min < 0 < max): baseline = 0 (zero-crossing —
 *     areas above zero fill upward toward data, below zero fill downward
 *     toward data; same visual semantics as Recharts/Mantine default).
 *   - Else (all positive or all negative): baseline = yDomain[0] (=
 *     dataMin after padding — bottom of plot in SVG y-inverted space).
 *     For all-negative data this means area fills from data points DOWN
 *     to the plot floor (data point at top = full-column area). Consumer
 *     can override via `yAxis.domain` if a different baseline is needed
 *     (e.g. `domain: [maxY, 0]` to anchor area to chart top instead).
 */
function generateAreaPath(
  points: Array<{ x: number; y: number }>,
  baselineY: number,
  interpolation: AreaChartInterpolation,
): string {
  if (points.length === 0) return '';
  const top =
    interpolation === 'linear'
      ? generateLinearPath(points)
      : generateSmoothPath(points);
  const last = points[points.length - 1]!;
  const first = points[0]!;
  // top path → drop to baseline at last X → line to baseline at first X → close
  return `${top} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

function normalizeX(
  value: number | Date | string,
  ordinalIndex: number,
): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  return ordinalIndex;
}

function formatX(
  value: number | Date | string,
  fmt: AreaChartAxisConfig['tickFormat'],
  fallbackLabel?: string,
): string {
  if (fmt) return fmt(value);
  if (fallbackLabel != null) return fallbackLabel;
  if (value instanceof Date) {
    // ISO-like deterministic format — `toLocaleDateString()` without an
    // explicit locale would defer to the environment's default which differs
    // between Node.js (server) and the browser (client), producing hydration
    // mismatches. Consumer can override via `xAxis.tickFormat` for richer
    // formatting with explicit locale + timeZone.
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(value);
}

function defaultYFormat(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/\.?0+$/, '');
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0.3;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

// ──────────────────────────────────────────────────────────────────────────
// Internal types for normalized series
// ──────────────────────────────────────────────────────────────────────────

interface NormalizedDatum {
  origX: number | Date | string;
  x: number;
  y: number;
  label?: string;
}

interface NormalizedSeries {
  id: string;
  name: string;
  color: string;
  data: NormalizedDatum[];
}

interface FocusedTarget {
  seriesIdx: number;
  pointIdx: number;
}

// ──────────────────────────────────────────────────────────────────────────
// SVG viewBox dimensions — normalized space (path math operates here)
// ──────────────────────────────────────────────────────────────────────────

const VIEWBOX_WIDTH = 600;
const VIEWBOX_HEIGHT = 340;

const PADDING_LEFT = 56;
const PADDING_RIGHT = 24;
const PADDING_TOP = 24;
const PADDING_BOTTOM = 40;

const PLOT_WIDTH = VIEWBOX_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = VIEWBOX_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

// ──────────────────────────────────────────────────────────────────────────
// AreaChart component
// ──────────────────────────────────────────────────────────────────────────

export const AreaChart = forwardRef<HTMLDivElement, AreaChartProps>(
  function AreaChart(props, forwardedRef) {
    const {
      series,
      title,
      description,
      interpolation = 'smooth',
      animate = true,
      aspectRatio = 16 / 9,
      height,
      xAxis,
      yAxis,
      tooltipFormat = defaultYFormat,
      renderTooltip,
      renderEmpty,
      onPointClick,
      onPointFocus,
      fillOpacity = 0.3,
      gradient = false,
      className,
      style,
      'aria-describedby': consumerDescribedBy,
      ...rest
    } = props;

    const clampedFillOpacity = useMemo(() => clamp01(fillOpacity), [fillOpacity]);

    const baseId = useId();
    const titleId = `${baseId}-title`;
    const descId = `${baseId}-desc`;
    const tableId = `${baseId}-table`;
    const liveId = `${baseId}-live`;
    const gradientId = `${baseId}-grad`;

    const [focused, setFocused] = useState<FocusedTarget | null>(null);
    const [pinned, setPinned] = useState(false);
    const [hovered, setHovered] = useState<FocusedTarget | null>(null);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    const announceCounterRef = useRef(0);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );

    // Reduced-motion detection (post-mount, SSR-safe)
    useEffect(() => {
      if (typeof window === 'undefined' || !window.matchMedia) return;
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handler = () => setPrefersReducedMotion(mq.matches);
      handler();
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }, []);

    // Normalize all series into a uniform shape with numeric X coordinates.
    // String X values are mapped to first-occurrence ordinal positions.
    const { normalizedSeries, unifiedX, unifiedXLabels } = useMemo(() => {
      const stringIndex = new Map<string, number>();
      let nextOrdinal = 0;

      const resolveX = (
        v: number | Date | string,
      ): { x: number; origX: number | Date | string } => {
        if (typeof v === 'string') {
          let idx = stringIndex.get(v);
          if (idx == null) {
            idx = nextOrdinal++;
            stringIndex.set(v, idx);
          }
          return { x: idx, origX: v };
        }
        return { x: normalizeX(v, 0), origX: v };
      };

      const normalized: NormalizedSeries[] = series.map((s, sIdx) => {
        const fallbackName = s.name ?? `Series ${sIdx + 1}`;
        const data: NormalizedDatum[] = s.data.map((d) => {
          const { x, origX } = resolveX(d.x);
          return { origX, x, y: d.y, label: d.label };
        });
        return {
          id: s.id ?? s.name ?? `series-${sIdx}`,
          name: fallbackName,
          color: s.color ?? defaultColorForIndex(sIdx),
          data,
        };
      });

      const xSet = new Set<number>();
      for (const s of normalized) {
        for (const d of s.data) xSet.add(d.x);
      }
      const xs = [...xSet].sort((a, b) => a - b);

      const labelByX = new Map<number, string>();
      const origByX = new Map<number, number | Date | string>();
      for (const s of normalized) {
        for (const d of s.data) {
          if (!labelByX.has(d.x)) {
            labelByX.set(d.x, formatX(d.origX, xAxis?.tickFormat, d.label));
            origByX.set(d.x, d.origX);
          }
        }
      }

      return {
        normalizedSeries: normalized,
        unifiedX: xs,
        unifiedXLabels: { labelByX, origByX },
      };
    }, [series, xAxis?.tickFormat]);

    const hasData =
      normalizedSeries.length > 0 &&
      normalizedSeries.some((s) => s.data.length > 0);

    // Domain derivation
    const { xDomain, yDomain } = useMemo(() => {
      const xValues: number[] = [];
      const yValues: number[] = [];
      for (const s of normalizedSeries) {
        for (const d of s.data) {
          xValues.push(d.x);
          yValues.push(d.y);
        }
      }
      const autoX = getDomain(xValues, 0);
      const autoY = getDomain(yValues, 0.1);
      // If Y domain contains both positive and negative, expand to include 0
      let y0 = autoY[0];
      let y1 = autoY[1];
      if (yValues.length > 0) {
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);
        if (minY < 0 && maxY > 0) {
          y0 = Math.min(y0, 0);
          y1 = Math.max(y1, 0);
        }
      }
      const yDomain: [number, number] = [y0, y1];
      return {
        xDomain: xAxis?.domain ?? autoX,
        yDomain: yAxis?.domain ?? yDomain,
      };
    }, [normalizedSeries, xAxis?.domain, yAxis?.domain]);

    // Scales (plot coordinates) — Y is inverted (SVG y grows down, but data
    // y grows up).
    const xScale = useMemo(
      () => scaleLinear(xDomain, [PADDING_LEFT, PADDING_LEFT + PLOT_WIDTH]),
      [xDomain],
    );
    const yScale = useMemo(
      () => scaleLinear(yDomain, [PADDING_TOP + PLOT_HEIGHT, PADDING_TOP]),
      [yDomain],
    );

    // Baseline (zero crossing OR domain floor — see generateAreaPath JSDoc)
    const baselineY = useMemo(() => {
      const [y0, y1] = yDomain;
      const baseline = y0 <= 0 && y1 >= 0 ? 0 : y0;
      return yScale(baseline);
    }, [yDomain, yScale]);

    // Generate paths per series (line stroke + filled area)
    const paths = useMemo(() => {
      const interpFn =
        interpolation === 'linear' ? generateLinearPath : generateSmoothPath;
      return normalizedSeries.map((s) => {
        const plotted = s.data.map((d) => ({
          x: xScale(d.x),
          y: yScale(d.y),
        }));
        return {
          line: interpFn(plotted),
          area: generateAreaPath(plotted, baselineY, interpolation),
        };
      });
    }, [normalizedSeries, xScale, yScale, interpolation, baselineY]);

    // Ticks
    const yTicks = useMemo(
      () => yAxis?.ticks ?? niceTicks(yDomain, 5),
      [yAxis?.ticks, yDomain],
    );
    const xTicks = useMemo(() => {
      if (xAxis?.ticks) return xAxis.ticks;
      if (unifiedX.length <= 8) return unifiedX;
      const step = Math.ceil(unifiedX.length / 6);
      return unifiedX.filter((_, i) => i % step === 0);
    }, [xAxis?.ticks, unifiedX]);

    // ────────────────────────────────────────────────────────────────────
    // Focus + roving tabindex management
    // ────────────────────────────────────────────────────────────────────

    const setFocusAt = useCallback(
      (target: FocusedTarget | null) => {
        setFocused(target);
        if (target && onPointFocus) {
          const s = normalizedSeries[target.seriesIdx];
          if (s) onPointFocus(s.id, target.pointIdx);
        }
      },
      [normalizedSeries, onPointFocus],
    );

    const handlePointFocus = useCallback(
      (seriesIdx: number, pointIdx: number) => {
        setFocusAt({ seriesIdx, pointIdx });
      },
      [setFocusAt],
    );

    const handlePointBlur = useCallback(() => {
      if (!pinned) setFocused(null);
    }, [pinned]);

    const handlePointClick = useCallback(
      (seriesIdx: number, pointIdx: number) => {
        setFocusAt({ seriesIdx, pointIdx });
        setPinned(true);
        const s = normalizedSeries[seriesIdx];
        if (s && onPointClick) onPointClick(s.id, pointIdx);
      },
      [normalizedSeries, onPointClick, setFocusAt],
    );

    const focusPointAt = useCallback((target: FocusedTarget) => {
      const root = rootRef.current;
      if (!root) return;
      const el = root.querySelector<SVGElement>(
        `circle[data-point-series="${target.seriesIdx}"][data-point-index="${target.pointIdx}"]`,
      );
      el?.focus();
    }, []);

    const handleKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          setPinned(false);
          setFocused(null);
          setHovered(null);
          return;
        }
        if (!focused) return;
        if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
          return;
        }
        const { seriesIdx, pointIdx } = focused;
        const currentSeries = normalizedSeries[seriesIdx];
        if (!currentSeries) return;

        const move = (next: FocusedTarget) => {
          event.preventDefault();
          // Focus FIRST (synchronously) — circle already exists in DOM with
          // tabindex=-1; .focus() works on tabindex=-1 elements. The native
          // focus event triggers React's onFocus → setFocusAt → re-render →
          // tabindex flips to 0. This ordering avoids auto-blur race where
          // setState-first would un-focus old point before moving focus.
          focusPointAt(next);
        };

        switch (event.key) {
          case 'ArrowRight': {
            const nextPt =
              pointIdx < currentSeries.data.length - 1 ? pointIdx + 1 : 0;
            move({ seriesIdx, pointIdx: nextPt });
            return;
          }
          case 'ArrowLeft': {
            const nextPt =
              pointIdx > 0 ? pointIdx - 1 : currentSeries.data.length - 1;
            move({ seriesIdx, pointIdx: nextPt });
            return;
          }
          case 'ArrowDown': {
            const nextSeries =
              seriesIdx < normalizedSeries.length - 1 ? seriesIdx + 1 : 0;
            const targetSeries = normalizedSeries[nextSeries];
            if (!targetSeries) return;
            const clampedPt = Math.min(
              pointIdx,
              Math.max(0, targetSeries.data.length - 1),
            );
            move({ seriesIdx: nextSeries, pointIdx: clampedPt });
            return;
          }
          case 'ArrowUp': {
            const nextSeries =
              seriesIdx > 0 ? seriesIdx - 1 : normalizedSeries.length - 1;
            const targetSeries = normalizedSeries[nextSeries];
            if (!targetSeries) return;
            const clampedPt = Math.min(
              pointIdx,
              Math.max(0, targetSeries.data.length - 1),
            );
            move({ seriesIdx: nextSeries, pointIdx: clampedPt });
            return;
          }
          case 'Home': {
            move({ seriesIdx, pointIdx: 0 });
            return;
          }
          case 'End': {
            move({ seriesIdx, pointIdx: currentSeries.data.length - 1 });
            return;
          }
          case ' ':
          case 'Enter': {
            event.preventDefault();
            handlePointClick(seriesIdx, pointIdx);
            return;
          }
          default:
            break;
        }
      },
      [focused, normalizedSeries, handlePointClick, focusPointAt],
    );

    // ────────────────────────────────────────────────────────────────────
    // Voronoi-cell hit testing (mouse hover)
    // ────────────────────────────────────────────────────────────────────

    const findNearestPoint = useCallback(
      (mouseX: number, mouseY: number): FocusedTarget | null => {
        if (!hasData || unifiedX.length === 0) return null;

        let nearestXIdx = 0;
        let nearestXDist = Infinity;
        for (let i = 0; i < unifiedX.length; i++) {
          const xCoord = xScale(unifiedX[i]!);
          const d = Math.abs(xCoord - mouseX);
          if (d < nearestXDist) {
            nearestXDist = d;
            nearestXIdx = i;
          }
        }
        const targetX = unifiedX[nearestXIdx]!;

        let nearestSeriesIdx = -1;
        let nearestPointIdx = -1;
        let nearestYDist = Infinity;
        for (let sIdx = 0; sIdx < normalizedSeries.length; sIdx++) {
          const s = normalizedSeries[sIdx]!;
          for (let pIdx = 0; pIdx < s.data.length; pIdx++) {
            const datum = s.data[pIdx]!;
            if (datum.x !== targetX) continue;
            const yCoord = yScale(datum.y);
            const d = Math.abs(yCoord - mouseY);
            if (d < nearestYDist) {
              nearestYDist = d;
              nearestSeriesIdx = sIdx;
              nearestPointIdx = pIdx;
            }
          }
        }
        if (nearestSeriesIdx < 0) return null;
        return { seriesIdx: nearestSeriesIdx, pointIdx: nearestPointIdx };
      },
      [hasData, unifiedX, normalizedSeries, xScale, yScale],
    );

    const svgRef = useRef<SVGSVGElement | null>(null);

    const handlePointerMove = useCallback(
      (event: ReactPointerEvent<SVGSVGElement>) => {
        if (pinned) return;
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const xRatio = (event.clientX - rect.left) / rect.width;
        const yRatio = (event.clientY - rect.top) / rect.height;
        const vbX = xRatio * VIEWBOX_WIDTH;
        const vbY = yRatio * VIEWBOX_HEIGHT;
        if (
          vbX < PADDING_LEFT ||
          vbX > PADDING_LEFT + PLOT_WIDTH ||
          vbY < PADDING_TOP ||
          vbY > PADDING_TOP + PLOT_HEIGHT
        ) {
          setHovered(null);
          return;
        }
        const target = findNearestPoint(vbX, vbY);
        setHovered(target);
        if (target) {
          const s = normalizedSeries[target.seriesIdx];
          if (s && onPointFocus) onPointFocus(s.id, target.pointIdx);
        }
      },
      [pinned, findNearestPoint, normalizedSeries, onPointFocus],
    );

    const handlePointerLeave = useCallback(() => {
      if (!pinned) setHovered(null);
    }, [pinned]);

    // ────────────────────────────────────────────────────────────────────
    // Active target = focused (keyboard) OR hovered (mouse)
    // ────────────────────────────────────────────────────────────────────

    const activeTarget = focused ?? hovered;
    const activeData = useMemo(() => {
      if (!activeTarget) return null;
      const s = normalizedSeries[activeTarget.seriesIdx];
      if (!s) return null;
      const datum = s.data[activeTarget.pointIdx];
      if (!datum) return null;
      return { s, datum };
    }, [activeTarget, normalizedSeries]);

    const tooltipContext = useMemo<AreaChartTooltipContext | null>(() => {
      if (!activeData) return null;
      const targetX = activeData.datum.x;
      const allSeriesAtX = normalizedSeries.map((s) => {
        const datumAtX = s.data.find((d) => d.x === targetX);
        return {
          seriesId: s.id,
          seriesName: s.name,
          color: s.color,
          value: datumAtX ? datumAtX.y : null,
        };
      });
      return {
        seriesId: activeData.s.id,
        seriesName: activeData.s.name,
        color: activeData.s.color,
        datum: activeData.datum,
        pointIndex: activeTarget!.pointIdx,
        allSeriesAtX,
      };
    }, [activeData, normalizedSeries, activeTarget]);

    const tooltipPosition = useMemo(() => {
      if (!activeData) return null;
      const x = xScale(activeData.datum.x);
      const y = yScale(activeData.datum.y);
      return { x, y };
    }, [activeData, xScale, yScale]);

    // Live region announcement (re-announce marker bumped via useEffect to
    // stay React-pure — useMemo mutation would double-fire under StrictMode).
    const [announceMarker, setAnnounceMarker] = useState('');
    useEffect(() => {
      if (!activeData) {
        setAnnounceMarker('');
        return;
      }
      announceCounterRef.current = (announceCounterRef.current + 1) % 4;
      setAnnounceMarker('​'.repeat(announceCounterRef.current + 1));
    }, [activeData?.s.id, activeData?.datum.x, activeData?.datum.y, activeData]);
    const liveAnnouncement = activeData
      ? `${activeData.s.name}, ${formatX(
          activeData.datum.origX,
          xAxis?.tickFormat,
          activeData.datum.label,
        )}: ${tooltipFormat(activeData.datum.y)}${announceMarker}`
      : '';

    const describedBy = useMemo(() => {
      const ids = [descId, tableId, liveId];
      if (consumerDescribedBy) ids.unshift(consumerDescribedBy);
      return ids.join(' ');
    }, [descId, tableId, liveId, consumerDescribedBy]);

    // ────────────────────────────────────────────────────────────────────
    // Render — empty state
    // ────────────────────────────────────────────────────────────────────

    const showAnimation = animate && !prefersReducedMotion;
    const pathClasses = cn(styles.path, showAnimation && styles.pathAnimating);
    const areaClasses = cn(styles.area, showAnimation && styles.areaAnimating);

    const wrapperStyle: CSSProperties = {
      ...style,
      ['--areachart-aspect' as never]: String(aspectRatio),
      ['--areachart-fill-opacity' as never]: String(clampedFillOpacity),
      ...(height ? { height: `${height}px` } : {}),
    };

    const a11yLayer = (
      <>
        <span id={titleId} className={styles.srOnly}>
          {title}
        </span>
        {description ? (
          <span id={descId} className={styles.srOnly}>
            {description}
          </span>
        ) : (
          <span id={descId} className={styles.srOnly} />
        )}
        <div
          id={liveId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={styles.srOnly}
        >
          {liveAnnouncement}
        </div>
        <table id={tableId} className={styles.srOnly}>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">X</th>
              {normalizedSeries.map((s) => (
                <th key={s.id} scope="col">
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {unifiedX.map((xVal) => {
              const xLabel =
                unifiedXLabels.labelByX.get(xVal) ?? String(xVal);
              return (
                <tr key={xVal}>
                  <th scope="row">{xLabel}</th>
                  {normalizedSeries.map((s) => {
                    const datumAt = s.data.find((d) => d.x === xVal);
                    return (
                      <td key={s.id}>
                        {datumAt ? tooltipFormat(datumAt.y) : '—'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );

    if (!hasData) {
      const emptyNode =
        typeof renderEmpty === 'function'
          ? renderEmpty()
          : (renderEmpty ?? <span className={styles.emptyText}>No data</span>);

      return (
        <div
          ref={mergedRef}
          className={cn(styles.root, className)}
          style={wrapperStyle}
          role="img"
          aria-labelledby={titleId}
          aria-describedby={describedBy}
          {...rest}
        >
          <div
            className={styles.svgContainer}
            data-explicit-height={height != null ? 'true' : 'false'}
          >
            <div className={styles.empty}>{emptyNode}</div>
          </div>
          {a11yLayer}
        </div>
      );
    }

    // ────────────────────────────────────────────────────────────────────
    // Render — chart
    // ────────────────────────────────────────────────────────────────────

    return (
      <div
        ref={mergedRef}
        className={cn(styles.root, className)}
        style={wrapperStyle}
        role="img"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <div
          className={styles.svgContainer}
          data-explicit-height={height != null ? 'true' : 'false'}
        >
          <svg
            ref={svgRef}
            className={styles.svg}
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable={false}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            {/* Gradient defs — one linearGradient per series when gradient prop is set */}
            {gradient && (
              <defs>
                {normalizedSeries.map((s, sIdx) => (
                  <linearGradient
                    key={s.id}
                    id={`${gradientId}-${sIdx}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={s.color}
                      stopOpacity={Math.min(1, clampedFillOpacity * 2.5)}
                    />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
            )}

            {/* Grid lines + Y axis ticks */}
            {!yAxis?.hide && (
              <g>
                {yTicks.map((t) => {
                  const y = yScale(t);
                  return (
                    <g key={`yt-${t}`}>
                      <line
                        className={styles.gridLine}
                        x1={PADDING_LEFT}
                        x2={PADDING_LEFT + PLOT_WIDTH}
                        y1={y}
                        y2={y}
                      />
                      <text
                        className={styles.tickLabel}
                        x={PADDING_LEFT - 8}
                        y={y}
                        textAnchor="end"
                        dominantBaseline="middle"
                      >
                        {yAxis?.tickFormat?.(t) ?? defaultYFormat(t)}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* X axis line + ticks */}
            {!xAxis?.hide && (
              <g>
                <line
                  className={styles.axisLine}
                  x1={PADDING_LEFT}
                  x2={PADDING_LEFT + PLOT_WIDTH}
                  y1={PADDING_TOP + PLOT_HEIGHT}
                  y2={PADDING_TOP + PLOT_HEIGHT}
                />
                {xTicks.map((t) => {
                  const x = xScale(t);
                  const tickLabel =
                    unifiedXLabels.labelByX.get(t) ??
                    formatX(t, xAxis?.tickFormat);
                  return (
                    <text
                      key={`xt-${t}`}
                      className={styles.tickLabel}
                      x={x}
                      y={PADDING_TOP + PLOT_HEIGHT + 18}
                      textAnchor="middle"
                    >
                      {tickLabel}
                    </text>
                  );
                })}
              </g>
            )}

            {/* Crosshair (only when active target) */}
            {tooltipPosition && (
              <line
                className={cn(styles.crosshair, styles.crosshairVisible)}
                x1={tooltipPosition.x}
                x2={tooltipPosition.x}
                y1={PADDING_TOP}
                y2={PADDING_TOP + PLOT_HEIGHT}
              />
            )}

            {/* Filled areas (low z) — render first so line + points layer above */}
            {normalizedSeries.map((s, sIdx) => {
              const seriesPaths = paths[sIdx];
              if (!seriesPaths) return null;
              const fillRef = gradient
                ? `url(#${gradientId}-${sIdx})`
                : s.color;
              return (
                <path
                  key={`area-${s.id}`}
                  className={areaClasses}
                  d={seriesPaths.area}
                  fill={fillRef}
                  fillOpacity={gradient ? undefined : clampedFillOpacity}
                  data-series-id={s.id}
                  data-series-index={sIdx}
                />
              );
            })}

            {/* Line strokes + points per series */}
            {normalizedSeries.map((s, sIdx) => {
              const seriesPaths = paths[sIdx];
              if (!seriesPaths) return null;
              return (
                <g key={s.id} data-series-id={s.id} data-series-index={sIdx}>
                  <path
                    className={pathClasses}
                    d={seriesPaths.line}
                    stroke={s.color}
                    pathLength={1}
                  />
                  {s.data.map((d, pIdx) => {
                    const cx = xScale(d.x);
                    const cy = yScale(d.y);
                    const isActive =
                      activeTarget?.seriesIdx === sIdx &&
                      activeTarget.pointIdx === pIdx;
                    const isRoving =
                      focused?.seriesIdx === sIdx &&
                      focused.pointIdx === pIdx;
                    return (
                      <g key={`${s.id}-${pIdx}`}>
                        <circle
                          className={styles.point}
                          cx={cx}
                          cy={cy}
                          fill={s.color}
                          tabIndex={isRoving ? 0 : -1}
                          data-point-series={sIdx}
                          data-point-index={pIdx}
                          data-active={isActive ? 'true' : 'false'}
                          aria-label={`${s.name}, ${formatX(d.origX, xAxis?.tickFormat, d.label)}: ${tooltipFormat(d.y)}`}
                          onFocus={() => handlePointFocus(sIdx, pIdx)}
                          onBlur={handlePointBlur}
                          onClick={() => handlePointClick(sIdx, pIdx)}
                        />
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Voronoi-cell hit areas — WCAG 2.5.5 touch target compliance.
                Each rect spans column midpoints, full plot height. Pointer
                events route through onPointerMove → findNearestPoint.
                aria-hidden — focusable <circle>s remain the AT path. */}
            {hasData && unifiedX.length > 0 && (
              <g aria-hidden="true">
                {unifiedX.map((xVal, idx) => {
                  const cx = xScale(xVal);
                  const prevX = idx > 0 ? xScale(unifiedX[idx - 1]!) : cx;
                  const nextX =
                    idx < unifiedX.length - 1
                      ? xScale(unifiedX[idx + 1]!)
                      : cx;
                  const left = (prevX + cx) / 2;
                  const right = (cx + nextX) / 2;
                  const clampedLeft = idx === 0 ? PADDING_LEFT : left;
                  const clampedRight =
                    idx === unifiedX.length - 1
                      ? PADDING_LEFT + PLOT_WIDTH
                      : right;
                  const width = Math.max(0, clampedRight - clampedLeft);
                  return (
                    <rect
                      key={`vor-${xVal}`}
                      x={clampedLeft}
                      y={PADDING_TOP}
                      width={width}
                      height={PLOT_HEIGHT}
                      fill="transparent"
                      pointerEvents="all"
                      data-voronoi-x={xVal}
                    />
                  );
                })}
              </g>
            )}
          </svg>

          {/* Tooltip (positioned via inline style relative to plot area) */}
          {tooltipContext && tooltipPosition && (
            <div
              className={cn(styles.tooltip, styles.tooltipVisible)}
              style={
                {
                  ['--areachart-tooltip-x' as never]: `${(tooltipPosition.x / VIEWBOX_WIDTH) * 100}%`,
                  ['--areachart-tooltip-y' as never]: `${(tooltipPosition.y / VIEWBOX_HEIGHT) * 100}%`,
                } as CSSProperties
              }
            >
              {renderTooltip ? (
                renderTooltip(tooltipContext)
              ) : (
                <>
                  <div className={styles.tooltipTitle}>
                    {formatX(
                      tooltipContext.datum.x,
                      xAxis?.tickFormat,
                      tooltipContext.datum.label,
                    )}
                  </div>
                  {tooltipContext.allSeriesAtX.map((row) => (
                    <div key={row.seriesId} className={styles.tooltipRow}>
                      <span
                        className={styles.tooltipSwatch}
                        style={{ backgroundColor: row.color }}
                        aria-hidden="true"
                      />
                      <span className={styles.tooltipName}>{row.seriesName}</span>
                      <span className={styles.tooltipValue}>
                        {row.value != null ? tooltipFormat(row.value) : '—'}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        {a11yLayer}
      </div>
    );
  },
);
