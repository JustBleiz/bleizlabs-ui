'use client';

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { Inline } from '../../layout/Inline';
import { Stack } from '../../layout/Stack';
import { SidebarProvider } from '../../complex/Sidebar';
import { cn } from '../../utils/cn';

import styles from './AppShell.module.scss';

/**
 * AppShell — app-level layout chrome preset (Phase 12 composition preset).
 *
 * @layer   preset (composition). Sister of SiteHeader (Phase 12). Composes
 *          SidebarProvider + lib Sidebar slot + main scaffold + optional
 *          TopNav slot. No new interactive semantics — Sidebar owns
 *          disclosure + keyboard + focus trap + scroll lock + Escape +
 *          backdrop. AppShell adds layout chrome + landmark scaffold only.
 * @tokens  --color-surface-section (root viewport-fill background),
 *          --color-surface (main column tint via existing semantic token).
 *          Inherits Sidebar's own token surface. Zero new tokens.
 * @deps    SidebarProvider (E38 CI22), Inline + Stack (layout primitives), cn.
 *          Zero new runtime deps vs Sidebar. No icon-library deps.
 * @a11y    Renders native `<main>` landmark in content area. Sidebar (consumer-
 *          supplied) owns nav landmark + disclosure semantics. mobileTrigger
 *          slot owns aria-expanded + aria-controls (SidebarTrigger does this
 *          automatically). AppShell is semantically neutral chrome — does NOT
 *          add ARIA roles of its own beyond `<main>`.
 * @apg     N/A — composition preset only. Semantics inherited from Sidebar
 *          (`/dialog-modal/` disclosure pattern on mobile drawer) and native
 *          HTML5 landmarks (`<main>`).
 * @notes   STRUCTURED-PROPS slot pattern (NOT compound) — mirrors EntityCard
 *          API conventions (preset family consistency). `sidebar` is required
 *          (consumer feeds the lib Sidebar instance with brand/nav/footer
 *          composed inside). `topNav` + `mobileTrigger` are opt-in slots
 *          (e.g. bleizos has no topNav, panel has TopNav with breadcrumb).
 *          `providerProps` forwards SidebarProvider config — AppShell does
 *          NOT override SidebarProvider defaults (R6 reuse-first: single
 *          source of truth for `defaultOpen=true` + `breakpoint=768` lives in
 *          the primitive). If your admin shell needs a wider drawer trigger
 *          breakpoint, pass `providerProps={{ breakpoint: 1024 }}` explicitly.
 *
 *          DOM TARGETING: `ref` and the rest-spread (`...rest`) of HTML
 *          attributes BOTH target the outer flex-row `<div>` (Inline root),
 *          NOT the inner `<main>` element. Consumer-passed `id` / `data-*` /
 *          `aria-*` land on the row wrapper. The `<main>` landmark is owned
 *          by AppShell internally — to scroll-to-top within main, use a ref
 *          on a wrapper INSIDE `children`.
 *
 *          PADDING-TOP CANCELLATION: AppShell ships `padding-top: 0` on the
 *          inner `<main>` element. This intentionally cancels any consumer
 *          global rule like `main { padding-top: var(--nav-footprint) }`
 *          (typical marketing-site convention). Marketing surfaces should
 *          scope nav-footprint compensation to their own layout, NOT global
 *          tag selector. Forensic: 2026-05-05 panel + bleizos regression in
 *          `bleizlabs-website` consumer required two near-identical fix-ups
 *          before AppShell preset existed — single source of truth here
 *          prevents the bug class entirely.
 *
 *          Consumer SCSS overrides via className passthrough on root per
 *          shadcn pattern (R4) — lib provides STRUCTURE, consumer provides
 *          VISUAL identity.
 *
 * @example
 * // Consumer usage — minimal (bleizos pattern, no topNav, primitive defaults)
 * <AppShell
 *   sidebar={<MySidebar />}
 *   mobileTrigger={<SidebarTrigger aria-label="Otworz menu" />}
 * >
 *   {children}
 * </AppShell>
 *
 * @example
 * // Consumer usage — with topNav + custom breakpoint (panel pattern)
 * <AppShell
 *   sidebar={<MySidebar />}
 *   topNav={<MyTopNav />}
 *   mobileTrigger={<SidebarTrigger aria-label="Otworz menu" />}
 *   providerProps={{ breakpoint: 1024 }}
 *   className={styles.shell}
 * >
 *   {children}
 * </AppShell>
 */

/**
 * Subset of SidebarProvider config that AppShell forwards. Controlled-mode
 * props (open / onOpenChange) intentionally NOT exposed — admin shells
 * almost always run uncontrolled. Wrap SidebarProvider directly if your
 * consumer truly needs controlled mode.
 */
export interface AppShellProviderConfig {
  /** Initial open state (uncontrolled). Defaults to SidebarProvider primitive default (`true`). */
  defaultOpen?: boolean;
  /** Viewport breakpoint (px) below which Sidebar collapses to mobile drawer. Defaults to SidebarProvider primitive default (`768`). Pass `1024` for wider admin sidebars. */
  breakpoint?: number;
  /** Persist open state to cookie (SSR-safe rehydration). Defaults to SidebarProvider primitive default (`false`). */
  persist?: boolean;
  /** Cookie name when `persist=true`. Defaults to SidebarProvider primitive default (`'sidebar-open'`). */
  cookieName?: string;
}

export interface AppShellProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Required — consumer-supplied Sidebar instance (lib `complex/Sidebar`
   * compound). Compose brand + nav + footer inside the Sidebar; AppShell
   * provides the surrounding layout chrome only.
   */
  sidebar: ReactNode;
  /**
   * Optional top nav rendered above the content area inside the main column
   * (e.g. `<Breadcrumb>` + identity pill + actions row). When omitted, the
   * content area abuts the top of the viewport.
   */
  topNav?: ReactNode;
  /**
   * Optional mobile drawer trigger — typically `<SidebarTrigger>` from the
   * lib Sidebar compound. Rendered as a sibling of the main column so it
   * stays visible while the drawer is closed (CSS controls visibility per
   * breakpoint via SidebarProvider's `data-state`).
   */
  mobileTrigger?: ReactNode;
  /** Forwarded to internal `<SidebarProvider>`. */
  providerProps?: AppShellProviderConfig;
  /** Page content rendered inside the `<main>` landmark. */
  children: ReactNode;
}

export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(
  function AppShell(
    {
      sidebar,
      topNav,
      mobileTrigger,
      providerProps,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <SidebarProvider {...providerProps} asChild>
        <Inline
          ref={ref}
          gap={0}
          align="stretch"
          className={cn(styles.root, className)}
          {...rest}
        >
          {sidebar}
          {mobileTrigger}
          <Stack gap={0} className={styles.main}>
            {topNav}
            <main className={styles.content}>{children}</main>
          </Stack>
        </Inline>
      </SidebarProvider>
    );
  },
);
