'use client';

import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { usePointerDrag } from '../../utils/gesture';
import { useMatchMedia } from '../../utils/match-media';
import styles from './ScrollArea.module.scss';

/**
 * ScrollArea — accessible custom-scrollbar wrapper (Phase 10 CI20).
 *
 * @layer    complex-interactive
 * @tokens   --color-border, --color-text-muted, --focus-ring (via mixin),
 *           --radius-full, --duration-fast, --easing-default
 * @deps     cn, mergeRefs, usePointerDrag (E39 — 3rd drag consumer,
 *           triggered Rule of Three extraction), useMatchMedia (E40 —
 *           coarse pointer + PRM detection)
 * @apg      N/A — no APG pattern for scroll regions; WCAG 2.1.1 satisfied via
 *           viewport `tabIndex={0}` preserving native keyboard scroll.
 * @a11y     No specific APG pattern — scroll regions are implicit browser
 *           behavior. Viewport is keyboard-focusable (`tabIndex={0}`) so
 *           native PageUp/Dn/Arrow/Home/End/Space still work. Custom
 *           scrollbars are VISUAL + POINTER-DRAG only — not keyboard-
 *           focusable (user keyboards on viewport). Native scrollbars
 *           hidden via `scrollbar-width: none` (Firefox) + `::-webkit-
 *           scrollbar { display: none }` (WebKit/Chromium). WCAG 1.4.4
 *           (Resize text 200%) preserved by native overflow behavior.
 *           WCAG 2.1.1 keyboard works via viewport tabIndex. `prefers-
 *           reduced-motion` uses `behavior: 'instant'` for track click-
 *           to-page. 3rd drag-gesture consumer (Slider E33 = 1st,
 *           Carousel E34 = 2nd); inline drag per Rule of Three — `utils/
 *           gesture/usePointerDrag.ts` extraction deferred to E36
 *           refactor Epic (E23/E29 precedent: extract AFTER all 3
 *           consumers ship with stable semantics).
 * @tested   tsc + eslint + next build | Playwright suite EXECUTED in-repo
 *           (keyboard/focus/aria/regression `.spec.ts` quad, CI-gated) +
 *           axe-core smoke on the demo route. DEFERRED: manual NVDA sweep.
 * @regressions tests/ScrollArea.{keyboard,focus,aria,regression}.spec.md —
 *           16 regression cases SA-R01..SA-R16 (executable canon in the
 *           sibling `tests/ScrollArea.*.spec.ts` quad).
 *
 * @example
 * // Auto-default children (both scrollbars + viewport)
 * <ScrollArea style={{ height: 300 }}>
 *   <div>Long content...</div>
 * </ScrollArea>
 *
 * @example
 * // Composition slot (advanced)
 * <ScrollArea visibility="always">
 *   <ScrollAreaViewport>
 *     <MyContent />
 *   </ScrollAreaViewport>
 *   <ScrollAreaScrollbar orientation="vertical">
 *     <ScrollAreaThumb />
 *   </ScrollAreaScrollbar>
 *   <ScrollAreaScrollbar orientation="horizontal">
 *     <ScrollAreaThumb />
 *   </ScrollAreaScrollbar>
 *   <ScrollAreaCorner />
 * </ScrollArea>
 */

// ============================================================================
// Types
// ============================================================================

export type ScrollAreaVisibility = 'always' | 'scroll' | 'hover' | 'auto';
export type ScrollAreaOrientation = 'vertical' | 'horizontal';
export type ScrollAreaDir = 'ltr' | 'rtl';

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  /** Scrollbar visibility mode. Default `'scroll'`. */
  visibility?: ScrollAreaVisibility;
  /** Auto-hide delay after scroll stops. Default 600ms. Only applies to `visibility='scroll'`. */
  hideDelay?: number;
  /** Writing direction. Default `'ltr'`. */
  dir?: ScrollAreaDir;
  /** Scrollable content rendered inside the viewport. */
  children: ReactNode;
}

export interface ScrollAreaViewportProps extends HTMLAttributes<HTMLDivElement> {
  /** Scrollable content — the overflowing markup this viewport clips and scrolls. */
  children: ReactNode;
}

export interface ScrollAreaScrollbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Orientation of this scrollbar. Default `'vertical'`. */
  orientation?: ScrollAreaOrientation;
  /** If omitted, auto-renders a `<ScrollAreaThumb />`. */
  children?: ReactNode;
}

