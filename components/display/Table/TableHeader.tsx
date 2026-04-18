import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import styles from './TableHeader.module.scss';

/**
 * TableHeader — semantic `<thead>` slot (Phase 11 CI23 slot).
 *
 * @layer   atom (display, flat slot — D24)
 * @tokens  --color-surface-raised, --color-text-secondary,
 *          --font-weight-semibold, --letter-spacing-wider, --space-{2,3,4}
 * @a11y    Native `<thead>` — scopes header cells to column headers when
 *          cells use `<th scope="col">` (set via TableCell `as="th"`).
 *
 * @example
 * <TableHeader><TableRow><TableCell as="th">Name</TableCell></TableRow></TableHeader>
 */
export type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(function TableHeader({ className, children, ...rest }, ref) {
  return (
    <thead ref={ref} className={cn(styles.root, className)} {...rest}>
      {children}
    </thead>
  );
});
