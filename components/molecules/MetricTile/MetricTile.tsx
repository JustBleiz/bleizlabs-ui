import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Inline } from '../../layout/Inline';
import { Stack } from '../../layout/Stack';
import { cn } from '../../utils/cn';
import styles from './MetricTile.module.scss';

/**
 * MetricTile — universal metric tile molecule (label + value + optional icon + optional description).
 *
 * @layer   molecule (display)
 * @deps    Inline + Stack (lib layout atoms), cn.
 * @tokens  --space-{1,2} (gaps via Inline/Stack composition),
 *          --color-text-{primary,secondary,muted} (slot typography defaults),
 *          --color-{success,warning,error,brand-strong} (tone variants —
 *          `brand` uses `-strong` for AA contrast),
 *          --font-size-{xs,sm,base} + --font-weight-{semibold,medium} (slot
 *          typography scale via SCSS — molecule owns its visual identity).
 *          Component-local cascade: `--metric-tile-value-color` driven by
 *          `tone` prop, applied via inline `style.color` on `.value` span
 *          (specificity-safe override channel).
 *
 * @a11y    Frameless presentational tile — renders `<div>`. `icon` slot is
 *          wrapped with `<span aria-hidden="true">` so the entire slot is
 *          hidden from AT regardless of consumer node. Label is a plain
 *          `<span>` styled via own SCSS class (caption-tier). Value is a
 *          `<span>` styled via own SCSS class (body-strong). Description is
 *          a `<div>` slot — consumer wraps own typography variant. For
 *          semantic context (`<dl>`, `<li>`) compose externally.
 *
 * @example
 * // Basic — label + value
 * <MetricTile label="Status" value="Active" />
 *
 * @example
 * // With icon (consumer pre-applies aria-hidden)
 * <MetricTile
 *   label="Account manager"
 *   value="Anna Kowalska"
 *   icon={<IconUser size={14} aria-hidden="true" />}
 * />
 *
 * @example
 * // Tone variant — success metric
 * <MetricTile label="Uptime" value="98.5%" tone="success" />
 *
 * @example
 * // Description as composed ReactNode (consumer owns typography)
 * <MetricTile
 *   label="Open tickets"
 *   value={12}
 *   description={<Text variant="small" color="secondary">last 7 days</Text>}
 *   tone="warning"
 * />
 *
 * @example
 * // Value as link (free-form ReactNode)
 * <MetricTile
 *   label="Project"
 *   value={<a href="/projects/abc">Online store</a>}
 * />
 *
 * @example
 * // Composed inside Card frame for card-grid tile
 * <Card padding={4}>
 *   <MetricTile
 *     label="Next invoice"
 *     value="1 500 PLN"
 *     description={<Text variant="small" color="secondary">Due: May 15</Text>}
 *   />
 * </Card>
 */

export type MetricTileTone = 'default' | 'success' | 'warning' | 'error' | 'brand';

const TONE_COLOR_VAR: Record<MetricTileTone, string> = {
  default: 'var(--color-text-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  // Use `--color-brand-strong` (theme-aware: brand-700 light / brand-300
  // dark) to keep semantic "brand emphasis" while clearing WCAG AA contrast.
  brand: 'var(--color-brand-strong)',
};

export interface MetricTileProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Label describing the metric (e.g. `"Status"`, `"MRR"`, `"Open tickets"`).
   * Plain string — rendered with caption-tier styling (small uppercase muted)
   * via own SCSS class. Required.
   */
  label: string;
  /**
   * Primary metric value. Free-form ReactNode — consumer composes plain
   * string, formatted number, KpiValue, AnimatedCounter, link, badge, or any
   * inline node. Consumer pre-formats numeric values (no decimals/locale
   * handling in MetricTile — keeps the molecule format-agnostic). Rendered
   * with body-strong typography via own SCSS class.
   */
  value: ReactNode;
  /**
   * Optional leading icon rendered inline-left of value. Consumer supplies
   * the icon ReactNode and is responsible for `aria-hidden="true"` (slot is
   * additionally wrapped with `aria-hidden` for defensive AT exclusion).
   */
  icon?: ReactNode;
  /**
   * Optional secondary content below value. Free-form ReactNode — consumer
   * wraps own typography variant for full control (e.g.
   * `<Text variant="small" color="secondary">last 7 days</Text>`). Renders
   * as a plain `<div>` slot; consumer brings the typography atom.
   */
  description?: ReactNode;
  /**
   * Color tone applied to the value text only. Label and description stay
   * neutral so the tone is purely a value-emphasis signal. Default
   * `'default'` (primary text color).
   */
  tone?: MetricTileTone;
  /**
   * @internal MetricTile owns its inner layout — children are not accepted.
   * Use `label` / `value` / `description` slots; for icons use `icon` slot;
   * for semantic wrapping (e.g. `<dl>`, `<li>`) compose externally.
   */
  children?: never;
}

export const MetricTile = forwardRef<HTMLDivElement, MetricTileProps>(
  function MetricTile(
    {
      label,
      value,
      icon,
      description,
      tone = 'default',
      className,
      style,
      ...rest
    },
    ref
  ) {
    const valueColorVar = TONE_COLOR_VAR[tone];

    const iconNode = icon ? (
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
    ) : null;

    return (
      <div
        ref={ref}
        className={cn(styles.root, className)}
        style={style}
        {...rest}
      >
        <Stack gap={1}>
          <span className={styles.label}>{label}</span>
          <Inline gap={2} align="baseline">
            {iconNode}
            <span
              className={styles.value}
              style={{ color: valueColorVar }}
            >
              {value}
            </span>
          </Inline>
          {description ? (
            <div className={styles.description}>{description}</div>
          ) : null}
        </Stack>
      </div>
    );
  }
);
