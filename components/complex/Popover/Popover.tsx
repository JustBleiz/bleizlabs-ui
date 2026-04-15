'use client';

/**
 * Popover — floating panel anchored to a trigger for contextual content.
 *
 * @layer complex-interactive (Phase 10 CI5)
 * @tokens --color-surface-raised, --color-text-primary, --color-border-subtle,
 *   --shadow-lg, --radius-lg, --z-popover, --duration-normal, --easing-default,
 *   --space-3, --space-4, --space-5, --font-size-md
 * @deps zero runtime deps — positioning via `utils/position.ts` +
 *   `utils/useFloating.ts` (E19 primitive, E20 extended with `computeArrowPosition`
 *   + optional `arrow` ref in `useFloating`). Reuses `useFocusTrap` from
 *   `../Dialog/useFocusTrap` for modal mode. Own Slot primitive for `asChild`
 *   trigger wrapping. React 19 `createPortal`.
 * @a11y `role="dialog"` + `aria-modal="false"` (non-modal default) or `"true"`
 *   (modal opt-in); `aria-labelledby` wired to optional title; `aria-describedby`
 *   wired to optional description (Radix #3007 — only set when element exists);
 *   trigger gets `aria-expanded` (synced with open state), `aria-haspopup="dialog"`,
 *   `aria-controls` pointing to content id. Content has `tabIndex={-1}` so it can
 *   receive programmatic focus when no tabbables exist. Escape + outside click
 *   dismiss (both gated by `dismissable` prop). Focus management: on open, moves
 *   to first tabbable / `initialFocusRef` / content itself via `rAF`; on close,
 *   restores to pre-open `document.activeElement` (Dialog precedent). Modal mode
 *   opts into full `useFocusTrap` + background `inert` toggle + body scroll lock.
 *   Non-modal default keeps background interactive. Disabled trigger cannot open
 *   (native `disabled` blocks events; `aria-disabled` is checked explicitly).
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (modeless modifier)
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y via eslint-config-next ✓ |
 *   next build ✓ — DEFERRED: Playwright execution, axe-core runtime sweep,
 *   manual NVDA sweep, iOS/Android device testing. Per E15 scope decision.
 * @regressions tests/Popover.{keyboard,focus,aria,regression}.spec.md — 20
 *   Radix closed-issue cases mapped. ~6 marked test.skip with PLAYGROUND-DEP
 *   rationale (require DropdownMenu/iframe/sortable-lib scenarios).
 * @example
 *   <Popover>
 *     <PopoverTrigger asChild><Button>Open</Button></PopoverTrigger>
 *     <PopoverContent title="Account" description="Quick settings">
 *       <Text>Your account is active.</Text>
 *     </PopoverContent>
 *   </Popover>
 */

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { useFloating } from '../../utils/useFloating';
import { type Placement } from '../../utils/position';
import { Heading } from '../../typography/Heading';
import { Text } from '../../typography/Text';
import { useFocusTrap } from '../Dialog/useFocusTrap';
import styles from './Popover.module.scss';

export type PopoverPlacement = Placement;

// ──────────────────────────────────────────────────────────────────────────
// Context — shared state between Popover / PopoverTrigger / PopoverContent
// ──────────────────────────────────────────────────────────────────────────

interface PopoverContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerId: string;
  contentId: string;
  triggerRef: RefObject<HTMLElement | null>;
  placement: PopoverPlacement;
  sideOffset: number;
  collisionPadding: number;
  modal: boolean;
  dismissable: boolean;
  closeOnEscape: boolean;
  closeOnOutsideClick: boolean;
  initialFocusRef: RefObject<HTMLElement | null> | undefined;
  restoreFocusOnClose: boolean;
  showArrow: boolean;
  maxWidth: string;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext(component: string): PopoverContextValue {
  const ctx = useContext(PopoverContext);
  if (!ctx) {
    throw new Error(
      `${component} must be rendered inside a <Popover> parent.`,
    );
  }
  return ctx;
}

// ──────────────────────────────────────────────────────────────────────────
// Popover — state holder + context provider
// ──────────────────────────────────────────────────────────────────────────

