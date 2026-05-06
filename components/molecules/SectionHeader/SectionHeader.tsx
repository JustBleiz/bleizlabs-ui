import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import styles from './SectionHeader.module.scss';

/**
 * SectionHeader — universal section heading row molecule.
 *
 * Pattern: [gradient accent line 24px] LABEL · count   [meta][action].
 * Owns its inner layout — `children?: never` enforces composition via the
 * `meta` and `action` slots. Parent owns vertical spacing (Stack/Inline gap).
 *
 * @tokens  --space-{2,3}, --font-size-xs, --font-weight-semibold,
 *          --letter-spacing-{wide-mono,wider}, --color-{brand,text-secondary,text-muted}.
 *
 * @a11y    Renders semantic `<header>` landmark. Accent line + bullet
 *          separator are aria-hidden decorative spans. Label is plain text
 *          — assistive tech reads label + count naturally. Action slot
 *          accepts any ReactNode (filter tabs, Button, link).
 *
 * @example
 * // Minimal — just label
 * <SectionHeader label="Your systems" />
 *
 * @example
 * // With count + meta + action
 * <SectionHeader
 *   label="Active projects"
 *   count={6}
 *   meta="Last activity: 3 days ago"
 *   action={<Button variant="ghost" size="sm">All</Button>}
 * />
 *
 * @example
 * // With ToggleGroup filter as action
 * <SectionHeader
 *   label="Invoices"
 *   count={invoices.length}
 *   action={
 *     <ToggleGroup value={filter} onValueChange={setFilter} type="single">
 *       <Toggle value="all">All</Toggle>
 *       <Toggle value="paid">Paid</Toggle>
 *     </ToggleGroup>
 *   }
 * />
 */

export interface SectionHeaderProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Section label (uppercase, letter-spaced caption styling). */
  label: string;
  /** Optional count suffix rendered as `· N` after label (e.g. `6` → `… · 6`). */
  count?: number | string;
  /**
   * Optional meta content slot on the right (e.g. "Ostatnia aktywność:
   * 3 dni temu", relative time badge). Rendered as inline-flex span.
   */
  meta?: ReactNode;
  /**
   * Optional action slot on the right (e.g. ToggleGroup filter tabs,
   * "Wszystkie" Button, "+ Dodaj" link). Rendered after meta.
   */
  action?: ReactNode;
}

export const SectionHeader = forwardRef<HTMLElement, SectionHeaderProps>(
  function SectionHeader(
    { label, count, meta, action, className, ...rest },
    ref
  ) {
    return (
      <header
        ref={ref}
        className={cn(styles.root, className)}
        {...rest}
      >
        <div className={styles.lead}>
          <span className={styles.accent} aria-hidden="true" />
          <span className={styles.label}>{label}</span>
          {count !== undefined && count !== '' && (
            <span className={styles.count} aria-hidden="true">
              {' · '}
              {count}
            </span>
          )}
        </div>
        {(meta || action) && (
          <div className={styles.trail}>
            {meta && <div className={styles.meta}>{meta}</div>}
            {action && <div className={styles.action}>{action}</div>}
          </div>
        )}
      </header>
    );
  }
);
