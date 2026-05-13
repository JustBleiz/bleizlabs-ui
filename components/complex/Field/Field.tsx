'use client';

/**
 * Field — accessible form-row compound (label + control + description + messages).
 *
 * Decoupled compound that wraps a single form control with associated label,
 * description, and conditional validation messages. Integrates optionally with
 * the surrounding `<Form>` context (form-id prefix, hasSubmitted gate, central
 * validity reporting); also works standalone outside Form.
 *
 * @layer   complex-interactive (compound: Field root + 4 sub-parts)
 * @tokens  --space-{1,2}, --color-text-{primary,secondary,muted},
 *          --color-error, --font-size-sm, --line-height-tight, --font-weight-medium.
 *          Layout passthrough — visual identity owned by composed Label/Input/Text atoms.
 * @deps    Slot (asChild polymorphism for Field.Control), Form context
 *          (`useFormContext`, `snapshotValidity`, `FieldValidity`) — optional;
 *          Field works standalone without Form. Server-Component-incompatible:
 *          uses React state + DOM refs to wire native ValidityState API.
 *
 * @a11y    APG form-pattern aligned. Field root renders `<div role="group">`;
 *          Label `<label htmlFor>` wired to control id; Control receives
 *          auto-generated `id`, `name`, `aria-describedby` (aggregated active
 *          description + message ids), `aria-invalid` (when any validity flag
 *          is true OR `serverInvalid` is set); Description renders `<p>` with
 *          stable id (registered into aria-describedby on mount); Message
 *          renders `<p role="alert">` ONLY when its `match` validity flag is
 *          true. When inside Form: messages gated by `hasSubmitted` (no eager
 *          error display before first submit). Standalone Field shows messages
 *          on every input event.
 *
 * @apg     https://www.w3.org/WAI/ARIA/apg/patterns/form/
 * @validation Native HTML5 Constraint Validation API. Field listens to
 *          `invalid` + `input` + `blur` + `change` events on the captured
 *          control element, snapshots `element.validity` via Form's
 *          `snapshotValidity()` helper.
 *
 * @example
 * <Form onSubmit={handle} aria-label="Sign up">
 *   <Field name="email">
 *     <Field.Label>Email</Field.Label>
 *     <Field.Control><input type="email" required /></Field.Control>
 *     <Field.Description>We never share your email.</Field.Description>
 *     <Field.Message match="valueMissing">Email is required</Field.Message>
 *     <Field.Message match="typeMismatch">Enter a valid email</Field.Message>
 *   </Field>
 *   <Form.Submit>Send</Form.Submit>
 * </Form>
 */

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Slot } from '../../utils/Slot';
import { mergeRefs } from '../../utils/mergeRefs';
import { cn } from '../../utils/cn';
import {
  snapshotValidity,
  useFormContext,
  type FieldValidity,
  type FormContextValue,
} from '../Form/Form';
import styles from './Field.module.scss';

// ──────────────────────────────────────────────────────────────────────────
// Validity match keys
// ──────────────────────────────────────────────────────────────────────────

/** Valid keys for `<Field.Message match="...">`. */
export type FieldValidityMatch =
  | 'valueMissing'
  | 'typeMismatch'
  | 'patternMismatch'
  | 'tooShort'
  | 'tooLong'
  | 'rangeUnderflow'
  | 'rangeOverflow'
  | 'stepMismatch'
  | 'badInput'
  | 'customError';

// ──────────────────────────────────────────────────────────────────────────
// FieldContext
// ──────────────────────────────────────────────────────────────────────────

interface FieldContextValue {
  fieldName: string;
  controlId: string;
  descriptionId: string;
  validity: FieldValidity | null;
  serverInvalid: boolean;
  hasSubmitted: boolean;
  isInvalid: boolean;
  /** Sub-parts call to register their generated id for aria-describedby aggregation. */
  registerDescribedBy: (id: string) => () => void;
  /** Aggregated `aria-describedby` for the control (active description + message ids). */
  describedBy: string;
  /** Captures the underlying control DOM element (input/textarea/select). */
  setControlEl: (el: HTMLElement | null) => void;
}

const FieldContext = createContext<FieldContextValue | null>(null);

function useFieldContext(): FieldContextValue {
  const ctx = useContext(FieldContext);
  if (!ctx) {
    throw new Error(
      'Field sub-components (Label/Control/Description/Message) must be rendered inside <Field>.'
    );
  }
  return ctx;
}

