<div align="center">

# `@bleizlabs/ui`

**A zero-dependency, fully-styled React component library built for projects that want structure + accessibility + behaviour from the library and own visual identity in their own SCSS.**

[![npm](https://img.shields.io/npm/v/@bleizlabs/ui?color=cb3837&logo=npm&label=npm)](https://www.npmjs.com/package/@bleizlabs/ui)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![WAI-ARIA APG](https://img.shields.io/badge/WAI--ARIA-APG-blue)](https://www.w3.org/WAI/ARIA/apg/)
[![Zero deps](https://img.shields.io/badge/runtime%20deps-0-success)](#whats-inside)

[**Install**](#install) · [**Quick start**](#quick-start) · [**What's inside**](#whats-inside) · [**Theming**](#theming) · [**For AI agents**](#for-ai-agents)

</div>

> **Radix without the styling sweat. shadcn without the fork-forever tax.**
> _Radix daje a11y. shadcn daje style. Tylko my dajemy oba — i propagujemy fixy przez `npm update`._

---

## Why `@bleizlabs/ui`?

Three walls hit every product team:

| Approach                             | What you get          | What hurts                                              |
| ------------------------------------ | --------------------- | ------------------------------------------------------- |
| **Headless** (Radix, Headless UI)    | Accessible primitives | Every project re-invents the design system from scratch |
| **Styled** (MUI, Chakra, Ant Design) | Pre-built look        | Locked into their design language + runtime dependency  |
| **Copy-paste** (shadcn/ui)           | Great starting point  | Every project forks forever — fixes don't propagate     |

`@bleizlabs/ui` sits between them: **fully styled** out of the box, **zero runtime UI dependencies**, **seed-token driven**. Override 5–10 seed values and the entire library reskins consistently — without forking source code.

---

## Install

```bash
npm install @bleizlabs/ui
```

Public on npm — no auth, no `.npmrc` setup.

> Migrating from an older internal release? If your `.npmrc` contains `@bleizlabs:registry=https://npm.pkg.github.com`, remove that line — the package moved to public npm registry in `0.22.x`.

---

## Quick start

### Path A — Recommended: CLI scaffold (60 seconds)

For a fresh Next.js 16 + React 19 project, run one command:

```bash
npx @bleizlabs/ui init
```

This generates:

- **A wrapper layer** at `app/_components/ui/` — thin re-exports per family that you import from instead of `@bleizlabs/ui` directly. Lets you add project-specific variants without forking the library.
- **`app/globals.scss`** with seed-token override scaffolding
- **`tsconfig.json` path aliases** (`@/components/ui`, `@/components/shared`)
- **`AGENTS.md` + `CLAUDE.md`** with project discipline rules for AI coding agents
- **`docs/component-inventory.md`** for tracking project-local components

Re-runs are idempotent. After upgrading the lib: `npx @bleizlabs/ui add --new` to scaffold wrappers for new components.

### Path B — Manual setup (existing project)

If you're integrating into an existing project or skipping the wrapper layer, three steps:

**1. Configure Next.js** (`next.config.mjs`):

```js
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
export default {
  transpilePackages: ['@bleizlabs/ui'],
  sassOptions: {
    loadPaths: [path.resolve(__dirname, 'node_modules/@bleizlabs/ui/styles')],
  },
};
```

**2. Bootstrap styles** (`app/globals.scss`):

```scss
@use '@bleizlabs/ui/styles';

// Optional: prettier global scrollbars
@use '@bleizlabs/ui/styles/scrollbar';
```

**3. Import + use:**

```tsx
// app/page.tsx
import { Card, CardHeader, CardBody, Heading, Text, Button, Stack } from '@bleizlabs/ui';

export default function Page() {
  return (
    <Card padding={6} radius="lg">
      <CardHeader>
        <Heading level={1} size="2xl">
          Hello from @bleizlabs/ui
        </Heading>
      </CardHeader>
      <CardBody>
        <Stack gap={4}>
          <Text variant="body" color="secondary">
            Fully styled, zero deps, seed-token driven.
          </Text>
          <Button variant="primary">Get started</Button>
        </Stack>
      </CardBody>
    </Card>
  );
}
```

That's it. No provider wrapping, no theme context, no runtime style computation.

---

## What's inside

100+ focused components across 9 categories (live count in [`components/manifest.json`](components/manifest.json) — read for the canonical list at any version).

| Category                     | Highlights                                                                                                                                                                                                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layout**                   | `Stack` · `Inline` · `Container` · `Section` · `GridLayout`                                                                                                                                                                                                             |
| **Typography**               | `Heading` (decoupled level/size) · `Text` · `Anchor` · `Eyebrow` · `Mark`                                                                                                                                                                                               |
| **Display**                  | `Card` (compound) · `Badge` · `Avatar` + `AvatarGroup` · `KpiValue` · `Reveal` · `Skeleton` · `Spinner` · `Table` · `CodeBlock`                                                                                                                                         |
| **Interactive (forms)**      | `Button` · `Input` · `Select` · `Checkbox` · `RadioGroup` · `Switch` · `Toggle` · `Slider` · `Rating`                                                                                                                                                                   |
| **Feedback**                 | `Alert` · `Banner` · `Empty` · `Progress` · `Toaster` (imperative `toast()` API)                                                                                                                                                                                        |
| **Specialized + Navigation** | `Breadcrumb` · `Pagination` · `ThemeToggle` · `Timeline` · `Kbd` + 5 small data-viz primitives                                                                                                                                                                          |
| **Molecules**                | `Header` · `Field` · `Chip` · `DataRow` · `FileChip` · `BackLink` · `IconButton` and more                                                                                                                                                                               |
| **Charts**                   | `LineChart` · `AreaChart` · `BarChart` · `PieChart` · `Sparkline` (SVG, ≤500 points/series)                                                                                                                                                                             |
| **Complex / Data**           | `Dialog` · `Sheet` · `Drawer` · `Popover` · `Tooltip` · `DropdownMenu` · `Combobox` · `DataTable` · `Form` + `Field` · `DatePicker` · `DateRangePicker` · `TimePicker` · `DateTimePicker` · `Sidebar` · `Tabs` · `Accordion` · `Stepper` · `NavigationMenu` · `Toolbar` |

**Highlights:**

- **Zero runtime UI dependencies** — every floating primitive, focus trap, drag gesture, date utility, and keyboard model is built in-house. No Floating UI, no date-fns, no Recharts, no Radix at runtime.
- **APG-first accessibility** — every interactive component maps to a documented [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) pattern with full keyboard model + ARIA contract.
- **Runtime-test-verified** — Playwright keyboard / focus / aria / regression suites per component + `@axe-core/playwright` WCAG 2.1 AA sweep across all playground routes.
- **100% JSDoc coverage** — every component carries `@layer` / `@tokens` / `@deps` / `@a11y` / `@example` tags. Read [`node_modules/@bleizlabs/ui/components/<category>/<Name>/<Name>.tsx`](components/) for per-component API truth.
- **React 19 + Next.js 16** — Server Components by default, `'use client'` only at interactive leaves, FloatingPortal hydration mount-gated, React Compiler compatible.
- **Form-native** — `<Form>` + `<Field>` compound reads FormData natively via the Constraint Validation API. No `useState` per field.

---

## Theming

Two cascade layers cover most cases.

### Quick reskin — CSS custom properties

Override semantic tokens at `:root`. Cascades to every component automatically.

```scss
// app/globals.scss
:root {
  --color-brand: #00e0b8;
  --color-accent: #7c3aed;
  --radius-md: 12px;
  --font-primary: 'YourFont', system-ui, sans-serif;
}

[data-theme='dark'] {
  --color-surface: #0a0a0a;
  --color-text-primary: #fafafa;
}
```

Full token reference: [`styles/_semantics.scss`](styles/_semantics.scss).

### Deep reskin — seed values

Override seed Sass variables when you want the entire color scale + derived shadows + hover states to follow a new brand colour consistently.

```scss
@use '@bleizlabs/ui/styles' with (
  $seed-brand: #00e0b8,
  $seed-accent: #7c3aed,
  $seed-font-primary: (
    'YourFont',
    system-ui,
    sans-serif,
  )
);
```

Every seed in [`styles/_project-settings.scss`](styles/_project-settings.scss) carries `!default` — pass only what you care about.

### Project-specific variants

For one-off visual treatments, compose locally via `className` rather than fork the library:

```tsx
import { Button } from '@bleizlabs/ui';
import styles from './GradientButton.module.scss';

<Button className={styles.gradient}>Launch</Button>;
```

If the same styled pattern repeats across 2+ pages, extract a shared molecule wrapping the lib component — see [`docs/AGENT-USAGE.md`](docs/AGENT-USAGE.md) §C for the full decision rules.

---

## For AI agents

The library ships an agent-friendly cheat-sheet inside the npm tarball:

- **Entry point** ([`AGENTS.md`](AGENTS.md), ~80 LOC) — mission paragraph, Q1-Q5 reuse-first decision tree, top-10 anti-patterns table, pointers to deeper docs
- **Deep reference** ([`docs/AGENT-USAGE.md`](docs/AGENT-USAGE.md), ~750 LOC) — installation walkthrough, three-layer token cascade, SSR / RSC / Next.js 16 mapping, 9 per-domain quick-starts, troubleshooting table, full component inventory auto-generated from `manifest.json`

After `npm install @bleizlabs/ui`, both files live under `node_modules/@bleizlabs/ui/`. Agents like Claude Code, Codex, and Cursor do NOT auto-scan `node_modules/` — you point them explicitly. Add this snippet to your project's own `AGENTS.md`:

```md
When working with @bleizlabs/ui, explicitly Read `node_modules/@bleizlabs/ui/AGENTS.md`
at the start of any UI task. Drill into `node_modules/@bleizlabs/ui/docs/AGENT-USAGE.md`
for per-domain detail. Both files ship inside the npm tarball.
```

If you ran `npx @bleizlabs/ui init`, the generated consumer-side `AGENTS.md` already includes a Lib Reference section pointing at these paths.

Each doc carries a `**Valid for:** @bleizlabs/ui <version>` header injected at publish time — agents can compare against `npm view @bleizlabs/ui version` to detect cached-stale state after lib upgrades.

---

## Playground

Every component has a dedicated demo route. To run locally:

```bash
git clone https://github.com/BleizLabs/bleizlabs-ui.git
cd bleizlabs-ui/dev
npm install
npm run dev
```

Open `http://localhost:3000` for the component index, `/demo` for a combined showcase, or `/components/<name>` for per-component deep dives. Every component is dual-theme from day one.

---

## Architecture at a glance

- **SCSS Modules only** — scoped class names, zero runtime style computation, no CSS-in-JS, no Tailwind
- **Zero runtime UI dependencies** — positioning, focus trap, dismiss, drag, match-media, date math all in-house
- **Semantic tokens** — components reference `var(--color-brand)`, never primitive scale values
- **Compound flat API** — `<Card>` + `<CardHeader>` + `<CardBody>` as siblings (shadcn-aligned, IDE-friendly, tree-shakeable)
- **Polymorphism via `asChild`** — pass-through rendering for `<Link>`, custom elements, etc., powered by an in-house `Slot` primitive
- **APG-first accessibility** — every interactive component has a documented keyboard model, ARIA contract, and regression test catalogue

| Layer            | Choice                                                         |
| ---------------- | -------------------------------------------------------------- |
| Framework        | React 19 + Next.js 16.2 (App Router, Turbopack)                |
| Language         | TypeScript 5.6 (strict, `noUncheckedIndexedAccess`)            |
| Styling          | SCSS Modules + CSS custom properties (seed → semantic cascade) |
| Polymorphism     | In-house `Slot` primitive (Radix-style `asChild`)              |
| Positioning      | In-house `useFloating` + `computePosition`                     |
| Date math        | In-house `utils/date.ts` (native `Date` + `Intl`)              |
| Focus management | In-house `useFocusTrap` + `findFirstTabbable`                  |
| Drag gestures    | In-house `usePointerDrag` with pointer-capture                 |
| Testing          | Playwright + `@axe-core/playwright`                            |

No external UI library is imported at runtime.

---

## Quality gates

Every release passes:

- **Smoke sweep** — `@axe-core/playwright` WCAG 2.1 AA scan across every playground route, run against a production build
- **Per-component suites** — keyboard / focus / ARIA state / regression tests for every interactive primitive
- **NVDA sweep protocols** — manual screen-reader checklists for NVDA + Firefox per interactive component

```bash
npm run test         # full Playwright suite
npm run test:smoke   # axe-core sweep only
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
```

---

## Browser support

| Browser                  | Minimum version                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Chrome / Edge (Chromium) | 111+ &nbsp;<sub>(Accordion `interpolate-size: allow-keywords` requires 129+; falls back to `max-height`)</sub> |
| Firefox                  | 110+                                                                                                           |
| Safari (desktop + iOS)   | 16.4+                                                                                                          |

Every component ships with `prefers-reduced-motion: reduce` fallbacks and `forced-colors: active` (Windows High Contrast) mappings where relevant.

---

## Versioning

Pre-1.0. Minor bumps (`0.X.0`) may include breaking changes — read [CHANGELOG.md](CHANGELOG.md) before upgrading. Patch bumps (`0.X.Y`) are safe.

The library will hit `1.0.0` on an explicit stabilization trigger from maintainers, not auto-follow from minor count.

---

## Links

- 📦 [npm package](https://www.npmjs.com/package/@bleizlabs/ui)
- 📓 [CHANGELOG](CHANGELOG.md)
- 🗺️ [ROADMAP](ROADMAP.md)
- 🤖 [Agent docs (`AGENTS.md`)](AGENTS.md) · [Deep reference (`docs/AGENT-USAGE.md`)](docs/AGENT-USAGE.md)
- 🐛 [Issues](https://github.com/BleizLabs/bleizlabs-ui/issues)
- 🔒 [Security policy](SECURITY.md)

---

## Contributing

This library is open-source for visibility but not currently accepting external contributions. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT — see [LICENSE](LICENSE). © BleizLabs.

---

<div align="center"><sub>Built by <a href="https://bleizlabs.eu">BleizLabs</a>.</sub></div>