export type ScrollAreaThumbProps = HTMLAttributes<HTMLDivElement>;

export type ScrollAreaCornerProps = HTMLAttributes<HTMLDivElement>;

// ============================================================================
// Context
// ============================================================================

interface ScrollAreaMetrics {
  scrollTop: number;
  scrollLeft: number;
  clientHeight: number;
  clientWidth: number;
  scrollHeight: number;
  scrollWidth: number;
}

interface ScrollAreaContextValue {
  viewportRef: React.RefObject<HTMLDivElement | null>;
  setViewportEl: (el: HTMLDivElement | null) => void;
  metrics: ScrollAreaMetrics;
  visibility: ScrollAreaVisibility;
  dir: ScrollAreaDir;
  isScrolling: boolean;
  isHovering: boolean;
  isDraggingThumb: boolean;
  isPointerCoarse: boolean;
  reducedMotion: boolean;
  hasVerticalScroll: boolean;
  hasHorizontalScroll: boolean;
  setIsDraggingThumb: (value: boolean) => void;
  setIsScrolling: (value: boolean) => void;
}

const ScrollAreaContext = createContext<ScrollAreaContextValue | null>(null);

function useScrollAreaContext(componentName: string): ScrollAreaContextValue {
  const ctx = useContext(ScrollAreaContext);
  if (!ctx) {
    throw new Error(`<${componentName}> must be rendered inside <ScrollArea>`);
  }
  return ctx;
}

// ============================================================================
// ScrollArea (root)
// ============================================================================

const DEFAULT_METRICS: ScrollAreaMetrics = {
  scrollTop: 0,
  scrollLeft: 0,
  clientHeight: 0,
  clientWidth: 0,
  scrollHeight: 0,
  scrollWidth: 0,
};

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { visibility = 'scroll', hideDelay = 600, dir = 'ltr', className, children, ...rest },
  ref,
) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [metrics, setMetrics] = useState<ScrollAreaMetrics>(DEFAULT_METRICS);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);
  const isPointerCoarse = useMatchMedia('(pointer: coarse)');
  const reducedMotion = useMatchMedia('(prefers-reduced-motion: reduce)');

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setViewportEl = useCallback((el: HTMLDivElement | null) => {
    viewportRef.current = el;
  }, []);

  const updateMetrics = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setMetrics((prev) => {
      const next: ScrollAreaMetrics = {
        scrollTop: viewport.scrollTop,
        scrollLeft: viewport.scrollLeft,
        clientHeight: viewport.clientHeight,
        clientWidth: viewport.clientWidth,
        scrollHeight: viewport.scrollHeight,
        scrollWidth: viewport.scrollWidth,
      };
      if (
        prev.scrollTop === next.scrollTop &&
        prev.scrollLeft === next.scrollLeft &&
        prev.clientHeight === next.clientHeight &&
        prev.clientWidth === next.clientWidth &&
        prev.scrollHeight === next.scrollHeight &&
        prev.scrollWidth === next.scrollWidth
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  // Attach scroll + ResizeObserver after viewport mounts.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    updateMetrics();

    const onScroll = () => {
      updateMetrics();
      setIsScrolling(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, hideDelay);
    };

    viewport.addEventListener('scroll', onScroll, { passive: true });

    const ro = new ResizeObserver(() => updateMetrics());
    ro.observe(viewport);
    // Observe first child (content) if present — catches content-height changes.
    const firstChild = viewport.firstElementChild;
    if (firstChild) ro.observe(firstChild);

    return () => {
      viewport.removeEventListener('scroll', onScroll);
      ro.disconnect();
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [updateMetrics, hideDelay]);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => setIsHovering(false), []);

  const hasVerticalScroll = metrics.scrollHeight > metrics.clientHeight + 1;
  const hasHorizontalScroll = metrics.scrollWidth > metrics.clientWidth + 1;

  const contextValue = useMemo<ScrollAreaContextValue>(
    () => ({
      viewportRef,
      setViewportEl,
      metrics,
      visibility,
      dir,
      isScrolling,
      isHovering,
      isDraggingThumb,
      isPointerCoarse,
      reducedMotion,
      hasVerticalScroll,
      hasHorizontalScroll,
      setIsDraggingThumb,
      setIsScrolling,
    }),
    [
      setViewportEl,
      metrics,
      visibility,
      dir,
      isScrolling,
      isHovering,
      isDraggingThumb,
      isPointerCoarse,
      reducedMotion,
      hasVerticalScroll,
      hasHorizontalScroll,
    ],
  );

  // Detect whether consumer composed their own ScrollAreaViewport. If yes,
  // honor the explicit composition. If no (bare content like
  // `<ScrollArea><div>content</div></ScrollArea>`), wrap in default viewport
  // + render both scrollbars + corner automatically.
  const hasExplicitViewport = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === ScrollAreaViewport,
  );

  return (
    <ScrollAreaContext.Provider value={contextValue}>
      <div
        ref={ref}
        {...rest}
        className={cn(styles.root, className)}
        dir={dir}
        data-visibility={visibility}
        data-scrolling={isScrolling ? 'true' : undefined}
        data-hovering={isHovering ? 'true' : undefined}
        data-dragging={isDraggingThumb ? 'true' : undefined}
        data-pointer-coarse={isPointerCoarse ? 'true' : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {hasExplicitViewport ? (
          children
        ) : (
          <>
            <ScrollAreaViewport>{children}</ScrollAreaViewport>
            <ScrollAreaScrollbar orientation="vertical">
              <ScrollAreaThumb />
            </ScrollAreaScrollbar>
            <ScrollAreaScrollbar orientation="horizontal">
              <ScrollAreaThumb />
            </ScrollAreaScrollbar>
            <ScrollAreaCorner />
          </>
        )}
      </div>
    </ScrollAreaContext.Provider>
  );
});

