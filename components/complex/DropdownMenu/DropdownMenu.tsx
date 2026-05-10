'use client';

/**
 * DropdownMenu — accessible menu triggered by a button per WAI-ARIA APG /menu/.
 *
 * @layer complex-interactive (Phase 10 CI7)
 * @tokens --color-surface-raised, --color-surface-hover, --color-text-primary,
 *   --color-text-muted, --color-border-subtle, --shadow-lg, --radius-md,
 *   --radius-sm, --z-popover (shares stacking with Popover since menus are
 *   modeless floating panels), --duration-fast, --easing-default,
 *   --space-{1,2,3,8}, --font-size-sm, --font-size-xs, --font-weight-semibold
 * @deps zero runtime deps. Positioning via `utils/position.ts` + `utils/useFloating.ts`
 *   (E19/E20 primitive). Dismiss + portal + focus + context via shared
 *   `utils/floating/` composable primitives (E23 refactor). Own Slot primitive
 *   for `asChild` trigger wrapping. Menu keyboard handler + typeahead remain
 *   inline — they are menu-specific (not floating-root territory) and will be
 *   extracted to a separate `useMenuKeyboard` hook in a later epic once a
 *   second menu consumer (Select/Combobox) justifies it.
 * @a11y Trigger: `aria-haspopup="menu"` (NOT "dialog"), `aria-expanded` synced
 *   with open state, `aria-controls` pointing to menu id when open. Content:
 *   `role="menu"` (NOT "dialog"). Items: `role="menuitem"`, `aria-disabled="true"`
 *   when disabled, `data-disabled` for CSS targeting, `data-text-value` for
 *   typeahead override. Separator: `role="separator" aria-orientation="horizontal"`.
 *   Label: plain div with id for optional `aria-labelledby` via Group wrapper.
 *   Group: `role="group"` with `aria-labelledby` pointing to Label id.
 *   Keyboard model per APG /menu/: Enter/Space/ArrowDown on trigger opens menu
 *   + focuses first non-disabled item. ArrowUp on trigger opens menu + focuses
 *   last. Inside menu: ArrowDown/Up cycle with wraparound (skipping disabled),
 *   Home/End jump to first/last non-disabled, typeahead by single char or
 *   multi-char buffer (500ms reset), Escape closes + restores focus to trigger,
 *   Enter/Space on item fires `onSelect` (cancelable `CustomEvent`) then closes,
 *   Tab closes menu and restores focus to the trigger (via useFloatingFocus
 *   `getRestoreTarget`) BEFORE the browser's own Tab traversal — net effect
 *   is that the next tabbable after the trigger receives focus. Fixed in
 *   E142 L4 F14 docblock correction — earlier text claimed "without focus
 *   restore" but lines 389-391 and the runtime describe this trigger-first
 *   pattern. Items render as `<button type="button">`
 *   for native Enter/Space + disabled handling. `onSelect` can `event.preventDefault()`
 *   to keep menu open (future CheckboxItem/RadioItem pattern).
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/menu/
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y ✓ | next build ✓ — DEFERRED:
 *   Playwright execution, axe-core runtime sweep, manual NVDA sweep, iOS/Android
 *   device testing, submenu integration (not in E21 scope).
 * @regressions tests/DropdownMenu.{keyboard,focus,aria,regression}.spec.md —
 *   20 Radix closed-issue cases mapped. ~6 marked test.skip with
 *   PLAYGROUND-DEP / SUBMENU-DEFERRED rationale.
 * @example
 *   <DropdownMenu>
 *     <DropdownMenuTrigger asChild>
 *       <Button>Actions</Button>
 *     </DropdownMenuTrigger>
 *     <DropdownMenuContent>
 *       <DropdownMenuGroup>
 *         <DropdownMenuLabel>Document</DropdownMenuLabel>
 *         <DropdownMenuItem onSelect={() => save()}>Save</DropdownMenuItem>
 *         <DropdownMenuItem onSelect={() => open()}>Open</DropdownMenuItem>
 *       </DropdownMenuGroup>
 *       <DropdownMenuSeparator />
 *       <DropdownMenuItem disabled>Archive (coming soon)</DropdownMenuItem>
 *     </DropdownMenuContent>
 *   </DropdownMenu>
 */

