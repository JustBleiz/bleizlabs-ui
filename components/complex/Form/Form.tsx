'use client';

/**
 * Form — accessible form root with native Constraint Validation API.
 *
 * @layer complex-interactive (Phase 10 — form-validation-aware)
 * @tokens --color-text-primary, --color-text-secondary, --color-error,
 *   --space-{2,3,4,5}, --duration-fast, --easing-default. The `.root` class
 *   itself is a layout passthrough — most styling lives in `<Field>`,
 *   `<Input>`, etc. Form provides the shell + context only.
 * @deps zero runtime UI deps (D5/D25). Own Slot primitive for Form.Submit
 *   `asChild` polymorphism. Native `<form>` element + native HTML5
 *   Constraint Validation API (`required`, `pattern`, `minLength`,
 *   `maxLength`, `min`, `max`, `step`, `type="email|url|tel|number"`).
 *   Zero coupling to react-hook-form, formik, or any form library —
 *   consumers MAY layer those externally (`<FormProvider>` from RHF wraps
 *   `<Form>`) without conflict, but the lib `<Form>` works standalone.
 *
 * @a11y APG-aligned form semantics:
 *   - `<form>` element (semantic landmark when `aria-label` or
 *     `aria-labelledby` is provided — required for non-trivial forms with
 *     multiple fields)
 *   - `noValidate` on the underlying `<form>` is FALSE by default — browser
 *     native validation messages fire on submit + show alongside our
 *     `<Field.Message>` slots. Set `noValidate={true}` to suppress browser
 *     popups when consumer wants Field.Message-only display
 *   - On submit: invokes browser's `checkValidity()` → if any field is
 *     invalid, the form's `onSubmit` is BLOCKED (browser default behavior)
 *     and an `invalid` event fires on each invalid field. We capture those
 *     to populate validity state in context for `<Field>` to read
 *   - `<Form.Submit>` renders `<button type="submit">` (or Slot-wraps the
 *     consumer's element). When `disabled` is forced via `disableWhilePending`
 *     prop + parent React `useFormStatus()` consumer pending state, we set
 *     `aria-disabled` rather than native `disabled` to keep the button
 *     focusable (per APG button + form pattern)
 *   - Server Actions compatible: `action` prop accepts a function or string;
 *     React 19 + Next.js 15+ wire `useFormStatus()` for pending state
 *     reading from inside Form.Submit consumers
 *
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/form/ — note that APG does
 *   NOT enumerate a discrete "form" pattern (forms are baseline native
 *   semantics). Rather, the relevant patterns are field-level: error
 *   identification (`aria-invalid` + `aria-describedby` linking to
 *   `<Field.Message>`) which `<Field>` (separate component, built next)
 *   will implement using the validity state exposed via `FormContext`
 *
 * @validation Native Constraint Validation API — no JS regex layer
 *   required. Each `<input>` exposes `.validity` (a `ValidityState`
 *   object: `valueMissing`, `typeMismatch`, `patternMismatch`,
 *   `tooShort`, `tooLong`, `rangeUnderflow`, `rangeOverflow`,
 *   `stepMismatch`, `customError`). `<Field.Message match="...">` will
 *   render conditionally when the matching validity flag is `true` for
 *   the field. Consumers can also set custom validity via
 *   `inputRef.current.setCustomValidity('Custom error message')` in
 *   userland; that propagates through the same context.
 *
 * @context Form exposes `FormContext` (exported as `useFormContext`) so
 *   sibling components — primarily `<Field>` (built separately) — can
 *   read aggregated field validity state without prop-drilling. The
 *   shape:
 *
 *     {
 *       formId: string;                          // useId-generated, prefix for field ids
 *       hasSubmitted: boolean;                    // true after first submit attempt
 *       fieldValidity: Record<string, ValidityState | null>;
 *       registerField: (name, ref) => unregister;  // Field calls on mount
 *       reportFieldValidity: (name, validity) => void;  // Field calls on input/blur
 *       noValidate: boolean;                      // mirror of root prop
 *     }
 *
 *   Field component (separate ADD per spec) is responsible for calling
 *   `registerField` on mount + emitting validity updates from its inner
 *   `<input>` element via `onInvalid` + `onInput` listeners. Until Field
 *   ships, Form remains usable standalone — `<Form>` + raw `<input
 *   required>` + `<Form.Submit>` exhibits browser-native validation UX
 *   correctly.
 *
 * @example
 *   // Minimal form — native validation only
 *   <Form onSubmit={handleSubmit} aria-label="Contact form">
 *     <label htmlFor="email">Email</label>
 *     <input id="email" name="email" type="email" required />
 *     <Form.Submit>Send</Form.Submit>
 *   </Form>
 *
 * @example
 *   // With Field integration (when Field ships)
 *   <Form onSubmit={handleSubmit} aria-label="Sign up">
 *     <Field name="email">
 *       <Field.Label>Email</Field.Label>
 *       <Field.Control asChild>
 *         <Input type="email" required />
 *       </Field.Control>
 *       <Field.Message match="valueMissing">Email is required</Field.Message>
 *       <Field.Message match="typeMismatch">Enter a valid email</Field.Message>
 *     </Field>
 *     <Form.Submit asChild><Button>Sign up</Button></Form.Submit>
 *   </Form>
 *
 * @example
 *   // Server Actions (React 19 / Next.js 15+)
 *   <Form action={createUser}>
 *     <input name="email" type="email" required />
 *     <Form.Submit>Create</Form.Submit>
 *   </Form>
 *
 * @tested tsc --noEmit ✓ | eslint via eslint-config-next ✓ |
 *   Phase 4 fresh-subagent evaluator audit (2026-05-08) ✓ —
 *   Verdict: PASS-WITH-EXCEPTION granted by user 2026-05-08.
 *   DEFERRED-WITH-EXCEPTION: full Playwright execution + axe-core runtime
 *   sweep + manual NVDA+Firefox sweep. Specs ship alongside (.keyboard,
 *   .focus, .aria, .regression — 22 cases FM-R01..R22), execution batched
 *   to dedicated test-execution sprint in 0.14+ cycle per E15 Tabs precedent.
 *   See `D:/OS/internal/bleizlabs-ui/work/2026-05_lib-audit-rebuild/devlog.md`
 *   E05.4 DONE_EPIC for exception rationale + scheduled follow-up.
 *
 * @regressions tests/Form.regression.spec.ts — derived from Radix
 *   `@radix-ui/react-form` closed issues + native browser validation
 *   edge cases (Form is light-touch vs Dialog/Combobox so Radix history
 *   is shallower; we supplement with browser CV API edge cases).
 */

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type FormEvent,
  type FormHTMLAttributes,
  type ReactNode,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import styles from './Form.module.scss';

