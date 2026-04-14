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

/**
 * StatsCard — metric display preset composing Card + slots (Phase 8, E13).
 *
 * Three layouts via discriminated union:
 * - `stacked` (default): label → value → change stacked vertically
 * - `inline`: label | value on one row, change below
 * - `icon-lead`: IconBox on the left, (label + value + change) stacked on the right
 *
 * `icon-lead` requires an `icon` prop (TS-enforced); other layouts forbid it.
 *
 * @layer   preset
 * @tokens  Inherited from Card atom
 * @deps    Card, CardBody, IconBox, Heading, Text
 * @a11y    Semantic Card `<div>` with `<h3>` for scalar value, `<p>` for label/change.
 * @example
 * <StatsCard label="Monthly revenue" value="$12,345" change={<Badge>+12%</Badge>} />
 * <StatsCard layout="icon-lead" icon={<UsersIcon />} iconVariant="brand"
 *            label="Users" value={1247} />
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
