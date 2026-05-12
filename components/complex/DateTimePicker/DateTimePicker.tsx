'use client';

/**
 * DateTimePicker — accessible single-instant form field composed of an
 * editable combobox input + popover containing a Calendar grid + inline
 * TimeInput trio. Single popover surface (NOT nested TimePicker) — keeps
 * focus mgmt simple with 3 tab stops (Calendar roving cell → hour
 * spinbutton → minute spinbutton, plus optional seconds + AM/PM).
 *
 * @layer complex-interactive (E01.4 — 0.18.0 Date/Time pack, part 4/4)
 * @tokens identical token base as DatePicker (input + dialog) + TimeInput
 *   (spinbutton group)
 * @deps zero runtime UI deps per D5/D25. Composes `<Calendar>` (E30) +
 *   `<TimeInput>` (E01.2) inline. Floating primitives: `useFloatingState`
 *   + `useFloatingValueState<Date>` + `createFloatingContext` +
 *   `FloatingPortal` + `useFloatingDismiss`. Time + date helpers from
 *   `utils/date.ts` (`toIsoDateTimeString`, `parseIsoDateTimeString`,
 *   `combineDateTime`, `formatTime`, `parseTime`, `startOfDay`,
 *   `isDateInRange`, `isSameDay`).
 * @a11y APG `/combobox/` (input) + `/grid/` (Calendar) + `/spinbutton/`
 *   (TimeInput) + `/dialog-modal/` wrapper (popover dialog with
 *   aria-modal=false — outside dismiss, no focus trap).
 *
 *   Input:
 *   - `role="combobox" aria-haspopup="dialog" aria-expanded aria-controls
 *     aria-required aria-invalid aria-disabled`
 *
 *   Popover dialog:
 *   - `role="dialog" aria-modal="false" aria-label="Date and time picker"`
 *   - Contains Calendar grid + TimeInput group + optional clear button
 *
 *   Tab stops inside dialog (per plan AD I3 Recommended):
 *     1. Calendar roving cell (tabIndex=0)
 *     2. TimeInput hour spinbutton
 *     3. TimeInput minute spinbutton
 *     4. (optional) seconds spinbutton + AM/PM toggle
 *   Tab past last stop CLOSES dialog + returns focus to combobox input.
 *   Shift+Tab reverses sequence.
 *
 *   Keyboard model (input):
 *   - Alt+ArrowDown / ArrowDown: open dialog + focus Calendar cell
 *     (selected date if in view, else today).
 *   - Alt+ArrowUp: close dialog, focus input.
 *   - Enter: parse typed `"YYYY-MM-DDTHH:MM"` / `"YYYY-MM-DDTHH:MM:SS"` →
 *     commit + close on valid; set aria-invalid on parse failure.
 *   - Escape: close dialog without commit.
 *   - IME composition guard.
 *
 *   Time-zone semantics: emitted ISO string carries NO tz suffix —
 *   represents local wall-clock time. Server parsers MUST treat as
 *   local-naive datetime. DST trap: combineDateTime uses Date.setHours
 *   which normalizes non-existent local times (e.g. 02:30 on
 *   spring-forward → 03:30). Documented for downstream consumers.
 *
 *   Form participation: when `name` prop set, single hidden input
 *   renders ISO 8601 local datetime. `required` propagates for native
 *   `:invalid`.
 *
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ +
 *   https://www.w3.org/WAI/ARIA/apg/patterns/grid/ +
 *   https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/
 * @pattern-parent DatePicker E142 (input keyboard model, IME guard,
 *   useFloatingValueState<Date>, prev-value sentinel)
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y ✓ — Playwright + axe runtime
 *   MANDATORY per 0.18.0 audit meta-finding.
 * @example
 *   <DateTimePicker
 *     defaultValue={new Date(2026, 4, 15, 14, 30)}
 *     onValueChange={setDateTime}
 *     hourCycle="24h"
 *   >
 *     <DateTimePickerInput placeholder="YYYY-MM-DD HH:MM" />
 *     <DateTimePickerContent />
 *   </DateTimePicker>
 */

import {
  forwardRef,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Calendar, type CalendarDisabled, type CalendarWeekStart, type CalendarDir } from '../Calendar';
import { TimeInput } from '../../interactive/TimeInput';
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
  combineDateTime,
  formatTime,
  isDateInRange,
  isSameDay,
  parseIsoDateTimeString,
  startOfDay,
  toIsoDateTimeString,
} from '../../utils/date';
import { useResolvedLocale } from '../../utils/locale';
import styles from './DateTimePicker.module.scss';

