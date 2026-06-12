# Changelog

All notable changes to `@bleizlabs/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning 2.0](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_No unreleased changes._

## [0.28.0] — 2026-06-12

**Minor release — post-0.27 quality + behavior patch (WU-1 Tier B + WU-2 Tier A).**
Ships mechanical fixes from audit FOLLOW-UPs plus four intentional behavior
changes (Sonner parity, typings, DataTable page-size selector, nested Escape).

### Behavior changes

- **`toast.promise`** — success/error states no longer inherit `duration:
Infinity` from the loading toast; they reset to the global default unless an
  explicit `duration` is passed on the resolved call (Sonner parity). Test
  TST-R22.
- **`SelectTrigger` / `ComboboxInput`** — `id` is omitted from public props
  (lib assigns stable ids for listbox wiring). Pass `aria-labelledby` /
  `aria-label` or wrap with `<label htmlFor>` instead.
- **`DataTable` pagination** — when `pagination.pageSizeOptions` is a
  non-empty array, the footer renders a native page-size `<select>` wired to
  `labels.rowsPerPage` and `onPaginationChange`.
- **Floating dismiss + nested modals** — Popover/DropdownMenu (via
  `useFloatingDismiss`) and Select/Combobox listboxes register on the shared
  `escapeStack`; Escape closes the topmost surface first (Dialog + overlay APG
  ordering, Radix #1951/#2450).

### Fixed

- **DropdownMenuContent** — `{...rest}` spread first; merged `style` and composed
  `onKeyDown` no longer clobbered by consumer rest props.
- **AlertDialog / Sheet / Drawer** — removed dead `data-state` attributes and
  duplicate escapeStack JSDoc blocks.
- **AccordionGroup** — optional `headingLevel` pass-through to child
  `Accordion` headings.
- **Accordion / TextLink / Anchor SCSS** — removed dead `outline-offset` after
  focus-ring mixin.
- **Drawer regression spec DR-17** — overlay locator no longer depends on
  removed `data-state`.

### Changed

- **`useFloatingDismiss`** — Escape path delegates to `useFloatingEscapeStack`
  instead of a flat document listener.

## [0.27.0] — 2026-06-12

**Minor release — full remediation of the 2026-06-11 library audit (5
reviewers) + new `SkipLink` atom + CI quality gates.** Every audited
component went through an adversarial fix loop (pre-audit → fix → fresh
re-audit) closed at 0 CRITICAL / 0 IMPORTANT. Also ships the Button `href`
docs fix (#56, merged 2026-06-11) that never reached npm — the previous
"no unreleased changes" claim under `[Unreleased]` was wrong, and the
planned docs-only 0.26.1 is superseded by this release (deliberate).

### Added

- **`SkipLink`** — new interactive atom (WCAG 2.4.1 Bypass Blocks):
  visually-hidden anchor revealed on keyboard focus as a fixed top-left
  pill above every layer. Server-safe (no `'use client'`), zero JS —
  native fragment navigation; label is the accessible name (pass a
  localized string for i18n). Default `href="#main"`; pair with
  `<main id="main" tabIndex={-1}>`. Regression suite SK-R01..R04 + demo
  route `/components/skip-link`.
- **`--z-skip-link` token** (70) — new top tier of the z-index scale,
  above `--z-toast` (60).
- **CI `quality` job** — `lint:css`, `format:check`, `audit:jsdoc`,
  `audit:demos`, `tokens:verify`, `check:manifest`, and the new
  `check:manifest:sync` now run on every push/PR (previously publish-only
  or never).
- **`build:manifest --check`** (`npm run check:manifest:sync`) — CI drift
  gate: regenerates the manifest in memory and fails when the committed
  `components/manifest.json` is stale (`generatedAt` excluded).
- **§J stamp gate** in `check-agents-doc` — the AGENT-USAGE inventory
  stamp ("at lib version X") must match `manifest.libVersion`; a stale
  committed table now fails CI instead of lagging releases unnoticed.
- **`audit:jsdoc` checks every exported `*Props` interface** (previously
  only the first per file) — 81 props across 15 compound components were
  documented to bring the surface to 100%.
- **Playwright browser cache** in CI (keyed by `@playwright/test`
  version) for the smoke + e2e jobs.

### Changed

- **Smoke suite routes are filesystem-derived** — every
  `app/components/*/page.tsx` joins the axe scan automatically (51 → 80
  scanned routes incl. the new SkipLink demo; the old hand-maintained list
  silently carried 5 dead routes and missed ~40 live ones). Each excluded route lives in an
  explicit `SKIP_ROUTES` map with an observed reason + staleness guard,
  and every scan now asserts HTTP 200 (a deleted demo previously passed
  against Next's axe-clean 404 page).
- **Packaging:** `engines.node` relaxed `>=24` → `>=20`; tarball no
  longer ships `components/**/tests` (173 spec files + mirrors, −1.3 MB
  unpacked); `sass` declared as an **optional** `peerDependency`
  (consumer build compiles the shipped SCSS; not auto-installed);
  `"./package.json"` export added; `prepack` builds the CLI so
  `npm pack` artifacts are complete.
- **Regen scripts emit prettier-clean output** (`build:manifest`,
  `build-agent-inventory`) — regenerating no longer dirties
  `format:check`.
- **Docs truthfulness sweep:** AGENT-USAGE §E.6 now documents the REAL
  `Dialog` API (controlled, monolithic `open`/`onOpenChange` +
  `title`/`description`/`footer` — the previous example showed a
  fictional `Dialog.Trigger`/`Dialog.Content` compound that never
  compiled); §E.7 Tabs sub-part names corrected
  (`TabsList`/`TabsTrigger`/`TabsContent`); §B.3 token chain corrected to
  `_project-settings → _generator → _semantics`; 19 component headers
  de-referenced the phantom `docs/specs/` directory (never existed) and
  now point at the per-component `tests/` quad, with 6 inflated case
  counts corrected to reality (Carousel 25→19, Command 22→20, DatePicker
  22+→21, ScrollArea 20→16, Slider 29→25, Toast 22+→21); README component
  buckets realigned with the manifest.

### Fixed

- **Button** — disabled `<Button href onClick>` no longer fires the
  handler (programmatic/AT activation included); `asChild` forwards
  `onClick` with the same disabled guard; disabled anchors keep
  `role="link"` so `aria-disabled` stays valid.
- **Tabs / DropdownMenu / Select** — `asChild` triggers forward
  `{...rest}` mirroring the native branch (consumer `data-*`/`title`
  attributes were silently dropped).
- **Select** — closed-listbox typeahead was dead code; printable
  characters now open the listbox and apply a deferred match (APG);
  `Home`/`End`/`ArrowUp` on a closed, valueless trigger seed
  first/last as documented; missing-accessible-name dev warning added.
- **Combobox** — debounced `role="status"` announcer reports the filtered
  result count (WCAG 4.1.3; `resultsAnnouncement` prop for i18n);
  missing-accessible-name dev warning added.
- **Dialog family (Dialog/AlertDialog/Sheet/Drawer/HoverCard)** — escape
  stack no longer reorders when a parent re-renders with an inline
  `onOpenChange` (nested Escape closed the wrong dialog);
  `closeOnEscape={false}` now shadows ancestors instead of letting
  Escape fall through; focus trap skips invisible tabbables.
- **Sidebar** — the mobile drawer joins the shared escape stack: Escape
  with a Dialog open above the drawer closes only the Dialog.
- **Toast** — `<Toaster duration>` is wired to the store (was silently
  discarded); a toast created/updated during hover-pause no longer
  becomes permanently sticky; announcements use a persistent polite
  live region so SRs catch every toast.
- **DataTable** — selection identity unified on `getRowId` with a global
  row index (index-based `getRowId` no longer desyncs on paging; controlled
  `selectedRows` survives refetched object clones); sort buttons expose
  `"<Header>: Sort …"` accessible names (WCAG 2.5.3); `pageSizeOptions`
  de-claimed as reserved (was a silent no-op); mobile card list uses
  `role="list"`/`listitem` (valid required-children); `aria-busy` on
  loading.
- **Accordion** — triggers render inside a real heading (`headingLevel`
  prop, default `<h3>`, full style reset — APG conformance).
- **Card** — `variant="accent"` delivers the documented 3px left brand
  accent; dead `.accentTop`/`.hoverable` rules removed.
- **Calendar** — hydration-safe "today" (`useSyncExternalStore`); SSR/SSG
  HTML no longer risks a server/client mismatch on the today highlight.
- **Alert / Banner** — "Server-safe" JSDoc claims qualified (function
  props imply a client parent); Banner dismiss hover scrim is theme-aware
  (`color-mix` on `--color-text-primary`); Alert forced-colors border;
  dead CSS removed.
- **PieChart** — label halo tokenized to the `--piechart-label-halo`
  channel (visual no-op).
- **NumberInput** — see Behavior changes; also `String()` formatting on
  focus no longer rounds the model on a focus+blur without edits.
- **Tokens** — `--color-accent-subtle/strong` follow the brand pattern
  (`$seed-mode` + `[data-theme]` overrides); `_mixins.scss`
  letter-spacings reference `--letter-spacing-*` tokens; animation roster
  comment corrected (17 keyframes).
- **Docs** — `AGENT-USAGE.md` Button example used a nonexistent
  `variant="danger"` (→ `"warning"`); Select aria/focus spec mirrors
  claimed DEFERRED while their suites run in CI.

### Behavior changes

Migration notes — each line is the one consumer-visible delta:

1. **NumberInput + native forms:** the submitted value is now the
   canonical numeric string (`"1234.56"`), not the locale-formatted
   display (`"1 234,56"`). Backends parsing the old display format must
   read the canonical value.
2. **NumberInput focus:** focus+blur without an edit no longer mutates
   the model (previously `toFixed` rounded it, e.g. 1.5 → 2 with
   `decimals={0}`).
3. **DataTable selection:** with the default `getRowId`, selection
   follows the ROW (global data index) after sorting — not the visual
   position; controlled `selectedRows` matches by id, so refetched
   clones stay selected.
4. **DataTable mobile:** card fallback exposes `role="list"`/`listitem`
   instead of an invalid grid; selection/expansion states move from
   `aria-*` to `data-*` attributes there.
5. **DataTable sort buttons:** accessible name is now
   `"<Header>: Sort ascending/descending"` — AT scripts matching the bare
   "Sort …" name need the prefix.
6. **Accordion DOM:** the trigger button is wrapped in a heading element
   (default `<h3>`, configurable `headingLevel`) — DOM depth +1; CSS/test
   selectors assuming the button is a direct child need updating.
7. **Toaster `duration`:** the prop now actually applies as the global
   default. Code passing `duration` that silently fell back to 4000 ms
   will see the configured timing.
8. **Card `variant="accent"`:** now renders the documented left accent
   bar (previously identical to `default`).
9. **Calendar today-marker:** rendered post-hydration; SSR/SSG HTML has
   no `aria-current="date"` until the client mounts.
10. **Chip:** now a Client Component (`'use client'`) — it no longer
    crashes RSC trees with its default interactive props, but it adds a
    client boundary where a bare Chip was previously server-rendered.
11. **Dark-theme accent tokens:** `--color-accent-subtle/strong` resolve
    to accent-900/300 in dark (previously light-theme values leaked);
    no in-repo consumer used the dark path, but token values changed.
12. **Tarball:** `components/**/tests` excluded — consumers importing
    spec files from `node_modules` (unsupported) lose them.

## [0.26.0] — 2026-05-19

**Minor release — `Text` brand-color token correction + repository-wide
code-formatting baseline (Prettier + Stylelint).** Two threads bundled into
one release:

1. **`Text color="brand"` realigned to the canonical brand token** — reverts
   the E142 L2 a11y pin that mapped `brand` to the theme-aware
   `--color-brand-strong` (brand-700 light / brand-300 dark). `Text` now maps
   to `--color-brand` (= `--color-brand-500`), keeping brand text visually
   consistent with every other piece of brand chrome (buttons, links,
   borders, focus rings, icons). Projects needing higher-contrast brand text
   override `--color-brand` at `:root` or compose explicit
   `--color-brand-strong` styles — documented inline + in the regression
   spec. Trade-off: on mid-tone brand seeds `brand-500` can fall below WCAG
   AA (~3.9:1) against raised/card surfaces; this is now a deliberate,
   documented consumer-tunable default rather than a hard pin.
2. **Formatting toolchain + baseline** — the codebase shipped 25 releases
   without an enforced formatter. 0.26.0 adds Prettier + Stylelint
   (`stylelint-config-standard-scss`) with `eslint-config-prettier` to
   disable conflicting ESLint stylistic rules, then applies the one-time
   format baseline across the repo. No logic changed — pure whitespace /
   quote / trailing-comma normalization. Future diffs stay
   formatting-noise-free; `format:check` + `lint:css` become CI-gateable.

### Added

- **Prettier** (`prettier@^3.8.3`, `eslint-config-prettier@^10.1.8`) —
  `.prettierrc` (single-quote, `printWidth: 100`, `trailingComma: all`,
  `endOfLine: lf`), `.prettierignore`, and `format` / `format:check` npm
  scripts.
- **Stylelint** (`stylelint@^17.11.1`,
  `stylelint-config-standard-scss@^17.0.0`) — `stylelint.config.mjs`
  (`declaration-no-important: true`, `at-rule-disallowed-list: [import]`,
  `scss/load-partial-extension: never`, `_animations.scss` `!important`
  override), `.stylelintignore`, and `lint:css` / `lint:css:fix` scripts.
- **`.editorconfig`** — charset/EOL/indent baseline (2-space default,
  4-space Python, tab Makefile, no md trailing-trim).
- **`verify` npm script** — `lint && lint:css && typecheck` convenience gate.
- **`Text.regression.spec.ts`** — asserts `color="brand"` computed color
  equals the resolved `--color-brand` token.

### Fixed

- **`Text` `color="brand"` token mapping** — `components/typography/Text/Text.tsx`
  now maps `brand → var(--color-brand)` (was `var(--color-brand-strong)`).

### Changed

- **Repository-wide Prettier format baseline** — 534 files normalized
  (formatting only, zero behavioral change).
- **`eslint.config.mjs`** — appends `eslint-config-prettier/flat`; ignores
  expanded (`cli-dist/`, `cli/test-fixtures/`, `playwright-report/`,
  `test-results/`). `lint` / `lint:fix` simplified to `eslint .` (ignores
  now live in flat config, not CLI flags).

## [0.25.0] — 2026-05-13

**Minor release — Agent Cheat-Sheet inside the npm package + DateTimePicker
spec alignment (rolls up the abandoned 0.24.1 patch path).** Two threads
bundled into one release:

1. **Agent Cheat-Sheet for AI coding agents working in consumer projects** —
   ships `AGENTS.md` (thin entry point, ~80 LOC: mission + Q1-Q5 decision
   tree + top-10 anti-patterns + pointers) and `docs/AGENT-USAGE.md` (deep
   reference, ~750 LOC: 9 per-domain quick-starts, SSR/RSC mapping,
   troubleshooting, full 106-component inventory) inside the published npm
   tarball. Both docs carry a `**Valid for:** @bleizlabs/ui 0.25.0` header
   injected at publish time.
2. **DateTimePicker regression test alignment** — the 0.24.0 display change
   (`T` → space separator) shipped without updating the per-component
   Playwright specs, blocking the CI `test` workflow on `main` and
   therefore the `v0.24.0` auto-tag + npm publish. 0.25.0 bundles the
   8-assertion fix; v0.24.0 will remain untagged forever (consumers
   installing via npm see 0.25.0 directly).

### Added

- **`AGENTS.md` (npm tarball, lib root)** — agent-friendly entry point with
  mission paragraph, Q1-Q5 reuse-first decision tree, top-10 anti-patterns
  table with one-line fix recipes, and pointers to `docs/AGENT-USAGE.md` +
  per-component JSDoc. Carries `**Valid for:** @bleizlabs/ui <version>`
  staleness header. Authored to live below the existing 7-line Next.js
  managed stub (markers preserved).
- **`docs/AGENT-USAGE.md`** — deep reference covering installation, Next.js
  config, SCSS bootstrap, three-layer token override cascade, CLI scaffold,
  expanded Q1-Q5 decision rules, `asChild` polymorphism, SSR/RSC/Next.js 16
  patterns (Server Component default, `'use client'` placement, server-data
  prop-drilling, FloatingPortal hydration, React Compiler interop), 9
  per-domain quick-starts (Layout, Typography, Forms, Display, Feedback,
  Overlays, Complex/Data, Specialized+Navigation, Charts), anti-patterns
  with situational appendix, deliberate omissions + external lib pairings
  (dnd-kit, lexical, fullcalendar, etc.), 20-row quick-reference card,
  troubleshooting table, and full component inventory auto-generated from
  `manifest.json`.
- **README `## For AI agents` section** — human-facing pointer to the npm-
  shipped agent docs + copy-paste snippet for consumer-project `AGENTS.md`.
