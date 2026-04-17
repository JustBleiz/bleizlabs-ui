'use client';

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  Accordion,
  type AccordionProps,
} from '@/components/interactive/Accordion';
import { Stack } from '@/components/layout/Stack';
import type { SpaceIndex } from '@/components/types/spacing';
import { cn } from '@/components/utils/cn';
import styles from './AccordionGroup.module.scss';

/**
 * AccordionGroup — FAQ-style wrapper for multiple Accordion panels (Phase 7 M4).
 *
 * @layer   molecule
 * @tokens  inherited via Stack atom (gap scale)
 * @deps    Accordion atom (controlled mode via `open` + `onOpenChange`),
 *          Stack atom (gap prop), `SpaceIndex` type, cn,
 *          React: `Children`, `cloneElement`, `isValidElement`,
 *          `forwardRef`, `useCallback`, `useState`
 * @a11y    Optional `role="region"` + `aria-label` supported via spread
 *          props when the consumer wants the group announced as a
 *          landmark. No extra ARIA is forced — each Accordion child
 *          already carries the full APG disclosure pattern
 *          (button + aria-expanded + aria-controls + region).
 * @notes   Controlled at the group level: AccordionGroup owns a
 *          `Set<number>` of open indexes and injects `open` +
 *          `onOpenChange` into each Accordion child via
 *          `React.cloneElement`. Children **must be Accordion elements**
 *          — invalid / non-Accordion children are rendered as-is
 *          (gracefully) but will not participate in the group's open
 *          state. `mode="single"` enforces one-at-a-time (opening a new
 *          panel closes any previously-open panel). `mode="multiple"`
 *          allows any combination. `defaultOpen` accepts a single index
 *          or an array of indexes and seeds the internal set.
 *
 * @example
 * <AccordionGroup mode="single" defaultOpen={0}>
 *   <Accordion question="Pricing">…</Accordion>
 *   <Accordion question="Delivery">…</Accordion>
 *   <Accordion question="Returns">…</Accordion>
 * </AccordionGroup>
 *
 * <AccordionGroup mode="multiple" defaultOpen={[0, 2]} gap={3}>
 *   …
 * </AccordionGroup>
 */
export type AccordionGroupMode = 'single' | 'multiple';

export interface AccordionGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** One or more `Accordion` children. Non-Accordion children are passed through untouched. */
  children: ReactNode;
  /** `'single'` = only one panel open at a time. `'multiple'` = any combination. Default `'single'`. */
  mode?: AccordionGroupMode;
  /** Initial open state (index-based). Single index or array. Default none. */
  defaultOpen?: number | number[];
  /** Fired whenever the set of open indexes changes. */
  onOpenChange?: (openIndexes: number[]) => void;
  /** Gap between Accordion items via Stack. Default `2` (8px). */
  gap?: SpaceIndex;
}

function toOpenSet(value: number | number[] | undefined): Set<number> {
  if (value === undefined) return new Set();
  if (Array.isArray(value)) return new Set(value);
  return new Set([value]);
}

export const AccordionGroup = forwardRef<HTMLDivElement, AccordionGroupProps>(
  function AccordionGroup(
    {
      children,
      mode = 'single',
      defaultOpen,
      onOpenChange,
      gap = 2,
      className,
      ...rest
    },
    ref,
  ) {
    const [openSet, setOpenSet] = useState<Set<number>>(() =>
      toOpenSet(defaultOpen),
    );

    const updateSet = useCallback(
      (index: number, next: boolean) => {
        setOpenSet((prev) => {
          const updated = new Set(mode === 'single' ? [] : prev);
          if (next) {
            updated.add(index);
          } else {
            updated.delete(index);
          }
          const sorted = Array.from(updated).sort((a, b) => a - b);
          onOpenChange?.(sorted);
          return updated;
        });
      },
      [mode, onOpenChange],
    );

    let accordionIndex = 0;
    const mapped = Children.map(children, (child) => {
      if (!isValidElement(child) || child.type !== Accordion) {
        return child;
      }
      const index = accordionIndex++;
      const accordionChild = child as ReactElement<AccordionProps>;
      return cloneElement(accordionChild, {
        open: openSet.has(index),
        onOpenChange: (next: boolean) => {
          accordionChild.props.onOpenChange?.(next);
          updateSet(index, next);
        },
      });
    });

    return (
      <Stack
        ref={ref}
        gap={gap}
        className={cn(styles.root, className)}
        {...rest}
      >
        {mapped}
      </Stack>
    );
  },
);
