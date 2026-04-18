import {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import type { SpaceIndex } from '../../types/spacing';
import styles from './Section.module.scss';

/**
 * Section — full-width semantic band layout atom.
 *
 * @layer   atom (layout)
 * @tokens  --color-surface, --color-surface-raised, --color-brand-50 (tsx
 *          BG_MAP; `transparent`/`none` resolve to CSS `transparent` keyword);
 *          --space-{0..20} (tsx computed `var(--space-${py})` + `--space-4`
 *          literal padding-x when `fullBleed=false`); --container-lg (self-
 *          contained max-width when `fullBleed=false`).
 *          Component-local `--section-{bg,py,max-width,padding-x,margin-x}`
 *          carry the computed values into .root. fullBleed-off literals
 *          (`none`, `0`, `auto`) are CSS keywords, not tokens.
 * @deps    Slot (own primitive, asChild boundary), cn, SpaceIndex type,
 *          React: `forwardRef`, type imports `CSSProperties`, `ElementType`,
 *          `HTMLAttributes<HTMLElement>`, `ReactNode`, `Ref`
 * @a11y    Renders `<section>` by default — semantic band element.
 *          Use `tag` to swap to another intrinsic semantic element
 *          (`<header>`, `<main>`, `<footer>`, `<aside>`, `<nav>`).
 *          Use `asChild` to project onto an arbitrary component;
 *          when both are passed, `asChild` wins and `tag` is ignored.
 * @notes   Server-Component safe. `fullBleed=true` (default) leaves
 *          the band edge-to-edge with no horizontal padding or
 *          max-width — compose with <Container> inside for content
 *          width. `fullBleed=false` makes Section self-contained:
 *          applies `--container-lg` max-width and centers itself.
 *
 * @example
 * <Section bg="raised" py={12}>
 *   <Container>
 *     <Heading>Edge-to-edge band</Heading>
 *   </Container>
 * </Section>
 *
 * <Section tag="header" bg="brand-subtle" py={8}>
 *   <PageHeader />
 * </Section>
 *
 * <Section fullBleed={false} py={6}>
 *   Self-contained, no Container needed.
 * </Section>
 */
export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Background fill variant. Default `none` (transparent). */
  bg?: 'surface' | 'raised' | 'brand-subtle' | 'transparent' | 'none';
  /** Vertical padding (top + bottom) from the spacing scale. Default 10 (40px). */
  py?: SpaceIndex;
  /** Edge-to-edge (true) or self-contained with max-width container-lg (false). Default `true`. */
  fullBleed?: boolean;
  /** Intrinsic semantic tag override. Default `section`. Ignored when `asChild` is true. */
  tag?: 'section' | 'header' | 'main' | 'footer' | 'aside' | 'nav';
  /** Render as the single child element via Slot (overrides `tag`). */
  asChild?: boolean;
  /** Section content. */
  children?: ReactNode;
}

// E142 L2 a11y: `brand-subtle` uses the theme-aware token
// `--color-brand-subtle` (= brand-100 in light, brand-900 in dark) so
// text-primary always meets WCAG AA. Previously hardcoded `--color-brand-50`
// rendered a pale teal tint in dark mode that clashed with light text.
const BG_MAP: Record<NonNullable<SectionProps['bg']>, string> = {
  surface: 'var(--color-surface)',
  raised: 'var(--color-surface-raised)',
  'brand-subtle': 'var(--color-brand-subtle)',
  transparent: 'transparent',
  none: 'transparent',
};

export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  {
    bg = 'none',
    py = 10,
    fullBleed = true,
    tag = 'section',
    asChild = false,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const Comp: ElementType = asChild ? Slot : tag;

  const sectionVars: CSSProperties = {
    '--section-bg': BG_MAP[bg],
    '--section-py': `var(--space-${py})`,
    '--section-max-width': fullBleed ? 'none' : 'var(--container-lg)',
    '--section-padding-x': fullBleed ? '0' : 'var(--space-4)',
    '--section-margin-x': fullBleed ? '0' : 'auto',
  } as CSSProperties;

  return (
    <Comp
      ref={ref as Ref<HTMLElement>}
      className={cn(styles.root, className)}
      style={{ ...style, ...sectionVars }}
      {...rest}
    >
      {children}
    </Comp>
  );
});
