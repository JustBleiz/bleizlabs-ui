import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/components/utils/cn';
import styles from './Empty.module.scss';

/**
 * Empty — placeholder for empty lists / zero-result screens (Phase 5 F1).
 *
 * @layer   atom (feedback)
 * @tokens  --color-text-{primary,secondary,muted}, --color-border-subtle,
 *          --space-{2,3,4,6}, --font-size-{base,lg}, --font-weight-semibold,
 *          --line-height-snug, --radius-md, --duration-normal, --easing-default,
 *          fadeIn keyframe
 * @deps    cn, React: `forwardRef`, type imports
 *          `HTMLAttributes<HTMLDivElement>`, `ReactNode`
 * @a11y    Renders `<div>`. Server-safe. Optional `role="status"` +
 *          `aria-live="polite"` supported via spread props — pass them when
 *          the empty state appears asynchronously (e.g., after filter / delete)
 *          so screen readers announce the transition. For initial render of a
 *          static empty list, omit the role.
 * @notes   Icon slot is decorative by default (`aria-hidden` wrapper). CTA
 *          is a free-form `ReactNode` slot — wrap it in `<Button>` or a plain
 *          `<a>` as needed. Entry animation respects `prefers-reduced-motion`
 *          via global `_animations.scss` guard.
 *
 * @example
 * <Empty
 *   icon={<InboxIcon />}
 *   title="Brak wyników"
 *   description="Spróbuj zmienić filtry lub utworzyć nowy element."
 *   cta={<Button href="/new">Utwórz</Button>}
 * />
 *
 * <Empty
 *   role="status"
 *   aria-live="polite"
 *   title="Lista jest pusta"
 * />
 */
export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional decorative icon displayed above the title. Wrapped in `aria-hidden` container. */
  icon?: ReactNode;
  /** Primary headline text. Rendered as `<h3>` for semantic hierarchy. Required. */
  title: string;
  /** Secondary explanatory copy below the title. Rendered as `<p>`. */
  description?: string;
  /** Free-form call-to-action slot (Button, link, custom element). Rendered below description. */
  cta?: ReactNode;
}

export const Empty = forwardRef<HTMLDivElement, EmptyProps>(function Empty(
  { icon, title, description, cta, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn(styles.root, className)} {...rest}>
      {icon ? (
        <div aria-hidden="true" className={styles.icon}>
          {icon}
        </div>
      ) : null}
      <h3 className={styles.title}>{title}</h3>
      {description ? <p className={styles.description}>{description}</p> : null}
      {cta ? <div className={styles.cta}>{cta}</div> : null}
    </div>
  );
});
