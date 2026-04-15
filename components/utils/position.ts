/**
 * position — pure positioning math for floating UI components.
 *
 * Framework-agnostic utility (no React, no DOM listeners — just geometry).
 * Shared by Tooltip, Popover, DropdownMenu, HoverCard, ContextMenu, Select,
 * Combobox, NavigationMenu (all Phase 10 complex interactive floating components).
 *
 * Computes the (x, y) pixel coordinates for a floating element relative to a
 * reference (anchor) element, applying three middleware stages in order:
 *   1. offset — gap between reference and floating
 *   2. flip   — swap to opposite side if preferred placement clips viewport
 *   3. shift  — slide along cross-axis to keep floating within viewport bounds
 *
 * Design non-goals (intentional omissions for E19 scope — revisit when needed):
 *   - Arrow positioning (add when Popover E20 needs it)
 *   - Transform-parent correction (rare — consumer can work around with portal)
 *   - Virtual elements / getBoundingClientRect emulation
 *   - Nested overflow container boundary detection (always uses window viewport)
 *   - Sticky scroll ancestor handling (window.scroll captures parent scroll)
 *
 * Per D5/D25 "first floating component prototype" exception clause —
 * hand-rolled to stay zero-runtime-dependency (decisions.md:69, user override
 * at E19 plan gate: "też w całym projekcie unikaliśmy używania jakichkolwiek
 * bibliotek, więc jeżeli znasz żródła tej biblioteki... lepiej to przepisac
 * i dostosować do naszej biblioteki niż nagle wrzucać zależność").
 */

export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Alignment = 'start' | 'center' | 'end';

/** 12 placement values — 4 sides × 3 alignments. `<side>` alone = `<side>-center`. */
export type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface ComputePositionArgs {
  /** Reference (anchor/trigger) bounding rect — typically `trigger.getBoundingClientRect()`. */
  reference: Rect;
  /** Floating element dimensions — typically `{ width: floating.offsetWidth, height: floating.offsetHeight }`. */
  floating: Dimensions;
  /** Preferred placement. Flip may change the actual placement at runtime. */
  placement: Placement;
  /** Gap in pixels between reference and floating (offset middleware). Default 0. */
  offset?: number;
  /** Viewport — defaults to `{ width: window.innerWidth, height: window.innerHeight }`. */
  viewport?: Dimensions;
  /** Inner padding from viewport edges when running flip + shift. Default 8. */
  padding?: number;
}

export interface ComputePositionResult {
  /** Final x coordinate (viewport-relative, for `position: fixed` usage). */
  x: number;
  /** Final y coordinate. */
  y: number;
  /** Actual placement after flip resolution — may differ from the preferred `placement` arg. */
  placement: Placement;
}

/** Parse `'top-start'` → `{ side: 'top', alignment: 'start' }`. Bare `'top'` is treated as `'top'` + `'center'`. */
export function parsePlacement(placement: Placement): { side: Side; alignment: Alignment } {
  const [side, alignment = 'center'] = placement.split('-') as [Side, Alignment | undefined];
  return { side, alignment };
}

/** Join `{ side: 'top', alignment: 'start' }` → `'top-start'`. Center alignment drops to bare side. */
function joinPlacement(side: Side, alignment: Alignment): Placement {
  return (alignment === 'center' ? side : `${side}-${alignment}`) as Placement;
}

/** Opposite side along the same axis. Used by flip middleware. */
function opposite(side: Side): Side {
  switch (side) {
    case 'top':
      return 'bottom';
    case 'bottom':
      return 'top';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
  }
}

/** Compute raw x/y before flip/shift — pure placement math from reference rect. */
function computeCoords(
  reference: Rect,
  floating: Dimensions,
  side: Side,
  alignment: Alignment,
  offset: number,
): { x: number; y: number } {
  const refCenterX = reference.x + reference.width / 2;
  const refCenterY = reference.y + reference.height / 2;
  const floatHalfW = floating.width / 2;
  const floatHalfH = floating.height / 2;

  let x = 0;
  let y = 0;

  // Main-axis position (side determines which edge of the reference the floating snaps to).
  switch (side) {
    case 'top':
      y = reference.y - floating.height - offset;
      x = refCenterX - floatHalfW;
      break;
    case 'bottom':
      y = reference.y + reference.height + offset;
      x = refCenterX - floatHalfW;
      break;
    case 'left':
      x = reference.x - floating.width - offset;
      y = refCenterY - floatHalfH;
      break;
    case 'right':
      x = reference.x + reference.width + offset;
      y = refCenterY - floatHalfH;
      break;
  }

  // Alignment adjustment along the cross-axis.
  if (side === 'top' || side === 'bottom') {
    if (alignment === 'start') x = reference.x;
    else if (alignment === 'end') x = reference.x + reference.width - floating.width;
    // center is already default from main-axis math above
  } else {
    if (alignment === 'start') y = reference.y;
    else if (alignment === 'end') y = reference.y + reference.height - floating.height;
  }

  return { x, y };
}

/**
 * Check whether placing `floating` at `(x, y)` would overflow viewport edges,
 * honoring a padding from each edge.
 */
