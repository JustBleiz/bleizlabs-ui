import { forwardRef, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import styles from './Banner.module.scss';

/**
 * Banner — page-wide notification primitive.
 *
 * Distinct from `<Alert>` (contextual inline feedback near the form
 * field / row that triggered it). Banner is a **page-level** broadcast:
 * maintenance windows, billing-overdue notices, "we updated our terms"
 * acknowledgement, global system status. It typically sits at the top
 * of the application chrome and stretches the full content width.
 *
 * Tone enum maps directly to ARIA live semantics — `tone="error"`
 * announces assertively (interrupts AT), other tones announce politely
 * (wait for next pause). Dismissal is consumer-owned: when
 * `dismissible` is set, the ✕ button fires `onDismiss`; the consumer
 * decides whether to unmount, persist the choice in localStorage, or
 * cycle back later. Sticky variant uses `position: sticky; top: 0`
 * so the banner anchors above scrolling content — consumer is
 * responsible for the layout slot.
 *
 * @layer   atom (feedback)
 * @tokens  --color-{info,warning,error,success}{,-subtle},
 *          --color-surface-raised, --color-border-subtle,
 *          --color-text-primary, --space-{2,3,4,7}, --radius-{sm,md},
 *          --font-size-sm, --line-height-snug, --size-touch-min (via
 *          `@include mx.touch-target`), --duration-fast, --easing-default,
 *          --focus-ring (via `@include mx.focus-ring`).
 *          Local channels: --banner-{bg,border,fg} (per-tone overrides).
 * @deps    cn. Server-safe in the read-only case (see @notes).
 * @a11y    `tone="error"` → `role="alert"` + `aria-live="assertive"`
 *          (interrupts SR). Other tones → `role="status"` +
 *          `aria-live="polite"`. Dismiss button is native
 *          `<button type="button">` z `aria-label="Dismiss banner"`.
 *          Action slot accepts arbitrary children (typically `<Button>`
 *          / `<Anchor>`), consumer-owned semantics.
 * @notes   No `'use client'` directive — Banner itself is purely
 *          presentational (no state, no effects). When `dismissible` +
 *          `onDismiss` (or function-bearing `actions`) are supplied, the
 *          parent must naturally be a Client Component (you cannot pass
 *          function props from a Server Component anyway) — Banner remains
 *          RSC-compatible in the read-only case
 *          (`<Banner tone="warning">...</Banner>`).
 *
 * @example
 * <Banner tone="warning">
 *   Maintenance window scheduled for 2026-05-15 02:00 UTC.
 * </Banner>
 *
 * @example
 * // With action + dismissible
 * <Banner
 *   tone="info"
 *   dismissible
 *   onDismiss={() => setShown(false)}
 *   actions={<Button size="sm" variant="ghost">Read more</Button>}
 * >
 *   We've updated our terms of service. Please review the changes.
 * </Banner>
 *
 * @example
 * // Sticky top-of-page broadcast
 * <Banner tone="error" sticky>
 *   Payment failed — your subscription will lapse on May 20.
 * </Banner>
 */
export type BannerTone = 'info' | 'warning' | 'error' | 'success';

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  /** Semantic tone — drives color palette + ARIA live politeness. Default `'info'`. */
  tone?: BannerTone;
  /**
   * When `true`, renders a ✕ dismiss button on the right and fires
   * `onDismiss` when activated. Consumer decides what to do (unmount,
   * persist dismissal, etc). Default `false`.
   */
  dismissible?: boolean;
  /** Fires when the dismiss button is clicked / activated. */
  onDismiss?: () => void;
  /**
   * Sticky positioning — `position: sticky; top: 0; z-index: 1`. Use
   * for top-of-page broadcasts that should anchor above scrolling
   * content. Default `false`. Consumer wraps in own layout slot.
   */
  sticky?: boolean;
  /**
   * Optional slot for action elements (typically `<Button>` /
   * `<Anchor>`). Renders on the right, before the dismiss button.
   */
  actions?: ReactNode;
  /** Banner message body — typically a single sentence. */
  children: ReactNode;
}

const TONE_CLASS: Record<BannerTone, string> = {
  info: styles.toneInfo!,
  warning: styles.toneWarning!,
  error: styles.toneError!,
  success: styles.toneSuccess!,
};

function DismissIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="16" height="16">
      <path
        d="M4 4 L12 12 M12 4 L4 12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  {
    tone = 'info',
    dismissible = false,
    onDismiss,
    sticky = false,
    actions,
    className,
    children,
    ...rest
  },
  ref,
) {
  const isAssertive = tone === 'error';

  function handleDismissClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onDismiss?.();
  }

  return (
    <div
      ref={ref}
      role={isAssertive ? 'alert' : 'status'}
      aria-live={isAssertive ? 'assertive' : 'polite'}
      className={cn(styles.root, TONE_CLASS[tone], sticky && styles.sticky, className)}
      {...rest}
    >
      <div className={styles.message}>{children}</div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
      {dismissible ? (
        <button
          type="button"
          aria-label="Dismiss banner"
          className={styles.dismiss}
          onClick={handleDismissClick}
        >
          <DismissIcon />
        </button>
      ) : null}
    </div>
  );
});