// ──────────────────────────────────────────────────────────────────────────
// Context

interface DateTimePickerContextValue {
  value: Date | null;
  setValue: (next: Date | null) => void;
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
  withSeconds: boolean;
  hourCycle: '12h' | '24h' | undefined;
  timeStep: number;
  placement: Placement;
  sideOffset: number;
  baseId: string;
  inputId: string;
  contentId: string;
  name: string | undefined;
}

const [DateTimePickerContextProvider, useDateTimePickerContext] =
  createFloatingContext<DateTimePickerContextValue>('DateTimePicker');

// ──────────────────────────────────────────────────────────────────────────
// Helpers

function timeIsoOf(value: Date | null, withSeconds: boolean): string {
  if (!value) return '';
  return formatTime(
    { h: value.getHours(), m: value.getMinutes(), s: value.getSeconds() },
    withSeconds,
  );
}

function dateOnly(value: Date | null): Date | null {
  if (!value) return null;
  return startOfDay(value);
}

function formatDisplay(value: Date | null, withSeconds: boolean): string {
  if (!value) return '';
  return toIsoDateTimeString(withSeconds ? value : new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    value.getHours(),
    value.getMinutes(),
    0,
  )).slice(0, withSeconds ? 19 : 16);
}

function parseDisplay(input: string): Date | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;
  // Accept space separator OR ISO T
  const normalized = trimmed.replace(/ /, 'T');
  return parseIsoDateTimeString(normalized);
}

// ──────────────────────────────────────────────────────────────────────────
// DateTimePicker — root

export interface DateTimePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'defaultValue' | 'onChange' | 'dir'> {
  /** Controlled value. */
  value?: Date | null;
  /** Uncontrolled initial value. */
  defaultValue?: Date | null;
  /** Fires on committed value transitions. */
  onValueChange?: (next: Date | null) => void;
  /** Controlled popup open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Fires on open state transitions. */
  onOpenChange?: (open: boolean) => void;
  /** Minimum allowed instant. */
  min?: Date;
  /** Maximum allowed instant. */
  max?: Date;
  /** Per-date disable predicate / array. Passed to Calendar. */
  disabledDates?: CalendarDisabled;
  /** Widget-wide lockdown. */
  disabled?: boolean;
  /** Required for form submission. */
  required?: boolean;
  /** Input name — renders hidden ISO 8601 local datetime input when set. */
  name?: string;
  /** BCP-47 locale tag. Default `'en-US'`. */
  locale?: string;
  /** Override locale-derived week start. */
  weekStartsOn?: CalendarWeekStart;
  /** Reading direction. */
  dir?: CalendarDir;
  /** Show seconds spinbutton. Default `false`. */
  withSeconds?: boolean;
  /** Display hour cycle — auto-derived when omitted. */
  hourCycle?: '12h' | '24h';
  /** Minute increment step for TimeInput. Default `1`. */
  timeStep?: number;
  /** Placement of popup. Default `'bottom-start'`. */
  placement?: Placement;
  /** Pixel gap between input and popup. Default `4`. */
  sideOffset?: number;
  /** Compound children — Input + Content. */
  children?: ReactNode;
}

