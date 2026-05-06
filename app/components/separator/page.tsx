import Link from 'next/link';
import { Separator } from '@/components/display/Separator';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function SeparatorPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← back</Link>
        <Heading level={1} size="4xl">Separator</Heading>
        <p className={styles.intro}>
          Divider line with three variants (subtle, gradient, brand),
          horizontal or vertical orientation, and an optional custom color.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">1. Horizontal variants</Heading>
        <div className={styles.col}>
          <Text variant="caption" color="muted">subtle</Text>
          <Separator variant="subtle" />
          <Text variant="caption" color="muted">gradient</Text>
          <Separator variant="gradient" />
          <Text variant="caption" color="muted">brand</Text>
          <Separator variant="brand" />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">2. Custom color override</Heading>
        <div className={styles.col}>
          <Separator color="var(--color-success)" />
          <Separator color="var(--color-warning)" />
          <Separator color="var(--color-info)" />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">3. Vertical orientation</Heading>
        <div className={styles.verticalRow}>
          <Text>Section A</Text>
          <Separator orientation="vertical" />
          <Text>Section B</Text>
          <Separator orientation="vertical" variant="brand" />
          <Text>Section C</Text>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">4. Inline content separation</Heading>
        <div className={styles.col}>
          <Text>First paragraph above the divider.</Text>
          <Separator variant="gradient" />
          <Text>Second paragraph below the divider.</Text>
        </div>
      </section>
    </main>
  );
}
