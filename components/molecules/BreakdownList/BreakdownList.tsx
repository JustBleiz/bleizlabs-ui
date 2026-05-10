import {
  forwardRef,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type ReactNode,
} from 'react';
import { Progress, type ProgressPercentColor } from '../../feedback/Progress/Progress';
import { cn } from '../../utils/cn';
import styles from './BreakdownList.module.scss';

/**
 * BreakdownList — universal labeled progress list (compound molecule).
 *
 * @layer   molecule (compound: BreakdownList shell + BreakdownListItem)
 * @tokens  --space-{1,3}, --font-size-sm, --font-weight-medium,
 *          --color-text-{primary,muted}, --line-height-tight.
 *          Bar styling delegated to Progress dependency; tone palette mapped
 *          1:1 to Progress percent-mode colors.
 * @deps    Progress (lib percent-mode), cn (lib). Server-Component safe — zero
 *          client hooks, no animation deps.
 * @a11y    Shell renders `<ul role="list">` with required `aria-label`. Items
 *          render `<li>` containing label slot + Progress + optional description
 *          slot. Progress accessible label derives from a `label` string when
 *          provided ("${label} — ${percent}%"); when `label` is a ReactNode
 *          consumer SHOULD pass native `aria-label` on the item — it is
 *          forwarded to Progress as "${aria-label} — ${percent}%". Without
 *          either, Progress falls back to bare percent (degraded SR context).
 *
 * @example
 * <BreakdownList aria-label="Najczęstsze powody eskalacji">
 *   <BreakdownListItem label="Brak intencji" value={45} tone="warning" />
 *   <BreakdownListItem label="Frustracja" value={30} tone="warning" />
 *   <BreakdownListItem label="Inne" value={25} tone="warning" />
 * </BreakdownList>
 *
 * @example
 * // Consumer composes label slot for inline percent display
 * <BreakdownList aria-label="Źródła ruchu">
 *   {sources.map(s => (
 *     <BreakdownListItem
 *       key={s.id}
 *       label={
 *         <Inline justify="between">
 *           <span>{s.name}</span>
 *           <span>{s.share}%</span>
 *         </Inline>
 *       }
 *       value={s.share}
 *       tone="info"
 *       description={<Text variant="small" color="muted">{s.sessions} sesji</Text>}
 *     />
 *   ))}
 * </BreakdownList>
 *
 * @example
 * // Consumer owns empty state — molecule never auto-wraps
 * {items.length === 0
 *   ? <Text variant="small" color="muted">Brak danych</Text>
 *   : <BreakdownList aria-label="Top intencje">
 *       {items.map(i => <BreakdownListItem key={i.id} label={i.label} value={i.share} />)}
 *     </BreakdownList>
 * }
 */

export type BreakdownListTone =
  | 'brand'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

const TONE_TO_PROGRESS_COLOR: Record<BreakdownListTone, ProgressPercentColor> = {
  brand: 'brand',
  info: 'info',
  success: 'success-strong',
  warning: 'warning-strong',
  error: 'error-strong',
};

export interface BreakdownListProps
  extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  /** Required accessible label scoping the breakdown semantically. */
  'aria-label': string;
  /** `<BreakdownListItem>` nodes (consumer iterates own data). */
  children: ReactNode;
}

export const BreakdownList = forwardRef<HTMLUListElement, BreakdownListProps>(
  function BreakdownList({ children, className, ...rest }, ref) {
    return (
      <ul ref={ref} role="list" className={cn(styles.root, className)} {...rest}>
        {children}
      </ul>
    );
  }
);

export interface BreakdownListItemProps
  extends Omit<LiHTMLAttributes<HTMLLIElement>, 'children'> {
  /**
   * Label slot. Free-form ReactNode — consumer composes plain string, formatted
   * label with inline percent (`<Inline justify="between"><span>Name</span>
   * <span>42%</span></Inline>`), or any inline node. Molecule does NOT auto-wrap
   * strings into Text variants — consumer brings own typography.
   */
  label: ReactNode;
  /** Progress bar value. Interpreted on `0..max` scale (default `max=100`). */
  value: number;
  /** Progress maximum. Default `100` (treats `value` as 0-100 percent). */
  max?: number;
  /**
   * Bar color tone (mapped to Progress percent-mode colors). Default `'brand'`.
   */
  tone?: BreakdownListTone;
  /**
   * Optional secondary content below bar. Free-form ReactNode — consumer wraps
   * own typography (`<Text variant="small" color="muted">12 500 sesji</Text>`).
   */
  description?: ReactNode;
  /** Item owns its inner layout — children go in `label` slot. */
  children?: never;
}

export const BreakdownListItem = forwardRef<HTMLLIElement, BreakdownListItemProps>(
  function BreakdownListItem(
    {
      label,
      value,
      max = 100,
      tone = 'brand',
      description,
      className,
      ...rest
    },
    ref
  ) {
    const progressColor = TONE_TO_PROGRESS_COLOR[tone];
    const clampedValue = Math.max(0, Math.min(max, value));
    const percentLabel = `${Math.round((clampedValue / max) * 100)}%`;
    // Derive Progress accessible label: prefer string label; fall back to
    // consumer-supplied native `aria-label` (when label is ReactNode); finally
    // bare percent (dev should pair ReactNode label with explicit aria-label).
    const consumerAriaLabel =
      typeof rest['aria-label'] === 'string' ? rest['aria-label'] : undefined;
    const ariaLabel =
      typeof label === 'string'
        ? `${label} — ${percentLabel}`
        : consumerAriaLabel
        ? `${consumerAriaLabel} — ${percentLabel}`
        : percentLabel;

    return (
      <li ref={ref} className={cn(styles.item, className)} {...rest}>
        <div className={styles.labelRow}>{label}</div>
        <Progress
          value={clampedValue}
          max={max}
          color={progressColor}
          label={ariaLabel}
        />
        {description ? (
          <div className={styles.description}>{description}</div>
        ) : null}
      </li>
    );
  }
);
