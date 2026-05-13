import {
  forwardRef,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './TableCell.module.scss';

/**
 * TableCell — semantic `<td>` / `<th>` slot with alignment + width control
 * (Phase 11 CI23 slot).
 *
 * @layer   atom (display, flat slot — D24)
 * @tokens  --space-{2,3,4}, --color-text-primary, --font-size-sm,
 *          --line-height-normal
 * @deps    cn.
 * @a11y    `as="th"` (default scope `col`) inside TableHeader produces
 *          semantic column headers that AT announce for each body cell.
 *          For row-header layouts, pass `as="th" scope="row"` on the
 *          first cell of each body row. `<td>` is the default (data cell).
 * @notes   `align` maps to CSS `text-align` — kept as a prop (not the
 *          deprecated HTML attribute) so the rule goes through CSS
 *          Modules and honors RTL via `text-align: start`/`end`
 *          equivalents for `'start'` and `'end'` values.
 *
 * @example
 * <TableCell>420.00</TableCell>
 * <TableCell as="th" scope="col">Amount</TableCell>
 * <TableCell align="end">$420.00</TableCell>
 * <TableCell align="center" width="80px">v1.0</TableCell>
 */
export type TableCellAlign = 'start' | 'center' | 'end';

export interface TableCellBaseProps {
  /** Horizontal text alignment. Default `start`. */
  align?: TableCellAlign;
  /**
   * Inline `width` override — any CSS length. Useful for fixed-width
   * columns (icons, selection checkboxes) without touching the SCSS.
   */
  width?: string | number;
}

export interface TableCellTdProps
  extends TableCellBaseProps,
    Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** Render as `<td>` (default — body data cell). */
  as?: 'td';
}

export interface TableCellThProps
  extends TableCellBaseProps,
    Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** Render as `<th>` (header cell). */
  as: 'th';
}

export type TableCellProps = TableCellTdProps | TableCellThProps;

const ALIGN_CLASS: Record<TableCellAlign, string> = {
  start: styles.alignStart!,
  center: styles.alignCenter!,
  end: styles.alignEnd!,
};

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell({ as = 'td', align = 'start', width, className, style, children, ...rest }, ref) {
    const Comp = as === 'th' ? 'th' : 'td';
    return (
      <Comp
        ref={ref}
        className={cn(styles.root, ALIGN_CLASS[align], className)}
        style={width !== undefined ? { width, ...style } : style}
        {...rest}
      >
        {children}
      </Comp>
    );
  },
);
