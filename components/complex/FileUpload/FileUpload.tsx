'use client';

/**
 * FileUpload — drop zone + native file input wrapper.
 *
 * @layer        complex-interactive (Phase 10, E01.1 of 0.19.0 Forms expansion)
 * @apg          https://www.w3.org/WAI/ARIA/apg/patterns/button/ (drop zone semantics)
 *               https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
 *               No direct APG file-upload pattern — synthesized from button + visually-hidden input.
 * @tokens       --color-brand, --color-brand-subtle, --color-error, --color-error-subtle,
 *               --color-surface, --color-border, --color-border-subtle,
 *               --color-text-primary, --color-text-secondary, --color-text-muted,
 *               --radius-md, --space-{2,3,4,6,8},
 *               --duration-fast, --easing-default, --focus-ring
 * @deps         cn (className util). ZERO external runtime deps. Native File API
 *               + HTML5 drag/drop events only.
 * @a11y         Root drop zone is a plain `<div tabIndex={0} aria-label="...">` —
 *               NOT `role="button"`. axe-core flags `role="button"` here as
 *               `nested-interactive` (the zone hosts a consumer-rendered Browse
 *               `<button>` inside) and `no-focusable-content` (hidden `<input>`
 *               with tabIndex=-1 inside an interactive control is still
 *               AT-focusable). Keyboard activation is provided by the
 *               consumer-rendered Browse `<button>` (real button = real AT
 *               semantics). Space/Enter on the drop zone itself ALSO activates
 *               for keyboard users who land on the zone first (graceful
 *               fallback), but the canonical keyboard path is Tab → Browse →
 *               Enter. Click anywhere on the zone opens the picker (mouse/touch).
 *               Visually-hidden native `<input type="file" tabIndex={-1}
 *               aria-hidden="true">` carries form participation.
 *               `aria-disabled` mirrors the `disabled` prop. Live region
 *               (`role="status" aria-live="polite"`) inside root emits
 *               "{N} files accepted" / "{N} files rejected" on each operation.
 *               Drag counter pattern guards against `dragleave` flicker on child elements.
 * @budget       15 declared props — wide for Phase 10 organism budget (≤3
 *               ideal + 0-2 control flags + slot props per charter R2). Waived
 *               because the surface is the union of three orthogonal concerns
 *               that all consumers need from a single primitive:
 *               (a) validation (accept/multiple/maxSize/minSize/maxFiles),
 *               (b) form integration (name/required/inputRef), and
 *               (c) a11y wiring (aria-label/labelledby/describedby).
 *               Splitting into a compound (`FileUpload + FileUploadInput`)
 *               would force every consumer to write 2 elements where 1 is
 *               sufficient; the v0.19.0 trade favours keep-as-one + future
 *               compound migration ONLY if validation grows further.
 *
 * @example
 *   <FileUpload onFiles={setFiles} accept="image/*" multiple maxFiles={5} maxSize={5_000_000}>
 *     {({ isDragging, openPicker }) => (
 *       <Stack align="center" gap={3}>
 *         <Text>{isDragging ? 'Release to upload' : 'Drag images here'}</Text>
 *         <Button onClick={openPicker} variant="secondary">Browse files</Button>
 *       </Stack>
 *     )}
 *   </FileUpload>
 */

