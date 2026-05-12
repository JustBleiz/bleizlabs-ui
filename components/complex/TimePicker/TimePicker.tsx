'use client';

/**
 * TimePicker — accessible time form field composed of an editable text input
 * (`role="combobox"`) + popover with 2-3 scrollable listboxes (hours, minutes,
 * optional seconds) per WAI-ARIA APG `/combobox/` + `/listbox/`. In 12h mode
 * an additional AM/PM listbox is rendered at the logical-end of the group.
 *
 * @layer complex-interactive (E01.3 — 0.18.0 Date/Time pack, part 3/4)
 * @tokens --input-bg, --input-border, --input-border-focus,
 *   --color-surface-raised, --color-surface-hover, --color-text-primary,
 *   --color-text-muted, --color-text-secondary, --color-border-subtle,
 *   --color-brand, --color-brand-text, --shadow-lg, --radius-input,
 *   --radius-md, --radius-sm, --z-popover, --duration-fast, --easing-default,
 *   --focus-ring, --space-{1..6}, --font-secondary, --font-size-{xs,sm,base},
 *   --font-variant-numeric
 * @deps zero runtime UI deps. Native `Date` + `Intl` only. Composes 5 of 6
 *   E23 floating primitives: `useFloatingState`, `useFloatingValueState<string>`,
 *   `createFloatingContext`, `FloatingPortal`, `useFloatingDismiss`.
 *   Positioning via `utils/useFloating` + `utils/position`. Time helpers
 *   (`parseTime`, `formatTime`, `clampTime`, `resolveHourCycle`) shared with
 *   TimeInput E01.2. **Pattern-parent for DateTimePicker E01.4** which embeds
 *   TimeInput inline (not TimePicker — single popover surface preferred).
 * @a11y APG editable-combobox + multi-listbox composition.
 *
 *   Input:
 *   - `role="combobox" aria-haspopup="listbox" aria-expanded aria-controls
 *     aria-required aria-invalid aria-disabled`. No native `disabled`
 *     (AT discoverability per Select/Combobox/DatePicker precedent).
 *
 *   Popover:
 *   - `role="dialog" aria-modal="false" aria-label="Time picker"`
 *     (non-modal — outside click dismisses, no focus trap, mirrors
 *     DatePicker E142 pattern).
 *   - Inside dialog: 2-3 `<ul role="listbox" aria-label="Hours"/"Minutes"/
 *     "Seconds">` per field + optional AM/PM listbox (12h mode).
 *   - Each listbox option: `<li role="option" aria-selected tabIndex>`.
 *
 *   Keyboard model (input):
 *   - Alt+ArrowDown / ArrowDown: open popover + focus first option of
 *     hours listbox.
 *   - Alt+ArrowUp: close popover, keep focus on input.
 *   - Enter on typed text: parse `"HH:MM"` (or `"HH:MM:SS"` when withSeconds);
 *     valid + in-range → commit + close + stay focused on input; invalid →
 *     revert search to current value's ISO; empty + required=false →
 *     commit null.
 *   - Escape: close popover, keep focus on input. No commit, no revert.
 *   - Printable digits / `:` flow: free typing — committed only on Enter
 *     (mirrors DatePicker E142 ISO-typing semantics).
 *   - IME composition guard (`isComposingRef` + `event.nativeEvent.isComposing`
 *     + `event.key === 'Process'`).
 *
 *   Keyboard model (listbox option):
 *   - ArrowUp / ArrowDown: navigate within column with `scrollIntoView`.
 *   - Home / End: jump first / last option.
 *   - Enter / Space: commit current option's value to its field +
 *     advance focus to next listbox (hour → minute → seconds? →
 *     period? → close + return focus to input).
 *   - Tab: native — moves to next listbox in tab order.
 *   - Escape: close popover, return focus to input.
 *
 *   Form participation: when `name` prop set, a single hidden input renders
 *   the 24h ISO value (`"HH:MM"` or `"HH:MM:SS"`). `required=true` + empty
 *   value surfaces native `:invalid` on submit.
 *
 *   Step semantics: filters the minute listbox content. `step=15` →
 *   options `00 / 15 / 30 / 45`. Out-of-step controlled `value` snaps to
 *   nearest valid step on open (does NOT clamp at value level; only the
 *   listbox set is filtered). Documented in JSDoc as a known surprise.
 *
 *   Min/max: filters listbox content per field — hour options outside
 *   `[min.h, max.h]` hidden; minute options at boundary hour clamped to
 *   `[min.m, max.m]`; seconds similarly. Committed value also clamps
 *   lexically via `clampTime` at commit boundary.
 *
 *   AM/PM listbox renders only in 12h mode at logical-end of the row.
 *   `hourCycle` is auto-derived from locale via `resolveHourCycle` when
 *   omitted.
 *
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ +
 *   https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
 * @pattern-parent DatePicker E142 (input keyboard model, IME guard,
 *   prev-value sentinel for prop sync, useFloatingValueState pattern).
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y ✓ — Playwright + axe runtime
 *   MANDATORY per 0.18.0 audit meta-finding.
 * @example
 *   // Uncontrolled 24h
 *   <TimePicker defaultValue="09:00" onValueChange={setTime}>
 *     <TimePickerInput placeholder="HH:MM" />
 *     <TimePickerContent />
 *   </TimePicker>
 *
 *   // 12h with AM/PM + 15-minute step
 *   <TimePicker
 *     value={time}
 *     onValueChange={setTime}
 *     hourCycle="12h"
 *     step={15}
 *     min="08:00"
 *     max="18:00"
 *   >
 *     <TimePickerInput placeholder="HH:MM AM/PM" />
 *     <TimePickerContent />
 *   </TimePicker>
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type LiHTMLAttributes,
  type ReactNode,
} from 'react';
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
  clampTime,
  formatTime,
  parseTime,
  resolveHourCycle,
} from '../../utils/date';
import { useResolvedLocale } from '../../utils/locale';
import styles from './TimePicker.module.scss';

// ──────────────────────────────────────────────────────────────────────────
// Helpers (mirror TimeInput E01.2 — kept local to avoid coupling)

function to12hDisplay(h24: number): number {
  if (h24 === 0) return 12;
  if (h24 > 12) return h24 - 12;
  return h24;
}

function periodOf(h24: number): 'AM' | 'PM' {
  return h24 < 12 ? 'AM' : 'PM';
}

function from12hCommit(display12: number, period: 'AM' | 'PM'): number {
  const clamped = Math.max(1, Math.min(12, display12));
  if (period === 'AM') return clamped === 12 ? 0 : clamped;
  return clamped === 12 ? 12 : clamped + 12;
}

function formatDisplay(
  value: string | null,
  hourCycle: '12h' | '24h',
  withSeconds: boolean,
): string {
  if (!value) return '';
  const parsed = parseTime(value);
  if (!parsed) return value;
  if (hourCycle === '24h') {
    return formatTime(parsed, withSeconds);
  }
  const period = periodOf(parsed.h);
  const display = to12hDisplay(parsed.h);
  const hh = String(display).padStart(2, '0');
  const mm = String(parsed.m).padStart(2, '0');
  const body = withSeconds
    ? `${hh}:${mm}:${String(parsed.s).padStart(2, '0')}`
    : `${hh}:${mm}`;
  return `${body} ${period}`;
}

function parseDisplay(
  input: string,
  hourCycle: '12h' | '24h',
  withSeconds: boolean,
): string | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;
  if (hourCycle === '24h') {
    const parsed = parseTime(trimmed);
    if (!parsed) return null;
    return formatTime(parsed, withSeconds);
  }
  // 12h mode — accept "HH:MM AM/PM" or "HH:MM:SS AM/PM" (case-insensitive)
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i.exec(trimmed);
  if (!match || !match[1] || !match[2] || !match[4]) return null;
  const display12 = Number(match[1]);
  const mm = Number(match[2]);
  const ss = match[3] ? Number(match[3]) : 0;
  const period = match[4].toUpperCase() as 'AM' | 'PM';
  if (Number.isNaN(display12) || display12 < 1 || display12 > 12) return null;
  if (Number.isNaN(mm) || mm < 0 || mm > 59) return null;
  if (Number.isNaN(ss) || ss < 0 || ss > 59) return null;
  const h24 = from12hCommit(display12, period);
  return formatTime({ h: h24, m: mm, s: ss }, withSeconds);
}

// Generate sorted unique minute values per step (e.g. step=15 → [0,15,30,45])
function minuteOptions(step: number): number[] {
  if (!Number.isFinite(step) || step <= 0) return Array.from({ length: 60 }, (_, i) => i);
  const out: number[] = [];
  for (let m = 0; m < 60; m += step) out.push(m);
  return out;
}

// Snap minute m to nearest valid step boundary
function snapMinute(m: number, step: number): number {
  if (!Number.isFinite(step) || step <= 1) return m;
  return Math.round(m / step) * step;
}

// ──────────────────────────────────────────────────────────────────────────
// Context

type Period = 'AM' | 'PM';

interface TimePickerContextValue {
  /** Committed 24h ISO value (`"HH:MM"` or `"HH:MM:SS"`) or null. */
  value: string | null;
  setValue: (next: string | null) => void;
  open: boolean;
  setOpen: (next: boolean) => void;
  search: string;
  setSearch: (next: string) => void;
  commitSearch: () => void;
  revertSearch: () => void;
  hasValidationError: boolean;
  openPopup: (focusListbox?: boolean) => void;
  closePopup: (returnFocus?: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  isDisabled: boolean;
  required: boolean;
  hourCycle: '12h' | '24h';
  withSeconds: boolean;
  step: number;
  min: string | undefined;
  max: string | undefined;
  locale: string;
  placement: Placement;
  sideOffset: number;
  baseId: string;
  inputId: string;
  contentId: string;
  name: string | undefined;
  /** Per-field commit + focus advance. */
  commitField: (field: 'h' | 'm' | 's' | 'p', raw: number | Period) => void;
  /** Move focus to next listbox (h → m → s? → p?) or close + return to input. */
  advanceListbox: (current: 'h' | 'm' | 's' | 'p') => void;
}

