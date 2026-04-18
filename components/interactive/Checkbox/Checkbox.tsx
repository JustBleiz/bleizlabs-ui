'use client';

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './Checkbox.module.scss';

/**
 * Checkbox — boolean form input with custom styling (Phase 4 I4).
 *
 * @layer   atom (interactive)
 * @tokens  --color-brand, --hover-brand, --color-surface, --color-border,
 *          --color-text-primary, --color-text-muted, --color-error-strong,
 *          --focus-ring, --radius-sm, --space-{2,3}, --duration-fast
 * @deps    cn, React: `forwardRef`, `useId`, type imports
 *          `InputHTMLAttributes<HTMLInputElement>`, `ReactNode`
 * @a11y    Native `<input type="checkbox">` (visually hidden) wrapped in a
 *          `<label>` so the entire control area is clickable. Keyboard
 *          Space toggles via native semantics. The visible checkbox box
 *          is purely decorative (`aria-hidden`); a11y reads from the
 *          native input. Auto-generated id via `useId`.
 *
 *          v0.3.0 F_B5: error + helperText plumbing mirrors Input/Textarea.
 *          When `error` is set the input receives `aria-invalid="true"`
 *          plus an `aria-describedby` pointing to the error message.
 *          When `required` or the native `required` HTML attribute is
 *          present, the input also receives `aria-required="true"` so
 *          SR readers double-announce (HTML `required` alone is
 *          insufficient for some AT/browser combos per WAI-ARIA best
 *          practice).
 * @notes   Client Component (`'use client'`) for controlled/uncontrolled
 *          state via `checked` || `defaultChecked`. Animation: checkmark
 *          scale-in via `checkmark` keyframe (E03 _animations.scss).
 *          Indeterminate state intentionally omitted — Phase 5+ if needed.
 *
 * @example
 * <Checkbox name="terms" required>I accept the terms</Checkbox>
 *
 * <Checkbox
 *   name="newsletter"
 *   checked={subscribed}
 *   onChange={(e) => setSubscribed(e.target.checked)}
 * >
 *   Send me updates
 * </Checkbox>
 *
 * <Checkbox name="terms" required error="Must accept to continue">
 *   I accept the terms
 * </Checkbox>
 */
export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Form field name. */
  name: string;
  /** Label content (clickable via wrapping `<label>`). */
  children: ReactNode;
  /** Error message — renders below input + sets `aria-invalid="true"`. */
  error?: string;
  /** Helper text — renders below input when no error is set. */
  helperText?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      name,
      children,
      id,
      className,
      disabled,
      error,
      helperText,
      required,
      'aria-describedby': ariaDescribedByProp,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? `${name}-${generatedId}`;
    const descId = error || helperText ? `${inputId}-desc` : undefined;
    const describedBy =
      [ariaDescribedByProp, descId].filter(Boolean).join(' ') || undefined;
    return (
      <span className={cn(styles.field, className)}>
        <label
          htmlFor={inputId}
          className={cn(styles.root, disabled && styles.disabled)}
          data-disabled={disabled || undefined}
        >
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="checkbox"
            disabled={disabled}
            required={required}
            aria-required={required ? true : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={styles.input}
            {...rest}
          />
          <span aria-hidden="true" className={styles.box}>
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.check}
            >
              <path d="M3 8.5L6.5 12L13 4.5" />
            </svg>
          </span>
          <span className={styles.label}>{children}</span>
        </label>
        {error ? (
          <span id={descId} className={cn(styles.helper, styles.error)} role="alert">
            {error}
          </span>
        ) : helperText ? (
          <span id={descId} className={styles.helper}>
            {helperText}
          </span>
        ) : null}
      </span>
    );
  },
);
