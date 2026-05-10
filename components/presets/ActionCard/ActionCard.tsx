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

/**
 * ActionCard — promotional / alert CTA preset composing Card + slots (Phase 8, E13).
 *
 * Severity-driven accent border (`info` → info color, `warning` → warning color,
 * `critical` → error color) + optional leading IconBox with severity-matched variant.
 * Required `cta` slot renders in CardFooter action mode for prominent placement.
 * `variant`, `accentColor`, `accentPosition`, `direction`, `children`, and Card's
 * own `title` are owned by the preset — consumer cannot override via spread
 * (TS-enforced Omit). Use ActionCard's own `title` prop for the heading slot.
 *
 * @layer   preset
 * @tokens  --space-1 (.headerText gap), --space-3 (.body gap, .footer gap),
 *          --space-4 (.header gap); --color-info / --color-warning /
 *          --color-error applied via Card `accentColor` prop through
 *          runtime SEVERITY_MAP (tsx-side token reference)
 * @deps    Card (variant="accent", accentColor, accentPosition="left", padding,
 *          radius, CardProps type), CardBody, CardFooter (action flag enforced),
 *          IconBox (icon, variant, size="lg", IconBoxVariant type),
 *          Heading (level={3}, size="lg"), Text (variant="body", color="muted"),
 *          cn, React: `forwardRef`, `ReactNode`
 * @a11y    Semantic Card `<div>` root. Title + description achieve semantic
 *          `<h3>` / `<p>` ONLY when the caller passes scalar strings/numbers —
 *          wrapTitle auto-wraps in `<Heading level={3}>` and wrapDescription
 *          in `<Text variant="body">` (renders `<p>` by default). Pass-through
 *          `ReactNode` preserves caller's semantics. Consumer may add
 *          `role="alert"` / `aria-live` via spread for assertive announcements.
 * @apg          N/A — composition preset, no new ARIA semantics; inherited via composed atoms.
 * @tested       tsc + eslint + next build clean. No runtime a11y suite (presets transitively covered by atom tests).
 * @regressions  N/A — preset composition. Bug fixes land in composed atoms.
 * @notes   CardFooter `action` mode is hard-enforced by the preset (full-bleed
 *          raised-bg footer) — do not attempt to override. ActionCard's own
 *          `title` slot replaces Card's `title` prop (Omit-excluded).
 * @example
 * <ActionCard severity="warning" icon={<AlertIcon />}
 *             title="Storage almost full"
 *             description="You're using 92% of your quota."
 *             cta={<Button>Upgrade plan</Button>} />
 */
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
 * @deprecated since 0.13.0 — product-flavored "alert + CTA combo" preset bundle (2 concerns: alert + action). Zero equivalent in shadcn/Radix/react-aria — they ship `<Alert>` separately, consumer adds `<Button>` in children. Will be removed in 0.15.0.
 *
 * Migration: consumer composes `<Alert severity={...}><AlertTitle /><AlertDescription /><Button /></Alert>` lub project-local `<DashboardActionCard>` molecule. See charter §"What `@bleizlabs/ui` is NOT" + `docs/lib-audit-2026-05-08.md` §Card Presets cluster.
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
        padding={padding}
        radius={radius}
        className={cn(styles.root, styles[`severity-${severity}`], className)}
        style={{ '--card-accent-color': mapping.accent } as React.CSSProperties}
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
