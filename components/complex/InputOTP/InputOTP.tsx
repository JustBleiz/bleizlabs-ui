'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent as ReactClipboardEvent,
  type CompositionEvent as ReactCompositionEvent,
  type FormEvent,
  type FocusEvent as ReactFocusEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import styles from './InputOTP.module.scss';

/**
 * InputOTP — one-time password / verification code entry (Phase 10 CI18).
 *
 * @layer   complex-interactive
 * @tokens  --color-surface, --color-surface-raised, --color-surface-muted,
 *          --color-border, --color-brand, --color-text-primary, --color-text-muted,
 *          --color-error, --focus-ring (via mx.focus-ring mixin),
 *          --focus-ring-error (via mx.focus-ring-error mixin), --radius-md,
 *          --duration-fast, --easing-default, --font-secondary, --font-size-lg,
 *          --space-{1,2,3}
 * @deps    cn, mergeRefs
 * @a11y    Single semantic `<input>` stretched across decorative slot cells
 *          (guilhermerodz `input-otp` zero-dep reimplementation). Real input
 *          carries `name`/`value`/`aria-label`/`aria-invalid`/`aria-required`/
 *          `autocomplete="one-time-code"` for iOS/Android SMS autofill. Slots
 *          are decorative (`aria-hidden="true"`) — SR reads ONE field named by
 *          `aria-label`, not N character fields. Focus stays on the hidden
 *          input; clicks on a slot call `input.setSelectionRange(i, i)` to
 *          reposition caret which drives active-slot highlight. Paste event
 *          distributes multi-char across slots after pattern-filter + trim.
 *          IME composition guard (`isComposingRef` + `key === 'Process'` +
 *          `keyCode === 229`) prevents CJK users double-firing input events.
 *          **Focus indicator delegation:** `.input` sets `outline: none` and
 *          delegates focus indication to the active slot's `data-active`
 *          styling (border-color + box-shadow focus-ring). Slot receives
 *          `data-active` when `caretStart === index && isFocused` — caret
 *          position state drives which slot shows the focus ring. There is
 *          a ~1 RAF window on initial focus where `caretStart` is still at
 *          the last synced value (usually 0) before the first `syncSelection`
 *          rAF commits; this is a 16ms cosmetic flicker, not a SR-level
 *          concern.
 *          **Paste handler protocol:** consumer-supplied `onPaste` is invoked
 *          FIRST; if the consumer calls `event.preventDefault()` in their
 *          handler, the built-in paste-distribution logic is suppressed
 *          entirely (consumer owns paste). Otherwise the built-in handler
 *          calls `preventDefault` + reads clipboard + strips whitespace/hyphens
 *          + filters by pattern + inserts at caret + truncates at maxLength.
 *          **Accessible name enforcement:** at mount, if neither `aria-label`
 *          nor `aria-labelledby` is provided a dev-mode `console.warn` fires
 *          (stripped in prod). WCAG 2.1 SC 1.1.1 requires a named input; the
 *          warning guards against the footgun of unlabelled OTP inputs.
 * @apg     N/A — no dedicated APG pattern for OTP inputs; combines
 *          `autocomplete="one-time-code"` WebSpec + shadcn/ui `input-otp`
 *          single-input-with-decorative-slots idiom, reimplemented zero-dep
 *          per D5/D25.
 * @tested  tsc + eslint + next build (Playwright/NVDA/axe deferred per E15 scope).
 * @regressions tests/InputOTP.{keyboard,focus,aria,regression}.spec.md —
 *              20 regression cases OTP-R01..OTP-R20 (15 Radix/input-otp
 *              mapped + 5 bespoke; executable canon in the sibling
 *              `tests/InputOTP.*.spec.ts` quad — the `.spec.md` mirrors
 *              cover OTP-R01..R16).
 *
 * @example
 * // Basic uncontrolled, 6-digit numeric
 * <InputOTP maxLength={6} aria-label="Verification code" />
 *
 * @example
 * // Controlled with onComplete auto-submit
 * <InputOTP
 *   maxLength={6}
 *   value={code}
 *   onChange={setCode}
 *   onComplete={handleVerify}
 *   aria-label="2FA code"
 * />
 *
 * @example
 * // With separator for XXX-XXX layout
 * <InputOTP maxLength={6} aria-label="Code">
 *   <InputOTPGroup>
 *     <InputOTPSlot index={0} />
 *     <InputOTPSlot index={1} />
 *     <InputOTPSlot index={2} />
 *   </InputOTPGroup>
 *   <InputOTPSeparator />
 *   <InputOTPGroup>
 *     <InputOTPSlot index={3} />
 *     <InputOTPSlot index={4} />
 *     <InputOTPSlot index={5} />
 *   </InputOTPGroup>
 * </InputOTP>
 *
 * @example
 * // Alphanumeric + form participation
 * <form>
 *   <InputOTP
 *     maxLength={8}
 *     name="license"
 *     pattern="alphanumeric"
 *     required
 *     aria-label="License key"
 *   />
 * </form>
 */

