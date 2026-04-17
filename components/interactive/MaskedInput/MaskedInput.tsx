'use client';

import {
  forwardRef,
  useId,
  useMemo,
  useState,
  type InputHTMLAttributes,
} from 'react';
import { cn } from '@/components/utils/cn';
import { Label } from '@/components/interactive/Label';
import {
  applyMask,
  countPlaceholders,
  maskMaxLength,
  unmask,
  MASK_PRESETS,
  type MaskPreset,
} from '@/components/utils/masks';
import styles from './MaskedInput.module.scss';

/**
 * MaskedInput — pattern-masked text input (Phase 4 expansion E08, Layer 3 of D26).
 *
 * @layer   atom (interactive)
 * @tokens  --input-bg, --input-border, --input-border-focus,
 *          --color-error, --color-text-primary, --color-text-muted,
 *          --focus-ring, --focus-ring-error (both consumed via
 *          `@include mx.focus-ring*`), --radius-input, --space-{2..4},
 *          --font-secondary, --font-size-{xs,base}, --font-weight-medium,
 *          --line-height-normal, --duration-fast, --easing-default.
 *          `tabular-nums` is a CSS keyword for font-variant-numeric
 *          (intentional — stable digit width for mask alignment), not
 *          a design token.
 * @deps    Label atom, cn, `masks.ts` (applyMask, unmask, countPlaceholders,
 *          maskMaxLength, MASK_PRESETS, MaskPreset type), React:
 *          `forwardRef`, `useId`, `useMemo`, `useState`, type import
 *          `InputHTMLAttributes<HTMLInputElement>`
 * @a11y    Native `<input type="text" inputmode="numeric">` when the
 *          active mask is all-digit (common case: NIP, PESEL, postcode,
 *          credit card, date, phone) — gives mobile users the numeric
 *          keypad without forcing `type="number"` (which would conflict
 *          with our formatting). Falls back to `inputmode="text"` for
 *          alphanumeric masks. `aria-invalid` set when error provided.
 *          `aria-describedby` links error + helper. `id` ↔ `htmlFor`
 *          Label coupling via `useId`.
 * @notes   Client Component (`'use client'`) — manages display state
 *          internally. `value` and `onValueChange` operate on the
 *          FORMATTED string (what the user sees) so controlled consumers
 *          can display exactly what's in the field. For backend
 *          submission, call `unmask(value, mask)` from `masks.ts` to
 *          extract just the placeholder-filling characters.
 *
 *          Mask syntax (see `masks.ts`):
 *          - `#` — single digit (0-9)
 *          - `A` — single letter (a-z, A-Z)
 *          - `*` — single alphanumeric
 *          - `\` — escape next char (literal `#`/`A`/`*`)
 *          - any other char — literal, auto-inserted
 *
 *          Use a `preset` string (e.g., `'nipPL'`, `'postcodePL'`) for
 *          common Polish/US patterns, or pass a raw `mask` string for
 *          custom formats. Presets are re-exported as `MASK_PRESETS`
 *          from `@/components/utils/masks` for external reuse.
 *
 *          **Preset vs raw mask precedence:** when both `preset` and
 *          `mask` are passed, `preset` wins. (PhoneInput reverses this
 *          to let `mask` win as an escape hatch for unsupported country
 *          formats — see PhoneInput @notes.)
 *
 *          **`inputMode` override via spread:** the component computes
 *          a default `inputMode` (`"numeric"` for all-digit masks,
 *          `"text"` otherwise). This default is INTENTIONALLY
 *          overridable via the prop spread so specialized wrappers
 *          like PhoneInput can force `inputMode="tel"` without
 *          reimplementing the mask walker. Consumers passing
 *          `inputMode` directly get the same override behavior — it's
 *          an escape hatch, not dead code.
 *
 *          Paste support: pasting a pre-formatted value (e.g.,
 *          `123-45-6789`) into a mask (`###-##-####`) works — the mask
 *          walker skips non-matching chars and consumes matching
 *          literals.
 *
 * @example
 * // Polish NIP (tax ID)
 * <MaskedInput
 *   label="NIP"
 *   name="nip"
 *   preset="nipPL"
 *   value={nip}
 *   onValueChange={setNip}
 * />
 *
 * // Polish postcode
 * <MaskedInput
 *   label="Kod pocztowy"
 *   name="postcode"
 *   preset="postcodePL"
 *   placeholder="__-___"
 * />
 *
 * // Custom mask
 * <MaskedInput
 *   label="Credit card"
 *   name="card"
 *   mask="#### #### #### ####"
 *   placeholder="____ ____ ____ ____"
 * />
 *
 * // Date DD.MM.YYYY
 * <MaskedInput label="Date of birth" name="dob" preset="datePL" />
 */
