/**
 * Floating primitives — composable hooks for Phase 10 Complex Interactive
 * components that render floating surfaces (Popover, DropdownMenu, ContextMenu,
 * Tooltip, HoverCard, Select, Combobox, NavigationMenu, etc.).
 *
 * Extracted at E23 (post-ContextMenu) when 3 concrete consumers provided
 * enough signal to factor out the shared primitives without premature
 * abstraction. See `devlog.md` E23 DONE_EPIC for rationale.
 *
 * Zero runtime deps per D5/D25. Every primitive is a plain React hook or
 * component built from `react` + `react-dom` only.
 *
 * @layer utils / floating (E23)
 */

export { createFloatingContext } from './createFloatingContext';
export {
  useFloatingState,
  type FloatingStateConfig,
  type FloatingStateResult,
} from './useFloatingState';
export {
  useFloatingValueState,
  type FloatingValueStateConfig,
  type FloatingValueStateResult,
} from './useFloatingValueState';
export { useFloatingDismiss, type FloatingDismissConfig } from './useFloatingDismiss';
export { useFloatingEscapeStack } from './useFloatingEscapeStack';
export { FloatingPortal, type FloatingPortalProps } from './FloatingPortal';
export { useFloatingFocus, findFirstTabbable, type FloatingFocusConfig } from './useFloatingFocus';
