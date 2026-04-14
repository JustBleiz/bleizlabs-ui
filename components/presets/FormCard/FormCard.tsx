import {
  forwardRef,
  type FormEventHandler,
  type Ref,
  type ReactNode,
} from 'react';
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
import styles from './FormCard.module.scss';

export interface FormCardProps
  extends Omit<
    CardProps,
    | 'direction'
    | 'children'
    | 'title'
    | 'onSubmit'
    | 'action'
    | 'method'
    | 'encType'
    | 'noValidate'
    | 'autoComplete'
  > {
  /** Heading slot. Scalar strings/numbers auto-wrap in `<Heading level={3} size="lg">`. */
  title?: ReactNode;
  /** Description slot. Scalar strings/numbers auto-wrap in `<Text variant="body" color="muted">`. */
  description?: ReactNode;
  /** Primary form body content (inputs, fieldsets, etc.). */
  children?: ReactNode;
  /** Footer slot rendered in CardFooter action mode. Typically a submit button + helper text. */
  footer?: ReactNode;
  /** Separate header from body with a top divider inside CardHeader. Default: `false`. */
  headerBorder?: boolean;
  /**
   * Render wrapper as semantic `<form>` element. Default: `true`.
   * When `false`, renders Card as `<div>` — use only for form-look without form semantics.
   */
  asForm?: boolean;
  /** Form submit handler (only used when `asForm=true`). */
  onSubmit?: FormEventHandler<HTMLFormElement>;
  /** Native form action URL. */
  action?: string;
  /** Native form method. */
  method?: 'get' | 'post' | 'dialog';
  /** Native form name attribute. */
  name?: string;
  /** Native form encType. */
  encType?: string;
  /** Skip native browser validation. */
  noValidate?: boolean;
  /** Browser autofill hint. */
  autoComplete?: 'on' | 'off';
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
 * FormCard — semantic form wrapper preset composing Card + slots (Phase 8, E13).
 *
 * Renders `<form>` by default (`asForm=true`) so native browser form submission,
 * validation, and autofill all work correctly. Pass `asForm={false}` to render as
 * a plain Card `<div>` when form semantics are not needed. Default layout mirrors
 * ContentCard (`padding={5}` + `radius="lg"`). Footer slot uses CardFooter action
 * mode for submit button placement.
 *
 * @layer   preset
 * @tokens  Inherited from Card atom
 * @deps    Card, CardHeader, CardBody, CardFooter, Heading, Text
 * @a11y    Semantic `<form>` element. Consumer provides label association via
 *          `title` slot + optional `aria-labelledby` on form itself via spread.
 * @example
 * <FormCard title="Account" description="Update your profile" onSubmit={handler}
 *           footer={<Button type="submit">Save</Button>}>
 *   <Input label="Name" />
 * </FormCard>
 */
export const FormCard = forwardRef<HTMLElement, FormCardProps>(function FormCard(
  {
    title,
    description,
    children,
    footer,
    headerBorder = false,
    asForm = true,
    onSubmit,
    action,
    method,
    name,
    encType,
    noValidate,
    autoComplete,
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

  const content = (
    <>
      {hasHeader ? (
        <CardHeader border={headerBorder} className={styles.header}>
          {titleNode}
          {descriptionNode}
        </CardHeader>
      ) : null}
      {hasBody ? <CardBody className={styles.body}>{children}</CardBody> : null}
      {hasFooter ? (
        <CardFooter action className={styles.footer}>
          {footer}
        </CardFooter>
      ) : null}
    </>
  );

  if (asForm) {
    return (
      <form
        ref={ref as Ref<HTMLFormElement>}
        onSubmit={onSubmit}
        action={action}
        method={method}
        name={name}
        encType={encType}
        noValidate={noValidate}
        autoComplete={autoComplete}
        className={styles.formWrapper}
      >
        <Card
          padding={padding}
          radius={radius}
          className={cn(styles.root, className)}
          {...cardProps}
        >
          {content}
        </Card>
      </form>
    );
  }

  return (
    <Card
      ref={ref as Ref<HTMLDivElement>}
      padding={padding}
      radius={radius}
      className={cn(styles.root, className)}
      {...cardProps}
    >
      {content}
    </Card>
  );
});
