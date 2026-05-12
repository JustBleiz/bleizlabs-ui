# `@bleizlabs/ui` — Roadmap 0.16 → 1.0

**Status:** DRAFT
**Last updated:** 2026-05-12
**Current version:** 0.20.0 (100 components)

> Funkcjonalne luki biblioteki + kolejność domykania. Bez estymat czasowych — pracujemy etapami.

---

## Filozofia roadmapu

Tylko to, co **zmienia funkcjonalność biblioteki**. Adoption layer (docs site, marketing, external audit, business model) trzymamy poza tym dokumentem.

**Zero external runtime dependencies utrzymane przez cały roadmap.** Każdy nowy komponent budowany na native APIs (File API, HTML5 drag/drop, Date + Intl, SVG, IntersectionObserver). Bez Prism/Shiki, bez dnd-kit, bez date-fns, bez Recharts.

Każda pozycja ma:
- **Why** — co się dziś nie da zrobić bez tego
- **Klocek check** — czy przechodzi charter (R1-R12 + Klocek vs Organism test)
- **Scope** — co wchodzi w v1, co świadomie nie
- **DoD** — kiedy uznajemy że feature jest gotowy

---

## Phasing — co kiedy

```
0.17.0  ✓  DataTable v1                       SHIPPED 2026-05-11 (89 → 89, baseline +1 family)
0.18.0  ✓  Date/Time pack                     SHIPPED 2026-05-12 (89 → 93 families)
0.18.1  ✓  Field re-register loop fix         SHIPPED 2026-05-12 (single-file patch)
0.19.0  ✓  Forms expansion                    SHIPPED 2026-05-12 (93 → 96 — FileUpload, TagsInput, Stepper)
0.20.0  ✓  Charts pack                        SHIPPED 2026-05-12 (96 → 100 — LineChart, AreaChart, Sparkline, PieChart + _shared/chart-math extraction)
0.20.1  →  Demo bug sweep                     [18 bugs found in demo 2026-05-12 — runtime/visual/a11y patches]
0.21.0  →  Polish batch                       [4 quick wins]
0.22.0  →  Housekeeping                       [API freeze prep — bez RC]
0.23.0+ →  Open-ended minor releases          [post-housekeeping nowe potrzeby gdy się ujawnią]
                                              ...
1.0.0   →  ON USER TRIGGER ONLY               [API freeze + stabilization na sygnał użytkownika, nie auto-follow]
```

**Wersjonowanie:** zawsze +1 minor (0.17 → 0.18 → 0.19 → ...). **1.0 NIE jest auto-follow po 0.22** — czekamy na explicit user trigger żeby zrobić cięcie stabilizacyjne. Do tego czasu lecimy 0.x minor by minor, bez deadline'u na 1.0.

**Logika kolejności:**
1. **DataTable pierwszy** — największa funkcjonalna luka, największy lift, fundament list-view apps
2. **Date/Time drugi** — 4 powiązane komponenty współdzielą Calendar + Date utils, naturalny batch
3. **Forms trzeci** — FileUpload, TagsInput, Stepper domykają core form story
4. **Charts czwarte** — dashboard layer po formach
5. **Demo bug sweep (0.20.1)** — 18 bugs found 2026-05-12, sweep przed Polish żeby fresh components nie inheritowały pułapek
6. **Polish piąte** — 4 małe komponenty = szybki release, momentum
7. **Housekeeping szóste** — sprzątanie przed API freeze

Każdy minor możemy przemieszać gdy realny priority się zmieni z internal consumer perspective. Roadmap to kompas, nie GPS.

---

## 0.17.0 — DataTable v1

**Why:** Aktualne `<Table>` jest bare-bones. Każdy produkt z listą danych (panel projects/tickets/services, scout-hub leads, hydroh2 offtakers, leadseeker) hand-rolluje sort/filter/paginate.

**Klocek check:** PASS — generic-data organism. Column defs są **uniwersalną abstrakcją** (parameterized data shape via TypeScript generic `T`), nie biznes-domain. APG `grid` pattern = single behavior contract.

**Scope v1:**
- Deklaratywne column defs (`columns: ColumnDef<T>[]`)
- Sortowanie per-column (header click, `aria-sort`)
- Filtrowanie per-column + global search slot
- Paginacja (integracja z istniejącym `<Pagination>`)
- Row selection (single + multi, checkbox column)
- Expandable rows (slot dla details panel)
- Custom cell rendering (`cell: (row) => ReactNode`)
- Responsive mobile fallback (stacked cards via prop)
- Loading / empty / error states
- Sticky header
- APG `grid` keyboard model (Arrow keys, Home/End, PageUp/Down, Ctrl+Home/End, type-ahead)

