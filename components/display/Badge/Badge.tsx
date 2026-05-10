import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import styles from './Badge.module.scss';

/**
 * Badge — small status / category indicator (klocek atom).
 *
 * @tokens  --color-{brand,success,warning,error,info}-{subtle,strong},
 *          --color-border-subtle, --color-text-{primary,secondary},
 *          --space-{1,2}, --font-size-{xs,sm}, --font-weight-medium,
 *          --radius-{sm,full}.
 * @a11y    Renders `<span>` by default — inline neutral element. Use `asChild`
 *          to project onto `<time dateTime="...">` for semantic timestamps.
 *          Color is decorative only — meaning must also be conveyed in `label`.
 *
 * @notes   SIMPLIFY 0.15.0 — dropped 3 props (`uppercase`, `pulse`, `dot`).
 *          Migration patterns:
 *          - uppercase → consumer SCSS class on Badge or label content
 *            (`<Badge label={<span style={{textTransform:'uppercase'}}>...`)
 *          - pulse → consumer composes `<Dot pulse>` + `<Badge>` overlay or
 *            wraps Badge with own pulse animation (data-attr + own keyframe)
 *          - dot → consumer composes `<Dot>` + `<Badge>` (`<Inline gap={1}>
 *            <Dot color="success" /><Badge label="Active" /></Inline>`)
 *
 * @example
 * <Badge label="Active" color="success" />
 *
 * @example
 * // Semantic time via asChild
 * <Badge asChild color="info">
 *   <time dateTime="2026-04-14">Apr 14</time>
 * </Badge>
 *
 * @example
 * // Live indicator (consumer composes Dot + Badge)
 * <Inline gap={1}>
 *   <Dot color="success" pulse />
 *   <Badge label="Live" color="success" />
 * </Inline>
 */
export type BadgeColor =
  | 'default'
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visible label text (required when `asChild` is false). */
  label?: string;
  /** Semantic color. Default `default` (neutral border-only). */
  color?: BadgeColor;
  /** Fully rounded pill shape. Default `false` (uses `--radius-sm`). */
  pill?: boolean;
  /** Optional leading icon (rendered left of the label). */
  icon?: ReactNode;
  /**
   * Render as the single child element via Slot. When true, child supplies
   * own text and `label` is ignored.
   */
  asChild?: boolean;
}

const COLOR_CLASS: Record<BadgeColor, string> = {
  default: styles.colorDefault!,
  brand: styles.colorBrand!,
  success: styles.colorSuccess!,
  warning: styles.colorWarning!,
  error: styles.colorError!,
  info: styles.colorInfo!,
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    label,
    color = 'default',
    pill = false,
    icon,
    asChild = false,
    className,
    children,
    ...rest
  },
  ref
) {
  const Comp = asChild ? Slot : 'span';

  const inner = asChild ? (
    children
  ) : (
    <>
      {icon ? (
        <span aria-hidden="true" className={styles.icon}>
          {icon}
        </span>
      ) : null}
      <span className={styles.label}>{label}</span>
    </>
  );

  return (
    <Comp
      ref={ref}
      className={cn(
        styles.root,
        COLOR_CLASS[color],
        pill && styles.pill,
        className
      )}
      {...rest}
    >
      {inner}
    </Comp>
  );
});
