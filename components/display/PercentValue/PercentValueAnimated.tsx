'use client';

import { forwardRef } from 'react';
import {
  KpiValueAnimated,
  type KpiValueAnimatedProps,
} from '../KpiValue/KpiValueAnimated';
import type { PercentValueProps } from './PercentValue';

/**
 * @deprecated since v0.7.0 — merged into {@link KpiValueAnimated}. Will
 * be removed in v1.0.0. Migration:
 *
 * - `<PercentValueAnimated value={X} />` →
 *   `<KpiValueAnimated value={X} unit="%" />`
 * - `tone` prop → `color` prop
 *
 * This thin wrapper exists for backward compatibility through v0.7.x —
 * forwards every prop to KpiValueAnimated with `unit="%"` defaulted and
 * `tone` re-aliased to `color`.
 */
export interface PercentValueAnimatedProps
  extends Omit<PercentValueProps, 'renderValue'> {
  /** Animation duration in ms. Default 1500. */
  duration?: number;
  /** Locale for numeric formatting (BCP-47). */
  locale?: string;
  /** When `false`, renders statically. Default `true`. */
  animated?: boolean;
}

/**
 * @deprecated since v0.7.0 — use {@link KpiValueAnimated} with `unit="%"`.
 */
export const PercentValueAnimated = forwardRef<
  HTMLDivElement,
  PercentValueAnimatedProps
>(function PercentValueAnimated(
  { tone = 'auto', value, decimals = 0, ...rest },
  ref
) {
  const kpiProps: KpiValueAnimatedProps = {
    ...rest,
    value,
    unit: '%',
    color: tone,
    decimals,
  };
  return <KpiValueAnimated ref={ref} {...kpiProps} />;
});
