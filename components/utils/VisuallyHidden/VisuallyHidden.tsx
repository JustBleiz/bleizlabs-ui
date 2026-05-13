import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Slot } from '../Slot';
import { cn } from '../cn';
import styles from './VisuallyHidden.module.scss';

/**
 * VisuallyHidden — render content visible only to assistive tech.
 *
 * Wraps the `sr-only` SCSS mixin in a React atom so consumer code can author
 * accessible-name overlays, captions, and skip-target labels without owning
 * the screen-reader-only CSS recipe. Hidden visually (clipped 1×1px) but kept
 * in the accessibility tree.
 *
 * @layer   utility (atom)
 * @tokens  none — geometry-only primitive (position/width/height/clip/margin).
 *          No color, font, or spacing dependencies; matches `@include
 *          mx.sr-only` exactly so SCSS callers and React callers produce
 *          identical output.
 * @deps    Slot (asChild boundary), cn.
 * @a11y    Content remains in the accessibility tree and is announced by
 *          screen readers. Focusable children (e.g. skip links) become
 *          visible on focus via the consumer's own `:focus-visible` styling
 *          — VisuallyHidden does NOT auto-reveal on focus; reach for an
 *          intentional skip-link wrapper when that pattern is needed.
 *
 * @example accessible chart label
 * <Chart>
 *   <VisuallyHidden>Bar chart of monthly revenue 2026</VisuallyHidden>
 *   <ChartSvg />
 * </Chart>
 *
 * @example asChild on a heading
 * <VisuallyHidden asChild>
 *   <h2>Section title for screen readers</h2>
 * </VisuallyHidden>
 */
export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  /** Render as the single child element via Slot. Default `false`. */
  asChild?: boolean;
  /** Content to expose to assistive tech. */
  children: ReactNode;
}

export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  function VisuallyHidden({ asChild = false, className, children, ...rest }, ref) {
    const Comp = asChild ? Slot : 'span';
    return (
      <Comp ref={ref} className={cn(styles.root, className)} {...rest}>
        {children}
      </Comp>
    );
  },
);
