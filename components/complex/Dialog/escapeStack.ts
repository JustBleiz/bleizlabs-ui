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
 * Usage pattern (E02 audit remediation — ref-based, deps MUST stay `[open]`):
 *   const onOpenChangeRef = useRef(onOpenChange);
 *   useEffect(() => {
 *     onOpenChangeRef.current = onOpenChange;
 *   });
 *   const closeOnEscapeRef = useRef(closeOnEscape);
 *   useEffect(() => {
 *     closeOnEscapeRef.current = closeOnEscape;
 *   });
 *   useEffect(() => {
 *     if (!open) return; // push for EVERY open modal — also closeOnEscape=false
 *     const close = () => onOpenChangeRef.current(false); // (or onCancel, etc.)
 *     escapeStack.push(close);
 *     const handler = (e: KeyboardEvent) => {
 *       if (e.key !== 'Escape') return;
 *       if (escapeStack[escapeStack.length - 1] !== close) return;
 *       if (!closeOnEscapeRef.current) return; // top non-escapable: swallow by inaction
 *       e.preventDefault();
 *       close();
 *     };
 *     document.addEventListener('keydown', handler);
 *     return () => {
 *       document.removeEventListener('keydown', handler);
 *       const idx = escapeStack.indexOf(close);
 *       if (idx !== -1) escapeStack.splice(idx, 1);
 *     };
 *   }, [open]);
 *
 * Why refs + `[open]` deps (NOT `[open, closeOnEscape, onOpenChange]`): an
 * inline consumer `onOpenChange` changes identity every parent render — with
 * it in deps, the effect re-runs and splice+push moves THIS modal's entry to
 * the TOP of the stack, so with a nested child open a single Escape closed
 * the PARENT. Refs keep the entry stable (pushed exactly once per open).
 * A `closeOnEscape={false}` modal still pushes its entry so it SHADOWS
 * ancestors (Escape on top of it must close nothing — not the modal below);
 * the gate is read through the ref at keypress time.
 */
export const escapeStack: Array<() => void> = [];
