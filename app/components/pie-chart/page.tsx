'use client';

import { useState } from 'react';
import { PieChart, type PieChartDatum } from '@/components/specialized/PieChart';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import { Stack } from '@/components/layout/Stack';
import { Badge } from '@/components/display/Badge';
import { Button } from '@/components/interactive/Button';
import { Card, CardBody } from '@/components/display/Card';
import styles from './page.module.scss';

// Demo data ───────────────────────────────────────────────────────────────

const leadSources: PieChartDatum[] = [
  { name: 'LinkedIn', value: 45 },
  { name: 'Cold email', value: 30 },
  { name: 'Partner', value: 25 },
];

const trafficShare: PieChartDatum[] = [
  { name: 'Organic', value: 4200 },
  { name: 'Paid social', value: 1800 },
  { name: 'Direct', value: 1200 },
  { name: 'Referral', value: 650 },
  { name: 'Email', value: 350 },
];

const timeAllocation: PieChartDatum[] = [
  { name: 'Dev', value: 18, color: 'var(--color-brand)' },
  { name: 'Design', value: 8, color: 'var(--color-info)' },
  { name: 'Calls', value: 4, color: 'var(--color-warning)' },
  { name: 'Admin', value: 2, color: 'var(--color-error)' },
];

const totalHours = timeAllocation.reduce((acc, d) => acc + d.value, 0);

const longTail: PieChartDatum[] = [
  { name: 'Bot escalation', value: 62 },
  { name: 'Manual review', value: 18 },
  { name: 'Auto-closed', value: 12 },
  { name: 'Spam filter', value: 5 },
  { name: 'Other', value: 3 },
];

const singleSegment: PieChartDatum[] = [{ name: 'Only category', value: 100 }];

