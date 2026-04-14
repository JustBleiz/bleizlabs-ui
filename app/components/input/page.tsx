'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Input } from '@/components/interactive/Input';
import { Textarea } from '@/components/interactive/Textarea';
import { Label } from '@/components/interactive/Label';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default function InputPlaygroundPage() {
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const showEmailError = email.length > 0 && !email.includes('@');

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          Input + Label + Textarea
        </Heading>
        <Text className={styles.intro}>
          Phase 4 I2 / I2.5 / I3. Client components for form state
          (controlled or uncontrolled). Auto-generated id couples Label
          via htmlFor; aria-invalid + aria-describedby wire up errors.
        </Text>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Standalone Label
        </Heading>
        <div className={styles.row}>
          <Label htmlFor="demo-1">Plain label</Label>
          <Label htmlFor="demo-2" required>
            Required label
          </Label>
          <Label htmlFor="demo-3" disabled>
            Disabled label
          </Label>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Input &mdash; uncontrolled
        </Heading>
        <Input
          label="Full name"
          name="name"
          placeholder="Jane Doe"
          defaultValue=""
          helperText="As shown on your ID"
        />
        <Input
          label="Username"
          name="username"
          placeholder="jane"
          required
        />
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Input &mdash; controlled with error
        </Heading>
        <Input
          label="Email address"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={showEmailError ? 'Email must contain @' : undefined}
          required
        />
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Input &mdash; with icon
        </Heading>
        <Input
          label="Search"
          name="q"
          type="search"
          placeholder="Search components..."
          startIcon={<SearchIcon />}
        />
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Input &mdash; disabled
        </Heading>
        <Input
          label="API key"
          name="apiKey"
          defaultValue="sk-***************"
          disabled
        />
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Textarea &mdash; controlled
        </Heading>
        <Textarea
          label="Bio"
          name="bio"
          rows={5}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          helperText={`${bio.length} characters`}
          placeholder="Tell us about yourself..."
        />
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Textarea &mdash; with error + no resize
        </Heading>
        <Textarea
          label="Comments"
          name="comments"
          rows={3}
          resize="none"
          error="Comments must be at least 10 characters"
          required
        />
      </section>
    </main>
  );
}
