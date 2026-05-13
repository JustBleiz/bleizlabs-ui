# @bleizlabs/ui

> **Radix without the styling sweat. shadcn without the fork-forever tax.**
> _Radix daje a11y. shadcn daje style. Tylko my dajemy oba — i propagujemy fixy przez `npm update`._

> A zero-dependency, fully-styled React component library with seed-based design tokens.
> 104 focused components incl. 4-chart pack + Polish batch (AvatarGroup, Rating, Collapsible, Banner), WAI-ARIA compliant, SCSS Modules, React 19 + Next.js 16.

[![npm](https://img.shields.io/npm/v/@bleizlabs/ui?color=cb3837&logo=npm)](https://www.npmjs.com/package/@bleizlabs/ui)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6)](https://www.typescriptlang.org)

> 📦 **Public on npm.** `npm install @bleizlabs/ui` — no auth, no `.npmrc`. Current version shown in the `npm` badge above. [All releases →](https://github.com/BleizLabs/bleizlabs-ui/releases)

---

## Why

Three walls hit by every product team:

- **Headless libraries** (Radix, Headless UI) leave styling to every consumer — every project re-invents the design system.
- **Styled libraries** (MUI, Chakra) lock you into their design language and runtime dependency.
- **Copy-paste systems** (shadcn/ui) are great starting points, but every project forks forever — fixes don't propagate.

`@bleizlabs/ui` sits between them: **fully styled**, **zero runtime UI dependencies**, **seed-token driven**. Override 5–10 seed values and the entire library reskins consistently.

## Highlights

- **104 focused components** across 9 categories — layout, typography, display, interactive, feedback, specialized, molecules, form presets (FormSurface), and complex interactive primitives. The 0.16.0 release pruned 19 deprecated multi-concept presets in favor of consumer-side composition; 0.17.0 shipped `<DataTable>` as the flagship generic-data grid primitive; 0.18.0 added the Date/Time pack (`<DatePicker>`, `<DateRangePicker>`, `<TimeInput>`, `<TimePicker>`, `<DateTimePicker>` — five components built on in-house `Calendar` + native `Intl`); 0.19.0 added the Forms expansion (`<FileUpload>`, `<TagsInput>`, `<Stepper>` — three primitives closing the core form story); 0.20.0 closed the dashboard chart layer with the Charts pack (`<LineChart>`, `<AreaChart>`, `<Sparkline>`, `<PieChart>` — four SVG-based primitives sharing a `_shared/chart-math` math module, zero external chart deps); **0.21.0 ships the Polish batch — `<AvatarGroup>` (stacked-avatar molecule + overflow chip), `<Rating>` (APG radio-rating interactive primitive), `<Collapsible>` (APG disclosure compound), `<Banner>` (page-wide feedback primitive distinct from inline `<Alert>`), plus an opt-in `showSteppers` amendment for `<TimeInput>` + propagation to `<DateTimePicker>`**.
- **Zero runtime UI dependencies** — every floating primitive, focus trap, drag gesture, date utility, and keyboard model is built in-house
- **Seed-based design tokens** — change 5–10 seeds, the whole library follows
- **SCSS Modules** — no Tailwind, no CSS-in-JS, no runtime style computation
- **APG-first accessibility** — every interactive component maps to a documented WAI-ARIA Authoring Practices pattern
- **Runtime-test-verified** — Playwright keyboard / focus / aria / regression suites + `@axe-core/playwright` WCAG 2.1 AA sweep across all playground routes
- **React 19 + Next.js 16** — built with Server Components, Turbopack, and App Router in mind
- **Form-friendly** — `<Form>` + `<Field>` compound for native HTML5 validation, `<Combobox>` with single- and multi-select modes, FormData multi-value serialization out of the box

## Quick start

### Prerequisites

- Node.js 24 or newer
- React 19 + Next.js 16 host project (or any React 19 bundler with SCSS Modules)

### Installation

```bash
npm install @bleizlabs/ui
```

Published to the public npm registry — no auth, no `.npmrc` setup required.

### Configure Next.js

```js
// next.config.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@bleizlabs/ui'],
  sassOptions: {
    loadPaths: [path.resolve(__dirname, 'node_modules/@bleizlabs/ui/styles')],
  },
};

export default nextConfig;
```

### Import styles + components

```scss
// app/globals.scss
@use '@bleizlabs/ui/styles';
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

### Optional — CLI scaffold

The bundled CLI scaffolds a project wrapper layer (re-exports + theme files + Next.js config):

```bash
npx @bleizlabs/ui init
```

Re-runs are idempotent. After lib upgrades, use `npx @bleizlabs/ui add --new` to scaffold wrappers for newly-added components.

## Customisation

Two tiers of customisation cover most cases.

### Quick reskin — CSS custom properties

```scss
:root {
  --color-brand:        #00E0B8;
  --color-accent:       #7C3AED;
  --radius-md:          12px;
  --font-primary:       'YourFont', system-ui, sans-serif;
}

[data-theme='dark'] {
  --color-surface:      #0a0a0a;
  --color-text-primary: #fafafa;
}
```

All components pick up the change automatically. The full token reference lives in [`styles/_semantics.scss`](styles/_semantics.scss).

### Deep reskin — seed values

Override seed values and every color scale, shadow, hover state, and semantic alias cascades:

```scss
@use '@bleizlabs/ui/styles' with (
  $seed-brand:        #00E0B8,
  $seed-accent:       #7C3AED,
  $seed-font-primary: ('YourFont', system-ui, sans-serif),
);
```

Every seed in [`styles/_project-settings.scss`](styles/_project-settings.scss) carries `!default` — pass only what you care about.

### Per-project variants

For one-off visual treatments, compose locally via `className` rather than fork the library:

```tsx
import { Button } from '@bleizlabs/ui';
import styles from './GradientButton.module.scss';

<Button className={styles.gradient}>Launch</Button>
```

## Playground

The repository includes a Next.js playground with one route per component:

```bash
git clone https://github.com/BleizLabs/bleizlabs-ui.git
cd bleizlabs-ui/dev
npm install
npm run dev
```

Open `http://localhost:3000` for the component index, `/demo` for the combined showcase, or `/components/<name>` for per-component deep dives. Every component is dual-theme from day one.

## Architecture

- **SCSS Modules only** — scoped class names, zero runtime style computation
- **Zero runtime UI dependencies** — positioning, focus trap, dismiss, drag, match-media, date math all in-house
- **Semantic tokens** — components reference `var(--color-brand)`, never primitive scale values
- **Compound flat API** — `<Card>` + `<CardHeader>` + `<CardBody>` as siblings (shadcn-aligned, IDE-friendly, tree-shakeable)
- **Polymorphism via `asChild`** — pass-through rendering for Next.js `<Link>`, custom elements, etc., using an in-house `Slot` primitive
- **APG-first accessibility** — every interactive component has a documented keyboard model, ARIA contract, and regression catalogue

## Testing

Every release passes a multi-stage quality gate:

- **Smoke sweep** — full library-wide `@axe-core/playwright` WCAG 2.1 AA scan against every playground route, run against a production build
- **Per-component runtime suites** — keyboard / focus / aria / regression tests covering every APG-mandated key, focus trap, ARIA state attributes, and known cross-library edge cases
- **NVDA sweep protocols** — manual screen-reader checklists per interactive component for NVDA + Firefox

```bash
npm run test              # full Playwright suite
npm run test:smoke        # axe-core sweep only
npm run typecheck         # tsc --noEmit
npm run lint              # ESLint
```

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript 5.6 (strict, `noUncheckedIndexedAccess`) |
| Styling | SCSS Modules + CSS custom properties |
| Tokens | Seed-based generator (Sass `@use`/`@forward`) |
| Polymorphism | In-house `Slot` primitive (Radix-style `asChild`) |
| Positioning | In-house `useFloating` + `computePosition` |
| Date math | In-house `utils/date.ts` (native `Date` + `Intl`) |
| Focus management | In-house `useFocusTrap` + `findFirstTabbable` |
| Drag gestures | In-house `usePointerDrag` with pointer-capture |
| Match media | In-house `useMatchMedia` via `useSyncExternalStore` |
| Testing | Playwright + `@axe-core/playwright` |

No external UI library is imported at runtime.

## Browser support

| Browser | Minimum version |
|---|---|
| Chrome / Edge (Chromium) | 111+ (`interpolate-size: allow-keywords` in Accordion requires 129+; falls back to `max-height`) |
| Firefox | 110+ |
| Safari (desktop + iOS) | 16.4+ |

Every component ships with `prefers-reduced-motion: reduce` fallbacks and `forced-colors: active` (Windows High Contrast) mappings where relevant.

## Versioning

This project follows [Semantic Versioning 2.0](https://semver.org). See [CHANGELOG.md](CHANGELOG.md).

## Contributing

This library is open-source for visibility but not currently accepting external contributions. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Security

If you discover a security issue, please follow the disclosure process in [SECURITY.md](SECURITY.md).

## License

MIT — see [LICENSE](LICENSE).

---

<sub>Built by [BleizLabs](https://bleizlabs.eu).</sub>
