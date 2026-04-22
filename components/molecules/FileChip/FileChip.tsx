import {
  forwardRef,
  type HTMLAttributes,
  type ReactElement,
} from 'react';
import { Button } from '../../interactive/Button';
import { Spinner } from '../../display/Spinner';
import { Text } from '../../typography/Text';
import { cn } from '../../utils/cn';
import styles from './FileChip.module.scss';

/**
 * FileChip — file attachment chip (Phase 5 M7).
 *
 * @layer   molecule
 * @tokens  --space-{1,2,3}, --color-border, --color-border-strong,
 *          --color-error, --color-surface-raised, --color-text-primary,
 *          --color-text-secondary, --color-text-muted, --radius-full,
 *          --duration-hover, --font-size-sm, --font-size-xs
 * @deps    Button atom (variant=ghost, size=sm, iconOnly), Spinner atom
 *          (size=sm, color=current), Text atom (variant caption), cn,
 *          inline SVG icons (D25 zero deps)
 * @a11y    Root is a plain `<div>` — non-interactive per se. Remove / retry
 *          controls are real `<button>`s provided by the Button atom, which
 *          carries `focus-visible` + keyboard semantics. The MIME icon is
 *          decorative (`aria-hidden="true"`). Spinner has `role="status"`
 *          via its atom. File name is plain text; file size is plain text
 *          (the "1.4 MB" label itself conveys meaning, no extra aria needed).
 *          Consumers should pass a translated `removeLabel` / `retryLabel`
 *          in non-English locales — defaults are English neutral per v0.3.0
 *          F_B8 precedent (BackLink removed Polish defaults).
 * @notes   No `'use client'` directive — FileChip itself is purely
 *          presentational (no state, no effects). When `onRemove` /
 *          `onRetry` are supplied, the parent must naturally be a Client
 *          Component (you cannot pass function props from a Server
 *          Component anyway) — FileChip remains RSC-compatible in the
 *          read-only case (`<FileChip name="spec.pdf" size={1024} />`).
 *          **Variants** — `uploaded` (default, neutral border, MIME icon),
 *          `uploading` (Spinner replaces the MIME icon, remove button
 *          hidden — upload in flight), `error` (error-colored border +
 *          icon tint, retry button shown when `onRetry` supplied).
 *          **Truncation** — filename is CSS-truncated with ellipsis on
 *          overflow; size sits in a fixed-width slot on the right.
 *
 * @example
 * <FileChip name="brief.pdf" size={245_760} mimeType="application/pdf" />
 *
 * <FileChip
 *   name="screenshot.png"
 *   size={1_474_560}
 *   mimeType="image/png"
 *   onRemove={() => removeAttachment(id)}
 *   removeLabel="Usuń plik"
 * />
 *
 * <FileChip name="video.mp4" size={82_944_000} mimeType="video/mp4" variant="uploading" />
 *
 * <FileChip
 *   name="big-archive.zip"
 *   size={524_288_000}
 *   mimeType="application/zip"
 *   variant="error"
 *   onRetry={() => retryUpload(id)}
 *   onRemove={() => discard(id)}
 *   retryLabel="Ponów"
 *   removeLabel="Usuń plik"
 * />
 */
export type FileChipVariant = 'uploaded' | 'uploading' | 'error';

export interface FileChipProps extends HTMLAttributes<HTMLDivElement> {
  /** Visible file name. Truncates with ellipsis on overflow. */
  name: string;
  /** File size in bytes. Rendered as a short human-readable label (e.g. `1.4 MB`). */
  size: number;
  /**
   * MIME type string (e.g. `image/png`, `application/pdf`). Used only to
   * pick a decorative category icon — unknown or missing values fall back
   * to a generic document icon.
   */
  mimeType?: string;
  /** Visual variant. Default `'uploaded'`. */
  variant?: FileChipVariant;
  /**
   * Handler for the trailing remove button. If omitted the button is not
   * rendered — chip becomes read-only. Hidden when `variant === 'uploading'`
   * (an in-flight upload is cancelled via its own mechanism, not this chip).
   */
  onRemove?: () => void;
  /**
   * Handler for the retry button (error variant only). If omitted the retry
   * button is not rendered.
   */
  onRetry?: () => void;
  /**
   * Accessible label for the remove button (icon-only). Default `'Remove file'`
   * — English neutral per v0.3.0 F_B8. Consumers in non-English locales
   * should pass a translated string.
   */
  removeLabel?: string;
  /**
   * Visible label for the retry button. Default `'Retry'`. Consumers in
   * non-English locales should pass a translated string.
   */
  retryLabel?: string;
  /**
   * Hidden screen-reader label announced by the `Spinner` atom while the
   * `uploading` variant is active. Default `'Uploading'` — English neutral.
   * Consumers in non-English locales should pass a translated string so
   * that the a11y contract stays consistent with `removeLabel` /
   * `retryLabel`.
   */
  uploadingLabel?: string;
}