// ============================================================================
// Types
// ============================================================================

export type InputOTPPattern = 'numeric' | 'alphanumeric' | 'alpha' | RegExp;

export interface InputOTPProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'pattern' | 'size' | 'children'
> {
  /** Total cell count (e.g., `6` for 6-digit 2FA code). Required. */
  maxLength: number;
  /** Controlled value string. */
  value?: string;
  /** Uncontrolled initial value. Default `''`. */
  defaultValue?: string;
  /** Fires on every value change (typing, paste, autofill). */
  onChange?: (value: string) => void;
  /** Fires exactly ONCE when value length reaches `maxLength`. */
  onComplete?: (value: string) => void;
  /**
   * Character pattern. Invalid chars dropped silently on input + paste.
   * `'numeric'` → 0-9 (default)
   * `'alphanumeric'` → 0-9 A-Z a-z
   * `'alpha'` → A-Z a-z
   * `RegExp` → custom (must match individual chars, e.g. `/[0-9A-F]/`)
   */
  pattern?: InputOTPPattern;
  /** Visible accessible name. Required for SR unless `aria-labelledby` is set. */
  'aria-label'?: string;
  /** Links to external label node. */
  'aria-labelledby'?: string;
  /** Links to error/helper text. */
  'aria-describedby'?: string;
  /** Error state — sets `aria-invalid` on real input + `data-invalid` on root. */
  'aria-invalid'?: boolean;
  /** Autocomplete hint. Default `'one-time-code'` enables iOS/Android SMS autofill. */
  autoComplete?: string;
  /**
   * Virtual keyboard hint. Default derived from `pattern` (`'numeric'` for
   * numeric patterns, `'text'` otherwise).
   */
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  /** Compound children — Groups + Slots + Separators. If omitted, auto-defaults to `maxLength` Slots in one Group. */
  children?: ReactNode;
}

export type InputOTPGroupProps = HTMLAttributes<HTMLDivElement>;

export interface InputOTPSlotProps extends HTMLAttributes<HTMLDivElement> {
  /** Zero-based cell position. Required. */
  index: number;
}

export type InputOTPSeparatorProps = HTMLAttributes<HTMLDivElement>;

// ============================================================================
// Pattern compilation
// ============================================================================

const NUMERIC_REGEX = /^[0-9]$/;
const ALPHANUMERIC_REGEX = /^[0-9A-Za-z]$/;
const ALPHA_REGEX = /^[A-Za-z]$/;

function getPatternRegex(pattern: InputOTPPattern): RegExp {
  if (pattern instanceof RegExp) return pattern;
  if (pattern === 'numeric') return NUMERIC_REGEX;
  if (pattern === 'alphanumeric') return ALPHANUMERIC_REGEX;
  return ALPHA_REGEX;
}

function filterByPattern(input: string, regex: RegExp): string {
  let out = '';
  for (const char of input) {
    if (regex.test(char)) out += char;
  }
  return out;
}

function defaultInputMode(
  pattern: InputOTPPattern,
): InputHTMLAttributes<HTMLInputElement>['inputMode'] {
  if (pattern === 'numeric') return 'numeric';
  return 'text';
}

// ============================================================================
// Context
// ============================================================================

interface InputOTPContextValue {
  value: string;
  maxLength: number;
  caretStart: number;
  caretEnd: number;
  isFocused: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isInvalid: boolean;
  focusInput: (caretIndex?: number) => void;
}

const InputOTPContext = createContext<InputOTPContextValue | null>(null);

function useInputOTPContext(hookName: string): InputOTPContextValue {
  const ctx = useContext(InputOTPContext);
  if (!ctx) {
    throw new Error(
      `${hookName} must be used inside <InputOTP>. Compound children must live under an InputOTP root.`,
    );
  }
  return ctx;
}

// ============================================================================
// InputOTP (root)
// ============================================================================

