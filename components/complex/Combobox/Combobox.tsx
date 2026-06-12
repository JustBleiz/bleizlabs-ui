'use client';

/**
 * Combobox — editable single-OR-multi-select form field per WAI-ARIA APG
 * /combobox/ (editable listbox variant) + /listbox/ multi-selectable
 * extension. Pattern-child of Select (E27, CI12) — extends the collapsed-
 * listbox-with-typeahead model into a fully editable text input whose value
 * drives a live-filtered listbox of suggestions.
 *
 * Single vs multi mode (E07.12 0.15.0 AMEND, 2026-05-10):
 *   `multiple={false}` (default): value is `string | null`, picking an item
 *   replaces the value, closes the listbox, and syncs the input to the
 *   committed label. Strict select-from-list with `acceptFreeText` opt-in.
 *
 *   `multiple={true}`: value is `string[]` (set semantics, input order),
 *   picking an item TOGGLES it in/out of the array, the listbox STAYS OPEN,
 *   and the search clears so the user can pick the next option immediately.
 *   Selected values render as inline chips left of the input — Backspace on
 *   empty input removes the last chip (standard tag-input gesture). Hidden
 *   form input renders one per selected value (FormData multi-value
 *   serialization — `formData.getAll(name)` on the server).
 *
 *   Discriminated union via the `multiple` flag enforces correct value/
 *   defaultValue/onValueChange types at compile time — `multiple={true}`
 *   requires `value: string[]` and emits `onValueChange(values: string[])`.
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
 *   `useFloatingDismiss` + `FloatingPortal`. **Skipped** `useFloatingFocus` —
 *   focus stays on the editable input (the trigger IS the input under the
 *   APG editable-combobox pattern), so there is no focus target inside the
 *   listbox to move to. Highlight is exposed via `aria-activedescendant` on
 *   the input.
 *
 *   Value state is managed inline (NOT via `useFloatingValueState` — that
 *   shared single-value hook was removed from this file in E07.12 when
 *   multi-select support was added). Selection is canonically a `string[]`
 *   regardless of mode: single mode uses a 0-or-1-element array internally
 *   and exposes the first element as `string | null` for backward
 *   compatibility; multi mode exposes the full array. The dual-mode
 *   discriminated union, the toggle-vs-replace branching in `selectValue`,
 *   and FormData multi-value serialization made the shared single-value
 *   hook a poor fit. The `latestValueRef` pattern is preserved here as
 *   `valuesRef` with the same identity-guard semantics: `applySelection`
 *   no-ops when the next array equals the current one (length + values).
 *   Search state (`string`, never null) stays inline.
 *
 * @a11y APG /combobox/ editable-listbox + /listbox/:
 *   Input: `role="combobox"` + `aria-autocomplete="list"` + `aria-expanded` +
 *   `aria-controls` (when open) + `aria-activedescendant` (points at the
 *   highlighted option id while open — focus STAYS on the input the entire
 *   time). `aria-required` + `aria-invalid` propagate from props. `aria-disabled`
 *   is used (NOT the native `disabled` attribute) so AT users can discover
 *   the field even when it is non-interactive — same precedent as Select
 *   (E27), NavigationMenu (E25), Tabs (E26). Listbox: `role="listbox"` +
 *   `aria-labelledby={inputId}` + `aria-multiselectable` (explicit — set to
 *   `false` in single mode per Select Phase 5 IMP-2, set to `true` in
 *   multi mode per APG /listbox/ multi-selectable extension). Items:
 *   `role="option"` + `aria-selected` (reflects per-value selected state in
 *   both modes) + `aria-disabled` when disabled. Groups: `role="group" aria-labelledby`
 *   pointing at a nested ComboboxLabel id. Label: plain `<div>` with id (no
 *   role) — the group's `aria-labelledby` resolves the accessible name via
 *   the label's text content without announcing the label as a separate
 *   listbox item. Separator: `role="none"` — WAI-ARIA restricts listbox
 *   children to `option`/`group`. Empty: `role="presentation"` — purely
 *   visual "no results" message; AT users hear the count (including
 *   "0 results") from the built-in debounced sr-only `role="status"`
 *   announcer rendered by the root (E03 audit fix; `resultsAnnouncement`
 *   prop for i18n). The clear button is a native `<button>` with
 *   `aria-label="Clear selection"`.
 *
 *   Keyboard model (APG editable-combobox + Phase 2 overrides):
 *   Input — closed:
 *   - ArrowDown / Alt+ArrowDown / ArrowUp / Alt+ArrowUp: open listbox (no
 *     commit), seed highlight to current value (or first enabled item).
 *     The current search filter still applies in all four variants.
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
 *     `acceptFreeText` AND no highlight, commit the trimmed search as the
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
 *     value is marginal (user can simply clear the input to see all
 *     items). Implementing the filter-bypass flag +
 *     reset-on-next-keystroke logic was judged not worth the complexity
 *     for this edge case. Closed-state Alt+ArrowDown opens the listbox
 *     like plain ArrowDown — the current search filter still applies
 *     (no filter bypass in either state).
 *   - Tab/Shift+Tab: commit highlighted + close + let Tab propagate. When
 *     no highlight, just close — Tab still moves focus to the next field.
 *
 *   Multi-mode keyboard overrides (E07.12 — `multiple={true}` only):
 *   - Space (open): TOGGLE highlighted option in selection array, KEEP
 *     listbox open, CLEAR search for the next pick. APG /listbox/
 *     multi-selectable simple model. preventDefault so the literal space
 *     character does NOT also land in the search filter. (Single mode:
 *     Space is NOT intercepted — falls through as a literal space char in
 *     the filter, since combobox is filter-based.)
 *   - Enter (open, with highlight): TOGGLE highlighted (NOT commit-and-
 *     close as in single mode) — listbox stays open, search clears.
 *     Without highlight + acceptFreeText: append trimmed search to
 *     selection, listbox stays open, search clears.
 *   - Tab (open): close + clear search; do NOT toggle highlighted. In
 *     multi mode Tab is "I'm done picking", not "commit". Selections
 *     persist as chips.
 *   - Escape (open): close + clear search; selections persist (chips
 *     remain). No revert-to-committed-label since there is no single
 *     committed label in multi mode.
 *   - Backspace (input value empty, any open state, no modifiers): remove
 *     LAST selected chip — standard tag-input gesture (Gmail recipients,
 *     GitHub topics, Slack channels). When the input is non-empty,
 *     Backspace edits the search character normally.
 *
 *   Multi-mode mouse:
 *   - Click on item: TOGGLE in selection array, KEEP listbox open, CLEAR
 *     search, restore focus to input.
 *   - Click on chip × button: remove that single value, restore focus to
 *     input. (× is `tabIndex={-1}` so Tab order stays input-only.)
 *   - Click on clear-all button (×): clear ALL selections + clear search
 *     in both modes. Visibility differs by mode — see clear button rules
 *     in ComboboxInput.
 *
 *   Mouse: pointermove on item highlights (hover syncs the keyboard
 *   highlight); click on item commits + closes (single) or toggles + keeps
 *   open (multi); click on chevron toggles open; click on clear button
 *   clears search + value(s); click on input does NOT toggle (matches
 *   Radix — typing/arrow opens, click to focus only).
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
 *   `aria-activedescendant` (Select Phase 5 IMP-3 inheritance, hoisted in
 *   E142 L4 F1) is declarative React state owned by the ROOT context
 *   (`highlightedId` — ComboboxInput sits OUTSIDE ComboboxContent in the
 *   render tree, so a Content-scoped provider could never reach it).
 *   ComboboxInput reads it from the root context and reconciles it onto
 *   the DOM on every render so React cannot strip the attribute by
 *   re-rendering with other ARIA props. ComboboxItem is wrapped in
 *   `React.memo` to shield items from consumer parent-prop churn ONLY —
 *   highlight moves change the root context identity and context updates
 *   bypass memo, so all mounted items re-render per move (see the memo
 *   JSDoc above ComboboxItem).
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
 *     shadcn / cmdk precedent — typing "an" reveals "Canada", "Finland",
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
 *   mismatch; SINGLE mode only): when the input loses focus, schedule a
 *   microtask check — if the current search exactly matches a registered
 *   item's textValue, commit that item's value. Otherwise revert search to
 *   the current committed value's label (or empty when no value). The
 *   microtask delay lets a click-on-item commit first, and we additionally
 *   check `relatedTarget` against the popper element so clicks inside the
 *   listbox skip the blur logic entirely. MULTI mode opts out of strategy
 *   A entirely: blur just clears the search and closes — no auto-commit,
 *   no revert (selections persist as chips; there is no single committed
 *   label to revert to).
 *
 *   `acceptFreeText` (Phase 2 explicit opt-in): default `false`. When
 *   `true`, Enter (with no highlight) commits the trimmed search string as
 *   the value, and on blur the mismatch branch commits the trimmed search
 *   instead of reverting (the blur path does not consult the highlight).
 *   Use this for "tag input" / "create new" patterns. Default off keeps
 *   the contract strict (Combobox is a select-from-list field by default).
 *
 *   Form participation: when the `name` prop is provided, Combobox renders
 *   hidden `<input type="hidden">` element(s) synced with the current
 *   value(s). Single mode: ONE hidden input (preserves backward-compat —
 *   always rendered, value is empty string when no selection so native
 *   `required` validation can fail on empty submit). Multi mode: ONE
 *   hidden input PER selected value, all sharing the same `name` (FormData
 *   multi-value — server reads via `formData.getAll(name)`); when zero
 *   selections AND `required`, a single empty-value hidden input is
 *   rendered as a validation guard so `required` fires on empty submit;
 *   when zero selections AND NOT `required`, no hidden input is rendered.
 *   `disabled` propagates to all hidden inputs.
 *
 * @apg https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y via eslint-config-next ✓ |
 *   Playwright suite EXECUTED in-repo (keyboard/focus/aria/regression
 *   `.spec.ts` quad + multi-mode suite, CI-gated; incl. AxeBuilder sweep)
 *   + axe-core smoke on the demo route. DEFERRED: manual NVDA / VoiceOver
 *   / JAWS sweep, iOS / Android device testing.
 * @regressions tests/Combobox.{keyboard,focus,aria,regression}.spec.md —
 *   the original 28-case mapping came from an ephemeral `_tmp` spec draft
 *   (since retired; the per-case content in the tests/ quad is the canon).
 *   Implemented: CB-R02 SSR, CB-R03 filter race, CB-R06 blur commit,
 *   CB-R07 IME composition guard, CB-R16 SSR portal, CB-R17 Escape bubble
 *   + CB-R18..R21 (E03 audit remediation: filtered-result-count announcer).
 * @example
 *   // Single-select (default)
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
 *
 * @example
 *   // Multi-select — picking toggles, listbox stays open, search clears,
 *   // selected values render as chips left of the input. Backspace on
 *   // empty input removes the last chip.
 *   <Combobox
 *     multiple
 *     name="tags"
 *     defaultValue={['design', 'a11y']}
 *     onValueChange={(values) => setTags(values)}
 *   >
 *     <ComboboxInput placeholder="Add tags..." aria-label="Tags" />
 *     <ComboboxContent>
 *       <ComboboxItem value="design">Design</ComboboxItem>
 *       <ComboboxItem value="a11y">Accessibility</ComboboxItem>
 *       <ComboboxItem value="perf">Performance</ComboboxItem>
 *       <ComboboxItem value="security">Security</ComboboxItem>
 *       <ComboboxEmpty>No matching tag.</ComboboxEmpty>
 *     </ComboboxContent>
 *   </Combobox>
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
  useFloatingDismiss,
  FloatingPortal,
} from '../../utils/floating';
import { VisuallyHidden } from '../../utils/VisuallyHidden';
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
  /**
   * Multi-select mode flag. When `true`, item clicks toggle selection
   * (instead of replace), the listbox stays open after a pick, the search
   * clears, and the input renders selected values as inline chips. Selected
   * state lives in `selectedValues` (canonical) — `value` is always `null`
   * in multi mode and MUST NOT be read.
   */
  multiple: boolean;
  /**
   * Single-mode committed value (null when empty). Always `null` in multi
   * mode — read `selectedValues` instead. Read-only — use `selectValue()`
   * to mutate.
   */
  value: string | null;
  /**
   * Live ref mirror of `value` — used inside callbacks that should not
   * re-memoize on every value change (e.g. blur revert). Readers should
   * use `valueRef.current`, never the memoized `value`. Always `null` in
   * multi mode.
   */
  valueRef: MutableRefObject<string | null>;
  /** Canonical selection state — works in both modes. */
  selectedValues: string[];
  /**
   * Live ref mirror of `selectedValues` — used inside callbacks that
   * should not re-memoize on every selection change (e.g. Backspace-on-
   * empty handler, blur logic).
   */
  valuesRef: MutableRefObject<string[]>;
  /**
   * Test whether a given value is currently selected. Unified API for items
   * that drives `aria-selected` + visual indicator regardless of mode.
   */
  isSelected: (value: string) => boolean;
  /**
   * Commit a value — single mode REPLACES, multi mode TOGGLES. Pass `null`
   * to clear ALL selections in either mode (× button).
   */
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
   * Cache-aware label lookup — prefers live registry, falls back to the
   * persistent label cache so ComboboxInput keeps the selected label
   * visible after the listbox closes and items unmount. E136 bug 5.
   */
  getLabelByValue: (value: string | null) => string | undefined;
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
  /**
   * Highlighted option id — root-owned React state. Hoisted from the former
   * ComboboxContentContext provider (which sat inside FloatingPortal —
   * sibling of ComboboxInput, unreachable via React context propagation).
   * Both ComboboxInput (reads to wire `aria-activedescendant`) and
   * ComboboxContent (reads for navigation) consume it from the root
   * context. E142 L4 F1 fix — restores WCAG SC 4.1.3.
   */
  highlightedId: string | null;
  /** Request a highlight change. `source` selects scroll behavior. */
  setHighlight: (id: string | null, source: 'mouse' | 'keyboard') => void;
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
// Combobox root — state holder, item registry, filter logic, context provider
// ──────────────────────────────────────────────────────────────────────────

