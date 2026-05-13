'use client';

/**
 * DateRangePicker — accessible date-range form field composed of an editable
 * text input + embedded multi-month Calendar popup per WAI-ARIA APG
 * `/datepicker-dialog/` modified for range selection.
 *
 * @layer complex-interactive (0.18.0 Date/Time pack — sibling of DatePicker E142)
 * @tokens identical token base as DatePicker (input/popover/space/radius/font)
 *   plus 2 range-overlay tokens (defined inline via color-mix from `--color-brand`
 *   to avoid scale sprawl):
 *   - in-range background = `color-mix(--color-brand, 10%)`
 *   - hover-tail background = `color-mix(--color-brand, 5%)`
 * @deps zero runtime deps. Composes `<Calendar>` (uses E01.0 AMEND props
 *   `cellExtras` + `onCellHover` + `onGridMouseLeave` for range overlay).
 *   Floating primitives (5 of 6): `useFloatingState` + `useFloatingValueState<DateRange>` +
 *   `createFloatingContext` + `FloatingPortal` + `useFloatingDismiss`.
 *   Positioning via `utils/useFloating`. Native `Date` + `Intl` only — NO
 *   date-fns/dayjs/luxon/moment.
 * @a11y APG `/datepicker-dialog/` + `/grid/` modified for range:
 *   - Input: `role="combobox" aria-haspopup="dialog" aria-expanded aria-controls
 *     aria-required aria-invalid aria-disabled`. No native `disabled`
 *     (AT discoverability per Select/Combobox precedent).
 *   - Popup: `role="dialog" aria-modal="false" aria-labelledby=inputId`.
 *   - N embedded Calendars (per `numberOfMonths`), each an independent
 *     `role="grid"` table. Per-Calendar headers hidden in compound mode;
 *     single sync'd header above months row owns prev/next chevrons.
 *   - Range bounds: `aria-selected="true"` via `cellExtras` on bound cells.
 *   - Intermediate range cells: `data-in-range="true"`, plus `aria-label`
 *     augmentation "<full date>, in selected range" (verify in NVDA sweep —
 *     fallback: rely on data-in-range visual only if double-announce).
 *   - Hover tail (during selection): `data-range-hover-tail="true"`.
 *   - Cross-Calendar focus boundary: HARD STOP per plan AD1 Q1 (boundary
 *     ArrowKey does not jump grids; user Tab moves to next Calendar's
 *     tabIndex=0 cell). Documented in JSDoc; rationale: avoids Calendar
 *     focus-orchestration API addition + matches user mental model
 *     "two independent grids with Tab handoff".
 *
 *   Keyboard model (input — mirrors DatePicker):
 *   - Alt+ArrowDown / ArrowDown: open popup + move focus to Calendar
 *     (selected `from` if set, else today, else current displayMonth).
 *   - Alt+ArrowUp: close popup.
 *   - Enter: parse typed search — formats accepted:
 *       "YYYY-MM-DD → YYYY-MM-DD" (em-dash) OR
 *       "YYYY-MM-DD -> YYYY-MM-DD" (ASCII arrow) OR
 *       "YYYY-MM-DD / YYYY-MM-DD" OR
 *       "YYYY-MM-DD" (sets pendingFrom only, opens popup for click-2).
 *   - Escape: close popup, keep focus.
 *   - IME guard: composing → skip Enter/Escape (CJK input).
 *   - Tab: default (exits input).
 *
 *   Range selection state machine (commitBound semantics):
 *   - Idle + click d → pendingFrom = d (NO onValueChange fire — half-state)
 *   - pendingFrom set + click d:
 *       d >= pendingFrom → range = {from: pendingFrom, to: d}, FIRE onValueChange
 *       d <  pendingFrom → range = {from: d, to: pendingFrom} (REORDER), FIRE onValueChange
 *       d == pendingFrom → range = {from: d, to: d} (ONE-DAY RANGE), FIRE onValueChange
 *   - Committed full range + click d → restart (pendingFrom = d, range cleared)
 *   - Input Backspace/Delete clear → range = {null,null}, pendingFrom = null
 *
 *   Hover preview: during pendingFrom-set state, hovering a cell paints
 *   the [min(pendingFrom, hovered), max(pendingFrom, hovered)] interval
 *   with `data-range-hover-tail`. Cleared on `onGridMouseLeave` (Calendar
 *   AMEND callback) or popover close.
 *
 *   Form participation: when `name` prop set, renders TWO hidden inputs
 *   `${name}_from` + `${name}_to` carrying ISO `yyyy-mm-dd` values. Null
 *   bound omitted when `required=false`. When `required=true`, BOTH inputs
 *   render with empty value to surface native HTML5 `:invalid` on submit.
 *
 *   Two-month / three-month layout: `numberOfMonths={1|2|3}` (default 1).
 *   All Calendars share single `displayMonth` state at root; chevron
 *   sync via `key`-driven Calendar remount on displayMonth change
 *   (acceptable focus-loss on chevron click; keyboard arrow nav within
 *   a single Calendar preserves focus).
 *
 *   RTL: `dir="rtl"` propagates to Calendar; months row uses logical flex
 *   so later month renders on visual LEFT in RTL.
 *
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/
 * @pattern-parent DatePicker (E142) — mirror input keyboard model, IME guard,
 *   Blur Strategy A, useId baseId pattern.
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y ✓ — Playwright + axe runtime
 *   MANDATORY per 0.18.0 audit meta-finding (DataTable post-DONE iter-3).
 * @regressions tests/DateRangePicker.regression.spec.ts — DR-R01..R20 cases
 *   covering hover persistence, cross-grid Tab, reorder, disabled-mid-range,
 *   locale propagation, focus on open, half-range form blocked, Backspace
 *   clear, typed parse formats, RTL flip, cross-grid hover tail, chevron
 *   disable at min/max, programmatic override mid-selection, leap-year,
 *   year boundary, DST, min/max clamp.
 * @example
 *   // Uncontrolled — DateRangePickerContent auto-embeds N Calendars
 *   <DateRangePicker
 *     defaultValue={{ from: new Date(2026, 4, 1), to: new Date(2026, 4, 15) }}
 *     onValueChange={setRange}
 *     numberOfMonths={2}
 *   >
 *     <DateRangePickerInput placeholder="YYYY-MM-DD → YYYY-MM-DD" />
 *     <DateRangePickerContent />
 *   </DateRangePicker>
 *
 *   // Controlled + Polish locale + min/max:
 *   <DateRangePicker
 *     value={range}
 *     onValueChange={setRange}
 *     locale="pl-PL"
 *     min={new Date(2026, 0, 1)}
 *     max={new Date(2026, 11, 31)}
 *     numberOfMonths={2}
 *   >
 *     <DateRangePickerInput />
 *     <DateRangePickerContent />
 *   </DateRangePicker>
 *
 *   // Form participation with required:
 *   <form onSubmit={handleSubmit}>
 *     <DateRangePicker name="trip" required>
 *       <DateRangePickerInput />
 *       <DateRangePickerContent />
 *     </DateRangePicker>
 *     <button type="submit">Submit</button>
 *   </form>
 */

