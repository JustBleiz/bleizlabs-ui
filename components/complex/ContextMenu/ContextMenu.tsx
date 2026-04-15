'use client';

/**
 * ContextMenu — right-click menu triggered by a `contextmenu` event.
 *
 * @layer complex-interactive (Phase 10 CI8)
 * @tokens --color-surface-raised, --color-surface-hover, --color-text-primary,
 *   --color-text-muted, --color-border-subtle, --shadow-lg, --radius-md, --radius-sm,
 *   --z-popover, --duration-fast, --easing-default, --space-1..5, --font-size-sm,
 *   --font-size-xs
 * @deps zero runtime deps. Positioning via direct `computePosition` call from
 *   `utils/position.ts` (D-C2 Option C — skip `useFloating` hook since
 *   ContextMenu closes on scroll and never needs to "follow" a reference).
 *   Dismiss + portal + focus + context via shared `utils/floating/` composable
 *   primitives (E23 refactor). Own Slot primitive for `asChild` trigger wrapping.
 *   Menu keyboard handler + typeahead remain inline — menu-specific (same as
 *   DropdownMenu, to be co-extracted when a third menu consumer arrives).
 * @a11y Content: `role="menu"`, no `aria-modal` (menus are inherently non-modal).
 *   Items: `role="menuitem"`, `aria-disabled` + `data-disabled` for CSS, native
 *   `<button disabled>` for Enter/Space handling. Separator: `role="separator"
 *   aria-orientation="horizontal"`. Group: `role="group"` with optional
 *   `aria-labelledby` pointing to a Label id. **Trigger has NO `aria-haspopup`
 *   / `aria-expanded`** — the wrapper is not a widget; it is a right-click zone.
 *   Full APG `/menu/` keyboard model inherited from DropdownMenu pattern:
 *   ArrowDown/Up cycle with wraparound (skip disabled), Home/End jump, Escape
 *   closes + restores focus to pre-open activeElement (NOT a trigger button —
 *   ContextMenu has no trigger element), Enter/Space activates items, Tab closes
 *   without focus restore (APG convention), typeahead single+multi-char buffer
 *   500ms reset. `textValue` prop on items overrides `textContent` for typeahead.
 *   **Close on scroll** via capture-phase window scroll listener (native OS
 *   context menu convention, configurable via `closeOnScroll` prop default `true`).
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/menu/
 * @tested tsc ✓ | lint ✓ | build ✓ — DEFERRED: Playwright, axe-core, manual NVDA.
 * @regressions tests/ContextMenu.{keyboard,focus,aria,regression}.spec.md —
 *   15 Radix closed-issue cases mapped + 13 inherited DropdownMenu tests.
 * @todo Long-press on touch devices (deferred — iOS Safari magnifier conflict,
 *   touchmove cancel threshold, -webkit-touch-callout requirements).
 * @example
 *   <ContextMenu>
 *     <ContextMenuTrigger asChild>
 *       <tr>Right-click me</tr>
 *     </ContextMenuTrigger>
 *     <ContextMenuContent>
 *       <ContextMenuItem onSelect={() => duplicate()}>Duplicate</ContextMenuItem>
 *       <ContextMenuSeparator />
 *       <ContextMenuItem onSelect={() => remove()}>Delete</ContextMenuItem>
 *     </ContextMenuContent>
 *   </ContextMenu>
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type ButtonHTMLAttributes,
  type CSSProperties,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import { computePosition, type Placement } from '../../utils/position';
import {
  createFloatingContext,
  useFloatingState,
  useFloatingDismiss,
  useFloatingFocus,
  FloatingPortal,
} from '../../utils/floating';
import styles from './ContextMenu.module.scss';

// ──────────────────────────────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────────────────────────────

interface CursorPoint {
  x: number;
  y: number;
}

interface ContextMenuContextValue {
  open: boolean;
  setOpen: (next: boolean, point?: CursorPoint) => void;
  cursorPoint: CursorPoint | null;
  contentId: string;
  sideOffset: number;
  collisionPadding: number;
  closeOnScroll: boolean;
}

const [ContextMenuContextProvider, useContextMenuContext] =
  createFloatingContext<ContextMenuContextValue>('ContextMenu');

// ──────────────────────────────────────────────────────────────────────────
// ContextMenu — state holder + context provider
// ──────────────────────────────────────────────────────────────────────────

export interface ContextMenuProps {
  children: ReactNode;
  /** Controlled open state. When provided, component is controlled. */
  open?: boolean;
  /** Uncontrolled initial open. Default `false`. */
  defaultOpen?: boolean;
  /** Fires on every open transition. */
  onOpenChange?: (open: boolean) => void;
  /** Gap in pixels between cursor point and menu. Default `4`. */
  sideOffset?: number;
  /** Inner padding from viewport edges for flip + shift. Default `8`. */
  collisionPadding?: number;
  /**
   * Close on scroll — matches native OS context menu convention and Radix.
   * Default `true`. Set `false` when the trigger lives inside a scrollable
   * container the user may want to scroll while the menu stays open.
   */
  closeOnScroll?: boolean;
}

