'use client';

import { forwardRef } from 'react';
import { AnimatedCounter } from '../../specialized/AnimatedCounter/AnimatedCounter';
import { KpiValue, type KpiValueProps } from './KpiValue';

/**
 * KpiValueAnimated — animated count-up wrapper around {@link KpiValue}.
 *
 * @layer   atom (display) — Client Component, wraps Server-safe `KpiValue`
 * @deps    KpiValue (lib base atom), AnimatedCounter (lib specialized).
 *          Replaces the `animated` prop pattern that lived on KpiValue
 *          pre-v0.7.0 — splitting the client boundary into this thin
 *          wrapper lets the base atom stay RSC-safe.
 *
 * @example
 * <KpiValueAnimated value={12500} unit="PLN" />
 *
 * @example
 * <KpiValueAnimated
 *   value={42}
 *   unit="konwersji"
 *   trend={{ direction: 'up', label: '+12%' }}
 *   duration={1800}
 *   decimals={0}
 * />
 *
 * @example
 * // Locale override (default: derived from navigator.language by AnimatedCounter)
 * <KpiValueAnimated value={1234.5} decimals={1} locale="en-US" />
 */
export interface KpiValueAnimatedProps
  extends Omit<KpiValueProps, 'renderValue' | 'value'> {
  /**
   * Numeric value to animate towards. AnimatedCounter requires a number;
   * static-string fallbacks should use {@link KpiValue} directly.
   */
  value: number;
  /** Animation duration in ms (forwarded to AnimatedCounter). Default 1500. */
  duration?: number;
  /** Fraction digits for numeric formatting (forwarded to AnimatedCounter). Default 0. */
  decimals?: number;
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

export const KpiValueAnimated = forwardRef<HTMLDivElement, KpiValueAnimatedProps>(
  function KpiValueAnimated(
    { value, duration, decimals, locale, animated = true, ...rest },
    ref
  ) {
    return (
      <KpiValue
        ref={ref}
        value={value}
        renderValue={(v) =>
          animated && typeof v === 'number' ? (
            <AnimatedCounter
              value={v}
              duration={duration}
              decimals={decimals}
              locale={locale}
            />
          ) : (
            String(v)
          )
        }
        {...rest}
      />
    );
  }
);
