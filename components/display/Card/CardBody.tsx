import { forwardRef, type HTMLAttributes } from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import styles from './CardBody.module.scss';

/**
 * CardBody — slot for Card main content (Phase 3 D1 slot).
 *
 * @layer   atom (display, flat slot — D24)
 * @tokens  --space-3
 * @a11y    Renders `<div>` by default. Pure layout slot — no semantic role.
 */
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** Render as the single child element via Slot. */
  asChild?: boolean;
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  function CardBody(
    { asChild = false, className, children, ...rest },
    ref,
  ) {
    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        ref={ref}
        className={cn(styles.root, className)}
        {...rest}
      >
        {children}
      </Comp>
    );
  },
);