- **`scripts/build-agent-inventory.mjs`** — generates the inventory table
  in `docs/AGENT-USAGE.md` Section J from `manifest.json`, injected between
  `<!-- INVENTORY:START -->` / `<!-- INVENTORY:END -->` markers. Prose
  around the markers is preserved.
- **`scripts/check-agents-doc.mjs`** — CI gate. Verifies inventory row
  count matches `manifest.json` `components.length`, and that every
  identifier imported from `'@bleizlabs/ui'` in TS/TSX-tagged code fences
  resolves to a real export (`bash` / `scss` / `text` fences skipped;
  `js` / `jsx` fences containing lib imports get a soft warn). Added to
  `prepublishOnly`.
- **`scripts/inject-doc-version.mjs`** — injects current `package.json`
  `version` into `__VERSION__` tokens in the agent docs at publish time,
  reverts via `git checkout` after publish (`postpublish` hook).
- **`agent-docs` + `claude-code` keywords** added to `package.json`.

### Fixed

- **`DateTimePicker` Playwright specs** — 8 display-value assertions
  migrated from ISO `T` to space separator to match the 0.24.0 display
  contract. Updated tests:
  `DateTimePicker.regression.spec.ts` (DT-R02, DT-R04, DT-R05, DT-R06,
  DT-R08), `DateTimePicker.compose.spec.ts` (DT-CMP01, DT-CMP02),
  `DateTimePicker.input.spec.ts` (DT-IN05). Hidden-input ISO assertions
  (DT-R10, DT-CMP03/04/05, form spec) unchanged — transport semantics
  intentionally separate from display per 0.24.0 contract.

