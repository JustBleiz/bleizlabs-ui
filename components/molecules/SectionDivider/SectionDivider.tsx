import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Separator } from '../../display/Separator';
import { Text } from '../../typography/Text';
import { cn } from '../../utils/cn';
import styles from './SectionDivider.module.scss';

/**
 * SectionDivider — labeled visual section break (Phase 7 M3, server-safe).
 *
 * @layer   molecule
 * @tokens  --space-3 (.root gap), --space-8 (.line min-width) — label
 *          color + typography come from Text atom, line rendering from
 *          Separator atom
 * @deps    Separator atom (variant="gradient", orientation="horizontal",
 *          decorative), Text atom (variant="caption", color="secondary",
 *          uppercase), cn, React: `forwardRef`
 * @a11y    Renders `<div role="separator" aria-orientation="horizontal">`
 *          with the visible label as its text content — screen readers
 *          announce the text and know a visual section break follows.
 *          The inner `Separator` atoms are decorative (`aria-hidden`
 *          inherited from Separator's own `decorative` default) because
 *          the outer role already carries separator semantics.
 * @notes   Three `align` positions control which side(s) carry the
 *          gradient line. Center is the default (line — label — line),
 *          left drops the leading line (label — line), right drops the
 *          trailing line (line — label). Separator uses the `gradient`
 *          variant so the line fades out visually toward the label,
 *          keeping the typography as the focal element. Inline flex
 *          layout with `flex-grow` on the separator(s) ensures the
 *          lines expand to fill available space regardless of label
 *          length.
 *
 * @example
 * <SectionDivider>Detale zlecenia</SectionDivider>
 *
 * <SectionDivider align="left">Sekcja A</SectionDivider>
 *
 * <SectionDivider align="right">Stopka</SectionDivider>
 */
export type SectionDividerAlign = 'left' | 'center' | 'right';

export interface SectionDividerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'role' | 'aria-orientation'
> {
  /** Visible label rendered between (or beside) the gradient separator lines. */
  children: ReactNode;
  /** Label position relative to the gradient lines. Default `'center'`. */
  align?: SectionDividerAlign;
}

const ALIGN_CLASS: Record<SectionDividerAlign, string> = {
  left: styles.alignLeft!,
  center: styles.alignCenter!,
  right: styles.alignRight!,
};

export const SectionDivider = forwardRef<HTMLDivElement, SectionDividerProps>(
  function SectionDivider({ children, align = 'center', className, ...rest }, ref) {
    const showLeftLine = align === 'center' || align === 'right';
    const showRightLine = align === 'center' || align === 'left';

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        className={cn(styles.root, ALIGN_CLASS[align], className)}
        {...rest}
      >
        {showLeftLine ? (
          <Separator
            variant="gradient"
            orientation="horizontal"
            className={styles.line}
            decorative
          />
        ) : null}
        <Text variant="caption" color="secondary" uppercase className={styles.label}>
          {children}
        </Text>
        {showRightLine ? (
          <Separator
            variant="gradient"
            orientation="horizontal"
            className={styles.line}
            decorative
          />
        ) : null}
      </div>
    );
  },
);
