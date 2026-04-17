'use client';

/**
 * Calendar — accessible single-date calendar grid per WAI-ARIA APG `/grid/`.
 *
 * @layer complex-interactive (Phase 10 CI16 — FIRST grid-pattern component)
 * @tokens --color-surface-raised, --color-surface-hover, --color-text-primary,
 *   --color-text-muted, --color-border-subtle, --color-border-strong,
 *   --color-brand, --color-brand-foreground, --color-brand-hover,
 *   --focus-ring (via mx.focus-ring mixin), --duration-fast, --easing-default,
 *   --space-{1,2,3}, --radius-sm, --radius-lg, --font-sans, --font-size-xs,
 *   --font-size-sm, --font-weight-medium, --font-weight-semibold
 * @deps zero runtime deps per D5/D25. Native `Date` + `Intl.DateTimeFormat`
 *   for all date math and formatting — NO date-fns, dayjs, luxon, moment.
 *   Date helpers in `utils/date.ts` (E30 addition). Reuses
 *   `useFloatingValueState<Date>` (E23 primitive, 5th consumer — NavigationMenu,
 *   Tabs, Select, Combobox preceded). Roving tabindex pattern COPIED inline
 *   from Tabs (E26) — 2D grid variant differs in shape enough that strict
 *   Rule of Three (E29 precedent) defers extraction to a future refactor.
 * @a11y APG `/grid/` — `<table role="grid" aria-labelledby>` root, `<tr>` rows,
 *   `<td role="gridcell" aria-selected>` cells with inner focusable
 *   `<button tabIndex={0|-1} aria-current="date" aria-disabled aria-label>`
 *   for each date. Roving tabindex moves focus marker — only the focused
 *   cell has `tabIndex=0`, all others `-1`. Disabled cells remain in DOM +
 *   stay focusable (aria-disabled semantic only, NOT native `disabled`)
 *   per APG focusable-when-disabled requirement.
 *
 *   Keyboard model (APG `/grid/` + `/datepicker-dialog/`):
 *   - ArrowLeft  : previous day (next day when `dir="rtl"`)
 *   - ArrowRight : next day (previous day when `dir="rtl"`)
 *   - ArrowUp    : same weekday in previous week (-7 days)
 *   - ArrowDown  : same weekday in next week (+7 days)
 *   - Home       : first day of current week (per `weekStartsOn`)
 *   - End        : last day of current week (per `weekStartsOn`)
 *   - PageUp     : previous month (same day-of-month, clamped to last valid)
 *   - PageDown   : next month (same day-of-month, clamped)
 *   - Shift+PageUp   : previous year
 *   - Shift+PageDown : next year
 *   - Enter / Space  : select focused date
 *   - Alt/Meta/Ctrl+arrow : skipped (browser hotkeys)
 *
 *   Disabled dates are SKIPPED during arrow nav (recursive search with
 *   min/max boundary as hard stop). Direct click/programmatic focus on a
 *   disabled cell is a no-op (click handler guarded). Consumers expecting
 *   different semantics (e.g. clamp instead of skip) can set `disabled`
 *   predicate to false and filter at `onValueChange`.
 *
 *   Month navigation: chevron click or PageUp/Down shifts `focusedDate` to
 *   the equivalent day-of-month in the new month. Display month is derived
 *   from `focusedDate` so both state slots stay consistent. Clicking an
 *   outside-month day (when `showOutsideDays=true`) jumps focus to that
 *   month AND selects the date.
 *
 *   Focus persistence: chevron buttons do NOT steal focus to the grid —
 *   after clicking chevron the user stays on the chevron button, and
 *   the internal roving `tabIndex=0` silently moves to the equivalent
 *   cell in the new month. Tab from chevron lands on the newly-focused
 *   cell per natural DOM order.
 *
 *   RTL: when `dir="rtl"` on Calendar root, ArrowLeft/ArrowRight day
 *   semantics swap. Vertical (Up/Down) and Home/End unaffected by dir.
 *   CSS grid layout mirrors automatically via `dir` attribute cascade.
 *
 *   Live region: month header has `aria-live="polite" aria-atomic="true"`
 *   so screen readers announce the new month/year after chevron click
 *   or keyboard month nav.
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 *   https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y via eslint-config-next ✓ |
 *   next build ✓ — DEFERRED: Playwright execution (per E15 scope decision),
 *   axe-core runtime sweep, manual NVDA sweep.
 * @regressions tests/Calendar.{keyboard,focus,aria,regression}.spec.md —
 *   24 regression cases (CAL-R01..R24) documented in
 *   `docs/specs/calendar-spec.md` (promoted from `_tmp` in E42) — RTL arrow
 *   mirror, DST seamless nav, year boundary (Dec → Jan), leap year Feb 29,
 *   locale week-start
 *   (PL=Mon, US=Sun, ar-SA=Sat), min/max clamp, disabled predicate skip,
 *   today marker only when today in grid, multi-instance independent
 *   roving.
 * @example
 *   // Uncontrolled
 *   <Calendar defaultValue={new Date(2026, 3, 15)} onValueChange={setDate} />
 *
 *   // Controlled + Polish locale + min/max
 *   <Calendar
 *     value={value}
 *     onValueChange={setValue}
 *     locale="pl-PL"
 *     min={new Date(2026, 0, 1)}
 *     max={new Date(2026, 11, 31)}
 *   />
 *
 *   // Compound override — custom header layout
 *   <Calendar value={value} onValueChange={setValue}>
 *     <CustomHeaderBar />
 *     <CalendarGrid>
 *       <CalendarGridHead />
 *       <CalendarGridBody />
 *     </CalendarGrid>
 *   </Calendar>
 */

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  type TableHTMLAttributes,
} from 'react';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  formatFullDate,
  formatMonthYear,
  getWeekStartDay,
  getWeekdayName,
  isDateInRange,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toIsoDateString,
} from '../../utils/date';
import { useFloatingValueState } from '../../utils/floating';
import styles from './Calendar.module.scss';

