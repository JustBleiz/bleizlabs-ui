'use client';

/**
 * Tabs — accessible tabs widget per WAI-ARIA APG /tabs/.
 *
 * @layer complex-interactive (Phase 10 CI11)
 * @tokens --color-surface, --color-surface-raised, --color-surface-hover,
 *   --color-text-primary, --color-text-muted, --color-text-inverse,
 *   --color-border-subtle, --color-brand, --focus-ring, --duration-fast,
 *   --easing-default, --space-{1,2,3,4,5}, --radius-md, --font-size-sm,
 *   --font-weight-medium, --shadow-sm. All tokens are real semantic tokens
 *   defined in `_semantics.scss` — no defensive fallbacks required.
 * @deps zero runtime deps. **Self-contained** — no E23 floating primitives
 *   consumed (Tabs content is inline, not floating — no portal, no positioning,
 *   no dismiss, no Escape, no hover, no Provider). Reuses the roving tabindex
 *   PATTERN from NavigationMenu (E25) via a ~10 LOC inline helper
 *   (`setRovingTabindex` + DOM `querySelectorAll` for tab discovery) but not
 *   any hook or primitive. Own Slot primitive for `asChild` polymorphism on
 *   TabsTrigger.
 * @a11y APG `/tabs/` — `<div role="tablist" aria-label aria-orientation>`
 *   (requires either `aria-label` or `aria-labelledby` — TS-enforced union),
 *   `<button role="tab" aria-selected aria-controls>` triggers with roving
 *   tabindex (active `tabindex="0"`, inactive `tabindex="-1"`),
 *   `<div role="tabpanel" aria-labelledby tabindex={0}>` content inline in
 *   natural Tab order (Tab from active trigger moves focus into panel, per
 *   APG composite widget contract). Auto-generated IDs via `useId` — trigger
 *   id `{baseId}-trigger-{value}`, panel id `{baseId}-panel-{value}` — so
 *   `aria-controls` + `aria-labelledby` are wired automatically with zero
 *   consumer burden.
 *
 *   Keyboard model (APG verbatim):
 *   - Right/Down Arrow: next trigger (direction depends on orientation), with
 *     wraparound when `loop={true}` (default)
 *   - Left/Up Arrow: previous trigger (direction depends on orientation)
 *   - Home: first enabled trigger
 *   - End: last enabled trigger
 *   - Space/Enter in `activationMode="manual"`: activate focused trigger
 *   - Any arrow in `activationMode="automatic"` (default): activates trigger
 *     as focus moves (instant reveal)
 *   - Modifier keys (Cmd/Ctrl/Alt/Shift + arrow): skipped — browser hotkeys
 *     like Cmd+← (back) take precedence (Radix TB-R04 fix)
 *   - Tab from active trigger: moves focus INTO the tabpanel (because panel
 *     has `tabindex={0}`), per APG composite widget contract
 *
 *   Disabled triggers: skipped by arrow nav + Home/End (DOM query filters
 *   `:not([disabled]):not([aria-disabled="true"])`).
 *
 *   RTL support: when `dir="rtl"` is set on `<Tabs>`, Right Arrow moves to
 *   PREVIOUS trigger and Left Arrow moves to NEXT — horizontal axis reversed.
 *   Vertical orientation (Up/Down) is unaffected by dir.
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y via eslint-config-next ✓ |
 *   next build ✓ | Playwright suite EXECUTED in-repo (keyboard/focus/aria/
 *   regression `.spec.ts` quad, CI-gated; incl. TB-R23/R24) + axe-core
 *   smoke on the demo route. DEFERRED: manual NVDA sweep.
 * @regressions tests/Tabs.{keyboard,focus,aria,regression}.spec.md — 24
 *   regression cases mapped (TB-R01..R24; R23/R24 = asChild rest-forwarding,
 *   E01 audit remediation). The original bug+fix mapping came from an
 *   ephemeral `_tmp` spec draft (since retired; the per-case content in
 *   the tests/ quad is the canon — executable canon in the sibling
 *   `.spec.ts` files).
 * @example
 *   <Tabs defaultValue="overview">
 *     <TabsList aria-label="Project sections">
 *       <TabsTrigger value="overview">Overview</TabsTrigger>
 *       <TabsTrigger value="tasks">Tasks</TabsTrigger>
 *       <TabsTrigger value="team">Team</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="overview">Overview content...</TabsContent>
 *     <TabsContent value="tasks">Tasks content...</TabsContent>
 *     <TabsContent value="team">Team content...</TabsContent>
 *   </Tabs>
 *
 *   // Manual activation for async-loaded panels
 *   <Tabs defaultValue="a" activationMode="manual">...</Tabs>
 *
 *   // Vertical orientation for side-nav layouts
 *   <Tabs defaultValue="profile" orientation="vertical">...</Tabs>
 */

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import { useFloatingValueState } from '../../utils/floating';
import styles from './Tabs.module.scss';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationMode = 'automatic' | 'manual';
export type TabsDir = 'ltr' | 'rtl';

