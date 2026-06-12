'use client';

/**
 * DatePicker — accessible single-date form field composed of an editable
 * text input + embedded Calendar popup per WAI-ARIA APG `/combobox/`
 * editable variant + `/grid/` date picker + `/dialog-modal/` wrapper.
 *
 * @layer complex-interactive (Phase 10 CI17 — FIRST composition Epic)
 * @tokens --input-bg, --input-border, --input-border-focus,
 *   --color-surface-raised, --color-surface-hover, --color-text-primary,
 *   --color-text-muted, --color-border-subtle, --color-brand,
 *   --shadow-lg, --radius-input, --radius-md, --radius-sm, --z-popover,
 *   --duration-fast, --easing-default, --focus-ring (via mx.focus-ring),
 *   --space-{1,2,3}, --font-sans, --font-size-sm, --font-weight-medium
 * @deps zero runtime deps per D5/D25. Native `Date` + `Intl.DateTimeFormat`
 *   only — NO date-fns/dayjs/luxon/moment. Reuses E30 `utils/date.ts`
 *   (`parseIsoDateString`, `toIsoDateString`, `isDateInRange`, `isSameDay`,
 *   `startOfDay`). **6th consumer of `useFloatingValueState<Date>`**
 *   (NavigationMenu + Tabs + Select + Combobox + Calendar + DatePicker;
 *   memoized useCallback wrapper pattern per E29 iter 2). Consumes 5 of
 *   6 E23/E29 floating primitives: `useFloatingState` (open/close) +
 *   `useFloatingValueState<Date>` (committed value) +
 *   `createFloatingContext` + `FloatingPortal` + `useFloatingDismiss`.
 *   Positioning via `utils/useFloating` + `utils/position`. **Skipped**
 *   `useFloatingFocus` — focus is managed manually (input ↔ Calendar cell)
 *   per Combobox E28 precedent where focus semantically stays tied to
 *   the trigger input surface and only transitions into the popup on
 *   explicit open-and-focus keys. **Auto-embeds `<Calendar>` (E30) inside
 *   `<DatePickerContent>`** with context-fed props
 *   (value/onValueChange/min/max/disabled/locale/weekStartsOn/dir).
 *   `DatePickerContent` takes no `children` — the Phase 5 CRIT-1 fix
 *   removed composition-with-external-Calendar because cross-component
 *   context wiring without importing DatePicker's context into Calendar
 *   would require either cloneElement (fragile for wrapped children) or
 *   Calendar↔DatePicker coupling (circular import). Auto-embed keeps the
 *   95% API simple + guarantees correct state wiring. Consumers who need
 *   a bespoke Calendar variant fork `DatePickerContent` locally (copy-to-
 *   project model). Consumer imports only `DatePicker` + `DatePickerInput`
 *   + `DatePickerContent` — no direct `<Calendar>` import needed.
 *   **Pattern-parent for future DateRangePicker / TimePicker**.
 * @a11y APG editable-combobox + grid-in-dialog composition:
 *   Input: `role="combobox" aria-haspopup="dialog" aria-expanded
 *   aria-controls aria-required aria-invalid aria-disabled`. NO native
 *   `disabled` (AT discoverability per Select/Combobox precedent) —
 *   `disabled` prop sets `aria-disabled="true"` + click/keydown guards.
 *   Popup: `role="dialog" aria-modal="false" aria-label` (non-modal —
 *   outside click dismisses, no focus trap). Hidden `<input type="hidden"
 *   name value>` when `name` prop set for form participation; renders
 *   ISO `yyyy-mm-dd` in value.
 *
 *   Keyboard model (input):
 *   - Alt+ArrowDown: open popup + move focus to Calendar cell (selected
 *     date if in view, else today, else defaultMonth first of month).
 *   - Alt+ArrowUp: close popup, focus stays on input.
 *   - ArrowDown (no modifier): open popup + move focus to Calendar.
 *   - Enter: parse typed search; if valid ISO `yyyy-mm-dd` + in range +
 *     not disabled → commit + close + stay focused on input; else revert
 *     search to current value's ISO (or empty). Default preventDefault
 *     to suppress unintended form submit — per Combobox E28 IMP-1.
 *   - Escape: close popup if open, keep focus on input (no commit, no
 *     revert — user may keep typing).
 *   - Printable keys: typing updates search state (no commit, no open).
 *   - Tab: default, exits input.
 *   - Cmd/Ctrl/Meta + arrow: browser hotkeys pass through.
 *
 *   Keyboard model (popup / Calendar): full APG `/grid/` per Calendar
 *   E30 — ArrowLeft/Right (RTL-mirrored), ArrowUp/Down ±7, Home/End
 *   per weekStartsOn, PageUp/Down ±1 month day-clamped, Shift+PageUp/Down
 *   ±12 months, Enter/Space commit. Enter inside Calendar → commit +
 *   close + return focus to input. Escape inside Calendar → close +
 *   return focus to input.
 *
 *   Blur (Strategy A per Combobox E28): `setTimeout(0)` microtask →
 *   `relatedTarget` contained in content? skip (click on Calendar day
 *   will commit) → else try `parseIsoDateString(search)` → valid +
 *   in-range + not-disabled? commit + setSearch to ISO → else revert
 *   search to current committed value's ISO (or empty).
 *
 *   IME composition guard (`isComposingRef` + `onCompositionStart/End`
 *   + `event.key === 'Process'` + `keyCode === 229`) per Combobox E28
 *   precedent — prevents mid-composition Enter/Escape from committing
 *   or closing mid-character for CJK users. Unusual in date input but
 *   consistent + zero-cost.
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y ✓ | next build ✓ |
 *   Playwright suite EXECUTED in-repo (keyboard/focus/aria/regression
 *   `.spec.ts` quad, CI-gated) + axe-core smoke on the demo route.
 *   DEFERRED: manual NVDA sweep.
 * @regressions tests/DatePicker.{keyboard,focus,aria,regression}.spec.md —
 *   21 regression cases DP-R01..R21 (executable canon in the sibling
 *   `tests/DatePicker.*.spec.ts` quad) — ISO parse always, invalid date
 *   reject, min/max clamp BOTH input + Calendar, disabled predicate
 *   blocks typed + Calendar, Alt+ArrowDown opens, Escape closes +
 *   keeps focus, click Calendar day closes + syncs input, blur commit
 *   Strategy A, IME composition mid-type, controlled external value
 *   change re-syncs input display, form submit with name attribute,
 *   required validation, RTL input direction, multi-instance
 *   independent.
 * @example
 *   // Uncontrolled — DatePickerContent auto-embeds a fully-wired Calendar
 *   // (value/onValueChange/min/max/disabled/locale/weekStartsOn/dir are
 *   // fed from DatePicker context; consumer doesn't manually wire state).
 *   <DatePicker defaultValue={new Date(2026, 3, 20)} onValueChange={setDate}>
 *     <DatePickerInput placeholder="YYYY-MM-DD" />
 *     <DatePickerContent />
 *   </DatePicker>
 *
 *   // Controlled + Polish locale + min/max (Calendar auto-embedded):
 *   <DatePicker
 *     value={value}
 *     onValueChange={setValue}
 *     locale="pl-PL"
 *     min={new Date(2026, 0, 1)}
 *     max={new Date(2026, 11, 31)}
 *   >
 *     <DatePickerInput />
 *     <DatePickerContent />
 *   </DatePicker>
 *
 *   // Form participation with required:
 *   <form onSubmit={handleSubmit}>
 *     <DatePicker name="deadline" required disabledDates={(d) => d.getDay() === 0}>
 *       <DatePickerInput />
 *       <DatePickerContent />
 *     </DatePicker>
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
} from 'react';
import { Calendar as CalendarDefault } from '../Calendar';
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
  isDateInRange,
  isSameDay,
  parseIsoDateString,
  startOfDay,
  toIsoDateString,
} from '../../utils/date';
import styles from './DatePicker.module.scss';

// ──────────────────────────────────────────────────────────────────────────
// Context

interface DatePickerContextValue {
  value: Date | null;
  setValue: (date: Date | null) => void;
  open: boolean;
  setOpen: (next: boolean) => void;
  search: string;
  setSearch: (next: string) => void;
  commitSearch: () => void;
  revertSearch: () => void;
  /** Flipped to `true` when commitSearch rejects the typed string. */
  hasValidationError: boolean;
  openPopup: (focusCalendar?: boolean) => void;
  closePopup: (returnFocus?: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
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
  baseId: string;
  inputId: string;
  contentId: string;
  name: string | undefined;
}

