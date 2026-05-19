import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import styles from './InputGroupText.module.scss';

/**
 * InputGroupText — text addon slot for InputGroup (Phase 4 expansion E08).
 *
 * @layer   atom (interactive)
 * @tokens  --input-addon-bg, --input-addon-text, --input-addon-border,
 *          --radius-input, --space-{3,4}, --font-secondary, --font-size-base,
 *          --font-weight-medium, --line-height-normal
 * @deps    cn
 * @a11y    Visible label text for an adjacent Input — NOT aria-hidden.
 *          Screen-reader users perceive the addon text as part of the
 *          surrounding InputGroup widget. The text content should be
 *          short and descriptive ($, kg, .com, https://).
 * @notes   Server-Component safe. Sits flush against neighboring children
 *          inside InputGroup; the `joined-group` mixin in InputGroup
 *          collapses inner radii + dedupes the 1px border so the visual
 *          appears as a single segmented control.
 *
 *          Carries `data-input-group-addon="true"` so InputGroup's CSS
 *          can flag it as fixed-width (non-flexing) — the Input child is
 *          the only flex-grow element, addons sit at content width.
 *
 *          Use only inside `<InputGroup>` — outside the group the addon
 *          renders without joined edges and looks visually orphaned. For
 *          a single-element addon on a standalone Input, use the Input
 *          `prefix` or `suffix` prop instead (Layer 1 of D26).
 *
 * @example
 * <InputGroup aria-label="Amount">
 *   <InputGroupText>$</InputGroupText>
 *   <Input id="amt" name="amt" type="number" hideLabel label="Amount" />
 *   <InputGroupText>.00</InputGroupText>
 * </InputGroup>
 */
export interface InputGroupTextProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Short visible label content — typical examples: `$`, `zł`, `kg`,
   * `.com`, `https://`, `@`, `.00`. Rendered as part of the InputGroup
   * widget and read by SR users as a label for the adjacent Input.
   */
  children: ReactNode;
}

export const InputGroupText = forwardRef<HTMLSpanElement, InputGroupTextProps>(
  function InputGroupText({ className, children, ...rest }, ref) {
    return (
      <span
        ref={ref}
        data-input-group-addon="true"
        className={cn(styles.root, className)}
        {...rest}
      >
        {children}
      </span>
    );
  },
);
