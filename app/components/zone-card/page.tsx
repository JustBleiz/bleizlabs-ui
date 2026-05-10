import Link from 'next/link';
import { Badge } from '@/components/display/Badge';
import { ZoneCard } from '@/components/presets/ZoneCard';
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

const ICON_SETTINGS =
  'M12 15a3 3 0 100-6 3 3 0 000 6zm9-3l-2-1m-14 0l-2 1m4-7l-1-2m6 16l-1-2m4 0l-1 2M6 17l-1 2m11-13l-1-2';
const ICON_DATABASE = 'M3 5a9 3 0 0018 0M3 5a9 3 0 0118 0v14a9 3 0 01-18 0V5';
const ICON_NETWORK =
  'M9 12h6m-3-3v6M3 9a3 3 0 016 0v6a3 3 0 11-6 0V9zm12 0a3 3 0 016 0v6a3 3 0 11-6 0V9z';

export default function ZoneCardPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          ZoneCard
        </Heading>
        <p className={styles.intro}>
          Universal info card preset. Renders semantic{' '}
          <code>&lt;section&gt;</code> with optional icon + title +
          subtitle + rightSlot in header, then consumer-bespoke body content
          via children. Server-Component safe (zero client hooks).
        </p>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          1. Minimal — title + body content
        </Heading>
        <p className={styles.sectionDescription}>
          Bare minimum. Just <code>title</code> and <code>children</code>.{' '}
          <code>ariaLabel</code> defaults to <code>title</code> — pass an
          override only when context disambiguation matters.
        </p>
        <ZoneCard title="Wskazniki">
          <Text variant="body" color="secondary">
            Body content goes here. ZoneCard owns header + provides Stack
            wrapper for children with density-driven gap.
          </Text>
        </ZoneCard>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          2. With icon + summary chip (rightSlot)
        </Heading>
        <p className={styles.sectionDescription}>
          Icon prop accepts any ReactNode (consumer must add{' '}
          <code>aria-hidden=&ldquo;true&rdquo;</code>). RightSlot renders
          right-aligned, perfect for status Badge.
        </p>
        <ZoneCard
          icon={<PlaceholderIcon d={ICON_SETTINGS} />}
          title="Konfiguracja"
          rightSlot={<Badge color="success" label="Produkcja" />}
        >
          <ul className={styles.dataList} aria-label="Konfiguracja">
            <li className={styles.dataRow}>
              <span className={styles.dataLabel}>Wersja</span>
              <span className={styles.dataValue}>v2.4.1</span>
            </li>
            <li className={styles.dataRow}>
              <span className={styles.dataLabel}>Dostep</span>
              <span className={styles.dataValue}>Public</span>
            </li>
          </ul>
        </ZoneCard>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          3. With subtitle (caption below title)
        </Heading>
        <ZoneCard
          icon={<PlaceholderIcon d={ICON_SETTINGS} />}
          title="Bezpieczenstwo domeny"
          subtitle="SSL + DNS + cert renewal"
          rightSlot={<Badge color="success" label="Wazny" />}
        >
          <Text variant="body" color="secondary">
            Subtitle prop renders caption-styled muted text below title.
          </Text>
        </ZoneCard>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          4. Group of zones — common composition pattern
        </Heading>
        <p className={styles.sectionDescription}>
          Grouped pattern: 3+ zones in a vertical Stack, each with own icon
          + title + status chip.
        </p>
        <div className={styles.zoneList}>
          <ZoneCard
            icon={<PlaceholderIcon d={ICON_NETWORK} />}
            title="Hosting"
            rightSlot={<Badge color="success" label="Aktywny" />}
            tone="success"
          >
            <Text variant="small" color="secondary">
              Vercel · Production · 99.99% uptime
            </Text>
          </ZoneCard>
          <ZoneCard
            icon={<PlaceholderIcon d={ICON_DATABASE} />}
            title="Baza danych"
            rightSlot={<Badge color="warning" label="Uwaga" />}
            tone="warning"
          >
            <Text variant="small" color="secondary">
              Supabase Postgres · 24% capacity · 76% headroom
            </Text>
          </ZoneCard>
          <ZoneCard
            icon={<PlaceholderIcon d={ICON_DATABASE} />}
            title="Storage"
            rightSlot={<Badge color="error" label="Limit" />}
            tone="error"
          >
            <Text variant="small" color="secondary">
              S3 bucket · 4.2 GB / 5 GB · 84% usage
            </Text>
          </ZoneCard>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          5. Density comparison — comfortable vs compact
        </Heading>
        <p className={styles.sectionDescription}>
          <code>density=&ldquo;comfortable&rdquo;</code> (default) uses
          padding 5 + body gap 3. <code>density=&ldquo;compact&rdquo;</code>{' '}
          uses padding 4 + body gap 2 — better for grouped zone-list
          patterns where vertical density matters.
        </p>
        <div className={styles.zoneList}>
          <ZoneCard
            title="Comfortable density (default)"
            density="comfortable"
            rightSlot={<Badge color="default" label="density=comfortable" />}
          >
            <Text variant="small" color="secondary">
              Padding 5 (20px) + body gap 3 (12px). Best for stand-alone
              cards or top-level page sections.
            </Text>
          </ZoneCard>
          <ZoneCard
            title="Compact density"
            density="compact"
            rightSlot={<Badge color="default" label="density=compact" />}
          >
            <Text variant="small" color="secondary">
              Padding 4 (16px) + body gap 2 (8px). Best for grouped zone
              lists with 5+ vertical zones.
            </Text>
          </ZoneCard>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          6. Tone variants (icon color cascade)
        </Heading>
        <p className={styles.sectionDescription}>
          <code>tone</code> drives icon color via SCSS attribute cascade.
          Default = secondary text color. Other tones map to lib semantic
          color tokens.
        </p>
        <div className={styles.zoneList}>
          <ZoneCard
            icon={<PlaceholderIcon d={ICON_SETTINGS} />}
            title="Default tone (no `tone` prop = default baseline)"
          >
            <Text variant="small" color="secondary">
              Icon uses --color-text-secondary
            </Text>
          </ZoneCard>
          <ZoneCard
            icon={<PlaceholderIcon d={ICON_SETTINGS} />}
            title="Success tone"
            tone="success"
          >
            <Text variant="small" color="secondary">
              Icon uses --color-success
            </Text>
          </ZoneCard>
          <ZoneCard
            icon={<PlaceholderIcon d={ICON_SETTINGS} />}
            title="Warning tone"
            tone="warning"
          >
            <Text variant="small" color="secondary">
              Icon uses --color-warning
            </Text>
          </ZoneCard>
          <ZoneCard
            icon={<PlaceholderIcon d={ICON_SETTINGS} />}
            title="Error tone"
            tone="error"
          >
            <Text variant="small" color="secondary">
              Icon uses --color-error
            </Text>
          </ZoneCard>
          <ZoneCard
            icon={<PlaceholderIcon d={ICON_SETTINGS} />}
            title="Brand tone"
            tone="brand"
          >
            <Text variant="small" color="secondary">
              Icon uses --color-brand
            </Text>
          </ZoneCard>
        </div>
      </section>
    </main>
  );
}
