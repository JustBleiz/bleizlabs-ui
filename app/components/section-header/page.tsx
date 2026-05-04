import Link from 'next/link';
import { Button } from '@/components/interactive/Button';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Toggle } from '@/components/interactive/Toggle';
import { ToggleGroup } from '@/components/interactive/ToggleGroup';
import { Heading } from '@/components/typography/Heading';
import styles from './page.module.scss';

export default function SectionHeaderPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          SectionHeader
        </Heading>
        <p className={styles.intro}>
          Universal section heading row molecule (M11). Renders semantic{' '}
          <code>&lt;header&gt;</code> with gradient accent line + uppercase
          label + optional count + optional meta + optional action slot.
          Pattern: <code>[gradient] LABEL · count [meta][action]</code>.
          Promoted v0.7.2 from bleizlabs-website panel-pattern-extraction
          (27 production consumers).
        </p>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          1. Minimal — label only
        </Heading>
        <div className={styles.sectionBody}>
          <SectionHeader label="Twoje systemy" />
          <p className={styles.bodyText}>
            Bare-minimum usage. Just an uppercase label with the gradient
            accent. Used for grouping content where count is irrelevant.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          2. With count
        </Heading>
        <div className={styles.sectionBody}>
          <SectionHeader label="Aktywne projekty" count={6} />
          <p className={styles.bodyText}>
            Count rendered as <code>· 6</code> after the label. Tabular
            numerals + muted color. Use for &ldquo;N items in this
            section&rdquo;.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          3. With meta (right slot)
        </Heading>
        <div className={styles.sectionBody}>
          <SectionHeader
            label="Ostatnia aktywność"
            meta="Aktualizowano 2 godz. temu"
          />
          <p className={styles.bodyText}>
            <code>meta</code> slot for relative time, status indicator, or
            other non-actionable context. Rendered right-aligned, muted color.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          4. With action button
        </Heading>
        <div className={styles.sectionBody}>
          <SectionHeader
            label="Faktury"
            count={12}
            action={
              <Button variant="ghost" size="sm">
                Wszystkie →
              </Button>
            }
          />
          <p className={styles.bodyText}>
            <code>action</code> slot for navigation buttons, &ldquo;+
            Dodaj&rdquo; CTA,
            or filter triggers. Renders to the right of meta if both present.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          5. With ToggleGroup filter
        </Heading>
        <div className={styles.sectionBody}>
          <SectionHeader
            label="Zgłoszenia"
            count={8}
            action={
              <ToggleGroup type="single" defaultValue="all" aria-label="Filtr">
                <Toggle value="all" size="sm">
                  Wszystkie
                </Toggle>
                <Toggle value="open" size="sm">
                  Otwarte
                </Toggle>
                <Toggle value="closed" size="sm">
                  Zamknięte
                </Toggle>
              </ToggleGroup>
            }
          />
          <p className={styles.bodyText}>
            Composite action — ToggleGroup as filter pill row. Common pattern
            for list sections with state filters.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          6. All slots together
        </Heading>
        <div className={styles.sectionBody}>
          <SectionHeader
            label="Powiadomienia"
            count={3}
            meta="Ostatnia aktywność: 5 min temu"
            action={
              <Button variant="ghost" size="sm">
                Oznacz jako przeczytane
              </Button>
            }
          />
          <p className={styles.bodyText}>
            All four slots populated. <code>meta</code> renders before{' '}
            <code>action</code>; both wrap when narrow.
          </p>
        </div>
      </section>
    </main>
  );
}