export function ContextMenu({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  sideOffset = 4,
  collisionPadding = 8,
  closeOnScroll = true,
}: ContextMenuProps) {
  const reactId = useId();
  const contentId = `${reactId}-menu`;

  // Base controlled/uncontrolled hybrid via shared primitive. We wrap its
  // `setOpen` in our own callback to also track `cursorPoint` — the shared
  // hook doesn't need to know about menu-specific state.
  const { open, setOpen: baseSetOpen } = useFloatingState({
    controlledOpen,
    defaultOpen,
    onOpenChange,
  });
  const [cursorPoint, setCursorPoint] = useState<CursorPoint | null>(null);

  const setOpen = useCallback(
    (next: boolean, point?: CursorPoint) => {
      if (next && point) setCursorPoint(point);
      if (!next) setCursorPoint(null);
      baseSetOpen(next);
    },
    [baseSetOpen],
  );

  const value = useMemo<ContextMenuContextValue>(
    () => ({
      open,
      setOpen,
      cursorPoint,
      contentId,
      sideOffset,
      collisionPadding,
      closeOnScroll,
    }),
    [open, setOpen, cursorPoint, contentId, sideOffset, collisionPadding, closeOnScroll],
  );

  return <ContextMenuContextProvider value={value}>{children}</ContextMenuContextProvider>;
}

// ──────────────────────────────────────────────────────────────────────────
// ContextMenuTrigger — wraps children, attaches onContextMenu
// ──────────────────────────────────────────────────────────────────────────

export interface ContextMenuTriggerProps {
  children: ReactNode;
  /**
   * When `true` (default), Slot-wraps the single React element child and
   * merges `onContextMenu` onto it. Required for use inside table rows /
   * list items where a wrapper `<div>` would break DOM structure. When
   * `false`, wraps children in a `<div>` with the event handler attached.
   */
  asChild?: boolean;
  /**
   * When `true`, `onContextMenu` does NOT call `preventDefault()` — the
   * native browser context menu appears instead. Useful when conditionally
   * disabling context menu based on row permissions. Default `false`.
   */
  disabled?: boolean;
  /** Forwarded to the wrapper element when `asChild={false}`. */
  className?: string;
}

export function ContextMenuTrigger({
  children,
  asChild = true,
  disabled = false,
  className,
}: ContextMenuTriggerProps) {
  const ctx = useContextMenuContext('<ContextMenuTrigger>');
  const { setOpen } = ctx;

  const handleContextMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) return; // allow native browser context menu
      event.preventDefault();
      setOpen(true, { x: event.clientX, y: event.clientY });
    },
    [disabled, setOpen],
  );

  if (asChild) {
    return <Slot onContextMenu={handleContextMenu}>{children}</Slot>;
  }

  return (
    <div className={className} onContextMenu={handleContextMenu}>
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// ContextMenuContent — portal + position at cursor + keyboard handler + dismiss
// ──────────────────────────────────────────────────────────────────────────

const MENU_ITEM_SELECTOR = [
  '[role="menuitem"]:not([aria-disabled="true"]):not([disabled])',
].join(',');

function getMenuItems(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll<HTMLButtonElement>(MENU_ITEM_SELECTOR));
}

export interface ContextMenuContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'aria-modal'> {
  children?: ReactNode;
  className?: string;
}

