import Link from 'next/link';
import {
  Timeline,
  TimelineItem,
  TimelineMarker,
  type TimelineMarkerTint,
} from '@/components/molecules/Timeline';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

function PlaceholderIcon({ d }: { d: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const ICON_CHECK = 'M5 12l5 5L20 7';
const ICON_ALERT = 'M12 9v4m0 4h.01M10.29 3.86l-8.18 14.14a2 2 0 001.71 3h16.36a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z';
const ICON_BOLT = 'M13 2L3 14h9l-1 8 10-12h-9z';
const ICON_INFO = 'M12 16v-4m0-4h.01M22 12a10 10 0 11-20 0 10 10 0 0120 0z';

const TINTS: TimelineMarkerTint[] = [
  'default',
  'brand',
  'success',
  'warning',
  'error',
  'info',
];

export default function TimelinePlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          Timeline
        </Heading>
        <p className={styles.intro}>
          Chronological event-list molecule. Compound flat exports:{' '}
          <code>Timeline</code> + <code>TimelineItem</code> +{' '}
          <code>TimelineMarker</code>. Renders semantic{' '}
          <code>{'<ol>/<li>'}</code> + tinted markers + connector spine via
          CSS <code>::before</code> pseudo-element.
        </p>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          1. Minimal — 3 items, default markers
        </Heading>
        <p className={styles.sectionDescription}>
          Bare minimum. Just <code>{'<Timeline>'}</code> wrapping{' '}
          <code>{'<TimelineItem>'}</code> children. Default neutral tint
          marker.
        </p>
        <div className={styles.demoCard}>
          <Timeline>
            <TimelineItem>
              <Text className={styles.eventTitle}>First event</Text>
              <p className={styles.eventBody}>Initial system state recorded.</p>
            </TimelineItem>
            <TimelineItem>
              <Text className={styles.eventTitle}>Second event</Text>
              <p className={styles.eventBody}>Configuration updated.</p>
            </TimelineItem>
            <TimelineItem>
              <Text className={styles.eventTitle}>Third event</Text>
              <p className={styles.eventBody}>Health check passed.</p>
            </TimelineItem>
          </Timeline>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          2. All 6 tints (default / brand / success / warning / error / info)
        </Heading>
        <p className={styles.sectionDescription}>
          Tint enum matches Dot/Badge palette. Color reinforces event type;
          textual content is the SR-readable carrier of meaning.
        </p>
        <div className={styles.demoCard}>
          <Timeline>
            {TINTS.map((tint) => (
              <TimelineItem key={tint} tint={tint}>
                <Text className={styles.eventTitle}>
                  Tint &quot;{tint}&quot;
                </Text>
                <p className={styles.eventBody}>
                  Marker rendered with <code>tint=&quot;{tint}&quot;</code>.
                </p>
              </TimelineItem>
            ))}
          </Timeline>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          3. Markers with icons — pass icon node into TimelineMarker
        </Heading>
        <p className={styles.sectionDescription}>
          Pass <code>icon</code> prop to <code>TimelineMarker</code> to
          replace the default with a 14px centered icon. Use any icon
          library (Tabler, Lucide, Heroicons, etc.).
        </p>
        <div className={styles.demoCard}>
          <Timeline>
            <TimelineItem
              tint="success"
              marker={
                <TimelineMarker
                  tint="success"
                  icon={<PlaceholderIcon d={ICON_CHECK} />}
                />
              }
            >
              <Text className={styles.eventTitle}>Deploy succeeded</Text>
              <p className={styles.eventBody}>
                Production deploy completed without errors.
              </p>
            </TimelineItem>
            <TimelineItem
              tint="warning"
              marker={
                <TimelineMarker
                  tint="warning"
                  icon={<PlaceholderIcon d={ICON_ALERT} />}
                />
              }
            >
              <Text className={styles.eventTitle}>Latency spike</Text>
              <p className={styles.eventBody}>
                p99 response time rose above 800ms.
              </p>
            </TimelineItem>
            <TimelineItem
              tint="error"
              marker={
                <TimelineMarker
                  tint="error"
                  icon={<PlaceholderIcon d={ICON_BOLT} />}
                />
              }
            >
              <Text className={styles.eventTitle}>Outage opened</Text>
              <p className={styles.eventBody}>
                Edge CDN node us-west-2 unreachable.
              </p>
            </TimelineItem>
            <TimelineItem
              tint="info"
              marker={
                <TimelineMarker
                  tint="info"
                  icon={<PlaceholderIcon d={ICON_INFO} />}
                />
              }
            >
              <Text className={styles.eventTitle}>Maintenance window</Text>
              <p className={styles.eventBody}>
                Scheduled DB migration starts in 2 hours.
              </p>
            </TimelineItem>
          </Timeline>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          4. Clickable content slot — Link inside TimelineItem content
        </Heading>
        <p className={styles.sectionDescription}>
          For navigable timeline items, place a <code>{'<Link>'}</code>{' '}
          inside the content slot. The link captures the click + keyboard
          focus while the marker stays decorative. <code>TimelineItem</code>{' '}
          intentionally does NOT support <code>asChild</code> because the{' '}
          <code>{'<li>'}</code> renders two semantic siblings (marker slot
          + content slot) which the lib <code>Slot</code> primitive cannot
          merge into a single consumer element.
        </p>
        <div className={styles.demoCard}>
          <Timeline>
            <TimelineItem
              tint="brand"
              marker={
                <TimelineMarker
                  tint="brand"
                  icon={<PlaceholderIcon d={ICON_INFO} />}
                />
              }
            >
              <Link href="#" className={styles.eventLink}>
                <Text className={styles.eventTitle}>
                  View incident #4821 detail →
                </Text>
                <p className={styles.eventBody}>
                  Click anywhere on this content area to navigate
                  (focus-visible ring lands on the Link).
                </p>
              </Link>
            </TimelineItem>
            <TimelineItem
              tint="success"
              marker={
                <TimelineMarker
                  tint="success"
                  icon={<PlaceholderIcon d={ICON_CHECK} />}
                />
              }
            >
              <Link href="#" className={styles.eventLink}>
                <Text className={styles.eventTitle}>
                  View resolution report →
                </Text>
                <p className={styles.eventBody}>
                  Tab through to verify keyboard focus reaches the link.
                </p>
              </Link>
            </TimelineItem>
          </Timeline>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          5. Activity feed pattern
        </Heading>
        <p className={styles.sectionDescription}>
          Realistic event feed: title row + relative timestamp +
          description. Each item composes <code>TimelineItem</code> + custom
          marker + content slots.
        </p>
        <div className={styles.demoCard}>
          <Timeline>
            <TimelineItem
              tint="brand"
              marker={
                <TimelineMarker
                  tint="brand"
                  icon={<PlaceholderIcon d={ICON_INFO} />}
                />
              }
            >
              <div className={styles.eventRow}>
                <Text className={styles.eventTitle}>
                  New project &quot;Acme migration&quot; started
                </Text>
                <time
                  className={styles.eventTime}
                  dateTime="2026-05-04T14:32:00Z"
                >
                  3 min ago
                </time>
              </div>
              <p className={styles.eventBody}>
                Acme Corp · 12 service slots provisioned · auto-billing
                enabled.
              </p>
            </TimelineItem>
            <TimelineItem
              tint="success"
              marker={
                <TimelineMarker
                  tint="success"
                  icon={<PlaceholderIcon d={ICON_CHECK} />}
                />
              }
            >
              <div className={styles.eventRow}>
                <Text className={styles.eventTitle}>
                  Project milestone hit: MVP shipped
                </Text>
                <time
                  className={styles.eventTime}
                  dateTime="2026-05-04T11:14:00Z"
                >
                  3 hours ago
                </time>
              </div>
              <p className={styles.eventBody}>
                Project Alpha · production deploy passed all gates.
              </p>
            </TimelineItem>
            <TimelineItem
              tint="warning"
              marker={
                <TimelineMarker
                  tint="warning"
                  icon={<PlaceholderIcon d={ICON_ALERT} />}
                />
              }
            >
              <div className={styles.eventRow}>
                <Text className={styles.eventTitle}>
                  Storage capacity: 76% used
                </Text>
                <time
                  className={styles.eventTime}
                  dateTime="2026-05-04T08:00:00Z"
                >
                  6 hours ago
                </time>
              </div>
              <p className={styles.eventBody}>
                S3 bucket app-prod · upgrade recommended within 14 days.
              </p>
            </TimelineItem>
            <TimelineItem tint="default">
              <div className={styles.eventRow}>
                <Text className={styles.eventTitle}>
                  Status note: Q2 review scheduled
                </Text>
                <time
                  className={styles.eventTime}
                  dateTime="2026-05-03T16:00:00Z"
                >
                  Yesterday
                </time>
              </div>
              <p className={styles.eventBody}>
                Calendar invite sent to all client leads. Default neutral
                marker — informational, no status connotation.
              </p>
            </TimelineItem>
          </Timeline>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          6. Custom marker content (Avatar / Badge / widget)
        </Heading>
        <p className={styles.sectionDescription}>
          Pass <code>children</code> to <code>TimelineMarker</code> to
          replace the AND icon entirely. Useful for avatar markers
          (commit author), badge markers (priority), or custom widgets.
        </p>
        <div className={styles.demoCard}>
          <Timeline>
            <TimelineItem
              marker={
                <TimelineMarker tint="brand">
                  <span className={styles.markerInitials}>JK</span>
                </TimelineMarker>
              }
            >
              <Text className={styles.eventTitle}>
                Jan Kowalski commented on incident #4821
              </Text>
              <p className={styles.eventBody}>
                Custom marker = consumer initials (could be Avatar component).
              </p>
            </TimelineItem>
            <TimelineItem
              marker={
                <TimelineMarker tint="success">
                  <span className={styles.markerInitials}>v2</span>
                </TimelineMarker>
              }
            >
              <Text className={styles.eventTitle}>
                Released version 2.0.0
              </Text>
              <p className={styles.eventBody}>
                Custom marker = version label (could be Badge component).
              </p>
            </TimelineItem>
          </Timeline>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          7. Side-by-side compact timelines (dense layout)
        </Heading>
        <p className={styles.sectionDescription}>
          Multiple Timelines can sit side-by-side via consumer-owned grid
          layout. Each Timeline is self-contained (own connector spine,
          own marker tints).
        </p>
        <div className={styles.tintGrid}>
          <div className={styles.demoCard}>
            <Timeline>
              <TimelineItem tint="success">
                <Text className={styles.eventTitle}>Service A</Text>
                <p className={styles.eventBody}>99.9% uptime.</p>
              </TimelineItem>
              <TimelineItem tint="success">
                <Text className={styles.eventTitle}>Service B</Text>
                <p className={styles.eventBody}>99.5% uptime.</p>
              </TimelineItem>
              <TimelineItem tint="warning">
                <Text className={styles.eventTitle}>Service C</Text>
                <p className={styles.eventBody}>97.2% uptime.</p>
              </TimelineItem>
            </Timeline>
          </div>
          <div className={styles.demoCard}>
            <Timeline>
              <TimelineItem tint="brand">
                <Text className={styles.eventTitle}>v0.8.2</Text>
                <p className={styles.eventBody}>Timeline molecule.</p>
              </TimelineItem>
              <TimelineItem tint="brand">
                <Text className={styles.eventTitle}>v0.8.1</Text>
                <p className={styles.eventBody}>EdgeBar atom.</p>
              </TimelineItem>
              <TimelineItem tint="brand">
                <Text className={styles.eventTitle}>v0.8.0</Text>
                <p className={styles.eventBody}>CollapsibleZoneCard preset.</p>
              </TimelineItem>
            </Timeline>
          </div>
        </div>
      </section>
    </main>
  );
}