// ──────────────────────────────────────────────────────────────────────────
// Types

export type CalendarDir = 'ltr' | 'rtl';
export type CalendarWeekStart = 0 | 1 | 6;
export type CalendarDisabled = Date[] | ((date: Date) => boolean);

// ──────────────────────────────────────────────────────────────────────────
// Context

interface CalendarContextValue {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  focusedDate: Date;
  setFocusedDate: (date: Date) => void;
  displayMonth: Date;
  locale: string;
  weekStartsOn: CalendarWeekStart;
  min: Date | undefined;
  max: Date | undefined;
  isDisabled: (date: Date) => boolean;
  showOutsideDays: boolean;
  fixedWeeks: boolean;
  dir: CalendarDir;
  today: Date;
  baseId: string;
  gridRef: RefObject<HTMLTableElement | null>;
  requestCellFocus: (date: Date) => void;
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

function useCalendarContext(component: string): CalendarContextValue {
  const ctx = useContext(CalendarContext);
  if (!ctx) {
    throw new Error(
      `<${component}> must be rendered inside <Calendar>. Import Calendar from './'.`,
    );
  }
  return ctx;
}

// ──────────────────────────────────────────────────────────────────────────
// Disabled-skip search
// Recursively walks `delta` steps from `start`, skipping disabled cells.
// Returns null when boundary reached without finding a focusable day.

function findNextFocusable(
  start: Date,
  delta: number,
  isDisabled: (d: Date) => boolean,
  min: Date | undefined,
  max: Date | undefined,
): Date | null {
  const MAX_ITERATIONS = 366 * 4; // 4 years safety — long enough for sparse calendars
  let candidate = addDays(start, delta);
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    if (min && candidate.getTime() < startOfDay(min).getTime()) return null;
    if (max && candidate.getTime() > startOfDay(max).getTime()) return null;
    if (!isDisabled(candidate)) return candidate;
    candidate = addDays(candidate, delta > 0 ? 1 : -1);
  }
  return null;
}

// ──────────────────────────────────────────────────────────────────────────
// Calendar — root + state holder

