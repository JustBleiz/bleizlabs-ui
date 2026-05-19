'use client';

import * as React from 'react';
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
import { cn } from '../../utils/cn';
import { type ToggleProps } from '../Toggle';
import styles from './ToggleGroup.module.scss';

/**
 * ToggleGroup — group of Toggle children with single or multiple selection
 * (Phase 4 I7).
 *
 * @layer   atom (interactive)
 * @tokens  none of its own — children (Toggle) supply their own styles;
 *          the `joined-group` SCSS mixin (also used by ButtonGroup) handles
 *          the visual joining: collapsed inner radii + deduped 1px borders.
 * @deps    Toggle atom (ToggleProps type only), cn, `joined-group` SCSS mixin,
 *          React: `Children`, `cloneElement`, `forwardRef`, `isValidElement`,
 *          `useCallback`, `useState`, type imports
 *          `HTMLAttributes<HTMLDivElement>`, `ReactElement`, `ReactNode`
 * @a11y    Renders `role="group"` with required `aria-label`. Children are
 *          native `<button aria-pressed>` toggles — keyboard Tab/Space and
 *          assistive-tech press semantics work via Toggle's own a11y.
 *
 *          Missing arrow-key roving focus per APG toolbar pattern. Deferred
 *          to v0.4.0 — tracked in roadmap. Current behavior: each toggle is
 *          independently tabbable. Rationale: proper roving-focus requires
 *          composition refactor (focus manager + tabindex shuffling on
 *          Arrow/Home/End) + regression risk; shipping as a known
 *          limitation with docs is preferred over silent broken.
 * @notes   Client Component (`'use client'`) for controlled/uncontrolled
 *          state. `type="single"` selects one child at a time (string
 *          value); `type="multiple"` allows any subset (string[] value).
 *          The `type` discriminant is treated as STABLE — switching it at
 *          runtime is not supported (the underlying state shape differs
 *          and would require a remount). Children must be Toggle elements
 *          with a `value` prop attached (we read it via `props.value` and
 *          pass back the controlled pressed state). Reuses the
 *          `joined-group` mixin from ButtonGroup (I1.5) — the visual
 *          joining behavior is identical.
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

interface ToggleGroupBaseProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'role' | 'defaultValue' | 'onChange'
> {
  /** Layout direction of the group. Default `horizontal`. */
  orientation?: ToggleGroupOrientation;
  /** Collapse inner radii + dedupe borders via `joined-group`. Default `true`. */
  attached?: boolean;
  /** Disable every child Toggle (merges with each child's own `disabled`). */
  disabled?: boolean;
  /** Required accessible name for `role="group"`. */
  'aria-label': string;
  /** Toggle elements with a `value` prop attached. Non-Toggle children pass through unchanged. */
  children: ReactNode;
}

interface ToggleGroupSingleProps extends ToggleGroupBaseProps {
  /** Discriminant — single-selection mode (one Toggle pressed at a time). */
  type: 'single';
  /** Controlled active value. */
  value?: string;
  /** Uncontrolled initial active value. */
  defaultValue?: string;
  /** Fires whenever the active value changes (controlled or uncontrolled). */
  onValueChange?: (value: string) => void;
}

interface ToggleGroupMultipleProps extends ToggleGroupBaseProps {
  /** Discriminant — multiple-selection mode (any subset pressed). */
  type: 'multiple';
  /** Controlled active values. */
  value?: string[];
  /** Uncontrolled initial active values. */
  defaultValue?: string[];
  /** Fires whenever the active set changes (controlled or uncontrolled). */
  onValueChange?: (value: string[]) => void;
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

type ToggleChild = ReactElement<ToggleProps & { value?: string }>;

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup(props, ref) {
    return props.type === 'single' ? (
      <ToggleGroupSingle {...props} forwardedRef={ref} />
    ) : (
      <ToggleGroupMultiple {...props} forwardedRef={ref} />
    );
  },
);

