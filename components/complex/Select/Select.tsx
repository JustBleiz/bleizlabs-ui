'use client';

/**
 * Select — single-value dropdown form field per WAI-ARIA APG /combobox/
 * (collapsed listbox, select-only variant) + /listbox/.
 *
 * @layer complex-interactive (Phase 10 CI12)
 * @tokens --input-bg, --input-border, --input-border-focus, --color-text-primary,
 *   --color-text-muted, --color-surface-raised, --color-surface-hover,
 *   --color-border-subtle, --shadow-lg, --radius-input, --radius-md, --radius-sm,
 *   --z-popover, --duration-fast, --easing-default, --focus-ring, --focus-ring-error,
 *   --color-error, --space-1..6, --font-size-sm, --font-size-xs, --font-size-base,
 *   --font-secondary, --font-weight-semibold, --line-height-normal
 * @deps zero runtime deps. Positioning via `utils/position.ts` + `utils/useFloating.ts`
 *   (E19/E20 primitive). Portal + dismiss + context via shared `utils/floating/`
 *   composable primitives (E23 refactor): `createFloatingContext` +
 *   `useFloatingState` (open/close) + `useFloatingDismiss` + `FloatingPortal`.
 *   **Skipped** `useFloatingFocus` — Select uses the APG combobox-select-only
 *   pattern where focus STAYS on the trigger the entire time (virtual
 *   "activedescendant" highlight inside the listbox), so there is no focus
 *   target inside the content to move to. Value state uses the shared
 *   `useFloatingValueState` hook (extracted in E29 — the original E27
 *   inlining note is historical); typeahead remains inlined (Select-specific
 *   pendingSeed/buffer semantics). Own Slot primitive for `asChild`
 *   polymorphism on Trigger + Item.
 * @a11y APG /combobox/ collapsed-listbox (select-only) + /listbox/:
 *   Trigger: `role="combobox"` + `aria-haspopup="listbox"` + `aria-expanded` +
 *   `aria-controls` (when open) + `aria-labelledby` (when form label wired via
 *   consumer) + `aria-required` + `aria-invalid` + `aria-activedescendant`
 *   (points at highlighted option id while open — this is why focus stays on
 *   the trigger, the virtual highlight is exposed to AT via the trigger itself).
 *   Native `disabled` is INTENTIONALLY NOT USED — Select uses `aria-disabled`
 *   per APG precedent from NavigationMenu (E25) + Tabs (E26), keeping the
 *   trigger focusable even when disabled so AT users can discover it. Keyboard
 *   disabled-state no-ops on open/toggle via inline guard. Listbox:
 *   `role="listbox"` + `aria-labelledby={triggerId}` + `aria-multiselectable={false}`
 *   (explicit per Phase 5 IMP-2 — some AT engines don't infer the default).
 *   Items: `role="option"` + `aria-selected` + `aria-disabled` when disabled.
 *   Groups: `role="group" aria-labelledby` pointing at a nested SelectLabel id.
 *   Label: plain `<div>` with id (no role) — the group's `aria-labelledby`
 *   resolves the accessible name via the label's text content without
 *   announcing the label itself as a separate listbox item. Separator:
 *   `role="none"` — WAI-ARIA restricts listbox children to `option`/`group`,
 *   so a real `role="separator"` would fail axe-core; the visual divider
 *   is preserved but AT traversal skips it.
 *
 *   Keyboard model (APG combobox-select-only verbatim):
 *   Closed (focus on trigger):
 *   - ArrowDown/Enter/Space: open listbox, highlight current value (or first
 *     enabled option)
 *   - ArrowUp: open listbox, highlight current value (or LAST enabled option
 *     when nothing is selected)
 *   - Home/End: open listbox, highlight first / last enabled option
 *     (unconditional — pendingSeed consumed by the mount effect)
 *   - Printable char: open listbox + typeahead match applied on open
 *     (500ms reset buffer; items register only after the open render)
 *   - Tab/Shift+Tab: no-op (browser moves focus normally)
 *   - Escape: no-op
 *   Open (focus STAYS on trigger; aria-activedescendant tracks highlighted option):
 *   - ArrowDown/ArrowUp: next/prev enabled option, wraparound, scrollIntoView
 *   - Home/End: first/last enabled option
 *   - PageDown/PageUp: +/-10 (clamped + disabled-skip)
 *   - Enter/Space: commit highlighted option, fire `onValueChange`, close
 *   - Tab/Shift+Tab: commit highlighted option, close, let Tab propagate
 *     (Radix convention — APG allows both close-without-select and commit-on-Tab)
 *   - Escape: close without committing
 *   - Alt+ArrowUp: close without committing (APG alternative)
 *   - Printable char: typeahead (500ms buffer, startsWith case-insensitive, enabled only)
 *   - Modifier-key arrow (Cmd/Ctrl/Alt/Shift): pass through to browser (no intercept)
 *
 *   Mouse: pointerdown on item highlights (hover syncs the keyboard highlight);
 *   click on item commits + closes; click on trigger toggles open.
 *
 *   Focus stays on the trigger at ALL times — the listbox itself is `tabIndex={-1}`
 *   (receives no focus) and does not use `useFloatingFocus`. This is the APG
 *   combobox-select-only pattern and matches Radix Select.
 *
 *   Event-path discipline (Phase 5 CRIT-1): open- and closed-state key
 *   events both flow through Trigger's single React `onKeyDown`. While
 *   open, Trigger reads `listboxKeyHandlerRef.current` (published by
 *   SelectContent in a layout effect) and routes the native event to it.
 *   There is NO secondary native `addEventListener('keydown', ...)` bridge
 *   — a dual path was stripping `defaultPrevented` tracking from consumer
 *   onKeyDown observers. The listbox handler's signature accepts a minimal
 *   structural type (`SelectKeyEvent`) so React synthetic events satisfy
 *   it via `event.nativeEvent`.
 *
 *   Typeahead buffer (Phase 5 CRIT-5) lives on the root `typeaheadRef`
 *   and is shared between Trigger (closed-state open + deferred match —
 *   the buffered char is consumed by SelectContent's mount effect) and
 *   SelectContent (open-state highlight). `lastIndex` tracks the last
 *   matched position so single-char repeats cycle through siblings
 *   (native `<select>` + Radix parity), and the 500 ms reset timer is a
 *   single owner on the root so switching between open/closed does not
 *   reset the buffer mid-word.
 *
 *   `aria-activedescendant` (Phase 5 IMP-3, hoisted in E142 L4 F1) is
 *   declarative React state owned by the ROOT context (`highlightedId` —
 *   SelectTrigger sits OUTSIDE SelectContent in the render tree, so a
 *   Content-scoped provider could never reach it). SelectTrigger reads
 *   `highlightedId` from the root context and reconciles it onto the DOM
 *   on every render so React cannot strip the attribute by re-rendering
 *   trigger with other ARIA props. SelectItem is wrapped in `React.memo`
 *   to shield items from consumer parent-prop churn ONLY — highlight
 *   moves change the root context identity and context updates bypass
 *   memo, so all mounted items re-render per move (see the memo JSDoc
 *   above SelectItem).
 *
 *   Form participation: when the `name` prop is provided, Select renders a
 *   hidden `<input type="hidden">` synced with the current value. `required` +
 *   `disabled` propagate to the hidden input so native form validation and
 *   FormData serialization work without consumer plumbing.
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y via eslint-config-next ✓ |
 *   Playwright suite EXECUTED in-repo (keyboard/focus/aria/regression
 *   `.spec.ts` quad, CI-gated) + axe-core smoke on the demo route.
 *   DEFERRED: manual NVDA sweep, iOS/Android device testing.
 * @regressions tests/Select.{keyboard,focus,aria,regression}.spec.md —
 *   regression cases SL-R01..R22 + SL-R23..R27 (E03 audit remediation:
 *   asChild rest-forwarding, closed-state printable-char open+deferred
 *   match, closed Home/End/ArrowUp seeding — SL-R27 executes the seeding
 *   half of the SL-R04 mapping).
 * @example
 *   <Select name="country" defaultValue="pl" onValueChange={(v) => ...}>
 *     <SelectTrigger aria-labelledby="country-label">
 *       <SelectValue placeholder="Choose a country" />
 *     </SelectTrigger>
 *     <SelectContent>
 *       <SelectGroup>
 *         <SelectLabel>Europe</SelectLabel>
 *         <SelectItem value="pl">Poland</SelectItem>
 *         <SelectItem value="de">Germany</SelectItem>
 *         <SelectItem value="fr" disabled>France (coming soon)</SelectItem>
 *       </SelectGroup>
 *       <SelectSeparator />
 *       <SelectGroup>
 *         <SelectLabel>Americas</SelectLabel>
 *         <SelectItem value="us">United States</SelectItem>
 *       </SelectGroup>
 *     </SelectContent>
 *   </Select>
 */

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MutableRefObject,
  type ReactNode,
  type RefObject,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { useFloating } from '../../utils/useFloating';
