import { Sparkline } from '@/components/specialized/Sparkline';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import { Stack } from '@/components/layout/Stack';
import { Card, CardBody } from '@/components/display/Card';
import { Badge } from '@/components/display/Badge';
import { KpiValue } from '@/components/display/KpiValue';
import styles from './page.module.scss';

// Demo data ───────────────────────────────────────────────────────────────

const last7DaysSessions = [120, 135, 128, 152, 165, 158, 178];
const escalation30d = [
  4, 6, 3, 5, 8, 7, 9, 12, 10, 8, 11, 13, 15, 14, 12, 16, 18, 17, 15, 19, 21, 20, 23, 22, 25, 28, 26, 30, 32, 31,
];
const declining = [88, 82, 75, 70, 66, 60, 55, 48, 40, 35, 30, 22];
const flatish = [100, 102, 98, 101, 99, 100, 103, 100, 99, 101];
const revenueWithDip = [200, 220, 215, 240, 180, 195, 220, 250, 245, 270, 290, 310];

export const metadata = {
  title: 'Sparkline — @bleizlabs/ui',
};

export default function SparklinePlayground() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          Sparkline
        </Heading>
        <Text color="secondary">
          Tiny inline single-series chart (line + optional filled area) for
          embedding in <code>&lt;Card&gt;</code>, table cells, KPI tiles,
          dense dashboards. Strips axes / tooltip / keyboard nav — preserves
          sr-only <code>&lt;table&gt;</code> a11y fallback. Zero external
          deps. Imports math from <code>specialized/_shared/chart-math</code>{' '}
          (shared with LineChart + AreaChart).
        </Text>
        <Inline gap={2} wrap>
          <Badge color="info">specialized/Sparkline</Badge>
          <Badge color="success">0.20.0</Badge>
          <Badge>Zero deps</Badge>
        </Inline>
      </header>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Basic">
        <Heading level={2} size="lg">
          1. Basic — smooth line, 7 daily values
        </Heading>
        <Text color="secondary">
          Default smooth Catmull-Rom interpolation, brand color, no fill.
          AT users get the sr-only <code>&lt;table&gt;</code>.
        </Text>
        <div className={styles.demo}>
          <div className={styles.spark100}>
            <Sparkline title="7-day session trend" data={last7DaysSessions} />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Area + gradient">
        <Heading level={2} size="lg">
          2. Area + gradient fade (report-style)
        </Heading>
        <Text color="secondary">
          <code>area</code> + <code>gradient</code> renders the &quot;sparkline
          / report&quot; pattern — series color at peak fading to transparent
          at the baseline.
        </Text>
        <div className={styles.demo}>
          <div className={styles.spark100}>
            <Sparkline
              title="Bot escalation 30 days"
              description="Daily escalation count, last 30 days"
              data={escalation30d}
              color="var(--color-error)"
              area
              gradient
              fillOpacity={0.35}
            />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="KPI lockup">
        <Heading level={2} size="lg">
          3. KPI tile lockup — value + sparkline + delta
        </Heading>
        <Text color="secondary">
          Canonical sparkline placement: next to a numeric KPI, providing the
          &quot;direction signal&quot;. Width auto-fills the parent container;
          consumer sets the height via <code>aspectRatio</code> or explicit{' '}
          <code>style.height</code>.
        </Text>
        <div className={styles.demo}>
          <Inline gap={6} wrap>
            <Card padding={5} radius="md">
              <CardBody>
                <Stack gap={2}>
                  <Text variant="caption" color="muted">
                    Sesje (ostatnie 7 dni)
                  </Text>
                  <KpiValue value="1,036" trend={{ direction: 'up', label: '+12%' }} />
                  <div className={styles.sparkInline}>
                    <Sparkline
                      title="Sesje 7d"
                      data={last7DaysSessions}
                      color="var(--color-success)"
                      area
                      gradient
                      aspectRatio={5}
                    />
                  </div>
                </Stack>
              </CardBody>
            </Card>

            <Card padding={5} radius="md">
              <CardBody>
                <Stack gap={2}>
                  <Text variant="caption" color="muted">
                    Escalation (30 dni)
                  </Text>
                  <KpiValue value="28%" trend={{ direction: 'up', label: '+8 pp' }} />
                  <div className={styles.sparkInline}>
                    <Sparkline
                      title="Escalation 30d"
                      data={escalation30d}
                      color="var(--color-error)"
                      area
                      gradient
                      aspectRatio={5}
                    />
                  </div>
                </Stack>
              </CardBody>
            </Card>

            <Card padding={5} radius="md">
              <CardBody>
                <Stack gap={2}>
                  <Text variant="caption" color="muted">
                    Konwersja (3 mies.)
                  </Text>
                  <KpiValue value="3.4%" trend={{ direction: 'down', label: '−0.5 pp' }} />
                  <div className={styles.sparkInline}>
                    <Sparkline
                      title="Konwersja 3 mies."
                      data={declining}
                      color="var(--color-warning)"
                      area
                      gradient
                      aspectRatio={5}
                    />
                  </div>
                </Stack>
              </CardBody>
            </Card>
          </Inline>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Trend variants">
        <Heading level={2} size="lg">
          4. Trend variants — up / down / flat / dip
        </Heading>
        <Text color="secondary">
          Four data shapes side-by-side. Consumer colors each via{' '}
          <code>color</code> prop based on its own trend-detection rule
          (positive / negative / neutral).
        </Text>
        <div className={styles.demo}>
          <div className={styles.grid4}>
            <div>
              <Text variant="caption" color="muted">Up</Text>
              <Sparkline title="Trend up" data={last7DaysSessions} color="var(--color-success)" area gradient />
            </div>
            <div>
              <Text variant="caption" color="muted">Down</Text>
              <Sparkline title="Trend down" data={declining} color="var(--color-error)" area gradient />
            </div>
            <div>
              <Text variant="caption" color="muted">Flat</Text>
              <Sparkline title="Trend flat" data={flatish} color="var(--color-text-secondary)" />
            </div>
            <div>
              <Text variant="caption" color="muted">Dip + recovery</Text>
              <Sparkline title="Dip then recovery" data={revenueWithDip} color="var(--color-info)" area />
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Linear">
        <Heading level={2} size="lg">
          5. Linear interpolation
        </Heading>
        <Text color="secondary">
          <code>interpolation=&quot;linear&quot;</code> renders polyline (no
          curve smoothing). Cleaner read for spiky data.
        </Text>
        <div className={styles.demo}>
          <div className={styles.spark100}>
            <Sparkline
              title="Spiky daily counts"
              data={escalation30d}
              interpolation="linear"
              color="var(--color-brand)"
            />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Empty + degenerate">
        <Heading level={2} size="lg">
          6. Empty + single-point states
        </Heading>
        <Text color="secondary">
          Empty array renders default &quot;—&quot; placeholder + empty
          sr-only table. Single value renders horizontal stroke at that
          value.
        </Text>
        <div className={styles.demo}>
          <Inline gap={6} wrap>
            <div className={styles.spark100}>
              <Text variant="caption" color="muted">Empty</Text>
              <Sparkline title="No data yet" data={[]} />
            </div>
            <div className={styles.spark100}>
              <Text variant="caption" color="muted">Single value</Text>
              <Sparkline title="Single datum" data={[42]} color="var(--color-info)" area />
            </div>
          </Inline>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Animation off">
        <Heading level={2} size="lg">
          7. Animation off (<code>animate=false</code>)
        </Heading>
        <Text color="secondary">
          Disable path-draw + fill fade-in for static report contexts (PDF
          export, print preview). <code>prefers-reduced-motion: reduce</code>{' '}
          also suppresses animation regardless of this prop.
        </Text>
        <div className={styles.demo}>
          <div className={styles.spark100}>
            <Sparkline
              title="Static report — no animation"
              data={last7DaysSessions}
              area
              gradient
              animate={false}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
