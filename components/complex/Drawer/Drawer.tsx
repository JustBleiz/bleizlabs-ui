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
import { useFocusTrap, escapeStack } from '../Dialog';
import styles from './Drawer.module.scss';

/**
 * Drawer — bottom-positioned modal sheet composing portal + overlay +
 * focus-trapped content (Phase 10 CI3, E17). Visual modifier of APG
 * `/dialog-modal/` pattern. Uses `role="dialog"` (not `alertdialog`).
 *
 * Reuses `useFocusTrap` from Dialog. Portal + scroll lock + Escape handler +
 * background `inert` toggle are inline per D5/D25 one-component-owns-behavior.
 * SCSS bottom-aligned layout, slide-up keyframe, top-only border-radius, and
 * iOS safe-area padding.
 *
 * @layer   complex interactive (Phase 10)
 * @tokens  --color-surface, --color-surface-raised, --color-border-subtle,
 *          --color-overlay, --color-text-primary, --color-text-muted,
 *          --radius-lg, --radius-md, --shadow-2xl, --duration-normal,
 *          --duration-fast, --easing-default, --space-{3,4,5,8},
 *          --z-modal, --focus-ring
 * @deps    Heading, Text, cn, createPortal, useFocusTrap (from ../Dialog)
 * @a11y    role="dialog" + aria-modal="true" + aria-labelledby (required) +
 *          aria-describedby (optional, conditional). Tab/Shift+Tab focus
 *          cycle via useFocusTrap. Escape closes. Initial focus defaults to
 *          first tabbable. Body scroll-locked while open. Overlay click
 *          closes by default. Background `inert` toggle blocks AT virtual
 *          cursor. Content padding-bottom honors `env(safe-area-inset-bottom)`.
 *
 * @example
 * const [open, setOpen] = useState(false);
 * <Drawer
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Filter products"
 *   description="Narrow results by category."
 *   size="md"
 * >
 *   <Text>Filter controls go here…</Text>
 * </Drawer>
 */
export type DrawerSize = 'sm' | 'md' | 'lg';

export interface DrawerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'role' | 'aria-modal' | 'aria-labelledby' | 'aria-describedby'
> {
  /** Controlled open state. Drawer is always modal. */
  open: boolean;
  /** Callback invoked when drawer requests to close (Escape, overlay click, close button). */
  onOpenChange: (open: boolean) => void;
  /** Required drawer title — drives `aria-labelledby` per APG `/dialog-modal/`. Rendered as `<h2>`. */
  title: string;
  /**
   * Optional description — drives `aria-describedby` only when provided (Dialog parity,
   * NOT AlertDialog's strictness since Drawer is a generic container, not an alert).
   */
  description?: string;
  /** Main body content (typically scrollable). */
  children?: ReactNode;
  /** Optional footer slot — sticky bottom action row. */
  footer?: ReactNode;
  /**
   * Height variant controlling `max-height` of drawer content.
   * - `'sm'` → 360px — compact action sheet
   * - `'md'` → 560px — default standard drawer
   * - `'lg'` → 80dvh (fallback 80vh) — full-height detail view
   * Default: `'md'`.
   */
  size?: DrawerSize;
  /**
   * Optional initial focus target override. Default: first tabbable in content via
   * useFocusTrap fallback (Dialog parity — Drawer is NOT an alert so no least-destructive default).
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Close on Escape key. Default `true` (APG requirement). */
  closeOnEscape?: boolean;
  /** Close on overlay backdrop click. Default `true` (Dialog parity — UX convenience). */
  closeOnOverlayClick?: boolean;
  /**
   * Whether to render a close (X) button in the drawer header. Default `false` —
   * drawers are typically action-driven (consumer closes via footer button or Escape).
   * Set `true` for Dialog-parity convenience (top-right X icon).
   */
  showCloseButton?: boolean;
}

const SIZE_CLASS: Record<DrawerSize, string> = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
};

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

