import { forwardRef, type ComponentRef, type ReactNode } from 'react';
import { Button, type ButtonProps } from '../../interactive/Button';

/**
 * IconButton — accessibility-enforcing wrapper over `Button` with
 * `iconOnly={true}`.
 *
 * Button's `iconOnly` mode requires consumers to remember `aria-label`
 * (Button docs warn about it but TS does not enforce). IconButton makes
 * the accessible name a TypeScript-required prop so the type-checker
 * rejects any icon-only button without an a11y name at compile time.
 *
 * @layer   molecule
 * @deps    Button (lib atom — composes via iconOnly).
 * @tokens  inherited from Button atom (size, shape, variant, focus-ring)
 *
 * @a11y    Renders Button with `iconOnly={true}` — Button generates a
 *          square icon-only `<button>` (or `<a>` when `href` set, or
 *          consumer element when `asChild`). The `aria-label` prop is
 *          TS-required (cannot be omitted) — closes the gap where Button's
 *          `iconOnly` mode trusted consumers to remember the label.
 *          The icon itself is `aria-hidden` (handled by Button) so the
 *          aria-label is the sole accessible name.
 *
 * @example
 * <IconButton aria-label="Delete row" icon={<TrashIcon />} variant="ghost" />
 *
 * <IconButton
 *   aria-label="Open actions menu"
 *   icon={<DotsHorizontalIcon />}
 *   size="sm"
 * />
 *
 * <IconButton aria-label="Go to settings" href="/settings" icon={<GearIcon />} />
 */
export interface IconButtonProps extends Omit<
  ButtonProps,
  'iconOnly' | 'icon' | 'children' | 'aria-label'
> {
  /** Visible icon node — Button renders it inside the icon-only button. Required. */
  icon: ReactNode;
  /** Accessible name for screen readers. Required (TS-enforced). */
  'aria-label': string;
}

type IconButtonRef = ComponentRef<typeof Button>;

export const IconButton = forwardRef<IconButtonRef, IconButtonProps>(function IconButton(
  { icon, ...rest },
  ref,
) {
  return <Button ref={ref} iconOnly icon={icon} {...rest} />;
});