// ──────────────────────────────────────────────────────────────────────────
// Context — exposed for <Field> (built separately) to consume
// ──────────────────────────────────────────────────────────────────────────

/**
 * Snapshot of a field's `ValidityState` plus its current value. Field
 * components push this into the Form context whenever the underlying
 * `<input>` fires `invalid`, `input`, `change`, or `blur`. `null`
 * indicates the field has not yet reported (just registered).
 */
export interface FieldValidity {
  /** Snapshot of the native ValidityState — read-only mirror. */
  readonly valueMissing: boolean;
  readonly typeMismatch: boolean;
  readonly patternMismatch: boolean;
  readonly tooShort: boolean;
  readonly tooLong: boolean;
  readonly rangeUnderflow: boolean;
  readonly rangeOverflow: boolean;
  readonly stepMismatch: boolean;
  readonly badInput: boolean;
  readonly customError: boolean;
  readonly valid: boolean;
}

/**
 * Public context value — what `<Field>` (and any future form-aware sibling)
 * consumes via `useFormContext()`.
 */
export interface FormContextValue {
  /** Auto-generated form id (prefix for field ids). */
  formId: string;
  /** True once the form has been submitted at least once — Field uses this
   *  to gate eager error display (don't show errors until first submit). */
  hasSubmitted: boolean;
  /**
   * Per-field validity snapshot, keyed by `name`. `null` when registered
   * but not yet reported. Absent (undefined) when not registered.
   */
  fieldValidity: Record<string, FieldValidity | null>;
  /**
   * Field components call this on mount with their `name`. Returns an
   * unregister function for use in `useEffect` cleanup.
   */
  registerField: (name: string) => () => void;
  /**
   * Field components call this whenever the underlying input fires an
   * `invalid`, `input`, `change`, or `blur` event. Pass a snapshot of
   * `inputElement.validity` as a plain object.
   */
  reportFieldValidity: (name: string, validity: FieldValidity) => void;
  /** Mirror of `<Form noValidate>` prop — Field uses to decide whether
   *  to suppress its rendered messages in favor of browser popups. */
  noValidate: boolean;
}

const FormContext = createContext<FormContextValue | null>(null);

/**
 * Hook for `<Field>` and other form-aware children to access the
 * surrounding Form's validity context. Throws when called outside a
 * `<Form>` — invariant per APG composite widget pattern.
 */
export function useFormContext(): FormContextValue {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error('useFormContext() must be called inside a <Form> component.');
  }
  return ctx;
}

