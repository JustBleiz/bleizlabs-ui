'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Dot } from '@/components/specialized/Dot';
import { MetricBar } from '@/components/specialized/MetricBar';
import { AnimatedCounter } from '@/components/specialized/AnimatedCounter';
import { Breadcrumb } from '@/components/specialized/Breadcrumb';
import { Pagination } from '@/components/specialized/Pagination';
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

  const formatNumber = (n: number) =>
    new Intl.NumberFormat('pl-PL').format(n);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          Specialized (Tier A)
        </Heading>
        <Text className={styles.intro}>
          Phase 6 (E10 Tier A) — Dot, MetricBar, AnimatedCounter, Breadcrumb,
          Pagination. Domain + navigation atoms. Tier B (UsageDonut,
          AvailabilityBar, Kbd) deferred do E11.
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
          Status indicator z 6 kolorami (spójne z Badge), 3 rozmiarami,
          opcjonalnym pulse + sr-only label.
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
            <Dot color="error" pulse label="System offline" /> System offline
            (pulse + sr-only label)
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
          <code>role=&quot;progressbar&quot;</code> + clamped{' '}
          <code>aria-valuenow</code> + human-readable{' '}
          <code>aria-valuetext</code>.
        </Text>

        <div className={styles.metricGrid}>
          <MetricBar used={42} total={100} unit="GB" label="Zużycie dysku" />
          <MetricBar used={1450} total={2000} unit="MB" label="Pamięć RAM" />
          <MetricBar
            used={87}
            total={100}
            unit="%"
            label="CPU (bez formatera)"
          />
          <MetricBar
            used={12500}
            total={50000}
            unit="zł"
            label="Budżet projektu"
            formatValue={formatNumber}
          />
          <MetricBar
            used={150}
            total={100}
            unit="%"
            label="Clamp test (used > total)"
          />
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
          Count-up 0→value via <code>requestAnimationFrame</code> +
          easeOutCubic. <code>Intl.NumberFormat</code> (pl-PL domyślnie).
          <code>prefers-reduced-motion</code> → instant jump.{' '}
          <code>start</code> gate dla intersection/custom triggerów.
        </Text>

        <div className={styles.row}>
          <span className={styles.big}>
            <AnimatedCounter
              value={counterValue}
              prefix="$"
              suffix=" PLN"
              start={counterStart}
            />
          </span>
          <span className={styles.big}>
            <AnimatedCounter
              value={98.5}
              suffix="%"
              decimals={1}
              start={counterStart}
            />
          </span>
          <span className={styles.big}>
            <AnimatedCounter value={145} suffix="h" start={counterStart} />
          </span>
        </div>

        <div className={styles.controls}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCounterStart((s) => !s)}
          >
            Toggle start ({counterStart ? 'ON' : 'OFF'})
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCounterValue((v) => v + 2500)}
          >
            +2500
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCounterValue(12500)}
          >
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
          Semantyczna nawigacja <code>&lt;nav&gt; + &lt;ol&gt; + &lt;li&gt;</code>.
          Ostatni element zawsze <code>aria-current=&quot;page&quot;</code>.
          Separator slot z default chevronem.
        </Text>

        <div className={styles.stack}>
          <Breadcrumb
            items={[
              { label: 'Panel', href: '/panel' },
              { label: 'Projekty', href: '/panel/projects' },
              { label: 'Strona WWW' },
            ]}
          />

          <Breadcrumb
            items={[
              { label: 'Home', href: '/', icon: <HomeIcon /> },
              { label: 'Usługi', href: '/services' },
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
          Dwumodalna nawigacja stron — <code>variant=&quot;full&quot;</code>{' '}
          (numerowana z ellipsisem) lub <code>&quot;compact&quot;</code>{' '}
          (prev/next + &ldquo;Page X of Y&rdquo;). Native{' '}
          <code>&lt;button&gt;</code> z <code>aria-current=&quot;page&quot;</code>
          .
        </Text>

        <div className={styles.stack}>
          <Pagination
            currentPage={page}
            totalPages={10}
            onPageChange={setPage}
            variant="full"
            siblingCount={1}
          />

          <Pagination
            currentPage={page}
            totalPages={10}
            onPageChange={setPage}
            variant="compact"
          />
        </div>

        <div className={styles.controls}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            Jump to 1
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage(5)}
          >
            Jump to 5
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage(10)}
            disabled={page === 10}
          >
            Jump to 10
          </Button>
        </div>
      </section>
    </main>
  );
}
