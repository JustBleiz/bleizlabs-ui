import Link from 'next/link';
import { CollapsibleZoneCard } from '@/components/presets/CollapsibleZoneCard';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Badge } from '@/components/display/Badge';
import { ControlledExample } from './_components/ControlledExample';
import { FormWrappedExample } from './_components/FormWrappedExample';
import { ForceMountExample } from './_components/ForceMountExample';
import { NestedExample } from './_components/NestedExample';
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

const ICON_WALLET = 'M3 7h18v12H3zM3 7l3-3h12l3 3M16 12h2';
const ICON_TRENDING_UP =
  'M3 17l6-6 4 4 8-8M14 7h7v7';
const ICON_DATABASE = 'M3 5a9 3 0 0018 0M3 5a9 3 0 0118 0v14a9 3 0 01-18 0V5';
const ICON_NETWORK =
  'M9 12h6m-3-3v6M3 9a3 3 0 016 0v6a3 3 0 11-6 0V9zm12 0a3 3 0 016 0v6a3 3 0 11-6 0V9z';
const ICON_FILTER =
  'M3 5h18M6 12h12M10 19h4';

export default function CollapsibleZoneCardPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          CollapsibleZoneCard
        </Heading>
        <p className={styles.intro}>
          Universal collapsible info card preset (CP10 — Phase 8 Card
          presets). Sister to <code>ZoneCard</code> CP9 — adds APG{' '}
          <a href="https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/">
            disclosure pattern
          </a>{' '}
          state machinery (controlled + uncontrolled), summary chip slot,
          chevron toggle, and grid-template-rows expand/collapse animation
          (respects <code>prefers-reduced-motion</code>). Promoted v0.8.0 from
          panel_v2 driving consumers (FinancialBreakdown +
          ProjectsFinancialOverview).
        </p>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          1. Minimal — title + body, uncontrolled (defaultOpen=false)
        </Heading>
        <p className={styles.sectionDescription}>
          Bare minimum. Just <code>title</code> and <code>children</code>.
          Component owns open state via <code>useState</code>; defaults to
          collapsed.
        </p>
        <CollapsibleZoneCard title="Wskazniki">
          <Text variant="body" color="secondary" className={styles.bodyText}>
            Body content goes here. CollapsibleZoneCard owns header trigger
            (button) + provides Stack wrapper for children with density-driven
            gap. Click header to toggle.
          </Text>
        </CollapsibleZoneCard>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          2. With summary chip — visible only when collapsed
        </Heading>
        <p className={styles.sectionDescription}>
          <code>summaryChip</code> renders a Badge in the header right-slot
          when collapsed; hidden when expanded (body content becomes the
          summary). Mirrors FinancialBreakdown driving consumer pattern.
        </p>
        <div data-testid="summary-chip-czc">
          <CollapsibleZoneCard
            icon={<PlaceholderIcon d={ICON_WALLET} />}
            title="Income"
            tone="success"
            summaryChip={{ label: '€500/mo', tone: 'success' }}
          >
            <Text variant="body" color="secondary" className={styles.bodyText}>
              Income breakdown items. When collapsed, summary chip
              &quot;€500/mo&quot; visible in header. When expanded, body
              replaces the summary.
            </Text>
          </CollapsibleZoneCard>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          3. With subtitle + icon + rightSlot (full ZoneCard inheritance)
        </Heading>
        <p className={styles.sectionDescription}>
          All ZoneCard CP9 props inherited unchanged. <code>rightSlot</code>{' '}
          (always-visible) coexists with <code>summaryChip</code>{' '}
          (collapsed-only) — both render in header right slot.
        </p>
        <CollapsibleZoneCard
          icon={<PlaceholderIcon d={ICON_TRENDING_UP} />}
          title="Forecasted revenue"
          subtitle="Q3 + Q4 2026 projections"
          tone="brand"
          rightSlot={<Badge color="brand" label="Forecast" />}
        >
          <Text variant="body" color="secondary" className={styles.bodyText}>
            Body shows detailed forecast breakdown. RightSlot (Forecast badge)
            stays visible whether expanded or collapsed.
          </Text>
        </CollapsibleZoneCard>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          4. Group of zones — mirroring driving consumer pattern
        </Heading>
        <p className={styles.sectionDescription}>
          FinancialBreakdown pattern: 2-3 collapsible zones in a vertical
          Stack, each with own icon + tone + summary chip. First zone
          defaultOpen for primary content visibility.
        </p>
        <div className={styles.zoneList}>
          <CollapsibleZoneCard
            icon={<PlaceholderIcon d={ICON_NETWORK} />}
            title="Hosting"
            tone="success"
            summaryChip={{ label: '99.99% uptime', tone: 'success' }}
            defaultOpen
          >
            <Text variant="small" color="secondary" className={styles.bodyText}>
              Vercel · Production · 99.99% uptime · 4.2GB egress this month
            </Text>
          </CollapsibleZoneCard>
          <CollapsibleZoneCard
            icon={<PlaceholderIcon d={ICON_DATABASE} />}
            title="Baza danych"
            tone="warning"
            summaryChip={{ label: '76% headroom', tone: 'warning' }}
          >
            <Text variant="small" color="secondary" className={styles.bodyText}>
              Supabase Postgres · 24% capacity · 76% headroom · last backup 2h
            </Text>
          </CollapsibleZoneCard>
          <CollapsibleZoneCard
            icon={<PlaceholderIcon d={ICON_DATABASE} />}
            title="Storage"
            tone="error"
            summaryChip={{ label: '84% usage', tone: 'error' }}
          >
            <Text variant="small" color="secondary" className={styles.bodyText}>
              S3 bucket · 4.2 GB / 5 GB · 84% usage · upgrade recommended
            </Text>
          </CollapsibleZoneCard>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          5. Density comparison — comfortable vs compact
        </Heading>
        <p className={styles.sectionDescription}>
          Inherited from ZoneCard. <code>compact</code> for grouped zone
          lists; <code>comfortable</code> (default) for stand-alone cards.
        </p>
        <div className={styles.zoneList}>
          <CollapsibleZoneCard
            title="Comfortable density (default)"
            density="comfortable"
            summaryChip={{ label: 'padding=5 gap=3' }}
          >
            <Text variant="small" color="secondary" className={styles.bodyText}>
              Padding 5 (20px) + body gap 3 (12px). Stand-alone or top-level.
            </Text>
          </CollapsibleZoneCard>
          <CollapsibleZoneCard
            title="Compact density"
            density="compact"
            summaryChip={{ label: 'padding=4 gap=2' }}
          >
            <Text variant="small" color="secondary" className={styles.bodyText}>
              Padding 4 (16px) + body gap 2 (8px). Best for grouped zone
              lists like 5+ vertical zones.
            </Text>
          </CollapsibleZoneCard>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          6. Controlled mode — parent owns state
        </Heading>
        <p className={styles.sectionDescription}>
          Pass <code>open</code> + <code>onOpenChange</code> to lift state to
          parent. Component does not own internal state — useful for URL sync,
          persisted preferences, multiple cards opening in parallel.
        </p>
        <ControlledExample className={styles.controlledStateLine} />
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          7. Nested disclosures
        </Heading>
        <p className={styles.sectionDescription}>
          Nested CollapsibleZoneCards toggle independently. Verifies no
          infinite re-render loop (Radix #2717 / #2390 precedent).
        </p>
        <NestedExample innerClassName={styles.nestedInner} />
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          8. Inside a {'<form>'} — does not submit
        </Heading>
        <p className={styles.sectionDescription}>
          Trigger has <code>type=&quot;button&quot;</code> by default — never
          submits a wrapping form (Radix #15 regression case).
        </p>
        <FormWrappedExample />
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          9. forceMount — semantic hint for form-state-bearing panels
        </Heading>
        <p className={styles.sectionDescription}>
          Body content is <strong>always mounted</strong> to DOM (required by
          the collapse animation — needs an element to animate). Form state
          inside body therefore survives toggle cycles unconditionally.
          When <code>forceMount</code> is true, sets{' '}
          <code>data-force-mount=&quot;true&quot;</code> on the body for
          consumer observation / styling / integration-test selectors.
          Per Radix #2446 / #3601 closed-issue precedent.
        </p>
        <ForceMountExample />
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          10. Tone variants (icon color cascade — inherited from ZoneCard)
        </Heading>
        <p className={styles.sectionDescription}>
          <code>tone</code> drives header icon color via SCSS attribute
          cascade (mirror ZoneCard CP9 contract).
        </p>
        <div className={styles.zoneList}>
          <CollapsibleZoneCard
            icon={<PlaceholderIcon d={ICON_FILTER} />}
            title="Default tone"
          >
            <Text variant="small" color="secondary" className={styles.bodyText}>
              Icon uses --color-text-secondary
            </Text>
          </CollapsibleZoneCard>
          <CollapsibleZoneCard
            icon={<PlaceholderIcon d={ICON_FILTER} />}
            title="Success tone"
            tone="success"
          >
            <Text variant="small" color="secondary" className={styles.bodyText}>
              Icon uses --color-success
            </Text>
          </CollapsibleZoneCard>
          <CollapsibleZoneCard
            icon={<PlaceholderIcon d={ICON_FILTER} />}
            title="Warning tone"
            tone="warning"
          >
            <Text variant="small" color="secondary" className={styles.bodyText}>
              Icon uses --color-warning
            </Text>
          </CollapsibleZoneCard>
          <CollapsibleZoneCard
            icon={<PlaceholderIcon d={ICON_FILTER} />}
            title="Error tone"
            tone="error"
          >
            <Text variant="small" color="secondary" className={styles.bodyText}>
              Icon uses --color-error
            </Text>
          </CollapsibleZoneCard>
          <CollapsibleZoneCard
            icon={<PlaceholderIcon d={ICON_FILTER} />}
            title="Brand tone"
            tone="brand"
          >
            <Text variant="small" color="secondary" className={styles.bodyText}>
              Icon uses --color-brand
            </Text>
          </CollapsibleZoneCard>
        </div>
      </section>
    </main>
  );
}
