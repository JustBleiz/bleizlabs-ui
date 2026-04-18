'use client';

import {
  forwardRef,
  useId,
  useMemo,
  useState,
  type InputHTMLAttributes,
} from 'react';
import { cn } from '../../utils/cn';
import { Label } from '../Label';
import styles from './NumberInput.module.scss';

/**
 * NumberInput — locale-aware numeric form input (Phase 4 expansion E08, Layer 3 of D26).
 *
 * @layer   atom (interactive)
 * @tokens  --input-bg, --input-border, --input-border-focus,
 *          --input-addon-bg, --input-addon-text, --input-addon-border,
 *          --color-error, --color-text-primary, --color-text-muted,
 *          --color-text-secondary, --focus-ring, --focus-ring-error,
 *          --radius-input, --space-{2..4}, --font-secondary,
 *          --font-size-{xs,base}, --font-variant-numeric, --duration-fast,
 *          --easing-default
 * @deps    Label atom, cn, native `Intl.NumberFormat` (Baseline since 2017),
 *          React: `forwardRef`, `useId`, `useMemo`, `useState`, type import
 *          `InputHTMLAttributes<HTMLInputElement>`
 * @a11y    Native `<input type="text" inputmode="decimal">` (NOT
 *          `type="number"` — we own formatting and don't want the
 *          browser's native spinner conflicting with our locale display).
 *          `inputmode="decimal"` gives mobile users the numeric keypad.
 *          `aria-invalid` set when `error` provided. `aria-describedby`
 *          links error + helper. `id` ↔ `htmlFor` Label coupling auto-
 *          generated via `useId`. The `currency` prop is rendered as a
 *          visible suffix addon (NOT aria-hidden) so SR users hear "PLN"
 *          alongside the value.
 * @notes   Client Component (`'use client'`) — manages controlled vs
 *          uncontrolled state via `value: number | undefined` /
 *          `defaultValue: number | undefined`. **Important: value is a
 *          NUMBER**, not a string — consumers don't have to parse the
 *          formatted display.
 *
 *          Display vs raw value:
 *          - On blur (and at initial render): formatted via
 *            `Intl.NumberFormat(locale, { minimumFractionDigits, ... })`
 *            with locale separators (PL: `1 234,56`, US: `1,234.56`).
 *          - On focus: shows the raw editable value with a single decimal
 *            point regardless of locale (`1234.56`) so the user can type
 *            without fighting the formatter.
 *          - `onValueChange(next)` fires whenever the parsed numeric
 *            value changes — passes `undefined` when the field is empty
 *            or the input doesn't parse.
 *
 *          Min/max enforcement:
 *          - `min` and `max` clamp the parsed value on blur. Out-of-range
 *            values are silently clamped (we do NOT throw or refuse to
 *            update — consumers should display their own validation
 *            error via the `error` prop based on business rules).
 *          - `step` is currently a documentation-only hint (no spinner
 *            UI). Future enhancement.
 *
 *          Currency support:
 *          - When `currency` is set (e.g., `'PLN'`, `'USD'`, `'EUR'`),
 *            the formatter switches to `style: 'currency'` and the
 *            currency symbol is appended visually as a suffix (or
 *            prepended, depending on locale convention — PL puts `zł`
 *            after, EN puts `$` before).
 *          - When `currency` is undefined, plain decimal formatting.
 *          - **`currency` and `suffix` are mutually exclusive — when
 *            both are passed, `currency` wins** because Intl already
 *            owns the symbol positioning. The visible addon
 *            (`showSuffix = suffix && !currency`) only renders when
 *            `currency` is unset.
 *
 *          Locale defaults to `'pl-PL'` (project default). Override per
 *          field for multi-locale forms.
 *
 *          For non-numeric formatted inputs (NIP, PESEL, postcode,
 *          credit card), use `<MaskedInput>` instead.
 *
 * @example
 * <NumberInput
 *   label="Price"
 *   name="price"
 *   value={price}
 *   onValueChange={setPrice}
 *   currency="PLN"
 *   min={0}
 *   max={9999.99}
 * />
 *
 * <NumberInput
 *   label="Quantity"
 *   name="qty"
 *   defaultValue={1}
 *   min={1}
 *   max={100}
 *   decimals={0}
 * />
 *
 * <NumberInput
 *   label="Temperature"
 *   name="temp"
 *   value={temp}
 *   onValueChange={setTemp}
 *   suffix="°C"
 *   decimals={1}
 *   locale="en-US"
 * />
 */