// ============================================================================
// ScrollAreaViewport
// ============================================================================

export const ScrollAreaViewport = forwardRef<HTMLDivElement, ScrollAreaViewportProps>(
  function ScrollAreaViewport({ children, className, ...rest }, ref) {
    const ctx = useScrollAreaContext('ScrollAreaViewport');
    const mergedRef = useMemo(
      () => mergeRefs<HTMLDivElement>(ref, ctx.setViewportEl),
      [ref, ctx.setViewportEl],
    );
    return (
      <div ref={mergedRef} {...rest} className={cn(styles.viewport, className)} tabIndex={0}>
        {children}
      </div>
    );
  },
);

// ============================================================================
// ScrollAreaScrollbar
// ============================================================================

function shouldRenderScrollbar(
  ctx: ScrollAreaContextValue,
  orientation: ScrollAreaOrientation,
): boolean {
  const hasScroll = orientation === 'vertical' ? ctx.hasVerticalScroll : ctx.hasHorizontalScroll;
  if (!hasScroll) return false;
  if (ctx.visibility === 'auto' && ctx.isPointerCoarse) return false;
  return true;
}

function shouldBeVisible(ctx: ScrollAreaContextValue, orientation: ScrollAreaOrientation): boolean {
  if (!shouldRenderScrollbar(ctx, orientation)) return false;
  switch (ctx.visibility) {
    case 'always':
      return true;
    case 'scroll':
      return ctx.isScrolling || ctx.isDraggingThumb;
    case 'hover':
      return ctx.isHovering || ctx.isDraggingThumb;
    case 'auto':
      return ctx.isScrolling || ctx.isDraggingThumb || ctx.isHovering;
    default:
      return false;
  }
}

interface ScrollbarContextValue {
  orientation: ScrollAreaOrientation;
  trackRef: React.RefObject<HTMLDivElement | null>;
}

const ScrollbarContext = createContext<ScrollbarContextValue | null>(null);

function useScrollbarContext(): ScrollbarContextValue {
  const ctx = useContext(ScrollbarContext);
  if (!ctx) {
    throw new Error('<ScrollAreaThumb> must be rendered inside <ScrollAreaScrollbar>');
  }
  return ctx;
}

