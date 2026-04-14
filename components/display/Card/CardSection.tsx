import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { Slot } from '@/components/utils/Slot';
import { cn } from '@/components/utils/cn';
import styles from './CardSection.module.scss';

/**
 * CardSection — slot for grouping related content blocks inside a Card body
 * (Phase 3 D1 slot, optional separator between adjacent sections).
 *
 * @layer   atom (display, flat slot — D24)
 * @tokens  --space-{3,4}, --color-border-subtle
 * @a11y    Renders `<div>` by default. Use `asChild` to project onto
 *          a semantic element when grouping needs explicit meaning.
 * @notes   `separator=true` draws a top border + spacing on the section,
 *          unless it is the first child of its container (where the divider
 *          would have nothing above it to separate). Compose multiple
 *          CardSection siblings inside CardBody to build a divided list;
 *          mark each one (or only the ones you want to detach from the
 *          previous block) with `separator`.
 */
export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  /** Flex direction of children. Default `column`. */
  direction?: 'row' | 'column';
  /** Draw a top border + spacing when adjacent to another `separator` section. */
  separator?: boolean;
  /** Render as the single child element via Slot. */
  asChild?: boolean;
}

export const CardSection = forwardRef<HTMLDivElement, CardSectionProps>(
  function CardSection(
    {
      direction = 'column',
      separator = false,
      asChild = false,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const Comp = asChild ? Slot : 'div';

    const sectionVars: CSSProperties = {
      '--card-section-direction': direction,
    } as CSSProperties;

    return (
      <Comp
        ref={ref}
        className={cn(styles.root, separator && styles.separator, className)}
        style={{ ...style, ...sectionVars }}
        {...rest}
      >
        {children}
      </Comp>
    );
  },
);