import {
  forwardRef,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  Calendar,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
} from '../Calendar';
import type { CalendarDir, CalendarDisabled, CalendarWeekStart } from '../Calendar';
import {
  createFloatingContext,
  FloatingPortal,
  useFloatingDismiss,
  useFloatingState,
  useFloatingValueState,
} from '../../utils/floating';
import { useFloating } from '../../utils/useFloating';
import type { Placement } from '../../utils/position';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import {
  addMonths,
  endOfMonth,
  formatFullDate,
  formatMonthYear,
  isDateInRange,
  isSameDay,
  parseIsoDateString,
  startOfDay,
  startOfMonth,
  toIsoDateString,
} from '../../utils/date';
import styles from './DateRangePicker.module.scss';

// ──────────────────────────────────────────────────────────────────────────
// Types

export type DateRange = { from: Date | null; to: Date | null };

const EMPTY_RANGE: DateRange = Object.freeze({ from: null, to: null }) as DateRange;

// ──────────────────────────────────────────────────────────────────────────
// Context

interface DateRangePickerContextValue {
  range: DateRange;
  pendingFrom: Date | null;
  hovered: Date | null;
  commitBound: (date: Date) => void;
  clearRange: () => void;
  setHovered: (date: Date | null) => void;
  clearHovered: () => void;
  open: boolean;
  setOpen: (next: boolean) => void;
  search: string;
  setSearch: (next: string) => void;
  commitSearch: () => void;
  hasValidationError: boolean;
  openPopup: (focusCalendar?: boolean) => void;
  closePopup: (returnFocus?: boolean) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  isDisabled: boolean;
  required: boolean;
  min: Date | undefined;
  max: Date | undefined;
  disabledDates: CalendarDisabled | undefined;
  locale: string;
  weekStartsOn: CalendarWeekStart | undefined;
  dir: CalendarDir;
  placement: Placement;
  sideOffset: number;
  numberOfMonths: 1 | 2 | 3;
  displayMonth: Date;
  setDisplayMonth: (next: Date) => void;
  baseId: string;
  inputId: string;
  contentId: string;
  name: string | undefined;
}

