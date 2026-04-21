import Link from 'next/link';
import { Heading, type HeadingLevel, type HeadingSize } from '@/components/typography/Heading';
import styles from './page.module.scss';

const LEVELS: HeadingLevel[] = [1, 2, 3, 4, 5, 6];
const SIZES: HeadingSize[] = ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', 'display-md', 'display'];

export default function HeadingPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← back</Link>
        <Heading level={1} size="4xl">Heading</Heading>
        <p className={styles.intro}>Semantic heading element with decoupled visual size. Six levels, eight sizes, weight/color/align/asChild.</p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">1. Default size per level</Heading>
        <div className={styles.col}>
          {LEVELS.map((l) => (
            <div key={l} className={styles.frame}>
              <span className={styles.label}>level={l} (default size)</span>
              <Heading level={l}>The quick brown fox jumps over the lazy dog</Heading>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">2. Size override (level=2 with all sizes)</Heading>
        <div className={styles.col}>
          {SIZES.map((s) => (
            <div key={s} className={styles.frame}>
              <span className={styles.label}>level=2 size=&quot;{s}&quot;</span>
              <Heading level={2} size={s}>The quick brown fox</Heading>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">3. Weight variants</Heading>
        <div className={styles.col}>
          {(['regular', 'medium', 'semibold', 'bold'] as const).map((w) => (
            <div key={w} className={styles.frame}>
              <span className={styles.label}>weight=&quot;{w}&quot;</span>
              <Heading level={3} weight={w}>The quick brown fox</Heading>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">4. Color variants</Heading>
        <div className={styles.col}>
          {(['primary', 'secondary', 'muted', 'brand'] as const).map((c) => (
            <div key={c} className={styles.frame}>
              <span className={styles.label}>color=&quot;{c}&quot;</span>
              <Heading level={3} color={c}>The quick brown fox</Heading>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">5. Alignment</Heading>
        <div className={styles.col}>
          {(['start', 'center', 'end'] as const).map((a) => (
            <div key={a} className={styles.frame}>
              <span className={styles.label}>align=&quot;{a}&quot;</span>
              <Heading level={3} align={a}>The quick brown fox</Heading>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">6. asChild — renders as &lt;a&gt; (linked title)</Heading>
        <div className={styles.frame}>
          <Heading level={2} asChild>
            <a href="#example" className={styles.link}>This h2 is actually an anchor element</a>
          </Heading>
        </div>
      </section>
    </main>
  );
}
