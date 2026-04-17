import {
  forwardRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/components/utils/cn';
import styles from './Alert.module.scss';

/**
 * Alert — semantic feedback notification with 4 variants (Phase 5 F2).
 *
 * @layer   atom (feedback)
 * @tokens  --color-{error,warning,info,success} (border-left-color per variant),
 *          --color-{error,warning,info,success}-{subtle,strong} (border +
 *          background + title color per variant);
 *          --color-surface (base bg), --color-surface-raised (closeButton hover);
 *          --color-text-{primary,secondary,muted};
 *          --space-{1,3,4} (gap + padding + timestamp margin);
 *          --font-size-{xs,sm,base}, --font-weight-semibold;
 *          --line-height-{snug,normal}, --radius-{sm,md},
 *          --duration-{fast,normal}, --easing-default, --focus-ring;
 *          `fadeIn` keyframe animation.
 * @deps    cn, React: `forwardRef`, type imports
 *          `HTMLAttributes<HTMLDivElement>`, `MouseEvent<HTMLButtonElement>`,
 *          `ReactNode`
 * @a11y    `variant="critical"` → `role="alert"` + `aria-live="assertive"`
 *          (interrupts SR immediately). Other variants → `role="status"`
 *          + `aria-live="polite"` (waits for next pause). `href` renders the
 *          title/body block as an `<a>` (whole body clickable) — close button
 *          stays outside the link so it remains independently operable.
 *          Close button is a native `<button type="button">` with
 *          `aria-label="Dismiss notification"` and a 44×44 touch target via
 *          `@include mx.touch-target` (D13). Timestamp renders as `<time>`
 *          with `dateTime` attribute so assistive tech exposes the raw ISO
 *          value alongside the human-readable label.
 * @notes   Server-safe — no `'use client'`. `onClose` is invoked in the
 *          consumer's tree; Alert itself holds no dismissal state. When
 *          both `href` and `onClose` are present, clicking the body navigates
 *          and clicking ✕ dismisses; the close button stops propagation so
 *          it never triggers the link.
 *
 * @example
 * <Alert
 *   variant="critical"
 *   title="Połączenie utracone"
 *   description="Sprawdź internet i spróbuj ponownie."
 *   onClose={() => setShow(false)}
 * />
 *
 * <Alert
 *   variant="info"
 *   title="Nowa wersja"
 *   description="Kliknij, aby zobaczyć changelog."
 *   href="/changelog"
 *   timestamp="2026-04-14T14:30:00Z"
 * />
 */
export type AlertVariant = 'critical' | 'warning' | 'info' | 'success';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /** Semantic variant determining color, aria-live, and urgency. Required. */
  variant: AlertVariant;
  /** Primary alert headline. Required. Rendered as `<strong>` inside the body. */
  title: string;
  /** Secondary body copy. Rendered as inline text under the title. */
  description?: string;
  /** Optional ISO timestamp (e.g. `'2026-04-14T14:30:00Z'`). Rendered as `<time dateTime>` — the display text is the raw ISO string; callers can format locally before passing if they need a human-readable form. */
  timestamp?: string;
  /** Optional URL. When provided, the title/description block becomes a clickable `<a>` (the close button stays outside the link). */
  href?: string;
  /** Optional dismiss callback. When provided, a close button (✕) is rendered with a 44×44 touch target. */
  onClose?: () => void;
  /** Optional custom icon for the close button. Default: inline SVG ✕. */
  closeIcon?: ReactNode;
}

const VARIANT_CLASS: Record<AlertVariant, string> = {
  critical: styles.variantCritical!,
  warning: styles.variantWarning!,
  info: styles.variantInfo!,
  success: styles.variantSuccess!,
};

function DefaultCloseIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      width="16"
      height="16"
    >
      <path
        d="M4 4 L12 12 M12 4 L4 12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    variant,
    title,
    description,
    timestamp,
    href,
    onClose,
    closeIcon,
    className,
    ...rest
  },
  ref,
) {
  const isCritical = variant === 'critical';
  const role = isCritical ? 'alert' : 'status';
  const ariaLive = isCritical ? 'assertive' : 'polite';

  const bodyInner = (
    <>
      <strong className={styles.title}>{title}</strong>
      {description ? (
        <span className={styles.description}>{description}</span>
      ) : null}
      {timestamp ? (
        <time className={styles.timestamp} dateTime={timestamp}>
          {timestamp}
        </time>
      ) : null}
    </>
  );

  const body = href ? (
    <a className={styles.body} href={href}>
      {bodyInner}
    </a>
  ) : (
    <div className={styles.body}>{bodyInner}</div>
  );

  const handleCloseClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClose?.();
  };

  return (
    <div
      ref={ref}
      role={role}
      aria-live={ariaLive}
      className={cn(styles.root, VARIANT_CLASS[variant], className)}
      {...rest}
    >
      {body}
      {onClose ? (
        <button
          type="button"
          aria-label="Dismiss notification"
          className={styles.closeButton}
          onClick={handleCloseClick}
        >
          {closeIcon ?? <DefaultCloseIcon />}
        </button>
      ) : null}
    </div>
  );
});