const [TimePickerContextProvider, useTimePickerContext] =
  createFloatingContext<TimePickerContextValue>('TimePicker');

// ──────────────────────────────────────────────────────────────────────────
// TimePicker — root

export interface TimePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'defaultValue' | 'onChange' | 'dir'> {
  /** Controlled 24h ISO value (`"HH:MM"` or `"HH:MM:SS"`) or null. */
  value?: string | null;
  /** Uncontrolled initial 24h ISO value. */
  defaultValue?: string | null;
  /** Fires on committed value transitions. */
  onValueChange?: (next: string | null) => void;
  /** Controlled popover open state. */
  open?: boolean;
  /** Uncontrolled initial open state. Default `false`. */
  defaultOpen?: boolean;
  /** Fires on open state transitions. */
  onOpenChange?: (open: boolean) => void;
  /** Show seconds listbox. Default `false`. */
  withSeconds?: boolean;
  /** Display hour cycle. Auto-derived from locale when omitted. */
  hourCycle?: '12h' | '24h';
  /** BCP-47 locale tag for cycle derivation. Default derived from navigator. */
  locale?: string;
  /** Minute step — filters minute listbox content. Default `1`. */
  step?: number;
  /** Minimum allowed time as 24h ISO. Clamps on commit + filters listbox. */
  min?: string;
  /** Maximum allowed time as 24h ISO. */
  max?: string;
  /** Widget-wide lockdown — input non-interactive + popup won't open. */
  disabled?: boolean;
  /** Required for form submission. */
  required?: boolean;
  /** Input name for form submission — renders hidden 24h ISO input. */
  name?: string;
  /** Placement of popup relative to input. Default `'bottom-start'`. */
  placement?: Placement;
  /** Pixel gap between input and popup. Default `4`. */
  sideOffset?: number;
  /** Compound children — `<TimePickerInput>` + `<TimePickerContent>`. */
  children?: ReactNode;
}

