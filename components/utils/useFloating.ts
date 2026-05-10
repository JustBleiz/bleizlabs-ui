'use client';

/**
 * useFloating — React hook that connects a reference + floating element to
 * the pure positioning math in `position.ts` and keeps them in sync under
 * window resize, document scroll, and element size changes.
 *
 * Hand-rolled to stay zero-runtime-dependency (per D5/D25 + E19 user override).
 * Shared across all Phase 10 floating components (Tooltip, Popover, DropdownMenu,
 * HoverCard, ContextMenu, Select, Combobox, NavigationMenu).
 *
 * API mirrors the Floating UI React hook surface (setReference/setFloating ref
 * setters + `floatingStyles` CSS object) so consumer code reads naturally:
 *
 *   const { refs, floatingStyles } = useFloating({ open, placement, offset });
 *   // <Trigger ref={refs.setReference} />
 *   // <Floating ref={refs.setFloating} style={floatingStyles} />
 *
 * SSR safety: all DOM access is scoped to useLayoutEffect — zero window/document
 * access during render. Floating element is not measured until it mounts in
 * the portal target.
 *
 * E20 extension: optional `arrow` option adds arrow middleware support for
 * Popover + HoverCard. When provided, `arrowStyles` is populated with the
 * arrow's CSS position (left/top) for the caller to apply to the arrow DOM
 * node. Consumers that do not need an arrow (Tooltip, DropdownMenu, Select,
 * Combobox, ContextMenu) pay zero cost — the hook skips arrow math entirely.
 */

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import {
  computePosition,
  computeArrowPosition,
  parsePlacement,
  type Placement,
} from './position';

export interface UseFloatingArrowOption {
  /** Ref pointing at the rendered arrow DOM element. Hook reads offsetWidth/offsetHeight each update. */
  ref: RefObject<HTMLElement | null>;
  /**
   * Minimum distance the arrow keeps from the floating element's corners
   * (typically the floating element's border-radius value). Default `4`.
   */
  padding?: number;
}

export interface UseFloatingOptions {
  /** Whether the floating element is currently open (visible + mounted). Updates skip when closed. */
  open: boolean;
  /** Preferred placement. Default `'top'`. */
  placement?: Placement;
  /** Gap in pixels between reference and floating. Default `6`. */
  offset?: number;
  /** Inner padding from viewport edges for flip + shift. Default `8`. */
  padding?: number;
  /**
   * Optional arrow support. When provided, the hook runs `computeArrowPosition`
   * on every update and returns `arrowStyles` for the consumer to apply to
   * the arrow DOM node. Omit this option to disable arrow math entirely.
   */
  arrow?: UseFloatingArrowOption;
}

export interface UseFloatingResult {
  refs: {
    /** Ref setter for the reference (trigger) element. */
    setReference: (node: HTMLElement | null) => void;
    /** Ref setter for the floating (content) element. */
    setFloating: (node: HTMLElement | null) => void;
  };
  /** Inline styles to apply to the floating element — `position: fixed` + computed `top`/`left`. */
  floatingStyles: CSSProperties;
  /**
   * Inline styles to apply to the arrow element — populated when the `arrow`
   * option is provided AND the arrow node has been measured (offsetWidth/Height
   * read by the positioning pass). Remains `undefined` during initial render
   * before the arrow mounts, or if the arrow node has zero measured dimensions.
   * Contains `position: absolute` + `left` or `top` (depending on placement
   * axis) in pixels when populated.
   */
  arrowStyles: CSSProperties | undefined;
  /** Actual placement after flip resolution (may differ from preferred). */
  placement: Placement;
  /** Force a recomputation — useful after content size change that isn't captured by ResizeObserver. */
  update: () => void;
}

/**
 * Connects a reference element + floating element to the positioning engine.
 * Automatically updates on window scroll, window resize, and — where available —
 * ResizeObserver events on both elements. No-ops while `open` is false to avoid
 * wasted work.
 *
 * Browser compatibility: ResizeObserver is guarded with `typeof ResizeObserver
 * !== 'undefined'`. In environments without ResizeObserver (older browsers,
 * jsdom without polyfill), static positioning (scroll + resize) still works,
 * but dynamic content-size changes on the floating or reference element won't
 * trigger repositioning. Call the returned `update()` manually after any known
 * content-size change if targeting those environments.
 */
