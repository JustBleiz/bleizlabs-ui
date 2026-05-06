import { forwardRef, type ReactNode } from 'react';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  type CardProps,
} from '../../display/Card';
import { Heading } from '../../typography/Heading';
import { Text } from '../../typography/Text';
import { cn } from '../../utils/cn';
import styles from './ContentCard.module.scss';

/**
 * ContentCard — text-heavy content preset composing Card + slots (Phase 8, E13).
 *
 * Flagship defaults for long-form article / documentation / blog cards:
 * `padding={5}` (20px) + `radius="lg"`. All Card props pass through except
 * `direction`, `children`, and Card's own `title` (replaced by preset's own
 * `title` slot). `children` is the body content slot.
 *
 * @layer   preset
 * @tokens  --space-1 (.header inter-line gap: title ↔ description),
 *          --space-3 (.body inner gap, .footer inner gap); Card atom handles
 *          its own outer padding / radius / border tokens
 * @deps    Card (padding, radius, CardProps type), CardHeader (border flag),
 *          CardBody, CardFooter, Heading (level={3}, size="lg"),
 *          Text (variant="body", color="muted"), cn,
 *          React: `forwardRef`, `ReactNode`
 * @a11y    Inherits Card semantic `<div>` root. Title + description achieve
 *          semantic `<h3>` / `<p>` ONLY when caller passes scalar
 *          strings/numbers — wrapTitle auto-wraps in `<Heading level={3}>`,
 *          wrapDescription in `<Text variant="body">` (renders `<p>` by
 *          default). Pass-through `ReactNode` preserves caller's semantics
 *          (caller owns heading level + element type in that path).
 * @apg          N/A — composition preset, no new ARIA semantics; inherited via composed atoms.
 * @tested       tsc + eslint + next build clean. No runtime a11y suite (presets transitively covered by atom tests).
 * @regressions  N/A — preset composition. Bug fixes land in composed atoms.
 * @notes   `direction`, `children`, and Card's `title` are preset-owned
 *          (TS-enforced Omit). Use ContentCard's own `title` / `description`
 *          / `footer` slots + body via `children`. `headerBorder` toggles
 *          CardHeader's top divider for visual separation from body.
 * @example
 * <ContentCard title="Readme" description="Project overview">
 *   <Text>Body content...</Text>
 * </ContentCard>
 */
export interface ContentCardProps
  extends Omit<CardProps, 'direction' | 'children' | 'title'> {
  /** Heading slot. Scalar strings/numbers auto-wrap in `<Heading level={3} size="lg">`; ReactNode passes through. */
  title?: ReactNode;
  /** Description slot. Scalar strings/numbers auto-wrap in `<Text variant="body" color="muted">`; ReactNode passes through. */
  description?: ReactNode;
  /** Primary body content rendered inside CardBody. */
  children?: ReactNode;
  /** Optional footer slot — renders CardFooter when provided. Consumer owns layout of footer children. */
  footer?: ReactNode;
  /** Separate header from body with a top divider inside CardHeader. Default: `false`. */
  headerBorder?: boolean;
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

export const ContentCard = forwardRef<HTMLDivElement, ContentCardProps>(
  function ContentCard(
    {
      title,
      description,
      children,
      footer,
      headerBorder = false,
      padding = 5,
      radius = 'lg',
      className,
      ...cardProps
    },
    ref,
  ) {
    const titleNode = wrapTitle(title);
    const descriptionNode = wrapDescription(description);
    const hasHeader = titleNode !== null || descriptionNode !== null;
    const hasBody = children !== undefined && children !== null;
    const hasFooter = footer !== undefined && footer !== null;

    return (
      <Card
        ref={ref}
        padding={padding}
        radius={radius}
        className={cn(styles.root, className)}
        {...cardProps}
      >
        {hasHeader ? (
          <CardHeader border={headerBorder} className={styles.header}>
            {titleNode}
            {descriptionNode}
          </CardHeader>
        ) : null}
        {hasBody ? <CardBody className={styles.body}>{children}</CardBody> : null}
        {hasFooter ? <CardFooter className={styles.footer}>{footer}</CardFooter> : null}
      </Card>
    );
  },
);
