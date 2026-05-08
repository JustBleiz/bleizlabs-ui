import { FormSurface, type FormSurfaceProps } from '../FormSurface';

/**
 * @deprecated since 0.13.0 — renamed to `FormSurface`. The "Surface" suffix communicates the structural role (form-flavored Card surface) more clearly than "Card" per `library-charter.md` §"Universal Library — Definition" naming canon. Will be removed in 0.15.0.
 *
 * Migration: replace `import { FormCard, type FormCardProps } from '@bleizlabs/ui'` with `import { FormSurface, type FormSurfaceProps } from '@bleizlabs/ui'`. Props API is identical — pure rename.
 */
export type FormCardProps = FormSurfaceProps;

/**
 * @deprecated since 0.13.0 — renamed to `FormSurface`. Will be removed in 0.15.0.
 *
 * Migration: `<FormCard ...>` → `<FormSurface ...>`. API identical.
 */
export const FormCard = FormSurface;
