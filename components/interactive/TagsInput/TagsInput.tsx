'use client';

/**
 * TagsInput — freeform tag input (E01.2 of 0.19.0 Forms expansion).
 *
 * Distinct from Combobox multi-mode: Combobox = select-from-list (popup with
 * registered items, filter/typeahead). TagsInput = freeform creation (no
 * popup, no item registry, no filtering — type and commit).
 *
 * @layer        interactive (Phase 10 complex interactive)
 * @apg          https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ (textbox semantics,
 *               adapted — no popup listbox here)
 *               https://react-spectrum.adobe.com/react-aria/TagGroup.html (chip group
 *               pattern reference)
 *               No direct APG "tags input" pattern — synthesized from textbox +
 *               role=list chip group + per-chip <button aria-label="Remove ...">
 * @tokens       --color-brand, --color-brand-subtle, --color-error, --color-error-subtle,
 *               --color-surface, --color-surface-muted, --color-border, --color-border-strong,
 *               --color-text-primary, --color-text-secondary, --color-text-muted,
 *               --radius-input, --radius-full, --radius-sm,
 *               --space-{1,2,3,4}, --duration-fast, --easing-default,
 *               --focus-ring, --focus-ring-error
 * @deps         cn (className util). ZERO external runtime deps.
 * @a11y         Wrapper `<div>` carries `:focus-within` for visual focus indication.
 *               Native `<input type="text">` is the typing surface — focusable, native form.
 *               Chip list is `role="list"` containing `role="listitem"` per chip; each chip
 *               has a real `<button aria-label="Remove {tag}">` for AT-accessible removal.
 *               Backspace on empty input removes the last chip (Combobox multi precedent).
 *               IME composition guard prevents Enter from committing during
 *               Japanese/Korean/Chinese composition. Live region announces
 *               "Added: {tag}" / "Removed: {tag}" / "Rejected: {reason}" with a
 *               zero-width counter marker so AT re-announces identical operations.
 *               Hidden `<input type="hidden" name>` carries delimited-string value
 *               for FormData multipart capture (Q1 (α) — `formData.get(name).split(',')`).
 * @budget       15 declared props — wide for Phase 10 organism budget (charter R2
 *               ≤3 ideal). Same waiver block as FileUpload: surface is the union of
 *               value management (value/defaultValue/onChange/onReject), validation
 *               (validate/maxTags/allowDuplicates/caseSensitive/trim), composition
 *               (delimiter/addOnBlur), form integration (name/required/disabled),
 *               and a11y (aria-label/labelledby/describedby/placeholder/size/invalid).
 *               Splitting into a compound would force consumers to write multiple
 *               elements where one suffices. v0.19 trade favours keep-as-one;
 *               future split considered only if validation surface grows further.
 *
 * @example
 *   <TagsInput
 *     value={tags}
 *     onChange={setTags}
 *     maxTags={5}
 *     placeholder="Add tags..."
 *     aria-label="Tags"
 *   />
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type CompositionEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './TagsInput.module.scss';

/**
 * Reason code for a rejected tag. Mirror of FileUpload's FileRejectionReason
 * shape — locale-translatable, no string parsing.
 */
export type TagRejectionReason =
  | 'empty'
  | 'duplicate'
  | 'too-many'
  | 'validate-failed';

export interface TagRejection {
  /** The raw string that failed to add. */
  value: string;
  /** Ordered list of reasons (most specific first). At least one entry. */
  reasons: TagRejectionReason[];
  /**
   * Consumer-supplied error message when `validate(tag) => string`.
   * Populated only when `reasons` includes `'validate-failed'` AND validate
   * returned a string.
   */
  message?: string;
}

export type TagValidateResult = boolean | string;

export type TagsInputSize = 'sm' | 'md' | 'lg';

