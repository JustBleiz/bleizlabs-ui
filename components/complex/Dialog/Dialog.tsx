'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { Heading } from '../../typography/Heading';
import { Text } from '../../typography/Text';
import { cn } from '../../utils/cn';
import { useFocusTrap } from './useFocusTrap';
import styles from './Dialog.module.scss';

/**
 * Dialog — accessible modal dialog (Phase 10 CI1, first Complex Interactive).
 *
 * @layer    complex-interactive
 * @tokens   --color-surface, --color-border-subtle, --color-overlay,
 *           --radius-lg, --shadow-2xl, --duration-normal, --easing-default,
 *           --space-4, --space-5, --z-modal, --focus-ring
 * @deps     cn, Heading, Text, useFocusTrap (own hook, shared by modal family)
 * @a11y     Implements WAI-ARIA APG `/dialog-modal/` pattern. Composes
 *           `createPortal(document.body)` + overlay + focus-trapped content.
 *           Own `useFocusTrap` hook — Tab/Shift+Tab cycle via fresh
 *           `querySelectorAll` per keypress (dynamic-content safe), initial
 *           focus via `requestAnimationFrame` defer, focus restore to saved
 *           `document.activeElement` on disable. Escape handler on `document`
 *           to allow nested Select handlers to fire first (Radix #1951 fix).
 *           Body scroll lock only when open (Radix #998 fix). SSR-safe via
 *           `typeof document === 'undefined'` guard before portal. Required
 *           `title` prop enforces APG compliance at type level. `description`
 *           optional — conditional `aria-describedby` wiring (Radix #3007 fix).
 * @apg      https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 * @tested   tsc + eslint + next build (Playwright/NVDA/axe deferred per
 *           E15 scope — 21 regression cases documented in
 *           `tests/Dialog.regression.spec.md`).
 * @regressions See `tests/Dialog.regression.spec.md` DL-R01..R21.
 *
 * @example
 * const [open, setOpen] = useState(false);
 * return (
 *   <Dialog open={open} onOpenChange={setOpen} title="Delete project">
 *     <Text>Are you sure? This cannot be undone.</Text>
 *   </Dialog>
 * );
 */

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

export interface DialogProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'title' | 'role' | 'aria-modal' | 'aria-labelledby' | 'aria-describedby'
  > {
  /** Controlled open state. Dialog is modal-only, always controlled. */
  open: boolean;
  /** Callback invoked when the dialog requests to close (Escape, overlay click, close button). */
  onOpenChange: (open: boolean) => void;
  /** Required dialog title — drives `aria-labelledby` per APG. Rendered as `<h2>` via Heading. */
  title: string;
  /** Optional description — drives `aria-describedby` only when provided (Radix #3007 fix). */
  description?: string;
  /** Main body content rendered inside the dialog surface. */
  children?: ReactNode;
  /** Optional footer slot — typically an action row (Buttons). Rendered below body. */
  footer?: ReactNode;
  /** Size variant. Default `'md'` (560px max-width). */
  size?: DialogSize;
  /** Optional initial focus target override. Default: first tabbable element in content (APG spec). */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Close on Escape key. Default `true` (APG requirement for modal dialogs). */
  closeOnEscape?: boolean;
  /** Close on overlay backdrop click. Default `true` (UX convenience). */
  closeOnOverlayClick?: boolean;
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const SIZE_CLASS: Record<DialogSize, string> = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
  xl: styles.sizeXl!,
};

