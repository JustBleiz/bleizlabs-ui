import * as React from 'react';
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import styles from './Button.module.scss';

/**
 * Button — primary interactive atom (Phase 4 I1).
 *
 * @layer   atom (interactive)
 * @tokens  --color-brand, --hover-brand, --active-brand, --shadow-brand,
 *          --color-surface, --color-surface-raised, --color-border,
 *          --color-border-strong (variantSecondary hover), --color-text-primary,
 *          --color-text-inverse, --color-warning, --focus-ring (consumed via
 *          `@include mx.focus-ring`), --radius-input, --space-{2..5},
 *          --font-secondary, --font-size-{sm,base,lg}, --font-weight-medium,
 *          --duration-fast, --easing-default.
 *          Component-local channels (not tokens): --button-padding-{x,y} +
 *          --button-font-size injected by size variants.
 * @deps    Slot (own primitive, asChild boundary), cn, React: `forwardRef`,
 *          type imports `AnchorHTMLAttributes`, `ButtonHTMLAttributes`,
 *          `ReactNode`
 * @a11y    Renders native `<button>` by default (carries focusable +
 *          keyboard semantics for free). Renders `<a>` automatically when
 *          `href` is provided. `asChild` projects onto a single ReactElement
 *          child (e.g., Next `<Link>`). `iconOnly` requires the consumer to
 *          pass `aria-label` because there is no visible text. Disabled
 *          state uses native `disabled` for `<button>` and
 *          `aria-disabled="true"` + `tabIndex={-1}` + href removal +
 *          `role="link"` retention + `onClick` suppression for `<a>`
 *          (anchors don't honor the `disabled` attribute; without `href`
 *          the implicit role degrades to `generic`, where `aria-disabled`
 *          is invalid — the explicit role keeps it a link for AT, and the
 *          suppressed handler means programmatic/AT activation cannot
 *          invoke it). For `asChild`, disabled is forwarded as BOTH
 *          `aria-disabled="true"` AND `data-disabled` so consumer-rendered
 *          elements stay accessible to assistive tech (WCAG 4.1.2
 *          Name/Role/Value); `onClick` is forwarded to the child only
 *          when NOT disabled. Note the forwarded `aria-disabled` also
 *          triggers the `.root[aria-disabled='true']` pointer-events
 *          lock for real pointers; the child's own `href`/handlers stay
 *          outside Button's control (Slot child-wins), so the JS guard
 *          covers only the Button-supplied handler.
 *          `variant="warning"` is intentionally VISUAL-ONLY — it signals
 *          destructive/caution actions (e.g., "Delete permanently") through
 *          color alone. NO `aria-live`, `role="alert"`, or runtime semantic
 *          injection is applied because Button is a user-triggered action,
 *          not a notification: the accessible name IS the button's label
 *          text (announced by SR on focus), which must itself convey the
 *          warning meaning (e.g., "Delete" not "Submit"). Consumers are
 *          responsible for writing label text that matches the visual
 *          warning — per WCAG 1.4.1 Use of Color, warning meaning must
 *          not be communicated by color alone.
 * @notes   The Button file itself has no `'use client'` directive — the
 *          `<button>` and `<a>` render paths are fully RSC-compatible
 *          (no internal state, no event handler injection). The
 *          `asChild` path imports `Slot`, which DOES carry a `'use client'`
 *          boundary — so consumers using `asChild` will pull a client
 *          boundary into their tree. Plain `<Button>` and `<Button href>`
 *          remain server-safe regardless. Hover/focus/active styling is
 *          CSS-only across all three render paths.
 * @regressions tests/Button.regression.spec.ts — BT-R01..BT-R05 (disabled
 *          href onClick suppression, pointer-events CSS layer, native
 *          disabled contrast, asChild onClick forwarding)
 *
 * @example
 * <Button onClick={save}>Save</Button>
 * <Button variant="secondary" size="sm">Cancel</Button>
 * <Button variant="primary" href="/dashboard">Go to dashboard</Button>
 * <Button variant="ghost" iconOnly icon={<TrashIcon />} aria-label="Delete" />
 * // Links: use `href` (renders <a>, server-safe) — NOT asChild+<Link>,
 * // which pulls Slot's 'use client' boundary for zero benefit (see @notes).
 * <Button variant="link" href="/docs">Documentation</Button>
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'rounded' | 'pill';

interface ButtonOwnProps {
  /** Visual variant. Default `primary`. */
  variant?: ButtonVariant;
  /** Size scale. Default `md`. */
  size?: ButtonSize;
  /**
   * Corner shape. Default `rounded` (uses `--radius-input` — backward-compat
   * with v0.3.x). `pill` uses `--radius-full` for capsule/rounded-pill look
   * — AreasSection pattern, opt-in CTA emphasis. Orthogonal to `variant`.
   */
  shape?: ButtonShape;
  /** Optional leading or trailing icon. */
  icon?: ReactNode;
  /** Icon position relative to the label. Default `left`. */
  iconPosition?: 'left' | 'right';
  /** Square button with no label. Requires `aria-label`. Default `false`. */
  iconOnly?: boolean;
  /** Render as an `<a>` link. Mutually exclusive with `asChild`. */
  href?: string;
  /** Full-width within parent. Default `false`. */
  fullWidth?: boolean;
  /**
   * Native button `type` attribute. Default `'button'` — this is
   * intentionally NOT `'submit'` to avoid accidental form submissions
   * when a Button is dropped inside a form without an explicit type.
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * Render as the single child element via Slot. For links prefer the
   * `href` prop (server-safe) — `asChild` pulls Slot's `'use client'`
   * boundary; reserve it for elements without a dedicated prop.
   */
  asChild?: boolean;
}

