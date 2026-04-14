import {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type Ref,
} from 'react';
import { Slot } from '@/components/utils/Slot';
import { cn } from '@/components/utils/cn';
import type { SpaceIndex } from '@/components/types/spacing';
import styles from './Section.module.scss';

/**
 * Section — full-width semantic band layout atom.
 *
 * @layer   atom (layout)
 * @tokens  --color-surface, --color-surface-raised, --color-brand-50,
 *          --space-{0..20}, --container-lg
 * @deps    Slot, cn, SpaceIndex
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
  children?: React.ReactNode;
}

const BG_MAP: Record<NonNullable<SectionProps['bg']>, string> = {
  surface: 'var(--color-surface)',
  raised: 'var(--color-surface-raised)',
  'brand-subtle': 'var(--color-brand-50)',
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
