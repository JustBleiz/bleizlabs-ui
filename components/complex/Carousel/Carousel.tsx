'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/components/utils/cn';
import { mergeRefs } from '@/components/utils/mergeRefs';
import {
  usePointerDrag,
  type UsePointerDragHandlers,
} from '@/components/utils/gesture';
import { useMatchMedia } from '@/components/utils/match-media';
import styles from './Carousel.module.scss';

/**
 * Carousel — accessible auto-rotating content slider (Phase 10 CI21).
 *
 * @layer    complex-interactive
 * @tokens   --color-brand, --color-surface, --color-surface-raised,
 *           --color-border, --color-text-primary, --color-text-inverse,
 *           --focus-ring (via mx.focus-ring mixin), --duration-fast,
 *           --easing-default, --radius-full, --radius-lg, --space-3
 * @deps     cn, mergeRefs, usePointerDrag (E39 gesture primitive),
 *           useMatchMedia (E40 match-media primitive)
 * @a11y     `role="region"` + `aria-roledescription="carousel"` on root per APG.
 *           Each slide `role="group" aria-roledescription="slide" aria-label="N of M"`;
 *           non-current slides `aria-hidden="true"`. WCAG 2.2.2 pause control required
 *           when auto-rotation enabled (CarouselPause button with `aria-pressed`).
 *           WCAG 1.4.13 pause on hover/focus/visibilitychange via pauseReasons Set.
 *           Live region (`role="status" aria-live="polite"`) announces "Slide N of M"
 *           on index change (silent during auto-rotation by default, opt-in via
 *           `announceAutoRotate`). `prefers-reduced-motion: reduce` disables
 *           auto-rotation entirely. Keyboard: ArrowLeft/Right prev/next (RTL-mirrored),
 *           Home/End first/last. 2nd drag-gesture consumer (Slider E33 = 1st) —
 *           drag inline per Rule of Three (extract at 3rd consumer).
 * @apg      https://www.w3.org/WAI/ARIA/apg/patterns/carousel/
 * @tested   tsc + eslint + next build (Playwright/NVDA/axe deferred per E15 scope).
 * @regressions tests/Carousel.{keyboard,focus,aria,regression}.spec.md —
 *           25 regression cases CAR-R01..R25 in `docs/specs/carousel-spec.md`
 *           (promoted from `_tmp` in E42).
 *
 * @example
 * // Basic with auto-rotate + pause control
 * <Carousel aria-label="Product gallery" autoRotate autoRotateInterval={5000}>
 *   <CarouselViewport>
 *     <CarouselSlide><img src="1.jpg" alt="Product 1" /></CarouselSlide>
 *     <CarouselSlide><img src="2.jpg" alt="Product 2" /></CarouselSlide>
 *     <CarouselSlide><img src="3.jpg" alt="Product 3" /></CarouselSlide>
 *   </CarouselViewport>
 *   <CarouselPause />
 *   <CarouselPrev />
 *   <CarouselNext />
 * </Carousel>
 */

// ============================================================================
// Types
// ============================================================================

export type CarouselDir = 'ltr' | 'rtl';

export interface CarouselProps
  extends Omit<HTMLAttributes<HTMLElement>, 'defaultValue'> {
  /** Controlled current slide index. */
  index?: number;
  /** Uncontrolled initial slide index. Default `0`. */
  defaultIndex?: number;
  /** Fires when the active slide index changes (keyboard, drag, button, auto-rotate). */
  onIndexChange?: (index: number) => void;
  /** Infinite wrap-around: prev at 0 → last, next at last → 0. Default `false` (linear clamp). */
  loop?: boolean;
  /** Auto-rotate the carousel. Default `false`. */
  autoRotate?: boolean;
  /** Auto-rotate interval in milliseconds. Default `4000`. */
  autoRotateInterval?: number;
  /** Announce slide changes via live region while auto-rotating. Default `false` (silent). */
  announceAutoRotate?: boolean;
  /** Writing direction for horizontal Arrow mirror. Default `'ltr'`. */
  dir?: CarouselDir;
  /** Enable pointer drag. Default `true`. */
  dragEnabled?: boolean;
  /** Drag snap threshold: proportion of viewport width OR minimum pixels. Default `0.2` (20%). */
  dragSnapThreshold?: number;
  /** Accessible name — REQUIRED per APG. */
  'aria-label': string;
  'aria-labelledby'?: string;
  children: ReactNode;
}

export interface CarouselViewportProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CarouselSlideProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CarouselPrevProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'children'> {
  /** Override button label. Default `'Previous slide'`. */
  label?: string;
  /** Override chevron icon. */
  children?: ReactNode;
}

