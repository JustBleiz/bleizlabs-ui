import Link from 'next/link';
import { BarChart } from '@/components/specialized/BarChart';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

const REVENUE_6M = [
  { label: 'Lis', value: 18400, period: '2025-11' },
  { label: 'Gru', value: 21300, period: '2025-12' },
  { label: 'Sty', value: 19200, period: '2026-01' },
  { label: 'Lut', value: 24800, period: '2026-02' },
  { label: 'Mar', value: 22100, period: '2026-03' },
  { label: 'Kwi', value: 28600, period: '2026-04' },
];

const TICKETS_5W = [
  { label: 'W14', value: 12 },
  { label: 'W15', value: 18 },
  { label: 'W16', value: 9 },
  { label: 'W17', value: 22 },
  { label: 'W18', value: 14 },
];

const MIXED_TONE = [
  { label: 'Q1', value: 1240, color: 'var(--color-success)' },
  { label: 'Q2', value: 980, color: 'var(--color-success)' },
  { label: 'Q3', value: 1410, color: 'var(--color-error)' },
  { label: 'Q4', value: 1620, color: 'var(--color-success)' },
];

const TWELVE_MONTHS = [
  { label: 'Sty', value: 4200, period: '2026-01' },
  { label: 'Lut', value: 5800, period: '2026-02' },
  { label: 'Mar', value: 6100, period: '2026-03' },
  { label: 'Kwi', value: 7200, period: '2026-04' },
  { label: 'Maj', value: 6900, period: '2026-05' },
  { label: 'Cze', value: 8100, period: '2026-06' },
  { label: 'Lip', value: 7500, period: '2026-07' },
  { label: 'Sie', value: 7000, period: '2026-08' },
  { label: 'Wrz', value: 8400, period: '2026-09' },
  { label: 'Paź', value: 9100, period: '2026-10' },
  { label: 'Lis', value: 9800, period: '2026-11' },
  { label: 'Gru', value: 10500, period: '2026-12' },
];

const formatPLN = (n: number): string =>
  n.toLocaleString('pl-PL') + ' PLN';

export default function BarChartPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          BarChart
        </Heading>
        <p className={styles.intro}>
          Single-series pure-CSS bar chart. CSS Grid + per-bar
          <code> --bar-height</code> custom property; no SVG, no chart library.
          Tone-driven default fill, optional per-datum color override, and an
          optional <code>highlightIndex</code> accent (gradient + ring +
          shadow) for marking the current period in time-series. WCAG H51
          fallback via visually-hidden <code>&lt;table&gt;</code>; per-bar
          <code> aria-label</code> announces the clamped value, the table
          mirrors the raw values.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Basic series — 6 months revenue (default tone)
        </Heading>
        <Text variant="small" color="secondary">
          No highlight, no custom format, default <code>tone=&quot;brand&quot;</code>
          and 200px height.
        </Text>
        <div className={styles.frame}>
          <BarChart
            data={REVENUE_6M}
            caption="Przychód brutto, ostatnie 6 miesięcy"
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Highlight current period (RevenueBarChart promotion case)
        </Heading>
        <Text variant="small" color="secondary">
          <code>highlightIndex={'{'}5{'}'}</code> marks April with the gradient
          + ring accent — replaces RevenueBarChart&apos;s last-bar pattern.
        </Text>
        <div className={styles.frame}>
          <BarChart
            data={REVENUE_6M}
            caption="Przychód brutto z wyróżnieniem bieżącego miesiąca"
            highlightIndex={5}
            formatValue={formatPLN}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Tone variants
        </Heading>
        <Text variant="small" color="secondary">
          5 tones mirror the UsageDonut DEFAULT_COLORS palette. Highlight is
          rendered identically across tones (gradient + ring + shadow);
          chromatic identity stays per-tone.
        </Text>
        <div className={styles.toneGrid}>
          <div className={styles.frame}>
            <Heading level={3} size="md">
              brand
            </Heading>
            <BarChart
              data={TICKETS_5W}
              caption="Tickets per week (brand)"
              tone="brand"
              highlightIndex={3}
            />
          </div>
          <div className={styles.frame}>
            <Heading level={3} size="md">
              success
            </Heading>
            <BarChart
              data={TICKETS_5W}
              caption="Tickets per week (success)"
              tone="success"
              highlightIndex={3}
            />
          </div>
          <div className={styles.frame}>
            <Heading level={3} size="md">
              warning
            </Heading>
            <BarChart
              data={TICKETS_5W}
              caption="Tickets per week (warning)"
              tone="warning"
              highlightIndex={3}
            />
          </div>
          <div className={styles.frame}>
            <Heading level={3} size="md">
              info
            </Heading>
            <BarChart
              data={TICKETS_5W}
              caption="Tickets per week (info)"
              tone="info"
              highlightIndex={3}
            />
          </div>
          <div className={styles.frame}>
            <Heading level={3} size="md">
              error
            </Heading>
            <BarChart
              data={TICKETS_5W}
              caption="Tickets per week (error)"
              tone="error"
              highlightIndex={3}
            />
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. Per-datum color override (mixed tone)
        </Heading>
        <Text variant="small" color="secondary">
          <code>datum.color</code> wins over <code>tone</code>. Useful for
          good/bad coloring without splitting the chart.
        </Text>
        <div className={styles.frame}>
          <BarChart
            data={MIXED_TONE}
            caption="Quarterly NPS shift — green=up, red=down"
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. Explicit max (clamps values above ceiling)
        </Heading>
        <Text variant="small" color="secondary">
          <code>max=20000</code> caps visual height; the AT table still
          announces raw values (28 600 for April).
        </Text>
        <div className={styles.frame}>
          <BarChart
            data={REVENUE_6M}
            caption="Przychód brutto z explicit max=20000"
            max={20000}
            formatValue={formatPLN}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          6. Compact height (sparkline-ish, 120px)
        </Heading>
        <div className={styles.frame}>
          <BarChart
            data={TICKETS_5W}
            caption="Tickets per week, compact height"
            height={120}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          7. Wide series with horizontal scroll (consumer min-width)
        </Heading>
        <Text variant="small" color="secondary">
          Consumer owns the scroll wrapper for narrow viewports.
        </Text>
        <div className={styles.frame}>
          <div className={styles.scrollWrap}>
            <div className={styles.scrollInner}>
              <BarChart
                data={TWELVE_MONTHS}
                caption="Przychód brutto, 12 miesięcy"
                highlightIndex={11}
                formatValue={formatPLN}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          8. Empty state
        </Heading>
        <div className={styles.frame}>
          <BarChart data={[]} caption="No data yet" />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          9. Localized AT table headers
        </Heading>
        <Text variant="small" color="secondary">
          <code>periodLabel</code> + <code>valueLabel</code> drive the
          screen-reader table headers (default <code>&apos;Period&apos; / &apos;Value&apos;</code>
          ).
        </Text>
        <div className={styles.frame}>
          <BarChart
            data={REVENUE_6M}
            caption="Przychód brutto, polskie nagłówki dla AT"
            periodLabel="Okres"
            valueLabel="Wartość (PLN)"
            formatValue={formatPLN}
          />
        </div>
      </section>
    </main>
  );
}
