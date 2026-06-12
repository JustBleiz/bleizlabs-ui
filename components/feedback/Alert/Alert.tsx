import { forwardRef, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import styles from './Alert.module.scss';

/**
 * Alert — semantic feedback notification with 4 variants (klocek atom).
 *
 * @layer   atom (feedback)
 * @tokens  --color-{error,warning,info,success}{,-subtle,-strong},
 *          --color-surface{,-raised}, --color-text-{primary,secondary},
 *          --space-{1,3,4}, --font-size-{sm,base}, --font-weight-semibold,
 *          --line-height-{snug,normal}, --radius-{sm,md},
 *          --duration-{fast,normal}, --easing-default, --focus-ring,
 *          --size-touch-min (via `@include mx.touch-target`),
 *          fadeIn keyframe.
 * @deps    cn. Server-safe in the read-only case (see @notes).
 * @a11y    `variant="critical"` → `role="alert"` + `aria-live="assertive"`
 *          (interrupts SR immediately). Other variants → `role="status"` +
 *          `aria-live="polite"` (waits for next pause). Close button is native
 *          `<button type="button">` z `aria-label="Dismiss notification"` +
 *          44×44 touch target (coarse pointer). Title slot renders as plain `<div>` — consumer
 *          wraps own `<strong>`/`<Heading>` for semantic emphasis.
 *
 * @notes   No `'use client'` directive — Alert itself is purely
 *          presentational (no state, no effects). When `onClose` is
 *          supplied, the parent must naturally be a Client Component (you
 *          cannot pass function props from a Server Component anyway) —
 *          Alert remains RSC-compatible in the read-only case
 *          (`<Alert variant="info" title="..." />`).
 *
 *          SIMPLIFY 0.15.0 — dropped 3 props (`timestamp`, `href`, `closeIcon`)
 *          + #4 auto-wrap fix. 7 props → 4. Migration patterns:
 *          - timestamp → wrap inside description ReactNode:
 *            `description={<><span>copy</span><time dateTime={iso}>{iso}</time></>}`
 *          - href → wrap title in <Anchor>:
 *            `title={<Anchor href="...">Headline</Anchor>}`
 *          - closeIcon → no consumer override (default ✕ icon canonical;
 *            override via own custom Alert wrapper if truly needed)
 *
 * @example
 * <Alert
 *   variant="critical"
 *   title="Połączenie utracone"
 *   description="Sprawdź internet i spróbuj ponownie."
 *   onClose={() => setShow(false)}
 * />
 *
 * @example
 * // Linked title (consumer composes Anchor)
 * <Alert
 *   variant="info"
 *   title={<Anchor href="/changelog">Nowa wersja dostępna</Anchor>}
 *   description="Kliknij, aby zobaczyć changelog."
 * />
 *
 * @example
 * // Description z timestamp (consumer composes <time>)
 * <Alert
 *   variant="warning"
 *   title="Sesja wygasa"
 *   description={
 *     <>
 *       Wyloguje za 5 minut. <time dateTime="2026-05-10T14:30:00Z">14:30</time>
 *     </>
 *   }
 * />
 */
export type AlertVariant = 'critical' | 'warning' | 'info' | 'success';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Semantic variant — determines color, role, aria-live. Required. */
  variant: AlertVariant;
  /**
   * Primary headline. Free-form ReactNode — consumer wraps own emphasis atom
   * (`<strong>`, `<Heading>`, `<Anchor>`) or passes plain string for seed
   * bold styling via `.title` class.
   */
  title: ReactNode;
  /**
   * Secondary body copy. Free-form ReactNode — consumer wraps own typography
   * (or composes inline `<time>` / `<Anchor>` etc).
   */
  description?: ReactNode;
  /** Optional dismiss callback. When provided, ✕ close button renders. */
  onClose?: () => void;
}

const VARIANT_CLASS: Record<AlertVariant, string> = {
  critical: styles.variantCritical!,
  warning: styles.variantWarning!,
  info: styles.variantInfo!,
  success: styles.variantSuccess!,
};

function DefaultCloseIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="16" height="16">
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
  { variant, title, description, onClose, className, ...rest },
  ref,
) {
  const isCritical = variant === 'critical';
  const role = isCritical ? 'alert' : 'status';
  const ariaLive = isCritical ? 'assertive' : 'polite';

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
      <div className={styles.body}>
        <div className={styles.title}>{title}</div>
        {description ? <div className={styles.description}>{description}</div> : null}
      </div>
      {onClose ? (
        <button
          type="button"
          aria-label="Dismiss notification"
          className={styles.closeButton}
          onClick={handleCloseClick}
        >
          <DefaultCloseIcon />
        </button>
      ) : null}
    </div>
  );
});
