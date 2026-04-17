'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { Slot } from '../../utils/Slot';
import { FloatingPortal } from '../../utils/floating';
import { useMatchMedia } from '../../utils/match-media';
import { useFocusTrap } from '../Dialog/useFocusTrap';
import styles from './Sidebar.module.scss';

/**
 * Sidebar — Phase 10 CI22 FINISHER (80/80 Phase 10 COMPLETE).
 *
 * @layer    complex-interactive
 * @tokens   --color-surface, --color-surface-raised, --color-border-subtle,
 *           --color-text-primary, --color-text-secondary, --color-text-muted,
 *           --color-overlay, --radius-md, --radius-lg, --shadow-2xl,
 *           --duration-normal, --duration-fast, --easing-default,
 *           --space-{1,2,3,4}, --z-modal, --font-size-xs, --font-size-sm
 * @deps     cn, mergeRefs, Slot, FloatingPortal (E23), useFocusTrap (Dialog E15),
 *           useMatchMedia (E40 — breakpoint detection)
 * @a11y     Composition — disclosure (trigger + panel with aria-expanded /
 *           aria-controls) + plain navigation (<nav> + <a> + aria-current).
 *           Explicitly NOT menubar APG: route links ≠ app menus; plain Tab
 *           navigation is the WCAG-blessed pattern for site nav. Desktop:
 *           <aside> rail with <nav aria-label> inside; Tab reaches items in
 *           DOM order. Mobile: <div role="dialog" aria-modal="true"> inside
 *           FloatingPortal with useFocusTrap (Dialog E15 hook), Escape
 *           handler, backdrop dismiss, scroll lock, inert siblings.
 *           SidebarTrigger has aria-expanded + aria-controls wiring to the
 *           sidebar content id. SidebarItem defaults to <a href>; `asChild`
 *           opt-in for framework Link wrappers (Next.js Link). `isActive`
 *           prop → aria-current="page" + data-active. `disabled` →
 *           aria-disabled + preventDefault on click and Enter/Space (item
 *           stays Tab-reachable so AT users can discover it per Tabs E26 /
 *           NavigationMenu E25 / Select E27 precedent; native `disabled` is
 *           invalid on `<a>`). SidebarGroup `role="group"` with
 *           optional label. SidebarSeparator `role="separator"
 *           aria-orientation="horizontal"`.
 *           **Cmd+B / Ctrl+B shortcut is consumer-owned** — different apps
 *           bind keys differently (D8 separation of concerns). Consumers
 *           wire via `useSidebar()` hook + their own window keydown listener.
 *           **DEV-mode WCAG warn** — `aria-label` required on mobile dialog.
 * @apg      https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 *           https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 *           (composition — navigation sidebars use plain nav not menubar
 *           APG per WCAG H48/ARIA11 guidance for site navigation)
 * @tested   tsc + eslint + next build (Playwright/NVDA/axe deferred per E15
 *           scope — consistent across 21 prior Phase 10 components).
 * @regressions tests/Sidebar.{keyboard,focus,aria,regression}.spec.md —
 *           24 regression cases SB-R01..R24 in `docs/specs/sidebar-spec.md`
 *           (promoted from `_tmp` in E42).
 *
 * @example
 * // Basic desktop + mobile responsive
 * <SidebarProvider>
 *   <Sidebar aria-label="Main sidebar">
 *     <SidebarHeader>
 *       <strong>Acme</strong>
 *     </SidebarHeader>
 *     <SidebarContent aria-label="Primary navigation">
 *       <SidebarGroup label="Navigation">
 *         <SidebarItem href="/" isActive>Dashboard</SidebarItem>
 *         <SidebarItem href="/reports">Reports</SidebarItem>
 *       </SidebarGroup>
 *     </SidebarContent>
 *     <SidebarFooter>v1.0</SidebarFooter>
 *   </Sidebar>
 *   <main>
 *     <header>
 *       <SidebarTrigger />
 *     </header>
 *     {children}
 *   </main>
 * </SidebarProvider>
 *
 * @example
 * // Persistent via cookie (SSR-friendly — consumer reads cookie in Server
 * // Component and passes to defaultOpen)
 * // server layout.tsx:
 * //   const cookieValue = cookies().get('bleizlabs-sidebar')?.value;
 * //   const defaultOpen = cookieValue !== 'false';
 * //   return <SidebarProvider defaultOpen={defaultOpen} persist>...</SidebarProvider>
 */

// ============================================================================
// Types
// ============================================================================

export type SidebarSide = 'left' | 'right';

export type SidebarCollapseMode = 'offcanvas' | 'none';

