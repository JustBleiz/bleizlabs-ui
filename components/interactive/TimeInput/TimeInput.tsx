'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { cn } from '../../utils/cn';
import {
  clampTime,
  formatTime,
  parseTime,
  resolveHourCycle,
} from '../../utils/date';
import { useResolvedLocale } from '../../utils/locale';
import { Label } from '../Label';
import styles from './TimeInput.module.scss';

/**
 * TimeInput — accessible 24h ISO time field rendered as a `role="group"` of
 * `role="spinbutton"` inputs (hours, minutes, optional seconds) plus an
 * optional `role="switch"` AM/PM toggle in 12h display mode.
 *
 * @layer interactive (E01.2 — 0.18.0 Date/Time pack)
 * @tokens --input-bg, --input-border, --input-border-focus,
 *   --color-text-primary, --color-text-muted, --color-text-secondary,
 *   --color-error, --color-error-strong, --color-brand,
 *   --radius-input, --space-{1..4}, --font-secondary,
 *   --font-size-{xs,base}, --font-variant-numeric,
 *   --duration-fast, --easing-default, --focus-ring, --focus-ring-error
 * @deps zero runtime UI deps. Native `Date` + `Intl.DateTimeFormat` only —
 *   NO date-fns/dayjs/luxon/moment per Charter R8 / D5. Internal utils:
 *   `cn`, `useResolvedLocale`, and 5 time helpers from `utils/date.ts`
 *   (`parseTime`, `formatTime`, `clampTime`, `resolveHourCycle` —
 *   `combineDateTime` reserved for DateTimePicker E01.4).
 * @a11y WAI-ARIA APG `/spinbutton/` per field + `/switch/` for AM/PM.
 *
 *   Structure:
 *   - Outer `<div role="group" aria-label>` wraps the inputs so SR users
 *     get a single labelled compound (e.g. "Time, group, 14, Hours, 30,
 *     Minutes"). The group label defaults to "Time" unless `ariaLabel`
 *     prop overrides.
 *   - Each field is `<input type="text" role="spinbutton" inputMode="numeric">`
 *     with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext`,
 *     and a per-field `aria-label` ("Hours" / "Minutes" / "Seconds").
 *   - In 12h mode a `<button role="switch" aria-checked>` toggles AM/PM,
 *     rendered at the logical-end of the group (right in LTR, left in RTL
 *     via flex order).
 *
 *   Keyboard model per spinbutton:
 *   - ArrowUp / ArrowDown: increment/decrement by 1 (hours, seconds) or by
 *     `step` minutes for the minute field. Wraps within field bounds.
 *   - PageUp / PageDown: ±10 hours, ±15 minutes (matches HTML time picker
 *     convention), ±10 seconds.
 *   - Home: jump to minimum allowed value at this field given `min` prop +
 *     other fields.
 *   - End: jump to maximum allowed value at this field given `max` prop.
 *   - Direct digit input (0-9): 2-digit buffer with auto-advance. When the
 *     buffer reaches 2 digits OR the typed value would only have one
 *     possible 2-digit completion (e.g. typing `3` in hours when hours
 *     can't be 30+), focus auto-advances to the next field. Backspace
 *     clears the buffer (and on empty-buffer Backspace jumps to previous
 *     field).
 *   - `:` (separator key) commits the buffer and advances.
 *   - Tab: native field traversal — no focus-trap, no roving tabindex.
 *
 *   AM/PM switch keyboard (12h mode only):
 *   - Space / Enter: toggle period.
 *   - Click: toggle period.
 *
 *   IME composition: `compositionstart`/`compositionend` track CJK input
 *   state. Number-only fields with `inputMode="numeric"` rarely trigger
 *   IME on modern browsers but the guard exists per DatePicker E142
 *   precedent.
 *
 *   Form participation: when `name` prop is set, a single hidden input
 *   `<input type="hidden" name value>` carries the 24h ISO value (`"HH:MM"`
 *   or `"HH:MM:SS"`). Empty state ⇒ empty value; `required=true` + empty
 *   surfaces native `:invalid` on submit.
 *
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/ +
 *   https://www.w3.org/WAI/ARIA/apg/patterns/switch/
 * @pattern-parent NumberInput (Input shell + addonText positioning); NOT
 *   composed — bespoke role="spinbutton" trio per audit C1 finding
 *   (NumberInput is non-composable: it owns its own `<input>` with
 *   InputHTMLAttributes passthrough that conflicts with spinbutton ARIA).
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y ✓ — Playwright + axe runtime
 *   MANDATORY per 0.18.0 audit meta-finding.
 * @regressions tests/TimeInput.regression.spec.ts — TI-R01..R20 covering
 *   wrap-at-bounds, step-aligned increments, min/max clamping, 12h
 *   period flip on hour=12, locale hourCycle resolution, IME guard,
 *   2-digit buffer auto-advance, Backspace cross-field, form `:invalid`,
 *   RTL AM/PM position.
 * @example
 *   // 24h with minutes only
 *   <TimeInput
 *     label="Start time"
 *     name="start"
 *     defaultValue="09:00"
 *     onValueChange={setStart}
 *   />
 *
 *   // 12h with AM/PM toggle + seconds + step
 *   <TimeInput
 *     label="Departure"
 *     name="departure"
 *     hourCycle="12h"
 *     withSeconds
 *     step={15}
 *     min="06:00"
 *     max="22:00"
 *   />
 *
 *   // With opt-in steppers (E01.5 — 0.21.0). Stacked ↑↓ pair on the right
 *   // acts on the currently-focused segment with pointer-down hold-to-
 *   // repeat (400ms → 80ms). Keyboard users keep ArrowUp/Down on the
 *   // spinbuttons themselves; the stepper buttons carry tabIndex=-1.
 *   <TimeInput label="Pickup" defaultValue="09:00" showSteppers />
 */
