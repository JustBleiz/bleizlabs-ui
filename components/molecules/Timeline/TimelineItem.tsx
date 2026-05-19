import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { TimelineMarker, type TimelineMarkerTint } from './TimelineMarker';
import styles from './TimelineItem.module.scss';

/**
 * TimelineItem — single event row inside a `<Timeline>` (compound member, D24).
 *
 * Renders a semantic `<li>` with marker slot + content slot + connector spine
 * (CSS `::before` pseudo-element). Connector auto-suppresses on the last
 * item via `:last-child` selector. The marker is positioned in a fixed
 * 26 px left grid column.
 *
 * For full-row clickability, place a `<Link>` / `<a>` / `<button>` inside
 * the content slot (the marker stays decorative, the link captures the
 * click area). The compound does NOT support `asChild` on `<TimelineItem>`
 * because the `<li>` carries two semantic siblings (marker slot + content
 * slot); merging them into a single consumer element is incompatible with
 * the lib `Slot` primitive's single-element constraint (see Slot.tsx
 * docblock). Use a content-level Link instead.
 *
 * @layer   molecule (Phase 7, compound member of Timeline)
 * @tokens  Direct: `--space-3` (grid gap between marker column and content),
 *          `--space-4` (padding-bottom rhythm between items), `--color-text-primary`
 *          (connector spine via color-mix gradient). Component-internal
 *          decorator dimensions (26 px marker grid column, 13 px connector
 *          x-offset, 26 px connector y-start) hardcoded with `@raw-px-ok`
 *          per D28. Forced-colors fallback maps connector to `CanvasText`.
 *          Inherits Timeline + TimelineMarker tokens transitively when
 *          rendering the default marker.
 * @deps    cn, TimelineMarker (default marker render).
 * @a11y    Semantic `<li>` element. The marker slot is decorative
 *          (`aria-hidden="true"`); the content slot is the SR-readable
 *          payload. Forced-colors mode preserves connector visibility
 *          via `CanvasText` fallback in TimelineItem.module.scss.
 *
 * @example
 * // Simple
 * <TimelineItem>Event description</TimelineItem>
 *
 * @example
 * // Tinted default marker
 * <TimelineItem tint="success">Deploy succeeded</TimelineItem>
 *
 * @example
 * // Custom marker with icon
 * <TimelineItem
 *   tint="warning"
 *   marker={<TimelineMarker tint="warning" icon={<IconAlertTriangle />} />}
 * >
 *   Latency spike detected
 * </TimelineItem>
 *
 * @example
 * // Full-row clickable — Link inside content slot (NOT asChild)
 * <TimelineItem tint="brand">
 *   <Link href={`/events/${evt.id}`} className={styles.eventLink}>
 *     {evt.title}
 *   </Link>
 * </TimelineItem>
 */
export interface TimelineItemProps extends HTMLAttributes<HTMLLIElement> {
  /**
   * Optional custom marker node (e.g., `<TimelineMarker>` with custom icon,
   * or any ReactNode like Avatar, Badge). When omitted, a default
   * `<TimelineMarker tint={tint}>` dot is rendered.
   */
  marker?: ReactNode;
  /**
   * Convenience tint for the default marker (ignored when `marker` is set
   * explicitly — pass tint to your own `<TimelineMarker tint={...}>` instead).
   * Default `'default'` (neutral border + surface fill).
   */
  tint?: TimelineMarkerTint;
  /** Event content — typically `<Stack>` with title row + meta row. */
  children: ReactNode;
}

export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(function TimelineItem(
  { marker, tint = 'default', className, children, ...rest },
  ref,
) {
  const resolvedMarker = marker ?? <TimelineMarker tint={tint} />;

  return (
    <li ref={ref} className={cn(styles.root, className)} {...rest}>
      <span className={styles.markerSlot} aria-hidden="true">
        {resolvedMarker}
      </span>
      <span className={styles.content}>{children}</span>
    </li>
  );
});
