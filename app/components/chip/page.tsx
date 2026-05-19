'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Chip } from '@/components/molecules/Chip';
import { Heading } from '@/components/typography/Heading';
import styles from './page.module.scss';

const STATUSES = [
  'Wszystkie',
  'Zakolejkowane',
  'W trakcie',
  'Sprawdzane',
  'Zrealizowane',
  'Anulowane',
] as const;

export default function ChipPlaygroundPage() {
  const [active, setActive] = useState<string[]>(['Wszystkie']);

  const toggle = (label: string) =>
    setActive((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label],
    );

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          Chip
        </Heading>
        <p className={styles.intro}>
          Pill-shaped molecule with two render modes: <code>interactive</code> (default —{' '}
          <code>{'<button aria-pressed>'}</code>) and <code>interactive={'{false}'}</code> (display
          — <code>{'<span>'}</code>). Use interactive for filter rows where users toggle multiple
          states; use display for read-only status indicators inside summary surfaces.
        </p>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          1. Interactive — controlled filter row
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.row}>
            {STATUSES.map((label) => (
              <Chip
                key={label}
                pressed={active.includes(label)}
                onPressedChange={() => toggle(label)}
              >
                {label}
              </Chip>
            ))}
          </div>
          <p className={styles.bodyText}>
            Multi-select filter pattern. Each Chip is a native{' '}
            <code>{'<button aria-pressed>'}</code> — keyboard (Space / Enter) toggles. Default tone{' '}
            <code>brand</code> — pressed chip lifts to brand-subtle background + brand-strong text.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          2. Sizes (sm / md)
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.row}>
            <Chip pressed={false} size="sm">
              Compact
            </Chip>
            <Chip pressed size="sm">
              Pressed sm
            </Chip>
            <Chip pressed={false} size="md">
              Default md
            </Chip>
            <Chip pressed size="md">
              Pressed md
            </Chip>
          </div>
          <p className={styles.bodyText}>
            Two sizes — <code>sm</code> (0.7rem font, dense filter rows) and <code>md</code>{' '}
            (default, denser content rows). Both grow to 44×44 minimum on coarse pointers per{' '}
            <code>--size-touch-min</code> token.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          3. Tones (brand / default)
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.row}>
            <Chip pressed tone="brand">
              Brand pressed (default)
            </Chip>
            <Chip pressed tone="default">
              Default pressed
            </Chip>
          </div>
          <p className={styles.bodyText}>
            <code>tone=&quot;default&quot;</code> swaps the pressed state to a neutral fill — useful
            for filter rows where the active state should not compete with brand CTAs elsewhere on
            the page.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          4. With status dot
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.row}>
            <Chip pressed={false} dot dotColor="success">
              Online
            </Chip>
            <Chip pressed={false} dot dotColor="warning">
              Pending
            </Chip>
            <Chip pressed={false} dot dotColor="error">
              Failed
            </Chip>
            <Chip pressed={false} dot dotColor="info">
              EU-DACH
            </Chip>
            <Chip pressed={false} dot dotColor="muted">
              Idle
            </Chip>
            <Chip pressed={false} dot dotColor="brand">
              Featured
            </Chip>
          </div>
          <p className={styles.bodyText}>
            Decorative leading dot (<code>aria-hidden=&quot;true&quot;</code>). Six color tiers —
            meaning lives in the chip text, dot adds visual categorisation only.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          5. Display-only variant
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.row}>
            <Chip interactive={false} pressed dot dotColor="success">
              Online
            </Chip>
            <Chip interactive={false} dot dotColor="info">
              EU-DACH
            </Chip>
            <Chip interactive={false} pressed tone="default">
              VIP customer
            </Chip>
          </div>
          <p className={styles.bodyText}>
            <code>interactive={'{false}'}</code> renders a <code>{'<span>'}</code> with no toggle
            semantics — used for read-only status indicators inside summary surfaces (e.g. scope
            chips, profile bands). Touch-target expansion is suppressed (display chips are
            decorative, not tap targets).
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          6. Disabled
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.row}>
            <Chip pressed={false} disabled>
              Soon
            </Chip>
            <Chip pressed disabled>
              Locked
            </Chip>
          </div>
          <p className={styles.bodyText}>
            Native <code>disabled</code> — opacity reduced, cursor <code>not-allowed</code>, removed
            from Tab order. Pressed state remains visible (so users see what state the disabled
            filter would apply if unlocked).
          </p>
        </div>
      </section>
    </main>
  );
}
