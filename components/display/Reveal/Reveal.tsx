'use client';

// Why `'use client'`: Reveal uses `IntersectionObserver` (browser-only API)
// + `useState`/`useEffect`/`useRef` to gate the `data-revealed` attribute on
// viewport entry. This creates a client boundary at every Reveal call site;
// children render on the server normally because Reveal never awaits or
// transforms them — it only annotates its own wrapper element.
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';

// Intrinsic semantic tags accepted by `<Reveal tag>`. Mirrors Section's
// `tag` precedent — keeps the API small + type-safe for the common case.
// Use `asChild` (Slot) to project onto a custom component or any tag
// outside this list.
export type RevealTag =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'header'
  | 'footer'
  | 'main'
  | 'nav'
  | 'li';

/**
 * Reveal — scroll-triggered IntersectionObserver gate atom (Phase 3 D9, Tier B).
 *
 * @layer       atom (display — behavior wrapper, no own visual)
 * @tokens      none — purely behavioral; consumer styles via
 *              `[data-revealed='true']` SCSS attribute selector.
 * @deps        Slot (own primitive, asChild boundary), cn, mergeRefs,
 *              React: `forwardRef`, `useEffect`, `useRef`, `useState`,
 *              type imports `CSSProperties`, `ElementType`,
 *              `HTMLAttributes<HTMLElement>`, `ReactNode`
 * @a11y        Pure visual reveal — no role, no ARIA, no focus impact.
 *              Adds `data-revealed='true'` once element intersects viewport.
 *              Screen-reader users see content immediately (data-attr drives
 *              CSS transitions only). Consumers must ensure content is
 *              keyboard-accessible regardless of reveal state — never gate
 *              interactive controls behind reveal animations.
 * @notes       One-shot: observer disconnects after first intersection (no
 *              retrigger on re-scroll). Client component because of
 *              `IntersectionObserver` + state. Tag selection: `tag` for
 *              intrinsic semantic elements (constrained `RevealTag` union —
 *              Section precedent), `asChild` (via Slot) for projection onto
 *              custom components or any tag outside the union. The
 *              `forwardRef` ref type is fixed to `HTMLElement`; with
 *              `asChild` the actual DOM node may differ — accepted
 *              trade-off of the asChild pattern (Stack/Inline/Card precedent).
 *
 * @example
 * <Reveal tag="section" aria-label="Hero" className={styles.hero}>
 *   <Heading>Welcome</Heading>
 * </Reveal>
 *
 * // Consumer SCSS owns the transition + reduced-motion handling:
 * .hero {
 *   opacity: 0;
 *   transform: translateY(12px);
 *   transition: opacity 0.5s var(--easing-default), transform 0.5s var(--easing-default);
 * }
 * .hero[data-revealed='true'] {
 *   opacity: 1;
 *   transform: none;
 * }
 * @media (prefers-reduced-motion: reduce) {
 *   .hero { opacity: 1; transform: none; transition: none; }
 * }
 *
 * <Reveal asChild>
 *   <article className={styles.card}>...</article>
 * </Reveal>
 *
 * <Reveal immediate tag="section">
 *   ... above-the-fold LCP — skip observer, render revealed immediately ...
 * </Reveal>
 */
export interface RevealProps extends HTMLAttributes<HTMLElement> {
  /** Intrinsic semantic tag override. Default `'div'`. Use `'section'` for page bands, `'article'` for self-contained content. Ignored when `asChild` is true. */
  tag?: RevealTag;
  /** Render as the single ReactElement child via Slot (overrides `tag`). */
  asChild?: boolean;
  /** Content to render — passes through unchanged. */
  children?: ReactNode;
  /** Fraction of element visible to trigger reveal (0-1). Default `0.15`. */
  threshold?: number;
  /** IntersectionObserver `rootMargin`. Default `'0px 0px -10% 0px'` (push trigger up — fires "chwilę po scroll" once meaningfully in view, not just top edge). */
  rootMargin?: string;
  /** Skip observer — element is `data-revealed='true'` on mount. Use for above-the-fold LCP content (eliminates flash-of-unrevealed). Default `false`. */
  immediate?: boolean;
  /** Disable observer entirely — `data-revealed` never set. Useful for test fixtures / Storybook (deterministic snapshots). Default `false`. */
  disabled?: boolean;
}

export const Reveal = forwardRef<HTMLElement, RevealProps>(function Reveal(
  {
    tag,
    asChild = false,
    children,
    className,
    threshold = 0.15,
    rootMargin = '0px 0px -10% 0px',
    immediate = false,
    disabled = false,
    style,
    ...rest
  },
  forwardedRef,
) {
  const localRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState<boolean>(immediate);

  useEffect(() => {
    if (disabled || immediate) return;
    const el = localRef.current;
    if (!el) return;
    // Defensive: SSR-safe guard. useEffect already runs only client-side, but
    // older Node test environments without IntersectionObserver should no-op
    // gracefully rather than throw — consumer can polyfill or pass
    // `disabled` for test fixtures.
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, immediate, disabled]);

  const Comp: ElementType = asChild ? Slot : (tag ?? 'div');
  const mergedRef = mergeRefs<HTMLElement>(localRef, forwardedRef);

  return (
    <Comp
      ref={mergedRef}
      className={cn(className)}
      data-revealed={revealed ? 'true' : undefined}
      style={style as CSSProperties | undefined}
      {...rest}
    >
      {children}
    </Comp>
  );
});