const [DateRangePickerContextProvider, useDateRangePickerContext] =
  createFloatingContext<DateRangePickerContextValue>('DateRangePicker');

// ──────────────────────────────────────────────────────────────────────────
// DateRangePicker — root + state

export interface DateRangePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'defaultValue' | 'onChange' | 'dir'> {
  /** Controlled range. */
  value?: DateRange;
  /** Uncontrolled initial range. `undefined` ≡ `{from:null,to:null}`. */
  defaultValue?: DateRange;
  /**
   * Fires on FULL-RANGE commit or clear-to-null. Half-range intermediate
   * (pendingFrom set, awaiting click 2) does NOT emit.
   */
  onValueChange?: (range: DateRange) => void;
  /** Controlled popup open state. */
  open?: boolean;
  /** Uncontrolled initial open state. Default `false`. */
  defaultOpen?: boolean;
  /** Fires whenever the popup open state changes (controlled + uncontrolled). */
  onOpenChange?: (open: boolean) => void;
  /** Minimum selectable date (inclusive, day granularity). */
  min?: Date;
  /** Maximum selectable date (inclusive, day granularity). */
  max?: Date;
  /** Widget-wide lockdown. */
  disabled?: boolean;
  /** Per-date disable (array or predicate). Propagated to all embedded Calendars. */
  disabledDates?: CalendarDisabled;
  /** BCP-47 locale tag. Default `'en-US'`. */
  locale?: string;
  /** Override locale-derived week start. */
  weekStartsOn?: CalendarWeekStart;
  /** Reading direction. RTL flips month visual order. */
  dir?: CalendarDir;
  /** Number of side-by-side months in popup. Default 1. */
  numberOfMonths?: 1 | 2 | 3;
  /** Required for form submission (BOTH bounds). */
  required?: boolean;
  /** Form input base name. Renders `${name}_from` + `${name}_to` hidden inputs. */
  name?: string;
  /** Placement of popup relative to input. Default `'bottom-start'`. */
  placement?: Placement;
  /** Pixel gap between input and popup. Default `4`. */
  sideOffset?: number;
  /** Compound children — `<DateRangePickerInput>` + `<DateRangePickerContent>`. */
  children?: ReactNode;
}