export interface TagsInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'type'
    | 'size'
    | 'children'
    | 'onKeyDown'
    | 'onPaste'
  > {
  // Value management
  /** Controlled value — array of tag strings. */
  value?: string[];
  /** Uncontrolled initial value. Default `[]`. */
  defaultValue?: string[];
  /** Fires when the tags array changes (add / remove / paste-batch). */
  onChange?: (value: string[]) => void;
  /** Fires when at least one input attempt fails validation. */
  onReject?: (rejections: TagRejection[]) => void;

  // Validation
  /**
   * Consumer validation hook. Runs AFTER built-in checks (empty / duplicate /
   * too-many). Return `true` to accept, `false` to reject silently, or a
   * `string` error message to reject with attached message.
   */
  validate?: (tag: string) => TagValidateResult;
  /** Maximum total tags. Default `Infinity`. */
  maxTags?: number;
  /** Allow duplicates. Default `false`. */
  allowDuplicates?: boolean;
  /** Duplicate check case sensitivity. Default `false`. */
  caseSensitive?: boolean;
  /** Trim whitespace before validate + commit. Default `true`. */
  trim?: boolean;

  // Composition
  /**
   * Characters that commit current input (in addition to Enter).
   * Default `[',', ';']`. Newline `'\n'` is always a paste-split delimiter.
   */
  delimiter?: string[];
  /** Commit pending text on blur (Gmail-style). Default `true`. */
  addOnBlur?: boolean;

  // Form
  /**
   * Native `name` for FormData capture. Renders one hidden
   * `<input type="hidden" name={name} value={value.join(',')}>` — consumer
   * reads via `formData.get(name).split(',')`. Per Q1 (α) — delimited string.
   */
  name?: string;
  /** Native required — when value.length === 0, hidden input is :invalid. */
  required?: boolean;
  /** Disable typing + chip removal. */
  disabled?: boolean;

  // Visual
  /** Visual size scale. Default `'md'`. */
  size?: TagsInputSize;
  /** Force invalid styling regardless of native validity. */
  invalid?: boolean;

  /**
   * Ref to the underlying typing `<input>`. (`ref` on TagsInput itself
   * forwards to the wrapper `<div>`.)
   */
  inputRef?: React.Ref<HTMLInputElement>;
}

// ────────────────────────────────────────────────────────────────────────
// Internal helpers
// ────────────────────────────────────────────────────────────────────────

const DEFAULT_DELIMITERS: readonly string[] = [',', ';'];

function isDuplicate(
  tag: string,
  existing: readonly string[],
  caseSensitive: boolean,
): boolean {
  if (caseSensitive) return existing.includes(tag);
  const lower = tag.toLowerCase();
  for (const e of existing) {
    if (e.toLowerCase() === lower) return true;
  }
  return false;
}

/**
 * Process a single raw input string against current value + validation
 * config. Returns accept-or-reject decision.
 */
function processSingle(
  raw: string,
  current: readonly string[],
  opts: {
    trim: boolean;
    maxTags: number;
    allowDuplicates: boolean;
    caseSensitive: boolean;
    validate?: (tag: string) => TagValidateResult;
  },
): { ok: true; tag: string } | { ok: false; rejection: TagRejection } {
  const candidate = opts.trim ? raw.trim() : raw;
  if (candidate.length === 0) {
    return { ok: false, rejection: { value: raw, reasons: ['empty'] } };
  }
  if (current.length >= opts.maxTags) {
    return { ok: false, rejection: { value: candidate, reasons: ['too-many'] } };
  }
  if (!opts.allowDuplicates && isDuplicate(candidate, current, opts.caseSensitive)) {
    return { ok: false, rejection: { value: candidate, reasons: ['duplicate'] } };
  }
  if (opts.validate) {
    const verdict = opts.validate(candidate);
    if (verdict === false) {
      return {
        ok: false,
        rejection: { value: candidate, reasons: ['validate-failed'] },
      };
    }
    if (typeof verdict === 'string') {
      return {
        ok: false,
        rejection: {
          value: candidate,
          reasons: ['validate-failed'],
          message: verdict,
        },
      };
    }
  }
  return { ok: true, tag: candidate };
}

// ────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────

