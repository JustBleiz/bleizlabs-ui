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
 * StatsCard — metric display preset composing Card + slots (Phase 8, E13).
 *
 * Three layouts via discriminated union:
 * - `stacked` (default): label → value → change stacked vertically
 * - `inline`: label | value on one row, change below
 * - `icon-lead`: IconBox on the left, (label + value + change) stacked on the right
 *
 * `icon-lead` requires an `icon` prop (TS-enforced via discriminated union);
 * other layouts forbid `icon` + `iconVariant` (`never` type).
 *
 * @layer   preset
 * @tokens  --space-1 (.iconLeadContent gap: label ↔ value ↔ change in icon-lead
 *          right column), --space-2 (.body column gap + .change inner gap),
 *          --space-3 (.inlineRow gap between label + value),
 *          --space-4 (.iconLead gap between IconBox + content cluster);
 *          Card atom handles outer padding/radius/border tokens
 * @deps    Card (padding, radius, CardProps type), CardBody,
 *          IconBox (icon, variant, size="lg", IconBoxVariant type),
 *          Heading (level={3}, size="2xl" — largest of all presets),
 *          Text (variant="caption", color="muted"), cn,
 *          React: `forwardRef`, `ReactNode`
 * @a11y    Semantic Card `<div>` root. Value auto-wraps as `<h3>` (via Heading
 *          level={3}) ONLY when caller passes scalar strings/numbers —
 *          wrapValue preserves ReactNode pass-through (e.g. `<AnimatedCounter>`
 *          keeps its own semantics). Label always renders as Text `<p>`
 *          (muted caption). `change` is presentational — consumer owns its
 *          element type (typically `<Badge>` for colored delta).
 * @apg          N/A — composition preset, no new ARIA semantics; inherited via composed atoms.
 * @tested       tsc + eslint + next build clean. No runtime a11y suite (presets transitively covered by atom tests).
 * @regressions  N/A — preset composition. Bug fixes land in composed atoms.
 * @notes   Discriminated union props — `layout="icon-lead"` requires `icon`
 *          (compile-time enforced), while `layout="stacked" | "inline"` forbid
 *          it via `icon?: never`. Internal cast to `StatsCardPropsInternal`
 *          after destructure is a controlled widening for shared render path;
 *          external API preserves discrimination. Largest heading size across
 *          presets (`size="2xl"`) — intentional: metric value is the focal
 *          element, larger type reinforces visual hierarchy in dashboard grids.
 * @example
 * <StatsCard label="Monthly revenue" value="$12,345" change={<Badge>+12%</Badge>} />
 * <StatsCard layout="icon-lead" icon={<UsersIcon />} iconVariant="brand"
 *            label="Users" value={1247} />
 */
export type StatsCardLayout = 'stacked' | 'inline' | 'icon-lead';

interface StatsCardCommonProps
  extends Omit<CardProps, 'direction' | 'children'> {
  /** Metric label (e.g., "Monthly revenue"). Required. */
  label: string;
  /** Metric value. Scalar strings/numbers auto-wrap in `<Heading level={3} size="2xl">`; ReactNode passes through (e.g., `<AnimatedCounter>`). */
  value: ReactNode;
  /** Optional delta indicator (e.g., `<Badge>+12%</Badge>`, plain text). */
  change?: ReactNode;
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

export const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  function StatsCard(props, ref) {
    const {
      label,
      value,
      change,
      layout = 'stacked',
      icon,
      iconVariant = 'default',
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
        className={cn(styles.root, styles[`layout-${layout}`], className)}
        {...cardProps}
      >
        <CardBody className={styles.body}>{layoutContent}</CardBody>
      </Card>
    );
  },
);
