import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import styles from './Heading.module.scss';

/**
 * Heading — semantic heading element with decoupled visual size.
 *
 * @layer   atom (typography)
 * @tokens  --font-primary (.root font-family), --line-height-tight (.root);
 *          --font-size-{sm,base,lg,xl,2xl,3xl,4xl,5xl} (size variants — note
 *          that sizeMd class resolves to `--font-size-base`, not `--font-size-md`);
 *          size="display" is viewport-fluid via `clamp()` + tight line-height
 *          1.05 for atelier big-type rendering (v0.3.5);
 *          --font-weight-{regular,medium,semibold,bold} (tsx WEIGHT_VAR);
 *          --color-text-{primary,secondary,muted} + --color-brand-500 (tsx COLOR_VAR).
 *          Component-local CSS variables `--heading-{color,weight,align}` carry
 *          the computed values into the .root selector with design-token
 *          fallbacks. `--heading-align` accepts CSS keywords (`start` /
 *          `center` / `end`), not design tokens.
 * @deps    Slot (own primitive, asChild boundary), cn, React: `forwardRef`,
 *          type imports `CSSProperties`, `HTMLAttributes<HTMLHeadingElement>`,
 *          `ReactNode`, `Ref`
 * @a11y    Renders `<h1>..<h6>` per `level` prop. Decoupled `size` prop
 *          controls visual scale only — semantic hierarchy stays in `level`.
 *          Authors should pick `level` for document outline, `size` for
 *          visual emphasis (e.g. an `<h2>` page section may carry hero
 *          `size='5xl'`, or a chapter `<h1>` may use intimate `size='2xl'`).
 *          Use `asChild` for non-heading semantics (e.g. linked title).
 * @notes   Server-Component safe. Mixins `mx.heading-1..4` from `_mixins.scss`
 *          are intentionally not used here — they couple level + size, while
 *          this component decouples them. Base typography lives in `.root`,
 *          size variants are flat classes selecting `--font-size-*` tokens.
 *
 * @example
 * <Heading>Page title</Heading>                          // h2, size 4xl
 * <Heading level={1}>Page title</Heading>                // h1, size 5xl
 * <Heading level={2} size="3xl">Section</Heading>        // h2, smaller
 * <Heading level={3} size="5xl" align="center">Hero</Heading>
 * <Heading level={2} asChild>
 *   <a href="/article">Linked title</a>
 * </Heading>
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | 'display';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantic heading level (renders <h1>..<h6>). Default 2. */
  level?: HeadingLevel;
  /** Visual size, decoupled from level. Default = visual analog of `level`. */
  size?: HeadingSize;
  /** Font weight. Default `semibold`. */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  /** Text color (semantic token). Default `primary`. */
  color?: 'primary' | 'secondary' | 'muted' | 'brand';
  /** Text alignment. Default `start`. */
  align?: 'start' | 'center' | 'end';
  /** Render as the single child element via Slot, inheriting Heading classes (overrides `level`). */
  asChild?: boolean;
  /** Heading content. */
  children?: ReactNode;
}

const DEFAULT_SIZE_BY_LEVEL: Record<HeadingLevel, HeadingSize> = {
  1: '5xl',
  2: '4xl',
  3: '3xl',
  4: '2xl',
  5: 'xl',
  6: 'lg',
};

const SIZE_CLASS: Record<HeadingSize, string> = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
  xl: styles.sizeXl!,
  '2xl': styles.size2xl!,
  '3xl': styles.size3xl!,
  '4xl': styles.size4xl!,
  '5xl': styles.size5xl!,
  display: styles.sizeDisplay!,
};

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const WEIGHT_VAR: Record<NonNullable<HeadingProps['weight']>, string> = {
  regular: 'var(--font-weight-regular)',
  medium: 'var(--font-weight-medium)',
  semibold: 'var(--font-weight-semibold)',
  bold: 'var(--font-weight-bold)',
};

const COLOR_VAR: Record<NonNullable<HeadingProps['color']>, string> = {
  primary: 'var(--color-text-primary)',
  secondary: 'var(--color-text-secondary)',
  muted: 'var(--color-text-muted)',
  brand: 'var(--color-brand-500)',
};

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  function Heading(
    {
      level = 2,
      size,
      weight = 'semibold',
      color = 'primary',
      align = 'start',
      asChild = false,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const resolvedSize: HeadingSize = size ?? DEFAULT_SIZE_BY_LEVEL[level];

    const headingVars: CSSProperties = {
      '--heading-weight': WEIGHT_VAR[weight],
      '--heading-color': COLOR_VAR[color],
      '--heading-align': align,
    } as CSSProperties;

    const mergedClassName = cn(styles.root, SIZE_CLASS[resolvedSize], className);
    const mergedStyle = { ...style, ...headingVars };

    if (asChild) {
      return (
        <Slot
          ref={ref as Ref<HTMLElement>}
          className={mergedClassName}
          style={mergedStyle}
          {...rest}
        >
          {children}
        </Slot>
      );
    }

    const Tag = `h${level}` as HeadingTag;

    return (
      <Tag
        ref={ref}
        className={mergedClassName}
        style={mergedStyle}
        {...rest}
      >
        {children}
      </Tag>
    );
  },
);
