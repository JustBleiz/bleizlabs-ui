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

### Installation (current — copy-to-project)

While the library is pre-1.0 and stabilising against real consumer projects, installation is copy-based:

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

### Installation (upcoming — private npm package)

In the next release, the library will publish to GitHub Packages as `@bleizlabs/ui`:

```bash
# .npmrc
@bleizlabs:registry=https://npm.pkg.github.com

# install
npm install @bleizlabs/ui
```

```tsx
import { Button, Card, CardHeader, CardBody } from '@bleizlabs/ui';
import '@bleizlabs/ui/styles';
```

This preserves full styling customisation (all tokens are CSS custom properties that consumers override) while enabling `npm update @bleizlabs/ui` to propagate bug fixes and new components across every project at once. See [Distribution](#distribution) for the full strategy.

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

### The seed system

Every token in the library is derived from a small set of seed values. Change a seed, and the generator cascades the change through every color scale, shadow, glow, hover state, and semantic alias.

```scss
// styles/_project-settings.scss — this is where you reskin
$seed-brand:       #0ea5e9;   // anchor for brand-50 … brand-900 scale
$seed-accent:      #f97316;   // anchor for accent scale
$seed-radius:      8px;       // base radius; md/lg/xl multiply from here
$seed-space-unit:  4px;       // spacing scale unit (index × unit = px)
$seed-font-primary: 'Inter';
$seed-font-secondary: 'JetBrains Mono';
```

### CSS custom property overrides

For finer control without touching SCSS, override semantic tokens in your host app's global stylesheet:

```scss
:root {
  --color-brand:   #00E0B8;
  --radius-md:     12px;
  --font-primary:  'YourFont', system-ui, sans-serif;
}

[data-theme='dark'] {
  --color-surface: #0a0a0a;
  --color-text-primary: #fafafa;
}
```

All 81 components read from semantic CSS variables — no component needs to be patched.

### Per-project variants

If a pattern recurs in a consumer project but isn't in the library, compose locally first:

```tsx
<Button className={styles.ghostGlow}>...</Button>
```

If the pattern repeats across two or more projects, it becomes a candidate for upstream promotion as a new variant.

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

<sub>Built by [BleizLabs](https://bleizlabs.com). Feedback and issues welcome.</sub>
