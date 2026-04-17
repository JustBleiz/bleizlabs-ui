'use client';

/**
 * Combobox — editable single-select form field per WAI-ARIA APG /combobox/
 * (editable listbox variant). Pattern-child of Select (E27, CI12) — extends
 * the collapsed-listbox-with-typeahead model into a fully editable text input
 * whose value drives a live-filtered listbox of suggestions.
 *
 * @layer complex-interactive (Phase 10 CI13)
 * @tokens --input-bg, --input-border, --input-border-focus, --color-text-primary,
 *   --color-text-muted, --color-surface-raised, --color-surface-hover,
 *   --color-border-subtle, --shadow-lg, --radius-input, --radius-md, --radius-sm,
 *   --z-popover, --duration-fast, --easing-default, --focus-ring (via
 *   mx.focus-ring mixin), --focus-ring-error (via mx.focus-ring-error mixin),
 *   --color-error, --space-{1,2,3,4,6,8}, --font-size-sm, --font-size-xs,
 *   --font-size-base, --font-secondary, --font-weight-semibold,
 *   --line-height-normal
 * @deps zero runtime deps. Positioning via `utils/position.ts` +
 *   `utils/useFloating.ts` (E19/E20 primitive). Portal + dismiss + context via
 *   shared `utils/floating/` composable primitives (E23):
 *   `createFloatingContext` + `useFloatingState` (open/close) +
 *   `useFloatingValueState` (committed value — E29 extraction) +
 *   `useFloatingDismiss` + `FloatingPortal`. **Skipped** `useFloatingFocus` —
 *   focus stays on the editable input (the trigger IS the input under the
 *   APG editable-combobox pattern), so there is no focus target inside the
 *   listbox to move to. Highlight is exposed via `aria-activedescendant` on
 *   the input. Value state (`string | null`) now flows through the shared
 *   `useFloatingValueState<string>` primitive (E29 — post-Tabs E26 / Select E27,
 *   Rule of Three strict pass with NavigationMenu E25 + Combobox E28 as the
 *   fourth consumer). Hook owns the controlled/uncontrolled hybrid, identity-
 *   guarded setter, and `latestValueRef` pattern that originally lived inline
 *   here. Public `onValueChange` narrows to `(value: string) => void` (null
 *   transitions do NOT fire the callback — consumers observe null via
 *   controlled mode, mirroring Radix + Select), so we wrap the hook's
 *   `onValueChange` at the boundary to filter nulls. Search state (`string`,
 *   never null) stays inline — different semantics, empty string is a valid
 *   state and the hook's `T | null` shape does not fit.
 *
 * @a11y APG /combobox/ editable-listbox + /listbox/:
 *   Input: `role="combobox"` + `aria-autocomplete="list"` + `aria-expanded` +
 *   `aria-controls` (when open) + `aria-activedescendant` (points at the
 *   highlighted option id while open — focus STAYS on the input the entire
 *   time). `aria-required` + `aria-invalid` propagate from props. `aria-disabled`
 *   is used (NOT the native `disabled` attribute) so AT users can discover
 *   the field even when it is non-interactive — same precedent as Select
 *   (E27), NavigationMenu (E25), Tabs (E26). Listbox: `role="listbox"` +
 *   `aria-labelledby={inputId}` + `aria-multiselectable={false}` (explicit
 *   per Select Phase 5 IMP-2). Items: `role="option"` + `aria-selected` +
 *   `aria-disabled` when disabled. Groups: `role="group" aria-labelledby`
 *   pointing at a nested ComboboxLabel id. Label: plain `<div>` with id (no
 *   role) — the group's `aria-labelledby` resolves the accessible name via
 *   the label's text content without announcing the label as a separate
 *   listbox item. Separator: `role="none"` — WAI-ARIA restricts listbox
 *   children to `option`/`group`. Empty: `role="presentation"` — purely
 *   visual "no results" message, AT users hear it from the input live region
 *   if consumers wrap it. The clear button is a native `<button>` with
 *   `aria-label="Clear selection"`.
 *
 *   Keyboard model (APG editable-combobox + Phase 2 overrides):
 *   Input — closed:
 *   - ArrowDown / Alt+ArrowDown / ArrowUp: open listbox (no commit), seed
 *     highlight to current value (or first enabled item).
 *   - Enter: no-op (form submit bubbles up to consumer).
 *   - Escape: clear search if non-empty; else no-op (lets parent dialog
 *     handle it). Per Phase 2 override.
 *   - Printable char / Backspace: open listbox + filter via search state
 *     change. (The `onChange` handler does the open + filter — keydown does
 *     not preventDefault so the character lands in the input naturally.)
 *   - Tab/Shift+Tab: pass-through.
 *   Input — open (focus STAYS on input; aria-activedescendant tracks highlight):
 *   - ArrowDown / ArrowUp: next/prev visible enabled option, wraparound,
 *     scrollIntoView.
 *   - Home / End: first / last visible enabled option.
 *   - PageDown / PageUp: +/-10 (clamped + visible-only).
 *   - Enter: commit highlighted option (closes, fires onValueChange,
 *     focus stays on input, search updates to committed label). When
 *     `acceptFreeText` AND no highlight, commit the raw search as the
 *     value. Otherwise (empty visible list + strict mode), Enter is a
 *     no-op that ALSO preventDefaults to suppress unintended form submit
 *     while the listbox is open — user can keep typing to refine (E28
 *     Phase 5 IMP-1).
 *   - Escape: close without committing; restore search to current value's
 *     label (or empty when no value). Per Phase 2 override.
 *   - Alt+ArrowUp: close without committing (APG alternative to Escape).
 *   - Alt+ArrowDown: no-op while OPEN (E28 Phase 5 IMP-5 deviation from
 *     APG). APG allows Alt+ArrowDown to "show all items ignoring filter"
 *     while open — we intentionally skip that behavior because the UX
 *     value is marginal (user can Escape then Alt+ArrowDown to re-open
 *     showing all items, or simply clear the input). Implementing the
 *     filter-bypass flag + reset-on-next-keystroke logic was judged not
 *     worth the complexity for this edge case. Closed-state
 *     Alt+ArrowDown still opens the listbox showing all items per APG.
 *   - Tab/Shift+Tab: commit highlighted + close + let Tab propagate. When
 *     no highlight, just close — Tab still moves focus to the next field.
 *
 *   Mouse: pointermove on item highlights (hover syncs the keyboard
 *   highlight); click on item commits + closes; click on chevron toggles
 *   open; click on clear button clears search + value; click on input does
 *   NOT toggle (matches Radix — typing/arrow opens, click to focus only).
 *
 *   Focus stays on the editable input at ALL times — the listbox itself is
 *   `tabIndex={-1}` (receives no focus). This is the APG editable-combobox
 *   pattern and matches Radix Combobox / shadcn `cmdk`.
 *
 *   Event-path discipline (Select Phase 5 CRIT-1 inheritance): open- and
 *   closed-state key events both flow through the input's single React
 *   `onKeyDown`. While open, the input reads `listboxKeyHandlerRef.current`
 *   (published by ComboboxContent in a layout effect) and routes the native
 *   event to it. There is NO secondary native `addEventListener('keydown')`
 *   bridge — a dual path was stripping `defaultPrevented` tracking from
 *   consumer onKeyDown observers. The listbox handler signature accepts a
 *   minimal structural type (`ComboboxKeyEvent`) so React synthetic events
 *   satisfy it via `event.nativeEvent`.
 *
 *   `aria-activedescendant` (Select Phase 5 IMP-3 inheritance) is declarative
 *   React state owned by ComboboxContent (`highlightedId`) and published via
 *   `ComboboxContentContext`. ComboboxInput reads `highlightedId` from that
 *   context and reconciles it onto the DOM on every render so React cannot
 *   strip the attribute by re-rendering with other ARIA props. ComboboxItem
 *   is wrapped in `React.memo` to localize re-renders when the highlight
 *   moves.
 *
 *   IME composition (Phase 2 CB-R07 carve-out): Chinese / Japanese / Korean
 *   input composition writes intermediate characters to the input as the
 *   user picks among kanji/pinyin candidates. Treating those keystrokes as
 *   open / commit / dismiss triggers would tear the composition apart. The
 *   input tracks `isComposingRef` via `onCompositionStart` / `onCompositionEnd`
 *   and `onKeyDown` early-returns whenever composition is active. The
 *   `onChange` handler still fires (composition writes go through React's
 *   change event), so the search state stays in sync; the listbox just
 *   doesn't open or react to keys mid-composition. After
 *   `onCompositionEnd`, the handler reads the final input value into
 *   search state in one shot.
 *
 *   Filter mechanics (Phase 2 override — `contains` is the default, NOT
 *   `startsWith`):
 *   - Mode `'auto'` (default): case-insensitive substring match
 *     (`textContent.toLowerCase().includes(search.toLowerCase())`). Matches
 *     shadcn / cmdk precedent — typing "an" reveals "Canada", "Austria",
 *     "Andorra", "Japan". Empty search shows ALL items.
 *   - Mode `false`: filter is disabled — every registered item is visible.
 *     Consumer owns the filtering (typically via async fetch keyed on
 *     search) and supplies only the items that should display.
 *   - Mode `(items, search) => items`: custom predicate. Receives the full
 *     ordered registry + current search and returns the visible subset.
 *     Consumer can fuzzy-match, score, sort, group, etc.
 *
 *   Item visibility: items that fail the filter are OMITTED from the DOM
 *   entirely (return null from ComboboxItem render). Matches Radix /
 *   cmdk — keeps the listbox ARIA tree clean (no hidden options confusing
 *   AT virtual cursors) and lets consumers see the visible-count via
 *   ComboboxEmpty.
 *
 *   Blur strategy A (Radix — auto-commit on exact match, revert on
 *   mismatch): when the input loses focus, schedule a microtask check —
 *   if the current search exactly matches a registered item's textValue,
 *   commit that item's value. Otherwise revert search to the current
 *   committed value's label (or empty when no value). The microtask delay
 *   lets a click-on-item commit first, and we additionally check
 *   `relatedTarget` against the popper element so clicks inside the
 *   listbox skip the blur logic entirely.
 *
 *   `acceptFreeText` (Phase 2 explicit opt-in): default `false`. When
 *   `true`, Enter (with no highlight) commits the raw search string as the
 *   value and the blur revert step also accepts the raw search as a value
 *   when no highlight is present. Use this for "tag input" / "create new"
 *   patterns. Default off keeps the contract strict (Combobox is a select-
 *   from-list field by default).
 *
 *   Form participation: when the `name` prop is provided, Combobox renders
 *   a hidden `<input type="hidden">` synced with the current value.
 *   `required` + `disabled` propagate to the hidden input so native form
 *   validation and FormData serialization work without consumer plumbing.
 *
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y via eslint-config-next ✓ |
 *   DEFERRED: Playwright execution, axe-core runtime sweep, manual NVDA /
 *   VoiceOver / JAWS sweep, iOS / Android device testing (per E15 scope
 *   decision, to be completed during Phase 6 Integration / Phase 7 audit).
 * @regressions tests/Combobox.{keyboard,focus,aria,regression}.spec.md — 28
 *   regression cases planned (docs/specs/combobox-spec.md §Regression Cases),
 *   highest-risk 6 currently covered (CB-R02 SSR, CB-R03 filter race,
 *   CB-R06 blur commit, CB-R07 IME composition guard, CB-R16 SSR portal,
 *   CB-R17 Escape bubble). Full enumeration deferred to consumer adoption.
 * @example
 *   <Combobox name="country" defaultValue="pl" onValueChange={(v) => ...}>
 *     <ComboboxInput placeholder="Search a country..." aria-label="Country" />
 *     <ComboboxContent>
 *       <ComboboxGroup>
 *         <ComboboxLabel>Europe</ComboboxLabel>
 *         <ComboboxItem value="pl">Poland</ComboboxItem>
 *         <ComboboxItem value="de">Germany</ComboboxItem>
 *       </ComboboxGroup>
 *       <ComboboxSeparator />
 *       <ComboboxGroup>
 *         <ComboboxLabel>Americas</ComboboxLabel>
 *         <ComboboxItem value="us">United States</ComboboxItem>
 *       </ComboboxGroup>
 *       <ComboboxEmpty>No countries match.</ComboboxEmpty>
 *     </ComboboxContent>
 *   </Combobox>
 */

