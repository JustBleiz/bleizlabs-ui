import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Badge, type BadgeColor } from '../../display/Badge/Badge';
import {
  Card,
  type CardProps,
  type CardRadius,
  type CardVariant,
} from '../../display/Card/Card';
import { CardBody } from '../../display/Card/CardBody';
import { CardSection } from '../../display/Card/CardSection';
import { IconBox, type IconBoxSize, type IconBoxVariant } from '../../display/IconBox/IconBox';
import { Inline } from '../../layout/Inline/Inline';
import { Stack } from '../../layout/Stack/Stack';
import { Text } from '../../typography/Text/Text';
import type { SpaceIndex } from '../../types/spacing';
import { cn } from '../../utils/cn';
import styles from './IconHeaderCard.module.scss';

/**
 * IconHeaderCard — universal admin/dashboard card shell with icon-led header
 *
 * @layer   preset (Phase 8 CP6, sister to ContentCard / SidebarCard / FormCard / StatsCard / ActionCard)
 * @tokens  --space-{2,3} (gap between header row + body + sections); all visual
 *          tokens delegated to Card / CardBody / CardSection / IconBox / Badge / Text dependencies.
 * @deps    Card + CardBody + CardSection (lib display), IconBox (lib display),
 *          Badge (lib display), Inline + Stack (lib layout), Text (lib typography),
 *          cn (lib utils). Server-Component safe — pure compositional shell.
 * @a11y    Renders Card chrome (no role override). Header IconBox has its own
 *          decorative semantics (icon owned by consumer; aria-label on the
 *          IconBox icon if it carries meaning). Header Badge inherits Badge
 *          a11y (color is decorative; label is the SR text). `aria-label` on
 *          the root Card via spread for live data scenarios.
 *
 * @notes   (1) THIS IS THE ONE EXCEPTION in the Faza 2 batch family to the
 *          `children?: never` convention enforced on KpiValue / PercentValue /
 *          BreakdownList. IconHeaderCard's universality REQUIRES the consumer
 *          to provide the body via `children` — the shell owns header + footer
 *          + Card chrome only. Body is opaque to IconHeaderCard. Sister
 *          family components own their body completely; IconHeaderCard owns
 *          the wrapper and delegates the body. Documented divergence — not a
 *          drift.
 *
 *          (2) Header row uses `<Inline wrap>` ALWAYS — Badge drops to line 2
 *          on narrow viewports OR when `headerLabel` is long enough to push it
 *          past the inline width. This is INTENTIONAL for responsive density:
 *          the 10 services pillar consumers in panel have variable-length
 *          labels and must adapt to side-by-side card layouts at md+ vs
 *          stacked cards at sm. No `wrapHeader` opt-out is exposed to keep
 *          variation axes ≤5 per family SRP rule. Consumers wanting strict
 *          single-row identity should keep `headerLabel` short OR omit
 *          `headerBadge` (which is the single most common cause of wrap).
 *
 * @example
 * // Conversion stats card (driving consumer pattern)
 * <IconHeaderCard
 *   headerIcon={<IconChartBar size={14} stroke={1.75} aria-hidden="true" />}
 *   headerLabel="Konwersje"
 *   iconVariant="brand"
 *   headerBadge={{ label: 'Ostatnie 30 dni', color: 'default' }}
 * >
 *   <KpiValue value={42} unit="konwersji" trend={{ direction: 'up', label: '+12%' }} animated />
 * </IconHeaderCard>
 *
 * @example
 * // With footer breakdown section
 * <IconHeaderCard
 *   headerIcon={<IconUsers size={14} stroke={1.75} aria-hidden="true" />}
 *   headerLabel="Eskalacje do człowieka"
 *   iconVariant="warning"
 *   headerBadge={{ label: 'Wysoki', color: 'warning' }}
 *   footerSections={[
 *     { title: 'Najczęstsze powody', children: <BreakdownList ... /> },
 *   ]}
 * >
 *   <PercentValue value={22} inverse thresholds={{ success: 15, warning: 30 }} benchmark="industry avg 20%" />
 * </IconHeaderCard>
 *
 * @example
 * // Minimal (no badge, no footer)
 * <IconHeaderCard
 *   headerIcon={<IconClock size={14} stroke={1.75} aria-hidden="true" />}
 *   headerLabel="SLA"
 * >
 *   <KpiValue value={4} unit="h" />
 * </IconHeaderCard>
 */