// Optional Form context lookup — Field works inside or outside Form.
function useOptionalFormContext(): FormContextValue | null {
  try {
    return useFormContext();
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Field root
// ──────────────────────────────────────────────────────────────────────────

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Field name — used as control `name` attribute + Form context registration key. */
  name: string;
  /**
   * Mark field as server-invalid (after a submit + server-side validation
   * failure). Forces `aria-invalid="true"` on control + allows
   * `<Field.Message match="customError">` to render without the browser
   * firing an `invalid` event.
   */
  serverInvalid?: boolean;
  /** Field.Label + Field.Control + Field.Description + Field.Message compound children. */
  children: ReactNode;
}

const FieldRoot = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { name, serverInvalid = false, children, className, ...rest },
  forwardedRef
) {
  const formCtx = useOptionalFormContext();
  const reactId = useId();
  const fieldIdPrefix = formCtx ? `${formCtx.formId}-${name}` : `${reactId}-${name}`;
  const controlId = `${fieldIdPrefix}-control`;
  const descriptionId = `${fieldIdPrefix}-description`;

  const [validity, setValidity] = useState<FieldValidity | null>(null);
  // describedByIds starts empty — Description and Message register themselves
  // on mount via registerDescribedBy. This way aria-describedby points only
  // to ids that exist in the DOM.
  const [describedByIds, setDescribedByIds] = useState<string[]>([]);
  // Control element as state (NOT ref) so the validity-listener effect can
  // react to deferred / conditional control mounting.
  const [controlEl, setControlEl] = useState<HTMLElement | null>(null);

  const registerDescribedBy = useCallback((id: string): (() => void) => {
    setDescribedByIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
    return () => {
      setDescribedByIds((ids) => ids.filter((x) => x !== id));
    };
  }, []);

  // Register with Form (no-op when standalone).
  // Depend on the stable `registerField` reference (Form wraps it in
  // `useCallback([])`), NOT the wrapping `formCtx` object — the context value
  // is re-memoized whenever `validityVersion` bumps (which `registerField`
  // itself triggers), so depending on the whole object creates a
  // mount → bump → re-memo → cleanup → re-register infinite loop.
  const registerField = formCtx?.registerField;
  useEffect(() => {
    if (!registerField) return;
    return registerField(name);
  }, [registerField, name]);

  // Wire native ValidityState listeners on the captured control element.
  useEffect(() => {
    if (!controlEl) return;
    const isFormCandidate =
      controlEl instanceof HTMLInputElement ||
      controlEl instanceof HTMLTextAreaElement ||
      controlEl instanceof HTMLSelectElement;
    if (!isFormCandidate) return;

    const update = () => {
      const snapshot = snapshotValidity(controlEl.validity);
      setValidity(snapshot);
      formCtx?.reportFieldValidity(name, snapshot);
    };

    controlEl.addEventListener('invalid', update);
    controlEl.addEventListener('input', update);
    controlEl.addEventListener('blur', update);
    controlEl.addEventListener('change', update);
    return () => {
      controlEl.removeEventListener('invalid', update);
      controlEl.removeEventListener('input', update);
      controlEl.removeEventListener('blur', update);
      controlEl.removeEventListener('change', update);
    };
  }, [controlEl, formCtx, name]);

  const isInvalid = serverInvalid || (validity != null && !validity.valid);
  const hasSubmitted = formCtx?.hasSubmitted ?? true; // standalone: always "submitted"
  const describedBy = describedByIds.join(' ') || undefined;

  const ctxValue = useMemo<FieldContextValue>(
    () => ({
      fieldName: name,
      controlId,
      descriptionId,
      validity,
      serverInvalid,
      hasSubmitted,
      isInvalid,
      registerDescribedBy,
      describedBy: describedBy ?? '',
      setControlEl,
    }),
    [
      name,
      controlId,
      descriptionId,
      validity,
      serverInvalid,
      hasSubmitted,
      isInvalid,
      registerDescribedBy,
      describedBy,
    ]
  );

  return (
    <FieldContext.Provider value={ctxValue}>
      <div
        ref={forwardedRef}
        role="group"
        data-field={name}
        data-invalid={isInvalid ? '' : undefined}
        className={cn(styles.root, className)}
        {...rest}
      >
        {children}
      </div>
    </FieldContext.Provider>
  );
});

