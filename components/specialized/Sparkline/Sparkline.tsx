'use client';

/**
 * Sparkline — tiny inline single-series chart (line + optional filled
 * area) for embedding in `<Card>`, table cells, KPI tiles, dense
 * dashboards. Strips axes/tooltip/keyboard-nav for compact "direction
 * signal" presentation; preserves sr-only `<table>` a11y fallback per
 * WCAG H51.
 *
 * @layer specialized (Phase 6, E01.3 of 0.20.0 Charts pack)
 * @apg   No canonical W3C "sparkline" APG pattern. ARIA model = static
 *        `role="img"` + `aria-labelledby` (title) + `aria-describedby`
 *        (desc + sr-only data table). Charts that are NON-interactive
 *        intentionally — Sparkline is a glanceable visualization, not a
 *        navigable widget. Keyboard nav, focus, tooltip, crosshair are
 *        ALL deliberately absent (consumer renders own numeric badge
 *        next to the sparkline for the actual value).
 * @tokens --color-brand (default color) + any consumer-supplied semantic
 *         color, --duration-{fast,normal} + --easing-default (animation),
 *         --space-* (sr-only collapse). ZERO new design tokens (Charter
 *         R7). Component-local channels:
 *         `--sparkline-stroke-width` (2px default),
 *         `--sparkline-fill-opacity` (0.2 default — lower than AreaChart's
 *         0.3 since Sparkline embeds in dense surfaces),
 *         `--sparkline-aspect` (4/1 default — wide-and-short typical
 *         sparkline shape).
 * @deps   cn (internal); `../_shared/chart-math` (scaleLinear, getDomain,
 *         generateLinearPath, generateSmoothPath, generateAreaPath,
 *         defaultYFormat, clamp01, ChartInterpolation). ZERO external
 *         runtime deps.
 * @a11y   Root: `<div role="img" aria-labelledby={titleId} aria-describedby=
 *         "{descId} {tableId} [consumer]">`. Internal `<svg>` is
 *         `aria-hidden="true"`. Sr-only `<table>` always renders: caption
 *         = `title`, thead = ['Index', 'Value'], tbody = one row per
 *         datum. Live region NOT present (Sparkline is non-interactive;
 *         no focus state to announce).
 *
 *         Empty/single-point states: `data: []` renders the empty slot;
 *         `data: [v]` renders a horizontal stroke at value v (degenerate
 *         line, no curve).
 *
 *         `prefers-reduced-motion: reduce` suppresses path-draw + fill
 *         fade. `forced-colors: active` keeps line stroke visible via
 *         CanvasText; area becomes near-invisible (acceptable — sr-only
 *         table carries the data signal in High Contrast mode).
 * @budget 10 props on root — well within R2.1 generic-data organism
 *         budget (≤3 ideal data prop + N visual axes). Single-series
 *         data + 5 visual axes (color, interpolation, area, fillOpacity,
 *         gradient, strokeWidth) + 2 a11y labelling (title, description)
 *         + 1 layout (aspectRatio) + 2 slots (renderEmpty, valueFormat).
 *         Multi-series DEFERRED — Mantine + Recharts ship single-series
 *         Sparkline; consumer composes 2 sparklines side-by-side or
 *         escalates to LineChart when comparing series.
 * @tested tsc --noEmit clean | eslint + jsx-a11y clean | next build
 *         clean. Playwright + axe-core + NVDA sweep DEFERRED to 0.20.x
 *         test-execution sprint per E15 Tabs / E05.4 Form / E01.2
 *         AreaChart precedent.
 * @regressions tests/Sparkline.regression.spec.ts — SP-R01..R15 (planned).
 * @example
 *   <Sparkline title="7-day session trend" data={[12, 18, 15, 22, 28, 24, 31]} />
 *
 *   <Sparkline
 *     title="Bot escalation 30d"
 *     description="Daily escalation count, last 30 days"
 *     data={escalation30d}
 *     color="var(--color-error)"
 *     area
 *     gradient
 *     aspectRatio={3}
 *   />
 */

import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import {
  type ChartInterpolation,
  clamp01,
  defaultYFormat,
  generateAreaPath,
  generateLinearPath,
  generateSmoothPath,
  getDomain,
  scaleLinear,
} from '../_shared/chart-math';
import styles from './Sparkline.module.scss';

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

