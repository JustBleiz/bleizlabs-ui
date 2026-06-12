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
import { Button, type ButtonVariant } from '../../interactive/Button';
import { cn } from '../../utils/cn';
import { useFocusTrap, escapeStack } from '../Dialog';
import styles from './AlertDialog.module.scss';

export type AlertDialogSize = 'sm' | 'md' | 'lg';
export type AlertDialogSeverity = 'info' | 'warning' | 'critical';

export interface AlertDialogProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'role' | 'aria-modal' | 'aria-labelledby' | 'aria-describedby'
> {
  /** Controlled open state. AlertDialog is always modal. */
  open: boolean;
  /** Callback invoked when the dialog requests to close (Escape, cancel button, or after action). */
  onOpenChange: (open: boolean) => void;
  /** Required alert title — drives `aria-labelledby` per APG /alertdialog/. Rendered as `<h2>` via Heading. */
  title: string;
  /**
   * Required alert description — drives `aria-describedby`. Per APG /alertdialog/,
   * aria-describedby is REQUIRED (differs from Dialog where it is optional).
   */
  description: string;
  /** Optional extra body content rendered below the description. */
  children?: ReactNode;
  /**
   * Severity level driving visual emphasis (border/glow) + default `confirmVariant`.
   * - `'info'`  — neutral blue, confirm defaults to `'primary'`
   * - `'warning'` — amber, confirm defaults to `'warning'`
   * - `'critical'` — red, confirm defaults to `'warning'` (destructive)
   * Default: `'warning'` (alerts typically require caution).
   */
  severity?: AlertDialogSeverity;
  /** Primary action button label (e.g., "Delete", "Confirm", "Discard"). */
  confirmLabel: string;
  /** Callback fired when primary action button is clicked. */
  onConfirm: () => void;
  /**
   * Primary action button variant override. When omitted, inferred from `severity`:
   * `info` → `primary`, `warning` | `critical` → `warning`.
   */
  confirmVariant?: ButtonVariant;
  /** Cancel button label. Default: `"Cancel"`. */
  cancelLabel?: string;
  /** Callback fired when Cancel button or Escape key fires. Default: `onOpenChange(false)`. */
  onCancel?: () => void;
  /** Size variant. Default `'md'` (480px). Narrower than Dialog since alerts stay compact. */
  size?: AlertDialogSize;
  /**
   * Optional initial focus target override. Default: Cancel button (least destructive
   * per APG safety guidance — keyboard users should never start focused on a dangerous action).
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Close on Escape key. Default `true` (APG requirement). Escape calls `onCancel`, not `onConfirm`. */
  closeOnEscape?: boolean;
  /**
   * Close on overlay backdrop click. Default `false` (differs from Dialog) — alerts enforce
   * explicit action via button, preventing accidental dismissal.
   */
  closeOnOverlayClick?: boolean;
}

const SIZE_CLASS: Record<AlertDialogSize, string> = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
};

const SEVERITY_CLASS: Record<AlertDialogSeverity, string> = {
  info: styles.severityInfo!,
  warning: styles.severityWarning!,
  critical: styles.severityCritical!,
};

const DEFAULT_CONFIRM_VARIANT: Record<AlertDialogSeverity, ButtonVariant> = {
  info: 'primary',
  warning: 'warning',
  critical: 'warning',
};

/**
 * AlertDialog — modal alert dialog composing portal + overlay + focus-trapped content (Phase 10 CI2, E16).
 *
 * Extends Dialog (CI1) pattern with alert-specific semantics per WAI-ARIA APG
 * `/alertdialog/`: `role="alertdialog"`, REQUIRED `aria-describedby` (not optional),
 * least-destructive initial focus (Cancel by default), blocked overlay click by
 * default, and confirm/cancel action row. Reuses `useFocusTrap` from Dialog —
 * the hook is generic and works on any container. Portal, scroll lock, and
 * Escape handler are duplicated inline (one-component-owns-behavior per D5/D25).
 *
 * @layer        complex interactive (Phase 10)
 * @apg          https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
 * @tokens       --color-overlay, --color-surface, --color-border-subtle,
 *               --color-info, --color-warning, --color-error,
 *               --color-info-subtle, --color-warning-subtle, --color-error-subtle,
 *               --radius-lg, --shadow-2xl, --space-{3,4,5,8}, --duration-normal,
 *               --easing-default, --z-modal, --focus-ring
 * @deps         Heading, Text, Button, cn, createPortal, useFocusTrap (from Dialog)
 * @a11y         role="alertdialog" + aria-modal="true" + aria-labelledby (required) +
 *               aria-describedby (REQUIRED per APG, unlike Dialog). Tab/Shift+Tab
 *               focus cycle via useFocusTrap. Escape calls onCancel (not onConfirm).
 *               Initial focus defaults to Cancel button (least destructive). Body
 *               scroll-locked while open. Overlay click BLOCKED by default. Action
 *               row contains 2 buttons: Cancel (secondary) + Confirm (severity-driven).
 *               Background `inert` toggle blocks AT virtual cursor / Browse Mode
 *               from reaching background content while the alert is open
 *               (progressive enhancement beyond focus trap).
 * @tested       EXECUTED in-repo — Playwright suites in `tests/` (keyboard, focus,
 *               aria, regression `.spec.ts` quad) run CI-gated + axe-core smoke on
 *               the demo route; tsc/lint/build clean. Manual NVDA sweep stays
 *               deferred — documented in `docs/a11y-pipeline.md`.
 * @regressions  41 regression cases mapped in `tests/AlertDialog.regression.spec.md`
 *               (`.spec.md` wraps typed Playwright fences — consumer-CI reference
 *               snapshot; canonical suite in `tests/AlertDialog.*.spec.ts`, same
 *               format as Dialog/tests/). 29 active `test(...)` + 12 `test.skip(...)`
 *               with `PLAYGROUND-DEP:` rationale. Coverage: Dialog-inherited primitives
 *               (portal + focus trap + scroll lock + inert) + AlertDialog-specific
 *               (required aria-describedby, least-destructive focus, overlay click
 *               blocking, destructive styling, form submission isolation, nested Select
 *               interaction, mobile pointer-events timing). Skipped tests unskip when
 *               the referenced playground scenario lands (typically when another Phase
 *               10 component like Select/Toast provides the nested primitive).
 * @example
 * const [open, setOpen] = useState(false);
 * <>
 *   <Button variant="warning" onClick={() => setOpen(true)}>Delete project</Button>
 *   <AlertDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="Delete project?"
 *     description="This action cannot be undone. All project data will be permanently removed."
 *     severity="critical"
 *     confirmLabel="Delete"
 *     onConfirm={() => { deleteProject(); setOpen(false); }}
 *   />
 * </>
 */
