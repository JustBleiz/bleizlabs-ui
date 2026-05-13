'use client';

// 0.22.1 hydration mismatch fix (Mantine Children.toArray pattern).
//
// Context — upstream regression (vercel/next.js#82527 + radix-ui/primitives
// #3776/#3780): Next.js 16.0.10+ RSC serializer can hand `cloneElement`
// consumers a `children` value with `$$typeof: Symbol(react.lazy)` and
// `_payload: pending Promise` instead of `Symbol(react.transitional.element)`.
// `isValidElement` returns true on the lazy reference, so the prior Slot
// implementation cloned the wrong element type — client first paint
// rendered the host's default tag, the lazy payload resolved later, and
// React 19 dev-mode hydration check surfaced the diff (e.g. `<Card asChild>
// <a/>` → server `<a>` vs client `<div>` mismatch on /components/card).
//
// Resolution — wrap children in `Children.toArray` BEFORE `isValidElement`
// check. React's reconciler resolves lazy children internally during
// `toArray`, so the subsequent `cloneElement` receives the real element.
// Validated upstream by mantinedev/mantine#8522 against the Radix repro.
// Two prior bleizlabs migration attempts (0.20.1 + 0.21.1) chasing
// `forwardRef → ref-as-prop` did NOT help — they targeted the wrong layer.
// Consumers (Card, Stack, Section, +31 more) retain `forwardRef` unchanged.
//
// `'use client'` retained: Slot still merges arbitrary event handlers, so
// it must execute in client context. No consumer migration required.
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';
import { cn } from '../cn';
import { mergeRefs } from '../mergeRefs';

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

/**
 * Slot — renders its single React element child with merged props.
 *
 * Powers the `asChild` pattern across bleizlabs-ui. When a component
 * receives `asChild`, it swaps its native tag for <Slot> and clones the
 * child, merging className, style, ref, and event handlers without losing
 * the child's own props.
 *
 * Constraints (by design):
 * - Exactly one React element child. Strings, fragments, arrays → null.
 * - Child must accept className/style/ref (intrinsic elements always do;
 *   custom components must use forwardRef and pass these through).
 *
 * Reference: WAI-ARIA APG composition patterns + Radix Slot (MIT, own-build).
 */
export const Slot = forwardRef<HTMLElement, SlotProps>(function Slot(
  { children, className, style, ...slotProps },
  forwardedRef,
) {
  // Unwrap lazy-reference children leaked by Next.js 16 RSC serializer.
  // React's reconciler resolves any Symbol(react.lazy) payload during
  // Children.toArray, so the subsequent cloneElement receives the real
  // element. See header comment for upstream issue refs.
  const resolved = Children.toArray(children);
  if (resolved.length !== 1 || !isValidElement(resolved[0])) {
    return null;
  }

  const child = resolved[0] as ReactElement<{
    className?: string;
    style?: CSSProperties;
    ref?: Ref<HTMLElement>;
  }>;

  const childProps = child.props ?? {};
  const childRef = (child as unknown as { ref?: Ref<HTMLElement> }).ref;

  return cloneElement(child, {
    ...mergeProps(slotProps, childProps),
    className: cn(className, childProps.className),
    style: { ...style, ...childProps.style },
    ref: mergeRefs(forwardedRef, childRef),
  } as Record<string, unknown>);
});

/**
 * Merge two prop bags. Event handlers (on*) are chained: parent runs first,
 * then child. Other parent props are overridden by child props (child wins),
 * matching Radix Slot semantics — the child element controls its own behavior
 * and the parent layers styling/classes on top.
 */
function mergeProps(
  parent: Record<string, unknown>,
  child: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...parent };

  for (const key in child) {
    const parentValue = parent[key];
    const childValue = child[key];
    const isEventHandler =
      key.startsWith('on') &&
      typeof parentValue === 'function' &&
      typeof childValue === 'function';

    if (isEventHandler) {
      merged[key] = (...args: unknown[]) => {
        (parentValue as (...a: unknown[]) => unknown)(...args);
        (childValue as (...a: unknown[]) => unknown)(...args);
      };
    } else if (key === 'className' || key === 'style') {
      // handled in caller
      continue;
    } else {
      merged[key] = childValue;
    }
  }

  return merged;
}
