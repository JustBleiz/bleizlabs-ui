import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import styles from './MetricBar.module.scss';

/**
 * MetricBar — usage / capacity progress indicator (Phase 6 P2, core, server-safe).
 *
 * Renders an inline label row (`name`, `used / total unit`) plus a horizontal
 * progress bar whose width scales with the `used / total` ratio.
 *
 * @layer   atom (specialized)
 * @tokens  --color-brand, --color-surface-raised, --color-border-subtle,
 *          --color-text-{primary,secondary}, --space-{2,3},
 *          --font-size-{xs,sm}, --font-weight-{medium,semibold},
 *          --line-height-snug, --radius-full, --duration-normal,
 *          --easing-default
 * @deps    cn, React: `forwardRef`, type imports `CSSProperties`,
 *          `HTMLAttributes<HTMLDivElement>`
 * @a11y    `role="progressbar"` + `aria-valuenow` (used, clamped) +
 *          `aria-valuemin=0` + `aria-valuemax` (total) + `aria-valuetext`
 *          (human-readable `"42 / 100 GB"`) + `aria-label` (from `label`
 *          prop). The visual label row is NOT `aria-hidden` — screen-reader
 *          users benefit from both the progressbar and the duplicate text.
 * @notes   Standalone (not composed with Progress) per E10 design decision —
 *          visual layout (inline label row + bar) is different enough that
 *          composition would complicate theming. Width injection uses the
 *          same `--progress-value` CSS-variable channel as Progress.
 *          `total <= 0` falls back to `100` to avoid division-by-zero and
 *          keep `aria-valuenow / aria-valuemax` sane. `used` is clamped to
 *          `[0, total]` for the same reason.
 *
 * @example
 * <MetricBar used={42} total={100} unit="GB" label="Zużycie dysku" />
 *
 * <MetricBar
 *   used={1450}
 *   total={2000}
 *   unit="MB"
 *   label="Pamięć RAM"
 *   formatValue={(n) => n.toLocaleString('pl-PL')}
 * />
 */
export interface MetricBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'aria-label'> {
  /** Current value (numerator). Clamped to `[0, total]` at render time. */
  used: number;
  /** Total capacity (denominator). `total <= 0` falls back to `100`. */
  total: number;
  /** Optional unit suffix appended to numeric display (e.g. `"GB"`, `"%"`, `"kr"`). */
  unit?: string;
  /** Accessible name used as `aria-label` on the progressbar (required). */
  label: string;
  /** Optional numeric formatter applied to both `used` and `total` in display + `aria-valuetext`. */
  formatValue?: (value: number) => string;
}

export const MetricBar = forwardRef<HTMLDivElement, MetricBarProps>(function MetricBar(
  { used, total, unit, label, formatValue, className, ...rest },
  ref,
) {
  const safeTotal = total > 0 ? total : 100;
  const clampedUsed = Math.max(0, Math.min(safeTotal, used));
  const percent = (clampedUsed / safeTotal) * 100;

  const format = formatValue ?? ((n: number) => String(n));
  const usedText = format(clampedUsed);
  const totalText = format(safeTotal);
  const unitSuffix = unit ? ` ${unit}` : '';
  const valueText = `${usedText} / ${totalText}${unitSuffix}`;

  const cssVars = { '--progress-value': `${percent}%` } as CSSProperties;

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-label={label}
      aria-valuenow={clampedUsed}
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-valuetext={valueText}
      className={cn(styles.root, className)}
      style={cssVars}
      {...rest}
    >
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{valueText}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.bar} />
      </div>
    </div>
  );
});
