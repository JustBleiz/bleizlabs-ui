import Link from 'next/link';
import { Anchor } from '@/components/typography/Anchor';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function AnchorPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          Anchor
        </Heading>
        <p className={styles.intro}>
          Inline body-text link atom. Color inherits from surrounding text, always underlined,
          conservative hover. Differs from `TextLink` (navigational, brand-colored, hover-reveal
          underline).
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Inline in prose
        </Heading>
        <div className={styles.frame}>
          <span className={styles.label}>body text with inline link</span>
          <Text>
            Polityka prywatności jest dostępna <Anchor href="/privacy">tutaj</Anchor>. Zapraszamy do
            kontaktu przez <Anchor href="mailto:hello@example.com">email</Anchor> lub formularz na
            stronie kontaktowej.
          </Text>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Inside a muted paragraph
        </Heading>
        <div className={styles.frame}>
          <span className={styles.label}>color inherit from parent</span>
          <Text color="muted">
            Zobacz również <Anchor href="/docs">dokumentację techniczną</Anchor> oraz{' '}
            <Anchor href="/changelog">historię zmian</Anchor>.
          </Text>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. External link (auto noopener noreferrer)
        </Heading>
        <div className={styles.frame}>
          <span className={styles.label}>target=&quot;_blank&quot; auto-wires rel</span>
          <Text>
            Więcej kontekstu na{' '}
            <Anchor href="https://example.com" target="_blank">
              example.com
            </Anchor>{' '}
            (otwiera się w nowej karcie).
          </Text>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. asChild with Next Link
        </Heading>
        <div className={styles.frame}>
          <span className={styles.label}>Slot projection onto next/link</span>
          <Text>
            Przejdź do{' '}
            <Anchor asChild>
              <Link href="/">strony głównej playground</Link>
            </Anchor>
            .
          </Text>
        </div>
      </section>
    </main>
  );
}