export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  severity = 'warning',
  confirmLabel,
  onConfirm,
  confirmVariant,
  cancelLabel = 'Cancel',
  onCancel,
  size = 'md',
  initialFocusRef,
  closeOnEscape = true,
  closeOnOverlayClick = false,
  className,
  ...rest
}: AlertDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const cancelButtonRef = useRef<HTMLElement | null>(null);

  // Default initial focus → Cancel button (least destructive per APG safety).
  // Consumer can override via `initialFocusRef`.
  const resolvedInitialFocus = initialFocusRef ?? cancelButtonRef;
  useFocusTrap(contentRef, open, resolvedInitialFocus);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  }, [onCancel, onOpenChange]);

  // Refs for the escape effect — commit-time updates so deps stay `[open]`;
  // inline consumer callbacks made `handleCancel` unstable, which splice+pushed
  // this modal's stack entry above a nested child's (E02 audit fix — see
  // Dialog.tsx / escapeStack.ts for the canonical pattern + rationale).
  const handleCancelRef = useRef(handleCancel);
  useEffect(() => {
    handleCancelRef.current = handleCancel;
  });
  const closeOnEscapeRef = useRef(closeOnEscape);
  useEffect(() => {
    closeOnEscapeRef.current = closeOnEscape;
  });

  // Escape handler — stack-based so only the topmost open modal handles Escape
  // (Radix #1249 fix, shared across the dialog family via `escapeStack`).
  // EVERY open modal pushes its entry — also closeOnEscape=false, which must
  // SHADOW ancestors; the gate is read through closeOnEscapeRef at keypress.
  // APG safety: Escape calls `onCancel`, not `onConfirm`.
  // Radix #1951: document-level listener still lets nested native Select swallow
  // Escape first (browser handles focused select before document listeners fire).
  useEffect(() => {
    if (!open) return;
    const close = () => handleCancelRef.current();
    escapeStack.push(close);
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (escapeStack[escapeStack.length - 1] !== close) return;
      if (!closeOnEscapeRef.current) return;
      event.preventDefault();
      close();
    }
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      const idx = escapeStack.indexOf(close);
      if (idx !== -1) escapeStack.splice(idx, 1);
    };
  }, [open]);

  // Scroll lock (Radix #998 fix — only while open).
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Background `inert` — blocks AT virtual cursor / Browse Mode from reaching
  // background content while the alert is open (progressive enhancement beyond
  // focus trap). Toggles `inert` on all direct children of <body> except the
  // portal root itself.
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
        handleCancel();
      }
    },
    [closeOnOverlayClick, handleCancel],
  );

  // SSR guard + closed-state short-circuit.
  if (typeof document === 'undefined' || !open) return null;

  const resolvedConfirmVariant = confirmVariant ?? DEFAULT_CONFIRM_VARIANT[severity];

  return createPortal(
    <div className={styles.root} onClick={handleOverlayClick}>
      <div
        ref={contentRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn(styles.content, SIZE_CLASS[size], SEVERITY_CLASS[severity], className)}
        {...rest}
      >
        <header className={styles.header}>
          <Heading level={2} size="lg" id={titleId} className={styles.title}>
            {title}
          </Heading>
        </header>
        <Text id={descriptionId} variant="body" color="muted" className={styles.description}>
          {description}
        </Text>
        {children !== undefined && children !== null ? (
          <div className={styles.body}>{children}</div>
        ) : null}
        <div className={styles.actions}>
          <Button ref={cancelButtonRef} type="button" variant="ghost" onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={resolvedConfirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
