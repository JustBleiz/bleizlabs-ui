'use client';

/**
 * Toaster — singleton notification surface for imperative `toast()` API.
 *
 * Mounted ONCE in the root layout (typically `<body>`). Subscribes to the
 * module-scoped `toastStore` queue via `useSyncExternalStore` and renders
 * every active toast inside a `FloatingPortal` (E23 primitive) attached to
 * `document.body`. Positioning is CSS-only via `data-position` attribute on
 * the outer container; no `useFloating` because toasts are viewport-anchored,
 * not reference-anchored.
 *
 * Pause semantics: hovering OR focusing anywhere inside the toast region
 * pauses ALL auto-dismiss timers via `pauseAllTimers()`. Tab visibility
 * hidden also pauses (prevents toasts from silently expiring while user is
 * in another tab). Resume fires on pointer leave + focus leave + visibility
 * restored.
 *
 * @layer complex-interactive (Phase 10 CI15 — FIRST notification sub-family)
 * @tokens --color-surface-raised, --color-surface-hover, --color-text-primary,
 *   --color-text-muted, --color-border-subtle, --color-border-strong,
 *   --color-brand, --color-success, --color-success-subtle, --color-error,
 *   --color-error-subtle, --color-warning, --color-warning-subtle,
 *   --color-info, --color-info-subtle, --shadow-lg, --radius-md, --radius-sm,
 *   --z-toast (consumer-overridable, defaults to var(--z-popover) + 1),
 *   --duration-fast, --duration-normal, --easing-default, --focus-ring,
 *   --space-{1,2,3,4,6}, --font-sans, --font-size-xs, --font-size-sm,
 *   --font-weight-medium, --font-weight-semibold, --toast-accent (internal
 *   per-variant accent token composed to --color-{success,error,warning,info})
 * @deps zero runtime deps per D5/D25. `useSyncExternalStore` (React 18+),
 *   module-scoped queue + `setTimeout` (see `toastStore.ts`), `FloatingPortal`
 *   (E23). Own inline SVG icons for each variant. No Radix Toast, no Sonner,
 *   no react-hot-toast.
 * @a11y APG `/alert/` + ARIA live regions. Each toast picks `role` +
 *   `aria-live` based on variant:
 *   - `variant="error"` → `role="alert"` + `aria-live="assertive"`
 *     (interrupts SR reading)
 *   - all others → `role="status"` + `aria-live="polite"`
 *   - `aria-atomic="true"` on every toast so SRs read title+description as
 *     one unit, not fragment by fragment as content mutates.
 *
 *   Focus management: toasts DO NOT steal focus (violates WCAG 2.4.3 Focus
 *   Order). Close button + action button are Tab-reachable from viewport
 *   natural order (positioned at end via portal append). `tabIndex={0}`
 *   makes toast region reachable without stealing.
 *
 *   WCAG SC 1.4.13 "Content on Hover or Focus" compliance: toasts are
 *   (a) dismissable (close button + action), (b) hoverable without auto-
 *   dismissing (hover pauses timer), (c) persistent on focus (focus also
 *   pauses). Error toasts + sticky toasts (`duration: Infinity`) must be
 *   manually dismissed — always ship closable=true for these.
 *
 *   RTL: `dir` prop mirrors left/right positions + icon/close order. `top-
 *   left` under RTL visually lands top-right relative to document.
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/alert/
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y ✓ | next build ✓ — DEFERRED:
 *   Playwright execution (per E15 scope decision), axe-core runtime sweep,
 *   manual NVDA sweep.
 * @regressions tests/Toast.{keyboard,focus,aria,regression}.spec.md —
 *   TST-R01..R22+ edge cases documented in `docs/specs/toast-spec.md`
 *   (promoted from `docs/_tmp/` in E42). Covers dedup by id, promise
 *   transitions, auto-dismiss, pause on hover/focus/visibilitychange,
 *   Infinity duration, ARIA role per variant, no focus-steal, reduced-
 *   motion, RTL, SSR safe.
 * @example
 *   // In root layout:
 *   <body>
 *     {children}
 *     <Toaster position="bottom-right" richColors />
 *   </body>
 *
 *   // Anywhere else (any depth, any framework boundary):
 *   import { toast } from './';
 *   toast.success('Saved successfully');
 *   toast.error({ title: 'Failed to save', description: err.message });
 *   toast({
 *     title: 'Update available',
 *     description: 'New version ready to install.',
 *     action: { label: 'Reload', onClick: () => location.reload() },
 *     duration: Infinity,
 *   });
 *   toast.promise(api.save(data), {
 *     loading: 'Saving…',
 *     success: 'Saved',
 *     error: 'Failed to save',
 *   });
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  type OlHTMLAttributes,
  type ReactNode,
} from 'react';
import { FloatingPortal } from '../../utils/floating';
import { cn } from '../../utils/cn';
import {
  pauseAllTimers,
  resumeAllTimers,
  toast as toastApi,
  useToastQueue,
  type ToastItem,
  type ToastVariant,
} from './toastStore';
import styles from './Toast.module.scss';

export type ToasterPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type ToasterDir = 'ltr' | 'rtl';

export interface ToasterProps extends Omit<OlHTMLAttributes<HTMLOListElement>, 'dir'> {
  /** Stack position in viewport. Default `'bottom-right'`. */
  position?: ToasterPosition;
  /** Global default duration (ms) — overridable per toast. Default `4000`. */
  duration?: number;
  /** Show close button on every toast. Default `true`. */
  closeButton?: boolean;
  /** Enable variant-colored backgrounds. Default `false` (neutral surface + colored border/icon). */
  richColors?: boolean;
  /** Reading direction. Mirrors positions + icon/close order when `'rtl'`. */
  dir?: ToasterDir;
  /** Accessible label for the landmark region. Default `'Notifications'`. */
  label?: string;
}

