import Link from 'next/link';
import { GridLayout } from '@/components/layout/GridLayout';
import styles from './page.module.scss';

export default function GridLayoutPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <h1>GridLayout</h1>
        <p>
          Multi-column CSS Grid layout atom (v0.5.5). Universal multi-column
          primitive sitting alongside Stack / Inline / Container / Section.
          Supports number shorthand, arbitrary CSS grid templates, mobile-first
          responsive cascade, and asChild Slot polymorphism.
        </p>
      </header>

      <section className={styles.demo}>
        <h2>1. Equal columns (number shorthand)</h2>
        <p className={styles.caption}>
          <code>columns={3}</code> expands to{' '}
          <code>repeat(3, minmax(0, 1fr))</code> — overflow-protected equal
          columns.
        </p>
        <GridLayout columns={3} gap={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.box}>
              cell {i + 1}
            </div>
          ))}
        </GridLayout>
      </section>

      <section className={styles.demo}>
        <h2>2. Responsive cascade (mobile-first)</h2>
        <p className={styles.caption}>
          <code>columns={1} responsive={'{{ md: 2, lg: 3 }}'}</code> — 1col
          mobile, 2col tablet (≥768px), 3col desktop (≥1024px). Resize the
          viewport to verify the cascade.
        </p>
        <GridLayout columns={1} responsive={{ md: 2, lg: 3 }} gap={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.box}>
              card {i + 1}
            </div>
          ))}
        </GridLayout>
      </section>

      <section className={styles.demo}>
        <h2>3. Arbitrary tracks (sidebar + main)</h2>
        <p className={styles.caption}>
          <code>{`columns="240px 1fr"`}</code> — fixed-width sidebar plus fluid
          main content. Pass any CSS{' '}
          <code>grid-template-columns</code> string.
        </p>
        <GridLayout columns="240px 1fr" gap={4} align="start">
          <div className={styles.sidebar}>sidebar (240px)</div>
          <div className={styles.main_content}>main (1fr)</div>
        </GridLayout>
      </section>

      <section className={styles.demo}>
        <h2>4. Auto-fitting card grid</h2>
        <p className={styles.caption}>
          <code>{`columns="repeat(auto-fit, minmax(220px, 1fr))"`}</code> — packs as
          many ~220px tracks as fit, expanding to fill row. Resize to see how
          column count adapts without breakpoint config.
        </p>
        <GridLayout
          columns="repeat(auto-fit, minmax(220px, 1fr))"
          gap={4}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.box}>
              auto-fit cell {i + 1}
            </div>
          ))}
        </GridLayout>
      </section>

      <section className={styles.demo}>
        <h2>5. Per-axis gap override</h2>
        <p className={styles.caption}>
          <code>columnGap={2} rowGap={6}</code> — tight horizontal spacing,
          generous vertical rhythm. Overrides the unified <code>gap</code>{' '}
          default.
        </p>
        <GridLayout columns={3} columnGap={2} rowGap={6}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.box}>
              cell {i + 1}
            </div>
          ))}
        </GridLayout>
      </section>

      <section className={styles.demo}>
        <h2>6. asChild — projects onto a different element</h2>
        <p className={styles.caption}>
          <code>asChild</code> projects GridLayout onto a single child element
          (here a <code>&lt;ul&gt;</code>) — useful for semantic markup while
          keeping grid layout primitives.
        </p>
        <GridLayout asChild columns={3} gap={3}>
          <ul className={styles.list}>
            {['React', 'Next.js', 'TypeScript', 'SCSS', 'WAI-ARIA', 'shadcn'].map(
              (tag) => (
                <li key={tag}>{tag}</li>
              ),
            )}
          </ul>
        </GridLayout>
      </section>
    </main>
  );
}