/**
 * Re-export of the shared `ChartInterpolation` union for back-compat —
 * consumers may import `SparklineInterpolation` directly.
 */
export type SparklineInterpolation = ChartInterpolation;

export interface SparklineProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  /**
   * Y values; X is inferred as ordinal index 0..N-1. Empty array renders
   * the empty state. Single value renders a horizontal stroke at that
   * value.
   */
  data: number[];
  /** Required for a11y — used as `<caption>` of sr-only table + chart title. */
  title: string;
  /** Optional description text (rendered into the AT description channel). */
  description?: string;
  /** Curve interpolation. Default `'smooth'` (Catmull-Rom tension 0.5). */
  interpolation?: SparklineInterpolation;
  /** Series color (any valid CSS color). Default `'var(--color-brand)'`. */
  color?: string;
  /** Stroke width in px. Default `2`. */
  strokeWidth?: number;
  /** Render filled area under the line. Default `false`. */
  area?: boolean;
  /**
   * Fill opacity when `area=true` (0..1). Default `0.2`. For gradient mode,
   * scales the top stop opacity by 2.5× (clamped to 1) — mirrors AreaChart
   * coupling.
   */
  fillOpacity?: number;
  /**
   * When `true` AND `area=true`, fill renders as a vertical linear gradient
   * fading from `color` (peak) to transparent (baseline). Default `false`.
   */
  gradient?: boolean;
  /** Path-draw + fill-fade animation on mount. Default `true`. `prefers-reduced-motion` always wins. */
  animate?: boolean;
  /**
   * Container aspect ratio (width / height). Default `4` (wide-and-short
   * typical sparkline shape: 4:1). Consumer can pass explicit `style.width`
   * + `style.height` to override entirely.
   */
  aspectRatio?: number;
  /** Slot for custom empty state. Sr-only table still renders (empty tbody). */
  renderEmpty?: ReactNode | (() => ReactNode);
  /** Y formatter for sr-only table cells. Default `defaultYFormat`. */
  valueFormat?: (v: number) => string;
}

// ──────────────────────────────────────────────────────────────────────────
// SVG viewBox dimensions — wide-and-short normalized space
// (no padding — sparkline fills entire viewport since no axes consume edge)
// ──────────────────────────────────────────────────────────────────────────

const VIEWBOX_WIDTH = 200;
const VIEWBOX_HEIGHT = 50;

// Small inner pad so stroke-cap + circle markers don't clip at edges
const PAD_X = 2;
const PAD_Y = 2;

const PLOT_LEFT = PAD_X;
const PLOT_RIGHT = VIEWBOX_WIDTH - PAD_X;
const PLOT_TOP = PAD_Y;
const PLOT_BOTTOM = VIEWBOX_HEIGHT - PAD_Y;

// ──────────────────────────────────────────────────────────────────────────
// Sparkline component
// ──────────────────────────────────────────────────────────────────────────