export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  function DateRangePicker(props, ref) {
    const {
      value: controlledValue,
      defaultValue,
      onValueChange,
      open: controlledOpen,
      defaultOpen,
      onOpenChange,
      min,
      max,
      disabled = false,
      disabledDates,
      locale = 'en-US',
      weekStartsOn,
      dir = 'ltr',
      numberOfMonths = 1,
      required = false,
      name,
      placement = 'bottom-start',
      sideOffset = 4,
      children,
      className,
      ...rest
    } = props;

    const handleValueChange = useCallback(
      (next: DateRange | null) => {
        onValueChange?.(next ?? EMPTY_RANGE);
      },
      [onValueChange],
    );

    const { value: rangeMaybe, setValue: setRangeRaw } = useFloatingValueState<DateRange>({
      controlledValue,
      defaultValue: defaultValue ?? EMPTY_RANGE,
      onValueChange: handleValueChange,
    });

    const range: DateRange = rangeMaybe ?? EMPTY_RANGE;
    const setRange = useCallback(
      (next: DateRange) => {
        setRangeRaw(next);
      },
      [setRangeRaw],
    );

    const { open, setOpen } = useFloatingState({
      controlledOpen,
      defaultOpen: defaultOpen ?? false,
      onOpenChange,
    });

    // Half-range intermediate state — NOT exposed via onValueChange
    const [pendingFrom, setPendingFrom] = useState<Date | null>(null);
    const [hovered, setHoveredState] = useState<Date | null>(null);

    // Sync pendingFrom + hovered on ANY external value prop change (controlled
    // override). Per audit-fix C3 — must clear `pendingFrom` even on clear-to-null
    // override, otherwise the next click 2 would commit a range against a STALE
    // half-state pendingFrom. Same "adjust state during render" pattern as
    // DatePicker's prevValue sentinel.
    const [prevControlledValue, setPrevControlledValue] = useState(controlledValue);
    if (controlledValue !== prevControlledValue) {
      setPrevControlledValue(controlledValue);
      setPendingFrom(null);
      setHoveredState(null);
    }

    // Search state — typed text representation of committed range
    const [search, setSearchState] = useState<string>(() => formatRangeForInput(range));
    const [prevRange, setPrevRange] = useState<DateRange>(range);
    if (range !== prevRange) {
      setPrevRange(range);
      setSearchState(formatRangeForInput(range));
    }

    // Display month — single source of truth for chevron sync across N Calendars
    const [displayMonth, setDisplayMonthState] = useState<Date>(() => {
      const seed = range.from ?? defaultValue?.from ?? new Date();
      return startOfMonth(seed);
    });

    const setDisplayMonth = useCallback((next: Date) => {
      setDisplayMonthState(startOfMonth(next));
    }, []);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const baseId = useId();
    const inputId = `${baseId}-input`;
    const contentId = `${baseId}-content`;

    const isDisabledDate = useCallback(
      (date: Date) => {
        if (!isDateInRange(date, min, max)) return true;
        if (Array.isArray(disabledDates)) {
          const start = startOfDay(date);
          return disabledDates.some((d) => isSameDay(startOfDay(d), start));
        }
        if (typeof disabledDates === 'function') return disabledDates(date);
        return false;
      },
      [min, max, disabledDates],
    );

    const [hasValidationError, setHasValidationError] = useState(false);

    const setSearch = useCallback((next: string) => {
      setSearchState(next);
      setHasValidationError(false);
    }, []);

    const commitBound = useCallback(
      (date: Date) => {
        const d = startOfDay(date);
        if (isDisabledDate(d)) return;

        // Committed full range exists — restart with this date as pendingFrom
        if (range.from && range.to) {
          setRange(EMPTY_RANGE);
          setPendingFrom(d);
          setHoveredState(null);
          return;
        }
        // No pending — record as click 1
        if (pendingFrom === null) {
          setPendingFrom(d);
          return;
        }
        // pendingFrom exists — this is click 2 (reorder if d < pendingFrom)
        const fromTime = pendingFrom.getTime();
        const dTime = d.getTime();
        const from = dTime < fromTime ? d : pendingFrom;
        const to = dTime < fromTime ? pendingFrom : d;
        setPendingFrom(null);
        setHoveredState(null);
        setRange({ from, to });
      },
      [range, pendingFrom, isDisabledDate, setRange],
    );

    const clearRange = useCallback(() => {
      setPendingFrom(null);
      setHoveredState(null);
      setRange(EMPTY_RANGE);
    }, [setRange]);

    const setHovered = useCallback((date: Date | null) => {
      setHoveredState(date);
    }, []);

    const clearHovered = useCallback(() => {
      setHoveredState(null);
    }, []);

    const commitSearch = useCallback(() => {
      const trimmed = search.trim();
      if (trimmed === '') {
        if (range.from || range.to) clearRange();
        setHasValidationError(false);
        return;
      }
      const parsed = parseRangeFromInput(trimmed);
      if (!parsed) {
        setSearchState(formatRangeForInput(range));
        setHasValidationError(true);
        return;
      }
      if (parsed.kind === 'full') {
        const fromOk = !isDisabledDate(parsed.from);
        const toOk = !isDisabledDate(parsed.to);
        if (!fromOk || !toOk) {
          setSearchState(formatRangeForInput(range));
          setHasValidationError(true);
          return;
        }
        const [from, to] =
          parsed.from.getTime() <= parsed.to.getTime()
            ? [parsed.from, parsed.to]
            : [parsed.to, parsed.from];
        setRange({ from, to });
        setPendingFrom(null);
        setHoveredState(null);
        setSearchState(formatRangeForInput({ from, to }));
        setHasValidationError(false);
        return;
      }
      // Half-range typed — set pendingFrom and open popup for click 2
      if (isDisabledDate(parsed.from)) {
        setSearchState(formatRangeForInput(range));
        setHasValidationError(true);
        return;
      }
      setRange(EMPTY_RANGE);
      setPendingFrom(parsed.from);
      setSearchState(toIsoDateString(parsed.from));
      setHasValidationError(false);
    }, [search, range, isDisabledDate, setRange, clearRange]);

    const focusCalendarInitial = useCallback(() => {
      queueMicrotask(() => {
        const content = contentRef.current;
        if (!content) return;
        // Per audit-fix I4: prefer pendingFrom when half-range in progress so
        // the user lands at click-1's anchor rather than today.
        const targetIso = toIsoDateString(
          range.from ?? pendingFrom ?? startOfDay(new Date()),
        );
        const preferred = content.querySelector<HTMLElement>(
          `button[data-calendar-cell="${targetIso}"]`,
        );
        const fallback = content.querySelector<HTMLElement>(
          'button[data-calendar-cell][tabindex="0"]',
        );
        (preferred ?? fallback)?.focus();
      });
    }, [range.from, pendingFrom]);

    const openPopup = useCallback(
      (focusCalendar = false) => {
        if (disabled) return;
        setOpen(true);
        if (focusCalendar) focusCalendarInitial();
      },
      [disabled, setOpen, focusCalendarInitial],
    );

    const closePopup = useCallback(
      (returnFocus = false) => {
        setOpen(false);
        setHoveredState(null);
        if (returnFocus) {
          queueMicrotask(() => inputRef.current?.focus());
        }
      },
      [setOpen],
    );

    const handleDismiss = useCallback(() => {
      const wasFocusInside = contentRef.current?.contains(document.activeElement);
      setOpen(false);
      setHoveredState(null);
      if (wasFocusInside) {
        queueMicrotask(() => inputRef.current?.focus());
      }
    }, [setOpen]);

    useFloatingDismiss({
      open,
      onDismiss: handleDismiss,
      contentRef,
      triggerRef: inputRef,
      closeOnEscape: true,
      closeOnOutsideClick: true,
    });

    const ctx = useMemo<DateRangePickerContextValue>(
      () => ({
        range,
        pendingFrom,
        hovered,
        commitBound,
        clearRange,
        setHovered,
        clearHovered,
        open,
        setOpen,
        search,
        setSearch,
        commitSearch,
        hasValidationError,
        openPopup,
        closePopup,
        inputRef,
        contentRef,
        isDisabled: disabled,
        required,
        min,
        max,
        disabledDates,
        locale,
        weekStartsOn,
        dir,
        placement,
        sideOffset,
        numberOfMonths,
        displayMonth,
        setDisplayMonth,
        baseId,
        inputId,
        contentId,
        name,
      }),
      [
        range,
        pendingFrom,
        hovered,
        commitBound,
        clearRange,
        setHovered,
        clearHovered,
        open,
        setOpen,
        search,
        setSearch,
        commitSearch,
        hasValidationError,
        openPopup,
        closePopup,
        disabled,
        required,
        min,
        max,
        disabledDates,
        locale,
        weekStartsOn,
        dir,
        placement,
        sideOffset,
        numberOfMonths,
        displayMonth,
        setDisplayMonth,
        baseId,
        inputId,
        contentId,
        name,
      ],
    );

    return (
      <DateRangePickerContextProvider value={ctx}>
        <div ref={ref} dir={dir} className={cn(styles.root, className)} {...rest}>
          {children}
          {name ? renderHiddenInputs(name, range, required) : null}
        </div>
      </DateRangePickerContextProvider>
    );
  },
);

