# bleizlabs-ui

> A zero-dependency, fully-styled React component library with seed-based design tokens.
> 81 components, WAI-ARIA compliant, SCSS Modules, React 19 + Next.js 16.

---

## Why another component library?

We shipped across a growing portfolio of products — internal tools, client deliverables, the BleizLabs website, admin panels — and kept hitting the same three walls:

1. **Headless libraries** (Radix, Headless UI) leave styling to every consumer, so every project re-invents the design system and drifts from the rest.
2. **Styled libraries** (MUI, Chakra) lock us into their design language, their tokens, and a runtime dependency that's painful to customise deeply.
3. **Copy-paste systems** (shadcn/ui) are excellent starting points, but every project forks forever — a bug fix in one consumer doesn't propagate anywhere else.

`bleizlabs-ui` is our answer: **fully styled**, **zero runtime UI dependencies**, **semantic-token driven**, and **designed to be reskinned by changing five to ten seed values**. One source of truth, 81 components across every tier — layout, typography, display, interactive, feedback, complex, molecules, card presets.

---

## Highlights

- **81 components** across 10 categories — from `<Stack>` to `<Combobox>`, `<DatePicker>`, `<Command>` (⌘K palette), `<Toast>`, `<Sidebar>`
- **Zero runtime UI dependencies** — no Radix, no Floating UI, no date-fns. Every floating primitive, every focus trap, every keyboard model is built in-house against the WAI-ARIA Authoring Practices Guide
- **Seed-based design tokens** — override 5–10 seed values (brand color, radius, spacing scale) and the entire library reskins consistently across light + dark themes
- **SCSS Modules** — no Tailwind, no CSS-in-JS, no runtime style computation. Components read CSS custom properties that consumers override at the `:root` level
- **Accessibility-first** — every interactive component maps to a documented APG pattern, with keyboard models, focus management, and screen-reader semantics verified against Radix closed-issue catalogues
- **Copy-to-project today, installable tomorrow** — see [Distribution](#distribution) below
- **Built for React 19 + Next.js 16** with Turbopack, App Router, and Server Components in mind

---

## Component catalogue

### Layout (4)
`Container` · `Section` · `Stack` · `Inline`

### Typography (2)
`Heading` · `Text`

### Display (13)
`Card` · `CardHeader` · `CardBody` · `CardFooter` · `CardSection` · `Badge` · `Separator` · `IconBox` · `Avatar` · `Skeleton` · `Spinner` · `AspectRatio` · `Table`

Table ships as a family — `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableCell` are all exported alongside `Table` but counted as one Table primitive for the total tally.

### Interactive (18)
`Button` · `ButtonGroup` · `Input` · `Textarea` · `Label` · `Checkbox` · `RadioGroup` · `RadioGroupItem` · `Toggle` · `ToggleGroup` · `Switch` · `Accordion` · `InputGroup` · `InputGroupText` · `NumberInput` · `MaskedInput` · `PhoneInput` · `PasswordInput`

### Feedback (3)
`Empty` · `Alert` · `Progress`

### Specialized (8)
`Dot` · `MetricBar` · `AnimatedCounter` · `Breadcrumb` · `Pagination` · `UsageDonut` · `AvailabilityBar` · `Kbd`

### Molecules (6)
`DataRow` · `BackLink` · `SectionDivider` · `AccordionGroup` · `ToggleGroupFilter` · `DeadlineBadge`

### Card presets (5)
`ContentCard` · `SidebarCard` · `FormCard` · `StatsCard` · `ActionCard`

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

## Running the playground

The repository includes a Next.js playground with one route per component plus a combined showcase page.

```bash
cd dev
npm install
npm run dev
```

Open `http://localhost:3000` for the component index, `http://localhost:3000/demo` for the combined showcase, or `http://localhost:3000/components/<name>` for per-component deep dives (e.g. `/components/button`, `/components/combobox`, `/components/table`).

The showcase includes a light/dark theme toggle — every component is dual-theme from day one.

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
}

