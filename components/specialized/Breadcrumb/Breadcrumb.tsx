import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/components/utils/cn';
import styles from './Breadcrumb.module.scss';

/**
 * Breadcrumb — semantic navigation trail (Phase 6 P4, tier A, server-safe).
 *
 * @layer   atom (specialized)
 * @tokens  --color-text-{primary,secondary,muted}, --color-brand,
 *          --space-{1,2}, --font-size-sm, --line-height-snug,
 *          --radius-sm, --duration-fast, --easing-default, --focus-ring
 * @deps    cn
 * @a11y    Renders `<nav aria-label>` > `<ol>` > `<li>`. Items with `href`
 *          become `<a>` for keyboard navigation; items without `href`
 *          become `<span>`. The **last item is always
 *          `aria-current="page"`**, regardless of whether `href` is
 *          set — this matches UX convention (the final breadcrumb is
 *          always the current page). Separator and optional icon slots
 *          are decorative (`aria-hidden="true"`).
 * @notes   `maxItems` collapses the middle of long trails using a plain
 *          text ellipsis span (no interactive dropdown — full collapse
 *          UX belongs to Phase 10 NavigationMenu). When collapse is
 *          active, the first item is always shown, followed by `...`,
 *          followed by the last `(maxItems - 1)` items.
 *
 * @example
 * <Breadcrumb
 *   items={[
 *     { label: 'Panel', href: '/panel' },
 *     { label: 'Projekty', href: '/panel/projects' },
 *     { label: 'Strona WWW' },
 *   ]}
 * />
 *
 * <Breadcrumb
 *   items={[
 *     { label: 'Home', href: '/', icon: <HomeIcon /> },
 *     { label: 'Usługi', href: '/services' },
 *     { label: 'Web Design' },
 *   ]}
 *   separator="/"
 *   maxItems={5}
 * />
 */
export interface BreadcrumbItem {
  /** Visible label text. */
  label: string;
  /** Optional URL — when provided the item renders as `<a href>`. */
  href?: string;
  /** Optional decorative icon rendered before the label (wrapped in `aria-hidden`). */
  icon?: ReactNode;
}

export interface BreadcrumbProps
  extends Omit<HTMLAttributes<HTMLElement>, 'aria-label'> {
  /** Ordered list of breadcrumb items (first item = root, last item = current page). */
  items: BreadcrumbItem[];
  /** Separator element rendered between items. Default `'›'` (right-chevron). */
  separator?: ReactNode;
  /** Accessible label for the wrapping `<nav>`. Default `'Breadcrumb'`. */
  ariaLabel?: string;
  /** Collapse the middle of long trails: show first + `...` + last `(maxItems - 1)`. */
  maxItems?: number;
}

function collapseItems(
  items: BreadcrumbItem[],
  maxItems: number | undefined,
): Array<BreadcrumbItem | 'ellipsis'> {
  if (!maxItems || items.length <= maxItems || maxItems < 2) {
    return items;
  }
  const tailCount = maxItems - 1;
  const first = items[0];
  if (first === undefined) {
    return items;
  }
  const tail = items.slice(items.length - tailCount);
  return [first, 'ellipsis', ...tail];
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb(
    {
      items,
      separator = '›',
      ariaLabel = 'Breadcrumb',
      maxItems,
      className,
      ...rest
    },
    ref,
  ) {
    const displayItems = collapseItems(items, maxItems);
    const lastIndex = displayItems.length - 1;

    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        className={cn(styles.root, className)}
        {...rest}
      >
        <ol className={styles.list}>
          {displayItems.map((entry, index) => {
            const isLast = index === lastIndex;
            const separatorNode = !isLast ? (
              <span aria-hidden="true" className={styles.separator}>
                {separator}
              </span>
            ) : null;

            if (entry === 'ellipsis') {
              return (
                <li key={`ellipsis-${index}`} className={styles.item}>
                  <span aria-hidden="true" className={styles.ellipsis}>
                    …
                  </span>
                  {separatorNode}
                </li>
              );
            }

            const iconNode = entry.icon ? (
              <span aria-hidden="true" className={styles.icon}>
                {entry.icon}
              </span>
            ) : null;

            const innerContent = (
              <>
                {iconNode}
                <span className={styles.label}>{entry.label}</span>
              </>
            );

            return (
              <li key={`${index}-${entry.label}`} className={styles.item}>
                {entry.href ? (
                  <a
                    href={entry.href}
                    aria-current={isLast ? 'page' : undefined}
                    className={cn(styles.link, isLast && styles.current)}
                  >
                    {innerContent}
                  </a>
                ) : (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className={cn(styles.text, isLast && styles.current)}
                  >
                    {innerContent}
                  </span>
                )}
                {separatorNode}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },
);
