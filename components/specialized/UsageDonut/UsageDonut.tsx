import {
  forwardRef,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './UsageDonut.module.scss';

/**
 * UsageDonut — multi-segment SVG donut chart (Phase 6 P6, Tier B, server-safe).
 *
 * @layer   atom (specialized)
 * @tokens  --color-{brand,success,warning,info,error} (tsx DEFAULT_COLORS
 *          cycle for unlabeled segments — runtime injection via SVG stroke),
 *          --color-surface-raised (track circle stroke for remainder),
 *          --color-text-primary (root + centerLabel color),
 *          --space-{1,2,20} (center gap + padding + sizeSm base; sizeMd/Lg
 *          scale via calc(--space-20 * 1.75) and calc(--space-20 * 2.5)),
 *          --font-size-{xs,sm,base} (size variants).
 * @deps    cn, React: `forwardRef`, `useMemo`, type imports
 *          `HTMLAttributes<HTMLDivElement>`, `ReactNode`
 * @a11y    Renders a `<div>` wrapper (so consumers can compose a `centerLabel`
 *          slot) containing a single `<svg role="img">` with an `aria-label`
 *          and a first-child `<title>` element (the traditional SVG accessor
 *          for assistive tech). The donut itself is a non-interactive chart
 *          — it is **not** `role="progressbar"`, because it can describe
 *          multi-segment breakdowns (the sum of all segments, not progress
 *          toward a target).
 * @notes   Circle math: viewBox `0 0 100 100`, center `(50, 50)`, radius
 *          `50 - strokeWidth/2`. Each segment is a concentric `<circle>`
 *          with `stroke-dasharray="segmentDash circumference - segmentDash"`
 *          and `stroke-dashoffset=-accumulatedDash`. All segments share a
 *          `<g transform="rotate(-90 50 50)">` so the donut starts at
 *          12 o'clock. When `total` is omitted we auto-sum segments.
 *          Segments without `color` cycle through
 *          `brand → success → warning → info → error` (Badge / Dot precedent).
 *          A muted track circle is always drawn behind the segments so a
 *          partial total (`sum(segments) < total`) leaves a visible remainder.
 *
 * @example
 * <UsageDonut
 *   label="Project budget breakdown"
 *   segments={[
 *     { label: 'Design', value: 12 },
 *     { label: 'Dev', value: 28 },
 *     { label: 'QA', value: 6, color: 'var(--color-warning)' },
 *   ]}
 *   centerLabel={
 *     <>
 *       <span className="big">46h</span>
 *       <span className="small">of 60h</span>
 *     </>
 *   }
 *   total={60}
 * />
 */
export interface UsageDonutSegment {
  /** Readable label used in the SVG `<title>` (and future legend slots). */
  label: string;
  /** Numeric value — share of the donut is `value / effectiveTotal`. */
  value: number;
  /** Optional CSS color (`var(--color-...)` or any valid color string). */
  color?: string;
}

export type UsageDonutSize = 'sm' | 'md' | 'lg';

export interface UsageDonutProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'aria-label'> {
  /** Segments rendered clockwise starting at 12 o'clock. */
  segments: UsageDonutSegment[];
  /** Explicit total. When omitted, auto-sums `segments`. */
  total?: number;
  /** Visual size preset. Default `'md'`. */
  size?: UsageDonutSize;
  /**
   * Stroke width inside the 100×100 viewBox. Default `14`.
   *
   * Derivation: `14` leaves radius `50 - 14/2 = 43`, giving a ~30% inner
   * hole by area — the sweet spot between "ring" (too thin, looks like
   * gauge) and "pie" (too thick, loses donut affordance). Values between
   * `10` and `18` stay readable; outside that range the center label
   * collides with the arc or the arc becomes hairline.
   */
  strokeWidth?: number;
  /** Accessible name — required. Used on both the wrapper and the SVG. */
  label: string;
  /** Optional center slot (e.g. big number + caption). */
  centerLabel?: ReactNode;
}

const DEFAULT_COLORS = [
  'var(--color-brand)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-info)',
  'var(--color-error)',
];

const SIZE_CLASS: Record<UsageDonutSize, string> = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
};

interface ComputedSegment {
  key: string;
  label: string;
  value: number;
  dash: number;
  offset: number;
  color: string;
}

export const UsageDonut = forwardRef<HTMLDivElement, UsageDonutProps>(
  function UsageDonut(
    {
      segments,
      total,
      size = 'md',
      strokeWidth = 14,
      label,
      centerLabel,
      className,
      ...rest
    },
    ref,
  ) {
    const radius = 50 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    const computed = useMemo<ComputedSegment[]>(() => {
      const rawSum = segments.reduce(
        (sum, segment) => sum + Math.max(0, segment.value),
        0,
      );
      const effectiveTotal = total !== undefined && total > 0 ? total : rawSum;
      if (effectiveTotal <= 0) {
        return [];
      }

      let accumulated = 0;
      return segments
        .filter((segment) => segment.value > 0)
        .map((segment, index): ComputedSegment => {
          const ratio = Math.min(1, segment.value / effectiveTotal);
          const dash = ratio * circumference;
          const offset = -accumulated;
          accumulated += dash;
          return {
            key: `${index}-${segment.label}`,
            label: segment.label,
            value: segment.value,
            dash,
            offset,
            color:
              segment.color ??
              DEFAULT_COLORS[index % DEFAULT_COLORS.length]!,
          };
        });
    }, [segments, total, circumference]);

    const summary = useMemo(() => {
      const rawSum = segments.reduce(
        (sum, segment) => sum + Math.max(0, segment.value),
        0,
      );
      const effectiveTotal =
        total !== undefined && total > 0 ? total : rawSum;
      return `${label}. ${segments.length} segment${segments.length === 1 ? '' : 's'}, total ${effectiveTotal}.`;
    }, [label, segments, total]);

    return (
      <div
        ref={ref}
        role="img"
        aria-label={label}
        className={cn(styles.root, SIZE_CLASS[size], className)}
        {...rest}
      >
        <svg
          className={styles.svg}
          viewBox="0 0 100 100"
          focusable="false"
          aria-hidden="true"
        >
          <title>{summary}</title>
          <circle
            cx={50}
            cy={50}
            r={radius}
            fill="none"
            stroke="var(--color-surface-raised)"
            strokeWidth={strokeWidth}
          />
          <g transform="rotate(-90 50 50)">
            {computed.map((segment) => (
              <circle
                key={segment.key}
                cx={50}
                cy={50}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
                strokeDashoffset={segment.offset}
                strokeLinecap="butt"
              >
                <title>{`${segment.label}: ${segment.value}`}</title>
              </circle>
            ))}
          </g>
        </svg>
        {centerLabel ? (
          <div aria-hidden="true" className={styles.center}>
            {centerLabel}
          </div>
        ) : null}
      </div>
    );
  },
);
