# Changelog

All notable changes to `@bleizlabs/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning 2.0](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/BleizLabs/bleizlabs-ui/compare/v0.15.0...HEAD
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
