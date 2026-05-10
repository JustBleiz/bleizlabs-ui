import {
  forwardRef,
  type FormHTMLAttributes,
  type ReactNode,
} from 'react';
import { Card, type CardProps } from '../../display/Card';
import { cn } from '../../utils/cn';
import styles from './FormSurface.module.scss';

/**
 * FormSurface — semantic `<form>` wrapper around a Card surface (klocek).
 *
 * Renders `<form>` with native browser submission / validation / autofill
 * semantics around a Card surface. Consumer composes `<CardHeader>`,
 * `<CardBody>`, and `<CardFooter>` slots inside via children — molecule does
 * NOT auto-wrap title/description strings into Heading/Text variants and does
 * NOT bundle header/body/footer slots as typed props.
 *
 * @layer   preset (compound: `<form>` + Card surface)
 * @tokens  Card atom owns padding/radius/border tokens via `padding` + `radius`
 *          props (independent axes, not bundled into a density enum). No
 *          opinionated typography on slot wrappers — consumer brings own atoms.
 * @deps    Card (padding, radius, CardProps subset), cn. Server-Component safe.
 * @a11y    Renders semantic `<form>`. Consumer associates label via
 *          `<CardHeader>` content (e.g. `<Heading id="form-title">…</Heading>`)
 *          + `aria-labelledby` on the form via spread. All native form attrs
 *          (`onSubmit`, `action`, `method`, `name`, `encType`, `noValidate`,
 *          `autoComplete`, etc.) pass through via `FormHTMLAttributes`.
 *
 * @example
 * // Basic form with header + body + footer composition
 * <FormSurface onSubmit={handleSubmit} aria-labelledby="account-title">
 *   <CardHeader>
 *     <Heading id="account-title" level={3} size="lg">Account</Heading>
 *     <Text variant="body" color="muted">Update your profile.</Text>
 *   </CardHeader>
 *   <CardBody>
 *     <Stack gap={4}>
 *       <Input name="name" label="Name" />
 *       <Input name="email" label="Email" type="email" />
 *     </Stack>
 *   </CardBody>
 *   <CardFooter action>
 *     <Text variant="small" color="secondary">We never share your info.</Text>
 *     <Button type="submit">Save</Button>
 *   </CardFooter>
 * </FormSurface>
 *
 * @example
 * // Surface customization via independent padding + radius axes
 * <FormSurface padding={6} radius="xl" onSubmit={handle}>…</FormSurface>
 */
export interface FormSurfaceProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'children'> {
  /** Form body — typically `<CardHeader>` + `<CardBody>` + `<CardFooter>` slots. */
  children: ReactNode;
  /** Card surface padding token. Default `5`. */
  padding?: CardProps['padding'];
  /** Card surface border-radius token. Default `'lg'`. */
  radius?: CardProps['radius'];
}

export const FormSurface = forwardRef<HTMLFormElement, FormSurfaceProps>(
  function FormSurface(
    { children, padding = 5, radius = 'lg', className, ...formProps },
    ref
  ) {
    return (
      <form ref={ref} className={cn(styles.root, className)} {...formProps}>
        <Card padding={padding} radius={radius}>
          {children}
        </Card>
      </form>
    );
  }
);
