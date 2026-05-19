import Link from 'next/link';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { VisuallyHidden } from '@/components/utils/VisuallyHidden';
import styles from './page.module.scss';

export default function VisuallyHiddenPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          VisuallyHidden
        </Heading>
        <p className={styles.intro}>
          Utility atom that renders content visible only to assistive tech. Mirrors the{' '}
          <code>sr-only</code> SCSS mixin as a React primitive so consumer code can author
          accessible-name overlays, chart captions, and skip-target labels without owning the
          screen-reader-only CSS recipe. Hidden visually (clipped 1×1px) but kept in the
          accessibility tree.
        </p>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          1. Accessible chart label
        </Heading>
        <div className={styles.sectionBody}>
          <div role="img" aria-labelledby="chart-1-label">
            <VisuallyHidden id="chart-1-label">
              Stacked bar chart — 35% revenue brand-coloured, 65% remaining neutral.
            </VisuallyHidden>
            <div aria-hidden="true" className={styles.chart} />
          </div>
          <p className={styles.bodyText}>
            Sighted users see the decorative bar; assistive tech reads &ldquo;Stacked bar chart
            …&rdquo; via <code>aria-labelledby</code>.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          2. Icon-only button — accessible name supplement
        </Heading>
        <div className={styles.sectionBody}>
          <button type="button" aria-describedby="filter-help">
            <span aria-hidden="true">🔍</span>
            <VisuallyHidden>Filtruj wyniki</VisuallyHidden>
          </button>
          <Text id="filter-help" variant="small" color="secondary">
            The button shows an icon; AT announces &ldquo;Filtruj wyniki&rdquo;.
          </Text>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          3. asChild — semantic heading exposed only to AT
        </Heading>
        <div className={styles.sectionBody}>
          <VisuallyHidden asChild>
            {/* @raw-heading-ok: demo of asChild projecting onto native heading */}
            <h2>Sekcja: szczegóły zamówienia (tylko dla czytników ekranu)</h2>
          </VisuallyHidden>
          <Text>
            The <code>&lt;h2&gt;</code> participates in the document outline (skip-to-heading nav
            works) but renders no visual chrome.
          </Text>
        </div>
      </section>
    </main>
  );
}