// ──────────────────────────────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────────────────────────────

interface TabsContextValue {
  /** Currently selected value. */
  value: string | null;
  /** Sets the selected value + triggers onValueChange. */
  setValue: (next: string) => void;
  /** Base id for auto-generating trigger/panel ids. */
  baseId: string;
  /** Auto-generate trigger id for a value. */
  getTriggerId: (value: string) => string;
  /** Auto-generate panel id for a value. */
  getPanelId: (value: string) => string;
  orientation: TabsOrientation;
  activationMode: TabsActivationMode;
  dir: TabsDir;
  /** List ref — the `<div role="tablist">` for roving tabindex DOM queries. */
  listRef: RefObject<HTMLDivElement | null>;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(componentName: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(`${componentName} must be rendered inside a <Tabs> parent.`);
  }
  return ctx;
}

// ──────────────────────────────────────────────────────────────────────────
// Roving tabindex helper — DOM-attribute updates, no React re-render
// (pattern replicated from NavigationMenu E25)
// ──────────────────────────────────────────────────────────────────────────

// Tab DOM query filter. Only `aria-disabled="true"` is filtered — triggers
// never receive the native `disabled` attribute per APG (see TabsTrigger
// render comment for rationale).
const TAB_SELECTOR = '[role="tab"]:not([aria-disabled="true"])';

function getTabs(list: HTMLElement): HTMLButtonElement[] {
  return Array.from(list.querySelectorAll<HTMLButtonElement>(TAB_SELECTOR));
}

function setRovingTabindex(tabs: HTMLElement[], activeIndex: number): void {
  tabs.forEach((tab, idx) => {
    tab.setAttribute('tabindex', idx === activeIndex ? '0' : '-1');
  });
}