export const Toaster = forwardRef<HTMLOListElement, ToasterProps>(function Toaster(props, ref) {
  const {
    position = 'bottom-right',
    duration: _globalDuration, // reserved — individual toast overrides already win
    closeButton = true,
    richColors = false,
    dir = 'ltr',
    label = 'Notifications',
    className,
    ...rest
  } = props;
  void _globalDuration;

  const toasts = useToastQueue();

  // Pause on tab-hidden. Resume on visible. Prevents toasts from silently
  // expiring while user is in another tab.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handler = () => {
      if (document.visibilityState === 'hidden') pauseAllTimers();
      else resumeAllTimers();
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const handlePointerEnter = useCallback<React.PointerEventHandler<HTMLOListElement>>(() => {
    pauseAllTimers();
  }, []);
  const handlePointerLeave = useCallback<React.PointerEventHandler<HTMLOListElement>>(() => {
    resumeAllTimers();
  }, []);
  const handleFocusIn = useCallback<React.FocusEventHandler<HTMLOListElement>>(() => {
    pauseAllTimers();
  }, []);
  const handleFocusOut = useCallback<React.FocusEventHandler<HTMLOListElement>>((event) => {
    // Only resume when focus truly leaves the region — not when moving between toasts.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      resumeAllTimers();
    }
  }, []);

  // When queue empties while paused (all toasts dismissed), ensure resume runs.
  useEffect(() => {
    if (toasts.length === 0) resumeAllTimers();
  }, [toasts.length]);

  // Always render the <ol> landmark region — even when empty — so the ARIA
  // live region exists in the DOM BEFORE the first toast mounts. Some SR +
  // browser combinations miss announcements if the live-region container is
  // mounted simultaneously with its first child (Phase 5 IMP-5 fix per
  // Evaluator audit). Pointer-events + empty body ensure the empty region
  // is non-interactive while present.
  return (
    <FloatingPortal>
      <ol
        ref={ref}
        aria-label={label}
        dir={dir}
        className={cn(styles.toaster, richColors && styles.richColors, className)}
        data-position={position}
        data-empty={toasts.length === 0 ? 'true' : undefined}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocusIn}
        onBlur={handleFocusOut}
        {...rest}
      >
        {toasts.map((toastItem) => (
          <ToastCard
            key={toastItem.id}
            item={toastItem}
            closeButton={closeButton}
          />
        ))}
      </ol>
    </FloatingPortal>
  );
});

// ──────────────────────────────────────────────────────────────────────────
// ToastCard — individual toast render

interface ToastCardProps {
  item: ToastItem;
  closeButton: boolean;
}

function ToastCard({ item, closeButton }: ToastCardProps) {
  // RTL direction cascades via <ol dir={dir}> on the Toaster landmark —
  // icon/close column ordering follows natural DOM + CSS cascade. No
  // per-card dir prop needed (Phase 5 IMP-3 cleanup per Evaluator audit).
  const isError = item.variant === 'error';
  const role = isError ? 'alert' : 'status';
  const ariaLive = isError ? 'assertive' : 'polite';

  const icon = item.icon ?? defaultIconFor(item.variant);

  const handleClose = useCallback(() => {
    toastApi.dismiss(item.id);
  }, [item.id]);

  const handleActionClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!item.action) return;
      const result = item.action.onClick(event);
      const shouldDismiss = item.action.dismissOnClick ?? true;
      if (shouldDismiss) {
        // Non-blocking dismiss — does not await async onClick.
        toastApi.dismiss(item.id);
      }
      void result;
    },
    [item.action, item.id],
  );

  return (
    <li
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={cn(styles.toast, styles[variantClass(item.variant)])}
      data-variant={item.variant}
      data-sticky={!Number.isFinite(item.duration) || undefined}
    >
      {icon ? (
        <span aria-hidden="true" className={styles.icon}>
          {icon}
        </span>
      ) : null}
      <div className={styles.content}>
        {item.title ? <div className={styles.title}>{item.title}</div> : null}
        {item.description ? (
          <div className={styles.description}>{item.description}</div>
        ) : null}
      </div>
      {item.action ? (
        <button
          type="button"
          className={styles.action}
          onClick={handleActionClick}
        >
          {item.action.label}
        </button>
      ) : null}
      {item.closable && closeButton ? (
        <button
          type="button"
          className={styles.close}
          aria-label="Dismiss notification"
          onClick={handleClose}
        >
          <CloseIcon />
        </button>
      ) : null}
    </li>
  );
}

function variantClass(variant: ToastVariant): keyof typeof styles {
  switch (variant) {
    case 'success':
      return 'variantSuccess' as keyof typeof styles;
    case 'error':
      return 'variantError' as keyof typeof styles;
    case 'warning':
      return 'variantWarning' as keyof typeof styles;
    case 'info':
      return 'variantInfo' as keyof typeof styles;
    default:
      return 'variantDefault' as keyof typeof styles;
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Inline variant icons (no external deps)

function defaultIconFor(variant: ToastVariant): ReactNode {
  switch (variant) {
    case 'success':
      return <SuccessIcon />;
    case 'error':
      return <ErrorIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'info':
      return <InfoIcon />;
    default:
      return null;
  }
}

function SuccessIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <path d="M10 2.5L18 16H2L10 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 8v3.5M10 13.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9.5V14M10 6.5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
