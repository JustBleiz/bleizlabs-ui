'use client';

/**
 * Tooltip — modeless floating label shown on hover or keyboard focus.
 *
 * @layer complex-interactive (Phase 10 CI6)
 * @tokens --color-surface-raised, --color-text-primary, --color-border-subtle,
 *   --shadow-md, --radius-md, --z-tooltip, --duration-fast, --easing-default,
 *   --space-2, --space-3, --font-size-sm
 * @deps zero runtime deps — positioning math via own `utils/position.ts` +
 *   `utils/useFloating.ts` hook (D5/D25 + user E19 override: "też w całym
 *   projekcie unikaliśmy używania jakichkolwiek bibliotek, więc lepiej to
 *   przepisać i dostosować do naszej biblioteki niż nagle wrzucać zależność").
 *   No `@floating-ui/react`, no positioning library. Uses React 19 createPortal.
 * @a11y `role="tooltip"` on floating content (NOT on trigger); `aria-describedby`
 *   on trigger wired via useId to the tooltip element id; Escape hides tooltip
 *   WITHOUT losing trigger focus (SC 1.4.13 dismissable); grace area via
 *   configurable close delay allows pointer to travel from trigger into
 *   tooltip content (SC 1.4.13 hoverable); focus/blur are the keyboard
 *   trigger path (SC 1.4.13 focusable parity); `document.visibilitychange`
 *   + `window.blur` handlers hide tooltip on tab switch (Radix #705 / #2665);
 *   hover listeners suppressed on `(pointer: coarse)` devices — screen readers
 *   on touch access content via aria-describedby; disabled native buttons do
 *   not fire events → tooltip never shows (correct — use `aria-disabled` when
 *   the user needs to know WHY a control is disabled). Tooltip is modeless:
 *   no focus trap, no scroll lock, no background inert, no outside-click
 *   dismissal (not modal).
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 * @deviation Delay defaults to 700ms (not WAI-APG 1500ms). See D29 in docs/decisions.md.
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y via eslint-config-next ✓ |
 *   next build ✓ | Playwright suite EXECUTED in-repo (keyboard/focus/aria/
 *   regression `.spec.ts` quad, CI-gated) + axe-core smoke on the demo
 *   route. DEFERRED: manual NVDA sweep, iOS/Android device testing
 *   (Radix #1573/#2589/#1351).
 * @regressions tests/Tooltip.{keyboard,focus,aria,regression}.spec.md — 20
 *   Radix closed-issue cases mapped (#620, #705, #617, #1691, #1914, #1077,
 *   #2029, #2372, #1920, #1573, #2589, #1351, #2959, #2665, #899, #1010,
 *   #1476, #1612, #3081, #2727). 11 marked test.skip with PLAYGROUND-DEP
 *   rationale (require Dialog/DropdownMenu/touch device to exercise).
 * @example
 *   // Standalone (uncontrolled)
 *   <Tooltip content="Save file (Ctrl+S)">
 *     <Button icon={<SaveIcon />} iconOnly aria-label="Save" />
 *   </Tooltip>
 *
 *   // Grouped toolbar — instant transitions after first hover
 *   <TooltipProvider>
 *     <Tooltip content="Bold"><Button icon={<B />} iconOnly aria-label="Bold" /></Tooltip>
 *     <Tooltip content="Italic"><Button icon={<I />} iconOnly aria-label="Italic" /></Tooltip>
 *   </TooltipProvider>
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import { useFloating } from '../../utils/useFloating';
import { type Placement } from '../../utils/position';
import styles from './Tooltip.module.scss';

export type TooltipPlacement = Placement;

// ──────────────────────────────────────────────────────────────────────────
// TooltipProvider — optional delay-group coordinator
// ──────────────────────────────────────────────────────────────────────────

interface TooltipGroupContextValue {
  /** Group-wide delay in ms — wins over per-instance `delayDuration`. */
  delayDuration: number;
  /**
   * Returns true when the skip-delay window is active — either another
   * tooltip is currently open, or one was closed within `skipDelayDuration`
   * ms. Callers use this to decide whether to open instantly.
   */
  shouldSkipDelay: () => boolean;
  /** Called by a Tooltip when it opens — increments the group open count. */
  onOpen: () => void;
  /** Called by a Tooltip when it closes — decrements count + stamps lastClose. */
  onClose: () => void;
}

