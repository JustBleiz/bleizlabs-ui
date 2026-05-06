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
 *          v0.3.1 — semantic default colors per variant (DEFAULT_COLOR_BY_VARIANT):
 *          headings are the only primary-tier in the system, so Text defaults
 *          map onto the read + meta tiers. `body-strong` keeps primary for
 *          inline emphasis. Override with explicit `color` prop when needed.
 *
 *          | variant     | default color |
 *          | ----------- | ------------- |
 *          | lead        | secondary     |
 *          | body        | secondary     |
 *          | body-strong | primary       |
 *          | small       | secondary     |
 *          | caption     | muted         |
 *          | eyebrow     | muted         |
 *
 *          v0.5.7 — `eyebrow` variant added as the inline-light composition
 *          path for atelier eyebrow typography (0.7rem uppercase tabular-nums
 *          + 0.08em tracking + medium weight, shared via `mx.eyebrow-typography`
 *          mixin with the `Eyebrow` atom). Use this when composing eyebrow
 *          inline next to other Text variants without the `Eyebrow` atom's
 *          numeric prefix + hairline ornament. Use the standalone `Eyebrow`
 *          atom when the atelier numeric/hairline ornament is wanted.
 *
 *          Semantic note for `variant="eyebrow"`: Text renders `<p>` by default,
 *          which is the wrong semantic for an inline section marker / eyebrow
 *          label (eyebrows are not paragraphs). Prefer `asChild` with `<span>`
 *          for inline eyebrow contexts next to headings, or use the standalone
 *          `Eyebrow` atom which is `<span>` by default. The `<p>` default only
 *          stays "right" for variants `lead/body/body-strong/small/caption`.
 *
 * @example
 * <Text>Body copy paragraph.</Text>                  // secondary (default)
 * <Text variant="lead">Lead-in introduction.</Text>  // secondary
 * <Text variant="body-strong">Emphasis.</Text>       // primary
 * <Text variant="caption" uppercase>Label</Text>     // muted
 * <Text variant="eyebrow">Briefing</Text>            // muted, inline-light eyebrow
 * <Text color="primary">Override back to primary.</Text>
 * <Text asChild>
 *   <span>Inline text via asChild</span>
 * </Text>
 */
export type TextVariant =
  | 'lead'
  | 'body'
  | 'body-strong'
  | 'small'
  | 'caption'
  | 'eyebrow';

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Typography preset. Default `body`. */
  variant?: TextVariant;
  /** Font weight override (defaults to variant's natural weight). */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  /**
   * Text color. If omitted, resolves to a semantic default per variant
   * (see `DEFAULT_COLOR_BY_VARIANT`): lead/body/small → secondary,
   * body-strong → primary, caption/eyebrow → muted. `inherit` adopts
   * surrounding context.
   */
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
  eyebrow: styles.eyebrow!,
};

// E142 L2 a11y: `brand` previously pinned to `--color-brand-500`, the raw
// seed. On mid-tone seeds (e.g. teal-500) the 500 step failed AA against
// surface-raised / card bgs (~3.9:1). `--color-brand-strong` is the
// theme-aware strong token — brand-700 on light, brand-300 on dark —
// which the design system already tunes for legibility on both themes.
const COLOR_VAR: Record<NonNullable<TextProps['color']>, string> = {
  primary: 'var(--color-text-primary)',
  secondary: 'var(--color-text-secondary)',
  muted: 'var(--color-text-muted)',
  brand: 'var(--color-brand-strong)',
  inherit: 'inherit',
};

// v0.3.1 — semantic default color per variant. Headings own the primary
// tier; Text maps onto read + meta tiers so a raw `<Text variant="lead">`
// carries correct hierarchy without consumers repeating color="secondary".
// `body-strong` keeps primary because its role is inline emphasis (card
// micro-title, bolded sentence), which earns heading-adjacent weight.
const DEFAULT_COLOR_BY_VARIANT: Record<TextVariant, NonNullable<TextProps['color']>> = {
  lead: 'secondary',
  body: 'secondary',
  'body-strong': 'primary',
  small: 'secondary',
  caption: 'muted',
  eyebrow: 'muted',
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
    color,
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
  const resolvedColor = color ?? DEFAULT_COLOR_BY_VARIANT[variant];

  const textVars: CSSProperties = {
    '--text-color': COLOR_VAR[resolvedColor],
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
