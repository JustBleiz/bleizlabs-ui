'use client';

/**
 * HoverCard — hover-triggered floating surface for rich contextual content.
 *
 * @layer complex-interactive (Phase 10 CI9)
 * @tokens --color-surface-raised, --color-text-primary, --color-text-muted,
 *   --color-border-subtle, --shadow-lg, --radius-lg, --z-popover, --duration-fast,
 *   --easing-default, --space-3, --space-4, --font-size-sm, --font-size-base
 * @deps zero runtime deps. Positioning via `utils/position.ts` + `utils/useFloating.ts`
 *   (E19/E20 primitive). State + portal + context via shared `utils/floating/`
 *   composable primitives (E23 refactor): `useFloatingState` + `FloatingPortal`
 *   + `createFloatingContext`. **Skipped** primitives — `useFloatingDismiss` (no
 *   Escape/outside-click/scroll dismiss — closes via mouseleave + grace area
 *   timer instead) and `useFloatingFocus` (non-modal, no focus trap, no focus
 *   restore — focus stays where the user left it). Timer logic + Escape +
 *   visibilitychange + window blur handlers + `useCoarsePointer` matchMedia
 *   subscription mirror the Tooltip pattern (E19 precedent — both components
 *   are hover-triggered modeless surfaces with delay groups). Own Slot
 *   primitive for `HoverCardTrigger asChild`.
 * @a11y `role="dialog"` + `aria-modal="false"` (NOT `role="tooltip"` — HoverCard
 *   may contain interactive content like links and buttons; tooltip is
 *   display-only per APG `/tooltip/`). `aria-labelledby` wired to optional
 *   title; trigger gets `aria-expanded` (synced with open state) + `aria-haspopup="dialog"`
 *   + `aria-controls` pointing to content id when open. WCAG SC 1.4.13
 *   compliance: dismissable (Escape closes WITHOUT losing trigger focus —
 *   mirrors Tooltip), hoverable (grace area `closeDelay` lets pointer travel
 *   from trigger into content; content `onPointerEnter` cancels close timer),
 *   persistent (stays visible until pointer leaves). WCAG SC 2.1.1 compliance:
 *   focus on trigger opens instantly (no delay), blur closes after grace —
 *   `relatedTarget` aware so focus moving INTO content does not close, focus
 *   moving OUT of both trigger and content closes immediately. Touch devices
 *   (`pointer: coarse`): hover handlers suppressed entirely — HoverCard is a
 *   desktop-only feature. Touch users access content via focus path (tap
 *   focusable trigger) or assistive technology via `aria-describedby`-style
 *   exposure if needed (consumer wires this).
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (modeless modifier)
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y via eslint-config-next ✓ |
 *   next build ✓ — DEFERRED: Playwright execution (Playwright MCP disconnected
 *   this session), axe-core runtime sweep, manual NVDA sweep, iOS/Android
 *   device testing. Per E15 scope decision.
 * @regressions tests/HoverCard.{keyboard,focus,aria,regression}.spec.md — 15
 *   Radix-style regression cases mapped (HC-R01 hover delay timing, HC-R02
 *   grace area cancel by content pointer enter, HC-R03 focus parity instant
 *   open, HC-R04 blur relatedTarget in content keeps open, HC-R05 Escape
 *   closes without losing focus, HC-R06 visibilitychange hidden closes,
 *   HC-R07 window blur closes, HC-R08 coarse pointer skips hover, HC-R09
 *   Provider skip-delay window after first open, HC-R10 controlled mode
 *   single-fire, HC-R11 placement flip on viewport overflow, HC-R12
 *   aria-expanded sync on trigger, HC-R13 aria-labelledby wired only when
 *   title prop set, HC-R14 nested HoverCard PLAYGROUND-DEP, HC-R15 portal
 *   positioning under transformed parent PLAYGROUND-DEP). **Fewer cases
 *   than Tooltip/Popover (<20): HoverCard primitive has limited Radix
 *   history; regression net carries only shared escapeStack + nested-modal
 *   APG patterns proven in E142 L3e.**
 * @example
 *   // Standalone
 *   <HoverCard>
 *     <HoverCardTrigger asChild>
 *       <a href="/users/jane">@jane</a>
 *     </HoverCardTrigger>
 *     <HoverCardContent title="Jane Doe" description="Engineering @ Acme">
 *       <Text>Building copy-to-project component libraries.</Text>
 *     </HoverCardContent>
 *   </HoverCard>
 *
 *   // Grouped (toolbar / feed) — instant transitions after first open
 *   <HoverCardProvider>
 *     <HoverCard>...</HoverCard>
 *     <HoverCard>...</HoverCard>
 *   </HoverCardProvider>
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
  useSyncExternalStore,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { useFloating } from '../../utils/useFloating';
import { type Placement } from '../../utils/position';
import {
  createFloatingContext,
  useFloatingState,
  FloatingPortal,
} from '../../utils/floating';
import { escapeStack } from '../Dialog/escapeStack';
import { Heading } from '../../typography/Heading';
import { Text } from '../../typography/Text';
import styles from './HoverCard.module.scss';

export type HoverCardPlacement = Placement;

// ──────────────────────────────────────────────────────────────────────────
// HoverCardProvider — optional delay-group coordinator (Tooltip precedent)
// ──────────────────────────────────────────────────────────────────────────

interface HoverCardGroupContextValue {
  /** Group-wide open delay in ms — wins over per-instance `openDelay`. */
  openDelay: number;
  /**
   * Returns true when the skip-delay window is active — either another
   * HoverCard is currently open, or one was closed within `skipDelayDuration`
   * ms. Within the window, hovering a new HoverCard opens it instantly.
   */
  shouldSkipDelay: () => boolean;
  /** Called when a HoverCard opens — increments group open count. */
  onOpen: () => void;
  /** Called when a HoverCard closes — decrements count + stamps lastClose. */
  onClose: () => void;
}

