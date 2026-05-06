'use client';

import { forwardRef } from 'react';
import { MaskedInput, type MaskedInputProps } from '../MaskedInput';
import { MASK_PRESETS, type MaskPreset } from '../../utils/masks';
import { useResolvedLocale } from '../../utils/locale';
import { cn } from '../../utils/cn';
import styles from './PhoneInput.module.scss';

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
 *          - `phonePL`: `+48 ### ### ###`
 *          - `phoneUS`: `+1 (###) ###-####`
 *          - `phoneE164`: `+## ### ### ###` (generic fallback)
 *
 *          Default behavior (v0.7.0+): when neither `preset` nor `mask`
 *          is passed, the preset is derived from `navigator.language`
 *          via `useResolvedLocale`:
 *          - `pl-*` → `phonePL`
 *          - `en-US`/`en-CA` → `phoneUS`
 *          - everything else (incl. SSR baseline) → `phoneE164`
 *
 *          For other countries, pass a raw `mask` prop (e.g.,
 *          `+44 #### ### ####` for UK) — accepts any valid mask
 *          pattern from `masks.ts`. Consumers who want stable PL
 *          formatting regardless of browser locale should pass
 *          `preset="phonePL"` explicitly.
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
export type PhonePreset = Extract<MaskPreset, 'phonePL' | 'phoneUS' | 'phoneE164'>;

export interface PhoneInputProps
  extends Omit<MaskedInputProps, 'preset' | 'mask' | 'label'> {
  /** Visible label text. Default used by consumers: `"Telefon"` / `"Phone"`. */
  label: string;
  /**
   * Phone mask preset. When omitted, derived from `navigator.language`
   * (PL → `phonePL`, US/CA → `phoneUS`, otherwise → `phoneE164`). SSR
   * baseline is `phoneE164`.
   */
  preset?: PhonePreset;
  /**
   * Raw mask pattern — escape hatch for country formats not covered
   * by a preset (e.g., `+44 #### ### ####`). Mutually exclusive with
   * `preset`; when both are passed, `mask` wins.
   */
  mask?: string;
}

function presetFromLocale(locale: string): PhonePreset {
  // BCP 47 lang-region. Lowercase region for case-insensitive match.
  const region = locale.split('-')[1]?.toUpperCase();
  const lang = locale.split('-')[0]?.toLowerCase();
  if (lang === 'pl') return 'phonePL';
  if (region === 'US' || region === 'CA') return 'phoneUS';
  return 'phoneE164';
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput({ preset, mask, className, ...rest }, ref) {
    const locale = useResolvedLocale();
    // Resolve mask: raw `mask` prop wins over preset (escape hatch).
    // When neither passed, derive preset from runtime locale.
    const resolvedPreset = preset ?? presetFromLocale(locale);
    const resolvedMask = mask ?? MASK_PRESETS[resolvedPreset];
    return (
      <MaskedInput
        ref={ref}
        mask={resolvedMask}
        inputMode="tel"
        autoComplete="tel"
        className={cn(styles.root, className)}
        {...rest}
      />
    );
  },
);
