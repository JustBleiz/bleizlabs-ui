import {
  forwardRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { Badge, type BadgeColor } from '../../display/Badge';
import { Card } from '../../display/Card';
import { Heading } from '../../typography/Heading';
import { Text } from '../../typography/Text';
import { Inline } from '../../layout/Inline';
import { Stack } from '../../layout/Stack';
import { cn } from '../../utils/cn';
import styles from './EntityCard.module.scss';

/**
 * EntityCard — universal entity grid item preset (E04.2 #3).
 *
 * @layer   preset (Phase 8 CP8). Promoted z 6+ cross-system consumers:
 *          panel_v2 SystemsGrid / ProjectsOverview / ServicesList /
 *          ProjectCard wrapper / ServiceCard wrapper (5+ sections, E02-E14)
 *          + bleizos EcosystemCard (4 ecosystem project cards). Per
 *          `tier-b-decision-tree-audit-2026-05-04.md` #3 verdict.
 *          Server-Component safe (consumer-supplied click target via
 *          `href` renders raw `<a>` — for Next.js routing wrap externally
 *          z `<Link>...{<EntityCard ...>}</Link>`).
 * @tokens  --space-{1,2,3,4,5} (gaps via Card / Inline / Stack composition,
 *          density-driven), --color-text-{primary,secondary,muted}
 *          (typography via Text), --color-{brand,success,warning,error}
 *          (badge tones + accent color), --radius-{md,lg} (density-driven
 *          via Card radius prop). Icon slot does NOT own a size token —
 *          consumers control icon dimensions via the icon node's
 *          intrinsic `width`/`height` (typically 14-20px).
 * @deps    Card (atom — variant/accent/padding/radius/gap/hoverable/asChild),
 *          Heading + Text (typography), Inline + Stack (layout), Badge
 *          (status), cn. Zero icon-library deps per D5 — `icon` is
 *          consumer-supplied ReactNode slot.
 * @a11y    Renders `<a>` (when `href` provided, via Card asChild) or
 *          `<div>` (default). Heading uses `level=3` (h3) by default —
 *          consumers wanting different heading depth use `headingLevel`
 *          override. Status badges use Badge atom's color-as-decoration
 *          + label-as-name semantics (color is not sole carrier of
 *          meaning). Icon slot wrapped w `aria-hidden="true"` — entire
 *          slot hidden from AT regardless of consumer node. Meta strip
 *          renders as `<ul role="list">` for SR navigation. Hover styles
 *          inherited from Card hoverable. Focus-visible from Card +
 *          inner anchor focus chain (raw `<a>` is natively focusable
 *          when href present).
 * @notes   STRUCTURED PROPS by design (NOT 13-slot compound pattern from
 *          panel_v2 reference implementation). Mirrors EntityHero
 *          metaStrip API conventions (preset family consistency). Lib
 *          preset trades flexibility for: cleaner API surface (≤11 axes
 *          vs ~13 named slots), discoverable props w JSDoc (no compound
 *          export confusion), enforced layout chrome (visual identity
 *          consistent across consumers — no per-consumer slot drift).
 *
 *          CLICK TARGET: two routing patterns supported (use ONE, not both):
 *
 *          (a) Direct `href` (full-page navigation OR non-Next.js apps):
 *          When `href` is provided, EntityCard renders w Card `asChild`
 *          wrapping a raw `<a href>`. The card surface is fully clickable.
 *          In Next.js apps this triggers a FULL-PAGE navigation (not
 *          client-side routing) — acceptable for occasional cross-section
 *          links, but performance suboptimal for in-app navigation.
 *
 *          (b) Next.js `<Link>` wrapper (client-side routing, preferred
 *          for Next.js App Router consumers): OMIT `href` on EntityCard
 *          (otherwise nested `<a>/<a>` invalid HTML); wrap EntityCard
 *          externally w `<Link href="...">` from `next/link`. Next.js
 *          Link renders its own `<a>` around EntityCard's `<div>` root +
 *          intercepts clicks for client-side nav + prefetches the route.
 *          EntityCard becomes a presentational card surface inside the
 *          Link's anchor.
 *
 *          ACCENT BAR: opt-in via `accentPosition` prop. Default `'none'`
 *          (no accent — matches ContentCard frameless behavior). Set
 *          `'left'` for service-style left bar, `'top'` for project-style
 *          top bar. `accentColor` overrides the default brand color
 *          (consumer passes status-driven color, e.g. `'var(--color-success)'`
 *          for active entities).
 *
 *          DENSITY: `'compact'` (default) = padding 4, radius md, heading
 *          size md — suitable for dense grids. `'comfortable'` = padding
 *          5, radius lg, heading size lg — suitable for hero/featured
 *          grids.
 *
 *          BODY SLOT: optional `body` prop accepts ReactNode for
 *          additional content (metrics rows, charts, custom layouts).
 *          Renders below status badges + meta strip. Consumer composes
 *          freely (no enforced shape).
 *
 * @example
 * // Compact grid item (panel_v2 SystemsGrid style)
 * <EntityCard
 *   title="Chatbot obsługi sklepu"
 *   href="/panel/services/chatbot"
 *   icon={<IconBot size={20} />}
 *   description="Obsługa zamówień 24/7"
 *   badges={[{ label: 'Aktywna', color: 'success' }]}
 *   metaItems={[
 *     { icon: <IconUser size={14} />, label: 'AM', value: 'Anna K.' },
 *     { icon: <IconClock size={14} />, label: 'Update', value: '2h' },
 *   ]}
 *   accentPosition="left"
 *   accentColor="var(--color-success)"
 * />
 *
 * @example
 * // Comfortable hero variant (panel_v2 ProjectsOverview Flagship)
 * <EntityCard
 *   density="comfortable"
 *   title="Migracja sklepu na Shopify"
 *   href="/panel/projects/shopify"
 *   description="Pełna migracja z zachowaniem SEO i historii zamówień"
 *   badges={[
 *     { label: 'Fundamenty', color: 'brand', pill: true },
 *     { label: 'W realizacji', color: 'warning' },
 *   ]}
 *   metaItems={[
 *     { icon: <IconUser size={14} />, label: 'Tech lead', value: 'Jan N.' },
 *     { icon: <IconClock size={14} />, label: 'ETA', value: '15 maja' },
 *   ]}
 *   accentPosition="top"
 *   accentColor="var(--color-brand)"
 * />
 *
 * @example
 * // Bleizos ecosystem card (no link, custom body w metrics)
 * <EntityCard
 *   density="comfortable"
 *   title="Project Acme"
 *   description="AI-driven content automation"
 *   badges={[{ label: 'Beta', color: 'info' }]}
 *   body={
 *     <Inline gap={4} wrap>
 *       <MetricTile label="MRR" value="1 200 PLN" tone="success" />
 *       <MetricTile label="Users" value={42} />
 *     </Inline>
 *   }
 * />
 *
 * @example
 * // Direct href — full-page navigation (non-Next.js apps, occasional
 * // cross-section links, or when client-side routing is unnecessary)
 * <EntityCard
 *   title="Service ABC"
 *   href="/panel/services/abc"
 *   description="Voicebot premium"
 *   badges={[{ label: 'Aktywna', color: 'success' }]}
 * />
 *
 * @example
 * // Next.js App Router — client-side routing via <Link> wrapper.
 * // OMIT `href` on EntityCard (otherwise nested <a>/<a> invalid HTML).
 * // Next.js Link wraps EntityCard's <div> root w its own <a> + intercepts
 * // clicks dla client-side nav + prefetches.
 * import Link from 'next/link';
 *
 * <Link href="/panel/services/abc">
 *   <EntityCard
 *     title="Service ABC"
 *     description="Voicebot premium"
 *     badges={[{ label: 'Aktywna', color: 'success' }]}
 *   />
 * </Link>
 */

export type EntityCardDensity = 'compact' | 'comfortable';
export type EntityCardAccentPosition = 'left' | 'top' | 'none';

export interface EntityCardBadge {
  /** Optional stable React key. Falls back to `${label}-${index}` when omitted (positional) — provide explicit `key` when same-label badges may appear w different colors so React's reconciler stays semantic, not positional. */
  key?: string;
  /** Visible badge label. Required. */
  label: string;
  /** Semantic Badge color. Default `'default'`. */
  color?: BadgeColor;
  /** Pill shape (fully rounded). */
  pill?: boolean;
}

export interface EntityCardMetaItem {
  /** Optional stable React key. Falls back to `${label}-${index}` when omitted. */
  key?: string;
  /**
   * Optional leading icon (rendered left of label/value). Slot wrapped w
   * `aria-hidden="true"` automatically — consumer does not need to add
   * `aria-hidden` on the icon node. Mirrors EntityHero metaStrip API.
   */
  icon?: ReactNode;
  /**
   * Optional caption-tier label (e.g. `"Account manager"`). When omitted,
   * only `value` renders (single-cell meta items).
   */
  label?: string;
  /** Required value — string, link, badge, or composed inline node. */
  value: ReactNode;
}

export interface EntityCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  /**
   * Entity title (required) — wrapped w `<Heading level={headingLevel} size>` per density.
   *
   * @ref When `href` is provided, EntityCard renders w Card asChild
   *      wrapping `<a href>`. The forwardRef target type is `HTMLElement`
   *      to accommodate both rendered element kinds. Consumers using
   *      typed refs should narrow to `HTMLAnchorElement` when `href` is
   *      provided, OR keep `HTMLElement` (most permissive). Card's Slot
   *      pattern forwards the ref to the actual rendered element at
   *      runtime regardless.
   */
  title: string;
  /**
   * Optional click target — when provided, EntityCard renders w Card
   * `asChild` wrapping raw `<a href>` (fully clickable card surface).
   *
   * **Next.js consumers:** OMIT this prop and wrap EntityCard externally
   * z `<Link href="...">` for client-side routing. Setting `href` here +
   * outer `<Link>` produces nested `<a>/<a>` (invalid HTML). See `@notes`
   * CLICK TARGET section for the two-pattern decision tree.
   */
  href?: string;
  /** Optional leading icon (rendered before title). Slot is wrapped w `aria-hidden="true"`. */
  icon?: ReactNode;
  /**
   * Optional description rendered below title. String (or number, for
   * count-style descriptions) wraps in `<Text variant="body" color="secondary">`
   * — gives consumers default secondary-text styling without lib-import
   * bloat. ReactElement passes through verbatim (consumer owns wrapping
   * — typically `<Text>...{node}</Text>` for custom variant).
   *
   * Note: `null` / `false` / `undefined` ReactNode primitives skip
   * rendering entirely (standard React behavior).
   */
  description?: string | number | ReactElement;
  /** Optional status badge strip (rendered below description). */
  badges?: EntityCardBadge[];
  /** Optional structured meta strip (icon? + label? + value rows). */
  metaItems?: EntityCardMetaItem[];
  /**
   * Accent bar position. Default `'none'` (no accent). `'left'` =
   * service-style left bar; `'top'` = project-style top bar.
   */
  accentPosition?: EntityCardAccentPosition;
  /**
   * Accent bar color (CSS color value or token reference). Effective
   * only when `accentPosition !== 'none'`. Default `var(--color-brand)`.
   */
  accentColor?: string;
  /**
   * Density variant. `'compact'` (default) = padding 4, radius md,
   * heading size md. `'comfortable'` = padding 5, radius lg, heading
   * size lg. Affects internal spacing + heading scale.
   */
  density?: EntityCardDensity;
  /**
   * Heading level for the title (h2/h3/h4). Default `3`. Adjust for
   * nested page outline scenarios.
   */
  headingLevel?: 2 | 3 | 4;
  /**
   * Hover lift effect. Default `true` when `href` is provided (signals
   * clickability), `false` otherwise. Override to force on/off.
   */
  hoverable?: boolean;
  /** Optional body slot rendered below meta strip. Free-form ReactNode. */
  body?: ReactNode;
  /**
   * @internal EntityCard owns its inner layout — children are not accepted.
   * Use named slots (`icon`, `description`, `badges`, `metaItems`, `body`)
   * for content; for semantic wrapping (e.g. `<article>`) compose externally.
   */
  children?: never;
}