// ──────────────────────────────────────────────────────────────────────────
// Tabs — state holder + context provider
// ──────────────────────────────────────────────────────────────────────────

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'dir'> {
  /** TabsList + TabsPanel compound children. */
  children: ReactNode;
  /** Controlled selected value. When provided, component is controlled. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Fires whenever the selected value changes. */
  onValueChange?: (value: string) => void;
  /**
   * Activation model. `'automatic'` (default) activates the tab as focus
   * moves via arrow keys. `'manual'` requires Space/Enter to activate the
   * focused tab — use for async-loaded or high-cost panels.
   */
  activationMode?: TabsActivationMode;
  /**
   * Axis. `'horizontal'` (default) uses Right/Left arrows to navigate;
   * `'vertical'` uses Down/Up. Note: orientation affects KEYBOARD NAV only,
   * not visual layout — use CSS (or the `data-orientation` attribute) for
   * visual rotation.
   */
  orientation?: TabsOrientation;
  /**
   * Reading direction. When `'rtl'`, Right/Left arrow semantics are
   * reversed in horizontal orientation.
   */
  dir?: TabsDir;
  /** Extra class for the Tabs root container. */
  className?: string;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    children,
    value: controlledValue,
    defaultValue,
    onValueChange,
    activationMode = 'automatic',
    orientation = 'horizontal',
    dir = 'ltr',
    className,
    ...rest
  },
  forwardedRef,
) {
  const baseId = useId();
  // Controlled/uncontrolled value via shared primitive (E29). `setValue` is
  // identity-guarded (no-op when next === current) via the hook's internal
  // `valueRef` and is stable across value changes — safe to include in the
  // context memo dep list without churning every SelectItem / TabsTrigger
  // child's useLayoutEffect registrations.
  // Filter null at boundary: Tabs' public onValueChange is (string) => void;
  // hook fires (string | null) → we drop nulls (never happens in Tabs anyway,
  // but the type narrow is required). Wrapper memoized via useCallback per
  // Combobox E28 precedent so hook's setValue identity stays stable across
  // unrelated parent re-renders (not just value-change renders).
  const handleValueChange = useCallback(
    (next: string | null) => {
      if (next !== null) onValueChange?.(next);
    },
    [onValueChange],
  );
  const { value, setValue } = useFloatingValueState<string>({
    controlledValue,
    defaultValue: defaultValue ?? null,
    onValueChange: handleValueChange,
  });

  const getTriggerId = useCallback((v: string) => `${baseId}-trigger-${v}`, [baseId]);
  const getPanelId = useCallback((v: string) => `${baseId}-panel-${v}`, [baseId]);

  const listRef = useRef<HTMLDivElement | null>(null);

  const ctxValue = useMemo<TabsContextValue>(
    () => ({
      value,
      setValue,
      baseId,
      getTriggerId,
      getPanelId,
      orientation,
      activationMode,
      dir,
      listRef,
    }),
    [value, setValue, baseId, getTriggerId, getPanelId, orientation, activationMode, dir],
  );

  return (
    <TabsContext.Provider value={ctxValue}>
      <div
        ref={forwardedRef}
        className={cn(styles.root, className)}
        data-orientation={orientation}
        dir={dir}
        {...rest}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

// ──────────────────────────────────────────────────────────────────────────
// TabsList — `<div role="tablist">` flex container + roving tabindex + keyboard
// ──────────────────────────────────────────────────────────────────────────

// Variant class-name keys exposed for consumer override.
export type TabsListVariant = 'underline' | 'pill' | 'segmented';

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  /** TabsTrigger elements. */
  children: ReactNode;
  /**
   * Visual variant. `'underline'` (default) — border-bottom bar with active
   * brand underline. `'pill'` — pill-shaped buttons with active fill.
   * `'segmented'` — iOS-style tight group with raised active button.
   */
  variant?: TabsListVariant;
  /**
   * When `true` (default), arrow-key navigation wraps from last trigger
   * back to first and vice versa. Set `false` for clamped navigation.
   */
  loop?: boolean;
  /** Extra class for the tablist container. */
  className?: string;
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  {
    children,
    variant = 'underline',
    loop = true,
    className,
    onKeyDown,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  },
  forwardedRef,
) {
  const ctx = useTabsContext('<TabsList>');
  const { orientation, activationMode, dir, listRef, setValue, value } = ctx;

  // Stabilize the merged callback ref so React doesn't detach/reattach on
  // every render. `listRef` is a stable RefObject so useCallback deps can
  // use `forwardedRef` safely.
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef, listRef],
  );

  // Sync roving tabindex with the selected value. Runs on mount AND on
  // every value change — required for controlled mode where the parent
  // may set `value` programmatically without any user keyboard interaction.
  // In uncontrolled mode this effectively becomes a mount-only init
  // because `value` only changes via user interaction (which already
  // handles roving tabindex via focus events — the sync is idempotent).
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const tabs = getTabs(list);
    if (tabs.length === 0) return;
    // Find the currently selected tab by matching `data-value` attribute.
    // Fall back to first enabled tab when no match (defaultValue=nonexistent).
    const selectedIdx = tabs.findIndex((t) => t.getAttribute('data-value') === value);
    const activeIdx = selectedIdx >= 0 ? selectedIdx : 0;
    setRovingTabindex(tabs, activeIdx);
  }, [value, listRef]);

  const focusTab = useCallback(
    (tabs: HTMLElement[], index: number) => {
      const target = tabs[index];
      if (!target) return;
      setRovingTabindex(tabs, index);
      target.focus();
      // Automatic mode: activate the tab as focus moves.
      if (activationMode === 'automatic') {
        const targetValue = target.getAttribute('data-value');
        if (targetValue) setValue(targetValue);
      }
    },
    [activationMode, setValue],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // Skip if any modifier key is pressed — browser hotkeys like Cmd+←
      // (back) should not be intercepted by tab arrow nav (Radix TB-R04 fix).
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
        onKeyDown?.(event);
        return;
      }

      const list = listRef.current;
      if (!list) {
        onKeyDown?.(event);
        return;
      }
      const tabs = getTabs(list);
      if (tabs.length === 0) {
        onKeyDown?.(event);
        return;
      }

      const activeIndex = tabs.findIndex((el) => el === document.activeElement);
      if (activeIndex === -1) {
        onKeyDown?.(event);
        return;
      }

      const isHorizontal = orientation === 'horizontal';
      const isRtl = dir === 'rtl';
      // In horizontal + RTL, Right/Left semantics are swapped.
      const nextKey = isHorizontal ? (isRtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
      const prevKey = isHorizontal ? (isRtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';

      switch (event.key) {
        case nextKey: {
          event.preventDefault();
          const nextIdx = activeIndex < tabs.length - 1 ? activeIndex + 1 : loop ? 0 : activeIndex;
          focusTab(tabs, nextIdx);
          return;
        }
        case prevKey: {
          event.preventDefault();
          const prevIdx = activeIndex > 0 ? activeIndex - 1 : loop ? tabs.length - 1 : 0;
          focusTab(tabs, prevIdx);
          return;
        }
        case 'Home': {
          event.preventDefault();
          focusTab(tabs, 0);
          return;
        }
        case 'End': {
          event.preventDefault();
          focusTab(tabs, tabs.length - 1);
          return;
        }
        case 'Enter':
        case ' ': {
          // Manual mode: activate the focused tab. Automatic mode: no-op
          // (already activated on focus). Skip if the event target is not
          // the focused tab itself (e.g., a child input — Radix TB-R08 fix).
          if (activationMode !== 'manual') break;
          const target = event.target as HTMLElement;
          if (target.getAttribute('role') !== 'tab') break;
          event.preventDefault();
          const targetValue = target.getAttribute('data-value');
          if (targetValue) setValue(targetValue);
          return;
        }
        default:
          break;
      }

      onKeyDown?.(event);
    },
    [orientation, dir, loop, activationMode, focusTab, setValue, listRef, onKeyDown],
  );

  // Require aria-label OR aria-labelledby — APG mandate. Dev-only runtime
  // warning (no TS union so common case `aria-label="..."` stays simple).
  // Deps are stable primitive strings from destructured props — avoids
  // the "new object every render" bug that `[rest]` would create.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      if (!ariaLabel && !ariaLabelledBy) {
        console.warn(
          '<TabsList> should have `aria-label` or `aria-labelledby` — required by APG /tabs/ for an accessible name.',
        );
      }
    }
  }, [ariaLabel, ariaLabelledBy]);

  return (
    <div
      ref={mergedRef}
      role="tablist"
      aria-orientation={orientation}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn(styles.list, styles[variant], className)}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {children}
    </div>
  );
});

