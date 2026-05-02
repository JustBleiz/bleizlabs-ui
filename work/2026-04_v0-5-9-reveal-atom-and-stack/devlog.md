# DevLog — v0.5.9 Reveal atom + RevealStack molecule

## Aktywna sesja — 2026-04-27

- **Co robimy:** v0.5.9 = promote project-local `RevealOnView` z bleizlabs-website → library `<Reveal>` atom + new `<RevealStack>` molecule (Reveal + Stack composition).
- **Stan:** Implementation done, audit iter 2 PASS post-mechanical-fixes, awaiting Phase 7.1 + PR acceptance.
- **Następne:** Update CHANGELOG, COMPONENT_REGISTRY entries, demo routes, commit, push, open PR awaiting user "odbieram".

---

## [START_EPIC] E01: Reveal atom + RevealStack molecule (v0.5.9) — 2026-04-27

- **Cel:** Promote universal scroll-reveal pattern z consumer code do library, dodać layout-composition convenience molecule dla canonical section pattern.
- **Driver:** User feedback z bleizlabs-website panel sweep — section header→body gap consistency problem rozwiązany przez gap-on-parent + library composition.
- **Zakres:**
  - [x] **Reveal atom** (Phase 3 Display D9, Tier B): `tag` (constrained `RevealTag`) / `asChild` (Slot) polymorphism, `immediate`/`disabled` overrides, `mergeRefs` ref forwarding, SSR-safe IO guard, `'use client'` boundary z rationale comment
  - [x] **RevealStack molecule** (Phase 7 M8): composition `<Reveal><Stack/></Reveal>`, default `gap={3}`, forwards Reveal props + Stack props, className na outer wrapper documented
  - [x] Barrel export updates (`components/index.ts`): Display 9 → 10 families, Molecules 10 → 11
  - [x] Type re-export: `RevealTag` shared between Reveal + RevealStack
  - [x] ROADMAP.md updates: D9 Reveal, M8 RevealStack
  - [x] package.json bump 0.5.8 → 0.5.9, description count 91 → 93
  - [ ] COMPONENT_REGISTRY.md entries
  - [ ] CHANGELOG.md entry
  - [ ] Demo route `/components/reveal` (atom + RevealStack examples — single page z 2 sections)
  - [ ] Phase 7.1 Critical Consistency Audit
  - [ ] PR open awaiting acceptance
- **Audit trail:**
  - Phase 4 iter 1: 0C / 2I / 2N → IMP-1 (`as` unconstrained ElementType — rename to `tag` + `RevealTag` union per Section precedent), IMP-2 (RevealStack className lands on outer not inner Stack — document w @notes)
  - Both IMP fixes applied
  - Phase 4 iter 2: 0C / 2I / 1N → both new IMP były stale JSDoc references (`as` w @a11y, `as` w second @example, `ElementType` w @deps) — **mechanical fixes verifiable by inspection** per evaluator note
  - Mechanical fixes applied — tsc + lint clean
- **Audit reports:**
  - `audit-round-1.md` — initial 2 IMP
  - `audit-round-2.md` — JSDoc stale references catch
- **Weryfikacja:**
  - `npx tsc --noEmit` PASS (zero errors)
  - `npx eslint components/display/Reveal components/molecules/RevealStack components/index.ts` PASS (zero warnings)
  - Phase 7.1 audit pending
  - Demo + manual visual verification pending
