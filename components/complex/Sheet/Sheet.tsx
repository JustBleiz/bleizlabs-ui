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
import styles from './Sheet.module.scss';

/**
 * Sheet — side panel modal sheet composing portal + overlay + focus-trapped
 * content (Phase 10 CI4, E18). 4-directional variant of Dialog pattern with
 * `side: 'left' | 'right' | 'top' | 'bottom'` — generalizes Drawer (bottom-only)
 * into a 4-side family.
 *
 * Visual modifier of APG `/dialog-modal/` pattern — uses `role="dialog"`.
 * Reuses `useFocusTrap` from Dialog. Portal + scroll lock + Escape handler +
 * background `inert` toggle are inline per D5/D25 one-component-owns-behavior.
 *
 * @layer   complex interactive (Phase 10)
 * @tokens  --color-surface, --color-surface-raised, --color-border-subtle,
 *          --color-overlay, --color-text-primary, --color-text-muted,
 *          --radius-lg, --radius-md, --shadow-2xl, --duration-normal,
 *          --duration-fast, --easing-default, --space-{3,4,5,8},
 *          --z-modal, --focus-ring
 * @deps    Heading, Text, cn, createPortal, useFocusTrap (from ../Dialog)
 * @a11y    role="dialog" + aria-modal="true" + aria-labelledby (required) +
 *          aria-describedby (optional). Tab/Shift+Tab focus cycle via
 *          useFocusTrap. Escape closes. First-tabbable initial focus.
 *          Body scroll-locked. Overlay click closes by default. Background
 *          `inert` toggle. Content padding honors `env(safe-area-inset-*)`.
 *
 * @example
 * const [open, setOpen] = useState(false);
 * <Sheet
 *   open={open}
 *   onOpenChange={setOpen}
 *   side="right"
 *   size="md"
 *   title="Product details"
 * >
 *   <Text>Details body…</Text>
 * </Sheet>
 */
export type SheetSide = 'left' | 'right' | 'top' | 'bottom';
export type SheetSize = 'sm' | 'md' | 'lg';

export interface SheetProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'role' | 'aria-modal' | 'aria-labelledby' | 'aria-describedby'
> {
  /** Controlled open state. Sheet is always modal. */
  open: boolean;
  /** Callback invoked when sheet requests to close (Escape, overlay click, close button). */
  onOpenChange: (open: boolean) => void;
  /** Required sheet title — drives `aria-labelledby` per APG `/dialog-modal/`. Rendered as `<h2>`. */
  title: string;
  /**
   * Optional description — drives `aria-describedby` only when provided
   * (Dialog parity, NOT AlertDialog strictness).
   */
  description?: string;
  /** Main body content (typically scrollable — overflow isolated to body). */
  children?: ReactNode;
  /** Optional footer slot — sticky bottom action row (inherits Drawer's body-scroll pattern). */
  footer?: ReactNode;
  /**
   * Side the sheet enters from. Drives animation direction + layout positioning
   * + border-radius (inner corners only) + safe-area inset:
   * - `'left'`  → slides from left, aligns left, right-side corners rounded
   * - `'right'` → slides from right, aligns right, left-side corners rounded (DEFAULT)
   * - `'top'`   → slides from top, aligns top, bottom-side corners rounded
   * - `'bottom'`→ slides from bottom, aligns bottom, top-side corners rounded
   * Default: `'right'` (most common desktop navigation pattern).
   */
  side?: SheetSide;
  /**
   * Size variant — resolves to width (left/right) or height (top/bottom):
   * - horizontal (left/right): sm 320px / md 420px / lg 560px
   * - vertical (top/bottom): sm 240px / md 360px / lg `min(80vh, calc(100vh - space-8))` + dvh override
   * Default: `'md'`.
   */
  size?: SheetSize;
  /**
   * Optional initial focus target override. Default: first tabbable via useFocusTrap
   * fallback (Dialog parity).
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Close on Escape key. Default `true` (APG requirement). */
  closeOnEscape?: boolean;
  /** Close on overlay backdrop click. Default `true` (Dialog/Drawer parity). */
  closeOnOverlayClick?: boolean;
  /**
   * Whether to render a close (X) button in the sheet header. **Default `true`**
   * (differs from Drawer — sheets are often long-lived nav/detail panels where an
   * explicit X is ergonomic). Set `false` for action-driven close.
   */
  showCloseButton?: boolean;
}

const SIDE_CLASS: Record<SheetSide, string> = {
  left: styles.sideLeft!,
  right: styles.sideRight!,
  top: styles.sideTop!,
  bottom: styles.sideBottom!,
};

const RADIUS_CLASS: Record<SheetSide, string> = {
  left: styles.radiusLeft!,
  right: styles.radiusRight!,
  top: styles.radiusTop!,
  bottom: styles.radiusBottom!,
};

const BORDER_CLASS: Record<SheetSide, string> = {
  left: styles.borderLeft!,
  right: styles.borderRight!,
  top: styles.borderTop!,
  bottom: styles.borderBottom!,
};

const SAFEAREA_CLASS: Record<SheetSide, string> = {
  left: styles.safeAreaLeft!,
  right: styles.safeAreaRight!,
  top: styles.safeAreaTop!,
  bottom: styles.safeAreaBottom!,
};

const ANIMATION_CLASS: Record<SheetSide, string> = {
  left: styles.animateLeft!,
  right: styles.animateRight!,
  top: styles.animateTop!,
  bottom: styles.animateBottom!,
};