export interface CalendarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'dir' | 'defaultValue' | 'onChange'> {
  /** Controlled selected date. When provided, component is controlled. */
  value?: Date | null;
  /** Uncontrolled initial selected date. Ignored when controlled. */
  defaultValue?: Date | null;
  /** Fires on committed selection transitions (including clear to `null`). */
  onValueChange?: (date: Date | null) => void;
  /** Initial month to display when uncontrolled and no `defaultValue`. Default today. */
  defaultMonth?: Date;
  /** Minimum selectable date (inclusive, day granularity). */
  min?: Date;
  /** Maximum selectable date (inclusive, day granularity). */
  max?: Date;
  /**
   * Disable specific dates. Either an array of Date objects (matched by
   * same-day), or a predicate `(date) => boolean`. Disabled dates remain
   * focusable (aria-disabled) but are skipped during keyboard nav and
   * cannot be selected via click.
   */
  disabled?: CalendarDisabled;
  /**
   * BCP-47 locale tag for month/weekday names + week-start detection.
   * Default `'en-US'`. Consumer passes `'pl-PL'`, `'de-DE'`, etc. NOT
   * auto-detected from `document.documentElement.lang` to keep server
   * render deterministic.
   */
  locale?: string;
  /** Override locale-derived week start. `0` Sun / `1` Mon / `6` Sat. */
  weekStartsOn?: CalendarWeekStart;
  /** Show days from previous/next month in the grid. Default `true`. */
  showOutsideDays?: boolean;
  /** Always render 6 rows even when month fits in 5. Default `false`. */
  fixedWeeks?: boolean;
  /** Reading direction. Mirrors ArrowLeft/Right day semantics when `'rtl'`. */
  dir?: CalendarDir;
  /**
   * Compound override. When absent, the component renders
   * `<CalendarHeader/><CalendarGrid><CalendarGridHead/><CalendarGridBody/></CalendarGrid>`
   * by default. Pass children to replace the layout.
   */
  children?: ReactNode;
  className?: string;
}

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    defaultMonth,
    min,
    max,
    disabled,
    locale = 'en-US',
    weekStartsOn: weekStartsOnProp,
    showOutsideDays = true,
    fixedWeeks = false,
    dir = 'ltr',
    children,
    className,
    ...rest
  } = props;

  // Memoized onValueChange wrapper — filters nothing (public API already matches
  // hook signature `(Date | null) => void`) but keeps identity stable across
  // unrelated parent renders per E29 iter 2 pattern.
  const handleValueChange = useCallback(
    (next: Date | null) => {
      onValueChange?.(next);
    },
    [onValueChange],
  );

  const { value: selectedDate, setValue: setSelectedDate } = useFloatingValueState<Date>({
    controlledValue,
    defaultValue: defaultValue ?? null,
    onValueChange: handleValueChange,
  });

  // Today — computed once per mount. Day-granularity (midnight local).
  const today = useMemo(() => startOfDay(new Date()), []);

  // Initial focused date: selected → defaultMonth → today. Computed once on
  // mount; user nav overrides after. Excluded from deps intentionally —
  // recomputing on later selectedDate change would fight user's keyboard nav.
  const [focusedDate, setFocusedDate] = useState<Date>(() => {
    if (selectedDate && isDateInRange(selectedDate, min, max)) return startOfDay(selectedDate);
    if (defaultMonth) return startOfDay(defaultMonth);
    return today;
  });

  const displayMonth = useMemo(() => startOfMonth(focusedDate), [focusedDate]);

  const weekStartsOn = useMemo<CalendarWeekStart>(
    () => weekStartsOnProp ?? getWeekStartDay(locale),
    [weekStartsOnProp, locale],
  );

  // Split disabled-input into two stable-identity branches so the React
  // Compiler can preserve memoization (react-hooks/preserve-manual-memoization
  // cannot collapse branching-return shapes through a single useMemo).
  const disabledDateList = useMemo(
    () => (Array.isArray(disabled) ? disabled.map(startOfDay) : null),
    [disabled],
  );
  const disabledFn = useMemo(
    () => (typeof disabled === 'function' ? disabled : null),
    [disabled],
  );

  const isDisabled = useCallback(
    (date: Date) => {
      if (!isDateInRange(date, min, max)) return true;
      if (disabledDateList) return disabledDateList.some((x) => isSameDay(x, date));
      if (disabledFn) return disabledFn(date);
      return false;
    },
    [min, max, disabledDateList, disabledFn],
  );

  const baseId = useId();
  const gridRef = useRef<HTMLTableElement | null>(null);

  // Imperatively focus a cell after state commit. Called from keyboard handler
  // AFTER setFocusedDate so the target cell's tabIndex has flipped to 0.
  const requestCellFocus = useCallback((date: Date) => {
    const iso = toIsoDateString(date);
    // microtask — waits one frame so React reconciles tabIndex before focus
    queueMicrotask(() => {
      const cell = gridRef.current?.querySelector<HTMLElement>(
        `button[data-calendar-cell="${iso}"]`,
      );
      cell?.focus();
    });
  }, []);

  const ctx = useMemo<CalendarContextValue>(
    () => ({
      selectedDate,
      setSelectedDate,
      focusedDate,
      setFocusedDate,
      displayMonth,
      locale,
      weekStartsOn,
      min,
      max,
      isDisabled,
      showOutsideDays,
      fixedWeeks,
      dir,
      today,
      baseId,
      gridRef,
      requestCellFocus,
    }),
    [
      selectedDate,
      setSelectedDate,
      focusedDate,
      displayMonth,
      locale,
      weekStartsOn,
      min,
      max,
      isDisabled,
      showOutsideDays,
      fixedWeeks,
      dir,
      today,
      baseId,
      requestCellFocus,
    ],
  );

  return (
    <CalendarContext.Provider value={ctx}>
      <div
        ref={ref}
        dir={dir}
        className={cn(styles.root, className)}
        {...rest}
      >
        {children ?? (
          <>
            <CalendarHeader />
            <CalendarGrid>
              <CalendarGridHead />
              <CalendarGridBody />
            </CalendarGrid>
          </>
        )}
      </div>
    </CalendarContext.Provider>
  );
});

