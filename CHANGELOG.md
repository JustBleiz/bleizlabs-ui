# Changelog

All notable changes to `@bleizlabs/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning 2.0](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/BleizLabs/bleizlabs-ui/compare/v0.11.1...HEAD
[0.11.1]: https://github.com/BleizLabs/bleizlabs-ui/releases/tag/v0.11.1
[0.11.0]: https://github.com/BleizLabs/bleizlabs-ui/releases/tag/v0.11.0
[0.10.2]: https://github.com/BleizLabs/bleizlabs-ui/releases/tag/v0.10.2
[0.10.1]: https://github.com/BleizLabs/bleizlabs-ui/releases/tag/v0.10.1
