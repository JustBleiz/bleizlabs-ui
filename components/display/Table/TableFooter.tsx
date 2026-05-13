import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import styles from './TableFooter.module.scss';

/**
 * TableFooter — semantic `<tfoot>` slot (Phase 11 CI23 slot).
 *
 * @layer   atom (display, flat slot — D24)
 * @tokens  --color-surface-raised, --color-text-secondary, --font-weight-medium
 * @deps    cn.
 * @a11y    Native `<tfoot>`. Screen readers announce footer cells after
 *          body rows — keep summary/total lines here for semantic clarity.
 *
 * @example
 * <TableFooter><TableRow><TableCell align="end">Total: $420</TableCell></TableRow></TableFooter>
 */
export type TableFooterProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  TableFooterProps
>(function TableFooter({ className, children, ...rest }, ref) {
  return (
    <tfoot ref={ref} className={cn(styles.root, className)} {...rest}>
      {children}
    </tfoot>
  );
});