export interface MaskedInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'pattern'
  > {
  /** Visible label text. */
  label: string;
  /** Form field name. */
  name: string;
  /**
   * Mask pattern (raw). See `masks.ts` for syntax. Mutually exclusive
   * with `preset` — if both are passed, `preset` wins.
   */
  mask?: string;
  /**
   * Preset name from `MASK_PRESETS` (`nipPL`, `peselPL`, `postcodePL`,
   * `creditCard`, `datePL`, `dateUS`, `dateISO`, `time24`, `phonePL`,
   * `phoneUS`, etc.).
   */
  preset?: MaskPreset;
  /** Controlled formatted value. */
  value?: string;
  /** Uncontrolled initial formatted value. */
  defaultValue?: string;
  /**
   * Fires with the formatted string whenever the user types. Consumers
   * who need just the raw digits can call `unmask(value, mask)` from
   * `@/components/utils/masks`.
   */
  onValueChange?: (formatted: string) => void;
  /** Error message — renders below input + sets `aria-invalid`. */
  error?: string;
  /** Helper text — renders below input when no error. */
  helperText?: string;
  /** Hide visible label (still in a11y tree). Default `false`. */
  hideLabel?: boolean;
}

/**
 * Determine the best `inputmode` for a mask. Used to hint mobile
 * keyboards without forcing `type="number"` or other conflicting types.
 */
function inputModeForMask(mask: string): 'numeric' | 'text' {
  // If every placeholder in the mask is a digit slot, numeric keypad.
  // Any `A` or `*` placeholder → fall back to text keyboard.
  let hasNonDigit = false;
  let escaped = false;
  for (let i = 0; i < mask.length; i++) {
    const ch = mask[i]!;
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === 'A' || ch === '*') {
      hasNonDigit = true;
      break;
    }
  }
  return hasNonDigit ? 'text' : 'numeric';
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  function MaskedInput(
    {
      label,
      name,
      mask: rawMask,
      preset,
      value: controlledValue,
      defaultValue,
      onValueChange,
      error,
      helperText,
      hideLabel = false,
      required,
      disabled,
      id,
      placeholder,
      className,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? `${name}-${generatedId}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText && !error ? `${inputId}-helper` : undefined;
    const describedBy = errorId ?? helperId;

    // Resolve the active mask: preset wins over raw mask if both given.
    const mask = useMemo(() => {
      if (preset) return MASK_PRESETS[preset];
      return rawMask ?? '';
    }, [preset, rawMask]);

    const isControlled = controlledValue !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<string>(() => {
      if (defaultValue == null) return '';
      return applyMask(defaultValue, mask).formatted;
    });
    const currentValue = isControlled ? controlledValue : uncontrolledValue;

    const inputMode = useMemo(() => inputModeForMask(mask), [mask]);
    const maxLen = useMemo(() => {
      // max formatted length = mask length with `\X` escape sequences
      // collapsed to their output char (each `\X` produces 1 output char,
      // not 2). Calling this helper instead of `mask.length` avoids
      // over-allowing typed characters for escaped masks.
      const len = maskMaxLength(mask);
      return len > 0 ? len : undefined;
    }, [mask]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      const { formatted } = applyMask(raw, mask);
      if (!isControlled) setUncontrolledValue(formatted);
      onValueChange?.(formatted);
    };

    return (
      <div className={cn(styles.field, disabled && styles.fieldDisabled, className)}>
        <Label
          htmlFor={inputId}
          required={required}
          disabled={disabled}
          className={hideLabel ? styles.srOnly : undefined}
        >
          {label}
        </Label>
        <div className={cn(styles.inputWrap, error && styles.inputWrapError)}>
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="text"
            inputMode={inputMode}
            required={required}
            disabled={disabled}
            maxLength={maxLen}
            placeholder={placeholder}
            value={currentValue}
            onChange={handleChange}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={styles.input}
            {...rest}
          />
        </div>
        {error ? (
          <p id={errorId} className={styles.error} role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className={styles.helper}>
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

// Re-export the mask utility helpers so consumers can import them from
// the same module as the component.
export { applyMask, unmask, countPlaceholders, MASK_PRESETS };
export type { MaskPreset };
