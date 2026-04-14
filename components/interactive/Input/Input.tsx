'use client';

import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/components/utils/cn';
import { Label } from '@/components/interactive/Label';
import styles from './Input.module.scss';

/**
 * Input — single-line text form input (Phase 4 I2, hardened in E08).
 *
 * @layer   atom (interactive)
 * @tokens  --input-bg, --input-border, --input-border-focus,
 *          --input-addon-bg, --input-addon-text, --input-addon-border,
 *          --color-error, --color-text-primary, --color-text-muted,
 *          --color-text-secondary, --focus-ring, --focus-ring-error,
 *          --radius-input, --space-{2..4}, --font-secondary,
 *          --font-size-{xs,base}, --duration-fast, --easing-default
 * @deps    Label, cn
 * @a11y    Native `<input>` with `id` ↔ `htmlFor` association via Label.
 *          `aria-invalid` set when `error` is provided. `aria-describedby`
 *          links the error message, helper text, AND counter (when
 *          `showCounter` is on) so the live char count is announced. The
 *          `clearable` X button is a native `<button type="button">` with
 *          `aria-label` so it's keyboard-reachable; clearing fires
 *          `onChange` with an empty target value (consumer state stays in
 *          sync). The `loading` Spinner is decorated with `role="status"
 *          aria-live="polite"` so SR users hear the in-flight state.
 *          `prefix`/`suffix` literal text addons are pure visual labels —
 *          they don't carry semantic meaning beyond the visible text, and
 *          they live INSIDE the same `<div role="group">` as the input
 *          (the wrap div) so SR users perceive them as part of one
 *          control. For multi-element widgets (text addon + Input + Button
 *          combos), use `<InputGroup>` instead.
 * @notes   Client Component (`'use client'`) — handles controlled vs
 *          uncontrolled state by accepting both `value` and `defaultValue`.
 *          Per React standard, controlled wins when both are provided.
 *          The `clearable` X button is suppressed when `disabled` or
 *          `loading` is true (no point clearing a busy/disabled input).
 *          The `loading` Spinner takes priority over `endIcon` when both
 *          are passed — consumer's intent is "in-flight" not "decoration".
 *          The character counter reads either the controlled `value` or
 *          the internal uncontrolled mirror; in uncontrolled mode the
 *          counter reflects the most recent typed value, NOT the initial
 *          `defaultValue` if the user hasn't typed yet (DOM source of
 *          truth).
 *          When BOTH `error` and `helperText` are provided, `error` wins
 *          and `helperText` is intentionally suppressed (single status
 *          message at a time — doubled below-input text is noisy and
 *          competes for SR focus). Document this in your form schema.
 *          The `clearable` button always invokes the consumer's
 *          `onChange` callback (in BOTH controlled and uncontrolled mode)
 *          with a synthetic event whose `target.value` is `''` — this
 *          keeps controlled state in sync without relying on
 *          dispatchEvent + native value setter tricks.
 *
 * @example
 * <Input label="Email" name="email" type="email" required />
 *
 * <Input
 *   label="Username"
 *   name="username"
 *   value={username}
 *   onChange={(e) => setUsername(e.target.value)}
 *   error={errors.username}
 * />
 *
 * <Input label="Price" name="price" prefix="$" suffix=".00" />
 *
 * <Input
 *   label="Bio"
 *   name="bio"
 *   maxLength={140}
 *   showCounter
 *   helperText="Brief description"
 * />
 *
 * <Input
 *   label="Search"
 *   name="q"
 *   value={query}
 *   onChange={(e) => setQuery(e.target.value)}
 *   clearable
 *   loading={searching}
 * />
 */
