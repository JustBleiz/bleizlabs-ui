'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Toggle } from '@/components/interactive/Toggle';
import { ToggleGroup } from '@/components/interactive/ToggleGroup';
import { Switch } from '@/components/interactive/Switch';
import { Accordion } from '@/components/interactive/Accordion';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function TogglesPlaygroundPage() {
  const [bold, setBold] = useState(false);
  const [align, setAlign] = useState<string>('left');
  const [format, setFormat] = useState<string[]>(['bold']);
  const [notifications, setNotifications] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          Toggle + ToggleGroup + Switch + Accordion
        </Heading>
        <Text className={styles.intro}>
          Phase 4 I6 / I7 / I8 / I9. State-heavy interactives with
          controlled / uncontrolled support. ToggleGroup reuses the
          joined-group SCSS mixin from ButtonGroup. Switch uses the
          switchSlide thumb pattern (CSS transition on left position).
          Accordion implements the WAI-ARIA APG disclosure pattern with
          aria-expanded + aria-controls + region role.
        </Text>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Toggle &mdash; standalone
        </Heading>
        <div className={styles.row}>
          <Toggle defaultPressed>Default pressed</Toggle>
          <Toggle pressed={bold} onPressedChange={setBold}>
            Bold (controlled: {bold ? 'on' : 'off'})
          </Toggle>
          <Toggle disabled>Disabled</Toggle>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Toggle sizes
        </Heading>
        <div className={styles.row}>
          <Toggle size="sm" defaultPressed>
            Small
          </Toggle>
          <Toggle size="md" defaultPressed>
            Medium
          </Toggle>
          <Toggle size="lg" defaultPressed>
            Large
          </Toggle>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          ToggleGroup &mdash; single (controlled)
        </Heading>
        <ToggleGroup
          type="single"
          value={align}
          onValueChange={setAlign}
          aria-label="Text alignment"
        >
          <Toggle value="left">Left</Toggle>
          <Toggle value="center">Center</Toggle>
          <Toggle value="right">Right</Toggle>
          <Toggle value="justify">Justify</Toggle>
        </ToggleGroup>
        <Text variant="caption" color="muted">
          Selected: {align || 'none'}
        </Text>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          ToggleGroup &mdash; multiple (controlled)
        </Heading>
        <ToggleGroup
          type="multiple"
          value={format}
          onValueChange={setFormat}
          aria-label="Text formatting"
        >
          <Toggle value="bold">B</Toggle>
          <Toggle value="italic">I</Toggle>
          <Toggle value="underline">U</Toggle>
          <Toggle value="strike">S</Toggle>
        </ToggleGroup>
        <Text variant="caption" color="muted">
          Active: {format.length ? format.join(', ') : 'none'}
        </Text>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          ToggleGroup &mdash; vertical detached
        </Heading>
        <ToggleGroup
          type="single"
          defaultValue="grid"
          attached={false}
          orientation="vertical"
          aria-label="Layout"
        >
          <Toggle value="grid">Grid</Toggle>
          <Toggle value="list">List</Toggle>
          <Toggle value="cards">Cards</Toggle>
        </ToggleGroup>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Switch
        </Heading>
        <Switch label="Email notifications" name="emailNotif" defaultChecked />
        <Switch
          label={`Push notifications (${notifications ? 'on' : 'off'})`}
          name="pushNotif"
          checked={notifications}
          onCheckedChange={setNotifications}
        />
        <Switch label="SMS notifications" name="smsNotif" />
        <Switch label="Locked feature" name="locked" disabled defaultChecked />
        <Switch label="Small switch" name="smallSwitch" size="sm" defaultChecked />
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Accordion
        </Heading>
        {[
          {
            q: 'What is bleizlabs-ui?',
            a: 'A universal copy-to-project component library with seed-based design tokens.',
          },
          {
            q: 'How do I install it?',
            a: 'Copy the components folder into your project. Tree-shaking handles the rest.',
          },
          {
            q: 'Does it support dark mode?',
            a: 'Yes — the seed system generates light + dark surface tokens automatically.',
          },
        ].map((item, idx) => (
          <Accordion
            key={item.q}
            question={item.q}
            open={openIndex === idx}
            onOpenChange={(open) => setOpenIndex(open ? idx : null)}
          >
            <Text>{item.a}</Text>
          </Accordion>
        ))}
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Accordion &mdash; uncontrolled, compact
        </Heading>
        <Accordion question="Compact accordion (uncontrolled)" defaultOpen compact>
          <Text>This one manages its own state via defaultOpen.</Text>
        </Accordion>
      </section>
    </main>
  );
}
