import { forwardRef, type ReactNode } from 'react';
import {
  Card,
  CardBody,
  CardFooter,
  type CardProps,
} from '../../display/Card';
import { IconBox, type IconBoxVariant } from '../../display/IconBox';
import { Heading } from '../../typography/Heading';
import { Text } from '../../typography/Text';
import { cn } from '../../utils/cn';
import styles from './ActionCard.module.scss';

export type ActionCardSeverity = 'info' | 'warning' | 'critical';

interface SeverityMapping {
  accent: string;
  iconVariant: IconBoxVariant;
}

const SEVERITY_MAP: Record<ActionCardSeverity, SeverityMapping> = {
  info: { accent: 'var(--color-info)', iconVariant: 'brand' },
  warning: { accent: 'var(--color-warning)', iconVariant: 'default' },
  critical: { accent: 'var(--color-error)', iconVariant: 'error' },
};

export interface ActionCardProps
  extends Omit<
    CardProps,
    | 'direction'
    | 'children'
    | 'variant'
    | 'accentColor'
    | 'accentPosition'
    | 'title'
  > {
  /** Severity level — drives Card accent border color and default IconBox variant. Required. */
  severity: ActionCardSeverity;
  /** Call-to-action node — typically `<Button>`. Required. Rendered inside CardFooter action mode. */
  cta: ReactNode;
  /** Optional heading slot. Scalar strings/numbers auto-wrap in `<Heading level={3} size="lg">`; ReactNode passes through. */
  title?: ReactNode;
  /** Optional description slot. Scalar strings/numbers auto-wrap in `<Text variant="body" color="muted">`; ReactNode passes through. */
  description?: ReactNode;
  /** Optional leading icon. Wrapped in IconBox with severity-derived variant unless `iconVariant` overrides. */
  icon?: ReactNode;
  /** Override the IconBox variant used for the leading icon. Default derived from `severity`. */
  iconVariant?: IconBoxVariant;
}

function wrapTitle(title: ReactNode): ReactNode {
  if (title === undefined || title === null) return null;
  if (typeof title === 'string' || typeof title === 'number') {
    return (
      <Heading level={3} size="lg">
        {title}
      </Heading>
    );
  }
  return title;
}

function wrapDescription(description: ReactNode): ReactNode {
  if (description === undefined || description === null) return null;
  if (typeof description === 'string' || typeof description === 'number') {
    return (
      <Text variant="body" color="muted">
        {description}
      </Text>
    );
  }
  return description;
}

/**
 * ActionCard — promotional / alert CTA preset composing Card + slots (Phase 8, E13).
 *
 * Severity-driven accent border (`info` → info color, `warning` → warning color,
 * `critical` → error color) + optional leading IconBox with severity-matched variant.
 * Required `cta` slot renders in CardFooter action mode for prominent placement.
 * `variant`, `accentColor`, and `accentPosition` are owned by the preset — consumer
 * cannot override via spread (TS-enforced Omit).
 *
 * @layer   preset
 * @tokens  --color-info, --color-warning, --color-error (via Card accentColor)
 * @deps    Card, CardBody, CardFooter, IconBox, Heading, Text
 * @a11y    Semantic Card `<div>` + `<h3>` title + `<p>` description. Consumer may
 *          add `role="alert"` / `aria-live` via spread for assertive announcements.
 * @example
 * <ActionCard severity="warning" icon={<AlertIcon />}
 *             title="Storage almost full"
 *             description="You're using 92% of your quota."
 *             cta={<Button>Upgrade plan</Button>} />
 */
export const ActionCard = forwardRef<HTMLDivElement, ActionCardProps>(
  function ActionCard(
    {
      severity,
      cta,
      title,
      description,
      icon,
      iconVariant,
      padding = 5,
      radius = 'lg',
      className,
      ...cardProps
    },
    ref,
  ) {
    const mapping = SEVERITY_MAP[severity];
    const resolvedIconVariant = iconVariant ?? mapping.iconVariant;
    const titleNode = wrapTitle(title);
    const descriptionNode = wrapDescription(description);
    const hasIcon = icon !== undefined && icon !== null;
    const hasTextBlock = titleNode !== null || descriptionNode !== null;

    return (
      <Card
        ref={ref}
        variant="accent"
        accentColor={mapping.accent}
        accentPosition="left"
        padding={padding}
        radius={radius}
        className={cn(styles.root, styles[`severity-${severity}`], className)}
        {...cardProps}
      >
        <CardBody className={styles.body}>
          <div className={styles.header}>
            {hasIcon ? (
              <IconBox icon={icon} variant={resolvedIconVariant} size="lg" />
            ) : null}
            {hasTextBlock ? (
              <div className={styles.headerText}>
                {titleNode}
                {descriptionNode}
              </div>
            ) : null}
          </div>
        </CardBody>
        <CardFooter action className={styles.footer}>
          {cta}
        </CardFooter>
      </Card>
    );
  },
);
