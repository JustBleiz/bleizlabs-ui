import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Inline } from '../../layout/Inline';
import { Text } from '../../typography/Text';
import { cn } from '../../utils/cn';
import styles from './DataRow.module.scss';

/**
 * DataRow — label/value pair molecule (Phase 7 M1, server-safe).
 *
 * @layer   molecule
 * @tokens  --color-text-primary (used in .value; label + gaps inherit from
 *          Text/Inline atom tokens)
 * @deps    Inline atom (gap, align, justify, collapseBelow), Text atom
 *          (variant, color), cn
 * @a11y    Pure presentational layout — no role or aria-*. Consumer places
 *          DataRow inside a semantic container (Card, Section, `<dl>` if
 *          needed). The label is rendered with `Text variant="caption"`
 *          + `color="muted"` so it's visually distinct from the primary
 *          value. Both sides remain readable as plain text by assistive
 *          technology without any wrapping role.
 * @notes   `responsive` (default `true`) uses Inline's `collapseBelow="md"`
 *          to switch from horizontal row to vertical stack below the md
 *          breakpoint — same primitive used across layout atoms. When
 *          `false`, the row stays horizontal at all widths. The `value`
 *          prop and `children` are interchangeable slots; if both are
 *          provided, `children` wins (consumer's explicit slot usage takes
 *          precedence). Pass scalar strings/numbers or full `ReactNode`
 *          trees (badges, icons, links) as the value.
 *
 * @example
 * <DataRow label="Status" value="Aktywny" />
 *
 * <DataRow label="Deadline">
 *   <Badge color="warning">za 3 dni</Badge>
 * </DataRow>
 *
 * <DataRow label="Full width" responsive={false} value="Always in row" />
 */
export interface DataRowProps extends HTMLAttributes<HTMLDivElement> {
  /** Label text displayed on the left / top. Required. */
  label: string;
  /** Right / bottom value. Optional — use `children` as an alternative slot. */
  value?: ReactNode;
  /** Slot alternative to `value`. When both are provided, `children` wins. */
  children?: ReactNode;
  /** Collapse to vertical stack below the md breakpoint. Default `true`. */
  responsive?: boolean;
}

export const DataRow = forwardRef<HTMLDivElement, DataRowProps>(
  function DataRow(
    { label, value, children, responsive = true, className, ...rest },
    ref,
  ) {
    const slot = children ?? value;

    return (
      <Inline
        ref={ref}
        gap={3}
        align="baseline"
        justify="between"
        collapseBelow={responsive ? 'md' : undefined}
        className={cn(styles.root, className)}
        {...rest}
      >
        <Text variant="caption" color="muted" className={styles.label}>
          {label}
        </Text>
        <div className={styles.value}>
          {typeof slot === 'string' || typeof slot === 'number' ? (
            <Text variant="body" color="primary">
              {slot}
            </Text>
          ) : (
            slot
          )}
        </div>
      </Inline>
    );
  },
);