export default function PieChartPlayground() {
  const [selected, setSelected] = useState<{ name: string; idx: number } | null>(null);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          PieChart
        </Heading>
        <Text color="secondary">
          SVG pie chart with optional donut variant, segment hover +
          keyboard navigation, optional on-segment percentage labels, and
          sr-only <code>&lt;table&gt;</code> a11y fallback. Pie semantics
          = categorical composition (full 360°), complementing{' '}
          <code>UsageDonut</code> (partial progress with visible remainder).
          Zero external deps.
        </Text>
        <Inline gap={2} wrap>
          <Badge color="info">specialized/PieChart</Badge>
          <Badge color="success">0.20.0</Badge>
          <Badge>Zero deps</Badge>
        </Inline>
      </header>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Basic pie">
        <Heading level={2} size="lg">
          1. Basic pie — 3 segments, default colors
        </Heading>
        <Text color="secondary">
          Three lead sources, default brand-family colors cycle. Hover or
          Tab → Arrow keys to navigate segments. Tooltip shows name + value
          + percentage at segment midpoint.
        </Text>
        <div className={styles.demo}>
          <div className={styles.chartBox}>
            <PieChart
              title="Lead source breakdown"
              description="Last 30 days, 3 sources"
              data={leadSources}
            />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Donut variant + center label">
        <Heading level={2} size="lg">
          2. Donut variant + center label
        </Heading>
        <Text color="secondary">
          <code>variant=&quot;donut&quot;</code> renders an annulus with inner
          hole at 60% of outer radius. <code>centerLabel</code> slot accepts
          any ReactNode — consumer composes own typography for the center
          summary.
        </Text>
        <div className={styles.demo}>
          <div className={styles.chartBox}>
            <PieChart
              title="Time allocation (donut)"
              description="Hours allocated this week, 4 categories"
              variant="donut"
              data={timeAllocation}
              centerLabel={
                <Stack gap={0}>
                  <Text variant="caption" color="muted">Total</Text>
                  <Heading level={3} size="lg">{totalHours}h</Heading>
                </Stack>
              }
            />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Show labels">
        <Heading level={2} size="lg">
          3. On-segment percentage labels (<code>showLabels</code>)
        </Heading>
        <Text color="secondary">
          When <code>showLabels</code> is set, segments with ≥10% share
          render their percentage on the segment midline. Smaller slices
          auto-hide to avoid label collision (leader-line labels for small
          slices deferred to 0.20.x).
        </Text>
        <div className={styles.demo}>
          <Inline gap={6} wrap>
            <div className={styles.chartBox}>
              <Text variant="caption" color="muted">Pie + labels</Text>
              <PieChart
                title="Traffic share by source"
                data={trafficShare}
                showLabels
              />
            </div>
            <div className={styles.chartBox}>
              <Text variant="caption" color="muted">Donut + labels</Text>
              <PieChart
                title="Traffic share (donut)"
                variant="donut"
                data={trafficShare}
                showLabels
                centerLabel={
                  <Stack gap={0}>
                    <Text variant="caption" color="muted">Total visits</Text>
                    <Heading level={3} size="lg">
                      {trafficShare.reduce((a, d) => a + d.value, 0).toLocaleString()}
                    </Heading>
                  </Stack>
                }
              />
            </div>
          </Inline>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Long tail">
        <Heading level={2} size="lg">
          4. Long-tail distribution (5 segments, small slices auto-hide labels)
        </Heading>
        <Text color="secondary">
          Five segments with a long tail (62% / 18% / 12% / 5% / 3%). With{' '}
          <code>showLabels</code>, the bottom two segments (5%, 3%) skip
          their labels to avoid collision; tooltip + sr-only table still
          carry the value.
        </Text>
        <div className={styles.demo}>
          <div className={styles.chartBox}>
            <PieChart
              title="Ticket outcomes 30 days"
              variant="donut"
              data={longTail}
              showLabels
              centerLabel={
                <Stack gap={0}>
                  <Text variant="caption" color="muted">Bot escalation</Text>
                  <Heading level={3} size="lg">62%</Heading>
                </Stack>
              }
            />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Interactive">
        <Heading level={2} size="lg">
          5. Interactive — <code>onSegmentClick</code> callback
        </Heading>
        <Text color="secondary">
          Click a segment (or press Space/Enter on a focused segment) to
          fire the callback. Tab → Arrow Right/Down → cycle segments, Home
          / End jump first / last, Escape dismiss pinned tooltip.
        </Text>
        <div className={styles.demo}>
          <div className={styles.chartBox}>
            <PieChart
              title="Click a segment to filter"
              variant="donut"
              data={leadSources}
              showLabels
              onSegmentClick={(seg, idx) => setSelected({ name: seg.name, idx })}
              centerLabel={
                <Stack gap={0}>
                  <Text variant="caption" color="muted">Click to filter</Text>
                  <Heading level={3} size="lg">{selected ? selected.name : '—'}</Heading>
                </Stack>
              }
            />
          </div>
          <Inline gap={3} className={styles.controls}>
            <Text variant="small" color="secondary">
              {selected
                ? `Selected: ${selected.name} (segment #${selected.idx + 1})`
                : 'Click a segment or focus + Space/Enter'}
            </Text>
            {selected && (
              <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>
                Reset
              </Button>
            )}
          </Inline>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Edge cases">
        <Heading level={2} size="lg">
          6. Edge cases — single + empty
        </Heading>
        <Text color="secondary">
          Single segment renders as a full circle (no division). Empty data
          renders default &quot;No data&quot; placeholder + empty sr-only
          table (with caption + headers).
        </Text>
        <div className={styles.demo}>
          <Inline gap={6} wrap>
            <div className={styles.chartBox}>
              <Text variant="caption" color="muted">Single 100% segment</Text>
              <PieChart title="One category only" data={singleSegment} />
            </div>
            <div className={styles.chartBox}>
              <Text variant="caption" color="muted">Single segment, donut</Text>
              <PieChart
                title="One category (donut)"
                variant="donut"
                data={singleSegment}
                centerLabel={<Heading level={3} size="lg">100%</Heading>}
              />
            </div>
            <div className={styles.chartBox}>
              <Text variant="caption" color="muted">Empty</Text>
              <PieChart title="No data yet" data={[]} />
            </div>
          </Inline>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Custom tooltip">
        <Heading level={2} size="lg">
          7. Custom tooltip via <code>renderTooltip</code> slot
        </Heading>
        <Text color="secondary">
          Override the default tooltip body. The slot receives the full
          context: datum + color + segmentIndex + ratio + percent + total.
        </Text>
        <div className={styles.demo}>
          <div className={styles.chartBox}>
            <PieChart
              title="Lead sources (custom tooltip)"
              variant="donut"
              data={leadSources}
              renderTooltip={(ctx) => (
                <div style={{ textAlign: 'center', minWidth: 120 }}>
                  <div style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--color-text-muted)',
                  }}>
                    {ctx.datum.name}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, color: ctx.color }}>
                    {ctx.datum.value}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {Math.round(ctx.percent)}% of {ctx.total}
                  </div>
                </div>
              )}
              centerLabel={
                <Card padding={3} radius="sm">
                  <CardBody>
                    <Text variant="caption" color="muted">Hover or focus a slice</Text>
                  </CardBody>
                </Card>
              }
            />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Animation off">
        <Heading level={2} size="lg">
          8. Animation off (<code>animate=false</code>)
        </Heading>
        <Text color="secondary">
          Disable enter-fade animation for static report contexts (PDF
          export, print preview). <code>prefers-reduced-motion: reduce</code>{' '}
          also suppresses animation regardless of this prop.
        </Text>
        <div className={styles.demo}>
          <div className={styles.chartBox}>
            <PieChart
              title="Static report — no animation"
              variant="donut"
              data={trafficShare}
              showLabels
              animate={false}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
