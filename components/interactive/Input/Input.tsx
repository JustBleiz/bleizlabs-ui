import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './Input.module.scss';

/**
 * Input — headless styled `<input>` wrapper (klocek atom, paradigm 1).
 *
 * @layer   atom (interactive)
 * @tokens  --input-bg, --input-border, --input-border-focus,
 *          --input-addon-bg, --input-addon-text, --input-addon-border,
 *          --color-error, --color-text-{primary,muted,secondary},
 *          --radius-{input,sm}, --space-{2..6}, --font-{secondary,size-base},
 *          --font-weight-medium, --line-height-normal, --duration-fast,
 *          --easing-default, --focus-ring, --focus-ring-error.
 * @deps    cn. Server-Component-compatible.
 * @a11y    Renders semantic `<input>`. Consumer wraps in `<Field>` for
 *          accessible label association + description + validation messages
 *          (`<Field><Field.Label/><Field.Control><Input/></Field.Control>
 *          <Field.Description/><Field.Message match="..."/></Field>`).
 *          For error visual state pass `invalid` prop — Input applies red
 *          border + sets `aria-invalid="true"`. Native form attrs (name,
 *          required, disabled, type, pattern, min/max etc.) pass through
 *          via `InputHTMLAttributes` — Constraint Validation API works
 *          natively without extra wiring.
 *
 * @notes   SIMPLIFY 0.15.0 — paradigm shift from "complete labeled atom"
 *          (14 props bundling label + error message + helper + counter +
 *          clear + loading + hideLabel) to "headless styled `<input>` wrapper"
 *          (6 props: type + 4 visual addons + invalid). Migration patterns:
 *          - label/hideLabel → consumer wraps in <Field><Field.Label/>...
 *          - error: string → consumer uses Field.Message + invalid: boolean
 *            for visual state
 *          - helperText → consumer uses Field.Description
 *          - showCounter → consumer wires own counter via React state
 *          - clearable/clearLabel → consumer composes own clear button via
 *            endIcon slot OR `<InputGroup>` for multi-element widgets
 *          - loading → consumer composes Spinner externally (e.g. positioned
 *            via Inline relative wrap OR endIcon slot z own state)
 *
 *          Resolves Field/Input paradigm clash documented in E06.12 Field demo.
 *          Now Input composes inside Field cleanly — Field owns label/error/
 *          description semantics, Input owns visual styling.
 *
 * @example
 * // Inside Field (recommended — full a11y wiring)
 * <Field name="email">
 *   <Field.Label>Email</Field.Label>
 *   <Field.Control>
 *     <Input type="email" required />
 *   </Field.Control>
 *   <Field.Description>We never share your email.</Field.Description>
 *   <Field.Message match="valueMissing">Email required</Field.Message>
 *   <Field.Message match="typeMismatch">Invalid email</Field.Message>
 * </Field>
 *
 * @example
 * // Standalone (no Field) — consumer responsible for accessible name
 * <Input type="text" aria-label="Search" placeholder="Search..." />
 *
 * @example
 * // Visual addons + invalid state
 * <Input prefix="$" suffix=".00" type="number" invalid={priceTooLow} />
 *
 * @example
 * // Icon decorations
 * <Input startIcon={<SearchIcon />} type="search" />
 */
export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Input type. Default `'text'`. */
  type?: InputType;
  /**
   * Visual invalid state — applies red border + sets `aria-invalid="true"`.
   * Pair with `<Field.Message match="...">` for accessible error text. Default
   * `false`.
   */
  invalid?: boolean;
  /** Optional leading icon inside the input wrap. Mutually exclusive with `prefix`. */
  startIcon?: ReactNode;
  /** Optional trailing icon inside the input wrap. */
  endIcon?: ReactNode;
  /**
   * Literal text addon rendered as a prefix on the left (e.g., `$`, `@`,
   * `https://`). Mutually exclusive with `startIcon`.
   */
  prefix?: string;
  /** Literal text addon rendered as a suffix on the right (e.g., `zł`, `kg`, `.00`). */
  suffix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    type = 'text',
    invalid = false,
    startIcon,
    endIcon,
    prefix,
    suffix,
    className,
    ...rest
  },
  ref
) {
  const hasStartIconSlot = Boolean(startIcon) && !prefix;
  const hasEndIconSlot = Boolean(endIcon) && !suffix;

  return (
    <div
      className={cn(
        styles.inputWrap,
        invalid && styles.inputWrapError,
        hasStartIconSlot && styles.hasStartIcon,
        hasEndIconSlot && styles.hasEndIcon,
        className
      )}
    >
      {prefix ? (
        <span className={styles.addonText} data-side="start">
          {prefix}
        </span>
      ) : startIcon ? (
        <span aria-hidden="true" className={styles.startIcon}>
          {startIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        type={type}
        aria-invalid={invalid || undefined}
        className={styles.input}
        {...rest}
      />
      {suffix ? (
        <span className={styles.addonText} data-side="end">
          {suffix}
        </span>
      ) : endIcon ? (
        <span aria-hidden="true" className={styles.endIcon}>
          {endIcon}
        </span>
      ) : null}
    </div>
  );
});
