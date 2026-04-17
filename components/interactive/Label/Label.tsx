import {
  forwardRef,
  type LabelHTMLAttributes,
  type ReactNode,
} from 'react';
import { Slot } from '@/components/utils/Slot';
import { cn } from '@/components/utils/cn';
import styles from './Label.module.scss';

/**
 * Label — form-coupled label element (Phase 4 I2.5, moved from Phase 2 in E05).
 *
 * @layer   atom (interactive)
 * @tokens  --font-secondary, --font-size-sm, --font-weight-medium,
 *          --color-text-primary, --color-text-muted, --color-error
 * @deps    Slot (own primitive, asChild boundary), cn, React: `forwardRef`,
 *          type imports `LabelHTMLAttributes<HTMLLabelElement>`, `ReactNode`
 * @a11y    Renders native `<label>` with `htmlFor` association. The visual
 *          `*` indicator for required fields is decorated with
 *          `aria-hidden="true"` because screen readers should pick up the
 *          `aria-required` / `required` attribute from the input itself,
 *          not from styling. Disabled state is visual-only — the actual
 *          disabled semantics live on the input.
 * @notes   Server-Component safe. Pure form-coupling — for visual captions
 *          (e.g., chart axis labels), use `Text variant="caption"` instead.
 *
 * @example
 * <Label htmlFor="email" required>Email address</Label>
 * <Input id="email" type="email" required />
 *
 * <Label htmlFor="terms" disabled>Accept terms</Label>
 */
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Visual `*` indicator (decorative, real semantics on input). */
  required?: boolean;
  /** Visual disabled state. Real disabled semantics live on input. */
  disabled?: boolean;
  /** Render as the single child element via Slot. */
  asChild?: boolean;
  children: ReactNode;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { required = false, disabled = false, asChild = false, className, children, ...rest },
  ref,
) {
  const Comp = asChild ? Slot : 'label';
  return (
    <Comp
      ref={ref}
      className={cn(styles.root, disabled && styles.disabled, className)}
      data-disabled={disabled || undefined}
      {...rest}
    >
      {children}
      {required ? (
        <span aria-hidden="true" className={styles.required}>
          *
        </span>
      ) : null}
    </Comp>
  );
});
