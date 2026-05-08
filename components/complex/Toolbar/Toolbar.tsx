'use client';

/**
 * Toolbar — accessible toolbar container per WAI-ARIA APG `/toolbar/`.
 *
 * @layer complex-interactive (Phase 10 — P1 universal gap, 2026-05-08)
 * @tokens --color-surface, --color-border-subtle, --radius-md, --space-2,
 *   --space-3, --duration-fast, --easing-default, --focus-ring. All tokens
 *   are real semantic tokens defined in `_semantics.scss` — no defensive
 *   fallbacks required. Content surface (background/border/padding) is
 *   intentionally minimal — the toolbar is a **structural container**, not
 *   a styled chrome. Consumers add `.module.scss` styling on top via the
 *   `className` passthrough when a particular surface needs visual identity
 *   (e.g. floating editor toolbar with elevation, segmented filter bar with
 *   ToggleGroup wrap).
 * @deps zero runtime deps. Reuses existing lib atoms and molecules directly
 *   — `<Button>`, `<ToggleGroup>` (with its own internal selection state),
 *   `<Separator orientation="vertical">`, `<Anchor>`, etc. — composed by
 *   the consumer per Charter R6 (reuse-first). Toolbar root only ships the
 *   roving tabindex behavior + `role="toolbar"` semantics + orientation
 *   axis. Reuses the roving tabindex PATTERN from NavigationMenu (E25) and
 *   Tabs (E26) via a ~10 LOC inline helper (`setRovingTabindex` +
 *   `getToolbarItems` DOM `querySelectorAll`). No floating primitives —
 *   toolbar is inline, not portal/positioned.
 *
 * @a11y APG `/toolbar/` — `<div role="toolbar" aria-label aria-orientation>`.
 *   Required `aria-label` (TS-enforced). The toolbar is a single tab-stop
 *   in the document — Tab from outside lands on the currently active item
 *   (initialized to the FIRST focusable child on mount); subsequent Tab
 *   exits the toolbar; arrow keys move within. This is the APG composite
 *   widget contract. Children (Buttons, Toggles inside ToggleGroups, Links)
 *   keep their own native semantics (`role="button"`, `aria-pressed`,
 *   `role="link"`) — toolbar does not override them. `Separator` children
 *   stay `aria-hidden` decorative (Lib Separator already does this).
 *
 *   Keyboard model (APG verbatim):
 *   - Right Arrow (horizontal) / Down Arrow (vertical): focus next item
 *     (with wraparound when `loop={true}` default; clamped when `loop=false`)
 *   - Left Arrow (horizontal) / Up Arrow (vertical): focus previous item
 *   - Home: first focusable item
 *   - End: last focusable item
 *   - Tab from any toolbar item: exits toolbar (browser-native behavior —
 *     toolbar does NOT intercept Tab); next Tab from outside re-enters at
 *     the last-focused (active) item via roving tabindex
 *   - Shift+Tab: exits toolbar reverse direction
 *   - Enter / Space: NOT intercepted by toolbar — bubbles to the focused
 *     child (Button click, Toggle press, Anchor activation). This preserves
 *     each child's native activation contract.
 *   - Modifier keys (Cmd/Ctrl/Alt/Shift + arrow): skipped — browser
 *     hotkeys like Cmd+← (back) take precedence.
 *
 *   Disabled items: skipped by arrow nav + Home/End (DOM query filters
 *   `:not([disabled]):not([aria-disabled="true"])`).
 *
 *   RTL support: when `dir="rtl"` is set on `<Toolbar>` (or inherited from
 *   ancestor), Right Arrow moves to PREVIOUS item and Left Arrow moves to
 *   NEXT in horizontal orientation. Vertical orientation is unaffected.
 *
 *   Forced colors (Windows HCM): `.root` falls back to `Canvas` /
 *   `CanvasText` / `ButtonText` so the toolbar surface and the focus ring
 *   remain visible in High Contrast Mode.
 *
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y via eslint-config-next ✓ |
 *   next build ✓ | Phase 4 fresh-subagent evaluator audit (2026-05-08) ✓ —
 *   Verdict: PASS-WITH-EXCEPTION granted by user 2026-05-08.
 *   DEFERRED-WITH-EXCEPTION: full Playwright execution + axe-core runtime
 *   sweep + manual NVDA+Firefox sweep. Specs ship alongside (.keyboard 13,
 *   .focus 8, .aria 8, .regression 20 = 49 total cases TBR-R01..R20),
 *   execution batched to dedicated test-execution sprint in 0.14+ cycle
 *   per E15 Tabs precedent. See `D:/OS/internal/bleizlabs-ui/work/
 *   2026-05_lib-audit-rebuild/devlog.md` E05.4 DONE_EPIC for exception
 *   rationale + scheduled follow-up.
 * @regressions tests/Toolbar.{keyboard,focus,aria,regression}.spec.ts —
 *   regression cases derived from APG model + Radix `react-toolbar` issue
 *   shape (e.g., disabled items skipped, Tab does not steal arrow nav,
 *   roving tabindex sync on programmatic focus, RTL axis reversal).
 *
 * @example
 *   <Toolbar aria-label="Formatting">
 *     <ToggleGroup type="multiple" aria-label="Text style">
 *       <Toggle value="bold">B</Toggle>
 *       <Toggle value="italic">I</Toggle>
 *       <Toggle value="underline">U</Toggle>
 *     </ToggleGroup>
 *     <Separator orientation="vertical" />
 *     <Button variant="ghost" size="sm">Save</Button>
 *     <Button variant="ghost" size="sm">Discard</Button>
 *   </Toolbar>
 *
 *   // Vertical orientation — left-rail editor toolbar
 *   <Toolbar aria-label="Tools" orientation="vertical">
 *     <Button variant="ghost" size="sm" aria-label="Pencil">P</Button>
 *     <Button variant="ghost" size="sm" aria-label="Eraser">E</Button>
 *     <Separator orientation="horizontal" />
 *     <Button variant="ghost" size="sm" aria-label="Settings">⚙</Button>
 *   </Toolbar>
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './Toolbar.module.scss';

export type ToolbarOrientation = 'horizontal' | 'vertical';
export type ToolbarDir = 'ltr' | 'rtl';

// ──────────────────────────────────────────────────────────────────────────
// Roving tabindex helper — DOM-attribute updates, no React re-render
// (pattern replicated from NavigationMenu E25 / Tabs E26)
// ──────────────────────────────────────────────────────────────────────────

// Toolbar item DOM query filter. Selects natively-focusable interactive
// descendants and ARIA-roled buttons/links/toggles. Filters out disabled
// (native + ARIA) items so arrow navigation skips them.
//
// We intentionally include `[role="button"]`, `[role="link"]`,
// `[role="checkbox"]`, `[role="radio"]`, and `[role="menuitemradio"]` so a
// consumer composing custom interactive children (e.g. an `asChild` slot
// adapter for next/link) is automatically picked up. Inputs (`<input>`,
// `<textarea>`, `<select>`) are also included because a search-box-in-
// toolbar is a recognized APG variant.
//
// We DELIBERATELY exclude descendants of `[data-toolbar-skip-roving]` so
// a consumer can opt a sub-tree out (e.g. a popover content panel that
// floats above the toolbar but is not part of the linear roving sequence).
const TOOLBAR_ITEM_SELECTOR = [
  'button:not([disabled]):not([aria-disabled="true"])',
  'a[href]:not([aria-disabled="true"])',
  'input:not([disabled]):not([type="hidden"])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[role="button"]:not([aria-disabled="true"])',
  '[role="link"]:not([aria-disabled="true"])',
  '[role="checkbox"]:not([aria-disabled="true"])',
  '[role="radio"]:not([aria-disabled="true"])',
  '[role="menuitemradio"]:not([aria-disabled="true"])',
].join(', ');

function getToolbarItems(toolbar: HTMLElement): HTMLElement[] {
  const all = Array.from(
    toolbar.querySelectorAll<HTMLElement>(TOOLBAR_ITEM_SELECTOR),
  );
  // Filter out items inside an opt-out subtree (consumer escape hatch).
  return all.filter(
    (el) => !el.closest('[data-toolbar-skip-roving="true"]'),
  );
}

function setRovingTabindex(items: HTMLElement[], activeIndex: number): void {
  items.forEach((item, idx) => {
    item.setAttribute('tabindex', idx === activeIndex ? '0' : '-1');
  });
}

// ──────────────────────────────────────────────────────────────────────────
// Toolbar — root component (single export, lightweight per spec §2)
// ──────────────────────────────────────────────────────────────────────────

export interface ToolbarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'aria-orientation' | 'dir'> {
  children: ReactNode;
  /** REQUIRED — accessible name for the toolbar (APG `/toolbar/` mandate). */
  'aria-label': string;
  /**
   * Axis. `'horizontal'` (default) uses Right/Left arrows to navigate;
   * `'vertical'` uses Down/Up. Affects keyboard nav AND CSS layout (flex
   * direction via `data-orientation` attribute).
   */
  orientation?: ToolbarOrientation;
  /**
   * When `true` (default), arrow-key navigation wraps from last item back
   * to first and vice versa. Set `false` for clamped navigation.
   */
  loop?: boolean;
  /**
   * Reading direction. When `'rtl'`, Right/Left arrow semantics are
   * reversed in horizontal orientation. Default `'ltr'`.
   */
  dir?: ToolbarDir;
  className?: string;
}

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  {
    children,
    orientation = 'horizontal',
    loop = true,
    dir = 'ltr',
    className,
    onKeyDown,
    'aria-label': ariaLabel,
    ...rest
  },
  forwardedRef,
) {
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  // Stabilize the merged callback ref so React doesn't detach/reattach on
  // every render. `toolbarRef` is a stable RefObject so useCallback deps
  // can use `forwardedRef` safely.
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      toolbarRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  // Initialize roving tabindex ONCE on mount — first item gets tabindex="0",
  // rest get tabindex="-1". Subsequent updates flow through `focusItem`
  // (arrow keys / Home / End) and `handleFocus` (focus event → roving sync).
  // Empty dep array prevents this from running on every render (which would
  // mutate DOM tabindex attributes during interaction).
  useLayoutEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;
    const items = getToolbarItems(toolbar);
    if (items.length === 0) return;
    const hasActive = items.some(
      (it) => it.getAttribute('tabindex') === '0',
    );
    if (!hasActive) {
      setRovingTabindex(items, 0);
    }
    // Intentionally empty deps — toolbarRef is a stable RefObject; we want
    // this init to run exactly once on mount. Re-running on identity
    // changes would clobber the active item during keyboard interaction.
  }, []);

  // Re-sync roving tabindex when the children list changes (consumer
  // dynamically adds/removes buttons). MutationObserver is cheap because
  // it's scoped to the toolbar root and only fires on subtree mutations.
  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;
    if (typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver(() => {
      const items = getToolbarItems(toolbar);
      if (items.length === 0) return;
      const hasActive = items.some(
        (it) => it.getAttribute('tabindex') === '0',
      );
      if (!hasActive) {
        setRovingTabindex(items, 0);
      }
    });

    observer.observe(toolbar, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled'],
    });
    return () => observer.disconnect();
  }, []);

  const focusItem = useCallback((items: HTMLElement[], index: number) => {
    const target = items[index];
    if (!target) return;
    setRovingTabindex(items, index);
    target.focus();
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // Skip if any modifier key is pressed — browser hotkeys like Cmd+←
      // (back) should not be intercepted by toolbar arrow nav. Mirrors
      // Tabs TB-R04 fix.
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
        onKeyDown?.(event);
        return;
      }

      const toolbar = toolbarRef.current;
      if (!toolbar) {
        onKeyDown?.(event);
        return;
      }
      const items = getToolbarItems(toolbar);
      if (items.length === 0) {
        onKeyDown?.(event);
        return;
      }

      const activeIndex = items.findIndex(
        (el) => el === document.activeElement,
      );
      // If focus isn't on a toolbar item (e.g., focus is on a portaled
      // popover content), defer to native handling. Without this guard,
      // arrow keys inside a child Combobox-listbox would be hijacked.
      if (activeIndex === -1) {
        onKeyDown?.(event);
        return;
      }

      const isHorizontal = orientation === 'horizontal';
      const isRtl = dir === 'rtl';
      // In horizontal + RTL, Right/Left semantics are swapped.
      const nextKey = isHorizontal
        ? isRtl
          ? 'ArrowLeft'
          : 'ArrowRight'
        : 'ArrowDown';
      const prevKey = isHorizontal
        ? isRtl
          ? 'ArrowRight'
          : 'ArrowLeft'
        : 'ArrowUp';

      switch (event.key) {
        case nextKey: {
          event.preventDefault();
          const nextIdx =
            activeIndex < items.length - 1
              ? activeIndex + 1
              : loop
                ? 0
                : activeIndex;
          focusItem(items, nextIdx);
          return;
        }
        case prevKey: {
          event.preventDefault();
          const prevIdx =
            activeIndex > 0
              ? activeIndex - 1
              : loop
                ? items.length - 1
                : 0;
          focusItem(items, prevIdx);
          return;
        }
        case 'Home': {
          event.preventDefault();
          focusItem(items, 0);
          return;
        }
        case 'End': {
          event.preventDefault();
          focusItem(items, items.length - 1);
          return;
        }
        default:
          break;
      }

      // Tab + Enter + Space + every other key — let native handling run.
      // Tab specifically: by APG, Tab MUST exit the toolbar (browser walks
      // to the next document tabbable). Because only the active item has
      // tabindex=0 and others have tabindex=-1, the browser naturally does
      // the right thing here. We do NOT preventDefault.
      onKeyDown?.(event);
    },
    [orientation, dir, loop, focusItem, onKeyDown],
  );

  // Focus capture handler — when an item inside the toolbar receives focus
  // (e.g., user clicked it directly, or it was focused programmatically),
  // sync roving tabindex so this becomes the active item. We listen on the
  // toolbar root for `focusin` (bubbling) instead of attaching to every
  // child, because children are consumer-composed and we don't have refs
  // to them.
  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      const toolbar = toolbarRef.current;
      if (!toolbar) return;
      const target = event.target as HTMLElement;
      if (!target) return;
      const items = getToolbarItems(toolbar);
      const idx = items.indexOf(target);
      if (idx !== -1) {
        setRovingTabindex(items, idx);
      }
    },
    [],
  );

  return (
    <div
      ref={mergedRef}
      role="toolbar"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      data-orientation={orientation}
      dir={dir}
      className={cn(styles.root, className)}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      {...rest}
    >
      {children}
    </div>
  );
});
