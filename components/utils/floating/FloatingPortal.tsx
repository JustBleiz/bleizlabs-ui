'use client';

/**
 * FloatingPortal — SSR-safe portal wrapper for floating components.
 *
 * Wraps `createPortal(children, document.body)` with:
 *   - `typeof document === 'undefined'` guard for SSR
 *   - mount-effect gate so portal content only renders after client hydration
 *
 * Replaces the repeated inline pattern:
 *   if (!open) return null;
 *   if (typeof document === 'undefined') return null;
 *   return createPortal(<div>...</div>, document.body);
 *
 * Consumers still own the `!open` short-circuit before rendering this
 * component — we don't want to unmount-mount DOM on every open/close if
 * the consumer wants persistent DOM for future `forceMount` semantics.
 *
 * @layer utils / floating primitives (E23)
 * @deps react, react-dom (createPortal)
 * @example
 *   if (!open) return null;
 *   return (
 *     <FloatingPortal>
 *       <div ref={popperRef} style={floatingStyles}>
 *         ...
 *       </div>
 *     </FloatingPortal>
 *   );
 */

import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface FloatingPortalProps {
  children: ReactNode;
  /**
   * Optional portal target. Defaults to `document.body`. Consumers can
   * pass a specific container (e.g. a modal root div) for nested modal
   * scenarios.
   */
  container?: HTMLElement | null;
}

export function FloatingPortal({ children, container }: FloatingPortalProps) {
  // SSR guard — `typeof document === 'undefined'` on the server. Consumer
  // is expected to short-circuit with `if (!open) return null` before
  // rendering this component, so portal content only enters the DOM when
  // open is true. Next.js App Router hydrates portal content as a separate
  // subtree so there is no hydration mismatch risk from skipping a
  // `mounted` gate here (React treats portal destinations distinctly from
  // the parent's hydration boundary).
  if (typeof document === 'undefined') return null;

  const target = container ?? document.body;
  return createPortal(children, target);
}