**NIE w v1 (defer):**
- Wirtualizacja
- Drag-to-resize / drag-to-reorder columns
- Server-side data fetching helpers
- Inline editing
- Bulk actions toolbar

**Layer:** `complex/DataTable`

**Zero external deps:** Native (Array methods, IntersectionObserver opcjonalny dla sticky header detection)

**Status:** SHIPPED 2026-05-11 (lib code + tests + demo + docs; consumer migrations follow-up).

**DoD:**
- [x] `<DataTable>` ships w `complex/` z pełnym TS API — single + multiple selection (discriminated union), expansion, frozen columns, mobile fallback, RTL via logical CSS properties, density modes, imperative handle, `useDataTableState` power-user hook
- [x] APG grid compliance — axe-core zero violations (DT-A08 + DT-RG20), 11 Playwright suites (keyboard / focus / aria / sort / filter / pagination / selection / expansion / responsive / 12 edge-cases / 20 regression), explicit `role="row"`/`"gridcell"`/`"columnheader"` on every grid descendant
- [x] Demo route — 6 use cases (basic, sortable+filterable, selection+pagination, full-featured z frozen+density+RTL+striped, real-world panel z onRowClick, states empty/loading/error) — exceeded planned 4
- [ ] Co najmniej 2 internal projekty zmigrowane z hand-rolled table — **deferred do follow-up work-unit** (panel/scout-hub/leadseeker swap-outs)

---

## 0.18.0 — Date/Time pack

