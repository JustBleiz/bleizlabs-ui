'use client';

import { useState } from 'react';
import { TagsInput, type TagRejection } from '@/components/interactive/TagsInput';
import { Form, FormSubmit } from '@/components/complex/Form';
import { Field, FieldLabel, FieldMessage } from '@/components/complex/Field';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

export default function TagsInputPlayground() {
  // USE CASE 1: Basic uncontrolled
  // (uncontrolled — no state wiring)

  // USE CASE 2: Controlled with maxTags
  const [limited, setLimited] = useState<string[]>(['react', 'next.js']);
  const [limitRejects, setLimitRejects] = useState<TagRejection[]>([]);

  // USE CASE 3: Validate fn (lowercase only)
  const [lowercase, setLowercase] = useState<string[]>([]);
  const [lowercaseRejects, setLowercaseRejects] = useState<TagRejection[]>([]);

  // USE CASE 4: Allow duplicates
  const [dups, setDups] = useState<string[]>([]);

  // USE CASE 5: Form integration
  const [submitted, setSubmitted] = useState<string | null>(null);

  // USE CASE 6: Paste-split demo (uncontrolled — type or paste "a, b, c")

  // USE CASE 7: Disabled state (preset value, no interaction)

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          TagsInput
        </Heading>
        <Text color="secondary">
          Freeform tag input. Type and press Enter / comma to commit. Backspace on empty removes the
          last chip. Paste a delimited string to batch-add. Zero deps — native input + chip render.
        </Text>
        <Inline gap={2} wrap>
          <Badge color="info">interactive/TagsInput</Badge>
          <Badge color="success">Phase 10</Badge>
          <Badge>Zero deps</Badge>
        </Inline>
      </header>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Basic uncontrolled">
        <Heading level={2} size="lg">
          1. Basic uncontrolled
        </Heading>
        <Text color="secondary">
          Defaults — Enter or comma commits, Backspace removes last, paste splits on
          comma/semicolon/newline.
        </Text>
        <div className={styles.demo}>
          <TagsInput
            aria-label="Basic tags"
            defaultValue={['react', 'next.js']}
            placeholder="Type and press Enter..."
          />
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Controlled with limit">
        <Heading level={2} size="lg">
          2. Controlled with maxTags=5
        </Heading>
        <Text color="secondary">
          Controlled value + <code>maxTags</code> cap. Excess attempts rejected with{' '}
          <code>too-many</code> reason.
        </Text>
        <div className={styles.demo}>
          <TagsInput
            aria-label="Limited tags"
            value={limited}
            onChange={setLimited}
            onReject={setLimitRejects}
            maxTags={5}
            placeholder="Up to 5..."
          />
          <Inline gap={2}>
            <Badge>{limited.length} / 5</Badge>
            {limitRejects.length > 0 && (
              <Badge color="warning">{limitRejects.length} rejected</Badge>
            )}
          </Inline>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Validate function">
        <Heading level={2} size="lg">
          3. Validate (lowercase only)
        </Heading>
        <Text color="secondary">
          <code>validate</code> returns a string error message — surfaces in{' '}
          <code>TagRejection.message</code>.
        </Text>
        <div className={styles.demo}>
          <TagsInput
            aria-label="Lowercase tags"
            value={lowercase}
            onChange={setLowercase}
            onReject={setLowercaseRejects}
            validate={(tag) => tag === tag.toLowerCase() || 'Must be lowercase'}
            placeholder="Try 'React' to see rejection..."
          />
          {lowercaseRejects.length > 0 && (
            <Inline gap={2} wrap>
              <Badge color="warning">Rejected</Badge>
              <Text color="muted" variant="small">
                {lowercaseRejects[0]?.value}:{' '}
                {lowercaseRejects[0]?.message ?? lowercaseRejects[0]?.reasons.join(', ')}
              </Text>
            </Inline>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Allow duplicates">
        <Heading level={2} size="lg">
          4. Allow duplicates
        </Heading>
        <Text color="secondary">
          Default rejects duplicates. <code>allowDuplicates</code> opt-in accepts them.
        </Text>
        <div className={styles.demo}>
          <TagsInput
            aria-label="Allow duplicate tags"
            value={dups}
            onChange={setDups}
            allowDuplicates
            placeholder="Type 'a' twice — both kept..."
          />
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Form integration">
        <Heading level={2} size="lg">
          5. Form integration (required + FormData)
        </Heading>
        <Text color="secondary">
          Hidden <code>&lt;input type=&quot;hidden&quot;&gt;</code> serializes as comma-joined
          string. Consumer reads via <code>formData.get(name).split(&apos;,&apos;)</code>.
        </Text>
        <div className={styles.formDemo}>
          <Form
            aria-label="Tags form"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const raw = data.get('keywords');
              if (typeof raw === 'string' && raw.length > 0) {
                setSubmitted(raw);
              } else {
                setSubmitted(null);
              }
            }}
          >
            <Field name="keywords">
              <FieldLabel>Keywords (required)</FieldLabel>
              <TagsInput
                name="keywords"
                aria-label="Keywords"
                required
                placeholder="Add at least one..."
              />
              <FieldMessage match="valueMissing">At least one keyword required</FieldMessage>
            </Field>
            <FormSubmit>Submit</FormSubmit>
            {submitted != null && (
              <Inline gap={2}>
                <Badge color="success">Submitted</Badge>
                <Text color="muted" variant="small">
                  {submitted}
                </Text>
              </Inline>
            )}
          </Form>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Paste split">
        <Heading level={2} size="lg">
          6. Paste split
        </Heading>
        <Text color="secondary">
          Paste <code>red, green, blue</code> (with commas) — each becomes its own chip.
        </Text>
        <div className={styles.demo}>
          <TagsInput aria-label="Paste split tags" placeholder="Paste 'red, green, blue' here..." />
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Disabled state">
        <Heading level={2} size="lg">
          7. Disabled state
        </Heading>
        <Text color="secondary">
          <code>disabled</code> blocks typing and chip removal. Wrapper remains visible for context.
        </Text>
        <div className={styles.demo}>
          <TagsInput aria-label="Disabled tags" defaultValue={['readonly', 'archived']} disabled />
        </div>
      </section>
    </main>
  );
}