/**
 * Shared props for both single-select and multi-select modes. The `multiple`
 * flag in the discriminated union below selects which value/defaultValue/
 * onValueChange shape applies.
 */
/**
 * Default EN announcement for the filtered-result-count live region —
 * module-level constant so the debounce effect's identity stays stable.
 */
const DEFAULT_RESULTS_ANNOUNCEMENT = (count: number) =>
  count === 1 ? '1 result' : `${count} results`;

interface ComboboxBaseProps {
  /** ComboboxOption / ComboboxGroup children rendered inside the listbox. */
  children: ReactNode;
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
   * When `true`, Enter (without an active highlight) commits the trimmed
   * search text as the value, and blur accepts the trimmed search as a
   * value when no exact item match is found. Default `false` (strict
   * select-from-list). Multi-mode note: in `multiple={true}` mode,
   * free-text Enter appends the trimmed search to the selected array
   * (deduplicated).
   */
  acceptFreeText?: boolean;
  /**
   * Form field name. When provided, Combobox renders hidden `<input>`(s)
   * synced with the current value(s) so native form submission + FormData
   * serialization work. In single mode: one hidden input with the current
   * value. In multi mode: one hidden input per selected value, all sharing
   * the same name (FormData multi-value — `formData.getAll(name)` on the
   * server). `required` + `disabled` propagate to the hidden input(s).
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
  /**
   * i18n — builds the screen-reader announcement for the current filtered
   * result count (debounced 300ms, announced via the built-in sr-only
   * `role="status"` region while the listbox is open; WCAG 4.1.3).
   * Function-shaped so non-EN plural forms work (DataTableLabels precedent).
   * Pass a STABLE function (module-level or memoized) — an inline arrow
   * re-arms the debounce per render (harmless, but wasteful). Async
   * `filter` consumers: the count tracks registered+visible items, so
   * stale items kept mounted during a fetch announce transiently.
   * Default EN: `(n) => (n === 1 ? '1 result' : `${n} results`)`.
   */
  resultsAnnouncement?: (count: number) => string;
}

