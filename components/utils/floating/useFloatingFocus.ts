'use client';

/**
 * useFloatingFocus — composable initial focus + restore for floating components.
 *
 * Handles two tightly-coupled concerns that every non-modal floating surface
 * needs identically:
 *   1. On open: capture `document.activeElement` as the restore target,
 *      then (after rAF) move focus to a consumer-provided target element
 *      inside the content container.
 *   2. On close: restore focus to the captured activeElement, or (when
 *      `getRestoreTarget` is provided) to a consumer-computed target such
 *      as a specific trigger button.
 *
 * The rAF deferral is critical — React needs to commit the portal content
 * to the DOM before we can query tabbables or `<button role="menuitem">`.
 * The `isConnected` guard on restore handles the "trigger unmounted while
 * menu was open" edge case (Radix #16).
 *
 * Does NOT trap focus — Tab moves freely out of the content. For modal
 * focus trapping use `useFocusTrap` from `../complex/Dialog/useFocusTrap`.
 *
 * Config is captured via ref so effect deps stay minimal (`[open]`).
 *
 * @layer utils / floating primitives (E23)
 * @deps react only
 * @example
 *   // Popover non-modal:
 *   useFloatingFocus({
 *     open: open && !modal,
 *     contentRef: popperRef,
 *     getFocusTarget: (container) =>
 *       initialFocusRef?.current ?? findFirstTabbable(container) ?? container,
 *   });
 *
 *   // DropdownMenu:
 *   useFloatingFocus({
 *     open,
 *     contentRef: popperRef,
 *     getFocusTarget: (container) => {
 *       const items = getMenuItems(container);
 *       return openReason === 'trigger-last'
 *         ? items[items.length - 1] ?? container
 *         : items[0] ?? container;
 *     },
 *     getRestoreTarget: () => triggerRef.current,
 *   });
 */

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

export interface FloatingFocusConfig {
  /** When false, the hook is a no-op. */
  open: boolean;
  /** Content container holding focusable children. */
  contentRef: RefObject<HTMLElement | null>;
  /**
   * Called (inside rAF) after open to locate the element that should
   * receive focus. If it returns `null`, the container itself receives
   * focus (container should have `tabIndex={-1}`).
   */
  getFocusTarget?: (container: HTMLElement) => HTMLElement | null;
  /**
   * Called on close to locate the element that should receive focus.
   * Defaults to the element that was active when `open` became `true`.
   * Return `null` to fall back to the captured previousActiveElement.
   */
  getRestoreTarget?: () => HTMLElement | null;
  /** When false, skips focus restoration entirely. Default `true`. */
  restoreOnClose?: boolean;
}

export function useFloatingFocus(config: FloatingFocusConfig): void {
  // Capture latest config in a ref via commit-time effect. React 19's
  // `react-hooks/refs` rule forbids mutating refs during render; the rAF
  // callbacks inside the main layout effect run async and always read the
  // most recent commit's config via `configRef.current`.
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  });

  const previousActiveRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!config.open) return;

    previousActiveRef.current = document.activeElement as HTMLElement | null;

    const frame = requestAnimationFrame(() => {
      const { contentRef, getFocusTarget } = configRef.current;
      const container = contentRef.current;
      if (!container) return;
      const target = getFocusTarget?.(container) ?? container;
      if (target && typeof target.focus === 'function') {
        target.focus();
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      const { getRestoreTarget, restoreOnClose = true } = configRef.current;
      if (!restoreOnClose) return;
      const explicitTarget = getRestoreTarget?.();
      const restore = explicitTarget ?? previousActiveRef.current;
      if (restore?.isConnected && typeof restore.focus === 'function') {
        requestAnimationFrame(() => {
          restore.focus();
        });
      }
    };
  }, [config.open]);
}

// Canonical tabbable selector used by `findFirstTabbable`. Consumers
// (Popover non-modal) build their `getFocusTarget` on top of this.
const TABBABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Finds the first non-disabled, non-aria-hidden tabbable element inside
 * the container. Returns `null` when nothing tabbable is found — consumer
 * should fall back to focusing the container itself.
 */
export function findFirstTabbable(container: HTMLElement): HTMLElement | null {
  const candidates = container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR);
  for (const node of Array.from(candidates)) {
    if (!node.hasAttribute('disabled') && node.getAttribute('aria-hidden') !== 'true') {
      return node;
    }
  }
  return null;
}