const TooltipGroupContext = createContext<TooltipGroupContextValue | null>(null);

export interface TooltipProviderProps {
  /** Tooltip subtree sharing the open-delay group state. */
  children: ReactNode;
  /**
   * Initial open delay in ms before the first tooltip in the group shows on
   * hover. Focus triggers ignore this delay. Default `700` (Radix convention —
   * APG recommends ~1500ms but that feels sluggish in practice).
   */
  delayDuration?: number;
  /**
   * Time window in ms after any tooltip in the group closes during which
   * subsequent tooltips open without delay. Enables snappy toolbar UX.
   * Default `300`.
   */
  skipDelayDuration?: number;
}

/**
 * TooltipProvider — wraps a subtree (typically a toolbar) to coordinate
 * open-delay skipping across sibling Tooltips. Within the provider, hovering
 * from one tooltip's trigger to another within `skipDelayDuration` ms opens
 * the next tooltip instantly (Radix convention, #2372). Outside a provider,
 * each Tooltip runs its own per-instance delay independently.
 */
export function TooltipProvider({
  children,
  delayDuration = 700,
  skipDelayDuration = 300,
}: TooltipProviderProps) {
  // Refs live inside the provider — consumers access them only through the
  // memoized callbacks below. This avoids React 19's `react-hooks/immutability`
  // rule (which forbids mutating values obtained from useContext) while still
  // letting the group coordinate state across sibling tooltips.
  const lastCloseRef = useRef(0);
  const openCountRef = useRef(0);

  const shouldSkipDelay = useCallback(
    () => openCountRef.current > 0 || Date.now() - lastCloseRef.current < skipDelayDuration,
    [skipDelayDuration],
  );

  const onOpen = useCallback(() => {
    openCountRef.current += 1;
  }, []);

  const onClose = useCallback(() => {
    openCountRef.current = Math.max(0, openCountRef.current - 1);
    lastCloseRef.current = Date.now();
  }, []);

  const value = useMemo<TooltipGroupContextValue>(
    () => ({ delayDuration, shouldSkipDelay, onOpen, onClose }),
    [delayDuration, shouldSkipDelay, onOpen, onClose],
  );

  return <TooltipGroupContext.Provider value={value}>{children}</TooltipGroupContext.Provider>;
}

// ──────────────────────────────────────────────────────────────────────────
// useCoarsePointer — subscribes to (pointer: coarse) matchMedia.
// Uses useSyncExternalStore per React 19's rule against synchronous setState
// in effects for external-store subscriptions. SSR-safe: server snapshot
// returns `false` so the initial render assumes a fine pointer device.
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
// Tooltip
// ──────────────────────────────────────────────────────────────────────────

export interface TooltipProps {
  /**
   * The trigger element — cloned via Slot primitive. Must be a single React
   * element that forwards ref (native intrinsic elements always do; custom
   * components must use forwardRef). Strings, fragments, and arrays render
   * nothing per Slot's single-element constraint.
   */
  children: ReactNode;
  /** Tooltip body. Can be string or arbitrary JSX (links, icons, code snippets). */
  content: ReactNode;
  /** Controlled open state. When provided, component is controlled and consumer owns state. */
  open?: boolean;
  /** Uncontrolled initial open state. Ignored when `open` is provided. Default `false`. */
  defaultOpen?: boolean;
  /** Fires on every open transition (hover, focus, escape, programmatic). */
  onOpenChange?: (open: boolean) => void;
  /**
   * Preferred placement. Positioning engine flips to the opposite axis and
   * shifts along the cross-axis if the preferred placement would clip the
   * viewport. Default `'top'`.
   */
  placement?: TooltipPlacement;
  /** Gap in pixels between trigger edge and tooltip edge. Default `6`. */
  sideOffset?: number;
  /**
   * Open delay in ms — ignored when inside a `TooltipProvider` (provider
   * delay + skip-window wins). Default `700`.
   */
  delayDuration?: number;
  /**
   * Grace area close delay in ms — how long the tooltip stays open after
   * mouseleave on the trigger, allowing the pointer to travel into tooltip
   * content. Default `100`. Set `0` to disable the grace area. Required by
   * SC 1.4.13 "hoverable" for interactive tooltip content.
   */
  closeDelay?: number;
  /** Max width CSS value. Default `'min(320px, 90vw)'`. */
  maxWidth?: string;
  /** Additional className composed onto the tooltip content surface. */
  className?: string;
}

