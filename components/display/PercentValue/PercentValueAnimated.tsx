'use client';

import { forwardRef } from 'react';
import { AnimatedCounter } from '../../specialized/AnimatedCounter/AnimatedCounter';
import { PercentValue, type PercentValueProps } from './PercentValue';

/**
 * PercentValueAnimated — animated count-up wrapper around {@link PercentValue}.
 *
 * @layer   atom (display) — Client Component, wraps Server-safe `PercentValue`
 * @deps    PercentValue (lib base atom), AnimatedCounter (lib specialized).
 *          Replaces the `animated` prop pattern that lived on PercentValue
 *          pre-v0.7.0 — splitting the client boundary into this thin
 *          wrapper lets the base atom stay RSC-safe.
 *
 * @example
 * <PercentValueAnimated value={42} />
 *
 * @example
 * <PercentValueAnimated
 *   value={22}
 *   inverse
 *   thresholds={{ success: 15, warning: 30 }}
 *   benchmark="industry avg 20%"
 *   duration={1800}
 * />
 */
export interface PercentValueAnimatedProps
  extends Omit<PercentValueProps, 'renderValue'> {
  /** Animation duration in ms (forwarded to AnimatedCounter). Default 1500. */
  duration?: number;
  /**
   * Locale for numeric formatting (BCP-47, forwarded to AnimatedCounter).
   * When omitted, AnimatedCounter resolves from `navigator.language` with
   * `'en-US'` SSR fallback.
   */
  locale?: string;
  /**
   * When `false`, renders statically without animation (still mounted as
   * a Client Component because AnimatedCounter handles motion semantics).
   * Default `true`.
   */
  animated?: boolean;
}

export const PercentValueAnimated = forwardRef<
  HTMLDivElement,
  PercentValueAnimatedProps
>(function PercentValueAnimated(
  { duration, locale, animated = true, ...rest },
  ref
) {
  return (
    <PercentValue
      ref={ref}
      {...rest}
      renderValue={(value, decimals) =>
        animated ? (
          <AnimatedCounter
            value={value}
            duration={duration}
            decimals={decimals}
            locale={locale}
            suffix="%"
          />
        ) : (
          `${value.toFixed(decimals)}%`
        )
      }
    />
  );
});
