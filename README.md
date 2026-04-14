# bleizlabs-ui

> Universal fully-styled React component library for BleizLabs.
> Zero runtime UI dependencies. Seed-based design tokens. Copy-to-project model.

## Status

**Phase 0 ✓ + Phase 1 Layout ✓ + Phase 2 Typography ✓ + Phase 3 Display ✓ + Phase 4 Simple Interactive ✓ + Phase 4 Production Hardening ✓ + Phase 5 Feedback ✓ + Phase 6 Specialized ✓ + Phase 7 Molecules ✓ + Phase 8 Card Presets ✓ + Phase 9 Demo & Docs ✓** (delivered 2026-04-14 in Epics E03+E04+E05+E06+E07+E08+E09+E10+E11+E12+E13+E14). **47/47 simple atoms (100%) + 6/6 molecules (100%) + 5/5 Card presets (100%) = 58/80 total components**.

- Phase 0: 7 SCSS fundament files for design tokens (`styles/`) — including `joined-group` mixin (E07) and `--input-*` + `--input-addon-*` semantic aliases (E07 + E08)
- Phase 1: 4 layout atoms — Stack, Inline, Container, Section (`components/layout/`)
- Phase 2: 2 typography atoms — Heading, Text (`components/typography/`)
- Phase 3: 12 display atoms — Card + 4 slots (CardHeader, CardBody, CardFooter, CardSection), Badge, Separator, IconBox, Avatar, Skeleton, Spinner, AspectRatio (`components/display/`)
- Phase 4 (E07): 12 simple interactive atoms — Button, ButtonGroup, Input, Label, Textarea, Checkbox, RadioGroup + RadioGroupItem, Toggle, ToggleGroup, Switch, Accordion (`components/interactive/`)
- Phase 4 (E08 Production Hardening): 6 form-input atoms — InputGroup, InputGroupText, NumberInput, MaskedInput, PhoneInput, PasswordInput (+ Input hardened with prefix/suffix/showCounter/clearable/loading). D26 3-layer architecture.
- Phase 5 (E09): 3 feedback atoms — Empty, Alert, Progress (`components/feedback/`)
- Phase 6 Tier A (E10): 5 specialized atoms — Dot, MetricBar, AnimatedCounter, Breadcrumb, Pagination (`components/specialized/`)
- Phase 6 Tier B (E11): 3 specialized atoms — **UsageDonut** (multi-segment SVG donut z `stroke-dasharray` math + track circle + `centerLabel` slot + default color cycle), **AvailabilityBar** (day-by-day status strip z computed `aria-label` summary + native `title` tooltips + CSS Grid `--availability-cells`), **Kbd** (native semantic `<kbd>` + outlined pill via `--font-mono`) (`components/specialized/`)
- Phase 7 (E12): 6 molecules — **DataRow** (label/value responsive via Inline collapseBelow), **BackLink** (ghost Button wrapper + inline SVG arrow), **SectionDivider** (gradient Separator + Text + 3 align positions), **AccordionGroup** (single/multiple mode + React.cloneElement injection + rAF-deferred state), **ToggleGroupFilter** (thin controlled ToggleGroup wrapper with options array mapping), **DeadlineBadge** (hydration-safe Intl.RelativeTimeFormat + Date.now inside useEffect+rAF, Badge asChild `<time>` projection) (`components/molecules/`)
- Phase 8 (E13): 5 Card presets — **ContentCard** (flagship `padding={5}` + `radius="lg"` + title/description/footer slots with scalar auto-wrap), **SidebarCard** (glass variant default + optional uppercase label slot + `padding={4}` + `radius="md"`), **FormCard** (renders semantic `<form>` by default via `asForm=true` + 7 native form props top-level + CardFooter action mode for submit), **StatsCard** (discriminated union `layout: 'stacked' | 'inline' | 'icon-lead'` with TS-enforced icon requirement for icon-lead + IconBox composition), **ActionCard** (required `severity: 'info' | 'warning' | 'critical'` + required `cta` + internal SEVERITY_MAP driving accentColor + IconBox variant) (`components/presets/`)
- Plus: Slot primitive + cn + mergeRefs + `masks.ts` utils (`components/utils/`), `SpaceIndex` type (`components/types/`), Next.js 16.2.3 dev playground with 23 per-component routes + `/demo` showcase route (`app/`)
- Phase 9 (E14): **`/demo` showcase page** — single `'use client'` page rendering all 58 components across 8 phase sections with runtime theme toggle (`[data-theme]` swap via `useEffect`), anchor nav, inline SVG sun/moon icons (zero deps per D25). Opens at `/demo` in dev server.

**Next:** Phase 10 Complex Interactive (Dialog, Popover, Tooltip, Combobox, Tabs, Slider, etc.) deferred until first consumer project needs them. Current 58 components cover the atom + molecule + preset layers for standard web app UI.

## Demo showcase

Run `npm run dev` and open [`http://localhost:3000/demo`](http://localhost:3000/demo) to see all 58 components in one page. The demo has a theme toggle button that swaps `[data-theme]` on `<html>` — inspect both light and dark tokens in place.

Per-component deep dives live under `/components/{category}` (e.g., `/components/card`, `/components/input-production`). Dev index at `/` links to all playgrounds + the demo.

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
