'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/components/utils/cn';
import styles from './RadioGroup.module.scss';

/**
 * RadioGroup — radio button group with shared name + value (Phase 4 I5).
 *
 * @layer   atom (interactive)
 * @tokens  --color-brand, --color-surface, --color-surface-raised,
 *          --color-border, --color-text-primary, --color-text-secondary,
 *          --focus-ring, --radius-md, --space-{2..4}, --duration-fast
 * @deps    cn, RadioGroupContext (internal)
 * @a11y    Renders `role="radiogroup"` wrapper + native
 *          `<input type="radio">` per item (visually hidden). Native
 *          radios already give arrow-key navigation via the browser,
 *          plus form submission for free. Each item is wrapped in a
 *          `<label>` so the entire row is clickable. Required +
 *          aria-labelledby supported.
 * @notes   Client Component (`'use client'`) for controlled/uncontrolled
 *          state via `value` || `defaultValue`. Uses an internal context
 *          to share `name` and active value with RadioGroupItem children
 *          — flat shadcn pattern (D24), NOT compound (`RadioGroup.Item`).
 *          Animation: dot scale-in via `radioFill` keyframe.
 *
 * @example
 * <RadioGroup name="plan" defaultValue="pro">
 *   <RadioGroupItem value="free" title="Free" description="Basic features" />
 *   <RadioGroupItem value="pro" title="Pro" description="$10/mo" />
 *   <RadioGroupItem value="team" title="Team" description="$25/user/mo" />
 * </RadioGroup>
 */

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  setValue: (value: string) => void;
  disabled: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function useRadioGroupContext(): RadioGroupContextValue {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) {
    throw new Error('RadioGroupItem must be rendered inside a <RadioGroup>');
  }
  return ctx;
}

export interface RadioGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Form field name shared across items. */
  name: string;
  /** Controlled value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Change callback. Fires for both controlled and uncontrolled mode. */
  onValueChange?: (value: string) => void;
  /** Disables all items. */
  disabled?: boolean;
  children: ReactNode;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(
    {
      name,
      value: controlledValue,
      defaultValue,
      onValueChange,
      disabled = false,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const [uncontrolledValue, setUncontrolledValue] = useState<
      string | undefined
    >(defaultValue);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const setValue = useCallback(
      (next: string) => {
        if (!isControlled) setUncontrolledValue(next);
        onValueChange?.(next);
      },
      [isControlled, onValueChange],
    );

    return (
      <RadioGroupContext.Provider value={{ name, value, setValue, disabled }}>
        <div
          ref={ref}
          role="radiogroup"
          className={cn(styles.root, className)}
          {...rest}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);

/**
 * RadioGroupItem — individual radio option (renders inside RadioGroup).
 *
 * @layer   atom (interactive)
 * @tokens  --color-brand, --color-surface, --color-surface-raised,
 *          --color-border, --color-border-strong, --color-text-primary,
 *          --color-text-secondary, --focus-ring, --radius-md, --space-{1..6}
 * @deps    cn, useRadioGroupContext (internal)
 * @a11y    Native `<input type="radio">` (visually hidden via sr-only mixin)
 *          wrapped in a `<label htmlFor>` so the entire card is clickable.
 *          Arrow-key roving navigation between items comes for free from
 *          the native radio group browser behavior. Each item's id is
 *          auto-generated and unique within the group. The forwarded ref
 *          targets the underlying `<input>` (form-ref convention) — not
 *          the outer `<label>` — because consumers typically need to call
 *          `.focus()` or `.checked` on the actual form element.
 * @notes   Must be rendered inside a `<RadioGroup>` — `useRadioGroupContext`
 *          throws otherwise. Reads `name` and active value from context;
 *          you do NOT pass `name` per item. Animation: `radioFill` keyframe
 *          (E03 _animations.scss) scale-in for the dot when selected;
 *          reduced-motion preserves the visible filled state without
 *          animation via opacity 1 + scale 1 fallback.
 *
 * @example
 * <RadioGroup name="plan" defaultValue="pro">
 *   <RadioGroupItem value="free" title="Free" description="Basic" />
 *   <RadioGroupItem value="pro" title="Pro" description="$10/mo" />
 * </RadioGroup>
 */
export interface RadioGroupItemProps
  extends Omit<HTMLAttributes<HTMLLabelElement>, 'title'> {
  /** Item value (matches RadioGroup `value` / `defaultValue`). */
  value: string;
  /** Visible title. */
  title: string;
  /** Optional secondary description. */
  description?: string;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Disable just this item (in addition to group disabled). */
  disabled?: boolean;
}

export const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  function RadioGroupItem(
    { value, title, description, icon, disabled: itemDisabled = false, className, ...rest },
    ref,
  ) {
    const { name, value: groupValue, setValue, disabled: groupDisabled } =
      useRadioGroupContext();
    const generatedId = useId();
    const inputId = `${name}-${value}-${generatedId}`;
    const checked = groupValue === value;
    const disabled = groupDisabled || itemDisabled;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          styles.item,
          checked && styles.itemChecked,
          disabled && styles.itemDisabled,
          className,
        )}
        data-state={checked ? 'checked' : 'unchecked'}
        data-disabled={disabled || undefined}
        {...rest}
      >
        <input
          ref={ref}
          id={inputId}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={() => setValue(value)}
          className={styles.input}
        />
        <span aria-hidden="true" className={styles.indicator}>
          <span className={styles.dot} />
        </span>
        {icon ? (
          <span aria-hidden="true" className={styles.itemIcon}>
            {icon}
          </span>
        ) : null}
        <span className={styles.itemText}>
          <span className={styles.itemTitle}>{title}</span>
          {description ? (
            <span className={styles.itemDescription}>{description}</span>
          ) : null}
        </span>
      </label>
    );
  },
);
