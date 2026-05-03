/**
 * Mask utilities for MaskedInput / PhoneInput (E08 D26 Layer 3).
 *
 * Pure functions — zero deps, server-safe. Pattern syntax:
 *
 *   `#`  — single digit (0-9)
 *   `A`  — single letter (a-z, A-Z)
 *   `*`  — single alphanumeric (0-9, a-z, A-Z)
 *   `\`  — escape next char (rare; allows literal `#`/`A`/`*` in mask)
 *   any other char (`-`, ` `, `.`, `(`, `)`, `+`) — literal, auto-inserted
 *
 * Examples:
 *   `###-##-####`              → SSN style: `123-45-6789`
 *   `##-###`                   → PL postcode: `12-345`
 *   `###-###-##-##`            → PL NIP: `123-456-78-90`
 *   `###########`              → PL PESEL: `12345678901` (11 digits, no separators)
 *   `#### #### #### ####`      → credit card: `1234 5678 9012 3456`
 *   `##.##.####`               → date DD.MM.YYYY: `15.04.2026`
 *   `+48 ### ### ###`          → PL phone: `+48 123 456 789`
 *   `+1 (###) ###-####`        → US phone: `+1 (415) 555-1234`
 *
 * Two values to think about:
 *   - "raw" — only the user-typed characters that fill placeholder slots,
 *     no literals (e.g., `1234567890` for `###-###-##-##` mask).
 *   - "formatted" — the full string with literals inserted (e.g.,
 *     `123-456-78-90`).
 *
 * The component's controlled `value` prop is the FORMATTED string (what
 * the user sees) — consumers can call `unmask(value, mask)` to extract
 * the raw value if they need to submit just the digits.
 */

const PLACEHOLDER_DIGIT = '#';
const PLACEHOLDER_LETTER = 'A';
const PLACEHOLDER_ALNUM = '*';
const ESCAPE_CHAR = '\\';

function isPlaceholder(ch: string): boolean {
  return (
    ch === PLACEHOLDER_DIGIT ||
    ch === PLACEHOLDER_LETTER ||
    ch === PLACEHOLDER_ALNUM
  );
}

function matchesPlaceholder(input: string, placeholder: string): boolean {
  if (placeholder === PLACEHOLDER_DIGIT) return /[0-9]/.test(input);
  if (placeholder === PLACEHOLDER_LETTER) return /[a-zA-Z]/.test(input);
  if (placeholder === PLACEHOLDER_ALNUM) return /[0-9a-zA-Z]/.test(input);
  return false;
}

/**
 * Walk the mask alongside user-typed input. For each mask position:
 *   - placeholder + matching input char → consume input, write char
 *   - placeholder + non-matching input → consume input (skip it),
 *     stop here; the mask cannot proceed past an invalid char
 *   - literal mask char → write literal, do NOT consume input unless
 *     the user typed exactly the same literal (then consume it too)
 *
 * Returns the formatted output and an `unmasked` companion for parity
 * with `unmask()`.
 */
export interface MaskResult {
  /** Formatted string with mask literals inserted. */
  formatted: string;
  /** Raw user-typed characters with no literals. */
  unmasked: string;
  /** True if the input fills every placeholder slot in the mask. */
  complete: boolean;
}

