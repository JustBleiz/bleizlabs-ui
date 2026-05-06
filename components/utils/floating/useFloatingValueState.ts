'use client';

/**
 * useFloatingValueState — controlled/uncontrolled value state hybrid for
 * floating components whose state is `T | null` (not boolean).
 *
 * Sibling of `useFloatingState` (boolean open/close) extracted at E29 once
 * 4 consumers accumulated the same inline pattern: NavigationMenu (E25,
 * which submenu is open — `string | null`), Tabs (E26, active tab —
 * `string | null`), Select (E27, selected value — `string | null`), and
 * Combobox (E28, committed value — `string | null`). Rule of Three strict
 * pass with 4 independent consumers.
 *
 * Includes the `latestValueRef` pattern that NavigationMenu (E25) + Select
 * (E27 iter 1 fix CRIT-4) proved is needed: without it, consumers recreate
 * their `setValue` callback on every value change, churning their context
 * memo and forcing all children to re-run their `useLayoutEffect`
 * registrations between every selection. The ref is updated in a
 * `useLayoutEffect` (not during render) to stay React 19 compliant.
 *
 * `setValue` is guarded by an identity check against `valueRef.current` so
 * consumers can call it freely without worrying about feedback loops — it
 * no-ops when the new value equals the current value, and `onValueChange`
 * fires only on real transitions. This matches the NavigationMenu /
 * Select / Combobox precedent exactly.
 *
 * **setValue accepts `T | null`** — allowing both commit (`setValue(v)`) AND
 * clear (`setValue(null)`) paths. `onValueChange` receives `T | null` so
 * consumers can observe both directions. Consumers whose public API narrows
 * `onValueChange` to `T` only (e.g. Select's shipped `(value: string) => void`
 * contract) wrap the hook's callback at the boundary to filter nulls or
 * coerce to empty string. This design supports all 4 shipped consumer
 * shapes: NavigationMenu fires null to close submenu, Combobox fires null
 * on clear button, Tabs never fires null (always has active tab), Select
 * filters null at the public boundary.
 *
 * @layer utils / floating primitives (E29 extraction)
 * @deps react only
 * @example
 *   // Direct consumer (NavigationMenu, Combobox — fire null transitions):
 *   const { value, setValue, valueRef } = useFloatingValueState<string>({
 *     controlledValue: value,
 *     defaultValue: defaultValue ?? null,
 *     onValueChange, // receives T | null
 *   });
 *
 *   // Filtering consumer (Select — public API is T-only):
 *   const { value, setValue, valueRef } = useFloatingValueState<string>({
 *     controlledValue: value,
 *     defaultValue: defaultValue ?? null,
 *     onValueChange: (next) => { if (next !== null) publicOnValueChange?.(next); },
 *   });
 */

import { useCallback, useLayoutEffect, useRef, useState, type MutableRefObject } from 'react';

export interface FloatingValueStateConfig<T> {
  /** Controlled value. When provided, component is controlled. Pass `null` for "no selection". */
  controlledValue: T | null | undefined;
  /** Uncontrolled initial value. Ignored when controlled. Default `null`. */
  defaultValue?: T | null;
  /**
   * Fires on every committed value transition (including clear to `null`).
   * Consumers whose public API narrows to `T` only should wrap this
   * callback to filter nulls at the boundary — see JSDoc example above.
   */
  onValueChange?: (value: T | null) => void;
}

export interface FloatingValueStateResult<T> {
  /** Current value — reflects controlled prop when controlled, internal state otherwise. */
  value: T | null;
  /**
   * Commit a new value OR clear via `null`. Guarded by identity check —
   * no-op when `next === valueRef.current`. Fires `onValueChange(next)` on
   * real transitions. Identity is stable across value changes thanks to
   * `latestValueRef`.
   */
  setValue: (next: T | null) => void;
  /**
   * Latest value ref — synced via `useLayoutEffect` (not during render).
   * Exposed for consumers who need stable-identity callbacks that read the
   * current value (e.g. context providers memoized on stable deps, keyboard
   * handlers that access value outside render).
   */
  valueRef: MutableRefObject<T | null>;
  /** True when `controlledValue` was provided. Consumers rarely need this. */
  isControlled: boolean;
}

export function useFloatingValueState<T>(
  config: FloatingValueStateConfig<T>,
): FloatingValueStateResult<T> {
  const { controlledValue, defaultValue = null, onValueChange } = config;

  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<T | null>(defaultValue);
  const value = isControlled ? controlledValue : uncontrolledValue;

  // latestValueRef pattern (NavigationMenu E25 + Select E27 iter 1 fix CRIT-4).
  // Updated in a layout effect so the ref mirrors state after commit but is
  // never mutated during render (React 19 react-hooks/refs compliance).
  const valueRef = useRef<T | null>(value);
  useLayoutEffect(() => {
    valueRef.current = value;
  });

  const setValue = useCallback(
    (next: T | null) => {
      // Identity-guard against feedback loops (next === current no-ops).
      if (next === valueRef.current) return;
      if (!isControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  return { value, setValue, valueRef, isControlled };
}