export const Sparkline = forwardRef<HTMLDivElement, SparklineProps>(
  function Sparkline(props, forwardedRef) {
    const {
      data,
      title,
      description,
      interpolation = 'smooth',
      color = 'var(--color-brand)',
      strokeWidth = 2,
      area = false,
      fillOpacity = 0.2,
      gradient = false,
      animate = true,
      aspectRatio = 4,
      renderEmpty,
      valueFormat = defaultYFormat,
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
    const gradientId = `${baseId}-grad`;

    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Reduced-motion detection (post-mount, SSR-safe)
    useEffect(() => {
      if (typeof window === 'undefined' || !window.matchMedia) return;
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handler = () => setPrefersReducedMotion(mq.matches);
      handler();
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }, []);

    const hasData = data.length > 0;

    // Derive domains + plotted points.
    //
    // Single-point degenerate case: when `data.length === 1`, scaleLinear
    // over an x-domain of span 0 would collapse the lone point to the plot
    // midpoint, leaving no segment to stroke. Per JSDoc contract ("single
    // value renders a horizontal stroke at that value"), we synthesize two
    // endpoints at PLOT_LEFT + PLOT_RIGHT sharing the same y so the path
    // generators emit a real horizontal segment that fills the width.
    const { plottedPoints, baselineY } = useMemo(() => {
      if (!hasData) return { plottedPoints: [], baselineY: PLOT_BOTTOM };
      const yDomain = getDomain(data, 0.1);
      // Baseline (same rule as AreaChart): zero-crossing → 0; else yDomain[0]
      const [y0, y1] = yDomain;
      const baselineValue = y0 <= 0 && y1 >= 0 ? 0 : y0;
      const yScale = scaleLinear(yDomain, [PLOT_BOTTOM, PLOT_TOP]);

      if (data.length === 1) {
        const y = yScale(data[0]!);
        return {
          plottedPoints: [
            { x: PLOT_LEFT, y },
            { x: PLOT_RIGHT, y },
          ],
          baselineY: yScale(baselineValue),
        };
      }

      const xDomain: [number, number] = [0, data.length - 1];
      const xScale = scaleLinear(xDomain, [PLOT_LEFT, PLOT_RIGHT]);
      const plotted = data.map((y, i) => ({ x: xScale(i), y: yScale(y) }));
      return { plottedPoints: plotted, baselineY: yScale(baselineValue) };
    }, [data, hasData]);

    // Generate paths (line + optional area)
    const paths = useMemo(() => {
      if (plottedPoints.length === 0) return { line: '', area: '' };
      const interpFn = interpolation === 'linear' ? generateLinearPath : generateSmoothPath;
      const line = interpFn(plottedPoints);
      const areaPath = area ? generateAreaPath(plottedPoints, baselineY, interpolation) : '';
      return { line, area: areaPath };
    }, [plottedPoints, interpolation, area, baselineY]);

    const showAnimation = animate && !prefersReducedMotion;
    const pathClasses = cn(styles.path, showAnimation && styles.pathAnimating);
    const areaClasses = cn(styles.area, showAnimation && styles.areaAnimating);

    const wrapperStyle: CSSProperties = {
      ...style,
      ['--sparkline-aspect' as never]: String(aspectRatio),
      ['--sparkline-stroke-width' as never]: `${strokeWidth}px`,
      ['--sparkline-fill-opacity' as never]: String(clampedFillOpacity),
    };

    // Chained describedby
    const describedBy = useMemo(() => {
      const ids = [descId, tableId];
      if (consumerDescribedBy) ids.unshift(consumerDescribedBy);
      return ids.join(' ');
    }, [descId, tableId, consumerDescribedBy]);

    // Always render sr-only a11y layer (title, desc, table)
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
        <table id={tableId} className={styles.srOnly}>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">Index</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {data.map((v, i) => (
              <tr key={i}>
                <th scope="row">{i + 1}</th>
                <td>{valueFormat(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );

    // Empty state
    if (!hasData) {
      const emptyNode =
        typeof renderEmpty === 'function'
          ? renderEmpty()
          : (renderEmpty ?? <span className={styles.emptyText}>—</span>);

      return (
        <div
          ref={forwardedRef}
          className={cn(styles.root, className)}
          style={wrapperStyle}
          role="img"
          aria-labelledby={titleId}
          aria-describedby={describedBy}
          {...rest}
        >
          <div className={styles.svgContainer}>
            <div className={styles.empty}>{emptyNode}</div>
          </div>
          {a11yLayer}
        </div>
      );
    }

    return (
      <div
        ref={forwardedRef}
        className={cn(styles.root, className)}
        style={wrapperStyle}
        role="img"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        {...rest}
      >
        <div className={styles.svgContainer}>
          <svg
            className={styles.svg}
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable={false}
          >
            {/* Gradient defs — when area + gradient enabled */}
            {area && gradient && (
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={color}
                    stopOpacity={Math.min(1, clampedFillOpacity * 2.5)}
                  />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
            )}

            {/* Filled area (low z) */}
            {area && paths.area && (
              <path
                className={areaClasses}
                d={paths.area}
                fill={gradient ? `url(#${gradientId})` : color}
                fillOpacity={gradient ? undefined : clampedFillOpacity}
              />
            )}

            {/* Line stroke (on top) */}
            <path className={pathClasses} d={paths.line} stroke={color} pathLength={1} />
          </svg>
        </div>
        {a11yLayer}
      </div>
    );
  },
);
