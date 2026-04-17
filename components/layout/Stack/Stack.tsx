import {
  Children,
  Fragment,
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Slot } from '@/components/utils/Slot';
import { cn } from '@/components/utils/cn';
import type { SpaceIndex } from '@/components/types/spacing';
import styles from './Stack.module.scss';

/**
 * Stack — vertical flex layout atom.
 *
 * @layer   atom (layout)
 * @tokens  --space-{0..20} (tsx computed `var(--space-${gap})` threaded
 *          through component-local `--stack-gap`). Flex keyword values
 *          written into `--stack-align` / `--stack-justify` (via ALIGN_MAP
 *          / JUSTIFY_MAP) are CSS layout primitives, not design tokens.
 * @deps    Slot (own primitive, asChild boundary), cn, SpaceIndex type,
 *          React: `Children`, `Fragment`, `forwardRef`, type imports
 *          `CSSProperties`, `HTMLAttributes<HTMLDivElement>`, `ReactNode`
 * @a11y    Pure layout primitive. Renders `<div>` by default, no role/aria.
 *          Use `asChild` to project the layout onto a semantic element
 *          (`<ul>`, `<nav>`, `<section>`).
 * @notes   Server-Component safe (no client hooks, no browser APIs). The
 *          `forwardRef` ref type is fixed to `HTMLDivElement`; with
 *          `asChild` the actual DOM node may differ — this is an accepted
 *          trade-off of the asChild pattern (no polymorphic generics, per
 *          earlier conversation decision).
 *
 * @example
 * <Stack gap={4}>
 *   <Heading>Title</Heading>
 *   <Text>Body copy.</Text>
 * </Stack>
 *
 * <Stack gap={2} divider={<Separator />}>
 *   <Item />
 *   <Item />
 * </Stack>
 *
 * <Stack asChild gap={3}>
 *   <ul>
 *     <li>One</li>
 *     <li>Two</li>
 *   </ul>
 * </Stack>
 */
export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between children. Maps to `--space-{n}` (1=4px, 4=16px, 10=40px, …). Default 3 (12px). */
  gap?: SpaceIndex;
  /** Cross-axis alignment of children. Default `stretch`. */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Main-axis alignment of the children block. Default `start`. */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Optional element rendered between consecutive children (e.g. `<Separator />`). */
  divider?: ReactNode;
  /** Render as the single child element via Slot, inheriting Stack's classes. */
  asChild?: boolean;
}

const ALIGN_MAP: Record<NonNullable<StackProps['align']>, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const JUSTIFY_MAP: Record<NonNullable<StackProps['justify']>, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  {
    gap = 3,
    align = 'stretch',
    justify = 'start',
    divider,
    asChild = false,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const Comp = asChild ? Slot : 'div';

  const stackVars: CSSProperties = {
    '--stack-gap': `var(--space-${gap})`,
    '--stack-align': ALIGN_MAP[align],
    '--stack-justify': JUSTIFY_MAP[justify],
  } as CSSProperties;

  const content = divider ? interleaveDividers(children, divider) : children;

  return (
    <Comp
      ref={ref}
      className={cn(styles.root, className)}
      style={{ ...style, ...stackVars }}
      {...rest}
    >
      {content}
    </Comp>
  );
});

function interleaveDividers(
  children: ReactNode,
  divider: ReactNode,
): ReactNode {
  const items = Children.toArray(children);
  if (items.length <= 1) return items;

  const out: ReactNode[] = [];
  items.forEach((child, index) => {
    out.push(child);
    if (index < items.length - 1) {
      out.push(
        <Fragment key={`stack-divider-${index}`}>{divider}</Fragment>,
      );
    }
  });
  return out;
}
