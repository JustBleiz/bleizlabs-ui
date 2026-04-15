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
 */

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { computePosition, type Placement } from './position';

export interface UseFloatingOptions {
  /** Whether the floating element is currently open (visible + mounted). Updates skip when closed. */
  open: boolean;
  /** Preferred placement. Default `'top'`. */
  placement?: Placement;
  /** Gap in pixels between reference and floating. Default `6`. */
  offset?: number;
  /** Inner padding from viewport edges for flip + shift. Default `8`. */
  padding?: number;
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
  /** Actual placement after flip resolution (may differ from preferred). */
  placement: Placement;
  /** Force a recomputation — useful after content size change that isn't captured by ResizeObserver. */
  update: () => void;
}

/**
 * Connects a reference element + floating element to the positioning engine.
 * Automatically updates on window scroll, window resize, and ResizeObserver
 * events on both elements. No-ops while `open` is false to avoid wasted work.
 */
export function useFloating(options: UseFloatingOptions): UseFloatingResult {
  const { open, placement = 'top', offset = 6, padding = 8 } = options;

  const referenceRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLElement | null>(null);

  const [coords, setCoords] = useState<{ x: number; y: number; placement: Placement }>({
    x: 0,
    y: 0,
    placement,
  });

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

    setCoords(result);
  }, [placement, offset, padding]);

  // Ref setters trigger update on mount — cannot use plain useRef because
  // Tooltip needs to run update() the instant the floating element attaches.
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
  };

  return {
    refs: { setReference, setFloating },
    floatingStyles,
    placement: coords.placement,
    update,
  };
}
