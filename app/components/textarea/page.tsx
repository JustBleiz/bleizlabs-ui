'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Textarea } from '@/components/interactive/Textarea';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function TextareaPlaygroundPage() {
  const [bio, setBio] = useState<string>('');

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← back</Link>
        <Heading level={1} size="4xl">Textarea</Heading>
        <p className={styles.intro}>
          Multi-line text form input with auto-coupled Label, error / helper text wiring,
          and configurable resize behavior. Renders own internal Label via the `label` prop —
          for standalone Label usage see the Label playground.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">1. Default — label + name + rows=4</Heading>
        <div className={styles.field}>
          <Textarea label="Bio" name="bio" rows={4} placeholder="Tell us about yourself..." />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">2. Resize variants</Heading>
        <Text variant="caption" color="muted">
          Drag the corner handle in each textarea to confirm the allowed resize axis.
        </Text>
        <div className={styles.fieldGrid}>
          <Textarea label="resize='none'" name="resize-none" resize="none" rows={3} />
          <Textarea label="resize='vertical' (default)" name="resize-vertical" resize="vertical" rows={3} />
          <Textarea label="resize='horizontal'" name="resize-horizontal" resize="horizontal" rows={3} />
          <Textarea label="resize='both'" name="resize-both" resize="both" rows={3} />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">3. With helperText</Heading>
        <div className={styles.field}>
          <Textarea
            label="Comments"
            name="comments"
            rows={4}
            helperText="Maximum 500 characters. Markdown is supported."
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">4. Error state</Heading>
        <Text variant="caption" color="muted">
          The `error` prop renders below the textarea, sets `aria-invalid`, and links via `aria-describedby`.
        </Text>
        <div className={styles.field}>
          <Textarea
            label="Feedback"
            name="feedback"
            rows={4}
            defaultValue="Too short"
            error="Feedback must be at least 20 characters."
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">5. Required + disabled</Heading>
        <div className={styles.fieldGrid}>
          <Textarea
            label="Description"
            name="description-required"
            rows={3}
            required
            helperText="Required field — Label shows the * indicator."
          />
          <Textarea
            label="Notes (read-only)"
            name="notes-disabled"
            rows={3}
            disabled
            defaultValue="This field is currently disabled."
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">6. hideLabel — visually hidden</Heading>
        <Text variant="caption" color="muted">
          Label stays in the accessibility tree (sr-only) — screen readers announce it,
          sighted users see only the textarea. Use sparingly when the surrounding context already
          names the field.
        </Text>
        <div className={styles.field}>
          <Textarea
            label="Search query"
            name="search-hidden"
            rows={2}
            hideLabel
            placeholder="Type to search..."
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">7. Controlled with live counter</Heading>
        <Text variant="caption" color="muted">
          Demonstrates `value` + `onChange` controlled mode. Helper text reflects the current length.
        </Text>
        <div className={styles.field}>
          <Textarea
            label="Bio (controlled)"
            name="bio-controlled"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            helperText={`${bio.length} characters typed`}
          />
        </div>
      </section>
    </main>
  );
}