export type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>, 'color'>;

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: styles.variantPrimary!,
  secondary: styles.variantSecondary!,
  ghost: styles.variantGhost!,
  link: styles.variantLink!,
  warning: styles.variantWarning!,
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
};

const SHAPE_CLASS: Record<ButtonShape, string> = {
  rounded: styles.shapeRounded!,
  pill: styles.shapePill!,
};

export const Button = forwardRef<HTMLElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    shape = 'rounded',
    icon,
    iconPosition = 'left',
    iconOnly = false,
    href,
    fullWidth = false,
    asChild = false,
    type,
    disabled,
    className,
    style,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const isLink = href !== undefined;

  const rootClass = cn(
    styles.root,
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    SHAPE_CLASS[shape],
    iconOnly && styles.iconOnly,
    fullWidth && styles.fullWidth,
    className,
  );

  const inner = (
    <>
      {icon && iconPosition === 'left' && !iconOnly ? (
        <span aria-hidden="true" className={styles.icon}>
          {icon}
        </span>
      ) : null}
      {!iconOnly && children ? <span className={styles.label}>{children}</span> : null}
      {iconOnly ? (
        <span aria-hidden="true" className={styles.icon}>
          {icon}
        </span>
      ) : null}
      {icon && iconPosition === 'right' && !iconOnly ? (
        <span aria-hidden="true" className={styles.icon}>
          {icon}
        </span>
      ) : null}
    </>
  );

  if (isLink) {
    const anchorRest = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    const anchorOnClick = disabled
      ? undefined
      : (onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined);
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={disabled ? undefined : href}
        className={rootClass}
        style={style}
        role={disabled ? 'link' : undefined}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        {...(anchorOnClick ? { onClick: anchorOnClick } : {})}
        {...anchorRest}
      >
        {inner}
      </a>
    );
  }

  if (asChild) {
    // Slot expects EXACTLY ONE React element child (isValidElement check). In
    // `asChild`, that child is the consumer's own element (e.g. Next `<Link>`)
    // and Slot projects Button's className + style onto it. Passing `inner`
    // (a Fragment with conditional icon/label spans) produced a React children
    // array — `isValidElement` returns false for arrays → Slot rendered null,
    // silently swallowing the Button (observed as empty `<Inline>` in DOM with
    // Next.js 16 RSC passing Fragment children as array across client boundary).
    //
    // Consumers who want icon-wrapping with asChild must include the icon
    // markup in their own child (single element — for plain links don't use
    // asChild at all, use `<Button href>`):
    //
    // <Button asChild variant="link">
    //   <SomeInteractiveElement><Icon /> Documentation</SomeInteractiveElement>
    // </Button>
    return (
      <Slot
        ref={ref as React.Ref<HTMLElement>}
        className={rootClass}
        style={style}
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        {...(onClick && !disabled
          ? { onClick: onClick as React.MouseEventHandler<HTMLElement> }
          : {})}
        {...(rest as React.HTMLAttributes<HTMLElement>)}
      >
        {children}
      </Slot>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type ?? 'button'}
      className={rootClass}
      style={style}
      disabled={disabled}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement> | undefined}
      {...buttonRest}
    >
      {inner}
    </button>
  );
});
