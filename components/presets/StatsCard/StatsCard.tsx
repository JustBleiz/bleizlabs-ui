import { forwardRef, type ReactNode } from 'react';
import {
  Card,
  CardBody,
  type CardProps,
} from '../../display/Card';
import { IconBox, type IconBoxVariant } from '../../display/IconBox';
import { Heading } from '../../typography/Heading';
import { Text } from '../../typography/Text';
import { cn } from '../../utils/cn';
import styles from './StatsCard.module.scss';

/**
 * StatsCard — metric display preset composing Card + slots.
 *
 * Three layouts via discriminated union:
 * - `stacked` (default): label → value → change stacked vertically
 * - `inline`: label | value on one row, change below
 * - `icon-lead`: IconBox on the left, (label + value + change) stacked on the right
 *
 * `icon-lead` requires an `icon` prop (TS-enforced via discriminated union);
 * other layouts forbid `icon` + `iconVariant` (`never` type).
 *
 * @tokens  --space-1 (.iconLeadContent gap: label ↔ value ↔ change in icon-lead
 *          right column), --space-2 (.body column gap + .change inner gap),
 *          --space-3 (.inlineRow gap between label + value),
 *          --space-4 (.iconLead gap between IconBox + content cluster);
 *          Card atom handles outer padding/radius/border tokens.
 *
 * @a11y    Semantic Card `<div>` root. Value auto-wraps as `<h3>` (via Heading
 *          level={3}) ONLY when caller passes scalar strings/numbers —
 *          wrapValue preserves ReactNode pass-through (e.g. `<AnimatedCounter>`
 *          keeps its own semantics). Label always renders as Text `<p>`
 *          (muted caption). `change` is presentational — consumer owns its
 *          element type (typically `<Badge>` for colored delta).
 *
 * @example
 * <StatsCard label="Monthly revenue" value="$12,345" change={<Badge>+12%</Badge>} />
 * <StatsCard layout="icon-lead" icon={<UsersIcon />} iconVariant="brand"
 *            label="Users" value={1247} />
 */
export type StatsCardLayout = 'stacked' | 'inline' | 'icon-lead';

/**
 * Visual tone for StatsCard.
 *
 * - `default`: inherits Card's standard surface — no extra hairline, no
 *   shadow lift.
 * - `instrumented`: dashboard signature — adds an inset top brand hairline
 *   (`box-shadow: inset 0 1px 0 var(--color-brand)`) plus a
 *   `var(--shadow-sm)` lift. Marks the card as "live data" / "instrumented
 *   panel" in dashboard grids.
 */
export type StatsCardTone = 'default' | 'instrumented';

interface StatsCardCommonProps
  extends Omit<CardProps, 'direction' | 'children'> {
  /** Metric label (e.g., "Monthly revenue"). Required. */
  label: string;
  /** Metric value. Scalar strings/numbers auto-wrap in `<Heading level={3} size="2xl">`; ReactNode passes through (e.g., `<AnimatedCounter>`). */
  value: ReactNode;
  /** Optional delta indicator (e.g., `<Badge>+12%</Badge>`, plain text). */
  change?: ReactNode;
  /** Visual tone. Default `'default'`. */
  tone?: StatsCardTone;
}

type StatsCardStackedOrInlineProps = StatsCardCommonProps & {
  /** Layout orientation. Default `'stacked'`. */
  layout?: 'stacked' | 'inline';
  icon?: never;
  iconVariant?: never;
};

type StatsCardIconLeadProps = StatsCardCommonProps & {
  /** Layout orientation — `icon-lead` requires the `icon` prop. */
  layout: 'icon-lead';
  /** Leading icon node (rendered inside IconBox). Required for `icon-lead` layout. */
  icon: ReactNode;
  /** IconBox variant used for the leading icon. Default `'default'`. */
  iconVariant?: IconBoxVariant;
};

export type StatsCardProps =
  | StatsCardStackedOrInlineProps
  | StatsCardIconLeadProps;

type StatsCardPropsInternal = StatsCardCommonProps & {
  layout?: StatsCardLayout;
  icon?: ReactNode;
  iconVariant?: IconBoxVariant;
};

const TONE_CLASS: Record<StatsCardTone, string> = {
  default: styles.toneDefault!,
  instrumented: styles.toneInstrumented!,
};

function wrapValue(value: ReactNode): ReactNode {
  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <Heading level={3} size="2xl">
        {value}
      </Heading>
    );
  }
  return value;
}

/**
 * @deprecated since 0.13.0 — product-flavored "KPI tile" (discriminated `layout` union `'stacked'|'inline'|'icon-lead'` = god-molecule symptom: mutex prop sets per layout). Zero equivalent in shadcn/Radix/react-aria. Will be removed in 0.15.0.
 *
 * Migration: consumer composes lib `<Card><Stack><Text type="label">{label}</Text><Heading>{value}</Heading><Inline>{change}</Inline></Stack></Card>` per własny KPI pattern, lub project-local `<DashboardKpiTile>` molecule. See `docs/lib-audit-2026-05-08.md` §Card Presets cluster.
 */
export const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  function StatsCard(props, ref) {
    const {
      label,
      value,
      change,
      layout = 'stacked',
      icon,
      iconVariant = 'default',
      tone = 'default',
      padding = 5,
      radius = 'lg',
      className,
      ...cardProps
    } = props as StatsCardPropsInternal;

    const valueNode = wrapValue(value);
    const labelNode = (
      <Text variant="caption" color="muted" className={styles.label}>
        {label}
      </Text>
    );
    const changeNode =
      change !== undefined && change !== null ? (
        <div className={styles.change}>{change}</div>
      ) : null;

    let layoutContent: ReactNode;
    if (layout === 'inline') {
      layoutContent = (
        <>
          <div className={styles.inlineRow}>
            {labelNode}
            <div className={styles.inlineValue}>{valueNode}</div>
          </div>
          {changeNode}
        </>
      );
    } else if (layout === 'icon-lead') {
      layoutContent = (
        <div className={styles.iconLead}>
          <IconBox icon={icon} variant={iconVariant} size="lg" />
          <div className={styles.iconLeadContent}>
            {labelNode}
            {valueNode}
            {changeNode}
          </div>
        </div>
      );
    } else {
      layoutContent = (
        <>
          {labelNode}
          {valueNode}
          {changeNode}
        </>
      );
    }

    return (
      <Card
        ref={ref}
        padding={padding}
        radius={radius}
        className={cn(
          styles.root,
          styles[`layout-${layout}`],
          TONE_CLASS[tone],
          className,
        )}
        {...cardProps}
      >
        <CardBody className={styles.body}>{layoutContent}</CardBody>
      </Card>
    );
  },
);
