import { forwardRef, useMemo, type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import styles from './AvailabilityBar.module.scss';

/**
 * AvailabilityBar — day-by-day status strip (Phase 6 P7, Tier B, server-safe).
 *
 * @layer   atom (specialized)
 * @tokens  --color-{success,warning,error}, --color-surface-raised,
 *          --color-text-{secondary,muted}, --space-{2,4} (gap + strip
 *          height), --font-size-xs, --font-weight-medium, --line-height-snug,
 *          --radius-sm.
 *          Component-local `--availability-cells` channel (default 30,
 *          overridable via tsx CSSProperties) drives `repeat(N, minmax(0,1fr))`
 *          grid column count — scales the strip for any day count.
 * @deps    cn, React: `forwardRef`, `useMemo`, type import
 *          `HTMLAttributes<HTMLDivElement>`
 * @a11y    Outer `<div>` wrapper carries `role="img"` + `aria-label` so
 *          assistive tech gets a single summary sentence (built from the
 *          passed `label` + counts of each status). Inside, the strip
 *          itself is an ordered `<ul role="list">` of `<li>` cells; each
 *          cell uses the native `title` attribute for hover tooltips —
 *          zero-dependency fallback until the Phase 10 Tooltip primitive
 *          lands. Individual status cells are NOT `aria-hidden` so a SR
 *          user can still drill into specific days if they choose to.
 * @notes   Statuses: `'ok'` → `--color-success`, `'warning'` →
 *          `--color-warning`, `'down'` → `--color-error`. Empty
 *          `segments` array renders nothing. `showLabels` draws the first
 *          and last date text beneath the strip (middle days keep native
 *          `title` only — avoids label clutter). Layout uses CSS Grid
 *          with `repeat(N, minmax(0, 1fr))` via a `--cells` custom
 *          property so the strip scales down to very small widths.
 *
 * @example
 * <AvailabilityBar
 *   label="API uptime — ostatnie 30 dni"
 *   segments={historyArray}
 *   showLabels
 * />
 */
export type AvailabilityStatus = 'ok' | 'warning' | 'down';

export interface AvailabilitySegment {
  /** ISO date string (e.g., `'2026-04-14'`). Used in native `title` tooltip. */
  date: string;
  /** Status cell color — `'ok'` green, `'warning'` yellow, `'down'` red. */
  status: AvailabilityStatus;
}

export interface AvailabilityBarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'aria-label'> {
  /** Day-by-day segments (left-to-right order). Empty array → nothing renders. */
  segments: AvailabilitySegment[];
  /** Accessible name (required). Used as `aria-label` + in the summary text. */
  label: string;
  /** Show first + last date labels beneath the strip. Default `false`. */
  showLabels?: boolean;
}

const STATUS_CLASS: Record<AvailabilityStatus, string> = {
  ok: styles.statusOk!,
  warning: styles.statusWarning!,
  down: styles.statusDown!,
};

const STATUS_LABEL: Record<AvailabilityStatus, string> = {
  ok: 'ok',
  warning: 'warning',
  down: 'down',
};

export const AvailabilityBar = forwardRef<
  HTMLDivElement,
  AvailabilityBarProps
>(function AvailabilityBar(
  { segments, label, showLabels = false, className, style, ...rest },
  ref,
) {
  const counts = useMemo(() => {
    const result = { ok: 0, warning: 0, down: 0 };
    for (const segment of segments) {
      result[segment.status] += 1;
    }
    return result;
  }, [segments]);

  if (segments.length === 0) {
    return null;
  }

  const summary = `${label}. ${segments.length} days: ${counts.ok} ok, ${counts.warning} warnings, ${counts.down} down.`;
  const firstDate = segments[0]?.date;
  const lastDate = segments[segments.length - 1]?.date;

  const cssVars = {
    ...style,
    '--availability-cells': segments.length,
  } as React.CSSProperties;

  return (
    <div
      ref={ref}
      role="img"
      aria-label={summary}
      className={cn(styles.root, className)}
      style={cssVars}
      {...rest}
    >
      <ul role="list" className={styles.strip}>
        {segments.map((segment, index) => (
          <li
            key={`${index}-${segment.date}`}
            title={`${segment.date} — ${STATUS_LABEL[segment.status]}`}
            className={cn(styles.cell, STATUS_CLASS[segment.status])}
          />
        ))}
      </ul>
      {showLabels ? (
        <div aria-hidden="true" className={styles.labels}>
          <span className={styles.labelStart}>{firstDate}</span>
          <span className={styles.labelEnd}>{lastDate}</span>
        </div>
      ) : null}
    </div>
  );
});