export const TagsInput = forwardRef<HTMLDivElement, TagsInputProps>(function TagsInput(
  {
    value: controlledValue,
    defaultValue,
    onChange,
    onReject,
    validate,
    maxTags = Number.POSITIVE_INFINITY,
    allowDuplicates = false,
    caseSensitive = false,
    trim = true,
    delimiter,
    addOnBlur = true,
    name,
    required = false,
    disabled = false,
    size = 'md',
    invalid = false,
    placeholder,
    className,
    inputRef: externalInputRef,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    id: externalId,
    ...rest
  },
  forwardedRef,
) {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(
    () => defaultValue ?? [],
  );
  const value = isControlled ? (controlledValue ?? []) : uncontrolledValue;

  const [pending, setPending] = useState('');
  const [announce, setAnnounce] = useState('');

  const internalInputRef = useRef<HTMLInputElement>(null);
  // `useImperativeHandle` factory's nullable cast (`current!`) is safe — React
  // never invokes the factory before the ref is attached; the mounted
  // `<input>` is committed before consumers receive the handle.
  useImperativeHandle(
    externalInputRef,
    () => internalInputRef.current as HTMLInputElement,
    [],
  );

  const isComposingRef = useRef(false);
  const announceCounterRef = useRef(0);

  const reactId = useId();
  const inputId = externalId ?? `${reactId}-input`;
  const liveRegionId = `${reactId}-live`;
  const effectiveDescribedby = ariaDescribedby
    ? `${ariaDescribedby} ${liveRegionId}`
    : liveRegionId;

  // Resolved delimiter set — memoized so identity stays stable for deps.
  const delimiters = useMemo(
    () => (delimiter && delimiter.length > 0 ? delimiter : DEFAULT_DELIMITERS),
    [delimiter],
  );

  // ──────────────────────────────────────────────────────────────────
  // Core: commit new value (controlled-friendly + announce)
  // ──────────────────────────────────────────────────────────────────
  const commitValue = useCallback(
    (next: string[]): void => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  // Append a varying zero-width marker to force AT re-announcement of
  // identical content (mirrors FileUpload Phase 5 fix).
  const announceWithMarker = useCallback((message: string): void => {
    const marker = '​'.repeat(((announceCounterRef.current += 1) % 4) + 1);
    setAnnounce(message + marker);
  }, []);

  // ──────────────────────────────────────────────────────────────────
  // Add one or many tags from raw strings
  // ──────────────────────────────────────────────────────────────────
  const addTags = useCallback(
    (rawTags: string[]): void => {
      if (rawTags.length === 0) return;
      const accepted: string[] = [];
      const rejected: TagRejection[] = [];
      const currentSnapshot = [...value];
      const projected = [...currentSnapshot];

      for (const raw of rawTags) {
        const result = processSingle(raw, projected, {
          trim,
          maxTags,
          allowDuplicates,
          caseSensitive,
          validate,
        });
        if (result.ok) {
          accepted.push(result.tag);
          projected.push(result.tag);
        } else {
          rejected.push(result.rejection);
        }
      }

      if (accepted.length > 0) {
        commitValue(projected);
        announceWithMarker(
          accepted.length === 1
            ? `Added: ${accepted[0]}`
            : `Added ${accepted.length} tags`,
        );
      }
      if (rejected.length > 0) {
        onReject?.(rejected);
        // Prefer consumer-supplied message (from validate fn returning string)
        // over the internal reason enum code — AT shouldn't hear "validate-failed",
        // it should hear "Must be lowercase". Falls back to enum code for empty/
        // duplicate/too-many where no message exists.
        const first = rejected[0];
        const detail = first?.message ?? first?.reasons[0] ?? 'invalid';
        announceWithMarker(
          rejected.length === 1
            ? `Tag rejected: ${detail}`
            : `${rejected.length} tags rejected`,
        );
      }
    },
    [
      value,
      trim,
      maxTags,
      allowDuplicates,
      caseSensitive,
      validate,
      commitValue,
      announceWithMarker,
      onReject,
    ],
  );

  // ──────────────────────────────────────────────────────────────────
  // Remove tag at index (chip × handler)
  // ──────────────────────────────────────────────────────────────────
  const removeAt = useCallback(
    (index: number): void => {
      if (index < 0 || index >= value.length) return;
      const removed = value[index];
      const next = value.filter((_, i) => i !== index);
      commitValue(next);
      if (removed) announceWithMarker(`Removed: ${removed}`);
      // Return focus to typing input after removal (Combobox precedent).
      internalInputRef.current?.focus();
    },
    [value, commitValue, announceWithMarker],
  );

  // ──────────────────────────────────────────────────────────────────
  // Input event handling
  // ──────────────────────────────────────────────────────────────────
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      if (disabled) return;
      const raw = event.target.value;
      // Detect inline delimiter — extract everything before the FIRST
      // delimiter, commit it, leave the rest as pending.
      for (const delim of delimiters) {
        const idx = raw.indexOf(delim);
        if (idx >= 0) {
          const candidate = raw.slice(0, idx);
          const remainder = raw.slice(idx + delim.length);
          if (candidate.length > 0) {
            addTags([candidate]);
          }
          setPending(remainder);
          return;
        }
      }
      setPending(raw);
    },
    [disabled, delimiters, addTags],
  );

  const commitPending = useCallback((): boolean => {
    if (pending.length === 0) return false;
    addTags([pending]);
    setPending('');
    return true;
  }, [pending, addTags]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): void => {
      if (disabled) return;
      // IME composition guard — Enter during JP/KR/CN composition must NOT commit.
      if (isComposingRef.current) return;
      if (event.nativeEvent.isComposing) return;

      if (event.key === 'Enter') {
        if (pending.length > 0) {
          event.preventDefault();
          commitPending();
        }
        // When pending is empty, Enter falls through to native form submit
        // (consistent with native <input> semantics).
        return;
      }

      if (event.key === 'Backspace' && pending.length === 0 && value.length > 0) {
        event.preventDefault();
        removeAt(value.length - 1);
      }
    },
    [disabled, pending, value, commitPending, removeAt],
  );

  const handleCompositionStart = useCallback(
    (_event: CompositionEvent<HTMLInputElement>): void => {
      isComposingRef.current = true;
    },
    [],
  );

  const handleCompositionEnd = useCallback(
    (_event: CompositionEvent<HTMLInputElement>): void => {
      isComposingRef.current = false;
    },
    [],
  );

  const handlePaste = useCallback(
    (event: ClipboardEvent<HTMLInputElement>): void => {
      if (disabled) return;
      const text = event.clipboardData.getData('text');
      if (!text) return;
      // Split on configured delimiters + newline (always).
      const splitChars = Array.from(new Set([...delimiters, '\n']));
      // Build a regex from escape-safe chars.
      const escaped = splitChars.map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const re = new RegExp(escaped.join('|'));
      const parts = text.split(re).map((p) => (trim ? p.trim() : p)).filter((p) => p.length > 0);
      if (parts.length > 1) {
        event.preventDefault();
        // Append pending text as the first paste chunk's prefix, if any.
        const merged = pending.length > 0 ? [pending + parts[0], ...parts.slice(1)] : parts;
        setPending('');
        addTags(merged.filter((p): p is string => typeof p === 'string'));
      }
      // Single-part paste — let native input behavior take over (typed into input).
    },
    [disabled, delimiters, trim, pending, addTags],
  );

  // Tracks pointerdown on a chip × button — `relatedTarget` is null when
  // a user clicks the SVG glyph inside the button (SVG not focusable), so
  // we cannot rely on it alone to detect intra-wrapper focus moves. The
  // pointerdown marker plus `relatedTarget`'s wrapper.contains() check
  // covers both keyboard tab and mouse click paths.
  const intraWrapperBlurRef = useRef(false);

  const handleWrapperPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
      const target = event.target as HTMLElement | null;
      if (target && target.closest('button')) {
        intraWrapperBlurRef.current = true;
        // Reset on the next macrotask so this flag covers only the
        // blur+click pair that follows immediately.
        setTimeout(() => {
          intraWrapperBlurRef.current = false;
        }, 0);
      }
    },
    [],
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>): void => {
      if (disabled) return;
      // Skip when blur is intra-wrapper:
      // (a) keyboard tab → relatedTarget present + inside wrapper, OR
      // (b) mouse click on a chip × button → pointerdown flag set just before.
      if (intraWrapperBlurRef.current) return;
      const next = event.relatedTarget as HTMLElement | null;
      if (next && event.currentTarget.closest(`.${styles.root}`)?.contains(next)) {
        return;
      }
      if (addOnBlur && pending.length > 0) {
        commitPending();
      }
    },
    [disabled, addOnBlur, pending, commitPending],
  );

  // Wrapper click — focus the typing input (only when click did NOT
  // originate from a chip × button or the input itself).
  const handleWrapperClick = useCallback(
    (event: MouseEvent<HTMLDivElement>): void => {
      if (disabled) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        target !== event.currentTarget &&
        target.closest('button, input')
      ) {
        return;
      }
      internalInputRef.current?.focus();
    },
    [disabled],
  );

  const handleChipRemoveClick = useCallback(
    (index: number) => (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      removeAt(index);
    },
    [removeAt],
  );

  // ──────────────────────────────────────────────────────────────────
  // Hidden form input (delimited-string serialization per Q1 (α))
  // ──────────────────────────────────────────────────────────────────
  const hiddenValue = value.join(',');
  const isEmpty = value.length === 0;

  // Surface validity to native form ConstraintValidation by setting
  // customValidity = '' (valid) or 'message' (invalid) per render.
  const hiddenRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = hiddenRef.current;
    if (!el) return;
    if (required && isEmpty) {
      el.setCustomValidity('Please add at least one tag');
    } else {
      el.setCustomValidity('');
    }
  }, [required, isEmpty]);

  // ──────────────────────────────────────────────────────────────────
  // Data-state for SCSS
  // ──────────────────────────────────────────────────────────────────
  const dataState = disabled
    ? 'disabled'
    : invalid
      ? 'invalid'
      : value.length >= maxTags
        ? 'max-reached'
        : 'idle';

  return (
    <div
      ref={forwardedRef}
      data-state={dataState}
      data-size={size}
      data-disabled={disabled || undefined}
      className={cn(styles.root, className)}
      onClick={handleWrapperClick}
      onPointerDown={handleWrapperPointerDown}
      {...rest}
    >
      {value.length > 0 && (
        <ul className={styles.chipList} role="list" aria-label="Tags">
          {value.map((tag, index) => (
            <li key={`${tag}-${index}`} className={styles.chip} role="listitem">
              <span className={styles.chipLabel}>{tag}</span>
              <button
                type="button"
                className={styles.chipRemove}
                aria-label={`Remove ${tag}`}
                disabled={disabled}
                onClick={handleChipRemoveClick(index)}
                onMouseDown={(e) => {
                  // Prevent the wrapper from stealing focus to the typing
                  // input before the click handler runs — chip removal
                  // returns focus to input via removeAt().
                  e.preventDefault();
                }}
              >
                <RemoveIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        ref={internalInputRef}
        id={inputId}
        type="text"
        className={styles.input}
        value={pending}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={effectiveDescribedby}
        aria-invalid={invalid || undefined}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onPaste={handlePaste}
        onBlur={handleBlur}
        autoComplete="off"
      />
      {name && (
        <input
          ref={hiddenRef}
          type="hidden"
          name={name}
          value={hiddenValue}
          required={required}
          // Hidden inputs are NOT focusable, so the "An invalid form
          // control... is not focusable" crash from FileUpload FU-R04 does
          // not apply here. Custom validity + form-level focus management
          // is the consumer's job via the typing input above.
        />
      )}
      <div
        id={liveRegionId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {announce}
      </div>
    </div>
  );
});

// Inline icon — zero deps per ROADMAP / D25.
function RemoveIcon(): ReactNode {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 3l6 6M9 3l-6 6" />
    </svg>
  );
}
