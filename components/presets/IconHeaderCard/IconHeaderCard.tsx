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
 * IconHeaderCard — universal admin/dashboard card shell with icon-led header.
 *
 * Composes Card + IconBox header + opt-in Badge + opt-in CardSection footers.
 * Body is opaque (consumer-supplied via `children`); the shell owns header +
 * footer + Card chrome only.
 *
 * @tokens  --space-{2,3} (gap between header row + body + sections); all visual
 *          tokens delegated to Card / CardBody / CardSection / IconBox / Badge / Text dependencies.
 *
 * @a11y    Renders Card chrome (no role override). Header IconBox has its own
 *          decorative semantics (icon owned by consumer; aria-label on the
 *          IconBox icon if it carries meaning). Header Badge inherits Badge
 *          a11y (color is decorative; label is the SR text). `aria-label` on
 *          the root Card via spread for live data scenarios.
 *
 *          Header row uses `<Inline wrap>` ALWAYS — Badge drops to line 2
 *          on narrow viewports OR when `headerLabel` is long enough to push
 *          it past the inline width. Intentional for responsive density.
 *          Consumers wanting strict single-row identity should keep
 *          `headerLabel` short OR omit `headerBadge`.
 *
 * @example
 * // Stats card with badge
 * <IconHeaderCard
 *   headerIcon={<IconChartBar size={14} stroke={1.75} aria-hidden="true" />}
 *   headerLabel="Conversions"
 *   iconVariant="brand"
 *   headerBadge={{ label: 'Last 30 days', color: 'default' }}
 * >
 *   <KpiValue value={42} unit="conversions" trend={{ direction: 'up', label: '+12%' }} animated />
 * </IconHeaderCard>
 *
 * @example
 * // With footer breakdown section
 * <IconHeaderCard
 *   headerIcon={<IconUsers size={14} stroke={1.75} aria-hidden="true" />}
 *   headerLabel="Human escalations"
 *   iconVariant="warning"
 *   headerBadge={{ label: 'High', color: 'warning' }}
 *   footerSections={[
 *     { title: 'Top reasons', children: <BreakdownList ... /> },
 *   ]}
 * >
 *   <KpiValueAnimated value={22} unit="%" color="auto" inverse thresholds={{ success: 15, warning: 30 }} benchmark="industry avg 20%" />
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
   * Primary body content slot — typically `KpiValue` (or its
   * `KpiValueAnimated` client wrapper, including percent mode via
   * `unit="%"`), `BreakdownList`, `MetricBar`, or composed Stack/Inline
   * of those. Required.
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
   * - `icon` (optional): leading icon node — typically a `@tabler/icons-react`
   *   element. Useful for status badges, certification marks, or model labels
   *   that pair icon + text.
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
  /** @deprecated removed since Card no longer supports `hoverable`. No-op. */
  hoverable?: boolean;
  // Note: `aria-label` and other aria-* props are inherited from
  // HTMLAttributes via `...rest` spread onto the Card root. Not re-declared
  // to keep the interface lean.
}

/**
 * @deprecated since 0.13.0 — product-flavored layout pattern (Card + IconBox + Heading + Badge + body + `footerSections[]` array = 4+ concerns + union-of-variations). Zero equivalent in shadcn/Radix/react-aria. Will be removed in 0.15.0.
 *
 * Migration: consumer composes lib primitives directly (`<Card><Stack><Inline><IconBox /><Heading /></Inline><Text />...{footers.map(...)}</Stack></Card>`) lub extracts project-local molecule jeśli pattern powtarza się 2+ identycznie. See `docs/lib-audit-2026-05-08.md` §Card Presets cluster.
 */
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
      hoverable: _hoverable,
      className,
      ...rest
    },
    ref
  ) {
    void _hoverable;
    return (
      <Card
        ref={ref}
        variant={variant}
        padding={padding}
        radius={radius}
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
