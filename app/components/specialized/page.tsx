'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Dot } from '@/components/specialized/Dot';
import { MetricBar } from '@/components/specialized/MetricBar';
import { AnimatedCounter } from '@/components/specialized/AnimatedCounter';
import { Breadcrumb } from '@/components/specialized/Breadcrumb';
import { Pagination } from '@/components/specialized/Pagination';
import { UsageDonut } from '@/components/specialized/UsageDonut';
import {
  AvailabilityBar,
  type AvailabilitySegment,
  type AvailabilityStatus,
} from '@/components/specialized/AvailabilityBar';
import { Kbd } from '@/components/specialized/Kbd';
import { Button } from '@/components/interactive/Button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export default function SpecializedPlaygroundPage() {
  const [counterStart, setCounterStart] = useState(true);
  const [counterValue, setCounterValue] = useState(12500);
  const [page, setPage] = useState(1);

  const formatNumber = (n: number) => new Intl.NumberFormat('pl-PL').format(n);

  // Deterministic 30-day availability history (no RNG to avoid hydration flicker)
  const availabilityHistory = useMemo<AvailabilitySegment[]>(() => {
    const pattern: AvailabilityStatus[] = [
      'ok',
      'ok',
      'ok',
      'warning',
      'ok',
      'ok',
      'ok',
      'ok',
      'ok',
      'down',
      'warning',
      'ok',
      'ok',
      'ok',
      'ok',
      'ok',
      'ok',
      'ok',
      'warning',
      'ok',
      'ok',
      'ok',
      'ok',
      'ok',
      'ok',
      'ok',
      'down',
      'ok',
      'ok',
      'ok',
    ];
    const base = new Date('2026-03-16');
    return pattern.map((status, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return { date: d.toISOString().slice(0, 10), status };
    });
  }, []);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          Specialized
        </Heading>
        <Text className={styles.intro}>
          Fourteen focused primitives for data display and navigation — <code>Dot</code>,{' '}
          <code>MetricBar</code>, <code>AnimatedCounter</code>, <code>Breadcrumb</code>,{' '}
          <code>Pagination</code>, <code>UsageDonut</code>, <code>AvailabilityBar</code>,{' '}
          <code>Kbd</code>, <code>ThemeToggle</code>, plus the chart family <code>BarChart</code>,{' '}
          <code>LineChart</code>, <code>AreaChart</code>, <code>Sparkline</code>,{' '}
          <code>PieChart</code> (0.20.0). Each solves one problem well, composes with the rest of
          the library, and reads from the shared token system. Individual chart demos live on
          dedicated routes — link from the home index.
        </Text>
      </header>

      {/* ==================================================================== */}
      {/* DOT                                                                   */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Dot
        </Heading>
        <Text>
          Status indicator with 6 colors (aligned with Badge), 3 sizes, and an optional animation
          plus sr-only label.
        </Text>

        <div className={styles.row}>
          <span className={styles.inline}>
            <Dot color="default" /> Default
          </span>
          <span className={styles.inline}>
            <Dot color="brand" /> Brand
          </span>
          <span className={styles.inline}>
            <Dot color="success" /> Success
          </span>
          <span className={styles.inline}>
            <Dot color="warning" /> Warning
          </span>
          <span className={styles.inline}>
            <Dot color="error" /> Error
          </span>
          <span className={styles.inline}>
            <Dot color="info" /> Info
          </span>
        </div>

        <div className={styles.row}>
          <span className={styles.inline}>
            <Dot color="success" size="sm" /> sm
          </span>
          <span className={styles.inline}>
            <Dot color="success" size="md" /> md
          </span>
          <span className={styles.inline}>
            <Dot color="success" size="lg" /> lg
          </span>
        </div>

        <div className={styles.row}>
          <span className={styles.inline}>
            <Dot color="error" label="System offline" /> System offline (pulse + sr-only label)
          </span>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* METRICBAR                                                             */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          MetricBar
        </Heading>
        <Text>
          Standalone used/total indicator. Inline label row + bar.{' '}
          <code>role=&quot;progressbar&quot;</code> + clamped <code>aria-valuenow</code> +
          human-readable <code>aria-valuetext</code>.
        </Text>

        <div className={styles.metricGrid}>
          <MetricBar used={42} total={100} unit="GB" label="Disk usage" />
          <MetricBar used={1450} total={2000} unit="MB" label="Memory (RAM)" />
          <MetricBar used={87} total={100} unit="%" label="CPU (no formatter)" />
          <MetricBar
            used={12500}
            total={50000}
            unit="$"
            label="Project budget"
            formatValue={formatNumber}
          />
          <MetricBar used={150} total={100} unit="%" label="Clamp test (used > total)" />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* ANIMATEDCOUNTER                                                       */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          AnimatedCounter
        </Heading>
        <Text>
          Count-up from 0 to value via <code>requestAnimationFrame</code> with an easeOutCubic
          curve. Formats with <code>Intl.NumberFormat</code> (pl-PL by default). Respects{' '}
          <code>prefers-reduced-motion</code> (instant jump) and exposes a <code>start</code> gate
          for intersection or custom triggers.
        </Text>

        <div className={styles.row}>
          <span className={styles.big}>
            <AnimatedCounter value={counterValue} prefix="$" suffix=" PLN" start={counterStart} />
          </span>
          <span className={styles.big}>
            <AnimatedCounter value={98.5} suffix="%" decimals={1} start={counterStart} />
          </span>
          <span className={styles.big}>
            <AnimatedCounter value={145} suffix="h" start={counterStart} />
          </span>
        </div>

        <div className={styles.controls}>
          <Button variant="secondary" size="sm" onClick={() => setCounterStart((s) => !s)}>
            Toggle start ({counterStart ? 'ON' : 'OFF'})
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCounterValue((v) => v + 2500)}>
            +2500
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCounterValue(12500)}>
            Reset
          </Button>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* BREADCRUMB                                                            */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Breadcrumb
        </Heading>
        <Text>
          Semantic <code>&lt;nav&gt; + &lt;ol&gt; + &lt;li&gt;</code> navigation. The last item
          always carries <code>aria-current=&quot;page&quot;</code>. Separator slot with a default
          chevron.
        </Text>

        <div className={styles.stack}>
          <Breadcrumb
            items={[
              { label: 'Panel', href: '/panel' },
              { label: 'Projects', href: '/panel/projects' },
              { label: 'Website' },
            ]}
          />

          <Breadcrumb
            items={[
              { label: 'Home', href: '/', icon: <HomeIcon /> },
              { label: 'Services', href: '/services' },
              { label: 'Web Design', href: '/services/web-design' },
              { label: 'Portfolio' },
            ]}
            separator="/"
          />

          <Breadcrumb
            items={[
              { label: 'Root', href: '/' },
              { label: 'A', href: '/a' },
              { label: 'B', href: '/a/b' },
              { label: 'C', href: '/a/b/c' },
              { label: 'D', href: '/a/b/c/d' },
              { label: 'E', href: '/a/b/c/d/e' },
              { label: 'Current (maxItems=4)' },
            ]}
            maxItems={4}
          />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PAGINATION                                                            */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Pagination
        </Heading>
        <Text>
          Two-mode page navigation. <code>variant=&quot;full&quot;</code> renders a numbered list
          with ellipsis; <code>&quot;compact&quot;</code> shows prev/next plus &ldquo;Page X of
          Y&rdquo;. Native <code>&lt;button&gt;</code> elements with{' '}
          <code>aria-current=&quot;page&quot;</code>.
        </Text>

        <div className={styles.stack}>
          <Pagination
            currentPage={page}
            totalPages={10}
            onPageChange={setPage}
            variant="full"
            siblingCount={1}
          />

          <Pagination currentPage={page} totalPages={10} onPageChange={setPage} variant="compact" />
        </div>

        <div className={styles.controls}>
          <Button variant="secondary" size="sm" onClick={() => setPage(1)} disabled={page === 1}>
            Jump to 1
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setPage(5)}>
            Jump to 5
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setPage(10)} disabled={page === 10}>
            Jump to 10
          </Button>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* USAGEDONUT (Tier B)                                                   */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          UsageDonut <span className={styles.tierTag}>Tier B</span>
        </Heading>
        <Text>
          Multi-segment SVG donut chart. Zero deps, `stroke-dasharray` math w{' '}
          <code>viewBox 0 0 100 100</code>. <code>role=&quot;img&quot;</code> +{' '}
          <code>aria-label</code> + SVG <code>&lt;title&gt;</code>. Default color cycle brand →
          success → warning → info → error.
        </Text>

        <div className={styles.row}>
          <UsageDonut
            label="Project budget"
            size="md"
            total={60}
            segments={[
              { label: 'Design', value: 12 },
              { label: 'Development', value: 28 },
              { label: 'QA', value: 6 },
            ]}
            centerLabel={
              <>
                <strong className={styles.big}>46h</strong>
                <span>z 60h</span>
              </>
            }
          />
          <UsageDonut
            label="Storage by type"
            size="sm"
            segments={[
              { label: 'Docs', value: 42, color: 'var(--color-brand)' },
              { label: 'Media', value: 18, color: 'var(--color-warning)' },
              { label: 'Other', value: 5, color: 'var(--color-info)' },
            ]}
          />
          <UsageDonut
            label="Incident severity"
            size="lg"
            segments={[
              { label: 'Critical', value: 2 },
              { label: 'High', value: 5 },
              { label: 'Medium', value: 11 },
              { label: 'Low', value: 24 },
            ]}
            centerLabel={
              <>
                <strong className={styles.big}>42</strong>
                <span>incidents</span>
              </>
            }
          />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* AVAILABILITYBAR (Tier B)                                              */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          AvailabilityBar <span className={styles.tierTag}>Tier B</span>
        </Heading>
        <Text>
          Day-by-day status strip with native <code>title</code> tooltips on hover.{' '}
          <code>role=&quot;img&quot;</code> on the wrapper carries a computed summary. CSS Grid
          layout driven by the <code>--availability-cells</code> custom property.
        </Text>

        <div className={styles.stack}>
          <AvailabilityBar
            label="API uptime — last 30 days"
            segments={availabilityHistory}
            showLabels
          />
          <AvailabilityBar label="Service B status" segments={availabilityHistory.slice(0, 14)} />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* KBD (Tier B)                                                          */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Kbd <span className={styles.tierTag}>Tier B</span>
        </Heading>
        <Text>
          Native semantic <code>&lt;kbd&gt;</code> with outlined pill styling. Consumers pass raw
          text (Ctrl, ⌘, Enter). Combinations are composed by rendering multiple{' '}
          <code>&lt;Kbd&gt;</code> with separators on the consumer side.
        </Text>

        <div className={styles.stack}>
          <div className={styles.row}>
            <span className={styles.inline}>
              Command palette: <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>
            </span>
            <span className={styles.inline}>
              Save: <Kbd>⌘</Kbd> + <Kbd>S</Kbd>
            </span>
            <span className={styles.inline}>
              Quit: <Kbd>Esc</Kbd>
            </span>
          </div>

          <div className={styles.row}>
            <span className={styles.inline}>
              Size sm: <Kbd size="sm">Ctrl</Kbd> + <Kbd size="sm">Shift</Kbd> +{' '}
              <Kbd size="sm">P</Kbd>
            </span>
            <span className={styles.inline}>
              Function keys: <Kbd>F1</Kbd> <Kbd>F5</Kbd> <Kbd>F12</Kbd>
            </span>
            <span className={styles.inline}>
              Arrows: <Kbd>↑</Kbd> <Kbd>↓</Kbd> <Kbd>←</Kbd> <Kbd>→</Kbd>
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
