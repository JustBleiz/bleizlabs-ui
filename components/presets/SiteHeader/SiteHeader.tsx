'use client';

import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Container } from '../../layout/Container';
import { Section } from '../../layout/Section';
import { Sheet } from '../../complex/Sheet';
import { cn } from '../../utils/cn';
import { Slot } from '../../utils/Slot';
import type { SpaceIndex } from '../../types/spacing';
import styles from './SiteHeader.module.scss';

/**
 * SiteHeader — Phase 12 CP1 (Composition Presets kickoff, E141).
 *
 * Site-level top navigation preset. Composition — Zero new runtime primitives.
 * Layers Section (tag="header") + Container + inline flex bar + Sheet (mobile
 * drawer) + Slot (asChild) via a 5-symbol compound flat API (D24): SiteHeader +
 * SiteHeaderBrand + SiteHeaderNav + SiteHeaderActions + SiteHeaderMobileToggle.
 *
 * @layer    composition-preset
 * @tokens   --color-surface, --color-surface-hover, --color-surface-muted,
 *           --color-border-subtle, --color-text-primary, --color-text-secondary,
 *           --card-blur (reused for blur variant), --radius-md, --focus-ring,
 *           --duration-fast, --duration-normal, --easing-default,
 *           --space-{2,3,4}, --z-sticky, --font-size-sm, --font-size-base
 * @deps     Section, Container, Sheet (E18), cn, Slot, SpaceIndex. No external
 *           runtime deps (D5/D25). Hamburger icon inlined.
 * @a11y     Composition of three APG patterns — landmarks/banner (`<header>` via
 *           Section tag="header" → native banner landmark), landmarks/navigation
 *           (`<nav aria-label>` with dev-mode warn when unlabeled), disclosure
 *           (MobileToggle aria-expanded + aria-controls pointing to Sheet
 *           content id), dialog-modal (inherited via Sheet composition — modal
 *           sheet with focus trap + Escape + overlay dismiss + scroll lock +
 *           inert siblings + focus restore). Sheet provides role="dialog" +
 *           aria-modal="true" + aria-labelledby (via mobileSheetTitle prop).
 *           Desktop: plain Tab through Brand → Nav items → Actions. Mobile
 *           closed: Brand → Actions → Toggle. Mobile open: focus moves into
 *           Sheet, trap cycles, Escape or overlay click restores focus to
 *           Toggle. No arrow-key hijack — route links ≠ app menubar (WCAG
 *           H48/ARIA11 guidance; same stance as Sidebar E38). Touch target
 *           ≥44×44 on coarse pointer via mx.touch-target. `prefers-reduced-
 *           motion` disables icon morph + variant transitions. `forced-colors:
 *           active` preserves border affordances.
 * @apg      https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/banner.html
 *           https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html
 *           https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 *           https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (inherited via Sheet)
 * @tested   PARTIAL — static a11y verified, runtime a11y deferred per
 *           library-wide precedent established by Sidebar E38 + 21 prior
 *           Phase 10 components:
 *             ✓ `tsc --noEmit` clean (2026-04-18)
 *             ✓ `eslint .` clean — 0 errors, 0 warnings (2026-04-18)
 *             ✓ `next build` PASS — /components/site-header prerendered
 *               static alongside 50 other routes (2026-04-18)
 *             ✓ `scripts/check-barrel.mjs` PASS — 5 exports present in
 *               `components/index.ts` (2026-04-18)
 *             ✓ 25 regression scenarios documented (SH-R01..R25) in
 *               tests/SiteHeader.regression.spec.md
 *             ✓ 4 Playwright spec templates (keyboard 8 / focus 5 / aria 6 /
 *               regression 25) ready to execute under consumer Playwright
 *               setup
 *           DEFERRED (precedent: every Phase 10 component + presets; runtime
 *           pipeline not yet wired in library CI — tracked as future Epic
 *           E142 "Playwright+axe+NVDA CI integration"):
 *             - Playwright runtime execution of 4 `.spec.md` files
 *             - `@axe-core/playwright` runtime zero-violations sweep on demo
 *             - Manual NVDA sweep per scenarios in
 *               tests/SiteHeader.keyboard.spec.md "Manual Verification"
 * @regressions tests/SiteHeader.regression.spec.md — 25 cases SH-R01..R25
 *           (sticky+scroll, backdrop-filter Safari fallback, focus restore,
 *           scroll lock, aria-expanded sync, landmark uniqueness, z-stacking,
 *           backdrop dismiss, asChild polymorphism, SSR hydration, reduced-
 *           motion, forced-colors, touch target, iOS rubber-band, portal SSR
 *           safety, id collision on multi-instance, dev-warn trigger).
 *
 * @example
 * // Basic sticky header with brand, 3 links, one action, and mobile drawer
 * <SiteHeader>
 *   <SiteHeaderBrand>
 *     <strong>Acme</strong>
 *   </SiteHeaderBrand>
 *   <SiteHeaderNav>
 *     <a href="/products">Products</a>
 *     <a href="/pricing">Pricing</a>
 *     <a href="/about">About</a>
 *   </SiteHeaderNav>
 *   <SiteHeaderActions>
 *     <button type="button">Sign in</button>
 *   </SiteHeaderActions>
 *   <SiteHeaderMobileToggle />
 * </SiteHeader>
 *
 * @example
 * // Custom MobileToggle via asChild, blur variant, lg size, custom nav label
 * <SiteHeader variant="blur" size="lg" navAriaLabel="Marketing primary">
 *   <SiteHeaderBrand asChild>
 *     <Link href="/"><BrandLogo /></Link>
 *   </SiteHeaderBrand>
 *   <SiteHeaderNav aria-label="Marketing primary">
 *     <Link href="/features">Features</Link>
 *     <Link href="/docs">Docs</Link>
 *   </SiteHeaderNav>
 *   <SiteHeaderActions>
 *     <ThemeToggle />
 *     <Button variant="primary" href="/signup">Get started</Button>
 *   </SiteHeaderActions>
 *   <SiteHeaderMobileToggle asChild>
 *     <IconButton icon={<MenuIcon />} />
 *   </SiteHeaderMobileToggle>
 * </SiteHeader>
 */

