import Link from 'next/link';
import { Eyebrow } from '@/components/typography/Eyebrow';
import { Heading } from '@/components/typography/Heading';
import { Text, type TextVariant } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import styles from './page.module.scss';

const VARIANTS: TextVariant[] = ['lead', 'body', 'body-strong', 'small', 'caption', 'eyebrow'];

const SAMPLE =
  'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!';

export default function TextPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          Text
        </Heading>
        <Text variant="lead" color="secondary">
          Universal body text component. Five variants, weight + color overrides, uppercase,
          asChild.
        </Text>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Variants (default weight + color)
        </Heading>
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
        <Heading level={2} size="2xl">
          2. Weight overrides (body variant)
        </Heading>
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
        <Heading level={2} size="2xl">
          3. Color variants
        </Heading>
        <div className={styles.col}>
          {(['primary', 'secondary', 'muted', 'brand', 'inherit'] as const).map((c) => (
            <div
              key={c}
              className={styles.frame}
              style={c === 'inherit' ? { color: 'crimson' } : undefined}
            >
              <span className={styles.label}>
                color=&quot;{c}&quot;{c === 'inherit' ? ' (parent: crimson)' : ''}
              </span>
              <Text color={c}>{SAMPLE}</Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. Uppercase + tracking
        </Heading>
        <div className={styles.frame}>
          <span className={styles.label}>
            variant=&quot;caption&quot; uppercase color=&quot;muted&quot;
          </span>
          <Text variant="caption" uppercase color="muted">
            Section label / overline
          </Text>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. Alignment
        </Heading>
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
        <Heading level={2} size="2xl">
          6. asChild — renders as &lt;span&gt; (inline)
        </Heading>
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

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          7. Eyebrow variant — inline-light atelier vocabulary
        </Heading>
        <Text variant="body" color="secondary">
          The <code>variant=&quot;eyebrow&quot;</code> path reuses the same atelier typography as
          the standalone <code>Eyebrow</code> atom (0.7rem uppercase, 0.08em tracking, tabular-nums,
          medium weight) without the atom&apos;s numeric prefix + hairline ornament. Use this when
          composing inline next to other Text variants; reach for the standalone{' '}
          <code>Eyebrow</code> atom when you want the numbered marker.
        </Text>

        <div className={styles.col}>
          <div className={styles.frame}>
            <span className={styles.label}>variant=&quot;eyebrow&quot; (standalone)</span>
            <Text variant="eyebrow">Briefing</Text>
          </div>

          <div className={styles.frame}>
            <span className={styles.label}>composed via Inline next to Heading</span>
            <Inline gap={3} align="baseline">
              <Text variant="eyebrow">Section 03</Text>
              <Heading level={3} size="lg">
                Quality assurance
              </Heading>
            </Inline>
          </div>

          <div className={styles.frame}>
            <span className={styles.label}>side-by-side with the standalone Eyebrow atom</span>
            <Inline gap={6} align="center">
              <Eyebrow index={1}>With ornament</Eyebrow>
              <Text variant="eyebrow">Without ornament</Text>
            </Inline>
          </div>

          <div className={styles.frame}>
            <span className={styles.label}>color override (color=&quot;brand&quot;)</span>
            <Text variant="eyebrow" color="brand">
              Live · awaiting input
            </Text>
          </div>
        </div>
      </section>
    </main>
  );
}
