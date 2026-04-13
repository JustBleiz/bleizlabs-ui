import type { Ref, RefCallback } from 'react';

/**
 * Merges multiple refs (callback or object) into a single callback ref.
 * Used by Slot to pass forwardRef alongside child's own ref.
 */
export function mergeRefs<T>(
  ...refs: Array<Ref<T> | undefined>
): RefCallback<T> {
  return (value: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') {
        ref(value);
      } else {
        (ref as { current: T | null }).current = value;
      }
    }
  };
}
