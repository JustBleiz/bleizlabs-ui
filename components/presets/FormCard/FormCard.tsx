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
 * @tokens  --space-1 (.header inter-line gap), --space-4 (.body inner gap:
 *          larger than ContentCard for form field breathing room),
 *          --space-3 (.footer gap — matches ContentCard for consistency);
 *          Card atom handles outer padding/radius/border tokens
 * @deps    Card (padding, radius, CardProps type), CardHeader (border flag),
 *          CardBody, CardFooter (action flag), Heading (level={3}, size="lg"),
 *          Text (variant="body", color="muted"), cn,
 *          React: `forwardRef`, `ReactNode`, type imports
 *          `FormEventHandler<HTMLFormElement>`, `Ref`
 * @a11y    Default (`asForm=true`) renders semantic `<form>` wrapper with full
 *          native submit / validation / autofill semantics — consumer provides
 *          label association via `title` slot + optional `aria-labelledby` on
 *          the form itself via spread. **When `asForm=false`, the wrapper
 *          degrades to a plain Card `<div>` with zero form semantics** — use
 *          only for form-look without form behavior. Title + description
 *          achieve semantic `<h3>` / `<p>` ONLY when caller passes scalar
 *          strings/numbers (wrapTitle/wrapDescription auto-wrap); ReactNode
 *          pass-through preserves caller semantics.
 * @apg          N/A — composition preset, no new ARIA semantics; inherited via composed atoms.
 * @tested       tsc + eslint + next build clean. No runtime a11y suite (presets transitively covered by atom tests).
 * @regressions  N/A — preset composition. Bug fixes land in composed atoms.
 * @notes   Six native `<form>` attributes (`onSubmit`, `action`, `method`,
 *          `encType`, `noValidate`, `autoComplete`) are Omit-excluded from
 *          CardProps and redeclared on FormCardProps so the preset owns their
 *          semantics. `name` is preset-only (Card has no equivalent). The
 *          `forwardRef<HTMLElement, ...>` signature covers both branches:
 *          `Ref<HTMLFormElement>` when `asForm=true`, `Ref<HTMLDivElement>`
 *          when `asForm=false`. Outer `.formWrapper` uses `display: contents`
 *          so the `<form>` is semantic-only with zero layout impact; Card
 *          remains the visual chrome owner.
 * @example
 * <FormCard title="Account" description="Update your profile" onSubmit={handler}
 *           footer={<Button type="submit">Save</Button>}>
 *   <Input label="Name" />
 * </FormCard>
 */
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
