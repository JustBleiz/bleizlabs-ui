'use client';

import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import styles from './Switch.module.scss';

/**
 * Switch — boolean toggle with animated thumb (Phase 4 I8, Tier A).
 *
 * @layer   atom (interactive)
 * @tokens  --color-brand, --color-surface, --color-surface-raised,
 *          --color-border, --color-text-primary, --color-text-muted,
 *          --color-error-strong, --focus-ring, --shadow-sm, --duration-fast,
 *          --switch-track-w, --switch-track-h, --switch-thumb-size,
 *          --switch-thumb-offset
 * @deps    cn, React: `forwardRef`, `useId`, `useState`, type import
 *          `InputHTMLAttributes<HTMLInputElement>`
 * @a11y    Native `<input type="checkbox" role="switch">` (visually hidden)
 *          wrapped in a `<label>` so the entire control is clickable.
 *          Keyboard Space toggles via native semantics. Visible track +
 *          thumb are decorative (`aria-hidden`); the accessible name comes
 *          from the `label` prop.
 *
 *          v0.3.0 F_B5: error + helperText plumbing mirrors Input/Textarea.
 *          When `error` is set the input receives `aria-invalid="true"` and
 *          `aria-describedby` points to the error message. When `required`
 *          is set, the input also receives `aria-required="true"` for
 *          SR redundancy (some AT/browser pairs don't announce the HTML
 *          `required` attribute for checkboxes/switches).
 * @notes   Client Component (`'use client'`) for controlled (`checked`) +
 *          uncontrolled (`defaultChecked`) state. The `switchSlide`
 *          keyframe (E03 _animations.scss) animates the thumb across the
 *          track; reduced-motion mode disables the animation but keeps
 *          the final position via the `data-state` attribute selector.
 *
 * @example
 * <Switch label="Notifications" name="notifications" defaultChecked />
 *
 * <Switch
 *   label="Dark mode"
 *   name="darkMode"
 *   checked={isDark}
 *   onCheckedChange={setIsDark}
 * />
 *
 * <Switch
 *   label="Accept marketing"
 *   name="marketing"
 *   required
 *   error="Required to finalize signup"
 * />
 */
export type SwitchSize = 'sm' | 'md';

export interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'onChange'
> {
  /** Accessible label (rendered visually + as the input label). */
  label: string;
  /** Form field name. */
  name: string;
  /** Hide the visible label (still in a11y tree). */
  hideLabel?: boolean;
  /** Controlled state. */
  checked?: boolean;
  /** Uncontrolled initial state. */
  defaultChecked?: boolean;
  /** Change callback. */
  onCheckedChange?: (checked: boolean) => void;
  /** Size scale. Default `md`. */
  size?: SwitchSize;
  /** Error message — renders below switch + sets `aria-invalid="true"`. */
  error?: string;
  /** Helper text — renders below switch when no error is set. */
  helperText?: string;
}

const SIZE_CLASS: Record<SwitchSize, string> = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    label,
    name,
    hideLabel = false,
    checked: controlledChecked,
    defaultChecked = false,
    onCheckedChange,
    size = 'md',
    disabled,
    required,
    error,
    helperText,
    id,
    className,
    'aria-describedby': ariaDescribedByProp,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? `${name}-${generatedId}`;
  const descId = error || helperText ? `${inputId}-desc` : undefined;
  const describedBy = [ariaDescribedByProp, descId].filter(Boolean).join(' ') || undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : uncontrolledChecked;

  return (
    <span className={cn(styles.field, className)}>
      <label
        htmlFor={inputId}
        className={cn(styles.root, SIZE_CLASS[size], disabled && styles.disabled)}
        data-state={checked ? 'on' : 'off'}
      >
        <input
          ref={ref}
          id={inputId}
          name={name}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          required={required}
          aria-required={required ? true : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={styles.input}
          onChange={(event) => {
            const next = event.target.checked;
            if (!isControlled) setUncontrolledChecked(next);
            onCheckedChange?.(next);
          }}
          {...rest}
        />
        <span aria-hidden="true" className={styles.track}>
          <span className={styles.thumb} />
        </span>
        {!hideLabel ? <span className={styles.label}>{label}</span> : null}
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
});
