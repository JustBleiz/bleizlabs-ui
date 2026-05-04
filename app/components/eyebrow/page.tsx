import Link from 'next/link';
import { Eyebrow } from '@/components/typography/Eyebrow';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function EyebrowPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          Eyebrow
        </Heading>
        <p className={styles.intro}>
          Small uppercase atelier label with optional numeric (or alphabetic)
          prefix and a 14px hairline connector. The eyebrow scale (0.7rem font /
          0.08em tracking / tabular-nums) is the atelier vocabulary signature —
          intentionally not tokenised. Pair with{' '}
          <code>{'<Heading>'}</code> for section markers or as a label tier
          above body text. Promoted v0.5.4 from scout-hub batches (5-site
          duplication). Sister atom to <code>Text variant=&quot;eyebrow&quot;</code>{' '}
          (v0.5.7) — pick this atom when the numbered prefix + hairline are
          wanted; pick the variant for inline composition without ornament.
        </p>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          1. Plain — label only
        </Heading>
        <div className={styles.sectionBody}>
          <Eyebrow>Total cost</Eyebrow>
          <p className={styles.bodyText}>
            Bare label — no prefix, no hairline. Default tone is{' '}
            <code>muted</code>.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          2. Numeric prefix (zero-padded)
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.stack}>
            <Eyebrow index={1}>Configure profile</Eyebrow>
            <Eyebrow index={2}>Add billing details</Eyebrow>
            <Eyebrow index={12}>Confirm and ship</Eyebrow>
          </div>
          <p className={styles.bodyText}>
            Numbers below 10 are zero-padded to 2 digits (1 → &ldquo;01&rdquo;).
            Hairline connector renders between index and label.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          3. Alphabetic prefix
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.stack}>
            <Eyebrow index="A">Alpha track</Eyebrow>
            <Eyebrow index="II">Phase two</Eyebrow>
          </div>
          <p className={styles.bodyText}>
            String indices render verbatim — useful for letter-keyed (A/B/C) or
            roman-numeral progressions.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          4. Tones (muted / secondary / strong)
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.stack}>
            <Eyebrow tone="muted">Muted (default)</Eyebrow>
            <Eyebrow tone="secondary">Secondary — nav contexts</Eyebrow>
            <Eyebrow tone="strong" index={1}>
              Strong — emphatic markers
            </Eyebrow>
          </div>
          <p className={styles.bodyText}>
            <code>strong</code> tone tints the index with{' '}
            <code>--color-brand-strong</code> for emphasis on track markers.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          5. Pair with Heading
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.stack}>
            <Eyebrow index={1} tone="strong">
              Sekcja danych
            </Eyebrow>
            <Heading level={2} size="2xl">
              Twoje konto
            </Heading>
            <Text variant="body" color="muted">
              Eyebrow as tier-marker above heading is the canonical atelier
              section pattern.
            </Text>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          6. asChild (project onto label semantics)
        </Heading>
        <div className={styles.sectionBody}>
          <Eyebrow asChild tone="secondary">
            <label htmlFor="eyebrow-demo-input">Filter status</label>
          </Eyebrow>
          <input
            id="eyebrow-demo-input"
            type="text"
            placeholder="(input bound to eyebrow label)"
            style={{
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
            }}
          />
          <p className={styles.bodyText}>
            With <code>asChild</code>, Eyebrow projects styling onto the single
            child element. Use to bind eyebrow vocabulary to{' '}
            <code>{'<label htmlFor>'}</code> form semantics.
          </p>
        </div>
      </section>
    </main>
  );
}