function renderHiddenInputs(name: string, range: DateRange, required: boolean): ReactNode {
  // Path A per plan C5 — when required, BOTH inputs render (empty when null)
  // so native :invalid surfaces on submit. When NOT required, omit null bounds.
  const fromIso = range.from ? toIsoDateString(range.from) : '';
  const toIso = range.to ? toIsoDateString(range.to) : '';
  const elements: ReactNode[] = [];
  if (required || range.from) {
    elements.push(
      <input
        key="from"
        type="hidden"
        name={`${name}_from`}
        value={fromIso}
        required={required || undefined}
      />,
    );
  }
  if (required || range.to) {
    elements.push(
      <input
        key="to"
        type="hidden"
        name={`${name}_to`}
        value={toIso}
        required={required || undefined}
      />,
    );
  }
  return elements;
}

// ──────────────────────────────────────────────────────────────────────────
// Input text formatting + parsing

// Per audit-fix I5: regex narrowed to em-dash + ASCII arrow only (matches JSDoc
// `@a11y` keyboard model + form/regression specs). The `/` separator was
// undocumented in user-facing JSDoc and not exercised by tests.
const RANGE_SEP_RE = /\s*(?:→|->)\s*/;

function formatRangeForInput(range: DateRange): string {
  if (range.from && range.to) {
    return `${toIsoDateString(range.from)} → ${toIsoDateString(range.to)}`;
  }
  if (range.from) return toIsoDateString(range.from);
  if (range.to) return toIsoDateString(range.to);
  return '';
}

