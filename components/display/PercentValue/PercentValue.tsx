import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { KpiValue, type KpiValueProps, type KpiValueColorOrAuto } from '../KpiValue/KpiValue';

/**
 * @deprecated since v0.7.0 — merged into {@link KpiValue}. Removal target
 * updated 2026-05-08 (E05.3 AMEND): now scheduled for **0.15.0 BREAKING**
 * alongside the wider preset-cleanup release (10 product-flavored components
 * removed in same release). The original v1.0.0 target is deferred — `@bleizlabs/ui`
 * stays in 0.x while the lib actively evolves; 1.0.0 cuts only after work-unit 3
 * v3 fresh restart stabilizes the consumer surface. Migration:
 *
 * - `<PercentValue value={X} />` → `<KpiValue value={X} unit="%" />`
 *   (the `unit="%"` is special-cased to render tightly attached, matching
 *   the legacy PercentValue visual identity).
 * - `tone` prop → `color` prop (same value space; `'auto'` works
 *   identically with `thresholds` + `inverse`).
 * - All other props (`size`, `decimals`, `thresholds`, `inverse`,
 *   `benchmark`) preserved on KpiValue.
 *
 * This thin wrapper exists for backward compatibility through v0.7.x —
 * it forwards every prop to KpiValue with `unit="%"` defaulted and
 * `tone` re-aliased to `color`. New code should import KpiValue
 * directly per `bleizlabs/feedback_audit_before_create_or_keep` memory.
 */

export type PercentValueTone = KpiValueColorOrAuto;

export interface PercentValueProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Percentage value (0-100 expected; accepts any number for edge cases). */
  value: number;
  /** Visual scale of the percentage. Default `'lg'`. Mirrors KpiValue. */
  size?: 'md' | 'lg' | 'xl';
  /**
   * Color tone. `'auto'` (default) derives color from `thresholds` + `inverse`.
   * Aliased onto KpiValue's `color` prop in v0.7.0+.
   */
  tone?: PercentValueTone;
  /** Threshold ranges for `tone='auto'` derivation. */
  thresholds?: { success?: number; warning?: number };
  /** When `true`, lower value = better. Default `false`. */
  inverse?: boolean;
  /** Fraction digits for percentage formatting. Default `0`. */
  decimals?: number;
  /** Optional benchmark caption rendered below value. */
  benchmark?: string;
  /** Forwarded to {@link KpiValue.renderValue}. */
  renderValue?: (value: number | string, decimals: number) => ReactNode;
  /** Optional accessible label, applied to the root element. */
  'aria-label'?: string;
  /** @internal — owns layout. */
  children?: never;
}

/**
 * @deprecated since v0.7.0 — use {@link KpiValue} with `unit="%"`. Removal
 * target updated 2026-05-08 (E05.3 AMEND): **0.15.0 BREAKING** (was v1.0.0
 * — deferred per phased semver plan). See {@link PercentValueProps} for
 * migration details.
 */
export const PercentValue = forwardRef<HTMLDivElement, PercentValueProps>(
  function PercentValue({ tone = 'auto', value, decimals = 0, ...rest }, ref) {
    const kpiProps: KpiValueProps = {
      ...rest,
      value,
      unit: '%',
      color: tone,
      decimals,
    };
    return <KpiValue ref={ref} {...kpiProps} />;
  }
);