/**
 * Single-select mode (`multiple={false}` or omitted) — current default
 * shape preserved for backward compatibility.
 */
export interface ComboboxSingleProps extends ComboboxBaseProps {
  /** Single-select mode. Default. */
  multiple?: false;
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
}

/**
 * Multi-select mode (`multiple={true}`) — value/defaultValue/onValueChange
 * narrow to `string[]` so consumer wiring is type-safe at compile time.
 * Picking an item TOGGLES it in/out of the array, the listbox stays open,
 * and the search clears for the next pick.
 */
export interface ComboboxMultiProps extends ComboboxBaseProps {
  /** Multi-select mode. */
  multiple: true;
  /** Controlled values array. Set semantics — duplicates ignored. */
  value?: string[];
  /** Uncontrolled initial values. Default `[]`. */
  defaultValue?: string[];
  /** Fires on every selection change — receives the full updated array. */
  onValueChange?: (values: string[]) => void;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultiProps;

export function Combobox(props: ComboboxProps) {
  const {
    children,
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
    resultsAnnouncement = DEFAULT_RESULTS_ANNOUNCEMENT,
  } = props;
  const multiple = props.multiple === true;

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

  // ────────────────────────────────────────────────────────────────────────
  // Unified selection state — internally always `string[]`, externally
  // discriminated via `multiple` flag.
  //
  // Single mode:  external value is `string | null`        ↔  internal `[]` or `[v]`
  // Multi mode:   external value is `string[]`             ↔  internal same array
  //
  // Internal canonical state is `selectedValues: string[]`. Order = pick
  // sequence (multi) or single-element (single). Set semantics enforced via
  // dedup on every mutation. The `valueRef` mirror is consumed by callbacks
  // that need the latest committed selection without re-memoizing.
  // ────────────────────────────────────────────────────────────────────────

  const isValueControlled = props.value !== undefined;

  const externalToArray = useCallback((next: string | string[] | null | undefined): string[] => {
    if (next == null) return [];
    if (Array.isArray(next)) return Array.from(new Set(next));
    return [next];
  }, []);

  // Initial uncontrolled state — derive from defaultValue depending on mode.
  const initialUncontrolled = useMemo<string[]>(() => {
    if (multiple) {
      const dv = (props as ComboboxMultiProps).defaultValue;
      return Array.isArray(dv) ? Array.from(new Set(dv)) : [];
    }
    const dv = (props as ComboboxSingleProps).defaultValue;
    return typeof dv === 'string' ? [dv] : [];
    // Initial state — intentionally only computed once; later prop changes
    // are reflected via the controlled-value branch below, not via
    // re-derivation of uncontrolled initial state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [uncontrolledValues, setUncontrolledValues] = useState<string[]>(initialUncontrolled);

  // Resolved selection — controlled value wins when present.
  const selectedValues: string[] = useMemo(() => {
    if (!isValueControlled) return uncontrolledValues;
    return externalToArray(props.value);
  }, [isValueControlled, props.value, uncontrolledValues, externalToArray]);

  // Live ref mirror — read by callbacks that should not re-memoize.
  const valuesRef = useRef<string[]>(selectedValues);
  useLayoutEffect(() => {
    valuesRef.current = selectedValues;
  });

  // Stable onValueChange dispatcher — branches on mode to fire the correct
  // signature. `props` is read from a ref so the dispatcher identity stays
  // stable across renders (avoiding context churn that would re-register
  // every ComboboxItem on every parent render).
  const propsRef = useRef(props);
  useLayoutEffect(() => {
    propsRef.current = props;
  });

  const fireChange = useCallback((nextArray: string[]) => {
    const current = propsRef.current;
    if (current.multiple === true) {
      current.onValueChange?.(nextArray);
    } else {
      // Single mode emits string only on non-empty commit (mirrors Radix +
      // Select — null transitions are observable via controlled `value`).
      const first = nextArray[0];
      if (first !== undefined) current.onValueChange?.(first);
    }
  }, []);

  // Apply a new selection array. Dedupes, no-ops on identity, syncs
  // uncontrolled state, fires onValueChange.
  const applySelection = useCallback(
    (nextArrayRaw: string[]) => {
      const nextArray = Array.from(new Set(nextArrayRaw));
      const prev = valuesRef.current;
      // Identity guard — same length + same values in same order.
      if (prev.length === nextArray.length && prev.every((v, i) => v === nextArray[i])) {
        return;
      }
      if (!isValueControlled) setUncontrolledValues(nextArray);
      fireChange(nextArray);
    },
    [isValueControlled, fireChange],
  );

  // selectValue — mode-aware: single replaces, multi toggles. Used by item
  // clicks + Enter commit + free-text commit. Both modes accept a `string`
  // value; in multi mode passing an existing value REMOVES it (toggle),
  // passing a new value APPENDS it.
  const selectValue = useCallback(
    (next: string | null) => {
      const current = valuesRef.current;
      if (next === null) {
        // Clear-all gesture (× button). Works in both modes.
        if (current.length === 0) return;
        applySelection([]);
        return;
      }
      if (propsRef.current.multiple === true) {
        // Toggle semantics: remove if present, append if not.
        if (current.includes(next)) {
          applySelection(current.filter((v) => v !== next));
        } else {
          applySelection([...current, next]);
        }
      } else {
        // Single mode: replace.
        applySelection([next]);
      }
    },
    [applySelection],
  );

  // Backward-compat single-mode shape — context exposes `value: string | null`
  // for code paths that haven't been migrated to `selectedValues`. In multi
  // mode `value` is always null (multi consumers MUST read `selectedValues`).
  const value: string | null = multiple ? null : (selectedValues[0] ?? null);
  const valueRef = useRef<string | null>(value);
  useLayoutEffect(() => {
    valueRef.current = value;
  });

  // isSelected — unified API that works in both modes. Items use this to
  // drive aria-selected + visual checkmark indicator.
  const isSelected = useCallback((target: string) => {
    return valuesRef.current.includes(target);
  }, []);

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
  // Label cache — survives ComboboxContent unmount so ComboboxInput keeps
  // reading the display label ("France") after the user picks an option
  // and the listbox closes, dropping live item registrations. Writes on
  // register only; unregister never evicts so the cache persists across
  // open/close cycles. E136 bug 5 — matches Select's fix for bug 3 (same
  // unmount-on-close pattern shared by all listbox-family components).
  const labelCacheRef = useRef<Map<string, string>>(new Map());
  const [registryVersion, setRegistryVersion] = useState(0);

  const registerItem = useCallback((key: string, record: ComboboxItemRecord) => {
    itemsRef.current.set(key, record);
    labelCacheRef.current.set(record.value, record.textContent);
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

  const getItemByValue = useCallback((target: string | null): ComboboxItemRecord | undefined => {
    if (target === null) return undefined;
    for (const record of itemsRef.current.values()) {
      if (record.value === target) return record;
    }
    return undefined;
  }, []);

  // Cache-aware label lookup — prefer live registry, fall back to
  // labelCacheRef when items have unmounted (closed listbox). Every
  // ComboboxInput display-value branch reads via this helper instead of
  // inlining `getItemByValue(x)?.textContent ?? ''`.
  const getLabelByValue = useCallback((target: string | null): string | undefined => {
    if (target === null) return undefined;
    for (const record of itemsRef.current.values()) {
      if (record.value === target) return record.textContent;
    }
    return labelCacheRef.current.get(target);
  }, []);

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
  // Finland, Andorra, Japan).
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
        visible = items.filter((it) => it.textContent.toLowerCase().includes(needle));
      }
    } else {
      visible = filter(items, search);
    }
    const nextSet = new Set<string>();
    for (const it of visible) nextSet.add(it.id);
    setVisibleItemIds(nextSet);
    setMatchCount(visible.length);
  }, [search, registryVersion, filter, getOrderedItems]);

  // Slot that ComboboxContent publishes on mount — Input's React onKeyDown
  // reads this to route open-state keys to the listbox handler. Single-path
  // event handler discipline inherited from Select Phase 5 CRIT-1.
  const listboxKeyHandlerRef = useRef<((event: ComboboxKeyEvent) => void) | null>(null);

  // Highlighted option id — root-owned state so both ComboboxInput (sits
  // OUTSIDE ComboboxContent in the render tree, sibling of FloatingPortal)
  // and ComboboxContent can consume it. Prior to E142 L4 F1 this state was
  // owned by ComboboxContentContext — but that provider wrapped the portal
  // subtree, so the input's `useContext` always read `null` and
  // `aria-activedescendant` was silently undefined (WCAG SC 4.1.3 fail).
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const setHighlight = useCallback((nextId: string | null, source: 'mouse' | 'keyboard') => {
    setHighlightedId((prev) => {
      if (prev === nextId) return prev;
      if (nextId && source === 'keyboard') {
        const items = itemsRef.current;
        // Look up the record via the Map directly — getOrderedItems
        // recomputes DOM order on every call; for highlight-scroll we
        // only need the element reference, so walk the Map values.
        for (const record of items.values()) {
          if (record.id === nextId) {
            record.element.scrollIntoView({ block: 'nearest' });
            break;
          }
        }
      }
      return nextId;
    });
  }, []);

  // WCAG 4.1.3 Status Messages — debounced filtered-result-count announcer
  // (E03 audit fix; the component's own NVDA sweep expected it). DataTable
  // precedent: 300ms debounce + role="status" + function-shaped i18n label.
  // Announces only while the listbox is OPEN (typing auto-opens); closing
  // clears the text, which also silences the post-commit "1 result" echo
  // and mid-IME composition states. Root-local state — deliberately NOT in
  // contextValue, so announcer ticks never re-render items.
  const [announcement, setAnnouncement] = useState('');
  useEffect(() => {
    if (!open) {
      setAnnouncement('');
      return;
    }
    const timer = setTimeout(() => setAnnouncement(resultsAnnouncement(matchCount)), 300);
    return () => clearTimeout(timer);
  }, [open, matchCount, resultsAnnouncement]);

  // Controlled-value → uncontrolled-search sync (0.20.1 B15 fix). When the
  // consumer owns `value` (single mode) and lets search stay uncontrolled,
  // programmatic value changes (e.g. external <Button onClick={() =>
  // setControlledValue(null)}> "Clear") must re-sync the input display.
  // Without this, the input keeps showing the previous value's label
  // forever — the one-shot init sync below only fires once after first
  // registry fill and never tracks subsequent transitions.
  //
  // Guards:
  //   - single mode only (multiple uses chips, not input text for committed)
  //   - controlled value (consumer is authoritative — own intentional change)
  //   - uncontrolled search (we never overwrite controlled search)
  //   - value actually transitioned (cheap identity guard)
  //
  // The effect is intentionally generous — it ALSO fires when value changes
  // because the user picked from the listbox (selectValue → onValueChange
  // → consumer setState → value prop changes), but updateSearch's identity
  // guard (`if (next === searchRef.current) return`) makes those passes
  // no-ops.
  const prevControlledValueRef = useRef<string | null | undefined>(
    multiple ? undefined : (props as ComboboxSingleProps).value,
  );
  useEffect(() => {
    if (multiple) return;
    if (!isValueControlled) return;
    if (isSearchControlled) return;
    const next = (props as ComboboxSingleProps).value ?? null;
    if (prevControlledValueRef.current === next) return;
    prevControlledValueRef.current = next;
    const nextLabel = next !== null ? (getLabelByValue(next) ?? '') : '';
    setUncontrolledSearch(nextLabel);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally reads `props.value` via narrowed cast; getLabelByValue + flags are stable
  }, [(props as ComboboxSingleProps).value, multiple, isValueControlled, isSearchControlled]);

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
      setUncontrolledSearch(record.textContent);
      initialSearchSyncRef.current = true;
    }
  }, [registryVersion, isSearchControlled, valueRef]);

  const contextValue = useMemo<ComboboxContextValue>(
    () => ({
      open,
      setOpen,
      multiple,
      value,
      valueRef,
      selectedValues,
      valuesRef,
      isSelected,
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
      getLabelByValue,
      visibleItemIds,
      matchCount,
      listboxKeyHandlerRef,
      highlightedId,
      setHighlight,
      acceptFreeText,
      placement,
      sideOffset,
      collisionPadding,
    }),
    [
      open,
      setOpen,
      multiple,
      value,
      valueRef,
      selectedValues,
      valuesRef,
      isSelected,
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
      getLabelByValue,
      visibleItemIds,
      matchCount,
      highlightedId,
      setHighlight,
      acceptFreeText,
      placement,
      sideOffset,
      collisionPadding,
    ],
  );

  return (
    <ComboboxContextProvider value={contextValue}>
      {children}
      <VisuallyHidden
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-combobox-announcer=""
      >
        {announcement}
      </VisuallyHidden>
      {name !== undefined && renderHiddenInputs(name, selectedValues, multiple, disabled, required)}
    </ComboboxContextProvider>
  );
}