import {
  cloneElement,
  forwardRef,
  isValidElement,
  Children as ReactChildren,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
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
  useFloatingDismiss,
  useFloatingFocus,
  FloatingPortal,
} from '../../utils/floating';
import styles from './DropdownMenu.module.scss';

export type DropdownMenuPlacement = Placement;

// ──────────────────────────────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────────────────────────────

type OpenReason = 'trigger-first' | 'trigger-last' | 'controlled' | null;

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (next: boolean, reason?: OpenReason) => void;
  openReason: OpenReason;
  triggerId: string;
  contentId: string;
  triggerRef: RefObject<HTMLElement | null>;
  placement: DropdownMenuPlacement;
  sideOffset: number;
  collisionPadding: number;
  matchTriggerWidth: boolean;
}

const [DropdownMenuContextProvider, useDropdownMenuContext] =
  createFloatingContext<DropdownMenuContextValue>('DropdownMenu');

// ──────────────────────────────────────────────────────────────────────────
// DropdownMenu — state holder + context provider
// ──────────────────────────────────────────────────────────────────────────

export interface DropdownMenuProps {
  children: ReactNode;
  /** Controlled open state. When provided, component is controlled. */
  open?: boolean;
  /** Uncontrolled initial open state. Default `false`. */
  defaultOpen?: boolean;
  /** Fires on every open transition. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Preferred placement. Default `'bottom-start'` — dropdown convention aligns
   * menu left edge to trigger left edge (differs from Popover's `'bottom'`).
   */
  placement?: DropdownMenuPlacement;
  /** Gap in pixels between trigger and menu. Default `4` (tight — menu convention). */
  sideOffset?: number;
  /** Inner padding from viewport edges for flip + shift. Default `8`. */
  collisionPadding?: number;
  /**
   * When `true`, content `min-width` is forced to match the trigger's width.
   * Prevents the visual bug where a narrow menu under a wide trigger looks
   * broken (Radix #17). Default `false`.
   */
  matchTriggerWidth?: boolean;
}

