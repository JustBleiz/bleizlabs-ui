'use client';

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '@/components/utils/cn';
import { type ToggleProps } from '@/components/interactive/Toggle';
import styles from './ToggleGroup.module.scss';

/**
 * ToggleGroup — group of Toggle children with single or multiple selection
 * (Phase 4 I7).
 *
 * @layer   atom (interactive)
 * @tokens  none of its own — children (Toggle) supply their own styles;
 *          the `joined-group` SCSS mixin (also used by ButtonGroup) handles
 *          the visual joining: collapsed inner radii + deduped 1px borders.
 * @deps    Toggle, cn, joined-group SCSS mixin
 * @a11y    Renders `role="group"` with required `aria-label`. Children are
 *          native `<button aria-pressed>` toggles — keyboard Tab/Space and
 *          assistive-tech press semantics work via Toggle's own a11y.
 *          Arrow-key roving focus is intentionally NOT implemented in
 *          Phase 4 (deferred to Phase 10 a11y pass).
 * @notes   Client Component (`'use client'`) for controlled/uncontrolled
 *          state. `type="single"` selects one child at a time (string
 *          value); `type="multiple"` allows any subset (string[] value).
 *          Children must be Toggle elements with a `value` prop attached
 *          (we read it via `props.value` and pass back the controlled
 *          pressed state). Reuses the `joined-group` mixin from
 *          ButtonGroup (I1.5) — the visual joining behavior is identical.
 *
 * @example
 * <ToggleGroup type="single" defaultValue="left" aria-label="Text align">
 *   <Toggle value="left">Left</Toggle>
 *   <Toggle value="center">Center</Toggle>
 *   <Toggle value="right">Right</Toggle>
 * </ToggleGroup>
 *
 * <ToggleGroup type="multiple" defaultValue={['bold']} aria-label="Format">
 *   <Toggle value="bold">B</Toggle>
 *   <Toggle value="italic">I</Toggle>
 * </ToggleGroup>
 */
export type ToggleGroupOrientation = 'horizontal' | 'vertical';

interface ToggleGroupBaseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'defaultValue' | 'onChange'> {
  orientation?: ToggleGroupOrientation;
  attached?: boolean;
  disabled?: boolean;
  'aria-label': string;
  children: ReactNode;
}

interface ToggleGroupSingleProps extends ToggleGroupBaseProps {
  type: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface ToggleGroupMultipleProps extends ToggleGroupBaseProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

type ToggleChild = ReactElement<ToggleProps & { value?: string }>;

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup(props, ref) {
    const {
      type,
      orientation = 'horizontal',
      attached = true,
      disabled: groupDisabled = false,
      className,
      children,
      ...rest
    } = props;

    const [singleState, setSingleState] = useState<string | undefined>(
      type === 'single' ? props.defaultValue : undefined,
    );
    const [multipleState, setMultipleState] = useState<string[]>(
      type === 'multiple' ? props.defaultValue ?? [] : [],
    );

    const isControlled =
      (type === 'single' && props.value !== undefined) ||
      (type === 'multiple' && props.value !== undefined);

    const currentSingle =
      type === 'single' && props.value !== undefined ? props.value : singleState;
    const currentMultiple =
      type === 'multiple' && props.value !== undefined
        ? props.value
        : multipleState;

    const handleToggle = useCallback(
      (value: string) => {
        if (type === 'single') {
          const next = currentSingle === value ? '' : value;
          if (!isControlled) setSingleState(next || undefined);
          (props.onValueChange as ((v: string) => void) | undefined)?.(next);
        } else {
          const next = currentMultiple.includes(value)
            ? currentMultiple.filter((v) => v !== value)
            : [...currentMultiple, value];
          if (!isControlled) setMultipleState(next);
          (props.onValueChange as ((v: string[]) => void) | undefined)?.(next);
        }
      },
      [type, currentSingle, currentMultiple, isControlled, props],
    );

    const isPressed = (value: string): boolean =>
      type === 'single' ? currentSingle === value : currentMultiple.includes(value);

    const cloned = Children.map(children, (child) => {
      if (!isValidElement(child)) return child;
      const toggleChild = child as ToggleChild;
      const childValue = toggleChild.props.value;
      if (typeof childValue !== 'string') return child;
      return cloneElement(toggleChild, {
        pressed: isPressed(childValue),
        onPressedChange: () => handleToggle(childValue),
        disabled: toggleChild.props.disabled || groupDisabled,
      });
    });

    return (
      <div
        ref={ref}
        role="group"
        data-orientation={orientation}
        className={cn(
          styles.root,
          orientation === 'vertical' && styles.vertical,
          attached && styles.attached,
          !attached && styles.detached,
          className,
        )}
        {...rest}
      >
        {cloned}
      </div>
    );
  },
);
