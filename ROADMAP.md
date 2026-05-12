# `@bleizlabs/ui` — Roadmap 0.16 → 1.0

**Status:** DRAFT
**Last updated:** 2026-05-11
**Current version:** 0.17.0 (89 components)

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
0.17.0  →  DataTable v1                       [flagship single-lift]
0.18.0  →  Date/Time pack                     [4 komponenty, shared Calendar logic]
0.19.0  →  Forms expansion                    [3 form primitives]
0.20.0  →  Charts pack                        [SVG-based, dashboard layer]
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
5. **Polish piąte** — 4 małe komponenty = szybki release, momentum
6. **Housekeeping szóste** — sprzątanie przed API freeze

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

**Status:** IN PROGRESS on `work/0.18-datetime-pack` branch (lib repo). Plan
revision v2 (post-adversarial-audit) at
`internal/bleizlabs-ui/work/2026-05_0.18-datetime-pack/docs/implementation-plan-2026-05-12.md`.

Cycle progress:
- [x] E01.0 Calendar AMEND (commit `57b29a3`) — opt-in `cellExtras` +
      `onCellHover` + `onGridMouseLeave` props (Phase 1 prerequisite for
      DateRangePicker range overlay).
- [x] E01.1 DateRangePicker v1 (commit `62db846`) — multi-month range picker
      with 1/2/3-month layout + form integration + 58/60 Playwright tests
      PASS (2 documented skips for Playwright synthetic-event limitations).
- [x] E01.2 TimeInput v1 — inline HH:MM(:SS) `role="spinbutton"` trio + AM/PM
      `role="switch"` toggle, own implementation per audit C1; 48/48 Playwright
      tests PASS; 5 new time helpers in `utils/date.ts` (parseTime, formatTime,
      clampTime, combineDateTime, resolveHourCycle).
- [x] E01.3 TimePicker v1 — combobox input + popover with scrollable
      hour/minute/seconds/AM-PM listbox columns; step filter; 40/40
      Playwright tests PASS.
- [ ] E01.4 DateTimePicker — Calendar + TimeInput compound in single popover.
- [ ] Phase 7.1 audit + release pipeline (PR → tag v0.18.0 → npm publish).

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

## 0.20.0 — Charts pack

**Why:** Aktualnie tylko `BarChart` + 3 specialized bars. Brakuje line/area dla time series + pie dla compositions. Konsumenci dziś sięgają po Recharts/Chart.js (100KB+ external deps).

**Scope:**
- **AreaChart** — wypełniony obszar pod linią, multi-series support
- **LineChart** — multi-series, smooth + linear interpolation, crosshair tooltip
- **PieChart** — donut variant, segment hover, labels
- **Sparkline** — inline tiny LineChart bez axes/tooltips

**Wszystkie:**
- SVG-based (spójne z istniejącym BarChart)
- Responsive (resize observer)
- Dark mode (seed tokens)
- Animation on enter (Reveal pattern)
- Tooltip on hover/focus
- Zero-data state
- **A11y mandatory:** visually-hidden `<table>` fallback dla screen readers (WCAG AA dla wykresów)
- Keyboard navigation dla data points

**NIE w pierwszym podejściu:**
- ScatterPlot, HeatMap, Treemap, Gauge (niche)
- Combo chart (consumer composes AreaChart + BarChart)
- Brush / zoom interaction

**Klocek check (per chart):** PASS — każdy single concept (jeden typ wizualizacji), data-shape neutral (`data: ChartDatum[]`).

**Layer:** `display/` (rozszerzenie istniejącej kategorii) lub nowa `charts/` jeśli kategoria rośnie

**Zero external deps:** SVG + native math (Path, scale calculations, Date dla time axes)

**DoD:**
- [ ] 4 nowe chart primitives shipped
- [ ] A11y table fallback verified axe-core
- [ ] Co najmniej 1 internal projekt używa minimum 1 chart w prod

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

- **2026-05-10 v0.3** — Funkcjonalne luki audit. DnD usunięty (defer to external demand). 11 nowych komponentów dodanych: DateRangePicker, TimeInput, TimePicker, DateTimePicker, FileUpload, TagsInput, Stepper, AvatarGroup, Rating, Collapsible, Banner. Phasing 0.17 → 1.0 = 6 minor + RC. Zero external deps policy utrzymane.
- **2026-05-10 v0.2** — Refocus: tylko funkcjonalne luki, bez estymat czasowych, bez adoption layer.
- **2026-05-10 v0.1** — Initial draft.
