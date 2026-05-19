'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Field } from '@/components/complex/Field';
import { Form } from '@/components/complex/Form';
import { Button } from '@/components/interactive/Button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Stack } from '@/components/layout/Stack';
import styles from './page.module.scss';

export default function FieldPlaygroundPage() {
  const [submitted, setSubmitted] = useState<string>('');
  const [serverInvalid, setServerInvalid] = useState(false);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          Field
        </Heading>
        <p className={styles.intro}>
          Accessible form-row compound — `Field` + `Field.Label` + `Field.Control` +
          `Field.Description` + `Field.Message`. Decoupled from any form library; uses native HTML5
          Constraint Validation API. Integrates optionally with `&lt;Form&gt;` (form-id prefix,
          hasSubmitted gate, central validity reporting); also works standalone. Klocek discipline:
          2 root props (name + serverInvalid), 5 sub-exports, single semantic compound, zero
          auto-wrap.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Inside Form (recommended) — messages gated by hasSubmitted
        </Heading>
        <Text variant="small" color="secondary">
          Fields silent until first submit attempt; then live-update on input changes. Native
          browser validation runs on submit.
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <Form
              aria-label="Sign-up form"
              onSubmit={(e) => {
                const data = new FormData(e.currentTarget);
                setSubmitted(JSON.stringify(Object.fromEntries(data)));
              }}
            >
              <Stack gap={4}>
                <Field name="email">
                  <Field.Label>Email</Field.Label>
                  <Field.Control>
                    <input type="email" required className={styles.input} />
                  </Field.Control>
                  <Field.Description>We never share your email.</Field.Description>
                  <Field.Message match="valueMissing">Email is required</Field.Message>
                  <Field.Message match="typeMismatch">Enter a valid email address</Field.Message>
                </Field>

                <Field name="username">
                  <Field.Label>Username</Field.Label>
                  <Field.Control>
                    <input
                      type="text"
                      minLength={3}
                      maxLength={20}
                      required
                      className={styles.input}
                    />
                  </Field.Control>
                  <Field.Description>3–20 characters.</Field.Description>
                  <Field.Message match="valueMissing">Username is required</Field.Message>
                  <Field.Message match="tooShort">
                    Username must be at least 3 characters
                  </Field.Message>
                  <Field.Message match="tooLong">
                    Username cannot exceed 20 characters
                  </Field.Message>
                </Field>

                <Form.Submit asChild>
                  <Button type="submit">Sign up</Button>
                </Form.Submit>
              </Stack>
            </Form>
            {submitted ? (
              <Text variant="small" color="muted">
                Submitted: <code>{submitted}</code>
              </Text>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Standalone Field (no Form) — messages show on every input event
        </Heading>
        <Text variant="small" color="secondary">
          When no surrounding Form is present, Field treats every input as post-submit (no
          eager-display gate). Useful for live-validation UI like search filters or settings forms.
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <Field name="search">
              <Field.Label>Search query</Field.Label>
              <Field.Control>
                <input type="text" minLength={2} className={styles.input} />
              </Field.Control>
              <Field.Description>Type at least 2 characters.</Field.Description>
              <Field.Message match="tooShort">Too short</Field.Message>
            </Field>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Server-side error (serverInvalid + customError match)
        </Heading>
        <Text variant="small" color="secondary">
          After server-side validation fails, set <code>serverInvalid</code> on the relevant Field.
          The corresponding <code>match=&quot;customError&quot;</code> Message renders + control
          gets <code>aria-invalid=&quot;true&quot;</code>.
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <Stack gap={3}>
              <Field name="email-server" serverInvalid={serverInvalid}>
                <Field.Label>Email</Field.Label>
                <Field.Control>
                  <input type="email" defaultValue="taken@example.com" className={styles.input} />
                </Field.Control>
                <Field.Message match="customError">This email is already taken</Field.Message>
              </Field>
              <Button type="button" onClick={() => setServerInvalid((v) => !v)}>
                Toggle serverInvalid ({serverInvalid ? 'true' : 'false'})
              </Button>
            </Stack>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. Pattern + range constraints
        </Heading>
        <Text variant="small" color="secondary">
          Native CV API supports <code>pattern</code>, <code>min</code>/<code>max</code>,{' '}
          <code>step</code>. Field.Message surfaces the matching flag.
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <Form aria-label="Pattern + range demo">
              <Stack gap={4}>
                <Field name="zip">
                  <Field.Label>ZIP code (5 digits)</Field.Label>
                  <Field.Control>
                    <input
                      type="text"
                      pattern="\d{5}"
                      placeholder="00000"
                      required
                      className={styles.input}
                    />
                  </Field.Control>
                  <Field.Message match="patternMismatch">
                    ZIP must be exactly 5 digits
                  </Field.Message>
                  <Field.Message match="valueMissing">ZIP is required</Field.Message>
                </Field>

                <Field name="age">
                  <Field.Label>Age (18–120)</Field.Label>
                  <Field.Control>
                    <input type="number" min={18} max={120} className={styles.input} />
                  </Field.Control>
                  <Field.Message match="rangeUnderflow">Must be at least 18</Field.Message>
                  <Field.Message match="rangeOverflow">Must be at most 120</Field.Message>
                </Field>

                <Form.Submit asChild>
                  <Button type="submit">Validate</Button>
                </Form.Submit>
              </Stack>
            </Form>
          </div>
        </div>
      </section>
    </main>
  );
}
