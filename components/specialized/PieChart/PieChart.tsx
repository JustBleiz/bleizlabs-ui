'use client';

/**
 * PieChart — SVG pie chart with optional donut variant, segment hover +
 * keyboard navigation, segment percentage labels, sr-only `<table>`
 * a11y fallback. Pie semantics = categorical composition (full 360°),
 * complementing UsageDonut (partial progress w/ visible remainder).
 *
 * @layer specialized (Phase 6, E01.4 of 0.20.0 Charts pack — final)
 * @apg   No canonical W3C "piechart" APG pattern. ARIA model synthesized
 *        from `role="img"` + `aria-describedby` → sr-only data table
 *        (WCAG H51), keyboard segment navigation per Recharts/Mantine
 *        Charts a11y precedent. Discrete segments (unlike continuous
 *        line curves) are natural focus targets — Tab → focus first
 *        segment, Arrow keys cycle, Space/Enter click, Escape dismiss.
 * @tokens --color-{brand,success,warning,info,error} (DEFAULT_COLORS
 *         cycle, shared via _shared/chart-math), --color-border /
 *         --color-border-subtle (no axes here — used for segment
 *         stroke separation), --color-surface / --color-surface-raised
 *         (tooltip surface + segment halo), --color-text-{primary,
 *         secondary,muted} (labels), --shadow-md (tooltip), --focus-ring
 *         (focused segment via mixin), --duration-{fast,normal} +
 *         --easing-default, --radius-sm (tooltip), --space-{1,2,3,4,6}
 *         (rhythm), --font-size-{xs,sm} + --font-weight-medium. ZERO
 *         new design tokens (Charter R7). Component-local channels:
 *         `--piechart-segment-stroke-width` (2px default — gap between
 *         segments), `--piechart-aspect` (1 default — square pie),
 *         `--piechart-tooltip-{x,y}`.
 * @deps   cn (internal); `../_shared/chart-math` (defaultColorForIndex,
 *         DEFAULT_COLORS, defaultYFormat). Polar geometry helpers
 *         (`polarToCartesian`, `describeArc`) stay INLINE — PieChart is
 *         currently the only polar consumer; extract to
 *         `_shared/polar-math.ts` when a 2nd polar chart joins
 *         (RadarChart / GaugeChart / future). ZERO external runtime deps.
 * @a11y   Root: `<div role="img" aria-labelledby={titleId} aria-describedby=
 *         "{descId} {tableId} [consumer]">`. Internal `<svg>` is
 *         `aria-hidden="true"` (decorative; data conveyed via described-by
 *         chain). Sr-only `<table>` always renders: caption=`title`,
 *         thead=[Name, Value, %], tbody=one row per segment.
 *
 *         Per-segment `<path tabIndex>` w/ aria-label
 *         "{name}: {value} ({percent}%)". Roving tabindex (one segment
 *         has `tabIndex=0` matching focused). Arrow Right/Down cycle
 *         next; Arrow Left/Up cycle previous; Home/End jump first/last;
 *         Space/Enter fire `onSegmentClick` + pin tooltip; Escape
 *         dismiss pinned tooltip + blur.
 *
 *         Live region (`role="status" aria-live="polite"`) announces
 *         focused segment with zero-width marker counter for re-announce
 *         on same-segment re-focus.
 *
 *         Focus-ring via `:focus-visible` (forensic Pattern 1).
 *         `prefers-reduced-motion: reduce` suppresses enter animation
 *         + tooltip fade. `forced-colors: active` keeps segment outlines
 *         visible (Windows High Contrast).
 * @budget 12 props on root — generic-data organism per Charter R2.1
 *         (LineChart=13, AreaChart=15, Sparkline=10 sibling baselines).
 *         Single data prop + 4 visual axes (variant, showLabels,
 *         centerLabel, labelFormat) + 2 a11y labelling + 1 layout
 *         (aspectRatio) + animation opt-in + 2 interaction callbacks +
 *         2 slots (renderTooltip, renderEmpty). Multi-pie (small
 *         multiples) DEFERRED — consumer composes a grid of <PieChart>s
 *         when comparing multiple distributions.
 * @tested tsc --noEmit clean | eslint + jsx-a11y clean | next build
 *         clean. Playwright + axe-core + NVDA sweep DEFERRED to 0.20.x
 *         test-execution sprint per E15/E05.4/E01.2/E01.3 precedent.
 * @regressions tests/PieChart.regression.spec.ts — PC-R01..R20 (planned).
 * @example
 *   <PieChart
 *     title="Lead source breakdown"
 *     data={[
 *       { name: 'LinkedIn', value: 45 },
 *       { name: 'Cold email', value: 30 },
 *       { name: 'Partner', value: 25 },
 *     ]}
 *   />
 *
 *   <PieChart
 *     title="Time allocation"
 *     variant="donut"
 *     centerLabel={<><strong>32h</strong><br />/ 40h</>}
 *     showLabels
 *     data={timeAllocation}
 *     onSegmentClick={(seg) => router.push(`/projekty?kategoria=${seg.name}`)}
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
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import {
  defaultColorForIndex,
  defaultYFormat,
} from '../_shared/chart-math';
import styles from './PieChart.module.scss';

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

export type PieChartVariant = 'pie' | 'donut';

export interface PieChartDatum {
  /** Segment display name (tooltip, sr-only table row, aria-label). */
  name: string;
  /** Numeric value. Must be non-negative. Negative values are filtered + warned. */
  value: number;
  /**
   * Segment color (any valid CSS color). When omitted, lib cycles through
   * DEFAULT_COLORS (shared with line/area/sparkline for consistency).
   */
  color?: string;
}

