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
import { escapeStack } from './escapeStack';
import styles from './Dialog.module.scss';

/**
 * Dialog — modal dialog composing portal + overlay + focus-trapped content
 * (Phase 10 CI1, E15, first Complex Interactive — foundation of the dialog
 * family: AlertDialog CI2, Drawer CI3, Sheet CI4 all reuse `useFocusTrap` and
 * follow the same portal + overlay + inert + scroll-lock pattern).
 *
 * Renders via `createPortal` to `document.body` when `open=true`. Owns its own
 * focus trap, Escape handler, scroll lock, background `inert` toggle, and
 * focus restore on close. Content element carries `role="dialog"` +
 * `aria-modal="true"` + `aria-labelledby={titleId}` + optional
 * `aria-describedby={descId}`. Required `title` prop enforces APG compliance.
 *
 * @layer   complex-interactive (Phase 10)
 * @tokens  --color-surface, --color-surface-raised, --color-border-subtle,
 *          --color-overlay, --color-brand, --color-text-muted,
 *          --color-text-primary, --radius-lg, --radius-md, --shadow-2xl,
 *          --duration-normal, --easing-default, --space-{3,4,6,8}, --z-modal
 * @deps    Heading, Text, cn, createPortal, useFocusTrap (own hook, shared
 *          with AlertDialog/Drawer/Sheet via local import)
 * @a11y    role="dialog" + aria-modal="true" + aria-labelledby (required) +
 *          aria-describedby (conditional, only when `description` provided).
 *          Tab/Shift+Tab focus cycle via useFocusTrap. Initial focus via
 *          `initialFocusRef` or first tabbable. Escape closes. Body scroll
 *          locked while open. Background `inert` toggled.
 *
 * @example
 * const [open, setOpen] = useState(false);
 * <Dialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Edit project"
 *   footer={<Inline gap={2}><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary">Save</Button></Inline>}
 * >
 *   <Input label="Project name" />
 * </Dialog>
 */
export type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

export interface DialogProps extends Omit<
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
 * Dialog — modal dialog composing portal + overlay + focus-trapped content
 * (Phase 10 CI1, E15, first Complex Interactive — foundation of the dialog
 * family: AlertDialog CI2, Drawer CI3, Sheet CI4 all reuse `useFocusTrap` and
 * follow the same portal + overlay + inert + scroll-lock pattern).
 *
 * Renders via `createPortal` to `document.body` when `open=true`. Owns its own
 * focus trap (`useFocusTrap`), Escape handler, scroll lock, background `inert`
 * toggle, and focus restore on close. Content element carries `role="dialog"` +
 * `aria-modal="true"` + `aria-labelledby={titleId}` + optional
 * `aria-describedby={descId}`. Required `title` prop enforces APG compliance
 * at type level.
 *
 * @layer        complex-interactive (Phase 10)
 * @apg          https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 * @tokens       --color-surface, --color-surface-raised, --color-border-subtle,
 *               --color-overlay, --color-brand, --color-text-muted,
 *               --color-text-primary, --radius-lg, --radius-md, --shadow-2xl,
 *               --duration-normal, --easing-default, --space-{3,4,6,8},
 *               --z-modal
 * @deps         Heading, Text, cn, createPortal, useFocusTrap (own hook,
 *               shared with AlertDialog/Drawer/Sheet via local import)
 * @a11y         role="dialog" + aria-modal="true" + aria-labelledby (required,
 *               drives from `title`) + aria-describedby (conditional per Radix
 *               #3007 — only set when `description` provided). Tab/Shift+Tab
 *               focus cycle via useFocusTrap (fresh `querySelectorAll` per
 *               keypress → dynamic-content safe). Initial focus via
 *               `requestAnimationFrame` defer. Focus restored to trigger on
 *               close. Escape handler on `document` (nested Select handlers
 *               fire first — Radix #1951). Body scroll-locked while open
 *               (Radix #998). Background `inert` toggle on all <body> direct
 *               children except portal root blocks AT virtual cursor / Browse
 *               Mode from reaching background content (progressive enhancement
 *               beyond focus trap). Overlay click closes only when target ===
 *               overlay (no content bubbling). Close button has explicit
 *               aria-label. SSR-safe via `typeof document === 'undefined'`
 *               guard before portal.
 * @tested       PARTIAL — static a11y verified, runtime a11y deferred:
 *               ✓ `tsc --noEmit` clean (TypeScript strict, no any, proper Omit)
 *               ✓ `npm run lint` clean (eslint-plugin-jsx-a11y via
 *                 eslint-config-next catches missing aria-label, invalid ARIA
 *                 attrs, accessible-name-required violations)
 *               ✓ Build clean — Next.js static prerender PASS
 *               DEFERRED (first consumer adoption, per E15 scope decision 2):
 *               - Playwright execution of 4 `.spec.md` files (keyboard, focus,
 *                 aria, regression) — specs ready, no browser env in build agent
 *               - axe-core runtime zero-violations sweep (requires live page)
 *               - Manual NVDA sweep (requires real AT)
 *               - a11y pipeline documented in `docs/a11y-pipeline.md`
 * @regressions  21 Radix closed issues mapped to `tests/Dialog.regression.spec.md`:
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

  // Escape handler — stack-based so only the TOPMOST open dialog handles Escape
  // (Radix #1249 fix: nested dialogs). Each Dialog pushes its close callback onto
  // `escapeStack` on open and pops on close. The document-level listener ignores
  // the event unless its handler sits at the top of the stack at firing time.
  // Radix #1951: document-phase listeners still let nested native Select swallow
  // Escape first (the select's own browser handler runs before document).
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const close = () => onOpenChange(false);
    escapeStack.push(close);
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (escapeStack[escapeStack.length - 1] !== close) return;
      event.preventDefault();
      close();
    }
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      const idx = escapeStack.indexOf(close);
      if (idx !== -1) escapeStack.splice(idx, 1);
    };
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

  // Background `inert` — blocks AT virtual cursor / Browse Mode from reaching
  // background content while the dialog is open (progressive enhancement beyond
  // focus trap). Toggles `inert` on all direct children of <body> except the
  // portal root itself. Canonical pattern for the dialog family — AlertDialog,
  // Drawer, Sheet all inherit this.
  useEffect(() => {
    if (!open) return;
    const portalRoot = contentRef.current?.parentElement;
    if (!portalRoot) return;
    const siblings = Array.from(document.body.children).filter((el) => el !== portalRoot);
    const hadInert = siblings.map((el) => el.hasAttribute('inert'));
    siblings.forEach((el) => el.setAttribute('inert', ''));
    return () => {
      siblings.forEach((el, i) => {
        if (!hadInert[i]) el.removeAttribute('inert');
      });
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
    <div className={styles.root} onClick={handleOverlayClick} data-state={open ? 'open' : 'closed'}>
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
          <Text id={descriptionId} variant="body" color="muted" className={styles.description}>
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