import {
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type MutableRefObject,
  type ReactNode,
  type RefObject,
} from 'react';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { useFloating } from '../../utils/useFloating';
import { type Placement } from '../../utils/position';
import {
  createFloatingContext,
  useFloatingState,
  useFloatingValueState,
  useFloatingDismiss,
  FloatingPortal,
} from '../../utils/floating';
import styles from './Combobox.module.scss';

export type ComboboxPlacement = Placement;

/**
 * Minimal structural shape shared by React synthetic keyboard events and
 * native DOM KeyboardEvents. Used so the same listbox handler can be
 * invoked from React's onKeyDown on the input (passing `event.nativeEvent`).
 * Inherited from Select Phase 5 CRIT-1 single-event-path discipline.
 */
type ComboboxKeyEvent = Pick<
  KeyboardEvent,
  'key' | 'preventDefault' | 'stopPropagation' | 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'
>;

// ──────────────────────────────────────────────────────────────────────────
// Item registry — shared between Root + Content + Item
// ──────────────────────────────────────────────────────────────────────────

export interface ComboboxItemRecord {
  /** DOM id for aria-activedescendant targeting. */
  id: string;
  /** DOM element — used for scrollIntoView and compareDocumentPosition ordering. */
  element: HTMLElement;
  /** Stable option value — the string written to form state + onValueChange. */
  value: string;
  /**
   * Visible text content — used for filter matching, ComboboxInput's
   * committed-label display, and exact-match auto-commit on blur. Derived
   * from the `textValue` prop or from `children` via React (not DOM), so
   * items that mount while hidden still register with correct text.
   */
  textContent: string;
  /** Disabled state — skipped by keyboard nav, filter visibility honors disabled too. */
  disabled: boolean;
}

/**
 * Filter mode union (Phase 2 override — default `'auto'` is contains-match).
 *   - `'auto'`: built-in case-insensitive substring match.
 *   - `false`: no filtering — consumer supplies the visible items.
 *   - `(items, search) => items`: custom predicate, runs against the
 *     full ordered registry on every search change.
 */
export type ComboboxFilter =
  | 'auto'
  | false
  | ((items: ComboboxItemRecord[], search: string) => ComboboxItemRecord[]);

// ──────────────────────────────────────────────────────────────────────────
// Root context (shared across Input / Content / Item)
// ──────────────────────────────────────────────────────────────────────────

interface ComboboxContextValue {
  /** Open state of the listbox. */
  open: boolean;
  setOpen: (next: boolean) => void;
  /** Currently committed value (null when empty). Read-only — use selectValue() to mutate. */
  value: string | null;
  /**
   * Live ref mirror of `value` — used inside callbacks that should not
   * re-memoize on every value change (e.g. `selectValue`, `commitHighlighted`,
   * blur revert). Readers should always `valueRef.current`, never the
   * memoized `value`.
   */
  valueRef: MutableRefObject<string | null>;
  /** Commit a new value — fires onValueChange when the value differs. */
  selectValue: (next: string | null) => void;
  /** Current search text (controlled or uncontrolled). */
  search: string;
  /** Live ref mirror of `search` — read by blur logic so it sees the latest text. */
  searchRef: MutableRefObject<string>;
  /** Update search text — respects controlled/uncontrolled and fires onSearchChange. */
  updateSearch: (next: string) => void;
  /** ID pair for ARIA wiring. */
  inputId: string;
  contentId: string;
  /** Input DOM ref — used by floating positioning + focus restoration on commit. */
  inputRef: RefObject<HTMLInputElement | null>;
  /** Root-level disabled state — blocks input interaction + form submission. */
  disabled: boolean;
  /** Required — wired onto hidden input + aria-required on combobox input. */
  required: boolean;
  /** Form participation name — presence toggles hidden input render. */
  name: string | undefined;
  /** Item registry — populated by ComboboxItem useLayoutEffect. */
  registerItem: (key: string, record: ComboboxItemRecord) => void;
  unregisterItem: (key: string) => void;
  /**
   * Monotonic counter bumped on every register/unregister. Consumers that
   * need to re-read the registry (e.g. visibility computation, blur exact-
   * match lookup) subscribe to this so they re-render when items mount.
   * Inherited from Select Phase 5 CRIT-3.
   */
  registryVersion: number;
  /** Returns the full registry as a DOM-ordered array. */
  getOrderedItems: () => ComboboxItemRecord[];
  /** Returns the record for a given option value, or undefined. */
  getItemByValue: (value: string | null) => ComboboxItemRecord | undefined;
  /**
   * Set of item ids that pass the current filter. Items consult this to
   * decide whether to render. Computed at the root so the filter logic is
   * a single source of truth across mount, search change, and registry
   * change.
   */
  visibleItemIds: Set<string>;
  /** Number of items that currently pass the filter — read by ComboboxEmpty. */
  matchCount: number;
  /**
   * Slot for ComboboxContent to publish its listbox keydown handler so the
   * input's React onKeyDown can route open-state events to it. Mirrors
   * Select Phase 5 CRIT-1.
   */
  listboxKeyHandlerRef: MutableRefObject<((event: ComboboxKeyEvent) => void) | null>;
  /** Whether free-text Enter commit + free-text blur commit is allowed. */
  acceptFreeText: boolean;
  /** Positioning — consumed by ComboboxContent's useFloating call. */
  placement: ComboboxPlacement;
  sideOffset: number;
  collisionPadding: number;
}