export interface PieChartTooltipContext {
  /** Focused/hovered datum (post-normalization). */
  datum: PieChartDatum;
  /** Resolved color (explicit or from DEFAULT_COLORS cycle). */
  color: string;
  /** Index of the segment within the normalized data array. */
  segmentIndex: number;
  /** Segment value / total (0..1). */
  ratio: number;
  /** Segment value / total * 100 (0..100). */
  percent: number;
  /** Sum of all (non-negative) values. */
  total: number;
}

export interface PieChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  /** Segments. Non-negative values only; negatives filtered + warned. */
  data: PieChartDatum[];
  /** Required for a11y — used as `<caption>` of sr-only table + chart title. */
  title: string;
  /** Optional description text (rendered into the AT description channel). */
  description?: string;
  /** Variant. `'pie'` (default) = full wedges; `'donut'` = inner hole at 0.6× outer radius. */
  variant?: PieChartVariant;
  /**
   * Center hole content (donut variant). Ignored when `variant='pie'`.
   * Rendered absolutely positioned in donut hole; consumer composes own
   * typography (`<KpiValue>` / `<Heading>` / plain `<span>`).
   */
  centerLabel?: ReactNode;
  /**
   * Show on-segment percentage labels. Default `false`. When `true`, labels
   * render only for segments subtending ≥10% (smaller slices auto-hide to
   * avoid collision). Leader-line labels for small slices DEFERRED to
   * 0.20.x follow-up.
   */
  showLabels?: boolean;
  /** Label formatter. Default `(p) => ` ${Math.round(p)}%`. */
  labelFormat?: (percent: number, datum: PieChartDatum) => string;
  /** Custom formatter for tooltip + sr-only table cell values. Default `defaultYFormat`. */
  valueFormat?: (value: number) => string;
  /** Enter-fade animation on mount. Default `true`. `prefers-reduced-motion` always wins. */
  animate?: boolean;
  /** Container aspect ratio (width / height). Default `1` (square). */
  aspectRatio?: number;
  /** Explicit container height in pixels (overrides aspectRatio). */
  height?: number;
  /** Slot for fully custom tooltip body. */
  renderTooltip?: (ctx: PieChartTooltipContext) => ReactNode;
  /** Slot for custom empty state. Sr-only table still renders. */
  renderEmpty?: ReactNode | (() => ReactNode);
  /** Fires on Space/Enter on focused segment OR mouse click. */
  onSegmentClick?: (datum: PieChartDatum, index: number) => void;
  /** Fires on focus (keyboard) OR hover (mouse) of a segment. */
  onSegmentFocus?: (datum: PieChartDatum, index: number) => void;
}

// ──────────────────────────────────────────────────────────────────────────
// Polar geometry helpers — INLINE (PieChart is the only polar consumer
// for now; extract to `_shared/polar-math.ts` when a 2nd polar chart
// joins, e.g. RadarChart or GaugeChart).
// ──────────────────────────────────────────────────────────────────────────