// ============================================================================
// Types
// ============================================================================

export type SiteHeaderVariant = 'solid' | 'blur';
export type SiteHeaderPosition = 'sticky' | 'static';
export type SiteHeaderSize = 'sm' | 'md' | 'lg';
export type SiteHeaderContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'fluid';

export interface SiteHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Visual variant: `solid` flat surface or `blur` translucent glassmorphism overlay. Default `'solid'`. */
  variant?: SiteHeaderVariant;
  /** Positioning: `sticky` pins to top via `--z-sticky`, `static` follows normal document flow. Default `'sticky'`. */
  position?: SiteHeaderPosition;
  /** Render subtle bottom border separator. Default `false`. */
  bordered?: boolean;
  /** Bar height preset — sm 64px, md 72px, lg 88px. Default `'md'`. */
  size?: SiteHeaderSize;
  /** Max-width of inner container (forwarded to Container `size`). Default `'xl'` (1280px). */
  containerSize?: SiteHeaderContainerSize;
  /** Accessible name for the nav landmark (forwarded to inner SiteHeaderNav default). Default `'Primary'`. */
  navAriaLabel?: string;
  /** Mobile Sheet title (drives `aria-labelledby` inside the Sheet). Default `'Navigation'`. */
  mobileSheetTitle?: string;
  /** Controlled mobile open state. Omit for uncontrolled. */
  mobileOpen?: boolean;
  /** Callback invoked whenever mobile open state changes (fires in both controlled and uncontrolled modes). */
  onMobileOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export interface SiteHeaderBrandProps extends HTMLAttributes<HTMLDivElement> {
  /** Render as a single child element via Slot (typically wrapping a framework `<Link>` that hosts the logo). */
  asChild?: boolean;
  children?: ReactNode;
}

export interface SiteHeaderNavProps extends Omit<HTMLAttributes<HTMLElement>, 'aria-label'> {
  /** Override the nav landmark's accessible name. Falls back to SiteHeader `navAriaLabel`. */
  'aria-label'?: string;
  /** Gap between nav children from spacing scale. Default `4` (16px) in header bar, auto-vertical in mobile Sheet. */
  gap?: SpaceIndex;
  children?: ReactNode;
}

export interface SiteHeaderActionsProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between action children from spacing scale. Default `2` (8px). */
  gap?: SpaceIndex;
  children?: ReactNode;
}

export interface SiteHeaderMobileToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-expanded' | 'aria-controls' | 'type'> {
  /** Accessible label. Default auto-toggles `'Open navigation'` / `'Close navigation'` based on state. */
  'aria-label'?: string;
  /** Custom icon — overrides the built-in hamburger SVG that morphs to ✕ on open. */
  icon?: ReactNode;
  /** Render as single child element via Slot — forwards click handler + aria-expanded + aria-controls to the custom element. */
  asChild?: boolean;
  children?: ReactNode;
}

