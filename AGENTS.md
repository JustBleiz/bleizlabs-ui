<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

---

# `@bleizlabs/ui` — Agent Cheat-Sheet

**Valid for:** `@bleizlabs/ui@__VERSION__` — if `npm view @bleizlabs/ui version` differs, this doc may be stale; re-read after upgrade.

## What this is

A curated React component library (zero-dependency, SCSS Modules, WAI-ARIA compliant, React 19 + Next.js 16) — a set of **universal building blocks**, not pre-composed product surfaces. You compose your project-specific organisms by combining these building blocks. The lib provides structure + a11y + behavior; your project owns visual identity beyond seed tokens via SCSS modules + the `className` passthrough on every component.

**What lib gives you:** atoms (`Button`, `Card`, `Heading`, `Stack`, `Inline`), molecules (`Header`, `Field`, `BackLink`, `Chip`, `DataRow`, `Timeline`), complex behavior compounds (`Dialog`, `Combobox`, `DatePicker`, `Form`, `Toaster`, `Sidebar`, `DataTable`), 5 chart primitives, a token system, an `asChild` polymorphism slot, and a Next.js 16-ready SSR mount-gate pattern.

**What lib does NOT give you:** product-themed compositions (no `<ProjectCard>`, no `<DashboardHero>`, no business-domain organisms), drag-and-drop, rich text editing, virtualization (≥500 rows), or styling-alternative variants — bring those externally or compose in your project.

## Decision tree — before reaching for a component

```
Q1. Does a lib export cover this primitive (Card / Button / Stack / Form / …)?
    YES → use it. STOP.
    NO  → Q2.

Q2. Can I compose 2-3 lib atoms inline in `_sections/<Name>Section/`?
    YES → compose in the section. STOP. (This is the default.)
    NO  → Q3.

Q3. Does the same composition pattern already appear in 2+ pages with IDENTICAL
    structural + slot + data shape?
    YES → extract to `app/_components/shared/<atoms|molecules|organisms|layout>/<Name>/`
    NO  → leave inline; wait for the 2nd identical use.

Q4. Has the same pattern repeated 3+ times across BleizLabs projects?
    YES → file a lib proposal — universal naming, no business prefix.
    NO  → it stays project-local.

Q5. Borderline? → ask the user.
```

## Top anti-patterns

| You wrote                                                      | Fix                                                                                                                          |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `<button onClick=...>` in `.tsx`                               | `<Button onClick=...>` — never raw `<button>` in lib-consumer code                                                           |
| `<Button asChild><Link href>` for navigation                   | `<Button href="...">` — renders `<a>`, server-safe; `asChild` pulls Slot's `'use client'` boundary for zero benefit          |
| Local `Card` / `Stack` / `Heading` shadowing                   | Import from `@bleizlabs/ui` — local atoms drift from library updates                                                         |
| `!important` in `.module.scss`                                 | Component variant or `className` passthrough — `!important` blocks consumer overrides                                        |
| `<DateTimePicker>` value rendered as `"2026-05-13T14:30"` text | Use `value` for ISO transport; the field displays space-separated for humans automatically                                   |
| `'use client'` at page level when only one leaf is interactive | Push the directive to the interactive leaf component only                                                                    |
| Local `BackLink` / `Chip` / `DataRow` / `Timeline` molecule    | Lib already ships these — check `Section J` inventory below                                                                  |
| Mirror SCSS rules across 2+ consumer files                     | Extract a shared molecule per Q3, single styling source                                                                      |
| `useState` + `onChange` for every form field                   | `<Form>` + `<Field>` use the native Constraint Validation API; FormData reads automatically                                  |
| Per-component scrollbar styling                                | `@use '@bleizlabs/ui/styles/scrollbar';` in `app/globals.scss` once                                                          |
| External chart libs (Recharts, Chart.js, D3)                   | Lib ships 5 charts (LineChart / AreaChart / BarChart / PieChart / Sparkline) — ≤500 points; >500 then yes, bring D3 directly |

## Where to read deeper

- **Per-domain guide + decision rules + SSR notes + inventory of all ~106 components:** read `docs/AGENT-USAGE.md` (same package, ship together). When working in a consumer project's `node_modules/`, the explicit path is:
  - `node_modules/@bleizlabs/ui/docs/AGENT-USAGE.md`
- **Per-component API reference (props, ARIA contract, tokens, examples):** read the JSDoc at the top of each component file:
  - `node_modules/@bleizlabs/ui/components/<category>/<Name>/<Name>.tsx`
- **Setup + Next.js config + token override patterns:** README.md and `docs/AGENT-USAGE.md` §B.
- **Internal source-of-truth for what's published:** `node_modules/@bleizlabs/ui/components/manifest.json`.

## Pointer for consumer-project `AGENTS.md`

If you're authoring this consumer project's own `AGENTS.md`, add:

```
When working with @bleizlabs/ui, explicitly Read `node_modules/@bleizlabs/ui/AGENTS.md`
at the start of any UI task. Drill into `node_modules/@bleizlabs/ui/docs/AGENT-USAGE.md`
for per-domain detail. Both files ship inside the npm tarball.
```

This is the discovery surface — your agent will not auto-scan `node_modules/`. The pointer instructs it explicitly.
