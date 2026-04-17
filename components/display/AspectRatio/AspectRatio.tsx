import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import styles from './AspectRatio.module.scss';

/**
 * AspectRatio — media container with fixed aspect ratio (Phase 3 D8, Tier B).
 *
 * @layer   atom (display)
 * @tokens  none — pure layout primitive. Component-local `--aspect-ratio`
 *          carries the tsx-computed numeric ratio into .root's native CSS
 *          `aspect-ratio` property.
 * @deps    Slot (own primitive, asChild boundary), cn, React: `forwardRef`,
 *          type imports `CSSProperties`, `HTMLAttributes<HTMLDivElement>`,
 *          `ReactNode`
 * @a11y    Renders `<div>` by default. Pure layout primitive — no role.
 *          The contained image / video / iframe owns its own a11y
 *          (alt, title, aria-label).
 * @notes   Server-Component safe. Uses native CSS `aspect-ratio` property
 *          (Baseline since 2021, supported by all modern browsers). The
 *          child element is positioned absolutely to fill the box —
 *          combine with `object-fit: cover` on `<img>` / `<video>` for
 *          standard media-fill behavior.
 *
 * @example
 * <AspectRatio ratio={16 / 9}>
 *   <img src="/hero.jpg" alt="Hero" />
 * </AspectRatio>
 *
 * <AspectRatio ratio={1}>
 *   <iframe title="Map" src="..." />
 * </AspectRatio>
 */
export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /** Aspect ratio as width / height. Default `16 / 9`. */
  ratio?: number;
  /** Render as the single child element via Slot. */
  asChild?: boolean;
  /** Media content. */
  children?: ReactNode;
}

export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  function AspectRatio(
    {
      ratio = 16 / 9,
      asChild = false,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const Comp = asChild ? Slot : 'div';

    const arStyle: CSSProperties = {
      '--aspect-ratio': String(ratio),
      ...style,
    } as CSSProperties;

    return (
      <Comp
        ref={ref}
        className={cn(styles.root, className)}
        style={arStyle}
        {...rest}
      >
        <span className={styles.inner}>{children}</span>
      </Comp>
    );
  },
);
