# Changelog

All notable changes to `@bleizlabs/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning 2.0](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.10.1] — 2026-05

First public release.

### Added

- **101 components across 10 categories.**
  - **Layout (5):** `Container`, `Section`, `Stack`, `Inline`, `GridLayout`.
  - **Typography (4):** `Heading` (13 sizes including atelier display tier), `Text` (6 variants), `Anchor`, `Eyebrow`.
  - **Display (13):** `AspectRatio`, `Avatar`, `Badge`, `Card` (compound: `CardHeader` / `CardBody` / `CardFooter` / `CardSection`), `EdgeBar`, `IconBox`, `KpiValue`, `PercentValue`, `Reveal`, `Separator`, `Skeleton`, `Spinner`, `Table` (compound).
  - **Interactive (17):** `Accordion`, `Button`, `ButtonGroup`, `Checkbox`, `Input`, `InputGroup`, `Label`, `MaskedInput`, `NumberInput`, `PasswordInput`, `PhoneInput`, `RadioGroup`, `Switch`, `Textarea`, `TextLink`, `Toggle`, `ToggleGroup`.
  - **Feedback (3):** `Alert`, `Empty`, `Progress`.
  - **Specialized (9):** `AnimatedCounter`, `AvailabilityBar`, `BarChart`, `Breadcrumb`, `Dot`, `Kbd`, `MetricBar`, `Pagination`, `UsageDonut`.
  - **Molecules (15):** `AccordionGroup`, `BackLink`, `BreakdownList`, `Chip`, `DataRow`, `DeadlineBadge`, `FileChip`, `IconButton`, `MetricTile`, `PageHeader`, `RevealStack`, `SectionDivider`, `SectionHeader`, `Timeline` (compound), `ToggleGroupFilter`.
  - **Card presets (11):** `ActionCard`, `CollapsibleZoneCard`, `ContentCard`, `EntityCard`, `EntityHero`, `FormCard`, `IconHeaderCard`, `PairedCard`, `SidebarCard`, `StatsCard`, `ZoneCard`.
  - **Composition presets (1):** `SiteHeader` (page-level nav with mobile drawer).
  - **Complex interactive (22):** `Dialog`, `AlertDialog`, `Drawer`, `Sheet`, `Tooltip`, `Popover`, `DropdownMenu`, `ContextMenu`, `HoverCard`, `NavigationMenu`, `Tabs`, `Select`, `Combobox`, `Calendar`, `DatePicker`, `Toast`, `Slider`, `Carousel`, `ScrollArea`, `InputOTP`, `Command` (⌘K palette), `Sidebar`.
- **Seed-based design tokens** — override 5–10 seed values to reskin the entire library across light + dark themes.
- **`bleizlabs-ui` CLI** — `init` / `add` / `status` commands for project scaffold + wrapper layer + theme files.
- **WAI-ARIA APG-compliant patterns** across all interactive components.
- **In-house primitives** — `Slot` (asChild polymorphism), `useFloating`, `useFocusTrap`, `usePointerDrag`, `useMatchMedia`, date utilities. Zero runtime UI dependencies.
- **Test infrastructure** — Playwright per-component suites (keyboard / focus / aria / regression) + library-wide `@axe-core/playwright` WCAG 2.1 AA sweep.
- **React 19 + Next.js 16.2 support** with Server Components, Turbopack, App Router.

### Notes

- This is the first version published as open-source. Earlier development versions
  (`0.1.0` → `0.9.x`) were internal and are not documented in this public changelog.
- Distributed via GitHub Packages as a scoped package. See [README.md](README.md)
  for installation instructions.

[Unreleased]: https://github.com/BleizLabs/bleizlabs-ui/compare/v0.10.1...HEAD
[0.10.1]: https://github.com/BleizLabs/bleizlabs-ui/releases/tag/v0.10.1