export function useFloating(options: UseFloatingOptions): UseFloatingResult {
  const { open, placement = 'top', offset = 6, padding = 8, arrow } = options;

  const referenceRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLElement | null>(null);

  const [coords, setCoords] = useState<{ x: number; y: number; placement: Placement }>({
    x: 0,
    y: 0,
    placement,
  });
  const [arrowCoords, setArrowCoords] = useState<{ x?: number; y?: number }>({});
  // Trigger width — published as `--reference-width` CSS custom property on
  // the floating element so SCSS can size the popper to match (e.g.
  // `width: var(--reference-width); min-width: 200px;`). Critical for
  // listbox-family components (Select, Combobox, DropdownMenu,
  // NavigationMenu) where the popped surface should match the trigger
  // width with a minimum-width floor for narrow triggers. Components that
  // do not need this (Tooltip, Popover, ContextMenu where the trigger
  // doesn't determine width) can simply ignore the variable.
  const [referenceWidth, setReferenceWidth] = useState<number>(0);

  const arrowRef = arrow?.ref;
  const arrowPadding = arrow?.padding;

  const update = useCallback(() => {
    const reference = referenceRef.current;
    const floating = floatingRef.current;
    if (!reference || !floating) return;

    const referenceRect = reference.getBoundingClientRect();
    const floatingDimensions = {
      width: floating.offsetWidth,
      height: floating.offsetHeight,
    };

    const result = computePosition({
      reference: referenceRect,
      floating: floatingDimensions,
      placement,
      offset,
      padding,
    });

    // Bail-out guard (E136 bug 4): computePosition returns a fresh object
    // on every call even when the x/y/placement values are identical. Passing
    // a new object reference to setCoords forces React to re-render, which
    // runs the ref-setter callbacks and setReference/setFloating which call
    // update() again — classic "Maximum update depth exceeded" loop that
    // fires as soon as ResizeObserver or ref re-attachment ticks the cycle.
    // Comparing primitives here lets setCoords return the previous
    // reference when nothing changed — React's Object.is check then skips
    // the re-render entirely and the loop terminates.
    setCoords((prev) =>
      prev.x === result.x && prev.y === result.y && prev.placement === result.placement
        ? prev
        : result,
    );

    // Reference width — measured on every update so the popper can match
    // the trigger width via `--reference-width` CSS variable. Same bail-
    // out guard as coords above: identity-stable when unchanged.
    const nextWidth = Math.round(referenceRect.width);
    setReferenceWidth((prev) => (prev === nextWidth ? prev : nextWidth));

    // Optional arrow pass — skipped entirely when `arrow` option is omitted.
    if (arrowRef?.current) {
      const arrowNode = arrowRef.current;
      const arrowDimensions = {
        width: arrowNode.offsetWidth,
        height: arrowNode.offsetHeight,
      };
      const arrowResult = computeArrowPosition({
        reference: referenceRect,
        floatingCoords: { x: result.x, y: result.y },
        floatingDimensions,
        arrowDimensions,
        placement: result.placement,
        padding: arrowPadding,
      });
      // Same bail-out rationale as coords above — arrow computations produce
      // a fresh object each call; without guarding, any coords update would
      // cascade into an arrow update and keep the loop alive.
      setArrowCoords((prev) =>
        prev.x === arrowResult.x && prev.y === arrowResult.y ? prev : arrowResult,
      );
    }
  }, [placement, offset, padding, arrowRef, arrowPadding]);

  // Ref setters trigger update on mount — cannot use plain useRef because
  // consumers need update() to run the instant the floating element attaches.
  const setReference = useCallback(
    (node: HTMLElement | null) => {
      referenceRef.current = node;
      if (open && node && floatingRef.current) update();
    },
    [open, update],
  );

  const setFloating = useCallback(
    (node: HTMLElement | null) => {
      floatingRef.current = node;
      if (open && node && referenceRef.current) update();
    },
    [open, update],
  );

  // Continuous reposition while open — scroll (capture phase to catch ancestor
  // scrolls), resize, and size changes on either element. Cleanup on close /
  // unmount so we never leak listeners.
  useLayoutEffect(() => {
    if (!open) return;
    const reference = referenceRef.current;
    const floating = floatingRef.current;
    if (!reference || !floating) return;

    update();

    const handleUpdate = () => update();
    window.addEventListener('scroll', handleUpdate, { capture: true, passive: true });
    window.addEventListener('resize', handleUpdate);

    // ResizeObserver fires when floating content changes size (e.g. dynamic
    // text wrap at viewport edges after shift runs).
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleUpdate) : null;
    resizeObserver?.observe(reference);
    resizeObserver?.observe(floating);

    return () => {
      window.removeEventListener('scroll', handleUpdate, { capture: true });
      window.removeEventListener('resize', handleUpdate);
      resizeObserver?.disconnect();
    };
  }, [open, update]);

  const floatingStyles: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    transform: `translate3d(${Math.round(coords.x)}px, ${Math.round(coords.y)}px, 0)`,
    willChange: 'transform',
    // Trigger-width custom property — listbox-family popovers (Select,
    // Combobox, DropdownMenu, NavigationMenu) read this in SCSS via
    // `width: var(--reference-width)` to match trigger width, with their
    // own `min-width` setting the floor for narrow triggers. Components
    // that don't need width-matching (Tooltip, Popover, HoverCard,
    // ContextMenu) ignore the variable.
    ['--reference-width' as 'width']: `${referenceWidth}px`,
  };

  // Arrow styles — only populated when caller supplied an arrow ref AND the
  // last update produced a usable coord. The consumer applies these inline
  // on the arrow DOM node. Direction is derived from `coords.placement` so
  // the caller can additionally style via `data-placement` attribute if desired.
  let arrowStyles: CSSProperties | undefined;
  if (arrowRef) {
    const { side } = parsePlacement(coords.placement);
    const isVertical = side === 'top' || side === 'bottom';
    if (isVertical && typeof arrowCoords.x === 'number') {
      arrowStyles = { position: 'absolute', left: Math.round(arrowCoords.x) };
    } else if (!isVertical && typeof arrowCoords.y === 'number') {
      arrowStyles = { position: 'absolute', top: Math.round(arrowCoords.y) };
    }
  }

  return {
    refs: { setReference, setFloating },
    floatingStyles,
    arrowStyles,
    placement: coords.placement,
    update,
  };
}
