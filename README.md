# @bleizlabs/ui

> A zero-dependency, fully-styled React component library with seed-based design tokens.
> 100 components across 10 categories, WAI-ARIA compliant, runtime-test-verified, SCSS Modules, React 19 + Next.js 16.

[![Version](https://img.shields.io/badge/npm-v0.8.3-0ea5e9)](https://github.com/BleizLabs/bleizlabs-ui/pkgs/npm/ui)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6)](https://www.typescriptlang.org)

**Current version: [`@bleizlabs/ui@0.8.3`](https://github.com/BleizLabs/bleizlabs-ui/pkgs/npm/ui)** — Badge `pulse?: boolean` variant amendment (Sprint 6-pivot) — covers notification badge + live-status indicator patterns via existing Badge atom. Pulse targets ONLY `.icon` / `.dot` indicator children (frame + label stay static dla readability); mirrors `Dot.pulse` API for atom-layer consistency. Inventory-first dup-check pivot — proposed `NotifBadge` molecule SKIPPED (Badge already covered ~95% API: color/label/icon/pill/dot/uppercase). Library count stays **100** (variant amendment, NOT new component). Predecessor `v0.8.2` shipped Timeline compound molecule (Timeline + TimelineItem + TimelineMarker — flat exports per D24, semantic `<ol>/<li>` z connector spine, 99 → 100). Predecessor `v0.8.1` shipped EdgeBar atom (decorative absolute-positioned stripe, 4 positions × 6 colors × 3 thicknesses + pulse, 98 → 99). Predecessor `v0.8.0` shipped CollapsibleZoneCard CP10 preset (APG `disclosure` pattern, 97 → 98). Sprint v0.8.x trajectory: 3 ships + 1 amendment + **4 SKIPs via inventory-first dup-check** (StatusDot/KickerChip/DataTable/NotifBadge — saved 4-6 redundant components). See [CHANGELOG.md](CHANGELOG.md) for the full release history.

## Table of contents

- [Why another component library?](#why-another-component-library)
- [Highlights](#highlights)
- [Component catalogue](#component-catalogue)
- [Quick start](#quick-start)
- [Customisation](#customisation)
- [Running the playground](#running-the-playground)
- [Architecture principles](#architecture-principles)
- [Testing & quality](#testing--quality)
- [Tech stack](#tech-stack)
- [Browser support](#browser-support)
- [Distribution](#distribution)
- [Versioning & release](#versioning--release)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

---

## Why another component library?

We ship across a growing portfolio of products — internal tools, client deliverables, the BleizLabs website, admin panels — and kept hitting the same three walls:

1. **Headless libraries** (Radix, Headless UI) leave styling to every consumer, so every project re-invents the design system and drifts from the rest.
2. **Styled libraries** (MUI, Chakra) lock us into their design language, their tokens, and a runtime dependency that's painful to customise deeply.
3. **Copy-paste systems** (shadcn/ui) are excellent starting points, but every project forks forever — a bug fix in one consumer doesn't propagate anywhere else.

`@bleizlabs/ui` is our answer: **fully styled**, **zero runtime UI dependencies**, **semantic-token driven**, and **designed to be reskinned by changing five to ten seed values**. One source of truth, 100 components across ten categories — layout, typography, display, interactive, feedback, specialized, molecules, card presets, composition presets, complex interactive.

---

## Highlights

- **100 components** across 10 categories — from `<Stack>` and `<GridLayout>` to `<Combobox>`, `<DatePicker>`, `<Command>` (⌘K palette), `<Toast>`, `<Sidebar>`, `<SiteHeader>`, `<EntityCard>`, `<ZoneCard>`, `<CollapsibleZoneCard>` (v0.8.0 — APG `disclosure` collapsible info-card preset), `<EdgeBar>` (v0.8.1 — universal decorative stripe atom), `<Timeline>` + `<TimelineItem>` + `<TimelineMarker>` (v0.8.2 — universal chronological event-list molecule).
- **Zero runtime UI dependencies** — no Radix, no Floating UI, no date-fns. Every floating primitive, focus trap, drag gesture, and keyboard model is built in-house against the WAI-ARIA Authoring Practices Guide.
- **Seed-based design tokens** — override 5–10 seed values (brand color, radius, spacing, timing) and the entire library reskins consistently across light + dark themes.
- **SCSS Modules** — no Tailwind, no CSS-in-JS, no runtime style computation. Components read CSS custom properties that consumers override at the `:root` level.
- **Accessibility-first** — every interactive component maps to a documented APG pattern, with keyboard models, focus management, and screen-reader semantics verified against Radix closed-issue catalogues.
- **Runtime-test-verified** — 88 Playwright `.spec.ts` suites × 4 dimensions (keyboard / focus / aria / regression), full `@axe-core/playwright` WCAG 2.1 AA sweep on all 52 playground routes, CI-gated on every release tag.
- **NVDA-ready** — 23+ pre-written manual sweep protocols (`.nvda.sweep.md` per component) for screen-reader validation.
- **Private npm package** — installable via `npm install @bleizlabs/ui` from GitHub Packages. Copy-to-project remains available for client offboarding.
- **React 19 + Next.js 16** — built with Server Components, Turbopack, and App Router in mind.

---

## Component catalogue

### Layout (5)

`Container` · `Section` · `Stack` · `Inline` · `GridLayout`

`GridLayout` (v0.5.5) is the multi-column CSS Grid primitive — number `columns` (e.g. `columns={3}`) shorthand expands to `repeat(N, minmax(0, 1fr))`; string `columns` accepts arbitrary track templates (`'240px 1fr'`, `'repeat(auto-fit, minmax(220px, 1fr))'`). Mobile-first `responsive={{ md: 2, lg: 3 }}` cascade via SCSS `var()` fallback chain in breakpoint media queries.

### Typography (4)

`Heading` · `Text` · `Anchor` · `Eyebrow`

`Heading` ships 13 sizes total: 8-size standard scale (`sm` · `md` · `lg` · `xl` · `2xl` · `3xl` · `4xl` · `5xl`) for general use, two display tiers for atelier hero treatment (`size="display"` Hero H1 up to 72px, `size="display-md"` section H2 up to 48px), and three v0.5.7 editorial sizes (`hero-editorial` fluid clamp 36→52px for login asides, `form-card-title` 22px and `form-card-subtitle` 15px for form-card pairs). `Text` ships 6 variants — `lead` / `body` / `body-strong` / `small` / `caption` / `eyebrow` (v0.5.7 inline-light atelier eyebrow path; the variant shares the `mx.eyebrow-typography` mixin with the standalone `Eyebrow` atom — pick the variant for inline composition, the atom when the numeric prefix + hairline ornament is wanted). `Anchor` is the prose-inline link primitive — distinct from `TextLink` which is the navigational action. `Eyebrow` (v0.5.4) is the small uppercase atelier label with optional numeric prefix + 14px hairline connector — promoted from a 5-site duplication in scout-hub.

### Display (13)

`AspectRatio` · `Avatar` · `Badge` · `Card` · `EdgeBar` · `IconBox` · `KpiValue` · `PercentValue` · `Reveal` · `Separator` · `Skeleton` · `Spinner` · `Table`

`Card` ships as a flat compound family — `CardHeader`, `CardBody`, `CardFooter`, `CardSection` are all exported alongside `Card` per shadcn-style flat naming (D24). `Table` similarly exports `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableCell`. `Badge` (v0.8.3 amendment) gains `pulse?: boolean` — pulses only the leading `.icon` / `.dot` (badge frame + label stay static for readability), inherits global reduced-motion guard, mirrors `Dot.pulse` API for atom-layer consistency. `EdgeBar` (v0.8.1) is the universal decorative stripe atom — absolute-positioned along one edge of a positioned parent (4 positions × 6 colors × 3 thicknesses + pulse), pure decorator (`aria-hidden`, `pointer-events: none`), reuses Badge palette. `KpiValue` (v0.6.0) is the unified numeric+unit metric atom (replaces older `AnimatedPrice` and absorbed `PercentValue` change-delta surface). `PercentValue` (v0.6.0) is a thin specialization for percentage-shaped metrics composing `KpiValue` semantics. `Reveal` (v0.5.9) is the IntersectionObserver-driven `data-revealed` attribute emitter — pure behavior atom for scroll-triggered reveals (the layout pairs with `RevealStack` molecule).

### Interactive (17)

`Accordion` · `Button` · `ButtonGroup` · `Checkbox` · `Input` · `InputGroup` · `Label` · `MaskedInput` · `NumberInput` · `PasswordInput` · `PhoneInput` · `RadioGroup` · `Switch` · `Textarea` · `TextLink` · `Toggle` · `ToggleGroup`

`RadioGroup` exports `RadioGroupItem` as a flat compound sibling per D24; `InputGroup` exports `InputGroupText` likewise. `Button` supports `shape?: 'rounded' | 'pill'` for atelier-style CTAs. `TextLink` is the navigational text link with `asChild` polymorphism for Next.js `<Link>`.

### Feedback (3)

`Alert` · `Empty` · `Progress`

### Specialized (9)

`AnimatedCounter` · `AvailabilityBar` · `BarChart` · `Breadcrumb` · `Dot` · `Kbd` · `MetricBar` · `Pagination` · `UsageDonut`

`BarChart` (v0.7.x) is the universal single-series bar chart — pure-CSS bar rendering, auto-detected ceiling, optional `highlightIndex` accent treatment, server-safe.

### Molecules (15)

`AccordionGroup` · `BackLink` · `BreakdownList` · `Chip` · `DataRow` · `DeadlineBadge` · `FileChip` · `IconButton` · `MetricTile` · `PageHeader` · `RevealStack` · `SectionDivider` · `SectionHeader` · `Timeline` · `ToggleGroupFilter`

`Timeline` (v0.8.2) is the universal chronological event-list molecule — flat compound family `Timeline` + `TimelineItem` + `TimelineMarker` per D24. Semantic `<ol>/<li>` with optional tinted markers (Dot/Badge 6-color palette), connector spine via `::before` pseudo-element with `:last-child` suppression, server-safe (no client hooks needed for static rendering). `TimelineItem` deliberately does NOT support `asChild` — two semantic siblings inside `<li>` are incompatible with Slot single-element constraint; use `<Link>` inside the content slot for clickable rows. Forced-colors mode preserves connector via `CanvasText`. `Chip` (v0.5.4) is the pill-shaped toggleable filter chip with controlled `pressed` state — pattern-promoted from scout-hub B7 12-status filter row. `IconButton` (v0.5.4) is the accessibility-enforcing `iconOnly` wrapper over `Button` with TS-required `aria-label`. `BreakdownList` (v0.7.0+) renders progress-style breakdown rows with tone enum (`default | success | warning | error`). `MetricTile` (v0.7.0) and `PageHeader` (v0.7.0) extend the panel-pattern library lifted from `bleizlabs-website`. `RevealStack` (v0.5.9) is the canonical `<Reveal><Stack gap={3}>...</Stack></Reveal>` composition. `SectionHeader` (v0.7.2) is the universal section heading row (`[gradient accent] LABEL · count [meta][action]`) — promoted from 27 panel_v2 production consumers.

### Card presets (11)

`ActionCard` · `CollapsibleZoneCard` · `ContentCard` · `EntityCard` · `EntityHero` · `FormCard` · `IconHeaderCard` · `PairedCard` · `SidebarCard` · `StatsCard` · `ZoneCard`

`CollapsibleZoneCard` (v0.8.0 — CP10) is the universal collapsible info-card preset (sister to `ZoneCard` CP9). APG `disclosure` pattern: full-width semantic `<button>` trigger with `aria-expanded` + `aria-controls`, body always-mounted (animation host) with modern `inert` + `aria-hidden` removal pattern when collapsed, chevron rotation animation respects `prefers-reduced-motion`, optional `summaryChip` slot for collapsed-state preview. Controlled (`open`+`onOpenChange`) or uncontrolled (`defaultOpen`) state. Driving consumers: panel_v2 `FinancialBreakdown` (Income/Expenses) + `ProjectsFinancialOverview` (Forecast/Actuals). `EntityCard` + `EntityHero` (v0.7.0, formerly `DetailPageHero`) form the entity-detail family. `IconHeaderCard` (v0.6.0) standardises icon+heading card framing. `PairedCard` is the good/bad split composition. `ZoneCard` (v0.7.3) is the universal info-card preset (semantic `<section>` landmark, density × tone variations, 5-axis variation envelope) for zoned section-based layouts.

### Composition presets (1)

`SiteHeader`

`SiteHeader` is a page-level nav preset with mobile toggle and 44×44 touch target.

### Complex interactive (22)

`Dialog` · `AlertDialog` · `Drawer` · `Sheet` · `Tooltip` · `Popover` · `DropdownMenu` · `ContextMenu` · `HoverCard` · `NavigationMenu` · `Tabs` · `Select` · `Combobox` · `Calendar` · `DatePicker` · `Toast` · `Slider` · `Carousel` · `ScrollArea` · `InputOTP` · `Command` · `Sidebar`

Browse every component with live examples at `http://localhost:3000` (see [Running the playground](#running-the-playground)).

For a per-component props reference, see [`COMPONENT_REGISTRY.md`](../COMPONENT_REGISTRY.md).

---

## Quick start

### Prerequisites

- Node.js 20 or newer
- npm, yarn, or pnpm
- A React 19 + Next.js 16 host project (or any React 19 bundler with SCSS Modules)

### Installation — private npm package (recommended)

`@bleizlabs/ui` publishes to GitHub Packages as a private scoped package. One install, `npm update` to propagate bug fixes across every consumer.

**Step 1 — authenticate to GitHub Packages.** Create a `.npmrc` in your consumer project root (or `~/.npmrc` globally):

```ini
@bleizlabs:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` is a personal access token (classic) with the `read:packages` scope. Export it in your shell or add it to your project's secrets manager.

**Step 2 — install.**

```bash
npm install @bleizlabs/ui
```

**Step 3 — configure Next.js.** The library ships TypeScript + SCSS source (no pre-build step), so two small additions to `next.config.mjs` are required:

```js
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@bleizlabs/ui'],
  sassOptions: {
    loadPaths: [
      path.resolve(__dirname, 'node_modules/@bleizlabs/ui/styles'),
    ],
  },
};

export default nextConfig;
```

- `transpilePackages` tells Next.js to compile the library's `.ts/.tsx` files.
- `sassOptions.loadPaths` resolves the library's internal SCSS partials — needed because `resolve-url-loader` in Next.js strips `./` prefixes from `@use`/`@forward` inside `node_modules`.

**Step 4 — import styles + components.**

```scss
// app/globals.scss — loads tokens, generator output, mixins, keyframes
@use '@bleizlabs/ui/styles';
```

```tsx
// app/layout.tsx
import './globals.scss';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// app/page.tsx
import { Button, Card, CardHeader, CardBody, Heading } from '@bleizlabs/ui';

export default function Page() {
  return (
    <Card>
      <CardHeader><Heading level={1} size="2xl">Hello</Heading></CardHeader>
      <CardBody><Button variant="primary">Click me</Button></CardBody>
    </Card>
  );
}
```

Reskin the library for your project via the [Customisation](#customisation) section.

### Installation — copy-to-project (alternative, e.g. for client offboarding)

For projects that need the library fully embedded in their own repository (client deliverables handed off without a registry dependency), copying source into the consumer still works:

```bash
cp -r path/to/bleizlabs-ui/dev/styles      ./styles
cp -r path/to/bleizlabs-ui/dev/components  ./components
```

Wire up `@/components/*` and `@/styles/*` path aliases in `tsconfig.json` and import:

```scss
@use './styles' as *;
```

Once copied the source is owned by the consumer — updates from upstream no longer propagate automatically.

---

## Customisation

Every component reads from CSS custom properties, and every CSS custom property is derived from a small set of seed values. This means you have two tiers of customisation — a quick CSS-variable override for per-project tweaks, and a deeper seed-level reskin for full design-system reshaping. Both work regardless of whether you installed the library by copying the source or via npm.

### Option A — quick reskin (works for copy and npm installs)

For most projects, overriding a handful of CSS custom properties is enough. Add a global stylesheet to your app and set the values you want to change:

```scss
// app/globals.scss (Next.js) or src/styles/overrides.scss
:root {
  /* brand identity */
  --color-brand:        #00E0B8;
  --color-accent:       #7C3AED;

  /* shape */
  --radius-md:          12px;
  --radius-lg:          20px;

  /* typography */
  --font-primary:       'YourFont', system-ui, sans-serif;
  --font-secondary:     'JetBrainsMono', monospace;

  /* motion (v0.4.3) */
  --duration-hover:       280ms;  /* button-sized hover */
  --duration-card-hover:  320ms;  /* card-sized hover */
}

/* dark theme overrides — applied when <html data-theme='dark'> is set */
[data-theme='dark'] {
  --color-surface:        #0a0a0a;
  --color-surface-raised: #141414;
  --color-text-primary:   #fafafa;
}
```

All 97 components pick up the change automatically — no component needs to be patched, nothing needs to be rebuilt.

**Common tokens you can override:**

| Token | Meaning |
|---|---|
| `--color-brand` | Primary brand color |
| `--color-accent` | Secondary accent |
| `--color-surface` / `--color-surface-raised` | Background layers |
| `--color-text-primary` / `--color-text-secondary` / `--color-text-muted` | Text hierarchy |
| `--color-success` / `--color-warning` / `--color-error` / `--color-info` | Semantic statuses |
| `--radius-sm` / `--radius-md` / `--radius-lg` / `--radius-xl` / `--radius-full` | Corner radii |
| `--space-1` … `--space-20` | 4-pixel spacing scale |
| `--font-primary` / `--font-secondary` / `--font-mono` | Font families |
| `--shadow-sm` / `--shadow-md` / `--shadow-lg` | Elevation |
| `--duration-fast` / `--duration-normal` / `--duration-hover` / `--duration-card-hover` | Motion timing |
| `--easing-default` / `--easing-apple` | Motion curves |
| `--size-touch-min` | Touch-target minimum (WCAG 2.1 SC 2.5.5) — default 44px; override to 48px or 56px for accessibility-stricter products |

The full token reference lives in [`styles/_semantics.scss`](styles/_semantics.scss).

### Option B — deep reskin via seeds (works for both install modes)

Override seed values before the generator runs. Every color scale, shadow, hover state, and semantic alias cascades from them.

**For npm installs** — configure the library's SCSS entry with the `@use ... with (...)` syntax:

```scss
// app/globals.scss
@use '@bleizlabs/ui/styles' with (
  $seed-brand:              #00E0B8,
  $seed-accent:             #7C3AED,
  $seed-font-primary:       ('YourFont', system-ui, sans-serif),
  $seed-font-secondary:     ('YourBodyFont', system-ui, sans-serif),
  $seed-duration-hover:     150ms,
  $seed-duration-card-hover: 200ms
);
```

Every seed value in [`styles/_project-settings.scss`](styles/_project-settings.scss) carries `!default`, so any subset can be overridden — pass only the seeds you care about.

**For copy-to-project installs** — edit `styles/_project-settings.scss` directly and rebuild:

```scss
$seed-brand:          #0ea5e9;
$seed-accent:         #f97316;
$seed-font-primary:   'Inter';
```

Option B is the most powerful choice — you are redefining the whole design-system scale, not just individual tokens. Use it when you need a full rebrand rather than a tweak.

### Option C — custom variants per project

If your project needs a visual pattern the library does not ship (say, a gradient button for a marketing surface), do not fork the library — compose locally:

```tsx
// components/ui/GradientButton.module.scss
.gradient {
  background: linear-gradient(135deg, #00E0B8, #7C3AED);
  color: #fff;
}
```

```tsx
import { Button } from '@bleizlabs/ui';
import styles from './GradientButton.module.scss';

<Button className={styles.gradient}>Launch</Button>
```

If the same variant reappears in two or more consumer projects, it becomes a candidate for upstream promotion as a new `variant` on the base component (Rule of Three).

### Quick checklist — after install

1. Add a global stylesheet and override the CSS variables you care about (Option A — covers 90% of cases).
2. Set `<html data-theme='dark'>` at runtime if you want dark mode; the library ships both themes out of the box.
3. For deeper rebrands on a copy-to-project install, edit `styles/_project-settings.scss` (Option B).
4. For one-off visual patterns, compose locally via `className` or wrap the component (Option C).
5. Inspect live in the playground first — run `npm run dev` inside the library repo and tweak `:root` in the browser DevTools to preview before committing.

---

## Running the playground

The repository includes a Next.js playground with one route per component plus a combined showcase.

```bash
cd dev
npm install
npm run dev
```

Open `http://localhost:3000` for the component index, `http://localhost:3000/demo` for the combined showcase, or `http://localhost:3000/components/<name>` for per-component deep dives (e.g. `/components/button`, `/components/combobox`, `/components/table`).

The showcase includes a light/dark theme toggle — every component is dual-theme from day one.

---

## Architecture principles

- **SCSS Modules only** — scoped class names, zero runtime style computation, standard tooling.
- **Zero runtime UI dependencies** — every interactive primitive (positioning, focus trap, dismiss, drag, match-media, date math) is written in-house.
- **Semantic tokens over primitives** — components reference `var(--color-brand)`, never `$brand-500`, so consumers can reskin without forking.
- **Compound flat API** — `<Card>` + `<CardHeader>` + `<CardBody>` as siblings, not `<Card.Header>` (shadcn-aligned, IDE-friendly, tree-shakeable).
- **Polymorphism via `asChild`** — pass-through rendering for Next.js `<Link>`, HTML `<button>`, or any custom element using an in-house `Slot` primitive.
- **APG-first accessibility** — every interactive component has a documented keyboard model, ARIA contract, and regression catalogue against closed Radix issues.
- **Seed-based theming** — 5–10 seed values generate the full token system; consumers change seeds, not individual tokens.
- **Rule of Three token promotion** — a new token lands only after 2+ independent consumers demonstrate the need. No speculative primitives.

---

## Testing & quality

Every release passes a three-stage quality gate via CI before `npm publish` fires.

### Stage 1 — smoke sweep (`tests/smoke.spec.ts`, 52 routes)

Full library-wide `@axe-core/playwright` WCAG 2.1 AA scan (tags `wcag2a wcag2aa wcag21a wcag21aa`) against every public playground route. Runs against a **production build** (`next build && next start`) to catch consumer-realistic issues dev mode masks. Blocks CI publish if any route reports violations.

### Stage 2 — per-component runtime suites (88 `.spec.ts`)

Every interactive component has up to 4 test files covering:

- **Keyboard** — every APG-mandated key (Enter/Space/Arrows/Home/End/Escape/Tab/typeahead/modifier guards)
- **Focus** — initial landing, focus trap (where applicable), restore target, roving tabindex
- **ARIA** — role/name/state attributes, `aria-activedescendant`, live-region timing, plus per-component `@axe-core/playwright` scan in OPEN state
- **Regression** — Radix closed-issue catalogue mapped to bleizlabs-ui assertions (e.g., `NM-R09` typeahead wrapping, `CM-R04` second-menu-closes-first)

### Stage 3 — NVDA sweep protocols (23+ checklists)

Each interactive component ships a `<Name>.nvda.sweep.md` checklist for manual validation against NVDA 2024+ on Firefox. Covers role/name/state announcements, keyboard activation, focus management, live-region timing, and known NVDA-specific quirks.

### What this means for consumers

- Every tagged release is **axe-clean** across all 52 playground routes AND **regression-tested** across 88 per-component suites.
- Any new bug found in production gets codified as a regression test before the fix commits.
- Screen-reader behavior is explicitly documented per component, not assumed from APG compliance.

### Running tests locally

```bash
cd dev
npm run test              # full Playwright suite
npm run test:smoke        # axe-core sweep only
npm run test:e2e          # per-component suites only
npm run test:headed       # debug mode with browser window
npm run typecheck         # tsc --noEmit
npm run lint              # ESLint (flat config)
npm run check:barrel      # verify components/index.ts barrel completeness
```

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Next.js 16.2 (App Router, Turbopack default) |
| Language | TypeScript 5.6 (strict, `noUncheckedIndexedAccess`) |
| Styling | SCSS Modules + CSS custom properties |
| Tokens | Seed-based generator (Sass `@use`/`@forward`) |
| Polymorphism | In-house `Slot` primitive (Radix-style `asChild`) |
| Positioning | In-house `useFloating` + `computePosition` (no Floating UI) |
| Date math | In-house `utils/date.ts` using native `Date` + `Intl.DateTimeFormat` (no date-fns) |
| Focus management | In-house `useFocusTrap` + `FloatingPortal` + `findFirstTabbable` |
| Drag gestures | In-house `usePointerDrag` with pointer-capture (Slider, Carousel, ScrollArea) |
| Match media | In-house `useMatchMedia` via `useSyncExternalStore` (reduced-motion, coarse-pointer, breakpoints) |
| Testing | Playwright 1.59 + `@axe-core/playwright` 4.11 |

No external UI library is imported at runtime.

---

## Browser support

| Browser | Minimum version | Notes |
|---|---|---|
| Chrome / Edge (Chromium) | 111+ | Full feature set. `interpolate-size: allow-keywords` (Accordion, v0.3.2) requires Chrome 129+; older Chromium falls back to `max-height` clamp. |
| Firefox | 110+ | Full feature set. |
| Safari (desktop + iOS) | 16.4+ | Full feature set. iOS uses `env(safe-area-inset-*)` for Drawer + Sheet. |

Every component ships with `@media (prefers-reduced-motion: reduce)` fallbacks and `@media (forced-colors: active)` (Windows High Contrast Mode) mappings where relevant.

---

## Distribution

The library follows a **private-npm-first** model with a **copy-snapshot** escape hatch for client deliverables.

### Primary: `@bleizlabs/ui` on GitHub Packages (private)

Internal BleizLabs projects install via `npm install @bleizlabs/ui` from the GitHub Packages private registry. One bug fix → one `npm publish` → `npm update` propagates across every consumer. Source ships as TypeScript + SCSS, consumers transpile via Next.js.

Publishing is driven by the [`.github/workflows/publish.yml`](.github/workflows/publish.yml) workflow — push a `v*.*.*` tag, CI type-checks, verifies the tag matches `package.json` version, builds the playground as a smoke test, and publishes.

### Escape hatch: copy-to-project

Client deliverables that need full code ownership copy `styles/` and `components/` directly into their repository at handoff. The client owns the source outright, with no ongoing registry dependency — at the cost of losing automatic bug-fix propagation.

---

## Versioning & release

This project follows [Semantic Versioning 2.0](https://semver.org).

- **Patch (0.x.Y)** — bug fixes, internal refactors, additive tokens with Rule-of-Three gating. Backward-compatible.
- **Minor (0.X.0)** — new components, new variants, new props with safe defaults. Backward-compatible.
- **Major (X.0.0)** — breaking API changes. Reserved for the v1.0.0 stabilization after 2–3 consumer projects validate real-world usage.

Every release lands in [`CHANGELOG.md`](CHANGELOG.md) following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. Entries include:

- **Added** / **Changed** / **Fixed** / **Deprecated** / **Removed** sections.
- Explicit **Rule-of-Three gating** decisions for new tokens.
- **Verification evidence** — typecheck, lint, build, test results.
- **Consumer migration notes** where relevant.

To consume a specific version, pin via semver caret: `"@bleizlabs/ui": "^0.4.0"` resolves to the latest `0.4.x` and auto-upgrades on `npm update`.

---

## Contributing

This is a private BleizLabs library; external contributions are not accepted at this stage. For internal contributors:

1. Read the [`CLAUDE.md`](../CLAUDE.md) project bootstrap for the full architectural decision log and component standards.
2. Review [`docs/component-standards.md`](../docs/component-standards.md) for the component completeness checklist.
3. For Phase 10 complex interactive components, follow [`docs/a11y-pipeline.md`](../docs/a11y-pipeline.md).
4. Use the `component-build` skill (GAN-style Generator ↔ Evaluator loop) for every new component — enforced by internal convention.
5. Every PR must pass: `npm run typecheck`, `npm run lint`, `npm run check:barrel`, `npm run test`.

---

## Roadmap

- **Shipped — v0.8.3 (current):** `Badge` `pulse?: boolean` variant amendment — covers notification badge + live-status indicator patterns via existing Badge atom (panel_v2 `ServiceCard.notifBadge` + bleizos `ClientsList.healthBadge`). Pulse targets ONLY `.icon` / `.dot` indicator children (frame + label stay static for readability), inherits global `prefers-reduced-motion: reduce` guard, mirrors `Dot.pulse` API for atom-layer consistency. **Inventory-first dup-check pivot** — Sprint 6 NotifBadge molecule SKIPPED (Badge already covered ~95% of proposed API: color/label/icon/pill/dot/uppercase). Library count stays **100** (variant amendment, NOT new component). Additive patch.
- **Shipped — v0.8.2:** `Timeline` compound molecule (Sprint 4 — Phase 7) — flat exports `Timeline` + `TimelineItem` + `TimelineMarker` per D24. Universal chronological event-list molecule with semantic `<ol>/<li>` + tinted markers (Dot/Badge 6-color palette) + connector spine via CSS `::before` pseudo-element. NO `asChild` on `TimelineItem` (intentionally — Slot single-element constraint vs 2-sibling `<li>`; use Link inside content slot for clickable rows). Promoted from primitive-purity-sweep — driving consumers BleizOS ActivityFeed + panel_v2 ActivityContent + RecentActivityFeed + scout-hub tab-history. Library count 99 → 100.
- **Shipped — v0.8.1:** `EdgeBar` Display atom (Sprint 2-pivot) — pure-decorative absolute-positioned colored stripe along one edge of a positioned parent (4 positions × 6 colors × 3 thicknesses + pulse). Reuses Badge palette (zero new tokens). Local `@keyframes edgeBarPulse` (Dot precedent). Sprint 2 (StatusDot) SKIPPED — `Dot` per D15 already shipped. Driving consumers: panel_v2 ProjectCard top-edge + ServiceCardRow left-edge. Library count 98 → 99.
- **Shipped — v0.8.0:** `CollapsibleZoneCard` CP10 preset (Sprint 1 — Phase 8) — universal collapsible info-card sister to `ZoneCard` CP9. APG `disclosure` pattern: full-width semantic `<button>` trigger with `aria-expanded` + `aria-controls`; body always-mounted (animation host) with modern `inert` + `aria-hidden` removal pattern; chevron rotation respects `prefers-reduced-motion`. Driving consumers: panel_v2 FinancialBreakdown + ProjectsFinancialOverview. Library count 97 → 98.
- **Shipped — v0.7.5:** hygiene sweep — D11 base-class compliance for 3 post-Phase-10 components (`SiteHeader` / `SectionHeader` / `ZoneCard`), `mx.touch-target` mixin now references the v0.7.4 `--size-touch-min` token (consumer override propagates to all touch-min surfaces, not just the 6 v0.7.4-migrated sites), Chip interactive variant gains touch-target enforcement, 6 dedicated component playground routes added (`/components/{icon-button,eyebrow,chip,file-chip,page-header,reveal-stack}` — total routes 62 → 68), `COMPONENT_REGISTRY.md` ZoneCard backfill, `docs/component-inventory.md` PageHeader entry corrected. Patch-level — additive only, byte-equivalent visual output.
- **Shipped — v0.7.4:** seed-driven `--size-touch-min` semantic token (WCAG 2.1 SC 2.5.5) replacing 15 hardcoded `2.75rem` touch-min sites across `Calendar` / `Carousel` / `DatePicker` / `InputOTP` / `Slider` / `Toast`; 6 compact-control sites mapped to `var(--space-8)`; Carousel `2.25rem` atelier nav signature deliberately preserved with documented rationale. Drift fixes (barrel comments + `package.json` description) + full README + CHANGELOG resync. Patch-level — additive only, zero visual delta.
- **Shipped — v0.7.3:** `ZoneCard` preset (Phase 8 CP9) — universal info-card preset (semantic `<section>` landmark, density × tone variations, 5-axis variation envelope) for zoned section-based layouts. Card presets reach 10/10 (now 11/11 after v0.8.0 CollapsibleZoneCard CP10) — Phase 8 family complete.
- **Shipped — v0.7.0 → v0.7.2:** `KpiValue` + `PercentValue` numeric/percent atoms, `EntityCard` + `EntityHero` (formerly `DetailPageHero`) entity-detail family, `IconHeaderCard`, `BreakdownList` molecule with tone enum, `MetricTile` + `PageHeader` panel-pattern family, `SectionHeader` molecule (universal section heading row, promoted from 27 panel_v2 production consumers), token cleanup batch (typography line-heights, atelier display tier).
- **Shipped — v0.5.7 → v0.6.1:** `Text variant="eyebrow"` + three editorial Heading sizes (`hero-editorial` / `form-card-title` / `form-card-subtitle`), `--color-text-on-brand` semantic token (WCAG 2.2 AA fix for brand-fill text in light mode, library-wide migration across 6 surfaces), `Reveal` IntersectionObserver atom + `RevealStack` composition molecule, Progress `color: 'error-strong'` extension.
- **Shipped — v0.4.x series:** `Anchor` atom, `TextLink` atom, `PairedCard` preset, `SiteHeader` preset, `Heading size="display"` + `size="display-md"`, `Button shape="pill"`, atelier rule tokens (`--atelier-rule-*`, `--atelier-tick-*`, `--atelier-corner-tick-*`), `--easing-apple` unified curve, `ruleReveal` keyframe, library-wide hover timing tokens (`--duration-hover` + `--duration-card-hover`).
- **Shipped — v0.3.x series:** Accordion `interpolate-size` animation overhaul, per-variant Text colors, consumer-validated polish from BleizLabs Website v2.
- **Shipped — v0.2.0 baseline:** 81 components, 84 runtime test suites, 23 NVDA sweep protocols, 15 library bug fixes (Combobox/Select `aria-activedescendant`, Select first-key listbox open, Toast list semantics, HoverCard escapeStack + 11 more).
- **Sprint v0.8.x inventory-first dup-check pattern (validated N=4):** Sprint 2 StatusDot SKIPPED (`Dot` per D15 exists), Sprint 3 KickerChip SKIPPED (`Eyebrow` + `Badge` cover patterns), Sprint 5 `DataTable<T>` SKIPPED (D27 + Phase 11 Table primitive intent — consumer composes TanStack Table v8 on top of Table primitives), Sprint 6 NotifBadge SKIPPED → PIVOT to Badge `pulse` amendment (this release). Pattern: amendment queue authors name patterns from THEIR vocabulary, not lib's — always cross-reference COMPONENT_REGISTRY + ROADMAP + decisions.md before Phase 1, and check existing atom coverage of ≥90% API → if so, propose variant amendment instead of new component.
- **Next — Tier B molecule candidates (deferred — universality 2-of-3 borderline):** `IntentCallout` (callout box with intent + icon + kicker + label + cta), `LinkedEntityRow` (cross-entity reference), `StageMetaLine` (stage progress line). All await additional cross-system evidence (currently 1-2 sites only; chunks 5+ consumer migration may surface 3rd-site evidence naturally).
- **Next — NVDA human execution:** 23+ protocols awaiting physical tester (~8h across 3 batches of 8 components). CRITICAL findings feed the next patch; otherwise the current minor gets the "NVDA-qualified" label.
- **Next — NVDA human execution:** 23+ protocols awaiting physical tester (~8h across 3 batches of 8 components). CRITICAL findings feed the next patch; otherwise the current minor gets the "NVDA-qualified" label.
- **Next — shared NVDA protocol extraction:** `_nvda-shared/{modal-focus, menu-navigation, combobox-listbox}.md` consolidation (~400 LOC redundancy reduction across families sharing APG patterns).
- **Later — post-consumer refactor:** further Rule-of-Three extractions (`useTypeahead`, `useListboxKeyboardNav`, `useFloatingItemRegistry`) after 3+ consumer deployments ship stable semantics.
- **Future — v1.0.0 stabilization:** API freeze after 2–3 consumer projects validate real-world usage. Additional primitives (Form orchestrator, Chart primitives, Rich editor) as evaluation targets, not commitments.

---

## License

MIT — see [`LICENSE`](LICENSE).

---

## Internal documentation

The following live in the project root (`internal/bleizlabs-ui/`) and are intended for contributors, not external consumers:

- [`CLAUDE.md`](../CLAUDE.md) — project bootstrap, precedence rules, D1–D26 architectural decisions index
- [`COMPONENT_REGISTRY.md`](../COMPONENT_REGISTRY.md) — props, tokens, and usage per component
- [`ROADMAP.md`](../ROADMAP.md) — phase-by-phase component sequencing and pending Epics
- [`docs/decisions.md`](../docs/decisions.md) — architectural decisions log (D1–D26+)
- [`docs/component-standards.md`](../docs/component-standards.md) — authoring conventions
- [`docs/token-architecture.md`](../docs/token-architecture.md) — seed generator internals
- [`docs/a11y-pipeline.md`](../docs/a11y-pipeline.md) — accessibility testing workflow
- [`docs/scss-conventions.md`](../docs/scss-conventions.md) — SCSS module conventions
- [`docs/naming-conventions.md`](../docs/naming-conventions.md) — component and prop naming rules
- [`docs/publish-playbook.md`](../docs/publish-playbook.md) — npm publish workflow and lessons learned
- [`devlog.md`](../devlog.md) — session-by-session execution journal

---

<sub>Built by [BleizLabs](https://bleizlabs.eu). Feedback and issues welcome via [GitHub Issues](https://github.com/BleizLabs/bleizlabs-ui/issues).</sub>
