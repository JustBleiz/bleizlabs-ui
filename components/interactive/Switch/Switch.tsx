'use client';

import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './Switch.module.scss';

/**
 * Switch — boolean toggle with animated thumb (Phase 4 I8, Tier A).
 *
 * @layer   atom (interactive)
 * @tokens  --color-brand, --color-surface, --color-surface-raised,
 *          --color-border, --color-text-primary, --color-text-muted,
 *          --focus-ring, --shadow-sm, --duration-fast
 * @deps    cn, React: `forwardRef`, `useId`, `useState`, type import
 *          `InputHTMLAttributes<HTMLInputElement>`
 * @a11y    Native `<input type="checkbox" role="switch">` (visually hidden)
 *          wrapped in a `<label>` so the entire control is clickable.
 *          Keyboard Space toggles via native semantics. Visible track +
 *          thumb are decorative (`aria-hidden`); the accessible name comes
 *          from the `label` prop.
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
 */
export type SwitchSize = 'sm' | 'md';

export interface SwitchProps
  extends Omit<
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
    id,
    className,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? `${name}-${generatedId}`;
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : uncontrolledChecked;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        styles.root,
        SIZE_CLASS[size],
        disabled && styles.disabled,
        className,
      )}
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
  );
});
