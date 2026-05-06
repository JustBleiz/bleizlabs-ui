import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import styles from './Badge.module.scss';

/**
 * Badge — small status / category indicator.
 *
 * @tokens  --color-{brand,success,warning,error,info}-{subtle,strong},
 *          --color-border-subtle, --color-text-{primary,secondary},
 *          --space-{1,2}, --font-size-xs, --font-weight-medium,
 *          --letter-spacing-wider, --radius-{sm,full,badge},
 *          --easing-default
 *
 * @a11y    Renders `<span>` by default — inline neutral element.
 *          Use `asChild` to project onto `<time dateTime="...">` for
 *          semantic timestamps. Color is decorative only — meaning
 *          must also be conveyed in the `label`. `pulse` is purely
 *          visual — never the sole carrier of urgency; pair with
 *          color + label so the meaning survives reduced-motion.
 *          `pulse` animates only the leading `icon` / `dot` — the
 *          frame + label stay static so the text is always readable.
 *          Pass `icon` or `dot` together with `pulse` for the cue
 *          to be visible.
 *
 * @example
 * <Badge label="Active" color="success" />
 *
 * <Badge asChild color="info" dot>
 *   <time dateTime="2026-04-14">Apr 14</time>
 * </Badge>
 *
 * @example
 * // Notification badge with pulse. Pulse inherits global reduced-motion
 * // guard so it auto-stops for users who opt out of animations.
 * <Badge color="warning" label="3" icon={<IconBell />} pill pulse />
 */
export type BadgeColor =
  | 'default'
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visible label text (required when `asChild` is false; ignored when `asChild` is true and `children` is used instead). */
  label?: string;
  /** Semantic color. Default `default` (neutral border-only). */
  color?: BadgeColor;
  /** Fully rounded pill shape. Default `false` (uses `--radius-sm`). */
  pill?: boolean;
  /** Uppercase text + wider letter-spacing. Default `false`. */
  uppercase?: boolean;
  /** Optional leading icon (rendered left of the label). */
  icon?: ReactNode;
  /** Show a small filled dot left of the label. Default `false`. */
  dot?: boolean;
  /** Pulse only the leading `icon` / `dot` (badge frame + label stay static). Pass `icon` or `dot` for the cue to be visible. Inherits global reduced-motion guard. Default `false`. */
  pulse?: boolean;
  /** Render as the single child element via Slot. When true, the child element supplies its own text and `label` is ignored. */
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
    uppercase = false,
    icon,
    dot = false,
    pulse = false,
    asChild = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  const Comp = asChild ? Slot : 'span';

  const inner = asChild ? (
    children
  ) : (
    <>
      {dot ? <span aria-hidden="true" className={styles.dot} /> : null}
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
        uppercase && styles.uppercase,
        pulse && styles.pulse,
        className,
      )}
      {...rest}
    >
      {inner}
    </Comp>
  );
});