const HoverCardGroupContext = createContext<HoverCardGroupContextValue | null>(null);

export interface HoverCardProviderProps {
  /** Sibling HoverCard instances sharing the open-delay group state. */
  children: ReactNode;
  /**
   * Initial open delay in ms before the first HoverCard in the group shows on
   * hover. Focus triggers ignore this delay. Default `700` (Radix convention).
   */
  openDelay?: number;
  /**
   * Time window in ms after any HoverCard in the group closes during which
   * subsequent HoverCards open without delay. Enables snappy feed/toolbar UX.
   * Default `300`.
   */
  skipDelayDuration?: number;
}

/**
 * HoverCardProvider — wraps a subtree (typically a feed list, sidebar, or
 * toolbar) to coordinate open-delay skipping across sibling HoverCards.
 * Within the provider, hovering from one trigger to another within
 * `skipDelayDuration` ms opens the next HoverCard instantly. Outside a
 * provider, each HoverCard runs its own per-instance delay independently.
 */
export function HoverCardProvider({
  children,
  openDelay = 700,
  skipDelayDuration = 300,
}: HoverCardProviderProps) {
  // Refs live inside the provider — consumers access them only through the
  // memoized callbacks below. This avoids React 19's `react-hooks/immutability`
  // rule (which forbids mutating values obtained from useContext) while still
  // letting the group coordinate state across sibling HoverCards.
  const lastCloseRef = useRef(0);
  const openCountRef = useRef(0);

  const shouldSkipDelay = useCallback(
    () =>
      openCountRef.current > 0 ||
      Date.now() - lastCloseRef.current < skipDelayDuration,
    [skipDelayDuration],
  );

  const onOpen = useCallback(() => {
    openCountRef.current += 1;
  }, []);

  const onClose = useCallback(() => {
    openCountRef.current = Math.max(0, openCountRef.current - 1);
    lastCloseRef.current = Date.now();
  }, []);

  const value = useMemo<HoverCardGroupContextValue>(
    () => ({ openDelay, shouldSkipDelay, onOpen, onClose }),
    [openDelay, shouldSkipDelay, onOpen, onClose],
  );

  return (
    <HoverCardGroupContext.Provider value={value}>{children}</HoverCardGroupContext.Provider>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// useCoarsePointer — `(pointer: coarse)` matchMedia subscription via
// useSyncExternalStore (React 19 sanctioned for external store subscriptions).
// SSR-safe: server snapshot returns `false` so the initial render assumes a
// fine-pointer device. Mirrors Tooltip pattern.
// ──────────────────────────────────────────────────────────────────────────

function subscribeCoarsePointer(callback: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mql = window.matchMedia('(pointer: coarse)');
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getCoarsePointerSnapshot(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

function getCoarsePointerServerSnapshot(): boolean {
  return false;
}

function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    subscribeCoarsePointer,
    getCoarsePointerSnapshot,
    getCoarsePointerServerSnapshot,
  );
}

// ──────────────────────────────────────────────────────────────────────────
// HoverCard context — shared between root, Trigger, Content
// ──────────────────────────────────────────────────────────────────────────

interface HoverCardContextValue {
  open: boolean;
  triggerId: string;
  contentId: string;
  triggerRef: RefObject<HTMLElement | null>;
  popperRef: RefObject<HTMLDivElement | null>;
  placement: HoverCardPlacement;
  sideOffset: number;
  collisionPadding: number;
  maxWidth: string;
  // Handlers wired by HoverCard root and consumed by Trigger + Content.
  // Consumers do NOT touch timer refs directly — these callbacks own the
  // timer state internally.
  scheduleOpen: () => void;
  /** Instant open, no delay. Used by focus path (SC 2.1.1 explicit intent). */
  openImmediate: () => void;
  scheduleClose: () => void;
  closeImmediate: () => void;
  cancelPendingOpen: () => void;
  /**
   * Clears BOTH open and close pending timers without scheduling anything
   * new. Used by HoverCardContent's `onPointerEnter` to keep the surface
   * open while the pointer is over content (cancels the close timer that
   * trigger's `onPointerLeave` started).
   */
  clearTimers: () => void;
  isCoarsePointer: boolean;
}

const [HoverCardContextProvider, useHoverCardContext] =
  createFloatingContext<HoverCardContextValue>('HoverCard');

// ──────────────────────────────────────────────────────────────────────────
// HoverCard — state holder + timer logic + context provider
// ──────────────────────────────────────────────────────────────────────────

export interface HoverCardProps {
  children: ReactNode;
  /** Controlled open state. When provided, component is controlled. */
  open?: boolean;
  /** Uncontrolled initial open state. Default `false`. */
  defaultOpen?: boolean;
  /** Fires on every open transition. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Preferred placement. Positioning engine flips to opposite axis and shifts
   * along cross-axis if the preferred placement would clip the viewport.
   * Default `'bottom'` — popover-family convention.
   */
  placement?: HoverCardPlacement;
  /** Gap in pixels between trigger edge and HoverCard edge. Default `8`. */
  sideOffset?: number;
  /** Inner padding from viewport edges for flip + shift. Default `8`. */
  collisionPadding?: number;
  /**
   * Open delay in ms — ignored when inside a `HoverCardProvider` (provider
   * delay + skip-window wins). Focus triggers always ignore this delay.
   * Default `700` (Radix convention).
   */
  openDelay?: number;
  /**
   * Grace area close delay in ms — how long the HoverCard stays open after
   * `mouseleave` on the trigger, allowing the pointer to travel into content.
   * Content `mouseenter` cancels the timer; content `mouseleave` re-arms it.
   * Default `300` (Radix convention). Set `0` to disable the grace area
   * (not recommended — breaks SC 1.4.13 hoverable for interactive content).
   */
  closeDelay?: number;
  /** Max width CSS for HoverCard content. Default `'min(360px, 90vw)'`. */
  maxWidth?: string;
}

export function HoverCard({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom',
  sideOffset = 8,
  collisionPadding = 8,
  openDelay,
  closeDelay = 300,
  maxWidth = 'min(360px, 90vw)',
}: HoverCardProps) {
  const reactId = useId();
  const triggerId = `${reactId}-trigger`;
  const contentId = `${reactId}-content`;

  const triggerRef = useRef<HTMLElement | null>(null);
  const popperRef = useRef<HTMLDivElement | null>(null);

  const group = useContext(HoverCardGroupContext);
  const effectiveDelay = openDelay ?? group?.openDelay ?? 700;

  const { open, setOpen: baseSetOpen } = useFloatingState({
    controlledOpen,
    defaultOpen,
    onOpenChange,
  });

  // Wrap setOpen so we also notify the optional group on every transition.
  const setOpen = useCallback(
    (next: boolean) => {
      if (next === open) return;
      baseSetOpen(next);
      if (group) {
        if (next) group.onOpen();
        else group.onClose();
      }
    },
    [open, baseSetOpen, group],
  );

  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(() => {
    clearTimers();
    // Inside a provider, if another HoverCard is currently open OR closed
    // within the skip-delay window, open this one instantly (warm-up pattern).
    const insideSkipWindow = group?.shouldSkipDelay() ?? false;
    const delay = insideSkipWindow ? 0 : effectiveDelay;
    if (delay === 0) {
      setOpen(true);
    } else {
      openTimerRef.current = setTimeout(() => setOpen(true), delay);
    }
  }, [clearTimers, group, effectiveDelay, setOpen]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    if (closeDelay === 0) {
      setOpen(false);
    } else {
      closeTimerRef.current = setTimeout(() => setOpen(false), closeDelay);
    }
  }, [clearTimers, closeDelay, setOpen]);

  // Instant open — used by focus path (SC 2.1.1 — focus is explicit intent,
  // bypass open delay regardless of group state).
  const openImmediate = useCallback(() => {
    clearTimers();
    setOpen(true);
  }, [clearTimers, setOpen]);

  // Instant close — used by Escape, blur (when focus leaves both trigger AND
  // content), visibilitychange hidden, window blur.
  const closeImmediate = useCallback(() => {
    clearTimers();
    setOpen(false);
  }, [clearTimers, setOpen]);

  const cancelPendingOpen = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  // Cleanup pending timers on unmount.
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Escape on document — routes through the shared Dialog escapeStack
  // (E142 L4 F4) so nested modal scenarios (Dialog + HoverCard) dismiss the
  // topmost surface only. Does NOT steal focus from trigger (SC 1.4.13).
  // Window blur + visibilitychange — hide on tab switch (Tooltip precedent).
  useEffect(() => {
    if (!open) return;
    const close = () => closeImmediate();
    escapeStack.push(close);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (escapeStack[escapeStack.length - 1] !== close) return;
      event.preventDefault();
      close();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') closeImmediate();
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', closeImmediate);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', closeImmediate);
      const idx = escapeStack.indexOf(close);
      if (idx !== -1) escapeStack.splice(idx, 1);
    };
  }, [open, closeImmediate]);

  const isCoarsePointer = useCoarsePointer();

  const value = useMemo<HoverCardContextValue>(
    () => ({
      open,
      triggerId,
      contentId,
      triggerRef,
      popperRef,
      placement,
      sideOffset,
      collisionPadding,
      maxWidth,
      scheduleOpen,
      openImmediate,
      scheduleClose,
      closeImmediate,
      cancelPendingOpen,
      clearTimers,
      isCoarsePointer,
    }),
    [
      open,
      triggerId,
      contentId,
      placement,
      sideOffset,
      collisionPadding,
      maxWidth,
      scheduleOpen,
      openImmediate,
      scheduleClose,
      closeImmediate,
      cancelPendingOpen,
      clearTimers,
      isCoarsePointer,
    ],
  );

  return <HoverCardContextProvider value={value}>{children}</HoverCardContextProvider>;
}

