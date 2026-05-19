'use client';

import { useState } from 'react';
import { AreaChart } from '@/components/specialized/AreaChart';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import { Badge } from '@/components/display/Badge';
import { Button } from '@/components/interactive/Button';
import styles from './page.module.scss';

// Demo data sets ─────────────────────────────────────────────────────────

const weeklyLeads = Array.from({ length: 12 }, (_, i) => ({
  x: i + 1,
  y: 50 + Math.round(Math.sin(i * 0.7) * 25 + i * 8),
  label: `Week ${i + 1}`,
}));

const linkedinWeekly = Array.from({ length: 12 }, (_, i) => ({
  x: i + 1,
  y: 12 + Math.round(Math.cos(i * 0.5) * 5 + i * 1.5),
  label: `Week ${i + 1}`,
}));
const coldEmailWeekly = Array.from({ length: 12 }, (_, i) => ({
  x: i + 1,
  y: 8 + Math.round(Math.sin(i * 0.9) * 4 + i * 0.8),
  label: `Week ${i + 1}`,
}));
const partnerWeekly = Array.from({ length: 12 }, (_, i) => ({
  x: i + 1,
  y: 3 + Math.round(Math.cos(i * 0.4) * 2 + i * 0.4),
  label: `Week ${i + 1}`,
}));

const monthlyMWh = Array.from({ length: 24 }, (_, i) => {
  // UTC midnight to avoid Node/Chromium Intl variance during SSR/hydration.
  const date = new Date(Date.UTC(2024, i, 1));
  return {
    x: date,
    y: 400 + Math.round(Math.sin(i * 0.5) * 80 + i * 3),
  };
});

const revenueGrowth = [
  { x: 1, y: -60, label: 'Jan' },
  { x: 2, y: -20, label: 'Feb' },
  { x: 3, y: 40, label: 'Mar' },
  { x: 4, y: 120, label: 'Apr' },
  { x: 5, y: 80, label: 'May' },
  { x: 6, y: 180, label: 'Jun' },
  { x: 7, y: 260, label: 'Jul' },
  { x: 8, y: -40, label: 'Aug' },
  { x: 9, y: 220, label: 'Sep' },
  { x: 10, y: 280, label: 'Oct' },
];

