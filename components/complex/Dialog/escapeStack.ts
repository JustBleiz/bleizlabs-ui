/**
 * escapeStack — shared module-level stack for the dialog family (Radix #1249 fix).
 *
 * Each modal (Dialog, AlertDialog, Drawer, Sheet) pushes its close callback
 * onto the stack when it opens and pops when it closes. Each modal registers
 * its own `document.addEventListener('keydown')` handler, but only the HANDLER
 * AT THE TOP OF THE STACK actually acts on Escape — all other handlers return
 * early. This guarantees that in nested scenarios only the topmost (last
 * opened) dialog closes on a single Escape keypress, matching the WAI-ARIA APG
 * expectation.
 *
 * Usage pattern:
 *   useEffect(() => {
 *     if (!open || !closeOnEscape) return;
 *     const close = () => onOpenChange(false); // (or onCancel, etc.)
 *     escapeStack.push(close);
 *     const handler = (e: KeyboardEvent) => {
 *       if (e.key !== 'Escape') return;
 *       if (escapeStack[escapeStack.length - 1] !== close) return;
 *       e.preventDefault();
 *       close();
 *     };
 *     document.addEventListener('keydown', handler);
 *     return () => {
 *       document.removeEventListener('keydown', handler);
 *       const idx = escapeStack.indexOf(close);
 *       if (idx !== -1) escapeStack.splice(idx, 1);
 *     };
 *   }, [open, closeOnEscape, onOpenChange]);
 */
export const escapeStack: Array<() => void> = [];
