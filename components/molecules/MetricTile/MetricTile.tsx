import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Inline } from '../../layout/Inline';
import { Stack } from '../../layout/Stack';
import { Text } from '../../typography/Text';
import { cn } from '../../utils/cn';
import styles from './MetricTile.module.scss';

/**
 * MetricTile — universal compact metric tile (icon? + label + value [+ description]).
 *
 * @layer   molecule (E04.2 #7, server-safe). Promoted from 4 project-local
 *          name-drift cases (DetailMetric / SummaryMetric / CardMetric /
 *          MetaItem) reimplementing same pattern across panel_v2 + bleizos
 *          + scout-hub admin. Per `tier-b-decision-tree-audit-2026-05-04.md`.
 * @tokens  --space-{1,2,3} (gaps via Inline/Stack atom composition),
 *          --color-text-{primary,secondary,muted} (typography color cascade,
 *          via Text atom transitively),
 *          --color-{success,warning,error,brand-strong} (tone variants —
 *          `brand` uses `-strong` per E142 L2 contrast fix lesson).
 *          Component-local cascade channel: `--metric-tile-value-color`
 *          driven by `tone` prop, applied via inline `style.color` on the
 *          value Text element (specificity-safe override channel).
 * @deps    Inline + Stack (layout atoms), Text (typography atom), cn (lib).
 *          Zero icon-library deps per D5 — `icon` is consumer-supplied
 *          ReactNode slot. Server-Component safe (no `'use client'`).
 * @a11y    Frameless presentational tile — renders `<div>`. `icon` slot is
 *          wrapped w `<span aria-hidden="true">` so the entire slot is
 *          hidden from AT regardless of what consumer passes (no consumer
 *          aria-hidden discipline required). Label is a caption-tier
 *          `<span>` via Text; value is body-strong tier text. For semantic
 *          context (e.g. `<dl>` definition lists, `<li>` list items)
 *          consumer wraps externally. No `role` or `aria-label` defaults
 *          — consumers add via spread for live data scenarios.
 * @notes   FRAMELESS BY DESIGN — no border, no background, no padding.
 *          MetricTile is a data cell that composes into card grids,
 *          meta-strips, or stand-alone metric displays. Consumer chooses
 *          the frame (e.g. wrap in `<Card variant="default">` for card-tile
 *          context, render inside `<EntityHero metaStrip>` ul/li for
 *          meta-strip context, etc.). This keeps the molecule universal
 *          across the 3 distinct surface contexts identified in audit
 *          (metaStrip / card grid / freestanding tile).
 *
 *          DENSITY VARIANTS:
 *          - `compact` (default) — single-row inline layout:
 *            `[icon? + label + value]`. Suitable for EntityHero metaStrip-
 *            style usage where multiple metrics fit on one line.
 *          - `comfortable` — stacked layout: label above value (uppercase
 *            caption + body-strong value), with icon flanking value.
 *            Suitable for card grids where each tile gets ~equal space.
 *
 *          TONE prop affects ONLY the value text color via the
 *          `--metric-tile-value-color` cascade — label and description
 *          stay neutral so the tone is a value-emphasis signal (success
 *          metrics rendered in green, warnings in amber, etc.).
 *
 *          VALUE accepts ReactNode for flexibility — consumer may pass
 *          plain string ("1 500 PLN"), formatted number, link node
 *          (`<a href="/x">value</a>`), badge, or composed inline node
 *          (`<>1 500 <Text variant="small" color="secondary">PLN</Text></>`).
 *          MetricTile does not own number formatting — consumer pre-formats.
 *
 * @example
 * // Compact density — single-row meta tile
 * <MetricTile label="Status" value="Aktywna" />
 *
 * @example
 * // Compact w/ icon (consumer must aria-hidden the icon node)
 * <MetricTile
 *   label="Account manager"
 *   value="Anna Kowalska"
 *   icon={<IconUser size={14} aria-hidden="true" />}
 * />
 *
 * @example
 * // Comfortable density — stacked card-tile layout
 * <MetricTile
 *   density="comfortable"
 *   label="Następna faktura"
 *   value="1 500 PLN"
 *   description="Termin: 15 maja"
 * />
 *
 * @example
 * // Tone variant — success metric (uptime, satisfaction)
 * <MetricTile
 *   density="comfortable"
 *   label="Dostępność"
 *   value="98.5%"
 *   tone="success"
 * />
 *
 * @example
 * // Value as link
 * <MetricTile
 *   label="Projekt"
 *   value={<a href="/panel/projects/abc">Sklep online</a>}
 * />
 *
 * @example
 * // Composed inside Card frame for card-grid tile
 * <Card padding={4}>
 *   <MetricTile
 *     density="comfortable"
 *     label="Otwarte zgłoszenia"
 *     value={12}
 *     description="ostatnie 7 dni"
 *     tone="warning"
 *   />
 * </Card>
 */

