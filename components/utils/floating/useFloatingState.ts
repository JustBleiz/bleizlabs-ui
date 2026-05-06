'use client';

/**
 * useFloatingState — controlled/uncontrolled open state hybrid.
 *
 * Replaces the repeated pattern of `open` / `defaultOpen` / `onOpenChange`
 * triple in floating components. Single source of truth for the "is
 * controlled?" detection + setOpen callback that fires `onOpenChange`.
 *
 * Consumers that need extra state (e.g. DropdownMenu `openReason`,
 * ContextMenu `cursorPoint`) layer it on top by wrapping the returned
 * `setOpen` in their own callback.
 *
 * @layer utils / floating primitives (E23)
 * @deps react only
 * @example
 *   const { open, setOpen } = useFloatingState({
 *     controlledOpen: controlled,
 *     defaultOpen: false,
 *     onOpenChange,
 *   });
 */

import { useCallback, useState } from 'react';

export interface FloatingStateConfig {
  /** Controlled open state. When provided, component is controlled. */
  controlledOpen: boolean | undefined;
  /** Uncontrolled initial open state. Ignored when controlled. */
  defaultOpen?: boolean;
  /** Fires on every open transition. */
  onOpenChange?: (open: boolean) => void;
}

export interface FloatingStateResult {
  open: boolean;
  setOpen: (next: boolean) => void;
  /** True when `controlledOpen` was provided. Consumers rarely need this. */
  isControlled: boolean;
}

export function useFloatingState(config: FloatingStateConfig): FloatingStateResult {
  const { controlledOpen, defaultOpen = false, onOpenChange } = config;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (next === open) return;
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [open, isControlled, onOpenChange],
  );

  return { open, setOpen, isControlled };
}
