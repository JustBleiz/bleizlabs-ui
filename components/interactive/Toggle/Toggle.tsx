'use client';

import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './Toggle.module.scss';

/**
 * Toggle — single button with on/off state (Phase 4 I6).
 *
 * @layer   atom (interactive)
 * @tokens  --color-brand, --color-surface, --color-surface-raised,
 *          --color-border, --color-text-primary, --color-text-secondary,
 *          --focus-ring, --radius-input, --space-{2..4}, --duration-fast
 * @deps    cn, React: `forwardRef`, `useState`, type imports
 *          `ButtonHTMLAttributes<HTMLButtonElement>`, `ReactNode`
 * @a11y    Native `<button type="button" aria-pressed="...">` — provides
 *          press semantics for assistive tech and keyboard Space/Enter
 *          activation for free.
 * @notes   Client Component (`'use client'`) for controlled (`pressed`)
 *          + uncontrolled (`defaultPressed`) state. ToggleGroup (I7)
 *          composes Toggle internally with shared joined-group mixin —
 *          but a standalone Toggle works on its own without a group.
 *
 * @example
 * <Toggle defaultPressed>Bold</Toggle>
 *
 * <Toggle
 *   pressed={isBold}
 *   onPressedChange={setIsBold}
 *   icon={<BoldIcon />}
 *   aria-label="Bold"
 * />
 */
export type ToggleSize = 'sm' | 'md' | 'lg';

export interface ToggleProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'value' | 'defaultValue' | 'onChange'
  > {
  /** Controlled pressed state. */
  pressed?: boolean;
  /** Uncontrolled initial pressed state. */
  defaultPressed?: boolean;
  /** Pressed change callback. */
  onPressedChange?: (pressed: boolean) => void;
  /** Size scale. Default `md`. */
  size?: ToggleSize;
  /** Optional leading icon. */
  icon?: ReactNode;
  /**
   * Identifier for ToggleGroup composition (read by ToggleGroup to manage
   * single/multiple selection). Standalone Toggle ignores this prop.
   */
  value?: string;
  /** Toggle button label content. */
  children?: ReactNode;
}

const SIZE_CLASS: Record<ToggleSize, string> = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
};

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    pressed: controlledPressed,
    defaultPressed = false,
    onPressedChange,
    size = 'md',
    icon,
    // `value` is consumed by ToggleGroup; standalone Toggle ignores it
    // but we must destructure it so it doesn't land on the DOM <button>.
    value: _value,
    disabled,
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  void _value;
  const [uncontrolledPressed, setUncontrolledPressed] = useState(defaultPressed);
  const isControlled = controlledPressed !== undefined;
  const pressed = isControlled ? controlledPressed : uncontrolledPressed;

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={pressed}
      data-state={pressed ? 'on' : 'off'}
      disabled={disabled}
      className={cn(
        styles.root,
        SIZE_CLASS[size],
        pressed && styles.pressed,
        className,
      )}
      onClick={(event) => {
        const next = !pressed;
        if (!isControlled) setUncontrolledPressed(next);
        onPressedChange?.(next);
        onClick?.(event);
      }}
      {...rest}
    >
      {icon ? (
        <span aria-hidden="true" className={styles.icon}>
          {icon}
        </span>
      ) : null}
      {children ? <span className={styles.label}>{children}</span> : null}
    </button>
  );
});