function getOverflow(
  x: number,
  y: number,
  floating: Dimensions,
  viewport: Dimensions,
  padding: number,
): { top: number; right: number; bottom: number; left: number } {
  return {
    top: padding - y,
    left: padding - x,
    right: x + floating.width - (viewport.width - padding),
    bottom: y + floating.height - (viewport.height - padding),
  };
}

/**
 * Compute the final position for a floating element relative to a reference.
 * Applies offset → flip → shift middleware in that order.
 */
export function computePosition(args: ComputePositionArgs): ComputePositionResult {
  const {
    reference,
    floating,
    placement,
    offset = 0,
    viewport = typeof window !== 'undefined'
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 1024, height: 768 },
    padding = 8,
  } = args;

  const { side: preferredSide, alignment } = parsePlacement(placement);

  // 1. Compute coords for preferred side.
  let side = preferredSide;
  let coords = computeCoords(reference, floating, side, alignment, offset);

  // 2. Flip middleware — check if preferred side overflows its main axis,
  // if so try the opposite side and keep whichever clips less.
  // The "main axis" overflow for a side is the overflow AT that side's edge:
  // placement 'top' → check top edge overflow; 'right' → right edge, etc.
  const preferredOverflow = getOverflow(coords.x, coords.y, floating, viewport, padding);
  const primaryOverflow = preferredOverflow[preferredSide];

  if (primaryOverflow > 0) {
    const flippedSide = opposite(preferredSide);
    const flippedCoords = computeCoords(reference, floating, flippedSide, alignment, offset);
    const flippedOverflow = getOverflow(
      flippedCoords.x,
      flippedCoords.y,
      floating,
      viewport,
      padding,
    );
    const flippedPrimary = flippedOverflow[flippedSide];

    // Pick the side with less main-axis overflow (lesser evil).
    if (flippedPrimary < primaryOverflow) {
      side = flippedSide;
      coords = flippedCoords;
    }
  }

  // 3. Shift middleware — clamp along cross-axis to keep within viewport bounds.
  const isVertical = side === 'top' || side === 'bottom';
  if (isVertical) {
    const minX = padding;
    const maxX = viewport.width - floating.width - padding;
    if (coords.x < minX) coords.x = minX;
    else if (coords.x > maxX) coords.x = maxX;
  } else {
    const minY = padding;
    const maxY = viewport.height - floating.height - padding;
    if (coords.y < minY) coords.y = minY;
    else if (coords.y > maxY) coords.y = maxY;
  }

  return {
    x: coords.x,
    y: coords.y,
    placement: joinPlacement(side, alignment),
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Arrow middleware (E20 — added for Popover and downstream floating components)
// ──────────────────────────────────────────────────────────────────────────

export interface ComputeArrowPositionArgs {
  /** Reference (trigger) bounding rect — typically from `trigger.getBoundingClientRect()`. */
  reference: Rect;
  /** Final `{ x, y }` coordinates of the floating element (post-shift). */
  floatingCoords: { x: number; y: number };
  /** Floating element dimensions. */
  floatingDimensions: Dimensions;
  /** Arrow element dimensions — caller measures its own arrow node. */
  arrowDimensions: Dimensions;
  /** Actual placement after flip resolution — drives which axis to compute. */
  placement: Placement;
  /**
   * Minimum distance the arrow keeps from the floating element's corners.
   * Typically matches the floating element's border-radius so the arrow
   * does not visually stick out of a rounded corner. Default `4`.
   */
  padding?: number;
}

export interface ArrowPosition {
  /** Horizontal offset from floating element's left edge (top/bottom placements). */
  x?: number;
  /** Vertical offset from floating element's top edge (left/right placements). */
  y?: number;
}

/**
 * Compute arrow position along a floating element's edge so the arrow visually
 * points at the reference element's center, clamped to stay within the floating
 * element's bounds (minus `padding` for rounded corners).
 *
 * Separate utility (NOT folded into `computePosition`) so non-arrow consumers
 * pay zero cost — Tooltip, DropdownMenu, Select, Combobox, ContextMenu all
 * run without arrow math. Popover and HoverCard opt in by calling this after
 * `computePosition`.
 */
export function computeArrowPosition(args: ComputeArrowPositionArgs): ArrowPosition {
  const {
    reference,
    floatingCoords,
    floatingDimensions,
    arrowDimensions,
    placement,
    padding = 4,
  } = args;

  const { side } = parsePlacement(placement);
  const isVertical = side === 'top' || side === 'bottom';

  if (isVertical) {
    // Arrow sits on the horizontal edge of the floating element.
    const referenceCenterX = reference.x + reference.width / 2;
    // Desired arrow x (relative to floating's left edge).
    const desired = referenceCenterX - floatingCoords.x - arrowDimensions.width / 2;
    const min = padding;
    const max = floatingDimensions.width - arrowDimensions.width - padding;
    const x = max < min ? min : Math.max(min, Math.min(desired, max));
    return { x };
  }

  // side === 'left' || side === 'right' — arrow on vertical edge.
  const referenceCenterY = reference.y + reference.height / 2;
  const desired = referenceCenterY - floatingCoords.y - arrowDimensions.height / 2;
  const min = padding;
  const max = floatingDimensions.height - arrowDimensions.height - padding;
  const y = max < min ? min : Math.max(min, Math.min(desired, max));
  return { y };
}
