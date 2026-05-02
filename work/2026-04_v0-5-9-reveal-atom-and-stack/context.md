# v0.5.9 — Reveal atom + RevealStack molecule

**Status:** IN_PROGRESS (implementation done, awaiting PR acceptance)
**Type:** ad-hoc work-unit (library version bump, additive)
**Start:** 2026-04-27
**Branch:** `work/v0.5.9-reveal-atom-and-stack`
**Pochodzenie:** Promotion of project-local `RevealOnView` from `bleizlabs-website/dev/apps/web/src/app/(marketing)/_components/RevealOnView/RevealOnView.tsx` to `@bleizlabs/ui`.

## Scope

Two new components shipping together w v0.5.9:

1. **Reveal atom** (Phase 3 Display D9, Tier B) — pure behavior wrapper. IntersectionObserver-driven `data-revealed='true'` attribute emit. One-shot (disconnects after first intersection). API improvements over RevealOnView:
   - `tag` (constrained `RevealTag` union) replaces unconstrained polymorphic `as` (Section precedent)
   - `asChild` via Slot (D5/D25 library convention)
   - `immediate` skip-observer prop dla above-the-fold LCP (eliminates flash)
   - `disabled` test-fixture override
   - `mergeRefs` for forwardRef + internal ref composition
   - SSR-safe `IntersectionObserver === undefined` guard

2. **RevealStack molecule** (Phase 7 M8) — composition `Reveal + Stack`. Replaces verbose `<Reveal><Stack gap={3}>...</Stack></Reveal>` pattern w consumer code. Default `gap={3}` = canonical panel section header→body uniform vertical rhythm (16px). Forwards Reveal props + Stack props.

## Pochodzenie + driver

User feedback z bleizlabs-website panel sweep (2026-05-04):
- Po zrobieniu 7 dashboard sekcji `/panel/_sections/` (HeroStrip, ActionStrip, SystemsGrid, ProjectsOverview, ActivityFeed, PlanHoursStrip, MarketplacePreview) odkryliśmy że SectionHeader nie ma gap do contentu pod nim ("klei się").
- Iter 1 fix: SectionHeader padding-bottom space-3.
- User pushback: "raczej paddingów unikam w komponentach, gap powinien zarządzać".
- Iter 2: gap-on-parent — strip SectionHeader to `padding: 0`, dodać `display: flex; flex-direction: column; gap: var(--space-3)` do każdej `.section`.
- User pushback: "powinien być Section molecule który zarządza gap centralnie".
- Iter 3: zbudowałem `<PanelSection>` molecule w consumer (Reveal + flex-column gap-3).
- User pushback: "biblioteka ma już `<Section>` — sprawdź najpierw, może dodać brakujące?"
- Audit: library `<Section>` = full-width semantic band z bg+py (poprawny SRP atom, NIE container z gap).
- Decision: promote `RevealOnView` → `<Reveal>` library atom + dodać `<RevealStack>` library molecule z gap. Pure library composition, drop consumer custom molecule.

## Architectural decisions

1. **`<Reveal>` jako pure behavior atom** — żadnego CSS, żadnego layoutu. Tylko `data-revealed` emit. Single Responsibility per Slot precedent.
2. **`<RevealStack>` jako composition molecule** — Stack-jakość layout convenience. NIE dodajemy `gap` propa do Reveal (SRP violation). NIE dodajemy `bodyGap`/`headerGap` w RevealStack (magic, brittle). Single uniform gap = canonical pattern; nested groups użyją własnych `<Stack>`.
3. **`tag` constrained union NIE polymorphic `as`** — zgodne z Section precedent + D5/D25 + iter 1 evaluator IMP. `asChild` (Slot) covers tags outside union + custom components.
4. **className na outer wrapper, NIE inner Stack** — 90% use case = consumer styluje reveal-driven CSS transitions na elemencie z `data-revealed`. Documented w `@notes`.
5. **Library NIE ships gap constants enum** — opinionated values to consumer concern. Library = scale (`SpaceIndex`) + primitives + composition discipline. Consumer projects mogą definiować own `PANEL_GAP`/`MARKETING_GAP` enum mapping semantic names.

## Quality gates

- [x] tsc --noEmit clean (zero errors)
- [x] eslint clean (zero warnings on new files + barrel)
- [x] Phase 4 Evaluator iter 1 → PASS-conditional (2 IMP) → fixes applied → iter 2 → 2 new IMP (stale JSDoc references after `as`→`tag` rename) → mechanical fixes applied → verifiable by inspection
- [ ] Phase 7.1 Critical Consistency Audit (consistency-audit skill) — pending before DONE_EPIC
- [ ] PR acceptance signal from user

## Kryteria wyjścia

1. Reveal + RevealStack live w `@bleizlabs/ui@0.5.9` na GitHub Packages (CI Publish workflow PASS post-tag)
2. ROADMAP.md + COMPONENT_REGISTRY.md zaktualizowane (D9 + M8 entries, count bumped to 93)
3. CHANGELOG.md entry dla v0.5.9
4. Demo route(s) funkcjonalne (`/components/reveal` + `/components/reveal-stack`)
5. Branch merged via PR squash → main → tag v0.5.9 push → branch deleted

## Konsumencja post-publish (NIE w scope tego work-unitu)

Po landingu v0.5.9 w bleizlabs-website (separate work-unit):
- Bump `package.json`: `"@bleizlabs/ui": "^0.5.9"`
- Cofnij mój nieudany custom `<Section>` molecule w `(panel_v2)/_components/panel/molecules/Section/`
- Migracja 7 dashboard sekcji: `<RevealOnView><Stack>...</Stack></RevealOnView>` → `<RevealStack>...</RevealStack>`
- Optional: refactor `RevealOnView` w `(marketing)/_components/` → re-export `Reveal` z library (zachowuje 36 marketing imports)
