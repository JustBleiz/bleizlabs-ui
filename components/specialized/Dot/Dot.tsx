import { forwardRef, type HTMLAttributes } from 'react';
import { Slot } from '@/components/utils/Slot';
import { cn } from '@/components/utils/cn';
import styles from './Dot.module.scss';

/**
 * Dot — small round status indicator (Phase 6 P1, core, server-safe).
 *
 * @layer   atom (specialized)
 * @tokens  --color-{brand,success,warning,error,info}-{subtle,strong},
 *          --color-border-strong (default), --color-surface,
 *          --space-{1,2,3}, --radius-full, --duration-normal,
 *          pulse keyframe
 * @deps    Slot (own primitive, asChild boundary), cn, React: `forwardRef`,
 *          type import `HTMLAttributes<HTMLSpanElement>`
 * @a11y    Renders `<span>` by default (inline, decorative).
 *          Color alone never conveys meaning — pair with visible text in
 *          context, or pass the `label` prop for a `.sr-only` inner span so
 *          screen-reader users hear a textual description. Use `asChild`
 *          to project the dot styling onto semantic elements like
 *          `<time>` or `<a>` (Badge precedent).
 * @notes   `pulse` inherits the global `prefers-reduced-motion: reduce`
 *          guard from `_animations.scss` — no component-level override
 *          needed. Dot is purely visual — no role, no aria-* unless
 *          `label` is provided (then a visually-hidden span is emitted).
 *
 * @example
 * <Dot color="success" />
 * <Dot color="error" pulse label="System offline" />
 * <Dot asChild color="brand"><time dateTime="2026-04-14">now</time></Dot>
 */
export type DotColor =
  | 'default'
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type DotSize = 'sm' | 'md' | 'lg';

export interface DotProps extends HTMLAttributes<HTMLSpanElement> {
  /** Semantic color. Default `'default'` (neutral). Matches Badge's 6-color palette. */
  color?: DotColor;
  /** Visual size (sm=8px, md=12px, lg=16px diameter). Default `'md'`. */
  size?: DotSize;
  /** Infinite opacity pulse animation (inherits reduced-motion guard). Default `false`. */
  pulse?: boolean;
  /** Screen-reader-only text label rendered inside the dot via `.sr-only`. */
  label?: string;
  /** Render as the single child element via Slot (Badge precedent). */
  asChild?: boolean;
}

const COLOR_CLASS: Record<DotColor, string> = {
  default: styles.colorDefault!,
  brand: styles.colorBrand!,
  success: styles.colorSuccess!,
  warning: styles.colorWarning!,
  error: styles.colorError!,
  info: styles.colorInfo!,
};

const SIZE_CLASS: Record<DotSize, string> = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
};

export const Dot = forwardRef<HTMLSpanElement, DotProps>(function Dot(
  {
    color = 'default',
    size = 'md',
    pulse = false,
    label,
    asChild = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  const Comp = asChild ? Slot : 'span';

  const srLabel = label ? (
    <span className={styles.srOnly}>{label}</span>
  ) : null;

  return (
    <Comp
      ref={ref}
      className={cn(
        styles.root,
        COLOR_CLASS[color],
        SIZE_CLASS[size],
        pulse && styles.pulse,
        className,
      )}
      {...rest}
    >
      {asChild ? children : srLabel}
    </Comp>
  );
});
