import { forwardRef, type ComponentRef, type ReactNode } from 'react';
import { Button, type ButtonProps } from '@/components/interactive/Button';
import { cn } from '@/components/utils/cn';
import styles from './BackLink.module.scss';

/**
 * BackLink — "back to previous view" navigation molecule (Phase 7 M2).
 *
 * @layer   molecule
 * @tokens  inherited from Button atom
 * @deps    Button atom (href, variant, size, icon, iconPosition, asChild), cn
 * @a11y    Renders a native `<a href>` through Button's `href` prop, giving
 *          keyboard / screen-reader navigation for free. When consumer
 *          needs client-side routing (e.g. Next.js `<Link>`) they pass
 *          `asChild` + the routing element as `children` — Button then
 *          forwards all styling onto the consumer-provided anchor.
 *          Label text is visible; no `aria-label` required.
 * @notes   Fixed to `variant="ghost"` + `size="sm"` for a consistent back
 *          affordance — these are not configurable. If a project needs
 *          a louder back button they should use Button directly. The
 *          leading arrow is an inline SVG (zero deps per D25) and is
 *          `aria-hidden` since the text label already conveys the action.
 *          `href` and `asChild` are mutually exclusive (Button constraint).
 *
 * @example
 * <BackLink href="/projekty" />
 *
 * <BackLink href="/panel" label="Do panelu" />
 *
 * <BackLink asChild>
 *   <Link href="/dashboard">Do dashboardu</Link>
 * </BackLink>
 */
export interface BackLinkProps
  extends Pick<
    ButtonProps,
    'href' | 'asChild' | 'className' | 'onClick' | 'id' | 'children'
  > {
  /** Visible label text. Default `'Wstecz'`. Ignored when `asChild` is used. */
  label?: string;
}

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8H4" />
      <path d="m8 4-4 4 4 4" />
    </svg>
  );
}

type BackLinkRef = ComponentRef<typeof Button>;

export const BackLink = forwardRef<BackLinkRef, BackLinkProps>(
  function BackLink(
    { href, asChild = false, label = 'Wstecz', className, children, ...rest },
    ref,
  ) {
    const content: ReactNode = asChild ? children : label;

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        icon={<ArrowLeftIcon />}
        iconPosition="left"
        {...(asChild ? { asChild: true } : { href })}
        className={cn(styles.root, className)}
        {...rest}
      >
        {content}
      </Button>
    );
  },
);