### Changed

- **`scripts/build-component-manifest.mjs`** — schema-additive extension
  emitting two new fields on each `components[]` entry: `isClient`
  (boolean — `true` IFF the family's primary file carries a top-of-file
  `'use client'` directive) and `summary` (first JSDoc sentence,
  ≤120-char target with truncation + WARN log if exceeded).
  `manifest-schema.json` updated additively (schemaVersion unchanged —
  readers that ignore unknown fields stay compatible).
- **`package.json` `files` array** — added `docs` (folder-level for forward
  compat) and `AGENTS.md` so both agent doc artifacts ship in the
  published tarball.
- **`prepublishOnly`** — chain now runs `build-agent-inventory.mjs` →
  `check-agents-doc.mjs` → `inject-doc-version.mjs` after the existing
  manifest + barrel + CLI build gates. `postpublish` hook auto-reverts
  the version injection.
- **README + package.json description** — replaced stale literal "107
  focused components" with "100+ focused components" + pointer to
  `manifest.json` for live count.

### Consumer action recommended

Consumer projects with `@bleizlabs:registry=https://npm.pkg.github.com`
in their `.npmrc` should **remove that line** — the lib publishes to the
public npm registry (`registry.npmjs.org`) since 0.22.x. A stale GitHub
Packages registry pointer will either fail to install or fetch an outdated
version. Confirmed seen in at least one BleizLabs internal consumer; please
audit your own consumer projects.

After upgrade, add the agent-discovery snippet to your consumer project's
own `AGENTS.md` per the README `## For AI agents` section so AI coding
agents in your workspace pick up `node_modules/@bleizlabs/ui/AGENTS.md` at
the start of any UI task.

## [0.24.0] — 2026-05-13

**Minor release — first real-world testing batch (4 fixes).** User-reported
issues surfaced during initial real-world verification post-0.23.0 ship.
Bundles 2 bugfixes + 2 small features. Family count unchanged (107).

### Fixed

- **`DateTimePicker` — readable date/time display** — the input field
  now shows `2026-05-13 14:30` (space separator) instead of
  `2026-05-13T14:30` (ISO `T`). The `T` was correct for transport
  semantics but read as a glitch in a free-text field. Parser remains
  permissive — both `YYYY-MM-DDTHH:MM[:SS]` (ISO) and
  `YYYY-MM-DD HH:MM[:SS]` (human) round-trip cleanly, so consumers
  pasting an ISO string still parse.
- **`<Toaster>` — SSR hydration mismatch eliminated** — Toaster
  rendered its `FloatingPortal` unconditionally (unlike Dialog/Tooltip/
  Popover which short-circuit on `!open`). On the server the portal
  returned `null`, on the client it mounted `<ol>` into
  `document.body` — React 19 dev mode flagged the server↔client first-
  paint difference as a hydration mismatch. Added the canonical Radix-
  style one-shot mount gate (`useState` + `useEffect` empty-deps) so
  both trees render `null` on first paint; the portal materialises on
  the second client commit. ARIA live region is unaffected because
  `toast()` is an imperative API consumers call after first paint.

### Added

- **`Input` — `size` prop (`'sm' | 'md' | 'lg'`)** — visual size preset.
  `'md'` (default) matches the original 0.x layout exactly so existing
  consumers see zero change. `'sm'` shrinks padding (space-2 / space-3),
  font (`--font-size-sm`), wrap radius (`--radius-sm`), and addon /
  icon dimensions for toolbars and inline-filter rows. `'lg'` enlarges
  for emphasised hero forms. Variants remap three CSS custom properties
  (`--input-py` / `--input-px` / `--input-font-size`) instead of
  duplicating layout rules. Charter atom-budget compliant (now 3 variant
  props: `type` + `size` + `invalid`).
- **`<DataTable>` default filter Input → `size="sm"`** — the in-cell
  text filter no longer dwarfs the toolbar; the entire filter row reads
  as a single compact widget. Consumer-supplied `renderFilter` is
  untouched.
- **`@bleizlabs/ui/styles/scrollbar` — opt-in global scrollbar
  prettifier** — new SCSS partial that styles every native browser
  scrollbar on the page (window, overflowed divs, textareas, …) to
  match the lib aesthetic. CSS-only — no React mounting required, no
  JS overhead, no token forks. Two ways to use:

  ```scss
  // Global (recommended) — paint every scrollable region in your app
  @use '@bleizlabs/ui/styles';
  @use '@bleizlabs/ui/styles/scrollbar';
  ```

  ```scss
  // Per-element opt-in
  @use '@bleizlabs/ui/styles/scrollbar' as scrollbar;
  .myScrollable {
    @include scrollbar.scrollbar-prettify;
  }
  ```

  Reads existing semantic tokens (`--color-border` / `--color-text-muted`
  / `--radius-full`) so light/dark theme switching works without extra
  wiring. WebKit + Firefox (Chromium-style hover state, `scrollbar-color`
  fallback for Firefox). Complements `<ScrollArea>` — the React
  component remains for cases needing JS-driven thumb + ARIA orientation;
  this CSS recipe covers the 90% case of "make my page chrome look like
  the lib".

### Notes

- Family count: 107 (unchanged — no new components).
- No breaking changes. `Input.size` defaults to `'md'` (legacy layout);
  `DateTimePicker` parser accepts the prior ISO format alongside the new
  display format.
- 0.23.1 doc patch (104 → 107 description corrections, audit script
  utility-component coverage) is folded into this release — 0.23.1
  branch never landed on main.

## [0.23.1] — 2026-05-13

**Patch — README / package description / demo-coverage audit accuracy.**
0.23.0 ship referenced stale 104-family count in `package.json`
description + README highlights, and the demo-coverage audit script
blanket-skipped `utils/` (missing `VisuallyHidden` from the count). No
runtime change — docs + tooling only.

### Fixed

- **README + `package.json` description** — bumped 104 → 107 component
  count and added a 0.23.0 entry to the version history paragraph
  describing CodeBlock + Mark + VisuallyHidden + Phase 4.5 audit.
- **`scripts/audit-demo-coverage.mjs`** — replaced the blanket `utils/`
  skip with a fine-grained `UTILS_SKIP` set listing only internal
  building blocks (Slot, cn, mergeRefs, date / masks / floating /
  gesture / locale / match-media / tests). User-facing utility
  components like `VisuallyHidden` are now included in the coverage
  count. Reports 107 / 107 pass.

### Notes

