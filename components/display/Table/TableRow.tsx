import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import styles from './TableRow.module.scss';

/**
 * TableRow — semantic `<tr>` slot with hover + selected + disabled states
 * (Phase 11 CI23 slot).
 *
 * @layer   atom (display, flat slot — D24)
 * @tokens  --color-surface-hover, --color-brand-subtle, --color-brand,
 *          --duration-fast, --easing-default
 * @deps    cn.
 * @a11y    Native `<tr>`. When `selected`, sets `aria-selected="true"` so
 *          assistive tech announces the selection state. When `disabled`,
 *          sets `aria-disabled="true"` — does NOT block pointer events
 *          (consumers owning click handlers should check the flag
 *          themselves — matches the rest of the library's disabled
 *          pattern for composition flexibility).
 * @notes   Hover applies only when the row is inside TableBody (not
 *          TableHeader / TableFooter) — enforced via .root[data-row-hover]
 *          sentinel that consumers enable with the `hoverable` prop. This
 *          keeps header/footer cells static while body rows can respond
 *          to pointer.
 *
 * @example
 * <TableRow hoverable>...</TableRow>
 * <TableRow selected>...</TableRow>
 * <TableRow disabled>...</TableRow>
 */
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Apply hover background on pointer-over. Default `false` — body rows opt in. */
  hoverable?: boolean;
  /** Selected state — visual highlight + aria-selected. Default `false`. */
  selected?: boolean;
  /** Disabled state — muted visual + aria-disabled. Default `false`. */
  disabled?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow(
    {
      hoverable = false,
      selected = false,
      disabled = false,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <tr
        ref={ref}
        className={cn(
          styles.root,
          hoverable && styles.hoverable,
          selected && styles.selected,
          disabled && styles.disabled,
          className,
        )}
        aria-selected={selected || undefined}
        aria-disabled={disabled || undefined}
        data-state={selected ? 'selected' : undefined}
        {...rest}
      >
        {children}
      </tr>
    );
  },
);
