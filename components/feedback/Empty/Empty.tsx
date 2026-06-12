import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import styles from './Empty.module.scss';

/**
 * Empty — placeholder for empty lists / zero-result screens (klocek atom).
 *
 * @layer   atom (feedback)
 * @tokens  --color-text-{primary,secondary,muted}, --color-border-subtle,
 *          --space-{1,2,3,4,6,10}, --radius-md, --duration-normal,
 *          --easing-default, fadeIn keyframe (from global _animations.scss)
 * @deps    cn. Server-safe.
 * @a11y    Renders `<div>` with optional `role="status"` + `aria-live="polite"`
 *          (pass via spread when empty state appears asynchronously). Title slot
 *          renders as plain `<div>` — consumer wraps own `<Heading level={N}>`
 *          atom for semantic heading hierarchy. Icon slot wrapped in
 *          `aria-hidden` container (decorative).
 *
 * @notes   SIMPLIFY 0.15.0 — title/description changed from `string` (auto-
 *          wrapped into `<h3>`/`<p>` z lib styles) to `ReactNode` (no auto-wrap;
 *          consumer brings own typography atoms). Resolves Klocek test #4
 *          violation. Old API string usage still works visually (plain text
 *          renders inside `.title`/`.description` divs z seed typography);
 *          consumers needing `<h3>` semantics MUST wrap explicitly:
 *          `title={<Heading level={3} size="lg">Brak wyników</Heading>}`.
 *
 * @example
 * // Plain string (no semantic h3 — consumer accepts seed styling)
 * <Empty
 *   icon={<InboxIcon />}
 *   title="Brak wyników"
 *   description="Spróbuj zmienić filtry."
 *   cta={<Button>Utwórz</Button>}
 * />
 *
 * @example
 * // Semantic heading (consumer brings <Heading> atom)
 * <Empty
 *   icon={<InboxIcon />}
 *   title={<Heading level={3} size="lg">Brak wyników</Heading>}
 *   description={<Text variant="body" color="muted">Spróbuj zmienić filtry.</Text>}
 *   cta={<Button>Utwórz</Button>}
 * />
 *
 * @example
 * // Async empty state — role + live for SR announcement
 * <Empty role="status" aria-live="polite" title="Lista jest pusta" />
 */
export interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional decorative icon displayed above the title. Wrapped in `aria-hidden` container. */
  icon?: ReactNode;
  /**
   * Primary headline. Free-form ReactNode — consumer wraps own `<Heading>` for
   * semantic h3 + visual control, or passes plain string for seed styling.
   */
  title: ReactNode;
  /**
   * Secondary explanatory copy below title. Free-form ReactNode — consumer
   * wraps own `<Text>` for visual control, or passes plain string for seed.
   */
  description?: ReactNode;
  /** Free-form CTA slot (Button, link, custom element). */
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
      <div className={styles.title}>{title}</div>
      {description ? <div className={styles.description}>{description}</div> : null}
      {cta ? <div className={styles.cta}>{cta}</div> : null}
    </div>
  );
});