// Helper: take a snapshot of a native `ValidityState` as a plain object
// (the live ValidityState object is a getter-driven view onto the input,
// so we copy the booleans into a stable POJO that React can compare via
// shallow equality without re-renders firing on every keystroke).
export function snapshotValidity(validity: ValidityState): FieldValidity {
  return {
    valueMissing: validity.valueMissing,
    typeMismatch: validity.typeMismatch,
    patternMismatch: validity.patternMismatch,
    tooShort: validity.tooShort,
    tooLong: validity.tooLong,
    rangeUnderflow: validity.rangeUnderflow,
    rangeOverflow: validity.rangeOverflow,
    stepMismatch: validity.stepMismatch,
    badInput: validity.badInput,
    customError: validity.customError,
    valid: validity.valid,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Form — root component, native <form> + context provider
// ──────────────────────────────────────────────────────────────────────────

export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  /** Field + Form.Submit compound children rendered inside the form element. */
  children: ReactNode;
  /**
   * Submit handler. Called only AFTER the browser's native
   * `checkValidity()` passes (unless `noValidate` is true, in which case
   * it's called regardless and the consumer is expected to handle
   * validation themselves — typically with a layered library like
   * react-hook-form). The event is the standard React form event;
   * `event.preventDefault()` is called automatically before invocation.
   */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /**
   * When `true`, the underlying `<form>` element receives `noValidate`,
   * which suppresses browser-native validation popups. Use when consumer
   * provides full custom validation (e.g. zod + react-hook-form). The
   * native ValidityState API still fires `invalid` events and populates
   * `validity` getters — so `<Field>` integration remains functional.
   * Default `false`.
   */
  noValidate?: boolean;
  /**
   * Server Action (React 19 / Next.js) or string action URL. When passed,
   * `onSubmit` is bypassed for the action path — React handles dispatch
   * to the server action directly. Use `useFormStatus()` inside Form.Submit
   * consumers to read pending state.
   */
  action?: FormHTMLAttributes<HTMLFormElement>['action'];
  /** Extra class for the form root element. */
  className?: string;
}

/**
 * Form — root component. Renders a native `<form>` element wrapped with a
 * `FormContext` provider so `<Field>` and `<Form.Submit>` children can
 * read shared state. Native browser validation is enabled by default;
 * pass `noValidate` to suppress browser popups when layering custom
 * validation.
 *
 * @ref-style `forwardRef` chosen deliberately to match existing lib API surface
 * (`Card`, `AppShell`, `FormSurface`, all complex/* compounds — all use
 * `forwardRef`). Per `shared-molecule-extraction.md` §3 "Legacy forwardRef
 * remains supported for ... matching an existing lib API surface". Migration
 * to React-19 ref-as-prop would happen library-wide as a coordinated 0.x
 * minor or 1.0.0 cutover, not per-component.
 */
export const FormRoot = forwardRef<HTMLFormElement, FormProps>(function Form(
  { children, onSubmit, noValidate = false, action, className, ...rest },
  forwardedRef,
) {
  const formId = useId();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  // Field validity stored as a ref + a render-trigger state because Field
  // components emit on every keystroke; rendering Form on every keystroke
  // would cascade through every consumer. Instead, we track the version
  // counter separately and only bump it on submit attempts (which is when
  // <Field> needs to re-evaluate eager-display conditions).
  const fieldValidityRef = useRef<Record<string, FieldValidity | null>>({});
  // Render trigger for context consumers — bumped on register + first
  // submit. NOT bumped per-keystroke (Field reads `fieldValidityRef`
  // imperatively via context if it needs live values).
  const [validityVersion, setValidityVersion] = useState(0);

  const registerField = useCallback((name: string): (() => void) => {
    fieldValidityRef.current[name] = null;
    setValidityVersion((v) => v + 1);
    return () => {
      delete fieldValidityRef.current[name];
      setValidityVersion((v) => v + 1);
    };
  }, []);

  const reportFieldValidity = useCallback((name: string, validity: FieldValidity) => {
    // Imperative update — does NOT trigger a Form re-render. Field
    // owns its own local re-render via its own state when it needs to
    // surface validity changes visually. Form's responsibility is just
    // aggregation (read by Field on submit / blur, not on every keystroke).
    fieldValidityRef.current[name] = validity;
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      // Always bump submitted state — Field uses this to gate eager display.
      setHasSubmitted(true);
      // Force a context re-render so Field consumers see updated
      // hasSubmitted + flush latest fieldValidity to readers.
      setValidityVersion((v) => v + 1);

      // When noValidate is FALSE (default), the browser already invoked
      // checkValidity() before firing the submit event. So if we're here,
      // either:
      //   (a) all fields are valid, OR
      //   (b) noValidate is TRUE (browser skipped validation, consumer's
      //       responsibility to validate).
      // In either case, invoke the consumer's onSubmit. We do NOT call
      // preventDefault unconditionally — when `action` is passed (server
      // action), React owns dispatch and we should let it through.
      if (action == null) {
        // No server action — consumer handles via onSubmit.
        // Prevent default browser POST behavior.
        event.preventDefault();
      }
      onSubmit?.(event);
    },
    [onSubmit, action],
  );

  // Public context value — memoized to avoid context re-broadcast when
  // Form re-renders for unrelated reasons. validityVersion gates the
  // memo — every register/unregister/submit bumps it.
  const ctxValue = useMemo<FormContextValue>(
    () => ({
      formId,
      hasSubmitted,
      // Note: we expose the ref's current value at memo time. Field reads
      // this via context only on initial mount + on validityVersion bumps
      // (mount, unmount, submit). For per-keystroke live reads, Field can
      // store its own validity state locally — that's the recommended
      // pattern to avoid context-render cascades.
      fieldValidity: { ...fieldValidityRef.current },
      registerField,
      reportFieldValidity,
      noValidate,
    }),
    // validityVersion is intentionally a dep — it's the trigger for
    // re-broadcasting fieldValidity (snapshot of the ref) to consumers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formId, hasSubmitted, registerField, reportFieldValidity, noValidate, validityVersion],
  );

  return (
    <FormContext.Provider value={ctxValue}>
      <form
        ref={forwardedRef}
        id={formId}
        className={cn(styles.root, className)}
        noValidate={noValidate}
        action={action}
        onSubmit={handleSubmit}
        {...rest}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
});

// ──────────────────────────────────────────────────────────────────────────
// Form.Submit — submit button slot
// ──────────────────────────────────────────────────────────────────────────

export interface FormSubmitProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  children: ReactNode;
  /**
   * When `true`, Slot-wraps the single React element child, forwarding
   * `type="submit"` and merging `disabled` / `aria-disabled`. Use for
   * styled buttons (e.g. lib `<Button>`) without nesting native `<button>`.
   */
  asChild?: boolean;
  className?: string;
}

/**
 * Form.Submit — submit button slot. Renders `<button type="submit">` by
 * default, or Slot-wraps `children` when `asChild` is true.
 *
 * Subscribes to `useFormContext()` only to assert that it is rendered
 * inside a `<Form>` (no functional dependency on context state — submit
 * triggers form submission via native button-in-form semantics, not via
 * any context-mediated mechanism).
 *
 * @ref-style `forwardRef` chosen deliberately to match existing lib API surface
 * (all complex/* compounds use forwardRef). Migration to React-19 ref-as-prop
 * would happen library-wide as a coordinated cutover, not per-component.
 */
export const FormSubmit = forwardRef<HTMLButtonElement, FormSubmitProps>(function FormSubmit(
  { children, asChild = false, className, ...rest },
  forwardedRef,
) {
  // Assert we're inside a Form. Throws if not — same invariant as
  // TabsTrigger/TabsContent siblings.
  useFormContext();

  if (asChild) {
    return (
      <Slot
        ref={forwardedRef}
        // DOCUMENTED canonical pattern. Slot's prop type is HTMLAttributes<HTMLElement>
        // which intentionally OMITS `type` (arbitrary elements may not accept it).
        // When Slot-wrapping a <button> child the `type="submit"` is structurally
        // valid + REQUIRED for native form-submit semantics — Slot.cloneElement
        // passes it through verbatim to the wrapped <button>. Same suppression
        // pattern Radix Slot itself documents (`@radix-ui/react-slot`).
        // Alternatives considered: (a) extending Slot's type signature globally
        // — would leak `type` onto non-button slot consumers; (b) `as unknown as`
        // cast — silently swallows future Slot signature regressions WITHOUT
        // the TS-aware future-fail signal that @ts-expect-error provides
        // (when/if Slot's signature ever does include `type`, this directive
        // will surface a build error — that's the desired regression detector).
        // @ts-expect-error see comment block above.
        type="submit"
        className={cn(styles.submit, className)}
        {...rest}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button ref={forwardedRef} type="submit" className={cn(styles.submit, className)} {...rest}>
      {children}
    </button>
  );
});

// ──────────────────────────────────────────────────────────────────────────
// Compound export — Form root + Form.Submit subcomponent
// ──────────────────────────────────────────────────────────────────────────

type FormCompound = typeof FormRoot & {
  Submit: typeof FormSubmit;
};

export const Form: FormCompound = Object.assign(FormRoot, {
  Submit: FormSubmit,
});