// ──────────────────────────────────────────────────────────────────────────
// CalendarHeader — prev/next chevrons + month/year live label

export interface CalendarHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Accessible label for prev button. Default `"Previous month"`. */
  prevLabel?: string;
  /** Accessible label for next button. Default `"Next month"`. */
  nextLabel?: string;
  /** Month name formatting. Default `'long'`. */
  monthFormat?: 'long' | 'short';
}

export const CalendarHeader = forwardRef<HTMLDivElement, CalendarHeaderProps>(
  function CalendarHeader(props, ref) {
    const {
      prevLabel = 'Previous month',
      nextLabel = 'Next month',
      monthFormat = 'long',
      className,
      ...rest
    } = props;
    const { displayMonth, focusedDate, setFocusedDate, locale, min, max, baseId } =
      useCalendarContext('CalendarHeader');

    const monthLabel = useMemo(
      () => formatMonthYear(displayMonth, locale, monthFormat),
      [displayMonth, locale, monthFormat],
    );

    // Chevron disable: prev disabled when entire previous month sits before min.
    // next disabled when entire next month sits after max. Midpoint cells can
    // still be clamped by cell-level aria-disabled + keyboard skip.
    const prevDisabled = useMemo(() => {
      if (!min) return false;
      const prevMonthEnd = endOfMonth(addMonths(displayMonth, -1));
      return prevMonthEnd.getTime() < startOfDay(min).getTime();
    }, [min, displayMonth]);

    const nextDisabled = useMemo(() => {
      if (!max) return false;
      const nextMonthStart = startOfMonth(addMonths(displayMonth, 1));
      return nextMonthStart.getTime() > startOfDay(max).getTime();
    }, [max, displayMonth]);

    const handlePrev = useCallback(() => {
      setFocusedDate(addMonths(focusedDate, -1));
    }, [focusedDate, setFocusedDate]);

    const handleNext = useCallback(() => {
      setFocusedDate(addMonths(focusedDate, 1));
    }, [focusedDate, setFocusedDate]);

    const labelId = `${baseId}-label`;

    return (
      <div ref={ref} className={cn(styles.header, className)} {...rest}>
        <button
          type="button"
          className={styles.chevron}
          aria-label={prevLabel}
          onClick={handlePrev}
          disabled={prevDisabled}
        >
          <ChevronLeftIcon />
        </button>
        <div
          id={labelId}
          className={styles.monthLabel}
          aria-live="polite"
          aria-atomic="true"
        >
          {monthLabel}
        </div>
        <button
          type="button"
          className={styles.chevron}
          aria-label={nextLabel}
          onClick={handleNext}
          disabled={nextDisabled}
        >
          <ChevronRightIcon />
        </button>
      </div>
    );
  },
);

function ChevronLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M10 4L6 8l4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// CalendarGrid — role="grid" + keyboard handler owner

export interface CalendarGridProps extends TableHTMLAttributes<HTMLTableElement> {
  children?: ReactNode;
}

