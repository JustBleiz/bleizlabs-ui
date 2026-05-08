import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import styles from './Header.module.scss';

/**
 * Header — universal block-header molecule.
 *
 * Pure layout primitive composing a body slot (children) + optional actions
 * slot inside a flex row. Zero visual chrome by default — no background,
 * no border, no padding. Visual identity comes entirely from composed
 * children (consumer picks Heading size, Text variant, Badge styles, etc.).
 *
 * Replaces `SectionHeader` (4-prop opinionated) + `PageHeader` (9-prop
 * hero-flavored) with one ≤3-prop primitive — consumer composes the rest
 * from lib atoms (Heading, Text, Eyebrow, Badge, Inline, ButtonGroup).
 *
 * Layout: `align-items: flex-start` so a single-line action button sits at
 * the title baseline rather than vertically-centering against multi-line
 * body content. Consumer can override via className when a different
 * alignment is needed.
 *
 * @layer   molecule
 * @tokens  --space-2 (body gap), --space-4 (body↔actions gap)
 * @deps    react (forwardRef), utils/cn
 *
 * @a11y    Renders semantic `<header>` landmark. Auto-exposes `role="banner"`
 *          when used at page level (per HTML5 sectioning context — only the
 *          top-level page header maps to banner; nested `<header>` inside
 *          `<section>`/`<article>` does not). Heading hierarchy is
 *          consumer-controlled via composed `<Heading level={N}>` — Header
 *          imposes nothing.
 *
 * @example
 * // Section heading — was SectionHeader
 * <Header actions={<Button variant="ghost" size="sm">View all</Button>}>
 *   <Eyebrow>Active projects · 6</Eyebrow>
 *   <Text variant="caption">Last activity 3 days ago</Text>
 * </Header>
 *
 * @example
 * // Page heading — was PageHeader
 * <Header actions={<ButtonGroup><Button>Cancel</Button><Button variant="primary">Save</Button></ButtonGroup>}>
 *   <Heading level={1} size="3xl">Account settings</Heading>
 *   <Text variant="lead">Manage your profile and notification preferences.</Text>
 *   <Inline gap={2}>
 *     <Badge color="success">Verified</Badge>
 *     <Badge color="muted">2FA enabled</Badge>
 *   </Inline>
 * </Header>
 *
 * @example
 * // Without actions — just composed body content
 * <Header>
 *   <Heading level={2} size="xl">Recent activity</Heading>
 *   <Text variant="caption">Last 30 days</Text>
 * </Header>
 */
export interface HeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * Header content — typically composed from lib atoms (`<Heading>`,
   * `<Text>`, `<Eyebrow>`, `<Badge>`, `<Inline>`). Stacks vertically with
   * `--space-2` gap.
   */
  children: ReactNode;

  /**
   * Optional right-aligned slot for action elements (`<Button>`,
   * `<ButtonGroup>`, `<ToggleGroupFilter>`, link, etc.). Pushed to the
   * row end via `justify-content: space-between`. Top-aligned with body
   * to keep the action at the title baseline on multi-line bodies.
   */
  actions?: ReactNode;
}

export const Header = forwardRef<HTMLElement, HeaderProps>(function Header(
  { children, actions, className, ...rest },
  ref,
) {
  return (
    <header ref={ref} className={cn(styles.root, className)} {...rest}>
      <div className={styles.body}>{children}</div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
});
