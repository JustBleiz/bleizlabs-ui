/**
 * Shared pure math + formatting helpers for chart primitives in
 * `@bleizlabs/ui` specialized/ category. Extracted at 3rd chart (Sparkline
 * E01.3, 0.20.0 cycle) per Rule of Three intra-lib — LineChart (E01.1)
 * + AreaChart (E01.2) carried inline clones; consolidation here removes
 * ~150 LOC duplication × N future charts while preserving klocek
 * independence (consumers still import individual chart components, not
 * this internal module).
 *
 * @layer specialized/_shared (utility module, not a component)
 * @deps  zero — pure functions only, no React, no SVG, no DOM
 * @export not surfaced in `components/index.ts` barrel (`_shared/` prefix
 *        + leading underscore signals lib-internal; consumers should
 *        compose at component level, not import math directly)
 *
 * Used by:
 *   - LineChart (E01.1)
 *   - AreaChart (E01.2)
 *   - Sparkline (E01.3)
 *   - PieChart (E01.4 — TBD; may need different helpers, polar coords)
 */

// ──────────────────────────────────────────────────────────────────────────
// Shared types
// ──────────────────────────────────────────────────────────────────────────

/** Path interpolation mode — `'smooth'` = Catmull-Rom tension 0.5. */
export type ChartInterpolation = 'linear' | 'smooth';

// ──────────────────────────────────────────────────────────────────────────
// Default colors — 5-color cycle shared across all multi-series charts
// (UsageDonut precedent, locked by LineChart E01.1)
// ──────────────────────────────────────────────────────────────────────────

export const DEFAULT_COLORS = [
  'var(--color-brand)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-info)',
  'var(--color-error)',
] as const;

export function defaultColorForIndex(idx: number): string {
  return DEFAULT_COLORS[idx % DEFAULT_COLORS.length]!;
}

// ──────────────────────────────────────────────────────────────────────────
// Scales
// ──────────────────────────────────────────────────────────────────────────

/**
 * Linear scale from `domain` to `range`. Returns a unary function mapping
 * a domain value to its range coordinate. When `d1 - d0 === 0`, returns
 * the midpoint of the range (degenerate domain — single point).
 */
export function scaleLinear(
  domain: [number, number],
  range: [number, number],
): (v: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  if (span === 0) return () => (r0 + r1) / 2;
  return (v: number) => r0 + ((v - d0) / span) * (r1 - r0);
}

// ──────────────────────────────────────────────────────────────────────────
// Domain derivation
// ──────────────────────────────────────────────────────────────────────────

/**
 * Compute `[min, max]` over a value array. Adds `padding * span` on each
 * side. Degenerate cases:
 *   - Empty array → `[0, 1]` (safe fallback for scaleLinear).
 *   - All equal → `[v - pad, v + pad]` where `pad = |v| * 0.05` (or 1).
 */
export function getDomain(values: number[], padding = 0): [number, number] {
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

// ──────────────────────────────────────────────────────────────────────────
// Nice ticks (D3-style 1/2/5/10 magnitude rounding)
// ──────────────────────────────────────────────────────────────────────────

export function niceTicks(domain: [number, number], targetCount = 5): number[] {
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

// ──────────────────────────────────────────────────────────────────────────
// Path generators
// ──────────────────────────────────────────────────────────────────────────

export function generateLinearPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  const first = points[0]!;
  if (points.length === 1) return `M ${first.x} ${first.y}`;
  const segments = points.slice(1).map((p) => `L ${p.x} ${p.y}`);
  return `M ${first.x} ${first.y} ${segments.join(' ')}`;
}

/**
 * Catmull-Rom smoothed path. Default `tension=0.5` matches Recharts /
 * Mantine "smooth" curve. First/last segments mirror endpoints to avoid
 * dangling control points.
 */
export function generateSmoothPath(points: Array<{ x: number; y: number }>, tension = 0.5): string {
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
 * Generate a closed filled-area path: top edge follows the line path
 * (linear or smooth), bottom edge runs along a horizontal baseline at
 * `baselineY` (SVG y-coord). Path is closed (`Z`) so SVG fill renders
 * the region between line and baseline.
 *
 * Caller computes `baselineY` per chart semantics:
 *   - AreaChart: `yScale(0)` when domain spans zero, else `yScale(yDomain[0])`
 *     (= Recharts default `dataMin >= 0 ? 0 : dataMin`).
 *   - Sparkline: typically `yScale(yDomain[0])` (= bottom of viewBox).
 */
export function generateAreaPath(
  points: Array<{ x: number; y: number }>,
  baselineY: number,
  interpolation: ChartInterpolation,
): string {
  if (points.length === 0) return '';
  const top = interpolation === 'linear' ? generateLinearPath(points) : generateSmoothPath(points);
  const last = points[points.length - 1]!;
  const first = points[0]!;
  // top path → drop to baseline at last X → line to baseline at first X → close
  return `${top} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

// ──────────────────────────────────────────────────────────────────────────
// Mixed X normalization (number / Date / categorical-string)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Convert mixed X input to a numeric coordinate. Strings are NOT handled
 * here (caller must provide ordinal index lookup since cross-series
 * categorical mapping is series-aware); this helper only resolves Date
 * → epoch ms and number → number.
 */
export function normalizeX(value: number | Date | string, ordinalIndex: number): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  return ordinalIndex;
}

// ──────────────────────────────────────────────────────────────────────────
// Formatting
// ──────────────────────────────────────────────────────────────────────────

/**
 * Format an X value for tick labels / tooltip headers / sr-only table.
 * Order of resolution:
 *   1. `fmt` if provided (consumer's `xAxis.tickFormat`).
 *   2. `fallbackLabel` if provided (datum.label override).
 *   3. ISO-like UTC date format for Date values (deterministic — avoids
 *      Node.js vs browser Intl variance during SSR/hydration).
 *   4. `String(value)` otherwise.
 */
export function formatX(
  value: number | Date | string,
  fmt: ((value: number | Date | string) => string) | undefined,
  fallbackLabel?: string,
): string {
  if (fmt) return fmt(value);
  if (fallbackLabel != null) return fallbackLabel;
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(value);
}

/**
 * Default Y formatter for tooltip values + sr-only table cells. Integers
 * pass through; floats trim trailing zeros to 2 decimal places.
 */
export function defaultYFormat(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/\.?0+$/, '');
}

// ──────────────────────────────────────────────────────────────────────────
// Misc
// ──────────────────────────────────────────────────────────────────────────

/** Clamp to [0, 1]; NaN → 0.3 (matches charts' typical fill-opacity default). */
export function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0.3;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}