// ──────────────────────────────────────────────────────────────────────────
// HoverCardTrigger — Slot-or-span wrapper, wires hover/focus handlers + ARIA
// ──────────────────────────────────────────────────────────────────────────

export interface HoverCardTriggerProps
  extends Omit<
    ButtonHTMLAttributes<HTMLElement>,
    'aria-expanded' | 'aria-haspopup' | 'aria-controls'
  > {
  children: ReactNode;
  /**
   * When `true`, Slot-wraps the single React element child, merging hover/
   * focus handlers + ARIA onto it. Required when wrapping a link/avatar/etc.
   * without breaking the DOM. When `false` (default), renders a `<span>`.
   * NOTE: HoverCard is typically used to enrich an existing link or avatar,
   * so `asChild={true}` is the most common pattern (compare to Popover where
   * `asChild={false}` rendering a `<button>` is the more common default).
   */
  asChild?: boolean;
}

export const HoverCardTrigger = forwardRef<HTMLElement, HoverCardTriggerProps>(
  function HoverCardTrigger(
    { children, asChild = false, onPointerEnter, onPointerLeave, onPointerDown, onFocus, onBlur, ...rest },
    forwardedRef,
  ) {
    const ctx = useHoverCardContext('<HoverCardTrigger>');
    const {
      open,
      triggerId,
      contentId,
      triggerRef,
      popperRef,
      scheduleOpen,
      openImmediate,
      scheduleClose,
      cancelPendingOpen,
      closeImmediate,
      isCoarsePointer,
    } = ctx;

    const mergedRef = mergeRefs(
      forwardedRef,
      (node: HTMLElement | null) => {
        triggerRef.current = node;
      },
    );

    // Hover — only wire on fine-pointer devices. Touch users get the focus
    // path instead (tap-to-focus opens HoverCard if trigger is focusable).
    const handlePointerEnter = isCoarsePointer
      ? undefined
      : (event: React.PointerEvent<HTMLElement>) => {
          scheduleOpen();
          onPointerEnter?.(event);
        };
    const handlePointerLeave = isCoarsePointer
      ? undefined
      : (event: React.PointerEvent<HTMLElement>) => {
          scheduleClose();
          onPointerLeave?.(event);
        };

    // Cancel a pending open if the user clicks before the open delay fires
    // (Radix #1691 precedent — clicking should not pop a delayed HoverCard).
    const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
      cancelPendingOpen();
      onPointerDown?.(event);
    };

    // Focus path — instant open (no delay), explicit user intent per SC 2.1.1.
    // Bypass scheduleOpen entirely — that path honors openDelay/skipDelay
    // group state, which is wrong for keyboard focus (must be instant).
    const handleFocus = (event: React.FocusEvent<HTMLElement>) => {
      openImmediate();
      onFocus?.(event);
    };

    // Blur — only close if focus is moving OUTSIDE both trigger and content.
    // If the user is Tabbing INTO HoverCardContent, keep open.
    const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
      const next = event.relatedTarget as Node | null;
      if (next && popperRef.current?.contains(next)) {
        // Focus moved into content — keep HoverCard open.
        onBlur?.(event);
        return;
      }
      closeImmediate();
      onBlur?.(event);
    };

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
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          {children}
        </Slot>
      );
    }

    return (
      <span
        ref={mergedRef as React.Ref<HTMLSpanElement>}
        {...ariaProps}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      >
        {children}
      </span>
    );
  },
);

