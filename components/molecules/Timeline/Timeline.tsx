import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import styles from './Timeline.module.scss';

/**
 * Timeline — chronological event-list molecule (compound flat exports per D24).
 *
 * Renders a semantic `<ol>` of `<TimelineItem>` children with a connector
 * line spine and tinted markers. Server-safe (no client hooks). Promoted
 * v0.8.2 from `bleizlabs-website` ActivityFeed driving consumers (BleizOS
 * `_sections/ActivityFeed` + panel_v2 `panel/activity/ActivityContent` +
 * panel_v2 `panel/services/_sections/RecentActivityFeed` + scout-hub
 * `leads/[slug]/tab-history`) — universality 3-of-3 PASS.
 *
 * @layer   molecule (Phase 7) — compound: Timeline + TimelineItem + TimelineMarker
 * @tokens  --color-{brand,success,warning,error,info,text-{primary,secondary,muted},
 *          surface,border-subtle}, --space-{2,3,4,5,6}, --radius-full,
 *          --duration-fast, --easing-default
 * @deps    cn (lib utility). Pure compound — no other lib imports.
 * @a11y    Renders semantic `<ol>` (chronological events = ordered list per
 *          WCAG 2.1 SC 1.3.1). Each `<TimelineItem>` is an `<li>` with
 *          decorative `<TimelineMarker>` (`aria-hidden="true"`). Consumer
 *          owns timestamp semantics — wrap timestamp text in `<time
 *          dateTime="ISO">` inside item content. SR users hear:
 *          "1. Event title. [time]. [description]."
 *
 * @example
 * // Minimal
 * <Timeline>
 *   <TimelineItem>First event</TimelineItem>
 *   <TimelineItem>Second event</TimelineItem>
 * </Timeline>
 *
 * @example
 * // With tinted markers
 * <Timeline>
 *   <TimelineItem tint="success">Deploy succeeded</TimelineItem>
 *   <TimelineItem tint="warning">Latency spike detected</TimelineItem>
 *   <TimelineItem tint="error">Outage opened</TimelineItem>
 * </Timeline>
 *
 * @example
 * // ActivityFeed pattern (driving consumer mirror)
 * <Timeline>
 *   {events.map((evt) => (
 *     <TimelineItem
 *       key={evt.id}
 *       tint={tintFor(evt.type)}
 *       marker={
 *         <TimelineMarker tint={tintFor(evt.type)} icon={iconFor(evt.type)} />
 *       }
 *     >
 *       <Stack gap={1}>
 *         <Inline gap={2} align="baseline">
 *           <Text weight="semibold">{evt.title}</Text>
 *           <Text variant="caption" color="muted" asChild>
 *             <time dateTime={evt.at}>{relativeTime(evt.at)}</time>
 *           </Text>
 *         </Inline>
 *         <Text variant="caption" color="secondary">{evt.summary}</Text>
 *       </Stack>
 *     </TimelineItem>
 *   ))}
 * </Timeline>
 */
export interface TimelineProps extends HTMLAttributes<HTMLOListElement> {
  /** TimelineItem children. */
  children: ReactNode;
}

export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(
  function Timeline({ className, children, ...rest }, ref) {
    return (
      <ol ref={ref} className={cn(styles.root, className)} {...rest}>
        {children}
      </ol>
    );
  },
);
