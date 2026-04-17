'use client';

// Why `'use client'`: Slot merges arbitrary props — including event handlers
// (onClick, onPointerDown, onFocus, etc.) passed by consumers via `asChild`.
// Functions can't cross the RSC serialization boundary, so Slot must execute
// on the client side to accept handler props. This creates a client boundary
// at every `asChild` call site; Next.js 16 + React 19 dev mode can emit a
// hydration-diff warning for the SSR'd wrapper element, which is benign
// (SSR output and client re-render are functionally identical) and does not
// occur in production. Making Slot RSC breaks any component whose playground
// or consumer passes handlers through asChild.
import {
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
  if (!isValidElement(children)) {
    return null;
  }

  const child = children as ReactElement<{
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