import { type Placement } from '../../utils/position';
import {
  createFloatingContext,
  useFloatingState,
  useFloatingValueState,
  useFloatingDismiss,
  useFloatingEscapeStack,
  FloatingPortal,
} from '../../utils/floating';
import styles from './Select.module.scss';

export type SelectPlacement = Placement;

/**
 * Minimal structural shape shared by React synthetic keyboard events and
 * native DOM KeyboardEvents. Used so the same listbox handler can be invoked
 * from either source (React onKeyDown on Trigger while open, OR — historically
 * — a native addEventListener bridge). After Phase 5 fix CRIT-1 the only
 * call site is Trigger's React onKeyDown (which passes the native event via
 * `event.nativeEvent`), but the structural typing keeps the handler portable
 * for future consumers.
 */
type SelectKeyEvent = Pick<
  KeyboardEvent,
  'key' | 'preventDefault' | 'stopPropagation' | 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'
>;

// ──────────────────────────────────────────────────────────────────────────
// Item registry — shared between Root + Content + Item
// ──────────────────────────────────────────────────────────────────────────

interface SelectItemRecord {
  /** DOM id for aria-activedescendant targeting. */
  id: string;
  /** DOM element — used for scrollIntoView and compareDocumentPosition ordering. */
  element: HTMLElement;
  /** Stable option value — the string written to form state + onValueChange. */
  value: string;
  /** Visible text content — used for SelectValue label lookup + typeahead. */
  textContent: string;
  /** Disabled state — skipped by keyboard nav + typeahead + click. */
  disabled: boolean;
}

// ──────────────────────────────────────────────────────────────────────────
// Root context (shared across Trigger / Value / Content / Item)
// ──────────────────────────────────────────────────────────────────────────

interface SelectTypeaheadState {
  /** Accumulated lowercased buffer — reset after 500 ms idle. */
  buffer: string;
  /** Pending reset timer handle — cleared on new keys / close / commit. */
  timer: ReturnType<typeof setTimeout> | null;
  /**
   * Last matched index within the ENABLED item subset. Used by both Trigger
   * (closed state) and Content (open state) to cycle through repeats when
   * the same single character is typed again (e.g. "p" → Poland → Portugal
   * → Peru → Poland…).
   */
  lastIndex: number;
  /**
   * Closed-state seed intent carried across the open transition (E03 audit
   * fix). Set by closed Home (`'first'`), End (`'last'`) and ArrowUp with
   * no current value (`'last'`); consumed + cleared by SelectContent's
   * mount layout effect — items only register AFTER the open render, so
   * the trigger cannot highlight directly. Pending typeahead buffer takes
   * precedence over the seed. Accepted residual: a seed surviving a VETOED
   * controlled open is consumed by the next open regardless of source
   * (trigger interactions clear/overwrite it; a purely programmatic open
   * after a veto inherits it — transient highlight only, no state impact).
   */
  pendingSeed: 'first' | 'last' | null;
}

interface SelectContextValue {
  /** Open state of the listbox. */
  open: boolean;
  setOpen: (next: boolean) => void;
  /** Currently selected value (null when empty). Read-only — use selectValue() to mutate. */
  value: string | null;
  /**
   * Live ref mirror of `value` — used inside callbacks that should not
   * re-memoize on every value change (e.g. `selectValue`, `commitHighlighted`).
   * Readers should always `valueRef.current`, never the memoized `value`.
   * Sourced from `useFloatingValueState<string>` hook (E29).
   */
  valueRef: MutableRefObject<string | null>;
  /** Commit a new value — fires onValueChange when the value differs. */
  selectValue: (next: string) => void;
  /** ID pair for ARIA wiring. */
  triggerId: string;
  contentId: string;
  /** Trigger DOM ref — used by floating positioning + focus-return on commit/close. */
  triggerRef: RefObject<HTMLElement | null>;
  /** Root-level disabled state — blocks trigger interaction + form submission. */
  disabled: boolean;
  /** Required — wired onto hidden input + aria-required on trigger. */
  required: boolean;
  /** Form participation name — presence toggles hidden input render. */
  name: string | undefined;
  /** Item registry — populated by SelectItem useLayoutEffect. */
  registerItem: (key: string, record: SelectItemRecord) => void;
  unregisterItem: (key: string) => void;
  /**
   * Monotonic counter bumped on every register/unregister. SelectValue reads
   * this from context so it re-renders once items have registered (which
   * normally happens in a child layout effect AFTER SelectValue's first
   * render — without this bump, the first paint would show the raw value
   * string instead of the display label). Fixes CRIT-3.
   */
  registryVersion: number;
  /** Returns the full registry as a DOM-ordered array. */
  getOrderedItems: () => SelectItemRecord[];
  /**
   * Returns the record for a given option value, or undefined. Used by
   * SelectValue to look up the display label without walking the registry.
   */
  getItemByValue: (value: string | null) => SelectItemRecord | undefined;
  /**
   * Returns the display label for a given value. Falls back to the label
   * cache (E136 bug 3) — SelectContent unmounts SelectItems while closed,
   * so after a user picks an option the live registry is empty and the
   * raw value string would leak into SelectValue without this cache.
   */
  getLabelByValue: (value: string | null) => string | undefined;
  /**
   * Shared typeahead buffer for Trigger (closed state) + Content (open
   * state). Single source of truth so switching between closed → open mid
   * word preserves the buffer, and repeat keys cycle via `lastIndex`.
   */
  typeaheadRef: MutableRefObject<SelectTypeaheadState>;
  /**
   * Slot for Content to publish its listbox keydown handler so Trigger's
   * React onKeyDown can route open-state events to it. This replaces the
   * native `addEventListener('keydown', ...)` bridge used in Phase 3 — a
   * dual-path handler was interfering with consumer's own onKeyDown and
   * prevented `event.defaultPrevented` tracking. Content writes/clears this
   * in a useLayoutEffect. Fixes CRIT-1.
   */
  listboxKeyHandlerRef: MutableRefObject<((event: SelectKeyEvent) => void) | null>;
  /**
   * Highlighted option id — root-owned React state so both SelectTrigger
   * (which sits OUTSIDE SelectContent in the render tree) and SelectContent
   * can subscribe to it. Prior to E142 L4 this state lived on a
   * Content-scoped provider rendered as a child of FloatingPortal — but the
   * Trigger is a sibling, so sibling→sibling context propagation never
   * happened and `aria-activedescendant` was silently undefined (WCAG SC
   * 4.1.3 fail). Hoisted to the root context so both consumers can read it.
   */
  highlightedId: string | null;
  /** Request a highlight change. `source` selects scroll behavior. */
  setHighlight: (id: string | null, source: 'mouse' | 'keyboard') => void;
  /** Positioning — consumed by SelectContent's useFloating call. */
  placement: SelectPlacement;
  sideOffset: number;
  collisionPadding: number;
}

