import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import styles from './SkipLink.module.scss';

/**
 * SkipLink — WCAG 2.4.1 Bypass Blocks anchor (skip to main content).
 *
 * Visually hidden (sr-only clip) until keyboard-focused; on `:focus-visible`
 * it reveals as a fixed pill at the top-left of the viewport, above every
 * other layer. Place it as the FIRST focusable element on the page (first
 * child of `<body>` / root layout) so the first Tab press reaches it.
 * Activation is native `<a href>` navigation — zero JavaScript.
 *
 * @layer   atom (interactive)
 * @tokens  --color-surface-raised, --color-text-primary, --color-border,
 *          --radius-input, --space-{2,3,4}, --font-secondary, --font-size-sm,
 *          --font-weight-medium, --z-skip-link, --focus-ring (consumed via
 *          `@include mx.focus-ring`).
 * @deps    cn. No Slot — SkipLink deliberately has NO `asChild`: `href` is
 *          the whole contract (same rationale as Button's "use `href`, not
 *          asChild+<Link>" guidance; fragment navigation needs no router).
 * @a11y    Renders a native `<a href>` — link role, accessible name from the
 *          label text, Tab focusable, Enter activates; nothing custom to
 *          break. Reveal is CSS-only (`:focus-visible` overrides the sr-only
 *          clip), so the component is inert for pointer users and screen
 *          readers simply announce a regular link. The TARGET must exist and
 *          should carry `tabIndex={-1}` when it is not natively focusable
 *          (e.g. `<main id="main" tabIndex={-1}>`) so browsers move focus —
 *          not just scroll — on activation; that wiring is the consumer's
 *          responsibility (documented in the example). Label defaults to
 *          English; pass a localized string for i18n (lib ships no i18n
 *          layer — precedent: PasswordInput.showPasswordLabel).
 * @notes   Server-safe — no `'use client'`, no state, no handlers; the
 *          reveal is a browser-managed pseudo-class. No transition on the
 *          reveal: the element goes from clipped (1×1px) to visible, and
 *          animating that jump is meaningless + would need a reduced-motion
 *          guard for zero benefit.
 * @regressions tests/SkipLink.regression.spec.ts — SK-R01..SK-R04 (sr-only
 *          default, focus reveal geometry, Enter navigation to target,
 *          custom href/label + rest forwarding)
 *
 * @example
 * // Root layout — first child, before any chrome:
 * <body>
 *   <SkipLink />            {// targets #main by default}
 *   <SiteHeader />
 *   <main id="main" tabIndex={-1}>{children}</main>
 * </body>
 *
 * @example
 * // Custom target + localized label:
 * <SkipLink href="#content">Przejdź do treści</SkipLink>
 */
export interface SkipLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Fragment (or URL) the link navigates to. Default `'#main'` — point it at
   * the page's main landmark (`<main id="main" tabIndex={-1}>`).
   */
  href?: string;
  /** Link label — the accessible name. Default `'Skip to main content'`. */
  children?: ReactNode;
  /** Extra class merged onto the anchor. */
  className?: string;
}

export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(function SkipLink(
  { href = '#main', children = 'Skip to main content', className, ...rest },
  ref,
) {
  return (
    <a ref={ref} href={href} className={cn(styles.root, className)} {...rest}>
      {children}
    </a>
  );
});