// ──────────────────────────────────────────────────────────────────────────
// TabsTrigger — `<button role="tab">`
// ──────────────────────────────────────────────────────────────────────────

export interface TabsTriggerProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'role' | 'aria-selected' | 'aria-controls' | 'id'
> {
  /** REQUIRED — matches the `value` on a TabsContent. */
  value: string;
  /** Tab label content. */
  children: ReactNode;
  /**
   * When `true`, Slot-wraps the single React element child, merging role +
   * ARIA and event handlers. When `false` (default), renders a native
   * `<button type="button">`.
   */
  asChild?: boolean;
  /** Extra class for the trigger element. */
  className?: string;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { value, children, asChild = false, onClick, onFocus, disabled, className, ...rest },
  forwardedRef,
) {
  const ctx = useTabsContext('<TabsTrigger>');
  const { value: selectedValue, setValue, getTriggerId, getPanelId, listRef, activationMode } = ctx;

  const isSelected = selectedValue === value;
  const triggerId = getTriggerId(value);
  const panelId = getPanelId(value);

  // Handler types use `HTMLElement` (not `HTMLButtonElement`) so the
  // `asChild` path — which can Slot-wrap any element like `<a>` — remains
  // type-safe. The non-asChild branch still renders a `<button>` so the
  // superset type is compatible.
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) return;
      setValue(value);
      onClick?.(event as React.MouseEvent<HTMLButtonElement>);
    },
    [disabled, setValue, value, onClick],
  );

  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      if (disabled) {
        onFocus?.(event as React.FocusEvent<HTMLButtonElement>);
        return;
      }
      // Update roving tabindex — make this trigger the active one.
      const list = listRef.current;
      if (list) {
        const tabs = getTabs(list);
        const idx = tabs.findIndex((el) => el === event.currentTarget);
        if (idx !== -1) setRovingTabindex(tabs, idx);
      }
      // In automatic mode, focus also activates the tab. Handles the
      // "click focuses without arrow-nav" path — arrow-nav path already
      // calls setValue inside focusTab. Setting twice in same tick is a
      // no-op because `setValue` guards against `next === value`.
      if (activationMode === 'automatic') {
        setValue(value);
      }
      onFocus?.(event as React.FocusEvent<HTMLButtonElement>);
    },
    [disabled, listRef, activationMode, setValue, value, onFocus],
  );

  const ariaProps = {
    id: triggerId,
    role: 'tab' as const,
    'aria-selected': isSelected,
    'aria-controls': panelId,
    'aria-disabled': disabled || undefined,
    'data-value': value,
    'data-state': (isSelected ? 'active' : 'inactive') as 'active' | 'inactive',
  };

  // APG `/tabs/`: disabled triggers use `aria-disabled="true"` ONLY (NOT
  // native `disabled`). Native `disabled` removes the element from the
  // focus order AND prevents the browser from firing focus events, which
  // breaks the roving tabindex management for disabled items. Pair with
  // handler guards (handleClick + handleFocus check the prop directly) +
  // CSS `pointer-events: none` + `opacity: 0.5`. Mirrors NavigationMenu
  // sibling (E25) and DropdownMenu convention.
  if (asChild) {
    return (
      <Slot
        ref={forwardedRef}
        {...ariaProps}
        tabIndex={isSelected ? 0 : -1}
        className={cn(styles.trigger, className)}
        onClick={handleClick}
        onFocus={handleFocus}
        {...(rest as React.HTMLAttributes<HTMLElement>)}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={forwardedRef}
      type="button"
      {...ariaProps}
      tabIndex={isSelected ? 0 : -1}
      className={cn(styles.trigger, className)}
      onClick={handleClick}
      onFocus={handleFocus}
      {...rest}
    >
      {children}
    </button>
  );
});

