# bleizlabs-ui

> Universal fully-styled React component library for BleizLabs.
> Zero runtime UI dependencies. Seed-based design tokens. Copy-to-project model.

## Status

**Phase 0 ✓ + Phase 1 Layout ✓** (delivered 2026-04-14 in Epics E03+E04).

- Phase 0: 7 SCSS fundament files for design tokens (`styles/`)
- Phase 1: 4 layout atoms — Stack, Inline, Container, Section (`components/layout/`)
- Plus: Slot primitive + cn + mergeRefs utils (`components/utils/`), `SpaceIndex` type (`components/types/`), Next.js 16.2.3 dev playground (`app/`)

**Next:** Phase 2 — Typography atoms (Heading, Text, Label).

For the full design rationale and decisions log, see `../docs/decisions.md` and `../docs/component-standards.md`.
For the roadmap see `../ROADMAP.md`.
For the component registry (props, tokens, usage) see `../COMPONENT_REGISTRY.md`.

## Prerequisites

- Node.js 20+
- npm (or yarn/pnpm)

## Setup

```bash
cd dev
npm install
```

## Phase 0 — Style tokens

The SCSS fundament lives in `styles/`:

```
styles/
├── _project-settings.scss    ← seed values (change these per project)
├── _generator.scss           ← auto-generates scales from seeds (do not edit)
├── _semantics.scss           ← CSS custom properties (--color-*, --gap-*, etc.)
├── _component-tokens.scss    ← per-component overrides (lazy, filled during Phase 1+)
├── _mixins.scss              ← breakpoints, touch-target, typography helpers
├── _animations.scss          ← 16 keyframes + infinite modifier
├── _project-overrides.scss   ← optional manual CSS variable overrides
└── index.scss                ← main entry (@forward all above)
```

To consume tokens from a React component:

```scss
// Card.module.scss (Phase 1+)
@use 'path/to/styles/mixins' as mx;

.root {
  background: var(--color-surface);
  padding: var(--padding-card);
  border-radius: var(--radius-card);

  @include mx.bp-md {
    padding: var(--gap-card);
  }
}
```

Components **never** reference primitive tokens — always semantic CSS variables (`var(--color-brand)`, not `$brand-500`). See `../docs/component-standards.md` §3.5.

## Playground — visual QA

A minimal sass compile script lives in `playground/`. Use it to verify the token generator produces expected output.

```bash
npm run build    # compiles styles/index.scss → playground/compiled.css
```

Open `playground/playground.html` in a browser to inspect tokens visually in both light and dark themes. Toggle via the theme button (flips `[data-theme]` on `<html>`).

## Forking this library for your project

**Do not** `npm install bleizlabs-ui` — this library follows copy-to-project pattern (per D2).

```bash
# In your consumer project
cp -r path/to/bleizlabs-ui/dev/styles your-project/styles
cp -r path/to/bleizlabs-ui/dev/components your-project/components  # Phase 1+
```

Then edit `your-project/styles/_project-settings.scss` — change seed values (brand color, accent, radius, spacing defaults). The generator cascades every change through the entire design system automatically.

## Architecture

- **SCSS Modules only** (D1) — no Tailwind, no CSS-in-JS
- **Copy-to-project** (D2) — no runtime dependency
- **Seed-based tokens** (D3) — 5-10 seeds generate the full system
- **Fully styled** (D4) — not headless, but fully themed via semantic tokens
- **Zero runtime UI dependencies** (D5 updated, D25) — including complex interactive (Dialog, Popover, Tooltip, etc.), built from scratch against WAI-ARIA APG
- **Shadcn-aligned naming** (D24) — flat pattern (CardHeader not Card.Header, Input not InputField)
- **Spacing scale** (D9) — Tailwind-style 4px unit (index × 4 = px), indexes 0-20

Full rationale: `../docs/decisions.md`.

## License

MIT — see `LICENSE` (added with first public release).
