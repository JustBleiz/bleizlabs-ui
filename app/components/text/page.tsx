import Link from 'next/link';
import { Heading } from '@/components/typography/Heading';
import { Text, type TextVariant } from '@/components/typography/Text';
import styles from './page.module.scss';

const VARIANTS: TextVariant[] = ['lead', 'body', 'body-strong', 'small', 'caption'];

const SAMPLE = 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!';

export default function TextPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← back</Link>
        <Heading level={1} size="4xl">Text</Heading>
        <Text variant="lead" color="secondary">Universal body text component. Five variants, weight + color overrides, uppercase, asChild.</Text>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">1. Variants (default weight + color)</Heading>
        <div className={styles.col}>
          {VARIANTS.map((v) => (
            <div key={v} className={styles.frame}>
              <span className={styles.label}>variant=&quot;{v}&quot;</span>
              <Text variant={v}>{SAMPLE}</Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">2. Weight overrides (body variant)</Heading>
        <div className={styles.col}>
          {(['regular', 'medium', 'semibold', 'bold'] as const).map((w) => (
            <div key={w} className={styles.frame}>
              <span className={styles.label}>variant=&quot;body&quot; weight=&quot;{w}&quot;</span>
              <Text weight={w}>{SAMPLE}</Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">3. Color variants</Heading>
        <div className={styles.col}>
          {(['primary', 'secondary', 'muted', 'brand', 'inherit'] as const).map((c) => (
            <div key={c} className={styles.frame} style={c === 'inherit' ? { color: 'crimson' } : undefined}>
              <span className={styles.label}>color=&quot;{c}&quot;{c === 'inherit' ? ' (parent: crimson)' : ''}</span>
              <Text color={c}>{SAMPLE}</Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">4. Uppercase + tracking</Heading>
        <div className={styles.frame}>
          <span className={styles.label}>variant=&quot;caption&quot; uppercase color=&quot;muted&quot;</span>
          <Text variant="caption" uppercase color="muted">Section label / overline</Text>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">5. Alignment</Heading>
        <div className={styles.col}>
          {(['start', 'center', 'end'] as const).map((a) => (
            <div key={a} className={styles.frame}>
              <span className={styles.label}>align=&quot;{a}&quot;</span>
              <Text align={a}>{SAMPLE}</Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">6. asChild — renders as &lt;span&gt; (inline)</Heading>
        <div className={styles.frame}>
          <span className={styles.label}>asChild → &lt;span&gt;</span>
          <p>
            Wrapping inline:{' '}
            <Text asChild variant="body-strong" color="brand">
              <span>highlighted span inside paragraph</span>
            </Text>{' '}
            — Text classes apply but DOM is &lt;span&gt;.
          </p>
        </div>
      </section>
    </main>
  );
}
