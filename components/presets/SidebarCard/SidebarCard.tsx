import { forwardRef, type ReactNode } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  type CardProps,
  type CardVariant,
} from '../../display/Card';
import { Heading } from '../../typography/Heading';
import { Text } from '../../typography/Text';
import { cn } from '../../utils/cn';
import styles from './SidebarCard.module.scss';

/**
 * SidebarCard — navigation/filter container preset composing Card + slots (Phase 8, E13).
 *
 * Glass variant by default for sidebar-specific look. Optional uppercase `label`
 * caption rendered above the header slot. Smaller defaults (`padding={4}` +
 * `radius="md"`) suitable for narrower sidebar viewports. `variant` can be
 * overridden (e.g. `"accent"`, `"flat"`) when the consumer wants a non-glass
 * treatment — Omit excludes Card's `variant` but `SidebarCardProps` redeclares
 * it with its own default.
 *
 * @layer   preset
 * @tokens  --space-1 (.header gap: label ↔ title ↔ description stack),
 *          --space-2 (.body gap: nav/filter items close to header),
 *          --letter-spacing-wider (.label — matches Badge uppercase tracking);
 *          Card glass variant handles `--card-bg-glass` / `--card-blur` outer
 *          chrome internally
 * @deps    Card (variant, padding, radius, CardProps + CardVariant types),
 *          CardHeader, CardBody, Heading (level={3}, size="md"),
 *          Text (variant="caption", color="muted", uppercase), cn,
 *          React: `forwardRef`, `ReactNode`
 * @a11y    Semantic Card `<div>` root. `label` is visual-only — it is NOT
 *          exposed as an ARIA name. Consumer sets landmark semantics via
 *          spread: `role="navigation"` for nav sidebars, `role="complementary"`
 *          for aside-style sidebars, optional `aria-labelledby` pointing to
 *          an id on the title node. Title + description achieve semantic
 *          `<h3>` / `<p>` ONLY when caller passes scalar strings/numbers
 *          (wrapTitle/wrapDescription auto-wrap); ReactNode pass-through
 *          preserves caller semantics.
 * @apg          N/A — composition preset, no new ARIA semantics; inherited via composed atoms.
 * @tested       tsc + eslint + next build clean. No runtime a11y suite (presets transitively covered by atom tests).
 * @regressions  N/A — preset composition. Bug fixes land in composed atoms.
 * @notes   `direction`, `children`, Card's `variant`, and Card's `title` are
 *          preset-owned (TS-enforced Omit), then `variant` is re-exposed with
 *          preset default `'glass'`. Smaller `size="md"` heading vs ActionCard
 *          / ContentCard (`size="lg"`) — intentional for narrower sidebar
 *          viewport where a compact heading reads better.
 * @example
 * <SidebarCard label="Navigation" title="Account">
 *   <Stack>{links}</Stack>
 * </SidebarCard>
 */
export interface SidebarCardProps
  extends Omit<CardProps, 'direction' | 'children' | 'variant' | 'title'> {
  /** Optional uppercase caption rendered above the header (e.g., "NAVIGATION", "FILTERS"). */
  label?: string;
  /** Optional heading slot. Scalar strings/numbers auto-wrap in `<Heading level={3} size="md">`; ReactNode passes through. */
  title?: ReactNode;
  /** Optional description below title. Scalar strings/numbers auto-wrap in `<Text variant="caption" color="muted">`. */
  description?: ReactNode;
  /** Sidebar body content (nav, filter controls, list). */
  children?: ReactNode;
  /** Override Card variant. Default `'glass'` (sidebar-specific look). */
  variant?: CardVariant;
}

function wrapTitle(title: ReactNode): ReactNode {
  if (title === undefined || title === null) return null;
  if (typeof title === 'string' || typeof title === 'number') {
    return (
      <Heading level={3} size="md">
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
      <Text variant="caption" color="muted">
        {description}
      </Text>
    );
  }
  return description;
}

export const SidebarCard = forwardRef<HTMLDivElement, SidebarCardProps>(
  function SidebarCard(
    {
      label,
      title,
      description,
      children,
      variant = 'glass',
      padding = 4,
      radius = 'md',
      className,
      ...cardProps
    },
    ref,
  ) {
    const titleNode = wrapTitle(title);
    const descriptionNode = wrapDescription(description);
    const hasLabel = label !== undefined && label.length > 0;
    const hasHeader = hasLabel || titleNode !== null || descriptionNode !== null;
    const hasBody = children !== undefined && children !== null;

    return (
      <Card
        ref={ref}
        variant={variant}
        padding={padding}
        radius={radius}
        className={cn(styles.root, className)}
        {...cardProps}
      >
        {hasHeader ? (
          <CardHeader className={styles.header}>
            {hasLabel ? (
              <Text variant="caption" color="muted" uppercase className={styles.label}>
                {label}
              </Text>
            ) : null}
            {titleNode}
            {descriptionNode}
          </CardHeader>
        ) : null}
        {hasBody ? <CardBody className={styles.body}>{children}</CardBody> : null}
      </Card>
    );
  },
);
