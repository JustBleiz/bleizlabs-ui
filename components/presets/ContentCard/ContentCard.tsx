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

export interface ContentCardProps
  extends Omit<CardProps, 'direction' | 'children'> {
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

/**
 * ContentCard — text-heavy content preset composing Card + slots (Phase 8, E13).
 *
 * Flagship defaults for long-form article / documentation / blog cards:
 * `padding={5}` (20px) + `radius="lg"`. All Card props pass through except
 * `direction` and `children` (children is the body slot).
 *
 * @layer   preset
 * @tokens  Inherited from Card atom (`--card-padding`, `--radius-card`, etc.)
 * @deps    Card, CardHeader, CardBody, CardFooter, Heading, Text
 * @a11y    Inherits Card semantic `<div>`. Title slot renders as `<h3>` when string/number.
 * @example
 * <ContentCard title="Readme" description="Project overview">
 *   <Text>Body content...</Text>
 * </ContentCard>
 */
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
