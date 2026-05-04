'use client';

import Link from 'next/link';
import { Heading } from '@/components/typography/Heading';
import { RevealStack } from '@/components/molecules/RevealStack';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Stack } from '@/components/layout/Stack';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function RevealStackPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          RevealStack
        </Heading>
        <p className={styles.intro}>
          Composition molecule wrapping <code>{'<Reveal>'}</code> +{' '}
          <code>{'<Stack>'}</code>. The 90% use case for panel sections —
          IntersectionObserver-driven{' '}
          <code>data-revealed=&quot;true&quot;</code> attribute on the wrapper
          + uniform vertical rhythm via Stack <code>gap</code>. Default{' '}
          <code>gap=3</code> (16px) is the canonical section header→body
          rhythm. <code>className</code> lands on the OUTER Reveal wrapper
          (the element that carries <code>data-revealed</code>); to style
          inner flex layout, wrap children in your own <code>{'<Stack>'}</code>.
        </p>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          1. Default — gap=3 with reveal-on-view
        </Heading>
        <div className={styles.sectionBody}>
          <Stack gap={4}>
            <div className={styles.tallSpacer}>
              ↓ Scroll down to trigger the IntersectionObserver ↓
            </div>
            <RevealStack tag="section" className={styles.revealDemo}>
              <SectionHeader label="Twoja strefa" />
              <div className={styles.card}>
                <Text>Card #1 — appears with the reveal wrapper</Text>
              </div>
              <div className={styles.card}>
                <Text>Card #2 — same fade-in</Text>
              </div>
            </RevealStack>
          </Stack>
          <p className={styles.bodyText}>
            On scroll-into-view, <code>data-revealed=&quot;true&quot;</code>{' '}
            lands on the outer wrapper. The page-local{' '}
            <code>.revealDemo</code> SCSS class fades the wrapper from{' '}
            <code>opacity: 0</code> → <code>1</code> via the attribute
            selector. <code>prefers-reduced-motion</code> short-circuits to
            no transition.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          2. Custom gap
        </Heading>
        <div className={styles.sectionBody}>
          <RevealStack tag="section" gap={5} immediate>
            <SectionHeader label="Większy odstęp" count={3} />
            <div className={styles.card}>
              <Text>gap=5 → 20px between children</Text>
            </div>
            <div className={styles.card}>
              <Text>Useful for editorial pages with breathing room</Text>
            </div>
          </RevealStack>
          <p className={styles.bodyText}>
            <code>gap={'{5}'}</code> overrides the canonical 16px default.{' '}
            <code>immediate</code> skips the observer (renders revealed on
            mount) — used for above-the-fold content where intersection
            timing would cause flash-of-unrevealed.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          3. With nested Stack for sub-rhythm
        </Heading>
        <div className={styles.sectionBody}>
          <RevealStack tag="section" gap={3} immediate>
            <SectionHeader label="Lista" count={3} />
            <Stack gap={2}>
              <div className={styles.card}>
                <Text>Item #1 — tighter inter-row gap</Text>
              </div>
              <div className={styles.card}>
                <Text>Item #2 — same</Text>
              </div>
              <div className={styles.card}>
                <Text>Item #3 — same</Text>
              </div>
            </Stack>
          </RevealStack>
          <p className={styles.bodyText}>
            For sub-groups with different rhythm (e.g. header gap=3 + list
            items gap=2), wrap the items in your own <code>{'<Stack>'}</code>{' '}
            instead of adding props to RevealStack — composition over new
            prop.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          4. Tag override (semantic landmarks)
        </Heading>
        <div className={styles.sectionBody}>
          <RevealStack tag="article" gap={3} immediate>
            <SectionHeader label="Article landmark" />
            <div className={styles.card}>
              <Text>Renders &lt;article&gt; instead of &lt;div&gt;</Text>
            </div>
          </RevealStack>
          <p className={styles.bodyText}>
            <code>tag</code> prop accepts a constrained{' '}
            <code>RevealTag</code> union (
            <code>div / section / article / aside / header / footer / main /
              nav / li</code>
            ). For elements outside this set, use <code>asChild</code>.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          5. asChild (project onto custom element)
        </Heading>
        <div className={styles.sectionBody}>
          <RevealStack asChild gap={3} immediate>
            <fieldset
              style={{
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
              }}
            >
              <legend>asChild → fieldset</legend>
              <Text>RevealStack styling applied to the fieldset directly</Text>
              <Text variant="caption" color="muted">
                Useful when wrapper must be a form-grouping element
              </Text>
            </fieldset>
          </RevealStack>
          <p className={styles.bodyText}>
            <code>asChild</code> overrides <code>tag</code> and projects the
            Reveal/Stack composition onto the single child element via Slot.
            Ref typing widens to <code>HTMLElement</code> — accepted
            trade-off (Reveal precedent).
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          6. Disabled observer
        </Heading>
        <div className={styles.sectionBody}>
          <RevealStack tag="section" gap={3} disabled>
            <SectionHeader label="Test fixture" />
            <div className={styles.card}>
              <Text>
                <code>disabled</code> skips the observer entirely — useful for
                deterministic snapshot tests without IntersectionObserver
                mocks.
              </Text>
            </div>
          </RevealStack>
        </div>
      </section>
    </main>
  );
}