export interface IconHeaderCardFooterSection {
  /** Optional stable React key. Falls back to `${title}-${index}` when omitted; positions must be stable if titles are not unique. */
  key?: string;
  /** Optional uppercase caption rendered at the top of the section. */
  title?: string;
  /** Section content. */
  children: ReactNode;
}

export interface IconHeaderCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Primary body content slot — typically `KpiValue`, `PercentValue`,
   * `BreakdownList`, `MetricBar`, or composed Stack/Inline of those. Required.
   * IconHeaderCard owns header + footer + Card chrome; body is opaque to the
   * shell. See `@notes` for the divergence rationale vs. sister components.
   */
  children: ReactNode;
  /** Icon node for IconBox header (typically `@tabler/icons-react` in consumer). Required. */
  headerIcon: ReactNode;
  /** Caption text rendered next to icon (uppercase + semibold + muted color). Required. */
  headerLabel: string;
  /**
   * Optional Badge in the header row.
   *
   * - `label` (required): badge text
   * - `color` (optional): semantic color (default neutral)
   * - `icon` (optional, v0.6.1): leading icon node — typically a `@tabler/icons-react`
   *   element. Promoted from bleizlabs-website Faza 3 deferred AIChannelHeader
   *   (bot-type indicator badges with provider icons). Universal across BleizLabs
   *   products (status badges, certification marks, model labels routinely pair
   *   icon + text).
   */
  headerBadge?: { label: string; color?: BadgeColor; icon?: ReactNode };
  /** IconBox visual variant. Default `'default'`. */
  iconVariant?: IconBoxVariant;
  /** IconBox size. Default `'sm'` (smaller for stat-card density vs. default `md`). */
  iconSize?: IconBoxSize;
  /** Optional CardSection footer slots (0-3 sections). */
  footerSections?: IconHeaderCardFooterSection[];
  /** Card variant. Forwarded to Card. Default `'default'`. */
  variant?: CardVariant;
  /** Card padding from spacing scale. Forwarded to Card. Default `5`. */
  padding?: SpaceIndex;
  /** Card border radius. Forwarded to Card. Default `'lg'`. */
  radius?: CardRadius;
  /** Optional opt-in hover effect (forwarded to Card). Default `false`. */
  hoverable?: CardProps['hoverable'];
  // Note: `aria-label` and other aria-* props are inherited from
  // HTMLAttributes via `...rest` spread onto the Card root. Not re-declared
  // to keep the interface lean.
}

export const IconHeaderCard = forwardRef<HTMLDivElement, IconHeaderCardProps>(
  function IconHeaderCard(
    {
      children,
      headerIcon,
      headerLabel,
      headerBadge,
      iconVariant = 'default',
      iconSize = 'sm',
      footerSections,
      variant = 'default',
      padding = 5,
      radius = 'lg',
      hoverable = false,
      className,
      ...rest
    },
    ref
  ) {
    return (
      <Card
        ref={ref}
        variant={variant}
        padding={padding}
        radius={radius}
        hoverable={hoverable}
        className={cn(styles.root, className)}
        {...rest}
      >
        <CardBody>
          <Stack gap={3}>
            <Inline gap={2} align="center" wrap className={styles.headerRow}>
              <IconBox variant={iconVariant} size={iconSize} icon={headerIcon} />
              <Text
                variant="caption"
                uppercase
                weight="semibold"
                color="muted"
                className={styles.headerLabel}
                asChild
              >
                <span>{headerLabel}</span>
              </Text>
              {headerBadge && (
                <Badge
                  color={headerBadge.color}
                  label={headerBadge.label}
                  icon={headerBadge.icon}
                />
              )}
            </Inline>
            {children}
          </Stack>
        </CardBody>
        {footerSections?.map((section, index) => {
          const key = section.key ?? `${section.title ?? 'section'}-${index}`;
          return (
            <CardSection key={key}>
              {section.title && (
                <Text
                  variant="caption"
                  uppercase
                  weight="semibold"
                  color="muted"
                  className={styles.footerSectionTitle}
                  asChild
                >
                  <span>{section.title}</span>
                </Text>
              )}
              {section.children}
            </CardSection>
          );
        })}
      </Card>
    );
  }
);
