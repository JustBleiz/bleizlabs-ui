# `@bleizlabs/ui` — Agent Usage Guide

**Valid for:** `@bleizlabs/ui@__VERSION__` — if `npm view @bleizlabs/ui version` differs, this doc may be stale. Re-read after upgrading.

This is the deep reference for AI coding agents working in consumer projects that depend on `@bleizlabs/ui`. The thin `AGENTS.md` (root of the package) is the entry point with mission + decision tree + anti-patterns table + pointers. This document covers setup, decision rules, SSR/RSC mapping, per-domain quick-starts, troubleshooting, and the full component inventory.

When in doubt about per-prop API, read the JSDoc on the actual component file:
`node_modules/@bleizlabs/ui/components/<category>/<Name>/<Name>.tsx`.

---

## A. Intro

### A.1 What `@bleizlabs/ui` is

A React component library shipping universal building blocks — atoms, focused molecules, behavior compounds, generic-data primitives, and chart primitives — built for projects that want **structure + a11y + behavior** from the lib while **owning visual identity** in their own SCSS modules. shadcn-pattern philosophy without the fork-forever cost: fixes propagate via `npm update`.

The library does NOT ship:

- Business-domain organisms (no `<ProjectCard>`, `<TicketDetailHeader>`, `<ClientFinanceSummary>` — those live in your project)
- Pre-composed product surfaces (no `<DashboardHero>`, `<LoginCard>`, `<FilterHero>` — compose from atoms)
- Surface-prefixed components (no `<PanelHeader>`, `<MarketingFooter>` — universal naming only)
- Styling-alternative variants beyond the documented set (`Card variant="neon"` doesn't exist; consumer SCSS handles visual variation via `className` passthrough)

When you reach for any of those, write them locally in your project as a composition of lib atoms + your own SCSS module. The lib is the box of legos; the model is yours.

### A.2 Versioning + breaking changes

Pre-1.0 (current). Minor bumps (`0.X.0`) may include breaking changes — read CHANGELOG before upgrading. Patch bumps (`0.X.Y`) are safe. The library will hit 1.0 on explicit stabilization trigger from maintainers, not auto-follow from minor count.

`manifest.json` (`node_modules/@bleizlabs/ui/components/manifest.json`) is the canonical machine-readable export list — read it when you need to verify a component exists in the installed version.

---

## B. Installation + setup

### B.1 Install

```bash
npm install @bleizlabs/ui
```

Public on npm — no auth, no `.npmrc` setup. If your project's `.npmrc` contains `@bleizlabs:registry=https://npm.pkg.github.com` (legacy GitHub Packages), **remove it** — the lib has moved to public npmjs.org and the stale registry pointer will either fail or fetch an outdated version.

### B.2 Next.js config

```ts
// next.config.ts (or .mjs)
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  transpilePackages: ['@bleizlabs/ui'],
  sassOptions: {
    loadPaths: [path.resolve(__dirname, 'node_modules/@bleizlabs/ui/styles')],
  },
};

export default config;
```

`transpilePackages` is required so Next.js compiles lib `.tsx`/`.ts` files (the lib ships source, not pre-built JS, so consumer Turbopack/SWC handles them). `sassOptions.loadPaths` lets your `app/globals.scss` `@use '@bleizlabs/ui/styles'` resolve without relative path gymnastics.

### B.3 SCSS bootstrap

```scss
// app/globals.scss
@use '@bleizlabs/ui/styles';

// Optional: prettier scrollbars across the whole app.
// Drop this line if you prefer browser defaults.
@use '@bleizlabs/ui/styles/scrollbar';
```

The first `@use` imports the full token system (`_seed.scss` → `_semantics.scss` → `_index.scss`). The opt-in `scrollbar` import styles WebKit-based scrollbars globally — useful for dashboards and panel surfaces; not needed for marketing sites.

### B.4 Token override patterns

Three cascade layers, override the one matching your scope:

```scss
// app/globals.scss

// 1. Quick reskin — override semantic tokens at :root
:root {
  --color-brand: #00e0b8;
  --color-accent: #7c3aed;
  --radius-md: 12px;
  --font-primary: 'YourFont', system-ui, sans-serif;
}

// 2. Dark theme overrides
[data-theme='dark'] {
  --color-surface: #0a0a0a;
  --color-text-primary: #fafafa;
}

// 3. Deep reskin — override SEEDS (every scale + shadow + hover state cascades)
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

Layer 1 (semantic CSS custom properties) handles 95% of cases. Layer 3 (seed Sass variables) is for when you need the color scale and all its derived shadows/hovers to follow a new brand color consistently. The full token reference: `node_modules/@bleizlabs/ui/styles/_semantics.scss`.

### B.5 CLI scaffold (optional)

```bash
npx @bleizlabs/ui init
```

Creates a project wrapper layer (`app/_components/ui/`) that re-exports lib components + scaffolds theme files + patches `next.config`. Re-runs are idempotent. After lib upgrades: `npx @bleizlabs/ui add --new` to scaffold wrappers for newly-added components.

See `node_modules/@bleizlabs/ui/cli/README.md` for the full CLI reference.

---

## C. Decision rules deep

### C.1 Reuse-first Q1-Q5 (expanded)

The decision tree from `AGENTS.md` in full detail:

- **Q1. Does a lib export cover this primitive?**
  - Check `manifest.json` `components.length === 106` (or current count). Scan by category for the concept.
  - Check Section J inventory at the bottom of this doc.
  - If yes → import + use, possibly with `variant` prop for variation.

- **Q2. Can I compose 2-3 lib atoms inline in `_sections/<Name>Section/`?**
  - Default = yes, compose in the section. Sections are legitimate orchestrators — they can have 50-100 LOC of composition. Pages render sections in order; sections compose atoms + molecules + project data.
  - 1 use → inline in `_sections/<Name>Section/<Name>Section.tsx`, NO `.module.scss` (sections orchestrate, never style).

- **Q3. Does the same composition pattern appear in 2+ pages with IDENTICAL structural + slot + data shape?**
  - "Similar" or "semantically related" does NOT qualify — must be byte-identical structurally.
  - 2 uses + identical → extract to `app/_components/shared/<atoms|molecules|organisms|layout>/<Name>/`. Per atomic-design taxonomy: atom = single primitive; molecule = 2-5 atoms composed for one concept; organism = business unit with data prop; layout = chrome singleton (Header, Footer, Sidebar).
  - Each consumer creates own `_sections/<NameSection>/` wrapper around the shared component, wiring page-specific data.

- **Q4. Has the same pattern repeated 3+ times across BleizLabs projects?**
  - Universal across consumer projects → propose lib promotion. Must pass the lib's klocek-vs-organism test: single concept, data-shape-neutral (free-form `children` slots, not forced typed arrays), no auto-wrap of strings into specific atom variants, no surface-bias in naming.

- **Q5. Borderline?** Ask the user. Don't preempt extraction.

### C.2 `asChild` polymorphism

Most interactive lib atoms support `asChild` — instead of rendering their default element, they project styles + behavior onto the single child element. Powered by an in-house `Slot` primitive (Radix-style).

```tsx
// Button navigation: use the dedicated `href` prop — renders an `<a>`,
// stays server-safe (no client boundary).
import { Button } from '@bleizlabs/ui';

<Button href="/dashboard">Open dashboard</Button>;

// NOT `<Button asChild><Link href>` — asChild pulls the Slot primitive's
// 'use client' boundary into your tree for zero benefit here. Reserve
// asChild for elements WITHOUT a dedicated prop (examples below).
```

```tsx
// Render Card as <article> (semantic HTML for content)
import { Card } from '@bleizlabs/ui';

<Card asChild>
  <article>{/* card visual treatment + article semantics */}</article>
</Card>;
```

```tsx
// Render Heading as <a> when content is a link
import { Heading, Anchor } from '@bleizlabs/ui';

<Heading level={2} asChild>
  <Anchor href="/section">Section title that links</Anchor>
</Heading>;
```

Hard rule: `asChild` accepts **exactly one** React element child. Two children, a fragment with multiple elements, or a string-only child will throw at runtime. The child must accept `className` and `ref` (functional components: use ref-as-prop or `forwardRef`).

### C.3 Token override cascade

```
seed (Sass)
   ↓ generates
semantic (--color-*, --space-*, --radius-*, --font-*)
   ↓ consumed by
component CSS custom properties (e.g., --button-py, --input-px)
```

Override at the lowest layer that fits:

- **Want all buttons taller in this app?** Override `--button-py` at `:root` or on the surface where buttons should be larger.
- **Want a new brand color everywhere?** Override `--color-brand` at `:root` (semantic layer) — fastest, covers 95% of cases.
- **Want the brand color to also drive computed hover/shadow scales?** Override `$seed-brand` in `app/globals.scss` `@use` block (seed layer) — deeper cascade.

The full per-component channel list is in each component's JSDoc `@tokens` tag. Example for `<Card>`:

```
@tokens  --color-surface, --color-border-subtle, --shadow-card,
         --space-{0..20}, --radius-{sm..2xl}, --color-brand,
         --color-text-primary, --padding-card, --radius-card,
         --border-width-accent, --duration-card-hover, --easing-default,
         --card-bg-glass + --card-blur (theme-aware semantic tokens
         defined in `_semantics.scss`).
         Local channels: --card-{padding,radius,direction,gap,width},
         --card-accent-color (accent variant border color override).
```

---

## D. SSR / RSC / Next.js 16

### D.1 Server Component default

React 19 + Next.js 16 App Router defaults to Server Components. The lib does NOT pre-mark every component `'use client'` — only the ones that need it (interactivity, browser APIs, React hooks). This means most lib atoms render as Server Components when imported from a server file, and the `'use client'` boundary moves to the interactive leaf only.

### D.2 Which lib components are `'use client'`

The Section J inventory below has a `Client?` column for every family. `yes` = the family's primary file carries the `'use client'` directive (the component or its compound root needs client runtime). `no` = renders as Server Component by default.

Compound components with mixed parts: the directive applies to the family's primary file. Some sub-parts may be used in server contexts depending on their internal needs — read the JSDoc per sub-component when uncertain.

Rule of thumb: layout atoms (`Stack`, `Inline`, `Container`, `Section`, `Card`, `Heading`, `Text`, `Badge`, `Separator`, `Spinner`, `Skeleton`) are server-safe. Anything that maintains UI state (Dialog, Tabs, Accordion, DatePicker, Form, Toaster, Sidebar) or attaches event handlers carries `'use client'`.

### D.3 Server-data prop-drilling pattern

Fetch data in the Server Component parent, pass as serializable props down to the lib + your composition. Don't make consumer components client just to fetch — keep the boundary as deep as possible.

```tsx
// app/dashboard/page.tsx — Server Component
import { Stack, Heading } from '@bleizlabs/ui';
import { getProjects } from '@/lib/db';
import { ProjectsList } from './_sections/ProjectsSection/ProjectsSection';

export default async function DashboardPage() {
  const projects = await getProjects(); // server-side query
  return (
    <Stack gap={6}>
      <Heading level={1}>Dashboard</Heading>
      <ProjectsList projects={projects} />
    </Stack>
  );
}

// app/dashboard/_sections/ProjectsSection/ProjectsSection.tsx — Server Component
import { Stack } from '@bleizlabs/ui';
import { ProjectCard } from '@/_components/shared/organisms/ProjectCard';

export function ProjectsList({ projects }: { projects: Project[] }) {
  return (
    <Stack gap={3}>
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </Stack>
  );
}
```

If `<ProjectCard>` itself is server-safe (no `onClick`, just structural rendering of `project` data), the whole tree stays server-rendered. The interactive boundary moves to a button inside the card (which marks `'use client'` locally), not to the page.

### D.4 FloatingPortal hydration

Lib components that render via portal (Dialog, Sheet, Drawer, Popover, Tooltip, HoverCard, DropdownMenu, ContextMenu, AlertDialog, Toaster) use a one-shot mount gate to avoid SSR hydration mismatches:

```tsx
// Pattern used internally — agents don't need to replicate
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

First server render returns `null` (no portal DOM). Second client render (after `useEffect`) mounts the portal target into `document.body`. This eliminates the React 19 dev-mode hydration mismatch warnings that earlier versions of these components emitted.

Consumer-side rule: don't wrap lib portal components in your own `useEffect` gate — that's already handled. Just render the component conditionally based on your business state (`open={isOpen}`) and let the lib handle the SSR boundary.

### D.5 React Compiler interop

If your project enables the React 19 Compiler (`experimental.reactCompiler: true` in `next.config`), the lib is compatible — components do not use mutation in render, do not use conditional hooks, and follow React's Rules of Hooks throughout. You can drop manual `useMemo` / `useCallback` calls in your own code that wrap lib usage; the compiler handles caching.

---

## E. Per-domain quick-start

Each subsection covers the highest-value components in one domain plus their canonical usage shape. Read in order of need — Layout + Forms + Overlays carry the most patterns.

### E.1 Layout

`Stack` (vertical flex), `Inline` (horizontal flex), `Container` (max-width wrapper), `Section` (semantic `<section>` with optional `tag`/`aria-labelledby`), `GridLayout` (responsive grid with `responsive={{ sm, md, lg, xl }}` column cascade).

```tsx
import { Stack, Inline, Container, Section, Heading } from '@bleizlabs/ui';

<Section tag="section" aria-labelledby="hero-heading">
  <Container size="lg">
    <Stack gap={6}>
      <Heading level={1} id="hero-heading">
        Title
      </Heading>
      <Inline gap={3} wrap>
        <Button>Primary</Button>
        <Button variant="ghost">Secondary</Button>
      </Inline>
    </Stack>
  </Container>
</Section>;
```

`gap` accepts numeric scale (matches `--space-{0..20}` Tailwind 4px scale: 1=4px, 2=8px, 3=12px, 4=16px, 6=24px, 8=32px, 10=40px). `Stack` defaults to vertical, `Inline` to horizontal — flip via `direction` prop if needed but it's almost always cleaner to pick the right component.

Anti-pattern: `<div className="flex flex-col gap-6">` (Tailwind reflex) — use `<Stack gap={6}>`. Anti-pattern: own SCSS `.section { ... padding ... }` — use `<Section py={20}>` for vertical padding.

### E.2 Typography

`Heading` (semantic `level` 1-6 with decoupled visual `size` — same h2 can render display-sized), `Text` (paragraph atom with `variant="body"|"label"|"helper"|"caption"` + `color="primary"|"secondary"|"muted"|"brand"`), `Anchor` (styled `<a>` with `external` indicator, `asChild` for Next.js `<Link>`), `Eyebrow` (small uppercase label above headings), `Mark` (inline `<mark>` highlight with 5 token-driven tones).

```tsx
import { Heading, Text, Anchor, Eyebrow, Mark } from '@bleizlabs/ui';

<Eyebrow tone="brand">New release</Eyebrow>
<Heading level={1} size="display">Big visual heading</Heading>
<Text variant="body" color="secondary">
  Subtitle with embedded <Mark tone="brand">highlighted phrase</Mark>.
</Text>
<Anchor asChild>
  <Link href="/docs">Read the docs</Link>
</Anchor>
```

Decoupling `level` from `size`: `level` is HTML semantics (`<h1>` to `<h6>`), `size` is visual scale (`xs|sm|md|lg|xl|2xl|3xl|display`). Use `<Heading level={2} size="display">` when the page hero needs visual weight without skewing the heading outline.

Anti-pattern: raw `<h1>`, `<h2>`, `<h3>` in `.tsx` — always `<Heading level={N}>`. The lib's `library-first-guard.js` (when wired in OS projects) warns on raw heading tags.

### E.3 Forms

`Form` (compound root: native `<form>` with Constraint Validation API + FormData read), `Field` (label + control + description + messages compound), `Input` (text input with `size="sm"|"md"|"lg"`), `Select` (native dropdown), `Combobox` (single OR multi-select editable listbox per APG), `DatePicker` / `TimeInput` / `DateTimePicker` (in-house Calendar + Intl), `Checkbox`, `RadioGroup`, `Switch`.

```tsx
import { Form, Field, Input, Select, Combobox, Checkbox, Button } from '@bleizlabs/ui';

<Form
  onSubmit={async (data) => {
    await save(data);
  }}
>
  <Field name="email" required>
    <Field.Label>Email</Field.Label>
    <Input type="email" placeholder="you@example.com" />
    <Field.Description>We'll never share it.</Field.Description>
    <Field.Message match="typeMismatch">Invalid email format</Field.Message>
    <Field.Message match="valueMissing">Email is required</Field.Message>
  </Field>

  <Field name="role">
    <Field.Label>Role</Field.Label>
    <Combobox
      items={[
        { value: 'admin', label: 'Admin' },
        { value: 'editor', label: 'Editor' },
      ]}
    />
  </Field>

  <Field name="terms">
    <Checkbox required>I accept the terms</Checkbox>
  </Field>

  <Button type="submit">Submit</Button>
</Form>;
```

`<Form>` reads via FormData on submit — no manual `useState` per field. `<Field.Message match="...">` maps to native ValidityState keys (`valueMissing`, `typeMismatch`, `tooShort`, `patternMismatch`, etc.) plus custom validators. The `<Field>` compound handles label association, aria-describedby, and aria-invalid wiring automatically.

Anti-pattern: `const [email, setEmail] = useState('')` for every field, manual `onChange`, then `JSON.stringify({ email })` on submit. Use the `<Form>` + `<Field>` compound and let FormData do its job. Anti-pattern: custom datepicker library — `<DateTimePicker>` covers single instant, `<DateRangePicker>` covers range, both with full keyboard nav per APG.

### E.4 Display

`Card` (surface container compound: Card + CardHeader + CardBody + CardFooter, named regions on one concept), `Badge` (status indicator with `color="brand"|"success"|"warning"|"danger"|"info"|"neutral"`), `Avatar` (image with initials fallback + `AvatarGroup` for overlapping stacks), `KpiValue` (typographic number with optional delta + unit), `Reveal` (scroll-triggered IntersectionObserver gate — children animate in on viewport entry), `Separator` (horizontal or vertical rule), `Skeleton` (loading placeholder), `Spinner`, `Table` (semantic table primitive with subcomponents), `CodeBlock` (structural `<pre><code>` shell — consumer pre-tokenizes via Shiki/Prism).

```tsx
import { Card, CardHeader, CardBody, Heading, Text, Badge, KpiValue, Avatar } from '@bleizlabs/ui';

<Card padding={5} radius="lg">
  <CardHeader>
    <Inline gap={3} align="center">
      <Avatar src="/u/123.jpg" name="Jan Kowalski" />
      <Heading level={3}>Active project</Heading>
      <Badge color="success">In progress</Badge>
    </Inline>
  </CardHeader>
  <CardBody>
    <KpiValue value={42} unit="tasks" delta={+12} deltaTone="positive" />
    <Text color="secondary">12 added this week</Text>
  </CardBody>
</Card>;
```

`Card` is a surface, not a styled organism — projects compose `<Card>` + atoms into project-specific organisms like `<ProjectCard project={data}>`. The lib does not ship preset `<StatsCard>` / `<ActionCard>` / `<IconHeaderCard>` — those were deprecated in 0.16.0 in favor of consumer composition.

Anti-pattern: local `<StatsCard kpi={...} delta={...}>` molecule shadowing — Card + KpiValue + Text composed inline in a `_sections/...` is the right shape.

### E.5 Feedback

`Toast` family (imperative `toast.success(...)`, `toast.error(...)`, `toast.info(...)` via singleton `Toaster` portal mounted once in root layout), `Alert` (inline status block with variants + optional dismiss action), `Banner` (full-bleed top-of-page announcement), `Empty` (empty-state slot: icon + heading + description + action), `Progress` (linear or radial progress indicator).

```tsx
// app/layout.tsx — mount once
import { Toaster } from '@bleizlabs/ui';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

// anywhere in app — call imperatively
import { toast } from '@bleizlabs/ui';
await save();
toast.success('Saved');
```

`Toast` is intentionally NOT a context-driven component — singleton imperative API bypasses React Context per zero-dep architecture. `toast(...)` callable from React tree, event handlers, module scope, server actions (after redirect to client). Anti-pattern: re-implementing toast with your own context provider — the lib's singleton survives across HMR and outlives any component tree.

### E.6 Overlays

`Dialog` (modal compound: Trigger + Content + Title + Description + Close + Cancel/Confirm action), `Sheet` (side-anchored Dialog variant — top/right/bottom/left), `Drawer` (mobile bottom-sheet style with snap points), `Popover` (anchored floating panel — non-modal), `Tooltip` (small hover/focus-only popover for short labels), `HoverCard` (rich preview on hover), `DropdownMenu` (anchored menu with `Item`/`CheckboxItem`/`RadioItem`/`Sub` sub-parts), `ContextMenu` (right-click variant), `AlertDialog` (modal confirmation with destructive-action-friendly defaults).

```tsx
import { Dialog } from '@bleizlabs/ui';

<Dialog>
  <Dialog.Trigger asChild>
    <Button>Open</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Confirm action</Dialog.Title>
    <Dialog.Description>This cannot be undone.</Dialog.Description>
    <Inline gap={3} justify="end">
      <Dialog.Cancel asChild>
        <Button variant="ghost">Cancel</Button>
      </Dialog.Cancel>
      <Dialog.Confirm asChild>
        <Button variant="danger" onClick={handleDelete}>
          Delete
        </Button>
      </Dialog.Confirm>
    </Inline>
  </Dialog.Content>
</Dialog>;
```

All overlay primitives use the same in-house `useFloating` + `computePosition` engine + `useFocusTrap` + dismiss helper. Hydration is mount-gated (see D.4) — no SSR warnings.

Anti-pattern: external focus-trap or floating-UI library — already in-house. Anti-pattern: rendering `<Dialog>` content conditionally outside the trigger compound (`{open && <Dialog>...</Dialog>}`) — let the compound own its `open` state, or use the controlled `open` + `onOpenChange` props.

### E.7 Complex / Data

`DataTable` (generic-data grid with sort + filter + pagination + selection + expansion + APG `/grid/` keyboard nav), `Tabs` (compound: TabList + Tab + TabPanel), `Accordion` (single disclosure panel; group single/multi expansion modes via `AccordionGroup`), `Stepper` (multi-step wizard with progress + validation per step), `Sidebar` (chrome navigation rail with collapsible state), `NavigationMenu` (top-level multi-level nav), `Toolbar` (action button group with roving tabindex).

```tsx
import { DataTable } from '@bleizlabs/ui';

<DataTable
  data={projects}
  columns={[
    { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true },
    { id: 'client', header: 'Client', accessor: (row) => row.client.name, sortable: true },
    {
      id: 'stage',
      header: 'Stage',
      cell: (row) => <Badge color={stageColor(row.stage)}>{row.stage}</Badge>,
    },
  ]}
  pagination={{ pageSize: 20 }}
  selection={{ mode: 'multiple' }}
/>;
```

`DataTable` is a **generic-data** primitive — accepts any row shape, columns are configured. It's NOT a business-domain organism (`<ProjectsTable>` lives in your project, composing `<DataTable>` with project-specific columns). For >500 rows, pair with `@tanstack/virtual` for windowing.

Anti-pattern: bringing TanStack Table, ag-Grid, or MUI DataGrid — `<DataTable>` covers the lib's grid story end-to-end with zero external deps.

### E.8 Specialized + Navigation

`Breadcrumb` (hierarchical path with `items: BreadcrumbItem[]` — generic-data shape `{ label, href? }`), `Pagination` (page-by-page or numbered with prev/next), `ThemeToggle` (light/dark switch with system option), `Timeline` (vertical time-ordered list with `items: TimelineItem[]`), `Kbd` (`<kbd>` styled atom for keyboard shortcut display), `Chip` (pill-shaped filter chip — toggle by default via `pressed`/`onPressedChange`, or `interactive={false}` display mode; NOT removable — for removable tags see `TagsInput`/`FileChip`), plus small data-viz atoms: `AnimatedCounter` (animated number transition), `MetricBar` (single-axis bar gauge), `UsageDonut` (percentage donut), `AvailabilityBar` (capacity bar with thresholds).

```tsx
import { Breadcrumb, Pagination, Timeline, Kbd, Chip } from '@bleizlabs/ui';

<Breadcrumb items={[
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: project.name }, // last item — no href = current page
]} />

<Pagination
  page={page}
  pageCount={totalPages}
  onPageChange={setPage}
  siblingCount={1}
/>

<Timeline items={events.map(e => ({
  id: e.id,
  time: e.createdAt,
  title: e.title,
  description: e.description,
}))} />

<Text>Press <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd> to open command palette.</Text>

<Inline gap={2} wrap>
  {tags.map(t => (
    <Chip key={t} pressed={active.includes(t)} onPressedChange={() => toggleTag(t)}>
      {t}
    </Chip>
  ))}
</Inline>
```

These small primitives close common dashboard / panel / marketing-site patterns. They're easy to overlook — agents often reach for "just make a small `<KeyboardShortcut>` molecule" without checking that `<Kbd>` exists. Section J inventory is the authoritative list.

### E.9 Charts

`LineChart`, `AreaChart`, `BarChart`, `PieChart`, `Sparkline` — five SVG-based chart primitives sharing an internal `_shared/chart-math` module. Zero external chart dependencies. Suitable for dashboards with **≤500 data points per series**.

```tsx
import { LineChart } from '@bleizlabs/ui';

<LineChart data={metrics} xKey="date" yKey="value" height={240} showGrid showTooltip />;
```

For **>500 points** (high-frequency time series, scatter plots with thousands of marks, 3D viz, real-time streaming): bring D3 directly or use Recharts/Chart.js. The lib's charts are for typical dashboard cards, not analytics products.

Anti-pattern: importing Recharts / Chart.js / Victory for a 50-point trend line. Anti-pattern: building a custom `<TrendArrow>` molecule when `<Sparkline>` + `<KpiValue delta={...}>` cover the typical KPI tile pattern.

---

## F. Anti-patterns + situational appendix

Fixed anti-patterns (mirrored in `AGENTS.md`), expanded with fix recipes:

1. **Raw `<button>` / `<input>` / `<h1-6>` in `.tsx`** → always import the lib atom. `library-first-guard.js` (OS hook) warns on raw atoms in `@bleizlabs/ui`-consumer projects.

2. **Local atom shadowing** (`function Card({ ... }) { return <div className={s.card}>... }`) → use `import { Card } from '@bleizlabs/ui'`. If you need a project-specific Card variant, compose `<Card className={s.projectCard}>` instead of forking.

3. **`!important` overrides in `.scss` modules** → component variant or `className` passthrough. `!important` blocks consumer overrides + breaks token cascade.

4. **`<DateTimePicker>` value treated as ISO string in display contexts** → the `value` prop accepts ISO (`2026-05-13T14:30`), but the displayed combobox input shows `2026-05-13 14:30` (human format). Don't `JSON.stringify` the displayed value for transport — read the `name`-attached hidden input or onChange-emitted ISO instead.

5. **`'use client'` on page when only one leaf needs it** → push the directive deep. A button group is client; the page that hosts it stays server.

6. **Building local equivalents of lib molecules** (`<BackLink>`, `<Chip>`, `<DataRow>`, `<Timeline>`, `<IconButton>`) → check Section J inventory. Lib likely has it.

7. **Mirror SCSS across 2+ consumer files** → extract shared molecule per Q3. Phase 7.1 audit (OS) flags byte-for-byte mirror SCSS as CRITICAL.

8. **`useState` + `onChange` per form field** → `<Form>` + `<Field>` reads FormData natively. The whole `useState` orchestra goes away.

9. **Per-component scrollbar styling** → `@use '@bleizlabs/ui/styles/scrollbar';` in `app/globals.scss` once. Covers the whole app.

10. **External chart libs (Recharts / Chart.js / D3) for typical dashboard charts** → lib ships 5 charts. Only reach external for >500 points or specialized viz.

11. **`<Button asChild><Link href>` for navigation** → `<Button href="...">` — renders an `<a>`, stays server-safe. `asChild` pulls the Slot primitive's `'use client'` boundary into the tree for zero benefit when a dedicated `href` prop exists. Reserve `asChild` for elements without a dedicated prop (see §C.2).

### Situational anti-patterns (appendix)

- **Wrapping `<Toaster>` in a custom React Context** — `toast()` is imperative singleton; Context is wrong layer.
- **Re-implementing `asChild` with `cloneElement`** — use the lib's `Slot` atom (handles className merging + ref forwarding correctly).
- **Forking lib SCSS to change a single color** — override `--color-brand` (semantic) or `$seed-brand` (deep) at the `app/globals.scss` entry point.
- **Building a `<Modal>` wrapper around `<Dialog>` "to simplify the API"** — lib's `<Dialog>` IS the simple API. Adding a wrapper hides the `Trigger` + `Content` + `Title` semantic structure.
- **Adding `aria-label` to a Field's label text** — `<Field.Label>` already wires aria-labelledby. Adding aria-label duplicates.

---

## G. Deliberate omissions + external pairings

Things the lib intentionally does NOT ship. Bring these externally if you need them:

| Concern                                                | Recommended external                              | Why lib doesn't ship                                                   |
| ------------------------------------------------------ | ------------------------------------------------- | ---------------------------------------------------------------------- |
| Drag and drop                                          | `dnd-kit`                                         | Vast scope, headless preference, lib stays UI-primitive focused        |
| Rich text editor                                       | `lexical` or `tiptap`                             | Editor is a product, not a primitive                                   |
| Advanced calendar / planning widgets beyond DatePicker | `fullcalendar`                                    | Domain-specific app, not a primitive                                   |
| 3D / advanced viz beyond 5 chart primitives            | `d3` direct                                       | Too domain-specific for a universal library                            |
| Tree view (file explorer / nested hierarchy)           | No recommendation yet                             | Borderline; check CHANGELOG for current status                         |
| Color picker                                           | Bring your own                                    | Niche, app-specific                                                    |
| Virtualized list / large grid (>500 rows)              | `@tanstack/virtual` paired with `<DataTable>`     | Virtualization concern orthogonal to grid primitive                    |
| Animation library beyond `<Reveal>`                    | `framer-motion` if you need complex orchestration | `<Reveal>` covers scroll-trigger; complex animation is consumer choice |

If you're working on a feature that genuinely needs one of the above, install the external lib directly. The cheat-sheet's job is to keep you from re-inventing what the lib ships, not to stop you from using the rest of the ecosystem.

---

## H. Quick-reference card

Top-20 reached patterns, one-liner each:

| Want                          | Use                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------- | ----------- | ---------------- | ---- | ----- | ---------- |
| Vertical layout               | `<Stack gap={N}>`                                                                                 |
| Horizontal layout             | `<Inline gap={N}>`                                                                                |
| Page width constraint         | `<Container size="lg">`                                                                           |
| Section landmark              | `<Section tag="section" aria-labelledby="...">`                                                   |
| Headings                      | `<Heading level={N} size="...">` (level = semantics, size = visual)                               |
| Body text                     | `<Text variant="body" color="secondary">`                                                         |
| Inline link                   | `<Anchor href="...">` or `<Anchor asChild><Link href="..." /></Anchor>`                           |
| Button                        | `<Button variant="primary                                                                         | ghost       | danger" size="sm | md   | lg">` |
| Button as link                | `<Button href="...">` — renders `<a>`, server-safe; NOT `asChild`+`<Link>` (pulls `'use client'`) |
| Polymorphic render            | `<Component asChild><CustomElement /></Component>`                                                |
| Surface container             | `<Card padding={N} radius="md                                                                     | lg          | xl">`            |
| Status indicator              | `<Badge color="success                                                                            | warning     | danger           | info | brand | neutral">` |
| Avatar with initials fallback | `<Avatar src="..." name="..." />`                                                                 |
| Imperative notification       | `toast.success('...')` (after `<Toaster>` mounted once)                                           |
| Modal                         | `<Dialog><Dialog.Trigger /><Dialog.Content>...</Dialog.Content></Dialog>`                         |
| Side panel                    | `<Sheet side="right">`                                                                            |
| Tooltip on hover              | `<Tooltip content="..."><Button>...</Button></Tooltip>`                                           |
| Form with native validation   | `<Form><Field name="..."><Field.Label /><Input /><Field.Message match="..." /></Field></Form>`    |
| Data grid                     | `<DataTable data={...} columns={[...]} pagination={{...}} />`                                     |
| Reveal on scroll              | `<Reveal tag="section">...</Reveal>`                                                              |
| Loading skeleton              | `<Skeleton height={N} width={N                                                                    | "100%"} />` |

---

## I. Troubleshooting

Common failure modes + fixes:

| Symptom                                                      | Cause                                                                                      | Fix                                                                                                                                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Error: Slot expects a single React element child`           | `asChild` got multiple children, a Fragment with multiple elements, or a string-only child | Wrap in a single element, e.g. `<Card asChild><article>...</article></Card>`. One child only. (Button links never need `asChild` — use `<Button href>`.)            |
| Hydration mismatch warning on `<DateTimePicker>`             | Server-rendered date format ≠ client locale                                                | Pass `value` as ISO string; let the lib's Intl format on client. Avoid local `new Date()` derivations during render.                                                |
| Token override not cascading                                 | Override placed in `:root` of a CSS module (scoped) instead of `app/globals.scss` (global) | Move to `app/globals.scss` — semantic token overrides belong global.                                                                                                |
| `<Field.Message match="...">` never shows                    | `match` key doesn't match the actual ValidityState property                                | Use exact `valueMissing` / `typeMismatch` / `tooShort` / `patternMismatch` / `rangeOverflow` / `rangeUnderflow` / `stepMismatch` / `badInput` / `customError` keys. |
| `'use client' must be the first directive` build error       | `'use client'` placed after imports or comments not stripped first                         | Move directive to line 1 of the file. Block comments before are OK; imports must come after.                                                                        |
| Phase 7.1 mirror-SCSS warning                                | Same `.module.scss` rules in 2+ consumer files                                             | Extract shared component to `app/_components/shared/<layer>/<Name>/` per Q3.                                                                                        |
| `library-first-guard` warning on Edit                        | Raw `<button>` / `<input>` / `<h1-6>` / local atom shadowing in `.tsx`                     | Import the lib atom. To suppress for a specific line (rare, justified case): `// @library-first-skip` comment above the raw element.                                |
| `scss-important-guard` warning                               | `!important` in `.module.scss` without justification                                       | Refactor to component variant or `className` passthrough. If genuinely necessary: `// @important-ok: <reason>` comment on the same line.                            |
| `<Anchor asChild>` + Next.js `<Link>` + typedRoutes TS error | `<Link href>` is union-typed when `typedRoutes: true`; Anchor's `href` is `string`         | Drop `href` from `<Anchor>` and let `<Link href>` provide it: `<Anchor asChild><Link href="/dashboard">...</Link></Anchor>`                                         |
| Toast appears server-side then re-renders                    | `toast(...)` called during render instead of in effect / event handler                     | `toast` is imperative — call in `useEffect`, event handler, or after `await` inside an action. Never in render.                                                     |

When stuck: read the component's JSDoc directly (`node_modules/@bleizlabs/ui/components/<category>/<Name>/<Name>.tsx`). The JSDoc is the canonical per-prop reference.

---

## J. Component inventory

The full list of every component family in `manifest.json`. Auto-generated by `scripts/build-agent-inventory.mjs` — manual edits will be overwritten on next regeneration. Sort: by category, then alphabetical by family name within category.

Column meanings:

- **Component** — family name (the primary import).
- **Category** — `manifest.json` category enum (display/feedback/interactive/layout/molecules/presets/specialized/typography/complex).
- **Client?** — `yes` = family's primary file carries `'use client'` directive (component needs client runtime). `no` = renders as Server Component by default.
- **Import** — copy-paste import statement.
- **One-line summary** — first JSDoc sentence (≤120 chars), truncated with `…` if longer.

For utilities (Slot / cn / mergeRefs / VisuallyHidden) and type-only exports not listed here, read the source under `node_modules/@bleizlabs/ui/components/utils/` and `components/types/` respectively.

<!-- INVENTORY:START — auto-generated by scripts/build-agent-inventory.mjs. Do not edit by hand. -->
<!-- Generated from components/manifest.json at lib version 0.26.0. Component count: 106. -->

| Component         | Category    | Client? | Import                                            | One-line summary                                                                                                        |
| ----------------- | ----------- | ------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Container`       | layout      | no      | `import { Container } from '@bleizlabs/ui'`       | Container — max-width centered wrapper layout atom.                                                                     |
| `GridLayout`      | layout      | no      | `import { GridLayout } from '@bleizlabs/ui'`      | GridLayout — multi-column CSS Grid layout atom.                                                                         |
| `Inline`          | layout      | no      | `import { Inline } from '@bleizlabs/ui'`          | Inline — horizontal flex layout atom.                                                                                   |
| `Section`         | layout      | no      | `import { Section } from '@bleizlabs/ui'`         | Section — full-width semantic band layout atom.                                                                         |
| `Stack`           | layout      | no      | `import { Stack } from '@bleizlabs/ui'`           | Stack — vertical flex layout atom.                                                                                      |
| `Anchor`          | typography  | no      | `import { Anchor } from '@bleizlabs/ui'`          | Anchor — inline body-text link atom (v0.4.0).                                                                           |
| `Eyebrow`         | typography  | no      | `import { Eyebrow } from '@bleizlabs/ui'`         | Eyebrow — small uppercase atelier label with optional numeric prefix.                                                   |
| `Heading`         | typography  | no      | `import { Heading } from '@bleizlabs/ui'`         | Heading — semantic heading element with decoupled visual size.                                                          |
| `Mark`            | typography  | no      | `import { Mark } from '@bleizlabs/ui'`            | Mark — inline highlight atom.                                                                                           |
| `Text`            | typography  | no      | `import { Text } from '@bleizlabs/ui'`            | Text — universal body text component.                                                                                   |
| `AspectRatio`     | display     | no      | `import { AspectRatio } from '@bleizlabs/ui'`     | AspectRatio — media container with fixed aspect ratio (Phase 3 D8, Tier B).                                             |
| `Avatar`          | display     | no      | `import { Avatar } from '@bleizlabs/ui'`          | Avatar — user identity image with text-initials fallback (Phase 3 D5).                                                  |
| `Badge`           | display     | no      | `import { Badge } from '@bleizlabs/ui'`           | Badge — small status / category indicator (klocek atom).                                                                |
| `Card`            | display     | no      | `import { Card } from '@bleizlabs/ui'`            | Card — surface container atom (klocek display primitive).                                                               |
| `CodeBlock`       | display     | yes     | `import { CodeBlock } from '@bleizlabs/ui'`       | CodeBlock — preformatted code surface with optional language badge, copy button, and line-number gutter.                |
| `EdgeBar`         | display     | no      | `import { EdgeBar } from '@bleizlabs/ui'`         | EdgeBar — absolute-positioned colored stripe along one edge of a `position: relative` parent.                           |
| `IconBox`         | display     | no      | `import { IconBox } from '@bleizlabs/ui'`         | IconBox — square icon container with bg + color variants (Phase 3 D4).                                                  |
| `KpiValue`        | display     | no      | `import { KpiValue } from '@bleizlabs/ui'`        | KpiValue — universal large-number metric display molecule (Server Component since v0.7.0; merged with PercentValue…     |
| `Reveal`          | display     | yes     | `import { Reveal } from '@bleizlabs/ui'`          | Reveal — scroll-triggered IntersectionObserver gate atom (Phase 3 D9, Tier B).                                          |
| `Separator`       | display     | no      | `import { Separator } from '@bleizlabs/ui'`       | Separator — divider line atom (Phase 3 D3, ex Divider per D24 rename).                                                  |
| `Skeleton`        | display     | no      | `import { Skeleton } from '@bleizlabs/ui'`        | Skeleton — loading placeholder atom (Phase 3 D6).                                                                       |
| `Spinner`         | display     | no      | `import { Spinner } from '@bleizlabs/ui'`         | Spinner — inline loading indicator (Phase 3 D7).                                                                        |
| `Table`           | display     | no      | `import { Table } from '@bleizlabs/ui'`           | Table — semantic `<table>` primitive with base styling (Phase 11 CI23).                                                 |
| `Accordion`       | interactive | yes     | `import { Accordion } from '@bleizlabs/ui'`       | Accordion — disclosure panel with header trigger (Phase 4 I9).                                                          |
| `Button`          | interactive | no      | `import { Button } from '@bleizlabs/ui'`          | Button — primary interactive atom (Phase 4 I1).                                                                         |
| `ButtonGroup`     | interactive | no      | `import { ButtonGroup } from '@bleizlabs/ui'`     | ButtonGroup — joined row/column of related buttons (Phase 4 I1.5).                                                      |
| `Checkbox`        | interactive | yes     | `import { Checkbox } from '@bleizlabs/ui'`        | Checkbox — boolean form input with custom styling (Phase 4 I4).                                                         |
| `Input`           | interactive | no      | `import { Input } from '@bleizlabs/ui'`           | Input — headless styled `<input>` wrapper (klocek atom, paradigm 1).                                                    |
| `InputGroup`      | interactive | no      | `import { InputGroup } from '@bleizlabs/ui'`      | InputGroup — multi-element form widget container (Phase 4 expansion E08, Layer 2 of D26).                               |
| `Label`           | interactive | no      | `import { Label } from '@bleizlabs/ui'`           | Label — form-coupled label element (Phase 4 I2.5, moved from Phase 2 in E05).                                           |
| `MaskedInput`     | interactive | yes     | `import { MaskedInput } from '@bleizlabs/ui'`     | MaskedInput — pattern-masked text input (Phase 4 expansion E08, Layer 3 of D26).                                        |
| `NumberInput`     | interactive | yes     | `import { NumberInput } from '@bleizlabs/ui'`     | NumberInput — locale-aware numeric form input (Phase 4 expansion E08, Layer 3 of D26).                                  |
| `PasswordInput`   | interactive | yes     | `import { PasswordInput } from '@bleizlabs/ui'`   | PasswordInput — password form input with show/hide toggle and optional strength meter (Phase 4 expansion E08, Layer 3…  |
| `PhoneInput`      | interactive | yes     | `import { PhoneInput } from '@bleizlabs/ui'`      | PhoneInput — telephone number input with mask presets (Phase 4 expansion E08, Layer 3 of D26).                          |
| `RadioGroup`      | interactive | yes     | `import { RadioGroup } from '@bleizlabs/ui'`      | RadioGroup — radio button group with shared name + value (Phase 4 I5).                                                  |
| `Rating`          | interactive | yes     | `import { Rating } from '@bleizlabs/ui'`          | Rating — APG radiogroup star-rating input primitive.                                                                    |
| `Switch`          | interactive | yes     | `import { Switch } from '@bleizlabs/ui'`          | Switch — boolean toggle with animated thumb (Phase 4 I8, Tier A).                                                       |
| `TagsInput`       | interactive | yes     | `import { TagsInput } from '@bleizlabs/ui'`       | TagsInput — freeform tag input (E01.2 of 0.19.0 Forms expansion).                                                       |
| `Textarea`        | interactive | yes     | `import { Textarea } from '@bleizlabs/ui'`        | Textarea — multi-line text form input (Phase 4 I3).                                                                     |
| `TextLink`        | interactive | no      | `import { TextLink } from '@bleizlabs/ui'`        | TextLink — inline atelier link atom (v0.4.2).                                                                           |
| `TimeInput`       | interactive | yes     | `import { TimeInput } from '@bleizlabs/ui'`       | TimeInput — accessible 24h ISO time field rendered as a `role="group"` of `role="spinbutton"` inputs (hours, minutes,…  |
| `Toggle`          | interactive | yes     | `import { Toggle } from '@bleizlabs/ui'`          | Toggle — single button with on/off state (Phase 4 I6).                                                                  |
| `ToggleGroup`     | interactive | yes     | `import { ToggleGroup } from '@bleizlabs/ui'`     | ToggleGroup — group of Toggle children with single or multiple selection (Phase 4 I7).                                  |
| `Alert`           | feedback    | no      | `import { Alert } from '@bleizlabs/ui'`           | Alert — semantic feedback notification with 4 variants (klocek atom).                                                   |
| `Banner`          | feedback    | no      | `import { Banner } from '@bleizlabs/ui'`          | Banner — page-wide notification primitive.                                                                              |
| `Empty`           | feedback    | no      | `import { Empty } from '@bleizlabs/ui'`           | Empty — placeholder for empty lists / zero-result screens (klocek atom).                                                |
| `Progress`        | feedback    | no      | `import { Progress } from '@bleizlabs/ui'`        | Progress — step indicator OR percent progress bar.                                                                      |
| `AnimatedCounter` | specialized | yes     | `import { AnimatedCounter } from '@bleizlabs/ui'` | AnimatedCounter — count-up animation from 0 to a target value (Phase 6 P3).                                             |
| `AreaChart`       | specialized | yes     | `import { AreaChart } from '@bleizlabs/ui'`       | AreaChart — multi-series SVG area chart (line + filled region below) with crosshair tooltip + keyboard data-point…      |
| `AvailabilityBar` | specialized | no      | `import { AvailabilityBar } from '@bleizlabs/ui'` | AvailabilityBar — day-by-day status strip (Phase 6 P7, Tier B, server-safe).                                            |
| `BarChart`        | specialized | no      | `import { BarChart } from '@bleizlabs/ui'`        | BarChart — universal single-series bar chart (Phase 6 P9, Tier B, server-safe).                                         |
| `Breadcrumb`      | specialized | no      | `import { Breadcrumb } from '@bleizlabs/ui'`      | Breadcrumb — semantic navigation trail (Phase 6 P4, tier A, server-safe).                                               |
| `Dot`             | specialized | no      | `import { Dot } from '@bleizlabs/ui'`             | Dot — small round status indicator (Phase 6 P1, core, server-safe).                                                     |
| `Kbd`             | specialized | no      | `import { Kbd } from '@bleizlabs/ui'`             | Kbd — keyboard shortcut key display (Phase 6 P8, Tier B, server-safe).                                                  |
| `LineChart`       | specialized | yes     | `import { LineChart } from '@bleizlabs/ui'`       | LineChart — multi-series SVG line chart with crosshair tooltip + keyboard data-point navigation + sr-only `<table>`…    |
| `MetricBar`       | specialized | no      | `import { MetricBar } from '@bleizlabs/ui'`       | MetricBar — usage / capacity progress indicator (Phase 6 P2, core, server-safe).                                        |
| `Pagination`      | specialized | yes     | `import { Pagination } from '@bleizlabs/ui'`      | Pagination — page navigation control (Phase 6 P5, tier A, `'use client'`).                                              |
| `PieChart`        | specialized | yes     | `import { PieChart } from '@bleizlabs/ui'`        | PieChart — SVG pie chart with optional donut variant, segment hover + keyboard navigation, segment percentage labels,…  |
| `Sparkline`       | specialized | yes     | `import { Sparkline } from '@bleizlabs/ui'`       | Sparkline — tiny inline single-series chart (line + optional filled area) for embedding in `<Card>`, table cells, KPI…  |
| `ThemeToggle`     | specialized | yes     | `import { ThemeToggle } from '@bleizlabs/ui'`     | ThemeToggle — single-button light/dark theme switcher (Phase 6 Specialized).                                            |
| `UsageDonut`      | specialized | no      | `import { UsageDonut } from '@bleizlabs/ui'`      | UsageDonut — multi-segment SVG donut chart (Phase 6 P6, Tier B, server-safe).                                           |
| `AccordionGroup`  | molecules   | yes     | `import { AccordionGroup } from '@bleizlabs/ui'`  | AccordionGroup — FAQ-style wrapper for multiple Accordion panels (Phase 7 M4).                                          |
| `AvatarGroup`     | molecules   | no      | `import { AvatarGroup } from '@bleizlabs/ui'`     | AvatarGroup — stacked-avatar molecule with overflow chip.                                                               |
| `BackLink`        | molecules   | no      | `import { BackLink } from '@bleizlabs/ui'`        | BackLink — "back to previous view" navigation molecule (Phase 7 M2).                                                    |
| `BreakdownList`   | molecules   | no      | `import { BreakdownList } from '@bleizlabs/ui'`   | BreakdownList — universal labeled progress list (compound molecule).                                                    |
| `Chip`            | molecules   | yes     | `import { Chip } from '@bleizlabs/ui'`            | Chip — pill-shaped filter chip with toggle (default) or display-only mode.                                              |
| `DataRow`         | molecules   | no      | `import { DataRow } from '@bleizlabs/ui'`         | DataRow — label/value pair molecule (Phase 7 M1, server-safe).                                                          |
| `FileChip`        | molecules   | no      | `import { FileChip } from '@bleizlabs/ui'`        | FileChip — file attachment chip (Phase 5 M7).                                                                           |
| `Header`          | molecules   | no      | `import { Header } from '@bleizlabs/ui'`          | Header — universal block-header molecule.                                                                               |
| `IconButton`      | molecules   | no      | `import { IconButton } from '@bleizlabs/ui'`      | IconButton — accessibility-enforcing wrapper over `Button` with `iconOnly={true}`.                                      |
| `MetricTile`      | molecules   | no      | `import { MetricTile } from '@bleizlabs/ui'`      | MetricTile — universal metric tile molecule (label + value + optional icon + optional description).                     |
| `SectionDivider`  | molecules   | no      | `import { SectionDivider } from '@bleizlabs/ui'`  | SectionDivider — labeled visual section break (Phase 7 M3, server-safe).                                                |
| `Timeline`        | molecules   | no      | `import { Timeline } from '@bleizlabs/ui'`        | Timeline — chronological event-list molecule (compound: Timeline + TimelineItem + TimelineMarker, flat exports).        |
| `FormSurface`     | presets     | no      | `import { FormSurface } from '@bleizlabs/ui'`     | FormSurface — semantic `<form>` wrapper around a Card surface (klocek).                                                 |
| `AlertDialog`     | complex     | yes     | `import { AlertDialog } from '@bleizlabs/ui'`     | AlertDialog — modal alert dialog composing portal + overlay + focus-trapped content (Phase 10 CI2, E16).                |
| `Calendar`        | complex     | yes     | `import { Calendar } from '@bleizlabs/ui'`        | Calendar — accessible single-date calendar grid per WAI-ARIA APG `/grid/`.                                              |
| `Carousel`        | complex     | yes     | `import { Carousel } from '@bleizlabs/ui'`        | Carousel — accessible auto-rotating content slider (Phase 10 CI21).                                                     |
| `Collapsible`     | complex     | yes     | `import { Collapsible } from '@bleizlabs/ui'`     | Collapsible — APG `disclosure` compound for single-panel show/hide.                                                     |
| `Combobox`        | complex     | yes     | `import { Combobox } from '@bleizlabs/ui'`        | Combobox — editable single-OR-multi-select form field per WAI-ARIA APG /combobox/ (editable listbox variant) +…         |
| `Command`         | complex     | yes     | `import { Command } from '@bleizlabs/ui'`         | Command — Cmd+K / Ctrl+K command palette (Phase 10 CI19).                                                               |
| `ContextMenu`     | complex     | yes     | `import { ContextMenu } from '@bleizlabs/ui'`     | ContextMenu — right-click menu triggered by a `contextmenu` event.                                                      |
| `DataTable`       | complex     | yes     | `import { DataTable } from '@bleizlabs/ui'`       | DataTable — generic-data grid primitive z sortowaniem, filtrowaniem, paginacją, selection, expansion + APG `/grid/`…    |
| `DatePicker`      | complex     | yes     | `import { DatePicker } from '@bleizlabs/ui'`      | DatePicker — accessible single-date form field composed of an editable text input + embedded Calendar popup per…        |
| `DateRangePicker` | complex     | yes     | `import { DateRangePicker } from '@bleizlabs/ui'` | DateRangePicker — accessible date-range form field composed of an editable text input + embedded multi-month Calendar…  |
| `DateTimePicker`  | complex     | yes     | `import { DateTimePicker } from '@bleizlabs/ui'`  | DateTimePicker — accessible single-instant form field composed of an editable combobox input + popover containing a…    |
| `Dialog`          | complex     | yes     | `import { Dialog } from '@bleizlabs/ui'`          | Dialog — modal dialog composing portal + overlay + focus-trapped content (Phase 10 CI1, E15, first Complex Interactive… |
| `Drawer`          | complex     | yes     | `import { Drawer } from '@bleizlabs/ui'`          | Drawer — bottom-positioned modal sheet composing portal + overlay + focus-trapped content (Phase 10 CI3, E17).          |
| `DropdownMenu`    | complex     | yes     | `import { DropdownMenu } from '@bleizlabs/ui'`    | DropdownMenu — accessible menu triggered by a button per WAI-ARIA APG /menu/.                                           |
| `Field`           | complex     | yes     | `import { Field } from '@bleizlabs/ui'`           | Field — accessible form-row compound (label + control + description + messages).                                        |
| `FileUpload`      | complex     | yes     | `import { FileUpload } from '@bleizlabs/ui'`      | FileUpload — drop zone + native file input wrapper.                                                                     |
| `Form`            | complex     | yes     | `import { Form } from '@bleizlabs/ui'`            | Form — accessible form root with native Constraint Validation API.                                                      |
| `HoverCard`       | complex     | yes     | `import { HoverCard } from '@bleizlabs/ui'`       | HoverCard — hover-triggered floating surface for rich contextual content.                                               |
| `InputOTP`        | complex     | yes     | `import { InputOTP } from '@bleizlabs/ui'`        | InputOTP — one-time password / verification code entry (Phase 10 CI18).                                                 |
| `NavigationMenu`  | complex     | yes     | `import { NavigationMenu } from '@bleizlabs/ui'`  | NavigationMenu — accessible navigation menubar per WAI-ARIA APG /menubar/.                                              |
| `Popover`         | complex     | yes     | `import { Popover } from '@bleizlabs/ui'`         | Popover — floating panel anchored to a trigger for contextual content.                                                  |
| `ScrollArea`      | complex     | yes     | `import { ScrollArea } from '@bleizlabs/ui'`      | ScrollArea — accessible custom-scrollbar wrapper (Phase 10 CI20).                                                       |
| `Select`          | complex     | yes     | `import { Select } from '@bleizlabs/ui'`          | Select — single-value dropdown form field per WAI-ARIA APG /combobox/ (collapsed listbox, select-only variant) +…       |
| `Sheet`           | complex     | yes     | `import { Sheet } from '@bleizlabs/ui'`           | Sheet — side panel modal sheet composing portal + overlay + focus-trapped content (Phase 10 CI4, E18).                  |
| `Sidebar`         | complex     | yes     | `import { Sidebar } from '@bleizlabs/ui'`         | Sidebar — Phase 10 CI22 FINISHER (80/80 Phase 10 COMPLETE).                                                             |
| `Slider`          | complex     | yes     | `import { Slider } from '@bleizlabs/ui'`          | Slider — accessible single-thumb value selector (Phase 10 CI14).                                                        |
| `Stepper`         | complex     | yes     | `import { Stepper } from '@bleizlabs/ui'`         | Stepper — visual + semantic multi-step progress indicator with optional keyboard navigation when clickable.             |
| `Tabs`            | complex     | yes     | `import { Tabs } from '@bleizlabs/ui'`            | Tabs — accessible tabs widget per WAI-ARIA APG /tabs/.                                                                  |
| `TimePicker`      | complex     | yes     | `import { TimePicker } from '@bleizlabs/ui'`      | TimePicker — accessible time form field composed of an editable text input (`role="combobox"`) + popover with 2-3…      |
| `Toast`           | complex     | yes     | `import { Toaster } from '@bleizlabs/ui'`         | Toaster — singleton notification surface for imperative `toast()` API.                                                  |
| `Toolbar`         | complex     | yes     | `import { Toolbar } from '@bleizlabs/ui'`         | Toolbar — accessible toolbar container per WAI-ARIA APG `/toolbar/`.                                                    |
| `Tooltip`         | complex     | yes     | `import { Tooltip } from '@bleizlabs/ui'`         | Tooltip — modeless floating label shown on hover or keyboard focus.                                                     |

<!-- INVENTORY:END -->
