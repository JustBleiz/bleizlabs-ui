'use client';

import { useState } from 'react';
import {
  TimePicker,
  TimePickerInput,
  TimePickerContent,
} from '@/components/complex/TimePicker';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import { Button } from '@/components/interactive/Button';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

export default function TimePickerPlayground() {
  // USE CASE 2: 12h controlled
  const [twelveH, setTwelveH] = useState<string | null>('14:30');

  // USE CASE 3: withSeconds
  const [withSec, setWithSec] = useState<string | null>('09:00:30');

  // USE CASE 4: Step=15
  const [stepped, setStepped] = useState<string | null>('10:00');

  // USE CASE 5: Min/max
  const [constrained, setConstrained] = useState<string | null>('09:00');

  // USE CASE 6: Form
  const [submitted, setSubmitted] = useState<string | null>(null);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSubmitted(`appointment=${String(data.get('appointment') ?? '(empty)')}`);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          TimePicker
        </Heading>
        <Text variant="lead" color="muted">
          Combobox input + popover with scrollable listboxes per WAI-ARIA APG
          `/combobox/` + `/listbox/`. Type a time directly (Enter to commit)
          OR open the popover (Alt+ArrowDown / click) and pick hour /
          minute / seconds / AM-PM from columns. Step filters minute
          listbox content. Always emits 24h ISO regardless of display
          cycle.
        </Text>
        <Inline gap={2} wrap>
          <Badge color="success">APG combobox + listbox</Badge>
          <Badge color="info">Zero deps</Badge>
          <Badge color="default">12h / 24h</Badge>
          <Badge color="default">Step filter</Badge>
          <Badge color="default">Min/max clamp</Badge>
        </Inline>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Basic 24h">
        <Heading level={2} size="lg">
          1. Basic 24h (uncontrolled)
        </Heading>
        <Text variant="body" color="muted">
          Alt+ArrowDown or click input to open. ArrowUp/Down inside a column
          navigates options; Enter commits + advances to next column.
        </Text>
        <div className={styles.demo}>
          <TimePicker defaultValue="08:30" hourCycle="24h">
            <TimePickerInput aria-label="Start time" />
            <TimePickerContent />
          </TimePicker>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="12h AM/PM">
        <Heading level={2} size="lg">
          2. 12h with AM/PM (controlled)
        </Heading>
        <Text variant="body" color="muted">
          AM/PM listbox renders at logical-end of the group in 12h mode.
          Hour listbox shows 1-12. Emitted value always 24h ISO.
        </Text>
        <div className={styles.demo}>
          <TimePicker
            value={twelveH}
            onValueChange={setTwelveH}
            hourCycle="12h"
            locale="en-US"
          >
            <TimePickerInput aria-label="Meeting time" />
            <TimePickerContent />
          </TimePicker>
        </div>
        <Text variant="caption" color="muted">
          Current 24h ISO: <code>{twelveH ?? '(empty)'}</code>
        </Text>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="With seconds">
        <Heading level={2} size="lg">
          3. With seconds
        </Heading>
        <Text variant="body" color="muted">
          <code>withSeconds</code> adds a third listbox column.
        </Text>
        <div className={styles.demo}>
          <TimePicker
            value={withSec}
            onValueChange={setWithSec}
            hourCycle="24h"
            withSeconds
          >
            <TimePickerInput aria-label="Race finish" />
            <TimePickerContent />
          </TimePicker>
        </div>
        <Text variant="caption" color="muted">
          Current ISO: <code>{withSec ?? '(empty)'}</code>
        </Text>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Step 15">
        <Heading level={2} size="lg">
          4. Step = 15 minutes
        </Heading>
        <Text variant="body" color="muted">
          Minute listbox shows only step-aligned options: 00, 15, 30, 45.
          Out-of-step controlled value snaps to nearest step on open.
        </Text>
        <div className={styles.demo}>
          <TimePicker
            value={stepped}
            onValueChange={setStepped}
            hourCycle="24h"
            step={15}
          >
            <TimePickerInput aria-label="Slot" />
            <TimePickerContent />
          </TimePicker>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Min/max">
        <Heading level={2} size="lg">
          5. Min / max bounds
        </Heading>
        <Text variant="body" color="muted">
          <code>min=&quot;09:00&quot;</code>,{' '}
          <code>max=&quot;17:00&quot;</code>. Committed value clamps to range
          at commit boundary.
        </Text>
        <div className={styles.demo}>
          <TimePicker
            value={constrained}
            onValueChange={setConstrained}
            hourCycle="24h"
            min="09:00"
            max="17:00"
          >
            <TimePickerInput aria-label="Office hours" />
            <TimePickerContent />
          </TimePicker>
        </div>
        <Text variant="caption" color="muted">
          Current: <code>{constrained ?? '(empty)'}</code>
        </Text>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Form integration">
        <Heading level={2} size="lg">
          6. Form integration + required
        </Heading>
        <Text variant="body" color="muted">
          <code>name</code> renders a hidden input; <code>required</code>
          surfaces native <code>:invalid</code> on submit when empty.
        </Text>
        <form className={styles.formDemo} onSubmit={handleSubmit} noValidate>
          <TimePicker
            name="appointment"
            defaultValue="10:00"
            hourCycle="24h"
            required
          >
            <TimePickerInput aria-label="Appointment" />
            <TimePickerContent />
          </TimePicker>
          <Inline gap={2}>
            <Button type="submit" variant="primary">
              Submit
            </Button>
          </Inline>
          {submitted ? (
            <Text variant="caption" color="muted">
              Submitted: <code>{submitted}</code>
            </Text>
          ) : null}
        </form>
      </section>
    </main>
  );
}