const [ComboboxContextProvider, useComboboxContext] =
  createFloatingContext<ComboboxContextValue>('Combobox');

// ──────────────────────────────────────────────────────────────────────────
// Content context — highlight state shared Content → Input → Item
// ──────────────────────────────────────────────────────────────────────────
//
// Lives separately from the root context because the highlighted option is
// only meaningful while the listbox is open. Inherited from Select Phase 5
// IMP-3: highlightedId is React state (not a ref + direct DOM writes) so
// React owns `aria-activedescendant` declaratively on the input. Items are
// wrapped in `React.memo` so only the two actually-toggled items re-render
// when the highlight moves. Plain nullable React context (not
// `createFloatingContext`) so ComboboxInput can read it OPTIONALLY — when
// the listbox is closed there is no Content provider in the tree.

interface ComboboxContentContextValue {
  /** Current highlighted option id, or null when nothing is highlighted. */
  highlightedId: string | null;
  /** Request a highlight change. `source` selects scroll behavior. */
  setHighlight: (id: string | null, source: 'mouse' | 'keyboard') => void;
  /** Popper element ref — used by Input's blur logic to detect intra-popup focus moves. */
  popperRef: RefObject<HTMLDivElement | null>;
}

const ComboboxContentContext = createContext<ComboboxContentContextValue | null>(null);
ComboboxContentContext.displayName = 'ComboboxContentContext';

function useRequiredComboboxContentContext(componentName: string): ComboboxContentContextValue {
  const ctx = useContext(ComboboxContentContext);
  if (!ctx) {
    throw new Error(`${componentName} must be rendered inside a <ComboboxContent> parent.`);
  }
  return ctx;
}

// ──────────────────────────────────────────────────────────────────────────
// Combobox root — state holder, item registry, filter logic, context provider
// ──────────────────────────────────────────────────────────────────────────

export interface ComboboxProps {
  children: ReactNode;
  /** Controlled value. Pass `null` for "no selection". When provided, component is controlled. */
  value?: string | null;
  /** Uncontrolled initial value. Ignored when `value` is provided. Default `null`. */
  defaultValue?: string | null;
  /**
   * Fires every time the committed value changes. Argument is a `string`
   * (never `null`); when Combobox is cleared, no callback fires. Consumers
   * who need to observe null transitions should use the controlled `value`
   * prop. Mirrors Select semantics.
   */
  onValueChange?: (value: string) => void;
  /** Controlled search text. When provided, search state is controlled. */
  search?: string;
  /** Uncontrolled initial search. Default `''`. */
  defaultSearch?: string;
  /** Fires on every search change (typing, clear, commit-driven sync). */
  onSearchChange?: (search: string) => void;
  /** Controlled open state of the listbox. */
  open?: boolean;
  /** Uncontrolled initial open state. Default `false`. */
  defaultOpen?: boolean;
  /** Fires on every open transition. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Filter mode — `'auto'` (default contains-match), `false` (consumer-
   * filtered), or a custom predicate. See `ComboboxFilter`.
   */
  filter?: ComboboxFilter;
  /**
   * When `true`, Enter (without an active highlight) commits the raw search
   * text as the value, and blur accepts the raw search as a value when no
   * exact item match is found. Default `false` (strict select-from-list).
   */
  acceptFreeText?: boolean;
  /**
   * Form field name. When provided, Combobox renders a hidden `<input>`
   * synced with `value` so native form submission + FormData serialization
   * work. `required` + `disabled` propagate to the hidden input.
   */
  name?: string;
  /** Root-level disabled — blocks input interaction + form submission. */
  disabled?: boolean;
  /** Required — wires `aria-required` on input + `required` on hidden input. */
  required?: boolean;
  /**
   * Preferred placement of the listbox. Default `'bottom-start'` — listbox
   * left edge aligns with input left edge. Auto flip + shift on collision.
   */
  placement?: ComboboxPlacement;
  /** Gap in pixels between input and listbox. Default `4`. */
  sideOffset?: number;
  /** Inner padding from viewport edges for flip + shift. Default `8`. */
  collisionPadding?: number;
}

