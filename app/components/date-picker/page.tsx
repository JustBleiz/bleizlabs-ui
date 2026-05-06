'use client';

import { useState } from 'react';
import {
  DatePicker,
  DatePickerInput,
  DatePickerContent,
} from '@/components/complex/DatePicker';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import { Button } from '@/components/interactive/Button';
import { Badge } from '@/components/display/Badge';
import { Separator } from '@/components/display/Separator';
import styles from './page.module.scss';

function formatDisplay(date: Date | null, locale: string): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export default function DatePickerPlayground() {
  // 1. Basic uncontrolled
  // (no state — demo only)

  // 2. Controlled
  const [controlled, setControlled] = useState<Date | null>(new Date(2026, 3, 20));

  // 3. min/max
  const [minMaxValue, setMinMaxValue] = useState<Date | null>(new Date(2026, 3, 15));
  const minMaxMin = new Date(2026, 3, 1);
  const minMaxMax = new Date(2026, 3, 30);

  // 4. Disabled predicate (weekdays only)
  const [weekdayOnly, setWeekdayOnly] = useState<Date | null>(null);
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  // 5. Polish locale
  const [polish, setPolish] = useState<Date | null>(new Date(2026, 3, 22));

  // 6. Controlled open state
  const [open, setOpen] = useState(false);
  const [openControlled, setOpenControlled] = useState<Date | null>(null);

  // 7. Disabled widget
  const [disabledVal, setDisabledVal] = useState<Date | null>(new Date(2026, 3, 10));

  // 8. Form submission
  const [submitted, setSubmitted] = useState<string | null>(null);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSubmitted(String(data.get('deadline') ?? '(empty)'));
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          DatePicker
        </Heading>
        <Text variant="lead" color="muted">
          Type an ISO date directly or pick one from the calendar popover.
          Combines the text-input ergonomics of Combobox with the grid
          navigation of Calendar. Parses <code>yyyy-mm-dd</code> input, reverts
          malformed entries on blur.
        </Text>
        <Inline gap={2} wrap>
          <Badge color="success">APG composition</Badge>
          <Badge color="info">Zero deps</Badge>
          <Badge color="default">ISO parse</Badge>
          <Badge color="default">Alt+ArrowDown</Badge>
          <Badge color="default">Blur Strategy A</Badge>
          <Badge color="default">IME guard</Badge>
        </Inline>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          1. Basic uncontrolled
        </Heading>
        <Text variant="body" color="muted">
          Type <code>YYYY-MM-DD</code> directly or click the calendar icon to open
          popup. Keyboard: Alt+ArrowDown opens, Escape closes, Enter commits typed
          value.
        </Text>
        <div className={styles.demo}>
          <DatePicker>
            <DatePickerInput />
            <DatePickerContent />
          </DatePicker>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          2. Controlled value
        </Heading>
        <Text variant="body" color="muted">
          Consumer owns state. Current selection:{' '}
          <strong>{formatDisplay(controlled, 'en-US')}</strong>
        </Text>
        <div className={styles.demo}>
          <DatePicker value={controlled} onValueChange={setControlled}>
            <DatePickerInput />
            <DatePickerContent />
          </DatePicker>
        </div>
        <Inline gap={2}>
          <Button variant="secondary" onClick={() => setControlled(new Date())}>
            Today
          </Button>
          <Button variant="ghost" onClick={() => setControlled(null)}>
            Clear
          </Button>
        </Inline>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          3. <code>min</code> + <code>max</code> boundaries
        </Heading>
        <Text variant="body" color="muted">
          Clamps selectable range to April 2026. Typed dates outside range revert;
          Calendar nav skips past boundaries.
        </Text>
        <div className={styles.demo}>
          <DatePicker
            value={minMaxValue}
            onValueChange={setMinMaxValue}
            min={minMaxMin}
            max={minMaxMax}
          >
            <DatePickerInput placeholder="2026-04-01 ≤ date ≤ 2026-04-30" />
            <DatePickerContent />
          </DatePicker>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          4. <code>disabledDates</code> predicate — weekdays only
        </Heading>
        <Text variant="body" color="muted">
          Predicate blocks weekends both in typed input parse AND Calendar arrow nav
          (skips disabled cells per APG).
        </Text>
        <div className={styles.demo}>
          <DatePicker
            value={weekdayOnly}
            onValueChange={setWeekdayOnly}
            disabledDates={isWeekend}
          >
            <DatePickerInput placeholder="Mon–Fri only" />
            <DatePickerContent />
          </DatePicker>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          5. Polish locale (<code>pl-PL</code>)
        </Heading>
        <Text variant="body" color="muted">
          Calendar month/weekday names + Monday-start from <code>Intl.Locale</code>.
          Input format stays ISO for consistency. Display:{' '}
          <strong>{formatDisplay(polish, 'pl-PL')}</strong>
        </Text>
        <div className={styles.demo}>
          <DatePicker value={polish} onValueChange={setPolish} locale="pl-PL">
            <DatePickerInput />
            <DatePickerContent />
          </DatePicker>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          6. Controlled popup <code>open</code> state
        </Heading>
        <Text variant="body" color="muted">
          Consumer controls <code>open</code> + <code>onOpenChange</code> — useful for
          programmatic open (e.g., validation-driven).
        </Text>
        <div className={styles.demo}>
          <DatePicker
            value={openControlled}
            onValueChange={setOpenControlled}
            open={open}
            onOpenChange={setOpen}
          >
            <DatePickerInput />
            <DatePickerContent />
          </DatePicker>
        </div>
        <Inline gap={2}>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Open programmatically
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close programmatically
          </Button>
        </Inline>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          7. <code>disabled</code> widget lockdown
        </Heading>
        <Text variant="body" color="muted">
          Input non-interactive + popup won&apos;t open. Differs from{' '}
          <code>disabledDates</code> which only blocks specific dates.
        </Text>
        <div className={styles.demo}>
          <DatePicker value={disabledVal} onValueChange={setDisabledVal} disabled>
            <DatePickerInput />
            <DatePickerContent />
          </DatePicker>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          8. Form participation — <code>name</code> + <code>required</code>
        </Heading>
        <Text variant="body" color="muted">
          Hidden input posts ISO string. Last submit value:{' '}
          <strong>{submitted ?? '(not submitted)'}</strong>
        </Text>
        <form onSubmit={handleSubmit} className={styles.demo}>
          <Inline gap={3} wrap align="center">
            <DatePicker name="deadline" required defaultValue={new Date(2026, 4, 1)}>
              <DatePickerInput />
              <DatePickerContent />
            </DatePicker>
            <Button type="submit" variant="primary">
              Submit
            </Button>
          </Inline>
        </form>
      </section>

      <Separator />

      <footer className={styles.footer}>
        <Heading level={3} size="md">
          Keyboard reference
        </Heading>
        <dl className={styles.kbdList}>
          <div>
            <dt>
              <kbd>Alt</kbd>+<kbd>↓</kbd>
            </dt>
            <dd>Open popup + focus Calendar</dd>
          </div>
          <div>
            <dt>
              <kbd>Alt</kbd>+<kbd>↑</kbd>
            </dt>
            <dd>Close popup, focus stays on input</dd>
          </div>
          <div>
            <dt>
              <kbd>Enter</kbd>
            </dt>
            <dd>Commit typed date (revert if invalid)</dd>
          </div>
          <div>
            <dt>
              <kbd>Escape</kbd>
            </dt>
            <dd>Close popup, focus stays on input</dd>
          </div>
          <div>
            <dt>
              <kbd>Tab</kbd>
            </dt>
            <dd>Exit input (blur commits)</dd>
          </div>
          <div>
            <dt>Inside Calendar</dt>
            <dd>APG <code>/grid/</code> — ←→↑↓ / Home/End / PgUp/PgDn / Shift+PgUp/PgDn</dd>
          </div>
        </dl>
      </footer>
    </main>
  );
}