export function Tooltip({
  children,
  content,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  placement = 'top',
  sideOffset = 6,
  delayDuration,
  closeDelay = 100,
  maxWidth = 'min(320px, 90vw)',
  className,
}: TooltipProps) {
  const tooltipId = useId();
  const group = useContext(TooltipGroupContext);
  const effectiveDelay = delayDuration ?? group?.delayDuration ?? 700;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

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

  const setOpen = useCallback(
    (next: boolean) => {
      if (next === open) return;
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
      if (group) {
        if (next) group.onOpen();
        else group.onClose();
      }
    },
    [open, isControlled, onOpenChange, group],
  );

  const scheduleOpen = useCallback(() => {
    clearTimers();
    // Inside a provider, if another tooltip is currently open OR closed within
    // the skip-delay window, open this one instantly (toolbar warm-up pattern).
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

  // Instant close (no grace area) — used by focus out and Escape.
  const closeImmediate = useCallback(() => {
    clearTimers();
    setOpen(false);
  }, [clearTimers, setOpen]);

  const { refs, floatingStyles } = useFloating({
    open,
    placement,
    offset: sideOffset,
  });
  // Destructure setters into locals — the `react-hooks/refs` rule false-positives
  // on `refs.setFloating` because it pattern-matches `*.setXxx` as if it were a
  // React ref. These are plain function setters returned by our own hook.
  const { setReference, setFloating } = refs;

  // Suppress hover listeners on coarse pointer devices (touch). Screen readers
  // still access content via aria-describedby regardless of visual show/hide.
  // Focus/blur handlers are always wired so tap-to-focus on iOS Safari works.
  // `useSyncExternalStore` is the React 19-sanctioned way to subscribe to an
  // external store (matchMedia) — no setState-in-effect lint flag.
  const isCoarsePointer = useCoarsePointer();

  // Escape on document — does NOT steal focus from trigger (SC 1.4.13).
  // Window blur + visibilitychange — hide on tab switch (Radix #705 / #2665).
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeImmediate();
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
    };
  }, [open, closeImmediate]);

  // Cleanup pending timers on unmount to avoid setState-on-unmounted warnings.
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const triggerHandlers = {
    // Hover — only wire on fine pointer devices.
    onPointerEnter: isCoarsePointer ? undefined : scheduleOpen,
    onPointerLeave: isCoarsePointer ? undefined : scheduleClose,
    // Cancel a pending open if the user clicks before delay fires (Radix #1691).
    onPointerDown: () => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
    },
    // Keyboard path — always instant, no delay (focus is an explicit intent).
    onFocus: () => {
      clearTimers();
      setOpen(true);
    },
    onBlur: closeImmediate,
    'aria-describedby': open ? tooltipId : undefined,
  };

  // Tooltip content handlers — sustain "open" while pointer is over the tooltip
  // itself (SC 1.4.13 hoverable — the grace area enables travel from trigger
  // into content; these handlers keep it open once the pointer arrives).
  const floatingHandlers = {
    onPointerEnter: clearTimers,
    onPointerLeave: scheduleClose,
  };

  return (
    <>
      <Slot ref={setReference} {...triggerHandlers}>
        {children}
      </Slot>
      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={setFloating}
              className={styles.root}
              style={floatingStyles}
              {...floatingHandlers}
            >
              <div
                id={tooltipId}
                role="tooltip"
                className={cn(styles.content, className)}
                style={{ maxWidth }}
              >
                {content}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