export interface CarouselNextProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'children'> {
  /** Override button label. Default `'Next slide'`. */
  label?: string;
  /** Override icon. */
  children?: ReactNode;
}

export interface CarouselPauseProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed' | 'children'> {
  /** Override play label. Default `'Play carousel'`. */
  playLabel?: string;
  /** Override pause label. Default `'Pause carousel'`. */
  pauseLabel?: string;
  /** Override icon — function receives `isPaused` state. */
  children?: (isPaused: boolean) => ReactNode;
}

// ============================================================================
// Context
// ============================================================================

type PauseReason = 'manual' | 'hover' | 'focus' | 'visibility' | 'reduced-motion' | 'drag';

interface CarouselContextValue {
  index: number;
  total: number;
  loop: boolean;
  dir: CarouselDir;
  autoRotate: boolean;
  isPaused: boolean;
  isReducedMotion: boolean;
  dragEnabled: boolean;
  viewportId: string;
  liveRegionId: string;
  dragOffset: number;
  isDragging: boolean;
  goto: (next: number) => void;
  goPrev: () => void;
  goNext: () => void;
  togglePause: () => void;
  registerSlide: (id: string) => () => void;
  getSlideIndex: (id: string) => number;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  setViewportEl: (el: HTMLDivElement | null) => void;
  handleViewportKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
  viewportDragHandlers: UsePointerDragHandlers<HTMLDivElement>;
  addPauseReason: (reason: PauseReason) => void;
  removePauseReason: (reason: PauseReason) => void;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarouselContext(componentName: string): CarouselContextValue {
  const ctx = useContext(CarouselContext);
  if (!ctx) {
    throw new Error(`<${componentName}> must be rendered inside <Carousel>`);
  }
  return ctx;
}

// ============================================================================
// Carousel (root)
// ============================================================================

export const Carousel = forwardRef<HTMLElement, CarouselProps>(function Carousel(
  {
    index: controlledIndex,
    defaultIndex = 0,
    onIndexChange,
    loop = false,
    autoRotate = false,
    autoRotateInterval = 4000,
    announceAutoRotate = false,
    dir = 'ltr',
    dragEnabled = true,
    dragSnapThreshold = 0.2,
    className,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const viewportId = `carousel-${generatedId}-viewport`;
  const liveRegionId = `carousel-${generatedId}-live`;

  // Slide registry — ordered list of slide ids (per mount order).
  const [slideIds, setSlideIds] = useState<readonly string[]>([]);
  const total = slideIds.length;

  const isControlled = controlledIndex !== undefined;
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const rawIndex = isControlled ? controlledIndex : uncontrolledIndex;
  const safeIndex = total === 0 ? 0 : Math.min(Math.max(rawIndex, 0), total - 1);

  const latestIndexRef = useRef(safeIndex);
  useLayoutEffect(() => {
    latestIndexRef.current = safeIndex;
  }, [safeIndex]);

  // Pause reasons — state (not ref) so derived values isPaused / shouldRotate
  // are safe to read during render per React 19 `react-hooks/refs` rule.
  // Each add/delete creates a new Set instance to trigger re-render.
  const [pauseReasons, setPauseReasons] = useState<ReadonlySet<PauseReason>>(
    () => new Set(),
  );

  const addPauseReason = useCallback((reason: PauseReason) => {
    setPauseReasons((prev) => {
      if (prev.has(reason)) return prev;
      const next = new Set(prev);
      next.add(reason);
      return next;
    });
  }, []);
  const removePauseReason = useCallback((reason: PauseReason) => {
    setPauseReasons((prev) => {
      if (!prev.has(reason)) return prev;
      const next = new Set(prev);
      next.delete(reason);
      return next;
    });
  }, []);

  const isPaused = pauseReasons.has('manual');
  const isReducedMotion = pauseReasons.has('reduced-motion');
  const shouldRotate = autoRotate && pauseReasons.size === 0 && total > 1;

  // Reduced-motion detection via shared useMatchMedia primitive (E40 refactor).
  // Sync matchMedia boolean → pauseReasons Set via render-time prop-sync
  // pattern (E31 DatePicker / E34 Carousel live region precedent) to
  // satisfy React 19 `react-hooks/set-state-in-effect` rule — direct
  // setState-in-effect would trigger cascading renders per React docs.
  const prefersReducedMotion = useMatchMedia('(prefers-reduced-motion: reduce)');
  const [prevPRM, setPrevPRM] = useState(prefersReducedMotion);
  if (prevPRM !== prefersReducedMotion) {
    setPrevPRM(prefersReducedMotion);
    if (prefersReducedMotion) addPauseReason('reduced-motion');
    else removePauseReason('reduced-motion');
  }

  // Visibilitychange — pause auto-rotation when tab hidden.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const apply = () => {
      if (document.hidden) addPauseReason('visibility');
      else removePauseReason('visibility');
    };
    apply();
    document.addEventListener('visibilitychange', apply);
    return () => document.removeEventListener('visibilitychange', apply);
  }, [addPauseReason, removePauseReason]);

