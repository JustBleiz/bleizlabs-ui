'use client';

import { useState } from 'react';
import { TimeInput } from '@/components/interactive/TimeInput';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import { Button } from '@/components/interactive/Button';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

export default function TimeInputPlayground() {
  // USE CASE 1: Basic 24h (uncontrolled)
  // (no state — uncontrolled demo)

  // USE CASE 2: 12h with AM/PM toggle (controlled)
  const [twelveH, setTwelveH] = useState<string>('14:30');

  // USE CASE 3: withSeconds variant
  const [withSec, setWithSec] = useState<string>('09:00:45');

  // USE CASE 4: Step=15 (15-minute increments)
  const [stepped, setStepped] = useState<string>('10:00');

  // USE CASE 5: Min/max constrained
  const [constrained, setConstrained] = useState<string>('09:00');

  // USE CASE 6: Full-featured form integration
  const [submitted, setSubmitted] = useState<string | null>(null);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const startsAt = String(data.get('startsAt') ?? '');
    const endsAt = String(data.get('endsAt') ?? '');
    setSubmitted(`startsAt=${startsAt || '(empty)'}; endsAt=${endsAt || '(empty)'}`);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          TimeInput
        </Heading>
        <Text variant="lead" color="muted">
          Inline time spinbutton trio for HH:MM(:SS). Bespoke role=&quot;spinbutton&quot;
          implementation per WAI-ARIA APG. Supports 12h/24h display via{' '}
          <code>hourCycle</code>, optional seconds, minute step, and min/max
          bounds. Emits 24h ISO string regardless of display cycle.
        </Text>
        <Inline gap={2} wrap>
          <Badge color="success">APG spinbutton</Badge>
          <Badge color="info">Zero deps</Badge>
          <Badge color="default">12h / 24h</Badge>
          <Badge color="default">Locale-aware</Badge>
          <Badge color="default">Min/max clamp</Badge>
          <Badge color="default">2-digit auto-advance</Badge>
        </Inline>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Basic 24h time">
        <Heading level={2} size="lg">
          1. Basic 24h (uncontrolled)
        </Heading>
        <Text variant="body" color="muted">
          Use ArrowUp/Down to nudge each field, PageUp/Down for ±10h/±15m, type
          digits directly (auto-advances on 2-digit completion). Default
          locale-derived cycle (en-US baseline = 12h on first paint, switches
          to navigator.language on hydration; pass <code>hourCycle</code>
          explicitly for stable SSR output).
        </Text>
        <div className={styles.demo}>
          <TimeInput
            label="Start time"
            defaultValue="08:30"
            hourCycle="24h"
          />
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="12h with AM/PM">
        <Heading level={2} size="lg">
          2. 12h with AM/PM (controlled)
        </Heading>
        <Text variant="body" color="muted">
          Hour field shows 1-12. AM/PM <code>role=&quot;switch&quot;</code>{' '}
          toggle at logical-end. Press Space/Enter on the toggle to flip
          period. Emitted value is always 24h ISO.
        </Text>
        <div className={styles.demo}>
          <TimeInput
            label="Meeting time"
            value={twelveH}
            onValueChange={setTwelveH}
            hourCycle="12h"
            locale="en-US"
          />
        </div>
        <Text variant="caption" color="muted">
          Current 24h ISO: <code>{twelveH || '(empty)'}</code>
        </Text>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="With seconds">
        <Heading level={2} size="lg">
          3. With seconds
        </Heading>
        <Text variant="body" color="muted">
          <code>withSeconds</code> adds a third spinbutton. Useful for
          timestamps, race times, scheduled jobs.
        </Text>
        <div className={styles.demo}>
          <TimeInput
            label="Race finish"
            value={withSec}
            onValueChange={setWithSec}
            hourCycle="24h"
            withSeconds
          />
        </div>
        <Text variant="caption" color="muted">
          Current ISO: <code>{withSec || '(empty)'}</code>
        </Text>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Step 15 minutes">
        <Heading level={2} size="lg">
          4. Step = 15 minutes
        </Heading>
        <Text variant="body" color="muted">
          ArrowUp/Down on the minute field increments by 15. Useful for
          appointment slots. Direct typing still accepts arbitrary values.
        </Text>
        <div className={styles.demo}>
          <TimeInput
            label="Slot"
            value={stepped}
            onValueChange={setStepped}
            hourCycle="24h"
            step={15}
            helperText="ArrowUp / ArrowDown on minutes jumps by 15"
          />
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Min/max constrained">
        <Heading level={2} size="lg">
          5. Min / max bounds
        </Heading>
        <Text variant="body" color="muted">
          <code>min=&quot;09:00&quot;</code>,{' '}
          <code>max=&quot;17:00&quot;</code>. Out-of-range values clamp on
          commit. Home/End jump to field min/max.
        </Text>
        <div className={styles.demo}>
          <TimeInput
            label="Office hours"
            value={constrained}
            onValueChange={setConstrained}
            hourCycle="24h"
            min="09:00"
            max="17:00"
          />
        </div>
        <Text variant="caption" color="muted">
          Current: <code>{constrained || '(empty)'}</code>
        </Text>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Form integration">
        <Heading level={2} size="lg">
          6. Form integration + required
        </Heading>
        <Text variant="body" color="muted">
          When <code>name</code> is set, TimeInput renders a hidden input
          carrying the 24h ISO. <code>required=true</code> + empty value
          surfaces native HTML5 <code>:invalid</code> on submit.
        </Text>
        <form className={styles.formDemo} onSubmit={handleSubmit} noValidate>
          <TimeInput
            label="Starts at"
            name="startsAt"
            defaultValue="10:00"
            hourCycle="24h"
            required
          />
          <TimeInput
            label="Ends at"
            name="endsAt"
            defaultValue="11:30"
            hourCycle="24h"
            required
          />
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

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          showSteppers — opt-in ↑↓ buttons (0.21.0)
        </Heading>
        <Text variant="small" color="secondary">
          <code>showSteppers</code> renders a stacked ↑/↓ pair on the right
          edge of the input wrap. They act on the currently-focused segment
          (hour / minute / second). Pointer-down hold-to-repeat (400ms initial
          → 80ms repeat) matches native spinbutton browser convention. Buttons
          carry <code>tabIndex=-1</code> — keyboard users keep ArrowUp/Down on
          the spinbuttons themselves with better ergonomics.
        </Text>
        <Inline gap={6} wrap>
          <TimeInput
            label="24h with steppers"
            defaultValue="14:30"
            hourCycle="24h"
            showSteppers
          />
          <TimeInput
            label="12h + seconds + steppers"
            defaultValue="09:45:00"
            hourCycle="12h"
            withSeconds
            showSteppers
          />
          <TimeInput
            label="Step=15 minutes (steppers respect step)"
            defaultValue="08:00"
            hourCycle="24h"
            step={15}
            showSteppers
          />
        </Inline>
      </section>
    </main>
  );
}
