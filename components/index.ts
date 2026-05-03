// components/index.ts
//
// Root barrel for @bleizlabs/ui — re-exports every public component and
// type so consumers can import from the package root:
//
//   import { Button, Card, CardHeader, Dialog } from '@bleizlabs/ui';
//
// Per-category deep imports also work (tree-shaking is equivalent either
// way thanks to ESM named exports):
//
//   import { Button } from '@bleizlabs/ui/components/interactive/Button';
//
// Keep this file alphabetised within each category. When you add a new
// component, add it here AND in README.md → Component catalogue.

// ----------------------------------------------------------------------------
// Layout (5)
// ----------------------------------------------------------------------------
export * from './layout/Container';
export * from './layout/GridLayout';
export * from './layout/Inline';
export * from './layout/Section';
export * from './layout/Stack';

// ----------------------------------------------------------------------------
// Typography (4)
// ----------------------------------------------------------------------------
export * from './typography/Anchor';
export * from './typography/Eyebrow';
export * from './typography/Heading';
export * from './typography/Text';

// ----------------------------------------------------------------------------
// Display (12 families / 16 exports)
// ----------------------------------------------------------------------------
export * from './display/AspectRatio';
export * from './display/Avatar';
export * from './display/Badge';
export * from './display/Card';
export * from './display/IconBox';
export * from './display/KpiValue';
export * from './display/PercentValue';
export * from './display/Reveal';
export * from './display/Separator';
export * from './display/Skeleton';
export * from './display/Spinner';
export * from './display/Table';

// ----------------------------------------------------------------------------
// Interactive (17)
// ----------------------------------------------------------------------------
export * from './interactive/Accordion';
export * from './interactive/Button';
export * from './interactive/ButtonGroup';
export * from './interactive/Checkbox';
export * from './interactive/Input';
export * from './interactive/InputGroup';
export * from './interactive/Label';
export * from './interactive/MaskedInput';
export * from './interactive/NumberInput';
export * from './interactive/PasswordInput';
export * from './interactive/PhoneInput';
export * from './interactive/RadioGroup';
export * from './interactive/Switch';
export * from './interactive/Textarea';
export * from './interactive/TextLink';
export * from './interactive/Toggle';
export * from './interactive/ToggleGroup';

// ----------------------------------------------------------------------------
// Feedback (3)
// ----------------------------------------------------------------------------
export * from './feedback/Alert';
export * from './feedback/Empty';
export * from './feedback/Progress';

// ----------------------------------------------------------------------------
// Specialized (9)
// ----------------------------------------------------------------------------
export * from './specialized/AnimatedCounter';
export * from './specialized/AvailabilityBar';
export * from './specialized/BarChart';
export * from './specialized/Breadcrumb';
export * from './specialized/Dot';
export * from './specialized/Kbd';
export * from './specialized/MetricBar';
export * from './specialized/Pagination';
export * from './specialized/UsageDonut';

// ----------------------------------------------------------------------------
// Molecules (13)
// ----------------------------------------------------------------------------
export * from './molecules/AccordionGroup';
export * from './molecules/BackLink';
export * from './molecules/BreakdownList';
export * from './molecules/Chip';
export * from './molecules/DataRow';
export * from './molecules/DeadlineBadge';
export * from './molecules/FileChip';
export * from './molecules/IconButton';
export * from './molecules/MetricTile';
export * from './molecules/PageHeader';
export * from './molecules/RevealStack';
export * from './molecules/SectionDivider';
export * from './molecules/ToggleGroupFilter';

// ----------------------------------------------------------------------------
// Card presets (8)
// ----------------------------------------------------------------------------
export * from './presets/ActionCard';
export * from './presets/ContentCard';
export * from './presets/EntityCard';
export * from './presets/EntityHero';
export * from './presets/FormCard';
export * from './presets/IconHeaderCard';
export * from './presets/PairedCard';
export * from './presets/SidebarCard';
export * from './presets/StatsCard';

// ----------------------------------------------------------------------------
// Composition presets (1)
// ----------------------------------------------------------------------------
export * from './presets/SiteHeader';

// ----------------------------------------------------------------------------
// Complex interactive (22)
// ----------------------------------------------------------------------------
export * from './complex/AlertDialog';
export * from './complex/Calendar';
export * from './complex/Carousel';
export * from './complex/Combobox';
export * from './complex/Command';
export * from './complex/ContextMenu';
export * from './complex/DatePicker';
export * from './complex/Dialog';
export * from './complex/Drawer';
export * from './complex/DropdownMenu';
export * from './complex/HoverCard';
export * from './complex/InputOTP';
export * from './complex/NavigationMenu';
export * from './complex/Popover';
export * from './complex/ScrollArea';
export * from './complex/Select';
export * from './complex/Sheet';
export * from './complex/Sidebar';
export * from './complex/Slider';
export * from './complex/Tabs';
export * from './complex/Toast';
export * from './complex/Tooltip';

// ----------------------------------------------------------------------------
// Utilities — opt-in building blocks for consumer customisation
// ----------------------------------------------------------------------------
// Slot enables your own components to support the same `asChild` polymorphism
// the library uses internally. cn / mergeRefs are commonly needed helpers.
export { Slot, type SlotProps } from './utils/Slot';
export { cn, type ClassValue } from './utils/cn';
export { mergeRefs } from './utils/mergeRefs';

// ----------------------------------------------------------------------------
// Shared types
// ----------------------------------------------------------------------------
export type { SpaceIndex } from './types/spacing';