export interface TimeInputProps {
  /** Visible label. When provided, renders a coupled `<Label htmlFor>` above the group. */
  label?: string;
  /** Form field name. When set, renders a hidden input carrying the 24h ISO value. */
  name?: string;
  /** Controlled value as 24h ISO string. Pass empty string or `undefined` for cleared. */
  value?: string;
  /** Uncontrolled initial value as 24h ISO string. */
  defaultValue?: string;
  /** Fires on every committed value change. Always emits 24h ISO regardless of `hourCycle`. */
  onValueChange?: (time: string) => void;
  /** Show seconds field. Default `false`. */
  withSeconds?: boolean;
  /**
   * Display hour cycle. `'12h'` shows hour as 1-12 with AM/PM toggle.
   * `'24h'` shows hour as 00-23. Omit to auto-derive from `locale` via
   * `Intl.DateTimeFormat`.
   */
  hourCycle?: '12h' | '24h';
  /** BCP 47 locale tag. Auto-derived from `navigator.language` when omitted. */
  locale?: string;
  /** Minimum allowed time as 24h ISO. Clamps on commit. */
  min?: string;
  /** Maximum allowed time as 24h ISO. Clamps on commit. */
  max?: string;
  /** Minute increment for ArrowUp/Down on the minute field. Default `1`. */
  step?: number;
  /** Marks the form field as required (hidden input gets `required`). */
  required?: boolean;
  /** Disables all inputs + AM/PM toggle. */
  disabled?: boolean;
  /** Placeholder for empty state display (e.g. `--:--`). Default `--`. */
  placeholder?: string;
  /** Override the group aria-label. Defaults to label || "Time". */
  ariaLabel?: string;
  /** ARIA: marks group invalid. */
  ariaInvalid?: boolean;
  /** Error message — renders below group + sets `data-error`. */
  error?: string;
  /** Helper text — renders below group when no error. */
  helperText?: string;
  /** Hide label visually (still in a11y tree). */
  hideLabel?: boolean;
  /** Override the field id used for label htmlFor coupling. */
  id?: string;
  /** Forwarded className on outermost wrapper. */
  className?: string;
  /** Text direction. Default `ltr`. */
  dir?: 'ltr' | 'rtl';
  /**
   * Render an opt-in stacked ↑/↓ stepper pair on the right edge of the
   * input wrap. Acts on the currently-focused segment (hour / minute /
   * second). Pointer-down activation increments once then hold-to-repeats
   * (400ms initial delay → 80ms repeat interval, matching native
   * spinbutton browser convention). Keyboard activation increments once
   * per Space/Enter (no hold-to-repeat — keyboard users have ArrowUp/Down
   * available with better ergonomics). Buttons carry static aria-label
   * "Increment/Decrement time" — the currently-targeted segment is
   * announced via its own spinbutton's aria-valuetext. Default `false`.
   */
  showSteppers?: boolean;
}

interface TimeState {
  h: number;
  m: number;
  s: number;
}