// ============================================================================
// Context (internal — not exported)
// ============================================================================

type RenderSlot = 'header' | 'sheet';

interface SiteHeaderContextValue {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobileOpen: () => void;
  sheetId: string;
  toggleId: string;
  size: SiteHeaderSize;
  navAriaLabel: string;
  renderSlot: RenderSlot;
}

const SiteHeaderContext = createContext<SiteHeaderContextValue | null>(null);

function useSiteHeaderContext(componentName: string): SiteHeaderContextValue {
  const ctx = useContext(SiteHeaderContext);
  if (!ctx) {
    throw new Error(
      `${componentName} must be rendered inside <SiteHeader>. Wrap your Brand / Nav / Actions / MobileToggle slots in a single <SiteHeader> root.`,
    );
  }
  return ctx;
}

// ============================================================================
// SiteHeader (root)
// ============================================================================

export const SiteHeader = forwardRef<HTMLElement, SiteHeaderProps>(function SiteHeader(
  {
    variant = 'solid',
    position = 'sticky',
    bordered = false,
    size = 'md',
    containerSize = 'xl',
    navAriaLabel = 'Primary',
    mobileSheetTitle = 'Navigation',
    mobileOpen: controlledOpen,
    onMobileOpenChange,
    className,
    children,
    ...rest
  },
  ref,
) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const mobileOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setMobileOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onMobileOpenChange?.(next);
    },
    [isControlled, onMobileOpenChange],
  );

  const toggleMobileOpen = useCallback(() => {
    setMobileOpen(!mobileOpen);
  }, [mobileOpen, setMobileOpen]);

  const generatedId = useId();
  const sheetId = `site-header-sheet-${generatedId}`;
  const toggleId = `site-header-toggle-${generatedId}`;

  // Find a single SiteHeaderNav child to duplicate inside the Sheet portal.
  // Only the first match is picked — library contract: pass at most one nav slot.
  const navElement = useMemo<ReactElement<SiteHeaderNavProps> | null>(() => {
    let found: ReactElement<SiteHeaderNavProps> | null = null;
    Children.forEach(children, (child) => {
      if (found) return;
      if (isValidElement(child) && child.type === SiteHeaderNav) {
        found = child as ReactElement<SiteHeaderNavProps>;
      }
    });
    return found;
  }, [children]);

  const baseContextValue = useMemo<SiteHeaderContextValue>(
    () => ({
      mobileOpen,
      setMobileOpen,
      toggleMobileOpen,
      sheetId,
      toggleId,
      size,
      navAriaLabel,
      renderSlot: 'header',
    }),
    [mobileOpen, setMobileOpen, toggleMobileOpen, sheetId, toggleId, size, navAriaLabel],
  );

  const sheetContextValue = useMemo<SiteHeaderContextValue>(
    () => ({ ...baseContextValue, renderSlot: 'sheet' }),
    [baseContextValue],
  );

  const rootClass = cn(
    styles.root,
    styles[variant],
    styles[position],
    styles[size],
    bordered && styles.bordered,
    className,
  );

  return (
    <SiteHeaderContext.Provider value={baseContextValue}>
      <Section
        ref={ref}
        tag="header"
        bg="transparent"
        py={0}
        fullBleed
        className={rootClass}
        {...rest}
      >
        <Container size={containerSize} padding={4}>
          <div className={cn(styles.bar, styles[`bar-${size}`])}>{children}</div>
        </Container>
      </Section>

      <Sheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        side="left"
        size="md"
        title={mobileSheetTitle}
        id={sheetId}
      >
        <SiteHeaderContext.Provider value={sheetContextValue}>
          {navElement
            ? cloneElement(navElement, { key: 'site-header-nav-sheet' })
            : null}
        </SiteHeaderContext.Provider>
      </Sheet>
    </SiteHeaderContext.Provider>
  );
});

// ============================================================================
// SiteHeaderBrand
// ============================================================================

export const SiteHeaderBrand = forwardRef<HTMLDivElement, SiteHeaderBrandProps>(
  function SiteHeaderBrand({ asChild = false, className, children, ...rest }, ref) {
    // Ensure Brand is only ever rendered once (header bar). Inside Sheet slot,
    // only Nav is replayed, so Brand lives exclusively in the header context.
    useSiteHeaderContext('SiteHeaderBrand');
    const Component = asChild ? Slot : 'div';
    return (
      <Component ref={ref} className={cn(styles.brand, className)} {...rest}>
        {children}
      </Component>
    );
  },
);

// ============================================================================
// SiteHeaderNav
// ============================================================================

