import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './Skeleton.module.scss';

/**
 * Skeleton — loading placeholder atom (Phase 3 D6).
 *
 * @layer   atom (display)
 * @tokens  --color-surface-raised, --color-border-subtle,
 *          --space-2, --radius-{sm,full}, --duration-slow,
 *          shimmer + pulse keyframes
 * @deps    cn, React: `forwardRef`, type imports `CSSProperties`,
 *          `HTMLAttributes<HTMLDivElement>`
 * @a11y    `role="status"` + `aria-busy="true"` so screen readers announce
 *          the loading state. Provide a hidden text label via `label` prop
 *          (defaults to "Loading"). Reduced-motion users get a static
 *          surface (no animation) per global guard.
 *
 *          Default: no `aria-live`. Opt-in via `ariaLive` prop to avoid
 *          announcement storms when rendering many skeletons at once —
 *          N skeletons with `aria-live="polite"` each = N announcements
 *          per layout change. Typical pattern: set `ariaLive="polite"` on
 *          a single top-level Skeleton (or a container status region) and
 *          leave the rest silent.
 * @notes   Variants: `text` (one or more lines), `rect` (filled box),
 *          `circle` (1:1 radius full). Animation: `pulse` (default,
 *          opacity sweep) or `shimmer` (gradient sweep, more visually
 *          present). For text variant, the last line is rendered at 80%
 *          width to mimic ragged text endings.
 *
 * @example
 * <Skeleton variant="text" lines={3} />
 * <Skeleton variant="rect" height={120} />
 * <Skeleton variant="circle" width={48} />
 * <Skeleton variant="rect" animation="shimmer" height={200} />
 * <Skeleton ariaLive="polite" variant="rect" height={200} />
 */
export type SkeletonVariant = 'text' | 'rect' | 'circle';
export type SkeletonAnimation = 'pulse' | 'shimmer' | 'none';
export type SkeletonAriaLive = 'off' | 'polite' | 'assertive';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Shape variant. Default `text`. */
  variant?: SkeletonVariant;
  /** Width (CSS length). Default depends on variant. */
  width?: string | number;
  /** Height (CSS length). Default depends on variant. */
  height?: string | number;
  /** Number of text lines (only used when `variant="text"`). Default 1. */
  lines?: number;
  /** Animation style. Default `pulse`. */
  animation?: SkeletonAnimation;
  /** Hidden screen-reader label. Default `Loading`. */
  label?: string;
  /**
   * Explicit `aria-live` level. Default `undefined` (no attribute emitted)
   * to avoid announcement storms when rendering many skeletons — opt-in per
   * loading region. Typical usage: set `polite` on one wrapping Skeleton.
   */
  ariaLive?: SkeletonAriaLive;
}

const ANIMATION_CLASS: Record<SkeletonAnimation, string | undefined> = {
  pulse: styles.animationPulse,
  shimmer: styles.animationShimmer,
  none: undefined,
};

function toCssLength(v: string | number | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === 'number' ? `${v}px` : v;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton(
    {
      variant = 'text',
      width,
      height,
      lines = 1,
      animation = 'pulse',
      label = 'Loading',
      ariaLive,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const animationClass = ANIMATION_CLASS[animation];

    if (variant === 'text') {
      const widthValue = toCssLength(width) ?? '100%';

      return (
        <div
          ref={ref}
          role="status"
          aria-busy="true"
          {...(ariaLive !== undefined ? { 'aria-live': ariaLive } : {})}
          className={cn(styles.textGroup, className)}
          style={style}
          {...rest}
        >
          {Array.from({ length: lines }).map((_, i) => {
            const isLast = i === lines - 1;
            const lineWidth = isLast && lines > 1 ? '80%' : widthValue;
            return (
              <span
                key={i}
                aria-hidden="true"
                className={cn(styles.root, styles.text, animationClass)}
                style={{ width: lineWidth }}
              />
            );
          })}
          <span className={styles.srOnly}>{label}</span>
        </div>
      );
    }

    const sizeStyle: CSSProperties = {
      width: toCssLength(width) ?? (variant === 'circle' ? '40px' : '100%'),
      height: toCssLength(height) ?? (variant === 'circle' ? '40px' : '16px'),
      ...style,
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-busy="true"
        {...(ariaLive !== undefined && { 'aria-live': ariaLive })}
        className={cn(
          styles.root,
          variant === 'circle' ? styles.circle : styles.rect,
          animationClass,
          className,
        )}
        style={sizeStyle}
        {...rest}
      >
        <span className={styles.srOnly}>{label}</span>
      </div>
    );
  },
);