**Status:** SHIPPED 2026-05-12 (commit `5906bda`, tag `v0.18.0`, PR #42).
93 families on npm. Plan + cycle docs:
`internal/bleizlabs-ui/work/2026-05_0.18-datetime-pack/`.

Cycle outcome:
- [x] E01.0 Calendar AMEND (commit `57b29a3`) — opt-in `cellExtras` +
      `onCellHover` + `onGridMouseLeave` props.
- [x] E01.1 DateRangePicker v1 (commits `62db846` + `78d4969`) — multi-month
      range picker, 58 PASS / 2 skip.
- [x] E01.2 TimeInput v1 (commit `cde15b8`) — bespoke `role="spinbutton"`
      trio per audit C1, 48/48 PASS + 5 time helpers in `utils/date.ts`.
- [x] E01.3 TimePicker v1 (commit `1402632`) — combobox + popover listbox
      columns, step filter, 40/40 PASS.
- [x] E01.4 DateTimePicker v1 (commit `1b63c50`) — Calendar + TimeInput
      compound, 29/30 PASS (1 documented skip).
- [x] Phase 7.1 audit PASS + 2 user-reported runtime bugfixes pre-publish:
      Calendar 1M-px layout explosion (commit `de90497`, CAL-LB01-07
      regression suite) + popover position flicker (commit `a59cde6`,
      FLICK-01-04 regression suite). Forensic patterns persisted to memory
      `bleizlabs/reference_lib_018_forensic_patterns.md`.

## 0.18.1 — Patch: Field re-register loop fix

**Status:** SHIPPED 2026-05-12 (commit `9dbb463`, tag `v0.18.1`, PR #43).
Single-file bugfix — `<Field>` inside `<Form>` no longer triggers
"Maximum update depth exceeded" infinite loop. Root cause: useEffect
dependency on memoized context object instead of stable `useCallback([])`
reference. Regression: `Form.regression.spec.ts` FM-R23. Discovered via
runtime check on `/components/field` after 0.18.0 publish — static gates
(tsc + ESLint + 437 unit specs) all green. Codified post-push verification
rule: `mcp__next-devtools__nextjs_call get_errors` clean state required
before EVERY push on Next.js projects.

**Why:** Aktualnie `<DatePicker>` = single date only. Brak zakresu dat (analytics, booking, reporty), brak czasu (scheduling, deadlines), brak combined date+time. 4 powiązane komponenty naturalnie batchują się w jeden release bo współdzielą Calendar + Intl + Date utils.

### 0.18.1 DateRangePicker

**Klocek check:** PASS — single concept (date range), data-shape neutral (`{from: Date | null, to: Date | null}` — universal abstraction).

**Scope:**
- Range selection w popover (reuses internal Calendar)
- Hover preview (range highlight on hover)
- Range validation (`from ≤ to`, optional `min`/`max`/`disabledDates`)
- Keyboard nav (selection start → selection end pattern)
- Locale-aware (z `Intl.DateTimeFormat`)
- Two-month side-by-side variant (opcjonalne, dla wider popups)

**Layer:** `complex/DateRangePicker`

### 0.18.2 TimeInput

**Klocek check:** PASS — inline structure (HH:MM(:SS) spinner trio), no popup overhead.

**Scope:**
- Hour + Minute spinner inputs (composes NumberInput internally)
- Optional seconds (`withSeconds` prop)
- 12h/24h format variant (`hourCycle: '12h' | '24h'`)
- AM/PM toggle (12h mode)
- Keyboard nav (Tab between fields, Arrow Up/Down increments)

**Layer:** `interactive/TimeInput`

### 0.18.3 TimePicker

**Klocek check:** PASS — popover variant (komplementarny do TimeInput).

**Scope:**
- Popover z hour/minute scrollable lists (macOS-style)
- Reuses Popover + floating logic from existing components
- Format consistency z TimeInput

**Layer:** `complex/TimePicker`

### 0.18.4 DateTimePicker

**Klocek check:** PASS — composes Calendar + TimeInput w jeden popover.

**Scope:**
- Single popover łączący datę + czas
- Reuses Calendar from DatePicker + TimeInput inline
- Output type: `Date` z time component
- Min/max constraints obejmujące both date and time

**Layer:** `complex/DateTimePicker`

**Zero external deps:** Native Date + Intl.DateTimeFormat (jak istniejący DatePicker)

**DoD pack 0.18.0:**
- [ ] 4 nowe komponenty shipped
- [ ] APG `/dialog/` + `/listbox/` compliance dla popoverów
- [ ] axe-core zero violations
- [ ] Demo routes per komponent z locale variants (en, pl)
- [ ] Internal projekt (panel reporting albo scout-hub timeline filters) konsumuje DateRangePicker w prod

---

## 0.19.0 — Forms expansion

**Status:** IN PROGRESS on `work/0.19-forms-expansion` branch (lib repo).
Work-unit: `internal/bleizlabs-ui/work/2026-05_0.19-forms-expansion/`.
Cycle: E01.1 FileUpload → E01.2 TagsInput → E01.3 Stepper sequentially.

**Why:** Domykamy form story trzema brakującymi primitives. Każdy z nich = częsta luka w real apps.

### 0.19.1 FileUpload

**Klocek check:** PASS — single concept (drop zone + native file input wrapper), data-shape neutral (`File[]` standard browser type), no auto-wrap (consumer renderuje swoje chipy).

**Scope:**
- Drag-and-drop strefa + click-to-browse
- `accept` (MIME types), `multiple`, `maxSize`, `maxFiles` validation
- `onFiles(files: File[])` + `onReject(rejections: FileRejection[])`
- Render-props pattern dla content (`children: ({isDragging, openPicker}) => ReactNode`)
- Klawiatura accessibility (Space/Enter na drop zone otwiera picker)
- Zero state, drag-over state, error state

**NIE w v1 (consumer responsibility):**
- Upload progress tracking (zależne od backendu konsumenta)
- Resumable uploads
- Chunked uploads
- Preview generation (consumer może użyć FileChip + URL.createObjectURL)

**Layer:** `complex/FileUpload`

**Zero external deps:** Native File API + HTML5 drag/drop events

### 0.19.2 TagsInput

**Klocek check:** PASS — single concept (freeform tag input), data-shape neutral (`string[]`), no popup overhead (różny od Combobox creatable który byłby tym samym co istniejący Combobox multiple).

**Scope:**
- Type → Enter/comma tworzy chip
- Backspace na pustym usuwa ostatni chip
- Paste support (split po `,` / `;` / `\n`)
- Optional validation (`validate: (tag) => boolean`)
- Optional max tags limit
- Duplicate handling (default reject, opcjonalne `allowDuplicates`)
- Chip rendering jako lib `<Chip>` (reuse)

**Różnica vs Combobox multi:** Combobox multi to **select-from-list** (popup z opcjami). TagsInput to **freeform creation** (no popup, just chips).

**Layer:** `interactive/TagsInput`

**Zero external deps:** Native

### 0.19.3 Stepper

**Klocek check:** PASS — compound (`<Stepper><Step/></Stepper>`), single visual concept. Lib daje **visual indicator only**, state machine (validation, navigation) = rola konsumenta.

**Scope:**
- `<Stepper currentStep={N} orientation="horizontal|vertical">`
- `<Step label icon? description? status?>` compound parts
- Status: `pending | active | complete | error`
- Connecting lines (gradient progressive)
- Click handler opcjonalny (`onStepClick(index)`)
- Keyboard nav (Arrow keys, Home/End)
- ARIA `role="progressbar"` lub `nav` per W3C guidance

**NIE w lib (consumer responsibility):**
- `useStepper()` hook z state machine — to convenience composition, niech konsument buduje
- Form validation integration — composes z Form context

**Layer:** `complex/Stepper`

**Zero external deps:** Native

**DoD pack 0.19.0:**
- [ ] 3 nowe form primitives shipped
- [ ] axe-core zero violations
- [ ] FormData serialization works dla FileUpload + TagsInput natively
- [ ] Demo routes z form integration examples
- [ ] Co najmniej 1 internal projekt konsumuje minimum 2 z nich

---

## 0.20.0 — Charts pack ✓ SHIPPED 2026-05-12

**Status:** SHIPPED 2026-05-12 (96 → 100 families, +4 charts + `_shared/chart-math.ts` extraction)

**Why:** Aktualnie tylko `BarChart` + 3 specialized bars. Brakuje line/area dla time series + pie dla compositions. Konsumenci dziś sięgają po Recharts/Chart.js (100KB+ external deps).

**Delivered (all on `specialized/` layer):**
- **E01.1 LineChart** (lib commit `147e238`) — multi-series, smooth/linear interpolation, crosshair tooltip + voronoi hit-testing, full interactive a11y (roving tabindex per data point, Arrow/Home/End/Space/Enter/Escape model, sr-only `<table>`, live region)
- **E01.2 AreaChart** (lib commit `d081c33`) — filled region under line, `fillOpacity` + `gradient` visual axes, mirrors LineChart API + a11y
- **E01.3 Sparkline** (lib commit `920d8af`) — tiny inline single-series for KPI tiles / table cells / dense dashboards; deliberate non-interactive (glanceable signal, Tufte/Mantine/Tremor precedent); sr-only table still mandatory
- **E01.4 PieChart** (lib commit `cb3978f`) — categorical composition (full 360°), `variant: 'pie' | 'donut'`, `centerLabel` slot, `showLabels` w/ auto-hide <10%; full interactive a11y per segment

**Refactor (commit `50b996c`):** Extracted `components/specialized/_shared/chart-math.ts` after 2 charts (LineChart + AreaChart) carried inline clones. Rule of Three intra-lib at Sparkline = 3rd consumer. Shared helpers: scaleLinear, getDomain, niceTicks, generateLinearPath, generateSmoothPath, generateAreaPath, normalizeX, formatX, defaultYFormat, clamp01, DEFAULT_COLORS, ChartInterpolation type. Lib-internal (NOT in barrel). Polar helpers stay inline in PieChart per same Rule-of-Three discipline — extract when 2nd polar chart joins.

**Wszystkie:**
- SVG-based (spójne z istniejącym BarChart)
- Responsive via `aspect-ratio` (CSS-only; no ResizeObserver runtime needed for chart sizing — only consumers using `height` prop)
- Dark mode (seed tokens — `--color-{brand,success,warning,info,error}` DEFAULT_COLORS cycle)
- Animation on enter (path-draw + fill-fade; `prefers-reduced-motion: reduce` always wins)
- Tooltip on hover/focus (LineChart/AreaChart/PieChart; Sparkline non-interactive)
- Zero-data state (custom `renderEmpty` slot; sr-only table caption + headers always render)
- **A11y mandatory:** visually-hidden `<table>` fallback dla screen readers (WCAG H51, AA dla wykresów) ✓
- Keyboard navigation dla data points (LineChart/AreaChart/PieChart — full APG-style model; Sparkline opt-out per design)
- `forced-colors: active` fallbacks for Windows High Contrast

**NIE w pierwszym podejściu (deferred):**
- ScatterPlot, HeatMap, Treemap, Gauge (niche)
- Combo chart (consumer composes AreaChart + BarChart)
- Brush / zoom interaction
- Stacked AreaChart variant (overlapping shipped, stacking deferred to 0.20.x)
- Leader-line labels for small pie slices (auto-hide shipped; leader lines deferred to 0.20.x)

**Klocek check (per chart):** PASS — każdy single concept (jeden typ wizualizacji), data-shape neutral (`data: ChartDatum[]` lub `number[]` dla Sparkline).

**Layer:** `specialized/` (existing category — joined BarChart, UsageDonut, AvailabilityBar, MetricBar peers)

**Zero external deps:** SVG + native math (Path, scale calculations, Date dla time axes) ✓

**DoD:**
- [x] 4 nowe chart primitives shipped (LineChart + AreaChart + Sparkline + PieChart)
- [x] `_shared/chart-math.ts` extracted at Rule-of-Three (3rd chart) trigger
- [x] tsc + eslint + check:barrel + check:manifest clean across all 4 charts (100 families total)
- [ ] A11y table fallback verified axe-core — DEFERRED to 0.20.x test-execution sprint per E15 Tabs / E05.4 Form / E06.x Header precedent (specs ship alongside; LC-R01..R26 partially executed, AC-R01..R20 / SP-R01..R15 / PC-R01..R20 planned)
- [ ] Co najmniej 1 internal projekt używa minimum 1 chart w prod — pending consumer adoption (bleizlabs-website filar specs already reference sparklines + donuts in dashboard mockups)

---

## 0.20.1 — Demo bug sweep

**Status:** PLANNED. Discovered 2026-05-12 by user during demo walkthrough po 0.20.0 ship. 18 bugs found across existing components — runtime errors, missing renders, visual inconsistencies, broken interactions. Patch cycle (NIE minor) bo wyłącznie bugfixy na shipped surface.

**Why:** Demo dev app jest jedynym continuous-integration surface dla wszystkich 100 komponentów. Bugi tutaj = bugi w consumer projects. Sweep przed 0.21.0 polish batch żeby fresh-built Polish components nie inheritowały tych samych pułapek.

**Methodology (canonical per user 2026-05-12):** *"pewnie niektóre na siebie nachodzą albo oddziałowują ze sobą, więc dobrze jest przed każdym fixem zweryfikować czy nadal występuje."* + *"nie tylko trzeba to sprawdzić w demo ale sprawdzić gdzie powstaje źródło, czy źródłem problemu jest nasza implementacja w demo, czy może źródłem problemu jest jednak kod źródłowy."*

Każdy bug pre-fix MANDATORY:
1. **Reproduce** — `mcp__next-devtools__nextjs_call get_errors` + visual check na current main HEAD; verify że bug nadal występuje (NIE auto-assume z listy)
2. **Root-cause triage** — bug może mieć 1 z 3 źródeł:
   - **(a) DEMO PAGE** — `app/components/<name>/page.tsx` lub `.module.scss` — wrong prop usage, wrong import path, demo-only typo
   - **(b) LIB SOURCE** — `components/<layer>/<Name>/<Name>.tsx` lub `.module.scss` — actual component bug, missing variant, broken prop wiring, a11y violation
   - **(c) BOTH** — demo exposes lib bug poprzez configuration unique do demo
   - Read affected demo page FIRST + lib source SECOND; compare prop contract z JSDoc; confirm który layer owns the bug
3. **Fix location decision** — patch lands gdzie source jest:
   - DEMO bug → fix tylko `app/components/<name>/page.tsx` (zero lib touch)
   - LIB bug → fix lib source + regression spec w `<Name>.regression.spec.ts` + verify demo still works
   - BOTH → fix lib first (source of truth), then fix demo to match corrected API
4. **Confirm not downstream symptom** — niektóre bugs mogą być side-effects wcześniejszych fixów (B05 TextLink underline może być related do B11 Textarea resize jeśli oba dotykają shared display tokens). Read previous commits w sweep przed implementacją kolejnego fix
5. **Implement minimum patch** — najwęższa zmiana likwidująca root cause; zero refactor scope-creep
6. **Re-verify post-fix** — `get_errors` clean + visual check demo + regression spec PASS gdy applicable + axe-core delta zero

**Tagging w commitach:** `fix(0.20.1/B##): <demo|lib|both> — <component> — <symptom>` żeby split-stats były czytelne post-sweep.

**Bug roster (P0-P3 priority by impact; root-cause guess: D=demo, L=lib, B=both, ?=unknown):**

### P0 — Console errors (blocks clean dev experience)

- [ ] **B01 [?]** Stack demo — 2 console errors (capture errors first → triage)
- [ ] **B03 [?]** Section demo — 2 console errors (capture + triage)
- [ ] **B06 [?]** Cards demo — 2 console errors (capture + triage)
- [ ] **B07a [B?]** Badge demo "5. asChild → semantic time element" — nie renderuje się + 2× console error. Likely lib asChild Slot polymorphism bug LUB demo passes invalid child shape

### P1 — Functional breaks (interaction / render fails)

- [ ] **B02 [B?]** Inline demo "5. asChild — renders <nav>" — nie renderuje się. asChild Slot bug LUB demo composition
- [ ] **B04 [?]** Eyebrow demo "6. asChild (project onto label semantics)" — verify rendering + a11y semantics
- [ ] **B09 [L?]** EdgeBar demo "5. Pulsing — opacity cycle for alert/live indicators" — animation nie działa. Likely lib `@keyframes` missing lub `prefers-reduced-motion` over-eagerly disables
- [ ] **B10 [?]** Label demo "5. asChild → semantic legend" — verify rendering + a11y semantics
- [ ] **B11 [L]** Textarea `resize="horizontal"` nie działa w żadnym przykładzie. Lib bug: prop nie wired do `resize: horizontal` CSS, lub `.module.scss` `resize: vertical !important` shadows. Demo passes prop correctly
- [ ] **B12 [D?]** BreakdownList "6. Empty state (consumer-owned)" — puste. Likely demo nie renderuje custom empty content (empty state = consumer-owned slot, demo zapomniało wpisać)
- [ ] **B15 [L]** Combobox "3. Controlled mode with external state" — "clear" button nie działa. Lib bug: controlled-mode value reset gdy onClear wywołane bez `value` prop callback wired, lub demo nie passes onChange. Read source + demo
- [ ] **B18 [L]** LineChart "8. Animation off (animate=false)" — popover pokazuje raw timestamp (`17119296000000`). Lib bug: `formatX` ścieżka pomija formatter gdy animacja off (likely `animate ? formatter(x) : x` reversed condition)

### P2 — Visual / proportion issues

- [ ] **B05 [L]** TextLink hover underline 100% szerokości kontenera zamiast tekstu. Lib SCSS bug: `text-decoration: underline` na `<a>` block-level lub `width: 100%` shadow on hover state
- [ ] **B08 [L]** Badge "7. Live status — Dot pulse composition" — Dot za duży. Likely fix: add `<Dot size="xs|s">` variants do lib (brak `xs` w current API) — patrz `Dot.tsx` size enum + amend
- [ ] **B13 [L]** Button `variant="warning"` — brak transition. Lib SCSS bug: warning variant nie inherituje shared transition declaration (likely override `transition: none` lub missing `transition` w warning rule block)
- [ ] **B14 [L?]** AlertDialog — opis przesuwa się 1-2px po 0.5s. Animation finish state bug LUB font swap LUB layout reflow. Read AlertDialog.module.scss + check `animation-fill-mode`
- [ ] **B17 [B]** DataTable search Input za duży. Demo: użyć `size="s|xs"`; lib: verify że Input ma `size="xs"` wariant (jeśli brak → amend lib first, then demo)

### P3 — Catalog completeness

- [ ] **B16 [D]** Demo home catalog brakuje TimePicker + DateTimePicker (shipped w 0.18.0). Demo-only fix: add cards do `app/page.tsx` + verify `components/date-time-picker/page.tsx` + `components/time-picker/page.tsx` istnieją (lib code shipped, demo catalog out of sync)

**Scope:**
- Wyłącznie bugfixy na shipped surface (zero new components, zero API breaks)
- Każdy fix = own commit z regression spec gdy applicable
- Single PR po wszystkich 18 fixach (lub split P0+P1 vs P2+P3 jeśli pierwsza partia trwa >dzień)

**NIE w v0.20.1:**
- Nowe komponenty (Banner/AvatarGroup/Rating/Collapsible → 0.21.0)
- 0.20.0 a11y follow-up dla LineChart+AreaChart (describedby + tab-entry — osobny patch 0.20.2)
- 0.20.0 test sprint (Playwright + axe-core + NVDA 4 charts — osobny patch 0.20.3)

**DoD pack 0.20.1:**
- [ ] 18 bugs PASS (zero `get_errors` console output dla affected demo routes)
- [ ] Regression specs dla każdego applicable bug (B11 Textarea resize, B15 Combobox clear, B18 LineChart formatter, B13 Button warning transition)
- [ ] axe-core regression suite passes (no introduction of new a11y violations from fixes)
- [ ] Demo walkthrough po 0.20.1 ship — user confirms wszystkie 18 PASS

**Layer:** Cross-cutting — atoms, molecules, complex, specialized.

**Zero external deps:** None — all fixes use existing tooling.

---

## 0.21.0 — Polish batch

**Why:** 4 małe komponenty domykające standardowe display + feedback gaps. Szybki release, każdy low-effort, każdy realnie potrzebny.

### 0.21.1 AvatarGroup

**Klocek check:** PASS — molecule, children-slot pattern (data-shape neutral, no forced typed array), single concept (stacked avatars).

**Scope:**
- `<AvatarGroup max={N} size?>` przyjmuje `<Avatar>` children
- Overflow chip (+N more) z opcjonalnym tooltip
- Configurable overlap (CSS variable)

**Layer:** `molecules/AvatarGroup`

### 0.21.2 Rating

**Klocek check:** PASS — input primitive, single concept (star rating), data-shape neutral (`value: number`).

**Scope:**
- `<Rating value max? readOnly? size?>` input
- Half-star support (fractional values w readOnly)
- Keyboard nav (Arrow keys, Home/End)
- Hover preview (active highlight)
- `onChange(value: number)`
- ARIA `role="radiogroup"` + `aria-valuenow`/`aria-valuemax`

**Layer:** `interactive/Rating`

### 0.21.3 Collapsible

**Klocek check:** PASS — APG `/disclosure/` pattern (generic show/hide), różny od Accordion (APG `/accordion/` Q+A pattern).

**Scope:**
- `<Collapsible><CollapsibleTrigger/><CollapsibleContent/></Collapsible>` compound
- Controlled + uncontrolled
- Animation (height transition, prefers-reduced-motion)
- ARIA `aria-expanded` + `aria-controls`

**Różnica vs Accordion:**
- Accordion = FAQ-style Q+A panels (specific semantic)
- Collapsible = generic "show more / hide" toggle (no question semantic)

**Layer:** `complex/Collapsible`

### 0.21.4 Banner

**Klocek check:** PASS — feedback primitive, single concept (page-wide notification), data-shape neutral (children slot).

**Scope:**
- `<Banner tone="info|warning|error|success" dismissible? onDismiss?>`
- Sticky top-of-page variant
- Action slot (Button compositions)
- Persistent (consumer owns dismissal state)
- ARIA `role="status"` lub `"alert"` per tone

**Różnica vs Alert:**
- Alert = contextual inline w-content
- Banner = global top-of-page persistent

**Layer:** `feedback/Banner`

**Zero external deps:** None potrzeba.

**DoD pack 0.21.0:**
- [ ] 4 nowe komponenty shipped
- [ ] axe-core zero violations
- [ ] Demo routes per komponent

---

## 0.22.0 — Housekeeping

**Why:** Przed API freeze potrzebny finalny sweep DX (JSDoc) + opt-in escape hatch (headless reset). 100% JSDoc coverage = degraded DX bez docs site nawet.

### 0.22.1 JSDoc completeness audit

**Scope:**
- Audyt wszystkich komponentów (89 + ~13 nowych = ~102): pełny header block (description, @layer, @tokens, @deps, @a11y, @example)
- Każdy prop ma description w JSDoc
- Każdy deprecated prop ma `@deprecated` z migration hint
- Standaryzacja formatu (template w `docs/component-template.md`)
- Lint rule blokuje merge PR jeśli new component bez kompletnego JSDoc

### 0.22.2 Headless seed-reset stylesheet

**Why:** Opt-in escape hatch dla consumerów chcących structure-only. Lekki dodatek (1 plik SCSS), zero impact na core.

**Scope:**
- `styles/_headless-reset.scss` — nadpisuje seed tokens do neutral
- Konsument importuje **po** głównych stylach: `@use '@bleizlabs/ui/styles'; @use '@bleizlabs/ui/styles/headless-reset';`
- Efekt: struktura + a11y + behavior bez visual identity

**Świadomie defer:** Real `@bleizlabs/ui/headless` subexport (osobny build pipeline bez SCSS imports) — robimy gdy realny demand z konkretnym use case.

**DoD pack 0.22.0:**
- [ ] 100% JSDoc coverage dla public exports
- [ ] Lint rule operational
- [ ] `headless-reset.scss` ships + exported w package.json
- [ ] Smoke test: konsument z headless-reset renderuje bez visual collision

---

## 1.0-rc.1 → 1.0 — Stabilization + freeze

**Scope:**
- Breaking change moratorium od 0.22.0 freeze date
- Bug fix sweep (GitHub issues + internal consumer reports)
- axe-core full lib regression
- Playwright suite green 3× kolejnych run (flake elimination)
- Internal consumer migration (panel, bleizos, scout-hub, leadseeker, hydroh2) na 1.0-rc.1
- API audit per klocek charter dla całej lib (~102 komponenty)
- CHANGELOG cleanup — sumaryczny "what changed since 0.16" overview dla 1.0 announcement
- Self-audit a11y (jeśli external audit defer'ed do 1.x)

**DoD 1.0.0:**
- [ ] Zero open critical bugs na GitHub
- [ ] Wszystkie 4-5 internal projekty na 1.0.0 w prod
- [ ] axe-core zero violations całej lib
- [ ] API audit raport opublikowany
- [ ] Breaking change moratorium 0 violations od freeze date

---

## Świadomie poza biblioteką

**Zewnętrzne deps NIE używamy** — utrzymane przez cały roadmap:

| Item | Powód odrzucenia |
|---|---|
| **DnD** | Defer do realnego external demand. Jeśli/gdy ktoś poprosi → osobny package `@bleizlabs/ui-dnd` wrapper. Sami na zapas nie robimy. |
| **CodeBlock z syntax highlighting** | Prism/Shiki = external dep. Własny tokenizer per język = rabbit hole. Konsument owinie `<pre><code>` z własnym Shiki gdy potrzeba. |
| **ColorPicker** | Niche, design-tool oriented. Defer do realnego demand. |
| **Tree / TreeView** | Defer do realnego demand (file trees, org charts). |
| **VirtualList general-purpose** | Defer. DataTable virt też defer. Większość use cases <500 wierszy. |
| **Resizable / SplitPane** | Defer. Niche (IDE-style layouts). |
| **MentionInput** | Defer. Niche (collaboration apps). |
| **Gauge** | Defer. Niche specialized viz. |
| **FAB (Floating Action Button)** | Skip. Anty-Material aesthetic. Konsument może złożyć Button + position:fixed. |
| **MasonryGrid** | Skip. GridLayout pokrywa 95% przypadków. |
| **Tailwind interop** | Skip. Anty-Tailwind to filozoficzny statement. |
| **Real `/headless` subexport** | Defer post-1.0. Stripped seeds (0.22.2) pokrywają 80% za 5% kosztu. |

**Zasada:** Komponenty wymagające external runtime UI deps **nie wchodzą do core lib**. Mogą być osobnymi packagami (`@bleizlabs/ui-<name>`) jeśli kiedyś będzie demand. Core `@bleizlabs/ui` pozostaje zero-runtime-deps.

---

## Tracking

- **Per-minor DONE_EPIC** w `D:/OS/internal/bleizlabs-ui/work/<work-unit>/devlog.md`
- **CHANGELOG.md** — release notes per minor
- **manifest.json** — auto-gen reflektuje aktualną zawartość lib
- **ROADMAP.md** — ten dokument, updated po każdym DONE_EPIC

---

## Adoption layer — osobny temat

Dokumentacja docs site, marketing launches, external a11y audit, business model — to **nie funkcjonalność biblioteki**, więc nie ten dokument. Robimy gdy będzie ochota / potrzeba zewnętrznej traction. Wtedy ląduje w `docs/ADOPTION.md` jako osobny plan.

---

## Changelog tego dokumentu

- **2026-05-12 v0.4** — 0.20.1 Demo bug sweep dodany jako patch przed 0.21.0 Polish. 18 bugs found by user during demo walkthrough po 0.20.0 ship (4× P0 console errors, 8× P1 functional, 5× P2 visual, 1× P3 catalog completeness). Methodology: pre-fix mandatory `get_errors` verification + downstream-symptom check (bo niektóre mogą się nachodzić).
- **2026-05-10 v0.3** — Funkcjonalne luki audit. DnD usunięty (defer to external demand). 11 nowych komponentów dodanych: DateRangePicker, TimeInput, TimePicker, DateTimePicker, FileUpload, TagsInput, Stepper, AvatarGroup, Rating, Collapsible, Banner. Phasing 0.17 → 1.0 = 6 minor + RC. Zero external deps policy utrzymane.
- **2026-05-10 v0.2** — Refocus: tylko funkcjonalne luki, bez estymat czasowych, bez adoption layer.
- **2026-05-10 v0.1** — Initial draft.
