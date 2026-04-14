# bleizlabs-ui

> Universal fully-styled React component library for BleizLabs.
> Zero runtime UI dependencies. Seed-based design tokens. Copy-to-project model.

## Status

**Phase 0 ✓ + Phase 1 Layout ✓ + Phase 2 Typography ✓ + Phase 3 Display ✓ + Phase 4 Simple Interactive ✓ + Phase 4 Production Hardening ✓ + Phase 5 Feedback ✓ + Phase 6 Specialized ✓ + Phase 7 Molecules ✓ + Phase 8 Card Presets ✓ + Phase 9 Demo & Docs ✓ + Phase 10 IN PROGRESS (Dialog ✓ + AlertDialog ✓ + Drawer ✓)** (delivered 2026-04-14/15 in Epics E03-E17). **47/47 simple atoms + 6/6 molecules + 5/5 Card presets + 3/22 complex interactive = 61/80 total components**.

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
- Plus: Slot primitive + cn + mergeRefs + `masks.ts` utils (`components/utils/`), `SpaceIndex` type (`components/types/`), Next.js 16.2.3 dev playground with 26 per-component routes + `/demo` showcase route (`app/`)
- Phase 9 (E14): **`/demo` showcase page** — single `'use client'` page rendering all 58 components across 8 phase sections with runtime theme toggle (`[data-theme]` swap via `useEffect`), anchor nav, inline SVG sun/moon icons (zero deps per D25). Opens at `/demo` in dev server.
- Phase 10 (E15): **Dialog (CI1)** — first Complex Interactive component. Modal dialog per APG `/dialog-modal/` pattern composing `createPortal(document.body)` + overlay + focus-trapped content. Own `useFocusTrap` hook (Tab/Shift+Tab cycle + initial focus + restore on close via `rAF`), Escape handler (listener on `document` so nested Select handlers fire first), body scroll lock only when open, 4 size variants (sm 420 / md 560 / lg 720 / xl 960), `prefers-reduced-motion` fallback, close button with `touch-target` mixin (44×44 mobile). Required `title` prop enforces APG compliance at type level. 21 Radix closed issues documented as regression cases in `components/complex/Dialog/tests/*.spec.md` — Playwright execution + manual NVDA sweep deferred to first consumer adoption per E15 scope decision. (`components/complex/Dialog/`)
- Phase 10 (E16): **AlertDialog (CI2)** — second Complex Interactive. Blocking modal alert per APG `/alertdialog/`. Reuses `useFocusTrap` from Dialog (imported, not duplicated). Adds alert-specific semantics: `role="alertdialog"`, REQUIRED `aria-describedby` (not optional — type-enforced via non-optional `description: string` prop), least-destructive initial focus (Cancel by default), `closeOnOverlayClick` default `false` (enforces explicit action), Escape calls `onCancel` not `onConfirm`, **background `inert` toggle** (progressive enhancement beyond focus trap — blocks AT virtual cursor / Browse Mode). Severity system (`info`/`warning`/`critical`) drives border glow + default `confirmVariant`. 3 sizes narrower than Dialog (sm 360 / md 480 / lg 600). `.root` base class per D11. 41 Radix regression cases mapped in `tests/*.spec.md` (21 inherited from Dialog + 20 AlertDialog-specific) — ~12 marked `test.skip` with `PLAYGROUND-DEP:` rationale (unskip when nested Select/Toast/form/shadow-DOM scenarios land). (`components/complex/AlertDialog/`)
- Phase 10 (E17): **Drawer (CI3)** — third Complex Interactive. Bottom-positioned modal sheet. Visual modifier of APG `/dialog-modal/` pattern (uses `role="dialog"`, not `alertdialog` — generic container). Reuses `useFocusTrap` from Dialog. SCSS forked from AlertDialog's `.root` + `.content` pattern with bottom-anchored layout (`align-items: flex-end`), slide-up keyframe (`translateY(100% → 0)`), top-only border-radius, iOS `env(safe-area-inset-bottom)` padding, and **sticky footer via `overflow-y: auto` on `.body`** (not `.content`) so only body scrolls while header/footer stay pinned. Height variants (sm 360 / md 560 / lg `min(80vh, calc(100vh - space-8))` with `80dvh` progressive override for iOS Safari address bar collapse) — differs from Dialog/AlertDialog which use width variants. `description?` optional (Dialog parity, NOT AlertDialog strictness), `closeOnOverlayClick` default `true` (Dialog parity). Optional `showCloseButton?` default `false` (drawers are action-driven, opt-in X icon). 41 regression cases mapped (21 inherited + 20 Drawer-specific: bottom anchor, top-only radius, dvh fallback, safe-area-inset, sticky footer, iOS viewport/scroll/keyboard quirks, multi-drawer stacking) — ~15 marked `test.skip` with `PLAYGROUND-DEP:` rationale. (`components/complex/Drawer/`)

**Next:** Phase 10 remaining 19 Complex Interactive components (Sheet, Popover, Tooltip, DropdownMenu, ContextMenu, HoverCard, NavigationMenu, Tabs, Select, Combobox, Slider, Toast, Calendar, DatePicker, InputOTP, Command, ScrollArea, Carousel, Sidebar) — one per Epic per component-build skill. Dialog + AlertDialog + Drawer establish the Phase 10 pattern: `components/complex/` folder + `.root` D11 naming + extended a11y pipeline + `useFocusTrap` reuse across siblings + inline duplication of portal/scroll-lock/Escape/inert per D5/D25 ownership + `PLAYGROUND-DEP:` skip convention + deferred Playwright execution until consumer adoption. Drawer adds the "visual modifier" precedent — same APG pattern family as Dialog but different spatial layout (bottom-anchored + slide-up).

## Demo showcase

Run `npm run dev` and open [`http://localhost:3000/demo`](http://localhost:3000/demo) to see all 61 components in one page. The demo has a theme toggle button that swaps `[data-theme]` on `<html>` — inspect both light and dark tokens in place.

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