export function DropdownMenu({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-start',
  sideOffset = 4,
  collisionPadding = 8,
  matchTriggerWidth = false,
}: DropdownMenuProps) {
  const reactId = useId();
  const triggerId = `${reactId}-trigger`;
  const contentId = `${reactId}-menu`;

  const triggerRef = useRef<HTMLElement | null>(null);

  // Base controlled/uncontrolled hybrid via shared primitive. We wrap its
  // `setOpen` in our own callback to also track `openReason` — the shared
  // hook doesn't need to know about menu-specific state.
  const { open, setOpen: baseSetOpen } = useFloatingState({
    controlledOpen,
    defaultOpen,
    onOpenChange,
  });
  const [openReason, setOpenReason] = useState<OpenReason>(null);

  const setOpen = useCallback(
    (next: boolean, reason: OpenReason = null) => {
      setOpenReason(next ? reason : null);
      baseSetOpen(next);
    },
    [baseSetOpen],
  );

  const value = useMemo<DropdownMenuContextValue>(
    () => ({
      open,
      setOpen,
      openReason,
      triggerId,
      contentId,
      triggerRef,
      placement,
      sideOffset,
      collisionPadding,
      matchTriggerWidth,
    }),
    [
      open,
      setOpen,
      openReason,
      triggerId,
      contentId,
      placement,
      sideOffset,
      collisionPadding,
      matchTriggerWidth,
    ],
  );

  return (
    <DropdownMenuContextProvider value={value}>{children}</DropdownMenuContextProvider>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// DropdownMenuTrigger
// ──────────────────────────────────────────────────────────────────────────

export interface DropdownMenuTriggerProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'aria-expanded' | 'aria-haspopup' | 'aria-controls'
  > {
  children: ReactNode;
  /**
   * When `true`, Slot-wraps the single React element child, merging ARIA and
   * onClick/onKeyDown. When `false` (default), renders a native `<button>`.
   */
  asChild?: boolean;
  /**
   * Render a built-in chevron-down indicator after the trigger label. Default
   * `false` (Radix-style generic trigger — DropdownMenu may also be triggered
   * by an Avatar, IconButton, or any non-button element where a chevron would
   * be visually wrong). Set `true` for the common Button-trigger case to get
   * the standard "click to open" affordance without composing the icon
   * manually. Works in both native and `asChild` modes:
   *  - native mode: chevron renders inside the native `<button>` after children
   *  - `asChild` mode: chevron is appended to the wrapped element's existing
   *    children via `cloneElement`. Wrapping element MUST accept `children`
   *    array and apply gap (`Button` does this via its own `gap: var(--space-2)`
   *    rule — recommended trigger element when `withChevron` is on).
   */
  withChevron?: boolean;
}

/**
 * Inline chevron-down svg matching Select's chevron pattern (linie 883-885).
 * `aria-hidden` since the affordance is purely visual — `aria-haspopup="menu"`
 * already conveys the "this opens a menu" semantics to AT.
 */
function DropdownChevronIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

/**
 * Append chevron to an asChild trigger's children. Uses `cloneElement` z 3rd
 * argument variadic children pattern — preserves existing child content and
 * adds chevron as final child. Wrapping element must apply gap (Button does).
 */
function appendChevronToChild(child: ReactElement): ReactElement {
  const childProps = (child.props ?? {}) as { children?: ReactNode };
  const existing = ReactChildren.toArray(childProps.children);
  return cloneElement(
    child,
    undefined,
    ...existing,
    <DropdownChevronIcon key="__dd-chevron" />
  );
}

export const DropdownMenuTrigger = forwardRef<HTMLElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger(
    { children, asChild = false, withChevron = false, onClick, onKeyDown, ...rest },
    forwardedRef
  ) {
    const ctx = useDropdownMenuContext('<DropdownMenuTrigger>');
    const { open, setOpen, triggerId, contentId, triggerRef } = ctx;

    const mergedRef = mergeRefs(
      forwardedRef,
      (node: HTMLElement | null) => {
        triggerRef.current = node;
      },
    );

    const isDisabled = useCallback((target: HTMLElement) => {
      if (target.getAttribute('aria-disabled') === 'true') return true;
      if (target instanceof HTMLButtonElement && target.disabled) return true;
      return false;
    }, []);

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        if (isDisabled(event.currentTarget)) return;
        setOpen(!open, !open ? 'trigger-first' : null);
      },
      [open, setOpen, isDisabled],
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLElement>) => {
        if (isDisabled(event.currentTarget)) return;
        // Enter / Space / ArrowDown open with first item focused.
        // ArrowUp opens with last item focused.
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
          event.preventDefault();
          setOpen(true, 'trigger-first');
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setOpen(true, 'trigger-last');
        }
      },
      [setOpen, isDisabled],
    );

    const ariaProps = {
      id: triggerId,
      'aria-expanded': open,
      'aria-haspopup': 'menu' as const,
      'aria-controls': open ? contentId : undefined,
    };

    if (asChild) {
      // When withChevron + asChild, append chevron to the wrapped element's
      // children before passing to Slot. Slot handles ref/className/event
      // merging on the cloned child; we only adjust children here.
      const slotChild =
        withChevron && isValidElement(children)
          ? appendChevronToChild(children as ReactElement)
          : children;
      return (
        <Slot
          ref={mergedRef}
          {...ariaProps}
          onClick={(event) => {
            handleClick(event);
            onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>);
          }}
          onKeyDown={(event) => {
            handleKeyDown(event);
            onKeyDown?.(event as unknown as React.KeyboardEvent<HTMLButtonElement>);
          }}
        >
          {slotChild}
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
        onKeyDown={(event) => {
          handleKeyDown(event);
          onKeyDown?.(event);
        }}
        {...rest}
      >
        {children}
        {withChevron ? <DropdownChevronIcon /> : null}
      </button>
    );
  },
);

