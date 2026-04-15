# bleizlabs-ui

> Universal fully-styled React component library for BleizLabs.
> Zero runtime UI dependencies. Seed-based design tokens. Copy-to-project model.

## Status

**Phase 0 ✓ + Phase 1 Layout ✓ + Phase 2 Typography ✓ + Phase 3 Display ✓ + Phase 4 Simple Interactive ✓ + Phase 4 Production Hardening ✓ + Phase 5 Feedback ✓ + Phase 6 Specialized ✓ + Phase 7 Molecules ✓ + Phase 8 Card Presets ✓ + Phase 9 Demo & Docs ✓ + Phase 10 IN PROGRESS (Dialog ✓ + AlertDialog ✓ + Drawer ✓ + Sheet ✓ + Tooltip ✓ + Popover ✓ + DropdownMenu ✓ + ContextMenu ✓)** (delivered 2026-04-14/15 in Epics E03-E22). **47/47 simple atoms + 6/6 molecules + 5/5 Card presets + 8/22 complex interactive = 66/80 total components**.

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
- Plus: Slot primitive + cn + mergeRefs + `masks.ts` + **`position.ts` (E19 `computePosition`, E20 added `computeArrowPosition`)** + **`useFloating.ts` (E19 base, E20 extended with optional `arrow: { ref }` option — shared by Tooltip/Popover/DropdownMenu)** utils (`components/utils/`), `SpaceIndex` type (`components/types/`), Next.js 16.2.3 dev playground with 30 per-component routes + `/demo` showcase route (`app/`)
- Phase 9 (E14): **`/demo` showcase page** — single `'use client'` page rendering all components across phase sections (originally 58 at E14 launch; now 65 post-E21 including Phase 10 Dialog/AlertDialog/Drawer/Sheet/Tooltip/Popover/DropdownMenu additions) with runtime theme toggle (`[data-theme]` swap via `useEffect`), anchor nav, inline SVG sun/moon icons (zero deps per D25). Opens at `/demo` in dev server.
- Phase 10 (E15): **Dialog (CI1)** — first Complex Interactive component. Modal dialog per APG `/dialog-modal/` pattern composing `createPortal(document.body)` + overlay + focus-trapped content. Own `useFocusTrap` hook (Tab/Shift+Tab cycle + initial focus + restore on close via `rAF`), Escape handler (listener on `document` so nested Select handlers fire first), body scroll lock only when open, 4 size variants (sm 420 / md 560 / lg 720 / xl 960), `prefers-reduced-motion` fallback, close button with `touch-target` mixin (44×44 mobile). Required `title` prop enforces APG compliance at type level. 21 Radix closed issues documented as regression cases in `components/complex/Dialog/tests/*.spec.md` — Playwright execution + manual NVDA sweep deferred to first consumer adoption per E15 scope decision. (`components/complex/Dialog/`)
- Phase 10 (E16): **AlertDialog (CI2)** — second Complex Interactive. Blocking modal alert per APG `/alertdialog/`. Reuses `useFocusTrap` from Dialog (imported, not duplicated). Adds alert-specific semantics: `role="alertdialog"`, REQUIRED `aria-describedby` (not optional — type-enforced via non-optional `description: string` prop), least-destructive initial focus (Cancel by default), `closeOnOverlayClick` default `false` (enforces explicit action), Escape calls `onCancel` not `onConfirm`, **background `inert` toggle** (progressive enhancement beyond focus trap — blocks AT virtual cursor / Browse Mode). Severity system (`info`/`warning`/`critical`) drives border glow + default `confirmVariant`. 3 sizes narrower than Dialog (sm 360 / md 480 / lg 600). `.root` base class per D11. 41 Radix regression cases mapped in `tests/*.spec.md` (21 inherited from Dialog + 20 AlertDialog-specific) — ~12 marked `test.skip` with `PLAYGROUND-DEP:` rationale (unskip when nested Select/Toast/form/shadow-DOM scenarios land). (`components/complex/AlertDialog/`)
- Phase 10 (E17): **Drawer (CI3)** — third Complex Interactive. Bottom-positioned modal sheet. Visual modifier of APG `/dialog-modal/` pattern (uses `role="dialog"`, not `alertdialog` — generic container). Reuses `useFocusTrap` from Dialog. SCSS forked from AlertDialog's `.root` + `.content` pattern with bottom-anchored layout (`align-items: flex-end`), slide-up keyframe (`translateY(100% → 0)`), top-only border-radius, iOS `env(safe-area-inset-bottom)` padding, and **sticky footer via `overflow-y: auto` on `.body`** (not `.content`) so only body scrolls while header/footer stay pinned. Height variants (sm 360 / md 560 / lg `min(80vh, calc(100vh - space-8))` with `80dvh` progressive override for iOS Safari address bar collapse) — differs from Dialog/AlertDialog which use width variants. `description?` optional (Dialog parity, NOT AlertDialog strictness), `closeOnOverlayClick` default `true` (Dialog parity). Optional `showCloseButton?` default `false` (drawers are action-driven, opt-in X icon). 41 regression cases mapped (21 inherited + 20 Drawer-specific: bottom anchor, top-only radius, dvh fallback, safe-area-inset, sticky footer, iOS viewport/scroll/keyboard quirks, multi-drawer stacking) — ~15 marked `test.skip` with `PLAYGROUND-DEP:` rationale. (`components/complex/Drawer/`)
- Phase 10 (E22): **ContextMenu (CI8)** — eighth Complex Interactive, **FIRST RIGHT-CLICK MENU**. Extends DropdownMenu pattern with `contextmenu` event trigger + position-at-cursor via direct `computePosition` call (skip `useFloating` hook since menu closes on scroll and never needs live repositioning) + native browser context menu suppression + close-on-scroll convention (native OS parity). 7 flat compound exports. Copy+layer from DropdownMenu (D-C1 Option B) — DropdownMenuContext hard-codes `triggerRef` incompatible with cursor-point positioning. `ContextMenuTrigger` defaults `asChild={true}` so it wraps `<tr>`/`<li>`/`<td>` without breaking DOM structure. Focus restore target is pre-open `activeElement` snapshot (not a trigger widget). `computedFor: CursorPoint | null` state guard prevents flicker at old position when user re-right-clicks at new coordinates. **E22 marks the 3rd floating-menu consumer** (Popover + DropdownMenu + ContextMenu) — FloatingRoot shared primitive extraction now cost-effective, planned for E23+. 15 Radix regression cases mapped, ~5 `test.skip` with `PLAYGROUND-DEP:` / `TOUCH-DEFERRED:` rationale. (`components/complex/ContextMenu/`)
- Phase 10 (E21): **DropdownMenu (CI7)** — seventh Complex Interactive, **FIRST ACCESSIBLE MENU**. Full APG `/menu/` keyboard model: Enter/Space/ArrowDown on trigger opens first item, ArrowUp opens last, Arrow keys cycle with wraparound (skipping disabled), Home/End jump, typeahead single+multi-char with 500ms buffer reset, Escape + item-select restore focus to trigger, Tab closes without restore (APG convention). 7 flat compound exports per D24 (`DropdownMenu` + `DropdownMenuTrigger` + `DropdownMenuContent` + `DropdownMenuItem` + `DropdownMenuSeparator` + `DropdownMenuLabel` + `DropdownMenuGroup`). Does NOT reuse Popover directly (D-D1 Option B: copy+layer) — Popover hard-codes `role="dialog"` incompatible with `role="menu"`. Plan to extract shared `FloatingRoot` primitive at E22+ once ContextMenu amortizes duplication. `onSelect` cancelable `CustomEvent` pattern enables future CheckboxItem/RadioItem. `matchTriggerWidth` prop (Radix #17 fix) forces content min-width to trigger width. 20 Radix regression cases mapped, ~6 `test.skip` with `PLAYGROUND-DEP:` / `SUBMENU-DEFERRED:` rationale. **Pattern-parent for ContextMenu (CI8 — trivial reuse), NavigationMenu (CI10), and informs Select (CI12) / Combobox (CI13) listbox nav patterns.** (`components/complex/DropdownMenu/`)
- Phase 10 (E20): **Popover (CI5)** — sixth Complex Interactive, **FIRST COMPOUND FLAT API**. Floating panel anchored to a trigger for contextual content per APG `/dialog-modal/` non-modal variant. Closes the slot skipped in E19. Three named exports per D24: `Popover` (state holder + context), `PopoverTrigger` (Slot-or-button with merged ARIA), `PopoverContent` (portal + positioning + focus + dismiss). Pattern-parent for DropdownMenu / HoverCard / ContextMenu / Select / Combobox / NavigationMenu (all 6 downstream floating components inherit the compound API shape). **Extends E19 positioning engine**: added `computeArrowPosition()` as separate utility in `utils/position.ts` (zero-cost opt-out), added optional `arrow: { ref, padding? }` option in `useFloating` that populates `arrowStyles?` in result. **New dismiss primitive**: outside-click via `document.addEventListener('pointerdown', h, { capture: true })` — capture phase prevents trigger-close-reopen race, skips `documentElement`/`body` targets (scrollbar click fix, Radix #7), containment checks via `popperRef.contains()` + `triggerRef.contains()`. **Hybrid focus management**: non-modal default (lightweight first-tabbable + restore, no trap) vs opt-in `modal=true` (imports `useFocusTrap` from Dialog + background `inert` toggle + body scroll lock). SCSS: `.root` + `.content` 2-level, `.arrow` rotated square with 4 placement-keyed rotations, fork `popoverContentIn` keyframe. 20 Radix regression cases mapped, ~6 `test.skip` with `PLAYGROUND-DEP:` rationale. (`components/complex/Popover/`, shared utils `components/utils/position.ts` extended, `components/utils/useFloating.ts` extended)
- Phase 10 (E19): **Tooltip (CI6)** — fifth Complex Interactive, **FIRST MODELESS**. Modeless floating label on hover/focus per APG `/tooltip/`. Out-of-ROADMAP-order pick (skipped CI5 Popover) as engineering risk mitigation — simplest positioning case to validate the new primitive. **Introduces shared own positioning engine** (`components/utils/position.ts` pure math + `components/utils/useFloating.ts` React hook) — zero runtime deps (user E19 override rejected `@floating-ui/react`: "w całym projekcie unikaliśmy używania jakichkolwiek bibliotek"). Positioning: `computePosition()` applies offset → flip (opposite-side retry on overflow) → shift (cross-axis clamp). `useFloating` hook wraps with scroll/resize/ResizeObserver autoUpdate. `TooltipProvider` context for toolbar skip-delay groups (Radix #2372 pattern). SC 1.4.13 full compliance: Escape hides without losing trigger focus (dismissable), grace area close delay for pointer travel into content (hoverable), focus path always wired (keyboard parity with hover). `useCoarsePointer` via `useSyncExternalStore` suppresses hover listeners on touch devices while keeping aria-describedby for AT access. Provider exposes callbacks (onOpen/onClose/shouldSkipDelay) instead of mutable refs to satisfy React 19's `react-hooks/immutability` rule. Fork `tooltipContentIn` keyframe. 20 Radix regression cases mapped (#620, #705, #617, #1691, #1914, #1077, #2029, #2372, #1920, #1573, #2589, #1351, #2959, #2665, #899, #1010, #1476, #1612, #3081, #2727) — ~10 `test.skip` with `PLAYGROUND-DEP:` rationale. (`components/complex/Tooltip/`, shared utils in `components/utils/position.ts` + `components/utils/useFloating.ts`)
- Phase 10 (E18): **Sheet (CI4)** — fourth Complex Interactive. 4-directional side panel — closes the Drawer family. `side: 'left' | 'right' | 'top' | 'bottom'` prop drives 5 per-side lookup tables: `SIDE_CLASS` (flex alignment), `RADIUS_CLASS` (inner corners only), `BORDER_CLASS` (outer edge removed), `SAFEAREA_CLASS` (iOS `env(safe-area-inset-*)` matched to side), `ANIMATION_CLASS` (4 distinct slide-in keyframes: `sheetContentInLeft/Right/Top/Bottom` with `translateX/Y(±100% → 0)`). Discriminated size lookup: horizontal (l/r) uses width variants (sm 320 / md 420 / lg 560), vertical (t/b) uses height variants (sm 240 / md 360 / lg `min(80vh, calc(100vh - space-8))` with `80dvh` override). Reuses `useFocusTrap` from Dialog + Drawer's sticky footer pattern (`.body` owns overflow, `.footer` flex-shrink: 0). Default `side="right"` (desktop nav pattern), default `showCloseButton=true` (sheets are long-lived panels, X ergonomic — differs from Drawer). Close button `aria-label={\`Close ${title}\`}` — title-scoped per APG for uniquely identifiable action in stacked modal scenarios. 41 regression cases (21 inherited + 20 Sheet-specific: 4-side anchor verification, per-side border-radius inner-only, horizontal vs vertical size variants, safe-area per side, showCloseButton on/off, sticky footer, reduced-motion). `.root` base class per D11. (`components/complex/Sheet/`)

**Next:** Phase 10 remaining 14 Complex Interactive components (HoverCard, NavigationMenu, Tabs, Select, Combobox, Slider, Toast, Calendar, DatePicker, InputOTP, Command, ScrollArea, Carousel, Sidebar) — one per Epic. E19 Tooltip established modeless floating + positioning engine. E20 Popover added compound flat API + arrow + outside-click. E21 DropdownMenu added full APG /menu/ keyboard model + typeahead. **E22 ContextMenu added contextmenu event trigger + position-at-cursor (direct `computePosition` call) + close-on-scroll — completes the accessible menu sub-family.** Next natural picks: **FloatingRoot refactor sprint** (extract shared primitive between Popover + DropdownMenu + ContextMenu — 3 consumers now amortize the cost), OR **HoverCard (CI9)** (Popover + hover trigger with Tooltip-like delay group), OR **Tabs (CI11)** (new family with `role="tablist"` + roving tabindex). Dialog + AlertDialog + Drawer + Sheet establish the Phase 10 pattern: `components/complex/` folder + `.root` D11 naming + extended a11y pipeline + `useFocusTrap` reuse across siblings + inline duplication of portal/scroll-lock/Escape/inert per D5/D25 ownership + `PLAYGROUND-DEP:` skip convention + deferred Playwright execution until consumer adoption + recommendation self-audit flow at plan gates. Sheet closes the Drawer family with 4-directional lookup-table architecture (side-driven CSS class maps), establishing the "visual modifier" family pattern for future Phase 10 modal-family components. Next wave likely Popover/Tooltip which introduce positioning engine (new primitive scope).

## Demo showcase

Run `npm run dev` and open [`http://localhost:3000/demo`](http://localhost:3000/demo) to see all 65 components in one page. The demo has a theme toggle button that swaps `[data-theme]` on `<html>` — inspect both light and dark tokens in place.

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