export const InputOTP = forwardRef<HTMLInputElement, InputOTPProps>(function InputOTP(
  {
    maxLength,
    value: controlledValue,
    defaultValue,
    onChange,
    onComplete,
    pattern = 'numeric',
    name,
    required,
    disabled,
    readOnly,
    autoFocus,
    autoComplete = 'one-time-code',
    inputMode,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-invalid': ariaInvalid,
    className,
    children,
    onFocus,
    onBlur,
    onPaste,
    ...rest
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mergedInputRef = useMemo(() => mergeRefs(ref, inputRef), [ref]);
  const generatedId = useId();
  const inputId = `input-otp-${generatedId}`;

  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(() => {
    return defaultValue ?? '';
  });
  const value = isControlled ? (controlledValue ?? '') : uncontrolledValue;

  const [caretStart, setCaretStart] = useState(0);
  const [caretEnd, setCaretEnd] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const regex = useMemo(() => getPatternRegex(pattern), [pattern]);
  const resolvedInputMode = inputMode ?? defaultInputMode(pattern);

  const isComposingRef = useRef(false);
  // Initialize to `false` regardless of initial value length — mount is not
  // a "transition to complete", so `onComplete` should fire on the first
  // user-driven completion even when `defaultValue` is already full length.
  const prevCompleteRef = useRef(false);
  const latestValueRef = useRef(value);
  useLayoutEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  const commitValue = useCallback(
    (next: string) => {
      const sanitized = next.length > maxLength ? next.slice(0, maxLength) : next;
      if (sanitized === latestValueRef.current) return;
      if (!isControlled) setUncontrolledValue(sanitized);
      onChange?.(sanitized);
      const wasComplete = prevCompleteRef.current;
      const isComplete = sanitized.length === maxLength;
      if (isComplete && !wasComplete) {
        onComplete?.(sanitized);
      }
      prevCompleteRef.current = isComplete;
    },
    [isControlled, maxLength, onChange, onComplete],
  );

  const focusInput = useCallback((caretIndex?: number) => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    if (caretIndex !== undefined) {
      const clamped = Math.max(0, Math.min(caretIndex, latestValueRef.current.length));
      input.setSelectionRange(clamped, clamped);
      setCaretStart(clamped);
      setCaretEnd(clamped);
    }
  }, []);

  const syncSelection = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? start;
    setCaretStart(start);
    setCaretEnd(end);
  }, []);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (isComposingRef.current) return;
      const raw = event.target.value;
      const filtered = filterByPattern(raw, regex);
      const truncated = filtered.length > maxLength ? filtered.slice(0, maxLength) : filtered;
      if (truncated !== raw) {
        event.target.value = truncated;
      }
      commitValue(truncated);
      requestAnimationFrame(syncSelection);
    },
    [commitValue, maxLength, regex, syncSelection],
  );

  const handleBeforeInput = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      if (isComposingRef.current) return;
      const native = event.nativeEvent as InputEvent;
      const data = native.data;
      if (data === null || data === undefined) return;
      if (data.length === 1) {
        if (!regex.test(data)) {
          event.preventDefault();
        }
      }
    },
    [regex],
  );

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);
  const handleCompositionEnd = useCallback(
    (event: ReactCompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = false;
      const raw = (event.target as HTMLInputElement).value;
      const filtered = filterByPattern(raw, regex);
      const truncated = filtered.length > maxLength ? filtered.slice(0, maxLength) : filtered;
      if (truncated !== raw) {
        (event.target as HTMLInputElement).value = truncated;
      }
      commitValue(truncated);
      requestAnimationFrame(syncSelection);
    },
    [commitValue, maxLength, regex, syncSelection],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (isComposingRef.current) return;
      if (event.key === 'Process' || event.keyCode === 229) return;
      requestAnimationFrame(syncSelection);
    },
    [syncSelection],
  );

  const handleSelect = useCallback(() => {
    syncSelection();
  }, [syncSelection]);

  const handlePaste = useCallback(
    (event: ReactClipboardEvent<HTMLInputElement>) => {
      onPaste?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      if (readOnly || disabled) return;
      const clipboard = event.clipboardData.getData('text') ?? '';
      const stripped = clipboard.replace(/[\s_-]+/g, '');
      const filtered = filterByPattern(stripped, regex);
      if (filtered.length === 0) return;
      const input = inputRef.current;
      if (!input) return;
      const selStart = input.selectionStart ?? latestValueRef.current.length;
      const selEnd = input.selectionEnd ?? selStart;
      const current = latestValueRef.current;
      const before = current.slice(0, selStart);
      const after = current.slice(selEnd);
      const combined = (before + filtered + after).slice(0, maxLength);
      commitValue(combined);
      const nextCaret = Math.min(before.length + filtered.length, maxLength);
      requestAnimationFrame(() => {
        const current = inputRef.current;
        if (!current) return;
        current.setSelectionRange(nextCaret, nextCaret);
        setCaretStart(nextCaret);
        setCaretEnd(nextCaret);
      });
    },
    [commitValue, disabled, maxLength, onPaste, readOnly, regex],
  );

  const handleFocus = useCallback(
    (event: ReactFocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      syncSelection();
      onFocus?.(event);
    },
    [onFocus, syncSelection],
  );
  const handleBlur = useCallback(
    (event: ReactFocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  // WCAG 2.1 SC 1.1.1 — named input required. Dev-only guard; stripped in
  // production builds via `process.env.NODE_ENV`. Fires once per mount.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (!ariaLabel && !ariaLabelledby) {
      console.warn(
        '[InputOTP] Missing accessible name. Pass either `aria-label` or `aria-labelledby` — unlabelled OTP inputs fail WCAG 2.1 SC 1.1.1 for screen reader users.',
      );
    }
    // Run once per mount; labels changing post-mount is not a real scenario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = useMemo<InputOTPContextValue>(
    () => ({
      value,
      maxLength,
      caretStart,
      caretEnd,
      isFocused,
      isDisabled: Boolean(disabled),
      isReadOnly: Boolean(readOnly),
      isInvalid: Boolean(ariaInvalid),
      focusInput,
    }),
    [
      value,
      maxLength,
      caretStart,
      caretEnd,
      isFocused,
      disabled,
      readOnly,
      ariaInvalid,
      focusInput,
    ],
  );

  const effectiveChildren = children ?? <DefaultSlots />;

  return (
    <InputOTPContext.Provider value={contextValue}>
      <div
        className={cn(styles.root, className)}
        data-disabled={disabled ? 'true' : undefined}
        data-invalid={ariaInvalid ? 'true' : undefined}
      >
        <div className={styles.slotsContainer}>{effectiveChildren}</div>
        <input
          ref={mergedInputRef}
          id={inputId}
          type="text"
          name={name}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          inputMode={resolvedInputMode}
          maxLength={maxLength}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
          aria-invalid={ariaInvalid ? true : undefined}
          aria-required={required ? true : undefined}
          className={styles.input}
          value={value}
          onChange={handleChange}
          onBeforeInput={handleBeforeInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onKeyDown={handleKeyDown}
          onKeyUp={handleSelect}
          onClick={handleSelect}
          onSelect={handleSelect}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onPaste={handlePaste}
          {...rest}
        />
      </div>
    </InputOTPContext.Provider>
  );
});