/**
 * Dialog — modal dialog composing portal + overlay + focus-trapped content (Phase 10 CI1, E15).
 *
 * First Phase 10 Complex Interactive component. Renders via `createPortal` to
 * `document.body` when `open=true`. Owns its own focus trap (`useFocusTrap`),
 * Escape handler, scroll lock, and focus restore on close. Content element
 * carries `role="dialog"` + `aria-modal="true"` + `aria-labelledby={titleId}`
 * + optional `aria-describedby={descId}`. Required `title` prop enforces APG
 * compliance at type level.
 *
 * @layer        complex interactive (Phase 10)
 * @apg          https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 * @tokens       --color-overlay, --color-surface, --color-border-subtle,
 *               --radius-lg, --shadow-2xl, --shadow-overlay, --space-5,
 *               --duration-normal, --easing-default, --z-modal, --focus-ring
 * @deps         Heading, Text, cn, createPortal, useFocusTrap
 * @a11y         role="dialog" + aria-modal="true" + aria-labelledby (required) +
 *               aria-describedby (conditional per Radix #3007). Tab/Shift+Tab
 *               focus cycle via useFocusTrap. Escape closes. Focus restored to
 *               trigger on close. Body scroll-locked while open. Overlay click
 *               closes only when target === overlay (no content bubbling).
 *               Close button has explicit aria-label.
 * @tested       DEFERRED — Playwright specs written in `tests/` (keyboard, focus,
 *               aria, regression) but execution deferred to first consumer adoption
 *               per E15 scope decision 2 (no browser env in build agent). Manual
 *               NVDA sweep deferred — documented in `docs/a11y-pipeline.md`.
 *               axe-core zero-violations spec pending consumer adoption.
 * @regressions  21 Radix closed issues mapped to `tests/Dialog.regression.spec.ts`:
 *               #2690 (nested toast click), #1951 (Escape inside Select), #2450
 *               (Escape bubble), #2961 (Select reopen), #2355 (Dropdown reopen),
 *               #1249 (nested Dialog Escape), #1891 (focus stuck after unmount),
 *               #3353 (Shadow DOM focus), #2544 (focus trap disable), #2122
 *               (pointer-events leak), #998 (forceMount scroll lock), #2270
 *               (multi-trigger focus return), #3811 (Safari focus escape), #2836
 *               (aria-labelledby orphan), #3007 (aria-describedby orphan), #3579
 *               (custom desc id), #2038 (aria-describedby not read), #2047
 *               (Safari Tab), #2275 (nested Select arrows), #2532 (animation
 *               race), #1546 (conditional focus target).
 * @example
 * const [open, setOpen] = useState(false);
 * <>
 *   <Button onClick={() => setOpen(true)}>Open dialog</Button>
 *   <Dialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="Confirm delete"
 *     description="This action cannot be undone."
 *     footer={
 *       <>
 *         <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
 *         <Button variant="warning" onClick={handleDelete}>Delete</Button>
 *       </>
 *     }
 *   >
 *     <Text>The selected item and all its data will be permanently removed.</Text>
 *   </Dialog>
 * </>
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  initialFocusRef,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  className,
  ...rest
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const contentRef = useRef<HTMLDivElement | null>(null);

  useFocusTrap(contentRef, open, initialFocusRef);

  // Escape handler (Radix #1951 fix — nested Select's own Escape handler must run first;
  // we listen on document so capture order is deterministic with document listeners).
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onOpenChange(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onOpenChange]);

  // Scroll lock (Radix #998 fix — only lock while open, never on forceMount).
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleOverlayClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!closeOnOverlayClick) return;
      if (event.target === event.currentTarget) {
        onOpenChange(false);
      }
    },
    [closeOnOverlayClick, onOpenChange],
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // SSR guard + closed-state short-circuit.
  // Renders null on server and when closed — no portal created, no hydration mismatch,
  // no scroll lock side effects, zero DOM footprint.
  if (typeof document === 'undefined' || !open) return null;

  const describedBy = description ? descriptionId : undefined;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      data-state={open ? 'open' : 'closed'}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={cn(styles.content, SIZE_CLASS[size], className)}
        {...rest}
      >
        <header className={styles.header}>
          <Heading level={2} size="lg" id={titleId} className={styles.title}>
            {title}
          </Heading>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className={styles.closeButton}
          >
            <CloseIcon />
          </button>
        </header>
        {description ? (
          <Text
            id={descriptionId}
            variant="body"
            color="muted"
            className={styles.description}
          >
            {description}
          </Text>
        ) : null}
        {children !== undefined && children !== null ? (
          <div className={styles.body}>{children}</div>
        ) : null}
        {footer !== undefined && footer !== null ? (
          <div className={styles.footer}>{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
