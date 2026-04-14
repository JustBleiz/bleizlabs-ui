import { useEffect, type RefObject } from 'react';

const TABBABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getTabbables(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR));
}

function getFirstTabbable(container: HTMLElement): HTMLElement | null {
  return getTabbables(container)[0] ?? null;
}

/**
 * useFocusTrap — own focus trap hook for Phase 10 Complex Interactive (E15).
 *
 * Implements the WAI-ARIA APG focus management spec for modal dialogs:
 * - On enable: stores `document.activeElement` as the trigger, moves focus
 *   to `initialFocusRef.current` if provided, otherwise to the first tabbable
 *   element inside `containerRef`. Initial focus is deferred via
 *   `requestAnimationFrame` so the browser's reconciliation completes first.
 * - While enabled: listens for `Tab` / `Shift+Tab` on `document` and cycles
 *   focus within the container (wraps first ↔ last). Uses a fresh tabbable
 *   query on every keypress so dynamic content (late-mounted buttons,
 *   conditionally rendered inputs) is included.
 * - On disable/cleanup: removes listener and restores focus to the saved
 *   trigger element via `requestAnimationFrame` (prevents race with React
 *   unmount — Radix issue #1891 fix).
 *
 * Zero runtime dependencies per D25. Used by Dialog (and future AlertDialog,
 * Drawer, Sheet, Popover).
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  initialFocusRef?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    const previousFocus =
      typeof document !== 'undefined'
        ? (document.activeElement as HTMLElement | null)
        : null;

    const initialTarget =
      initialFocusRef?.current ?? getFirstTabbable(container);

    const focusFrame = requestAnimationFrame(() => {
      if (initialTarget) {
        initialTarget.focus();
      } else {
        container.focus();
      }
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return;
      const tabbables = getTabbables(container!);
      if (tabbables.length === 0) {
        event.preventDefault();
        container!.focus();
        return;
      }
      const first = tabbables[0]!;
      const last = tabbables[tabbables.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey) {
        if (active === first || !container!.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus && typeof previousFocus.focus === 'function') {
        requestAnimationFrame(() => {
          previousFocus.focus();
        });
      }
    };
  }, [enabled, containerRef, initialFocusRef]);
}