export const ScrollAreaScrollbar = forwardRef<HTMLDivElement, ScrollAreaScrollbarProps>(
  function ScrollAreaScrollbar(
    { orientation = 'vertical', className, children, onPointerDown, ...rest },
    ref,
  ) {
    const ctx = useScrollAreaContext('ScrollAreaScrollbar');
    const trackRef = useRef<HTMLDivElement | null>(null);

    const setTrackEl = useCallback((node: HTMLDivElement | null) => {
      trackRef.current = node;
    }, []);

    const mergedRef = useMemo(() => mergeRefs<HTMLDivElement>(ref, setTrackEl), [ref, setTrackEl]);

    const shouldRender = shouldRenderScrollbar(ctx, orientation);
    const visible = shouldBeVisible(ctx, orientation);

    const scrollbarContextValue = useMemo<ScrollbarContextValue>(
      () => ({ orientation, trackRef }),
      [orientation, trackRef],
    );

    const handleTrackPointerDown = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        // If target is inside the thumb, let thumb handler take it.
        const target = event.target as HTMLElement;
        if (target.closest('[data-scroll-area-thumb]')) return;
        if (event.button !== undefined && event.button !== 0) return;
        const viewport = ctx.viewportRef.current;
        const track = trackRef.current;
        if (!viewport || !track) return;
        const trackRect = track.getBoundingClientRect();
        const behavior: ScrollBehavior = ctx.reducedMotion ? 'instant' : 'smooth';
        if (orientation === 'vertical') {
          const cursorY = event.clientY - trackRect.top;
          const thumbY =
            (ctx.metrics.scrollTop / Math.max(1, ctx.metrics.scrollHeight)) * trackRect.height;
          const direction = cursorY < thumbY ? -1 : 1;
          viewport.scrollBy({
            top: direction * ctx.metrics.clientHeight,
            behavior,
          });
        } else {
          const cursorX = event.clientX - trackRect.left;
          const thumbX =
            (ctx.metrics.scrollLeft / Math.max(1, ctx.metrics.scrollWidth)) * trackRect.width;
          const direction = cursorX < thumbX ? -1 : 1;
          viewport.scrollBy({
            left: direction * ctx.metrics.clientWidth,
            behavior,
          });
        }
        onPointerDown?.(event);
      },
      [ctx, orientation, onPointerDown, trackRef],
    );

    if (!shouldRender) return null;

    return (
      <ScrollbarContext.Provider value={scrollbarContextValue}>
        <div
          ref={mergedRef}
          {...rest}
          className={cn(
            styles.scrollbar,
            orientation === 'vertical' ? styles.vertical : styles.horizontal,
            className,
          )}
          data-orientation={orientation}
          data-visible={visible ? 'true' : undefined}
          onPointerDown={handleTrackPointerDown}
        >
          {children ?? <ScrollAreaThumb />}
        </div>
      </ScrollbarContext.Provider>
    );
  },
);

// ============================================================================
// ScrollAreaThumb
// ============================================================================

