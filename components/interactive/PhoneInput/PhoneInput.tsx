'use client';

import { forwardRef } from 'react';
import { MaskedInput, type MaskedInputProps } from '../MaskedInput';
import { MASK_PRESETS, type MaskPreset } from '../../utils/masks';

/**
 * PhoneInput — telephone number input with mask presets (Phase 4 expansion E08, Layer 3 of D26).
 *
 * @layer   atom (interactive)
 * @tokens  inherits from MaskedInput (same shell)
 * @deps    MaskedInput atom (MaskedInputProps type), `masks.ts`
 *          (MASK_PRESETS, MaskPreset type), React: `forwardRef`
 * @a11y    Uses native `<input type="tel">` semantics indirectly via
 *          MaskedInput's mask-driven formatting. The `inputmode="tel"`
 *          override ensures mobile users get the phone keypad even
 *          though the underlying input type is `text` (required so
 *          MaskedInput's formatting isn't blocked by `type="tel"`
 *          browser quirks). `aria-invalid`, `aria-describedby`, and
 *          label coupling come from MaskedInput.
 * @notes   Client Component (`'use client'`). Thin wrapper around
 *          `MaskedInput` with a phone preset default. Country code
 *          selector with flags is intentionally deferred to Phase 10
 *          (complex interactive — requires dropdown + list search +
 *          flag rendering, which exceeds atom scope).
 *
 *          Presets available:
 *          - `phonePL` (default): `+48 ### ### ###`
 *          - `phoneUS`: `+1 (###) ###-####`
 *
 *          For other countries, pass a raw `mask` prop (e.g.,
 *          `+44 #### ### ####` for UK) — accepts any valid mask
 *          pattern from `masks.ts`.
 *
 *          Value is the FORMATTED phone string (e.g., `+48 123 456 789`).
 *          To extract just the digits for backend submission, call
 *          `unmask(value, mask)` from `@/components/utils/masks`.
 *
 * @example
 * <PhoneInput
 *   label="Telefon"
 *   name="phone"
 *   value={phone}
 *   onValueChange={setPhone}
 * />
 *
 * <PhoneInput
 *   label="US phone"
 *   name="usPhone"
 *   preset="phoneUS"
 * />
 *
 * <PhoneInput
 *   label="UK phone"
 *   name="ukPhone"
 *   mask="+44 #### ### ####"
 * />
 */
export type PhonePreset = Extract<MaskPreset, 'phonePL' | 'phoneUS'>;

export interface PhoneInputProps
  extends Omit<MaskedInputProps, 'preset' | 'mask' | 'label'> {
  /** Visible label text. Default used by consumers: `"Telefon"` / `"Phone"`. */
  label: string;
  /**
   * Phone mask preset. Default `phonePL` (Polish `+48 ### ### ###`).
   * Other presets from `MASK_PRESETS` are rejected at the type level —
   * use the `mask` prop if you need a different country format.
   */
  preset?: PhonePreset;
  /**
   * Raw mask pattern — escape hatch for country formats not covered
   * by a preset (e.g., `+44 #### ### ####`). Mutually exclusive with
   * `preset`; when both are passed, `mask` wins.
   */
  mask?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput({ preset = 'phonePL', mask, ...rest }, ref) {
    // Resolve mask: raw `mask` prop wins over preset (escape hatch).
    const resolvedMask = mask ?? MASK_PRESETS[preset];
    return (
      <MaskedInput
        ref={ref}
        mask={resolvedMask}
        inputMode="tel"
        autoComplete="tel"
        {...rest}
      />
    );
  },
);