export interface NumberInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'
  > {
  /** Visible label text. Renders a coupled `<Label htmlFor>` above the input. */
  label: string;
  /** Form field name (for native form submission via the formatted display value). */
  name: string;
  /** Controlled numeric value. Pass `undefined` for empty. */
  value?: number;
  /** Uncontrolled initial numeric value. */
  defaultValue?: number;
  /** Fires when the parsed numeric value changes (or becomes undefined when empty). */
  onValueChange?: (value: number | undefined) => void;
  /** Minimum allowed value (clamped on blur). */
  min?: number;
  /** Maximum allowed value (clamped on blur). */
  max?: number;
  /** Step hint (currently doc-only — no spinner UI). */
  step?: number;
  /**
   * Number of decimal places for display formatting. When `currency` is
   * set, defaults to 2 (currency convention). Otherwise defaults to 0
   * for integer-style display, but the underlying value can still hold
   * decimals (e.g., set `decimals={2}` for prices, `{0}` for counts).
   */
  decimals?: number;
  /**
   * ISO 4217 currency code (e.g., `'PLN'`, `'USD'`, `'EUR'`). When set,
   * Intl.NumberFormat switches to currency style and the currency
   * symbol is rendered visually per locale convention. Default decimals
   * becomes 2.
   */
  currency?: string;
  /**
   * BCP 47 locale string. Default `'pl-PL'`. Affects thousand separator,
   * decimal point, and currency symbol position.
   */
  locale?: string;
  /**
   * Plain text suffix addon (e.g., `°C`, `kg`, `%`). Mutually exclusive
   * with `currency` — currency display uses Intl's built-in symbol
   * positioning; for non-currency unit labels use this suffix.
   */
  suffix?: string;
  /** Error message — renders below input + sets `aria-invalid`. */
  error?: string;
  /** Helper text — renders below input when no error. */
  helperText?: string;
  /** Hide visible label (still in a11y tree). Default `false`. */
  hideLabel?: boolean;
}

function formatNumber(
  value: number | undefined,
  locale: string,
  decimals: number,
  currency?: string,
): string {
  if (value === undefined || Number.isNaN(value)) return '';
  const opts: Intl.NumberFormatOptions = currency
    ? {
        style: 'currency',
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }
    : {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      };
  try {
    return new Intl.NumberFormat(locale, opts).format(value);
  } catch {
    // Invalid locale or currency code — fall back to a plain decimal string
    // so we never throw during render. Consumers see the raw number until
    // they fix the locale prop.
    return value.toFixed(decimals);
  }
}

/**
 * Parse a user-typed string into a number. Handles both EU (`1.234,56`)
 * and US (`1,234.56`) formats heuristically by treating the LAST
 * comma-or-dot as the decimal separator and stripping all earlier
 * occurrences as thousand separators. Pasted values from either locale
 * round-trip correctly without locale-specific parser logic.
 */
