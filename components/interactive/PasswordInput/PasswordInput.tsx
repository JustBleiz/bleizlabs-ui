'use client';

import {
  forwardRef,
  useId,
  useMemo,
  useState,
  type InputHTMLAttributes,
} from 'react';
import { cn } from '@/components/utils/cn';
import { Label } from '@/components/interactive/Label';
import styles from './PasswordInput.module.scss';

/**
 * PasswordInput — password form input with show/hide toggle and optional
 * strength meter (Phase 4 expansion E08, Layer 3 of D26).
 *
 * @layer   atom (interactive)
 * @tokens  --input-bg, --input-border, --input-border-focus,
 *          --color-error, --color-success, --color-warning,
 *          --color-text-primary, --color-text-muted, --focus-ring,
 *          --focus-ring-error, --radius-input, --radius-sm,
 *          --space-{1..6}, --font-secondary, --font-size-{xs,base},
 *          --duration-fast, --easing-default
 * @deps    Label, cn
 * @a11y    Native `<input type="password">` switches to `type="text"`
 *          when the visibility toggle is activated. The eye button is
 *          a keyboard-reachable `<button type="button">` with an
 *          `aria-label` that announces the current state ("Show
 *          password" / "Hide password") and an `aria-pressed` boolean
 *          reflecting the toggle state. The button sits inside the
 *          input wrap and participates in the `:focus-within` ring.
 *
 *          Strength meter: when `showStrength` is set, a `<div
 *          role="meter">` renders below the input with `aria-valuemin`,
 *          `aria-valuemax`, and `aria-valuenow` reflecting the 0-4
 *          heuristic level. The visible label ("weak" / "fair" / "good"
 *          / "strong") is rendered in a sibling text node and linked
 *          via `aria-describedby` on the input so SR users hear the
 *          strength alongside the field.
 *
 *          `aria-invalid`, `aria-describedby`, and label coupling
 *          mirror Input's conventions. Auto-generated `id` via `useId`.
 * @notes   Client Component (`'use client'`) — manages visibility
 *          toggle and strength calculation internally. The `autoComplete`
 *          attribute should be set by the consumer: `"current-password"`
 *          for login forms, `"new-password"` for signup / change-password
 *          flows. No default is set because the wrong hint leaks into
 *          browser autofill behavior.
 *
 *          Strength heuristic (intentionally simple — NOT zxcvbn):
 *          - 0 empty
 *          - 1 weak: length < 8
 *          - 2 fair: length ≥ 8 AND has letters + digits
 *          - 3 good: level 2 AND has lowercase + uppercase
 *          - 4 strong: level 3 AND has symbols AND length ≥ 12
 *
 *          The heuristic is a UX hint, NOT a security check. Real
 *          password policies should be enforced server-side. Consumers
 *          who need zxcvbn-class scoring should wrap PasswordInput in
 *          their own validator and pass `error` when weak.
 *
 *          Value is a standard `string`. Controlled/uncontrolled follows
 *          React convention — pass `value` + `onChange` for controlled,
 *          `defaultValue` for uncontrolled. Strength meter reads from
 *          whichever is active.
 *
 * @example
 * // Login form (current password)
 * <PasswordInput
 *   label="Password"
 *   name="password"
 *   autoComplete="current-password"
 *   required
 * />
 *
 * // Signup form with strength meter
 * <PasswordInput
 *   label="New password"
 *   name="password"
 *   autoComplete="new-password"
 *   showStrength
 *   required
 * />
 *
 * // Controlled with external validation
 * <PasswordInput
 *   label="Password"
 *   name="password"
 *   value={pwd}
 *   onChange={(e) => setPwd(e.target.value)}
 *   error={pwd.length > 0 && pwd.length < 12 ? 'At least 12 characters' : undefined}
 * />
 */
