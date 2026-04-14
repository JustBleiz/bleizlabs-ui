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

/**
 * SidebarCard — navigation/filter container preset composing Card + slots (Phase 8, E13).
 *
 * Glass variant by default for sidebar-specific look. Optional uppercase `label`
 * caption rendered above the header slot. Smaller defaults (`padding={4}` +
 * `radius="md"`) suitable for narrower sidebar viewports.
 *
 * @layer   preset
 * @tokens  Inherited from Card glass variant (`--card-bg-glass`, `--card-blur`)
 * @deps    Card, CardHeader, CardBody, Heading, Text
 * @a11y    Semantic Card `<div>`. Label is visual only (not aria-label); consumer sets
 *          landmark via `role="navigation"` or `role="complementary"` if needed via spread.
 * @example
 * <SidebarCard label="Navigation" title="Account">
 *   <Stack>{links}</Stack>
 * </SidebarCard>
 */
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