export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Visible label text. Renders a coupled `<Label htmlFor>` above the input. */
  label: string;
  /** Form field name (for native form submission). */
  name: string;
  /** Input type. Default `text`. */
  type?: InputType;
  /** Error message — renders below input + sets `aria-invalid`. */
  error?: string;
  /** Helper text — renders below input when no error. */
  helperText?: string;
  /** Optional leading icon inside the input wrap. Mutually exclusive with `prefix`. */
  startIcon?: ReactNode;
  /** Optional trailing icon inside the input wrap. Hidden when `loading` is true. */
  endIcon?: ReactNode;
  /**
   * Literal text addon rendered as a labelled prefix on the left of the input
   * (e.g., `$`, `@`, `https://`). Use for single-element addons; for
   * multi-element widgets (text + input + button), use `<InputGroup>`.
   * Mutually exclusive with `startIcon`.
   */
  prefix?: string;
  /** Literal text addon rendered as a labelled suffix on the right (e.g., `zł`, `kg`, `.00`). */
  suffix?: string;
  /**
   * Show a live character counter (`12 / 100`) below the input. Requires
   * `maxLength` — when omitted, the counter renders the count without a max.
   */
  showCounter?: boolean;
  /**
   * Show a clear (X) button on the right when the input has a value.
   * Suppressed when `disabled` or `loading` is true. Calling clear fires
   * the consumer's `onChange` with an empty `target.value`.
   */
  clearable?: boolean;
  /**
   * Show an inline Spinner on the right indicating an async operation
   * (e.g., search-as-you-type, async validation). Takes priority over
   * `endIcon` when both are passed.
   */
  loading?: boolean;
  /** Hide visible label (still rendered for screen readers). Default `false`. */
  hideLabel?: boolean;
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <span role="status" aria-live="polite" className={styles.loadingSpinner}>
      <span className={styles.spinnerRing} aria-hidden="true" />
      <span className={styles.srOnly}>Loading</span>
    </span>
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    name,
    type = 'text',
    error,
    helperText,
    startIcon,
    endIcon,
    prefix,
    suffix,
    showCounter = false,
    clearable = false,
    loading = false,
    hideLabel = false,
    required,
    disabled,
    id,
    maxLength,
    value: controlledValue,
    defaultValue,
    onChange,
    className,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? `${name}-${generatedId}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText && !error ? `${inputId}-helper` : undefined;
  const counterId = showCounter ? `${inputId}-counter` : undefined;
  const describedBy =
    [errorId, helperId, counterId].filter(Boolean).join(' ') || undefined;

  // Track current value length for the counter. We read from controlled
  // `value` when present; otherwise we mirror the uncontrolled state via
  // an internal string. This avoids forcing consumers into controlled
  // mode just to display a counter.
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(() => {
    if (defaultValue == null) return '';
    return String(defaultValue);
  });
  const currentValue = isControlled ? String(controlledValue ?? '') : uncontrolledValue;
  const hasValue = currentValue.length > 0;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setUncontrolledValue(event.target.value);
    onChange?.(event);
  };

  const handleClear = () => {
    if (!isControlled) setUncontrolledValue('');
    // Always invoke the consumer's onChange so controlled state stays in
    // sync. We synthesize a minimal ChangeEvent whose `target.value` is
    // empty — that's the only field every onChange consumer actually reads
    // in practice (and it's what React passes through anyway). This
    // avoids the imperative native-setter + dispatchEvent dance which is
    // brittle under SSR, hydration, and non-DOM testing environments.
    const target = document.getElementById(inputId) as HTMLInputElement | null;
    if (target) {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set;
      nativeSetter?.call(target, '');
    }
    if (onChange && target) {
      const syntheticEvent = {
        target,
        currentTarget: target,
        nativeEvent: new Event('input', { bubbles: true }),
        bubbles: true,
        cancelable: true,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: false,
        preventDefault: () => {},
        stopPropagation: () => {},
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        persist: () => {},
        timeStamp: Date.now(),
        type: 'change',
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const showClearButton = clearable && hasValue && !disabled && !loading;
  const showLoading = loading;
  const showEndIcon = !showLoading && !showClearButton && Boolean(endIcon);
  // `prefix`/`suffix` use the `.addonText[data-side='*'] + .input` selectors
  // for padding adjustment — they fully replace the input's edge padding.
  // `startIcon`/`endIcon` use the `.hasStartIcon`/`.hasEndIcon` modifier
  // classes, which apply ONLY when an icon (not a text addon) is present.
  // This keeps the two slot mechanisms from competing for the same selector.
  const hasStartIconSlot = Boolean(startIcon) && !prefix;
  const hasEndIconSlot = showEndIcon && !suffix;

  return (
    <div className={cn(styles.field, disabled && styles.fieldDisabled, className)}>
      <Label
        htmlFor={inputId}
        required={required}
        disabled={disabled}
        className={hideLabel ? styles.srOnly : undefined}
      >
        {label}
      </Label>
      <div
        className={cn(
          styles.inputWrap,
          error && styles.inputWrapError,
          hasStartIconSlot && styles.hasStartIcon,
          hasEndIconSlot && styles.hasEndIcon,
        )}
      >
        {prefix ? (
          <span className={styles.addonText} data-side="start">
            {prefix}
          </span>
        ) : startIcon ? (
          <span aria-hidden="true" className={styles.startIcon}>
            {startIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={styles.input}
          {...(isControlled ? { value: controlledValue } : { defaultValue })}
          onChange={handleChange}
          {...rest}
        />
        {suffix ? (
          <span className={styles.addonText} data-side="end">
            {suffix}
          </span>
        ) : null}
        {showLoading ? (
          <span className={styles.endSlot}>
            <LoadingSpinner />
          </span>
        ) : showClearButton ? (
          <button
            type="button"
            aria-label="Clear"
            className={styles.clearButton}
            onClick={handleClear}
          >
            <ClearIcon />
          </button>
        ) : showEndIcon ? (
          <span aria-hidden="true" className={styles.endIcon}>
            {endIcon}
          </span>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className={styles.helper}>
          {helperText}
        </p>
      ) : null}
      {showCounter ? (
        <p id={counterId} className={styles.counter} aria-live="polite">
          {maxLength != null ? `${currentValue.length} / ${maxLength}` : `${currentValue.length}`}
        </p>
      ) : null}
    </div>
  );
});