const VARIANT_CLASS: Record<FileChipVariant, string> = {
  uploaded: styles.variantUploaded!,
  uploading: styles.variantUploading!,
  error: styles.variantError!,
};

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < BYTE_UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const rounded = unitIndex === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${BYTE_UNITS[unitIndex]}`;
}

type MimeCategory = 'image' | 'video' | 'audio' | 'text' | 'archive' | 'document';

function getMimeCategory(mimeType?: string): MimeCategory {
  if (!mimeType) return 'document';
  const lower = mimeType.toLowerCase();
  if (lower.startsWith('image/')) return 'image';
  if (lower.startsWith('video/')) return 'video';
  if (lower.startsWith('audio/')) return 'audio';
  if (lower.startsWith('text/')) return 'text';
  if (
    lower === 'application/zip' ||
    lower === 'application/x-tar' ||
    lower === 'application/x-7z-compressed' ||
    lower === 'application/x-rar-compressed' ||
    lower === 'application/gzip'
  ) {
    return 'archive';
  }
  return 'document';
}

function MimeIcon({ category }: { category: MimeCategory }): ReactElement {
  const commonProps = {
    'aria-hidden': true,
    focusable: false as const,
    viewBox: '0 0 16 16',
    width: '14',
    height: '14',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.5',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (category) {
    case 'image':
      return (
        <svg {...commonProps}>
          <rect x="2" y="3" width="12" height="10" rx="1.5" />
          <circle cx="6" cy="7" r="1" />
          <path d="m2 11 3.5-3 3 2.5L11 8l3 3" />
        </svg>
      );
    case 'video':
      return (
        <svg {...commonProps}>
          <rect x="2" y="4" width="9" height="8" rx="1" />
          <path d="M11 7l3-1.5v5L11 9z" />
        </svg>
      );
    case 'audio':
      return (
        <svg {...commonProps}>
          <path d="M6 12V4l7-1.5v8" />
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="12" cy="10.5" r="1.5" />
        </svg>
      );
    case 'text':
      return (
        <svg {...commonProps}>
          <path d="M3 2h7l3 3v9H3z" />
          <path d="M5.5 7h5M5.5 9.5h5M5.5 12H9" />
        </svg>
      );
    case 'archive':
      return (
        <svg {...commonProps}>
          <path d="M3 2h10v12H3z" />
          <path d="M8 3v2M8 6v2M8 9v2" />
        </svg>
      );
    case 'document':
      return (
        <svg {...commonProps}>
          <path d="M3 2h7l3 3v9H3z" />
          <path d="M10 2v3h3" />
        </svg>
      );
  }
}

function CloseIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  );
}

function RetryIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" />
      <path d="M13.5 2.5v3h-3" />
    </svg>
  );
}

export const FileChip = forwardRef<HTMLDivElement, FileChipProps>(
  function FileChip(
    {
      name,
      size,
      mimeType,
      variant = 'uploaded',
      onRemove,
      onRetry,
      removeLabel = 'Remove file',
      retryLabel = 'Retry',
      uploadingLabel = 'Uploading',
      className,
      ...rest
    },
    ref,
  ) {
    const category = getMimeCategory(mimeType);
    const showRemove = variant !== 'uploading' && typeof onRemove === 'function';
    const showRetry = variant === 'error' && typeof onRetry === 'function';

    return (
      <div
        ref={ref}
        className={cn(styles.root, VARIANT_CLASS[variant], className)}
        data-variant={variant}
        {...rest}
      >
        <span className={styles.icon}>
          {variant === 'uploading' ? (
            <Spinner size="sm" color="current" label={uploadingLabel} />
          ) : (
            <MimeIcon category={category} />
          )}
        </span>

        <Text variant="caption" color="primary" asChild>
          <span className={styles.filename} title={name}>
            {name}
          </span>
        </Text>

        <Text variant="caption" color="muted" asChild>
          <span className={styles.size}>{formatBytes(size)}</span>
        </Text>

        {(showRetry || showRemove) && (
          <span className={styles.actions}>
            {showRetry && (
              <Button
                variant="ghost"
                size="sm"
                icon={<RetryIcon />}
                onClick={onRetry}
              >
                {retryLabel}
              </Button>
            )}
            {showRemove && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                icon={<CloseIcon />}
                aria-label={removeLabel}
                onClick={onRemove}
              />
            )}
          </span>
        )}
      </div>
    );
  },
);