const [SelectContextProvider, useSelectContext] =
  createFloatingContext<SelectContextValue>('Select');

// ──────────────────────────────────────────────────────────────────────────
// Select root — state holder, item registry, context provider
// ──────────────────────────────────────────────────────────────────────────

export interface SelectProps {
  /** SelectTrigger + SelectContent compound children. */
  children: ReactNode;
  /** Controlled value. Pass `null` (or empty) for "no selection". When provided, component is controlled. */
  value?: string | null;
  /** Uncontrolled initial value. Ignored when `value` is provided. Default `null`. */
  defaultValue?: string | null;
  /**
   * Fires every time the committed value changes. The argument is a `string`
   * (never `null`); when the Select has no value (initial or cleared), no
   * callback fires. Consumers who need to observe the null→value transition
   * should use the controlled `value` prop instead.
   */
  onValueChange?: (value: string) => void;
  /** Controlled open state of the listbox. When provided, component is controlled. */
  open?: boolean;
  /** Uncontrolled initial open state. Default `false`. */
  defaultOpen?: boolean;
  /** Fires on every open transition. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Form field name. When provided, Select renders a hidden `<input>` synced
   * with `value` so native form submission + FormData serialization work.
   * `required` and `disabled` propagate to the hidden input.
   */
  name?: string;
  /** Root-level disabled — blocks trigger interaction + form submission. */
  disabled?: boolean;
  /** Required — wires `aria-required` on trigger + `required` on hidden input. */
  required?: boolean;
  /**
   * Preferred placement of the listbox. Default `'bottom-start'` — Select
   * convention aligns the listbox left edge to the trigger's left edge.
   * Positioning flips + shifts automatically on viewport collision.
   */
  placement?: SelectPlacement;
  /** Gap in pixels between trigger and listbox. Default `4` (tight — Select convention). */
  sideOffset?: number;
  /** Inner padding from viewport edges for flip + shift. Default `8`. */
  collisionPadding?: number;
}

