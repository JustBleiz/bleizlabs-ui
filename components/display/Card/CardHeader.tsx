import { forwardRef, type HTMLAttributes } from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import styles from './CardHeader.module.scss';

/**
 * CardHeader — slot for Card title + meta area (Phase 3 D1 slot).
 *
 * @layer   atom (display, flat slot — D24)
 * @tokens  --space-{1,4}, --color-border-subtle
 * @a11y    Renders `<div>` by default. Use `asChild` to project onto
 *          `<header>` if the parent Card is article/section semantic.
 *
 * @example
 * <CardHeader border><Heading level={3}>Title</Heading></CardHeader>
 */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Add a bottom border separator. Default `false`. */
  border?: boolean;
  /** Render as the single child element via Slot. */
  asChild?: boolean;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader(
    { border = false, asChild = false, className, children, ...rest },
    ref,
  ) {
    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        ref={ref}
        className={cn(styles.root, border && styles.border, className)}
        {...rest}
      >
        {children}
      </Comp>
    );
  },
);
