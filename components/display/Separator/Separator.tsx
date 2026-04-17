import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { Slot } from '@/components/utils/Slot';
import { cn } from '@/components/utils/cn';
import styles from './Separator.module.scss';

/**
 * Separator — divider line atom (Phase 3 D3, ex Divider per D24 rename).
 *
 * @layer   atom (display)
 * @tokens  --color-border-subtle, --color-border, --color-brand,
 *          --space-{0..20}
 * @deps    Slot (own primitive, asChild boundary), cn, React: `forwardRef`,
 *          type imports `CSSProperties`, `HTMLAttributes<HTMLElement>`
 * @a11y    Renders `<hr>` by default for horizontal, role-presentation
 *          `<div>` for vertical (HR has no vertical mode in CSS). When
 *          `decorative` (default), the separator is purely visual — it
 *          carries `aria-hidden` and no `role`. Set `decorative={false}`
 *          to keep semantic meaning (uses `<hr>` natively or
 *          `role="separator"` on the vertical div).
 *
 * @example
 * <Separator />
 * <Separator variant="brand" />
 * <Separator orientation="vertical" />
 */
export type SeparatorVariant = 'subtle' | 'gradient' | 'brand';
export type SeparatorOrientation = 'horizontal' | 'vertical';

export interface SeparatorProps extends HTMLAttributes<HTMLElement> {
  /** Visual variant. Default `subtle`. */
  variant?: SeparatorVariant;
  /** Orientation. Default `horizontal`. */
  orientation?: SeparatorOrientation;
  /** Custom color override (CSS color value). Overrides `variant` color. */
  color?: string;
  /** Whether the separator is decorative (no semantic meaning). Default `true`. */
  decorative?: boolean;
  /** Render as the single child element via Slot. */
  asChild?: boolean;
}

const VARIANT_CLASS: Record<SeparatorVariant, string> = {
  subtle: styles.variantSubtle!,
  gradient: styles.variantGradient!,
  brand: styles.variantBrand!,
};

export const Separator = forwardRef<HTMLElement, SeparatorProps>(
  function Separator(
    {
      variant = 'subtle',
      orientation = 'horizontal',
      color,
      decorative = true,
      asChild = false,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const isVertical = orientation === 'vertical';
    // Horizontal default → <hr>. Vertical → <div role="separator">.
    // asChild always wins if set.
    const Comp = asChild ? Slot : isVertical ? 'div' : 'hr';

    const sepVars: CSSProperties = color
      ? ({ '--separator-color': color } as CSSProperties)
      : ({} as CSSProperties);

    const a11yProps = decorative
      ? { 'aria-hidden': true }
      : isVertical
        ? { role: 'separator', 'aria-orientation': 'vertical' as const }
        : {};

    return (
      <Comp
        ref={ref as never}
        className={cn(
          styles.root,
          VARIANT_CLASS[variant],
          isVertical ? styles.vertical : styles.horizontal,
          color && styles.customColor,
          className,
        )}
        style={{ ...style, ...sepVars }}
        {...a11yProps}
        {...rest}
      />
    );
  },
);