// ============================================================================
// DefaultSlots (internal — rendered when no children passed)
// ============================================================================

function DefaultSlots() {
  const ctx = useInputOTPContext('DefaultSlots');
  const slots: ReactNode[] = [];
  for (let i = 0; i < ctx.maxLength; i++) {
    slots.push(<InputOTPSlot key={i} index={i} />);
  }
  return <InputOTPGroup>{slots}</InputOTPGroup>;
}

// ============================================================================
// InputOTPGroup
// ============================================================================

export const InputOTPGroup = forwardRef<HTMLDivElement, InputOTPGroupProps>(function InputOTPGroup(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn(styles.group, className)} {...rest}>
      {children}
    </div>
  );
});

// ============================================================================
// InputOTPSlot
// ============================================================================

export const InputOTPSlot = forwardRef<HTMLDivElement, InputOTPSlotProps>(function InputOTPSlot(
  { index, className, ...rest },
  ref,
) {
  const ctx = useInputOTPContext('InputOTPSlot');
  const char = ctx.value[index] ?? '';
  const isFilled = char.length > 0;
  const isActive =
    ctx.isFocused &&
    ((ctx.caretStart === ctx.caretEnd && ctx.caretStart === index) ||
      (ctx.caretStart !== ctx.caretEnd && index >= ctx.caretStart && index < ctx.caretEnd));
  const showCaret =
    ctx.isFocused &&
    ctx.caretStart === ctx.caretEnd &&
    ctx.caretStart === index &&
    !ctx.isDisabled &&
    !ctx.isReadOnly;

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (ctx.isDisabled) return;
      ctx.focusInput(index);
    },
    [ctx, index],
  );

  return (
    <div
      ref={ref}
      className={cn(styles.slot, className)}
      data-filled={isFilled ? 'true' : undefined}
      data-active={isActive ? 'true' : undefined}
      data-disabled={ctx.isDisabled ? 'true' : undefined}
      data-invalid={ctx.isInvalid ? 'true' : undefined}
      aria-hidden="true"
      onPointerDown={handlePointerDown}
      {...rest}
    >
      <span className={styles.slotChar}>{char}</span>
      {showCaret ? <span aria-hidden="true" className={styles.caret} /> : null}
    </div>
  );
});

// ============================================================================
// InputOTPSeparator
// ============================================================================

export const InputOTPSeparator = forwardRef<HTMLDivElement, InputOTPSeparatorProps>(
  function InputOTPSeparator({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn(styles.separator, className)} aria-hidden="true" {...rest}>
        {children ?? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M2 5 h6" />
          </svg>
        )}
      </div>
    );
  },
);