- No new components. No API change.
- Tag `v0.23.1` triggers a fresh npm publish so the registry reflects
  the corrected description string.

## [0.23.0] — 2026-05-13

**Minor release — 3 new components + Phase 4.5 demo coverage audit.** All
three additions passed the Charter Klocek-vs-Organism binding test (single
concept, data-shape neutral, zero auto-wrap, no surface bias, prop budget
within layer cap). Family count 104 → 107.

### Added

- **`CodeBlock` (display, molecule)** — preformatted code surface with
  optional language badge, copy-to-clipboard button, and 1-indexed
  line-number gutter. Structural-only — the lib does NOT tokenize or
  highlight (zero-deps charter R8). Consumers feed pre-tokenized children
  from their own Shiki / Prism / Highlight.js pipeline, or pass plain
  strings for a raw monospace block. Copy button auto-extracts payload
  from string children; `copyText` prop overrides when `children` is a
  React tree.
- **`Mark` (typography, atom)** — inline `<mark>` highlight atom.
  Token-driven five-color enum (`default` / `brand` / `success` /
  `warning` / `error`) maps to `--color-{tone}-{subtle,strong}` semantic
  pairs. Default tone matches native browser `<mark>` (warning-subtle).
  `asChild` polymorphism projects onto `<span>` for decorative usage
  without AT announcement.
- **`VisuallyHidden` (utility, atom)** — promotes the existing `sr-only`
  SCSS mixin to a React primitive so consumer code can author
  accessible-name overlays, chart captions, and skip-target labels
  without owning the screen-reader-only CSS recipe. Geometry-only (no
  tokens) — mirrors `@include mx.sr-only` exactly so SCSS callers and
  React callers produce identical output.

### Tooling

- **`scripts/audit-demo-coverage.mjs`** (new) — Phase 4.5 audit script
  verifying every shipped lib component has a matching demo route under
  `app/components/<kebab-case-name>/page.tsx`. Compound exports and
  aggregator landing pages (feedback / selection / toggles / molecules /
  input-production / specialized) are handled via an explicit alias map.
  Surfaced as `npm run audit:demos` and runs in <50ms. All 107
  components currently pass.

### Notes

- Family count: 107 (104 + CodeBlock + Mark + VisuallyHidden). Manifest
  regenerated.
- No breaking changes. All previous APIs intact.
- Phase 4.5 audit now part of the pre-publish discipline alongside
  `check:barrel`, `check:manifest`, and `audit:jsdoc`.

## [0.22.1] — 2026-05-13

**Patch release — Slot hydration fix (Mantine pattern) + deps bump.** Resolves
the long-standing dev-mode hydration mismatch on every `<X asChild>` consumer
in Next.js 16.0.10+ + React 19.1+ (panel, scout-hub, bleizos clients all
affected). Production was always functional — this clears the dev console
overlay for clean DX during development. Zero API change.

### Fixed