  const registerSlide = useCallback((id: string) => {
    setSlideIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    return () => {
      setSlideIds((prev) => prev.filter((slideId) => slideId !== id));
    };
  }, []);

  const getSlideIndex = useCallback(
    (id: string) => slideIds.indexOf(id),
    [slideIds],
  );

  const commit = useCallback(
    (next: number) => {
      if (total === 0) return;
      const clamped = loop
        ? ((next % total) + total) % total
        : Math.min(Math.max(next, 0), total - 1);
      if (clamped === latestIndexRef.current) return;
      latestIndexRef.current = clamped;
      if (!isControlled) setUncontrolledIndex(clamped);
      onIndexChange?.(clamped);
    },
    [total, loop, isControlled, onIndexChange],
  );

  const goto = useCallback((next: number) => commit(next), [commit]);
  const goPrev = useCallback(
    () => commit(latestIndexRef.current - 1),
    [commit],
  );
  const goNext = useCallback(
    () => commit(latestIndexRef.current + 1),
    [commit],
  );

  const togglePause = useCallback(() => {
    setPauseReasons((prev) => {
      const next = new Set(prev);
      if (next.has('manual')) next.delete('manual');
      else next.add('manual');
      return next;
    });
  }, []);

  // Auto-rotation timer.
  useEffect(() => {
    if (!shouldRotate) return;
    const handle = setInterval(() => {
      commit(latestIndexRef.current + 1);
    }, autoRotateInterval);
    return () => clearInterval(handle);
  }, [shouldRotate, autoRotateInterval, commit]);

  // Viewport element ref for drag math.
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const setViewportEl = useCallback((el: HTMLDivElement | null) => {
    viewportRef.current = el;
  }, []);

  // Drag state (refs — don't trigger re-render until commit).
  const dragStartXRef = useRef(0);
  const dragStartIndexRef = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Drag via shared `usePointerDrag` primitive (E39 refactor).
  const { handlers: viewportDragHandlers } = usePointerDrag<HTMLDivElement>({
    enabled: dragEnabled && total > 1,
    onDragStart: (event) => {
      if (event.button !== undefined && event.button !== 0) return false;
      dragStartXRef.current = event.clientX;
      dragStartIndexRef.current = latestIndexRef.current;
      addPauseReason('drag');
    },
    onDragMove: (event) => {
      const delta = event.clientX - dragStartXRef.current;
      if (Math.abs(delta) > 2 && !isDragging) setIsDragging(true);
      setDragOffset(delta);
    },
    onDragEnd: (event) => {
      const viewport = viewportRef.current;
      const width = viewport?.getBoundingClientRect().width ?? 1;
      const delta = event.clientX - dragStartXRef.current;
      const thresholdPx = Math.max(width * dragSnapThreshold, 40);
      setDragOffset(0);
      setIsDragging(false);
      removePauseReason('drag');
      if (Math.abs(delta) < thresholdPx) return;
      // In RTL horizontal, drag right should go to PREV slide (content moves right).
      const direction = delta > 0 ? -1 : 1;
      const rtlMirror = dir === 'rtl' ? -1 : 1;
      commit(latestIndexRef.current + direction * rtlMirror);
    },
    onDragCancel: () => {
      setDragOffset(0);
      setIsDragging(false);
      removePauseReason('drag');
    },
  });

