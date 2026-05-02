'use client';

// Why `'use client'`: RevealStack composes <Reveal>, which uses
// IntersectionObserver. The 'use client' boundary is inherited from Reveal —
// declared here so consumers can see it at the import site without diving
// into the atom.
import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Stack } from '../../layout/Stack';
import { Reveal, type RevealTag } from '../../display/Reveal';
import { cn } from '../../utils/cn';
import type { SpaceIndex } from '../../types/spacing';

/**
 * RevealStack — scroll-triggered section wrapper with vertical flex layout
 * (Phase 7 Molecule, server-safe wrapper around Reveal+Stack composition).
 *
 * @layer       molecule (composition: Reveal atom + Stack atom)
 * @tokens      --space-{0..20} (passed through to inner Stack via `gap`).
 *              No own tokens — purely a composition convenience.
 * @deps        Reveal (own atom, behavior gate; `RevealTag` re-used for `tag`
 *              prop), Stack (own atom, layout), cn, SpaceIndex type,
 *              React: `forwardRef`, type imports `CSSProperties`,
 *              `HTMLAttributes<HTMLElement>`, `ReactNode`
 * @a11y        Renders any intrinsic semantic tag via `tag` prop (constrained
 *              `RevealTag` union) or any element via `asChild` (Slot,
 *              delegated to Reveal). Pure layout primitive — no own role/ARIA. Reveal
 *              annotates the wrapper with `data-revealed='true'` once
 *              intersected; consumer styles transitions via attribute
 *              selector. Stack handles flex-column layout — direct children
 *              get uniform gap.
 * @notes       Common case: `<RevealStack tag="section" gap={3}>` for panel
 *              sections (header → body uniform vertical rhythm). For pure
 *              behavior without layout (consumer owns inner structure), use
 *              `<Reveal asChild>` directly — RevealStack is opt-in DX
 *              convenience for the 90% case where section wants flex-column
 *              + single gap. For nested body groups with different gap, wrap
 *              children in their own `<Stack gap={M}>` (composition over new
 *              prop). The `forwardRef` ref type is fixed to `HTMLElement`;
 *              with asChild on Reveal, actual DOM node may differ — accepted
 *              trade-off (Reveal precedent).
 *
 *              **className target:** `className` lands on the OUTER Reveal
 *              wrapper (the element that carries `data-revealed`), NOT on
 *              the inner Stack flex container. This is intentional — the
 *              90% use case is consumer styling reveal-driven CSS
 *              transitions on the wrapper (opacity/transform via
 *              `[data-revealed='true']` selector). To style the inner flex
 *              layout (e.g. add background to body group), wrap children
 *              in your own `<Stack className={...}>` instead.
 *
 * @example
 * <RevealStack tag="section" gap={3} aria-label="Twoja strefa">
 *   <SectionHeader label="Twoja strefa" />
 *   <Card>...</Card>
 *   <Card>...</Card>
 * </RevealStack>
 *
 * // Body sub-group with own tighter rhythm:
 * <RevealStack tag="section" gap={3}>
 *   <SectionHeader label="Lista" />
 *   <Stack gap={2}>
 *     <ListItem />
 *     <ListItem />
 *     <ListItem />
 *   </Stack>
 * </RevealStack>
 */
export interface RevealStackProps extends HTMLAttributes<HTMLElement> {
  /** Intrinsic semantic tag override (forwarded to Reveal). Default `'div'`. Use `'section'` for page bands. Ignored when `asChild` is true. */
  tag?: RevealTag;
  /** Render as the single ReactElement child via Slot (overrides `tag`, forwarded to Reveal). */
  asChild?: boolean;
  /** Children — typically header + body content. */
  children?: ReactNode;
  /** Gap between direct children. Maps to `--space-{n}`. Default `3` (16px) — canonical section header→body + uniform body rhythm. */
  gap?: SpaceIndex;
  /** Cross-axis alignment of children (forwarded to Stack). Default `stretch`. */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Main-axis alignment of the children block (forwarded to Stack). Default `start`. */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** IntersectionObserver threshold (forwarded to Reveal). Default `0.15`. */
  threshold?: number;
  /** IntersectionObserver `rootMargin` (forwarded to Reveal). Default `'0px 0px -10% 0px'`. */
  rootMargin?: string;
  /** Skip observer — `data-revealed='true'` on mount. Use for above-the-fold sections. Default `false`. */
  immediate?: boolean;
  /** Disable observer entirely. Useful for test fixtures. Default `false`. */
  disabled?: boolean;
}

export const RevealStack = forwardRef<HTMLElement, RevealStackProps>(
  function RevealStack(
    {
      tag,
      asChild,
      children,
      className,
      gap = 3,
      align,
      justify,
      threshold,
      rootMargin,
      immediate,
      disabled,
      style,
      ...rest
    },
    forwardedRef,
  ) {
    return (
      <Reveal
        ref={forwardedRef}
        tag={tag}
        asChild={asChild}
        className={cn(className)}
        threshold={threshold}
        rootMargin={rootMargin}
        immediate={immediate}
        disabled={disabled}
        style={style as CSSProperties | undefined}
        {...rest}
      >
        <Stack gap={gap} align={align} justify={justify}>
          {children}
        </Stack>
      </Reveal>
    );
  },
);
