import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { Slot } from '@/components/utils/Slot';
import { cn } from '@/components/utils/cn';
import type { SpaceIndex } from '@/components/types/spacing';
import styles from './Card.module.scss';

/**
 * Card — surface container atom (Phase 3 D1).
 *
 * @layer   atom (display)
 * @tokens  --color-surface, --color-border, --color-border-subtle,
 *          --shadow-card, --shadow-lg, --space-{0..20}, --radius-{sm..2xl},
 *          --color-brand, --focus-ring, --duration-fast, --easing-default,
 *          --color-text-primary, --padding-card (base padding fallback),
 *          --radius-card (base radius fallback).
 *          Local channels (not tokens themselves): --card-{direction,width,
 *          padding,radius,accent-color} injected by tsx.
 *          Glass variant channels: --card-bg-glass + --card-blur are
 *          consumed by `.variantGlass` with SCSS fallbacks
 *          (`rgba(255,255,255,0.06)` + `12px`) — glass variant works
 *          out-of-the-box; consumers can override via inline style or
 *          parent cascade for custom glass theming.
 * @deps    Slot (own primitive, asChild boundary), cn, SpaceIndex type,
 *          React: `forwardRef`, type imports `CSSProperties`,
 *          `HTMLAttributes<HTMLDivElement>`
 * @a11y    Renders `<div>` by default — non-semantic surface. Use `asChild`
 *          to project onto `<article>`, `<section>`, or `<a>`. When
 *          `hoverable=true`, the card gains pointer + focus-visible styling
 *          but does NOT add a `tabIndex` — wrap in an interactive element
 *          via `asChild` to keep it keyboard-accessible.
 * @notes   Server-Component safe. Composes with CardHeader, CardBody,
 *          CardFooter, CardSection (flat slot pattern, D24).
 *
 * @example
 * <Card padding={5} radius="lg">
 *   <CardHeader border>
 *     <Heading level={3}>Title</Heading>
 *   </CardHeader>
 *   <CardBody>Content</CardBody>
 * </Card>
 *
 * <Card variant="glass" padding={5}>...</Card>
 *
 * <Card hoverable asChild>
 *   <a href="/items/1">Clickable card</a>
 * </Card>
 */
export type CardVariant = 'default' | 'elevated' | 'accent' | 'glass';
export type CardRadius = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type CardDirection = 'row' | 'column';
export type CardAccentPosition = 'top' | 'left';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant. Default `default`. */
  variant?: CardVariant;
  /** Inner padding from the spacing scale. Default 5 (20px). */
  padding?: SpaceIndex;
  /** Border radius scale. Default `lg` (12px). */
  radius?: CardRadius;
  /** Flex direction of immediate children. Default `column`. */
  direction?: CardDirection;
  /** Accent border color (only with `variant="accent"`). Default `--color-brand`. */
  accentColor?: string;
  /** Accent border edge (only with `variant="accent"`). Default `left`. */
  accentPosition?: CardAccentPosition;
  /** Opt-in hover effect (lift + shadow). Default `false`. */
  hoverable?: boolean;
  /** Explicit width (CSS length). Default auto. */
  width?: string;
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
    accentColor,
    accentPosition = 'left',
    hoverable = false,
    width,
    asChild = false,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const Comp = asChild ? Slot : 'div';

  const cardVars: CSSProperties = {
    '--card-padding': `var(--space-${padding})`,
    '--card-radius': RADIUS_TOKEN[radius],
    '--card-direction': direction,
    ...(width !== undefined && { '--card-width': width }),
    ...(accentColor !== undefined && { '--card-accent-color': accentColor }),
  } as CSSProperties;

  const accentClass =
    variant === 'accent'
      ? accentPosition === 'top'
        ? styles.accentTop
        : styles.accentLeft
      : undefined;

  return (
    <Comp
      ref={ref}
      className={cn(
        styles.root,
        VARIANT_CLASS[variant],
        accentClass,
        hoverable && styles.hoverable,
        className,
      )}
      style={{ ...style, ...cardVars }}
      {...rest}
    >
      {children}
    </Comp>
  );
});
