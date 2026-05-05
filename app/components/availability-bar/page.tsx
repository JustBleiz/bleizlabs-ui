import Link from 'next/link';
import {
  AvailabilityBar,
  type AvailabilitySegment,
  type AvailabilityStatus,
} from '@/components/specialized/AvailabilityBar';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

function buildMonth(year: number, month: number, days: number, overrides: Record<number, AvailabilityStatus> = {}): AvailabilitySegment[] {
  return Array.from({ length: days }, (_, i) => ({
    date: `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
    status: overrides[i + 1] ?? 'ok',
  }));
}

const PERFECT_MONTH: AvailabilitySegment[] = buildMonth(2026, 4, 30);

const INCIDENT_MONTH: AvailabilitySegment[] = buildMonth(2026, 4, 30, {
  9: 'warning',
  17: 'down',
  23: 'warning',
});

const DEGRADED_MONTH: AvailabilitySegment[] = buildMonth(2026, 4, 30, {
  3: 'down',
  4: 'down',
  5: 'warning',
  10: 'down',
  11: 'down',
  12: 'down',
  18: 'warning',
  19: 'warning',
  25: 'down',
});

const SEVEN_DAY_STRIP: AvailabilitySegment[] = buildMonth(2026, 4, 7, {
  3: 'warning',
  6: 'ok',
});

const NINETY_DAY_STRIP: AvailabilitySegment[] = Array.from({ length: 90 }, (_, i) => {
  const day = i + 1;
  const month = day <= 30 ? 2 : day <= 59 ? 3 : 4;
  const dayInMonth = day <= 30 ? day : day <= 59 ? day - 30 : day - 59;
  let status: AvailabilityStatus = 'ok';
  if (day === 12 || day === 47 || day === 71) status = 'warning';
  if (day === 33 || day === 80) status = 'down';
  return {
    date: `2026-${String(month).padStart(2, '0')}-${String(dayInMonth).padStart(2, '0')}`,
    status,
  };
});

export default function AvailabilityBarPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← back</Link>
        <Heading level={1} size="4xl">AvailabilityBar</Heading>
        <p className={styles.intro}>
          Day-by-day status strip for uptime / availability dashboards. Statuses: `&apos;ok&apos;`
          green, `&apos;warning&apos;` yellow, `&apos;down&apos;` red. Outer wrapper is `role=&quot;img&quot;`
          with auto-built summary aria-label; inner cells use native `title` for hover tooltips.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">1. Default — 30-day perfect uptime</Heading>
        <Text variant="caption" color="muted">
          All segments `ok`. Hover any cell to see the date in a native tooltip.
        </Text>
        <div className={styles.barWrap}>
          <AvailabilityBar
            label="API uptime — last 30 days"
            segments={PERFECT_MONTH}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">2. With incidents — mostly ok</Heading>
        <Text variant="caption" color="muted">
          30-day window with 2 warning days and 1 down day. The auto-built aria-label summarizes
          the counts for screen readers.
        </Text>
        <div className={styles.barWrap}>
          <AvailabilityBar
            label="Checkout API — last 30 days"
            segments={INCIDENT_MONTH}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">3. Mostly down — degraded service</Heading>
        <Text variant="caption" color="muted">
          Worst-case visualization showing a service in distress. Same component, different data —
          color contrast carries the story without changing the API.
        </Text>
        <div className={styles.barWrap}>
          <AvailabilityBar
            label="Legacy import worker — last 30 days"
            segments={DEGRADED_MONTH}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">4. With showLabels — first / last date visible</Heading>
        <Text variant="caption" color="muted">
          `showLabels` renders the first and last date text under the strip. Middle cells keep
          only the native `title` tooltip — avoids label clutter.
        </Text>
        <div className={styles.barWrap}>
          <AvailabilityBar
            label="Webhook delivery — last 30 days"
            segments={INCIDENT_MONTH}
            showLabels
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">5. Custom segment count — 7-day and 90-day</Heading>
        <Text variant="caption" color="muted">
          The `--availability-cells` channel scales the grid for any segment count. Below: a
          7-day weekly strip and a 90-day quarterly strip from the same component.
        </Text>
        <div className={styles.stackedBars}>
          <AvailabilityBar
            label="Worker uptime — last 7 days"
            segments={SEVEN_DAY_STRIP}
            showLabels
          />
          <AvailabilityBar
            label="Edge cache — last 90 days"
            segments={NINETY_DAY_STRIP}
            showLabels
          />
        </div>
      </section>
    </main>
  );
}