// ──────────────────────────────────────────────────────────────────────────
// Field.Label
// ──────────────────────────────────────────────────────────────────────────

export interface FieldLabelProps
  extends Omit<LabelHTMLAttributes<HTMLLabelElement>, 'htmlFor'> {
  children: ReactNode;
}

const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(function FieldLabel(
  { children, className, ...rest },
  forwardedRef
) {
  const { controlId } = useFieldContext();
  return (
    <label
      ref={forwardedRef}
      htmlFor={controlId}
      className={cn(styles.label, className)}
      {...rest}
    >
      {children}
    </label>
  );
});

// ──────────────────────────────────────────────────────────────────────────
// Field.Control — Slot wrapper that injects id/name/aria-* on the underlying input
// ──────────────────────────────────────────────────────────────────────────

export interface FieldControlProps {
  /** Single child input/textarea/select. Slot-cloned with id/name/aria-* injected. */
  children: ReactElement;
}

const FieldControl = forwardRef<HTMLElement, FieldControlProps>(function FieldControl(
  { children },
  forwardedRef
) {
  const { fieldName, controlId, isInvalid, describedBy, setControlEl } =
    useFieldContext();

  // Slot's prop interface is HTMLAttributes<HTMLElement> which omits form-only
  // attrs like `name`. Cast a typed prop bag at the call boundary; Slot's
  // mergeProps passes the values through unchanged to the wrapped form input.
  const controlProps = {
    id: controlId,
    name: fieldName,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': isInvalid || undefined,
  } as HTMLAttributes<HTMLElement>;

  return (
    <Slot
      ref={mergeRefs<HTMLElement>(forwardedRef, setControlEl)}
      {...controlProps}
    >
      {children}
    </Slot>
  );
});

// ──────────────────────────────────────────────────────────────────────────
// Field.Description
// ──────────────────────────────────────────────────────────────────────────

export interface FieldDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

const FieldDescription = forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
  function FieldDescription({ children, className, ...rest }, forwardedRef) {
    const { descriptionId, registerDescribedBy } = useFieldContext();

    // Register own id into aria-describedby aggregation on mount; cleanup
    // unregisters on unmount so aria-describedby points only to live ids.
    useEffect(() => {
      return registerDescribedBy(descriptionId);
    }, [descriptionId, registerDescribedBy]);

    return (
      <p
        ref={forwardedRef}
        id={descriptionId}
        className={cn(styles.description, className)}
        {...rest}
      >
        {children}
      </p>
    );
  }
);

// ──────────────────────────────────────────────────────────────────────────
// Field.Message — conditional render based on validity match
// ──────────────────────────────────────────────────────────────────────────

export interface FieldMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  /**
   * Validity flag that triggers this message to render. When inside `<Form>`,
   * messages are additionally gated by `hasSubmitted` (no eager error display
   * before first submit). Standalone Field (no surrounding Form) renders
   * messages immediately on every input event — no submit gate.
   */
  match: FieldValidityMatch;
  children: ReactNode;
}

const FieldMessage = forwardRef<HTMLParagraphElement, FieldMessageProps>(
  function FieldMessage({ match, children, className, ...rest }, forwardedRef) {
    const { validity, serverInvalid, hasSubmitted, registerDescribedBy } =
      useFieldContext();
    const messageId = useId();

    const matched =
      match === 'customError'
        ? serverInvalid || validity?.customError === true
        : validity?.[match] === true;

    const shouldRender = matched && hasSubmitted;

    useEffect(() => {
      if (!shouldRender) return;
      return registerDescribedBy(messageId);
    }, [shouldRender, messageId, registerDescribedBy]);

    if (!shouldRender) return null;

    return (
      <p
        ref={forwardedRef}
        id={messageId}
        role="alert"
        className={cn(styles.message, className)}
        {...rest}
      >
        {children}
      </p>
    );
  }
);

// ──────────────────────────────────────────────────────────────────────────
// Compound export
// ──────────────────────────────────────────────────────────────────────────

type FieldCompound = typeof FieldRoot & {
  Label: typeof FieldLabel;
  Control: typeof FieldControl;
  Description: typeof FieldDescription;
  Message: typeof FieldMessage;
};

export const Field: FieldCompound = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Control: FieldControl,
  Description: FieldDescription,
  Message: FieldMessage,
});

export {
  FieldRoot,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldMessage,
};
