import { forwardRef, type HTMLAttributes } from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import styles from './CardFooter.module.scss';

/**
 * CardFooter — slot for Card actions / metadata bar (Phase 3 D1 slot).
 *
 * @layer   atom (display, flat slot — D24)
 * @tokens  --space-{3,4}, --color-border-subtle, --color-surface-raised,
 *          --padding-card
 * @deps    Slot (asChild boundary), cn.
 * @a11y    Renders `<div>` by default. Use `asChild` to project onto
 *          `<footer>` if the parent Card is article/section semantic.
 *          When `action=true`, the footer extends to card edges, adopts
 *          a raised background, and lays out children with
 *          `justify-content: space-between` (typical "info on left, CTA
 *          on right" pattern). Caller still owns interactivity — no
 *          implicit role is added.
 *
 * @example
 * <CardFooter border action><Text small>Updated 2m ago</Text><Button>View</Button></CardFooter>
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Add a top border separator. Default `false`. */
  border?: boolean;
  /** Full-bleed clickable footer styling (raised bg, edge-to-edge). Default `false`. */
  action?: boolean;
  /** Render as the single child element via Slot. */
  asChild?: boolean;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { border = false, action = false, asChild = false, className, children, ...rest },
  ref,
) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      ref={ref}
      className={cn(styles.root, border && styles.border, action && styles.action, className)}
      {...rest}
    >
      {children}
    </Comp>
  );
});
