import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Slot } from '@/components/utils/Slot';
import { cn } from '@/components/utils/cn';
import type { SpaceIndex } from '@/components/types/spacing';
import styles from './Inline.module.scss';

/**
 * Inline — horizontal flex layout atom.
 *
 * @layer   atom (layout)
 * @tokens  --space-{0..20} (tsx computed `var(--space-${gap})` threaded
 *          through component-local `--inline-gap`). Flex keyword values
 *          written into `--inline-{align,justify,wrap}` (via ALIGN_MAP /
 *          JUSTIFY_MAP / wrap ternary) are CSS layout primitives, not design
 *          tokens. `collapseBelow` uses `data-collapse-below` attribute (not
 *          a token; queried in .module.scss via attribute selector).
 * @deps    Slot (own primitive, asChild boundary), cn, SpaceIndex type,
 *          React: `forwardRef`, type imports `CSSProperties`,
 *          `HTMLAttributes<HTMLDivElement>`, `ReactNode`
 * @a11y    Pure layout primitive. Renders `<div>` by default. Use
 *          `asChild` for semantic projection (`<nav>`, `<ul>`, `<menu>`).
 * @notes   Server-Component safe. The `collapseBelow` prop swaps
 *          flex-direction to column at viewports below the named
 *          breakpoint and back to row at/above it — useful for
 *          nav rows that should stack on mobile.
 *
 * @example
 * <Inline gap={3}>
 *   <Avatar src="..." />
 *   <Text>Username</Text>
 *   <Badge>Pro</Badge>
 * </Inline>
 *
 * <Inline gap={2} wrap>
 *   {tags.map(t => <Tag key={t}>{t}</Tag>)}
 * </Inline>
 *
 * <Inline gap={4} collapseBelow="md" align="start">
 *   <SidebarLeft />
 *   <MainContent />
 * </Inline>
 */
export interface InlineProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between children. Maps to `--space-{n}`. Default 2 (8px). */
  gap?: SpaceIndex;
  /** Cross-axis alignment. Default `center`. */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Main-axis alignment. Default `start`. */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Allow flex wrap onto multiple lines. Default `false`. */
  wrap?: boolean;
  /** Below this breakpoint, switch to vertical Stack-like layout. */
  collapseBelow?: 'sm' | 'md' | 'lg';
  /** Render as the single child element via Slot. */
  asChild?: boolean;
  /** Inline content. */
  children?: ReactNode;
}

const ALIGN_MAP: Record<NonNullable<InlineProps['align']>, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const JUSTIFY_MAP: Record<NonNullable<InlineProps['justify']>, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

export const Inline = forwardRef<HTMLDivElement, InlineProps>(function Inline(
  {
    gap = 2,
    align = 'center',
    justify = 'start',
    wrap = false,
    collapseBelow,
    asChild = false,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const Comp = asChild ? Slot : 'div';

  const inlineVars: CSSProperties = {
    '--inline-gap': `var(--space-${gap})`,
    '--inline-align': ALIGN_MAP[align],
    '--inline-justify': JUSTIFY_MAP[justify],
    '--inline-wrap': wrap ? 'wrap' : 'nowrap',
  } as CSSProperties;

  return (
    <Comp
      ref={ref}
      className={cn(styles.root, className)}
      style={{ ...style, ...inlineVars }}
      data-collapse-below={collapseBelow}
      {...rest}
    >
      {children}
    </Comp>
  );
});
