'use client';

/**
 * useFloatingDismiss — composable dismiss primitives for floating components.
 *
 * Bundles the three close mechanisms that every floating surface needs:
 *   1. Escape key — document-level listener with `defaultPrevented` guard
 *      so nested components can intercept first (Select → DropdownMenu →
 *      Dialog chain works correctly).
 *   2. Outside pointerdown — capture phase so it fires BEFORE React's
 *      click delegation, preventing trigger-close-reopen race. Skips
 *      `<html>` / `<body>` targets (Radix #7 scrollbar click fix). Skips
 *      targets contained in `contentRef` and (when provided) `triggerRef`.
 *   3. Window scroll — capture phase, passive. Used by ContextMenu to
 *      mirror native OS context menu behavior; all other consumers skip.
 *
 * Config captured via ref so effect deps stay minimal (`[open]`) and
 * listener churn on unrelated state changes is avoided.
 *
 * @layer utils / floating primitives (E23)
 * @deps react only
 * @example
 *   useFloatingDismiss({
 *     open,
 *     onDismiss: () => setOpen(false),
 *     contentRef: popperRef,
 *     triggerRef,
 *     closeOnEscape: true,
 *     closeOnOutsideClick: true,
 *   });
 */

import { useEffect, useRef, type RefObject } from 'react';

export interface FloatingDismissConfig {
  /** When false, all listeners are detached and the hook is a no-op. */
  open: boolean;
  /**
   * Called when any enabled dismiss primitive fires. Consumers pass their
   * own close-and-restore-focus callback here; the hook itself does not
   * manage focus restoration (that's `useFloatingFocus`).
   */
  onDismiss: () => void;
  /** Content element containing the floating surface. Used for outside-click containment. */
  contentRef: RefObject<HTMLElement | null>;
  /**
   * Optional trigger element. When provided, outside-click skips targets
   * contained in it (prevents "click trigger → close via outside-click →
   * trigger handler re-opens" race). ContextMenu omits this — it has no
   * trigger widget.
   */
  triggerRef?: RefObject<HTMLElement | null>;
  /** Close on Escape keydown. Default `true`. */
  closeOnEscape?: boolean;
  /** Close on outside pointerdown. Default `true`. */
  closeOnOutsideClick?: boolean;
  /**
   * Close on window scroll (capture phase, passive). Default `false`.
   * ContextMenu opts in to match native OS behavior.
   */
  closeOnScroll?: boolean;
}

export function useFloatingDismiss(config: FloatingDismissConfig): void {
  // Capture latest config in a ref so listener effects can read up-to-date
  // callbacks without re-attaching listeners on every render. The ref is
  // updated inside a commit-time effect (React 19 `react-hooks/refs` rule
  // forbids mutating refs during render). Event listeners run async after
  // commits so they always observe the latest config by the time they fire.
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  });

  // Escape key dismiss — document level so nested components preventDefault first.
  useEffect(() => {
    if (!config.open) return;
    if (config.closeOnEscape === false) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        configRef.current.onDismiss();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [config.open, config.closeOnEscape]);

  // Outside pointerdown — capture phase, skip scrollbar + content + trigger.
  useEffect(() => {
    if (!config.open) return;
    if (config.closeOnOutsideClick === false) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      // Skip scrollbar clicks (target === documentElement/body).
      if (target === document.documentElement || target === document.body) return;
      const { contentRef, triggerRef, onDismiss } = configRef.current;
      if (contentRef.current?.contains(target)) return;
      if (triggerRef?.current?.contains(target)) return;
      onDismiss();
    };
    document.addEventListener('pointerdown', handlePointerDown, { capture: true });
    return () =>
      document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  }, [config.open, config.closeOnOutsideClick]);

  // Window scroll — capture phase, passive. Opt-in for ContextMenu.
  // E148: dismiss only when the window ACTUALLY scrolls — guard against
  // spurious scroll-event fires that leave `scrollY` unchanged (observed in
  // CI after Playwright auto-scrollIntoView on an already-visible element,
  // causing a false-positive dismiss mid-menuitem-click). Snapshot scrollX/Y
  // at open; compare deltas against a subpixel threshold. Preserves intent
  // (user scrolls → close) without firing on no-op scroll events.
  useEffect(() => {
    if (!config.open) return;
    if (!config.closeOnScroll) return;
    const originX = window.scrollX;
    const originY = window.scrollY;
    const handleScroll = () => {
      const dx = Math.abs(window.scrollX - originX);
      const dy = Math.abs(window.scrollY - originY);
      if (dx < 1 && dy < 1) return;
      configRef.current.onDismiss();
    };
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () =>
      window.removeEventListener('scroll', handleScroll, { capture: true });
  }, [config.open, config.closeOnScroll]);
}