  const handleViewportKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const isRtl = dir === 'rtl';
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          commit(latestIndexRef.current + (isRtl ? 1 : -1));
          break;
        case 'ArrowRight':
          event.preventDefault();
          commit(latestIndexRef.current + (isRtl ? -1 : 1));
          break;
        case 'Home':
          event.preventDefault();
          commit(0);
          break;
        case 'End':
          event.preventDefault();
          commit(total - 1);
          break;
        default:
          break;
      }
    },
    [commit, dir, total],
  );

  // Focus/hover pause on the root element — capture in/out events so handlers
  // on buttons or slide content also trigger pause. Uses native DOM listeners
  // because React focus events don't bubble the same way.
  const rootRef = useRef<HTMLElement | null>(null);
  const setRootEl = useCallback((el: HTMLElement | null) => {
    rootRef.current = el;
  }, []);
  const mergedRootRef = useMemo(
    () => mergeRefs<HTMLElement>(ref, setRootEl),
    [ref, setRootEl],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onFocusIn = () => addPauseReason('focus');
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      if (next && root.contains(next)) return;
      removePauseReason('focus');
    };
    const onPointerEnter = () => addPauseReason('hover');
    const onPointerLeave = () => removePauseReason('hover');
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    root.addEventListener('pointerenter', onPointerEnter);
    root.addEventListener('pointerleave', onPointerLeave);
    return () => {
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
      root.removeEventListener('pointerenter', onPointerEnter);
      root.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [addPauseReason, removePauseReason]);

  const contextValue = useMemo<CarouselContextValue>(
    () => ({
      index: safeIndex,
      total,
      loop,
      dir,
      autoRotate,
      isPaused,
      isReducedMotion,
      dragEnabled,
      viewportId,
      liveRegionId,
      dragOffset,
      isDragging,
      goto,
      goPrev,
      goNext,
      togglePause,
      registerSlide,
      getSlideIndex,
      viewportRef,
      setViewportEl,
      handleViewportKeyDown,
      viewportDragHandlers,
      addPauseReason,
      removePauseReason,
    }),
    [
      safeIndex,
      total,
      loop,
      dir,
      autoRotate,
      isPaused,
      isReducedMotion,
      dragEnabled,
      viewportId,
      liveRegionId,
      dragOffset,
      isDragging,
      goto,
      goPrev,
      goNext,
      togglePause,
      registerSlide,
      getSlideIndex,
      setViewportEl,
      handleViewportKeyDown,
      viewportDragHandlers,
      addPauseReason,
      removePauseReason,
    ],
  );

  // Live region announce logic — render-time prop-sync pattern (E31
  // DatePicker precedent) avoids React 19 `react-hooks/set-state-in-effect`
  // rule. Empty on initial mount; updates only when index CHANGES.
  const [prevIndexForLive, setPrevIndexForLive] = useState(safeIndex);
  const [liveMessage, setLiveMessage] = useState('');
  if (safeIndex !== prevIndexForLive) {
    setPrevIndexForLive(safeIndex);
    if (total === 0) {
      setLiveMessage('');
    } else if (shouldRotate && !announceAutoRotate) {
      // Silent during auto-rotation unless opt-in.
      setLiveMessage('');
    } else {
      setLiveMessage(`Slide ${safeIndex + 1} of ${total}`);
    }
  }

  return (
    <CarouselContext.Provider value={contextValue}>
      <section
        ref={mergedRootRef}
        {...rest}
        className={cn(styles.root, className)}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-roledescription="carousel"
        data-dir={dir}
        data-paused={isPaused ? 'true' : undefined}
        data-dragging={isDragging ? 'true' : undefined}
      >
        {children}
        <div
          id={liveRegionId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={styles.liveRegion}
        >
          {liveMessage}
        </div>
      </section>
    </CarouselContext.Provider>
  );
});

// ============================================================================
// CarouselViewport
// ============================================================================

export const CarouselViewport = forwardRef<HTMLDivElement, CarouselViewportProps>(
  function CarouselViewport({ children, className, style, ...rest }, ref) {
    const ctx = useCarouselContext('CarouselViewport');
    const mergedRef = useMemo(
      () => mergeRefs<HTMLDivElement>(ref, ctx.setViewportEl),
      [ref, ctx.setViewportEl],
    );

    // Track transform = -(index * 100%) + dragOffset px (during drag).
    // Use CSS custom property so keyboard transition is smooth but drag uses
    // direct px override via inline style.
    const translatePercent = -ctx.index * 100;
    const trackStyle: CSSProperties = {
      transform: ctx.isDragging
        ? `translate3d(calc(${translatePercent}% + ${ctx.dragOffset}px), 0, 0)`
        : `translate3d(${translatePercent}%, 0, 0)`,
      // prefers-reduced-motion users get instant jumps per WCAG SC 2.3.3 +
      // APG guidance. CSS !important cannot override inline style, so this
      // must be resolved in JS (Phase 5 IMP-1 fix).
      transition:
        ctx.isDragging || ctx.isReducedMotion
          ? 'none'
          : 'transform var(--duration-normal) var(--easing-default)',
    };

    return (
      <div
        ref={mergedRef}
        {...rest}
        id={ctx.viewportId}
        className={cn(styles.viewport, className)}
        style={style}
        tabIndex={0}
        onKeyDown={ctx.handleViewportKeyDown}
        {...ctx.viewportDragHandlers}
        data-dragging={ctx.isDragging ? 'true' : undefined}
      >
        <div className={styles.track} style={trackStyle}>
          {children}
        </div>
      </div>
    );
  },
);

