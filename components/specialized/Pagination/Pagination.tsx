'use client';

import { forwardRef, useMemo, type HTMLAttributes } from 'react';
import { cn } from '@/components/utils/cn';
import styles from './Pagination.module.scss';

/**
 * Pagination — page navigation control (Phase 6 P5, tier A, `'use client'`).
 *
 * @layer   atom (specialized)
 * @tokens  --color-brand, --color-surface, --color-surface-raised,
 *          --color-border, --color-border-subtle,
 *          --color-text-{primary,secondary,muted},
 *          --space-{1,2,3}, --font-size-sm, --font-weight-{medium,semibold},
 *          --radius-md, --duration-fast, --easing-default, --focus-ring
 * @deps    cn, React hooks (useMemo)
 * @a11y    Renders `<nav aria-label>` > `<ul role="list">` > `<li>` > native
 *          `<button type="button">`. Active page button carries
 *          `aria-current="page"` (per ARIA 1.2 spec for current navigation
 *          state). Disabled buttons use the `disabled` HTML attribute; no
 *          `aria-disabled` needed (native `disabled` is already exposed).
 *          Each button has a descriptive `aria-label` ("Go to page 5",
 *          "Previous page", "Go to first page", etc.). Ellipsis is a
 *          plain `<span aria-hidden="true">`. `totalPages <= 1` renders
 *          `null` (nothing to paginate).
 * @notes   Full-variant page range uses the classic "first … sibling range
 *          … last" pattern with de-duplication: when the sibling range
 *          touches the first/last boundary, the ellipsis is dropped and
 *          the boundary number is absorbed into the range. `currentPage`
 *          is clamped to `[1, totalPages]` in render (silently — no
 *          console warning, consumers may pass raw router state). Compact
 *          variant renders `Prev  Page X of Y  Next` for mobile layouts.
 *
 * @example
 * <Pagination
 *   currentPage={page}
 *   totalPages={totalPages}
 *   onPageChange={setPage}
 *   variant="full"
 *   siblingCount={1}
 * />
 *
 * <Pagination
 *   currentPage={page}
 *   totalPages={totalPages}
 *   onPageChange={setPage}
 *   variant="compact"
 * />
 */
export type PaginationVariant = 'compact' | 'full';

export interface PaginationProps
  extends Omit<HTMLAttributes<HTMLElement>, 'aria-label' | 'onChange'> {
  /** Current active page (1-indexed). Clamped to `[1, totalPages]`. */
  currentPage: number;
  /** Total number of pages. `<= 1` renders nothing. */
  totalPages: number;
  /** Callback invoked with the target page number (1-indexed). */
  onPageChange: (page: number) => void;
  /** Layout variant. Default `'full'`. */
  variant?: PaginationVariant;
  /** Number of sibling pages shown on each side of the current page in full mode. Default `1`. */
  siblingCount?: number;
  /** Accessible label for the `<nav>`. Default `'Pagination'`. */
  ariaLabel?: string;
}

type PageEntry = number | 'ellipsis-left' | 'ellipsis-right';

function range(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
}

function buildPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): PageEntry[] {
  // Number of fixed slots: first + last + current + 2 * siblings + 2 ellipses
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPageNumbers >= totalPages) {
    return range(1, totalPages);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const firstPage = 1;
  const lastPage = totalPages;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 3 + 2 * siblingCount;
    const leftRange = range(1, leftCount);
    return [...leftRange, 'ellipsis-right', lastPage];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + 2 * siblingCount;
    const rightRange = range(totalPages - rightCount + 1, totalPages);
    return [firstPage, 'ellipsis-left', ...rightRange];
  }

  const middleRange = range(leftSibling, rightSibling);
  return [
    firstPage,
    'ellipsis-left',
    ...middleRange,
    'ellipsis-right',
    lastPage,
  ];
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      currentPage,
      totalPages,
      onPageChange,
      variant = 'full',
      siblingCount = 1,
      ariaLabel = 'Pagination',
      className,
      ...rest
    },
    ref,
  ) {
    const safeCurrent = Math.max(1, Math.min(totalPages, currentPage));

    const pageEntries = useMemo<PageEntry[]>(() => {
      if (variant !== 'full') {
        return [];
      }
      return buildPageRange(safeCurrent, totalPages, siblingCount);
    }, [variant, safeCurrent, totalPages, siblingCount]);

    if (totalPages <= 1) {
      return null;
    }

    const isFirst = safeCurrent === 1;
    const isLast = safeCurrent === totalPages;

    const goTo = (page: number) => {
      if (page < 1 || page > totalPages || page === safeCurrent) {
        return;
      }
      onPageChange(page);
    };

    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        className={cn(
          styles.root,
          variant === 'compact' ? styles.variantCompact : styles.variantFull,
          className,
        )}
        {...rest}
      >
        <ul role="list" className={styles.list}>
          <li className={styles.item}>
            <button
              type="button"
              className={styles.button}
              aria-label="Previous page"
              disabled={isFirst}
              onClick={() => goTo(safeCurrent - 1)}
            >
              <span aria-hidden="true">‹</span>
            </button>
          </li>

          {variant === 'full' ? (
            pageEntries.map((entry, index) => {
              if (entry === 'ellipsis-left' || entry === 'ellipsis-right') {
                return (
                  <li
                    key={`${entry}-${index}`}
                    className={styles.item}
                    aria-hidden="true"
                  >
                    <span className={styles.ellipsis}>…</span>
                  </li>
                );
              }

              const isActive = entry === safeCurrent;
              return (
                <li key={`page-${entry}`} className={styles.item}>
                  <button
                    type="button"
                    className={cn(styles.button, isActive && styles.active)}
                    aria-label={
                      isActive
                        ? `Page ${entry}, current page`
                        : `Go to page ${entry}`
                    }
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => goTo(entry)}
                  >
                    {entry}
                  </button>
                </li>
              );
            })
          ) : (
            <li className={styles.item}>
              <span className={styles.compactLabel}>
                Page {safeCurrent} of {totalPages}
              </span>
            </li>
          )}

          <li className={styles.item}>
            <button
              type="button"
              className={styles.button}
              aria-label="Next page"
              disabled={isLast}
              onClick={() => goTo(safeCurrent + 1)}
            >
              <span aria-hidden="true">›</span>
            </button>
          </li>
        </ul>
      </nav>
    );
  },
);
