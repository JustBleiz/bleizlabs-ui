import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import styles from './SectionHeader.module.scss';

/**
 * @deprecated Since 0.14.0 — replaced by `<Header>` molecule (E06.1, ≤2 props children-driven).
 *             Will be REMOVED in 0.15.0 BREAKING release.
 *
 *             **Migration pattern:**
 *             ```tsx
 *             // BEFORE:
 *             <SectionHeader
 *               label="Active projects"
 *               count={6}
 *               meta="Last activity: 3 days ago"
 *               action={<Button variant="ghost" size="sm">All</Button>}
 *             />
 *
 *             // AFTER (consumer composition with Header + lib atoms):
 *             <Header actions={<Button variant="ghost" size="sm">All</Button>}>
 *               <Inline gap={2} align="baseline">
 *                 <Eyebrow>Active projects · 6</Eyebrow>
 *                 <Text variant="caption" color="muted">Last activity: 3 days ago</Text>
 *               </Inline>
 *             </Header>
 *             ```
 *
 *             **Why deprecated (per Charter sharpening 2026-05-10):**
 *             - SectionHeader is opinionated 4-prop molecule (label/count/meta/action) z auto-wrap
 *               of label string into uppercase caption styling (Charter Klocek test #4 violation —
 *               consumer should wrap own strings explicitly).
 *             - Header (E06.1) is canonical klocek pattern — children + actions slot, ≤2 props,
 *               consumer composes Eyebrow / Heading / Text per surface need.
 *             - Per atomic-design canon: lib provides primitives, consumer composes.
 *
 *             See migration examples in `D:/OS/internal/bleizlabs-ui/work/2026-05_lib-audit-rebuild/docs/implementation-plan-2026-05-08.md` §"ADDENDUM 2026-05-08 — Worked migration examples".
 *
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

/**
 * @deprecated Since 0.14.0 — replaced by `<Header>` molecule (E06.1, ≤2 props children-driven).
 *             Will be REMOVED in 0.15.0 BREAKING release.
 *             Migration: `<Header actions={...}><Eyebrow>{label}</Eyebrow><Text>{meta}</Text></Header>`.
 *             See full migration pattern in component file JSDoc + `D:/OS/internal/bleizlabs-ui/work/2026-05_lib-audit-rebuild/docs/implementation-plan-2026-05-08.md`.
 */
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