export interface SidebarProviderProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled open state. When set, `onOpenChange` becomes required for interaction. */
  open?: boolean;
  /** Uncontrolled initial open state. Default `true` (desktop-first). */
  defaultOpen?: boolean;
  /** Fires on open/close transitions (controlled + uncontrolled). */
  onOpenChange?: (open: boolean) => void;
  /** Persist open state to cookie. Default `false`. Opt-in to avoid surprise cookies. */
  persist?: boolean;
  /** Cookie name for persistence. Default `'bleizlabs-sidebar'`. */
  cookieName?: string;
  /** Mobile breakpoint in px. Below this width, sidebar renders as drawer. Default `768`. */
  breakpoint?: number;
  /** Provider renders a wrapper div for layout purposes. Pass `false` to render children only. */
  asChild?: boolean;
  children: ReactNode;
}

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /** Which side the sidebar anchors to. Explicit (no auto-mirror on RTL). Default `'left'`. */
  side?: SidebarSide;
  /**
   * Collapse behavior.
   * - `'offcanvas'` (default) — desktop hides fully when closed, mobile slides out.
   * - `'none'` — sidebar always visible (useful for pinned layouts; opts out of collapse).
   */
  collapseMode?: SidebarCollapseMode;
  /** Accessible name for the aside (desktop) and dialog (mobile). */
  'aria-label'?: string;
  /** External label id (alternative to aria-label). */
  'aria-labelledby'?: string;
}

export interface SidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Polymorphic: render trigger as a custom element (e.g. IconButton). */
  asChild?: boolean;
}

export type SidebarHeaderProps = HTMLAttributes<HTMLElement>;

export interface SidebarContentProps extends HTMLAttributes<HTMLElement> {
  /** Accessible name for the <nav> element. Default `'Sidebar navigation'`. */
  'aria-label'?: string;
  /** External label id (alternative to aria-label). */
  'aria-labelledby'?: string;
}

export type SidebarFooterProps = HTMLAttributes<HTMLElement>;

export interface SidebarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional group label rendered above children with auto-wired aria-labelledby. */
  label?: ReactNode;
}

export interface SidebarItemProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick'> {
  /** Current page indicator — sets aria-current="page" + data-active. */
  isActive?: boolean;
  /** Disable activation; item stays focusable (aria-disabled, not native disabled). */
  disabled?: boolean;
  /** Polymorphic: render as a custom element (e.g. Next.js Link). */
  asChild?: boolean;
  /** Activation handler — runs on click unless disabled. */
  onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}

export type SidebarSeparatorProps = HTMLAttributes<HTMLDivElement>;

export interface UseSidebarReturn {
  /** Current open state. */
  open: boolean;
  /** Set open state. */
  setOpen: (open: boolean) => void;
  /** Toggle open state. */
  toggle: () => void;
  /** True when viewport is below breakpoint (mobile drawer mode). */
  isMobile: boolean;
}

// ============================================================================
// Context
// ============================================================================

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  isMobile: boolean;
  sidebarId: string;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebarContext(hookName: string): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error(
      `${hookName} must be used inside <SidebarProvider>. Wrap your app (or the subtree containing Sidebar + SidebarTrigger) in <SidebarProvider>.`,
    );
  }
  return ctx;
}

/** Public hook — consumer access to sidebar state from any descendant of SidebarProvider. */
export function useSidebar(): UseSidebarReturn {
  const ctx = useSidebarContext('useSidebar');
  return {
    open: ctx.open,
    setOpen: ctx.setOpen,
    toggle: ctx.toggle,
    isMobile: ctx.isMobile,
  };
}

// ============================================================================
// Cookie helpers
// ============================================================================