/**
 * Hidden form input rendering — branches on mode.
 *
 * Single mode:    one `<input type="hidden">` with the current value (or
 *                 empty string when no selection — preserves existing
 *                 backward-compat behavior of always rendering a hidden
 *                 input when `name` is set, so server-side parsing of an
 *                 unselected combobox still gets the empty string AND
 *                 native `required` validation can fail on empty submit).
 *
 * Multi mode:     one `<input type="hidden">` per selected value, all
 *                 sharing the same `name`. Server reads via
 *                 `formData.getAll(name)` (standard FormData multi-value).
 *
 *                 When zero values are selected: render NO hidden input
 *                 in the non-required case (server gets empty
 *                 `getAll()` — natural representation of "no selections").
 *                 In the required case, render ONE empty-value hidden
 *                 input so the browser's native `required` validation
 *                 fires on submit (otherwise the validator sees no input
 *                 by that name and silently allows empty submission).
 *                 The empty placeholder is NOT marked `required` itself
 *                 once selections exist — only the empty-state guard
 *                 needs that attribute.
 *
 *                 The `required` flag also propagates to populated inputs
 *                 in single mode (where consumer expects standard form
 *                 semantics) but is NOT propagated to multi-mode populated
 *                 inputs: a non-empty value on `<input required>` always
 *                 satisfies the validator, so the redundant flag is just
 *                 noise.
 */