// Horizontal sides (left/right) use width variants.
// Vertical sides (top/bottom) use height variants. Same size names, different dimensions.
const SIZE_CLASS_HORIZONTAL: Record<SheetSize, string> = {
  sm: styles.sizeSmH!,
  md: styles.sizeMdH!,
  lg: styles.sizeLgH!,
};

const SIZE_CLASS_VERTICAL: Record<SheetSize, string> = {
  sm: styles.sizeSmV!,
  md: styles.sizeMdV!,
  lg: styles.sizeLgV!,
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
 * Sheet — side panel modal sheet composing portal + overlay + focus-trapped
 * content (Phase 10 CI4, E18). 4-directional variant of Dialog pattern with
 * `side: 'left' | 'right' | 'top' | 'bottom'` — closes the Drawer family
 * (Drawer is bottom-only and action-driven; Sheet generalizes to 4 sides).
 *
 * Visual modifier of APG `/dialog-modal/` pattern — uses `role="dialog"`
 * (NOT alertdialog). Reuses `useFocusTrap` from Dialog. Portal + scroll lock +
 * Escape handler + background `inert` toggle are inline per D5/D25
 * one-component-owns-behavior. SCSS forked from Drawer's `.root` + `.content`
 * pattern with 4 sideClass/animationClass/radiusClass/borderClass/safeAreaClass
 * lookups driven by the `side` prop.
 *
 * @layer        complex interactive (Phase 10)
 * @apg          https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (4-side modifier)
 * @tokens       --color-surface, --color-surface-raised, --color-border-subtle,
 *               --color-overlay, --color-text-primary, --color-text-muted,
 *               --radius-lg, --radius-md, --shadow-2xl, --duration-normal,
 *               --duration-fast, --easing-default, --space-{3,4,5,8},
 *               --z-modal, --focus-ring
 * @deps         Heading, Text, cn, createPortal, useFocusTrap (from ../Dialog)
 * @a11y         role="dialog" + aria-modal="true" + aria-labelledby (required) +
 *               aria-describedby (optional, conditional). Tab/Shift+Tab focus
 *               cycle via useFocusTrap. Escape closes. First-tabbable initial
 *               focus (Dialog parity). Body scroll-locked while open. Overlay
 *               click closes by default. Background `inert` toggle blocks AT
 *               virtual cursor / Browse Mode. Content padding honors
 *               `env(safe-area-inset-{left,right,top,bottom})` matched to side
 *               for iPad notch / Dynamic Island / home indicator. Touch target
 *               enforcement on close button via `mx.touch-target` at pointer:
 *               coarse. Action buttons delegated to Button atom.
 * @tested       PARTIAL — static a11y verified, runtime a11y deferred:
 *               ✓ `tsc --noEmit` clean
 *               ✓ `npm run lint` clean (includes `eslint-plugin-jsx-a11y` via
 *                 `eslint-config-next`)
 *               ✓ Build clean — Next.js static prerender PASS
 *               DEFERRED (first consumer adoption, per E15 scope decision):
 *               - Playwright execution of 4 `.spec.md` files
 *               - axe-core runtime zero-violations sweep
 *               - Manual NVDA sweep + iOS device testing per side
 * @regressions  41 cases mapped in `tests/Sheet.regression.spec.md`: 21 inherited
 *               from Dialog (portal+trap+scroll-lock+inert primitives) + 20
 *               Sheet-specific (4-side animations, per-side safe-area-inset,
 *               per-side border-radius, width vs height variants by side,
 *               nested sheets, multi-side stacking). 14 `test.skip` with
 *               `PLAYGROUND-DEP:` rationale for iOS device quirks + nested
 *               Select/Toast/form scenarios pending other Phase 10 components.
 * @example
 * const [open, setOpen] = useState(false);
 * <>
 *   <Button onClick={() => setOpen(true)}>Open side panel</Button>
 *   <Sheet
 *     open={open}
 *     onOpenChange={setOpen}
 *     side="right"
 *     size="md"
 *     title="Product details"
 *     description="Full specifications and pricing."
 *     footer={
 *       <>
 *         <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
 *         <Button onClick={handleAddToCart}>Add to cart</Button>
 *       </>
 *     }
 *   >
 *     <Text>Details body…</Text>
 *   </Sheet>
 * </>
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = 'right',
  size = 'md',
  initialFocusRef,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  showCloseButton = true,
  className,
  ...rest
}: SheetProps) {
  const titleId = useId();
  const descriptionId = useId();
  const contentRef = useRef<HTMLDivElement | null>(null);

  useFocusTrap(contentRef, open, initialFocusRef);

  // Escape handler — stack-based so only the topmost open modal handles Escape
  // (Radix #1249 fix via shared `escapeStack`). Document listener still lets
  // nested Select/Combobox swallow Escape first (Radix #1951 pattern).
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

  // Scroll lock (Radix #998 fix).
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Background `inert` — progressive enhancement beyond focus trap.
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
  const isHorizontal = side === 'left' || side === 'right';
  const sizeClass = isHorizontal ? SIZE_CLASS_HORIZONTAL[size] : SIZE_CLASS_VERTICAL[size];

  return createPortal(
    <div
      className={cn(styles.root, SIDE_CLASS[side])}
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
        className={cn(
          styles.content,
          sizeClass,
          RADIUS_CLASS[side],
          BORDER_CLASS[side],
          SAFEAREA_CLASS[side],
          ANIMATION_CLASS[side],
          className,
        )}
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
              aria-label={`Close ${title}`}
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
