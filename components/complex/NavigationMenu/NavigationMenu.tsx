'use client';

/**
 * NavigationMenu — accessible navigation menubar per WAI-ARIA APG /menubar/.
 *
 * @layer complex-interactive (Phase 10 CI10)
 * @tokens --color-surface, --color-surface-raised, --color-surface-hover,
 *   --color-text-primary, --color-text-muted, --color-border-subtle, --shadow-lg,
 *   --radius-md, --radius-sm, --focus-ring, --duration-fast, --easing-default,
 *   --space-1..5, --font-size-sm, --font-size-xs, --z-popover, --color-brand
 * @deps zero runtime deps. Positioning via `utils/position.ts` + `utils/useFloating.ts`
 *   (E19/E20 primitive). Portal + dismiss + focus + context via shared
 *   `utils/floating/` composable primitives (E23 refactor): `createFloatingContext`
 *   + `useFloatingFocus` + `useFloatingDismiss` + `FloatingPortal`. **Skipped**
 *   `useFloatingState` — NavigationMenu state is "which submenu value is open"
 *   (`string | null`), not the boolean shape that `useFloatingState` provides.
 *   Value-state (`openValue` / `setOpenValue`) now uses the shared
 *   `useFloatingValueState<string>` primitive (E29 extraction — post-Tabs E26 /
 *   Select E27 / Combobox E28, Rule of Three strict pass with 4 consumers).
 *   Hook encapsulates the controlled/uncontrolled hybrid, identity-guarded
 *   setter, and `latestValueRef` pattern that originally lived inline here.
 *   Public `onValueChange` already accepts `string | null` (null = all closed),
 *   so it passes through the hook boundary with no wrapper. **Validate-in-production
 *   #2** for E23 primitives (HoverCard E24 was #1) — first consumer to combine
 *   `useFloatingFocus` + `useFloatingDismiss` together. Inline timer logic +
 *   delay group + `useCoarsePointer` + roving tabindex DOM-attribute updates
 *   mirror the HoverCard (timer/group) and DropdownMenu (DOM-query keyboard
 *   handling) precedents. Own Slot primitive for `asChild` polymorphism on
 *   Trigger and Link.
 * @a11y APG `/menubar/` — `<ul role="menubar" aria-label>` (TS-required label) with
 *   `aria-orientation="horizontal"` (default, omittable). Items: `<li role="none">`
 *   wrappers around `<button role="menuitem">` triggers OR `<a role="menuitem">`
 *   standalone links. Roving tabindex managed via DOM `tabindex` attribute updates
 *   (`0` on active item, `-1` on rest) — no React re-render churn. Triggers with
 *   submenu carry `aria-haspopup="menu"` + `aria-expanded` + `aria-controls`.
 *   Submenus: `<div role="menu" aria-labelledby={triggerId}>`. Standalone links
 *   support `active?` prop wiring `aria-current="page"`. Disabled items use
 *   `aria-disabled="true"` (NOT native `disabled` — APG prefers aria, focusable).
 *
 *   Keyboard model (APG verbatim):
 *   - Right Arrow on menubar item: next menubar item (wraps end→start)
 *   - Left Arrow on menubar item: prev menubar item (wraps start→end)
 *   - Right Arrow inside submenu: closes current, advances to next menubar item +
 *     opens its submenu (if any)
 *   - Left Arrow inside submenu: closes submenu, returns focus to parent menubar item
 *   - Down/Enter/Space on trigger with submenu: opens submenu, focuses FIRST item
 *   - Up Arrow on trigger with submenu: opens submenu, focuses LAST item
 *   - Down/Up inside submenu: cycle items (skip disabled, wraparound)
 *   - Home/End: scope-aware (first/last menubar item OR first/last submenu item)
 *   - Escape inside submenu: closes submenu, returns focus to parent menubar item
 *   - Tab: closes any open submenu and lets browser propagate Tab — exits menubar
 *   - Printable char: typeahead, 500ms reset, scope-aware (menubar OR submenu)
 *
 *   Hover (Radix convention, NOT APG-mandated):
 *   - PointerEnter on trigger: scheduleOpen after `delayDuration` (default 200ms,
 *     faster than HoverCard's 700ms — nav UX expects snappy reveal)
 *   - PointerLeave on trigger: scheduleClose after grace period (default 300ms)
 *   - PointerEnter on content: clearTimers (grace area for pointer travel)
 *   - PointerLeave on content: scheduleClose
 *   - Touch (`pointer: coarse`): hover skipped entirely → focus path only
 *   - Focus on trigger: openImmediate (no delay — SC 2.1.1 explicit intent)
 *   - Inside `NavigationMenuProvider`: skip-delay window mirrors HoverCardProvider
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y via eslint-config-next ✓ |
 *   next build ✓ — DEFERRED: Playwright execution (per E15 scope decision),
 *   axe-core runtime sweep, manual NVDA sweep, iOS/Android device testing.
 * @regressions tests/NavigationMenu.{keyboard,focus,aria,regression}.spec.md —
 *   22 regression cases mapped (NM-R01..R22). See `docs/_tmp/navigation-menu-spec.md`
 *   Phase 1 Explore output for full bug+fix mapping.
 * @example
 *   <NavigationMenu>
 *     <NavigationMenuList aria-label="Main">
 *       <NavigationMenuItem value="products">
 *         <NavigationMenuTrigger>Products</NavigationMenuTrigger>
 *         <NavigationMenuContent>
 *           <NavigationMenuLink href="/products/web">Web</NavigationMenuLink>
 *           <NavigationMenuLink href="/products/mobile">Mobile</NavigationMenuLink>
 *         </NavigationMenuContent>
 *       </NavigationMenuItem>
 *       <NavigationMenuItem value="pricing">
 *         <NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>
 *       </NavigationMenuItem>
 *     </NavigationMenuList>
 *   </NavigationMenu>
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
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type LiHTMLAttributes,
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
  useFloatingDismiss,
  useFloatingFocus,
  useFloatingValueState,
  FloatingPortal,
} from '../../utils/floating';
import styles from './NavigationMenu.module.scss';

export type NavigationMenuPlacement = Placement;
export type NavigationMenuOrientation = 'horizontal' | 'vertical';

// ──────────────────────────────────────────────────────────────────────────
// NavigationMenuProvider — optional delay-group coordinator (HoverCard mirror)
// ──────────────────────────────────────────────────────────────────────────

interface NavigationMenuGroupContextValue {
  /** Group-wide open delay in ms — wins over per-instance `delayDuration`. */
  openDelay: number;
  /**
   * Returns true when the skip-delay window is active — either another
   * NavigationMenu submenu is currently open, or one was closed within
   * `skipDelayDuration` ms. Within the window, hovering a new trigger opens
   * its submenu instantly.
   */
  shouldSkipDelay: () => boolean;
  /** Called when any submenu opens — increments group open count. */
  onOpen: () => void;
  /** Called when any submenu closes — decrements count + stamps lastClose. */
  onClose: () => void;
}