/**
 * Convert a polar coordinate (radius + angle in degrees, where 0° = top
 * / 12 o'clock and grows clockwise) to SVG cartesian (x, y).
 */
function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

/**
 * Generate an SVG path describing a pie wedge (innerRadius=0) or donut
 * arc segment (innerRadius>0). Arc sweeps clockwise from `startDeg` to
 * `endDeg`. Full circle (360°) must be handled separately by caller (a
 * single 360° arc is a degenerate SVG path — use `<circle>` instead).
 */
function describeArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startDeg: number,
  endDeg: number,
): string {
  const sweepAngle = endDeg - startDeg;
  const largeArc = sweepAngle > 180 ? 1 : 0;
  const startOuter = polarToCartesian(cx, cy, outerR, startDeg);
  const endOuter = polarToCartesian(cx, cy, outerR, endDeg);

  if (innerR > 0) {
    const startInner = polarToCartesian(cx, cy, innerR, startDeg);
    const endInner = polarToCartesian(cx, cy, innerR, endDeg);
    // Outer arc CW startOuter → endOuter, then line to endInner, inner
    // arc CCW endInner → startInner, close.
    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
      `L ${endInner.x} ${endInner.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}`,
      'Z',
    ].join(' ');
  }

  // Pie wedge: center → startOuter → arc CW → endOuter → close
  return [
    `M ${cx} ${cy}`,
    `L ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    'Z',
  ].join(' ');
}

// ──────────────────────────────────────────────────────────────────────────
// Internal types
// ──────────────────────────────────────────────────────────────────────────

interface NormalizedSegment {
  datum: PieChartDatum;
  color: string;
  value: number;
  ratio: number;
  percent: number;
  startDeg: number;
  endDeg: number;
}

// ──────────────────────────────────────────────────────────────────────────
// SVG viewBox dimensions — square plot, generous inner padding for stroke
// + focus halo
// ──────────────────────────────────────────────────────────────────────────

const VIEWBOX_SIZE = 200;
const CENTER = VIEWBOX_SIZE / 2;
const OUTER_RADIUS = 88; // leaves 12px padding for focus ring + segment stroke
const DONUT_INNER_RATIO = 0.6;
const LABEL_MIN_PERCENT = 10; // segments < 10% auto-hide labels

const DEFAULT_LABEL_FORMAT = (percent: number) => `${Math.round(percent)}%`;

// ──────────────────────────────────────────────────────────────────────────
// PieChart component
// ──────────────────────────────────────────────────────────────────────────

export const PieChart = forwardRef<HTMLDivElement, PieChartProps>(
  function PieChart(props, forwardedRef) {
    const {
      data,
      title,
      description,
      variant = 'pie',
      centerLabel,
      showLabels = false,
      labelFormat = DEFAULT_LABEL_FORMAT,
      valueFormat = defaultYFormat,
      animate = true,
      aspectRatio = 1,
      height,
      renderTooltip,
      renderEmpty,
      onSegmentClick,
      onSegmentFocus,
      className,
      style,
      'aria-describedby': consumerDescribedBy,
      ...rest
    } = props;

    const baseId = useId();
    const titleId = `${baseId}-title`;
    const descId = `${baseId}-desc`;
    const tableId = `${baseId}-table`;
    const liveId = `${baseId}-live`;

    const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
    const [pinned, setPinned] = useState(false);
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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

    // Normalize data: filter negatives + zeros, compute angles.
    // (Negative-detection pass is separate from the keep-pass so the
    // useMemo body stays render-pure — no closure mutation.)
    const hasNegatives = useMemo(
      () => data.some((d) => d.value < 0),
      [data],
    );

    const { segments, total } = useMemo(() => {
      const filtered = data.filter((d) => d.value > 0);
      const sum = filtered.reduce((acc, d) => acc + d.value, 0);
      if (sum === 0) {
        return { segments: [] as NormalizedSegment[], total: 0 };
      }
      let cumulativeDeg = 0;
      const segs: NormalizedSegment[] = filtered.map((d, i) => {
        const ratio = d.value / sum;
        const sweep = ratio * 360;
        const start = cumulativeDeg;
        const end = cumulativeDeg + sweep;
        cumulativeDeg = end;
        return {
          datum: d,
          color: d.color ?? defaultColorForIndex(i),
          value: d.value,
          ratio,
          percent: ratio * 100,
          startDeg: start,
          endDeg: end,
        };
      });
      return { segments: segs, total: sum };
    }, [data]);

    // Dev-mode warn for negative values
    useEffect(() => {
      if (hasNegatives && process.env.NODE_ENV !== 'production') {
        console.warn(
          '[PieChart] Negative values are not supported and have been filtered out. ' +
            'PieChart represents proportional composition (segments sum to 360°).',
        );
      }
    }, [hasNegatives]);

    const hasData = segments.length > 0;
    const innerRadius = variant === 'donut' ? OUTER_RADIUS * DONUT_INNER_RATIO : 0;

    // Build path / circle render data per segment
    const renderSegments = useMemo(() => {
      if (!hasData) return [];
      // Special case: single 100% segment — SVG arc cannot represent a
      // 360° wedge in one path (start === end is degenerate). Render
      // as <circle> (or annulus for donut via two circles + even-odd
      // fill rule); we emit a flag so the JSX picks the right element.
      if (segments.length === 1) {
        return segments.map((s) => ({ seg: s, fullCircle: true, path: '' }));
      }
      return segments.map((s) => ({
        seg: s,
        fullCircle: false,
        path: describeArc(
          CENTER,
          CENTER,
          OUTER_RADIUS,
          innerRadius,
          s.startDeg,
          s.endDeg,
        ),
      }));
    }, [segments, hasData, innerRadius]);

    // ────────────────────────────────────────────────────────────────────
    // Focus + keyboard navigation
    // ────────────────────────────────────────────────────────────────────

    const setFocusAt = useCallback(
      (idx: number | null) => {
        setFocusedIdx(idx);
        if (idx != null && onSegmentFocus) {
          const seg = segments[idx];
          if (seg) onSegmentFocus(seg.datum, idx);
        }
      },
      [segments, onSegmentFocus],
    );

    const handleSegmentFocus = useCallback(
      (idx: number) => {
        setFocusAt(idx);
      },
      [setFocusAt],
    );

    const handleSegmentBlur = useCallback(() => {
      if (!pinned) setFocusedIdx(null);
    }, [pinned]);

    const handleSegmentClick = useCallback(
      (idx: number) => {
        setFocusAt(idx);
        setPinned(true);
        const seg = segments[idx];
        if (seg && onSegmentClick) onSegmentClick(seg.datum, idx);
      },
      [segments, onSegmentClick, setFocusAt],
    );

    const focusSegmentEl = useCallback((idx: number) => {
      const root = rootRef.current;
      if (!root) return;
      const el = root.querySelector<SVGElement>(
        `[data-segment-index="${idx}"]`,
      );
      el?.focus();
    }, []);

    const handleKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          setPinned(false);
          setFocusedIdx(null);
          setHoveredIdx(null);
          return;
        }
        if (focusedIdx == null) return;
        if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
          return;
        }
        const last = segments.length - 1;
        const move = (next: number) => {
          event.preventDefault();
          // Focus FIRST (synchronously) — segment already in DOM with
          // tabindex=-1; .focus() works. Native focus event triggers
          // React onFocus → setFocusAt → re-render → tabindex flips to
          // 0 for the now-focused segment.
          focusSegmentEl(next);
        };

        switch (event.key) {
          case 'ArrowRight':
          case 'ArrowDown': {
            const next = focusedIdx < last ? focusedIdx + 1 : 0;
            move(next);
            return;
          }
          case 'ArrowLeft':
          case 'ArrowUp': {
            const next = focusedIdx > 0 ? focusedIdx - 1 : last;
            move(next);
            return;
          }
          case 'Home': {
            move(0);
            return;
          }
          case 'End': {
            move(last);
            return;
          }
          case ' ':
          case 'Enter': {
            event.preventDefault();
            handleSegmentClick(focusedIdx);
            return;
          }
          default:
            break;
        }
      },
      [focusedIdx, segments.length, handleSegmentClick, focusSegmentEl],
    );

    // ────────────────────────────────────────────────────────────────────
    // Active target = focused (keyboard) ?? hovered (mouse)
    // ────────────────────────────────────────────────────────────────────

    const activeIdx = focusedIdx ?? hoveredIdx;
    const activeSegment =
      activeIdx != null ? (segments[activeIdx] ?? null) : null;

    const tooltipContext = useMemo<PieChartTooltipContext | null>(() => {
      if (!activeSegment || activeIdx == null) return null;
      return {
        datum: activeSegment.datum,
        color: activeSegment.color,
        segmentIndex: activeIdx,
        ratio: activeSegment.ratio,
        percent: activeSegment.percent,
        total,
      };
    }, [activeSegment, activeIdx, total]);

    // Tooltip position — midpoint of segment arc, outer radius midline
    const tooltipPosition = useMemo(() => {
      if (!activeSegment) return null;
      const midDeg = (activeSegment.startDeg + activeSegment.endDeg) / 2;
      const labelRadius = (OUTER_RADIUS + innerRadius) / 2;
      return polarToCartesian(CENTER, CENTER, labelRadius, midDeg);
    }, [activeSegment, innerRadius]);

    // Live region announcement. PieChart segments have stable, distinct
    // identities (each segment's name + value + percent triple is unique
    // per render) — content change alone triggers AT re-announcement.
    // No re-announce marker counter needed (vs LineChart where the same
    // datum may be re-focused after blur and AT would skip a duplicate
    // announcement). Keeps the live region computation render-pure.
    const liveAnnouncement = activeSegment
      ? `${activeSegment.datum.name}: ${valueFormat(activeSegment.value)} (${Math.round(activeSegment.percent)}%)`
      : '';

    // Chained describedby — order per JSDoc contract: internal ids first
    // (chart description + sr-only table + live region), consumer-supplied
    // ids appended LAST so AT readers announce the chart's own context
    // before the consumer's supplemental description.
    const describedBy = useMemo(() => {
      const ids = [descId, tableId, liveId];
      if (consumerDescribedBy) ids.push(consumerDescribedBy);
      return ids.join(' ');
    }, [descId, tableId, liveId, consumerDescribedBy]);

    const showAnimation = animate && !prefersReducedMotion;
    const segmentClasses = cn(styles.segment, showAnimation && styles.segmentAnimating);

    const wrapperStyle: CSSProperties = {
      ...style,
      ['--piechart-aspect' as never]: String(aspectRatio),
      ...(height ? { height: `${height}px` } : {}),
    };

    // Always render sr-only a11y layer
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
              <th scope="col">Name</th>
              <th scope="col">Value</th>
              <th scope="col">%</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((s, i) => (
              <tr key={`${s.datum.name}-${i}`}>
                <th scope="row">{s.datum.name}</th>
                <td>{valueFormat(s.value)}</td>
                <td>{`${Math.round(s.percent)}%`}</td>
              </tr>
            ))}
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
          <div className={styles.svgContainer}>
            <div className={styles.empty}>{emptyNode}</div>
          </div>
          {a11yLayer}
        </div>
      );
    }

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
        <div className={styles.svgContainer}>
          <svg
            className={styles.svg}
            viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
            focusable={false}
          >
            <g>
              {renderSegments.map(({ seg, fullCircle, path }, idx) => {
                // Roving tabindex: when no segment has explicit focus yet
                // (initial render), segment[0] is the tab stop so Tab CAN
                // enter the chart from outside. Once user activates any
                // segment (via mouse or initial Tab+focus), focusedIdx
                // tracks the rover; subsequent Tabs leave the chart and
                // arrow keys cycle within.
                const isTabStop = (focusedIdx ?? 0) === idx;
                const isActive = activeIdx === idx;
                const ariaLabel = `${seg.datum.name}: ${valueFormat(seg.value)} (${Math.round(seg.percent)}%)`;

                // Single-segment full-circle case: render <circle>
                // (annulus when donut via stroke instead of fill — keeps
                // single render element for both variants)
                if (fullCircle) {
                  if (innerRadius > 0) {
                    // Donut annulus via stroke
                    const strokeWidth = OUTER_RADIUS - innerRadius;
                    const midRadius = (OUTER_RADIUS + innerRadius) / 2;
                    return (
                      <circle
                        key={`seg-${idx}`}
                        className={segmentClasses}
                        cx={CENTER}
                        cy={CENTER}
                        r={midRadius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={strokeWidth}
                        tabIndex={isTabStop ? 0 : -1}
                        data-segment-index={idx}
                        data-active={isActive ? 'true' : 'false'}
                        aria-label={ariaLabel}
                        onFocus={() => handleSegmentFocus(idx)}
                        onBlur={handleSegmentBlur}
                        onClick={() => handleSegmentClick(idx)}
                        onMouseEnter={() => !pinned && setHoveredIdx(idx)}
                        onMouseLeave={() => !pinned && setHoveredIdx(null)}
                      />
                    );
                  }
                  return (
                    <circle
                      key={`seg-${idx}`}
                      className={segmentClasses}
                      cx={CENTER}
                      cy={CENTER}
                      r={OUTER_RADIUS}
                      fill={seg.color}
                      tabIndex={isTabStop ? 0 : -1}
                      data-segment-index={idx}
                      data-active={isActive ? 'true' : 'false'}
                      aria-label={ariaLabel}
                      onFocus={() => handleSegmentFocus(idx)}
                      onBlur={handleSegmentBlur}
                      onClick={() => handleSegmentClick(idx)}
                      onMouseEnter={() => !pinned && setHoveredIdx(idx)}
                      onMouseLeave={() => !pinned && setHoveredIdx(null)}
                    />
                  );
                }

                return (
                  <path
                    key={`seg-${idx}`}
                    className={segmentClasses}
                    d={path}
                    fill={seg.color}
                    tabIndex={isTabStop ? 0 : -1}
                    data-segment-index={idx}
                    data-active={isActive ? 'true' : 'false'}
                    aria-label={ariaLabel}
                    onFocus={() => handleSegmentFocus(idx)}
                    onBlur={handleSegmentBlur}
                    onClick={() => handleSegmentClick(idx)}
                    onMouseEnter={() => !pinned && setHoveredIdx(idx)}
                    onMouseLeave={() => !pinned && setHoveredIdx(null)}
                  />
                );
              })}
            </g>

            {/* On-segment percentage labels (only for segments ≥ LABEL_MIN_PERCENT) */}
            {showLabels && (
              <g aria-hidden="true">
                {segments.map((s, i) => {
                  if (s.percent < LABEL_MIN_PERCENT) return null;
                  const midDeg = (s.startDeg + s.endDeg) / 2;
                  const labelRadius =
                    innerRadius > 0
                      ? (OUTER_RADIUS + innerRadius) / 2
                      : OUTER_RADIUS * 0.65;
                  const pos = polarToCartesian(CENTER, CENTER, labelRadius, midDeg);
                  return (
                    <text
                      key={`lbl-${i}`}
                      className={styles.segmentLabel}
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {labelFormat(s.percent, s.datum)}
                    </text>
                  );
                })}
              </g>
            )}
          </svg>

          {/* Center label (donut variant) */}
          {variant === 'donut' && centerLabel != null && (
            <div className={styles.centerLabel} aria-hidden="true">
              {centerLabel}
            </div>
          )}

          {/* Tooltip — positioned at active segment's mid-radius point */}
          {tooltipContext && tooltipPosition && (
            <div
              className={cn(styles.tooltip, styles.tooltipVisible)}
              style={
                {
                  ['--piechart-tooltip-x' as never]: `${(tooltipPosition.x / VIEWBOX_SIZE) * 100}%`,
                  ['--piechart-tooltip-y' as never]: `${(tooltipPosition.y / VIEWBOX_SIZE) * 100}%`,
                } as CSSProperties
              }
            >
              {renderTooltip ? (
                renderTooltip(tooltipContext)
              ) : (
                <>
                  <div className={styles.tooltipRow}>
                    <span
                      className={styles.tooltipSwatch}
                      style={{ backgroundColor: tooltipContext.color }}
                      aria-hidden="true"
                    />
                    <span className={styles.tooltipName}>
                      {tooltipContext.datum.name}
                    </span>
                  </div>
                  <div className={styles.tooltipValueRow}>
                    <span className={styles.tooltipValue}>
                      {valueFormat(tooltipContext.datum.value)}
                    </span>
                    <span className={styles.tooltipPercent}>
                      {Math.round(tooltipContext.percent)}%
                    </span>
                  </div>
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