export type MetricTileDensity = 'compact' | 'comfortable';
export type MetricTileTone = 'default' | 'success' | 'warning' | 'error' | 'brand';

const TONE_COLOR_VAR: Record<MetricTileTone, string> = {
  default: 'var(--color-text-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  // E142 L2 contrast fix lesson — `--color-brand-500` measured ~3.9:1
  // against surface-raised backgrounds (AA fail). Use `--color-brand-strong`
  // (theme-aware: brand-700 light / brand-300 dark) to keep semantic "brand
  // emphasis" while clearing AA. Mirrors Text atom decision (Text.tsx
  // brand color path).
  brand: 'var(--color-brand-strong)',
};

const DENSITY_CLASS: Record<MetricTileDensity, string> = {
  compact: styles.densityCompact!,
  comfortable: styles.densityComfortable!,
};

export interface MetricTileProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Small caption-tier label — describes the metric (e.g. `"Status"`, `"Account manager"`). Required. */
  label: string;
  /**
   * Primary value displayed in body-strong tier. Accepts ReactNode for
   * flexibility — plain string, formatted number, link, badge, or composed
   * inline node. Consumer pre-formats numeric values (no decimals/locale
   * handling in MetricTile — keeps the molecule format-agnostic).
   */
  value: ReactNode;
  /**
   * Optional leading icon. Consumer supplies the icon ReactNode and is
   * responsible for `aria-hidden="true"` (lib does not mutate slot nodes).
   * Rendered inline-left of value in both densities.
   */
  icon?: ReactNode;
  /**
   * Optional secondary text rendered below value (small/muted) — useful
   * for context like `"ostatnie 7 dni"`, `"target ≥95%"`, `"od 12 marca"`.
   * Renders only in `comfortable` density (no room in compact single-row
   * layout — consumer should compose description externally for compact
   * cases).
   */
  description?: string;
  /**
   * Layout density. Default `'compact'`.
   *
   * - `'compact'` — single-row inline `[icon? + label + value]`. Suitable
   *   for EntityHero metaStrip-style multi-metric rows.
   * - `'comfortable'` — stacked: uppercase caption label above body-strong
   *   value (with optional icon flanking value + description below).
   *   Suitable for card-grid tiles where each metric gets equal real-estate.
   */
  density?: MetricTileDensity;
  /**
   * Color tone applied to the value text. Label and description stay
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
      density = 'compact',
      tone = 'default',
      className,
      style,
      ...rest
    },
    ref
  ) {
    const valueColorVar = TONE_COLOR_VAR[tone];
    const isCompact = density === 'compact';

    const labelNode = (
      <Text
        variant="caption"
        color="muted"
        uppercase={!isCompact}
        className={styles.label}
      >
        {label}
      </Text>
    );

    // Tone color is applied via inline `style.color` directly on the Text
    // element — beats all class-rule specificity (Text's own `.root` rule
    // would otherwise compete with MetricTile's `.value` rule on equal
    // specificity, with CSS-injection order deciding the winner). Inline
    // style on the styled element guarantees deterministic tone cascade
    // regardless of bundle order. Text receives `color="inherit"` so its
    // own inline `--text-color: inherit` sets `color: inherit`, allowing
    // our `style={{ color: valueColorVar }}` to take effect.
    const valueNode = (
      <Text
        variant="body-strong"
        color="inherit"
        className={styles.value}
        style={{ color: valueColorVar }}
      >
        {value}
      </Text>
    );

    const iconNode = icon ? (
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
    ) : null;

    return (
      <div
        ref={ref}
        className={cn(styles.root, DENSITY_CLASS[density], className)}
        style={style as CSSProperties | undefined}
        {...rest}
      >
        {isCompact ? (
          <Inline gap={1} align="baseline" className={styles.compactRow}>
            {iconNode}
            {labelNode}
            {valueNode}
          </Inline>
        ) : (
          <Stack gap={1} className={styles.comfortableStack}>
            {labelNode}
            <Inline gap={2} align="baseline" className={styles.valueRow}>
              {iconNode}
              {valueNode}
            </Inline>
            {description ? (
              <Text
                variant="small"
                color="secondary"
                className={styles.description}
              >
                {description}
              </Text>
            ) : null}
          </Stack>
        )}
      </div>
    );
  }
);
