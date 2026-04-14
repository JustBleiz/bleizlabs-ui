'use client';

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/components/utils/cn';
import { Label } from '@/components/interactive/Label';
import styles from './Input.module.scss';

/**
 * Input — single-line text form input (Phase 4 I2).
 *
 * @layer   atom (interactive)
 * @tokens  --input-bg, --input-border, --input-border-focus, --color-error,
 *          --color-text-primary, --color-text-muted, --focus-ring,
 *          --focus-ring-error, --radius-input, --space-{2..4},
 *          --font-secondary, --font-size-base
 * @deps    Label, cn
 * @a11y    Native `<input>` with `id` ↔ `htmlFor` association via Label.
 *          `aria-invalid` set when `error` is provided. `aria-describedby`
 *          links the error message and helper text. Auto-generated `id`
 *          (via `useId`) when consumer doesn't pass one — covers the
 *          common label coupling case without manual id juggling.
 * @notes   Client Component (`'use client'`) — handles controlled vs
 *          uncontrolled state by accepting both `value` and `defaultValue`.
 *          Per React standard, controlled wins when both are provided.
 *          For text-only display without form semantics, use `Text`
 *          instead.
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
 * <Input
 *   label="Search"
 *   name="q"
 *   defaultValue=""
 *   helperText="Press Enter to search"
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
  /** Optional leading icon inside the input. */
  startIcon?: ReactNode;
  /** Optional trailing icon inside the input. */
  endIcon?: ReactNode;
  /** Hide visible label (still rendered for screen readers). Default `false`. */
  hideLabel?: boolean;
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
    hideLabel = false,
    required,
    disabled,
    id,
    className,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? `${name}-${generatedId}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText && !error ? `${inputId}-helper` : undefined;
  const describedBy = errorId ?? helperId;

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
          Boolean(startIcon) && styles.hasStart,
          Boolean(endIcon) && styles.hasEnd,
        )}
      >
        {startIcon ? (
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
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={styles.input}
          {...rest}
        />
        {endIcon ? (
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
    </div>
  );
});