export const ScrollAreaThumb = forwardRef<HTMLDivElement, ScrollAreaThumbProps>(
  function ScrollAreaThumb({ className, style, ...rest }, ref) {
    const ctx = useScrollAreaContext('ScrollAreaThumb');
    const { orientation, trackRef } = useScrollbarContext();

    // Drag state refs.
    const dragStartPointerRef = useRef(0);
    const dragStartScrollRef = useRef(0);

    // Proportional thumb size + position.
    const thumbStyle = useMemo<CSSProperties>(() => {
      if (orientation === 'vertical') {
        const visibleRatio = ctx.metrics.clientHeight / Math.max(1, ctx.metrics.scrollHeight);
        const trackHeight = ctx.metrics.clientHeight;
        const thumbHeight = Math.max(24, trackHeight * visibleRatio);
        const scrollableDistance = Math.max(1, ctx.metrics.scrollHeight - ctx.metrics.clientHeight);
        const trackScrollable = Math.max(1, trackHeight - thumbHeight);
        const thumbTop = (ctx.metrics.scrollTop / scrollableDistance) * trackScrollable;
        return {
          height: `${thumbHeight}px`,
          transform: `translate3d(0, ${thumbTop}px, 0)`,
        };
      } else {
        const visibleRatio = ctx.metrics.clientWidth / Math.max(1, ctx.metrics.scrollWidth);
        const trackWidth = ctx.metrics.clientWidth;
        const thumbWidth = Math.max(24, trackWidth * visibleRatio);
        const scrollableDistance = Math.max(1, ctx.metrics.scrollWidth - ctx.metrics.clientWidth);
        const trackScrollable = Math.max(1, trackWidth - thumbWidth);
        const thumbLeft = (ctx.metrics.scrollLeft / scrollableDistance) * trackScrollable;
        return {
          width: `${thumbWidth}px`,
          transform: `translate3d(${thumbLeft}px, 0, 0)`,
        };
      }
    }, [
      orientation,
      ctx.metrics.clientHeight,
      ctx.metrics.clientWidth,
      ctx.metrics.scrollHeight,
      ctx.metrics.scrollWidth,
      ctx.metrics.scrollTop,
      ctx.metrics.scrollLeft,
    ]);

    // Drag via shared `usePointerDrag` primitive (E39 refactor).
    const { handlers: thumbDragHandlers } = usePointerDrag<HTMLDivElement>({
      onDragStart: (event) => {
        if (event.button !== undefined && event.button !== 0) return false;
        dragStartPointerRef.current = orientation === 'vertical' ? event.clientY : event.clientX;
        dragStartScrollRef.current =
          orientation === 'vertical' ? ctx.metrics.scrollTop : ctx.metrics.scrollLeft;
        ctx.setIsDraggingThumb(true);
        event.stopPropagation();
      },
      onDragMove: (event) => {
        const track = trackRef.current;
        if (!track) return;
        const trackRect = track.getBoundingClientRect();
        // Use scrollTo instead of direct viewport.scrollTop/Left assignment —
        // React 19 `react-hooks/immutability` flags direct mutation of values
        // reachable through hook-returned refs. scrollTo is a method call
        // (not a property assignment) so it doesn't trigger the rule.
        const metrics = ctx.metrics;
        if (orientation === 'vertical') {
          const trackHeight = trackRect.height;
          const visibleRatio = metrics.clientHeight / Math.max(1, metrics.scrollHeight);
          const thumbHeight = Math.max(24, trackHeight * visibleRatio);
          const trackScrollable = Math.max(1, trackHeight - thumbHeight);
          const scrollableDistance = Math.max(1, metrics.scrollHeight - metrics.clientHeight);
          const deltaPointer = event.clientY - dragStartPointerRef.current;
          const ratio = deltaPointer / trackScrollable;
          const newScrollTop = Math.max(
            0,
            Math.min(scrollableDistance, dragStartScrollRef.current + ratio * scrollableDistance),
          );
          ctx.viewportRef.current?.scrollTo({
            top: newScrollTop,
            behavior: 'instant',
          });
        } else {
          const trackWidth = trackRect.width;
          const visibleRatio = metrics.clientWidth / Math.max(1, metrics.scrollWidth);
          const thumbWidth = Math.max(24, trackWidth * visibleRatio);
          const trackScrollable = Math.max(1, trackWidth - thumbWidth);
          const scrollableDistance = Math.max(1, metrics.scrollWidth - metrics.clientWidth);
          const deltaPointer = event.clientX - dragStartPointerRef.current;
          const ratio = deltaPointer / trackScrollable;
          const newScrollLeft = Math.max(
            0,
            Math.min(scrollableDistance, dragStartScrollRef.current + ratio * scrollableDistance),
          );
          ctx.viewportRef.current?.scrollTo({
            left: newScrollLeft,
            behavior: 'instant',
          });
        }
      },
      onDragEnd: () => {
        ctx.setIsDraggingThumb(false);
      },
      onDragCancel: () => {
        ctx.setIsDraggingThumb(false);
      },
    });

    return (
      <div
        ref={ref}
        {...rest}
        className={cn(styles.thumb, className)}
        data-scroll-area-thumb=""
        data-orientation={orientation}
        style={{ ...thumbStyle, ...style }}
        {...thumbDragHandlers}
      />
    );
  },
);

// ============================================================================
// ScrollAreaCorner
// ============================================================================

export const ScrollAreaCorner = forwardRef<HTMLDivElement, ScrollAreaCornerProps>(
  function ScrollAreaCorner({ className, ...rest }, ref) {
    const ctx = useScrollAreaContext('ScrollAreaCorner');
    const showCorner =
      ctx.hasVerticalScroll &&
      ctx.hasHorizontalScroll &&
      !(ctx.visibility === 'auto' && ctx.isPointerCoarse);
    if (!showCorner) return null;
    return <div ref={ref} {...rest} aria-hidden="true" className={cn(styles.corner, className)} />;
  },
);
