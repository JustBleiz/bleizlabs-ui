'use client';

import { forwardRef } from 'react';
import { AnimatedCounter } from '../../specialized/AnimatedCounter/AnimatedCounter';
import { KpiValue, type KpiValueProps } from './KpiValue';

/**
 * KpiValueAnimated — animated count-up wrapper around {@link KpiValue}.
 *
 * @layer   atom (display) — Client Component, wraps Server-safe `KpiValue`
 * @tokens  Inherited from KpiValue base atom (no own styling).
 * @deps    KpiValue (lib base atom), AnimatedCounter (lib specialized).
 *          Replaces the `animated` prop pattern that lived on KpiValue
 *          pre-v0.7.0 — splitting the client boundary into this thin
 *          wrapper lets the base atom stay RSC-safe. After the v0.7.0
 *          KpiValue+PercentValue merge it also covers the legacy
 *          `PercentValueAnimated` use cases via `unit="%"`.
 * @a11y    Inherits KpiValue semantics (rendered as `<div>` by default).
 *          AnimatedCounter drives the visible number; respects
 *          `prefers-reduced-motion` (snaps to final value when set).
 *
 * @example
 * <KpiValueAnimated value={12500} unit="PLN" />
 *
 * @example
 * // Animated percentage (replaces ex-PercentValueAnimated)
 * <KpiValueAnimated value={42} unit="%" decimals={0} />
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
 * // Auto-tone color via thresholds + benchmark caption
 * <KpiValueAnimated
 *   value={22}
 *   unit="%"
 *   color="auto"
 *   inverse
 *   thresholds={{ success: 15, warning: 30 }}
 *   benchmark="industry avg 20%"
 * />
 *
 * @example
 * // Locale override (default: derived from navigator.language by AnimatedCounter)
 * <KpiValueAnimated value={1234.5} decimals={1} locale="en-US" />
 */
export interface KpiValueAnimatedProps extends Omit<KpiValueProps, 'renderValue' | 'value'> {
  /**
   * Numeric value to animate towards. AnimatedCounter requires a number;
   * static-string fallbacks should use {@link KpiValue} directly.
   */
  value: number;
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

export const KpiValueAnimated = forwardRef<HTMLDivElement, KpiValueAnimatedProps>(
  function KpiValueAnimated({ value, duration, locale, animated = true, ...rest }, ref) {
    // When `unit === '%'`, route the suffix through AnimatedCounter so the
    // animation tween includes the symbol (matches static KpiValue percent
    // attachment + ex-PercentValueAnimated visual identity).
    const isPercentUnit = rest.unit === '%';
    // Strip `unit='%'` from the static base render to avoid double-attachment;
    // AnimatedCounter will own the suffix while animating.
    const baseProps: KpiValueProps = isPercentUnit
      ? { ...rest, unit: undefined, value }
      : { ...rest, value };

    return (
      <KpiValue
        ref={ref}
        {...baseProps}
        renderValue={(v, decimals) =>
          animated && typeof v === 'number' ? (
            <AnimatedCounter
              value={v}
              duration={duration}
              decimals={decimals}
              locale={locale}
              {...(isPercentUnit ? { suffix: '%' } : {})}
            />
          ) : typeof v === 'number' ? (
            isPercentUnit ? (
              `${v.toFixed(decimals)}%`
            ) : (
              v.toFixed(decimals)
            )
          ) : (
            String(v)
          )
        }
      />
    );
  },
);
