import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

/**
 * usePointerDrag — unified PointerEvent + setPointerCapture drag primitive.
 *
 * @extracted E39 refactor Epic (post-Phase 10) per Rule of Three fired at E35.
 * Three stable consumers with distinct commit semantics:
 *   - Slider E33 (track: continuous-value commit via valueFromPointer)
 *   - Carousel E34 (viewport: discrete-snap via threshold → ±1 index)
 *   - ScrollArea E35 (thumb: ratio-based scrollTo via delta-pixel)
 *
 * @pattern React `onPointer*` handlers on the capturing element (NOT
 * document listeners). setPointerCapture re-targets pointer events to
 * the capturing element, so React handlers on that element receive them
 * even when the pointer leaves visible bounds. Cleaner than document
 * listeners — no leak concerns on unmount.
 *
 * @contract
 * - `onDragStart` fires on pointerdown BEFORE capture. Return `false` to
 *   cancel (no capture, no further callbacks). `void` or no return =
 *   proceed with capture.
 * - `onDragMove` fires on pointermove while capture active + pointerId
 *   matches. Guards against stale pointers.
 * - `onDragEnd` fires on pointerup with guard. Capture is released
 *   BEFORE the callback fires.
 * - `onDragCancel` fires on pointercancel (OS interrupts like phone
 *   call, gesture conflict, stylus lift). If undefined, behaves like
 *   `onDragEnd` minus the commit semantic — consumer decides rollback
 *   vs finalize.
 *
 * @returns `{ handlers, isDragging }`. Spread `handlers` onto the
 * capturing element's JSX: `<div {...handlers}>`. `isDragging` is React
 * state (toggles on start/end, NOT on every move) — use for
 * `data-dragging` attribute or conditional CSS.
 *
 * @zero-dep Per D5/D25. Uses only React primitives + native
 * PointerEvent API.
 *
 * @example
 * ```tsx
 * // Slider E33 track (continuous-value):
 * const { handlers } = usePointerDrag<HTMLSpanElement>({
 *   enabled: !disabled && !readOnly,
 *   onDragStart: (event) => {
 *     const next = valueFromPointer(event.clientX, event.clientY);
 *     commit(next);
 *   },
 *   onDragMove: (event) => {
 *     const next = valueFromPointer(event.clientX, event.clientY);
 *     commit(next);
 *   },
 *   onDragEnd: () => commitFinal(latestValueRef.current),
 * });
 * return <span {...handlers}>...</span>;
 * ```
 */

export interface UsePointerDragOptions<TElement extends HTMLElement = HTMLElement> {
  /**
   * Called on pointerdown BEFORE pointer capture. Return `false` to
   * cancel (no capture, no further callbacks). Use this to stash initial
   * pointer coords / start state / first commit value.
   */
  onDragStart?: (event: ReactPointerEvent<TElement>) => void | false;
  /**
   * Called on pointermove while capture is active and pointerId
   * matches. Use this to compute delta / update transform / commit
   * interim value.
   */
  onDragMove?: (event: ReactPointerEvent<TElement>) => void;
  /**
   * Called on pointerup with guard. Pointer capture is released BEFORE
   * this fires. Use this to commit final value / snap to discrete
   * position / trigger onValueCommit.
   */
  onDragEnd?: (event: ReactPointerEvent<TElement>) => void;
  /**
   * Called on pointercancel (OS interrupts, gesture conflicts). Pointer
   * capture is released BEFORE this fires. If undefined, drag state is
   * simply cleaned up without a consumer callback — consumer decides
   * rollback vs finalize semantics.
   */
  onDragCancel?: (event: ReactPointerEvent<TElement>) => void;
  /**
   * Gate for the entire drag interaction. When `false`, `onPointerDown`
   * is a no-op. Default `true`.
   */
  enabled?: boolean;
}

export interface UsePointerDragHandlers<TElement extends HTMLElement = HTMLElement> {
  onPointerDown: (event: ReactPointerEvent<TElement>) => void;
  onPointerMove: (event: ReactPointerEvent<TElement>) => void;
  onPointerUp: (event: ReactPointerEvent<TElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<TElement>) => void;
}

export interface UsePointerDragReturn<TElement extends HTMLElement = HTMLElement> {
  /**
   * Spread onto the capturing element's JSX:
   * `<div {...handlers}>`. Handler identities are stable within the
   * hook's lifecycle (wrapped in `useMemo`).
   */
  handlers: UsePointerDragHandlers<TElement>;
  /**
   * True between `onDragStart` (after capture) and `onDragEnd`/
   * `onDragCancel`. Toggles ONCE per drag cycle (not on every move).
   * Use for `data-dragging` attribute or conditional styles.
   */
  isDragging: boolean;
}

export function usePointerDrag<TElement extends HTMLElement = HTMLElement>({
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
  enabled = true,
}: UsePointerDragOptions<TElement>): UsePointerDragReturn<TElement> {
  const activePointerIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<TElement>) => {
      if (!enabled) return;
      const target = event.currentTarget;
      if (!target) return;
      const result = onDragStart?.(event);
      if (result === false) return;
      target.setPointerCapture(event.pointerId);
      activePointerIdRef.current = event.pointerId;
      isDraggingRef.current = true;
      setIsDragging(true);
    },
    [enabled, onDragStart],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<TElement>) => {
      if (!isDraggingRef.current) return;
      if (event.pointerId !== activePointerIdRef.current) return;
      onDragMove?.(event);
    },
    [onDragMove],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<TElement>) => {
      if (event.pointerId !== activePointerIdRef.current) return;
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      activePointerIdRef.current = null;
      setIsDragging(false);
      const target = event.currentTarget;
      if (target && target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }
      onDragEnd?.(event);
    },
    [onDragEnd],
  );

  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<TElement>) => {
      if (event.pointerId !== activePointerIdRef.current) return;
      isDraggingRef.current = false;
      activePointerIdRef.current = null;
      setIsDragging(false);
      const target = event.currentTarget;
      if (target && target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }
      onDragCancel?.(event);
    },
    [onDragCancel],
  );

  const handlers = useMemo<UsePointerDragHandlers<TElement>>(
    () => ({
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    }),
    [handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel],
  );

  return { handlers, isDragging };
}