// ============================================================================
// CarouselSlide
// ============================================================================

export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(
  function CarouselSlide({ children, className, ...rest }, ref) {
    const ctx = useCarouselContext('CarouselSlide');
    const generatedId = useId();
    const slideId = `slide-${generatedId}`;

    useLayoutEffect(() => {
      const unregister = ctx.registerSlide(slideId);
      return unregister;
    }, [ctx, slideId]);

    const myIndex = ctx.getSlideIndex(slideId);
    const isCurrent = myIndex !== -1 && myIndex === ctx.index;
    const label =
      myIndex === -1
        ? undefined
        : `${myIndex + 1} of ${ctx.total}`;

    return (
      <div
        ref={ref}
        {...rest}
        className={cn(styles.slide, className)}
        role="group"
        aria-roledescription="slide"
        aria-label={label}
        aria-hidden={!isCurrent ? 'true' : undefined}
        data-current={isCurrent ? 'true' : undefined}
      >
        {children}
      </div>
    );
  },
);

// ============================================================================
// CarouselPrev
// ============================================================================

const ChevronLeftIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="10 12 6 8 10 4" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 4 10 8 6 12" />
  </svg>
);

const PlayIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
  >
    <polygon points="4 3 13 8 4 13" />
  </svg>
);

const PauseIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
  >
    <rect x="4" y="3" width="3" height="10" />
    <rect x="9" y="3" width="3" height="10" />
  </svg>
);

export const CarouselPrev = forwardRef<HTMLButtonElement, CarouselPrevProps>(
  function CarouselPrev(
    { label = 'Previous slide', className, children, onClick, ...rest },
    ref,
  ) {
    const ctx = useCarouselContext('CarouselPrev');
    const disabled = !ctx.loop && ctx.index === 0;
    const atEdge = ctx.total <= 1;
    return (
      <button
        ref={ref}
        type="button"
        {...rest}
        className={cn(styles.navButton, styles.prev, className)}
        aria-label={label}
        aria-controls={ctx.viewportId}
        aria-disabled={disabled || atEdge ? 'true' : undefined}
        data-disabled={disabled || atEdge ? 'true' : undefined}
        onClick={(event) => {
          if (disabled || atEdge) return;
          ctx.goPrev();
          onClick?.(event);
        }}
      >
        {children ?? (ctx.dir === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />)}
      </button>
    );
  },
);

// ============================================================================
// CarouselNext
// ============================================================================

export const CarouselNext = forwardRef<HTMLButtonElement, CarouselNextProps>(
  function CarouselNext(
    { label = 'Next slide', className, children, onClick, ...rest },
    ref,
  ) {
    const ctx = useCarouselContext('CarouselNext');
    const disabled = !ctx.loop && ctx.index === ctx.total - 1;
    const atEdge = ctx.total <= 1;
    return (
      <button
        ref={ref}
        type="button"
        {...rest}
        className={cn(styles.navButton, styles.next, className)}
        aria-label={label}
        aria-controls={ctx.viewportId}
        aria-disabled={disabled || atEdge ? 'true' : undefined}
        data-disabled={disabled || atEdge ? 'true' : undefined}
        onClick={(event) => {
          if (disabled || atEdge) return;
          ctx.goNext();
          onClick?.(event);
        }}
      >
        {children ?? (ctx.dir === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />)}
      </button>
    );
  },
);

// ============================================================================
// CarouselPause
// ============================================================================

export const CarouselPause = forwardRef<HTMLButtonElement, CarouselPauseProps>(
  function CarouselPause(
    {
      playLabel = 'Play carousel',
      pauseLabel = 'Pause carousel',
      className,
      children,
      onClick,
      ...rest
    },
    ref,
  ) {
    const ctx = useCarouselContext('CarouselPause');
    if (!ctx.autoRotate) return null;
    const label = ctx.isPaused ? playLabel : pauseLabel;
    return (
      <button
        ref={ref}
        type="button"
        {...rest}
        className={cn(styles.pauseButton, className)}
        aria-label={label}
        aria-pressed={ctx.isPaused}
        aria-controls={ctx.viewportId}
        onClick={(event) => {
          ctx.togglePause();
          onClick?.(event);
        }}
      >
        {children
          ? children(ctx.isPaused)
          : ctx.isPaused
            ? <PlayIcon />
            : <PauseIcon />}
      </button>
    );
  },
);