export function applyMask(rawInput: string, mask: string): MaskResult {
  if (!mask) {
    return { formatted: rawInput, unmasked: rawInput, complete: false };
  }

  let formatted = '';
  let unmasked = '';
  let inputIdx = 0;
  let escaped = false;

  for (let maskIdx = 0; maskIdx < mask.length; maskIdx++) {
    const maskCh = mask[maskIdx]!;

    if (escaped) {
      // Literal escaped char — always write, consume matching input.
      formatted += maskCh;
      if (rawInput[inputIdx] === maskCh) inputIdx++;
      escaped = false;
      continue;
    }

    if (maskCh === ESCAPE_CHAR) {
      escaped = true;
      continue;
    }

    if (isPlaceholder(maskCh)) {
      // Look for the next valid input character. Skip user-typed
      // literals that happen to match upcoming mask literals (so paste
      // of a pre-formatted value works).
      while (inputIdx < rawInput.length && !matchesPlaceholder(rawInput[inputIdx]!, maskCh)) {
        inputIdx++;
      }
      if (inputIdx >= rawInput.length) {
        // Out of input — stop accumulating (formatted ends here, no
        // trailing literal padding so the cursor stays at the
        // expected typing position).
        break;
      }
      const ch = rawInput[inputIdx]!;
      formatted += ch;
      unmasked += ch;
      inputIdx++;
    } else {
      // Literal mask char — write it. If user typed the same literal
      // here, consume it (paste of pre-formatted value).
      formatted += maskCh;
      if (rawInput[inputIdx] === maskCh) inputIdx++;
    }
  }

  // Count required placeholder slots to determine completion.
  const placeholderCount = countPlaceholders(mask);
  const complete = unmasked.length >= placeholderCount;

  return { formatted, unmasked, complete };
}

/**
 * Strip mask literals from a formatted value, returning only the raw
 * placeholder-filling characters. Useful when consumers want to submit
 * just the digits to a backend.
 */
export function unmask(formatted: string, mask: string): string {
  if (!mask) return formatted;
  const result = applyMask(formatted, mask);
  return result.unmasked;
}

/**
 * Count how many placeholder slots a mask has. Used to determine when a
 * masked input is "complete" (all slots filled).
 */
export function countPlaceholders(mask: string): number {
  let count = 0;
  let escaped = false;
  for (let i = 0; i < mask.length; i++) {
    const ch = mask[i]!;
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === ESCAPE_CHAR) {
      escaped = true;
      continue;
    }
    if (isPlaceholder(ch)) count++;
  }
  return count;
}

/**
 * Maximum formatted-output length for a mask. Subtracts escape
 * characters from the raw string length because each `\X` sequence
 * produces a single output char, not two. Used for the `maxLength`
 * DOM-level overtyping guard in MaskedInput.
 */
export function maskMaxLength(mask: string): number {
  let len = 0;
  let escaped = false;
  for (let i = 0; i < mask.length; i++) {
    const ch = mask[i]!;
    if (escaped) {
      len++;
      escaped = false;
      continue;
    }
    if (ch === ESCAPE_CHAR) {
      escaped = true;
      continue;
    }
    len++;
  }
  return len;
}

/**
 * Common mask presets reused by PhoneInput and consumer convenience.
 */
export const MASK_PRESETS = {
  /** Polish phone number with country code: `+48 123 456 789` */
  phonePL: '+48 ### ### ###',
  /** US phone number: `+1 (123) 456-7890` */
  phoneUS: '+1 (###) ###-####',
  /**
   * Generic E.164 phone fallback: `+## ### ### ###`. Used by PhoneInput
   * when no preset is specified and `navigator.language` resolves to a
   * country without a dedicated preset (any non-PL/non-US locale, plus
   * the deterministic SSR baseline).
   */
  phoneE164: '+## ### ### ###',
  /** Polish postcode: `12-345` */
  postcodePL: '##-###',
  /** Polish NIP (tax ID): `123-456-78-90` */
  nipPL: '###-###-##-##',
  /** Polish PESEL (national ID): 11 digits no separators */
  peselPL: '###########',
  /** Polish REGON (business ID): 9 digits no separators */
  regonPL: '#########',
  /** Credit card 16 digits with spaces: `1234 5678 9012 3456` */
  creditCard: '#### #### #### ####',
  /** Date DD.MM.YYYY: `15.04.2026` */
  datePL: '##.##.####',
  /** Date MM/DD/YYYY: `04/15/2026` */
  dateUS: '##/##/####',
  /** ISO date YYYY-MM-DD: `2026-04-15` */
  dateISO: '####-##-##',
  /** Time HH:MM: `14:30` */
  time24: '##:##',
} as const;

export type MaskPreset = keyof typeof MASK_PRESETS;
