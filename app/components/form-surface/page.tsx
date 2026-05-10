'use client';

import Link from 'next/link';
import { FormSurface } from '@/components/presets/FormSurface';
import { CardHeader, CardBody, CardFooter } from '@/components/display/Card';
import { Stack } from '@/components/layout/Stack';
import { Inline } from '@/components/layout/Inline';
import { Button } from '@/components/interactive/Button';
import { Input } from '@/components/interactive/Input';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function FormSurfacePlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← back</Link>
        <Heading level={1} size="4xl">FormSurface</Heading>
        <p className={styles.intro}>
          Semantic <code>&lt;form&gt;</code> wrapper around a Card surface.
          Renders a native form element so browser submission, validation,
          and autofill all work — and uses Card slots
          (<code>CardHeader</code> / <code>CardBody</code> /{' '}
          <code>CardFooter</code>) for visual structure. Consumer composes
          its own typography in each slot.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">1. Basic form — header + body + footer</Heading>
        <FormSurface
          padding={5}
          radius="lg"
          aria-labelledby="basic-form-title"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <CardHeader border>
            <Heading id="basic-form-title" level={2} size="xl">
              Sign in
            </Heading>
            <Text variant="caption" color="muted">
              Use your work email to receive a magic link.
            </Text>
          </CardHeader>
          <CardBody>
            <Stack gap={3}>
              <Input
                aria-label="Email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
              <Input
                aria-label="Password"
                name="password"
                type="password"
                required
                placeholder="Password"
              />
            </Stack>
          </CardBody>
          <CardFooter action>
            <Text variant="small" color="secondary">Forgot your password?</Text>
            <Inline gap={2}>
              <Button variant="ghost" type="button">Cancel</Button>
              <Button variant="primary" type="submit">Sign in</Button>
            </Inline>
          </CardFooter>
        </FormSurface>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">2. Compact form (smaller padding + radius)</Heading>
        <FormSurface
          padding={4}
          radius="md"
          aria-labelledby="compact-form-title"
          onSubmit={(e) => e.preventDefault()}
        >
          <CardHeader>
            <Heading id="compact-form-title" level={2} size="lg">
              Quick search
            </Heading>
          </CardHeader>
          <CardBody>
            <Inline gap={2}>
              <Input
                aria-label="Search query"
                name="q"
                type="search"
                placeholder="Search the catalogue..."
              />
              <Button variant="primary" type="submit">Search</Button>
            </Inline>
          </CardBody>
        </FormSurface>
      </section>
    </main>
  );
}
