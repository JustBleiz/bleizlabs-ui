'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Form } from '@/components/complex/Form';
import { Button } from '@/components/interactive/Button';
import { Input } from '@/components/interactive/Input';
import { Textarea } from '@/components/interactive/Textarea';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Stack } from '@/components/layout/Stack';
import { Inline } from '@/components/layout/Inline';
import { Kbd } from '@/components/specialized/Kbd';
import styles from './page.module.scss';

export default function FormPlayground() {
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [serverActionResult, setServerActionResult] = useState<string | null>(
    null,
  );

  const handleBasicSubmit = (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    setSubmitMessage(
      `Submitted: ${typeof email === 'string' ? email : '(no value)'}`,
    );
  };

  const handleNoValidateSubmit = (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const username = formData.get('username') as string | null;
    if (!username || username.length < 3) {
      setServerActionResult('FAIL: username must be ≥3 chars (custom check)');
      return;
    }
    setServerActionResult(`OK (custom validated): ${username}`);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="2xl">
          Form
        </Heading>
        <Text variant="lead" color="muted">
          Accessible form root using the native Constraint Validation API.
          Zero coupling to react-hook-form — browser-native validation works
          out of the box, with <code>FormContext</code> exposed for the
          upcoming <code>&lt;Field&gt;</code> integration. Compound exports{' '}
          <code>Form</code> + <code>Form.Submit</code>.
        </Text>
      </header>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          1. Native validation (default)
        </Heading>
        <Text variant="body" color="muted">
          Browser fires native validation on submit. <code>required</code>{' '}
          and <code>type=&quot;email&quot;</code> drive UX without any
          custom logic. <code>onSubmit</code> only fires after validity
          passes.
        </Text>
        <div className={styles.demo}>
          <Form
            aria-label="Contact form (basic)"
            onSubmit={handleBasicSubmit}
          >
            <Stack gap={3}>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
              <Inline gap={2}>
                <Form.Submit asChild>
                  <Button variant="primary">Send</Button>
                </Form.Submit>
                {submitMessage && (
                  <Text variant="small" color="muted">
                    {submitMessage}
                  </Text>
                )}
              </Inline>
            </Stack>
          </Form>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          2. <code>noValidate</code> — consumer-owned validation
        </Heading>
        <Text variant="body" color="muted">
          Browser-native validation suppressed. <code>onSubmit</code> fires
          regardless of validity — consumer is responsible for its own
          checks. Useful when layering zod / react-hook-form on top.
        </Text>
        <div className={styles.demo}>
          <Form
            aria-label="Custom validated form"
            noValidate
            onSubmit={handleNoValidateSubmit}
          >
            <Stack gap={3}>
              <Input
                name="username"
                type="text"
                required
                minLength={3}
              />
              <Inline gap={2}>
                <Form.Submit asChild>
                  <Button variant="primary">Validate</Button>
                </Form.Submit>
                {serverActionResult && (
                  <Text variant="small" color="muted">
                    {serverActionResult}
                  </Text>
                )}
              </Inline>
            </Stack>
          </Form>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          3. Compound — multiple field types
        </Heading>
        <Text variant="body" color="muted">
          Browser-native constraints across multiple input types: required,
          pattern, minLength, type=tel.
        </Text>
        <div className={styles.demo}>
          <Form
            aria-label="Sign-up form"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const obj = Object.fromEntries(fd.entries());
              setSubmitMessage(JSON.stringify(obj));
            }}
          >
            <Stack gap={4}>
              <Input
                name="name"
                type="text"
                required
                placeholder="Jane Doe"
              />
              <Input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
              <Input
                name="phone"
                type="tel"
                pattern="[+0-9 \-()]+"
                placeholder="+48 123 456 789"
              />
              <Textarea
                label="Bio (optional)"
                name="bio"
                rows={3}
                maxLength={200}
                placeholder="A short introduction..."
              />
              <Form.Submit asChild>
                <Button variant="primary">Create account</Button>
              </Form.Submit>
            </Stack>
          </Form>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          4. Native <code>&lt;button&gt;</code> fallback (no <code>asChild</code>)
        </Heading>
        <Text variant="body" color="muted">
          When <code>Form.Submit</code> renders without <code>asChild</code>,
          it ships a baseline brand-styled button — handy for quick demos
          or when consumer doesn&apos;t need a full lib Button.
        </Text>
        <div className={styles.demo}>
          <Form
            aria-label="Quick form (no asChild)"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitMessage('Native button submitted');
            }}
          >
            <Stack gap={3}>
              <Input
                name="question"
                type="text"
                required
                placeholder="What's on your mind?"
              />
              <Form.Submit>Send</Form.Submit>
            </Stack>
          </Form>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          Keyboard interactions
        </Heading>
        <ul className={styles.keyList}>
          <li>
            <Kbd>Tab</Kbd> &mdash; move forward through fields + submit
            button (native browser behavior)
          </li>
          <li>
            <Kbd>Shift+Tab</Kbd> &mdash; move backward through fields
          </li>
          <li>
            <Kbd>Enter</Kbd> &mdash; submit form (when focus is on a
            single-line input or the submit button)
          </li>
          <li>
            <Kbd>Esc</Kbd> &mdash; clear native validation popup (when
            shown by browser)
          </li>
        </ul>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          Notes for <code>&lt;Field&gt;</code> integration
        </Heading>
        <Text variant="body" color="muted">
          <code>Form</code> exposes <code>useFormContext()</code> +{' '}
          <code>FormContextValue</code> &mdash; the upcoming{' '}
          <code>&lt;Field&gt;</code> component (separate ADD per spec) will
          consume these to wire <code>aria-describedby</code> +{' '}
          <code>Field.Message match=&quot;valueMissing&quot;</code> conditional
          renders. Until <code>&lt;Field&gt;</code> ships, consumers wire
          fields via plain <code>Input</code> (built-in label) + native
          <code>required</code>/<code>pattern</code>/etc. as shown above.
        </Text>
      </section>
    </main>
  );
}