const [DatePickerContextProvider, useDatePickerContext] =
  createFloatingContext<DatePickerContextValue>('DatePicker');

// ──────────────────────────────────────────────────────────────────────────
// DatePicker — root + state

export interface DatePickerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'defaultValue' | 'onChange' | 'dir'
> {
  /** Controlled selected date. */
  value?: Date | null;
  /** Uncontrolled initial selected date. */
  defaultValue?: Date | null;
  /** Fires on committed value transitions (including clear to `null`). */
  onValueChange?: (date: Date | null) => void;
  /** Controlled popup open state. */
  open?: boolean;
  /** Uncontrolled initial open state. Default `false`. */
  defaultOpen?: boolean;
  /** Fires on open state transitions. */
  onOpenChange?: (open: boolean) => void;
  /** Minimum selectable date (inclusive, day granularity). */
  min?: Date;
  /** Maximum selectable date (inclusive, day granularity). */
  max?: Date;
  /** Widget-wide lockdown — input non-interactive + popup won't open. */
  disabled?: boolean;
  /** Per-date disable (array or predicate). Passed through to Calendar. */
  disabledDates?: CalendarDisabled;
  /** BCP-47 locale tag. Affects Calendar month/weekday names + week start. Default `'en-US'`. */
  locale?: string;
  /** Override locale-derived week start. */
  weekStartsOn?: CalendarWeekStart;
  /** Reading direction. Mirrors Calendar arrow day semantics in RTL. */
  dir?: CalendarDir;
  /** Required for form submission. */
  required?: boolean;
  /** Input name for form submission. Hidden `<input type="hidden" name value>` rendered when set. */
  name?: string;
  /** Placement of popup relative to input. Default `'bottom-start'`. */
  placement?: Placement;
  /** Pixel gap between input and popup. Default `4`. */
  sideOffset?: number;
  /** Compound children — `<DatePickerInput>` + `<DatePickerContent>`. */
  children?: ReactNode;
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(props, ref) {
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
      required = false,
      name,
      placement = 'bottom-start',
      sideOffset = 4,
      children,
      className,
      ...rest
    } = props;

    // Value state (6th useFloatingValueState<Date> consumer) — memoized wrapper
    // per E29 iter 2 pattern so hook's setValue identity stays stable.
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

    // Open state via E23 primitive
    const { open, setOpen } = useFloatingState({
      controlledOpen,
      defaultOpen: defaultOpen ?? false,
      onOpenChange,
    });

    // Search state — in-progress typed text. Classic React "adjust state
    // when prop changes" pattern via prevValue state sentinel — allowed
    // during render (React bails out + re-renders with new state), avoids
    // the `react-hooks/set-state-in-effect` trap. When parent setValue()
    // fires externally, search syncs to the new ISO. User typing overwrites
    // via onChange on the next keystroke — acceptable trade-off for
    // predictable parent-controls-state semantics (mirrors React controlled
    // input model). Combobox uses a one-shot effect instead because its
    // driver is the item registry (external system), not a prop — different
    // shape.
    const [search, setSearchState] = useState<string>(() => (value ? toIsoDateString(value) : ''));
    const [prevValue, setPrevValue] = useState<Date | null>(value);
    if (value !== prevValue) {
      setPrevValue(value);
      setSearchState(value ? toIsoDateString(value) : '');
    }

    // Refs
    const inputRef = useRef<HTMLInputElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    // IDs
    const baseId = useId();
    const inputId = `${baseId}-input`;
    const contentId = `${baseId}-content`;

    // Disabled predicate (array → same-day match, function → call)
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

    // Internal validation error state — auto-set when commitSearch encounters
    // an unparseable or out-of-range typed date, cleared as soon as the user
    // edits the search. Exposed through context + merged with the explicit
    // `invalid` prop via OR inside DatePickerInput's ariaProps (E142 L4 F10).
    const [hasValidationError, setHasValidationError] = useState(false);

    const setSearch = useCallback((next: string) => {
      setSearchState(next);
      // Typing clears the validation flag — error only persists until the
      // user acknowledges the revert by editing.
      setHasValidationError(false);
    }, []);

    const commitSearch = useCallback(() => {
      const trimmed = search.trim();
      if (trimmed === '') {
        if (value !== null) setValue(null);
        setSearchState('');
        setHasValidationError(false);
        return;
      }
      const parsed = parseIsoDateString(trimmed);
      if (parsed && !isDisabledDate(parsed)) {
        const normalized = startOfDay(parsed);
        if (value === null || !isSameDay(value, normalized)) {
          setValue(normalized);
        }
        setSearchState(toIsoDateString(normalized));
        setHasValidationError(false);
      } else {
        // Revert to current value's ISO (or empty) and flag aria-invalid
        // for AT users (E142 L4 F10 — DP-R11 expectation).
        setSearchState(value ? toIsoDateString(value) : '');
        setHasValidationError(true);
      }
    }, [search, value, setValue, isDisabledDate]);

    const revertSearch = useCallback(() => {
      setSearchState(value ? toIsoDateString(value) : '');
    }, [value]);

    // Imperative focus on popup open — target the Calendar cell for the
    // selected date, today, or first-of-month. Runs after React commits the
    // portal + Calendar mount via queueMicrotask so tabIndex=0 has landed.
    const focusCalendarInitial = useCallback(() => {
      queueMicrotask(() => {
        const content = contentRef.current;
        if (!content) return;
        const targetIso = toIsoDateString(value ?? startOfDay(new Date()));
        const preferred = content.querySelector<HTMLElement>(
          `button[data-calendar-cell="${targetIso}"]`,
        );
        const fallback = content.querySelector<HTMLElement>(
          'button[data-calendar-cell][tabindex="0"]',
        );
        (preferred ?? fallback)?.focus();
      });
    }, [value]);

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
        if (returnFocus) {
          queueMicrotask(() => inputRef.current?.focus());
        }
      },
      [setOpen],
    );

    // Document-level Escape + outside click via E23 primitive
    const handleDismiss = useCallback(() => {
      const wasFocusInside = contentRef.current?.contains(document.activeElement);
      setOpen(false);
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

    const ctx = useMemo<DatePickerContextValue>(
      () => ({
        value,
        setValue,
        open,
        setOpen,
        search,
        setSearch,
        commitSearch,
        revertSearch,
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
        baseId,
        inputId,
        contentId,
        name,
      }),
      [
        value,
        setValue,
        open,
        setOpen,
        search,
        setSearch,
        commitSearch,
        revertSearch,
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
        baseId,
        inputId,
        contentId,
        name,
      ],
    );

    return (
      <DatePickerContextProvider value={ctx}>
        <div ref={ref} dir={dir} className={cn(styles.root, className)} {...rest}>
          {children}
          {name ? (
            <input
              type="hidden"
              name={name}
              value={value ? toIsoDateString(value) : ''}
              required={required}
            />
          ) : null}
        </div>
      </DatePickerContextProvider>
    );
  },
);

