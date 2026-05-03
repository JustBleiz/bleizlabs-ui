export { EntityHero } from './EntityHero';
export type { EntityHeroProps, EntityHeroMetaItem } from './EntityHero';

/**
 * @deprecated since v0.7.0 — renamed to {@link EntityHero}. The
 * `DetailPageHero` name carried mild "detail page" coupling to one
 * mental model; the entity-detail hero shell is universal across panel
 * detail views (services, projects, tickets, account). Will be removed
 * in v1.0.0. Migration: replace `<DetailPageHero ...>` with
 * `<EntityHero ...>` — props and behavior identical.
 */
export { EntityHero as DetailPageHero } from './EntityHero';

/**
 * @deprecated since v0.7.0 — renamed to {@link EntityHeroProps}.
 */
export type { EntityHeroProps as DetailPageHeroProps } from './EntityHero';

/**
 * @deprecated since v0.7.0 — renamed to {@link EntityHeroMetaItem}.
 */
export type { EntityHeroMetaItem as DetailPageHeroMetaItem } from './EntityHero';
