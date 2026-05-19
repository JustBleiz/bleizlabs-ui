'use client';

import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { Label } from '../Label';
import styles from './Textarea.module.scss';

/**
 * Textarea — multi-line text form input (Phase 4 I3).
 *
 * @layer   atom (interactive)
 * @tokens  --input-bg, --input-border, --input-border-focus, --color-error,
 *          --color-text-primary, --color-text-muted, --focus-ring,
 *          --focus-ring-error (both consumed via `@include mx.focus-ring*`),
 *          --radius-input, --space-{2..4}, --font-secondary,
 *          --font-size-{xs,base}, --font-weight-medium, --line-height-normal,
 *          --duration-fast, --easing-default
 * @deps    Label atom, cn, React: `forwardRef`, `useId`, type import
 *          `TextareaHTMLAttributes<HTMLTextAreaElement>`
 * @a11y    Native `<textarea>` with `id` ↔ `htmlFor` association via Label.
 *          `aria-invalid` set when `error` is provided. `aria-describedby`
 *          links the error message and helper text. Auto-generated `id`
 *          via `useId` when consumer doesn't pass one.
 * @notes   Client Component (`'use client'`) for controlled/uncontrolled
 *          state via React standard `value` || `defaultValue`. Split from
 *          Input as a separate component per D24 (shadcn flat pattern) —
 *          NOT a polymorphic Input variant.
 *
 * @example
 * <Textarea label="Bio" name="bio" rows={5} />
 *
 * <Textarea
 *   label="Comments"
 *   name="comments"
 *   value={text}
 *   onChange={(e) => setText(e.target.value)}
 *   error={errors.comments}
 *   resize="vertical"
 * />
 */
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'cols'> {
  /** Visible label text. */
  label: string;
  /** Form field name. */
  name: string;
  /** Visible row count. Default `4`. */
  rows?: number;
  /** Resize handle behavior. Default `vertical`. */
  resize?: TextareaResize;
  /** Error message — renders below + sets `aria-invalid`. */
  error?: string;
  /** Helper text — renders below when no error. */
  helperText?: string;
  /** Hide visible label (still in a11y tree). Default `false`. */
  hideLabel?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    name,
    rows = 4,
    resize = 'vertical',
    error,
    helperText,
    hideLabel = false,
    required,
    disabled,
    id,
    className,
    style,
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
      <div className={cn(styles.wrap, error && styles.wrapError)}>
        <textarea
          ref={ref}
          id={inputId}
          name={name}
          rows={rows}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={styles.textarea}
          style={{ ...style, resize }}
          {...rest}
        />
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
