import { forwardRef, type HTMLAttributes } from 'react';
import { Progress, type ProgressPercentColor } from '../../feedback/Progress/Progress';
import { cn } from '../../utils/cn';
import styles from './BreakdownList.module.scss';

/**
 * BreakdownList — universal analytics breakdown list molecule
 *
 * @layer   molecule (Phase 7, sister to DataRow / AccordionGroup)
 * @tokens  --space-{1,2,3}, --font-size-sm, --font-weight-medium,
 *          --color-text-{primary,secondary,muted}, --line-height-tight.
 *          Bar styling delegated to Progress dependency.
 * @deps    Progress (lib percent-mode), cn (lib). Server-Component safe —
 *          zero client hooks, no animation deps.
 * @a11y    Renders `<ul role="list">` + `<li>` per item. Each item's Progress
 *          carries `label="${item.label} — ${sharePercent}%"` for SR context.
 *          `aria-label` on the root list scopes the breakdown semantically.
 *          Empty state renders the same `<ul role="list">` shell with a single
 *          informational `<li>` — `ref` always resolves to `<ul>`, aria-* props
 *          and any `role` override land on the same element regardless of
 *          item count (consistent contract). Owns its inner layout —
 *          `children?: never` enforces this (mirrors KpiValue Value-family
 *          SRP convention; PercentValue merged into KpiValue v0.7.0).
 *
 * @notes   Tone enum (`'brand' | 'info' | 'success' | 'warning'`) intentionally
 *          omits `'error'` — the underlying `ProgressPercentColor` has no
 *          `error-strong` variant. For cautionary high-rate scenarios use
 *          `'warning'`. To be revisited when Progress gains an `error` color
 *          (post-batch lib amendment).
 *
 * @example
 * <BreakdownList
 *   aria-label="Najczęstsze powody eskalacji"
 *   items={[
 *     { label: 'Brak intencji', sharePercent: 45 },
 *     { label: 'Frustracja użytkownika', sharePercent: 30 },
 *     { label: 'Pytania spoza zakresu', sharePercent: 25 },
 *   ]}
 *   tone="warning"
 * />
 *
 * @example
 * // Traffic sources breakdown
 * <BreakdownList
 *   aria-label="Źródła ruchu"
 *   items={[
 *     { label: 'Direct', sharePercent: 42, description: '12 500 sesji' },
 *     { label: 'Organic search', sharePercent: 35, description: '10 400 sesji' },
 *     { label: 'Referral', sharePercent: 23, description: '6 800 sesji' },
 *   ]}
 *   tone="info"
 *   density="compact"
 * />
 *
 * @example
 * // Empty state
 * <BreakdownList
 *   aria-label="Top intencje"
 *   items={[]}
 *   emptyMessage="Brak danych z ostatnich 30 dni"
 * />
 */

export type BreakdownListTone = 'brand' | 'info' | 'success' | 'warning';

export interface BreakdownListItem {
  /** Optional stable React key. Falls back to `${label}-${index}` when omitted; positions must be stable if labels are not unique. */
  id?: string;
  /** Display label for the breakdown row. */
  label: string;
  /** Item's share value. Interpreted as 0-100 by default; pass `max` to use a different scale. */
  sharePercent: number;
  /** Optional secondary text rendered below the bar (e.g. raw count, period). */
  description?: string;
}

const TONE_TO_PROGRESS_COLOR: Record<BreakdownListTone, ProgressPercentColor> = {
  brand: 'brand',
  info: 'info',
  success: 'success-strong',
  warning: 'warning-strong',
};

const DENSITY_CLASS: Record<NonNullable<BreakdownListProps['density']>, string> = {
  compact: styles.densityCompact!,
  comfortable: styles.densityComfortable!,
};

export interface BreakdownListProps
  extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  /** Items to render. Empty array triggers empty state with `emptyMessage`. */
  items: BreakdownListItem[];
  /** Bar color tone (mapped to Progress percent-mode colors). Default `'brand'`. */
  tone?: BreakdownListTone;
  /** Vertical gap between items. Default `'comfortable'`. */
  density?: 'compact' | 'comfortable';
  /** Show inline `X%` label next to each item's name. Default `true`. */
  showPercent?: boolean;
  /** Progress bar maximum value. Default `100` (treats `sharePercent` as 0-100). */
  max?: number;
  /** Message rendered when `items.length === 0`. Default `'Brak danych'`. */
  emptyMessage?: string;
  /** Required accessible label for the breakdown list (consumed via aria-label on `<ul>`). */
  'aria-label': string;
  /**
   * @internal BreakdownList owns its inner layout — children are not accepted.
   * Use `items` prop with a render-friendly array shape.
   */
  children?: never;
}

export const BreakdownList = forwardRef<HTMLUListElement, BreakdownListProps>(
  function BreakdownList(
    {
      items,
      tone = 'brand',
      density = 'comfortable',
      showPercent = true,
      max = 100,
      emptyMessage = 'Brak danych',
      className,
      ...rest
    },
    ref
  ) {
    const progressColor = TONE_TO_PROGRESS_COLOR[tone];

    if (items.length === 0) {
      return (
        <ul
          ref={ref}
          role="list"
          className={cn(styles.root, DENSITY_CLASS[density], className)}
          {...rest}
        >
          <li className={styles.empty}>{emptyMessage}</li>
        </ul>
      );
    }

    return (
      <ul
        ref={ref}
        role="list"
        className={cn(styles.root, DENSITY_CLASS[density], className)}
        {...rest}
      >
        {items.map((item, index) => {
          const key = item.id ?? `${item.label}-${index}`;
          const percentLabel = `${Math.round(item.sharePercent)}%`;
          const ariaLabel = `${item.label} — ${percentLabel}`;
          return (
            <li key={key} className={styles.item}>
              <div className={styles.itemHeader}>
                <span className={styles.label}>{item.label}</span>
                {showPercent && (
                  <span className={styles.percent}>{percentLabel}</span>
                )}
              </div>
              <Progress
                value={Math.max(0, Math.min(max, item.sharePercent))}
                max={max}
                color={progressColor}
                label={ariaLabel}
              />
              {item.description && (
                <span className={styles.description}>{item.description}</span>
              )}
            </li>
          );
        })}
      </ul>
    );
  }
);