// ============================================================================
// SINGLE-MODE IMPLEMENTATION — strict ToggleGroupSingleProps narrowing
// ============================================================================

interface SingleInternalProps extends ToggleGroupSingleProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
}

function ToggleGroupSingle({
  value: controlledValue,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  attached = true,
  disabled: groupDisabled = false,
  className,
  children,
  forwardedRef,
  type: _type,
  ...rest
}: SingleInternalProps) {
  void _type;
  const [internal, setInternal] = useState<string | undefined>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const active = isControlled ? controlledValue : internal;

  const handleToggle = useCallback(
    (next: string) => {
      const resolved = active === next ? '' : next;
      if (!isControlled) setInternal(resolved || undefined);
      onValueChange?.(resolved);
    },
    [active, isControlled, onValueChange],
  );

  return (
    <ToggleGroupShell
      ref={forwardedRef}
      orientation={orientation}
      attached={attached}
      className={className}
      rest={rest}
    >
      {projectChildren(children, (childValue) => ({
        pressed: active === childValue,
        onToggle: () => handleToggle(childValue),
        groupDisabled,
      }))}
    </ToggleGroupShell>
  );
}

// ============================================================================
// MULTIPLE-MODE IMPLEMENTATION — strict ToggleGroupMultipleProps narrowing
// ============================================================================

interface MultipleInternalProps extends ToggleGroupMultipleProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
}

function ToggleGroupMultiple({
  value: controlledValue,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  attached = true,
  disabled: groupDisabled = false,
  className,
  children,
  forwardedRef,
  type: _type,
  ...rest
}: MultipleInternalProps) {
  void _type;
  const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
  const isControlled = controlledValue !== undefined;
  const active = isControlled ? controlledValue : internal;

  const handleToggle = useCallback(
    (next: string) => {
      const resolved = active.includes(next) ? active.filter((v) => v !== next) : [...active, next];
      if (!isControlled) setInternal(resolved);
      onValueChange?.(resolved);
    },
    [active, isControlled, onValueChange],
  );

  return (
    <ToggleGroupShell
      ref={forwardedRef}
      orientation={orientation}
      attached={attached}
      className={className}
      rest={rest}
    >
      {projectChildren(children, (childValue) => ({
        pressed: active.includes(childValue),
        onToggle: () => handleToggle(childValue),
        groupDisabled,
      }))}
    </ToggleGroupShell>
  );
}

// ============================================================================
// SHARED LAYOUT SHELL
// ============================================================================

interface ShellProps {
  orientation: ToggleGroupOrientation;
  attached: boolean;
  className?: string;
  rest: HTMLAttributes<HTMLDivElement>;
  children: ReactNode;
}

const ToggleGroupShell = forwardRef<HTMLDivElement, ShellProps>(function ToggleGroupShell(
  { orientation, attached, className, rest, children },
  ref,
) {
  const isVertical = orientation === 'vertical';
  return (
    <div
      ref={ref}
      role="group"
      data-orientation={orientation}
      className={cn(
        styles.root,
        isVertical && styles.vertical,
        attached && (isVertical ? styles.attachedVertical : styles.attachedHorizontal),
        !attached && styles.detached,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

// ============================================================================
// CHILD PROJECTION — Children.map + cloneElement injection
// ============================================================================

interface ChildSlot {
  pressed: boolean;
  onToggle: () => void;
  groupDisabled: boolean;
}

function projectChildren(children: ReactNode, getSlot: (value: string) => ChildSlot): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const toggleChild = child as ToggleChild;
    const childValue = toggleChild.props.value;
    if (typeof childValue !== 'string') return child;
    const slot = getSlot(childValue);
    return cloneElement(toggleChild, {
      pressed: slot.pressed,
      onPressedChange: slot.onToggle,
      disabled: toggleChild.props.disabled || slot.groupDisabled,
    });
  });
}
