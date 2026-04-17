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
`Card` (+ `CardHeader`, `CardBody`, `CardFooter`, `CardSection`) · `Badge` · `Separator` · `IconBox` · `Avatar` · `Skeleton` · `Spinner` · `AspectRatio` · `Table` (+ `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableCell`)

### Interactive (18)
`Button` · `ButtonGroup` · `Input` · `Textarea` · `Label` · `Checkbox` · `RadioGroup` · `Toggle` · `ToggleGroup` · `Switch` · `Accordion` · `InputGroup` · `NumberInput` · `MaskedInput` · `PhoneInput` · `PasswordInput`

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

### Installation — today (copy-to-project)

The library is currently pre-1.0 and consumed by copying the source into a host project. This works, but does not scale past a few consumers because bug fixes do not propagate automatically. A private npm package is the next milestone — see [Distribution](#distribution) below.

```bash
# In your consumer project root
cp -r path/to/bleizlabs-ui/dev/styles      ./styles
cp -r path/to/bleizlabs-ui/dev/components  ./components
```

Then configure your host project:

```ts
// tsconfig.json — add path aliases
{
  "compilerOptions": {
    "paths": {
      "@/components/*": ["./components/*"],
      "@/styles/*":     ["./styles/*"]
    }
  }
}
```

```scss
// app/globals.scss — import the token system at the top
@use './styles' as *;
```

Use the [Customisation](#customisation) section next to reskin the library for your project.

### Installation — next release (private npm package)

The next release publishes to GitHub Packages as `@bleizlabs/ui`. Once shipped, this becomes the recommended path for internal BleizLabs projects — installed once, updated with `npm update` across every consumer.

```bash
# .npmrc  (one-time setup per consumer project)
@bleizlabs:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}

# install
npm install @bleizlabs/ui
```

```tsx
import { Button, Card, CardHeader, CardBody } from '@bleizlabs/ui';
import '@bleizlabs/ui/styles';
```

Full styling customisation is preserved because tokens are CSS custom properties — see [Customisation](#customisation).

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

### Option B — deep reskin via seeds (copy-to-project installs)

When you copy the library into your project, you gain access to the seed generator. Change the seeds once and every color scale, shadow, hover state, and semantic alias cascades from them:

```scss
// styles/_project-settings.scss — edit these, rebuild, everything follows
$seed-brand:          #0ea5e9;   // anchor for --color-brand-50 … --color-brand-900
$seed-accent:         #f97316;   // anchor for accent scale
$seed-radius:         8px;       // base radius; md/lg/xl multiply from here
$seed-space-unit:     4px;       // spacing unit (index × unit = px)
$seed-font-primary:   'Inter';
$seed-font-secondary: 'JetBrainsMono';
```

This is the most powerful option — you are redefining the whole design-system scale, not just individual tokens. Use it when you need a full rebrand rather than a tweak.

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

We are moving the library towards a **private-npm-first** model with a **copy-snapshot** escape hatch for client deliverables.

### Today: copy-to-project

The library is copied into each consumer at project start. This is fine for 1–3 consumers, but breaks down at scale: a bug fix in one consumer has to be re-applied manually everywhere else.

### Next release: `@bleizlabs/ui` on GitHub Packages (private)

The library will publish to GitHub Packages as a private scoped package, consumed by internal BleizLabs projects via `npm install @bleizlabs/ui`. One bug fix → one `npm publish` → `npm update` in every consumer.

### Client deliverables: hybrid

For client projects that need full code ownership, a `copy-snapshot` workflow will freeze the current library version into the client repository at handoff time, so the client owns the code without an ongoing dependency on our registry.

Full implementation lands in the next release.

---

## Roadmap

- **Now:** Table primitives shipped, library at 81/81. Internal documentation and distribution preparation in progress.
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
