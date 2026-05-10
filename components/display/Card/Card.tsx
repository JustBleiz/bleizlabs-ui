import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import type { SpaceIndex } from '../../types/spacing';
import styles from './Card.module.scss';

/**
 * Card — surface container atom (klocek display primitive).
 *
 * @layer   atom (display)
 * @tokens  --color-surface, --color-border, --color-border-subtle,
 *          --shadow-card, --shadow-lg, --space-{0..20}, --radius-{sm..2xl},
 *          --color-brand, --color-text-primary, --padding-card,
 *          --radius-card, --card-bg-glass + --card-blur (theme-aware
 *          semantic tokens defined in `_semantics.scss`).
 *          Local channels: --card-{padding,radius,direction,gap}.
 * @deps    Slot (asChild boundary), cn, SpaceIndex type.
 * @a11y    Renders `<div>` by default — non-semantic surface. Use `asChild`
 *          to project onto `<article>`, `<section>`, or `<a>`.
 *
 * @notes   SIMPLIFY 0.15.0 — dropped 4 props (`accentColor`, `accentPosition`,
 *          `hoverable`, `width`). Migration patterns:
 *          - accentColor/accentPosition → consumer composes `<EdgeBar>` atom
 *            (separate display primitive) overlaid on Card via wrapping div
 *            OR uses `variant="accent"` for static brand-color-left accent
 *          - hoverable → consumer SCSS module rule on Card via className
 *            passthrough (`:hover { transform: translateY(-2px); ... }`)
 *          - width → consumer wraps Card in `<Container>` or sets via own
 *            SCSS / inline style on parent
 *
 * @example
 * <Card padding={5} radius="lg">
 *   <CardHeader border>
 *     <Heading level={3}>Title</Heading>
 *   </CardHeader>
 *   <CardBody>Content</CardBody>
 * </Card>
 *
 * @example
 * <Card variant="glass" padding={5}>...</Card>
 *
 * @example
 * // Interactive card (consumer wraps in interactive element via asChild)
 * <Card asChild>
 *   <a href="/items/1">Clickable card</a>
 * </Card>
 */
export type CardVariant = 'default' | 'elevated' | 'accent' | 'glass';
export type CardRadius = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type CardDirection = 'row' | 'column';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant. Default `default`. */
  variant?: CardVariant;
  /** Inner padding from the spacing scale. Default 5 (20px). */
  padding?: SpaceIndex;
  /** Border radius scale. Default `lg` (12px). */
  radius?: CardRadius;
  /** Flex direction of immediate children. Default `column`. */
  direction?: CardDirection;
  /**
   * Flex gap between immediate children from the spacing scale. When omitted,
   * no gap is applied (zero-gap flex flow). Use to space out internal Card
   * slots (CardHeader / CardBody / CardFooter / arbitrary children) without
   * adding `<Stack gap>` wrappers.
   */
  gap?: SpaceIndex;
  /** Render as the single child element via Slot. */
  asChild?: boolean;
}

const VARIANT_CLASS: Record<CardVariant, string> = {
  default: styles.variantDefault!,
  elevated: styles.variantElevated!,
  accent: styles.variantAccent!,
  glass: styles.variantGlass!,
};

const RADIUS_TOKEN: Record<CardRadius, string> = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  '2xl': 'var(--radius-2xl)',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = 'default',
    padding = 5,
    radius = 'lg',
    direction = 'column',
    gap,
    asChild = false,
    className,
    style,
    children,
    ...rest
  },
  ref
) {
  const Comp = asChild ? Slot : 'div';

  const cardVars: CSSProperties = {
    '--card-padding': `var(--space-${padding})`,
    '--card-radius': RADIUS_TOKEN[radius],
    '--card-direction': direction,
    ...(gap !== undefined && { '--card-gap': `var(--space-${gap})` }),
  } as CSSProperties;

  return (
    <Comp
      ref={ref}
      className={cn(styles.root, VARIANT_CLASS[variant], className)}
      style={{ ...style, ...cardVars }}
      {...rest}
    >
      {children}
    </Comp>
  );
});