/**
 * Drawer — bottom-positioned modal sheet composing portal + overlay + focus-trapped
 * content (Phase 10 CI3, E17). Visual modifier of APG `/dialog-modal/` pattern —
 * not a separate pattern, so it uses `role="dialog"` (not `alertdialog`).
 *
 * Reuses `useFocusTrap` from Dialog. Portal + scroll lock + Escape handler +
 * background `inert` toggle are inline per D5/D25 one-component-owns-behavior.
 * SCSS forked from AlertDialog's `.root`/`.content` pattern with bottom-aligned
 * layout, slide-up keyframe, top-only border-radius, and iOS safe-area padding.
 *
 * @layer        complex interactive (Phase 10)
 * @apg          https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (bottom-positioned modifier)
 * @tokens       --color-surface, --color-surface-raised, --color-border-subtle,
 *               --color-overlay, --color-text-primary, --color-text-muted,
 *               --radius-lg, --radius-md, --shadow-2xl, --duration-normal,
 *               --duration-fast, --easing-default, --space-{3,4,5,8},
 *               --z-modal, --focus-ring
 * @deps         Heading, Text, cn, createPortal, useFocusTrap (from ../Dialog)
 * @a11y         role="dialog" + aria-modal="true" + aria-labelledby (required) +
 *               aria-describedby (optional, conditional). Tab/Shift+Tab focus
 *               cycle via useFocusTrap. Escape closes. Initial focus defaults to
 *               first tabbable (not least-destructive — Drawer is not an alert).
 *               Body scroll-locked while open. Overlay click closes by default
 *               (Dialog parity). Background `inert` toggle blocks AT virtual
 *               cursor / Browse Mode from reaching background content while open.
 *               Content padding-bottom honors `env(safe-area-inset-bottom)` for
 *               iOS notch/home indicator. Touch target enforcement on action
 *               buttons delegated to Button atom.
 * @tested       PARTIAL — static a11y verified, runtime a11y deferred:
 *               ✓ `tsc --noEmit` clean (TypeScript strict, no any, proper Omit)
 *               ✓ `npm run lint` clean — includes `eslint-plugin-jsx-a11y` via
 *                 `eslint-config-next` (catches missing aria-label, invalid ARIA
 *                 attrs, accessible-name-required violations, etc.)
 *               ✓ Build clean — Next.js static prerender PASS
 *               DEFERRED (first consumer adoption, per E15 scope decision):
 *               - Playwright execution of 4 `.spec.md` files (keyboard, focus,
 *                 aria, regression) — specs ready, no browser env in build agent
 *               - axe-core runtime zero-violations sweep (requires live page)
 *               - Manual NVDA sweep + iOS device testing (requires devices)
 *               - 17 regression tests `test.skip` with PLAYGROUND-DEP rationale
 *                 (iOS-specific quirks, multi-drawer stacking, nested Select/Toast
 *                 scenarios pending other Phase 10 components)
 * @regressions  41 cases mapped in `tests/Drawer.regression.spec.md`: 21 inherited
 *               from Dialog (same portal+trap+scroll-lock+inert primitives) + 20
 *               Drawer-specific (iOS viewport vh/dvh, safe-area-inset, iOS scroll
 *               propagation, nested Select bounds, multi-drawer stacking, keyboard
 *               avoidance, reduced-motion, touch target with safe-area padding).
 * @example
 * const [open, setOpen] = useState(false);
 * <>
 *   <Button onClick={() => setOpen(true)}>Open filters</Button>
 *   <Drawer
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="Filter products"
 *     description="Narrow results by category, price, and availability."
 *     size="md"
 *     footer={
 *       <>
 *         <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
 *         <Button onClick={() => setOpen(false)}>Apply</Button>
 *       </>
 *     }
 *   >
 *     <Text>Filter controls go here…</Text>
 *   </Drawer>
 * </>
 */
export function Drawer({
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
  showCloseButton = false,
  className,
  ...rest
}: DrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const contentRef = useRef<HTMLDivElement | null>(null);

  useFocusTrap(contentRef, open, initialFocusRef);

  // Escape handler — stack-based so only the topmost open modal handles Escape
  // (Radix #1249 fix, shared with the dialog family via `escapeStack`). Document
  // listener means nested Select/Combobox browser-level Escape still fires first
  // (Radix #1951 pattern inherited from Dialog).
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
  // background content while the drawer is open (progressive enhancement beyond
  // focus trap). Toggles `inert` on all direct children of <body> except the
  // portal root itself. Inherited from AlertDialog (E16) pattern.
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

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleOverlayClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!closeOnOverlayClick) return;
      if (event.target === event.currentTarget) {
        onOpenChange(false);
      }
    },
    [closeOnOverlayClick, onOpenChange],
  );

  // SSR guard + closed-state short-circuit.
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
          {showCloseButton ? (
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close drawer"
              className={styles.closeButton}
            >
              <CloseIcon />
            </button>
          ) : null}
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
