import { useMemo, useSyncExternalStore } from 'react';

/**
 * useMatchMedia — subscribe to a CSS media query with SSR-safe reactivity.
 *
 * @extracted E40 refactor Epic (post-Phase 10 consolidation #2) per Rule
 * of Three fired at E38. Three stable consumers of the pattern:
 *   - Carousel E34 (`prefers-reduced-motion: reduce`)
 *   - ScrollArea E35 (`pointer: coarse` + `prefers-reduced-motion: reduce`)
 *   - Sidebar E38 (`max-width: <breakpoint - 1>px` for mobile detection)
 *
 * @pattern `useSyncExternalStore` is the canonical React 19 primitive for
 * subscribing to browser-owned state (matchMedia is the classic example
 * cited in the React docs). The hook guarantees:
 *  - SSR safety (server snapshot returns `false`, no hydration mismatch
 *    because React treats the server render as authoritative on first
 *    paint)
 *  - Tear-free reads during concurrent rendering
 *  - Automatic re-subscription when the query changes (via useMemo'd
 *    factories keyed on query string)
 *
 * @serverSnapshot Always returns `false`. On client hydration React
 * transitions to the real snapshot. If you need a different server
 * default (e.g. assume mobile for specific routes), do it at the
 * consumer level via feature flag / conditional render, not here.
 *
 * @zero-dep Per D5/D25. Uses only React primitives + native matchMedia.
 *
 * @example
 * ```tsx
 * // Carousel — pause auto-rotation when reduced motion preferred
 * const isReducedMotion = useMatchMedia('(prefers-reduced-motion: reduce)');
 *
 * // ScrollArea — hide custom scrollbars on coarse pointers (touch)
 * const isPointerCoarse = useMatchMedia('(pointer: coarse)');
 *
 * // Sidebar — switch to mobile drawer below breakpoint
 * const isMobile = useMatchMedia(`(max-width: ${breakpoint - 1}px)`);
 * ```
 */
export function useMatchMedia(query: string): boolean {
  const subscribe = useMemo(
    () =>
      (notify: () => void): (() => void) => {
        if (typeof window === 'undefined') return () => {};
        const media = window.matchMedia(query);
        media.addEventListener('change', notify);
        return () => media.removeEventListener('change', notify);
      },
    [query],
  );

  const getSnapshot = useMemo(
    () => (): boolean => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia(query).matches;
    },
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function getServerSnapshot(): boolean {
  return false;
}