// ──────────────────────────────────────────────────────────────────────────
// HoverCardContent — portal + positioning + grace area handlers
// ──────────────────────────────────────────────────────────────────────────

export interface HoverCardContentProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'role' | 'aria-modal' | 'aria-labelledby' | 'title'
  > {
  /** Optional title — renders as `<Heading level={3}>` and wires `aria-labelledby`. */
  title?: string;
  /** Optional muted description rendered below the title. */
  description?: string;
  children?: ReactNode;
  /** Optional footer slot — typically meta info or action buttons. */
  footer?: ReactNode;
  className?: string;
}

export function HoverCardContent({
  title,
  description,
  children,
  footer,
  className,
  ...rest
}: HoverCardContentProps) {
  const ctx = useHoverCardContext('<HoverCardContent>');
  const {
    open,
    contentId,
    triggerRef,
    popperRef,
    placement,
    sideOffset,
    collisionPadding,
    maxWidth,
    scheduleClose,
    closeImmediate,
    clearTimers,
  } = ctx;

  const titleId = `${contentId}-title`;

  const { refs, floatingStyles, placement: actualPlacement } = useFloating({
    open,
    placement,
    offset: sideOffset,
    padding: collisionPadding,
  });
  const { setReference, setFloating } = refs;

  // Bridge triggerRef (set by HoverCardTrigger) into useFloating's reference
  // setter. Layout effect runs after HoverCardTrigger mounts its DOM node.
  useLayoutEffect(() => {
    if (!open) return;
    if (triggerRef.current) setReference(triggerRef.current);
  }, [open, triggerRef, setReference]);

  // Merged ref for the outer popper wrapper — attaches both useFloating's
  // setFloating callback (drives positioning) and our own popperRef (used by
  // HoverCardTrigger blur logic to detect focus moves into content).
  const mergedPopperRef = useCallback(
    (node: HTMLDivElement | null) => {
      popperRef.current = node;
      setFloating(node);
    },
    [popperRef, setFloating],
  );

  // Content hover handlers — keep HoverCard open while pointer is over
  // content (SC 1.4.13 hoverable). `clearTimers` cancels both the open
  // timer (defensive — should already be done) AND the close timer started
  // by trigger's `onPointerLeave`. The close timer is re-armed on content
  // `onPointerLeave` below (matches Tooltip precedent).
  const handleContentPointerEnter = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  const handleContentPointerLeave = useCallback(() => {
    scheduleClose();
  }, [scheduleClose]);

  // Content blur — if focus leaves both content AND trigger, close immediately.
  const handleContentBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      const next = event.relatedTarget as Node | null;
      if (
        next &&
        (popperRef.current?.contains(next) || triggerRef.current?.contains(next))
      ) {
        return;
      }
      closeImmediate();
    },
    [popperRef, triggerRef, closeImmediate],
  );

  if (!open) return null;

  return (
    <FloatingPortal>
      <div
        ref={mergedPopperRef}
        className={styles.root}
        style={floatingStyles}
        onPointerEnter={handleContentPointerEnter}
        onPointerLeave={handleContentPointerLeave}
        onBlur={handleContentBlur}
      >
        <div
          id={contentId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={title ? titleId : undefined}
          tabIndex={-1}
          data-placement={actualPlacement}
          className={cn(styles.content, className)}
          style={{ maxWidth }}
          {...rest}
        >
          {(title || description) && (
            <div className={styles.header}>
              {title && (
                <Heading id={titleId} level={3} size="md" className={styles.title}>
                  {title}
                </Heading>
              )}
              {description && (
                <Text variant="small" color="muted" className={styles.description}>
                  {description}
                </Text>
              )}
            </div>
          )}
          {children && <div className={styles.body}>{children}</div>}
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </div>
    </FloatingPortal>
  );
}
