# Changelog — bleizlabs-ui

All notable releases of this component library. Follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. This library uses copy-to-project distribution (D5/D25) — no npm package versions. Versions below mark library maturity milestones for consumer adoption reference.

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
