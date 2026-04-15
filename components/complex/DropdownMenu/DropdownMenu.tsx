'use client';

/**
 * DropdownMenu — accessible menu triggered by a button per WAI-ARIA APG /menu/.
 *
 * @layer complex-interactive (Phase 10 CI7)
 * @tokens --color-surface-raised, --color-surface-hover, --color-text-primary,
 *   --color-text-muted, --color-border-subtle, --shadow-lg, --radius-md,
 *   --radius-lg, --z-popover (shares stacking with Popover since menus are
 *   modeless floating panels), --duration-fast, --easing-default, --space-1..5,
 *   --font-size-sm, --font-size-xs
 * @deps zero runtime deps. Positioning via `utils/position.ts` + `utils/useFloating.ts`
 *   (E19/E20 primitive). Own Slot primitive for `asChild` trigger wrapping.
 *   React 19 `createPortal`. Does NOT reuse Popover directly — Popover hard-codes
 *   `role="dialog"` + `aria-haspopup="dialog"` with Omit types, so DropdownMenu
 *   implements its own compound API (D-D1 Option B: copy+layer). Plan to extract
 *   shared `FloatingRoot` primitive at E22+ once ContextMenu amortizes duplication.
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
 *   Tab closes menu without focus restore (browser Tab takes over — APG
 *   convention differs from Dialog trap). Items render as `<button type="button">`
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

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext(component: string): DropdownMenuContextValue {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error(`${component} must be rendered inside a <DropdownMenu> parent.`);
  }
  return ctx;
}

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

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [openReason, setOpenReason] = useState<OpenReason>(null);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean, reason: OpenReason = null) => {
      if (next === open) return;
      if (!isControlled) setUncontrolledOpen(next);
      setOpenReason(next ? reason : null);
      onOpenChange?.(next);
    },
    [open, isControlled, onOpenChange],
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

  return <DropdownMenuContext.Provider value={value}>{children}</DropdownMenuContext.Provider>;
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
}

export const DropdownMenuTrigger = forwardRef<HTMLElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger({ children, asChild = false, onClick, onKeyDown, ...rest }, forwardedRef) {
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
        onKeyDown={(event) => {
          handleKeyDown(event);
          onKeyDown?.(event);
        }}
        {...rest}
      >
        {children}
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
  const previousActiveRef = useRef<HTMLElement | null>(null);
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

  // Bridge triggerRef to useFloating's setReference after PopoverTrigger attaches.
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
    // Initial measurement happens inside the ResizeObserver callback when we
    // observe the element — ResizeObserver fires once immediately on observe.
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

  // Close helper that restores focus to trigger.
  const closeAndRestore = useCallback(() => {
    const target = triggerRef.current;
    setOpen(false);
    if (target && typeof (target as HTMLElement).focus === 'function') {
      requestAnimationFrame(() => {
        (target as HTMLElement).focus();
      });
    }
  }, [setOpen, triggerRef]);

  // Initial focus on open — focus first or last item based on open reason.
  // Uses rAF so DOM is painted before querying menu items.
  useLayoutEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => {
      const container = popperRef.current;
      if (!container) return;
      const items = getMenuItems(container);
      if (items.length === 0) {
        container.focus();
        return;
      }
      if (openReason === 'trigger-last') {
        items[items.length - 1]?.focus();
      } else {
        items[0]?.focus();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [open, openReason]);

  // Escape dismiss — document-level so nested components can preventDefault first.
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        closeAndRestore();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, closeAndRestore]);

  // Outside-click dismiss — capture phase, skips scrollbar click (Radix #18).
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (target === document.documentElement || target === document.body) return;
      if (popperRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown, { capture: true });
    return () =>
      document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  }, [open, setOpen, triggerRef]);

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
        // Search starting AFTER current active index, wrapping to beginning.
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
  if (typeof document === 'undefined') return null;

  const contentStyle: React.CSSProperties = {};
  if (matchTriggerWidth && triggerWidth !== null) {
    contentStyle.minWidth = triggerWidth;
  }

  return createPortal(
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
    </div>,
    document.body,
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
    const { setOpen, triggerRef } = ctx;

    const handleActivate = useCallback(() => {
      const event = new CustomEvent('dropdownmenu-select', { cancelable: true });
      onSelect?.(event);
      if (!event.defaultPrevented) {
        // Close menu and restore focus to trigger — rAF so React finishes the
        // unmount before focus is moved.
        setOpen(false);
        const target = triggerRef.current;
        if (target && typeof (target as HTMLElement).focus === 'function') {
          requestAnimationFrame(() => {
            (target as HTMLElement).focus();
          });
        }
      }
    }, [onSelect, setOpen, triggerRef]);

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
