import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import styles from './TextLink.module.scss';

/**
 * TextLink — inline atelier link atom (v0.3.4).
 *
 * @layer   atom (interactive)
 * @tokens  --color-text-primary, --color-brand, --font-size-base,
 *          --font-weight-semibold, --space-{1,2,3}, --radius-sm,
 *          --duration-{fast,normal}, --easing-default,
 *          --focus-ring (consumed via `@include mx.focus-ring`)
 * @deps    Slot (own primitive, asChild boundary), cn, React: `forwardRef`,
 *          types `AnchorHTMLAttributes`, `ReactNode`
 * @a11y    Renders `<a>` by default with text + animated arrow suffix.
 *          `asChild` projects onto a single ReactElement child (e.g. Next
 *          `<Link>`). Arrow is `aria-hidden`. Focus-visible provides a
 *          2px outline at `var(--space-1)` offset, independent of the
 *          underline state.
 * @notes   Framework-agnostic by design — no next/link dependency. For
 *          client-side navigation, consumers use `asChild` to wrap their
 *          framework's Link component. The underline animates on hover:
 *          border-bottom fades in + arrow translates + gap widens.
 *          Respects `prefers-reduced-motion` via global guard.
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

export const TextLink = forwardRef<HTMLAnchorElement, TextLinkProps>(
  function TextLink(
    { asChild = false, children, hideArrow = false, className, ...rest },
    ref,
  ) {
    const Comp = asChild ? Slot : 'a';

    return (
      <Comp ref={ref} className={cn(styles.root, className)} {...rest}>
        {children}
        {!hideArrow && (
          <span className={styles.arrow} aria-hidden>
            →
          </span>
        )}
      </Comp>
    );
  },
);