- **`Slot` — hydration mismatch on `asChild` consumers** — upstream Next.js
  RSC serializer regression ([vercel/next.js#82527](https://github.com/vercel/next.js/issues/82527),
  [radix-ui/primitives#3780](https://github.com/radix-ui/primitives/issues/3780))
  hands `cloneElement` consumers a lazy-reference children value
  (`$$typeof: Symbol(react.lazy)` with pending Promise) instead of the
  resolved element. `isValidElement` returns true on the lazy reference, so
  the prior Slot cloned the wrong type — client first paint rendered the
  host's default tag (`<div>`), then the lazy payload resolved and React
  19 dev-mode hydration check surfaced the diff (`+ <div> / - <a>`).

  Fix: wrap `children` in `React.Children.toArray()` BEFORE the
  `isValidElement` check. React's reconciler resolves lazy children
  internally during `toArray`, so the subsequent `cloneElement` receives
  the real element. Validated upstream by
  [mantinedev/mantine#8522](https://github.com/mantinedev/mantine/pull/8522)
  against the Radix repro.

  Three lines changed in `components/utils/Slot/Slot.tsx`. No consumer
  migration required — all 34 forwardRef consumers (Card, Stack, Section,
  Badge, Inline, Eyebrow, Label, Heading, Text, Anchor, + 24 more) work
  unchanged. Prior 5 migration attempts (0.20.1 + 0.21.1) chasing
  `forwardRef → ref-as-prop` targeted the wrong layer and are abandoned.

### Changed

- **Next.js `^16.2.3` → `^16.2.6`** (patch bump — Cache Components,
  Turbopack stability)
- **React `^19.0.0` → `^19.2.6`** + **React DOM `^19.0.0` → `^19.2.6`**
  (19.2 ships the `useId` prefix change, improved Suspense streaming,
  `<Activity>` primitive)
- **@types/react `^19.0.0` → `^19.2.14`**, **@types/react-dom `^19.0.0` →
  `^19.2.3`**, **eslint-config-next `^16.2.3` → `^16.2.6`**

Note: Next.js bump alone does NOT fix the Slot hydration issue (verified
on 16.2.6 + React 19.2.6 — Mantine patch still required).

### Notes

- Family count: 104 (no change — patch release)
- All existing demo routes verified clean post-fix (/components/card,
  /stack, /badge sampled; full smoke run in CI)
- Zero API change, zero consumer code change

## [0.22.0] — 2026-05-13

**Minor release — JSDoc completeness audit (doc-only, zero code changes).**
Closes the developer-experience gap before the real-world test phase: every
public export now ships with a complete header block (description / `@layer` /
`@tokens` / `@deps` / `@a11y` / `@example`) and a per-prop JSDoc on every prop
in every component interface. IDE inline docs (autocomplete tooltips, hover
inspection) render full context for every component without consumers
needing to open documentation pages.

### Added

- **`audit:jsdoc` npm script** (`scripts/audit-jsdoc.mjs`) — AST-aware JSDoc
  coverage auditor. Scans every `components/<category>/<Name>/*.tsx`
  primary export, verifies the header block contains all required tags +
  description, and checks every prop in the `XxxProps` interface has its
  own JSDoc comment. Run via `npm run audit:jsdoc` (human-readable) or
  `--summary` / `--json` flags. Exit code 0 when 100% coverage, 1 otherwise
  — drop-in for CI enforcement.

### Changed

- **41 component files reached 100% JSDoc coverage** — `complex/`
  (AlertDialog, Calendar, Carousel, Combobox, ContextMenu, DateRangePicker,
  Dialog, Drawer, DropdownMenu, Field, Form, HoverCard, NavigationMenu,
  Popover, ScrollArea, Select, Sheet, Sidebar, Tabs, Toolbar, Tooltip);
  `display/` (Badge, CardBody, CardFooter, CardHeader, CardSection,
  KpiValue, KpiValueAnimated, Reveal, Table parts); `feedback/Progress`;
  `interactive/` (ButtonGroup, Label, RadioGroup, Toggle); `layout/GridLayout`;
  `molecules/` (Chip, IconButton, MetricTile, Timeline);
  `typography/Eyebrow`. Common gap patterns filled: missing `@deps`,
  `@layer`, `@tokens`, `@a11y` tags + undocumented `children` /
  `className` / `aria-labelledby` / state-management props.

### Notes

- Zero code logic touched — exclusively JSDoc additions on existing
  interfaces and headers. No API change, no behavior change.
- **Świadomie defer:** `headless-reset.scss` opt-in escape hatch (planned
  in 0.22.0 roadmap, deferred to demand-driven per user directive
  2026-05-13). Will ship when a concrete consumer requests the
  structure-only stylesheet.
- Audit baseline: 4/117 pass on first run → 117/117 after batch fill.
- All edits verified via `npx tsc --noEmit` clean + `npm run lint` 0 errors.
- Family count: 104 (no change — doc-only release).

## [0.21.0] — 2026-05-13

**Minor release — Polish batch.** Four quick-win small components closing
display + feedback gaps, plus an opt-in TimeInput stepper amendment. Each
component passes the Klocek-vs-Organism binding test (single concept,
data-shape neutral, no surface bias) and ships through the full
`/component-build` skill GAN loop. Family count 100 → 104.

### Added

- **AvatarGroup molecule** (`molecules/AvatarGroup`) — stacked-avatar
  primitive with overflow chip. Children-slot pattern (data-shape neutral):
  consumer passes `<Avatar>` elements as children; the molecule clips the
  visible count to `max`, collapses the remainder into a final "+N" chip
  (an `<Avatar>` with fallback text), and applies negative-margin overlap.
  Props: `max` / `size` / `overlap` / `asChild` + children. `role="list"`
  - `role="listitem"` per child + `aria-label` on the overflow chip. Composes
    lib `<Avatar>` for visual consistency. Variant-free, lockup-free —
    usable in panel team rows, bleizos client teams, scout-hub operator
    lists, marketing about pages.

- **Rating interactive primitive** (`interactive/Rating`) — APG
  `radio-rating` star-input pattern. Roving tabindex, ArrowLeft/Right/Up/
  Down for navigation, Home/End for first/last, Space/Enter for activate.
  Hover preview separate from committed value. `readOnly` mode supports
  fractional values (3.7 → 3 filled + 1 partial via CSS `--rating-star-fill`
  - clip). Inline SVG star — zero icon library. Form integration via
    hidden `<input name>`. Controlled + uncontrolled hybrid. Sizes
    sm/md/lg, `max` configurable, `allowClear` toggle.

- **Collapsible compound** (`complex/Collapsible`) — APG `disclosure`
  pattern. `<Collapsible>` + `<CollapsibleTrigger>` + `<CollapsibleContent>`.
  Distinct from `<AccordionGroup>` (which is APG `accordion` Q+A pattern);
  Collapsible is the generic show/hide primitive. Trigger is real
  `<button type="button">` with `aria-expanded` + `aria-controls`. Content
  has `role="region"` + `aria-labelledby`. CSS Grid `0fr → 1fr` height
  transition (content-aware, no JS height measurement). Reduced-motion
  guard disables transition. Controlled (`open` + `onOpenChange`) +
  uncontrolled (`defaultOpen`) + `disabled` + `forceMount` (preserve DOM +
  state across toggle).

- **Banner feedback primitive** (`feedback/Banner`) — page-wide
  notification. Distinct from `<Alert>` (contextual inline near form
  fields); Banner is global broadcast (maintenance window, billing-overdue
  notice, terms update, system status). Tone enum (info / warning / error
  / success) drives both `--banner-{bg,border,fg}` channel AND ARIA live
  politeness: `tone="error"` → `role="alert"` + `aria-live="assertive"`
  (interrupts SR); other tones → `role="status"` + `aria-live="polite"`.
  Opt-in dismiss button (consumer-owned dismissal state via `onDismiss`).
  Opt-in `sticky` variant (`position: sticky; top: 0`). `actions` slot
  accepts arbitrary children (typically `<Button>` / `<Anchor>`).
  Reduced-motion + forced-colors fallbacks.

- **TimeInput `showSteppers` opt-in amendment** — stacked ↑/↓ button pair
  on the right edge of the input wrap, acts on currently-focused segment
  (hour / minute / second). Pointer-down activation: immediate first step
  - hold-to-repeat (400ms initial → 80ms repeat, native spinbutton
    convention). Keyboard (Space/Enter on button) fires single step;
    keyboard users keep ArrowUp/Down on spinbuttons themselves (better
    ergonomics). Buttons carry `tabIndex={-1}` — keyboard focus stays on
    spinbutton segments. Minute stepper respects existing `step` prop
    (step=15 → 0 → 15, not 0 → 1). 12h hour-cycle mapping intact.
    `setPointerCapture` wrapped in try/catch — synthetic events / SR
    virtual cursors don't break the increment path. Inline SVG chevron —
    zero icon library. Default `false` (fully backward compatible).

- **DateTimePicker `showTimeSteppers` propagation** — new optional prop
  forwards `showSteppers` to the embedded `<TimeInput>` inside the
  popover content. Default `false`.

### Notes

- TimePicker NOT updated for steppers — it uses own hour spinbutton +
  minute listbox, no TimeInput composition.
- Rating reclassified `@layer atom` → `@layer interactive` in JSDoc;
  9-prop budget exceeded atom ≤3 cap, per Slider/Toggle convention.
  No API change.
- Manifest libVersion synced to 0.21.0; family count 100 → 104; total
  exported names 594.
- All four new components pass tsc + eslint + jsx-a11y clean. Runtime
  Playwright + axe-core specs for Phase 10 interactive primitives
  (Rating + Collapsible) batched into a separate 0.21.x test-execution
  sprint per the 0.20.0 charts cycle precedent — specs ship co-located
  in `tests/`, execution batched.

## [0.20.1] — 2026-05-12

**Patch release — Demo bug sweep.** Eleven bug fixes discovered by user
during demo walkthrough po 0.20.0 ship. Patch covers non-asChild bugs
across atoms / molecules / complex / specialized layers — 7 lib fixes,
3 demo fixes, 1 mixed (Dot enum widening + Badge demo). No API breaks.

### Lib fixes

- **Textarea — `resize="horizontal"` had no visible effect** (B11).
  `.textarea` was `flex: 1; min-width: 0;` inside a `display: flex`
  wrap, so flex-grow re-filled the wrap's width immediately after the
  user-agent resize handle dragged a new width. Switched to
  `width: 100%; min-width: 0;` — default sizing unchanged but the
  user-agent inline `width` now sticks.

- **LineChart — tooltip leaked raw timestamps for Date series** (B18).
  `tooltipContext.datum` exposed the internal `NormalizedDatum` shape
  where `x: number` (timestamp), violating the public
  `LineChartDatum.x: number | Date | string` contract. Without a custom
  `xAxis.tickFormat`, the default `formatX` fell through to
  `String(timestamp)` and surfaced raw `17119296000000` in the title.
  Tooltip context now restores `datum.x` from internal `origX` —
  consumers and the default tooltip see the original Date.

- **Combobox — controlled `value` change did not sync input display**
  (B15). The only existing search-sync path was a one-shot initial
  effect that fires once after registry fills and never again. External
  setters (`setControlledValue('jp')` / `setControlledValue(null)`)
  changed React state but the input text stayed frozen on whatever
  label was committed last. Added a controlled-value transition
  effect with narrow guards (single mode + controlled value +
  uncontrolled search + value-changed identity guard) that pushes the
  new label (or '' for null) into uncontrolled search.

- **TextLink — hover underline stretched to parent width** (B05).
  `display: inline-flex` fits content in block/inline parents but
  becomes a flex item in `flex-direction: column` parents where
  default `align-items: stretch` rules. The bottom-border underline
  spanned the full row instead of the text + arrow. Added
  `width: fit-content` to re-assert content sizing across all parent
  layout modes.

- **Button — warning variant snapped instead of fading on hover/active**
  (B13). The base `.root` transition listed background-color /
  border-color / color / box-shadow / transform but NOT `filter`.
  `.variantWarning` animated brightness via `filter` (no
  `--hover-warning` / `--active-warning` token), so its hover/active
  changes snapped while every other variant smoothly faded. Added
  `filter` to the transition property list.

- **Dot — added `xs` size (4px)** (B08). Extended `DotSize` from
  `'sm' | 'md' | 'lg'` to `'xs' | 'sm' | 'md' | 'lg'`. `xs` maps to
  `--space-1` per R7 token-reuse-first. Additive enum widening,
  non-breaking. Companion Badge §7 demo update lands in the same
  commit.

- **AlertDialog — description text shifted 1-2px after open animation**
  (B14). Open keyframes animated
  `transform: translateY(8px) scale(0.98)` → `translateY(0) scale(1)`.
  Once `scale(1)` settled, the browser re-rasterized text at native
  resolution and subpixel hinting landed differently than during the
  scaled state — visible as a 1-2px drift on body copy. Dropped the
  scale component; `translateY` + `opacity` alone keep the entrance
  feel without the post-animation re-render artifact.

### Demo fixes

- **Home catalog — added Date/Time pack cards** (B16). User flagged
  TimePicker + DateTimePicker missing from `app/page.tsx`. Audit
  revealed all four 0.18.0 components were absent: DateRangePicker,
  TimeInput, TimePicker, DateTimePicker. All four demo routes already
  existed under `app/components/{date-range-picker,time-input,
time-picker,date-time-picker}` — only the home catalog was stale.
  Catalog 76 → 80 entries.

- **EdgeBar §5 — pulse demo forgot `pulse` prop** (B09). Section
  rendered three `<EdgeBar color="success|warning|error">` without
  `pulse`, so the section silently demonstrated the static state.
  Lib `pulse` wiring + `@keyframes edgeBarPulse` + reduced-motion
  guard all verified working when class is applied. Demo now passes
  `pulse` on all three bars.

- **BreakdownList §6 — empty state read as blank** (B12). Per
  Klocek discipline the molecule never auto-wraps empty data
  (consumer-owned), but the demo demonstrated this with a single
  muted `<Text>` and no visual container — section read as blank
  during walkthrough. Enriched with a styled placeholder
  (`.empty` class: dashed border + raised surface + two-line copy)
  so the consumer-owned pattern is visibly distinct. Lib unchanged.

- **DataTable toolbar Input — narrowed via demo SCSS** (B17). User
  flagged the search Input as too large for a list-view toolbar.
  `<Input>` has no `size` prop yet (lib-API expansion, deferred to
  a future minor — same consideration extends to Textarea / Combobox
  / DatePicker trigger inputs). Patch fix: demo SCSS constrains the
  search input to `max-width: 240px; flex: 0 1 240px` via
  `.searchInput` className passthrough.

### Mixed fix

- **Badge §7 — live status dot oversized vs badge frame** (B08). Same
  commit as the lib Dot enum widening above. Demo `<Badge icon={<Dot
pulse />}>` used the default `md` (12px) which felt heavy for status
  pip context. All four §7 examples now use `<Dot size="xs" pulse />`;
  section description updated to explain rationale.

### Deferred to 0.20.2 Slot architectural patch

Seven bugs share a single root cause class — Slot's `'use client'` +
forwardRef + 7+ consumer forwardRefs combine into hydration mismatch in
Next.js 16.2+ + React 19 dev mode for the asChild pattern. Two fix
attempts during this sweep both failed (removing `'use client'` from
Slot triggers "Refs cannot be used in Server Components" because
Card/Stack/Section/Badge wrap with forwardRef; converting Slot to React
19 ref-as-prop alone insufficient). Proper fix requires lib-wide
coordinated migration (Slot + 7+ asChild consumers from `forwardRef` →
React 19 ref-as-prop). High risk, dedicated cycle. Affected: B01 Stack
asChild, B02 Inline asChild, B03 Section asChild, B04 Eyebrow asChild,
B06 Card asChild, B07a Badge asChild, B10 Label asChild. Production
unaffected — dev-only warning per Slot.tsx existing comment.

### Follow-up candidates (NOT in 0.20.1)

- `Input size="xs" | "s" | "md"` variant (would also extend to
  Textarea / Combobox trigger / DatePicker trigger). Repeats the
  B17 pattern across the form family.
- `--hover-warning` / `--active-warning` semantic tokens so Button's
  warning variant matches the brand-token pattern instead of relying
  on `filter` arithmetic. Token-architecture change, not a patch.

## [0.20.0] — 2026-05-12

**Feature release — Charts pack.** Closes the dashboard chart layer with
4 new SVG-based chart primitives: `<LineChart>`, `<AreaChart>`,
`<Sparkline>`, `<PieChart>`. Library grows from 96 to 100 families
(+4 specialized charts; manifest specialized category 11 → 14). Zero
external runtime dependencies maintained (no Recharts / Chart.js / D3 /
Mantine Charts). Zero new design tokens added across the cycle. Built
entirely on native SVG + math helpers + DEFAULT_COLORS cycle shared with
the existing `UsageDonut` family.

### Added — Charts pack (4 new components)

**E01.1 LineChart v1 — multi-series SVG line chart**

Phase 10 complex interactive component. Renders 1-N series as smooth
(Catmull-Rom tension 0.5) or linear paths over a numeric / time / categorical
X axis. Built on native SVG + math helpers (scaleLinear, niceTicks, generate-
Path, normalizeX) — zero external chart deps (no Recharts / Chart.js / D3).

API highlights:

- `series: LineChartSeries[]` — each series has `{ id?, name?, color?,
data: LineChartDatum[] }` where each datum is `{ x: number | Date | string,
y: number, label? }`. Generic data-shape abstraction; consumer's actual
  business data stays unconstrained.
- `interpolation`: `'linear' | 'smooth'` (default smooth — Catmull-Rom).
- `animate`: path-draw stroke-dashoffset animation on mount;
  `prefers-reduced-motion` always wins.
- `aspectRatio` (default 16/9) + `height` (explicit pin override). Responsive
  via CSS aspect-ratio + ResizeObserver (SSR-safe — no layout shift).
- `xAxis` / `yAxis` config: `tickFormat`, `hide`, `domain`, `ticks` overrides.
  Auto-derived y domain includes zero when data spans positive+negative.
- `tooltipFormat` (value formatter) + `renderTooltip` (full slot override).
- `renderEmpty` slot for custom zero-data state. Sr-only `<table>` ALWAYS
  renders (LC-R20) so AT users get full data alternative even when consumer
  shows custom empty UI.
- `onPointClick` + `onPointFocus` callbacks (no separate hover event —
  focus follows mouse).

A11y model (synthesized from W3C `role="img"` + WCAG H51 — no canonical
APG pattern for charts):

- Root `<div role="img" aria-labelledby="{titleId}" aria-describedby=
"{consumer} {descId} {tableId} {liveId}">` (Pattern 3 forensic — chains
  consumer ids with internal ids).
- Internal `<svg aria-hidden="true">` — visual layer.
- Sr-only `<table>` with `<caption>`, header row [X column, ...series.name],
  unified-X rows sorted ascending, missing values rendered as `'—'`.
- Per-point `<circle tabIndex={-1} aria-label>` — roving tabindex flips
  active circle to `0`. Keyboard model: Arrow Right/Left (within series),
  Arrow Up/Down (switch series), Home/End (first/last), Space/Enter
  (activate → `onPointClick` + pin tooltip), Escape (unpin + clear focus).
  Voronoi `<rect>` overlay per unified X — transparent, full plot height,
  satisfies WCAG 2.5.5 touch target ≥44×44 for the 4-8px visible circles.
- Live region (`role="status" aria-live="polite"`) announces focused point:
  `"<series>, <x label>: <y value>"`. Counter ref bumped via `useEffect`
  (NOT inside `useMemo` — React purity guard) so AT re-announces on same-
  point re-focus (Pattern 2 forensic).
- Focus-ring inside `:focus-visible` (Pattern 1 forensic).
- `prefers-reduced-motion: reduce` suppresses path-draw animation +
  crosshair/tooltip fades. `forced-colors: active` maps to CanvasText /
  GrayText / Canvas (Windows High Contrast preserved).

Phase 4 Evaluator findings + Phase 5 fixes:

- CRITICAL #1 — voronoi `<rect>` overlay implemented per spec (was
  documented but not rendered); WCAG 2.5.5 touch-target claim now valid.
- CRITICAL #2 — announce counter moved from `useMemo` to `useEffect`-driven
  state (no more React purity violation; StrictMode double-invocation safe).
- IMPORTANT — `handleKeyDown` deps array corrected (`focusPointAt` added,
  `pinned` / `setFocusAt` removed — unused inside).
- IMPORTANT — `role="presentation"` removed from tooltip `<div>` (redundant
  on neutral element).
- Hydration fix: lib `formatX` fallback uses ISO `YYYY-MM-DD` instead of
  `toLocaleDateString()` (Node.js server / Chromium client ICU drift caused
  SSR mismatch in `Static report` demo). Consumer can override via
  `xAxis.tickFormat` with explicit locale + timeZone.

Tests: 53 PASS / 0 fail across 6 spec files: aria (8) + interpolation (4)

- tooltip (6) + keyboard (6) + responsive (3) + regression (26 —
  LC-R01..R26). axe-core zero violations on demo route.

Manifest: 96 → 97 families. Zero new lib tokens. Zero new external deps.

**E01.2 AreaChart v1 — multi-series SVG area chart**

Mirrors LineChart API surface (Datum / Series / AxisConfig / TooltipContext /
Interpolation) with 2 additional visual axes: `fillOpacity?: number`
(default `0.3`, clamped 0..1) and `gradient?: boolean` (default `false`,
renders vertical linearGradient per series fading from peak to baseline).
Render order per series: filled `<path class="area">` (low z) →
stroke `<path class="line">` (top) → focusable `<circle>` data points.

Baseline strategy matches Recharts default (`dataMin >= 0 ? 0 : dataMin`):

- spans zero (min < 0 < max) → baseline = 0 (zero-crossing — areas above
  zero fill upward, below zero fill downward toward data)
- all positive / all negative → baseline = `yDomain[0]` (plot floor in
  SVG y-inverted space). All-negative case: data point at top = full-
  column area; consumer can override via `yAxis.domain` if a different
  baseline is needed.

Inherits LineChart's keyboard navigation (roving tabindex Arrow Left/
Right within series + Up/Down switch series + Home/End jump + Space/
Enter click + Escape dismiss), crosshair tooltip, voronoi hit-testing,
sr-only `<table>` a11y fallback, live region with re-announce marker,
`prefers-reduced-motion` + `forced-colors` fallbacks.

Phase 4 Evaluator findings + Phase 5 fixes:

- IMPORTANT — `fillOpacity` + `gradient` coupling JSDoc fixed (was
  documented as "ignored when gradient" but code actually scales the
  gradient top stop opacity by 2.5× clamped to 1; doc now describes
  the actual coupling)
- IMPORTANT — all-negative baseline behavior documented explicitly in
  `generateAreaPath` JSDoc with Recharts convention reference +
  consumer override hint via `yAxis.domain`
- IMPORTANT — forced-colors `.area` opacity 0.2 → 0.4 so area-vs-line
  layering remains perceivable in Windows High Contrast

Manifest: 97 → 98 families. Zero new lib tokens.

**Refactor — `_shared/chart-math.ts` extraction (Rule of Three intra-lib)**

Before Sparkline (3rd chart consumer), pure math + formatting helpers
consolidated into `components/specialized/_shared/chart-math.ts`. Removes
~150 LOC clone between LineChart and AreaChart. Module is `_shared/`-
prefixed lib-internal (NOT re-exported from `components/index.ts`
barrel — consumers compose at component level).

Helpers moved: `scaleLinear`, `getDomain`, `niceTicks`,
`generateLinearPath`, `generateSmoothPath`, `generateAreaPath`,
`normalizeX`, `formatX`, `defaultYFormat`, `clamp01`, `DEFAULT_COLORS`

- `defaultColorForIndex`, plus shared type `ChartInterpolation`.

BC preserved: `LineChartInterpolation` and `AreaChartInterpolation` now
re-export `ChartInterpolation` — all named exports continue to resolve
for existing consumers. No API surface change. Net LOC +2 (shared module
overhead offsets dup removal).

**E01.3 Sparkline v1 — tiny inline single-series chart**

Single-series line chart (+ optional filled area) for embedding in
`<Card>`, table cells, KPI tiles, dense dashboards. `data: number[]`
(Y values only; X inferred as ordinal index 0..N-1). 10 props on root
(LineChart=13, AreaChart=15 sibling baselines).

Deliberate non-interactivity per Tufte / Mantine / Tremor precedent: no
keyboard navigation, no focus, no tooltip, no crosshair, no live region.
Sparkline is a "glanceable direction signal" — consumer renders own
numeric badge next to the sparkline for the actual value (canonical
KPI tile lockup demonstrated in demo §3). Sr-only `<table>` (Index +
Value columns) still mandatory for AT users.

API: `data` + `title` + `description?` + `interpolation?` + `color?` +
`strokeWidth?` + `area?` + `fillOpacity?` (default 0.2) + `gradient?` +
`animate?` + `aspectRatio?` (default 4 — wide-and-short typical strip) +
`renderEmpty?` + `valueFormat?`. First consumer of `_shared/chart-math`
— imports exactly the 8 helpers it needs, correctly skips axis / mixed-X
/ multi-series helpers.

Phase 4 Evaluator findings + Phase 5 fixes:

- IMPORTANT — single-point degenerate case (`data.length === 1`)
  violated JSDoc contract: `scaleLinear` over span-0 x-domain collapsed
  the lone point to plot midpoint, leaving no segment to stroke
  (would render empty against demo §6 "Single value" label). Fix:
  when `data.length === 1`, synthesize 2 endpoints at PLOT_LEFT +
  PLOT_RIGHT sharing y, so path generators emit a horizontal segment
  spanning full width.

Manifest: 98 → 99 families. Zero new lib tokens.

**E01.4 PieChart v1 — SVG pie + donut chart**

Categorical composition chart (full 360°) — complements existing
`<UsageDonut>` (partial progress with visible remainder; different
semantics, NOT redundant). `variant: 'pie' | 'donut'` (donut inner radius
= 0.6× outer, hardcoded for v1). `data: PieChartDatum[]` =
`{name, value, color?}[]`. 12 props on root.

Interactive a11y matching LineChart/AreaChart precedent: per-segment
`<path>` / `<circle>` w/ roving tabindex + aria-label. Keyboard model:
Arrow Left/Right/Up/Down cycle, Home/End jump, Space/Enter click + pin
tooltip, Escape dismiss + blur. Live region announces focused segment
via name + value + percent (drops zero-width re-announce marker — pie
segment identities are stable+distinct per render; polite live region
naturally re-announces on content change).

Polar geometry inline (NOT in `_shared/`): `polarToCartesian(cx, cy, r,
deg)` (0° = 12 o'clock, clockwise growth) and `describeArc(cx, cy,
outerR, innerR, startDeg, endDeg)` (sweepFlag=1 outer CW + sweepFlag=0
inner CCW for donut annulus winding). Mirrors how Cartesian helpers
were inlined for 2 charts before extraction at 3rd — polar will extract
to `_shared/polar-math.ts` when a 2nd polar consumer joins (RadarChart /
GaugeChart / future).

Edge cases:

- Empty data → empty state + empty sr-only table (caption + headers
  still render)
- Single 100% segment → renders as `<circle>` to avoid degenerate 360°
  SVG arc (start = end is a degenerate path). Donut variant: annulus
  via `<circle fill="none" stroke=color strokeWidth=outerR-innerR
r=(outerR+innerR)/2>` — math verified exact (52.8 to 88 for
  outerR=88 / innerR=52.8)
- Negative values → silently filtered + dev-mode `console.warn`
- Zero-sum (all zeros) → empty state

Slots: `centerLabel?: ReactNode` (donut hole content; ignored in pie
variant — JSDoc documented), `showLabels?: boolean` (on-segment
percentage labels; auto-hide slices <10% to avoid collision —
leader-line labels deferred to 0.20.x), `renderTooltip?` slot,
`renderEmpty?` slot. Callbacks: `onSegmentClick` + `onSegmentFocus`.

Phase 4 Evaluator findings + Phase 5 fixes:

- IMPORTANT — `aria-describedby` chain order: consumer-supplied id was
  `unshift`ed (placed FIRST) contradicting JSDoc contract "consumer
  LAST". Fix: `ids.push(consumerDescribedBy)` so AT announces chart's
  own context (description + sr-only table + live region) before
  supplemental consumer description.
- IMPORTANT — initial tab-entry trap: with `focusedIdx === null`
  initial state, all segments rendered `tabIndex=-1` → Tab from outside
  could not enter the segment group. Keyboard-nav promise silently
  broken on first focus. Fix: `isTabStop = (focusedIdx ?? 0) === idx`,
  so segment[0] is the default tab stop. Roving tabindex still tracks
  user's actual focus after first interaction.

Manifest: 99 → 100 families (0.20.0 cycle target hit). Zero new lib
tokens. Note: `.segmentLabel` uses `rgba(0,0,0,0.35)` paint-order
text-outline for readability against arbitrary segment colors — flagged
NITPICK as token candidate for follow-up.

### Tests deferred (0.20.x sprint)

Playwright + axe-core runtime + manual NVDA sweep for all 4 charts
batched to a dedicated 0.20.x test-execution sprint, matching the
E15 Tabs / E05.4 Form / E06.x Header precedent established in earlier
cycles. Regression specs planned:

- LC-R01..LC-R26 (LineChart — 26 cases, partially executed in E01.1)
- AC-R01..AC-R20 (AreaChart)
- SP-R01..SP-R15 (Sparkline)
- PC-R01..PC-R20 (PieChart)

`tsc --noEmit` clean, eslint clean (jsx-a11y + react-hooks), `check:barrel`
OK, `check:manifest` OK across all 4 charts. Visual regression via
demo routes deferred to test sprint.

### Notes

- Same a11y "shared bug" identified in PieChart Phase 4 evaluator
  (consumer describedby placement + initial tab-entry trap) likely
  exists in LineChart and AreaChart too — logged as follow-up for
  0.20.x patch (not in 0.20.0 scope; fixed only in PieChart this cycle).
- `_shared/chart-math.ts` is lib-internal (NOT in barrel). Consumers
  must import the chart components directly.
- Polar helpers will extract to `_shared/polar-math.ts` when a 2nd
  polar consumer joins (RadarChart / GaugeChart in future minors).

## [0.19.0] — 2026-05-12

**Feature release — Forms expansion.** Ships 3 new Phase 10 complex
interactive form primitives — `<FileUpload>`, `<TagsInput>`, `<Stepper>` —
that close the core form story. Library grows from 93 to 96 families. Zero
external runtime dependencies maintained across the cycle (FileUpload uses
native File API + HTML5 drag/drop, TagsInput uses native input + chip
render, Stepper uses inline SVG + CSS data-status selectors). Zero new
design tokens added across the cycle.

Eight forensic patterns established and codified for future sessions
(see `memory/bleizlabs/reference_lib_019_forensic_patterns.md`): focus-ring
must wrap inside `:focus-visible`; live region zero-width / `key` re-mount
for AT re-announce of identical content; aria-describedby chaining;
native file input value reset BEFORE click; Field re-register loop fix
(0.18.1 patch); pointerdown-marker for intra-wrapper blur when
relatedTarget is null; live region announces consumer message not enum
code; drop zone can't have role=button when hosting interactive
descendants.

### 0.19.0 cycle deliverables

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

**E01.2 TagsInput v1 — freeform tag input**

Phase 10 interactive component (NOT in `complex/` because it has no popover —
inline chip list + native textbox only). Distinct from Combobox multi-mode:
Combobox = select-from-list with popup listbox + registered items;
TagsInput = freeform creation (no popup, type and commit).

API highlights:

- Controlled + uncontrolled value (`string[]`) via `value`/`defaultValue` +
  `onChange`. Per-attempt rejections via `onReject(rejections)`.
- Validation matrix: `validate(tag) => boolean | string` (string = error
  message), `maxTags`, `allowDuplicates`, `caseSensitive`, `trim`. Each
  axis maps to a `TagRejectionReason` code (`empty` / `duplicate` /
  `too-many` / `validate-failed`).
- Composition: `delimiter` array (default `[',', ';']`), `addOnBlur` for
  Gmail-style auto-commit on blur. Paste-split on configured delimiters +
  newline.
- Form participation: `name` + `required` mirror to a hidden
  `<input type="hidden">` carrying delimited-string value (Q1 (α)).
  Constraint Validation via `setCustomValidity` keyed on
  `required && value.length === 0`.
- A11y: native `<input type="text">` typing surface, `role="list"` chip
  group, `role="listitem"` per chip, real `<button aria-label="Remove {tag}">`
  per chip (in Tab order per Q3 (α) — TagsInput has no listbox →
  aria-activedescendant pattern doesn't apply). IME composition guard
  (`isComposingRef` + `nativeEvent.isComposing`). Live region announces
  "Added: {tag}" / "Removed: {tag}" / "Tag rejected: {message}" with
  zero-width-marker counter for AT re-announcement.
- Forensic patterns: Backspace-on-empty removes last chip
  (Combobox precedent), case-insensitive duplicate check, paste-split with
  trim + empty-skip, intra-wrapper blur detection via pointerdown flag
  (relatedTarget is null when clicking inner SVG glyph — Phase 5 fix #1).

Phase 4 Evaluator findings (verdict PASS, but 4 IMPORTANT applied in Phase 5):

- Live region announces consumer-supplied `validate` message instead of
  internal enum code (was: "Tag rejected: validate-failed" → now: "Tag
  rejected: Must be lowercase").
- `useImperativeHandle` deps array added (was missing — would flag
  exhaustive-deps in stricter ESLint configs).
- Removed dead "Keep pending in sync" comment block declaring a
  non-existent effect.
- `addOnBlur` race fixed via `pointerdown`-marker flag on the wrapper
  for intra-wrapper blur detection (relatedTarget is null when click
  origin is the SVG glyph inside a `<button>`).

Tests: 63 PASS / 0 fail across 6 spec files: aria (10), keyboard (9),
validate (8), paste (6), form (5), regression (25 — TI-R01..TI-R25 incl.
the new TI-R25 covering Phase 5 fix #4). axe-core zero violations.

Manifest: 94 → 95 families. Zero new lib tokens. Zero new external deps.

**E01.3 Stepper v1 — visual + semantic multi-step progress indicator**

Phase 10 complex interactive component. Compound `<Stepper>` + `<Step>` (flat
exports per RadioGroup precedent — `Stepper.Step` dot-notation NOT used).
Visual-state-only mode = `<ol role="list">` with `<li>` children; interactive
mode = `<nav role="navigation" aria-label>` wrapping `<ol>` with `<button>`
on clickable steps + `<div aria-disabled>` on non-clickable.

API highlights:

- Status: auto-derived from `currentStep` (index < currentStep → complete;
  === → active; > → pending). Explicit `<Step status="error">` overrides
  derivation — primary use case is marking failed validation while
  `currentStep` has moved past it.
- `clickableSteps`: `'none'` (default — visual only) | `'visited'` (only
  complete steps clickable — Material UI convention) | `'all'` (every step
  clickable — free-form wizard). Discriminated TS union forces `onStepClick`
  when interactive.
- `orientation`: `'horizontal'` | `'vertical'` — connecting-line geometry
  - keyboard arrows axis. Independent of `dir="rtl"` (RTL flips horizontal
    arrow semantics, same pattern as Tabs).
- `size`: `'sm'` (24px circle) | `'md'` (32px) | `'lg'` (40px) — matches
  Button/Chip/Avatar scale.
- `<Step>` accepts `label: string`, `description?: ReactNode` (lib does NOT
  auto-wrap into Text variants), `icon?: ReactNode` (replaces number badge
  for pending/active + checkmark for complete; ignored on error — D4
  semantic mandatory per WCAG 1.4.1), `status?: StepStatus` (explicit
  override).
- A11y: each step ships a visually-hidden verbose announcement
  ("Step N of M: label, status") for non-active steps; active step's
  context is delivered via root live region (`role="status"
aria-live="polite"`) which re-mounts on `currentStep` change to force
  AT re-announce (TagsInput precedent). `aria-current="step"` on the
  active step.
- Keyboard (interactive only): Arrows (h/v + RTL-aware) navigate between
  clickable steps (skip aria-disabled, loop), Home/End jump first/last,
  Space/Enter activate. Modifier keys passthrough (Tabs TB-R04 precedent).
- Connecting line: per Q2 (α) — complete steps' outgoing line uses
  `var(--color-success)` green. Incomplete segments use `var(--color-border)`.
  Single CSS selector — no JS computation.
- Long labels: per Q3 (β) — wrap to multiple lines (`white-space: normal`).
  A11y priority — never hide content via CSS. Consumer may opt into
  truncation via `className` + own SCSS.
- APG attribution: per Q1 (γ) — cites W3C `list` + `navigation` landmarks
  as foundation; behavior synthesized from Material UI / Mantine / Chakra
  Stepper convention (W3C does NOT define a canonical "stepper" pattern).

Phase 4 Evaluator findings + Phase 5 fixes:

- IMPORTANT: discriminated-union read shape simplified (single destructure;
  removed redundant double-cast).
- IMPORTANT: `{...rest}` spread placement now BEFORE explicit attrs so
  consumer can't accidentally override fixed structural attrs (role,
  data-orientation, data-size, onKeyDown).
- IMPORTANT: visual-only mode wrapper kept as `<div>` containing the
  `<ol>` (evaluator initially suggested collapsing to bare `<ol>` root
  but live region as sibling of `<ol>` would violate HTML structural
  validity — `<ol>` may only contain `<li>` direct children).
- NITPICK: per-step verbose announcement now omitted on the active step
  (live region already covers it — prevents double announcement).

Tests: 54 PASS / 0 fail across 6 spec files: aria (10), states (8),
keyboard (8), focus (5), click (5), regression (18 — STEP-R01..STEP-R18).
axe-core zero violations on demo route (`/components/stepper`).

Manifest: 95 → 96 families. Zero new lib tokens. Zero new external deps.

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
data-\* attrs land via DateRangePicker consumer, hover wiring proven).
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

- TimeInput + TimePicker + DateTimePicker). 0.18.0 component scope
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
  - Space activation when interaction follows immediately after
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
  - Card surface wrapper. The `title` / `description` / `footer` /
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
  html {
    scroll-behavior: smooth;
  }
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
  }
  body {
    margin: 0;
    padding: 0;
    min-height: 100dvh;
  }
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
