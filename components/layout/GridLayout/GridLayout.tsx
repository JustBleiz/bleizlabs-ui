import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import type { SpaceIndex } from '../../types/spacing';
import styles from './GridLayout.module.scss';

/**
 * GridLayout — multi-column CSS Grid layout atom.
 *
 * Universal multi-column primitive sitting alongside Stack / Inline /
 * Container / Section. Use when content needs equal-column rhythm (cards
 * grid, metric tiles, comparison tables) or arbitrary track templates
 * (sidebar + main + aside).
 *
 * @tokens  --space-{0..20} (threaded via `--grid-{column,row}-gap`).
 *          CSS Grid keyword values written into `--grid-cols{,-sm,-md,
 *          -lg,-xl}` / `--grid-rows` are layout primitives, not design
 *          tokens. Breakpoint switching is implemented via `@use 'mixins'
 *          as mx` + `@include mx.bp-{sm,md,lg,xl}` in
 *          `GridLayout.module.scss`.
 *
 * @a11y    Pure layout primitive. Renders `<div>` by default, no
 *          role/aria. Use `asChild` to project onto `<section>`, `<ul>`,
 *          etc. The grid tracks are visually structural — semantic meaning
 *          lives on the children, not on the container.
 *
 * @example
 * // Equal 3-column grid
 * <GridLayout columns={3} gap={4}>
 *   {items.map((item) => <Card key={item.id}>{item.label}</Card>)}
 * </GridLayout>
 *
 * // Mobile-first responsive cascade — 1col mobile / 2col tablet / 3col desktop
 * <GridLayout columns={1} responsive={{ md: 2, lg: 3 }} gap={3}>
 *   ...
 * </GridLayout>
 *
 * // Arbitrary tracks — sidebar + main
 * <GridLayout columns="240px 1fr" gap={5} align="start">
 *   <Sidebar />
 *   <Main />
 * </GridLayout>
 *
 * // Auto-fitting card grid
 * <GridLayout columns="repeat(auto-fit, minmax(220px, 1fr))" gap={4}>
 *   ...
 * </GridLayout>
 */

type GridAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type GridJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'stretch'
  | 'between'
  | 'around'
  | 'evenly';

export interface GridLayoutResponsive {
  /** Override at min-width 640px (sm). */
  sm?: number | string;
  /** Override at min-width 768px (md). */
  md?: number | string;
  /** Override at min-width 1024px (lg). */
  lg?: number | string;
  /** Override at min-width 1280px (xl). */
  xl?: number | string;
}

export interface GridLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Column template. Number → `repeat(N, minmax(0, 1fr))` shorthand for
   * equal-column grids with overflow protection. String → raw CSS
   * `grid-template-columns` value (e.g. `'240px 1fr'`,
   * `'repeat(auto-fit, minmax(200px, 1fr))'`).
   */
  columns: number | string;
  /**
   * Row template. Number → `repeat(N, auto)`. String → raw CSS value.
   * Default leaves rows auto-sized (no explicit template).
   */
  rows?: number | string;
  /**
   * Gap between cells (both axes). Maps to `--space-{n}`. Default 3 (12px).
   * Override per-axis via `columnGap` / `rowGap`.
   */
  gap?: SpaceIndex;
  /** Column gap override. Defaults to `gap`. */
  columnGap?: SpaceIndex;
  /** Row gap override. Defaults to `gap`. */
  rowGap?: SpaceIndex;
  /** `align-items` for cells (cross-axis). Default `stretch`. */
  align?: GridAlign;
  /** `justify-content` for grid tracks (main-axis). Default `start`. */
  justify?: GridJustify;
  /**
   * Mobile-first responsive column overrides. Each breakpoint inherits
   * the previous (or base `columns`) when omitted. Breakpoints map to
   * `mx.bp-{sm,md,lg,xl}` mixins (640 / 768 / 1024 / 1280 px min-width).
   */
  responsive?: GridLayoutResponsive;
  /** Render as the single child element via Slot. */
  asChild?: boolean;
  /** Grid content. */
  children?: ReactNode;
}

// CSS Grid uses bare 'start' / 'end' values — no flex-* prefix needed.
// This intentionally differs from Stack/Inline ALIGN_MAP which translates
// to flex-start / flex-end for the flex layout context. Maps keyed via
// `NonNullable<GridLayoutProps['align']>` so future widening of the prop
// union triggers TS exhaustiveness errors here (mirrors Stack/Inline).
const ALIGN_MAP: Record<NonNullable<GridLayoutProps['align']>, string> = {
  start: 'start',
  center: 'center',
  end: 'end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const JUSTIFY_MAP: Record<NonNullable<GridLayoutProps['justify']>, string> = {
  start: 'start',
  center: 'center',
  end: 'end',
  stretch: 'stretch',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

// ---------------------------------------------------------------------------
// helpers — grid-track template normalisers
// ---------------------------------------------------------------------------

function tracksToCss(value: number | string): string {
  if (typeof value === 'number') {
    if (!Number.isInteger(value) || value < 1) {
      // Runtime safety for layout primitives — fall back to single column
      // rather than emitting invalid `repeat(0, ...)` which CSS rejects.
      return 'minmax(0, 1fr)';
    }
    return `repeat(${value}, minmax(0, 1fr))`;
  }
  return value;
}

function rowsToCss(value: number | string): string {
  if (typeof value === 'number') {
    if (!Number.isInteger(value) || value < 1) return 'auto';
    return `repeat(${value}, auto)`;
  }
  return value;
}

export const GridLayout = forwardRef<HTMLDivElement, GridLayoutProps>(
  function GridLayout(
    {
      columns,
      rows,
      gap = 3,
      columnGap,
      rowGap,
      align = 'stretch',
      justify = 'start',
      responsive,
      asChild = false,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const Comp = asChild ? Slot : 'div';

    const gridVars: CSSProperties = {
      '--grid-cols': tracksToCss(columns),
      '--grid-column-gap': `var(--space-${columnGap ?? gap})`,
      '--grid-row-gap': `var(--space-${rowGap ?? gap})`,
      '--grid-align': ALIGN_MAP[align],
      '--grid-justify': JUSTIFY_MAP[justify],
      ...(rows !== undefined && { '--grid-rows': rowsToCss(rows) }),
      ...(responsive?.sm !== undefined && {
        '--grid-cols-sm': tracksToCss(responsive.sm),
      }),
      ...(responsive?.md !== undefined && {
        '--grid-cols-md': tracksToCss(responsive.md),
      }),
      ...(responsive?.lg !== undefined && {
        '--grid-cols-lg': tracksToCss(responsive.lg),
      }),
      ...(responsive?.xl !== undefined && {
        '--grid-cols-xl': tracksToCss(responsive.xl),
      }),
    } as CSSProperties;

    return (
      <Comp
        ref={ref}
        className={cn(styles.root, className)}
        style={{ ...style, ...gridVars }}
        {...rest}
      >
        {children}
      </Comp>
    );
  },
);