export const SiteHeaderNav = forwardRef<HTMLElement, SiteHeaderNavProps>(
  function SiteHeaderNav(
    { 'aria-label': ariaLabel, gap, className, children, ...rest },
    ref,
  ) {
    const { renderSlot, navAriaLabel } = useSiteHeaderContext('SiteHeaderNav');
    const isSheet = renderSlot === 'sheet';
    const effectiveLabel = ariaLabel ?? navAriaLabel;

    // DEV-mode WCAG 2.1 SC 1.1.1 / 4.1.2 — nav landmark must be labeled when
    // multiple navs are on the page. We assume a SiteHeader is always among
    // other navs (footer, breadcrumb, sidebar) so we require a label; fire once
    // per mount when neither navAriaLabel default nor override produced a
    // non-empty string (defensive — default 'Primary' should always resolve).
    useEffect(() => {
      if (process.env.NODE_ENV === 'production') return;
      if (!effectiveLabel || effectiveLabel.trim().length === 0) {
        console.warn(
          '[SiteHeaderNav] Missing accessible name. Pass `aria-label` (preferred) or set `navAriaLabel` on SiteHeader — an unlabelled nav landmark fails axe `landmark-unique` + WCAG 2.1 SC 1.1.1 / 4.1.2 when another <nav> exists on the page.',
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Gap resolution — in header bar defaults to 4 (16px horizontal). Inside
    // Sheet we render vertically so gap hint becomes row gap via flex-direction
    // column; we still expose the prop to consumer for override.
    const gapValue = gap ?? (isSheet ? 3 : 4);

    const { style: consumerStyle, ...restWithoutStyle } = rest;
    return (
      <nav
        ref={ref}
        aria-label={effectiveLabel}
        data-slot={renderSlot}
        className={cn(
          styles.nav,
          isSheet ? styles.navSheet : styles.navDesktop,
          className,
        )}
        {...restWithoutStyle}
        style={{
          ...(consumerStyle ?? {}),
          ['--site-header-nav-gap' as string]: `var(--space-${gapValue})`,
        }}
      >
        {children}
      </nav>
    );
  },
);

// ============================================================================
// SiteHeaderActions
// ============================================================================

export const SiteHeaderActions = forwardRef<HTMLDivElement, SiteHeaderActionsProps>(
  function SiteHeaderActions({ gap = 2, className, children, ...rest }, ref) {
    useSiteHeaderContext('SiteHeaderActions');
    const { style: consumerStyle, ...restWithoutStyle } = rest;
    return (
      <div
        ref={ref}
        className={cn(styles.actions, className)}
        {...restWithoutStyle}
        style={{
          ...(consumerStyle ?? {}),
          ['--site-header-actions-gap' as string]: `var(--space-${gap})`,
        }}
      >
        {children}
      </div>
    );
  },
);

// ============================================================================
// SiteHeaderMobileToggle
// ============================================================================

export const SiteHeaderMobileToggle = forwardRef<
  HTMLButtonElement,
  SiteHeaderMobileToggleProps
>(function SiteHeaderMobileToggle(
  { asChild = false, icon, children, className, onClick, 'aria-label': ariaLabel, ...rest },
  ref,
) {
  const { mobileOpen, toggleMobileOpen, sheetId, toggleId } =
    useSiteHeaderContext('SiteHeaderMobileToggle');

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      toggleMobileOpen();
    },
    [onClick, toggleMobileOpen],
  );

  const Component = asChild ? Slot : 'button';
  const resolvedLabel =
    ariaLabel ?? (mobileOpen ? 'Close navigation' : 'Open navigation');

  return (
    <Component
      ref={ref}
      type={asChild ? undefined : 'button'}
      id={toggleId}
      aria-expanded={mobileOpen}
      aria-controls={sheetId}
      aria-label={resolvedLabel}
      data-state={mobileOpen ? 'open' : 'closed'}
      className={cn(styles.mobileToggle, className)}
      onClick={handleClick}
      {...rest}
    >
      {children ?? icon ?? <DefaultHamburgerIcon open={mobileOpen} />}
    </Component>
  );
});

// ============================================================================
// Internal — default hamburger icon (morphs to ✕ when open)
// ============================================================================

function DefaultHamburgerIcon({ open }: { open: boolean }): ReactNode {
  return (
    <span
      className={styles.toggleIcon}
      data-open={open ? 'true' : 'false'}
      aria-hidden="true"
    >
      <span className={styles.toggleBar} />
      <span className={styles.toggleBar} />
      <span className={styles.toggleBar} />
    </span>
  );
}
