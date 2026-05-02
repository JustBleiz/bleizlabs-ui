## Evaluator Report — Reveal + RevealStack (v0.5.9) — Round 2

> Audited: 2026-05-02
> Components: `display/Reveal` (Phase 3 D9, Tier B) + `molecules/RevealStack` (Phase 7 M11)
> Build gate: `npx tsc --noEmit` PASS, `npx eslint` PASS (pre-confirmed by submitter)
> Scope: verify IMP-1 + IMP-2 fixes; check for regressions introduced by the refactor

---

### Iter 1 fix verification

- **IMP-1 status: RESOLVED** — `as` renamed to `tag`, constrained to `RevealTag` union (`'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav' | 'li'`). Type exported from `Reveal/index.ts` and imported by `RevealStack`. Union is closed and semantically appropriate; `asChild` covers the custom-component case. Mirrors Section's `tag` precedent as intended.
- **IMP-2 status: RESOLVED** — explicit `@notes` block in RevealStack JSDoc documents that `className` targets the outer Reveal wrapper (intentional, 90% use case) with concrete guidance for the inner-layout styling alternative (`wrap children in own <Stack className={...}>`). No `stackClassName` prop added per stated rationale. Accepted trade-off, well documented.

---

### CRITICAL (0 issues) [blocks merge]

None.

---

### IMPORTANT (2 issues) [should fix]

**[RevealStack.tsx:29] `@a11y` JSDoc references old prop name `as` — stale after IMP-1 rename.**

Line 29: `@a11y  Renders any tag via \`as\` prop or asChild via Slot (delegated to Reveal).`

The prop was renamed from `as` to `tag` as part of the IMP-1 fix, but this sentence was not updated. Consumers reading the JSDoc hover will see documentation describing a prop that does not exist on the component. The correct prop name is `tag`.

**Recommended fix (RevealStack.tsx:29):**
```
// Before
@a11y  Renders any tag via `as` prop or asChild via Slot (delegated to Reveal).

// After
@a11y  Renders any tag via `tag` prop or asChild via Slot (delegated to Reveal).
```

---

**[RevealStack.tsx:63] Second `@example` block still uses old `as="section"` prop — broken example.**

Line 63: `<RevealStack as="section" gap={3}>` — the `as` prop does not exist on `RevealStackProps`. The first example on line 56 was correctly updated to `tag="section"`, but the second example (the "Body sub-group" variant) was missed. Any consumer who copies this example verbatim will get a TypeScript error.

**Recommended fix (RevealStack.tsx:63):**
```tsx
// Before
<RevealStack as="section" gap={3}>

// After
<RevealStack tag="section" gap={3}>
```

---

### NITPICK (1 issue) [optional]

**[RevealStack.tsx:27] `@deps` lists `ElementType` which is no longer imported.**

Line 27: `` `CSSProperties`, `ElementType`, `HTMLAttributes<HTMLElement>`, `ReactNode` `` — `ElementType` was present in the original implementation (when `as?: ElementType` existed) but was removed with the IMP-1 refactor. The actual imports are `forwardRef`, `CSSProperties`, `HTMLAttributes`, `ReactNode` (lines 7-12). `ElementType` is no longer in scope. The stale reference in `@deps` is harmless but misleads readers about actual dependencies.

**Recommended fix:** Remove `\`ElementType\`` from the `@deps` line.

---

### Verdict: FAIL

**Reason:** Two IMPORTANT issues introduced by the IMP-1 rename refactor — the `@a11y` JSDoc and the second `@example` block in `RevealStack` were not updated when `as` was renamed to `tag`. The second example is a broken copy-paste target (TypeScript will reject `as="section"` on RevealStackProps). Both are one-line fixes with zero architectural impact.

**Completeness vs rubric:** 0/0 CRITICAL passed (none found), 0/2 IMPORTANT passed (2 new issues from rename propagation), 1/1 NITPICK noted.

**Path to PASS:** Fix lines 29 and 63 in `RevealStack.tsx` (plus optionally line 27 `@deps` cleanup). Re-audit not required — both fixes are mechanical and verifiable by inspection.