export function Combobox({
  children,
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  search: controlledSearch,
  defaultSearch = '',
  onSearchChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  filter = 'auto',
  acceptFreeText = false,
  name,
  disabled = false,
  required = false,
  placement = 'bottom-start',
  sideOffset = 4,
  collisionPadding = 8,
}: ComboboxProps) {
  const reactId = useId();
  const inputId = `${reactId}-input`;
  const contentId = `${reactId}-listbox`;

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Controlled/uncontrolled open via shared primitive.
  const { open, setOpen } = useFloatingState({
    controlledOpen,
    defaultOpen,
    onOpenChange,
  });

  // Controlled/uncontrolled value — routed through shared `useFloatingValueState`
  // primitive (E29 extraction). Hook owns the controlled/uncontrolled hybrid,
  // the identity-guarded setter (no-ops when `next === valueRef.current`), and
  // the `latestValueRef` pattern that was critical for avoiding mass re-
  // registration of ComboboxItems — their `useLayoutEffect` depends on
  // `registerItem`/`unregisterItem` identity via context, which in turn
  // depends on `selectValue` identity, which MUST stay stable across value
  // changes. Public `onValueChange` narrows to `(value: string) => void`
  // (null transitions do NOT fire — consumers observe them via controlled
  // mode, mirroring Radix + Select), so wrap at the boundary to filter nulls.
  // The wrapper is memoized so the hook sees a stable callback identity —
  // otherwise `setValue` would churn on every render and defeat the
  // `latestValueRef` guarantee that keeps item registrations stable.
  const handleValueChange = useCallback(
    (next: string | null) => {
      if (next !== null) onValueChange?.(next);
    },
    [onValueChange],
  );
  const { value, setValue: selectValue, valueRef } = useFloatingValueState<string>({
    controlledValue,
    defaultValue: defaultValue ?? null,
    onValueChange: handleValueChange,
  });

  // Controlled/uncontrolled search — second hybrid slot, same pattern.
  const isSearchControlled = controlledSearch !== undefined;
  const [uncontrolledSearch, setUncontrolledSearch] = useState<string>(defaultSearch);
  const search = isSearchControlled ? controlledSearch : uncontrolledSearch;

  // Latest-search ref — read by blur logic so it sees the post-typing value
  // even when the search state hasn't reached the closure yet.
  const searchRef = useRef<string>(search);
  useLayoutEffect(() => {
    searchRef.current = search;
  });

  const updateSearch = useCallback(
    (next: string) => {
      if (next === searchRef.current) return;
      if (!isSearchControlled) setUncontrolledSearch(next);
      onSearchChange?.(next);
    },
    [isSearchControlled, onSearchChange],
  );

  // Item registry — stored in a ref so register/unregister mutations do NOT
  // trigger re-renders of every context consumer. Companion `registryVersion`
  // bumps on every (un)register so visibility computation re-runs.
  const itemsRef = useRef<Map<string, ComboboxItemRecord>>(new Map());
  const [registryVersion, setRegistryVersion] = useState(0);

  const registerItem = useCallback((key: string, record: ComboboxItemRecord) => {
    itemsRef.current.set(key, record);
    setRegistryVersion((v) => v + 1);
  }, []);

  const unregisterItem = useCallback((key: string) => {
    itemsRef.current.delete(key);
    setRegistryVersion((v) => v + 1);
  }, []);

  const getOrderedItems = useCallback((): ComboboxItemRecord[] => {
    const items = Array.from(itemsRef.current.values());
    items.sort((a, b) => {
      const pos = a.element.compareDocumentPosition(b.element);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
    return items;
  }, []);

  const getItemByValue = useCallback(
    (target: string | null): ComboboxItemRecord | undefined => {
      if (target === null) return undefined;
      for (const record of itemsRef.current.values()) {
        if (record.value === target) return record;
      }
      return undefined;
    },
    [],
  );

  // Filter computation — synced into state via a layout effect rather than
  // computed in render. Reading the registry ref (`itemsRef.current`) inside
  // useMemo would trip the React 19 `react-hooks/refs` rule (refs are
  // off-limits during render). The layout effect runs after every render
  // that mutates `search`, `registryVersion`, or `filter` and pushes the
  // result into state, which then flows down to items and ComboboxEmpty
  // via context. This is the canonical "subscribe to an external system"
  // pattern from React docs.
  //
  // `'auto'` mode: case-insensitive substring match
  // (`textContent.toLowerCase().includes(search.toLowerCase())`). Empty
  // search shows all items. Per Phase 2 override — REJECTED `startsWith`
  // (shadcn/cmdk precedent + user expectation: typing "an" finds Canada,
  // Austria, Andorra, Japan).
  //
  // `false` mode: every item is visible. Consumer owns filtering (typically
  // by supplying only the items that should display, often via async fetch).
  //
  // Function mode: predicate receives the full ordered registry + search
  // and returns the visible subset. Consumer can score / sort / fuzzy-match.
  const [visibleItemIds, setVisibleItemIds] = useState<Set<string>>(() => new Set());
  const [matchCount, setMatchCount] = useState(0);

  useLayoutEffect(() => {
    const items = getOrderedItems();
    let visible: ComboboxItemRecord[];
    if (filter === false) {
      visible = items;
    } else if (filter === 'auto') {
      if (search === '') {
        visible = items;
      } else {
        const needle = search.toLowerCase();
        visible = items.filter((it) =>
          it.textContent.toLowerCase().includes(needle),
        );
      }
    } else {
      visible = filter(items, search);
    }
    const nextSet = new Set<string>();
    for (const it of visible) nextSet.add(it.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- subscribe-to-external-system pattern (item registry is an imperative useRef<Map>); see Select E27 precedent
    setVisibleItemIds(nextSet);
    setMatchCount(visible.length);
  }, [search, registryVersion, filter, getOrderedItems]);

  // Slot that ComboboxContent publishes on mount — Input's React onKeyDown
  // reads this to route open-state keys to the listbox handler. Single-path
  // event handler discipline inherited from Select Phase 5 CRIT-1.
  const listboxKeyHandlerRef = useRef<((event: ComboboxKeyEvent) => void) | null>(null);

  // One-shot initial search sync (E28 Phase 5 IMP-4): when the consumer
  // passes `defaultValue="pl"` without `defaultSearch`, the input initially
  // shows '' because items haven't registered yet. After the first registry
  // fill, sync search to the committed value's label so the input displays
  // the correct text on first paint. Gated to run at most once:
  //   - items must have registered (registryVersion > 0)
  //   - search must still be empty (respects consumer-provided defaultSearch
  //     and any user typing that happened before items mounted)
  //   - a value must be committed (nothing to sync from otherwise)
  //   - search must be uncontrolled (controlled search is owned by consumer)
  const initialSearchSyncRef = useRef(false);
  useLayoutEffect(() => {
    if (initialSearchSyncRef.current) return;
    if (registryVersion === 0) return;
    if (isSearchControlled) {
      // Mark as done — we never overwrite controlled search.
      initialSearchSyncRef.current = true;
      return;
    }
    if (searchRef.current !== '') return;
    if (valueRef.current === null) return;
    // Registry key is itemId (React useId), not value — scan by value.
    let record: ComboboxItemRecord | undefined;
    for (const it of itemsRef.current.values()) {
      if (it.value === valueRef.current) {
        record = it;
        break;
      }
    }
    if (record && record.textContent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- subscribe-to-external-system pattern (registry is imperative useRef<Map>); mirrors the existing visibility + highlight effects in this file
      setUncontrolledSearch(record.textContent);
      initialSearchSyncRef.current = true;
    }
  }, [registryVersion, isSearchControlled, valueRef]);

  const contextValue = useMemo<ComboboxContextValue>(
    () => ({
      open,
      setOpen,
      value,
      valueRef,
      selectValue,
      search,
      searchRef,
      updateSearch,
      inputId,
      contentId,
      inputRef,
      disabled,
      required,
      name,
      registerItem,
      unregisterItem,
      registryVersion,
      getOrderedItems,
      getItemByValue,
      visibleItemIds,
      matchCount,
      listboxKeyHandlerRef,
      acceptFreeText,
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
      search,
      updateSearch,
      inputId,
      contentId,
      disabled,
      required,
      name,
      registerItem,
      unregisterItem,
      registryVersion,
      getOrderedItems,
      getItemByValue,
      visibleItemIds,
      matchCount,
      acceptFreeText,
      placement,
      sideOffset,
      collisionPadding,
    ],
  );

  return (
    <ComboboxContextProvider value={contextValue}>
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
    </ComboboxContextProvider>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// ComboboxInput — editable text input + chevron + clear button (the trigger)
// ──────────────────────────────────────────────────────────────────────────
//
// Self-contained trigger wrapper: native `<input>` with combobox role,
// chevron toggle button, clear button. NO separate ComboboxTrigger export
// — keeping the API at 8 named exports matches Select. Phase 2 also rejected
// the spec's separate ComboboxList export: ComboboxContent IS the listbox.

export interface ComboboxInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | 'aria-expanded'
    | 'aria-haspopup'
    | 'aria-controls'
    | 'aria-activedescendant'
    | 'aria-autocomplete'
    | 'role'
    | 'value'
    | 'defaultValue'
    | 'disabled'
  > {
  className?: string;
  /**
   * Optional explicit `aria-labelledby` — wires an external label element
   * to the combobox role. When omitted, consumer must provide `aria-label`
   * via `rest` or rely on a parent `<label>` association.
   */
  'aria-labelledby'?: string;
  /** Optional `aria-label` override — takes precedence when no labelledby. */
  'aria-label'?: string;
  /**
   * External validation error state — flips `aria-invalid` on the input
   * and triggers the error-state visual border. Default `false`.
   */
  invalid?: boolean;
  /**
   * Visible placeholder text shown when the input is empty. Defaults to
   * undefined (no placeholder).
   */
  placeholder?: string;
  /** Hide the chevron toggle button. Default `false`. */
  hideChevron?: boolean;
  /**
   * Hide the clear (X) button. Default `false` — the button auto-shows
   * when search OR value is non-empty and auto-hides when both are empty.
   */
  hideClear?: boolean;
}

export const ComboboxInput = forwardRef<HTMLInputElement, ComboboxInputProps>(
  function ComboboxInput(
    {
      className,
      invalid = false,
      placeholder,
      hideChevron = false,
      hideClear = false,
      'aria-labelledby': ariaLabelledBy,
      'aria-label': ariaLabel,
      onKeyDown,
      onChange,
      onBlur,
      onFocus,
      onCompositionStart,
      onCompositionEnd,
      ...rest
    },
    forwardedRef,
  ) {
    const ctx = useComboboxContext('<ComboboxInput>');
    const {
      open,
      setOpen,
      value,
      valueRef,
      selectValue,
      search,
      searchRef,
      updateSearch,
      inputId,
      contentId,
      inputRef,
      disabled,
      required,
      getOrderedItems,
      getItemByValue,
      listboxKeyHandlerRef,
      acceptFreeText,
    } = ctx;

    // Subscribe to Content's context only while the listbox is mounted
    // (open). When closed, `contentCtx` is null — we can't call hooks
    // conditionally, so we always read the context but fall back to null
    // when there is no provider.
    const contentCtx = useContext(ComboboxContentContext);
    const highlightedId = contentCtx?.highlightedId ?? null;
    // Note: ComboboxInput intentionally does NOT consume `popperRef` from
    // ComboboxContentContext. The blur handler resolves the popper element
    // via `document.getElementById(contentId)` instead, because
    // React 19's `react-hooks/preserve-manual-memoization` rule flags
    // `ref?.current` reads inside `useCallback` deps as memoization-
    // breaking. DOM lookup keeps the callback ref-free. The `popperRef`
    // is still published on the context for any future consumer that
    // needs a stable element handle.

    const setInputNode = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
      },
      [inputRef],
    );
    const mergedRef = mergeRefs(forwardedRef, setInputNode);

    // IME composition guard — Chinese / Japanese / Korean input methods
    // synthesize multiple keystrokes per visible character. Treating those
    // keystrokes as open / commit / dismiss triggers tears the composition
    // apart. We track composition state in a ref + early-return from the
    // keydown handler whenever it's active. Per Phase 2 CB-R07.
    const isComposingRef = useRef(false);

    // Live-snapshot ref of `open` so the deferred blur callback can short-
    // circuit when something else has already closed the listbox by the
    // time the microtask runs.
    const openRef = useRef(open);
    useLayoutEffect(() => {
      openRef.current = open;
    });

    const handleCompositionStart = useCallback(
      (event: React.CompositionEvent<HTMLInputElement>) => {
        isComposingRef.current = true;
        onCompositionStart?.(event);
      },
      [onCompositionStart],
    );

    const handleCompositionEnd = useCallback(
      (event: React.CompositionEvent<HTMLInputElement>) => {
        isComposingRef.current = false;
        // After composition ends, the input value is final — sync search
        // state with one shot (composition writes go through `onChange`
        // too, but we want to be defensive in case React batches them
        // differently across browsers).
        const next = (event.target as HTMLInputElement).value;
        if (next !== searchRef.current) {
          updateSearch(next);
          if (!openRef.current && next !== '') setOpen(true);
        }
        onCompositionEnd?.(event);
      },
      [onCompositionEnd, updateSearch, searchRef, setOpen],
    );

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(event);
        const next = event.target.value;
        // Always update search — even mid-composition we want React to
        // have the right value so the controlled input re-renders cleanly.
        updateSearch(next);
        // Open on typing (any non-empty change to search). Don't open when
        // the user is clearing the field — that's a "narrow my view" intent
        // not a "show me suggestions" intent. Also don't auto-open mid-
        // composition; the user is still picking among IME candidates.
        if (isComposingRef.current) return;
        if (!openRef.current && next !== '') {
          setOpen(true);
        }
      },
      [onChange, updateSearch, setOpen],
    );

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        onFocus?.(event);
        // Intentionally do NOT auto-open on focus. Matches Radix /
        // shadcn cmdk — opening on focus surprises users tabbing through
        // a form. The user must type or press an arrow key to open.
      },
      [onFocus],
    );

    // Blur strategy A (Radix — auto-commit on exact match, revert on
    // mismatch). The microtask delay lets a click-on-item commit first,
    // and we additionally check `relatedTarget` against the popper element
    // so clicks inside the listbox skip blur logic entirely. The `value`,
    // `search`, and `open` reads use the live refs so the deferred callback
    // sees the most recent state regardless of how many renders have flushed.
    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        onBlur?.(event);
        if (disabled) return;

        // Skip when focus moved INTO the popper (item click — the click
        // handler will commit + restore focus to the input). We resolve
        // the popper element via DOM lookup keyed on `aria-controls`
        // (which is the contentId set by the input's ARIA props above)
        // rather than reading a context ref, because React 19's compiler
        // flags `ref?.current` access from `useCallback` deps as a
        // memoization-breaking pattern. DOM lookup keeps the callback
        // fully ref-free and lets the compiler keep the manual memo intact.
        const related = event.relatedTarget as Node | null;
        if (related && contentId) {
          const popperEl = document.getElementById(contentId);
          if (popperEl && popperEl.contains(related)) return;
          // Also walk parent chain — the popper wrapper is portaled to
          // body and might match a parent of the listbox itself.
          const popperWrapper = popperEl?.parentElement ?? null;
          if (popperWrapper && popperWrapper.contains(related)) return;
        }

        // Defer the auto-commit / revert by one microtask so any in-flight
        // pointerdown → click sequence on an item commits first.
        setTimeout(() => {
          // If a commit closed the listbox + advanced state already, bail.
          // openRef is the safest signal: a successful commit closes the
          // listbox, so if it's still open we're in pure-blur territory.
          const currentSearch = searchRef.current;
          const currentValue = valueRef.current;

          // Walk the registry for an exact (case-insensitive trimmed)
          // textContent match against the typed search. We use
          // case-insensitive trim because most users don't intend "Poland "
          // vs "poland" to be different commits.
          const items = getOrderedItems();
          const trimmed = currentSearch.trim();
          const needle = trimmed.toLowerCase();
          let exact: ComboboxItemRecord | undefined;
          if (trimmed !== '') {
            for (const it of items) {
              if (it.disabled) continue;
              if (it.textContent.trim().toLowerCase() === needle) {
                exact = it;
                break;
              }
            }
          }

          if (exact) {
            selectValue(exact.value);
            // Sync search to the canonical label so casing matches.
            updateSearch(exact.textContent);
          } else if (acceptFreeText && trimmed !== '') {
            // Free-text mode: commit the typed search verbatim as the
            // value. No registry record is created — consumers using
            // free-text are typically tag inputs or "create new" flows
            // and own the persistence layer themselves.
            selectValue(trimmed);
          } else {
            // Strict mode: revert search to the current committed value's
            // label (or empty when nothing is selected). This keeps the
            // input visually consistent with `value` at rest.
            const committed = currentValue ? getItemByValue(currentValue)?.textContent ?? '' : '';
            updateSearch(committed);
          }
          if (openRef.current) setOpen(false);
        }, 0);
      },
      [
        onBlur,
        disabled,
        contentId,
        searchRef,
        valueRef,
        getOrderedItems,
        getItemByValue,
        selectValue,
        updateSearch,
        acceptFreeText,
        setOpen,
      ],
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(event);
        if (disabled) return;
        // IME composition: ignore all keydowns. The browser fires
        // `keydown`/`keyup` for IME composition keys (often with key="Process"
        // but not reliably across browsers). Treating any of them as open /
        // commit / dismiss triggers tears the composition apart. Per Phase 2
        // CB-R07.
        if (isComposingRef.current) return;
        if (event.key === 'Process' || event.keyCode === 229) return;

        // OPEN STATE — route to Content's listbox handler via the shared
        // ref slot. Single-path discipline (Select CRIT-1).
        if (open) {
          const listboxHandler = listboxKeyHandlerRef.current;
          if (listboxHandler) {
            listboxHandler(event.nativeEvent);
          }
          return;
        }

        // CLOSED STATE keyboard handling.
        const hasModifier = event.ctrlKey || event.metaKey;

        switch (event.key) {
          case 'ArrowDown':
          case 'ArrowUp': {
            if (hasModifier) return; // pass-through — browser shortcut
            event.preventDefault();
            setOpen(true);
            return;
          }
          case 'Escape': {
            // Per Phase 2 override: closed Escape clears search when
            // non-empty; otherwise no-op (lets parent Dialog handle).
            if (search !== '') {
              event.preventDefault();
              updateSearch('');
              // Don't clear value — Escape on closed input is a "narrow
              // my view back to default" gesture, not "deselect".
            }
            return;
          }
          case 'Enter': {
            // No-op when closed — let form submit bubble up. Consumers
            // who want Enter to open the listbox can stopPropagation +
            // call open() in their own handler.
            return;
          }
          default:
            return;
        }
        // Note: printable chars are NOT intercepted here — they land in
        // the input naturally and `onChange` opens the listbox via the
        // search-change path. No typeahead jump (Combobox is filter-based,
        // not jump-based unlike Select).
      },
      [
        onKeyDown,
        disabled,
        open,
        search,
        updateSearch,
        setOpen,
        listboxKeyHandlerRef,
      ],
    );

    const handleChevronMouseDown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent the input from losing focus when the chevron is clicked.
      // The blur revert logic would fire and possibly revert search before
      // the toggle click commits.
      event.preventDefault();
    }, []);

    const handleChevronClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;
        event.preventDefault();
        // Restore focus to input — opening via chevron should still leave
        // focus on the input (aria-activedescendant pattern).
        inputRef.current?.focus();
        setOpen(!open);
      },
      [disabled, open, setOpen, inputRef],
    );

    const handleClearMouseDown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      // Same focus protection as chevron — keep focus on input through clear.
      event.preventDefault();
    }, []);

    const handleClearClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;
        event.preventDefault();
        updateSearch('');
        selectValue(null);
        inputRef.current?.focus();
      },
      [disabled, updateSearch, selectValue, inputRef],
    );

    const showClearButton = !hideClear && (search !== '' || value !== null);

    const ariaProps = {
      id: inputId,
      role: 'combobox' as const,
      'aria-autocomplete': 'list' as const,
      'aria-expanded': open,
      'aria-controls': open ? contentId : undefined,
      'aria-labelledby': ariaLabelledBy,
      'aria-label': ariaLabel,
      'aria-required': required || undefined,
      'aria-disabled': disabled || undefined,
      'aria-invalid': invalid || undefined,
      // Declarative aria-activedescendant — Select Phase 5 IMP-3 inheritance.
      'aria-activedescendant': open && highlightedId ? highlightedId : undefined,
    };

    return (
      <div
        className={cn(
          styles.trigger,
          invalid && styles.triggerInvalid,
          disabled && styles.triggerDisabled,
          className,
        )}
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        data-invalid={invalid ? '' : undefined}
      >
        <input
          ref={mergedRef}
          {...ariaProps}
          type="text"
          autoComplete="off"
          spellCheck={false}
          // Always controlled — `search` is the single source of truth.
          value={search}
          placeholder={placeholder}
          className={styles.input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          {...rest}
        />
        {showClearButton ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Clear selection"
            className={styles.clearButton}
            onMouseDown={handleClearMouseDown}
            onClick={handleClearClick}
            disabled={disabled || undefined}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        ) : null}
        {!hideChevron ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={open ? 'Close suggestions' : 'Open suggestions'}
            aria-expanded={open}
            aria-controls={open ? contentId : undefined}
            className={styles.chevronButton}
            onMouseDown={handleChevronMouseDown}
            onClick={handleChevronClick}
            disabled={disabled || undefined}
          >
            <span aria-hidden="true" className={styles.chevron}>
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
        ) : null}
      </div>
    );
  },
);

