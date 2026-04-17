import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import styles from './Text.module.scss';

/**
 * Text — universal body text component.
 *
 * @layer   atom (typography)
 * @tokens  --font-secondary (.root);
 *          --font-size-{xs,sm,base,lg} per variant (xs=caption, sm=small,
 *          base=body/body-strong, lg=lead);
 *          --font-weight-{regular,medium,semibold,bold} (tsx WEIGHT_VAR +
 *          variant defaults via --text-weight fallbacks);
 *          --line-height-{normal,relaxed} (relaxed=lead, normal=others);
 *          --color-text-{primary,secondary,muted} + --color-brand-500 (tsx
 *          COLOR_VAR; `inherit` is a CSS keyword, not a token).
 *          Component-local vars `--text-{color,align,weight}` carry computed
 *          values into .root with design-token fallbacks. `--text-align`
 *          accepts CSS keywords (`start`/`center`/`end`), not tokens.
 *          Tracking literals (0.01em in .caption, 0.06em in .uppercase) are
 *          CSS values, not design tokens.
 * @deps    Slot (own primitive, asChild boundary), cn, React: `forwardRef`,
 *          type imports `CSSProperties`, `HTMLAttributes<HTMLParagraphElement>`,
 *          `ReactNode`
 * @a11y    Renders `<p>` by default. Use `asChild` for inline elements
 *          (`<span>`) or block elements (`<div>`) when paragraph semantics
 *          are wrong. `color='inherit'` lets Text adopt the surrounding
 *          context color (useful inside Button, Badge, Card preset slots).
 * @notes   Server-Component safe. The five `variant` presets mirror the
 *          `mx.body-large/base/small/caption` mixin presets from
 *          `_mixins.scss` but are inlined as flat classes here so the
 *          component owns its typography scale rather than mixing in.
 *
 * @example
 * <Text>Body copy paragraph.</Text>
 * <Text variant="lead">Lead-in introduction.</Text>
 * <Text variant="small" color="muted">Footnote.</Text>
 * <Text variant="caption" uppercase>Section label</Text>
 * <Text asChild>
 *   <span>Inline text via asChild</span>
 * </Text>
 */
export type TextVariant = 'lead' | 'body' | 'body-strong' | 'small' | 'caption';

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Typography preset. Default `body`. */
  variant?: TextVariant;
  /** Font weight override (defaults to variant's natural weight). */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  /** Text color. Default `primary`. `inherit` adopts surrounding context. */
  color?: 'primary' | 'secondary' | 'muted' | 'brand' | 'inherit';
  /** Text alignment. Default `start`. */
  align?: 'start' | 'center' | 'end';
  /** Uppercase + tracking-wide transform. Default `false`. */
  uppercase?: boolean;
  /** Render as the single child element via Slot. */
  asChild?: boolean;
  /** Text content. */
  children?: ReactNode;
}

const VARIANT_CLASS: Record<TextVariant, string> = {
  lead: styles.lead!,
  body: styles.body!,
  'body-strong': styles.bodyStrong!,
  small: styles.small!,
  caption: styles.caption!,
};

const COLOR_VAR: Record<NonNullable<TextProps['color']>, string> = {
  primary: 'var(--color-text-primary)',
  secondary: 'var(--color-text-secondary)',
  muted: 'var(--color-text-muted)',
  brand: 'var(--color-brand-500)',
  inherit: 'inherit',
};

const WEIGHT_VAR: Record<NonNullable<TextProps['weight']>, string> = {
  regular: 'var(--font-weight-regular)',
  medium: 'var(--font-weight-medium)',
  semibold: 'var(--font-weight-semibold)',
  bold: 'var(--font-weight-bold)',
};

export const Text = forwardRef<HTMLParagraphElement, TextProps>(function Text(
  {
    variant = 'body',
    weight,
    color = 'primary',
    align = 'start',
    uppercase = false,
    asChild = false,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const Comp = asChild ? Slot : 'p';

  const textVars: CSSProperties = {
    '--text-color': COLOR_VAR[color],
    '--text-align': align,
    ...(weight ? { '--text-weight': WEIGHT_VAR[weight] } : {}),
  } as CSSProperties;

  return (
    <Comp
      ref={ref}
      className={cn(
        styles.root,
        VARIANT_CLASS[variant],
        uppercase && styles.uppercase,
        className,
      )}
      style={{ ...style, ...textVars }}
      {...rest}
    >
      {children}
    </Comp>
  );
});