/* dark theme overrides — applied when <html data-theme='dark'> is set */
[data-theme='dark'] {
  --color-surface:        #0a0a0a;
  --color-surface-raised: #141414;
  --color-text-primary:   #fafafa;
}
```

All 81 components pick up the change automatically — no component needs to be patched, nothing needs to be rebuilt.

**Common tokens you can override:**

| Token | Meaning |
|---|---|
| `--color-brand` | Primary brand color |
| `--color-accent` | Secondary accent |
| `--color-surface` / `--color-surface-raised` | Background layers |
| `--color-text-primary` / `--color-text-secondary` / `--color-text-muted` | Text hierarchy |
| `--color-success` / `--color-warning` / `--color-error` / `--color-info` | Semantic statuses |
| `--radius-sm` / `--radius-md` / `--radius-lg` / `--radius-xl` | Corner radii |
| `--space-1` … `--space-20` | 4-pixel spacing scale |
| `--font-primary` / `--font-secondary` / `--font-mono` | Font families |
| `--shadow-sm` / `--shadow-md` / `--shadow-lg` | Elevation |

The full token reference lives in [`styles/_semantics.scss`](styles/_semantics.scss).

### Option B — deep reskin via seeds (works for both install modes)

Override seed values before the generator runs. Every color scale, shadow, hover state, and semantic alias cascades from them.

**For npm installs** — configure the library's SCSS entry with the `@use ... with (...)` syntax:

```scss
// app/globals.scss
@use '@bleizlabs/ui/styles' with (
  $seed-brand:          #00E0B8,
  $seed-accent:         #7C3AED,
  $seed-font-primary:   ('YourFont', system-ui, sans-serif),
  $seed-font-secondary: ('YourBodyFont', system-ui, sans-serif)
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
import { Button } from '@bleizlabs/ui'; // or '@/components/interactive/Button'
import styles from './GradientButton.module.scss';

<Button className={styles.gradient}>Launch</Button>
```

If the same variant reappears in two or more consumer projects, it becomes a candidate for upstream promotion as a new `variant` on the base component.

### Quick checklist — after install

1. Add a global stylesheet and override the CSS variables you care about (Option A — covers 90% of cases).
2. Set `<html data-theme='dark'>` at runtime if you want dark mode; the library ships both themes out of the box.
3. For deeper rebrands on a copy-to-project install, edit `styles/_project-settings.scss` (Option B).
4. For one-off visual patterns, compose locally via `className` or wrap the component (Option C).
5. Inspect live in the playground first — run `npm run dev` inside the library repo and tweak `:root` in the browser DevTools to preview before committing.

---

## Architecture principles

- **SCSS Modules only** — scoped class names, zero runtime style computation, standard tooling
- **Zero runtime UI dependencies** — every interactive primitive (positioning, focus trap, dismiss, drag, match-media, date math) is written in-house
- **Semantic tokens over primitives** — components reference `var(--color-brand)`, never `$brand-500`, so consumers can reskin without forking
- **Compound flat API** — `<Card>` + `<CardHeader>` + `<CardBody>` as siblings, not `<Card.Header>` (shadcn-aligned, IDE-friendly, tree-shakeable)
- **Polymorphism via `asChild`** — pass-through rendering for Next.js `<Link>`, HTML `<button>`, or any custom element using an in-house `Slot` primitive
- **APG-first accessibility** — every interactive component has a documented keyboard model, ARIA contract, and regression catalogue against closed Radix issues
- **Seed-based theming** — 5–10 seed values generate the full token system; consumers change seeds, not individual tokens

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Next.js 16.2 (App Router, Turbopack default) |
| Language | TypeScript 5.6 (strict) |
| Styling | SCSS Modules + CSS custom properties |
| Tokens | Seed-based generator (Sass `@use`/`@forward`) |
| Polymorphism | In-house `Slot` primitive (Radix-style `asChild`) |
| Positioning | In-house `useFloating` + `computePosition` (no Floating UI) |
| Date math | In-house `utils/date.ts` using native `Date` + `Intl.DateTimeFormat` (no date-fns) |
| Focus management | In-house `useFocusTrap` + `FloatingPortal` + `findFirstTabbable` |
| Drag gestures | In-house pointer-capture pattern (`Slider`, `Carousel`, `ScrollArea`) |

No external UI library is imported at runtime.

---

## Distribution

The library follows a **private-npm-first** model with a **copy-snapshot** escape hatch for client deliverables.

### Primary: `@bleizlabs/ui` on GitHub Packages (private)

Internal BleizLabs projects install via `npm install @bleizlabs/ui` from the GitHub Packages private registry. One bug fix → one `npm publish` → `npm update` propagates across every consumer. Source ships as TypeScript + SCSS, consumers transpile via Next.js.

Publishing is driven by the `.github/workflows/publish.yml` workflow — push a `v*.*.*` tag, CI type-checks, builds the playground as a smoke test, verifies the tag matches `package.json` version, and publishes.

### Escape hatch: copy-to-project

Client deliverables that need full code ownership copy `styles/` and `components/` directly into their repository at handoff. The client owns the source outright, with no ongoing registry dependency — at the cost of losing automatic bug-fix propagation.

---

## Roadmap

- **Now:** 81/81 components shipped, `@bleizlabs/ui@0.1.0` published to GitHub Packages, consumer adoption path unblocked.
- **Next — consumer adoption:** First end-to-end consumption by BleizLabs website v2 and the internal admin panel. This is where real-world reskinning and edge cases get discovered.
- **Later — post-consumer refactor:** Rule-of-three extractions — `usePointerDrag`, `useMatchMedia<T>` — land once all three consumers ship stable semantics.
- **Future — additional primitives:** Form orchestrator, Chart primitives, Rich editor (evaluation, not commitment).

---

## License

MIT — see `LICENSE` (added with first public release).

---

## Internal documentation

The following live in the project root (`internal/bleizlabs-ui/`) and are intended for contributors, not external consumers:

- [`COMPONENT_REGISTRY.md`](../COMPONENT_REGISTRY.md) — props, tokens, and usage per component
- [`ROADMAP.md`](../ROADMAP.md) — phase-by-phase component sequencing and pending Epics
- [`docs/decisions.md`](../docs/decisions.md) — architectural decisions log (D1–D26+)
- [`docs/component-standards.md`](../docs/component-standards.md) — authoring conventions
- [`docs/token-architecture.md`](../docs/token-architecture.md) — seed generator internals
- [`docs/a11y-pipeline.md`](../docs/a11y-pipeline.md) — accessibility testing workflow
- [`docs/scss-conventions.md`](../docs/scss-conventions.md) — SCSS module conventions
- [`docs/naming-conventions.md`](../docs/naming-conventions.md) — component and prop naming rules
- [`devlog.md`](../devlog.md) — session-by-session execution journal

---

<sub>Built by [BleizLabs](https://bleizlabs.eu). Feedback and issues welcome.</sub>
