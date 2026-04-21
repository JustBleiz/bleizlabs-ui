import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import styles from './Anchor.module.scss';

/**
 * Anchor — inline body-text link atom (v0.4.0).
 *
 * @layer   atom (typography)
 * @tokens  color: inherit (parent text color — integrates with Text body),
 *          --color-brand (hover/focus accent), --duration-fast,
 *          --easing-default, --focus-ring (via `@include mx.focus-ring`).
 *          Uses CSS `currentColor` for underline so decoration tracks text
 *          color automatically across light/dark themes.
 * @deps    Slot (own primitive, asChild boundary), cn, React: `forwardRef`,
 *          types `AnchorHTMLAttributes`, `ReactNode`
 * @a11y    Renders `<a href>` natively — focusable, keyboard-activatable, and
 *          announced as a link by screen readers without extra ARIA. Use
 *          `asChild` to project onto a framework Link (e.g. Next `<Link>`)
 *          while preserving link semantics.
 *          Security: when `target="_blank"` is passed, `rel` is auto-patched
 *          to include `noopener noreferrer` (OWASP reverse-tabnabbing guard);
 *          consumer-provided `rel` tokens are preserved and deduplicated.
 *          `forced-colors: active` maps to system LinkText so the link stays
 *          visible in Windows High Contrast Mode when custom palette is
 *          stripped.
 * @notes   Distinct from `TextLink` (navigational): Anchor is the body-text
 *          primitive for prose ("see our policy", "as described in §3.2") —
 *          always underlined, inherits surrounding text color, conservative
 *          hover. TextLink is nav-action (brand color, hover-reveal underline,
 *          trailing arrow). Reach for Anchor inside Text content; reach for
 *          TextLink for CTAs and nav affordances.
 *          Framework-agnostic — no next/link import; wrap Next `<Link>` via
 *          `asChild` when client-side routing is needed. Respects
 *          `prefers-reduced-motion` via a `@media` guard.
 *
 * @example
 * <Text>
 *   Polityka prywatności jest dostępna <Anchor href="/privacy">tutaj</Anchor>.
 * </Text>
 *
 * @example asChild with Next.js
 * <Text>
 *   Zobacz <Anchor asChild><Link href="/docs">dokumentację</Link></Anchor>.
 * </Text>
 *
 * @example external link (auto noopener noreferrer)
 * <Anchor href="https://example.com" target="_blank">example.com</Anchor>
 */
export interface AnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Project the anchor styling onto a single child element via Slot. Default `false`. */
  asChild?: boolean;
  /** Inline link label. */
  children: ReactNode;
}

export const Anchor = forwardRef<HTMLAnchorElement, AnchorProps>(
  function Anchor({ asChild = false, children, className, ...rest }, ref) {
    const Comp = asChild ? Slot : 'a';

    const safeRest =
      rest.target === '_blank'
        ? {
            ...rest,
            rel: Array.from(
              new Set([
                ...(rest.rel ? rest.rel.split(/\s+/).filter(Boolean) : []),
                'noopener',
                'noreferrer',
              ]),
            ).join(' '),
          }
        : rest;

    return (
      <Comp ref={ref} className={cn(styles.root, className)} {...safeRest}>
        {children}
      </Comp>
    );
  },
);
