import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import styles from './Avatar.module.scss';

/**
 * Avatar — user identity image with text-initials fallback (Phase 3 D5).
 *
 * @layer   atom (display)
 * @tokens  --color-surface-raised, --color-bg,
 *          --color-text-{secondary,muted}, --color-{success,warning,error},
 *          --radius-{lg,full}, --font-weight-semibold.
 *          Literal px dimensions (24/32/40/56/80 width+height; 10/12/14/18/26
 *          font-size) encode the Avatar size scale directly — not tokens,
 *          intentional design choice for fixed-scale identity avatars.
 * @deps    Slot (own primitive, asChild boundary), cn, React: `forwardRef`,
 *          type imports `CSSProperties`, `HTMLAttributes<HTMLSpanElement>`
 * @a11y    Renders `<span>` (inline) by default. The image (when present)
 *          carries the `alt` attribute; the fallback initials are
 *          decorated with `aria-hidden` because the visible text duplicates
 *          the accessible name carried by the parent (the consumer should
 *          set `aria-label` on Avatar if used outside an immediate naming
 *          context like a row with the user's name).
 * @notes   Server-Component safe. Fallback chain: `src` → `fallback` text
 *          → empty colored surface. There is no JS-side onError fallback —
 *          if `src` is provided and fails to load, the browser shows the
 *          broken-image icon. Wrap in a client component if runtime
 *          recovery is required.
 *
 * @example
 * <Avatar src="/me.jpg" alt="Anna Kowalski" />
 * <Avatar fallback="AK" alt="Anna Kowalski" size="lg" />
 * @example
 * // Status indicator — consumer composes <Avatar> + <Dot> overlay (E07.x SIMPLIFY 0.15.0):
 * <span style={{ position: 'relative' }}>
 *   <Avatar fallback="AK" alt="Anna Kowalski" />
 *   <Dot color="success" style={{ position: 'absolute', bottom: 0, right: 0 }} />
 * </span>
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'rounded';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Image source URL. Optional — falls back to `fallback` initials. */
  src?: string;
  /** Accessible name. Required for both image and fallback paths. */
  alt: string;
  /** Initials shown when no `src` is provided. Typically 1-2 chars. */
  fallback?: string;
  /** Size scale. Default `md` (40px). */
  size?: AvatarSize;
  /** Shape. Default `circle`. */
  shape?: AvatarShape;
  /** Render as the single child element via Slot. */
  asChild?: boolean;
}

const SIZE_CLASS: Record<AvatarSize, string> = {
  xs: styles.sizeXs!,
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
  xl: styles.sizeXl!,
};

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt, fallback, size = 'md', shape = 'circle', asChild = false, className, style, ...rest },
  ref,
) {
  const Comp = asChild ? Slot : 'span';

  const avatarStyle: CSSProperties = {
    ...style,
  };

  return (
    <Comp
      ref={ref}
      className={cn(
        styles.root,
        SIZE_CLASS[size],
        shape === 'circle' ? styles.shapeCircle : styles.shapeRounded,
        className,
      )}
      style={avatarStyle}
      {...rest}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className={styles.image} />
      ) : fallback ? (
        <span aria-hidden="true" className={styles.fallback}>
          {fallback}
        </span>
      ) : null}
    </Comp>
  );
});