import {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './FileUpload.module.scss';

/**
 * Reason code for a rejected file. Maps 1:1 to validation axis so consumer
 * can show locale-translated error messages without parsing strings.
 *
 * - `file-too-large` — `file.size > maxSize`
 * - `file-too-small` — `file.size < minSize`
 * - `file-invalid-type` — `file.type` / extension does not match `accept` pattern
 * - `too-many-files` — would exceed `maxFiles` given current selection
 */
export type FileRejectionReason =
  | 'file-too-large'
  | 'file-too-small'
  | 'file-invalid-type'
  | 'too-many-files';

/**
 * A file that failed validation. Single file can fail multiple checks (too
 * big AND wrong type), so `reasons` is an array (most specific first).
 */
export interface FileRejection {
  /** The browser File object that failed validation. */
  file: File;
  /** Ordered list of reasons (most specific first). At least one entry. */
  reasons: FileRejectionReason[];
}

/**
 * Render-props context passed to `children` function. Consumer uses these
 * to render own zero state, drag-over visual, browse button, etc.
 */
export interface FileUploadRenderProps {
  /** True while a valid drag is hovering the drop zone. */
  isDragging: boolean;
  /** True when the most recent drag contained rejected files (visual hint only). */
  isDragRejected: boolean;
  /** Programmatically open the OS file picker. */
  openPicker: () => void;
  /** Disabled flag mirror — consumer can dim own visuals. */
  disabled: boolean;
}

export interface FileUploadProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onChange' | 'onDrop' | 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onKeyDown'
> {
  /**
   * Render-props content. Receives drag/picker state. Consumer renders own
   * zero state, drag-over hint, browse trigger, and any file-list display.
   */
  children: (props: FileUploadRenderProps) => ReactNode;

  /**
   * MIME types and/or file extensions to accept. Maps to native `<input accept>`.
   * Examples: `'image/*'`, `'application/pdf'`, `['.pdf', 'application/zip']`.
   * When undefined, all types accepted.
   */
  accept?: string | string[];

  /**
   * Allow multiple file selection. When false, drop of multiple files
   * rejects all-but-first with `'too-many-files'`. Default `false`.
   */
  multiple?: boolean;

  /** Maximum file size in bytes. Default `Infinity`. */
  maxSize?: number;

  /** Minimum file size in bytes. Default `0`. */
  minSize?: number;

  /**
   * Maximum total files accepted per drop/select operation. When `multiple`
   * is false this is implicitly 1. Default `Infinity`.
   */
  maxFiles?: number;

  /**
   * Fires when at least one file passes validation. Receives the array of
   * accepted Files from THIS operation (delta, not accumulated list).
   */
  onFiles?: (files: File[]) => void;

  /** Fires when at least one file fails validation. */
  onReject?: (rejections: FileRejection[]) => void;

  /** Disable the drop zone — drag events ignored, picker blocked. */
  disabled?: boolean;

  /**
   * Native `name` on the hidden `<input type="file">`. Required for
   * FormData multipart capture.
   */
  name?: string;

  /** Native `required` on the hidden `<input>` — integrates with Form validation. */
  required?: boolean;

  /** Accessible label for the drop zone (required when content is icon-only). */
  'aria-label'?: string;

  /** id of element labelling the drop zone (Form/Field integration). */
  'aria-labelledby'?: string;

  /** id of element describing constraints (formats, max size hint). */
  'aria-describedby'?: string;

  /**
   * Ref to the underlying hidden `<input type="file">`. Use for programmatic
   * `.value = ''` reset between uploads. (`ref` on the component forwards to
   * the drop zone div.)
   */
  inputRef?: React.Ref<HTMLInputElement>;
}

// ────────────────────────────────────────────────────────────────────────
// Internal helpers
// ────────────────────────────────────────────────────────────────────────

/**
 * Normalize `accept` prop to a comma-joined string for native `<input accept>`.
 * Trim + lowercase + strip duplicates.
 */
function normalizeAccept(accept: string | string[] | undefined): string | undefined {
  if (accept == null) return undefined;
  const arr = Array.isArray(accept) ? accept : accept.split(',');
  const seen = new Set<string>();
  for (const raw of arr) {
    const t = raw.trim().toLowerCase();
    if (t) seen.add(t);
  }
  return seen.size > 0 ? Array.from(seen).join(',') : undefined;
}

/**
 * Match a File against a single accept token (MIME exact, MIME wildcard like
 * `image/*`, or extension like `.pdf` — leading dot, case-insensitive).
 * When `file.type` is empty (some 3D/STL files, OS quirks), fall back to
 * extension-only match — FU-R07 covers this.
 */
function matchAcceptToken(file: File, token: string): boolean {
  if (!token) return false;
  const t = token.trim().toLowerCase();
  // Extension token (`.pdf`, `.tar.gz` — any token starting with a dot)
  if (t.startsWith('.')) {
    return file.name.toLowerCase().endsWith(t);
  }
  // MIME wildcard (`image/*`)
  if (t.endsWith('/*')) {
    const prefix = t.slice(0, t.length - 1); // keep trailing slash
    return file.type.toLowerCase().startsWith(prefix);
  }
  // Exact MIME
  return file.type.toLowerCase() === t;
}

/**
 * Returns true if the File passes the accept filter (or no accept set).
 * Empty `file.type` is treated as "unknown" — accept matches via extension
 * fallback only.
 */
function fileMatchesAccept(file: File, accept: string | string[] | undefined): boolean {
  if (accept == null) return true;
  const arr = Array.isArray(accept) ? accept : accept.split(',');
  for (const raw of arr) {
    if (matchAcceptToken(file, raw)) return true;
  }
  return false;
}

/**
 * Validate a single File against all constraints. Returns ordered reason
 * array (empty = accepted).
 */
function validateFile(
  file: File,
  accept: string | string[] | undefined,
  maxSize: number,
  minSize: number,
): FileRejectionReason[] {
  const reasons: FileRejectionReason[] = [];
  if (file.size > maxSize) reasons.push('file-too-large');
  if (file.size < minSize) reasons.push('file-too-small');
  if (!fileMatchesAccept(file, accept)) reasons.push('file-invalid-type');
  return reasons;
}

// ────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(function FileUpload(
  {
    children,
    accept,
    multiple = false,
    maxSize = Number.POSITIVE_INFINITY,
    minSize = 0,
    maxFiles = Number.POSITIVE_INFINITY,
    onFiles,
    onReject,
    disabled = false,
    name,
    required = false,
    className,
    inputRef: externalInputRef,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    ...rest
  },
  forwardedRef,
) {
  const internalInputRef = useRef<HTMLInputElement>(null);
  // Expose hidden input via consumer's `inputRef` prop (for `.value = ''` reset).
  useImperativeHandle(externalInputRef, () => internalInputRef.current as HTMLInputElement);

  // Drag counter — prevents `dragleave` flicker when pointer moves over
  // nested children inside render-props content. FU-R03 covers this.
  const dragCounterRef = useRef(0);
  // Live region operation counter — appends a varying zero-width marker
  // so AT re-announces identical content (e.g., two "1 file accepted" in a row).
  const announceCounterRef = useRef(0);

  // Effective max for the operation: multiple=false implicitly caps at 1.
  const effectiveMaxFiles = multiple ? maxFiles : 1;

  const [isDragging, setIsDragging] = useState(false);
  const [isDragRejected, setIsDragRejected] = useState(false);
  const [announce, setAnnounce] = useState('');

  const acceptAttr = useMemo(() => normalizeAccept(accept), [accept]);
  const reactId = useId();
  const liveRegionId = `${reactId}-live`;
  // Chain consumer-supplied describedby + our internal live region so BOTH
  // descriptions land in the same `aria-describedby` set. AT navigates each.
  const effectiveDescribedby = ariaDescribedby
    ? `${ariaDescribedby} ${liveRegionId}`
    : liveRegionId;

  // ──────────────────────────────────────────────────────────────────
  // Core: process a FileList into accepted + rejected buckets
  // ──────────────────────────────────────────────────────────────────
  const processFiles = useCallback(
    (incoming: File[]): void => {
      if (incoming.length === 0) return; // FU-R17 no-op on empty
      const accepted: File[] = [];
      const rejected: FileRejection[] = [];

      for (const file of incoming) {
        const reasons = validateFile(file, accept, maxSize, minSize);
        if (reasons.length === 0) {
          if (accepted.length < effectiveMaxFiles) {
            accepted.push(file);
          } else {
            rejected.push({ file, reasons: ['too-many-files'] });
          }
        } else {
          rejected.push({ file, reasons });
        }
      }

      // Append a zero-width space whose count increments per operation
      // — forces AT (NVDA/JAWS/VoiceOver) to re-announce identical content
      // (e.g., two consecutive "1 file accepted" uploads in a row). Without
      // the marker, AT suppresses repeats as no-op.
      const marker = '​'.repeat(((announceCounterRef.current += 1) % 4) + 1);
      if (accepted.length > 0) {
        onFiles?.(accepted);
        // Live region — accept count (verbose count per Q1 (α)).
        setAnnounce(
          (accepted.length === 1 ? '1 file accepted' : `${accepted.length} files accepted`) +
            marker,
        );
      }
      if (rejected.length > 0) {
        onReject?.(rejected);
        // Live region — count-only for rejections per Q1 (β). Reasons
        // surface via consumer's visual alert.
        setAnnounce(
          (rejected.length === 1 ? '1 file rejected' : `${rejected.length} files rejected`) +
            marker,
        );
      }
    },
    [accept, maxSize, minSize, effectiveMaxFiles, onFiles, onReject],
  );

  // ──────────────────────────────────────────────────────────────────
  // Picker
  // ──────────────────────────────────────────────────────────────────
  const openPicker = useCallback(() => {
    if (disabled) return;
    // Click MUST be inside the React event handler that originated from a
    // user gesture (Space/Enter, click). Browsers block synthetic .click()
    // outside the gesture chain — FU-R02 documents the boundary.
    // Reset value BEFORE opening so re-picking the same file still fires
    // `change`. Resetting after `change` would wipe the FileList +
    // break FormData submission (Constraint Validation sees empty input).
    if (internalInputRef.current) {
      internalInputRef.current.value = '';
    }
    internalInputRef.current?.click();
  }, [disabled]);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const list = event.target.files;
      if (!list) return;
      const files: File[] = [];
      for (let i = 0; i < list.length; i += 1) {
        const f = list.item(i);
        if (f) files.push(f);
      }
      processFiles(files);
      // Note: do NOT reset `event.target.value = ''` here — that would wipe
      // the FileList immediately and break native FormData submission
      // (Constraint Validation API sees empty `required` input). Re-picking
      // the same file is handled by resetting `.value` inside `openPicker`
      // BEFORE the picker opens (see above).
    },
    [processFiles],
  );

  // ──────────────────────────────────────────────────────────────────
  // Drag & drop event handling — counter pattern
  // ──────────────────────────────────────────────────────────────────
  const handleDragEnter = useCallback(
    (event: DragEvent<HTMLDivElement>): void => {
      if (disabled) return;
      event.preventDefault();
      dragCounterRef.current += 1;
      if (dragCounterRef.current === 1) {
        setIsDragging(true);
        // Best-effort reject preview from dataTransfer.items (type-only, no
        // size data — size check defers to drop). FU-R08 documents limit.
        const items = event.dataTransfer?.items;
        if (items && accept != null) {
          let anyRejected = false;
          for (let i = 0; i < items.length; i += 1) {
            const it = items[i];
            if (it && it.kind === 'file') {
              const fakeFile = { type: it.type ?? '', name: '' } as File;
              if (!fileMatchesAccept(fakeFile, accept) && (fakeFile.type || '').length > 0) {
                anyRejected = true;
                break;
              }
            }
          }
          setIsDragRejected(anyRejected);
        }
      }
    },
    [disabled, accept],
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>): void => {
    // ALWAYS preventDefault on dragover, or drop never fires + browser
    // navigates to the file (FU-R18). Even when disabled — we want to
    // suppress browser-default file-open without engaging drop logic.
    event.preventDefault();
  }, []);

  const handleDragLeave = useCallback(
    (event: DragEvent<HTMLDivElement>): void => {
      if (disabled) return;
      event.preventDefault();
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) {
        setIsDragging(false);
        setIsDragRejected(false);
      }
    },
    [disabled],
  );

  const resetDragState = useCallback(() => {
    dragCounterRef.current = 0;
    setIsDragging(false);
    setIsDragRejected(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>): void => {
      event.preventDefault();
      resetDragState();
      if (disabled) return;

      const transfer = event.dataTransfer;
      if (!transfer) return;

      // Prefer .files; fall back to .items (Safari quirk — FU-R19).
      const files: File[] = [];
      if (transfer.files && transfer.files.length > 0) {
        for (let i = 0; i < transfer.files.length; i += 1) {
          const f = transfer.files.item(i);
          if (f) files.push(f);
        }
      } else if (transfer.items && transfer.items.length > 0) {
        for (let i = 0; i < transfer.items.length; i += 1) {
          const it = transfer.items[i];
          if (it && it.kind === 'file') {
            const asFile = it.getAsFile();
            if (asFile) files.push(asFile);
          }
        }
      }

      processFiles(files);
    },
    [disabled, processFiles, resetDragState],
  );

  // ──────────────────────────────────────────────────────────────────
  // Keyboard — Space/Enter on drop zone activates picker (button semantics)
  // ──────────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>): void => {
      if (disabled) return;
      if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault(); // avoid page scroll
        openPicker();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        openPicker();
      }
    },
    [disabled, openPicker],
  );

  // Click on drop zone — desktop click + mobile tap path (Q2 (α)).
  // When the click originates from an inner interactive element (a Browse
  // button rendered inside `children`), skip the zone-level handler — the
  // inner button is presumed to call `openPicker()` itself. Removes the
  // need for consumers to `event.stopPropagation()` on every nested button.
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
      if (disabled) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        target !== event.currentTarget &&
        target.closest('button, a, [role="button"], input, textarea, select')
      ) {
        return;
      }
      openPicker();
    },
    [disabled, openPicker],
  );

  // ──────────────────────────────────────────────────────────────────
  // Data-state for SCSS
  // ──────────────────────────────────────────────────────────────────
  const dataState = disabled
    ? 'disabled'
    : isDragRejected
      ? 'rejecting'
      : isDragging
        ? 'dragging'
        : 'idle';

  // openPicker is `useCallback([disabled])` — the ref access
  // (`internalInputRef.current?.click()`) only fires when consumer invokes it
  // from an event handler. The React 19 `react-hooks/refs` rule flags
  // passing the callback into `children(renderProps)` as a render-time ref
  // exposure, but that's a false positive: refs are captured by reference,
  // not accessed, at closure-creation time. Compare Tooltip.tsx:311 +
  // Combobox.tsx:833 + Carousel.tsx:225 for the same false-positive pattern.
  const renderProps: FileUploadRenderProps = {
    isDragging,
    isDragRejected,
    openPicker,
    disabled,
  };

  return (
    <div
      ref={forwardedRef}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={effectiveDescribedby}
      data-state={dataState}
      data-dragging={isDragging || undefined}
      data-disabled={disabled || undefined}
      className={cn(styles.root, className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...rest}
    >
      <input
        ref={internalInputRef}
        type="file"
        tabIndex={-1}
        aria-hidden="true"
        className={styles.input}
        accept={acceptAttr}
        multiple={multiple}
        name={name}
        required={required}
        disabled={disabled}
        onChange={handleInputChange}
      />
      {/* eslint-disable-next-line react-hooks/refs -- see comment above renderProps declaration */}
      {children(renderProps)}
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
