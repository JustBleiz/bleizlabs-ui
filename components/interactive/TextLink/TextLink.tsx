import {
  cloneElement,
  forwardRef,
  isValidElement,
  type AnchorHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import styles from './TextLink.module.scss';

/**
 * TextLink — inline atelier link atom (v0.4.2).
 *
 * @layer   atom (interactive)
 * @tokens  --color-text-primary, --color-brand, --font-size-base,
 *          --font-weight-semibold, --space-{1,2,3}, --radius-sm,
 *          --duration-{fast,normal}, --easing-default,
 *          --focus-ring (consumed via `@include mx.focus-ring`)
 * @deps    Slot (own primitive, asChild boundary), cn, React: `forwardRef`,
 *          `cloneElement`, `isValidElement`, types `AnchorHTMLAttributes`,
 *          `ReactElement`, `ReactNode`
 * @a11y    Renders `<a>` by default with text + animated arrow suffix.
 *          `asChild` projects onto a single ReactElement child (e.g. Next
 *          `<Link>`). Arrow is `aria-hidden`. Focus-visible consumes the
 *          library-wide `mx.focus-ring` mixin for consistent outline styling.
 *          `forced-colors: active` maps to LinkText + CanvasText for Windows
 *          High Contrast Mode legibility.
 *          Security: when `target="_blank"` is passed, `rel` is auto-patched
 *          to include `noopener noreferrer` (OWASP reverse-tabnabbing guard);
 *          consumer-provided `rel` tokens are preserved and deduplicated.
 * @notes   Framework-agnostic by design — no next/link dependency. For
 *          client-side navigation, consumers use `asChild` to wrap their
 *          framework's Link component. The underline animates on hover:
 *          border-bottom fades in + arrow translates + gap widens.
 *          Respects `prefers-reduced-motion` via global guard.
 *
 *          asChild + hideArrow=false fix (v0.4.2): when `asChild` is set,
 *          Slot requires EXACTLY ONE React element child (`isValidElement`
 *          guards against arrays). Passing the consumer's child plus the
 *          arrow `<span>` produces an array → Slot returns null and the
 *          DOM is empty. Fix mirrors Button B3 (v0.3.3) — branch on asChild,
 *          inject the arrow into the consumer's child via `cloneElement` so
 *          Slot still sees exactly one element.
 *
 * @example
 * <TextLink href="/rozwiazania">Zobacz jak pracujemy</TextLink>
 *
 * @example asChild with Next.js
 * <TextLink asChild>
 *   <Link href="/rozwiazania">Zobacz jak pracujemy</Link>
 * </TextLink>
 */
export interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Project the link styling onto a single child element via Slot. Default `false`. */
  asChild?: boolean;
  /** Link label. */
  children: ReactNode;
  /** Hide the trailing arrow icon. Default `false`. */
  hideArrow?: boolean;
}

export const TextLink = forwardRef<HTMLAnchorElement, TextLinkProps>(function TextLink(
  { asChild = false, children, hideArrow = false, className, ...rest },
  ref,
) {
  // Auto-wire `rel="noopener noreferrer"` when target="_blank" to prevent
  // reverse-tabnabbing (OWASP). Preserves and deduplicates consumer-provided
  // rel tokens so `<TextLink target="_blank" rel="external">` keeps `external`.
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

  const arrow = !hideArrow ? (
    <span className={styles.arrow} aria-hidden>
      →
    </span>
  ) : null;

  if (asChild) {
    // Slot expects EXACTLY ONE React element child (isValidElement check).
    // Passing children + arrow as siblings produces a children array
    // (especially across RSC boundaries where Fragments serialize as arrays)
    // → `isValidElement` returns false → Slot returns null → empty DOM.
    //
    // Fix (v0.4.2, mirrors Button B3 v0.3.3 recipe): clone the consumer's
    // child and append the arrow into its own children, so Slot still sees
    // a single valid element. hideArrow=true path passes the child untouched.
    if (!isValidElement(children)) return null;

    const child = children as ReactElement<{ children?: ReactNode }>;
    const childWithArrow = arrow
      ? cloneElement(child, undefined, child.props.children, arrow)
      : child;

    return (
      <Slot ref={ref} className={cn(styles.root, className)} {...safeRest}>
        {childWithArrow}
      </Slot>
    );
  }

  return (
    <a ref={ref} className={cn(styles.root, className)} {...safeRest}>
      {children}
      {arrow}
    </a>
  );
});
