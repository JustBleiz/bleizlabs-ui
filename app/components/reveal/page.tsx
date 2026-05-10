'use client';

import Link from 'next/link';
import { Reveal } from '@/components/display/Reveal';
import { Stack } from '@/components/layout/Stack';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Card } from '@/components/display/Card';
import styles from './page.module.scss';

export default function RevealPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          Reveal + RevealStack
        </Heading>
        <p className={styles.intro}>
          Scroll-triggered IntersectionObserver gate. Pure behavior atom — no
          own CSS. Consumer styles via <code>[data-revealed=&apos;true&apos;]</code>
          {' '}attribute selector. Scroll the page to trigger reveals (each
          section animates only once when it intersects viewport).
        </p>
      </header>

      {/* ============================================================ */}
      {/* SECTION 1 — Above-the-fold immediate (no observer) */}
      {/* ============================================================ */}
      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. <code>immediate</code> — above-the-fold LCP (no observer, no flash)
        </Heading>
        <Text variant="small" color="muted">
          Renders <code>data-revealed=&apos;true&apos;</code> on mount. Use for
          first-fold content where IntersectionObserver delay would cause
          visible flash before reveal.
        </Text>
        <Reveal immediate tag="section" className={styles.demoBox}>
          <Stack gap={2}>
            <Heading level={3} size="lg">
              Hero band
            </Heading>
            <Text>This rendered with reveal already true (no scroll wait).</Text>
          </Stack>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — Default scroll-triggered Reveal */}
      {/* ============================================================ */}
      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Default — scroll-triggered with custom transition
        </Heading>
        <Text variant="small" color="muted">
          Element starts at <code>opacity: 0</code> + slight translate; consumer
          SCSS toggles to revealed state via <code>[data-revealed=&apos;true&apos;]</code>
          {' '}selector. Observer disconnects after first hit.
        </Text>
        <Reveal tag="section" className={styles.demoBoxRevealed}>
          <Stack gap={2}>
            <Heading level={3} size="lg">
              Default scroll reveal
            </Heading>
            <Text>
              Default threshold 0.15 + rootMargin push-up. Consumer-owned
              transition (opacity 0.55s + transform 0.55s).
            </Text>
          </Stack>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — asChild projection onto custom semantic element */}
      {/* ============================================================ */}
      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. <code>asChild</code> — project onto any element via Slot
        </Heading>
        <Text variant="small" color="muted">
          Skip the <code>tag</code> union — wrap any element (custom component,
          tag outside RevealTag union) and merge ref/className/data-attr onto
          it via Slot pattern.
        </Text>
        <Reveal asChild>
          <article className={styles.demoBoxRevealed}>
            <Stack gap={2}>
              <Heading level={3} size="lg">
                Custom &lt;article&gt;
              </Heading>
              <Text>asChild projects observer + data-attr onto this article.</Text>
            </Stack>
          </article>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — Reveal + Stack composition (header + body uniform gap) */}
      {/* ============================================================ */}
      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. <code>&lt;Reveal asChild&gt;&lt;Stack&gt;</code> — section pattern
        </Heading>
        <Text variant="small" color="muted">
          Canonical section header→body pattern: wrap a Stack in Reveal via{' '}
          <code>asChild</code> so the IntersectionObserver attaches to the
          Stack itself.
        </Text>
        <Reveal asChild>
          <Stack gap={3} aria-label="Demo section" className={styles.demoBoxRevealed}>
            <Heading level={3} size="lg">
              Section header
            </Heading>
            <Card padding={4} radius="md">
              <Text>Card 1 — gap 16px above (header → body)</Text>
            </Card>
            <Card padding={4} radius="md">
              <Text>Card 2 — gap 16px above (body → body uniform)</Text>
            </Card>
            <Card padding={4} radius="md">
              <Text>Card 3 — gap 16px above</Text>
            </Card>
          </Stack>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — Reveal+Stack with nested body group (different gap) */}
      {/* ============================================================ */}
      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. Reveal + Stack with nested body group (composition)
        </Heading>
        <Text variant="small" color="muted">
          When body needs tighter rhythm than header→body gap, wrap children
          in own <code>&lt;Stack gap=2&gt;</code>.
        </Text>
        <Reveal asChild>
          <Stack gap={3} className={styles.demoBoxRevealed}>
            <Heading level={3} size="lg">
              Header (16px below)
            </Heading>
            <Stack gap={2}>
              <Card padding={3} radius="sm">
                <Text variant="small">List item 1 (8px tighter rhythm)</Text>
              </Card>
              <Card padding={3} radius="sm">
                <Text variant="small">List item 2</Text>
              </Card>
              <Card padding={3} radius="sm">
                <Text variant="small">List item 3</Text>
              </Card>
            </Stack>
          </Stack>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — disabled prop (test fixtures, no animation) */}
      {/* ============================================================ */}
      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          6. <code>disabled</code> — observer off (test fixtures)
        </Heading>
        <Text variant="small" color="muted">
          Observer never created. <code>data-revealed</code> never set.
          Element stays in pre-reveal state forever (or whatever consumer
          CSS defaults provide). Useful for deterministic test snapshots.
        </Text>
        <Reveal disabled tag="section" className={styles.demoBox}>
          <Stack gap={2}>
            <Heading level={3} size="lg">
              Disabled reveal
            </Heading>
            <Text>
              No observer attached, no data-attr ever set. Stays at consumer
              CSS default (opacity 0 in this demo).
            </Text>
          </Stack>
        </Reveal>
      </section>
    </main>
  );
}