export const CalendarGrid = forwardRef<HTMLTableElement, CalendarGridProps>(function CalendarGrid(
  props,
  forwardedRef,
) {
  const { children, className, ...rest } = props;
  const {
    focusedDate,
    setFocusedDate,
    setSelectedDate,
    min,
    max,
    isDisabled,
    dir,
    weekStartsOn,
    baseId,
    gridRef,
    requestCellFocus,
  } = useCalendarContext('CalendarGrid');

  const mergedRef = useMemo(() => mergeRefs<HTMLTableElement>(gridRef, forwardedRef), [
    gridRef,
    forwardedRef,
  ]);

  const labelId = `${baseId}-label`;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTableElement>) => {
      // Skip non-Shift modifier combos — let browser hotkeys (Alt+←, Ctrl+Home,
      // Cmd+arrow) pass through untouched. Shift IS used intentionally for
      // year navigation.
      if (event.altKey || event.metaKey || event.ctrlKey) return;

      const isRtl = dir === 'rtl';
      let next: Date | null = null;
      let shouldSelect = false;

      switch (event.key) {
        case 'ArrowLeft':
          next = findNextFocusable(focusedDate, isRtl ? 1 : -1, isDisabled, min, max);
          break;
        case 'ArrowRight':
          next = findNextFocusable(focusedDate, isRtl ? -1 : 1, isDisabled, min, max);
          break;
        case 'ArrowUp':
          next = findNextFocusable(focusedDate, -7, isDisabled, min, max);
          break;
        case 'ArrowDown':
          next = findNextFocusable(focusedDate, 7, isDisabled, min, max);
          break;
        case 'Home': {
          const startDay = startOfWeek(focusedDate, weekStartsOn);
          next = isDisabled(startDay)
            ? findNextFocusable(startDay, 1, isDisabled, min, max)
            : startDay;
          break;
        }
        case 'End': {
          const endDay = endOfWeek(focusedDate, weekStartsOn);
          next = isDisabled(endDay)
            ? findNextFocusable(endDay, -1, isDisabled, min, max)
            : endDay;
          break;
        }
        case 'PageUp': {
          const step = event.shiftKey ? -12 : -1;
          const candidate = addMonths(focusedDate, step);
          next = isDisabled(candidate)
            ? findNextFocusable(candidate, 1, isDisabled, min, max)
            : candidate;
          break;
        }
        case 'PageDown': {
          const step = event.shiftKey ? 12 : 1;
          const candidate = addMonths(focusedDate, step);
          next = isDisabled(candidate)
            ? findNextFocusable(candidate, -1, isDisabled, min, max)
            : candidate;
          break;
        }
        case 'Enter':
        case ' ':
          if (!isDisabled(focusedDate)) {
            shouldSelect = true;
          }
          break;
        default:
          return; // unhandled key — let browser handle
      }

      event.preventDefault();

      if (shouldSelect) {
        setSelectedDate(focusedDate);
        return;
      }

      if (next && !isSameDay(next, focusedDate)) {
        setFocusedDate(next);
        requestCellFocus(next);
      }
    },
    [
      dir,
      focusedDate,
      isDisabled,
      min,
      max,
      weekStartsOn,
      setFocusedDate,
      setSelectedDate,
      requestCellFocus,
    ],
  );

  return (
    <table
      ref={mergedRef}
      role="grid"
      aria-labelledby={labelId}
      className={cn(styles.grid, className)}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {children}
    </table>
  );
});

// ──────────────────────────────────────────────────────────────────────────
// CalendarGridHead — weekday row (Mon Tue Wed ...)

export type CalendarGridHeadProps = HTMLAttributes<HTMLTableSectionElement>;

// Reference Sunday anchor — Jan 5 2020 was a Sunday. We compute weekday
// labels from this anchor + `weekStartsOn` offset so getWeekdayName receives
// a real Date without depending on "today".
const WEEKDAY_ANCHOR_SUNDAY = new Date(2020, 0, 5);

export const CalendarGridHead = forwardRef<HTMLTableSectionElement, CalendarGridHeadProps>(
  function CalendarGridHead(props, ref) {
    const { className, ...rest } = props;
    const { weekStartsOn, locale } = useCalendarContext('CalendarGridHead');

    const weekdays = useMemo(() => {
      const days: Array<{ short: string; full: string; key: number }> = [];
      for (let i = 0; i < 7; i++) {
        const day = addDays(WEEKDAY_ANCHOR_SUNDAY, weekStartsOn + i);
        days.push({
          short: getWeekdayName(day, locale, 'short'),
          full: getWeekdayName(day, locale, 'long'),
          key: day.getDay(),
        });
      }
      return days;
    }, [weekStartsOn, locale]);

    return (
      <thead ref={ref} className={cn(styles.gridHead, className)} {...rest}>
        <tr className={styles.gridHeadRow}>
          {weekdays.map((day) => (
            <th
              key={day.key}
              scope="col"
              abbr={day.full}
              className={styles.weekday}
            >
              <span aria-hidden="true">{day.short}</span>
              <span className={styles.srOnly}>{day.full}</span>
            </th>
          ))}
        </tr>
      </thead>
    );
  },
);