export interface PopoverProps {
  children: ReactNode;
  /** Controlled open state. When provided, component is controlled and consumer owns state. */
  open?: boolean;
  /** Uncontrolled initial open state. Ignored when `open` is provided. Default `false`. */
  defaultOpen?: boolean;
  /** Fires on every open transition (trigger click, Escape, outside click, programmatic). */
  onOpenChange?: (open: boolean) => void;
  /**
   * Preferred placement. Positioning engine flips to opposite axis and shifts
   * along cross-axis if the preferred placement would clip the viewport.
   * Default `'bottom'` — popover-family convention (Select / DropdownMenu hang below trigger).
   */
  placement?: PopoverPlacement;
  /** Gap in pixels between trigger edge and popover edge. Default `8` (vs Tooltip's 6). */
  sideOffset?: number;
  /** Inner padding from viewport edges for flip + shift. Default `8`. */
  collisionPadding?: number;
  /**
   * Modal mode — opt-in full focus trap (reuses `useFocusTrap` from Dialog)
   * + background `inert` toggle + body scroll lock. Default `false`.
   * Non-modal default keeps background interactive.
   */
  modal?: boolean;
  /**
   * When `false`, disables BOTH Escape and outside-click dismissal. Use for
   * required-action popovers where explicit close is mandatory. Default `true`.
   */
  dismissable?: boolean;
  /** Granular: close on Escape key. Default `true`. Ignored when `dismissable={false}`. */
  closeOnEscape?: boolean;
  /** Granular: close on outside pointerdown. Default `true`. Ignored when `dismissable={false}`. */
  closeOnOutsideClick?: boolean;
  /**
   * Override default first-tabbable focus behavior. When provided, focus moves
   * to this element on open instead of the first tabbable child.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Restore focus to trigger when popover closes. Default `true`. */
  restoreFocusOnClose?: boolean;
  /**
   * Opt-in decorative arrow pointing at the trigger. Arrow math runs only when
   * this is `true` (performance — DropdownMenu / Select / Combobox skip it).
   * Default `false`.
   */
  showArrow?: boolean;
  /** Max width CSS for popover content. Default `'min(360px, 90vw)'`. */
  maxWidth?: string;
}

export function Popover({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom',
  sideOffset = 8,
  collisionPadding = 8,
  modal = false,
  dismissable = true,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  initialFocusRef,
  restoreFocusOnClose = true,
  showArrow = false,
  maxWidth = 'min(360px, 90vw)',
}: PopoverProps) {
  const reactId = useId();
  const triggerId = `${reactId}-trigger`;
  const contentId = `${reactId}-content`;

  const triggerRef = useRef<HTMLElement | null>(null);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (next === open) return;
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [open, isControlled, onOpenChange],
  );

  const value = useMemo<PopoverContextValue>(
    () => ({
      open,
      setOpen,
      triggerId,
      contentId,
      triggerRef,
      placement,
      sideOffset,
      collisionPadding,
      modal,
      dismissable,
      closeOnEscape,
      closeOnOutsideClick,
      initialFocusRef,
      restoreFocusOnClose,
      showArrow,
      maxWidth,
    }),
    [
      open,
      setOpen,
      triggerId,
      contentId,
      placement,
      sideOffset,
      collisionPadding,
      modal,
      dismissable,
      closeOnEscape,
      closeOnOutsideClick,
      initialFocusRef,
      restoreFocusOnClose,
      showArrow,
      maxWidth,
    ],
  );

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

// ──────────────────────────────────────────────────────────────────────────
// PopoverTrigger — Slot-or-button wrapper, merges ARIA + toggle click
// ──────────────────────────────────────────────────────────────────────────

export interface PopoverTriggerProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'aria-expanded' | 'aria-haspopup' | 'aria-controls'
  > {
  children: ReactNode;
  /**
   * When `true`, Slot-wraps the single React element child, merging ARIA and
   * onClick onto it. When `false` (default), renders a native `<button>`.
   */
  asChild?: boolean;
}

