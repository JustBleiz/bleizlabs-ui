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
// component, add it here, then regenerate the derived inventories:
// `npm run build:manifest` + `node scripts/build-agent-inventory.mjs`
// (manifest.json + AGENT-USAGE §J; both are CI-gated by check:manifest /
// check:manifest:sync / check-agents-doc — no hand-maintained catalogue).

// ----------------------------------------------------------------------------
// Layout
// ----------------------------------------------------------------------------
export * from './layout/Container';
export * from './layout/GridLayout';
export * from './layout/Inline';
export * from './layout/Section';
export * from './layout/Stack';

// ----------------------------------------------------------------------------
// Typography
// ----------------------------------------------------------------------------
export * from './typography/Anchor';
export * from './typography/Eyebrow';
export * from './typography/Heading';
export * from './typography/Mark';
export * from './typography/Text';

// ----------------------------------------------------------------------------
// Display
// ----------------------------------------------------------------------------
export * from './display/AspectRatio';
export * from './display/Avatar';
export * from './display/Badge';
export * from './display/Card';
export * from './display/CodeBlock';
export * from './display/EdgeBar';
export * from './display/IconBox';
export * from './display/KpiValue';
export * from './display/Reveal';
export * from './display/Separator';
export * from './display/Skeleton';
export * from './display/Spinner';
export * from './display/Table';

// ----------------------------------------------------------------------------
// Interactive
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
export * from './interactive/Rating';
export * from './interactive/SkipLink';
export * from './interactive/Switch';
export * from './interactive/TagsInput';
export * from './interactive/Textarea';
export * from './interactive/TextLink';
export * from './interactive/TimeInput';
export * from './interactive/Toggle';
export * from './interactive/ToggleGroup';

// ----------------------------------------------------------------------------
// Feedback
// ----------------------------------------------------------------------------
export * from './feedback/Alert';
export * from './feedback/Banner';
export * from './feedback/Empty';
export * from './feedback/Progress';

// ----------------------------------------------------------------------------
// Specialized
// ----------------------------------------------------------------------------
export * from './specialized/AnimatedCounter';
export * from './specialized/AreaChart';
export * from './specialized/AvailabilityBar';
export * from './specialized/BarChart';
export * from './specialized/Breadcrumb';
export * from './specialized/Dot';
export * from './specialized/Kbd';
export * from './specialized/LineChart';
export * from './specialized/MetricBar';
export * from './specialized/Pagination';
export * from './specialized/PieChart';
export * from './specialized/Sparkline';
export * from './specialized/ThemeToggle';
export * from './specialized/UsageDonut';

// ----------------------------------------------------------------------------
// Molecules
// ----------------------------------------------------------------------------
export * from './molecules/AccordionGroup';
export * from './molecules/AvatarGroup';
export * from './molecules/BackLink';
export * from './molecules/BreakdownList';
export * from './molecules/Chip';
export * from './molecules/DataRow';
export * from './molecules/FileChip';
export * from './molecules/Header';
export * from './molecules/IconButton';
export * from './molecules/MetricTile';
export * from './molecules/SectionDivider';
export * from './molecules/Timeline';

// ----------------------------------------------------------------------------
// Card presets — FormSurface
// ----------------------------------------------------------------------------
export * from './presets/FormSurface';

// ----------------------------------------------------------------------------
// Complex interactive
// ----------------------------------------------------------------------------
export * from './complex/AlertDialog';
export * from './complex/Calendar';
export * from './complex/Carousel';
export * from './complex/Collapsible';
export * from './complex/Combobox';
export * from './complex/Command';
export * from './complex/ContextMenu';
export * from './complex/DataTable';
export * from './complex/DatePicker';
export * from './complex/DateRangePicker';
export * from './complex/DateTimePicker';
export * from './complex/Dialog';
export * from './complex/Drawer';
export * from './complex/DropdownMenu';
export * from './complex/Field';
export * from './complex/FileUpload';
export * from './complex/Form';
export * from './complex/HoverCard';
export * from './complex/InputOTP';
export * from './complex/NavigationMenu';
export * from './complex/Popover';
export * from './complex/ScrollArea';
export * from './complex/Select';
export * from './complex/Sheet';
export * from './complex/Sidebar';
export * from './complex/Slider';
export * from './complex/Stepper';
export * from './complex/Tabs';
export * from './complex/TimePicker';
export * from './complex/Toast';
export * from './complex/Toolbar';
export * from './complex/Tooltip';

// ----------------------------------------------------------------------------
// Utilities — opt-in building blocks for consumer customisation
// ----------------------------------------------------------------------------
// Slot enables your own components to support the same `asChild` polymorphism
// the library uses internally. cn / mergeRefs are commonly needed helpers.
// VisuallyHidden mirrors the `sr-only` SCSS mixin as a React atom.
export { Slot, type SlotProps } from './utils/Slot';
export { cn, type ClassValue } from './utils/cn';
export { mergeRefs } from './utils/mergeRefs';
export { VisuallyHidden, type VisuallyHiddenProps } from './utils/VisuallyHidden';

// ----------------------------------------------------------------------------
// Shared types
// ----------------------------------------------------------------------------
export type { SpaceIndex } from './types/spacing';
