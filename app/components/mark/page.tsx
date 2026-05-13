import Link from 'next/link';
import { Heading } from '@/components/typography/Heading';
import { Mark } from '@/components/typography/Mark';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function MarkPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          Mark
        </Heading>
        <p className={styles.intro}>
          Inline <code>&lt;mark&gt;</code> highlight atom. Token-driven —
          tones remap a pair of CSS custom properties (<code>--mark-bg</code> /{' '}
          <code>--mark-fg</code>) so a single rule set handles every tone.
          Default tone matches the native browser pair (warning-soft).
          Reach for the default tone when highlighting search-result
          matches; reach for brand/success/error for editorial accents.
        </p>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          1. Default (warning-soft) — search highlight
        </Heading>
        <div className={styles.sectionBody}>
          <Text>
            Witaj <Mark>świecie</Mark>, dzień dobry — to przykład{' '}
            <Mark>dopasowania</Mark> wyniku wyszukiwania.
          </Text>
          <p className={styles.bodyText}>
            Native <code>&lt;mark&gt;</code> announces &ldquo;highlighted&rdquo;
            on supporting assistive tech.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          2. Colors
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.stack}>
            <Text>
              Default — <Mark color="default">domyślne</Mark> podświetlenie.
            </Text>
            <Text>
              Brand — <Mark color="brand">kluczowa fraza</Mark> w tekście.
            </Text>
            <Text>
              Success — <Mark color="success">zaakceptowane</Mark> zmiany.
            </Text>
            <Text>
              Warning — <Mark color="warning">do przejrzenia</Mark>.
            </Text>
            <Text>
              Error — <Mark color="error">błędna wartość</Mark> w polu.
            </Text>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          3. asChild — decorative on span (no AT announcement)
        </Heading>
        <div className={styles.sectionBody}>
          <Text>
            Treść z <Mark asChild color="brand"><span>wizualnym</span></Mark>{' '}
            akcentem — element <code>&lt;span&gt;</code> nie wnosi semantyki
            znacznika, więc czytniki ekranu nie ogłoszą podświetlenia.
          </Text>
        </div>
      </section>
    </main>
  );
}
