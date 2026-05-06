import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import type { SpaceIndex } from '../../types/spacing';
import styles from './Container.module.scss';

/**
 * Container — max-width centered wrapper layout atom.
 *
 * @layer   atom (layout)
 * @tokens  --container-{sm,md,lg,xl} (tsx size→var(--container-*) computed);
 *          --space-{0..20} (padding via tsx computed `var(--space-${padding})`);
 *          Component-local `--container-{max,padding-x,margin-x}` carry the
 *          computed values into .root with design-token fallbacks
 *          (--container-lg + --space-4 + `auto` respectively). `size="fluid"`
 *          bypasses --container-* with `100%` literal; `padding="none"` uses
 *          `0` literal (both are CSS primitives, not tokens).
 * @deps    Slot (own primitive, asChild boundary), cn, SpaceIndex type,
 *          React: `forwardRef`, type imports `CSSProperties`,
 *          `HTMLAttributes<HTMLDivElement>`, `ReactNode`
 * @a11y    Pure layout primitive. Renders `<div>` by default. Use
 *          `asChild` to project onto `<main>`, `<article>`, etc.
 * @notes   Server-Component safe. `size='fluid'` skips max-width
 *          entirely (full viewport width); `padding='none'` removes
 *          horizontal padding. `centered=false` aligns to the inline
 *          start without horizontal margins.
 *
 * @example
 * <Container size="lg">
 *   <PageHeader />
 *   <Article />
 * </Container>
 *
 * <Container size="md" padding={6}>...</Container>
 *
 * <Container asChild size="xl">
 *   <main>...</main>
 * </Container>
 */
export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Max-width preset. Default `lg` (1024px). `fluid` removes the cap. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fluid';
  /** Horizontal padding from the spacing scale. `none` removes it. Default 4 (16px). */
  padding?: SpaceIndex | 'none';
  /** Center horizontally with `margin-inline: auto`. Default `true`. */
  centered?: boolean;
  /** Render as the single child element via Slot. */
  asChild?: boolean;
  /** Container content. */
  children?: ReactNode;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  function Container(
    {
      size = 'lg',
      padding = 4,
      centered = true,
      asChild = false,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const Comp = asChild ? Slot : 'div';

    const maxWidth = size === 'fluid' ? '100%' : `var(--container-${size})`;
    const padX =
      padding === 'none' ? '0' : `var(--space-${padding})`;
    const marginX = centered ? 'auto' : '0';

    const containerVars: CSSProperties = {
      '--container-max': maxWidth,
      '--container-padding-x': padX,
      '--container-margin-x': marginX,
    } as CSSProperties;

    return (
      <Comp
        ref={ref}
        className={cn(styles.root, className)}
        style={{ ...style, ...containerVars }}
        {...rest}
      >
        {children}
      </Comp>
    );
  },
);
