## Evaluator Report — Reveal + RevealStack (v0.5.9)

> Audited: 2026-05-02  
> Components: `display/Reveal` (Phase 3 D9, Tier B) + `molecules/RevealStack` (Phase 7 M11)  
> Rubric: Standard Rubric (not Extended — neither is a Phase 10 complex interactive component)  
> Build gate: `npx tsc --noEmit` PASS, `npx eslint` PASS (pre-confirmed by submitter)

---

### Context notes (applied before scoring)

**No SCSS module — intentional:** Both components are behavior-only wrappers. The `Reveal` atom follows the `Slot` precedent (also no SCSS, utility-only). `RevealStack` composes `Reveal + Stack` with zero own visual surface. The SCSS module requirement from the standard file-structure rubric is waived for behavior-only atoms per the established Slot precedent. This is **not a CRITICAL** — the absence is documented in the submission rationale and consistent with an existing pattern.

**`prefers-reduced-motion` — consumer responsibility:** Neither component owns CSS transitions or animations. Motion (opacity fade, translateY) lives in the consumer's SCSS. The `@example` in `Reveal.tsx` explicitly documents the consumer SCSS pattern including `@media (prefers-reduced-motion: reduce)`. The rubric's motion check fires only when the component itself has `animation`/`transition` — not applicable here. This is **not a finding**.

**Touch target check — N/A:** Both components are non-interactive wrappers (no click handler, no focus target). Touch target rule applies to interactive components only. Not applicable.

---

### CRITICAL (0 issues) [blocks merge]

None.

---

### IMPORTANT (2 issues) [should fix]

**[Reveal.tsx:76 / RevealStack.tsx:66] `as` prop typed as open `ElementType` — should be a constrained union.**

The rubric (IMPORTANT → TypeScript) requires: "`as` prop union type constrained (e.g., 'div' | 'section' | 'article')". Both components declare `as?: ElementType` (unconstrained — accepts any React element type including function components, forwardRef wrappers, class components). The `TableCell` precedent in the same codebase uses `as?: 'td'` — a constrained literal. 

For a scroll-reveal wrapper the realistic semantic tag set is small: `'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer' | 'li' | 'ul' | 'ol'`. Keeping it open means the TS checker won't warn when a consumer passes a function component to `as` (which should go through `asChild` instead). It also inflates the type signature unnecessarily.

**Recommended fix (Reveal.tsx:76):**
```tsx
// Before
as?: ElementType;

// After
as?: 'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer' | 'li' | 'ul' | 'ol';
```
Apply the same constrained union to `RevealStack.tsx:66`. The `asChild` prop already covers the "project onto a custom component" use case — `as` is for intrinsic HTML elements only, so the constraint is semantically correct.

---

**[RevealStack.tsx:119] Inner `<Stack>` swallows consumer `className` from root.**

`RevealStack` passes `className` (after `cn(className)`) to `<Reveal>`, which applies it to the outer wrapper. However the inner `<Stack gap={gap}>` at line 119 does not receive a `className` prop. A consumer who writes:

```tsx
<RevealStack className={styles.mySection} gap={3}>...</RevealStack>
```

gets `styles.mySection` on the Reveal wrapper, not on the Stack element. This is unlikely to cause a runtime error, but it creates a class placement discrepancy compared to `Stack` used directly: the consumer's class lands one level above the `display: flex` node, meaning SCSS selectors targeting flex children won't resolve as expected.

Ruling: IMPORTANT (props forwarding convention — `className` should land on the element that carries the layout, i.e. the flex node). The rubric IMPORTANT check states "No inline styles — all styling via SCSS Module + props" and "className prop appended LAST (enables consumer override)". The override is technically possible but lands on the wrong DOM node.

**Recommended fix:** Expose a `stackClassName` prop OR document explicitly in `@notes`/`@example` that `className` targets the Reveal wrapper (outer) and consumers who need to style the flex container should use `<Reveal className={...}><Stack className={...} gap={3}>` directly.

If the decision is to keep the current behavior (className on outer Reveal, not on Stack), document it with a `@notes` addition — then this becomes a NITPICK (known, documented trade-off) rather than an undocumented surprise.

---

### NITPICK (2 issues) [optional]

**[Reveal.tsx:71] JSDoc `@example` contains an escaped comment close (`*\/`) that is fragile in some doc generators.**

Line 71: `{/* Above-the-fold LCP — skip observer, render revealed immediately *\/}` — the `*\/` is needed to avoid closing the outer JSDoc block, but it means the example is not copy-paste safe (pasting this line into a `.tsx` file produces a syntax error: `*\/` is not valid JSX comment syntax; the correct form is `*/`). Evaluating strictly: the example intent is clear and TS/ESLint parse correctly. Minor risk for doc-generator tooling or copy-paste workflow.

**Recommended:** Split the `@example` block using ` ``` ` fencing (as some components do), or escape with `{/* ... * /}` (space before `/`).

---

**[components/index.ts:103] `Card presets` count comment says "(5)" but lists 6 exports.**

Lines 105-110: ActionCard, ContentCard, FormCard, PairedCard, SidebarCard, StatsCard = 6 families. Comment reads "(5)". This is pre-existing drift, not introduced by v0.5.9 — the new exports (Reveal + RevealStack) have correct counts in Display (10) and Molecules (11). Flagging here for hygiene.

---

### Verdict: PASS

**Reason:** Zero CRITICAL issues. Two IMPORTANT issues identified:
1. `as` prop should be a constrained union (currently open `ElementType`) in both Reveal and RevealStack.
2. RevealStack's `className` lands on the Reveal wrapper, not the inner Stack flex node — the behavior should be documented in `@notes` if intentional, otherwise the component should expose a `stackClassName` escape hatch.

Both IMPORTANT issues are fixable without architecture changes. If the team accepts (2) as a documented trade-off (document in `@notes`), (1) remains the only required fix before merge. A Round 2 with the constrained `as` type and one added `@notes` sentence on `className` placement would bring this to a clean PASS with zero IMPORTANT.

**Completeness:** 0/0 CRITICAL passed (none found), 0/2 IMPORTANT passed (2 found), 2/2 NITPICK noted.