type ParsedRange =
  | { kind: 'full'; from: Date; to: Date }
  | { kind: 'half'; from: Date };

function parseRangeFromInput(text: string): ParsedRange | null {
  const parts = text.split(RANGE_SEP_RE).filter(Boolean);
  if (parts.length === 1) {
    const d = parseIsoDateString(parts[0]!.trim());
    if (!d) return null;
    return { kind: 'half', from: startOfDay(d) };
  }
  if (parts.length === 2) {
    const a = parseIsoDateString(parts[0]!.trim());
    const b = parseIsoDateString(parts[1]!.trim());
    if (!a || !b) return null;
    return { kind: 'full', from: startOfDay(a), to: startOfDay(b) };
  }
  return null;
}

// ──────────────────────────────────────────────────────────────────────────
// DateRangePickerInput — editable text input (ARIA combobox)

export interface DateRangePickerInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value' | 'defaultValue' | 'onChange' | 'role' | 'aria-controls' | 'aria-expanded'
  > {
  /** Icon button visible inside the input's right side. Default `true`. */
  showCalendarIcon?: boolean;
  /** Accessible label for the calendar icon button. Default `"Open calendar"`. */
  calendarIconLabel?: string;
  /** External validation error state — ORed with internal parse-failure flag. */
  invalid?: boolean;
}

export const DateRangePickerInput = forwardRef<HTMLInputElement, DateRangePickerInputProps>(
  function DateRangePickerInput(props, forwardedRef) {
    const {
      showCalendarIcon = true,
      calendarIconLabel = 'Open calendar',
      placeholder = 'YYYY-MM-DD → YYYY-MM-DD',
      className,
      invalid = false,
      onKeyDown,
      onBlur,
      onFocus,
      onCompositionStart,
      onCompositionEnd,
      ...rest
    } = props;

    const ctx = useDateRangePickerContext('<DateRangePickerInput>');
    const {
      search,
      setSearch,
      commitSearch,
      open,
      openPopup,
      closePopup,
      inputRef,
      contentRef,
      isDisabled,
      required,
      inputId,
      contentId,
      hasValidationError,
    } = ctx;

    const effectiveInvalid = invalid || hasValidationError;

    const mergedRef = useMemo(
      () => mergeRefs<HTMLInputElement>(inputRef, forwardedRef),
      [inputRef, forwardedRef],
    );

    const isComposingRef = useRef(false);

    const handleCompositionStart = useCallback(
      (e: React.CompositionEvent<HTMLInputElement>) => {
        isComposingRef.current = true;
        onCompositionStart?.(e);
      },
      [onCompositionStart],
    );

    const handleCompositionEnd = useCallback(
      (e: React.CompositionEvent<HTMLInputElement>) => {
        isComposingRef.current = false;
        setSearch((e.target as HTMLInputElement).value);
        onCompositionEnd?.(e);
      },
      [setSearch, onCompositionEnd],
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (isComposingRef.current || e.key === 'Process' || e.keyCode === 229) return;

        if (e.altKey && e.key === 'ArrowDown') {
          e.preventDefault();
          openPopup(true);
          return;
        }
        if (e.altKey && e.key === 'ArrowUp') {
          e.preventDefault();
          if (open) closePopup(false);
          return;
        }
        if (!e.altKey && !e.metaKey && !e.ctrlKey && e.key === 'ArrowDown') {
          e.preventDefault();
          openPopup(true);
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          commitSearch();
          if (open) closePopup(false);
          return;
        }
        if (e.key === 'Escape') {
          if (open) {
            e.preventDefault();
            closePopup(false);
          }
        }
      },
      [onKeyDown, open, openPopup, closePopup, commitSearch],
    );

    const handleBlur = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        onBlur?.(e);
        const related = e.relatedTarget as Node | null;
        const triggerWrap = inputRef.current?.parentElement ?? null;
        setTimeout(() => {
          if (related && contentRef.current?.contains(related)) return;
          if (related && triggerWrap?.contains(related)) return;
          commitSearch();
        }, 0);
      },
      [onBlur, commitSearch, contentRef, inputRef],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
      },
      [setSearch],
    );

    const handleIconClick = useCallback(() => {
      if (isDisabled) return;
      if (open) closePopup(false);
      else openPopup(true);
    }, [isDisabled, open, openPopup, closePopup]);

    return (
      <div className={styles.triggerWrap}>
        <input
          {...rest}
          ref={mergedRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? contentId : undefined}
          aria-required={required || undefined}
          aria-disabled={isDisabled || undefined}
          aria-invalid={effectiveInvalid || undefined}
          aria-autocomplete="none"
          placeholder={placeholder}
          className={cn(styles.input, className)}
          value={search}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={onFocus}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          spellCheck={false}
          autoComplete="off"
          data-state={open ? 'open' : 'closed'}
        />
        {showCalendarIcon ? (
          <button
            type="button"
            className={styles.iconButton}
            aria-label={calendarIconLabel}
            aria-disabled={isDisabled || undefined}
            tabIndex={-1}
            onClick={handleIconClick}
            data-state={open ? 'open' : 'closed'}
          >
            <CalendarIcon />
          </button>
        ) : null}
      </div>
    );
  },
);

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 6h12" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 2v2M11 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// DateRangePickerContent — popup dialog + N embedded Calendars + sync'd header