// ──────────────────────────────────────────────────────────────────────────
// TabsContent — `<div role="tabpanel">`
// ──────────────────────────────────────────────────────────────────────────

export interface TabsContentProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'role' | 'aria-labelledby' | 'id'
> {
  /** REQUIRED — matches the `value` on a TabsTrigger. */
  value: string;
  /** Panel content shown while this tab is active. */
  children: ReactNode;
  /**
   * When `true`, the content stays mounted in the DOM even when inactive
   * (useful for animations or to preserve internal state across switches).
   * Inactive content is hidden via `hidden` attribute + CSS.
   * When `false` (default), inactive content is unmounted.
   */
  forceMount?: boolean;
  /** Extra class for the tabpanel element. */
  className?: string;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { value, children, forceMount = false, className, ...rest },
  forwardedRef,
) {
  const ctx = useTabsContext('<TabsContent>');
  const { value: selectedValue, getTriggerId, getPanelId } = ctx;

  const isActive = selectedValue === value;
  const panelId = getPanelId(value);
  const triggerId = getTriggerId(value);

  if (!isActive && !forceMount) return null;

  // APG `/tabs/`: active tabpanel is `tabindex={0}` so Tab from the active
  // trigger moves focus INTO the panel in natural Tab order. Inactive
  // `forceMount` panels are `hidden` AND `tabindex={-1}` so they stay out
  // of the Tab sequence — native `hidden` removes from accessibility tree
  // in modern AT, but the defensive `-1` covers older AT+browser combos.
  return (
    <div
      ref={forwardedRef}
      id={panelId}
      role="tabpanel"
      aria-labelledby={triggerId}
      tabIndex={isActive ? 0 : -1}
      data-state={isActive ? 'active' : 'inactive'}
      hidden={!isActive}
      className={cn(styles.content, className)}
      {...rest}
    >
      {children}
    </div>
  );
});