function writeSidebarCookie(name: string, value: boolean): void {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${name}=${value ? 'true' : 'false'}; max-age=${maxAge}; path=/; samesite=lax`;
}

// ============================================================================
// SidebarProvider
// ============================================================================

export const SidebarProvider = forwardRef<HTMLDivElement, SidebarProviderProps>(
  function SidebarProvider(
    {
      open: controlledOpen,
      defaultOpen = true,
      onOpenChange,
      persist = false,
      cookieName = 'bleizlabs-sidebar',
      breakpoint = 768,
      asChild = false,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const isControlled = controlledOpen !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    const isMobile = useMatchMedia(`(max-width: ${breakpoint - 1}px)`);

    const generatedId = useId();
    const sidebarId = `sidebar-${generatedId}`;

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) setUncontrolledOpen(next);
        onOpenChange?.(next);
        if (persist) writeSidebarCookie(cookieName, next);
      },
      [isControlled, onOpenChange, persist, cookieName],
    );

    const toggle = useCallback(() => {
      setOpen(!open);
    }, [open, setOpen]);

    const contextValue = useMemo<SidebarContextValue>(
      () => ({
        open,
        setOpen,
        toggle,
        isMobile,
        sidebarId,
      }),
      [open, setOpen, toggle, isMobile, sidebarId],
    );

    if (asChild) {
      return (
        <SidebarContext.Provider value={contextValue}>
          {children}
        </SidebarContext.Provider>
      );
    }

    return (
      <SidebarContext.Provider value={contextValue}>
        <div
          ref={ref}
          data-sidebar-layout=""
          data-state={open ? 'open' : 'closed'}
          data-mobile={isMobile ? 'true' : 'false'}
          className={cn(styles.layout, className)}
          {...rest}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    );
  },
);

// ============================================================================
// Sidebar (root)
// ============================================================================

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  {
    side = 'left',
    collapseMode = 'offcanvas',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    className,
    children,
    ...rest
  },
  ref,
) {
  const { open, isMobile, setOpen, sidebarId } = useSidebarContext('Sidebar');
  const asideRef = useRef<HTMLElement | null>(null);
  const mobileRef = useRef<HTMLDivElement | null>(null);
  const mergedAsideRef = useMemo(() => mergeRefs(ref, asideRef), [ref]);

  const isDrawer = isMobile && collapseMode === 'offcanvas';
  const isDrawerOpen = isDrawer && open;

  // DEV-mode WCAG 2.1 SC 1.1.1 + axe-core `dialog-name` / `landmark-unique` —
  // sidebar must have accessible name. Dev-only warn stripped from production.
  // Fires once per mount; label changes post-mount are acceptable.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (!ariaLabel && !ariaLabelledby) {
      console.warn(
        '[Sidebar] Missing accessible name. Pass either `aria-label` or `aria-labelledby` — an unlabelled sidebar fails axe `landmark-unique` / `dialog-name` rules + WCAG 2.1 SC 1.1.1 / 4.1.2 for screen reader users.',
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus trap — active only when rendering as mobile drawer.
  useFocusTrap(mobileRef, isDrawerOpen);

  // Scroll lock — mobile drawer only (matches Dialog E15 / Command E37 pattern).
  useEffect(() => {
    if (!isDrawerOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isDrawerOpen]);

  // Inert siblings — aria-hidden on body children (excluding portal root).
  useEffect(() => {
    if (!isDrawerOpen) return;
    const portalMarker = mobileRef.current;
    if (!portalMarker) return;
    const portalRoot = portalMarker.closest('[data-sidebar-portal]');
    const siblings: Array<{ el: Element; prev: string | null }> = [];
    Array.from(document.body.children).forEach((child) => {
      if (child === portalRoot) return;
      const prev = child.getAttribute('aria-hidden');
      child.setAttribute('aria-hidden', 'true');
      siblings.push({ el: child, prev });
    });
    return () => {
      siblings.forEach(({ el, prev }) => {
        if (prev === null) el.removeAttribute('aria-hidden');
        else el.setAttribute('aria-hidden', prev);
      });
    };
  }, [isDrawerOpen]);

  // Escape to close drawer (inline — single dispatch, no outside-click hook).
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isDrawerOpen, setOpen]);

  const handleOverlayClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        setOpen(false);
      }
    },
    [setOpen],
  );

  // MOBILE DRAWER MODE
  if (isDrawer) {
    if (!open) {
      // Drawer closed — render nothing (no DOM, no portal).
      return null;
    }
    return (
      <FloatingPortal>
        <div data-sidebar-portal className={styles.portalRoot}>
          <div
            className={styles.overlay}
            data-state="open"
            onClick={handleOverlayClick}
          />
          <div
            ref={mobileRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            id={sidebarId}
            data-state="open"
            data-side={side}
            data-mobile="true"
            className={cn(
              styles.root,
              styles.drawer,
              side === 'right' ? styles.drawerRight : styles.drawerLeft,
              className,
            )}
            {...(rest as HTMLAttributes<HTMLDivElement>)}
          >
            {children}
          </div>
        </div>
      </FloatingPortal>
    );
  }

  // DESKTOP MODE (or mobile with collapseMode='none')
  return (
    <aside
      ref={mergedAsideRef}
      id={sidebarId}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      data-state={open ? 'open' : 'closed'}
      data-side={side}
      data-collapse-mode={collapseMode}
      data-mobile="false"
      className={cn(
        styles.root,
        styles.desktop,
        side === 'right' ? styles.desktopRight : styles.desktopLeft,
        collapseMode === 'none' && styles.noCollapse,
        className,
      )}
      {...rest}
    >
      {children}
    </aside>
  );
});

// ============================================================================
// SidebarTrigger
// ============================================================================

export const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  function SidebarTrigger(
    {
      asChild = false,
      className,
      onClick,
      children,
      'aria-label': ariaLabel,
      ...rest
    },
    ref,
  ) {
    const ctx = useSidebarContext('SidebarTrigger');
    const { toggle, open, sidebarId } = ctx;
    const Component = asChild ? Slot : 'button';

    const handleClick = useCallback(
      (event: ReactMouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        toggle();
      },
      [toggle, onClick],
    );

    return (
      <Component
        ref={ref}
        type={asChild ? undefined : 'button'}
        aria-expanded={open}
        aria-controls={sidebarId}
        aria-label={ariaLabel ?? 'Toggle sidebar'}
        data-state={open ? 'open' : 'closed'}
        className={cn(styles.trigger, className)}
        onClick={handleClick}
        {...rest}
      >
        {children ?? <DefaultTriggerIcon open={open} />}
      </Component>
    );
  },
);

function DefaultTriggerIcon({ open }: { open: boolean }): ReactNode {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {open ? (
        <>
          <path d="M4 5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 15h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M4 5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 15h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

// ============================================================================
// SidebarHeader
// ============================================================================

export const SidebarHeader = forwardRef<HTMLElement, SidebarHeaderProps>(
  function SidebarHeader({ className, children, ...rest }, ref) {
    return (
      <header ref={ref} className={cn(styles.header, className)} {...rest}>
        {children}
      </header>
    );
  },
);

// ============================================================================
// SidebarContent
// ============================================================================

export const SidebarContent = forwardRef<HTMLElement, SidebarContentProps>(
  function SidebarContent(
    {
      'aria-label': ariaLabel = 'Sidebar navigation',
      'aria-labelledby': ariaLabelledby,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <nav
        ref={ref}
        aria-label={ariaLabelledby ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledby}
        className={cn(styles.content, className)}
        {...rest}
      >
        {children}
      </nav>
    );
  },
);

// ============================================================================
// SidebarFooter
// ============================================================================

export const SidebarFooter = forwardRef<HTMLElement, SidebarFooterProps>(
  function SidebarFooter({ className, children, ...rest }, ref) {
    return (
      <footer ref={ref} className={cn(styles.footer, className)} {...rest}>
        {children}
      </footer>
    );
  },
);

// ============================================================================
// SidebarGroup
// ============================================================================

export const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(
  function SidebarGroup({ label, className, children, ...rest }, ref) {
    const generatedId = useId();
    const labelId = `sidebar-group-label-${generatedId}`;
    const hasLabel = label !== undefined && label !== null && label !== false;

    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={hasLabel ? labelId : undefined}
        className={cn(styles.group, className)}
        {...rest}
      >
        {hasLabel ? (
          <div id={labelId} className={styles.groupLabel}>
            {label}
          </div>
        ) : null}
        <div className={styles.groupItems}>{children}</div>
      </div>
    );
  },
);

// ============================================================================
// SidebarItem
// ============================================================================

export const SidebarItem = forwardRef<HTMLAnchorElement, SidebarItemProps>(
  function SidebarItem(
    {
      isActive = false,
      disabled = false,
      asChild = false,
      className,
      onClick,
      onKeyDown,
      href,
      children,
      'aria-current': ariaCurrent,
      ...rest
    },
    ref,
  ) {
    const Component = asChild ? Slot : 'a';

    const handleClick = useCallback(
      (event: ReactMouseEvent<HTMLAnchorElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      },
      [disabled, onClick],
    );

    const handleKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLAnchorElement>) => {
        if (disabled && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          return;
        }
        onKeyDown?.(event);
      },
      [disabled, onKeyDown],
    );

    return (
      <Component
        ref={ref}
        href={asChild ? undefined : href}
        aria-current={isActive ? (ariaCurrent ?? 'page') : ariaCurrent}
        aria-disabled={disabled ? 'true' : undefined}
        data-active={isActive ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        className={cn(styles.item, className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);

// ============================================================================
// SidebarSeparator
// ============================================================================

export const SidebarSeparator = forwardRef<HTMLDivElement, SidebarSeparatorProps>(
  function SidebarSeparator({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        className={cn(styles.separator, className)}
        {...rest}
      />
    );
  },
);