const DENSITY_PADDING: Record<EntityCardDensity, 4 | 5> = {
  compact: 4,
  comfortable: 5,
};

const DENSITY_RADIUS: Record<EntityCardDensity, 'md' | 'lg'> = {
  compact: 'md',
  comfortable: 'lg',
};

const DENSITY_GAP: Record<EntityCardDensity, 2 | 3> = {
  compact: 2,
  comfortable: 3,
};

const DENSITY_HEADING_SIZE: Record<EntityCardDensity, 'md' | 'lg'> = {
  compact: 'md',
  comfortable: 'lg',
};

const DENSITY_CLASS: Record<EntityCardDensity, string> = {
  compact: styles.densityCompact!,
  comfortable: styles.densityComfortable!,
};

export const EntityCard = forwardRef<HTMLElement, EntityCardProps>(
  function EntityCard(
    {
      title,
      href,
      icon,
      description,
      badges,
      metaItems,
      accentPosition = 'none',
      accentColor,
      density = 'compact',
      headingLevel = 3,
      hoverable,
      body,
      className,
      ...rest
    },
    ref
  ) {
    const hasAccent = accentPosition !== 'none';
    const isHoverable = hoverable ?? Boolean(href);
    const hasBadges = Array.isArray(badges) && badges.length > 0;
    const hasMeta = Array.isArray(metaItems) && metaItems.length > 0;

    const titleNode = (
      <Heading
        level={headingLevel}
        size={DENSITY_HEADING_SIZE[density]}
        className={styles.title}
      >
        {title}
      </Heading>
    );

    const headerNode = icon ? (
      <Inline gap={2} align="center" className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
        {titleNode}
      </Inline>
    ) : (
      titleNode
    );

    const descriptionNode =
      description !== undefined && description !== null ? (
        typeof description === 'string' || typeof description === 'number' ? (
          <Text variant="body" color="secondary" className={styles.description}>
            {description}
          </Text>
        ) : (
          description
        )
      ) : null;

    const badgesNode = hasBadges ? (
      <Inline gap={2} wrap className={styles.badges}>
        {badges.map((badge, index) => (
          <Badge
            key={badge.key ?? `${badge.label}-${index}`}
            label={badge.label}
            color={badge.color}
            pill={badge.pill}
          />
        ))}
      </Inline>
    ) : null;

    const metaNode = hasMeta ? (
      <ul role="list" className={styles.metaStrip}>
        {metaItems.map((item, index) => {
          const key = item.key ?? `${item.label ?? 'item'}-${index}`;
          return (
            <li key={key} className={styles.metaItem}>
              <Inline gap={1} align="center">
                {item.icon ? (
                  <span className={styles.metaIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                ) : null}
                {item.label ? (
                  <Text variant="caption" color="muted" asChild>
                    <span>{item.label}:</span>
                  </Text>
                ) : null}
                <Text variant="caption" color="primary" asChild>
                  <span>{item.value}</span>
                </Text>
              </Inline>
            </li>
          );
        })}
      </ul>
    ) : null;

    const cardChildren = (
      <Stack gap={DENSITY_GAP[density]} className={styles.body}>
        {headerNode}
        {descriptionNode}
        {badgesNode}
        {metaNode}
        {body}
      </Stack>
    );

    const cardProps = {
      variant: hasAccent ? ('accent' as const) : ('default' as const),
      ...(hasAccent ? { accentPosition: accentPosition as 'left' | 'top' } : {}),
      ...(accentColor ? { accentColor } : {}),
      padding: DENSITY_PADDING[density],
      radius: DENSITY_RADIUS[density],
      hoverable: isHoverable,
      className: cn(styles.root, DENSITY_CLASS[density], className),
    };

    if (href) {
      // When `href` is provided, EntityCard renders Card asChild wrapping
      // <a>. Spread only the anchor-compatible subset of rest props onto
      // the <a> — div-only event handlers (e.g. onScroll, onPointerEnter
      // on a div context) are NOT forwarded. Common shared props (id,
      // role, aria-*, data-*, onClick, onMouseEnter, onMouseLeave,
      // onKeyDown, style, tabIndex) work on both element types because
      // they're inherited from HTMLAttributes — TypeScript narrows via
      // structural overlap, not nominal type identity.
      //
      // Ref forwards to the rendered element (anchor in this branch).
      // Type is HTMLDivElement | HTMLAnchorElement so consumers w
      // explicit ref typing must use union OR pick the active element
      // type — documented in JSDoc above.
      // Card's forwardRef target is HTMLDivElement, but z asChild Slot
      // pattern Card forwards the consumer-provided element ref through
      // unchanged. Runtime ref targets the actual rendered element
      // (HTMLAnchorElement here). We cast to satisfy Card's typed ref
      // surface — this is the documented Slot pattern (consumers using
      // typed refs should narrow to HTMLAnchorElement when href is
      // provided). See @ref note in JSDoc.
      return (
        <Card
          ref={ref as Ref<HTMLDivElement>}
          asChild
          {...cardProps}
        >
          <a
            href={href}
            {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
          >
            {cardChildren}
          </a>
        </Card>
      );
    }

    return (
      <Card ref={ref as Ref<HTMLDivElement>} {...cardProps} {...rest}>
        {cardChildren}
      </Card>
    );
  }
);
