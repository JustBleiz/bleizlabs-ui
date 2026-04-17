import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/components/utils/cn';
import styles from './InputGroup.module.scss';

/**
 * InputGroup — multi-element form widget container (Phase 4 expansion E08, Layer 2 of D26).
 *
 * @layer   atom (interactive)
 * @tokens  none of its own — children (Input, InputGroupText, Button) supply
 *          their own border-radius via component tokens, and the
 *          `joined-group` SCSS mixin (the same one used by ButtonGroup and
 *          ToggleGroup) collapses inner radii + dedupes 1px borders.
 * @deps    cn, `joined-group` SCSS mixin, React: `forwardRef`, type imports
 *          `HTMLAttributes<HTMLDivElement>`, `ReactNode`
 * @a11y    Renders `<div role="group">` with optional `aria-label` (or
 *          `aria-labelledby` if the group is labelled by an external
 *          element). Each child keeps its own native semantics — Input
 *          retains its <label htmlFor>, Button retains its <button>, etc.
 *          When the group contains an Input with a `<Label>` above it,
 *          the Label's htmlFor coupling continues to work because the
 *          InputGroup wrapper does not interfere with the underlying
 *          Input markup.
 *
 *          Important a11y note: prefer `aria-labelledby` pointing to a
 *          visible heading when one exists, and fall back to `aria-label`
 *          (a literal string) only when no visible heading is available.
 *          Either is acceptable; one is required.
 * @notes   Server-Component safe — no internal state, no `'use client'`.
 *          Reuses the `joined-group` mixin from `_mixins.scss`, which is
 *          also used by ButtonGroup and ToggleGroup. The visual joining
 *          behavior is identical across all three: collapsed inner radii,
 *          deduped 1px borders via -1px margin overlap, and a z-index
 *          lift on focus/active children so outlines aren't clipped.
 *
 *          Children are rendered in DOM order. Typical compositions:
 *          - <InputGroupText>$</InputGroupText> + <Input> + <InputGroupText>.00</InputGroupText>
 *          - <InputGroupText>https://</InputGroupText> + <Input> + <Button>Check</Button>
 *          - <Input> + <Button>Search</Button>
 *          - <InputGroupText>@</InputGroupText> + <Input> + <InputGroupText>.com</InputGroupText>
 *
 *          The Input child should usually pass `hideLabel` so the visual
 *          label doesn't break the joined widget layout — the field-level
 *          Label sits ABOVE the InputGroup, not inside it. Pattern:
 *
 *            <Stack gap={2}>
 *              <Label htmlFor="amount">Amount</Label>
 *              <InputGroup aria-labelledby="amount-label">
 *                <InputGroupText>$</InputGroupText>
 *                <Input id="amount" name="amount" hideLabel ... />
 *              </InputGroup>
 *            </Stack>
 *
 * @example
 * <InputGroup aria-label="Price in USD">
 *   <InputGroupText>$</InputGroupText>
 *   <Input id="price" name="price" type="number" hideLabel label="Price" />
 *   <InputGroupText>.00</InputGroupText>
 * </InputGroup>
 *
 * <InputGroup aria-label="Site URL">
 *   <InputGroupText>https://</InputGroupText>
 *   <Input id="site" name="site" hideLabel label="Site" />
 *   <Button variant="secondary">Check</Button>
 * </InputGroup>
 */
export interface InputGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /**
   * Accessible name for `role="group"` (REQUIRED — TS-enforced for
   * symmetry with ButtonGroup precedent). When a visible heading
   * already labels the group, prefer `aria-labelledby` pointing to its
   * `id` and pass an empty string here as a fallback for environments
   * where the labelledby reference fails to resolve.
   */
  'aria-label': string;
  /**
   * Optional ID reference for an external label element. When present,
   * `aria-labelledby` takes precedence over `aria-label` per ARIA spec.
   */
  'aria-labelledby'?: string;
  /**
   * Composition children — typically a mix of `<InputGroupText>`,
   * `<Input hideLabel>`, and `<Button>` rendered in DOM order. Children
   * pass through unchanged; the joined-group SCSS mixin collapses inner
   * radii and dedupes 1px borders so the row reads as one widget.
   */
  children: ReactNode;
}

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        role="group"
        className={cn(styles.root, className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
