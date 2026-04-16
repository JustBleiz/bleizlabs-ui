'use client';

import { useState } from 'react';
import {
  Calendar,
  type CalendarDir,
  type CalendarWeekStart,
} from '@/components/complex/Calendar';
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

export default function CalendarPlayground() {
  // Section 2 — controlled
  const [controlled, setControlled] = useState<Date | null>(new Date(2026, 3, 20));

  // Section 3 — min/max
  const minMaxMin = new Date(2026, 3, 1);
  const minMaxMax = new Date(2026, 3, 30);
  const [minMaxValue, setMinMaxValue] = useState<Date | null>(new Date(2026, 3, 15));

  // Section 4 — disabled predicate (no weekends)
  const [weekdayOnly, setWeekdayOnly] = useState<Date | null>(null);
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  // Section 5 — disabled array
  const [arrayDisabled, setArrayDisabled] = useState<Date | null>(null);
  const disabledDays = [
    new Date(2026, 3, 10),
    new Date(2026, 3, 11),
    new Date(2026, 3, 12),
  ];

  // Section 6 — Polish locale
  const [polish, setPolish] = useState<Date | null>(new Date(2026, 3, 22));

  // Section 7 — US locale (Sun start)
  const [usLocale, setUsLocale] = useState<Date | null>(null);

  // Section 8 — RTL + Arabic (Sat start)
  const [rtl, setRtl] = useState<Date | null>(null);

  // Section 9 — fixedWeeks + no outside days
  const [fixed, setFixed] = useState<Date | null>(null);

  // Section 10 — weekStartsOn override
  const [forceSunday, setForceSunday] = useState<Date | null>(null);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          Calendar — Phase 10 CI16
        </Heading>
        <Text variant="lead" color="muted">
          Accessible single-date calendar grid per WAI-ARIA APG <code>/grid/</code>. 6 compound
          flat exports (Calendar + CalendarHeader + CalendarGrid + CalendarGridHead +
          CalendarGridBody + CalendarCell). Zero runtime deps — native <code>Date</code> +
          <code>Intl.DateTimeFormat</code> only (D5/D25). First grid-pattern Phase 10 component.
        </Text>
        <Inline gap={2} wrap>
          <Badge color="success">APG /grid/</Badge>
          <Badge color="info">Zero deps</Badge>
          <Badge color="default">Locale-aware</Badge>
          <Badge color="default">RTL</Badge>
          <Badge color="default">Roving tabindex</Badge>
          <Badge color="default">2D keyboard nav</Badge>
        </Inline>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          1. Basic uncontrolled — default
        </Heading>
        <Text variant="body" color="muted">
          Default locale <code>en-US</code> (Sunday start). Click any date to select. Keyboard:
          arrow keys move focus, Enter/Space selects, PageUp/Down = month, Shift+PageUp/Down =
          year, Home/End = week bounds.
        </Text>
        <div className={styles.demo}>
          <Calendar />
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          2. Controlled value + <code>onValueChange</code>
        </Heading>
        <Text variant="body" color="muted">
          Consumer owns state. Current selection:{' '}
          <strong>{formatDisplay(controlled, 'en-US')}</strong>
        </Text>
        <div className={styles.demo}>
          <Calendar value={controlled} onValueChange={setControlled} />
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
          Clamps selectable range to April 2026. Chevrons disable at boundary months. Keyboard nav
          skips beyond min/max.
        </Text>
        <div className={styles.demo}>
          <Calendar
            value={minMaxValue}
            onValueChange={setMinMaxValue}
            min={minMaxMin}
            max={minMaxMax}
            defaultMonth={new Date(2026, 3, 1)}
          />
        </div>
        <Text variant="caption" color="muted">
          Selected: {formatDisplay(minMaxValue, 'en-US')}
        </Text>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          4. Predicate <code>disabled</code> — weekdays only
        </Heading>
        <Text variant="body" color="muted">
          <code>disabled={`(d) => d.getDay() === 0 || d.getDay() === 6`}</code>. Weekends remain
          focusable (aria-disabled) but arrow-nav skips them.
        </Text>
        <div className={styles.demo}>
          <Calendar value={weekdayOnly} onValueChange={setWeekdayOnly} disabled={isWeekend} />
        </div>
        <Text variant="caption" color="muted">
          Selected: {formatDisplay(weekdayOnly, 'en-US')}
        </Text>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          5. Array <code>disabled</code> — blocked specific dates
        </Heading>
        <Text variant="body" color="muted">
          Pass an array to disable specific days (e.g. holidays, blackout dates): April 10, 11, 12
          2026.
        </Text>
        <div className={styles.demo}>
          <Calendar
            value={arrayDisabled}
            onValueChange={setArrayDisabled}
            disabled={disabledDays}
            defaultMonth={new Date(2026, 3, 1)}
          />
        </div>
        <Text variant="caption" color="muted">
          Selected: {formatDisplay(arrayDisabled, 'en-US')}
        </Text>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          6. Polish locale (<code>pl-PL</code>) — Monday start
        </Heading>
        <Text variant="body" color="muted">
          Month + weekday names from <code>Intl.DateTimeFormat(&apos;pl-PL&apos;)</code>. Week starts Monday
          per ISO-8601 + locale detection.
        </Text>
        <div className={styles.demo}>
          <Calendar value={polish} onValueChange={setPolish} locale="pl-PL" />
        </div>
        <Text variant="caption" color="muted">
          Wybrane: {formatDisplay(polish, 'pl-PL')}
        </Text>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          7. US locale (<code>en-US</code>) — Sunday start
        </Heading>
        <Text variant="body" color="muted">
          Week starts Sunday per CLDR. Same data, different first column.
        </Text>
        <div className={styles.demo}>
          <Calendar value={usLocale} onValueChange={setUsLocale} locale="en-US" />
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          8. RTL + Arabic (<code>ar-SA</code>) — Saturday start, arrows mirrored
        </Heading>
        <Text variant="body" color="muted">
          <code>dir=&quot;rtl&quot;</code> mirrors ArrowLeft/Right day semantics. Week starts
          Saturday per Saudi locale. Visual layout flips automatically via <code>dir</code>
          attribute cascade.
        </Text>
        <div className={styles.demo}>
          <Calendar value={rtl} onValueChange={setRtl} locale="ar-SA" dir="rtl" />
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          9. <code>fixedWeeks</code> + <code>showOutsideDays=false</code>
        </Heading>
        <Text variant="body" color="muted">
          Always renders 6 rows (fixed height, prevents layout shift across months). Outside-month
          days are hidden — cells remain for layout stability but empty content.
        </Text>
        <div className={styles.demo}>
          <Calendar
            value={fixed}
            onValueChange={setFixed}
            fixedWeeks
            showOutsideDays={false}
          />
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          10. <code>weekStartsOn</code> override
        </Heading>
        <Text variant="body" color="muted">
          Explicit <code>weekStartsOn=0</code> forces Sunday start even when locale says otherwise
          (here Polish).
        </Text>
        <div className={styles.demo}>
          <Calendar
            value={forceSunday}
            onValueChange={setForceSunday}
            locale="pl-PL"
            weekStartsOn={0}
          />
        </div>
      </section>

      <Separator />

      <footer className={styles.footer}>
        <Heading level={3} size="md">
          Keyboard reference
        </Heading>
        <dl className={styles.kbdList}>
          <div>
            <dt>
              <kbd>←</kbd> / <kbd>→</kbd>
            </dt>
            <dd>Previous / next day (reversed in RTL)</dd>
          </div>
          <div>
            <dt>
              <kbd>↑</kbd> / <kbd>↓</kbd>
            </dt>
            <dd>Same weekday in previous / next week</dd>
          </div>
          <div>
            <dt>
              <kbd>Home</kbd> / <kbd>End</kbd>
            </dt>
            <dd>First / last day of current week</dd>
          </div>
          <div>
            <dt>
              <kbd>PageUp</kbd> / <kbd>PageDown</kbd>
            </dt>
            <dd>Previous / next month</dd>
          </div>
          <div>
            <dt>
              <kbd>Shift</kbd>+<kbd>PageUp</kbd> / <kbd>Shift</kbd>+<kbd>PageDown</kbd>
            </dt>
            <dd>Previous / next year</dd>
          </div>
          <div>
            <dt>
              <kbd>Enter</kbd> / <kbd>Space</kbd>
            </dt>
            <dd>Select focused date</dd>
          </div>
        </dl>
      </footer>
    </main>
  );
}

// Silence unused-type import warnings (exported for consumer reference in JSDoc)
export type _CalendarTypes = { dir: CalendarDir; weekStart: CalendarWeekStart };
