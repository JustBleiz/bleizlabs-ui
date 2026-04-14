'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Checkbox } from '@/components/interactive/Checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/interactive/RadioGroup';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function SelectionPlaygroundPage() {
  const [terms, setTerms] = useState(false);
  const [plan, setPlan] = useState('pro');

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          Checkbox + RadioGroup
        </Heading>
        <Text className={styles.intro}>
          Phase 4 I4 / I5. Native form inputs visually hidden under
          custom-styled boxes. Animations: checkmark scale-in for
          Checkbox, radioFill dot for RadioGroupItem (both keyframes from
          E03). Both client components for controlled / uncontrolled state.
        </Text>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Checkbox &mdash; uncontrolled
        </Heading>
        <Checkbox name="newsletter" defaultChecked>
          Send me product updates
        </Checkbox>
        <Checkbox name="marketing">
          Send me marketing emails
        </Checkbox>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Checkbox &mdash; controlled with required
        </Heading>
        <Checkbox
          name="terms"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          required
        >
          I accept the terms of service
        </Checkbox>
        <Text variant="caption" color="muted">
          Current state: {terms ? 'accepted' : 'not accepted'}
        </Text>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Checkbox &mdash; disabled
        </Heading>
        <Checkbox name="locked" disabled defaultChecked>
          Locked option
        </Checkbox>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          RadioGroup &mdash; controlled
        </Heading>
        <RadioGroup name="plan" value={plan} onValueChange={setPlan}>
          <RadioGroupItem
            value="free"
            title="Free"
            description="Basic features, 1 user"
          />
          <RadioGroupItem
            value="pro"
            title="Pro"
            description="$10/mo — all features, 5 users"
          />
          <RadioGroupItem
            value="team"
            title="Team"
            description="$25/user/mo — unlimited users + SSO"
          />
        </RadioGroup>
        <Text variant="caption" color="muted">
          Selected: {plan}
        </Text>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          RadioGroup &mdash; uncontrolled with disabled item
        </Heading>
        <RadioGroup name="shipping" defaultValue="standard">
          <RadioGroupItem
            value="standard"
            title="Standard shipping"
            description="3-5 business days"
          />
          <RadioGroupItem
            value="express"
            title="Express shipping"
            description="1-2 business days (+$10)"
          />
          <RadioGroupItem
            value="overnight"
            title="Overnight"
            description="Currently unavailable in your region"
            disabled
          />
        </RadioGroup>
      </section>
    </main>
  );
}