// ──────────────────────────────────────────────────────────────────────────
// DropdownMenuContent — portal + floating + keyboard handler
// ──────────────────────────────────────────────────────────────────────────

const MENU_ITEM_SELECTOR = [
  '[role="menuitem"]:not([aria-disabled="true"]):not([disabled])',
].join(',');

function getMenuItems(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll<HTMLButtonElement>(MENU_ITEM_SELECTOR));
}

export interface DropdownMenuContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'aria-modal'> {
  children?: ReactNode;
  className?: string;
}

export function DropdownMenuContent({ children, className, ...rest }: DropdownMenuContentProps) {
  const ctx = useDropdownMenuContext('<DropdownMenuContent>');
  const {
    open,
    setOpen,
    openReason,
    contentId,
    triggerRef,
    placement,
    sideOffset,
    collisionPadding,
    matchTriggerWidth,
  } = ctx;

  const popperRef = useRef<HTMLDivElement | null>(null);
  const typeaheadBufferRef = useRef<string>('');
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

  const { refs, floatingStyles, placement: actualPlacement } = useFloating({
    open,
    placement,
    offset: sideOffset,
    padding: collisionPadding,
  });
  const { setReference, setFloating } = refs;

  // Bridge triggerRef to useFloating's setReference after trigger attaches.
  useLayoutEffect(() => {
    if (!open) return;
    if (triggerRef.current) setReference(triggerRef.current);
  }, [open, triggerRef, setReference]);

  // Track trigger width for `matchTriggerWidth` — observes size changes while open.
  // When `matchTriggerWidth` is false or menu is closed, the measured value is
  // simply ignored in render (no need to reset state — keeps effect body free
  // of synchronous setState which would trip React 19's set-state-in-effect rule).
  useLayoutEffect(() => {
    if (!open || !matchTriggerWidth) return;
    const trigger = triggerRef.current;
    if (!trigger) return;
    const measure = () => setTriggerWidth(trigger.getBoundingClientRect().width);
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(trigger);
    return () => observer?.disconnect();
  }, [open, matchTriggerWidth, triggerRef]);

  // Merged ref for popper wrapper — setFloating + popperRef.
  const mergedPopperRef = useCallback(
    (node: HTMLDivElement | null) => {
      popperRef.current = node;
      setFloating(node);
    },
    [setFloating],
  );

  // Initial focus on open + focus restore to trigger on close — via shared
  // primitive. `getFocusTarget` picks first or last item based on openReason;
  // `getRestoreTarget` returns the trigger button so Escape/item-select/Tab-out
  // all restore focus there (Tab restores BEFORE the browser's own tab
  // traversal, so effectively the trigger gets focus then Tab moves forward).
  useFloatingFocus({
    open,
    contentRef: popperRef,
    getFocusTarget: (container) => {
      const items = getMenuItems(container);
      if (items.length === 0) return null;
      if (openReason === 'trigger-last') {
        return items[items.length - 1] ?? null;
      }
      return items[0] ?? null;
    },
    getRestoreTarget: () => triggerRef.current as HTMLElement | null,
  });

  // Escape + outside-click dismiss via shared primitive. Menu does NOT
  // close on scroll — that's ContextMenu-specific (native OS convention).
  useFloatingDismiss({
    open,
    onDismiss: () => setOpen(false),
    contentRef: popperRef,
    triggerRef,
    closeOnEscape: true,
    closeOnOutsideClick: true,
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

  // Keyboard handler on content — Arrow/Home/End/Tab/typeahead. Items handle
  // Enter/Space natively via their own <button> rendering + onClick wiring.
  // Stays inline (not extracted to utils) — menu-specific, will be factored
  // out with ContextMenu's copy when a third menu consumer arrives.
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
          // APG convention: Tab closes menu; browser then moves focus to next
          // document tabbable. Do NOT preventDefault — let Tab propagate.
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
        const searchFrom = activeIndex >= 0 ? activeIndex + (buffer.length === 1 ? 1 : 0) : 0;
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
          match.focus();
        }
      }
    },
    [setOpen],
  );

  if (!open) return null;

  const contentStyle: React.CSSProperties = {};
  if (matchTriggerWidth && triggerWidth !== null) {
    contentStyle.minWidth = triggerWidth;
  }

  return (
    <FloatingPortal>
      <div ref={mergedPopperRef} className={styles.root} style={floatingStyles}>
        <div
          id={contentId}
          role="menu"
          aria-labelledby={ctx.triggerId}
          tabIndex={-1}
          data-placement={actualPlacement}
          className={cn(styles.content, className)}
          style={contentStyle}
          onKeyDown={handleMenuKeyDown}
          {...rest}
        >
          {children}
        </div>
      </div>
    </FloatingPortal>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// DropdownMenuItem
// ──────────────────────────────────────────────────────────────────────────

export interface DropdownMenuItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'role' | 'onSelect'> {
  children: ReactNode;
  /**
   * Callback fired when the item is activated (click, Enter, Space). Receives
   * a cancelable `CustomEvent` — call `event.preventDefault()` to KEEP the
   * menu open (useful for future CheckboxItem / RadioItem patterns). By
   * default the menu closes after `onSelect` fires.
   */
  onSelect?: (event: CustomEvent) => void;
  /**
   * Override text used for typeahead matching. When omitted, the item's
   * `textContent` is used. Set this when the item visual includes icons or
   * keyboard shortcut hints that should not pollute typeahead search.
   */
  textValue?: string;
  /** When `true`, item is non-interactive and skipped by arrow-key nav + typeahead. */
  disabled?: boolean;
}

export const DropdownMenuItem = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  function DropdownMenuItem(
    { children, onSelect, onClick, textValue, disabled, className, ...rest },
    forwardedRef,
  ) {
    const ctx = useDropdownMenuContext('<DropdownMenuItem>');
    const { setOpen } = ctx;

    const handleActivate = useCallback(() => {
      const event = new CustomEvent('dropdownmenu-select', { cancelable: true });
      onSelect?.(event);
      if (!event.defaultPrevented) {
        // Closing the menu triggers `useFloatingFocus` cleanup, which restores
        // focus to the trigger via `getRestoreTarget`. No explicit focus call
        // needed here — the primitive owns focus restoration.
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
// DropdownMenuSeparator
// ──────────────────────────────────────────────────────────────────────────

export interface DropdownMenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function DropdownMenuSeparator({ className, ...rest }: DropdownMenuSeparatorProps) {
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
// DropdownMenuLabel
// ──────────────────────────────────────────────────────────────────────────

export interface DropdownMenuLabelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function DropdownMenuLabel({ children, className, id, ...rest }: DropdownMenuLabelProps) {
  const reactId = useId();
  return (
    <div id={id ?? reactId} className={cn(styles.label, className)} {...rest}>
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// DropdownMenuGroup — role="group" wrapper for Label + Items
// ──────────────────────────────────────────────────────────────────────────

export interface DropdownMenuGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /**
   * When provided, wires `aria-labelledby` to the given id. Typical usage:
   * pass the `id` of a nested `DropdownMenuLabel` so screen readers
   * announce the label when entering the group.
   */
  labelledBy?: string;
  className?: string;
}

export function DropdownMenuGroup({
  children,
  labelledBy,
  className,
  ...rest
}: DropdownMenuGroupProps) {
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