function renderHiddenInputs(
  name: string,
  selectedValues: string[],
  multiple: boolean,
  disabled: boolean,
  required: boolean,
): ReactNode {
  if (multiple) {
    if (selectedValues.length === 0) {
      if (!required) return null;
      // Empty-state required guard: a single empty hidden input so the
      // browser's `required` constraint fails on submit when the user has
      // selected nothing. The disabled flag still propagates so a disabled
      // multi-combobox bypasses validation entirely (consistent with
      // single mode).
      return <input type="hidden" name={name} value="" disabled={disabled || undefined} required />;
    }
    return selectedValues.map((v) => (
      <input key={v} type="hidden" name={name} value={v} disabled={disabled || undefined} />
    ));
  }
  return (
    <input
      type="hidden"
      name={name}
      value={selectedValues[0] ?? ''}
      disabled={disabled || undefined}
      required={required || undefined}
    />
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

export interface ComboboxInputProps extends Omit<
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
  /** Extra class merged onto the trigger wrapper (not the inner `<input>`). */
  className?: string;
  /**
   * Optional explicit `aria-labelledby` — wires an external label element
   * to the combobox role. When omitted, consumer must provide the dedicated
   * `aria-label` prop (explicitly destructured, not rest) or rely on a
   * native `<label>` association (wrapping label / htmlFor).
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
      multiple,
      value,
      valueRef,
      selectedValues,
      valuesRef,
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
      getLabelByValue,
      getItemByValue,
      listboxKeyHandlerRef,
      highlightedId,
      acceptFreeText,
    } = ctx;

    // Blur handler resolves the popper element via
    // `document.getElementById(contentId)` rather than reading a ref, because
    // React 19's `react-hooks/preserve-manual-memoization` rule flags
    // `ref?.current` reads inside `useCallback` deps as memoization-
    // breaking. DOM lookup keeps the callback ref-free.

    const setInputNode = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
      },
      [inputRef],
    );
    const mergedRef = mergeRefs(forwardedRef, setInputNode);

    // Require an accessible name — aria-label, aria-labelledby, or a native
    // <label> association (wrapping label / htmlFor; first-class for a real
    // <input>, hence the `labels` check — Select's button trigger has no
    // such path). Placeholder is NOT a name substitute. Dev-only warning —
    // mirrors SelectTrigger / TabsList / Slider (E03 audit fix).
    useEffect(() => {
      if (process.env.NODE_ENV !== 'production') {
        if (!ariaLabel && !ariaLabelledBy && (inputRef.current?.labels?.length ?? 0) === 0) {
          console.warn(
            '<ComboboxInput> should have `aria-label`, `aria-labelledby`, or an associated <label> — without one the combobox has no accessible name (WCAG 4.1.2).',
          );
        }
      }
    }, [ariaLabel, ariaLabelledBy, inputRef]);

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
          // Multi-mode blur: just clear the search so the input is empty
          // for the next focus. Selections persist as chips. There is no
          // single "committed label" to revert to in multi mode; explicit
          // chip × or clear-all is the way to remove selections.
          if (multiple) {
            updateSearch('');
            if (openRef.current) setOpen(false);
            return;
          }

          // Single-mode blur: auto-commit on exact match, else revert to
          // committed value's label (or empty when nothing committed).
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
            const committed = currentValue ? (getLabelByValue(currentValue) ?? '') : '';
            updateSearch(committed);
          }
          if (openRef.current) setOpen(false);
        }, 0);
      },
      [
        onBlur,
        disabled,
        multiple,
        contentId,
        searchRef,
        valueRef,
        getOrderedItems,
        getLabelByValue,
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

        // Multi-mode Backspace-on-empty — remove last chip. Standard tag-
        // input gesture (Gmail recipients, GitHub topics, Slack channels).
        // Fires in BOTH open and closed states so the user can prune
        // selections without closing the listbox first. Guard: only when
        // the input value is empty AND there's at least one selection AND
        // there are no modifiers (Ctrl+Backspace = delete word, leave that
        // to the browser even though search is already empty in our case).
        if (
          multiple &&
          event.key === 'Backspace' &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey &&
          !event.shiftKey &&
          searchRef.current === ''
        ) {
          const current = valuesRef.current;
          if (current.length > 0) {
            event.preventDefault();
            const last = current[current.length - 1];
            if (last !== undefined) selectValue(last); // toggle = remove since it's currently selected
            return;
          }
          // Empty selection too — fall through (no-op).
        }

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
              // Don't clear selections — Escape on closed input is a
              // "narrow my view back to default" gesture, not "deselect".
              // (Both modes — same semantics.)
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
        multiple,
        valuesRef,
        searchRef,
        selectValue,
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
        // selectValue(null) clears ALL selections in both modes.
        selectValue(null);
        inputRef.current?.focus();
      },
      [disabled, updateSearch, selectValue, inputRef],
    );

    // Multi-mode chip × button — removes a single value from the selection
    // array. Toggle semantics in selectValue handle the actual removal:
    // since the value is currently selected, calling selectValue(v) toggles
    // it off. Focus is restored to the input so keyboard interaction
    // continues smoothly.
    const handleChipRemove = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>, chipValue: string) => {
        if (disabled) return;
        event.preventDefault();
        event.stopPropagation();
        selectValue(chipValue);
        inputRef.current?.focus();
      },
      [disabled, selectValue, inputRef],
    );

    const handleChipMouseDown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      // Same focus protection as the trigger's other secondary buttons.
      event.preventDefault();
    }, []);

    // Clear button visibility:
    // Single mode: shown when search is non-empty OR a value is committed.
    // Multi mode:  shown when search is non-empty OR at least one selection
    //              exists (clears ALL chips on click).
    const showClearButton =
      !hideClear && (search !== '' || (multiple ? selectedValues.length > 0 : value !== null));

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

    // The editable `<input>` element. In single mode it sits directly as a
    // child of the trigger (current rendering). In multi mode it sits as
    // the LAST child of the `.multiInner` chips wrapper so chips and the
    // input share the same flex-wrap row.
    const inputEl = (
      <input
        ref={mergedRef}
        {...ariaProps}
        type="text"
        autoComplete="off"
        spellCheck={false}
        // Always controlled — `search` is the single source of truth.
        value={search}
        placeholder={multiple && selectedValues.length > 0 ? undefined : placeholder}
        className={styles.input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        {...rest}
      />
    );

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
        data-multiple={multiple ? '' : undefined}
      >
        {multiple ? (
          <div className={styles.multiInner}>
            {selectedValues.map((chipValue) => {
              // Resolve label via cache-aware lookup. When the listbox is
              // closed and items have unmounted, this falls back to the
              // persistent label cache (set on first registration).
              const label = getLabelByValue(chipValue) ?? chipValue;
              const itemDisabled = getItemByValue(chipValue)?.disabled === true;
              return (
                <span key={chipValue} className={styles.chip} data-value={chipValue}>
                  <span className={styles.chipLabel}>{label}</span>
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={`Remove ${label}`}
                    className={styles.chipRemove}
                    onMouseDown={handleChipMouseDown}
                    onClick={(e) => handleChipRemove(e, chipValue)}
                    disabled={disabled || itemDisabled || undefined}
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
                </span>
              );
            })}
            {inputEl}
          </div>
        ) : (
          inputEl
        )}
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

export interface ComboboxContentProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'role' | 'aria-labelledby' | 'aria-activedescendant' | 'tabIndex'
> {
  /** Listbox content — ComboboxItem / ComboboxGroup / ComboboxSeparator / ComboboxEmpty. */
  children?: ReactNode;
  /** Extra class merged onto the listbox element. */
  className?: string;
}

export function ComboboxContent({ children, className, ...rest }: ComboboxContentProps) {
  const ctx = useComboboxContext('<ComboboxContent>');
  const {
    open,
    setOpen,
    multiple,
    valueRef,
    selectValue,
    search,
    updateSearch,
    contentId,
    inputId,
    inputRef,
    getOrderedItems,
    getLabelByValue,
    visibleItemIds,
    listboxKeyHandlerRef,
    highlightedId,
    setHighlight,
    acceptFreeText,
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

  // Bridge input DOM into useFloating's reference setter on open. We
  // anchor on the OUTER `.trigger` div so the listbox aligns to the visual
  // bounds of the trigger border-box (not the inner chip wrapper, which in
  // multi mode grows with chip rows and would float the listbox too high).
  //
  // DOM hierarchy:
  //   single mode:   .trigger > input              (parentElement = .trigger ✓)
  //   multi mode:    .trigger > .multiInner > input (parentElement = .multiInner ✗)
  //
  // We walk up until we find an element with `data-state` (the attribute is
  // set on the `.trigger` wrapper only — chips and other intermediate
  // wrappers do not carry it). That makes the resolution mode-agnostic and
  // robust against future DOM changes inside the trigger.
  useLayoutEffect(() => {
    if (!open) return;
    const inputNode = inputRef.current;
    if (!inputNode) return;
    let walker: HTMLElement | null = inputNode.parentElement;
    while (walker && !walker.hasAttribute('data-state')) {
      walker = walker.parentElement;
    }
    setReference(walker ?? inputNode);
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
      // Multi-mode dismiss: just clear the search so the input is empty
      // for the next interaction. Selections persist as chips and require
      // explicit per-chip remove or clear-all. There is no
      // "auto-commit-on-exact-match" path in multi mode — that gesture
      // already happens via item click / Enter while the listbox is open.
      if (multiple) {
        updateSearch('');
        return;
      }
      // Single-mode dismiss: treat the gesture like a blur+revert — the
      // user clicked somewhere else, so commit-on-exact-match-or-revert-
      // to-committed-label keeps the input consistent with the value
      // field.
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
        const committed = valueRef.current ? (getLabelByValue(valueRef.current) ?? '') : '';
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
  // the full list here.
  //
  // Single mode: seed to the current value when it's still visible under
  // the filter; otherwise the first visible enabled item.
  // Multi mode: seed to the first selected value that is still visible
  // (so re-opening the listbox restores cursor to "where the user last
  // committed"); otherwise the first visible enabled item.
  useLayoutEffect(() => {
    if (!open) return;

    const items = getOrderedItems();
    const visible = items.filter((it) => visibleItemIds.has(it.id) && !it.disabled);
    if (visible.length === 0) {
      setHighlight(null, 'mouse');
      return;
    }

    let currentRecord: ComboboxItemRecord | undefined;
    if (multiple) {
      // Use the first selected value that's still visible. valuesRef is
      // accessed inside the layout effect (not in render) per the
      // subscribe-to-external-system pattern used elsewhere in this file.
      const selected = ctx.valuesRef.current;
      for (const v of selected) {
        const found = visible.find((it) => it.value === v);
        if (found) {
          currentRecord = found;
          break;
        }
      }
    } else {
      const current = valueRef.current;
      currentRecord = current !== null ? visible.find((it) => it.value === current) : undefined;
    }
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
      setHighlight(null, 'mouse');
    };
  }, [
    open,
    search,
    multiple,
    valueRef,
    ctx.valuesRef,
    visibleItemIds,
    getOrderedItems,
    setHighlight,
  ]);

  // Commit the currently highlighted option. Behavior branches on mode:
  //   Single — replace value, sync search to label, CLOSE listbox.
  //   Multi  — toggle value in array, CLEAR search, KEEP listbox open so
  //            the user can pick the next option immediately.
  // Fired by Enter / Tab / item click.
  const commitHighlighted = useCallback(
    (restoreFocus = true) => {
      const currentId = highlightedId;
      if (!currentId) {
        // No highlight — Enter with acceptFreeText commits the trimmed
        // search as the value; otherwise no-op. In multi mode, free-text
        // commit appends and keeps the listbox open + clears search.
        if (acceptFreeText) {
          const trimmed = search.trim();
          if (trimmed !== '') {
            selectValue(trimmed);
            if (multiple) {
              updateSearch('');
              if (restoreFocus) inputRef.current?.focus();
              return;
            }
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
      if (multiple) {
        updateSearch('');
        if (restoreFocus) inputRef.current?.focus();
        return;
      }
      updateSearch(record.textContent);
      setOpen(false);
      if (restoreFocus) inputRef.current?.focus();
    },
    [
      highlightedId,
      multiple,
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
      const highlightedIndex = currentId ? visible.findIndex((it) => it.id === currentId) : -1;

      switch (event.key) {
        case 'ArrowDown': {
          // E28 Phase 5 IMP-5: Alt+ArrowDown while OPEN is a documented
          // no-op deviation from APG (which allows "show all ignoring
          // filter"). Closed-state Alt+ArrowDown opens the listbox like
          // plain ArrowDown — the current search filter still applies (no
          // filter bypass in either state); handled in the input's
          // closed-state keydown handler. See JSDoc @a11y for rationale.
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
            // Alt+ArrowUp — close without commit. Single mode reverts the
            // search to the committed label (consistent with Escape).
            // Multi mode just clears the search (no single committed
            // label exists; selections persist as chips). The unified
            // code below resolves to '' in multi mode because
            // `valueRef.current` is always null in multi mode — same
            // outcome, no branch needed.
            event.preventDefault();
            setOpen(false);
            const committed = valueRef.current ? (getLabelByValue(valueRef.current) ?? '') : '';
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
          const prev = Math.max(0, (highlightedIndex < 0 ? 0 : highlightedIndex) - 10);
          const target = visible[prev];
          if (target) setHighlight(target.id, 'keyboard');
          return;
        }
        case 'Enter': {
          if (hasModifier || event.altKey) return;
          // Enter with highlight → commit. Without highlight + acceptFreeText
          // → commit trimmed search. Otherwise no-op — but still preventDefault
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
          //
          // Multi mode: Escape just closes + clears search. Selections
          // persist (chips remain). There is no single "committed label"
          // to revert to — explicit chip × or clear-all is the way to
          // remove selections.
          event.preventDefault();
          if (multiple) {
            updateSearch('');
            setOpen(false);
            inputRef.current?.focus();
            return;
          }
          const committed = valueRef.current ? (getLabelByValue(valueRef.current) ?? '') : '';
          updateSearch(committed);
          setOpen(false);
          inputRef.current?.focus();
          return;
        }
        case 'Tab': {
          // Single mode: commit highlighted + close + let Tab propagate.
          // restoreFocus is `false` so the browser's Tab focus advancement
          // is not cancelled by a .focus() call on the input (Select
          // Phase 5 CRIT-2). When no highlight, just close without commit.
          //
          // Multi mode: Tab leaves the field — close + clear search, do
          // NOT toggle the highlighted item (Space/Enter is the toggle
          // gesture; Tab is "I'm done picking"). Selections persist.
          if (multiple) {
            updateSearch('');
            setOpen(false);
            return;
          }
          if (highlightedId) {
            commitHighlighted(false);
          } else {
            setOpen(false);
          }
          return;
        }
        case ' ':
        case 'Spacebar': {
          // Multi mode only: Space toggles the highlighted item per APG
          // multi-selectable listbox simple model. preventDefault so the
          // space character does NOT also land in the search input — in
          // multi mode the input is a filter, and toggling-via-space
          // should not also pollute the filter with a space character.
          // Single mode: Space falls through to default (lands in input
          // as a literal space — combobox is filter-based).
          if (!multiple) return;
          if (hasModifier || event.altKey) return;
          event.preventDefault();
          commitHighlighted();
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
      multiple,
      highlightedId,
      visibleItemIds,
      getOrderedItems,
      getLabelByValue,
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

  // When closed, mount children invisibly so they register with the root
  // context (label cache, value lookup). Critical for multi-mode chip
  // rendering when `defaultValue` is set on first paint — chips read
  // `getLabelByValue` which falls back to the raw value string if the
  // label cache is empty. Items use `display: none` sentinels under their
  // own visibility filter, so this hidden mount adds zero visible DOM —
  // it just lets the registration `useLayoutEffect` run.
  //
  // The `aria-hidden` + `tabIndex={-1}` + `display: none` triple ensures
  // the hidden tree is invisible to AT, keyboard, and visual users alike.
  // Single mode also benefits: `getLabel` lookups work even before the
  // first open (e.g. for a controlled value that needs label resolution
  // for the input display).
  if (!open) {
    return (
      <div
        style={{ display: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
        data-combobox-hidden-mount=""
      >
        {children}
      </div>
    );
  }

  return (
    <FloatingPortal>
      <div ref={mergedPopperRef} className={styles.contentRoot} style={floatingStyles}>
        <div
          ref={listboxRef}
          id={contentId}
          role="listbox"
          aria-labelledby={inputId}
          aria-multiselectable={multiple}
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
// ComboboxGroup — role="group" wrapper that pipes a generated label id to
// nested ComboboxLabel via context
// ──────────────────────────────────────────────────────────────────────────

interface ComboboxGroupContextValue {
  labelId: string;
}
const [ComboboxGroupContextProvider, useComboboxGroupContext] =
  createFloatingContext<ComboboxGroupContextValue>('ComboboxGroup');

export interface ComboboxGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Group content — ComboboxItem elements plus an optional ComboboxLabel. */
  children: ReactNode;
  /** Extra class merged onto the group element. */
  className?: string;
}

export function ComboboxGroup({ children, className, ...rest }: ComboboxGroupProps) {
  const reactId = useId();
  const labelId = `${reactId}-label`;
  const value = useMemo<ComboboxGroupContextValue>(() => ({ labelId }), [labelId]);

  return (
    <ComboboxGroupContextProvider value={value}>
      <div role="group" aria-labelledby={labelId} className={cn(styles.group, className)} {...rest}>
        {children}
      </div>
    </ComboboxGroupContextProvider>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// ComboboxLabel — non-interactive section header inside a group
// ──────────────────────────────────────────────────────────────────────────

export interface ComboboxLabelProps extends HTMLAttributes<HTMLDivElement> {
  /** Label text announced as the surrounding group's accessible name. */
  children: ReactNode;
  /** Extra class merged onto the label element. */
  className?: string;
}

export function ComboboxLabel({ children, className, id, ...rest }: ComboboxLabelProps) {
  const ctx = useComboboxGroupContext('<ComboboxLabel>');
  // Plain `<div>` — no role. The group's `aria-labelledby` resolves the
  // accessible name via this div's text content; announcing the label as
  // a separate listbox child would confuse virtual cursor traversal.
  // Inherited from Select Phase 5 IMP-4.
  return (
    <div id={id ?? ctx.labelId} className={cn(styles.label, className)} {...rest}>
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

export interface ComboboxItemProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'role' | 'aria-selected' | 'aria-disabled'
> {
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
  /** Visible option content — filter/label text derives from it unless `textValue` is set. */
  children: ReactNode;
  /** Extra class merged onto the option element. */
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
    multiple,
    isSelected: isValueSelected,
    selectedValues,
    selectValue,
    updateSearch,
    setOpen,
    registerItem,
    unregisterItem,
    visibleItemIds,
    inputRef,
    highlightedId,
    setHighlight,
  } = ctx;

  const reactId = useId();
  const itemId = `${reactId}-option`;
  const elementRef = useRef<HTMLDivElement | null>(null);

  // `selectedValues` reference changes on every selection mutation (root
  // useMemo deps include it). Subscribing to it here ensures the memoized
  // ComboboxItem re-renders when its own selected status flips — toggle
  // in multi mode, replace in single mode. `isValueSelected` reads from
  // `valuesRef` (stable identity) so the call itself does not subscribe;
  // the `void` statement below forces the React reconciler to treat
  // `selectedValues` as a context dependency for this item.
  void selectedValues; // forces re-render via context subscription on selection change
  const isSelected = isValueSelected(value);
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
      // Multi mode: toggle selection, KEEP listbox open, CLEAR search so
      // the user can immediately filter to the next pick. Focus stays on
      // input (aria-activedescendant pattern). No label sync — selected
      // values render as chips left of the input, the search field is for
      // filtering only.
      //
      // Single mode: replace selection, sync search to committed label,
      // close listbox, restore focus to input.
      if (multiple) {
        selectValue(value);
        updateSearch('');
        inputRef.current?.focus();
        return;
      }
      const element = elementRef.current;
      const label = textValue ?? element?.textContent ?? '';
      selectValue(value);
      updateSearch(label);
      setOpen(false);
      inputRef.current?.focus();
    },
    [disabled, multiple, value, textValue, selectValue, updateSearch, setOpen, inputRef, onClick],
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
 * ComboboxItem is wrapped in `React.memo` to shield items from re-renders
 * caused by consumer PARENT updates (new children/className identities when
 * the page re-renders). Note: this does NOT localize highlight moves — every
 * item consumes the root ComboboxContext, whose memoized value changes
 * identity whenever `highlightedId` changes, and context updates BYPASS
 * `memo`; all mounted items re-render per highlight move. The same applies
 * to filter recomputes (`visibleItemIds` Set identity) and selection
 * changes (`selectedValues`) — all context-carried. The memo's win is
 * limited to parent-prop churn (E03 audit fix — the previous text claimed
 * only the two toggled items re-render, which was false; twin of the
 * Select fix).
 */
export const ComboboxItem = memo(ComboboxItemImpl);
ComboboxItem.displayName = 'ComboboxItem';

// ──────────────────────────────────────────────────────────────────────────
// ComboboxEmpty — "no results" message, rendered when filter matches zero
// ──────────────────────────────────────────────────────────────────────────

export interface ComboboxEmptyProps extends HTMLAttributes<HTMLDivElement> {
  /** "No results" message content. Default `'No results.'`. */
  children?: ReactNode;
  /** Extra class merged onto the empty-state element. */
  className?: string;
}

export function ComboboxEmpty({ children, className, ...rest }: ComboboxEmptyProps) {
  const ctx = useComboboxContext('<ComboboxEmpty>');
  const { matchCount } = ctx;
  if (matchCount > 0) return null;
  // role="presentation" — purely visual fallback message, AT virtual cursor
  // skips it and reads the input's own state instead. The zero-result count
  // is announced by the built-in debounced announcer in the root (see @a11y
  // header) — do NOT wrap this message in another live region (double
  // announcement).
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
  /** Extra class merged onto the separator element. */
  className?: string;
}

export function ComboboxSeparator({ className, ...rest }: ComboboxSeparatorProps) {
  // role="none" — WAI-ARIA restricts listbox children to `option`/`group`.
  // Inherited from Select Phase 5 IMP-5.
  return <div role="none" className={cn(styles.separator, className)} {...rest} />;
}
