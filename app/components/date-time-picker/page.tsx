'use client';

import { useState } from 'react';
import {
  DateTimePicker,
  DateTimePickerInput,
  DateTimePickerContent,
} from '@/components/complex/DateTimePicker';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import { Button } from '@/components/interactive/Button';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

export default function DateTimePickerPlayground() {
  // USE CASE 2: 12h controlled
  const [twelveH, setTwelveH] = useState<Date | null>(new Date(2026, 4, 15, 14, 30));

  // USE CASE 3: withSeconds
  const [withSec, setWithSec] = useState<Date | null>(new Date(2026, 4, 15, 9, 0, 45));

  // USE CASE 4: timeStep=15
  const [stepped, setStepped] = useState<Date | null>(new Date(2026, 4, 15, 10, 0));

  // USE CASE 5: min/max + disabled weekends
  const [constrained, setConstrained] = useState<Date | null>(null);
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  // USE CASE 6: Form
  const [submitted, setSubmitted] = useState<string | null>(null);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSubmitted(`meetingAt=${String(data.get('meetingAt') ?? '(empty)')}`);
  };

  const fmt = (d: Date | null) =>
    d
      ? new Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(d)
      : '—';

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          DateTimePicker
        </Heading>
        <Text variant="lead" color="muted">
          Combobox input + popover with Calendar grid above and inline
          TimeInput below. Three Tab stops inside dialog (Calendar roving
          cell → hour → minute, plus optional seconds + AM/PM). Form
          submission emits ISO 8601 local datetime (`YYYY-MM-DDTHH:MM:SS`,
          no tz suffix — server treats as local wall-clock).
        </Text>
        <Inline gap={2} wrap>
          <Badge color="success">APG combobox + grid + spinbutton</Badge>
          <Badge color="info">Zero deps</Badge>
          <Badge color="default">Single popover surface</Badge>
          <Badge color="default">12h / 24h</Badge>
          <Badge color="default">Min/max + disabled dates</Badge>
        </Inline>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Basic 24h">
        <Heading level={2} size="lg">
          1. Basic 24h (uncontrolled)
        </Heading>
        <Text variant="body" color="muted">
          Alt+ArrowDown opens dialog + focuses Calendar. Click a date or
          press Enter on a cell to commit + Tab into TimeInput to set the
          hour/minute.
        </Text>
        <div className={styles.demo}>
          <DateTimePicker
            defaultValue={new Date(2026, 4, 15, 9, 0)}
            hourCycle="24h"
          >
            <DateTimePickerInput aria-label="Start datetime" />
            <DateTimePickerContent />
          </DateTimePicker>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="12h AM/PM">
        <Heading level={2} size="lg">
          2. 12h with AM/PM (controlled)
        </Heading>
        <Text variant="body" color="muted">
          TimeInput inside dialog renders AM/PM toggle at logical-end.
          Emitted value retains 24h semantics on the Date object.
        </Text>
        <div className={styles.demo}>
          <DateTimePicker
            value={twelveH}
            onValueChange={setTwelveH}
            hourCycle="12h"
            locale="en-US"
          >
            <DateTimePickerInput aria-label="Meeting datetime" />
            <DateTimePickerContent />
          </DateTimePicker>
        </div>
        <Text variant="caption" color="muted">
          Current: <code>{fmt(twelveH)}</code>
        </Text>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="With seconds">
        <Heading level={2} size="lg">
          3. With seconds
        </Heading>
        <Text variant="body" color="muted">
          <code>withSeconds</code> propagates to the inline TimeInput +
          ISO output gains seconds component.
        </Text>
        <div className={styles.demo}>
          <DateTimePicker
            value={withSec}
            onValueChange={setWithSec}
            hourCycle="24h"
            withSeconds
          >
            <DateTimePickerInput aria-label="Race datetime" />
            <DateTimePickerContent />
          </DateTimePicker>
        </div>
        <Text variant="caption" color="muted">
          Current: <code>{fmt(withSec)}</code>
        </Text>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Time step 15">
        <Heading level={2} size="lg">
          4. timeStep = 15 minutes
        </Heading>
        <Text variant="body" color="muted">
          ArrowUp/Down on the minute spinbutton increments by 15.
        </Text>
        <div className={styles.demo}>
          <DateTimePicker
            value={stepped}
            onValueChange={setStepped}
            hourCycle="24h"
            timeStep={15}
          >
            <DateTimePickerInput aria-label="Slot datetime" />
            <DateTimePickerContent />
          </DateTimePicker>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Min/max + disabled">
        <Heading level={2} size="lg">
          5. Min / max + disabled weekends
        </Heading>
        <Text variant="body" color="muted">
          <code>min=2026-05-01</code>, <code>max=2026-05-31</code>, weekends
          disabled in Calendar grid. Time bounds inherited from min/max
          when within-day clamping is needed (out-of-day instants clamp at
          ISO 8601 level on commit).
        </Text>
        <div className={styles.demo}>
          <DateTimePicker
            value={constrained}
            onValueChange={setConstrained}
            min={new Date(2026, 4, 1)}
            max={new Date(2026, 4, 31, 23, 59)}
            disabledDates={isWeekend}
            hourCycle="24h"
          >
            <DateTimePickerInput aria-label="Constrained datetime" />
            <DateTimePickerContent />
          </DateTimePicker>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Form integration">
        <Heading level={2} size="lg">
          6. Form integration + required
        </Heading>
        <Text variant="body" color="muted">
          Hidden input emits ISO 8601 local datetime
          (`YYYY-MM-DDTHH:MM:SS`).
        </Text>
        <form className={styles.formDemo} onSubmit={handleSubmit} noValidate>
          <DateTimePicker
            name="meetingAt"
            defaultValue={new Date(2026, 4, 15, 10, 0)}
            hourCycle="24h"
            required
          >
            <DateTimePickerInput aria-label="Meeting at" />
            <DateTimePickerContent />
          </DateTimePicker>
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

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Time steppers (0.21.0)">
        <Heading level={2} size="lg">
          7. showTimeSteppers — opt-in ↑↓ on embedded TimeInput (0.21.0)
        </Heading>
        <Text variant="body" color="muted">
          <code>showTimeSteppers</code> propagates to the embedded{' '}
          <code>&lt;TimeInput&gt;</code> in the popover content. Steppers act
          on the currently-focused segment (hour / minute / second) with
          pointer-down hold-to-repeat (400ms → 80ms). Open the picker to
          see the steppers on the right edge of the time row.
        </Text>
        <Inline gap={6} wrap>
          <DateTimePicker
            defaultValue={new Date(2026, 4, 15, 14, 30)}
            hourCycle="24h"
            showTimeSteppers
          >
            <DateTimePickerInput aria-label="24h with steppers" />
            <DateTimePickerContent />
          </DateTimePicker>
          <DateTimePicker
            defaultValue={new Date(2026, 4, 15, 9, 0, 0)}
            hourCycle="12h"
            withSeconds
            showTimeSteppers
          >
            <DateTimePickerInput aria-label="12h + seconds + steppers" />
            <DateTimePickerContent />
          </DateTimePicker>
          <DateTimePicker
            defaultValue={new Date(2026, 4, 15, 8, 0)}
            hourCycle="24h"
            timeStep={15}
            showTimeSteppers
          >
            <DateTimePickerInput aria-label="step=15 with steppers" />
            <DateTimePickerContent />
          </DateTimePicker>
        </Inline>
      </section>
    </main>
  );
}