function parseNumber(raw: string): number | undefined {
  if (raw === '' || raw == null) return undefined;
  // Strip currency symbols, whitespace, etc. — keep digits, comma, dot, minus.
  let cleaned = raw.replace(/[^\d,.\-]/g, '');
  if (cleaned === '' || cleaned === '-') return undefined;

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  if (lastComma > -1 && lastDot > -1) {
    // Both separators present — the LAST one is the decimal separator.
    if (lastComma > lastDot) {
      // EU format: "1.234,56" → strip thousand dots, swap decimal comma.
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: "1,234.56" → strip thousand commas, decimal dot stays.
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (lastComma > -1) {
    // Only commas. Disambiguate single comma at exactly 3-trailing-digit
    // position as US thousands ("1,234"); everything else as EU decimal.
    const afterComma = cleaned.length - lastComma - 1;
    const onlyOneComma = cleaned.indexOf(',') === lastComma;
    if (onlyOneComma && afterComma === 3) {
      cleaned = cleaned.replace(',', '');
    } else {
      // Multiple commas (all thousands) or single comma with non-3 trailing
      // (decimal). Strip all but last; swap last to dot.
      cleaned = cleaned.replace(/,(?=.*,)/g, '').replace(',', '.');
    }
  } else if (lastDot > -1) {
    // Only dots. Same disambiguation in mirror — if more than one dot,
    // they're all thousand separators except the last (which is decimal
    // ONLY if it has fewer than 3 trailing digits; otherwise it's also a
    // thousand separator and the value is an integer).
    const dotCount = (cleaned.match(/\./g) || []).length;
    if (dotCount > 1) {
      const afterLast = cleaned.length - lastDot - 1;
      if (afterLast === 3) {
        // All dots are thousand separators, value is integer.
        cleaned = cleaned.replace(/\./g, '');
      } else {
        // Last dot is decimal, earlier ones are thousands.
        cleaned =
          cleaned.substring(0, lastDot).replace(/\./g, '') +
          cleaned.substring(lastDot);
      }
    }
    // Single dot is already valid for parseFloat.
  }

  const parsed = Number.parseFloat(cleaned);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
}

function clampNumber(value: number, min?: number, max?: number): number {
  let next = value;
  if (min !== undefined && next < min) next = min;
  if (max !== undefined && next > max) next = max;
  return next;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(
    {
      label,
      name,
      value: controlledValue,
      defaultValue,
      onValueChange,
      min,
      max,
      step,
      decimals,
      currency,
      locale = 'pl-PL',
      suffix,
      error,
      helperText,
      hideLabel = false,
      required,
      disabled,
      id,
      className,
      onFocus: onFocusProp,
      onBlur: onBlurProp,
      ...rest
    },
    ref,
  ) {
    void step; // doc-only currently
    const generatedId = useId();
    const inputId = id ?? `${name}-${generatedId}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText && !error ? `${inputId}-helper` : undefined;
    const describedBy = errorId ?? helperId;

    const effectiveDecimals = decimals ?? (currency ? 2 : 0);
    const isControlled = controlledValue !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<number | undefined>(
      defaultValue,
    );
    const currentValue = isControlled ? controlledValue : uncontrolledValue;

    // `display` mirrors what's shown in the input. It's a string because
    // intermediate typed states may be unparseable (`-`, `1.`, `1.2.3`)
    // and we don't want to lose the user's input mid-keystroke.
    const formatted = useMemo(
      () => formatNumber(currentValue, locale, effectiveDecimals, currency),
      [currentValue, locale, effectiveDecimals, currency],
    );
    // v0.3.0 F_B3: derive display from props/state without setState during
    // render OR in a useEffect. `typedDisplay` holds the user-typed raw
    // string WHILE the user is interacting (focus/change); when it's
    // `null`, the pure-derived `formatted` value wins — which means any
    // controlled-value change from outside is reflected automatically.
    // On blur we reset typedDisplay to `null` so the library-formatted
    // string takes over. React's own docs recommend pure derivation for
    // "mirror a prop" cases: https://react.dev/learn/you-might-not-need-an-effect
    // Previous implementations either setState during render (anti-pattern)
    // or setState inside useEffect (flagged by react-hooks/set-state-in-effect).
    const [typedDisplay, setTypedDisplay] = useState<string | null>(null);
    const display = typedDisplay ?? formatted;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      setTypedDisplay(raw);
      const parsed = parseNumber(raw);
      if (!isControlled) setUncontrolledValue(parsed);
      onValueChange?.(parsed);
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      // Show raw value (no formatting) so user can edit cleanly. Use
      // toFixed instead of String() to avoid scientific notation
      // (e.g., 1e+21) for very large magnitudes — that notation would
      // confuse parseNumber on blur and silently corrupt the value.
      // toFixed handles the magnitude range typical for form inputs
      // (currency, counts, measurements, percentages).
      if (currentValue !== undefined) {
        setTypedDisplay(currentValue.toFixed(effectiveDecimals));
      }
      onFocusProp?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      // Clamp + reformat on blur.
      const parsed = parseNumber(display);
      if (parsed !== undefined) {
        const clamped = clampNumber(parsed, min, max);
        if (!isControlled) setUncontrolledValue(clamped);
        if (clamped !== currentValue) onValueChange?.(clamped);
        // Clear typedDisplay so the derived `display` falls back to the
        // library-formatted value. This guarantees the blur view always
        // matches the latest `formatted` (which reflects the clamped
        // controlled value after React re-renders).
        setTypedDisplay(null);
      } else {
        setTypedDisplay('');
        if (!isControlled) setUncontrolledValue(undefined);
        if (currentValue !== undefined) onValueChange?.(undefined);
      }
      onBlurProp?.(event);
    };

    const showSuffix = suffix && !currency;

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
        <div
          className={cn(
            styles.inputWrap,
            error && styles.inputWrapError,
            showSuffix && styles.hasSuffix,
          )}
        >
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="text"
            inputMode="decimal"
            required={required}
            disabled={disabled}
            value={display}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={styles.input}
            {...rest}
          />
          {showSuffix ? (
            <span className={styles.addonText} data-side="end">
              {suffix}
            </span>
          ) : null}
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