export default function AreaChartPlayground() {
  const [selected, setSelected] = useState<{ seriesId: string; idx: number } | null>(null);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          AreaChart
        </Heading>
        <Text color="secondary">
          Multi-series SVG area chart with line stroke + filled region below, crosshair tooltip,
          keyboard data-point navigation, and sr-only <code>&lt;table&gt;</code> a11y fallback. Zero
          external deps. Same API surface as <code>LineChart</code> plus <code>fillOpacity</code> +{' '}
          <code>gradient</code> visual axes. Stacked variant deferred to a 0.20.x follow-up.
        </Text>
        <Inline gap={2} wrap>
          <Badge color="info">specialized/AreaChart</Badge>
          <Badge color="success">0.20.0</Badge>
          <Badge>Zero deps</Badge>
        </Inline>
      </header>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Basic single-series smooth">
        <Heading level={2} size="lg">
          1. Basic single-series (smooth interpolation, default fill)
        </Heading>
        <Text color="secondary">
          12 weekly values, smooth Catmull-Rom interpolation, default
          <code> fillOpacity=0.3</code> brand color fill below the line.
        </Text>
        <div className={styles.demo}>
          <AreaChart
            title="Weekly leads"
            description="12 weeks of lead intake"
            series={[{ name: 'Leads', data: weeklyLeads }]}
          />
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Multi-series overlapping">
        <Heading level={2} size="lg">
          2. Multi-series (3 series) — overlapping semi-transparent fills
        </Heading>
        <Text color="secondary">
          Three lead sources, linear interpolation, <code>fillOpacity=0.25</code> so overlapping
          regions stay readable. Crosshair tooltip shows all three values at the hovered/focused X.
        </Text>
        <div className={styles.demo}>
          <AreaChart
            title="Lead source comparison"
            description="Last 12 weeks, weekly counts per source"
            interpolation="linear"
            fillOpacity={0.25}
            series={[
              { id: 'linkedin', name: 'LinkedIn', data: linkedinWeekly },
              {
                id: 'cold-email',
                name: 'Cold email',
                data: coldEmailWeekly,
                color: 'var(--color-success)',
              },
              {
                id: 'partner',
                name: 'Partner',
                data: partnerWeekly,
                color: 'var(--color-warning)',
              },
            ]}
          />
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Gradient fade">
        <Heading level={2} size="lg">
          3. Gradient fill — fade to baseline (<code>gradient</code>)
        </Heading>
        <Text color="secondary">
          When <code>gradient=true</code> the fill renders as a vertical linear gradient from series
          color (top of area) to transparent (baseline) — the &quot;sparkline / report&quot; report
          look. <code>fillOpacity</code> scales the top stop intensity.
        </Text>
        <div className={styles.demo}>
          <AreaChart
            title="Weekly leads (gradient)"
            description="12 weeks of lead intake"
            series={[{ name: 'Leads', data: weeklyLeads }]}
            gradient
            fillOpacity={0.35}
          />
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Time axis with Date">
        <Heading level={2} size="lg">
          4. Time axis — Date values + locale-aware tick format
        </Heading>
        <Text color="secondary">
          24 monthly MWh values over 2024-2025. X values are JS <code>Date</code> objects; consumer
          formats ticks via <code>xAxis.tickFormat</code>.
        </Text>
        <div className={styles.demo}>
          <AreaChart
            title="Monthly MWh delivered"
            description="24 months rolling window"
            series={[{ name: 'MWh', data: monthlyMWh }]}
            gradient
            xAxis={{
              tickFormat: (v) => {
                const months = [
                  'sty',
                  'lut',
                  'mar',
                  'kwi',
                  'maj',
                  'cze',
                  'lip',
                  'sie',
                  'wrz',
                  'paź',
                  'lis',
                  'gru',
                ];
                const d = v instanceof Date ? v : typeof v === 'number' ? new Date(v) : null;
                if (!d) return String(v);
                return `${months[d.getUTCMonth()]} ${String(d.getUTCFullYear() % 100).padStart(2, '0')}`;
              },
            }}
          />
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Negative + zero crossing">
        <Heading level={2} size="lg">
          5. Negative values + zero-crossing baseline
        </Heading>
        <Text color="secondary">
          Revenue growth with values from -60 to +280. Y-axis auto-includes zero baseline; area
          renders both above (filled toward zero) and below (filled downward from zero). Baseline =
          0 when domain spans both signs.
        </Text>
        <div className={styles.demo}>
          <AreaChart
            title="Revenue growth (% YoY)"
            description="10 monthly snapshots"
            series={[{ name: 'Growth %', data: revenueGrowth }]}
          />
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Empty state">
        <Heading level={2} size="lg">
          6. Empty state (default render)
        </Heading>
        <Text color="secondary">
          When series is <code>[]</code> the lib renders a default &quot;No data&quot; message.
          Sr-only <code>&lt;table&gt;</code> still renders with caption + headers (empty tbody).
        </Text>
        <div className={styles.demo}>
          <AreaChart title="No data available" series={[]} />
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Custom tooltip">
        <Heading level={2} size="lg">
          7. Custom tooltip via <code>renderTooltip</code> slot
        </Heading>
        <Text color="secondary">
          Override the default tooltip body. The slot receives a full context with focused point +
          all-series-at-X for &quot;crosshair&quot; style comparisons.
        </Text>
        <div className={styles.demo}>
          <AreaChart
            title="Weekly leads (custom tooltip)"
            series={[{ name: 'Leads', data: weeklyLeads }]}
            gradient
            renderTooltip={(ctx) => (
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {ctx.datum.label ?? String(ctx.datum.x)}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: ctx.color }}>
                  {ctx.datum.y}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  leads from {ctx.seriesName}
                </div>
              </div>
            )}
          />
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Interactive onPointClick">
        <Heading level={2} size="lg">
          8. Interactive — <code>onPointClick</code> callback
        </Heading>
        <Text color="secondary">
          Click a data point (or press Space/Enter on focused point) to fire the callback. Use case:
          drill-down navigation, lock tooltip, external filter state.
        </Text>
        <div className={styles.demo}>
          <AreaChart
            title="Click points to filter"
            series={[
              { id: 'linkedin', name: 'LinkedIn', data: linkedinWeekly },
              {
                id: 'cold-email',
                name: 'Cold email',
                data: coldEmailWeekly,
                color: 'var(--color-success)',
              },
            ]}
            fillOpacity={0.2}
            onPointClick={(seriesId, idx) => setSelected({ seriesId, idx })}
          />
          <Inline gap={3} className={styles.controls}>
            <Text variant="small" color="secondary">
              {selected
                ? `Selected: ${selected.seriesId}, point #${selected.idx + 1}`
                : 'Click a data point or focus + Space/Enter'}
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
      <section className={styles.section} aria-label="Animation off">
        <Heading level={2} size="lg">
          9. Animation off (<code>animate=false</code> for static reports)
        </Heading>
        <Text color="secondary">
          Disable path-draw + fill fade-in for PDF export / print preview.{' '}
          <code>prefers-reduced-motion: reduce</code> ALSO suppresses animation regardless of this
          prop.
        </Text>
        <div className={styles.demo}>
          <AreaChart
            title="Static report — no animation"
            series={[{ name: 'MWh', data: monthlyMWh.slice(0, 12) }]}
            gradient
            animate={false}
          />
        </div>
      </section>
    </main>
  );
}