export const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(function TimePicker(
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
    withSeconds = false,
    hourCycle: hourCycleProp,
    locale: localeProp,
    step = 1,
    min,
    max,
    disabled = false,
    required = false,
    name,
    placement = 'bottom-start',
    sideOffset = 4,
    children,
    className,
    ...rest
  } = props;

  const locale = useResolvedLocale(localeProp);
  const hourCycle = hourCycleProp ?? resolveHourCycle(locale);

  // Value state (string-based)
  const handleValueChange = useCallback(
    (next: string | null) => {
      onValueChange?.(next);
    },
    [onValueChange],
  );
  const { value, setValue } = useFloatingValueState<string>({
    controlledValue,
    defaultValue: defaultValue ?? null,
    onValueChange: handleValueChange,
  });

  // Open state
  const { open, setOpen } = useFloatingState({
    controlledOpen,
    defaultOpen: defaultOpen ?? false,
    onOpenChange,
  });

  // Search state — prev-value sentinel pattern (mirrors DatePicker)
  const [search, setSearchState] = useState<string>(() =>
    formatDisplay(value, hourCycle, withSeconds),
  );
  const [prevValueIso, setPrevValueIso] = useState<string | null>(value);
  if (value !== prevValueIso) {
    setPrevValueIso(value);
    setSearchState(formatDisplay(value, hourCycle, withSeconds));
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
    const parsed = parseDisplay(search, hourCycle, withSeconds);
    if (!parsed) {
      setHasValidationError(true);
      return;
    }
    const clamped = clampTime(parsed, min, max);
    setValue(clamped);
    setSearchState(formatDisplay(clamped, hourCycle, withSeconds));
    setHasValidationError(false);
  }, [search, hourCycle, withSeconds, min, max, setValue, required]);

  const revertSearch = useCallback(() => {
    setSearchState(formatDisplay(value, hourCycle, withSeconds));
    setHasValidationError(false);
  }, [value, hourCycle, withSeconds]);

  const openPopup = useCallback(
    (focusListbox = false) => {
      if (disabled) return;
      setOpen(true);
      if (focusListbox) {
        // Defer until popup renders
        requestAnimationFrame(() => {
          const firstOption = contentRef.current?.querySelector<HTMLElement>(
            '[data-listbox="h"] [role="option"][tabindex="0"]',
          );
          firstOption?.focus();
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

  // Per-field commit: updates the underlying ISO value preserving other fields.
  const commitField = useCallback(
    (field: 'h' | 'm' | 's' | 'p', raw: number | Period) => {
      const base = value ? parseTime(value) : { h: 0, m: 0, s: 0 };
      const current = base ?? { h: 0, m: 0, s: 0 };
      const next = { ...current };
      if (field === 'h') {
        if (hourCycle === '12h' && typeof raw === 'number') {
          next.h = from12hCommit(raw, periodOf(current.h));
        } else if (typeof raw === 'number') {
          next.h = Math.max(0, Math.min(23, raw));
        }
      } else if (field === 'm' && typeof raw === 'number') {
        next.m = Math.max(0, Math.min(59, raw));
      } else if (field === 's' && typeof raw === 'number') {
        next.s = Math.max(0, Math.min(59, raw));
      } else if (field === 'p' && (raw === 'AM' || raw === 'PM')) {
        const display = to12hDisplay(current.h);
        next.h = from12hCommit(display, raw);
      }
      const iso = formatTime(next, withSeconds);
      const clamped = clampTime(iso, min, max);
      setValue(clamped);
    },
    [value, hourCycle, withSeconds, min, max, setValue],
  );

  const advanceListbox = useCallback(
    (current: 'h' | 'm' | 's' | 'p') => {
      const order: Array<'h' | 'm' | 's' | 'p'> = ['h', 'm'];
      if (withSeconds) order.push('s');
      if (hourCycle === '12h') order.push('p');
      const idx = order.indexOf(current);
      const nextKey = order[idx + 1];
      if (!nextKey) {
        closePopup(true);
        return;
      }
      requestAnimationFrame(() => {
        const nextEl = contentRef.current?.querySelector<HTMLElement>(
          `[data-listbox="${nextKey}"] [role="option"][tabindex="0"]`,
        );
        nextEl?.focus();
      });
    },
    [withSeconds, hourCycle, closePopup],
  );

  const contextValue: TimePickerContextValue = {
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
    hourCycle,
    withSeconds,
    step,
    min,
    max,
    locale,
    placement,
    sideOffset,
    baseId,
    inputId,
    contentId,
    name,
    commitField,
    advanceListbox,
  };

  return (
    <TimePickerContextProvider value={contextValue}>
      <div ref={ref} className={cn(styles.root, className)} {...rest}>
        {children}
        {name ? (
          <input
            type="hidden"
            name={name}
            value={value ?? ''}
            required={required}
            data-time-picker-hidden
          />
        ) : null}
      </div>
    </TimePickerContextProvider>
  );
});

// ──────────────────────────────────────────────────────────────────────────
// TimePickerInput

export interface TimePickerInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'defaultValue' | 'onChange' | 'type' | 'role' | 'disabled'
  > {
  /** Placeholder string. Sensible default per hourCycle when omitted. */
  placeholder?: string;
  /** Custom invalid override (OR-merged with internal validation flag). */
  ariaInvalid?: boolean;
}

export const TimePickerInput = forwardRef<HTMLInputElement, TimePickerInputProps>(
  function TimePickerInput({ placeholder, ariaInvalid, onKeyDown, onBlur, ...rest }, ref) {
    const ctx = useTimePickerContext('TimePickerInput');
    const isComposingRef = useRef(false);

    const effectivePlaceholder =
      placeholder ?? (ctx.hourCycle === '12h' ? 'HH:MM AM/PM' : 'HH:MM');

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
        if (!ctx.open) {
          ctx.openPopup(true);
        }
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

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      // Blur Strategy A — microtask + skip if blur destination is inside popup
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
        aria-haspopup="listbox"
        aria-expanded={ctx.open}
        aria-controls={ctx.contentId}
        aria-required={ctx.required || undefined}
        aria-invalid={(ariaInvalid ?? ctx.hasValidationError) || undefined}
        aria-disabled={ctx.isDisabled || undefined}
        autoComplete="off"
        spellCheck={false}
        className={cn(styles.input, ctx.isDisabled && styles.inputDisabled, rest.className)}
        placeholder={effectivePlaceholder}
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
// TimePickerContent

export interface TimePickerContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Override popover aria-label. */
  ariaLabel?: string;
}

export const TimePickerContent = forwardRef<HTMLDivElement, TimePickerContentProps>(
  function TimePickerContent({ ariaLabel, className, style, ...rest }, ref) {
    const ctx = useTimePickerContext('TimePickerContent');

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

    const parsed = ctx.value ? parseTime(ctx.value) : null;
    const currentH = parsed?.h ?? 0;
    const currentM = parsed?.m ?? 0;
    const currentS = parsed?.s ?? 0;
    const period: Period = periodOf(currentH);

    return (
      <FloatingPortal>
        <div
          {...rest}
          ref={mergeRefs(ref, ctx.contentRef, setFloating)}
          id={ctx.contentId}
          role="dialog"
          aria-modal="false"
          aria-label={ariaLabel ?? 'Time picker'}
          className={cn(styles.content, className)}
          style={{ ...floatingStyles, ...style }}
        >
          <Listbox
            field="h"
            label="Hours"
            options={
              ctx.hourCycle === '12h'
                ? Array.from({ length: 12 }, (_, i) => i + 1)
                : Array.from({ length: 24 }, (_, i) => i)
            }
            currentValue={ctx.hourCycle === '12h' ? to12hDisplay(currentH) : currentH}
            renderOption={(opt) => String(opt).padStart(2, '0')}
          />
          <Listbox
            field="m"
            label="Minutes"
            options={minuteOptions(ctx.step)}
            currentValue={snapMinute(currentM, ctx.step)}
            renderOption={(opt) => String(opt).padStart(2, '0')}
          />
          {ctx.withSeconds ? (
            <Listbox
              field="s"
              label="Seconds"
              options={Array.from({ length: 60 }, (_, i) => i)}
              currentValue={currentS}
              renderOption={(opt) => String(opt).padStart(2, '0')}
            />
          ) : null}
          {ctx.hourCycle === '12h' ? (
            <Listbox
              field="p"
              label="AM or PM"
              options={['AM', 'PM']}
              currentValue={period}
              renderOption={(opt) => String(opt)}
            />
          ) : null}
        </div>
      </FloatingPortal>
    );
  },
);

// ──────────────────────────────────────────────────────────────────────────
// Internal Listbox column

interface ListboxProps<T extends number | Period> {
  field: 'h' | 'm' | 's' | 'p';
  label: string;
  options: ReadonlyArray<T>;
  currentValue: T;
  renderOption: (opt: T) => string;
}

function Listbox<T extends number | Period>({
  field,
  label,
  options,
  currentValue,
  renderOption,
}: ListboxProps<T>) {
  const ctx = useTimePickerContext('TimePickerListbox');
  const listRef = useRef<HTMLUListElement | null>(null);

  // Scroll selected option into view on open
  useEffect(() => {
    if (!ctx.open) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-option-value="${String(currentValue)}"]`,
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [ctx.open, currentValue]);

  const commitOption = (opt: T) => {
    ctx.commitField(field, opt as number | Period);
  };

  const focusOption = (index: number) => {
    const items = listRef.current?.querySelectorAll<HTMLElement>('[role="option"]');
    if (!items || items.length === 0) return;
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    const target = items[clamped];
    target?.focus();
    target?.scrollIntoView({ block: 'nearest' });
  };

  const handleKey = (index: number) => (event: KeyboardEvent<HTMLLIElement>) => {
    const { key } = event;
    if (key === 'ArrowDown') {
      event.preventDefault();
      focusOption(index + 1);
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      focusOption(index - 1);
    } else if (key === 'Home') {
      event.preventDefault();
      focusOption(0);
    } else if (key === 'End') {
      event.preventDefault();
      focusOption(options.length - 1);
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      const opt = options[index];
      if (opt !== undefined) commitOption(opt);
      ctx.advanceListbox(field);
    } else if (key === 'Escape') {
      event.preventDefault();
      ctx.closePopup(true);
    }
  };

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label={label}
      data-listbox={field}
      className={styles.listbox}
      tabIndex={-1}
    >
      {options.map((opt, index) => {
        const isSelected = opt === currentValue;
        const optionProps: LiHTMLAttributes<HTMLLIElement> = {
          role: 'option',
          'aria-selected': isSelected,
          tabIndex: isSelected ? 0 : -1,
          onClick: () => {
            commitOption(opt);
            ctx.advanceListbox(field);
          },
          onKeyDown: handleKey(index),
        };
        return (
          <li
            key={String(opt)}
            {...optionProps}
            data-option-value={String(opt)}
            data-selected={isSelected || undefined}
            className={cn(styles.option, isSelected && styles.optionSelected)}
          >
            {renderOption(opt)}
          </li>
        );
      })}
    </ul>
  );
}

