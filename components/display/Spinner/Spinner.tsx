import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/components/utils/cn';
import styles from './Spinner.module.scss';

/**
 * Spinner — inline loading indicator (Phase 3 D7).
 *
 * @layer   atom (display)
 * @tokens  --color-brand, --color-text-muted, --duration-slow,
 *          --easing-default, spin keyframe
 * @deps    cn
 * @a11y    `role="status"` + visually hidden text label so screen readers
 *          can announce loading state. Pass a custom `label` for context
 *          ("Saving changes", "Loading results", …). Reduced-motion users
 *          get a paused indicator via global guard in _animations.scss.
 *
 * @example
 * <Spinner />
 * <Spinner size="lg" color="brand" label="Loading results" />
 * <Button>{loading ? <Spinner size="xs" color="current" /> : 'Save'}</Button>
 */
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';
export type SpinnerColor = 'brand' | 'current' | 'muted';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Size scale. Default `sm` (16px). */
  size?: SpinnerSize;
  /** Color. `current` inherits from text color. Default `brand`. */
  color?: SpinnerColor;
  /** Hidden screen-reader label. Default `Loading`. */
  label?: string;
}

const SIZE_CLASS: Record<SpinnerSize, string> = {
  xs: styles.sizeXs!,
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
};

const COLOR_CLASS: Record<SpinnerColor, string> = {
  brand: styles.colorBrand!,
  current: styles.colorCurrent!,
  muted: styles.colorMuted!,
};

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner(
    {
      size = 'sm',
      color = 'brand',
      label = 'Loading',
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <span
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(
          styles.root,
          SIZE_CLASS[size],
          COLOR_CLASS[color],
          className,
        )}
        {...rest}
      >
        <span aria-hidden="true" className={styles.ring} />
        <span className={styles.srOnly}>{label}</span>
      </span>
    );
  },
);
