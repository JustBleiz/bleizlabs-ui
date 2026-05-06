import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import styles from './TimelineMarker.module.scss';

/**
 * TimelineMarker — decorative round indicator for `<TimelineItem>` (compound
 * member, D24). Inherits Dot/Badge 6-color palette; matches Dot's `color`
 * enum spelling but published as `tint` per ActivityFeed driving-consumer
 * vocabulary (`data-tint` cascade selector convention).
 *
 * @layer   molecule (Phase 7, compound member of Timeline)
 * @tokens  --color-{brand,success,warning,error,info,text-secondary,
 *          border-strong,surface-raised}, --radius-full
 * @deps    cn. Pure decorative atom — no other lib imports.
 * @a11y    Renders `<span aria-hidden="true">`. Decorative — color and icon
 *          are visual cues only, never the sole carrier of event meaning.
 *          The `<TimelineItem>` content is the SR-readable payload.
 *
 * @example
 * // Default dot
 * <TimelineMarker />
 *
 * @example
 * // Tinted dot (no icon — colored fill only)
 * <TimelineMarker tint="success" />
 *
 * @example
 * // With icon (replaces default dot)
 * <TimelineMarker tint="warning" icon={<IconAlertTriangle size={14} />} />
 *
 * @example
 * // Custom marker content (replaces dot entirely — Avatar, Badge, etc.)
 * <TimelineMarker tint="brand">
 *   <Avatar src={user.avatar} alt="" size="xs" />
 * </TimelineMarker>
 */
export type TimelineMarkerTint =
  | 'default'
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export interface TimelineMarkerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Semantic tint. Default `'default'` (neutral). Matches Dot/Badge 6-color palette. */
  tint?: TimelineMarkerTint;
  /**
   * Optional icon node centered inside the marker (replaces the default dot).
   * Pass icon at ~14px (1.75 stroke) for visual parity with ActivityFeed
   * driving-consumer precedent. **Ignored when `children` is also passed**
   * — `children` takes precedence and replaces the marker visual entirely.
   */
  icon?: ReactNode;
  /**
   * Optional custom marker content (replaces dot AND icon — use for
   * Avatar/Badge/custom widget markers). When set, `icon` is ignored.
   */
  children?: ReactNode;
}

export const TimelineMarker = forwardRef<HTMLSpanElement, TimelineMarkerProps>(
  function TimelineMarker(
    { tint = 'default', icon, className, children, ...rest },
    ref,
  ) {
    const inner = children ?? icon;

    return (
      <span
        ref={ref}
        aria-hidden="true"
        data-tint={tint}
        className={cn(styles.root, className)}
        {...rest}
      >
        {inner}
      </span>
    );
  },
);