export function Select({
  children,
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  name,
  disabled = false,
  required = false,
  placement = 'bottom-start',
  sideOffset = 4,
  collisionPadding = 8,
}: SelectProps) {
  const reactId = useId();
  const triggerId = `${reactId}-trigger`;
  const contentId = `${reactId}-listbox`;

  const triggerRef = useRef<HTMLElement | null>(null);

  // Controlled/uncontrolled open via shared primitive.
  const { open, setOpen } = useFloatingState({
    controlledOpen,
    defaultOpen,
    onOpenChange,
  });

  // Controlled/uncontrolled value via useFloatingValueState<string> (E29).
  // The hook owns the latest-value ref + identity-guarded setter so
  // SelectItems' useLayoutEffect registrations don't churn across selections.
  // Null transitions do NOT fire onValueChange — matches Radix semantics;
  // consumers who need the null transition should use controlled mode.
  // Filter null at boundary: Select's public onValueChange is (string) => void
  // (consumers who need null-transitions use controlled `value` prop). Hook
  // fires (string | null) — null would happen on Escape-with-value-cleared but
  // Select's Escape path reverts without firing; drop null defensively. Wrapper
  // memoized via useCallback per Combobox E28 precedent so hook's selectValue
  // identity stays stable across unrelated parent re-renders (not just
  // value-change renders) — matches the latestValueRef stability goal E29 was
  // extracted to enforce.
  const handleValueChange = useCallback(
    (next: string | null) => {
      if (next !== null) onValueChange?.(next);
    },
    [onValueChange],
  );
  const {
    value,
    setValue: selectValue,
    valueRef,
  } = useFloatingValueState<string>({
    controlledValue,
    defaultValue,
    onValueChange: handleValueChange,
  });

  // Item registry — stored in a ref so register/unregister mutations do NOT
  // trigger re-renders of every context consumer (Radix + React 19
  // precedent — registries churn on every item mount and should stay out of
  // the render cycle). Consumers read via the memoized `getOrderedItems` /
  // `getItemByValue` callbacks. A companion `registryVersion` state bumps
  // on every (un)register so SelectValue — which needs to re-read the
  // registry for the display label — can subscribe to a value that changes.
  const itemsRef = useRef<Map<string, SelectItemRecord>>(new Map());
  // Label cache — survives SelectContent unmount so SelectValue keeps
  // reading the display label ("France") after the user picks an option
  // and the listbox closes, dropping live item registrations. Keyed by
  // value, holds textContent. E136 bug 3. Writes happen on register, never
  // on unregister — unmount must NOT evict the cached label, otherwise the
  // close animation finishes showing the raw code string again.
  const labelCacheRef = useRef<Map<string, string>>(new Map());
  const [registryVersion, setRegistryVersion] = useState(0);

  const registerItem = useCallback((key: string, record: SelectItemRecord) => {
    itemsRef.current.set(key, record);
    labelCacheRef.current.set(record.value, record.textContent);
    setRegistryVersion((v) => v + 1);
  }, []);

  const unregisterItem = useCallback((key: string) => {
    itemsRef.current.delete(key);
    setRegistryVersion((v) => v + 1);
  }, []);

  const getOrderedItems = useCallback((): SelectItemRecord[] => {
    const items = Array.from(itemsRef.current.values());
    // Sort by DOM position — the registry Map iterates in insertion order,
    // but conditional rendering + React fragments can interleave inserts
    // out of document order. compareDocumentPosition guarantees stable
    // reading-order traversal regardless of mount sequence.
    items.sort((a, b) => {
      const pos = a.element.compareDocumentPosition(b.element);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
    return items;
  }, []);

  const getItemByValue = useCallback((target: string | null): SelectItemRecord | undefined => {
    if (target === null) return undefined;
    for (const record of itemsRef.current.values()) {
      if (record.value === target) return record;
    }
    return undefined;
  }, []);

  const getLabelByValue = useCallback((target: string | null): string | undefined => {
    if (target === null) return undefined;
    // Prefer the live registry — picks up any in-flight children change.
    for (const record of itemsRef.current.values()) {
      if (record.value === target) return record.textContent;
    }
    // Fallback to cache — items unmount with SelectContent when closed.
    return labelCacheRef.current.get(target);
  }, []);

  // Shared typeahead state — single source of truth used by both Trigger
  // (closed-state open + deferred match) and Content (open-state highlight).
  // Keeping it at the root lets the two code paths cycle the same buffer
  // across an open/close transition mid-word (Radix parity).
  const typeaheadRef = useRef<SelectTypeaheadState>({
    buffer: '',
    timer: null,
    lastIndex: -1,
    pendingSeed: null,
  });

  // Slot that Content publishes on mount — Trigger's React onKeyDown reads
  // this to route open-state keys to the listbox handler. Replaces the
  // previous native addEventListener bridge (CRIT-1).
  const listboxKeyHandlerRef = useRef<((event: SelectKeyEvent) => void) | null>(null);

  // Highlighted option id — root-owned state. Hoisted from the former
  // SelectContentContext (which sat inside FloatingPortal → sibling of
  // Trigger → unreachable via React context) so SelectTrigger's
  // `aria-activedescendant` reconciles correctly (E142 L4 F1).
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const setHighlight = useCallback(
    (nextId: string | null, source: 'mouse' | 'keyboard') => {
      setHighlightedId((prev) => {
        if (prev === nextId) return prev;
        if (nextId && source === 'keyboard') {
          // Defer scroll to after React commits the new highlighted state
          // so the element's data-highlighted attribute is already set.
          const items = getOrderedItems();
          const record = items.find((it) => it.id === nextId);
          record?.element.scrollIntoView({ block: 'nearest' });
        }
        return nextId;
      });
    },
    [getOrderedItems],
  );

  const contextValue = useMemo<SelectContextValue>(
    () => ({
      open,
      setOpen,
      value,
      valueRef,
      selectValue,
      triggerId,
      contentId,
      triggerRef,
      disabled,
      required,
      name,
      registerItem,
      unregisterItem,
      registryVersion,
      getOrderedItems,
      getItemByValue,
      getLabelByValue,
      typeaheadRef,
      listboxKeyHandlerRef,
      highlightedId,
      setHighlight,
      placement,
      sideOffset,
      collisionPadding,
    }),
    [
      open,
      setOpen,
      value,
      valueRef,
      selectValue,
      triggerId,
      contentId,
      disabled,
      required,
      name,
      registerItem,
      unregisterItem,
      registryVersion,
      getOrderedItems,
      getItemByValue,
      getLabelByValue,
      highlightedId,
      setHighlight,
      placement,
      sideOffset,
      collisionPadding,
    ],
  );

  return (
    <SelectContextProvider value={contextValue}>
      {children}
      {name !== undefined && (
        <input
          type="hidden"
          name={name}
          value={value ?? ''}
          disabled={disabled || undefined}
          required={required || undefined}
        />
      )}
    </SelectContextProvider>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Typeahead helper — inline per E27 Phase 2 override
// ──────────────────────────────────────────────────────────────────────────
//
// Mirrors DropdownMenu (E21) typeahead: 500ms reset buffer, case-insensitive
// startsWith, disabled-skip. Adapted for listbox+activedescendant: returns
// the matched record AND its index within the enabled subset so callers can
// persist `lastIndex` for single-char repeat cycling (Radix #30). Shared
// between Trigger (closed state) and Content (open state) via the root
// `typeaheadRef` so the buffer survives open/close transitions mid-word.
// Deliberately NOT extracted to a shared hook — E28 Combobox shipped
// filter-based search instead, and Select's closed-state pendingSeed/buffer
// semantics are component-specific (see the file header's "typeahead remains
// inlined" note).

interface TypeaheadMatch {
  record: SelectItemRecord;
  /** Index of the match within the enabled subset passed to the matcher. */
  index: number;
}

function findTypeaheadMatch(
  items: SelectItemRecord[],
  buffer: string,
  fromIndex: number,
): TypeaheadMatch | undefined {
  if (items.length === 0) return undefined;
  const search = buffer.toLowerCase();
  // Rotate start index so repeated matching of the same char cycles through
  // siblings (Radix #30 — typing 'f' twice on a list of [Fig, File, Folder]
  // should land on File, then Folder, then back to Fig).
  const len = items.length;
  const start = ((fromIndex % len) + len) % len;
  for (let i = 0; i < len; i += 1) {
    const idx = (start + i) % len;
    const candidate = items[idx];
    if (
      candidate &&
      !candidate.disabled &&
      candidate.textContent.toLowerCase().startsWith(search)
    ) {
      return { record: candidate, index: idx };
    }
  }
  return undefined;
}

// ──────────────────────────────────────────────────────────────────────────
// SelectTrigger — role=combobox button, closed-state keyboard handler
// ──────────────────────────────────────────────────────────────────────────

export interface SelectTriggerProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'aria-expanded'
  | 'aria-haspopup'
  | 'aria-controls'
  | 'aria-activedescendant'
  | 'role'
  | 'disabled'
  | 'id'
> {
  /** Trigger content — typically a SelectValue, or the single element to Slot-wrap when `asChild`. */
  children: ReactNode;
  /**
   * When `true`, Slot-wraps the single React element child, merging ARIA +
   * click/keydown. When `false` (default), renders a native `<button>`.
   */
  asChild?: boolean;
  /** Extra class merged onto the trigger element. */
  className?: string;
  /**
   * Optional explicit `aria-labelledby` — wires an external label element
   * to the combobox role. When omitted, consumer is expected to provide
   * the dedicated `aria-label` prop (explicitly destructured, not rest)
   * or rely on a parent `<label>` association.
   */
  'aria-labelledby'?: string;
  /** Optional `aria-label` override — takes precedence when no labelledby. */
  'aria-label'?: string;
  /**
   * External validation error state — flips `aria-invalid` on the trigger
   * and triggers the error-state visual border. Default `false`.
   */
  invalid?: boolean;
}

export const SelectTrigger = forwardRef<HTMLElement, SelectTriggerProps>(function SelectTrigger(
  {
    children,
    asChild = false,
    onClick,
    onKeyDown,
    className,
    invalid = false,
    'aria-labelledby': ariaLabelledBy,
    'aria-label': ariaLabel,
    ...rest
  },
  forwardedRef,
) {
  const ctx = useSelectContext('<SelectTrigger>');
  const {
    open,
    setOpen,
    value,
    valueRef,
    triggerId,
    contentId,
    triggerRef,
    disabled,
    required,
    typeaheadRef,
    listboxKeyHandlerRef,
    highlightedId,
  } = ctx;

  const setTriggerNode = useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node;
    },
    [triggerRef],
  );
  // Memoized — a fresh callback ref every render makes React detach (null)
  // and re-attach the ref on each trigger re-render (E03 audit fix; pattern:
  // TabsList/Sidebar).
  const mergedRef = useMemo(
    () => mergeRefs(forwardedRef, setTriggerNode),
    [forwardedRef, setTriggerNode],
  );

  // Require aria-label OR aria-labelledby — without one, the combobox
  // computes its accessible name from contents, i.e. the SELECTED VALUE:
  // the field's name silently mutates as the user picks options (WCAG
  // 4.1.2). Dev-only runtime warning — mirrors TabsList + Slider.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      if (!ariaLabel && !ariaLabelledBy) {
        console.warn(
          '<SelectTrigger> should have `aria-label` or `aria-labelledby` — without one the accessible name becomes the selected value (WCAG 4.1.2).',
        );
      }
    }
  }, [ariaLabel, ariaLabelledBy]);

  // Initial-highlight plumbing: closed-state open-with-highlight just
  // sets `open = true` and SelectContent's mount-time useLayoutEffect
  // seeds the highlight from the current `value`, a pending typeahead
  // buffer, or a pending Home/End/ArrowUp seed (falling back to the
  // first enabled item). No extra cross-component refs needed.

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      // Pointer opens carry no keyboard seed intent — clear any stale seed
      // left by a vetoed controlled open (the buffer has a 500ms TTL, the
      // seed does not; E03 audit fix).
      typeaheadRef.current.pendingSeed = null;
      setOpen(!open);
    },
    [disabled, open, setOpen, typeaheadRef],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (disabled) return;

      // OPEN STATE — route to Content's listbox handler via the shared
      // ref slot. Single-path handler (Phase 5 CRIT-1): the old native
      // addEventListener bridge was removed so there is exactly one
      // event path and consumer `onKeyDown` observes `defaultPrevented`
      // correctly.
      if (open) {
        const listboxHandler = listboxKeyHandlerRef.current;
        if (listboxHandler) {
          listboxHandler(event.nativeEvent);
          // React's synthetic event tracks defaultPrevented from the
          // underlying native event — if the listbox handler called
          // preventDefault, React already sees it.
        }
        return;
      }

      // Pass through modifier-keyed arrows (APG allows browser-level
      // shortcuts like Cmd+ArrowDown to navigate history or jump focus).
      const hasModifier = event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;

      // Open-intent keys (ArrowDown/Up/Enter/Space/Home/End) must always
      // open the listbox regardless of whether items have registered yet
      // — SelectItems only mount inside SelectContent (open-gated), so
      // on the very first keydown the registry is empty (E142 L4 F2).
      // APG /combobox/ collapsed-listbox requires these keys to open.
      // Nothing in this closed-state path reads the registry — all
      // highlight intent (pendingSeed / typeahead buffer) is carried on
      // the shared typeaheadRef and consumed by SelectContent's mount
      // effect once items have registered (E03 audit fix).
      switch (event.key) {
        case 'ArrowDown': {
          if (hasModifier) return; // pass-through
          event.preventDefault();
          typeaheadRef.current.pendingSeed = null;
          setOpen(true);
          return;
        }
        case 'ArrowUp': {
          if (hasModifier) return; // pass-through
          event.preventDefault();
          // APG/JSDoc contract: with no current value ArrowUp seeds the
          // LAST enabled option; with a value the current option wins.
          typeaheadRef.current.pendingSeed = valueRef.current == null ? 'last' : null;
          setOpen(true);
          return;
        }
        case 'Enter':
        case ' ': {
          if (hasModifier) return;
          event.preventDefault();
          typeaheadRef.current.pendingSeed = null;
          setOpen(true);
          return;
        }
        case 'Home':
        case 'End': {
          if (hasModifier) return;
          event.preventDefault();
          // Unconditional first/last seed per the JSDoc keyboard model —
          // consumed by SelectContent's mount effect (items register only
          // after the open render; E03 audit fix).
          typeaheadRef.current.pendingSeed = event.key === 'Home' ? 'first' : 'last';
          setOpen(true);
          return;
        }
        default:
          break;
      }

      // Printable char (CLOSED) — APG /combobox-select-only/: "first opens
      // the listbox ... then moves visual focus to the first option that
      // matches the typed character(s)". Items only mount inside
      // SelectContent (open-gated) so the registry is EMPTY here — matching
      // is deferred: buffer the char on the shared typeaheadRef, open, and
      // SelectContent's mount layout effect (which runs AFTER child items
      // register in the same commit) consumes the pending buffer. The old
      // closed-state "instant-select" path was dead code — it read the
      // always-empty registry and returned (E03 audit fix).
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const tState = typeaheadRef.current;
        tState.buffer += event.key.toLowerCase();
        if (tState.timer) clearTimeout(tState.timer);
        tState.timer = setTimeout(() => {
          tState.buffer = '';
          tState.timer = null;
          tState.lastIndex = -1;
        }, 500);
        tState.pendingSeed = null;
        setOpen(true);
      }
    },
    [disabled, open, setOpen, valueRef, typeaheadRef, listboxKeyHandlerRef],
  );

  const ariaProps = {
    id: triggerId,
    role: 'combobox' as const,
    'aria-haspopup': 'listbox' as const,
    'aria-expanded': open,
    'aria-controls': open ? contentId : undefined,
    'aria-labelledby': ariaLabelledBy,
    'aria-label': ariaLabel,
    'aria-required': required || undefined,
    'aria-disabled': disabled || undefined,
    'aria-invalid': invalid || undefined,
    // `aria-activedescendant` is declarative React state (Phase 5 IMP-3,
    // hoisted to the ROOT context in E142 L4 F1 — Trigger is a sibling of
    // SelectContent, so a Content-scoped provider could never reach it).
    // Trigger reads `highlightedId` from the root context and React
    // reconciles it onto the DOM on every render. This fixes the prior
    // bug where a re-render of Trigger (e.g. from controlled `value`
    // change) would write the full ariaProps back to DOM and silently
    // strip the attribute written by an earlier DOM mutation.
    'aria-activedescendant': open && highlightedId ? highlightedId : undefined,
    'data-state': open ? ('open' as const) : ('closed' as const),
    'data-disabled': disabled ? '' : undefined,
    'data-placeholder': value === null ? '' : undefined,
  };

  const mergedClassName = cn(styles.trigger, className);

  if (asChild) {
    return (
      <Slot
        ref={mergedRef}
        {...ariaProps}
        className={mergedClassName}
        onClick={(event) => {
          handleClick(event);
          onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>);
        }}
        onKeyDown={(event) => {
          handleKeyDown(event);
          onKeyDown?.(event as unknown as React.KeyboardEvent<HTMLButtonElement>);
        }}
        {...(rest as React.HTMLAttributes<HTMLElement>)}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={mergedRef as React.Ref<HTMLButtonElement>}
      type="button"
      {...ariaProps}
      className={mergedClassName}
      onClick={(event) => {
        handleClick(event);
        onClick?.(event);
      }}
      onKeyDown={(event) => {
        handleKeyDown(event);
        onKeyDown?.(event);
      }}
      {...rest}
    >
      {children}
      <span aria-hidden="true" className={styles.icon}>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </span>
    </button>
  );
});

