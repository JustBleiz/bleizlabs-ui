'use client';

/**
 * createFloatingContext — typed React context factory for floating components.
 *
 * Replaces the repeated pattern:
 *   const XContext = createContext<X | null>(null);
 *   function useXContext(component) {
 *     const ctx = useContext(XContext);
 *     if (!ctx) throw new Error(...);
 *     return ctx;
 *   }
 *
 * @layer utils / floating primitives (E23)
 * @deps react only
 * @usage
 *   const [PopoverProvider, usePopoverContext] =
 *     createFloatingContext<PopoverContextValue>('Popover');
 *   // <PopoverProvider value={...}>{children}</PopoverProvider>
 *   // const ctx = usePopoverContext('<PopoverTrigger>');
 */

import { createContext, useContext, type Provider } from 'react';

export function createFloatingContext<T>(
  parentName: string,
): [Provider<T | null>, (componentName: string) => T] {
  const Context = createContext<T | null>(null);
  Context.displayName = `${parentName}Context`;

  function useFloatingContextValue(componentName: string): T {
    const ctx = useContext(Context);
    if (!ctx) {
      throw new Error(`${componentName} must be rendered inside a <${parentName}> parent.`);
    }
    return ctx;
  }

  return [Context.Provider, useFloatingContextValue];
}
