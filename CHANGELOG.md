# Changelog

All notable changes to `@bleizlabs/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning 2.0](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 0.19.0 cycle progress (on `work/0.19-forms-expansion` branch)

**E01.1 FileUpload v1 — drop zone + native file input wrapper**

Phase 10 complex interactive component. Drag-and-drop strefa + click-to-browse
that wraps a visually-hidden native `<input type="file">` for FormData
participation. Render-props children for full content control. Zero external
runtime deps — native File API + HTML5 drag/drop events only.

API highlights:
- Validation: `accept` (MIME / wildcard / extension), `multiple`, `maxSize`,
  `minSize`, `maxFiles` — each axis emits a `FileRejectionReason` code on
  failure (`file-too-large` / `file-too-small` / `file-invalid-type` /
  `too-many-files`).
- Form participation: `name` + `required` mirror to the hidden input;
  FormData multipart capture works natively. `inputRef` prop exposes the
  hidden input for programmatic `.value = ''` reset between uploads.
- A11y: drop zone is `<div tabIndex={0}>` (NOT `role="button"` — would
  trigger axe `nested-interactive` with the consumer-rendered Browse
  button inside). Keyboard activation flows via the inner Browse button
  (real `<button>`). Click on the zone opens picker for mouse/touch;
  click-from-inner-button is auto-detected and skipped (no
  `stopPropagation` needed in consumer code). Live region announces
  accept/reject counts with a varying zero-width marker so AT
  re-announces identical consecutive operations.
- Forensic patterns from spec (Phase 1 Explore): drag counter (FU-R03),
  user-gesture preservation (FU-R02), empty-MIME extension fallback
  (FU-R07), `dataTransfer.items` Safari fallback (FU-R19), size-reject
  preview at dragOver is best-effort (FU-R08 documents the limit).

Phase 4 Evaluator findings + fixes:
- CRITICAL: focus-ring was applied unconditionally instead of inside
  `:focus-visible` — fixed.
- IMPORTANT: live-region repeat-content AT silence — fixed via
  zero-width marker counter.
- IMPORTANT: aria-describedby now CHAINS consumer-supplied + internal
  live region id (both descriptions land in the same set).
- Auto-skip click handler when origin is inner `<button>` / `<a>` /
  `role="button"` — removes consumer footgun.

Tests: 56 PASS / 1 documented skip (FU-R12 native picker dismiss focus
restore — unreachable by Playwright, manual NVDA verified) across 5 spec
files: aria (11), dragdrop (9), validate (10), form (5), regression (22).
axe-core zero violations on demo route (`/components/file-upload`).

Manifest: 93 → 94 families. Zero new lib tokens. Zero new external deps.

## [0.18.1] — 2026-05-12

**Patch release — Form/Field re-render hygiene.**

### Fixed

- `<Field>` rendered inside `<Form>` no longer triggers an infinite
  re-register loop ("Maximum update depth exceeded" at `Form.tsx:305`).
  The Field effect that calls `formCtx.registerField(name)` now depends on
  the stable `useCallback([])` reference instead of the wrapping `formCtx`
  context object. Without the fix:
  `mount → registerField → setValidityVersion → ctxValue re-memo →
  effect cleanup (unregister + bump) → re-register (bump) → ∞`.
  The Form-side `registerField` was already stable; only the Field-side
  dependency array was wrong. Single-file change in
  `components/complex/Field/Field.tsx`. Regression covered by
  `Form.regression.spec.ts` FM-R23 — visits `/components/field`, listens
  for `pageerror` + console errors, asserts zero "Maximum update depth
  exceeded" messages. Form regression suite: 40 PASS / 3 documented skip.

  Discovered via runtime check on the demo route after 0.18.0 publish.
  Static checks (tsc + ESLint + 437 Playwright unit specs) all green —
  surfaced only at render time when Field mounts inside Form. Codified
  as a permanent post-push verification rule: `mcp__next-devtools__
  nextjs_call get_errors` must report clean state before every push.

## [0.18.0] — 2026-05-12

**Feature release — Date/Time pack.** Ships 4 new complex date/time
components plus a Calendar amendment + a Select/Combobox `.itemText`
polish. Library grows from 89 to 93 families. Zero external runtime
dependencies maintained. Two user-reported runtime regressions (Calendar
1M-px layout explosion, popover position flicker) caught + fixed pre-publish
with permanent regression suites (CAL-LB01–07, FLICK-01–04). Forensic
patterns persisted to memory for future sessions.

### 0.18.0 cycle progress (on `work/0.18-datetime-pack` branch)

**E01.0 Calendar AMEND — opt-in cell-extras + hover callbacks (commit `57b29a3`)**

3 additive opt-in props on `<Calendar>` (zero BC risk, single-consumer
Calendars unaffected):
- `cellExtras?: (date, ctx) => HTMLAttributes<HTMLTableCellElement>` — per-cell
  attribute slot, spread BEFORE fixed `role`/`aria-selected`/`className` so
  consumer cannot override grid semantics. Primary use: `data-*` attrs for
  CSS-driven overlays (range preview, badges).
- `onCellHover?: (date) => void` — cell `mouseenter` callback, opt-in for
  hover-driven UI. Not fired on hidden outside-month cells.
- `onGridMouseLeave?: () => void` — grid-level `mouseleave` callback, pairs
  with `onCellHover` for clearing hover tail.

Spec coverage: `Calendar.cellExtras.spec.ts` (3 cases — defaults unchanged,
data-* attrs land via DateRangePicker consumer, hover wiring proven).
Existing 7 Calendar spec files behavior unchanged.

**E01.1 DateRangePicker v1 — multi-month range selection (commit `62db846`)**

New `complex/DateRangePicker` compound (root + `Input` + `Content`). Composes
Calendar AMEND + 5 floating primitives into a popover range picker per
WAI-ARIA APG `/datepicker-dialog/` modified for range.

Features:
- Range state machine: idle → pendingFrom → commit (with reorder on click 2 <
  click 1); committed-restart on next click; programmatic clear-to-null
  override clears `pendingFrom` (audit-fix C3 2026-05-12).
- `numberOfMonths: 1 | 2 | 3` opt-in layout axis (single sync'd chevron header).
- Cross-Calendar focus: HARD STOP boundary — arrows stay within single grid,
  Tab moves to next Calendar's `tabIndex=0` cell.
- Hover preview via `cellExtras` → `data-range-hover-tail`. Cleared on
  `onGridMouseLeave` + popover close.
- Typed input parsing: `"YYYY-MM-DD → YYYY-MM-DD"` (em-dash) OR
  `"YYYY-MM-DD -> YYYY-MM-DD"` (ASCII arrow). Half-date sets `pendingFrom`.
- Form participation Path A: renders `${name}_from` + `${name}_to` hidden
  inputs (ISO `yyyy-mm-dd`); when `required=true`, both render even when null
  to surface native HTML5 `:invalid`; when `required=false`, null bound omitted.
- A11y: range bounds use `data-range-start` / `data-range-end` + `aria-label`
  augmentation ("...{date}, in selected range"). Dialog `aria-modal="false"`
  (outside dismiss, no focus trap). axe-core zero violations.
- RTL: `dir="rtl"` propagates to all child Calendars; months row uses logical
  flex so later month renders visually on LEFT.

Spec coverage: 11 spec files (`_helpers` + aria + range + keyboard + focus +
hover + months + locale + form + disabled + regression) — 58 PASS / 2
documented `test.skip` (Playwright synthetic-event limitations on
portal-rendered cells; manual verification path documented in test JSDoc).

**E01.2 TimeInput v1 — bespoke `role="spinbutton"` HH:MM(:SS) trio**

New `interactive/TimeInput` flat component (not compound). Bespoke
`role="spinbutton"` implementation per WAI-ARIA APG `/spinbutton/` — does
NOT compose `<NumberInput>` per audit C1 finding (NumberInput owns its own
`<input>` with InputHTMLAttributes passthrough that conflicts with
spinbutton ARIA).

Features:
- 2-3 spinbutton fields (hours, minutes, optional seconds) inside
  `<div role="group" aria-label>`. Each field carries `aria-valuenow`,
  `aria-valuemin`/`max`, `aria-valuetext`, per-field `aria-label`
  ("Hours" / "Minutes" / "Seconds").
- `hourCycle: '12h' | '24h'` opt-in prop (auto-derived from locale via
  `resolveHourCycle` when omitted). 12h mode renders `<button role="switch"
  aria-checked>` AM/PM toggle at logical-end of group. `onValueChange`
  ALWAYS emits 24h ISO regardless of display cycle (per plan AD2).
- Keyboard model per spinbutton: ArrowUp/Down ±1 (hours/seconds) or ±step
  (minutes); PageUp/Down ±10/±15/±10; Home/End jump to field bounds;
  direct digit type with 2-digit buffer + auto-advance on completion or
  when single-digit completion is unambiguous (e.g. typing "3" in 24h
  hours auto-advances since "3X" with X≥0 would exceed 23); `:` separator
  commits buffer; Backspace clears buffer (empty-buffer Backspace retreats
  to previous field); IME composition guard.
- `min`/`max` clamping at commit boundary via lexical `clampTime` (ISO
  zero-padding is monotonic).
- Form participation: single hidden input renders `"HH:MM"` (or
  `"HH:MM:SS"`) under `name`. `required` propagates so empty surfaces
  native `:invalid`.
- 5 new util helpers extending `utils/date.ts` — `parseTime`, `formatTime`,
  `clampTime`, `combineDateTime`, `resolveHourCycle` (last reserved for
  DateTimePicker E01.4 consumer; first 4 used by TimeInput directly).
- Race-condition fix: `isAdvancingRef` flag suppresses the synchronous
  blur fired by `ref.focus()` during auto-advance — without it, the
  leaving field's blur handler would re-flush its now-stale single-digit
  buffer over the just-written 2-digit commit (forensic finding caught
  during runtime test exec 2026-05-12).

Spec coverage: 6 spec files (`_helpers` + aria + keyboard + format +
bounds + form + focus + regression) — 48 PASS / 0 fail / 0 skip. Includes
axe-core zero violations on demo route.

Net manifest after 0.18.0 cycle to date: 89 → 91 families (DateRangePicker +
TimeInput). Remaining 0.18.0 sub-Epics: E01.3 TimePicker · E01.4
DateTimePicker.

**E01.3 TimePicker v1 — combobox + listbox columns popover**

New `complex/TimePicker` compound (root + `Input` + `Content`). Composes 5
floating primitives + 4 time helpers from `utils/date.ts` (shared with
TimeInput E01.2). Pattern follows DatePicker E142 (editable combobox
input + popover dialog) with listbox columns inside the popover instead
of a Calendar grid.

Features:
- Compound: `TimePicker` + `TimePickerInput` (combobox) + `TimePickerContent`
  (popover dialog with 2-3 scrollable listbox columns)
- `hourCycle: '12h' | '24h'` opt-in (auto-derived from locale via
  `resolveHourCycle`); 12h adds AM/PM listbox at logical-end
- `step` filters minute listbox content (e.g. step=15 → 4 options)
- `withSeconds` adds 3rd listbox column
- `min` / `max` clamp committed value via lexical `clampTime`
- Form participation: hidden `<input type="hidden" name>` carrying 24h ISO;
  `required` flag propagates for native `:invalid`
- Keyboard model (input): Alt+ArrowDown opens + focuses first hour option,
  Alt+ArrowUp closes, Enter parses typed `"HH:MM"` (24h) or `"HH:MM AM/PM"`
  (12h) and commits + closes on valid input or sets `aria-invalid` on
  invalid input; Escape closes; IME composition guard
- Keyboard model (listbox option): ArrowUp/Down nav with `scrollIntoView`,
  Home/End jump bounds, Enter/Space commits + advances focus to next
  listbox (h → m → s? → p? → close + return focus to input), Escape closes
- A11y: input `role="combobox" aria-haspopup="listbox"`; dialog
  `role="dialog" aria-modal="false" aria-label="Time picker"`; per-listbox
  `role="listbox" aria-label`; options `role="option" aria-selected`;
  axe-core zero violations on demo route

Spec coverage: 6 spec files + `_helpers` — 40 PASS / 0 fail / 0 skip.

Net manifest after 0.18.0 cycle to date: 89 → 92 families (DateRangePicker +
TimeInput + TimePicker). Remaining 0.18.0 sub-Epics: E01.4 DateTimePicker.

**E01.4 DateTimePicker v1 — Calendar + TimeInput compound in single popover**

New `complex/DateTimePicker` compound (root + `Input` + `Content`).
Composes existing `<Calendar>` (E30) + `<TimeInput>` (E01.2) inline within
a single popover surface. Three Tab stops in dialog (Calendar roving
cell → hour spinbutton → minute spinbutton, plus optional seconds +
AM/PM toggle). Form output is ISO 8601 local datetime
(`"YYYY-MM-DDTHH:MM:SS"`, no tz suffix — server treats as local wall-
clock per plan AD3).

Features:
- Compound: `DateTimePicker` + `DateTimePickerInput` + `DateTimePickerContent`
- Value type `Date | null` (not string) — `<DateTimePicker>` works with
  the JS `Date` primitive directly; `toIsoDateTimeString` / `parseIsoDateTimeString`
  serializers cover form bridge
- Inline `<TimeInput>` (NOT `<TimePicker>` popover) — single popover
  surface preferred per plan I3 Recommended
- `withSeconds`, `hourCycle '12h' | '24h'`, `timeStep`, `min`/`max`,
  `disabledDates` all propagate to inner Calendar + TimeInput
- Calendar select preserves existing time component; TimeInput nudge
  preserves existing date component; either-axis edit produces fully
  combined Date via `combineDateTime` utility
- Form: hidden `<input type="hidden" name>` with ISO 8601 local datetime;
  `required` propagates for native `:invalid`

2 new util helpers in `utils/date.ts`:
- `toIsoDateTimeString(date) → "YYYY-MM-DDTHH:MM:SS"` (no tz suffix)
- `parseIsoDateTimeString(iso) → Date | null` (accepts trailing `:SS`
  optional)

Time-zone semantics — documented:
- Emitted ISO string carries NO tz suffix; represents local wall-clock
  time at user's device
- Server parsers MUST treat as local-naive datetime, NOT UTC
- DST trap: `combineDateTime` uses `Date.setHours` which normalizes
  non-existent local times (e.g. 02:30 on spring-forward day → 03:30)

Keyboard model (input): Alt+ArrowDown opens + focuses first Calendar
cell; Alt+ArrowUp closes; Enter parses typed `"YYYY-MM-DDTHH:MM"` or
`"YYYY-MM-DD HH:MM"` (space normalized to ISO T) → commit + close on
valid, `aria-invalid` on parse failure; Escape closes; IME composition
guard.

Spec coverage: 5 spec files + `_helpers` — 29 PASS / 1 documented skip
(`DT-R01 click-outside dismiss` — shared primitive covered by TP-R08;
DateTimePicker's larger dialog footprint blocks Playwright's pointerdown
synthesis on small viewports). Axe-core zero violations.

Net manifest after full 0.18.0 cycle: 89 → 93 families (DateRangePicker
+ TimeInput + TimePicker + DateTimePicker). 0.18.0 component scope
complete.

**Polish — Select + Combobox `.itemText` multi-line friendly**

Dropped forced single-line truncation (`white-space: nowrap;
text-overflow: ellipsis; overflow: hidden;`) from `.itemText` in both
`<Select>` and `<Combobox>` listbox item slots. Listbox items often carry
multi-line content (name + role, label + description); the previous
ellipsis policy clipped that content invisibly.

After the change:
- Single-line text renders unchanged (no wrap needed at any width)
- Long single-line values WRAP to next line instead of clipping (WCAG 1.4.4
  content-loss alignment)
- Multi-line consumer content (e.g. `<>{name}<br/>{role}</>`) renders fully
- `.item` keeps `align-items: center` + min-height 32 for single-line
  ergonomics; rows grow naturally for multi-line content
- Consumers needing explicit ellipsis can layer it via className passthrough
  (Charter R3 — lib provides slot, consumer controls visual rhythm)

No prop API change; 82 Select + Combobox Playwright tests pass unchanged.

## [0.17.0] — 2026-05

**Feature release.** Ships `<DataTable>` as a flagship generic-data grid
primitive — the first item from the post-0.16 functional roadmap (see
`ROADMAP.md`). Library grows from 88 to 89 families. Zero external runtime
dependencies maintained.

### Added

**Complex interactive:**
- `DataTable<T>` — declarative grid primitive z `columns` + `data` API +
  discriminated-union selection mode (`'none' | 'single' | 'multiple'`).
  Klocek-compliant: single concept, data-shape neutral via generic `T`,
  no opinionated visual lockups (consumer drives density/dir/striped/sticky
  via independent opt-in props). Ships full APG `/grid/` (or `/treegrid/`
  when `expandable` is provided per WAI-ARIA 1.2 + axe
  `aria-conditional-attr`) pattern: `role="grid"` by default, `role="treegrid"`
  gdy `expandable` enabled, plus explicit `role="row"`/`"gridcell"`/
  `"columnheader"` on every descendant,
  `aria-rowcount`/`aria-rowindex`/`aria-colcount`/`aria-colindex`,
  `aria-sort` synced to column sort state, `aria-selected`/`aria-expanded`
  on selectable + expandable rows, `aria-multiselectable` on multi-select
  grids, `aria-live="polite"` debounced announcements for sort/filter/page/
  selection changes.

  Keyboard model (cell-mode roving tabindex): Arrow keys (with RTL mirror
  via logical CSS properties), Home/End (row boundaries), Ctrl+Home/End
  (table boundaries), PageUp/PageDown (~viewport rows), Enter (activate
  header sort / row click), Space (toggle row selection). Modifier-arrow
  combos pass through to browser hotkeys. Widget-mode entry (F2/Escape)
  deferred to v1.x — cells with interactive children currently rely on
  standard Tab order escaping the grid.

  Features: sortable + filterable columns (text/enum/number defaults +
  custom `renderFilter` slot), single + multiple selection with stable
  `getRowId` for cross-page persistence, row expansion with
  `renderExpanded` slot, frozen left/right columns via `inset-inline-*`
  logical properties (auto-mirrored in RTL), mobile card layout fallback
  below configurable breakpoint (default 768px), 3 density modes
  (compact/cozy/comfortable), striped/hoverable/sticky-header toggles,
  loading skeleton + error Alert + Empty state machine, imperative
  `DataTableHandle<T>` ref API (`getSelectedRows` / `clearSelection` /
  `toggleRowExpanded` / `toggleColumnVisibility` / `scrollToRow`), Polish
  i18n `labels` slot, dev-mode warning when selection enabled without
  stable `getRowId`.

  Hook: `useDataTableState<T>(options)` exposed for power users wiring
  external state controls.

  Tests: 11 Playwright spec suites covering keyboard + focus management +
  ARIA + sort + filter + pagination + selection + expansion + responsive +
  12 edge cases + 20 regression cases (89 cases total). Demo route at
  `/components/data-table` ships 6 use cases against 47 mock projects.

  See `ROADMAP.md` and `work/2026-05_0.17-datatable/docs/datatable-v1-plan.md`
  for full design rationale.

### Fixed

Hardening from post-implementation adversarial audit (caught issues that
9 prior audit iterations missed by reading specs statically instead of
running them):

- `aria-rowindex` math on data rows now includes `pageIndex * pageSize`
  offset so screen readers announce "row 12 of 47" on page 2 instead of
  the page-relative position.
- Filter row promoted to `role="row"` with `aria-rowindex={2}` (was
  `role="presentation"`). Resolves axe-core `aria-required-children`
  violation on `treegrid` (filter `<input>` children are now valid
  descendants of `<th role="columnheader">`).
- Keyboard handler now reads cell coordinates from `target.dataset.row`
  / `target.dataset.col` instead of stale React state. Fixes ArrowDown
  + Space activation when interaction follows immediately after
  programmatic focus (synthetic dispatch races React's render commit).
- `<Switch>` track no longer intercepts pointer events. The decorative
  `<span class="track">` previously sat on top of the sr-only `<input>`
  with default `pointer-events: auto`, blocking programmatic clicks on
  the input. Native UX preserved — `<label>` still toggles on click.

## [0.16.0] — 2026-05

**BREAKING release.** This version closes the deprecation cycle that began
in 0.13.0 and continued through 0.14.0 and 0.15.0. Nineteen components
that were marked `@deprecated` across those releases are now removed
outright. The library shrinks from 107 to 88 focused families and lands
firmly on the klocek charter: structural primitives plus a small
catalogue of behavior compounds, with consumer-side composition for
everything that previously bundled multiple concerns.

### Removed (BREAKING)

**Display:**
- `PercentValue` / `PercentValueAnimated` — superseded by `KpiValue` with
  `unit="%"` + `color="auto"` + `thresholds` + `inverse` since 0.7.0.

**Molecules:**
- `PageHeader` — superseded by `<Header>` (added in 0.14.0). Migration:
  `<Header>` body slot composes Heading + Text + Eyebrow + Badge.
- `SectionHeader` — superseded by `<Header>`. Migration: same pattern.
- `DeadlineBadge` — product-flavored composition (deadline = panel /
  order business concept). Consumers compose Badge + own deadline-
  formatting logic.
- `RevealStack` — thin wrapper. Migration: `<Reveal asChild><Stack>…</Stack></Reveal>`.
- `ToggleGroupFilter` — duplicates lib `<ToggleGroup type="multiple">`
  with thin wrapping. Use the lib `ToggleGroup` directly.

**Card presets:**
- `EntityCard` — multi-concept lockup (card + badge group + meta strip +
  body slot). Each project composes its own business-domain card
  (`<ProjectCard>`, `<TicketCard>`) from Card + Header + atoms.
- `EntityHero` — universal entity detail-page hero shell (god-organism).
  Each project composes its own detail header from Header + Card + atoms.
- `ContentCard` — pure shortcut wrapper (`<Card><Heading><Text></Card>`).
  Compose Card slots directly.
- `SidebarCard` — visual variation harvester. Compose Card with consumer
  SCSS for surface-specific styling.
- `StatsCard` / `ActionCard` / `IconHeaderCard` / `PairedCard` —
  preset bundles that exceeded the molecule prop budget.
- `ZoneCard` / `CollapsibleZoneCard` — preset bundles (Card + density +
  tone enums + summary chips).
- `FormCard` — renamed to `FormSurface` in 0.13.0; deprecated alias
  removed.

**Composition presets:**
- `SiteHeader` — marketing-flavored compound preset. Each project owns
  its own marketing header molecule.
- `AppShell` — chrome organism. Each project builds its own
  variant-driven shell composing `<Sidebar>` + the new `<Header>` molecule.

### Removed (demo pages)

The corresponding playground routes are removed:
`/components/{percent-value,page-header,section-header,reveal-stack,
toggle-group-filter,entity-card,entity-hero,content-card,sidebar-card,
stats-card,action-card,icon-header-card,paired-card,zone-card,
collapsible-zone-card,form-card,site-header,app-shell}` and the
aggregator routes `/components/presets` + `/demo`.

### Migration

Every removed component shipped a `@deprecated` JSDoc annotation through
0.13.x → 0.15.x with an explicit migration pattern. Consumers who
followed those notes need no further changes; consumers still using
deprecated names will hit `Cannot find module` errors on import — see
the release notes for the inline migration recipe per component.

### Changed

- **README** — component-count tagline updated to `88 focused components`.
  Library description in `package.json` updated similarly.
- **Home page playground** (`app/page.tsx`) — entries for removed
  components and aggregator routes deleted; FormSurface gains its own
  index entry under "Form Presets".
- **Reveal demo** — `RevealStack` sections rewritten to use
  `<Reveal asChild><Stack>…</Stack></Reveal>` directly, demonstrating the
  documented migration pattern.
- **Molecules aggregator demo** — sections for ToggleGroupFilter,
  DeadlineBadge, and PageHeader removed. Aggregator now covers DataRow,
  BackLink, SectionDivider, AccordionGroup, FileChip, and Accordion.

### Notes

- Manifest regenerated: `88 families`, `502 named exports`,
  `libVersion 0.16.0`.
- TypeScript, ESLint, Next build, Playwright smoke + per-component
  suites all green on CI.
- Library remains zero-dependency and React 19 / Next.js 16+ first.
- Seed-token system is unchanged — projects on 0.15.x can upgrade
  by removing imports of any removed component and substituting the
  documented composition pattern.

## [0.15.0] — 2026-05

This release sharpens the library against the **klocek charter** — a binding
test that measures every component against six axes (single concept,
data-shape neutrality, no visual lockup, no auto-wrap, no surface bias,
prop-budget compliance). Components that bundled multiple concerns under
one prop API are slimmed down to focused primitives; consumers compose the
rest from the existing atoms. Backward-compatible defaults are preserved
for all single-mode shapes.

### Added

- **`<Combobox multiple>`** — discriminated-union flag promotes Combobox
  to a multi-select listbox while preserving the single-select API as the
  default. Selected values render as inline chips left of the input;
  Backspace on an empty input removes the last chip; the per-chip × button
  removes a single value. Listbox stays open after each pick and the
  search clears for the next selection. ARIA flips
  `aria-multiselectable="true"` and per-item `aria-selected`. FormData
  serialization renders one hidden input per selected value (server reads
  via `formData.getAll(name)`); when zero values are selected and the
  Combobox is `required`, a single empty hidden input is rendered as a
  validation guard so native form `required` constraints still fire.
  Keyboard model adds Space-toggles-highlighted (APG simple multi-select
  model); Enter also toggles instead of committing-and-closing; Tab
  closes without toggling; Escape closes without reverting selections.
- **Combobox listbox now mounts items invisibly when closed.** Items
  register with the root context immediately so the label cache is
  populated before first paint — multi-mode chips render real labels
  instead of raw values when a `defaultValue` is set. Single-mode label
  resolution also benefits: a controlled value can resolve its display
  label without forcing the listbox open first.

### Fixed

- **Listbox / menu width now matches trigger width.** `Select`,
  `Combobox`, `DropdownMenu`, and `NavigationMenu` previously rendered
  their popovers with hardcoded `min-width: 180–220px` and a clamped
  `max-width: min(320–360px, 90vw)` — disconnected from the trigger.
  Wide form-field triggers got popovers that were narrower than the
  field; narrow icon-button triggers got popovers that were wider than
  necessary. `useFloating` now publishes the measured trigger width as
  the `--reference-width` CSS custom property on every reposition, and
  the four affected components read it via `width: var(--reference-width)`
  with `min-width` providing the floor for narrow triggers and
  `max-width: 90vw` providing the small-viewport guard.

### Changed (SIMPLIFY — props slimmed under the klocek charter)

- **`<Input>` → headless paradigm.** 14 props → 6. Dropped `label`,
  `name`, `error`, `helperText`, `showCounter`, `clearable`, `loading`,
  `hideLabel`. Pair Input with `<Field>` for label / description /
  validation message wiring. Migration: move label / error / helper text
  into a Field compound; replace `clearable` and `loading` with consumer-
  composed end-icon affordances.
- **`<Card>`** 10 props → 6. Dropped `accentColor`, `accentPosition`,
  `hoverable`, `width`. Use a CSS custom property for accent color
  (`style={{ '--card-accent-color': ... }}`); compose width via parent
  layout primitives; replace `hoverable` with consumer styling on Link
  asChild.
- **`<Badge>`** 8 props → 5. Dropped `uppercase`, `pulse`, `dot`. Use
  Text-level uppercase utilities for casing; compose Dot atom as a
  prefix child for status indication.
- **`<Alert>`** 7 props → 4. Dropped `timestamp`, `href`, `closeIcon`.
  Title and description now accept `ReactNode` so consumers can compose
  Anchor links and `<time>` elements directly.
- **`<Empty>`** title / description now accept `ReactNode` (was string).
  Auto-wrap into `<h3>` / `<p>` removed — consumer brings the typography
  atom they want.
- **`<MetricTile>`** density enum and label / description auto-wrap
  removed. Description now accepts `ReactNode` (consumer wraps own Text
  variant); label is documented as a plain string with no auto-uppercase.
- **`<BreakdownList>`** refactored to compound children — the forced
  typed-array `items` prop is replaced by `<BreakdownList><BreakdownListItem />…</BreakdownList>`.
  Density enum dropped.
- **`<FormSurface>`** (formerly `FormCard`) trimmed to a klocek-pure form
  + Card surface wrapper. The `title` / `description` / `footer` /
  `asForm` / `headerBorder` / `closeIcon` bundle is gone — compose these
  via the existing Card slots.
- **`<Avatar>`** `status` prop removed. Compose `<Avatar />` + `<Dot />`
  in a positioned wrapper for status indication.
- **`<Skeleton>`** `lines` and `ariaLive` removed. Compose multiple
  Skeleton instances in a Stack for multi-line text loading; consumer
  wraps in a live region if announcement is needed.
- **`<SidebarProvider>`** `persist` and `cookieName` removed. Consumer
  reads its own cookie in a Server Component layout and passes the
  resolved value to `defaultOpen` for SSR-friendly hydration.
- **`<Pagination>`** `ariaLabel` deprecated alias removed. Use
  `labels.nav` on the labels object.
- **`<UsageDonut>`** `strokeWidth` removed. The hardcoded sweet-spot
  value (14) ships universally.
- **`<DropdownMenuTrigger withChevron>`** opt-in flag added. Default
  `false` — chevron only renders when explicitly requested. Avoids
  spurious chevrons on icon-only or avatar-only triggers.

### Notes

- The cycle adds new test coverage for `<Combobox multiple>` (14 cases),
  `<Field>` (5 cases plus 1 documented skip), and `<Header>` (4 cases).
  Existing single-mode Combobox suites pass unchanged (31 cases).
- Manual NVDA sweep is pending operator review; smoke axe-core sweep
  passes 52 of 54 demo routes (two pre-existing demo-page color-contrast
  issues on `/components/input` and `/components/molecules` are tracked
  separately and do not affect library components).

## [0.14.0] — 2026-05

### Added

- **`<Header>`** — universal block-header molecule (≤2 props: children +
  optional actions slot). Replaces the deprecated `SectionHeader` and
  `PageHeader` molecules with one focused primitive. Renders semantic
  `<header>`; consumer composes Heading + Text + Eyebrow + Badge under
  the body slot.
- **`<Field>`** — accessible form-row compound (Field + Field.Label +
  Field.Control + Field.Description + Field.Message). Decoupled from
  any form library; uses native HTML5 Constraint Validation API.
  Integrates optionally with `<Form>` (form-id prefix + hasSubmitted
  gate + central validity reporting); also works standalone.
- **CSS reset baseline.** `_semantics.scss` now ships a conservative
  reset (`box-sizing: border-box`, margin-zero on heading/list/figure
  elements, list-style none on `[role="list"]`, font/color inheritance
  on form controls, `display: block; max-width: 100%` on media). Removes
  cross-project drift from divergent global resets.

### Changed (SIMPLIFY)

- **`<MetricTile>`** density enum and label / description auto-wrap
  removed (see 0.15.0 entry — landed in 0.14.0 as part of the same
  cycle).
- **`<BreakdownList>`** compound children pattern (see 0.15.0 entry).
- **`<FormSurface>`** klocek-pure trim (see 0.15.0 entry).

### Deprecated

Seven product-flavored or organism-tier molecules and presets are now
deprecated and will be removed in 0.16.0:

- `EntityHero`, `EntityCard` — universal entity hero / grid-item shells.
  Compose Header + Card + Stack + Inline + Badge per surface for
  business-domain organisms (`<ProjectDetailHeader>`, `<TicketCard>`).
- `SiteHeader`, `AppShell` — page-level chrome wrappers. Each project
  builds its own variant-driven shell composing Sidebar + the new
  Header molecule.
- `PageHeader`, `SectionHeader` — replaced by `<Header>` (see Added).
- `SidebarCard`, `ContentCard`, `ActionCard`, `StatsCard`, `IconHeaderCard`,
  `PairedCard`, `ZoneCard`, `CollapsibleZoneCard`, `DeadlineBadge` —
  preset bundles that exceeded the molecule prop budget. Consumers
  compose Card + the relevant atoms directly.

## [0.13.1] — 2026-05

### Fixed

- **`Sheet` + `Drawer` overflow-x leak.** Modal sheet content with wide
  inline elements (e.g. long URLs or wide tables) caused horizontal
  scroll on the body when the sheet was open. Both surfaces now apply
  `overflow-x: hidden` to the modal content wrapper.
- **`ContextMenu` CM-R10 scroll-race flake.** A timing race between
  `useFloatingFocus` initial focus and `useFloatingDismiss` close-on-
  scroll consumers caused the menu to flicker open/closed under
  parallel-worker CI load. Resolved via the `preventScroll: true`
  fix that landed in 0.11.3 — re-applied here after a regression in
  the 0.13.0 manifest builder.
- **0.13.0 ghost release.** v0.13.0 was tagged but never published
  to npm: the manifest builder skipped `FormCard` because of an inline
  JSDoc comment that broke its export-detection regex. v0.13.1 ships
  the fix and is the actual public release of the 0.13.x line.

## [0.13.0] — 2026-05

### Added

- **`<Form>`** — accessible form root with validation gating and a
  `hasSubmitted` flag exposed via context. Field messages and aria-
  invalid stay silent until the first submit attempt, then live-update
  on input changes.
- **`<Toolbar>`** — accessible toolbar per APG `/toolbar/`. Roving
  tabindex, separators, optional orientation, RTL-aware arrow keys.

### Changed (RENAME)

- **`FormCard` → `FormSurface`.** The "Surface" suffix communicates the
  structural role (form-flavored Card surface) more clearly. `FormCard`
  remains as a deprecated alias re-exporting `FormSurface`; will be
  removed in 0.16.0.

### Deprecated

- See 0.14.0 entry — the deprecation cycle began in 0.13.0 with
  `FormCard` and continued in 0.14.0 with the broader preset sweep.

## [0.12.0] — 2026-05

### Added

- **`<ThemeToggle>`** — single-button light/dark theme switcher.
  Composes the lib `Button` atom with inline sun/moon SVGs and drives
  the `<html data-theme>` attribute as the single source of truth.
  Subscribes via `useSyncExternalStore` + `MutationObserver`, persists
  to `localStorage`, and syncs across tabs via the `storage` event.
  Per-instance `storageKey` prop supports multi-surface origins where
  each surface keeps independent theme preferences.

## [0.11.3] — 2026-05

### Fixed

- **`useFloatingFocus` now passes `{ preventScroll: true }` to every
  `.focus()` call** — both the initial-focus rAF on open and the
  restore-focus rAF on close. Without this, a partially-clipped focus
  target on open triggered the browser's `scroll-into-view-if-needed`,
  firing a window scroll event that `useFloatingDismiss` `closeOnScroll`
  consumers (notably `ContextMenu`) observed and immediately closed
  the menu on, producing an open → close race. Surfaced as a flaky
  CM-R10 ("position uses clientX/clientY") on CI Linux runners under
  parallel-worker load. Floating consumers without `closeOnScroll`
  are unaffected; the portal is positioned at correct viewport
  coordinates already, so focus never needs to scroll to reveal it.
  Affects `ContextMenu`, `DropdownMenu`, `Popover`, `HoverCard`,
  `NavigationMenu`, `Select`, `Combobox` (all `useFloatingFocus`
  consumers).

## [0.11.2] — 2026-05

### Changed

- **Public release on npmjs.org.** Migrated from GitHub Packages to
  the public npm registry — `npm install @bleizlabs/ui` now works
  with no auth, no `.npmrc` setup. `publishConfig` updated to
  `access: "public"` + `registry: "https://registry.npmjs.org/"`.
- **CI publish workflow** switched to npmjs.org with provenance
  attestation (`npm publish --provenance --access public`) and
  `NPM_TOKEN` secret in place of `GITHUB_TOKEN`.
- **README** — install block simplified, added npm version badge,
  Node prerequisite corrected to 24+ (matches `engines.node`).
- **`bin` entry** normalized to `cli-dist/bin.js` (was `./cli-dist/bin.js`)
  via `npm pkg fix` — restores `npx @bleizlabs/ui` post-install.

## [0.11.1] — 2026-05

### Fixed

- **`prepublishOnly` lint failure on `playwright-report/`.** When the
  publish workflow ran `test:smoke` before `npm publish`, the generated
  `playwright-report/` directory contained Playwright's minified UI
  assets, which the subsequent `prepublishOnly`-triggered lint scanned
  as application code (errors on `no-this-alias`). Added
  `playwright-report/**` and `test-results/**` to the `lint` script's
  ignore patterns so generated artifacts are never linted.
- **`test:smoke` accidentally ran the per-component suite.** v0.11.0
  changed the script from `playwright test tests/smoke.spec.ts` to
  `playwright test tests/` to pick up the new `baseline-reset.spec.ts`.
  Playwright treats positional path arguments as substring filters
  rather than prefix filters, so `components/<X>/tests/<Y>.spec.ts`
  matched the substring `tests/` and got executed under the smoke
  budget — surfacing per-component flakiness inside the smoke gate.
  Reverted to an explicit spec list:
  `playwright test tests/smoke.spec.ts tests/baseline-reset.spec.ts`.

### Notes

- v0.11.0 was functionally identical to v0.11.1 (CLI category-nested
  wrapper layout + body baseline reset). Only the CI gates differ.

## [0.11.0] — 2026-05

### Fixed

- **Body baseline reset shipped with `@use '@bleizlabs/ui/styles'`.** The
  `BASE STYLES` section in `_semantics.scss` previously declared its intent
  as "applied to `:root` + `body`" but only `:root` was implemented. The
  body element kept the browser default `margin: 8px`, forcing every
  consumer to add an `html, body { margin: 0; padding: 0 }` workaround in
  `app/globals.scss`. Lib now ships a conservative reset directly:

  ```scss
  html { scroll-behavior: smooth; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
  }
  body { margin: 0; padding: 0; min-height: 100dvh; }
  ```

  Conservative on purpose — no `display: flex` or other layout convention
  on body. Consumers retain freedom over their root layout primitive
  (`Stack`, `GridLayout`, page-specific markup). A regression test in
  `tests/baseline-reset.spec.ts` pins the contract so this cannot
  silently regress again.

### Changed

- **CLI wrapper layout — category-nested folders.** `npx @bleizlabs/ui init`
  and `add` now generate the project wrapper layer mirroring the library's
  own `components/<category>/` structure for navigability. Layout:

  ```text
  app/_components/ui/
    layout/{Container,Stack,Inline,Section,GridLayout}/
    typography/{Heading,Text,Anchor,Eyebrow}/
    display/{Badge,Card,Avatar,Table,...}/
    interactive/{Button,Input,Switch,...}/
    feedback/{Alert,Empty,Progress}/
    specialized/{Breadcrumb,Pagination,...}/
    molecules/{Chip,DataRow,Timeline,...}/
    presets/{EntityCard,ZoneCard,SiteHeader,...}/
    complex/{Dialog,Combobox,Calendar,...}/
    utils/{cn,...}/
    types/{spacing,...}/
    index.ts
  ```

  Previous flat layout (every component as a sibling under `ui/`) hit
  navigability friction past ~30 wrappers. Mirroring the lib taxonomy
  keeps file-tree exploration cheap as the library grows.

### Added

- **Auto-migration from flat → nested layout.** First run of CLI v0.11.0 on
  a project initialized with v0.10.x detects flat-layout wrapper folders
  (those containing the `// @bleizlabs/ui-generated` marker) and moves
  each into its category subdirectory before regenerating. No consumer
  action required — re-run `npx @bleizlabs/ui add --new` and the layout
  reorganizes itself.

  - Folders without the generated marker (user-authored) are left alone.
  - When both flat and nested paths exist for the same family, the
    conflict is surfaced and the operator decides which to keep.
  - The root `index.ts` barrel re-exports use category paths
    (`export * from './display/Card'`), so the public API surface
    (`import { Card } from '@/components/ui'`) is unchanged.

### Migration

If a consumer imports a wrapper from a deep path (e.g.
`from '@/components/ui/Card'`), update to import from the root barrel
(`from '@/components/ui'`). Deep imports were never the documented
pattern but may have been used incidentally — they break under the new
layout. Root-barrel imports keep working.

## [0.10.2] — 2026-05

### Fixed

- **CLI `nextconfig-patcher` stray comma.** When a fresh
  `create-next-app` produced `next.config.ts` with comment-only body
  (`{ /* config options here */ }`), the patcher inserted a stray comma
  after the comment, causing `next build` to fail with `SyntaxError`.
  Fixed by stripping trailing comments + whitespace iteratively before
  the last-meaningful-char check.

## [0.10.1] — 2026-05

First public release.

### Added

- **101 components across 10 categories.**
  - **Layout (5):** `Container`, `Section`, `Stack`, `Inline`, `GridLayout`.
  - **Typography (4):** `Heading` (13 sizes including atelier display tier), `Text` (6 variants), `Anchor`, `Eyebrow`.
  - **Display (13):** `AspectRatio`, `Avatar`, `Badge`, `Card` (compound: `CardHeader` / `CardBody` / `CardFooter` / `CardSection`), `EdgeBar`, `IconBox`, `KpiValue`, `PercentValue`, `Reveal`, `Separator`, `Skeleton`, `Spinner`, `Table` (compound).
  - **Interactive (17):** `Accordion`, `Button`, `ButtonGroup`, `Checkbox`, `Input`, `InputGroup`, `Label`, `MaskedInput`, `NumberInput`, `PasswordInput`, `PhoneInput`, `RadioGroup`, `Switch`, `Textarea`, `TextLink`, `Toggle`, `ToggleGroup`.
  - **Feedback (3):** `Alert`, `Empty`, `Progress`.
  - **Specialized (9):** `AnimatedCounter`, `AvailabilityBar`, `BarChart`, `Breadcrumb`, `Dot`, `Kbd`, `MetricBar`, `Pagination`, `UsageDonut`.
  - **Molecules (15):** `AccordionGroup`, `BackLink`, `BreakdownList`, `Chip`, `DataRow`, `DeadlineBadge`, `FileChip`, `IconButton`, `MetricTile`, `PageHeader`, `RevealStack`, `SectionDivider`, `SectionHeader`, `Timeline` (compound), `ToggleGroupFilter`.
  - **Card presets (11):** `ActionCard`, `CollapsibleZoneCard`, `ContentCard`, `EntityCard`, `EntityHero`, `FormCard`, `IconHeaderCard`, `PairedCard`, `SidebarCard`, `StatsCard`, `ZoneCard`.
  - **Composition presets (1):** `SiteHeader` (page-level nav with mobile drawer).
  - **Complex interactive (22):** `Dialog`, `AlertDialog`, `Drawer`, `Sheet`, `Tooltip`, `Popover`, `DropdownMenu`, `ContextMenu`, `HoverCard`, `NavigationMenu`, `Tabs`, `Select`, `Combobox`, `Calendar`, `DatePicker`, `Toast`, `Slider`, `Carousel`, `ScrollArea`, `InputOTP`, `Command` (⌘K palette), `Sidebar`.
- **Seed-based design tokens** — override 5–10 seed values to reskin the entire library across light + dark themes.
- **`bleizlabs-ui` CLI** — `init` / `add` / `status` commands for project scaffold + wrapper layer + theme files.
- **WAI-ARIA APG-compliant patterns** across all interactive components.
- **In-house primitives** — `Slot` (asChild polymorphism), `useFloating`, `useFocusTrap`, `usePointerDrag`, `useMatchMedia`, date utilities. Zero runtime UI dependencies.
- **Test infrastructure** — Playwright per-component suites (keyboard / focus / aria / regression) + library-wide `@axe-core/playwright` WCAG 2.1 AA sweep.
- **React 19 + Next.js 16.2 support** with Server Components, Turbopack, App Router.

### Notes

- This is the first version published as open-source. Earlier development versions
  (`0.1.0` → `0.9.x`) were internal and are not documented in this public changelog.
- Distributed via GitHub Packages as a scoped package. See [README.md](README.md)
  for installation instructions.

[Unreleased]: https://github.com/BleizLabs/bleizlabs-ui/compare/v0.16.0...HEAD
[0.16.0]: https://github.com/BleizLabs/bleizlabs-ui/releases/tag/v0.16.0
[0.15.0]: https://github.com/BleizLabs/bleizlabs-ui/releases/tag/v0.15.0
[0.14.0]: https://github.com/BleizLabs/bleizlabs-ui/releases/tag/v0.14.0
[0.13.1]: https://github.com/BleizLabs/bleizlabs-ui/releases/tag/v0.13.1
[0.13.0]: https://github.com/BleizLabs/bleizlabs-ui/releases/tag/v0.13.0
[0.12.0]: https://github.com/BleizLabs/bleizlabs-ui/releases/tag/v0.12.0
[0.11.3]: https://github.com/BleizLabs/bleizlabs-ui/releases/tag/v0.11.3
[0.11.2]: https://github.com/BleizLabs/bleizlabs-ui/releases/tag/v0.11.2
[0.11.1]: https://github.com/BleizLabs/bleizlabs-ui/releases/tag/v0.11.1
[0.11.0]: https://github.com/BleizLabs/bleizlabs-ui/releases/tag/v0.11.0
[0.10.2]: https://github.com/BleizLabs/bleizlabs-ui/releases/tag/v0.10.2
[0.10.1]: https://github.com/BleizLabs/bleizlabs-ui/releases/tag/v0.10.1