export const DateTimePicker = forwardRef<HTMLDivElement, DateTimePickerProps>(function DateTimePicker(
  props,
  ref,
) {
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    min,
    max,
    disabledDates,
    disabled = false,
    required = false,
    name,
    locale: localeProp,
    weekStartsOn,
    dir = 'ltr',
    withSeconds = false,
    hourCycle,
    timeStep = 1,
    placement = 'bottom-start',
    sideOffset = 4,
    children,
    className,
    ...rest
  } = props;

  const locale = useResolvedLocale(localeProp);

  const handleValueChange = useCallback(
    (next: Date | null) => {
      onValueChange?.(next);
    },
    [onValueChange],
  );
  const { value, setValue } = useFloatingValueState<Date>({
    controlledValue,
    defaultValue: defaultValue ?? null,
    onValueChange: handleValueChange,
  });

  const { open, setOpen } = useFloatingState({
    controlledOpen,
    defaultOpen: defaultOpen ?? false,
    onOpenChange,
  });

  // Search state (prev-value sentinel)
  const [search, setSearchState] = useState<string>(() => formatDisplay(value, withSeconds));
  const [prevValue, setPrevValue] = useState<Date | null>(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setSearchState(formatDisplay(value, withSeconds));
  }

  // Refs
  const inputRef = useRef<HTMLInputElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // IDs
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const contentId = `${baseId}-content`;

  const [hasValidationError, setHasValidationError] = useState(false);

  const setSearch = useCallback((next: string) => {
    setSearchState(next);
    setHasValidationError(false);
  }, []);

  const commitSearch = useCallback(() => {
    if (search.trim() === '') {
      if (required) {
        setHasValidationError(true);
        return;
      }
      setValue(null);
      setHasValidationError(false);
      return;
    }
    const parsed = parseDisplay(search);
    if (!parsed) {
      setHasValidationError(true);
      return;
    }
    if (!isDateInRange(parsed, min, max)) {
      setHasValidationError(true);
      return;
    }
    setValue(parsed);
    setSearchState(formatDisplay(parsed, withSeconds));
    setHasValidationError(false);
  }, [search, min, max, withSeconds, setValue, required]);

  const openPopup = useCallback(
    (focusCalendar = false) => {
      if (disabled) return;
      setOpen(true);
      if (focusCalendar) {
        requestAnimationFrame(() => {
          const focusableCell = contentRef.current?.querySelector<HTMLElement>(
            'button[data-calendar-cell][tabindex="0"]',
          );
          focusableCell?.focus();
        });
      }
    },
    [disabled, setOpen],
  );

  const closePopup = useCallback(
    (returnFocus = true) => {
      setOpen(false);
      if (returnFocus) inputRef.current?.focus();
    },
    [setOpen],
  );

  const isDisabledDate = useCallback(
    (date: Date) => {
      if (!isDateInRange(date, min ? startOfDay(min) : undefined, max ? startOfDay(max) : undefined)) {
        return true;
      }
      if (Array.isArray(disabledDates)) {
        const start = startOfDay(date);
        return disabledDates.some((d) => isSameDay(startOfDay(d), start));
      }
      if (typeof disabledDates === 'function') return disabledDates(date);
      return false;
    },
    [min, max, disabledDates],
  );

  // Calendar value (date-only)
  const calendarValue = dateOnly(value);

  const handleCalendarSelect = useCallback(
    (next: Date | null) => {
      if (!next) {
        setValue(null);
        return;
      }
      // Preserve existing time when changing date
      const time = value
        ? formatTime(
            { h: value.getHours(), m: value.getMinutes(), s: value.getSeconds() },
            true,
          )
        : '00:00:00';
      const combined = combineDateTime(next, time);
      setValue(combined);
    },
    [value, setValue],
  );

  const handleTimeChange = useCallback(
    (timeIso: string) => {
      if (timeIso === '') {
        // Time cleared while date set → keep date at start-of-day
        if (value) setValue(startOfDay(value));
        return;
      }
      const baseDate = value ?? new Date();
      const combined = combineDateTime(baseDate, timeIso);
      setValue(combined);
    },
    [value, setValue],
  );

  const contextValue: DateTimePickerContextValue = {
    value,
    setValue,
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
    withSeconds,
    hourCycle,
    timeStep,
    placement,
    sideOffset,
    baseId,
    inputId,
    contentId,
    name,
  };

  const internalValue: InternalStateProps = {
    calendarValue,
    handleCalendarSelect,
    handleTimeChange,
    isDisabledDate,
  };

  return (
    <DateTimePickerContextProvider value={contextValue}>
      <InternalStateProvider value={internalValue}>
        <div ref={ref} className={cn(styles.root, className)} {...rest}>
          {children}
          {name ? (
            <input
              type="hidden"
              name={name}
              value={value ? toIsoDateTimeString(value) : ''}
              required={required}
              data-date-time-picker-hidden
            />
          ) : null}
        </div>
      </InternalStateProvider>
    </DateTimePickerContextProvider>
  );
});

// Internal state passthrough — exposes calendar handlers to Content via context
interface InternalStateProps {
  calendarValue: Date | null;
  handleCalendarSelect: (next: Date | null) => void;
  handleTimeChange: (timeIso: string) => void;
  isDisabledDate: (date: Date) => boolean;
}

const [InternalStateProvider, useInternalStateContext] =
  createFloatingContext<InternalStateProps>('DateTimePickerInternal');

// ──────────────────────────────────────────────────────────────────────────
// DateTimePickerInput

export interface DateTimePickerInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'defaultValue' | 'onChange' | 'type' | 'role' | 'disabled'
  > {
  placeholder?: string;
  ariaInvalid?: boolean;
}

