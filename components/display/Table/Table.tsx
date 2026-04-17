import { forwardRef, type TableHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import styles from './Table.module.scss';

/**
 * Table — semantic `<table>` primitive with base styling (Phase 11 CI23).
 *
 * @layer   atom (display — flat compound root per D24)
 * @tokens  --color-border-subtle, --color-border, --color-surface,
 *          --color-surface-raised, --color-surface-hover,
 *          --color-text-primary, --color-text-secondary,
 *          --radius-md, --space-{1,2,3,4,5}, --font-size-{sm,base},
 *          --duration-fast, --easing-default
 * @deps    cn, React: `forwardRef`, type import
 *          `TableHTMLAttributes<HTMLTableElement>`
 * @a11y    Renders native `<table>`. Consumer should add `<caption>` as
 *          first child when the table needs a programmatic name that
 *          isn't available via a visible heading. Nothing else is
 *          auto-wired — keyboard nav + row selection + sorting are
 *          consumer concerns (see per-project DataTable pattern in
 *          devlog Table decision v2).
 * @notes   Server-Component safe. Variants compose via props — `bordered`
 *          adds full borders between cells, `striped` alternates row
 *          backgrounds, `compact` reduces cell padding. All three can
 *          combine. The library stays zero-runtime-dep — sorting,
 *          filtering, pagination, virtualization live in consumer
 *          DataTable wrappers built on TanStack (or similar).
 *
 * @example
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableCell as="th">Name</TableCell>
 *       <TableCell as="th" align="end">Amount</TableCell>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>Invoice #1</TableCell>
 *       <TableCell align="end">$420.00</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 *
 * <Table striped bordered compact>...</Table>
 */
export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Alternate row background on every other TableRow inside TableBody. Default `false`. */
  striped?: boolean;
  /** Add vertical borders between cells + horizontal borders between rows. Default `false`. */
  bordered?: boolean;
  /** Reduce cell padding for dense data displays. Default `false`. */
  compact?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  {
    striped = false,
    bordered = false,
    compact = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <table
      ref={ref}
      className={cn(
        styles.root,
        striped && styles.striped,
        bordered && styles.bordered,
        compact && styles.compact,
        className,
      )}
      {...rest}
    >
      {children}
    </table>
  );
});