// ──────────────────────────────────────────────────────────────────────────
// DatePickerInput — editable text input (ARIA combobox)

export interface DatePickerInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'onChange' | 'role' | 'aria-controls' | 'aria-expanded'
> {
  /** Icon button visible inside the input's right side. Default `true`. */
  showCalendarIcon?: boolean;
  /** Accessible label for the calendar icon button. Default `"Open calendar"`. */
  calendarIconLabel?: string;
  /**
   * External validation error state. When `true`, `aria-invalid="true"` is
   * set unconditionally. Auto-detected parse failures from the input also
   * flip aria-invalid (E142 L4 F10) — this prop ORs with the internal flag.
   */
  invalid?: boolean;
}

export const DatePickerInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  function DatePickerInput(props, forwardedRef) {
    const {
      showCalendarIcon = true,
      calendarIconLabel = 'Open calendar',
      placeholder = 'YYYY-MM-DD',
      className,
      invalid = false,
      onKeyDown,
      onBlur,
      onFocus,
      onCompositionStart,
      onCompositionEnd,
      ...rest
    } = props;

    const ctx = useDatePickerContext('<DatePickerInput>');
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
        // Sync search to final composed value
        setSearch((e.target as HTMLInputElement).value);
        onCompositionEnd?.(e);
      },
      [setSearch, onCompositionEnd],
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;

        // IME composition guard
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
          if (!open) openPopup(true);
          else {
            // Popup already open — move focus into Calendar (APG editable
            // combobox / dialog wrapper convention). Reuse openPopup's
            // focus routine without flipping open state.
            openPopup(true);
          }
          return;
        }
        if (e.key === 'Enter') {
          // Commit typed search. preventDefault to suppress implicit form submit
          // per Combobox E28 IMP-1 precedent (user wants commit, not submit).
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
          // else: let parent dialog/modal handle
        }
      },
      [onKeyDown, open, openPopup, closePopup, commitSearch],
    );

    const handleBlur = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        onBlur?.(e);
        // Radix Strategy A — microtask so relatedTarget is reliable across
        // browsers. Skip commit when focus moved INTO the popup (Calendar
        // click will commit) OR INTO the trigger wrap (icon button click
        // will toggle popup — do NOT double-fire commit then toggle —
        // Phase 5 CRIT-2 fix).
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
// DatePickerContent — popup dialog + embedded Calendar