export function ContextMenuContent({ children, className, ...rest }: ContextMenuContentProps) {
  const ctx = useContextMenuContext('<ContextMenuContent>');
  const { open, setOpen, cursorPoint, contentId, sideOffset, collisionPadding, closeOnScroll } =
    ctx;

  const popperRef = useRef<HTMLDivElement | null>(null);
  const typeaheadBufferRef = useRef<string>('');
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Position state — computed via direct `computePosition` call (not useFloating).
  // `computedFor` stores the cursorPoint reference the position was computed
  // for. Render compares current cursorPoint identity against this — mismatch
  // means we have stale position from a previous open session and the menu
  // should stay hidden until the effect recomputes for the new point.
  const [position, setPosition] = useState<{
    x: number;
    y: number;
    placement: Placement;
    computedFor: CursorPoint | null;
  }>({ x: 0, y: 0, placement: 'bottom-start', computedFor: null });

  // Measure + position after portal mount. Uses useLayoutEffect so paint
  // happens with correct position on first frame (avoids flicker). When
  // `cursorPoint` changes (re-open at new coords), this effect re-runs and
  // resets position for the new point — the render-time `computedFor`
  // comparison keeps the menu hidden during the brief measurement window.
  useLayoutEffect(() => {
    if (!open || !cursorPoint) return;
    const container = popperRef.current;
    if (!container) return;

    const floating = {
      width: container.offsetWidth,
      height: container.offsetHeight,
    };
    // 1×1 synthetic rect at cursor coordinates — computePosition treats any
    // `Rect` identically, so the point-as-rect flows through flip + shift
    // middleware correctly.
    const referenceRect = {
      x: cursorPoint.x,
      y: cursorPoint.y,
      width: 1,
      height: 1,
    };
    const result = computePosition({
      reference: referenceRect,
      floating,
      placement: 'bottom-start',
      offset: sideOffset,
      padding: collisionPadding,
    });
    setPosition({
      x: result.x,
      y: result.y,
      placement: result.placement,
      computedFor: cursorPoint,
    });
  }, [open, cursorPoint, sideOffset, collisionPadding]);

  // Initial focus + focus restore via shared primitive. ContextMenu restores
  // to the element that was focused BEFORE the context menu opened (captured
  // automatically by useFloatingFocus as `previousActive`) — NOT to a trigger
  // widget, because there is no trigger button. Pass no `getRestoreTarget`
  // override so the default `previousActive` restore kicks in.
  useFloatingFocus({
    open,
    contentRef: popperRef,
    getFocusTarget: (container) => {
      const items = getMenuItems(container);
      return items[0] ?? null;
    },
  });

  // Escape + outside-click + close-on-scroll dismiss via shared primitive.
  // ContextMenu has no trigger widget — outside-click only excludes the
  // popper itself (no triggerRef passed). `closeOnScroll` is the ContextMenu-
  // specific opt-in matching native OS context menu behavior.
  useFloatingDismiss({
    open,
    onDismiss: () => setOpen(false),
    contentRef: popperRef,
    closeOnEscape: true,
    closeOnOutsideClick: true,
    closeOnScroll,
  });

  // Cleanup typeahead timer on unmount.
  useEffect(() => {
    return () => {
      if (typeaheadTimerRef.current) {
        clearTimeout(typeaheadTimerRef.current);
        typeaheadTimerRef.current = null;
      }
    };
  }, []);

  // Keyboard handler on content — arrow/Home/End/Tab/typeahead.
  const handleMenuKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const container = popperRef.current;
      if (!container) return;
      const items = getMenuItems(container);
      if (items.length === 0) return;

      const activeIndex = items.findIndex((el) => el === document.activeElement);

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          const next = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
          items[next]?.focus();
          return;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const prev = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
          items[prev]?.focus();
          return;
        }
        case 'Home': {
          event.preventDefault();
          items[0]?.focus();
          return;
        }
        case 'End': {
          event.preventDefault();
          items[items.length - 1]?.focus();
          return;
        }
        case 'Tab': {
          // APG convention: Tab closes menu; browser Tab propagates.
          setOpen(false);
          return;
        }
        default:
          break;
      }

      // Typeahead — printable single-character keys.
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
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
        const rotated = [...items.slice(searchFrom), ...items.slice(0, searchFrom)];
        const match = rotated.find((item) => {
          const textValue =
            item.getAttribute('data-text-value') ?? item.textContent ?? '';
          return textValue.toLowerCase().startsWith(buffer);
        });
        if (match) {
          event.preventDefault();
          match.focus();
        }
      }
    },
    [setOpen],
  );

  // Suppress native browser context menu when user right-clicks inside our menu.
  // Prevents double-menu (our menu + browser's default) — Radix #R09.
  const handleContentContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  if (!open || !cursorPoint) return null;

  // Before measurement, render off-screen via `visibility: hidden` so
  // offsetWidth/offsetHeight work for the effect measurement pass. Compare
  // `position.computedFor` against current `cursorPoint` identity — mismatch
  // means position is stale (e.g. from a previous open session) and the menu
  // should stay hidden for one more frame until the effect recomputes.
  const isReady = position.computedFor === cursorPoint;
  const contentStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    transform: `translate3d(${Math.round(position.x)}px, ${Math.round(position.y)}px, 0)`,
    willChange: 'transform',
    visibility: isReady ? 'visible' : 'hidden',
  };

  return (
    <FloatingPortal>
      <div ref={popperRef} className={styles.root} style={contentStyle}>
        <div
          id={contentId}
          role="menu"
          tabIndex={-1}
          data-placement={position.placement}
          className={cn(styles.content, className)}
          onKeyDown={handleMenuKeyDown}
          onContextMenu={handleContentContextMenu}
          {...rest}
        >
          {children}
        </div>
      </div>
    </FloatingPortal>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// ContextMenuItem
// ──────────────────────────────────────────────────────────────────────────

export interface ContextMenuItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'role' | 'onSelect'> {
  children: ReactNode;
  /**
   * Callback fired when the item is activated (click, Enter, Space). Receives
   * a cancelable `CustomEvent` — call `event.preventDefault()` to KEEP the
   * menu open (useful for checkbox patterns). By default the menu closes.
   */
  onSelect?: (event: CustomEvent) => void;
  /** Override text used for typeahead matching. Falls back to `textContent`. */
  textValue?: string;
  /** When `true`, item is non-interactive and skipped by arrow-key + typeahead. */
  disabled?: boolean;
}

export const ContextMenuItem = forwardRef<HTMLButtonElement, ContextMenuItemProps>(
  function ContextMenuItem(
    { children, onSelect, onClick, textValue, disabled, className, ...rest },
    forwardedRef,
  ) {
    const ctx = useContextMenuContext('<ContextMenuItem>');
    const { setOpen } = ctx;

    const handleActivate = useCallback(() => {
      const event = new CustomEvent('contextmenu-select', { cancelable: true });
      onSelect?.(event);
      if (!event.defaultPrevented) {
        // Closing the menu triggers useFloatingFocus cleanup, which restores
        // focus to whatever was active before the context menu opened.
        setOpen(false);
      }
    }, [onSelect, setOpen]);

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;
        onClick?.(event);
        handleActivate();
      },
      [disabled, onClick, handleActivate],
    );

    return (
      <button
        ref={forwardedRef}
        type="button"
        role="menuitem"
        tabIndex={-1}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? '' : undefined}
        data-text-value={textValue}
        className={cn(styles.item, className)}
        onClick={handleClick}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

// ──────────────────────────────────────────────────────────────────────────
// ContextMenuSeparator
// ──────────────────────────────────────────────────────────────────────────

export interface ContextMenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function ContextMenuSeparator({ className, ...rest }: ContextMenuSeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn(styles.separator, className)}
      {...rest}
    />
  );
}

// ──────────────────────────────────────────────────────────────────────────
// ContextMenuLabel
// ──────────────────────────────────────────────────────────────────────────

export interface ContextMenuLabelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function ContextMenuLabel({ children, className, id, ...rest }: ContextMenuLabelProps) {
  const reactId = useId();
  return (
    <div id={id ?? reactId} className={cn(styles.label, className)} {...rest}>
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// ContextMenuGroup — role="group" wrapper for Label + Items
// ──────────────────────────────────────────────────────────────────────────

export interface ContextMenuGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Points to a nested Label id for `aria-labelledby` wiring. */
  labelledBy?: string;
  className?: string;
}

export function ContextMenuGroup({
  children,
  labelledBy,
  className,
  ...rest
}: ContextMenuGroupProps) {
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      className={cn(styles.group, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