export type DateRangePickerContentProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export const DateRangePickerContent = forwardRef<HTMLDivElement, DateRangePickerContentProps>(
  function DateRangePickerContent(props, forwardedRef) {
    const { className, ...rest } = props;
    const ctx = useDateRangePickerContext('<DateRangePickerContent>');
    const {
      open,
      contentRef,
      inputRef,
      range,
      pendingFrom,
      hovered,
      commitBound,
      setHovered,
      clearHovered,
      closePopup,
      min,
      max,
      disabledDates,
      locale,
      weekStartsOn,
      dir,
      placement,
      sideOffset,
      contentId,
      inputId,
      numberOfMonths,
      displayMonth,
      setDisplayMonth,
    } = ctx;

    const { refs, floatingStyles } = useFloating({
      open,
      placement,
      offset: sideOffset,
    });
    const { setReference, setFloating } = refs;

    useLayoutEffect(() => {
      if (!open) return;
      const inputNode = inputRef.current;
      const wrapper = inputNode?.parentElement ?? inputNode ?? null;
      if (wrapper) setReference(wrapper);
    }, [open, inputRef, setReference]);

    const mergedRef = useMemo(
      () =>
        mergeRefs<HTMLDivElement>(
          contentRef as RefObject<HTMLDivElement>,
          setFloating as React.Ref<HTMLDivElement>,
          forwardedRef,
        ),
      [contentRef, setFloating, forwardedRef],
    );

    const handleContentKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape' && !e.defaultPrevented) {
          e.preventDefault();
          closePopup(true);
        }
      },
      [closePopup],
    );

    // Month anchors (derived from displayMonth root state)
    const monthAnchors = useMemo<Date[]>(
      () =>
        Array.from({ length: numberOfMonths }, (_, i) => addMonths(displayMonth, i)),
      [displayMonth, numberOfMonths],
    );

    // Header label spans first → last month
    const headerLabel = useMemo(() => {
      if (numberOfMonths === 1) {
        return formatMonthYear(monthAnchors[0]!, locale);
      }
      const first = formatMonthYear(monthAnchors[0]!, locale);
      const last = formatMonthYear(monthAnchors[numberOfMonths - 1]!, locale);
      return `${first} — ${last}`;
    }, [monthAnchors, numberOfMonths, locale]);

    // Chevron disable per min/max bounds
    const prevDisabled = useMemo(() => {
      if (!min) return false;
      const prevMonthEnd = endOfMonth(addMonths(displayMonth, -1));
      return prevMonthEnd.getTime() < startOfDay(min).getTime();
    }, [min, displayMonth]);

    const nextDisabled = useMemo(() => {
      if (!max) return false;
      const lastMonthStart = startOfMonth(addMonths(displayMonth, numberOfMonths));
      return lastMonthStart.getTime() > startOfDay(max).getTime();
    }, [max, displayMonth, numberOfMonths]);

    const handlePrevMonth = useCallback(() => {
      setDisplayMonth(addMonths(displayMonth, -1));
    }, [displayMonth, setDisplayMonth]);

    const handleNextMonth = useCallback(() => {
      setDisplayMonth(addMonths(displayMonth, 1));
    }, [displayMonth, setDisplayMonth]);

    // Per-cell range overlay attributes — cellExtras callback
    // (passed to each embedded Calendar)
    const buildCellExtras = useCallback(
      (cellDate: Date): React.HTMLAttributes<HTMLTableCellElement> => {
        const attrs: React.HTMLAttributes<HTMLTableCellElement> & Record<string, string | undefined> =
          {};
        // Out-of-range cells get no overlay
        if (!isDateInRange(cellDate, min, max)) return attrs;

        if (range.from && range.to) {
          if (isSameDay(cellDate, range.from)) attrs['data-range-start'] = 'true';
          if (isSameDay(cellDate, range.to)) attrs['data-range-end'] = 'true';
          if (
            cellDate.getTime() > range.from.getTime() &&
            cellDate.getTime() < range.to.getTime()
          ) {
            attrs['data-in-range'] = 'true';
          }
        }

        if (pendingFrom && hovered) {
          const a = pendingFrom.getTime();
          const b = hovered.getTime();
          const lo = a <= b ? pendingFrom : hovered;
          const hi = a <= b ? hovered : pendingFrom;
          if (
            cellDate.getTime() >= lo.getTime() &&
            cellDate.getTime() <= hi.getTime() &&
            !isSameDay(cellDate, pendingFrom)
          ) {
            attrs['data-range-hover-tail'] = 'true';
          }
        }

        // Mark pendingFrom itself as a range-start preview
        if (pendingFrom && isSameDay(cellDate, pendingFrom)) {
          attrs['data-range-start'] = 'true';
        }

        // SR aria-label augmentation when cell is in any range marker
        if (
          attrs['data-in-range'] === 'true' ||
          attrs['data-range-start'] === 'true' ||
          attrs['data-range-end'] === 'true'
        ) {
          attrs['aria-label'] = `${formatFullDate(cellDate, locale)}, in selected range`;
        }
        return attrs;
      },
      [range, pendingFrom, hovered, locale, min, max],
    );

    const handleCalendarValueChange = useCallback(
      (d: Date | null) => {
        if (d) commitBound(d);
      },
      [commitBound],
    );

    if (!open) return null;

    return (
      <FloatingPortal>
        <div className={styles.contentRoot}>
          <div
            {...rest}
            ref={mergedRef}
            id={contentId}
            role="dialog"
            aria-modal="false"
            aria-labelledby={inputId}
            style={floatingStyles}
            className={cn(styles.content, className)}
            data-state="open"
            onKeyDown={handleContentKeyDown}
          >
            <div className={styles.header}>
              <button
                type="button"
                className={styles.headerChevron}
                aria-label="Previous month"
                onClick={handlePrevMonth}
                disabled={prevDisabled}
              >
                <ChevronLeftIcon />
              </button>
              <div className={styles.headerLabel} aria-live="polite" aria-atomic="true">
                {headerLabel}
              </div>
              <button
                type="button"
                className={styles.headerChevron}
                aria-label="Next month"
                onClick={handleNextMonth}
                disabled={nextDisabled}
              >
                <ChevronRightIcon />
              </button>
            </div>
            <div className={styles.monthsRow}>
              {monthAnchors.map((anchor, i) => (
                <div key={i} className={styles.month}>
                  <Calendar
                    key={`cal-${i}-${anchor.toISOString()}`}
                    defaultMonth={anchor}
                    value={null}
                    onValueChange={handleCalendarValueChange}
                    min={min}
                    max={max}
                    disabled={disabledDates}
                    locale={locale}
                    weekStartsOn={weekStartsOn}
                    dir={dir}
                    cellExtras={buildCellExtras}
                    onCellHover={setHovered}
                    onGridMouseLeave={clearHovered}
                  >
                    <CalendarGrid>
                      <CalendarGridHead />
                      <CalendarGridBody />
                    </CalendarGrid>
                  </Calendar>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FloatingPortal>
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
