import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Card } from '../../display/Card';
import { Heading } from '../../typography/Heading';
import { Text } from '../../typography/Text';
import { Inline } from '../../layout/Inline';
import { Stack } from '../../layout/Stack';
import { cn } from '../../utils/cn';
import styles from './ZoneCard.module.scss';

/**
 * ZoneCard — universal info card preset (CP9, server-safe)
 *
 * @layer   preset (Phase 8 CP9, Tier B promoted v0.8.0)
 * @tokens  Density mapping (R22 token reuse via Card padding scale):
 *            comfortable → padding=`--space-5` (20px) + body gap=`--space-3` (12px)
 *            compact     → padding=`--space-4` (16px) + body gap=`--space-2` (8px)
 *          Header gap: `--space-3` (Inline gap=3). Subtitle: `--font-size-xs`
 *          via lib Text variant=caption. Tone colors: `--color-{success,
 *          warning,error,brand,text-secondary}` for icon currentColor cascade.
 *          Zero hardcoded hex/px in module SCSS (R22 audited).
 * @deps    Card (variant=default + density-driven padding/radius), Heading
 *          (typography), Text (subtitle), Inline (header row layout), Stack
 *          (body slot layout), cn. Server-Component safe — zero client hooks.
 * @a11y    Renders semantic `<section>` landmark with REQUIRED `ariaLabel`.
 *          Heading inside is level=3 size=md — consumer is responsible for
 *          maintaining document outline (typically wrap pages in h1/h2 above).
 *          Icon slot is decorative — consumer must pass `aria-hidden="true"`
 *          on the icon node. RightSlot accepts any ReactNode (Badge, count,
 *          dropdown, link) — semantic responsibility delegated to consumer.
 *
 * @example
 * // Minimal — title + body content
 * <ZoneCard ariaLabel="Wskazniki" title="Wskazniki">
 *   <p>Body content</p>
 * </ZoneCard>
 *
 * @example
 * // With icon + subtitle + summary chip (right slot)
 * <ZoneCard
 *   ariaLabel="Konfiguracja techniczna"
 *   icon={<IconSettings size={14} stroke={2} aria-hidden="true" />}
 *   title="Konfiguracja"
 *   subtitle="Production environment"
 *   rightSlot={<Badge color="success" dot label="Produkcja" />}
 *   tone="success"
 * >
 *   <ul>...</ul>
 * </ZoneCard>
 *
 * @example
 * // Compact density for grouped zone-list pattern
 * <Stack gap={3}>
 *   <ZoneCard ariaLabel="Hosting" density="compact" title="Hosting" icon={...}>
 *     ...body...
 *   </ZoneCard>
 *   <ZoneCard ariaLabel="Database" density="compact" title="Database" icon={...}>
 *     ...body...
 *   </ZoneCard>
 * </Stack>
 *
 * @notes   Promoted v0.8.0 from `bleizlabs-website` panel_v2 driving consumers:
 *          TechnicalInfraCard (5 InfraZoneCard sites), ProjectsFinancialOverview
 *          (2 wrapper sites). Universality 3-of-3 PASS (panel_v2 + BleizOS
 *          admin + scout-hub admin all use this pattern). Static / server-safe
 *          baseline; CollapsibleZoneCard variant deferred until Rule of Three
 *          hit on collapse-needing consumers (currently 1: FinancialBreakdown).
 */

export type ZoneCardDensity = 'compact' | 'comfortable';
export type ZoneCardTone =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'brand';

export interface ZoneCardProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /**
   * Optional decorative header icon (e.g.
   * `<IconSettings size={14} stroke={2} aria-hidden="true" />`).
   * Consumer is responsible for `aria-hidden="true"`.
   */
  icon?: ReactNode;
  /** Required header title (rendered as Heading level=3 size=md). */
  title: string;
  /** Optional subtitle below title (caption styling, muted color). */
  subtitle?: string;
  /**
   * Optional right-slot in header (typically Badge, count, link, or any
   * ReactNode). Renders right-aligned with auto margin.
   */
  rightSlot?: ReactNode;
  /**
   * Card padding density. `comfortable` = padding 5 + gap 3 (default).
   * `compact` = padding 4 + gap 2 (for grouped zone-list patterns).
   */
  density?: ZoneCardDensity;
  /**
   * Tone — drives header icon + subtle accent. Default `'default'`.
   */
  tone?: ZoneCardTone;
  /**
   * Optional accessible name for the section landmark. **Defaults to
   * `title`** so the most common case (visible title doubles as SR
   * announcement) requires no extra prop. **Pass an explicit override only
   * when context disambiguation matters** (e.g., multiple "Hosting" zones
   * on the same page → `ariaLabel="Hosting — Production"`).
   * Avoid passing the same string as `title` — that creates redundant
   * aria-label + visible title which SR users hear as duplication.
   */
  ariaLabel?: string;
  /** Body content (consumer-bespoke). */
  children: ReactNode;
}

const PADDING_BY_DENSITY: Record<ZoneCardDensity, 4 | 5> = {
  compact: 4,
  comfortable: 5,
};

const BODY_GAP_BY_DENSITY: Record<ZoneCardDensity, 2 | 3> = {
  compact: 2,
  comfortable: 3,
};

export const ZoneCard = forwardRef<HTMLElement, ZoneCardProps>(
  function ZoneCard(
    {
      icon,
      title,
      subtitle,
      rightSlot,
      density = 'comfortable',
      tone = 'default',
      ariaLabel,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const padding = PADDING_BY_DENSITY[density];
    const bodyGap = BODY_GAP_BY_DENSITY[density];

    return (
      <Card
        variant="default"
        padding={padding}
        radius="lg"
        asChild
      >
        <section
          ref={ref}
          aria-label={ariaLabel ?? title}
          data-tone={tone}
          className={cn(styles.root, className)}
          {...rest}
        >
          <Stack gap={bodyGap}>
            <Inline gap={3} align="center" className={styles.header}>
              {icon && (
                <span className={styles.icon} aria-hidden="true">
                  {icon}
                </span>
              )}
              <Stack gap={1} className={styles.titleStack}>
                <Heading
                  level={3}
                  size="md"
                  weight="semibold"
                  className={styles.title}
                >
                  {title}
                </Heading>
                {subtitle && (
                  <Text
                    variant="caption"
                    color="muted"
                    className={styles.subtitle}
                  >
                    {subtitle}
                  </Text>
                )}
              </Stack>
              {rightSlot && (
                <span className={styles.rightSlot}>{rightSlot}</span>
              )}
            </Inline>
            {children}
          </Stack>
        </section>
      </Card>
    );
  }
);