export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Visible label text. */
  label: string;
  /** Form field name. */
  name: string;
  /** Error message — renders below + sets `aria-invalid`. */
  error?: string;
  /** Helper text — renders below when no error. */
  helperText?: string;
  /**
   * Show a 4-level strength meter below the input. Heuristic is a UX
   * hint, NOT a security check — real password policies live server-side.
   */
  showStrength?: boolean;
  /** Hide visible label (still in a11y tree). Default `false`. */
  hideLabel?: boolean;
}

type StrengthLevel = 0 | 1 | 2 | 3 | 4;

const STRENGTH_LABELS: Record<StrengthLevel, string> = {
  0: '',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
};

const STRENGTH_CLASS: Record<StrengthLevel, string> = {
  0: '',
  1: styles.strengthWeak!,
  2: styles.strengthFair!,
  3: styles.strengthGood!,
  4: styles.strengthStrong!,
};

function calculateStrength(value: string): StrengthLevel {
  if (!value) return 0;
  const len = value.length;
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasDigit = /[0-9]/.test(value);
  const hasSymbol = /[^a-zA-Z0-9]/.test(value);

  if (len < 8) return 1;
  if (!(hasDigit && (hasLower || hasUpper))) return 1;
  // level 2: length ≥ 8 AND letters + digits
  if (!(hasLower && hasUpper)) return 2;
  // level 3: level 2 AND both cases
  if (!(hasSymbol && len >= 12)) return 3;
  // level 4: level 3 AND symbols AND length ≥ 12
  return 4;
}

function EyeOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      label,
      name,
      error,
      helperText,
      showStrength = false,
      hideLabel = false,
      required,
      disabled,
      id,
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
    const strengthId = showStrength ? `${inputId}-strength` : undefined;
    const describedBy =
      [errorId, helperId, strengthId].filter(Boolean).join(' ') || undefined;

    const [visible, setVisible] = useState(false);
    const isControlled = controlledValue !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<string>(() => {
      if (defaultValue == null) return '';
      return String(defaultValue);
    });
    const currentValue = isControlled
      ? String(controlledValue ?? '')
      : uncontrolledValue;

    const strength: StrengthLevel = useMemo(
      () => (showStrength ? calculateStrength(currentValue) : 0),
      [currentValue, showStrength],
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setUncontrolledValue(event.target.value);
      onChange?.(event);
    };

    const toggleVisible = () => setVisible((v) => !v);

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
        <div className={cn(styles.inputWrap, error && styles.inputWrapError)}>
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={visible ? 'text' : 'password'}
            required={required}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={styles.input}
            {...(isControlled ? { value: controlledValue } : { defaultValue })}
            onChange={handleChange}
            {...rest}
          />
          <button
            type="button"
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            tabIndex={disabled ? -1 : 0}
            disabled={disabled}
            className={styles.toggleButton}
            onClick={toggleVisible}
          >
            {visible ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </button>
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
        {showStrength ? (
          <div id={strengthId} className={styles.strength}>
            <div
              role="meter"
              aria-label="Password strength"
              aria-valuemin={0}
              aria-valuemax={4}
              aria-valuenow={strength}
              className={cn(styles.strengthBar, STRENGTH_CLASS[strength])}
            >
              <span className={styles.strengthSegment} data-filled={strength >= 1 || undefined} />
              <span className={styles.strengthSegment} data-filled={strength >= 2 || undefined} />
              <span className={styles.strengthSegment} data-filled={strength >= 3 || undefined} />
              <span className={styles.strengthSegment} data-filled={strength >= 4 || undefined} />
            </div>
            {/*
              `aria-live` is scoped to just the label span (NOT the whole
              strength container) to avoid double-announcement: the
              `aria-describedby` on the input already reads the container
              on focus, and a `role="meter"` + `aria-valuenow` change is
              already tracked by AT natively. Keeping the live region on
              only the text label gives a single polite "Weak → Fair"
              progression announcement as the user types.
            */}
            <span className={styles.strengthLabel} aria-live="polite">
              {strength > 0 ? STRENGTH_LABELS[strength] : ''}
            </span>
          </div>
        ) : null}
      </div>
    );
  },
);