// ──────────────────────────────────────────────────────────────────────────
// SelectValue — renders the selected option's label (or placeholder)
// ──────────────────────────────────────────────────────────────────────────

export interface SelectValueProps extends HTMLAttributes<HTMLSpanElement> {
  /** Shown when no value is selected. */
  placeholder?: ReactNode;
  /** Extra class merged onto the value `<span>`. */
  className?: string;
}

export function SelectValue({ placeholder, className, children, ...rest }: SelectValueProps) {
  const ctx = useSelectContext('<SelectValue>');
  // `registryVersion` is destructured purely for subscription: the value
  // itself is not used in render, but reading it from context forces
  // SelectValue to re-render whenever a SelectItem registers/unregisters.
  // Without this, the first paint before items have registered would show
  // the raw value string (e.g. "pl") instead of the display label
  // ("Poland"). Phase 5 CRIT-3.
  const { value, getLabelByValue, registryVersion } = ctx;
  void registryVersion;

  const hasValue = value !== null;
  const label = getLabelByValue(value);
  const display = children ?? (hasValue ? (label ?? value) : placeholder);

  return (
    <span className={cn(styles.value, !hasValue && styles.valuePlaceholder, className)} {...rest}>
      {display}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// SelectContent — floating listbox, typeahead, keyboard handler
// ──────────────────────────────────────────────────────────────────────────

export interface SelectContentProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'role' | 'aria-labelledby' | 'aria-activedescendant' | 'tabIndex'
> {
  /** Listbox content — SelectItem / SelectGroup / SelectSeparator. */
  children?: ReactNode;
  /** Extra class merged onto the listbox element. */
  className?: string;
}

export function SelectContent({ children, className, ...rest }: SelectContentProps) {
  const ctx = useSelectContext('<SelectContent>');
  const {
    open,
    setOpen,
    valueRef,
    selectValue,
    contentId,
    triggerId,
    triggerRef,
    getOrderedItems,
    typeaheadRef,
    listboxKeyHandlerRef,
    highlightedId,
    setHighlight,
    placement,
    sideOffset,
    collisionPadding,
  } = ctx;

  const popperRef = useRef<HTMLDivElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);

  // Floating positioning.
  const {
    refs,
    floatingStyles,
    placement: actualPlacement,
  } = useFloating({
    open,
    placement,
    offset: sideOffset,
    padding: collisionPadding,
  });
  const { setReference, setFloating } = refs;

  // Bridge trigger DOM into useFloating's reference setter on open.
  useLayoutEffect(() => {
    if (!open) return;
    if (triggerRef.current) setReference(triggerRef.current);
  }, [open, triggerRef, setReference]);

  // Merge popper DOM ref for both useFloating setFloating AND local focus /
  // outside-click scope.
  const mergedPopperRef = useCallback(
    (node: HTMLDivElement | null) => {
      popperRef.current = node;
      setFloating(node);
    },
    [setFloating],
  );

  // Dismiss — outside click + scroll lock. `closeOnEscape: false` because
  // the listbox's own onKeyDown already handles Escape (intercepts it,
  // calls preventDefault, closes the listbox, restores focus) — letting
  // useFloatingDismiss ALSO handle Escape would cause double-handling and
  // can break nested dismiss ordering (Radix #16 — nested Dialog+Select).
  useFloatingDismiss({
    open,
    onDismiss: () => {
      setOpen(false);
      // Focus is already on the trigger under the aria-activedescendant
      // pattern, but an asChild wrapper or SSR hydration race might lose
      // it — refocus defensively.
      triggerRef.current?.focus();
    },
    contentRef: popperRef,
    triggerRef,
    closeOnEscape: false,
    closeOnOutsideClick: true,
    closeOnScroll: false,
  });

  // Escape stack — topmost dismiss even though listbox also handles Escape
  // on the trigger key path (nested Dialog + Select ordering, Radix #1951).
  useFloatingEscapeStack(open, () => {
    setOpen(false);
    triggerRef.current?.focus();
  });

  // Initialize highlight on open. Items have already registered via their
  // own useLayoutEffect (child effects commit before parent effects), so
  // getOrderedItems() returns the full list here. On cleanup (close), we
  // clear the highlight state and drain any pending typeahead buffer.
  //
  // The `react-hooks/set-state-in-effect` lint rule is disabled for the
  // initial-highlight write below because this is the legitimate
  // "subscribe to external system" case: the item registry is an
  // imperative `useRef<Map>` populated by child layout effects, and the
  // parent layout effect is the earliest point where the registry is
  // readable. Computing the initial highlight in render would miss the
  // first commit (children haven't registered yet). React's docs allow
  // setState in effects for this pattern.
  useLayoutEffect(() => {
    if (!open) return;

    // Consume + clear the closed-state seed intent FIRST — also when the
    // list turns out to be empty/all-disabled below, so a stale seed can
    // never leak into a later unrelated open (E03 audit fix).
    const typeaheadState = typeaheadRef.current;
    const pendingSeed = typeaheadState.pendingSeed;
    typeaheadState.pendingSeed = null;

    const items = getOrderedItems();
    const enabled = items.filter((it) => !it.disabled);
    if (enabled.length === 0) return;

    // Closed-state intent carried across the open transition (E03 audit
    // fix). Precedence: pending typeahead buffer (printable char opened the
    // listbox — APG: "opens ... then moves to the first matching option") →
    // pending Home/End/ArrowUp seed → current value → first enabled.
    let initial: SelectItemRecord | undefined;
    if (typeaheadState.buffer !== '') {
      const match = findTypeaheadMatch(enabled, typeaheadState.buffer, 0);
      if (match) {
        typeaheadState.lastIndex = match.index;
        initial = match.record;
      }
    }
    if (!initial && pendingSeed === 'first') initial = enabled[0];
    if (!initial && pendingSeed === 'last') initial = enabled[enabled.length - 1];
    if (!initial) {
      const current = valueRef.current;
      const currentRecord =
        current !== null ? items.find((it) => it.value === current && !it.disabled) : undefined;
      initial = currentRecord ?? enabled[0];
    }
    if (!initial) return;

    setHighlight(initial.id, 'keyboard');

    return () => {
      setHighlight(null, 'keyboard');
      if (typeaheadState.timer) {
        clearTimeout(typeaheadState.timer);
        typeaheadState.timer = null;
      }
      typeaheadState.buffer = '';
      typeaheadState.lastIndex = -1;
      typeaheadState.pendingSeed = null;
    };
  }, [open, valueRef, getOrderedItems, setHighlight, typeaheadRef]);

  // Cleanup typeahead timer on unmount. Snapshot the ref object in the
  // effect body so the cleanup closes over the same instance that existed
  // on mount (React 19 `react-hooks/exhaustive-deps` rule).
  useEffect(() => {
    const typeaheadState = typeaheadRef.current;
    return () => {
      if (typeaheadState.timer) {
        clearTimeout(typeaheadState.timer);
        typeaheadState.timer = null;
      }
    };
  }, [typeaheadRef]);

  // Commit the currently highlighted option + close. Fired by Enter / Space
  // / Tab / item click. When called from the Tab case, `restoreFocus` is
  // `false` so the trigger's .focus() does NOT race with the browser's
  // Tab advancement (Phase 5 CRIT-2 — Firefox + Safari would otherwise
  // cancel the Tab focus shift).
  const commitHighlighted = useCallback(
    (restoreFocus = true) => {
      const currentId = highlightedId;
      if (!currentId) {
        setOpen(false);
        return;
      }
      const items = getOrderedItems();
      const record = items.find((it) => it.id === currentId);
      if (!record || record.disabled) {
        setOpen(false);
        return;
      }
      selectValue(record.value);
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    },
    [highlightedId, getOrderedItems, selectValue, setOpen, triggerRef],
  );

  // Listbox keyboard handler. Accepts a minimal structural type so the
  // same handler can be invoked from React synthetic events (Trigger's
  // onKeyDown routes open-state events here via
  // `listboxKeyHandlerRef.current(event.nativeEvent)`). Reads highlighted
  // index via React state `highlightedId` — the current render's closure
  // always sees the post-commit value because this handler is recreated
  // each time `highlightedId` changes.
  const handleListboxKeyDown = useCallback(
    (event: SelectKeyEvent) => {
      if (!open) return;
      const items = getOrderedItems();
      const enabled = items.filter((it) => !it.disabled);
      if (enabled.length === 0) return;

      const hasModifier = event.ctrlKey || event.metaKey || event.shiftKey;
      // Alt+ArrowUp is a dedicated APG shortcut ("close without commit"),
      // so we do not lump it with `hasModifier`.
      const isAltArrowUp = event.altKey && event.key === 'ArrowUp';

      // Find current highlighted index within the ENABLED subset (keyboard
      // nav skips disabled). If nothing is highlighted yet, treat it as -1.
      const currentId = highlightedId;
      const highlightedIndex = currentId ? enabled.findIndex((it) => it.id === currentId) : -1;

      switch (event.key) {
        case 'ArrowDown': {
          if (hasModifier || event.altKey) return;
          event.preventDefault();
          const next = highlightedIndex < enabled.length - 1 ? highlightedIndex + 1 : 0;
          const target = enabled[next];
          if (target) setHighlight(target.id, 'keyboard');
          return;
        }
        case 'ArrowUp': {
          if (isAltArrowUp) {
            // Alt+ArrowUp — close without commit.
            event.preventDefault();
            setOpen(false);
            triggerRef.current?.focus();
            return;
          }
          if (hasModifier || event.altKey) return;
          event.preventDefault();
          const prev = highlightedIndex > 0 ? highlightedIndex - 1 : enabled.length - 1;
          const target = enabled[prev];
          if (target) setHighlight(target.id, 'keyboard');
          return;
        }
        case 'Home': {
          if (hasModifier || event.altKey) return;
          event.preventDefault();
          const first = enabled[0];
          if (first) setHighlight(first.id, 'keyboard');
          return;
        }
        case 'End': {
          if (hasModifier || event.altKey) return;
          event.preventDefault();
          const last = enabled[enabled.length - 1];
          if (last) setHighlight(last.id, 'keyboard');
          return;
        }
        case 'PageDown': {
          if (hasModifier || event.altKey) return;
          event.preventDefault();
          const next = Math.min(
            enabled.length - 1,
            (highlightedIndex < 0 ? 0 : highlightedIndex) + 10,
          );
          const target = enabled[next];
          if (target) setHighlight(target.id, 'keyboard');
          return;
        }
        case 'PageUp': {
          if (hasModifier || event.altKey) return;
          event.preventDefault();
          const prev = Math.max(0, (highlightedIndex < 0 ? 0 : highlightedIndex) - 10);
          const target = enabled[prev];
          if (target) setHighlight(target.id, 'keyboard');
          return;
        }
        case 'Enter':
        case ' ': {
          if (hasModifier || event.altKey) return;
          event.preventDefault();
          commitHighlighted();
          return;
        }
        case 'Escape': {
          // Close on Escape. `useFloatingDismiss` has `closeOnEscape: false`
          // so this handler is the single source of truth for Escape
          // handling, which keeps `defaultPrevented` tracking consistent
          // (Radix #16 — nested Dialog+Select dismiss ordering).
          event.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
          return;
        }
        case 'Tab': {
          // Radix convention: commit highlighted + close, let Tab propagate.
          // `restoreFocus: false` so the browser's Tab focus advancement
          // is not cancelled by a .focus() call on the trigger (Phase 5
          // CRIT-2).
          commitHighlighted(false);
          return;
        }
        default:
          break;
      }

      // Printable character typeahead — 500ms buffer, enabled-only, shared
      // with Trigger's closed-state typeahead via the root `typeaheadRef`.
      // Single-char repeat advances past `lastIndex` to cycle through
      // siblings; multi-char extend stays on the current index so
      // re-matching the buffer can still land on the same item.
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const tState = typeaheadRef.current;
        const char = event.key.toLowerCase();
        tState.buffer += char;
        if (tState.timer) clearTimeout(tState.timer);
        tState.timer = setTimeout(() => {
          tState.buffer = '';
          tState.timer = null;
          tState.lastIndex = -1;
        }, 500);

        const buffer = tState.buffer;
        const baseIndex = tState.lastIndex >= 0 ? tState.lastIndex : highlightedIndex;
        const fromIndex =
          baseIndex >= 0 ? (buffer.length === 1 ? (baseIndex + 1) % enabled.length : baseIndex) : 0;
        const match = findTypeaheadMatch(enabled, buffer, fromIndex);
        if (match) {
          event.preventDefault();
          tState.lastIndex = match.index;
          setHighlight(match.record.id, 'keyboard');
        }
      }
    },
    [
      open,
      highlightedId,
      getOrderedItems,
      setOpen,
      setHighlight,
      triggerRef,
      commitHighlighted,
      typeaheadRef,
    ],
  );

  // Publish the listbox key handler into the slot on root context so
  // Trigger's React onKeyDown can route open-state events to it. Single
  // event path — no native addEventListener bridge (Phase 5 CRIT-1).
  useLayoutEffect(() => {
    listboxKeyHandlerRef.current = handleListboxKeyDown;
    return () => {
      listboxKeyHandlerRef.current = null;
    };
  }, [handleListboxKeyDown, listboxKeyHandlerRef]);

  if (!open) return null;

  return (
    <FloatingPortal>
      <div ref={mergedPopperRef} className={styles.contentRoot} style={floatingStyles}>
        <div
          ref={listboxRef}
          id={contentId}
          role="listbox"
          aria-labelledby={triggerId}
          aria-multiselectable={false}
          tabIndex={-1}
          data-state="open"
          data-placement={actualPlacement}
          className={cn(styles.content, className)}
          {...rest}
        >
          {children}
        </div>
      </div>
    </FloatingPortal>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// SelectGroup — role="group" wrapper that pipes a generated label id to
// nested SelectLabel via context
// ──────────────────────────────────────────────────────────────────────────

interface SelectGroupContextValue {
  labelId: string;
}
const [SelectGroupContextProvider, useSelectGroupContext] =
  createFloatingContext<SelectGroupContextValue>('SelectGroup');

export interface SelectGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Group content — SelectItem elements plus an optional SelectLabel. */
  children: ReactNode;
  /** Extra class merged onto the group element. */
  className?: string;
}

export function SelectGroup({ children, className, ...rest }: SelectGroupProps) {
  const reactId = useId();
  const labelId = `${reactId}-label`;
  const value = useMemo<SelectGroupContextValue>(() => ({ labelId }), [labelId]);

  return (
    <SelectGroupContextProvider value={value}>
      <div role="group" aria-labelledby={labelId} className={cn(styles.group, className)} {...rest}>
        {children}
      </div>
    </SelectGroupContextProvider>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// SelectLabel — non-interactive section header inside a group
// ──────────────────────────────────────────────────────────────────────────

export interface SelectLabelProps extends HTMLAttributes<HTMLDivElement> {
  /** Label text announced as the surrounding group's accessible name. */
  children: ReactNode;
  /** Extra class merged onto the label element. */
  className?: string;
}

export function SelectLabel({ children, className, id, ...rest }: SelectLabelProps) {
  const ctx = useSelectGroupContext('<SelectLabel>');
  return (
    <div id={id ?? ctx.labelId} className={cn(styles.label, className)} {...rest}>
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// SelectItem — role="option" with registry hookup + mouse + click handlers
// ──────────────────────────────────────────────────────────────────────────

export interface SelectItemProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'role' | 'aria-selected' | 'aria-disabled'
> {
  /** Stable option value — written to form state + onValueChange on commit. */
  value: string;
  /** Disabled — skipped by arrow nav, typeahead, and click. */
  disabled?: boolean;
  /**
   * Override text used for typeahead matching + SelectValue display label.
   * When omitted, the item's `textContent` is used at registration time.
   * Set this when the item visual includes icons or hints that should not
   * pollute typeahead search.
   */
  textValue?: string;
  /** Visible option content — typeahead/label text derives from it unless `textValue` is set. */
  children: ReactNode;
  /** Extra class merged onto the option element. */
  className?: string;
}

function SelectItemImpl({
  value,
  disabled = false,
  textValue,
  children,
  className,
  onMouseMove,
  onMouseDown,
  onClick,
  ...rest
}: SelectItemProps) {
  const ctx = useSelectContext('<SelectItem>');
  const {
    value: selectedValue,
    selectValue,
    setOpen,
    registerItem,
    unregisterItem,
    triggerRef,
    highlightedId,
    setHighlight,
  } = ctx;

  const reactId = useId();
  const itemId = `${reactId}-option`;
  const elementRef = useRef<HTMLDivElement | null>(null);

  const isSelected = selectedValue === value;
  const isHighlighted = highlightedId === itemId;

  // Register with root on mount, unregister on unmount. Re-register when
  // value / disabled / textValue changes so the registry record stays fresh.
  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const resolvedText = textValue ?? element.textContent ?? '';
    registerItem(itemId, {
      id: itemId,
      element,
      value,
      textContent: resolvedText,
      disabled,
    });
    return () => unregisterItem(itemId);
  }, [itemId, value, disabled, textValue, registerItem, unregisterItem]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onMouseMove?.(event);
      if (disabled) return;
      // Compare via React state — `highlightedId` is read from context so
      // this render already reflects the current highlight. If we're not
      // the highlighted item, request the change.
      if (!isHighlighted) {
        setHighlight(itemId, 'mouse');
      }
    },
    [disabled, isHighlighted, itemId, setHighlight, onMouseMove],
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onMouseDown?.(event);
      // Prevent the native focus shift — the trigger must retain focus under
      // the aria-activedescendant pattern.
      event.preventDefault();
    },
    [onMouseDown],
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      if (disabled) return;
      selectValue(value);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [disabled, value, selectValue, setOpen, triggerRef, onClick],
  );

  return (
    <div
      ref={elementRef}
      id={itemId}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      data-state={isSelected ? 'checked' : 'unchecked'}
      data-highlighted={isHighlighted ? 'true' : undefined}
      data-disabled={disabled ? '' : undefined}
      data-value={value}
      tabIndex={-1}
      className={cn(styles.item, className)}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      {...rest}
    >
      <span aria-hidden="true" className={styles.itemIndicator}>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 8l3.5 3.5L13 5" />
        </svg>
      </span>
      <span className={styles.itemText}>{children}</span>
    </div>
  );
}

/**
 * SelectItem is wrapped in `React.memo` to shield items from re-renders
 * caused by consumer PARENT updates (new children/className identities when
 * the page re-renders). Note: this does NOT localize highlight moves — every
 * item consumes the root SelectContext, whose memoized value changes
 * identity whenever `highlightedId` changes, and context updates BYPASS
 * `memo`; all mounted items re-render per highlight move (see the
 * aria-activedescendant note in the file header). The memo's win is limited
 * to parent-prop churn (E03 audit fix — the previous text claimed only the
 * two toggled items re-render, which was false).
 */
export const SelectItem = memo(SelectItemImpl);
SelectItem.displayName = 'SelectItem';

// ──────────────────────────────────────────────────────────────────────────
// SelectSeparator — decorative divider, not focusable, not selectable
// ──────────────────────────────────────────────────────────────────────────

export interface SelectSeparatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Extra class merged onto the separator element. */
  className?: string;
}

export function SelectSeparator({ className, ...rest }: SelectSeparatorProps) {
  // `role="none"` (NOT `role="separator"`) because WAI-ARIA restricts
  // listbox children to `option` and `group` — a real separator role is
  // invalid inside a listbox and will fail axe-core (Phase 5 IMP-5). The
  // visual divider is still rendered; AT users simply traverse past it.
  return <div role="none" className={cn(styles.separator, className)} {...rest} />;
}