function isoFromState(state: TimeState | null, withSeconds: boolean): string {
  if (state === null) return '';
  return formatTime(state, withSeconds);
}

function stateFromIso(iso: string | undefined): TimeState | null {
  if (!iso) return null;
  const parsed = parseTime(iso);
  if (!parsed) return null;
  return parsed;
}

function commitIso(
  candidate: TimeState,
  min: string | undefined,
  max: string | undefined,
  withSeconds: boolean,
): TimeState {
  const iso = formatTime(candidate, withSeconds);
  const clamped = clampTime(iso, min, max);
  return parseTime(clamped) ?? candidate;
}

function to12hDisplay(h24: number): number {
  if (h24 === 0) return 12;
  if (h24 > 12) return h24 - 12;
  return h24;
}

function from12hCommit(display12: number, period: 'AM' | 'PM'): number {
  const clamped = Math.max(1, Math.min(12, display12));
  if (period === 'AM') return clamped === 12 ? 0 : clamped;
  return clamped === 12 ? 12 : clamped + 12;
}

function periodOf(h24: number): 'AM' | 'PM' {
  return h24 < 12 ? 'AM' : 'PM';
}

type FieldKey = 'h' | 'm' | 's';

export const TimeInput = forwardRef<HTMLDivElement, TimeInputProps>(function TimeInput(
  {
    label,
    name,
    value: controlledValue,
    defaultValue,
    onValueChange,
    withSeconds = false,
    hourCycle: hourCycleProp,
    locale: localeProp,
    min,
    max,
    step = 1,
    required = false,
    disabled = false,
    placeholder = '--',
    ariaLabel,
    ariaInvalid,
    error,
    helperText,
    hideLabel = false,
    id,
    className,
    dir = 'ltr',
    showSteppers = false,
  },
  ref,
) {
  const locale = useResolvedLocale(localeProp);
  const resolvedHourCycle = hourCycleProp ?? resolveHourCycle(locale);
  const is12h = resolvedHourCycle === '12h';

  const generatedId = useId();
  const baseId = id ?? `time-${generatedId}`;
  const hourId = `${baseId}-h`;
  const minuteId = `${baseId}-m`;
  const secondId = `${baseId}-s`;
  const errorId = error ? `${baseId}-error` : undefined;
  const helperId = helperText && !error ? `${baseId}-helper` : undefined;
  const describedBy = errorId ?? helperId;

  const isControlled = controlledValue !== undefined;

  const [uncontrolledState, setUncontrolledState] = useState<TimeState | null>(() =>
    stateFromIso(defaultValue),
  );
  const [prevControlledIso, setPrevControlledIso] = useState<string | undefined>(
    controlledValue,
  );

  let state = isControlled ? stateFromIso(controlledValue) : uncontrolledState;
  if (isControlled && controlledValue !== prevControlledIso) {
    // Controlled value changed — sync any local buffer state via no-op
    // (state already derived above). Track for pendingBuffer reset (R16-like).
    setPrevControlledIso(controlledValue);
    state = stateFromIso(controlledValue);
  }

  const [activeBuffer, setActiveBuffer] = useState<{
    field: FieldKey;
    buffer: string;
  } | null>(null);
  // Tracks whether handleKeyDown just programmatically advanced focus via
  // ref.focus() — without this flag, the synchronous blur on the leaving
  // field would re-flush its (now-stale) buffer between the 2-digit commit
  // and React's next render, clobbering state with the single-digit value.
  const isAdvancingRef = useRef(false);
  const [composing, setComposing] = useState(false);

  const hourRef = useRef<HTMLInputElement | null>(null);
  const minuteRef = useRef<HTMLInputElement | null>(null);
  const secondRef = useRef<HTMLInputElement | null>(null);

  // Tracks which segment a stepper button should target. Updated on every
  // field focus + initialised to 'h' so the steppers work even before the
  // user has tabbed into any field. Persisted across blurs so clicking a
  // stepper after focus has briefly left to the button itself still acts
  // on the previously-focused segment (pointer events don't blur).
  const focusedFieldRef = useRef<FieldKey>('h');
  // Hold-to-repeat timer chain. Cleared on pointerup / pointercancel /
  // pointerleave. Stored as a ref (not state) so the timer chain doesn't
  // trigger a re-render — only the field commit does.
  const repeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (repeatTimerRef.current !== null) {
        clearTimeout(repeatTimerRef.current);
        repeatTimerRef.current = null;
      }
    };
  }, []);

  const fieldRef = (field: FieldKey) =>
    field === 'h' ? hourRef : field === 'm' ? minuteRef : secondRef;

  const focusField = (field: FieldKey) => {
    const ref2 = fieldRef(field).current;
    if (ref2 && !disabled) {
      ref2.focus();
      ref2.select?.();
    }
  };

  const commit = (next: TimeState | null): TimeState | null => {
    if (next !== null) {
      const constrained = commitIso(next, min, max, withSeconds);
      if (!isControlled) setUncontrolledState(constrained);
      const iso = formatTime(constrained, withSeconds);
      onValueChange?.(iso);
      return constrained;
    }
    if (!isControlled) setUncontrolledState(null);
    onValueChange?.('');
    return null;
  };

  // Derived display per field (buffer wins while typing, else padded state)
  const hourFieldMin = is12h ? 1 : 0;
  const hourFieldMax = is12h ? 12 : 23;
  const minuteFieldMin = 0;
  const minuteFieldMax = 59;
  const secondFieldMin = 0;
  const secondFieldMax = 59;

  const period: 'AM' | 'PM' = state ? periodOf(state.h) : 'AM';
  const hourValue = state
    ? is12h
      ? to12hDisplay(state.h)
      : state.h
    : null;

  const fieldDisplay = (field: FieldKey): string => {
    // Buffer wins only when non-empty — empty buffer (post-Backspace) falls
    // back to committed state so the spinbutton never renders blank while a
    // valid value exists.
    if (activeBuffer && activeBuffer.field === field && activeBuffer.buffer !== '') {
      return activeBuffer.buffer;
    }
    if (state === null) return placeholder.repeat(2).slice(0, 2);
    if (field === 'h') {
      return String(hourValue!).padStart(2, '0');
    }
    if (field === 'm') return String(state.m).padStart(2, '0');
    return String(state.s).padStart(2, '0');
  };

  const fieldValueNow = (field: FieldKey): number | undefined => {
    if (state === null && (!activeBuffer || activeBuffer.field !== field)) return undefined;
    if (activeBuffer && activeBuffer.field === field) {
      const buf = Number(activeBuffer.buffer);
      if (!Number.isNaN(buf)) return buf;
    }
    if (state === null) return undefined;
    if (field === 'h') return hourValue!;
    if (field === 'm') return state.m;
    return state.s;
  };

  const fieldValueText = (field: FieldKey): string => {
    if (state === null) return placeholder;
    if (field === 'h') {
      const hh = String(hourValue!).padStart(2, '0');
      return is12h ? `${hh} ${period}` : hh;
    }
    if (field === 'm') return String(state.m).padStart(2, '0');
    return String(state.s).padStart(2, '0');
  };

  const isoValue = isoFromState(state, withSeconds);

  // Field bounds (for valuemin/max)
  const fieldBounds = (field: FieldKey): { min: number; max: number } => {
    if (field === 'h') return { min: hourFieldMin, max: hourFieldMax };
    if (field === 'm') return { min: minuteFieldMin, max: minuteFieldMax };
    return { min: secondFieldMin, max: secondFieldMax };
  };

  // Build next state by replacing one field's value (integer) in 24h space
  const buildNext = (field: FieldKey, raw: number): TimeState => {
    const base: TimeState = state ?? { h: 0, m: 0, s: 0 };
    if (field === 'h') {
      if (is12h) {
        const h24 = from12hCommit(raw, period);
        return { ...base, h: h24 };
      }
      return { ...base, h: Math.max(0, Math.min(23, raw)) };
    }
    if (field === 'm') {
      return { ...base, m: Math.max(0, Math.min(59, raw)) };
    }
    return { ...base, s: Math.max(0, Math.min(59, raw)) };
  };

  // Increment field by delta, wrap within field bounds
  const adjustField = (field: FieldKey, delta: number) => {
    const bounds = fieldBounds(field);
    const current = fieldValueNow(field) ?? bounds.min;
    const range = bounds.max - bounds.min + 1;
    let next = current + delta;
    next = ((((next - bounds.min) % range) + range) % range) + bounds.min;
    const candidate = buildNext(field, next);
    commit(candidate);
    setActiveBuffer(null);
  };

  const advanceField = (field: FieldKey) => {
    if (field === 'h') focusField('m');
    else if (field === 'm') {
      if (withSeconds) focusField('s');
    }
  };

  const retreatField = (field: FieldKey) => {
    if (field === 's') focusField('m');
    else if (field === 'm') focusField('h');
  };

  // Commit buffer (e.g. on blur, separator key, or 2-digit completion).
  const flushBuffer = (field: FieldKey, advance: boolean) => {
    if (!activeBuffer || activeBuffer.field !== field) return;
    const raw = Number(activeBuffer.buffer);
    if (!Number.isNaN(raw) && activeBuffer.buffer !== '') {
      const candidate = buildNext(field, raw);
      commit(candidate);
    }
    setActiveBuffer(null);
    if (advance) advanceField(field);
  };

  const handleKeyDown = (field: FieldKey) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (composing || event.nativeEvent.isComposing) return;

    const { key } = event;

    // Direct digit input
    if (/^\d$/.test(key)) {
      event.preventDefault();
      const prev = activeBuffer && activeBuffer.field === field ? activeBuffer.buffer : '';
      const buf = (prev + key).slice(-2);
      if (buf.length === 2) {
        const raw = Number(buf);
        if (!Number.isNaN(raw)) {
          const candidate = buildNext(field, raw);
          commit(candidate);
        }
        setActiveBuffer(null);
        isAdvancingRef.current = true;
        advanceField(field);
        isAdvancingRef.current = false;
      } else {
        // 1-digit buffer; auto-advance when value can't expand within bounds
        const bounds = fieldBounds(field);
        const single = Number(buf);
        // If typing single digit and single*10+9 > max, completion is unambiguous → advance
        if (single * 10 > bounds.max) {
          const candidate = buildNext(field, single);
          commit(candidate);
          setActiveBuffer(null);
          isAdvancingRef.current = true;
          advanceField(field);
          isAdvancingRef.current = false;
        } else {
          setActiveBuffer({ field, buffer: buf });
        }
      }
      return;
    }

    if (key === 'ArrowUp') {
      event.preventDefault();
      const delta = field === 'm' ? step : 1;
      adjustField(field, delta);
      return;
    }

    if (key === 'ArrowDown') {
      event.preventDefault();
      const delta = field === 'm' ? -step : -1;
      adjustField(field, delta);
      return;
    }

    if (key === 'PageUp') {
      event.preventDefault();
      const delta = field === 'h' ? 10 : field === 'm' ? 15 : 10;
      adjustField(field, delta);
      return;
    }

    if (key === 'PageDown') {
      event.preventDefault();
      const delta = field === 'h' ? -10 : field === 'm' ? -15 : -10;
      adjustField(field, delta);
      return;
    }

    if (key === 'Home') {
      event.preventDefault();
      // Jump to field min (respecting overall min)
      const bounds = fieldBounds(field);
      const candidate = buildNext(field, bounds.min);
      commit(candidate);
      setActiveBuffer(null);
      return;
    }

    if (key === 'End') {
      event.preventDefault();
      const bounds = fieldBounds(field);
      const candidate = buildNext(field, bounds.max);
      commit(candidate);
      setActiveBuffer(null);
      return;
    }

    if (key === 'Backspace') {
      event.preventDefault();
      if (activeBuffer && activeBuffer.field === field && activeBuffer.buffer !== '') {
        // Clear active buffer
        setActiveBuffer({ field, buffer: '' });
      } else {
        // Empty buffer → retreat to previous field
        retreatField(field);
      }
      return;
    }

    if (key === ':' || key === '.' || key === ',' || key === '/' || key === ' ') {
      event.preventDefault();
      flushBuffer(field, true);
      return;
    }

    if (key === 'Tab') {
      // Flush buffer without preventing default — let Tab proceed natively
      flushBuffer(field, false);
      return;
    }
  };

  const handleBlur = (field: FieldKey) => () => {
    // Skip flush when we're in the middle of an auto-advance — the new value
    // was already committed in handleKeyDown, and the buffer was cleared
    // before this synchronous blur fired. Without this guard, blur's closure
    // would still see the pre-commit buffer (React hasn't re-rendered yet)
    // and re-commit the single-digit value over the just-written state.
    if (isAdvancingRef.current) return;
    flushBuffer(field, false);
  };

  const handleFocus = (
    field: FieldKey,
  ) => (event: FocusEvent<HTMLInputElement>) => {
    focusedFieldRef.current = field;
    // Select-all on focus per APG spinbutton precedent. We intentionally do
    // NOT flush a buffer left behind in another field here — that would race
    // with the just-completed commit when handleKeyDown auto-advances focus
    // synchronously via ref.focus(): the old handleFocus closure would still
    // see the pre-commit `activeBuffer`, re-commit its single-digit value,
    // and clobber the just-written state. The (rare) "user typed digit then
    // mouse-clicked another field without blurring" case is covered by the
    // blur handler firing before the focus handler — flushBuffer runs there.
    event.currentTarget.select?.();
  };

  const togglePeriod = (
    event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (disabled) return;
    if ('key' in event) {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      event.preventDefault();
    }
    const base: TimeState = state ?? { h: 0, m: 0, s: 0 };
    const nextPeriod = period === 'AM' ? 'PM' : 'AM';
    const display = state ? to12hDisplay(state.h) : 12;
    const h24 = from12hCommit(display, nextPeriod);
    commit({ ...base, h: h24 });
  };

  // Stepper handlers — pointerdown-driven hold-to-repeat acting on the
  // currently-focused field. Matches native spinbutton behavior: 400ms
  // initial delay before the repeat chain kicks in, then 80ms per repeat.
  // Keyboard activation (Space/Enter on the button) fires a single step
  // via the synthetic click handler — keyboard users have ArrowUp/Down on
  // the spinbuttons themselves with better ergonomics.
  const stepperFieldDelta = (field: FieldKey, direction: 1 | -1): number => {
    if (field === 'm') return direction * step;
    return direction;
  };

  const stopStepperRepeat = () => {
    if (repeatTimerRef.current !== null) {
      clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
  };

  const startStepperRepeat = (direction: 1 | -1) => {
    if (disabled) return;
    const field = focusedFieldRef.current;
    adjustField(field, stepperFieldDelta(field, direction));
    // Focus the targeted field so subsequent keyboard input lands there
    // and the spinbutton's :focus-visible styling reflects activity.
    focusField(field);
    stopStepperRepeat();
    const tick = (delay: number) => {
      repeatTimerRef.current = setTimeout(() => {
        const f = focusedFieldRef.current;
        adjustField(f, stepperFieldDelta(f, direction));
        tick(80);
      }, delay);
    };
    tick(400);
  };

  const handleStepperPointerDown =
    (direction: 1 | -1) => (event: PointerEvent<HTMLButtonElement>) => {
      // Left button only — ignore right/middle/touch-multitouch artefacts.
      if (event.button !== 0) return;
      event.preventDefault();
      // setPointerCapture can throw NotFoundError when the dispatched event
      // has no active pointer track (synthetic test events, screen-reader
      // virtual cursors). Capture is a UX nicety, not a correctness
      // requirement — swallow the throw so the increment still fires.
      try {
        event.currentTarget.setPointerCapture?.(event.pointerId);
      } catch {
        // ignore — see comment above
      }
      startStepperRepeat(direction);
    };

  const handleStepperPointerEnd = () => {
    stopStepperRepeat();
  };

  // Synthetic click — fires for keyboard activation (Space/Enter on a
  // focused button) AND as the click that follows a pointerup. Guard
  // against double-fire after pointerdown by checking the timer state: if
  // startStepperRepeat already ran, the pointer path handled the step.
  const handleStepperKeyboardStep = (
    direction: 1 | -1,
  ) => (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    const field = focusedFieldRef.current;
    adjustField(field, stepperFieldDelta(field, direction));
    focusField(field);
  };

  // ARIA value-text for AM/PM
  const periodLabel = period === 'AM' ? 'AM' : 'PM';

  // Disabled/invalid wiring
  const groupAriaLabel = ariaLabel ?? label ?? 'Time';
  const groupInvalid = ariaInvalid ?? (error ? true : undefined);

  const wrapClass = cn(
    styles.field,
    disabled && styles.fieldDisabled,
    className,
  );
  const inputWrapClass = cn(
    styles.inputWrap,
    error && styles.inputWrapError,
    disabled && styles.inputWrapDisabled,
    showSteppers && styles.inputWrapStretched,
  );

  const hourBounds = fieldBounds('h');
  const minuteBounds = fieldBounds('m');
  const secondBounds = fieldBounds('s');

  return (
    <div
      ref={ref}
      className={wrapClass}
      dir={dir}
      data-disabled={disabled || undefined}
    >
      {label ? (
        <Label
          htmlFor={hourId}
          required={required}
          disabled={disabled}
          className={hideLabel ? styles.srOnly : undefined}
        >
          {label}
        </Label>
      ) : null}
      <div
        className={inputWrapClass}
        role="group"
        aria-label={groupAriaLabel}
        aria-disabled={disabled || undefined}
        data-invalid={groupInvalid ? 'true' : undefined}
      >
        <input
          ref={hourRef}
          id={hourId}
          type="text"
          role="spinbutton"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          readOnly
          aria-label="Hours"
          aria-valuemin={hourBounds.min}
          aria-valuemax={hourBounds.max}
          aria-valuenow={fieldValueNow('h')}
          aria-valuetext={fieldValueText('h')}
          aria-describedby={describedBy}
          aria-invalid={groupInvalid}
          data-time-field="h"
          className={styles.spin}
          value={fieldDisplay('h')}
          onKeyDown={handleKeyDown('h')}
          onFocus={handleFocus('h')}
          onBlur={handleBlur('h')}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={() => setComposing(false)}
          onClick={(event) => event.currentTarget.select?.()}
        />
        <span aria-hidden="true" className={styles.separator}>
          :
        </span>
        <input
          ref={minuteRef}
          id={minuteId}
          type="text"
          role="spinbutton"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          readOnly
          aria-label="Minutes"
          aria-valuemin={minuteBounds.min}
          aria-valuemax={minuteBounds.max}
          aria-valuenow={fieldValueNow('m')}
          aria-valuetext={fieldValueText('m')}
          aria-describedby={describedBy}
          aria-invalid={groupInvalid}
          data-time-field="m"
          className={styles.spin}
          value={fieldDisplay('m')}
          onKeyDown={handleKeyDown('m')}
          onFocus={handleFocus('m')}
          onBlur={handleBlur('m')}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={() => setComposing(false)}
          onClick={(event) => event.currentTarget.select?.()}
        />
        {withSeconds ? (
          <>
            <span aria-hidden="true" className={styles.separator}>
              :
            </span>
            <input
              ref={secondRef}
              id={secondId}
              type="text"
              role="spinbutton"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              disabled={disabled}
              readOnly
              aria-label="Seconds"
              aria-valuemin={secondBounds.min}
              aria-valuemax={secondBounds.max}
              aria-valuenow={fieldValueNow('s')}
              aria-valuetext={fieldValueText('s')}
              aria-describedby={describedBy}
              aria-invalid={groupInvalid}
              data-time-field="s"
              className={styles.spin}
              value={fieldDisplay('s')}
              onKeyDown={handleKeyDown('s')}
              onFocus={handleFocus('s')}
              onBlur={handleBlur('s')}
              onCompositionStart={() => setComposing(true)}
              onCompositionEnd={() => setComposing(false)}
              onClick={(event) => event.currentTarget.select?.()}
            />
          </>
        ) : null}
        {is12h ? (
          <button
            type="button"
            role="switch"
            aria-checked={period === 'PM'}
            aria-label="AM or PM"
            disabled={disabled}
            className={styles.period}
            data-period={period}
            onClick={togglePeriod}
            onKeyDown={togglePeriod}
          >
            {periodLabel}
          </button>
        ) : null}
        {showSteppers ? (
          <div className={styles.steppers} aria-hidden={disabled || undefined}>
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              className={styles.stepperUp}
              aria-label="Increment time"
              data-stepper="up"
              onPointerDown={handleStepperPointerDown(1)}
              onPointerUp={handleStepperPointerEnd}
              onPointerCancel={handleStepperPointerEnd}
              onPointerLeave={handleStepperPointerEnd}
              onKeyDown={handleStepperKeyboardStep(1)}
            >
              <svg viewBox="0 0 10 6" aria-hidden="true" focusable="false">
                <path
                  d="M1 5 L5 1 L9 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              className={styles.stepperDown}
              aria-label="Decrement time"
              data-stepper="down"
              onPointerDown={handleStepperPointerDown(-1)}
              onPointerUp={handleStepperPointerEnd}
              onPointerCancel={handleStepperPointerEnd}
              onPointerLeave={handleStepperPointerEnd}
              onKeyDown={handleStepperKeyboardStep(-1)}
            >
              <svg viewBox="0 0 10 6" aria-hidden="true" focusable="false">
                <path
                  d="M1 1 L5 5 L9 1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ) : null}
      </div>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={isoValue}
          required={required}
        />
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className={styles.helper}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
