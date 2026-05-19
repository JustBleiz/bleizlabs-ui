import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Avatar, type AvatarSize } from '../../display/Avatar';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import type { SpaceIndex } from '../../types/spacing';
import styles from './AvatarGroup.module.scss';

/**
 * AvatarGroup — stacked-avatar molecule with overflow chip.
 *
 * Children-slot pattern (data-shape neutral): consumer passes `<Avatar>`
 * elements as `children`; the molecule clips the visible count to `max`,
 * collapses the remainder into a final "+N" chip (an `<Avatar>` with
 * fallback text), and applies negative-margin overlap between siblings.
 *
 * Variant-free, lockup-free, no business context — usable in panel team
 * rows, bleizos client teams, scout-hub operator lists, marketing about
 * pages. Composes lib `<Avatar>` for visual consistency.
 *
 * @layer   molecule
 * @tokens  --space-{0..20} (overlap channel via --avatar-group-overlap),
 *          --color-surface-raised + --color-border + --color-text-secondary
 *          (overflow chip — inherited via composed <Avatar fallback>).
 * @deps    Avatar (composed for each visible child + the overflow chip),
 *          Slot (asChild polymorphism), cn, SpaceIndex type.
 * @a11y    Renders `role="list"` on root; each direct child becomes a
 *          `role="listitem"` via CSS-paired wrapper. The overflow chip
 *          carries `aria-label="N more"` so screen readers announce the
 *          collapsed count. Tab order natural — consumer-controlled
 *          interactivity via `<Avatar asChild><a>...` per usual pattern.
 *
 * @example
 * <AvatarGroup>
 *   <Avatar src="/a.jpg" alt="Anna Kowalski" />
 *   <Avatar fallback="JS" alt="Jan Smith" />
 *   <Avatar fallback="TK" alt="Tomek K." />
 * </AvatarGroup>
 *
 * @example
 * // Overflow: 5 avatars with max=3 → 2 visible + "+3" chip
 * <AvatarGroup max={3} size="lg">
 *   <Avatar src="/a.jpg" alt="A" />
 *   <Avatar src="/b.jpg" alt="B" />
 *   <Avatar src="/c.jpg" alt="C" />
 *   <Avatar src="/d.jpg" alt="D" />
 *   <Avatar src="/e.jpg" alt="E" />
 * </AvatarGroup>
 *
 * @example
 * // Semantic projection via asChild
 * <AvatarGroup asChild>
 *   <ul aria-label="Assignees">
 *     <Avatar fallback="AK" alt="Anna" />
 *     <Avatar fallback="JS" alt="Jan" />
 *   </ul>
 * </AvatarGroup>
 */
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum visible avatars before the remainder collapses into a "+N"
   * overflow chip. Default `3`. When `children.length > max`, the first
   * `(max - 1)` avatars render and the last visible slot becomes a
   * fallback-only `<Avatar>` showing the excess count.
   */
  max?: number;
  /**
   * Visual size forwarded to every child `<Avatar>` (the molecule clones
   * children to inject `size`, ensuring a uniform stack). Default `'md'`.
   */
  size?: AvatarSize;
  /**
   * Overlap depth between adjacent avatars expressed as a `--space-N`
   * token index (0–20). Default `2` (→ `--space-2` = 8px negative margin
   * = ~25% overlap at `md` size). Passed through as a CSS custom property
   * so consumers can override per-instance via inline style if needed.
   */
  overlap?: SpaceIndex;
  /** Render into the single child element via Slot (semantic `<ul>` / `<nav>` / `<aside>`). */
  asChild?: boolean;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { max = 3, size = 'md', overlap = 2, asChild = false, className, style, children, ...rest },
  ref,
) {
  const Comp = asChild ? Slot : 'div';

  const all = Children.toArray(children).filter(isValidElement);
  const total = all.length;
  const exceeds = total > max;
  // When overflowing, last visible slot is the overflow chip — show
  // (max - 1) real avatars then the "+N" chip. When total ≤ max,
  // render every avatar; no chip.
  const visible = exceeds ? all.slice(0, max - 1) : all;
  const excess = exceeds ? total - (max - 1) : 0;

  const groupStyle: CSSProperties = {
    ...style,
    '--avatar-group-overlap': `var(--space-${overlap})`,
  } as CSSProperties;

  return (
    <Comp ref={ref} role="list" className={cn(styles.root, className)} style={groupStyle} {...rest}>
      {visible.map((child, idx) => (
        <span key={getChildKey(child, idx)} role="listitem" className={styles.item}>
          {cloneWithSize(child, size)}
        </span>
      ))}
      {exceeds ? (
        <span role="listitem" className={styles.item}>
          <Avatar
            size={size}
            fallback={`+${excess}`}
            alt={`${excess} more`}
            aria-label={`${excess} more`}
            className={styles.overflowChip}
          />
        </span>
      ) : null}
    </Comp>
  );
});

/**
 * Inject `size` onto a child only when (a) the child is an Avatar-like
 * element and (b) the child has not been explicitly given a `size` prop
 * by the consumer. Consumer-set size wins so per-avatar overrides work.
 */
function cloneWithSize(child: ReactNode, size: AvatarSize): ReactNode {
  if (!isValidElement<{ size?: AvatarSize }>(child)) return child;
  const typed = child as ReactElement<{ size?: AvatarSize }>;
  if (typed.props.size !== undefined) return typed;
  return cloneElement(typed, { size });
}

function getChildKey(child: ReactNode, idx: number): string | number {
  if (isValidElement(child) && child.key != null) return child.key;
  return idx;
}
