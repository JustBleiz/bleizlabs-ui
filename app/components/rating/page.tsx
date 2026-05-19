'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Rating } from '@/components/interactive/Rating';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Button } from '@/components/interactive/Button';
import styles from './page.module.scss';

export default function RatingPlaygroundPage() {
  const [controlled, setControlled] = useState(3);
  const [submitted, setSubmitted] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitted(String(data.get('score') ?? ''));
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          Rating
        </Heading>
        <p className={styles.intro}>
          APG <code>radio-rating</code> star input — radiogroup with roving tabindex, Arrow / Home /
          End / Space / Enter keyboard model. Half-star fractional rendering in{' '}
          <code>readOnly</code> for system-computed averages. Hidden form input for native submit.
          Klocek-discipline: 8 props max, single-concept primitive, data- shape neutral (
          <code>value: number</code>).
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Default — 5 stars, uncontrolled
        </Heading>
        <Text variant="small" color="secondary">
          <code>defaultValue=4</code>. Click to change, second click clears (allowClear default
          true).
        </Text>
        <div className={styles.row}>
          <Rating aria-label="Default rating" defaultValue={4} />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Controlled with live read-out
        </Heading>
        <Text variant="small" color="secondary">
          External state owns <code>value</code>; component fires <code>onChange</code> on every
          commit. Buttons jump to specific values to demonstrate sync.
        </Text>
        <div className={styles.row}>
          <Rating aria-label="Controlled rating" value={controlled} onChange={setControlled} />
          <span className={styles.live}>
            Current value: <strong>{controlled}</strong>
          </span>
          <Button variant="secondary" size="sm" onClick={() => setControlled(0)}>
            Clear
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setControlled(5)}>
            Set 5
          </Button>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Sizes — sm / md (default) / lg
        </Heading>
        <div className={styles.row}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size} className={styles.cell}>
              <span className={styles.caption}>size=&quot;{size}&quot;</span>
              <Rating aria-label={`Rating ${size}`} size={size} defaultValue={3} />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. Custom max — 10 stars
        </Heading>
        <Text variant="small" color="secondary">
          <code>max=10</code> for finer-grained scales (driver ratings, NPS-style scoring). Roving
          tabindex still scopes to one tab stop.
        </Text>
        <div className={styles.row}>
          <Rating aria-label="10-point rating" max={10} defaultValue={7} />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. readOnly with fractional value (3.7)
        </Heading>
        <Text variant="small" color="secondary">
          Half-star + partial fills via clip-path. No keyboard interaction, no hover preview, no
          cursor pointer. Use for displaying computed averages (e.g. product review aggregates).
        </Text>
        <div className={styles.row}>
          <Rating aria-label="Average rating" value={3.7} readOnly />
          <span className={styles.live}>3.7 / 5.0 (computed average)</span>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          6. allowClear disabled
        </Heading>
        <Text variant="small" color="secondary">
          <code>allowClear=false</code> — clicking the currently-selected star is a no-op. Use when
          the consumer requires a non-zero rating (e.g. mandatory feedback).
        </Text>
        <div className={styles.row}>
          <Rating aria-label="Required rating" defaultValue={3} allowClear={false} />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          7. Form integration — hidden input
        </Heading>
        <Text variant="small" color="secondary">
          When <code>name</code> is set, a hidden <code>&lt;input&gt;</code> mirrors the value so
          native form submission picks it up.
        </Text>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            <Text variant="small" color="secondary">
              Score
            </Text>
            <Rating aria-label="Score" name="score" defaultValue={4} />
          </label>
          <Button type="submit" variant="primary" size="sm">
            Submit
          </Button>
          {submitted !== null && (
            <span className={styles.live}>
              Submitted: <strong>{submitted}</strong>
            </span>
          )}
        </form>
      </section>
    </main>
  );
}