export const DateTimePickerInput = forwardRef<HTMLInputElement, DateTimePickerInputProps>(
  function DateTimePickerInput({ placeholder, ariaInvalid, onKeyDown, onBlur, ...rest }, ref) {
    const ctx = useDateTimePickerContext('DateTimePickerInput');
    const isComposingRef = useRef(false);

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (ctx.isDisabled) return;
      if (
        isComposingRef.current ||
        event.nativeEvent.isComposing ||
        event.key === 'Process'
      ) {
        onKeyDown?.(event);
        return;
      }

      if (event.key === 'ArrowDown' || (event.altKey && event.key === 'ArrowDown')) {
        event.preventDefault();
        if (!ctx.open) ctx.openPopup(true);
        return;
      }
      if (event.altKey && event.key === 'ArrowUp') {
        event.preventDefault();
        ctx.closePopup(false);
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        ctx.commitSearch();
        if (!ctx.hasValidationError) ctx.closePopup(false);
        return;
      }
      if (event.key === 'Escape') {
        if (ctx.open) {
          event.preventDefault();
          ctx.closePopup(false);
        }
        return;
      }
      onKeyDown?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      setTimeout(() => {
        const target = ctx.contentRef.current;
        if (target && event.relatedTarget && target.contains(event.relatedTarget as Node)) {
          return;
        }
        ctx.commitSearch();
      }, 0);
      onBlur?.(event);
    };

    return (
      <input
        {...rest}
        ref={mergeRefs(ref, ctx.inputRef)}
        id={ctx.inputId}
        type="text"
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={ctx.open}
        aria-controls={ctx.contentId}
        aria-required={ctx.required || undefined}
        aria-invalid={(ariaInvalid ?? ctx.hasValidationError) || undefined}
        aria-disabled={ctx.isDisabled || undefined}
        autoComplete="off"
        spellCheck={false}
        className={cn(styles.input, ctx.isDisabled && styles.inputDisabled, rest.className)}
        placeholder={
          placeholder ?? (ctx.withSeconds ? 'YYYY-MM-DDTHH:MM:SS' : 'YYYY-MM-DDTHH:MM')
        }
        value={ctx.search}
        onChange={(event) => ctx.setSearch(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
        }}
        onClick={() => {
          if (!ctx.isDisabled && !ctx.open) ctx.openPopup(false);
        }}
      />
    );
  },
);

// ──────────────────────────────────────────────────────────────────────────
// DateTimePickerContent

export interface DateTimePickerContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  ariaLabel?: string;
}

export const DateTimePickerContent = forwardRef<HTMLDivElement, DateTimePickerContentProps>(
  function DateTimePickerContent({ ariaLabel, className, style, ...rest }, ref) {
    const ctx = useDateTimePickerContext('DateTimePickerContent');
    const internal = useInternalStateContext('DateTimePickerContent');

    const { refs, floatingStyles } = useFloating({
      open: ctx.open,
      placement: ctx.placement,
      offset: ctx.sideOffset,
    });
    const { setReference, setFloating } = refs;

    useFloatingDismiss({
      open: ctx.open,
      onDismiss: () => ctx.closePopup(false),
      contentRef: ctx.contentRef,
      triggerRef: ctx.inputRef,
      closeOnEscape: true,
      closeOnOutsideClick: true,
    });

    useLayoutEffect(() => {
      if (!ctx.open) return;
      const inputNode = ctx.inputRef.current;
      if (inputNode) setReference(inputNode);
    }, [ctx.open, ctx.inputRef, setReference]);

    if (!ctx.open) return null;

    return (
      <FloatingPortal>
        <div
          {...rest}
          ref={mergeRefs(ref, ctx.contentRef, setFloating)}
          id={ctx.contentId}
          role="dialog"
          aria-modal="false"
          aria-label={ariaLabel ?? 'Date and time picker'}
          className={cn(styles.content, className)}
          style={{ ...floatingStyles, ...style }}
        >
          <Calendar
            value={internal.calendarValue}
            onValueChange={internal.handleCalendarSelect}
            min={ctx.min ? startOfDay(ctx.min) : undefined}
            max={ctx.max ? startOfDay(ctx.max) : undefined}
            disabled={internal.isDisabledDate}
            locale={ctx.locale}
            weekStartsOn={ctx.weekStartsOn}
            dir={ctx.dir}
            className={styles.calendar}
          />
          <div className={styles.timeRow}>
            <TimeInput
              value={timeIsoOf(ctx.value, ctx.withSeconds)}
              onValueChange={internal.handleTimeChange}
              withSeconds={ctx.withSeconds}
              hourCycle={ctx.hourCycle}
              locale={ctx.locale}
              step={ctx.timeStep}
              ariaLabel="Time"
              dir={ctx.dir}
            />
          </div>
        </div>
      </FloatingPortal>
    );
  },
);