// ──────────────────────────────────────────────────────────────────────────
// CalendarGridBody — date rows

export type CalendarGridBodyProps = HTMLAttributes<HTMLTableSectionElement>;

export const CalendarGridBody = forwardRef<HTMLTableSectionElement, CalendarGridBodyProps>(
  function CalendarGridBody(props, ref) {
    const { className, ...rest } = props;
    const { displayMonth, weekStartsOn, fixedWeeks } = useCalendarContext('CalendarGridBody');

    const weeks = useMemo(() => {
      const firstOfMonth = startOfMonth(displayMonth);
      const lastOfMonth = endOfMonth(displayMonth);
      const gridStart = startOfWeek(firstOfMonth, weekStartsOn);
      const gridEnd = fixedWeeks
        ? addDays(gridStart, 6 * 7 - 1)
        : endOfWeek(lastOfMonth, weekStartsOn);

      // Round to handle DST (spring forward / fall back add/remove an hour)
      const msPerDay = 24 * 60 * 60 * 1000;
      const totalDays = Math.round((gridEnd.getTime() - gridStart.getTime()) / msPerDay) + 1;
      const numWeeks = Math.ceil(totalDays / 7);

      const rows: Date[][] = [];
      for (let w = 0; w < numWeeks; w++) {
        const row: Date[] = [];
        for (let d = 0; d < 7; d++) {
          row.push(addDays(gridStart, w * 7 + d));
        }
        rows.push(row);
      }
      return rows;
    }, [displayMonth, weekStartsOn, fixedWeeks]);

    return (
      <tbody ref={ref} className={cn(styles.gridBody, className)} {...rest}>
        {weeks.map((week, wIdx) => (
          <tr key={wIdx} className={styles.row}>
            {week.map((date) => (
              <CalendarCell key={toIsoDateString(date)} date={date} />
            ))}
          </tr>
        ))}
      </tbody>
    );
  },
);

// ──────────────────────────────────────────────────────────────────────────
// CalendarCell — single date cell + focusable button

export interface CalendarCellProps {
  /** Date this cell represents (may be outside the display month). */
  date: Date;
  /** Extra class merged onto the `<td>` element. */
  className?: string;
}

export const CalendarCell = forwardRef<HTMLTableCellElement, CalendarCellProps>(
  function CalendarCell(props, ref) {
    const { date, className } = props;
    const {
      selectedDate,
      setSelectedDate,
      focusedDate,
      setFocusedDate,
      displayMonth,
      today,
      showOutsideDays,
      isDisabled,
      locale,
    } = useCalendarContext('CalendarCell');

    const iso = toIsoDateString(date);
    const isOutside = !isSameMonth(date, displayMonth);
    const isSelected = selectedDate != null && isSameDay(date, selectedDate);
    const isFocused = isSameDay(date, focusedDate);
    const isToday = isSameDay(date, today);
    const disabled = isDisabled(date);

    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        setFocusedDate(date);
        setSelectedDate(date);
      },
      [disabled, date, setFocusedDate, setSelectedDate],
    );

    // Hidden outside day — cell still in DOM for layout stability but empty
    // content + aria-hidden so SR skips it.
    if (isOutside && !showOutsideDays) {
      return (
        <td
          ref={ref}
          role="gridcell"
          aria-hidden="true"
          className={cn(styles.cell, styles.cellEmpty, className)}
        />
      );
    }

    return (
      <td
        ref={ref}
        role="gridcell"
        aria-selected={isSelected ? true : undefined}
        className={cn(styles.cell, className)}
      >
        <button
          type="button"
          data-calendar-cell={iso}
          className={cn(
            styles.cellButton,
            isSelected && styles.cellButtonSelected,
            isToday && !isSelected && styles.cellButtonToday,
            isOutside && styles.cellButtonOutside,
            disabled && styles.cellButtonDisabled,
          )}
          tabIndex={isFocused ? 0 : -1}
          aria-label={formatFullDate(date, locale)}
          aria-current={isToday ? 'date' : undefined}
          aria-disabled={disabled ? true : undefined}
          onClick={handleClick}
        >
          <span aria-hidden="true">{date.getDate()}</span>
        </button>
      </td>
    );
  },
);