export type DatePickerContentProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export const DatePickerContent = forwardRef<HTMLDivElement, DatePickerContentProps>(
  function DatePickerContent(props, forwardedRef) {
    const { className, ...rest } = props;
    const ctx = useDatePickerContext('<DatePickerContent>');
    const {
      open,
      contentRef,
      inputRef,
      value,
      setValue,
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
    } = ctx;

    const { refs, floatingStyles } = useFloating({
      open,
      placement,
      offset: sideOffset,
    });
    const { setReference, setFloating } = refs;

    // Wire input wrapper as positioning reference — anchor to the visible
    // trigger-wrap bounds (input + icon) rather than the bare input.
    useLayoutEffect(() => {
      if (!open) return;
      const inputNode = inputRef.current;
      const wrapper = inputNode?.parentElement ?? inputNode ?? null;
      if (wrapper) setReference(wrapper);
    }, [open, inputRef, setReference]);

    // Consistent with DatePickerInput's mergeRefs usage — single helper for
    // contentRef + floating setter + forwardedRef (Phase 5 IMP-3 fix).
    const mergedRef = useMemo(
      () =>
        mergeRefs<HTMLDivElement>(
          contentRef as React.Ref<HTMLDivElement>,
          setFloating as React.Ref<HTMLDivElement>,
          forwardedRef,
        ),
      [contentRef, setFloating, forwardedRef],
    );

    // Calendar auto-wires value/onValueChange/min/max/disabled/locale etc.
    // Consumer's <Calendar> children inherit these via a wrapper that
    // intercepts the Calendar's onValueChange to close + return focus.
    const handleCalendarValueChange = useCallback(
      (next: Date | null) => {
        setValue(next);
        closePopup(true);
      },
      [setValue, closePopup],
    );

    // Intercept keydown inside popup — Escape + Enter-from-Calendar-cell
    // need to return focus to input after Calendar's onValueChange fires.
    const handleContentKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape' && !e.defaultPrevented) {
          e.preventDefault();
          closePopup(true);
        }
      },
      [closePopup],
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
            <CalendarDefault
              value={value}
              onValueChange={handleCalendarValueChange}
              min={min}
              max={max}
              disabled={disabledDates}
              locale={locale}
              weekStartsOn={weekStartsOn}
              dir={dir}
            />
          </div>
        </div>
      </FloatingPortal>
    );
  },
);
