'use client';

import { useState } from 'react';
import {
  DateRangePicker,
  DateRangePickerInput,
  DateRangePickerContent,
  type DateRange,
} from '@/components/complex/DateRangePicker';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import { Button } from '@/components/interactive/Button';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

function formatRange(range: DateRange, locale: string): string {
  if (!range.from && !range.to) return '—';
  const fmt = (d: Date | null) =>
    d
      ? new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(d)
      : '…';
  return `${fmt(range.from)} → ${fmt(range.to)}`;
}

export default function DateRangePickerPlayground() {
  // USE CASE 2: Two-month side-by-side (controlled)
  const [twoMonth, setTwoMonth] = useState<DateRange>({
    from: new Date(2026, 4, 5),
    to: new Date(2026, 4, 19),
  });

  // USE CASE 5: Min/max + disabled weekends
  const [constrained, setConstrained] = useState<DateRange>({ from: null, to: null });
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  // USE CASE 6: Full-featured controlled + form
  const [controlled, setControlled] = useState<DateRange>({ from: null, to: null });
  const [submitted, setSubmitted] = useState<string | null>(null);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const from = String(data.get('trip_from') ?? '');
    const to = String(data.get('trip_to') ?? '');
    setSubmitted(`from=${from || '(empty)'}; to=${to || '(empty)'}`);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          DateRangePicker
        </Heading>
        <Text variant="lead" color="muted">
          Pick a date range from a multi-month calendar popover. Composes
          DatePicker keyboard ergonomics with multi-month Calendar instances.
          Supports 1/2/3 side-by-side months, hover preview during selection,
          and form integration via paired hidden inputs.
        </Text>
        <Inline gap={2} wrap>
          <Badge color="success">APG dialog + grid</Badge>
          <Badge color="info">Zero deps</Badge>
          <Badge color="default">Hover preview</Badge>
          <Badge color="default">numberOfMonths 1/2/3</Badge>
          <Badge color="default">Locale-aware</Badge>
          <Badge color="default">Range reorder</Badge>
        </Inline>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Basic single-month range">
        <Heading level={2} size="lg">
          1. Basic single-month range
        </Heading>
        <Text variant="body" color="muted">
          Uncontrolled. Click two dates to set the range. The second click
          orders bounds automatically (earlier click = from, later = to).
          Hover preview during selection shows what range the click 2 will
          commit. Cross-grid Tab: arrows stop at month boundary; Tab moves
          to next month&apos;s focusable cell.
        </Text>
        <div className={styles.demo}>
          <DateRangePicker aria-label="Basic single-month range">
            <DateRangePickerInput />
            <DateRangePickerContent />
          </DateRangePicker>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Two-month side-by-side">
        <Heading level={2} size="lg">
          2. Two-month side-by-side (controlled)
        </Heading>
        <Text variant="body" color="muted">
          Consumer owns state. Current range:{' '}
          <strong>{formatRange(twoMonth, 'en-US')}</strong>
        </Text>
        <div className={styles.demo}>
          <DateRangePicker
            value={twoMonth}
            onValueChange={setTwoMonth}
            numberOfMonths={2}
            aria-label="Two-month side-by-side"
          >
            <DateRangePickerInput />
            <DateRangePickerContent />
          </DateRangePicker>
        </div>
        <Inline gap={2}>
          <Button
            variant="secondary"
            onClick={() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const week = new Date(today);
              week.setDate(week.getDate() + 6);
              setTwoMonth({ from: today, to: week });
            }}
          >
            Next 7 days
          </Button>
          <Button variant="ghost" onClick={() => setTwoMonth({ from: null, to: null })}>
            Clear
          </Button>
        </Inline>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Three-month wide">
        <Heading level={2} size="lg">
          3. Three-month wide
        </Heading>
        <Text variant="body" color="muted">
          Wide picker for long-range planning. Three side-by-side months,
          single sync&apos;d header chevron navigation.
        </Text>
        <div className={styles.demo}>
          <DateRangePicker numberOfMonths={3} aria-label="Three-month wide">
            <DateRangePickerInput />
            <DateRangePickerContent />
          </DateRangePicker>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Polish locale">
        <Heading level={2} size="lg">
          4. Polish locale (pl-PL — Mon-first)
        </Heading>
        <Text variant="body" color="muted">
          Week starts Monday per Polish locale conventions. Month and weekday
          names auto-localized via <code>Intl.DateTimeFormat</code>.
        </Text>
        <div className={styles.demo}>
          <DateRangePicker
            locale="pl-PL"
            numberOfMonths={2}
            aria-label="Polish locale range picker"
          >
            <DateRangePickerInput placeholder="RRRR-MM-DD → RRRR-MM-DD" />
            <DateRangePickerContent />
          </DateRangePicker>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Min/max with disabled weekends">
        <Heading level={2} size="lg">
          5. <code>min</code> + <code>max</code> + disabled weekends
        </Heading>
        <Text variant="body" color="muted">
          Range limited to May 2026; weekends are not selectable. Current:{' '}
          <strong>{formatRange(constrained, 'en-US')}</strong>
        </Text>
        <div className={styles.demo}>
          <DateRangePicker
            value={constrained}
            onValueChange={setConstrained}
            min={new Date(2026, 4, 1)}
            max={new Date(2026, 4, 31)}
            disabledDates={isWeekend}
            numberOfMonths={2}
            aria-label="Min/max with disabled weekends"
          >
            <DateRangePickerInput />
            <DateRangePickerContent />
          </DateRangePicker>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Form integration with required">
        <Heading level={2} size="lg">
          6. Form integration (<code>required</code>)
        </Heading>
        <Text variant="body" color="muted">
          Renders paired hidden inputs <code>trip_from</code> +{' '}
          <code>trip_to</code>. With <code>required</code>, browser{' '}
          <code>:invalid</code> blocks submit until both bounds are set.
        </Text>
        <form className={styles.formDemo} onSubmit={handleSubmit}>
          <DateRangePicker
            name="trip"
            required
            value={controlled}
            onValueChange={setControlled}
            numberOfMonths={2}
            aria-label="Form integration with required"
          >
            <DateRangePickerInput />
            <DateRangePickerContent />
          </DateRangePicker>
          <Button type="submit">Submit</Button>
        </form>
        {submitted ? (
          <Text variant="body" color="muted">
            Submitted: <code>{submitted}</code>
          </Text>
        ) : null}
      </section>
    </main>
  );
}
