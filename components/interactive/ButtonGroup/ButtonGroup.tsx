import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/components/utils/cn';
import styles from './ButtonGroup.module.scss';

/**
 * ButtonGroup — joined row/column of related buttons (Phase 4 I1.5).
 *
 * @layer   atom (interactive)
 * @tokens  none of its own — children (Button) supply their border-radius
 *          via component tokens, and the `joined-group` mixin in
 *          `_mixins.scss` collapses inner radii + dedupes 1px borders.
 * @deps    cn, joined-group SCSS mixin
 * @a11y    Renders `<div role="group">` with required `aria-label`. The
 *          group itself does NOT manage roving focus or arrow-key nav —
 *          each child Button keeps its own focus and tab order. For
 *          single-selection or arrow-key-navigated groups, use ToggleGroup
 *          (Phase 4 I7) instead.
 * @notes   Server-Component safe. Reuses the same `joined-group` mixin as
 *          ToggleGroup, so the visual joining behavior is consistent
 *          across both. Set `attached={false}` to fall back on a normal
 *          gap-based row (equivalent to `<Inline gap={2}>`).
 *
 * @example
 * <ButtonGroup aria-label="Text formatting">
 *   <Button variant="secondary">Bold</Button>
 *   <Button variant="secondary">Italic</Button>
 *   <Button variant="secondary">Underline</Button>
 * </ButtonGroup>
 *
 * <ButtonGroup orientation="vertical" aria-label="Sort">
 *   <Button variant="secondary">Newest</Button>
 *   <Button variant="secondary">Oldest</Button>
 * </ButtonGroup>
 */
export type ButtonGroupOrientation = 'horizontal' | 'vertical';

export interface ButtonGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Layout direction. Default `horizontal`. */
  orientation?: ButtonGroupOrientation;
  /** Collapse inner radii + dedupe borders. Default `true`. */
  attached?: boolean;
  /** Required accessible name for `role="group"`. */
  'aria-label': string;
  children: ReactNode;
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup(
    {
      orientation = 'horizontal',
      attached = true,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        role="group"
        data-orientation={orientation}
        className={cn(
          styles.root,
          orientation === 'vertical' && styles.vertical,
          attached && styles.attached,
          !attached && styles.detached,
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
