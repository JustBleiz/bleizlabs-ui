import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/components/utils/cn';
import styles from './TableBody.module.scss';

/**
 * TableBody — semantic `<tbody>` slot (Phase 11 CI23 slot).
 *
 * @layer   atom (display, flat slot — D24)
 * @a11y    Native `<tbody>` — wraps the data rows so TableHeader /
 *          TableFooter stay semantically separated.
 */
export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  function TableBody({ className, children, ...rest }, ref) {
    return (
      <tbody ref={ref} className={cn(styles.root, className)} {...rest}>
        {children}
      </tbody>
    );
  },
);
