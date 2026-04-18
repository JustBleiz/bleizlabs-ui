# Changelog — bleizlabs-ui

All notable releases of this component library. Follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. As of `0.1.0`, the library publishes to the private `@bleizlabs/ui` scope on GitHub Packages (https://npm.pkg.github.com/) and is installable via `npm install @bleizlabs/ui`. Copy-to-project remains available as an escape hatch for client deliverables. Entries below `0.1.0` are pre-package maturity milestones that preceded the npm release.

---

## [0.1.2] — 2026-04-19

**Accessibility safety net — WCAG 2.1 AA zero-violations baseline for all 49 demo routes.**

### Added
- `tests/smoke.spec.ts` — Playwright + `@axe-core/playwright` smoke suite iterating every demo route with `wcag2a` + `wcag2aa` + `wcag21a` + `wcag21aa` tag set. Runs on `push` + `pull_request` via `.github/workflows/test.yml` and gates `publish.yml` before `npm publish`. Dev-only: `@playwright/test` `^1.59.1` + `@axe-core/playwright` + `@axe-core/react` land in `devDependencies` — consumer tarball unchanged (D5/D25 preserved).
- `app/playground.scss` — new playground-only entry that sets `$seed-brand: #06b6d4` + `$seed-accent: #8b5cf6` and ships shared prose styles (`<code>`, raw `<a>`) that the bare library doesn't own. Keeps the shipped fresh-template monochromatic seed intact for consumers while letting the dev playground render realistic AA-safe colors.
- `playwright.config.ts` — single Chromium project, `webServer: 'npm run build && npm run start'` (production build exercised, not dev HMR output), 180s cold-start timeout, CI-aware `workers: 4` + `retries: 2`.

### Fixed — library (ship in tarball)
- `components/layout/Section` — `bg="brand-subtle"` now resolves to theme-aware `var(--color-brand-subtle)` (brand-100 light / brand-900 dark) instead of the static `--color-brand-50` that rendered a pale teal band with light text in dark mode (~3.5:1).
- `components/complex/Carousel` — non-current slides use `inert` instead of `aria-hidden="true"`. Previous pattern violated WCAG 4.1.2 whenever slides contained focusable descendants (links, buttons). `inert` removes them from the a11y tree AND focus order in one attribute.
- `components/complex/Calendar` — weekday headers, selected cells, outside-month cells, and disabled cells retuned for AA: weekday → `text-secondary`, selected → `text-inverse` on brand (consistent with Button.variantPrimary), outside → `text-secondary + opacity 0.85`, disabled → `text-secondary + opacity 0.75 + line-through`.
- `components/complex/Tabs` — inactive trigger labels → `text-secondary` (was `text-muted`; failed AA on tablist surface-raised bg).
- `components/interactive/Label` — `.disabled` → `text-secondary + opacity 0.7` (was `muted + 0.6` = ~2.6:1; WCAG 1.4.3 exempts disabled but we match AA anyway).
- `components/interactive/Input` + `components/interactive/Textarea` — error messages use theme-aware `--color-error-strong` (red-700 light / red-300 dark) instead of raw `--color-error` (red-500 was ~3.7:1 on dark surface).
- `components/typography/Text` — `color="brand"` now resolves to theme-aware `--color-brand-strong` instead of raw `--color-brand-500`. Brand-strong is brand-700 in light, brand-300 in dark — keeps the semantic "brand tint" while hitting AA on card/raised surfaces.
- `styles/_generator.scss` — `$dark-text-muted` (neutral-500 → neutral-400) and `$light-text-muted` (neutral-500 → neutral-600) so `--color-text-muted` meets AA on page bg by default.

### Infrastructure
- `.github/workflows/test.yml` — 6-job DAG: `typecheck` + `lint` + `build` + `barrel` (parallel) → `smoke` (needs first three) → `e2e` (needs smoke; push-to-main only). Artifact upload for failing smoke runs.
- `.github/workflows/publish.yml` — extended with Playwright browser install + `npm run test:smoke` gate inserted between build and publish steps. Tag pushes now block on smoke green before `npm publish`.
- `app/_components/ThemeToggle.tsx` — refactor `useState`+`useEffect` → `useSyncExternalStore` (React 19 idiom; removes `react-hooks/set-state-in-effect` ESLint violation that blocked CI green state during L1 infrastructure setup).

### Notes
- Smoke runs against the production build (`next build && next start`), not `next dev`. React hydration warnings that only surface in dev HMR don't gate CI; dedicated per-component suites in the upcoming L3a-L3e batches exercise dev-mode hydration behavior.
- This release closes the first half of the D25 debt (static-verified → smoke-guarded). Full "NVDA-qualified" signal lands in `0.2.0` after all 23 Phase 10+ components ship `.spec.ts` conversions (E142 L3-L5).

## [0.1.1] — 2026-04-17

### Added
- `LICENSE` file (MIT) — missing from `0.1.0` tarball despite `package.json` declaring `"license": "MIT"`.

### Fixed
- `styles/_project-settings.scss` inline usage comment showed an incorrect `@use '@bleizlabs/ui/styles/project-settings' with (...)` pattern that would double-load the module when consumers also imported `@bleizlabs/ui/styles`. Replaced with the correct `@use '@bleizlabs/ui/styles' with (...)` pattern.
- `README.md` Interactive category now lists all 18 exported components (previously missed `RadioGroupItem` and `InputGroupText`).
- `README.md` Display category methodology note clarified — Table ships as a family but counts as one primitive for the tally, matching the Card counting convention.

### Docs
- `context.md` Status, Scope, and "Poza zakresem" sections updated to reflect npm-primary distribution and `81/81 + @bleizlabs/ui@0.1.0` current reality.
- `ROADMAP.md` component counts bumped `80 → 81`, Phase 11 entry added, E140 listed as delivered.
- `CHANGELOG.md` header rewritten to reflect npm distribution.

## [0.1.0] — 2026-04-17

### Added — first private npm release (`@bleizlabs/ui@0.1.0` on GitHub Packages)

The library is now installable via `npm install @bleizlabs/ui` from the BleizLabs-scoped GitHub Packages registry. This closes Epic E140 (distribution sprint) and unblocks consumer adoption for internal BleizLabs projects.

**Package:**
- `name: @bleizlabs/ui`, `version: 0.1.0`, `publishConfig.registry: https://npm.pkg.github.com`, restricted access
- Ship-source model: TypeScript + SCSS published as-is, consumer transpiles via Next.js `transpilePackages`. No pre-compiled build step — changes ship verbatim, SCSS seeds remain overridable.
- `exports` map: root (`.`), `./styles` (all tokens), `./styles/project-settings` (seeds alone), `./styles/*` + `./components/*` passthrough.
- Peer dependencies: `react >= 19`, `react-dom >= 19`. Zero runtime UI dependencies.
- `files` whitelist: `components/`, `styles/`, `README.md`, `LICENSE` (playground excluded). 365 files, 389.8 kB packed, 1.6 MB unpacked.
- Root `components/index.ts` barrel re-exports all 81 components + utilities (`Slot`, `cn`, `mergeRefs`) + shared types (`SpaceIndex`, `ClassValue`, `SlotProps`).

**Consumer setup (documented in README):**
1. `.npmrc` with `@bleizlabs:registry=https://npm.pkg.github.com` + personal access token with `read:packages` scope.
2. `npm install @bleizlabs/ui`.
3. `next.config.mjs`: `transpilePackages: ['@bleizlabs/ui']` + `sassOptions.loadPaths: [path.resolve(__dirname, 'node_modules/@bleizlabs/ui/styles')]` (second entry works around a known Next.js sass-loader + resolve-url-loader quirk that strips `./` prefixes from `@use`/`@forward` inside `node_modules`).
4. Import styles via `@use '@bleizlabs/ui/styles'` in a global SCSS file; import components from `'@bleizlabs/ui'`.

**Customisation:**
- Option A — override CSS custom properties in a `:root` block (works for every install mode).
- Option B — pass seed values via `@use '@bleizlabs/ui/styles' with ($seed-brand: X, $seed-accent: Y, ...)` for a deep rebrand that cascades through every generated scale. All 35 `$seed-*` variables carry `!default`.

**CI:**
- `.github/workflows/publish.yml` triggers on `v*.*.*` tag push — checks out the tag, installs deps with `npm ci`, type-checks, runs `next build` as a playground smoke test, verifies `package.json` version matches the tag, and publishes to GitHub Packages with `NODE_AUTH_TOKEN=${{ secrets.GITHUB_TOKEN }}`. Workflow dispatch supported for re-running failed publishes.

**Internal refactors required to enable publish:**
- 134 internal `@/components/...` imports rewritten to relative paths across 70 files (path aliases don't resolve in consumer projects).
- 17 internal SCSS `@use 'mixins'`/`@forward 'project-settings'` imports rewritten to relative paths across 10 files (bare-name resolution fails inside consumer's `node_modules`).
- 35 `$seed-*` seeds tagged with `!default` to enable consumer-side `@use with (...)` overrides.

**Verified via throwaway test consumer** (`D:/tmp/bui-consumer/`) — local-tarball install + named imports + SCSS seed override + CSS variable override + Next.js 16.2 Turbopack build all green end-to-end before publish.

---

## [v1.0-stable] — 2026-04-18

### PHASE 10 COMPLETE — 80/80 components live, library production-ready

**Delivery summary:** Discovery (D1-D26 decisions) + Phase 0 SCSS fundament + Phase 1-9 atoms/molecules/presets/demo + Phase 10 Complex Interactive (22 components) + 3 post-Phase-10 consolidation sprints (E39 usePointerDrag, E40 useMatchMedia, E41 maintenance audit) + E42-E46 documentation polish sprint.

**Final metrics:**
- **80/80 components** (47 atoms + 6 molecules + 5 Card presets + 22 complex interactive)
- **8 shared utility primitives** (6 in utils/floating/ + 1 in utils/gesture/ + 1 in utils/match-media/)
- **2 utility modules** (utils/date.ts + Toast/toastStore.ts)
- **Zero runtime UI dependencies** per D5/D25 (no Radix, HeadlessUI, React Aria, MUI, Chakra, @floating-ui, @tabler/icons)
- **TypeScript strict max** (strict + noUncheckedIndexedAccess + noImplicitOverride + noFallthroughCasesInSwitch)
- **Zero `any` usage** across components/ tree
- **Bundle:** 2.1M chunks for 80 components + 45 per-component playground routes (healthy)
- **A11y:** WAI-ARIA APG conformance per component, WCAG 2.1/2.2 AA target, forced-colors (Windows HCM) mapping, prefers-reduced-motion support throughout
- **Regression cases:** 500+ documented across 22 Phase 10 components (Playwright/NVDA/axe execution deferred per E15 scope — consumer adoption projects run their own)

---

### Phase 10 Complex Interactive (E15-E38) — 2026-04-14 → 2026-04-18

#### Tier A core (E15-E28 + E32-E33)
- **E15** Dialog (CI1) — first Complex Interactive, own `useFocusTrap` hook, APG `/dialog-modal/`
- **E16** AlertDialog (CI2) — blocking confirmation, `role="alertdialog"`, background `inert` toggle
- **E17** Drawer (CI3) — bottom-positioned, slide-up, iOS safe-area-inset, sticky footer
- **E18** Sheet (CI4) — 4-directional side panel (l/r/t/b), closes Drawer family
- **E19** Tooltip (CI6) — first modeless, introduced `utils/position.ts` + `utils/useFloating.ts`
- **E20** Popover (CI5) — first compound flat API, outside-click dismiss, modal opt-in
- **E21** DropdownMenu (CI7) — first accessible menu, typeahead + arrow cycling
- **E22** ContextMenu (CI8) — right-click menu, cursor-point positioning
- **E23** FloatingRoot refactor — extracted 5 primitives to `utils/floating/` (createFloatingContext + useFloatingState + useFloatingDismiss + useFloatingFocus + FloatingPortal), migrated 3 consumers zero-breaking
- **E24** HoverCard (CI9) — first E23 new-build consumer, grace area + HoverCardProvider
- **E25** NavigationMenu (CI10) — menubar, mixed dropdown + standalone Link items
- **E26** Tabs (CI11) — self-contained, zero floating primitives, roving tabindex
- **E27** Select (CI12) — first listbox sub-family, aria-activedescendant pattern
- **E28** Combobox (CI13) — second listbox, editable input + search filter + IME guard
- **E29** useFloatingValueState<T> refactor — 6th floating primitive, 4 consumer migrations
- **E32** Toast (CI15) — first notification sub-family, module-scoped event emitter
- **E33** Slider (CI14) — first drag-gesture consumer, APG `/slider/`

#### Tier B advanced (E30-E31 + E34-E38)
- **E30** Calendar (CI16) — first grid-pattern, `utils/date.ts` zero-dep date primitives
- **E31** DatePicker (CI17) — first composition Epic (Combobox + Calendar + FloatingPortal)
- **E34** Carousel (CI21) — second drag-gesture + first auto-rotation + first live-region
- **E35** ScrollArea (CI20) — third drag-gesture (triggered E39 Rule of Three)
- **E36** InputOTP (CI18) — shadcn/guilhermerodz idiom zero-dep reimplementation
- **E37** Command (CI19) — second composition Epic (Cmd+K palette) + useCommandShortcut hook
- **E38** Sidebar (CI22) — PHASE 10 FINISHER → 80/80, disclosure + plain nav, responsive desktop aside + mobile drawer

### Post-Phase-10 Consolidation Sprints (E39-E41) — 2026-04-18

- **E39** `usePointerDrag` refactor — Rule of Three from Slider/Carousel/ScrollArea → 7th shared primitive `utils/gesture/usePointerDrag.ts`. Unified PointerEvent + setPointerCapture drag. Zero-breaking migration, net -62 LOC library-wide.
- **E40** `useMatchMedia` refactor — Rule of Three from Carousel (PRM) / ScrollArea (coarse + PRM) / Sidebar (breakpoint) → 8th shared primitive `utils/match-media/useMatchMedia.ts`. Pure `(query) => boolean` via `useSyncExternalStore`, SSR-safe. Zero-breaking, net -14 LOC.
- **E41** Maintenance baseline audit — knip + depcheck + ts-prune scans + TypeScript strict config + `any` grep + bundle size verification. All findings false positives per copy-to-project distribution model. Verdict: library already top-quality, zero actionable fixes.

### Documentation Polish Sprint (E42-E46) — 2026-04-18

- **E42** ROADMAP Phase 4 resync (10 stale [ ] → [x] + 6 new E08 hardening rows) + `docs/_tmp/` promoted to `docs/specs/` archive (13 Phase 10 specs preserved for historical reference)
- **E43** context.md TBDs resolved (Figma: N/A code-first per D23, Deadline: COMPLETE 2026-04-18) + COMPONENT_REGISTRY SHARED UTILITIES & PRIMITIVES section added (12 entries documenting all foundation primitives)
- **E44** docs/*.md refresh: import-conventions fully rewritten (15-group ordering + D24 compound + shared utility imports), responsive-strategy +2 sections (useMatchMedia JS-side detection + pointer-coarse orthogonal strategy), scss-conventions +forced-colors Windows HCM convention + touch targets WCAG 2.2, token-architecture drift disclaimer extended
- **E45** component-inventory Phase 10 refresh (✓ markers + Epic column + utility primitives section) + JSDoc consistency sweep (4 earliest Phase 10 components E15-E18 back-filled with @layer/@tokens/@deps/@a11y/@apg/@tested/@regressions/@example tags; all 22 now have 8/8 tag coverage)
- **E46** CHANGELOG.md authored + v1.0-stable git tag + library freeze milestone

---

## Pre-v1.0 (Phase 0-9, E03-E14) — 2026-04-14

### Phase 9: Demo & Docs — E14
- `/demo` showcase page rendering all 58 components (at E14 launch) with runtime theme toggle + anchor nav + inline SVG icons
- README.md consumer adoption guide
- COMPONENT_REGISTRY.md complete props + tokens + deps + usage for all atoms

### Phase 8: Card Presets — E13
- 5 Card-based molecule presets: ContentCard, SidebarCard, FormCard, StatsCard, ActionCard

### Phase 7: Molecules — E12
- 6 molecules: DataRow, BackLink, SectionDivider, AccordionGroup, ToggleGroupFilter, DeadlineBadge

### Phase 6: Specialized Atoms — E10 + E11
- **E10 Tier A (5):** Dot, MetricBar, AnimatedCounter, Breadcrumb, Pagination
- **E11 Tier B (3):** UsageDonut (SVG donut), AvailabilityBar (day strip), Kbd

### Phase 5: Feedback Atoms — E09
- 3 atoms: Empty (slot-based CTA), Alert (4 variants + opt-in dismiss + href body), Progress (stages XOR percent discriminated union)

### Phase 4: Simple Interactive Atoms — E07 + E08
- **E07 core (12):** Button, ButtonGroup, Input, Label, Textarea, Checkbox, RadioGroup + RadioGroupItem, Toggle, ToggleGroup, Switch, Accordion
- **E08 Production Hardening (6):** InputGroup, InputGroupText, NumberInput, MaskedInput, PhoneInput, PasswordInput. Plus Input hardened with prefix/suffix/showCounter/clearable/loading per D26 3-layer form architecture.

### Phase 3: Display Atoms — E06
- 12 display atoms: Card + 4 slots (CardHeader/CardBody/CardFooter/CardSection), Badge, Separator, IconBox, Avatar, Skeleton, Spinner, AspectRatio

### Phase 2: Typography Atoms — E05
- 2 atoms: Heading (level 1-6 + decoupled visual size), Text (5 variants + uppercase/asChild)
- Label moved from Phase 2 to Phase 4 (form-coupled semantics)

### Phase 1: Layout Atoms — E04
- 4 layout atoms: Stack, Inline, Container, Section

### Phase 0: SCSS Fundament — E03
- 7 SCSS fundament files: `_project-settings.scss` (seed values) + `_generator.scss` (color scales/shadows/glows/states/theme mapping) + `_semantics.scss` (CSS custom properties) + `_component-tokens.scss` (per-component overrides template) + `_mixins.scss` (breakpoints + touch-target + focus-ring + sr-only) + `_animations.scss` (16 keyframes + PRM guard) + `_project-overrides.scss` (template)

### Discovery — Pre-E03
- D1-D26 architectural decisions finalized. D5/D25 zero-dep policy. D24 shadcn-aligned flat naming. D9 Tailwind-style 4px spacing scale. D11 `.root` base class convention. D13 WCAG 2.2 AAA touch target. D26 3-layer form input architecture.

---

## Links

- **Repo:** https://github.com/BleizLabs/bleizlabs-ui
- **Docs:** `docs/` folder in root
- **Specs archive:** `docs/specs/` (13 Phase 10 component build specs preserved for historical reference)
- **Component registry:** `COMPONENT_REGISTRY.md` (single source of truth for all 80 components + 8 primitives + 2 modules)
- **Roadmap:** `ROADMAP.md` (phase-by-phase build plan with status markers)
- **Decisions:** `docs/decisions.md` (D1-D26 canonical)
- **Dev playground:** `cd dev && npm run dev` → http://localhost:3000/demo (all components) + http://localhost:3000/components/<name> (per-component routes)
