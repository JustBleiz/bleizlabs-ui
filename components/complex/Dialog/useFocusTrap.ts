import { useEffect, type RefObject } from 'react';

const TABBABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Visibility filter (E02 audit remediation): selector-only matching let
// hidden candidates (display:none / visibility:hidden / [hidden]) into the
// trap cycle — Tab-wrap focused a hidden element (focus() no-op after
// preventDefault = "dead" focus) and initial focus could target one too.
// checkVisibility() covers display:none (flat tree), content-visibility and
// the visibility property; the getClientRects() fallback (older engines)
// deliberately avoids offsetParent, which is null for position:fixed.
// Known non-goal: aria-hidden ancestors are NOT filtered (matches `tabbable`
// package defaults; separate decision if ever needed).
function isVisible(el: HTMLElement): boolean {
  if (typeof el.checkVisibility === 'function') {
    return el.checkVisibility({ checkVisibilityCSS: true, visibilityProperty: true });
  }
  return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
}

function getTabbables(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(isVisible);
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
 *   conditionally rendered inputs) is included. Hidden candidates
 *   (display:none / visibility:hidden / [hidden]) are filtered out via
 *   `checkVisibility()` with a `getClientRects()` fallback (E02).
 * - On disable/cleanup: removes listener and restores focus to the saved
 *   trigger element via `requestAnimationFrame` (prevents race with React
 *   unmount — Radix issue #1891 fix).
 *
 * Zero runtime dependencies per D25. Shared across the dialog family:
 * Dialog (CI1), AlertDialog (CI2), Drawer (CI3), Sheet (CI4) — and also
 * consumed by Sidebar (CI22) mobile drawer mode and Command (CI19) palette.
 *
 * @layer       complex-interactive (shared primitive)
 * @apg         https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 * @deps        none (React only, zero runtime deps per D25)
 * @a11y        APG focus management — trap cycle on Tab/Shift+Tab with wrap,
 *              `requestAnimationFrame` defer for both initial focus and
 *              restore to avoid React reconciliation races.
 * @tested      Consumed by Dialog, AlertDialog, Drawer, Sheet, Sidebar,
 *              Command. Focus trap behavior tested via each consumer's
 *              regression specs (Dialog R01-R21 cover trap edge cases).
 * @regressions Implements fixes for Radix closed issues: #1891 (focus stuck
 *              after unmount — rAF defer on restore), #2047 (Safari Tab wrap),
 *              #2544 (focus trap disable race), #3353 (Shadow DOM focus
 *              traversal), #2270 (multi-trigger focus return — fresh
 *              `document.activeElement` capture per enable), #1546
 *              (conditional focus target via `initialFocusRef`).
 * @example
 * const contentRef = useRef<HTMLDivElement | null>(null);
 * useFocusTrap(contentRef, open, initialFocusRef);
 * return open ? <div ref={contentRef}>...</div> : null;
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
      typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;

    const initialTarget = initialFocusRef?.current ?? getFirstTabbable(container);

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