export const PopoverTrigger = forwardRef<HTMLElement, PopoverTriggerProps>(
  function PopoverTrigger({ children, asChild = false, onClick, ...rest }, forwardedRef) {
    const ctx = usePopoverContext('<PopoverTrigger>');
    const { open, setOpen, triggerId, contentId, triggerRef } = ctx;

    const mergedRef = mergeRefs(
      forwardedRef,
      (node: HTMLElement | null) => {
        triggerRef.current = node;
      },
    );

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        // Respect aria-disabled / native disabled. Native disabled blocks events
        // natively for a real <button>, but Slot-wrapped custom triggers may
        // bypass it — check explicitly.
        const target = event.currentTarget;
        if (target.getAttribute('aria-disabled') === 'true') return;
        if (target instanceof HTMLButtonElement && target.disabled) return;
        setOpen(!open);
      },
      [open, setOpen],
    );

    const ariaProps = {
      id: triggerId,
      'aria-expanded': open,
      'aria-haspopup': 'dialog' as const,
      'aria-controls': open ? contentId : undefined,
    };

    if (asChild) {
      return (
        <Slot
          ref={mergedRef}
          {...ariaProps}
          onClick={(event) => {
            handleClick(event);
            onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>);
          }}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={mergedRef as React.Ref<HTMLButtonElement>}
        type="button"
        {...ariaProps}
        onClick={(event) => {
          handleClick(event);
          onClick?.(event);
        }}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

// ──────────────────────────────────────────────────────────────────────────
// PopoverContent — portal + positioning + focus management + dismiss
// ──────────────────────────────────────────────────────────────────────────

export interface PopoverContentProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'role' | 'aria-modal' | 'aria-labelledby' | 'aria-describedby' | 'title'
  > {
  /** Optional title — renders as `<Heading level={3}>` and wires `aria-labelledby`. */
  title?: string;
  /** Optional description — renders as `<Text>` and wires `aria-describedby`. */
  description?: string;
  children?: ReactNode;
  /** Optional footer slot — typically action buttons, separated by a top border. */
  footer?: ReactNode;
  className?: string;
}

export function PopoverContent({
  title,
  description,
  children,
  footer,
  className,
  ...rest
}: PopoverContentProps) {
  const ctx = usePopoverContext('<PopoverContent>');
  const {
    open,
    setOpen,
    contentId,
    triggerRef,
    placement,
    sideOffset,
    collisionPadding,
    modal,
    dismissable,
    closeOnEscape,
    closeOnOutsideClick,
    initialFocusRef,
    restoreFocusOnClose,
    showArrow,
    maxWidth,
  } = ctx;

  // popperRef is the portal outer wrapper — it carries useFloating's
  // floatingStyles AND serves as the scope container for focus management
  // and outside-click containment. It contains the semantic `.content` div
  // as a child, so `findFirstTabbable(popperRef.current)` and
  // `popperRef.current.contains(target)` both work correctly.
  const popperRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLSpanElement | null>(null);
  const titleId = `${contentId}-title`;
  const descId = `${contentId}-desc`;

  const { refs, floatingStyles, arrowStyles, placement: actualPlacement } = useFloating({
    open,
    placement,
    offset: sideOffset,
    padding: collisionPadding,
    arrow: showArrow ? { ref: arrowRef, padding: 8 } : undefined,
  });
  const { setReference, setFloating } = refs;

  // Bridge triggerRef (set by PopoverTrigger) into useFloating's reference
  // setter. Layout effect runs after PopoverTrigger mounts its DOM node.
  useLayoutEffect(() => {
    if (!open) return;
    if (triggerRef.current) setReference(triggerRef.current);
  }, [open, triggerRef, setReference]);

  // Merged ref for the outer popper wrapper — attaches both useFloating's
  // setFloating callback (drives positioning) and our own popperRef (focus +
  // outside-click scope).
  const mergedPopperRef = useCallback(
    (node: HTMLDivElement | null) => {
      popperRef.current = node;
      setFloating(node);
    },
    [setFloating],
  );

  // Focus trap for modal mode only. In non-modal mode we manage focus manually
  // below with a lighter useLayoutEffect that moves focus on open and restores
  // it on close without trapping Tab.
  useFocusTrap(popperRef, open && modal, initialFocusRef);

  // Non-modal focus management: move focus to first tabbable on open, restore
  // to pre-open activeElement on close. Does NOT trap Tab — Tab exits freely.
  useLayoutEffect(() => {
    if (!open || modal) return;
    const previousActive = document.activeElement as HTMLElement | null;

    const frame = requestAnimationFrame(() => {
      const container = popperRef.current;
      if (!container) return;
      const target =
        initialFocusRef?.current ?? findFirstTabbable(container) ?? container;
      target.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      if (restoreFocusOnClose && previousActive?.isConnected) {
        requestAnimationFrame(() => {
          previousActive.focus();
        });
      }
    };
  }, [open, modal, initialFocusRef, restoreFocusOnClose]);

  // Body scroll lock (modal mode only — non-modal popover leaves background scrollable).
  useEffect(() => {
    if (!open || !modal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, modal]);

  // Background `inert` toggle (modal mode only). Skips the popper's own
  // ancestry chain so the popover itself remains interactive.
  useEffect(() => {
    if (!open || !modal || typeof document === 'undefined') return;
    const popperNode = popperRef.current;
    if (!popperNode) return;
    const siblings: HTMLElement[] = [];
    const prevValues: Array<string | null> = [];
    Array.from(document.body.children).forEach((child) => {
      if (!(child instanceof HTMLElement)) return;
      if (child.contains(popperNode)) return;
      siblings.push(child);
      prevValues.push(child.getAttribute('inert'));
      child.setAttribute('inert', '');
    });
    return () => {
      siblings.forEach((el, idx) => {
        const prev = prevValues[idx];
        if (prev === undefined || prev === null) el.removeAttribute('inert');
        else el.setAttribute('inert', prev);
      });
    };
  }, [open, modal]);

  // Escape key dismissal — document-level so nested Select / DropdownMenu can
  // fire their own Escape handlers first and call preventDefault if needed.
  useEffect(() => {
    if (!open || !dismissable || !closeOnEscape) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, dismissable, closeOnEscape, setOpen]);

  // Outside pointerdown dismissal — capture phase so it fires BEFORE React's
  // click event delegation. This prevents a race where the trigger re-opens
  // the popover via click while the document listener closes it.
  useEffect(() => {
    if (!open || !dismissable || !closeOnOutsideClick) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      // Skip if click landed on <html>/<body> (scrollbar click — Radix #7).
      if (target === document.documentElement || target === document.body) return;
      if (popperRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown, { capture: true });
    return () =>
      document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  }, [open, dismissable, closeOnOutsideClick, setOpen, triggerRef]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div ref={mergedPopperRef} className={styles.root} style={floatingStyles}>
      <div
        id={contentId}
        role="dialog"
        aria-modal={modal ? 'true' : 'false'}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        data-placement={actualPlacement}
        className={cn(styles.content, className)}
        style={{ maxWidth }}
        {...rest}
      >
        {(title || description) && (
          <div className={styles.header}>
            {title && (
              <Heading id={titleId} level={3} size="lg" className={styles.title}>
                {title}
              </Heading>
            )}
            {description && (
              <Text
                id={descId}
                variant="small"
                color="muted"
                className={styles.description}
              >
                {description}
              </Text>
            )}
          </div>
        )}
        {children && <div className={styles.body}>{children}</div>}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
      {showArrow && (
        <span
          ref={arrowRef}
          className={styles.arrow}
          data-placement={actualPlacement}
          style={arrowStyles}
          aria-hidden="true"
        />
      )}
    </div>,
    document.body,
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

const TABBABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function findFirstTabbable(container: HTMLElement): HTMLElement | null {
  const candidates = container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR);
  for (const node of Array.from(candidates)) {
    if (!node.hasAttribute('disabled') && node.getAttribute('aria-hidden') !== 'true') {
      return node;
    }
  }
  return null;
}