// ──────────────────────────────────────────────────────────────────────────
// ComboboxContent — floating listbox surface
// ──────────────────────────────────────────────────────────────────────────

export interface ComboboxContentProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'role' | 'aria-labelledby' | 'aria-activedescendant' | 'tabIndex'
  > {
  children?: ReactNode;
  className?: string;
}

export function ComboboxContent({ children, className, ...rest }: ComboboxContentProps) {
  const ctx = useComboboxContext('<ComboboxContent>');
  const {
    open,
    setOpen,
    valueRef,
    selectValue,
    search,
    updateSearch,
    contentId,
    inputId,
    inputRef,
    getOrderedItems,
    getItemByValue,
    visibleItemIds,
    listboxKeyHandlerRef,
    acceptFreeText,
    placement,
    sideOffset,
    collisionPadding,
  } = ctx;

  const popperRef = useRef<HTMLDivElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);

  // Highlighted option id — React state per Select Phase 5 IMP-3.
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const setHighlight = useCallback(
    (nextId: string | null, source: 'mouse' | 'keyboard') => {
      setHighlightedId((prev) => {
        if (prev === nextId) return prev;
        if (nextId && source === 'keyboard') {
          // Defer scroll to after React commits the new highlight.
          const items = getOrderedItems();
          const record = items.find((it) => it.id === nextId);
          record?.element.scrollIntoView({ block: 'nearest' });
        }
        return nextId;
      });
    },
    [getOrderedItems],
  );

  // Floating positioning.
  const { refs, floatingStyles, placement: actualPlacement } = useFloating({
    open,
    placement,
    offset: sideOffset,
    padding: collisionPadding,
  });
  const { setReference, setFloating } = refs;

  // Bridge input DOM into useFloating's reference setter on open. We
  // anchor on the input wrapper (the `.trigger` div) rather than the bare
  // input so the listbox aligns to the visual bounds of the trigger box —
  // but the input ref points at the `<input>` itself for focus restoration.
  // Walk parentElement once at open-time to resolve the wrapper.
  useLayoutEffect(() => {
    if (!open) return;
    const inputNode = inputRef.current;
    const wrapper = inputNode?.parentElement ?? inputNode ?? null;
    if (wrapper) setReference(wrapper);
  }, [open, inputRef, setReference]);

  const mergedPopperRef = useCallback(
    (node: HTMLDivElement | null) => {
      popperRef.current = node;
      setFloating(node);
    },
    [setFloating],
  );

  // Dismiss — outside click only. `closeOnEscape: false` because the
  // listbox's own onKeyDown already handles Escape (intercepts it, calls
  // preventDefault, closes, restores search). Letting useFloatingDismiss
  // also handle Escape would double-handle and break nested dismiss
  // ordering (Radix #16 — nested Dialog+Combobox).
  useFloatingDismiss({
    open,
    onDismiss: () => {
      setOpen(false);
      // On outside-click dismiss, treat the gesture like a blur+revert:
      // the user clicked somewhere else, so commit-on-exact-match-or-
      // revert-to-committed-label keeps the input consistent with the
      // value field.
      const items = getOrderedItems();
      const trimmed = search.trim();
      const needle = trimmed.toLowerCase();
      let exact: ComboboxItemRecord | undefined;
      if (trimmed !== '') {
        for (const it of items) {
          if (it.disabled) continue;
          if (it.textContent.trim().toLowerCase() === needle) {
            exact = it;
            break;
          }
        }
      }
      if (exact) {
        selectValue(exact.value);
        updateSearch(exact.textContent);
      } else if (acceptFreeText && trimmed !== '') {
        selectValue(trimmed);
      } else {
        const committed = valueRef.current
          ? getItemByValue(valueRef.current)?.textContent ?? ''
          : '';
        updateSearch(committed);
      }
      // Do NOT refocus the input on outside-click — the user explicitly
      // moved focus elsewhere. Refocus would yank it back and create a
      // focus jail.
    },
    contentRef: popperRef,
    triggerRef: inputRef,
    closeOnEscape: false,
    closeOnOutsideClick: true,
    closeOnScroll: false,
  });

  // Initialize highlight on open + reset highlight on filter change.
  // Items have already registered via their own useLayoutEffect (child
  // effects commit before parent effects), so getOrderedItems() returns
  // the full list here. We seed the highlight to the current value when
  // it's still visible under the filter; otherwise the first visible
  // enabled item.
  useLayoutEffect(() => {
    if (!open) return;

    const items = getOrderedItems();
    const visible = items.filter((it) => visibleItemIds.has(it.id) && !it.disabled);
    if (visible.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- subscribe-to-external-system pattern (item registry); see Select E27 precedent
      setHighlightedId(null);
      return;
    }

    const current = valueRef.current;
    const currentRecord =
      current !== null
        ? visible.find((it) => it.value === current)
        : undefined;
    const initial = currentRecord ?? visible[0];
    if (!initial) return;

    // Lint exception per Select precedent: the item registry is an
    // imperative useRef<Map> populated by child layout effects, and the
    // parent layout effect is the earliest point where it is readable.
    // `setHighlight` is a useCallback wrapping setHighlightedId, so the
    // setState lint rule sees a function call (not a direct setter call)
    // and doesn't trip — but we still document the pattern for future
    // refactors.
    setHighlight(initial.id, 'keyboard');

    return () => {
      setHighlightedId(null);
    };
  }, [open, search, valueRef, visibleItemIds, getOrderedItems, setHighlight]);

  // Commit the currently highlighted option + close + restore focus to
  // input. Fired by Enter / Tab / item click.
  const commitHighlighted = useCallback(
    (restoreFocus = true) => {
      const currentId = highlightedId;
      if (!currentId) {
        // No highlight — Enter with acceptFreeText commits the raw search
        // as the value; otherwise no-op (just close).
        if (acceptFreeText) {
          const trimmed = search.trim();
          if (trimmed !== '') {
            selectValue(trimmed);
          }
        }
        setOpen(false);
        if (restoreFocus) inputRef.current?.focus();
        return;
      }
      const items = getOrderedItems();
      const record = items.find((it) => it.id === currentId);
      if (!record || record.disabled) {
        setOpen(false);
        if (restoreFocus) inputRef.current?.focus();
        return;
      }
      selectValue(record.value);
      updateSearch(record.textContent);
      setOpen(false);
      if (restoreFocus) inputRef.current?.focus();
    },
    [
      highlightedId,
      acceptFreeText,
      search,
      getOrderedItems,
      selectValue,
      updateSearch,
      setOpen,
      inputRef,
    ],
  );

  // Listbox keyboard handler. Accepts a minimal structural type so it can
  // be invoked from React synthetic events (Input's onKeyDown routes open-
  // state events here via `listboxKeyHandlerRef.current(event.nativeEvent)`).
  const handleListboxKeyDown = useCallback(
    (event: ComboboxKeyEvent) => {
      if (!open) return;
      const items = getOrderedItems();
      const visible = items.filter((it) => visibleItemIds.has(it.id) && !it.disabled);

      const hasModifier = event.ctrlKey || event.metaKey || event.shiftKey;
      const isAltArrowUp = event.altKey && event.key === 'ArrowUp';

      const currentId = highlightedId;
      const highlightedIndex = currentId
        ? visible.findIndex((it) => it.id === currentId)
        : -1;

      switch (event.key) {
        case 'ArrowDown': {
          // E28 Phase 5 IMP-5: Alt+ArrowDown while OPEN is a documented
          // no-op deviation from APG (which allows "show all ignoring
          // filter"). Closed-state Alt+ArrowDown still opens the listbox
          // showing all items — handled in the input's closed-state
          // keydown handler. See JSDoc @a11y section for rationale.
          if (hasModifier || event.altKey) return;
          if (visible.length === 0) {
            event.preventDefault();
            return;
          }
          event.preventDefault();
          const next = highlightedIndex < visible.length - 1 ? highlightedIndex + 1 : 0;
          const target = visible[next];
          if (target) setHighlight(target.id, 'keyboard');
          return;
        }
        case 'ArrowUp': {
          if (isAltArrowUp) {
            // Alt+ArrowUp — close without commit + revert.
            event.preventDefault();
            setOpen(false);
            const committed = valueRef.current
              ? getItemByValue(valueRef.current)?.textContent ?? ''
              : '';
            updateSearch(committed);
            inputRef.current?.focus();
            return;
          }
          if (hasModifier || event.altKey) return;
          if (visible.length === 0) {
            event.preventDefault();
            return;
          }
          event.preventDefault();
          const prev = highlightedIndex > 0 ? highlightedIndex - 1 : visible.length - 1;
          const target = visible[prev];
          if (target) setHighlight(target.id, 'keyboard');
          return;
        }
        case 'Home': {
          if (hasModifier || event.altKey) return;
          if (visible.length === 0) return;
          event.preventDefault();
          const first = visible[0];
          if (first) setHighlight(first.id, 'keyboard');
          return;
        }
        case 'End': {
          if (hasModifier || event.altKey) return;
          if (visible.length === 0) return;
          event.preventDefault();
          const last = visible[visible.length - 1];
          if (last) setHighlight(last.id, 'keyboard');
          return;
        }
        case 'PageDown': {
          if (hasModifier || event.altKey) return;
          if (visible.length === 0) return;
          event.preventDefault();
          const next = Math.min(
            visible.length - 1,
            (highlightedIndex < 0 ? 0 : highlightedIndex) + 10,
          );
          const target = visible[next];
          if (target) setHighlight(target.id, 'keyboard');
          return;
        }
        case 'PageUp': {
          if (hasModifier || event.altKey) return;
          if (visible.length === 0) return;
          event.preventDefault();
          const prev = Math.max(
            0,
            (highlightedIndex < 0 ? 0 : highlightedIndex) - 10,
          );
          const target = visible[prev];
          if (target) setHighlight(target.id, 'keyboard');
          return;
        }
        case 'Enter': {
          if (hasModifier || event.altKey) return;
          // Enter with highlight → commit. Without highlight + acceptFreeText
          // → commit raw search. Otherwise no-op — but still preventDefault
          // (E28 Phase 5 IMP-1): when the listbox is visibly open with zero
          // matches, the user pressing Enter does not expect a parent form
          // submit to fire. We preventDefault + keep the listbox open so the
          // user can refine their search (ComboboxEmpty remains visible).
          if (visible.length > 0 || acceptFreeText) {
            event.preventDefault();
            commitHighlighted();
          } else {
            // Empty visible list + no acceptFreeText: preventDefault to
            // suppress form submit while the listbox is open. Do NOT close —
            // let the user keep typing to refine search.
            event.preventDefault();
          }
          return;
        }
        case 'Escape': {
          // Per Phase 2 override: open Escape → close + revert search to
          // current value's label. preventDefault so parent dismiss
          // listeners (e.g. parent Dialog) don't also fire — single source
          // of truth for Escape inside the listbox (matches Select).
          event.preventDefault();
          const committed = valueRef.current
            ? getItemByValue(valueRef.current)?.textContent ?? ''
            : '';
          updateSearch(committed);
          setOpen(false);
          inputRef.current?.focus();
          return;
        }
        case 'Tab': {
          // Commit highlighted + close + let Tab propagate. restoreFocus
          // is `false` so the browser's Tab focus advancement is not
          // cancelled by a .focus() call on the input (Select Phase 5
          // CRIT-2). When no highlight, just close without commit.
          if (highlightedId) {
            commitHighlighted(false);
          } else {
            setOpen(false);
          }
          return;
        }
        default:
          break;
      }
      // Printable chars are NOT intercepted here — they land in the input
      // via the input's own onChange handler and re-trigger filter +
      // visibility computation. No typeahead jump (Combobox is filter-
      // based, not jump-based).
    },
    [
      open,
      highlightedId,
      visibleItemIds,
      getOrderedItems,
      getItemByValue,
      valueRef,
      updateSearch,
      setOpen,
      setHighlight,
      inputRef,
      commitHighlighted,
      acceptFreeText,
    ],
  );

  // Publish the listbox key handler into the slot on root context so the
  // input's React onKeyDown can route open-state events to it. Single
  // event path — no native addEventListener bridge (Select Phase 5 CRIT-1).
  useLayoutEffect(() => {
    listboxKeyHandlerRef.current = handleListboxKeyDown;
    return () => {
      listboxKeyHandlerRef.current = null;
    };
  }, [handleListboxKeyDown, listboxKeyHandlerRef]);

  // Stable cleanup on unmount — no typeahead timer to clear (unlike
  // Select), but kept symmetric with Select for any future cleanup hooks.
  useEffect(() => {
    return () => {
      // Reserved for future cleanup.
    };
  }, []);

  const contentContextValue = useMemo<ComboboxContentContextValue>(
    () => ({ highlightedId, setHighlight, popperRef }),
    [highlightedId, setHighlight],
  );

  if (!open) return null;

  return (
    <ComboboxContentContext.Provider value={contentContextValue}>
      <FloatingPortal>
        <div
          ref={mergedPopperRef}
          className={styles.contentRoot}
          style={floatingStyles}
        >
          <div
            ref={listboxRef}
            id={contentId}
            role="listbox"
            aria-labelledby={inputId}
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
    </ComboboxContentContext.Provider>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// ComboboxGroup — role="group" wrapper that pipes a generated label id to
// nested ComboboxLabel via context
// ──────────────────────────────────────────────────────────────────────────

interface ComboboxGroupContextValue {
  labelId: string;
}
const [ComboboxGroupContextProvider, useComboboxGroupContext] =
  createFloatingContext<ComboboxGroupContextValue>('ComboboxGroup');

export interface ComboboxGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function ComboboxGroup({ children, className, ...rest }: ComboboxGroupProps) {
  const reactId = useId();
  const labelId = `${reactId}-label`;
  const value = useMemo<ComboboxGroupContextValue>(() => ({ labelId }), [labelId]);

  return (
    <ComboboxGroupContextProvider value={value}>
      <div
        role="group"
        aria-labelledby={labelId}
        className={cn(styles.group, className)}
        {...rest}
      >
        {children}
      </div>
    </ComboboxGroupContextProvider>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// ComboboxLabel — non-interactive section header inside a group
// ──────────────────────────────────────────────────────────────────────────

export interface ComboboxLabelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function ComboboxLabel({ children, className, id, ...rest }: ComboboxLabelProps) {
  const ctx = useComboboxGroupContext('<ComboboxLabel>');
  // Plain `<div>` — no role. The group's `aria-labelledby` resolves the
  // accessible name via this div's text content; announcing the label as
  // a separate listbox child would confuse virtual cursor traversal.
  // Inherited from Select Phase 5 IMP-4.
  return (
    <div
      id={id ?? ctx.labelId}
      className={cn(styles.label, className)}
      {...rest}
    >
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// ComboboxItem — role="option" with registry hookup + visibility filter +
// mouse + click handlers
// ──────────────────────────────────────────────────────────────────────────

/**
 * Derive plain-text content from React children without depending on DOM.
 * Used by ComboboxItem to compute the registry `textContent` so items that
 * mount while hidden (returning the display:none sentinel) still register
 * with the correct text — the hidden sentinel's `element.textContent` would
 * otherwise be empty, breaking filter matches and blur exact-match lookup
 * for items that became visible later. Per E28 Phase 5 IMP-2.
 *
 * Recurses through arrays + single-child React elements. Falls back to '' for
 * unhandled shapes (booleans, null, functions) — consumers whose children
 * contain nested JSX with dynamic text MUST pass `textValue` explicitly.
 */
function deriveTextFromChildren(children: ReactNode): string {
  if (children == null || typeof children === 'boolean') return '';
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) {
    return children.map((c) => deriveTextFromChildren(c as ReactNode)).join('');
  }
  if (typeof children === 'object' && 'props' in children) {
    const props = (children as { props?: { children?: ReactNode } }).props;
    if (props && typeof props.children !== 'undefined') {
      return deriveTextFromChildren(props.children);
    }
  }
  return '';
}

export interface ComboboxItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'aria-selected' | 'aria-disabled'> {
  /** Stable option value — written to form state + onValueChange on commit. */
  value: string;
  /** Disabled — skipped by arrow nav + click. */
  disabled?: boolean;
  /**
   * Override text used for filter matching + commit-time label sync.
   * When omitted, the item's text is derived from `children` via
   * `deriveTextFromChildren` (not from DOM). Set this when the children
   * contain dynamic JSX whose text cannot be statically derived (e.g. a
   * translated `<Trans>` element or a memoized span with live data).
   */
  textValue?: string;
  children: ReactNode;
  className?: string;
}

function ComboboxItemImpl({
  value,
  disabled = false,
  textValue,
  children,
  className,
  onMouseMove,
  onMouseDown,
  onClick,
  ...rest
}: ComboboxItemProps) {
  const ctx = useComboboxContext('<ComboboxItem>');
  const {
    value: selectedValue,
    selectValue,
    updateSearch,
    setOpen,
    registerItem,
    unregisterItem,
    visibleItemIds,
    inputRef,
  } = ctx;
  const contentCtx = useRequiredComboboxContentContext('<ComboboxItem>');
  const { highlightedId, setHighlight } = contentCtx;

  const reactId = useId();
  const itemId = `${reactId}-option`;
  const elementRef = useRef<HTMLDivElement | null>(null);

  const isSelected = selectedValue === value;
  const isHighlighted = highlightedId === itemId;

  // Register with root on mount, unregister on unmount. Re-register when
  // value / disabled / textValue / children change so the registry record
  // stays fresh. Text is derived from `children` (React), not from DOM, so
  // items that mount while hidden (display:none sentinel) still register
  // with the correct text — DOM-based reads would yield '' for hidden items
  // and break filter match + blur exact-match lookup when they later become
  // visible. Per E28 Phase 5 IMP-2.
  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const resolvedText = (textValue ?? deriveTextFromChildren(children)).trim();
    registerItem(itemId, {
      id: itemId,
      element,
      value,
      textContent: resolvedText,
      disabled,
    });
    return () => unregisterItem(itemId);
  }, [itemId, value, disabled, textValue, children, registerItem, unregisterItem]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onMouseMove?.(event);
      if (disabled) return;
      if (!isHighlighted) {
        setHighlight(itemId, 'mouse');
      }
    },
    [disabled, isHighlighted, itemId, setHighlight, onMouseMove],
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onMouseDown?.(event);
      // Prevent the input from losing focus — focus must stay on the input
      // under the aria-activedescendant pattern, and the deferred blur
      // revert would otherwise race with the click commit.
      event.preventDefault();
    },
    [onMouseDown],
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      if (disabled) return;
      const element = elementRef.current;
      const label = textValue ?? element?.textContent ?? '';
      selectValue(value);
      updateSearch(label);
      setOpen(false);
      inputRef.current?.focus();
    },
    [disabled, value, textValue, selectValue, updateSearch, setOpen, inputRef, onClick],
  );

  // Visibility filter — when this item's id is not in the visible set
  // (failing the filter predicate), return null entirely. Item still
  // registers via the layout effect above so the filter can find it
  // when the search changes — registration must run regardless of
  // visibility, which is why we register first and short-circuit render
  // second.
  //
  // To make registration run even when invisible, we need a stable DOM
  // node. We render an invisible sentinel <div> with display:none in that
  // case so `elementRef.current` is non-null and `compareDocumentPosition`
  // ordering still works against siblings.
  const isVisible = visibleItemIds.has(itemId);

  if (!isVisible) {
    return (
      <div
        ref={elementRef}
        data-combobox-hidden=""
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      ref={elementRef}
      id={itemId}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      data-state={isSelected ? 'checked' : 'unchecked'}
      data-highlighted={isHighlighted ? '' : undefined}
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
 * ComboboxItem is wrapped in `React.memo` so moving the highlight re-renders
 * only the two items actually toggled (the previously highlighted one and
 * the newly highlighted one), not the whole option list. Visibility changes
 * still re-render the affected item because `visibleItemIds` (a Set
 * reference) changes on every filter recompute — that's intentional, since
 * appearing / disappearing items must reconcile their DOM presence.
 */
export const ComboboxItem = memo(ComboboxItemImpl);
ComboboxItem.displayName = 'ComboboxItem';

// ──────────────────────────────────────────────────────────────────────────
// ComboboxEmpty — "no results" message, rendered when filter matches zero
// ──────────────────────────────────────────────────────────────────────────

export interface ComboboxEmptyProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export function ComboboxEmpty({ children, className, ...rest }: ComboboxEmptyProps) {
  const ctx = useComboboxContext('<ComboboxEmpty>');
  const { matchCount } = ctx;
  if (matchCount > 0) return null;
  // role="presentation" — purely visual fallback message, AT virtual cursor
  // skips it and reads the input's own state instead. Consumers who want
  // the message announced can wrap it in their own live region.
  return (
    <div role="presentation" className={cn(styles.empty, className)} {...rest}>
      {children ?? 'No results.'}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// ComboboxSeparator — decorative divider, not focusable, not selectable
// ──────────────────────────────────────────────────────────────────────────

export interface ComboboxSeparatorProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function ComboboxSeparator({ className, ...rest }: ComboboxSeparatorProps) {
  // role="none" — WAI-ARIA restricts listbox children to `option`/`group`.
  // Inherited from Select Phase 5 IMP-5.
  return <div role="none" className={cn(styles.separator, className)} {...rest} />;
}