const NavigationMenuGroupContext = createContext<NavigationMenuGroupContextValue | null>(
  null,
);

export interface NavigationMenuProviderProps {
  children: ReactNode;
  /**
   * Initial open delay in ms before the first submenu in the group shows on
   * hover. Focus triggers always ignore this delay. Default `200` (Radix nav
   * convention — faster than HoverCard's 700ms because nav menus expect
   * snappier reveal).
   */
  openDelay?: number;
  /**
   * Time window in ms after any submenu in the group closes during which
   * subsequent hovers open instantly. Enables snappy menubar UX. Default `300`.
   */
  skipDelayDuration?: number;
}

/**
 * NavigationMenuProvider — wraps a subtree (typically a top-level nav layout)
 * to coordinate open-delay skipping across sibling NavigationMenus / triggers.
 * Within the provider, hovering from one trigger to another within
 * `skipDelayDuration` ms opens the next submenu instantly. Outside a provider,
 * each NavigationMenu runs its own per-instance delay independently.
 *
 * Refs live INSIDE the provider closure — consumers access them only through
 * memoized callbacks. This satisfies React 19's `react-hooks/immutability`
 * rule (which forbids mutating values obtained from useContext) while still
 * letting the group coordinate state across siblings.
 */
export function NavigationMenuProvider({
  children,
  openDelay = 200,
  skipDelayDuration = 300,
}: NavigationMenuProviderProps) {
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

  const value = useMemo<NavigationMenuGroupContextValue>(
    () => ({ openDelay, shouldSkipDelay, onOpen, onClose }),
    [openDelay, shouldSkipDelay, onOpen, onClose],
  );

  return (
    <NavigationMenuGroupContext.Provider value={value}>
      {children}
    </NavigationMenuGroupContext.Provider>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// useCoarsePointer — `(pointer: coarse)` matchMedia subscription via
// useSyncExternalStore (HoverCard/Tooltip precedent).
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
// NavigationMenu root context — shared across List, Item, Trigger, Content, Link
// ──────────────────────────────────────────────────────────────────────────

interface NavigationMenuRootContextValue {
  /** Currently open submenu value, or null when no submenu is open. */
  openValue: string | null;
  /** Sets which submenu is open (null to close all). */
  setOpenValue: (value: string | null) => void;
  orientation: NavigationMenuOrientation;
  delayDuration: number;
  hoverTrigger: boolean;
  isCoarsePointer: boolean;
  /** Group-aware open delay (provider wins over per-instance). */
  effectiveOpenDelay: () => number;
  /** Notify provider of open/close transitions. */
  notifyGroupOpen: () => void;
  notifyGroupClose: () => void;
  /** Shared close-delay timer (per-root, cleared by any item interaction). */
  scheduleClose: () => void;
  cancelClose: () => void;
  /** Listref — the menubar `<ul>` for roving tabindex DOM queries. */
  listRef: RefObject<HTMLUListElement | null>;
}

const [NavigationMenuRootProvider, useNavigationMenuRoot] =
  createFloatingContext<NavigationMenuRootContextValue>('NavigationMenu');

// ──────────────────────────────────────────────────────────────────────────
// NavigationMenu — state holder + Provider integration + close-delay timer
// ──────────────────────────────────────────────────────────────────────────

export interface NavigationMenuProps {
  children: ReactNode;
  /** Controlled open submenu value. When provided, component is controlled. */
  value?: string | null;
  /** Uncontrolled initial open submenu value. Default `null` (all closed). */
  defaultValue?: string | null;
  /** Fires whenever the open submenu changes. */
  onValueChange?: (value: string | null) => void;
  /**
   * Menubar orientation. Default `'horizontal'`. Vertical orientation is API
   * scaffold only in MVP — submenu placement and arrow-key axis swap are not
   * yet implemented (Phase 3.5).
   */
  orientation?: NavigationMenuOrientation;
  /**
   * Hover open delay in ms — ignored when inside a `NavigationMenuProvider`
   * (provider delay wins). Focus triggers always ignore this delay. Default
   * `200` (Radix convention, snappier than HoverCard's 700ms).
   */
  delayDuration?: number;
  /**
   * Grace area close delay in ms — how long submenu stays open after pointer
   * leaves trigger (allows pointer travel into content). Content `pointerenter`
   * cancels the timer. Default `300`.
   */
  closeDelay?: number;
  /**
   * Skip-delay window (per-root) in ms — once one submenu closes, hovering
   * a sibling within this window opens it instantly. Default `300`. Mirrored
   * by `NavigationMenuProvider` for cross-NavigationMenu coordination.
   */
  skipDelayDuration?: number;
  /**
   * When `false`, hover does NOT open submenus — only click/keyboard. Touch
   * users always get the focus path (coarse pointer skips hover regardless).
   * Default `true`.
   */
  hoverTrigger?: boolean;
  className?: string;
}

export function NavigationMenu({
  children,
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  orientation = 'horizontal',
  delayDuration = 200,
  closeDelay = 300,
  skipDelayDuration = 300,
  hoverTrigger = true,
  className,
}: NavigationMenuProps) {
  // E29: inline `useState<string | null>` + manual isControlled + latestValueRef
  // pattern extracted into shared `useFloatingValueState<T>` once NavigationMenu
  // (E25), Tabs (E26), Select (E27), and Combobox (E28) converged on the same
  // shape. Public `onValueChange` already accepts `string | null` (null =
  // closed submenu), so we pass it through directly — no boundary wrapper.
  const { value: openValue, setValue: setOpenValue } = useFloatingValueState<string>({
    controlledValue,
    defaultValue: defaultValue ?? null,
    onValueChange,
  });

  const listRef = useRef<HTMLUListElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCloseRef = useRef(0);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    if (closeDelay === 0) {
      setOpenValue(null);
      lastCloseRef.current = Date.now();
    } else {
      closeTimerRef.current = setTimeout(() => {
        setOpenValue(null);
        lastCloseRef.current = Date.now();
      }, closeDelay);
    }
  }, [cancelClose, closeDelay, setOpenValue]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => cancelClose();
  }, [cancelClose]);

  const group = useContext(NavigationMenuGroupContext);

  // Effective delay: group's openDelay if inside provider AND skip window not
  // active, else per-root delayDuration. Computed via callback so callers
  // always read live group state.
  const effectiveOpenDelay = useCallback((): number => {
    if (group?.shouldSkipDelay()) return 0;
    // Per-root skip-delay window: even outside a provider, once one submenu
    // closes, hovering another within `skipDelayDuration` ms opens instantly.
    if (Date.now() - lastCloseRef.current < skipDelayDuration) return 0;
    return group?.openDelay ?? delayDuration;
  }, [group, delayDuration, skipDelayDuration]);

  const notifyGroupOpen = useCallback(() => {
    group?.onOpen();
  }, [group]);

  const notifyGroupClose = useCallback(() => {
    group?.onClose();
  }, [group]);

  const isCoarsePointer = useCoarsePointer();

  const value = useMemo<NavigationMenuRootContextValue>(
    () => ({
      openValue,
      setOpenValue,
      orientation,
      delayDuration,
      hoverTrigger,
      isCoarsePointer,
      effectiveOpenDelay,
      notifyGroupOpen,
      notifyGroupClose,
      scheduleClose,
      cancelClose,
      listRef,
    }),
    [
      openValue,
      setOpenValue,
      orientation,
      delayDuration,
      hoverTrigger,
      isCoarsePointer,
      effectiveOpenDelay,
      notifyGroupOpen,
      notifyGroupClose,
      scheduleClose,
      cancelClose,
    ],
  );

  return (
    <NavigationMenuRootProvider value={value}>
      <div className={cn(styles.root, className)} data-orientation={orientation}>
        {children}
      </div>
    </NavigationMenuRootProvider>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Roving tabindex helpers — DOM-attribute updates, no React re-render
// ──────────────────────────────────────────────────────────────────────────

const MENUBAR_ITEM_SELECTOR = '[role="menuitem"][data-menubar-item="true"]';

function getMenubarItems(list: HTMLElement): HTMLElement[] {
  return Array.from(list.querySelectorAll<HTMLElement>(MENUBAR_ITEM_SELECTOR));
}

function setRovingTabindex(items: HTMLElement[], activeIndex: number): void {
  items.forEach((item, idx) => {
    item.setAttribute('tabindex', idx === activeIndex ? '0' : '-1');
  });
}

// ──────────────────────────────────────────────────────────────────────────
// NavigationMenuList — `<ul role="menubar">` with arrow-key roving + typeahead
// ──────────────────────────────────────────────────────────────────────────

export interface NavigationMenuListProps
  extends Omit<HTMLAttributes<HTMLUListElement>, 'role' | 'aria-orientation'> {
  children: ReactNode;
  /** REQUIRED — accessible name for the menubar (APG `/menubar/` mandate). */
  'aria-label': string;
  className?: string;
}

export const NavigationMenuList = forwardRef<HTMLUListElement, NavigationMenuListProps>(
  function NavigationMenuList({ children, className, onKeyDown, ...rest }, forwardedRef) {
    const ctx = useNavigationMenuRoot('<NavigationMenuList>');
    const { orientation, listRef, setOpenValue, openValue, cancelClose } = ctx;

    const mergedRef = mergeRefs(forwardedRef, (node: HTMLUListElement | null) => {
      listRef.current = node;
    });

    const typeaheadBufferRef = useRef<string>('');
    const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize roving tabindex ONCE on mount — first item gets tabindex="0".
    // Subsequent updates flow through focusItem() (List arrow keys), Trigger's
    // handleFocus, and Link's handleFocus, which all call setRovingTabindex
    // explicitly. Empty dep array prevents this from running on every render
    // (which would mutate DOM tabindex attributes during interaction).
    useLayoutEffect(() => {
      const list = listRef.current;
      if (!list) return;
      const items = getMenubarItems(list);
      if (items.length === 0) return;
      const hasActive = items.some((it) => it.getAttribute('tabindex') === '0');
      if (!hasActive) {
        setRovingTabindex(items, 0);
      }
      // listRef is captured at mount; intentionally exhaustive-deps disabled
      // here because re-running on listRef identity changes would defeat
      // the once-on-mount guarantee.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cleanup typeahead timer on unmount.
    useEffect(() => {
      return () => {
        if (typeaheadTimerRef.current) {
          clearTimeout(typeaheadTimerRef.current);
          typeaheadTimerRef.current = null;
        }
      };
    }, []);

    const focusItem = useCallback(
      (items: HTMLElement[], index: number) => {
        const target = items[index];
        if (!target) return;
        setRovingTabindex(items, index);
        target.focus();
      },
      [],
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLUListElement>) => {
        const list = listRef.current;
        if (!list) {
          onKeyDown?.(event);
          return;
        }
        const items = getMenubarItems(list);
        if (items.length === 0) {
          onKeyDown?.(event);
          return;
        }

        const activeIndex = items.findIndex((el) => el === document.activeElement);
        // If focus isn't on a menubar item (e.g., focus is inside an open
        // submenu), defer to that submenu's own keyboard handler.
        if (activeIndex === -1) {
          onKeyDown?.(event);
          return;
        }

        const isHorizontal = orientation === 'horizontal';
        const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
        const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

        switch (event.key) {
          case nextKey: {
            event.preventDefault();
            cancelClose();
            const next = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
            focusItem(items, next);
            // If a submenu is already open, switch to next item's submenu —
            // BUT only if the next item is a Trigger with aria-haspopup="menu".
            // Standalone link items have data-menu-value but no submenu, so
            // setting openValue to a link's value would leave stale state
            // with no Content rendered. Close the open submenu instead.
            const nextItem = items[next];
            if (openValue !== null && nextItem) {
              const nextValue = nextItem.getAttribute('data-menu-value');
              const nextHasSubmenu =
                nextItem.getAttribute('aria-haspopup') === 'menu';
              if (nextValue && nextHasSubmenu) {
                setOpenValue(nextValue);
              } else {
                setOpenValue(null);
              }
            }
            return;
          }
          case prevKey: {
            event.preventDefault();
            cancelClose();
            const prev = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
            focusItem(items, prev);
            const prevItem = items[prev];
            if (openValue !== null && prevItem) {
              const prevValue = prevItem.getAttribute('data-menu-value');
              const prevHasSubmenu =
                prevItem.getAttribute('aria-haspopup') === 'menu';
              if (prevValue && prevHasSubmenu) {
                setOpenValue(prevValue);
              } else {
                setOpenValue(null);
              }
            }
            return;
          }
          case 'Home': {
            event.preventDefault();
            focusItem(items, 0);
            return;
          }
          case 'End': {
            event.preventDefault();
            focusItem(items, items.length - 1);
            return;
          }
          default:
            break;
        }

        // Typeahead — printable single-character keys.
        if (
          event.key.length === 1 &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) {
          const char = event.key.toLowerCase();
          typeaheadBufferRef.current += char;
          if (typeaheadTimerRef.current) clearTimeout(typeaheadTimerRef.current);
          typeaheadTimerRef.current = setTimeout(() => {
            typeaheadBufferRef.current = '';
            typeaheadTimerRef.current = null;
          }, 500);

          const buffer = typeaheadBufferRef.current;
          const searchFrom =
            activeIndex >= 0 ? activeIndex + (buffer.length === 1 ? 1 : 0) : 0;
          const rotated = [
            ...items.slice(searchFrom),
            ...items.slice(0, searchFrom),
          ];
          const match = rotated.find((item) => {
            const textValue =
              item.getAttribute('data-text-value') ?? item.textContent ?? '';
            return textValue.toLowerCase().startsWith(buffer);
          });
          if (match) {
            event.preventDefault();
            const matchIndex = items.indexOf(match);
            focusItem(items, matchIndex);
          }
        }

        onKeyDown?.(event);
      },
      [orientation, focusItem, openValue, setOpenValue, cancelClose, listRef, onKeyDown],
    );

    return (
      <ul
        ref={mergedRef}
        role="menubar"
        aria-orientation={orientation}
        className={cn(styles.list, className)}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </ul>
    );
  },
);

// ──────────────────────────────────────────────────────────────────────────
// NavigationMenuItem — `<li role="none">` wrapper + per-item context
// ──────────────────────────────────────────────────────────────────────────

interface NavigationMenuItemContextValue {
  value: string;
  triggerId: string;
  contentId: string;
  triggerRef: RefObject<HTMLElement | null>;
  popperRef: RefObject<HTMLDivElement | null>;
  hasSubmenu: boolean;
  registerSubmenu: () => void;
}

const [NavigationMenuItemProvider, useNavigationMenuItem] =
  createFloatingContext<NavigationMenuItemContextValue>('NavigationMenuItem');

export interface NavigationMenuItemProps
  extends Omit<LiHTMLAttributes<HTMLLIElement>, 'role'> {
  /** Unique id of this item within the menubar. Used as the open-state value. */
  value: string;
  children: ReactNode;
  className?: string;
}

export function NavigationMenuItem({
  value,
  children,
  className,
  ...rest
}: NavigationMenuItemProps) {
  const reactId = useId();
  const triggerId = `${reactId}-trigger`;
  const contentId = `${reactId}-content`;

  const triggerRef = useRef<HTMLElement | null>(null);
  const popperRef = useRef<HTMLDivElement | null>(null);
  const [hasSubmenu, setHasSubmenu] = useState(false);

  const registerSubmenu = useCallback(() => {
    setHasSubmenu(true);
  }, []);

  const itemValue = useMemo<NavigationMenuItemContextValue>(
    () => ({
      value,
      triggerId,
      contentId,
      triggerRef,
      popperRef,
      hasSubmenu,
      registerSubmenu,
    }),
    [value, triggerId, contentId, hasSubmenu, registerSubmenu],
  );

  return (
    <NavigationMenuItemProvider value={itemValue}>
      <li role="none" className={cn(styles.item, className)} {...rest}>
        {children}
      </li>
    </NavigationMenuItemProvider>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// NavigationMenuTrigger — `<button role="menuitem">` opens submenu
// ──────────────────────────────────────────────────────────────────────────

export interface NavigationMenuTriggerProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'aria-expanded' | 'aria-haspopup' | 'aria-controls' | 'role'
  > {
  children: ReactNode;
  /**
   * Override text used for menubar typeahead matching. When omitted, the
   * trigger's `textContent` is used.
   */
  textValue?: string;
  /**
   * When `true`, Slot-wraps the single React element child, merging ARIA and
   * event handlers. When `false` (default), renders a native `<button>`.
   */
  asChild?: boolean;
  className?: string;
}

export const NavigationMenuTrigger = forwardRef<HTMLElement, NavigationMenuTriggerProps>(
  function NavigationMenuTrigger(
    {
      children,
      textValue,
      asChild = false,
      onClick,
      onKeyDown,
      onPointerEnter,
      onPointerLeave,
      onFocus,
      className,
      disabled,
      ...rest
    },
    forwardedRef,
  ) {
    const root = useNavigationMenuRoot('<NavigationMenuTrigger>');
    const item = useNavigationMenuItem('<NavigationMenuTrigger>');
    const {
      openValue,
      setOpenValue,
      hoverTrigger,
      isCoarsePointer,
      effectiveOpenDelay,
      notifyGroupOpen,
      notifyGroupClose,
      scheduleClose,
      cancelClose,
    } = root;
    const { value, triggerId, contentId, triggerRef, registerSubmenu } = item;

    // Register synchronously (useLayoutEffect, not useEffect) so any sibling
    // NavigationMenuLink reads `hasSubmenu === true` BEFORE the first paint.
    // Otherwise the Link briefly registers itself as a standalone menubar
    // item (taking a roving tabindex slot) on first render, then corrects
    // on the next render — visible flash + roving-tabindex churn.
    useLayoutEffect(() => {
      registerSubmenu();
    }, [registerSubmenu]);

    const isOpen = openValue === value;
    const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cancelPendingOpen = useCallback(() => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
    }, []);

    // Track open transitions for group notifications.
    const wasOpenRef = useRef(false);
    useEffect(() => {
      if (isOpen && !wasOpenRef.current) {
        notifyGroupOpen();
        wasOpenRef.current = true;
      } else if (!isOpen && wasOpenRef.current) {
        notifyGroupClose();
        wasOpenRef.current = false;
      }
    }, [isOpen, notifyGroupOpen, notifyGroupClose]);

    // Cleanup pending open timer + group decrement on unmount.
    useEffect(() => {
      return () => {
        cancelPendingOpen();
        if (wasOpenRef.current) {
          notifyGroupClose();
          wasOpenRef.current = false;
        }
      };
    }, [cancelPendingOpen, notifyGroupClose]);

    const mergedRef = mergeRefs(forwardedRef, (node: HTMLElement | null) => {
      triggerRef.current = node;
    });

    const scheduleOpen = useCallback(() => {
      cancelPendingOpen();
      cancelClose();
      const delay = effectiveOpenDelay();
      if (delay === 0) {
        setOpenValue(value);
      } else {
        openTimerRef.current = setTimeout(() => {
          setOpenValue(value);
        }, delay);
      }
    }, [cancelPendingOpen, cancelClose, effectiveOpenDelay, setOpenValue, value]);

    const openImmediate = useCallback(() => {
      cancelPendingOpen();
      cancelClose();
      setOpenValue(value);
    }, [cancelPendingOpen, cancelClose, setOpenValue, value]);

    // Click toggles open/close. Always immediate (no delay).
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        if (disabled) return;
        cancelPendingOpen();
        if (isOpen) {
          setOpenValue(null);
        } else {
          setOpenValue(value);
        }
        onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>);
      },
      [disabled, cancelPendingOpen, isOpen, setOpenValue, value, onClick],
    );

    // Keyboard — APG menubar:
    //  - Enter/Space/ArrowDown → open submenu, focus FIRST item (via getFocusTarget)
    //  - ArrowUp → open submenu, focus LAST item
    // Left/Right arrows are handled by the menubar List handler — we don't
    // intercept them here.
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLElement>) => {
        if (disabled) return;
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
          event.preventDefault();
          // Both first-item-focus and last-item-focus paths use the same
          // openValue — Content reads `data-open-reason` from trigger to
          // pick first vs last in `getFocusTarget`.
          if (triggerRef.current) {
            triggerRef.current.setAttribute('data-open-reason', 'first');
          }
          openImmediate();
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          if (triggerRef.current) {
            triggerRef.current.setAttribute('data-open-reason', 'last');
          }
          openImmediate();
        }
        onKeyDown?.(event as unknown as React.KeyboardEvent<HTMLButtonElement>);
      },
      [disabled, openImmediate, triggerRef, onKeyDown],
    );

    // Hover handlers — only on fine-pointer devices when hoverTrigger is on.
    const handlePointerEnter = useCallback(
      (event: React.PointerEvent<HTMLElement>) => {
        if (!hoverTrigger || isCoarsePointer || disabled) {
          onPointerEnter?.(event as unknown as React.PointerEvent<HTMLButtonElement>);
          return;
        }
        // If pointer-entering a sibling trigger while another submenu is
        // already open, switch instantly (no delay) and clear close timer.
        if (openValue !== null && openValue !== value) {
          cancelClose();
          if (triggerRef.current) {
            triggerRef.current.setAttribute('data-open-reason', 'first');
          }
          setOpenValue(value);
        } else {
          if (triggerRef.current) {
            triggerRef.current.setAttribute('data-open-reason', 'first');
          }
          scheduleOpen();
        }
        onPointerEnter?.(event as unknown as React.PointerEvent<HTMLButtonElement>);
      },
      [
        hoverTrigger,
        isCoarsePointer,
        disabled,
        openValue,
        value,
        cancelClose,
        setOpenValue,
        triggerRef,
        scheduleOpen,
        onPointerEnter,
      ],
    );

    const handlePointerLeave = useCallback(
      (event: React.PointerEvent<HTMLElement>) => {
        if (!hoverTrigger || isCoarsePointer) {
          onPointerLeave?.(event as unknown as React.PointerEvent<HTMLButtonElement>);
          return;
        }
        cancelPendingOpen();
        if (isOpen) {
          scheduleClose();
        }
        onPointerLeave?.(event as unknown as React.PointerEvent<HTMLButtonElement>);
      },
      [
        hoverTrigger,
        isCoarsePointer,
        cancelPendingOpen,
        isOpen,
        scheduleClose,
        onPointerLeave,
      ],
    );

    // Focus path — instant open per SC 2.1.1. Focus also takes over roving
    // tabindex (sets this trigger to tabindex="0" within the menubar list).
    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLElement>) => {
        if (disabled) {
          onFocus?.(event as unknown as React.FocusEvent<HTMLButtonElement>);
          return;
        }
        // Update roving tabindex — make this item the active one.
        const list = root.listRef.current;
        if (list) {
          const items = getMenubarItems(list);
          const idx = items.findIndex((el) => el === event.currentTarget);
          if (idx !== -1) setRovingTabindex(items, idx);
        }
        onFocus?.(event as unknown as React.FocusEvent<HTMLButtonElement>);
      },
      [disabled, root.listRef, onFocus],
    );

    const ariaProps = {
      id: triggerId,
      role: 'menuitem' as const,
      'aria-haspopup': 'menu' as const,
      'aria-expanded': isOpen,
      'aria-controls': isOpen ? contentId : undefined,
      'aria-disabled': disabled || undefined,
      'data-state': (isOpen ? 'open' : 'closed') as 'open' | 'closed',
      'data-menubar-item': 'true' as const,
      'data-menu-value': value,
      'data-text-value': textValue,
    };

    if (asChild) {
      return (
        <Slot
          ref={mergedRef}
          {...ariaProps}
          tabIndex={-1}
          className={cn(styles.trigger, className)}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onFocus={handleFocus}
        >
          {children}
        </Slot>
      );
    }

    // APG /menubar/: do NOT use native `disabled` — that removes the element
    // from the focus order, breaking the roving tabindex keyboard model for
    // disabled items. Instead use `aria-disabled="true"` (set via ariaProps)
    // + handler guards (handleClick/KeyDown/PointerEnter/Focus all check the
    // `disabled` prop directly above). Item stays focusable so SR users can
    // discover it. The native `disabled` attribute is intentionally omitted.
    return (
      <button
        ref={mergedRef as React.Ref<HTMLButtonElement>}
        type="button"
        {...ariaProps}
        tabIndex={-1}
        className={cn(styles.trigger, className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

// ──────────────────────────────────────────────────────────────────────────
// NavigationMenuContent — portal + positioning + keyboard handler
// ──────────────────────────────────────────────────────────────────────────

// Submenu links never receive native `disabled` (anchor elements don't
// support it); we filter only on `aria-disabled` per APG.
const SUBMENU_LINK_SELECTOR = '[role="menuitem"]:not([aria-disabled="true"])';

function getSubmenuLinks(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(SUBMENU_LINK_SELECTOR));
}

export interface NavigationMenuContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'aria-labelledby'> {
  children?: ReactNode;
  /** Submenu placement relative to its trigger. Default `'bottom-start'`. */
  placement?: NavigationMenuPlacement;
  /** Gap in pixels between trigger and content. Default `4`. */
  sideOffset?: number;
  /** Inner padding from viewport edges for flip + shift. Default `8`. */
  collisionPadding?: number;
  className?: string;
}

export function NavigationMenuContent({
  children,
  className,
  placement = 'bottom-start',
  sideOffset = 4,
  collisionPadding = 8,
  ...rest
}: NavigationMenuContentProps) {
  const root = useNavigationMenuRoot('<NavigationMenuContent>');
  const item = useNavigationMenuItem('<NavigationMenuContent>');
  const { openValue, setOpenValue, scheduleClose, cancelClose, isCoarsePointer } = root;
  const { value, contentId, triggerId, triggerRef, popperRef } = item;

  const isOpen = openValue === value;

  const { refs, floatingStyles, placement: actualPlacement } = useFloating({
    open: isOpen,
    placement,
    offset: sideOffset,
    padding: collisionPadding,
  });
  const { setReference, setFloating } = refs;

  // Bridge triggerRef into useFloating's reference setter.
  useLayoutEffect(() => {
    if (!isOpen) return;
    if (triggerRef.current) setReference(triggerRef.current);
  }, [isOpen, triggerRef, setReference]);

  // Merged ref: setFloating + popperRef.
  const mergedPopperRef = useCallback(
    (node: HTMLDivElement | null) => {
      popperRef.current = node;
      setFloating(node);
    },
    [popperRef, setFloating],
  );

  // Initial focus on open: first or last submenu link based on data-open-reason.
  useFloatingFocus({
    open: isOpen,
    contentRef: popperRef,
    getFocusTarget: (container) => {
      const links = getSubmenuLinks(container);
      if (links.length === 0) return null;
      const reason = triggerRef.current?.getAttribute('data-open-reason');
      if (reason === 'last') {
        return links[links.length - 1] ?? null;
      }
      return links[0] ?? null;
    },
    getRestoreTarget: () => triggerRef.current as HTMLElement | null,
  });

  // Outside-click dismiss. Escape is handled inline below because we need
  // to keep focus on the parent menubar item (useFloatingDismiss's callback
  // doesn't know about menubar restoration semantics).
  useFloatingDismiss({
    open: isOpen,
    onDismiss: () => setOpenValue(null),
    contentRef: popperRef,
    triggerRef,
    closeOnEscape: false, // handled inline
    closeOnOutsideClick: true,
  });

  // Submenu keyboard handler — Down/Up/Home/End/Tab/Escape/typeahead +
  // Right/Left cross-menubar navigation. Escape is handled INLINE here (not
  // via useFloatingDismiss closeOnEscape) because we need to close + let
  // useFloatingFocus's getRestoreTarget fire to restore focus to the parent
  // menubar item per APG. DropdownMenu/HoverCard precedent — keep keyboard
  // handling on the React onKeyDown attribute (single dispatch path) instead
  // of a document-level listener (which would create a 2-handler chain).
  const typeaheadBufferRef = useRef<string>('');
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (typeaheadTimerRef.current) {
        clearTimeout(typeaheadTimerRef.current);
        typeaheadTimerRef.current = null;
      }
    };
  }, []);

  const handleSubmenuKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const container = popperRef.current;
      if (!container) return;
      const links = getSubmenuLinks(container);
      if (links.length === 0) return;

      const activeIndex = links.findIndex((el) => el === document.activeElement);
      const list = root.listRef.current;
      const orientation = root.orientation;
      const isHorizontal = orientation === 'horizontal';

      switch (event.key) {
        case 'Escape': {
          // Close submenu — useFloatingFocus cleanup will restore focus to
          // parent menubar item via getRestoreTarget. preventDefault so a
          // wrapping Dialog/Modal doesn't ALSO close on this Escape.
          event.preventDefault();
          setOpenValue(null);
          return;
        }
        case 'ArrowDown': {
          event.preventDefault();
          const next = activeIndex < links.length - 1 ? activeIndex + 1 : 0;
          links[next]?.focus();
          return;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const prev = activeIndex > 0 ? activeIndex - 1 : links.length - 1;
          links[prev]?.focus();
          return;
        }
        case 'Home': {
          event.preventDefault();
          links[0]?.focus();
          return;
        }
        case 'End': {
          event.preventDefault();
          links[links.length - 1]?.focus();
          return;
        }
        case 'ArrowRight': {
          if (!isHorizontal) return;
          event.preventDefault();
          // Close current submenu, advance to next menubar item, open if it
          // has a submenu (matches APG: "Right closes submenu, moves to next
          // menubar item, opens its submenu if exists").
          if (!list) return;
          const items = getMenubarItems(list);
          const currentIdx = items.findIndex(
            (it) => it.getAttribute('data-menu-value') === value,
          );
          if (currentIdx === -1) return;
          const nextIdx = currentIdx < items.length - 1 ? currentIdx + 1 : 0;
          const nextItem = items[nextIdx];
          if (!nextItem) return;
          const nextValue = nextItem.getAttribute('data-menu-value');
          setRovingTabindex(items, nextIdx);
          nextItem.focus();
          if (nextValue && nextItem.getAttribute('aria-haspopup') === 'menu') {
            nextItem.setAttribute('data-open-reason', 'first');
            setOpenValue(nextValue);
          } else {
            setOpenValue(null);
          }
          return;
        }
        case 'ArrowLeft': {
          if (!isHorizontal) return;
          event.preventDefault();
          if (!list) return;
          const items = getMenubarItems(list);
          const currentIdx = items.findIndex(
            (it) => it.getAttribute('data-menu-value') === value,
          );
          if (currentIdx === -1) return;
          const prevIdx = currentIdx > 0 ? currentIdx - 1 : items.length - 1;
          const prevItem = items[prevIdx];
          if (!prevItem) return;
          const prevValue = prevItem.getAttribute('data-menu-value');
          setRovingTabindex(items, prevIdx);
          prevItem.focus();
          if (prevValue && prevItem.getAttribute('aria-haspopup') === 'menu') {
            prevItem.setAttribute('data-open-reason', 'first');
            setOpenValue(prevValue);
          } else {
            setOpenValue(null);
          }
          return;
        }
        case 'Tab': {
          // APG: Tab closes submenu + lets browser propagate. Do NOT
          // preventDefault — browser moves focus to next document tabbable.
          setOpenValue(null);
          return;
        }
        default:
          break;
      }

      // Typeahead (submenu scope).
      if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        const char = event.key.toLowerCase();
        typeaheadBufferRef.current += char;
        if (typeaheadTimerRef.current) clearTimeout(typeaheadTimerRef.current);
        typeaheadTimerRef.current = setTimeout(() => {
          typeaheadBufferRef.current = '';
          typeaheadTimerRef.current = null;
        }, 500);

        const buffer = typeaheadBufferRef.current;
        const searchFrom =
          activeIndex >= 0 ? activeIndex + (buffer.length === 1 ? 1 : 0) : 0;
        const rotated = [...links.slice(searchFrom), ...links.slice(0, searchFrom)];
        const match = rotated.find((link) => {
          const textValue =
            link.getAttribute('data-text-value') ?? link.textContent ?? '';
          return textValue.toLowerCase().startsWith(buffer);
        });
        if (match) {
          event.preventDefault();
          match.focus();
        }
      }
    },
    [popperRef, root.listRef, root.orientation, setOpenValue, value],
  );

  // Content hover handlers — keep submenu open while pointer is over content
  // (SC 1.4.13 hoverable / Radix grace area). Also re-arms close on leave.
  const handleContentPointerEnter = useCallback(() => {
    if (isCoarsePointer) return;
    cancelClose();
  }, [isCoarsePointer, cancelClose]);

  const handleContentPointerLeave = useCallback(() => {
    if (isCoarsePointer) return;
    scheduleClose();
  }, [isCoarsePointer, scheduleClose]);

  if (!isOpen) return null;

  return (
    <FloatingPortal>
      <div
        ref={mergedPopperRef}
        className={styles.contentRoot}
        style={floatingStyles}
        onPointerEnter={handleContentPointerEnter}
        onPointerLeave={handleContentPointerLeave}
      >
        <div
          id={contentId}
          role="menu"
          aria-labelledby={triggerId}
          tabIndex={-1}
          data-placement={actualPlacement}
          data-state="open"
          className={cn(styles.content, className)}
          onKeyDown={handleSubmenuKeyDown}
          {...rest}
        >
          {children}
        </div>
      </div>
    </FloatingPortal>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// NavigationMenuLink — `<a role="menuitem">` for both standalone menubar
// items AND submenu items. Renders as menubar item when no Trigger sibling
// exists in the parent NavigationMenuItem.
// ──────────────────────────────────────────────────────────────────────────

export interface NavigationMenuLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'role' | 'onSelect'> {
  children: ReactNode;
  /**
   * When `true`, marks this link as the current page (wires `aria-current="page"`
   * + `.active` class). Use for navigation context highlighting.
   */
  active?: boolean;
  /**
   * Cancelable callback fired on click/Enter/Space activation. Call
   * `event.preventDefault()` to keep submenu open after activation (rare —
   * typically used for navigation that doesn't navigate, like a "show all"
   * button that triggers JS routing inside the same page).
   */
  onSelect?: (event: CustomEvent) => void;
  /**
   * Override text used for typeahead matching. When omitted, the link's
   * `textContent` is used.
   */
  textValue?: string;
  /**
   * When `true`, Slot-wraps the single React element child. Use this to
   * wrap a Next.js `<Link>` while keeping all NavigationMenu ARIA + handlers.
   */
  asChild?: boolean;
  className?: string;
}

export const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  function NavigationMenuLink(
    {
      children,
      active,
      onSelect,
      onClick,
      textValue,
      asChild = false,
      className,
      ...rest
    },
    forwardedRef,
  ) {
    const root = useNavigationMenuRoot('<NavigationMenuLink>');
    const item = useNavigationMenuItem('<NavigationMenuLink>');
    const { setOpenValue } = root;
    const { hasSubmenu, triggerRef } = item;

    // If this Link is rendered inside an Item that also has a Trigger, this
    // is a SUBMENU link. Otherwise it's a STANDALONE menubar link.
    const isStandaloneMenubarLink = !hasSubmenu;

    // For standalone menubar links, attach to the trigger ref so the menubar
    // List's roving tabindex logic can find it via [data-menubar-item="true"].
    const mergedRef = mergeRefs(forwardedRef, (node: HTMLAnchorElement | null) => {
      if (isStandaloneMenubarLink && node) {
        triggerRef.current = node;
      }
    });

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLAnchorElement>) => {
        const customEvent = new CustomEvent('navigationmenu-select', { cancelable: true });
        onSelect?.(customEvent);
        if (customEvent.defaultPrevented) {
          event.preventDefault();
        } else if (!isStandaloneMenubarLink) {
          // Submenu link activated — close the submenu (link will navigate).
          setOpenValue(null);
        }
        onClick?.(event);
      },
      [onSelect, onClick, isStandaloneMenubarLink, setOpenValue],
    );

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLAnchorElement>) => {
        // For standalone menubar links, update roving tabindex on focus.
        if (!isStandaloneMenubarLink) return;
        const list = root.listRef.current;
        if (list) {
          const items = getMenubarItems(list);
          const idx = items.findIndex((el) => el === event.currentTarget);
          if (idx !== -1) setRovingTabindex(items, idx);
        }
      },
      [isStandaloneMenubarLink, root.listRef],
    );

    const ariaProps = {
      role: 'menuitem' as const,
      'aria-current': active ? ('page' as const) : undefined,
      'data-active': active || undefined,
      'data-text-value': textValue,
      ...(isStandaloneMenubarLink
        ? {
            'data-menubar-item': 'true' as const,
            'data-menu-value': item.value,
            tabIndex: -1, // roving — List sets the active one to 0
          }
        : { tabIndex: -1 }),
    };

    if (asChild) {
      return (
        <Slot
          ref={mergedRef}
          {...ariaProps}
          className={cn(styles.link, active && styles.linkActive, className)}
          onClick={handleClick}
          onFocus={handleFocus}
        >
          {children}
        </Slot>
      );
    }

    return (
      <a
        ref={mergedRef}
        {...ariaProps}
        className={cn(styles.link, active && styles.linkActive, className)}
        onClick={handleClick}
        onFocus={handleFocus}
        {...rest}
      >
        {children}
      </a>
    );
  },
);
