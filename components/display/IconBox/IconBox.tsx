import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Slot } from '@/components/utils/Slot';
import { cn } from '@/components/utils/cn';
import styles from './IconBox.module.scss';

/**
 * IconBox — square icon container with bg + color variants (Phase 3 D4).
 *
 * @layer   atom (display)
 * @tokens  --color-{brand,error,info}-{subtle,strong},
 *          --color-surface, --color-border-subtle,
 *          --color-text-{primary,secondary,muted},
 *          --radius-md, --space-{2,3,4}
 * @deps    Slot, cn
 * @a11y    Renders `<div>` by default. Icons are decorative — caller
 *          owns aria-label on the icon itself if it carries meaning.
 *          Use `asChild` to project onto a `<button>` if interactive.
 *
 * @example
 * <IconBox icon={<MailIcon />} variant="brand" size="md" />
 */
export type IconBoxVariant = 'default' | 'brand' | 'success' | 'error' | 'plain';
export type IconBoxSize = 'sm' | 'md' | 'lg';

export interface IconBoxProps extends HTMLAttributes<HTMLDivElement> {
  /** Icon node — typically an SVG component. Required when `asChild` is false. */
  icon?: ReactNode;
  /** Visual variant. Default `default`. */
  variant?: IconBoxVariant;
  /** Size scale. Default `md` (40px square). */
  size?: IconBoxSize;
  /** Render as the single child element via Slot. The child supplies its own icon content; `icon` is ignored. */
  asChild?: boolean;
}

const VARIANT_CLASS: Record<IconBoxVariant, string> = {
  default: styles.variantDefault!,
  brand: styles.variantBrand!,
  success: styles.variantSuccess!,
  error: styles.variantError!,
  plain: styles.variantPlain!,
};

const SIZE_CLASS: Record<IconBoxSize, string> = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
};

export const IconBox = forwardRef<HTMLDivElement, IconBoxProps>(
  function IconBox(
    {
      icon,
      variant = 'default',
      size = 'md',
      asChild = false,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        ref={ref}
        className={cn(
          styles.root,
          VARIANT_CLASS[variant],
          SIZE_CLASS[size],
          className,
        )}
        {...rest}
      >
        {asChild ? (
          children
        ) : (
          <span aria-hidden="true" className={styles.icon}>
            {icon}
          </span>
        )}
      </Comp>
    );
  },
);
