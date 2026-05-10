import Link from 'next/link';
import { Heading } from '@/components/typography/Heading';
import styles from './page.module.scss';

interface ComponentLink {
  href: string;
  name: string;
  description: string;
  phase: string;
  status: 'available' | 'pending';
}

const components: ComponentLink[] = [
  // ── Phase 1 — Layout ───────────────────────────────────────────────────
  {
    href: '/components/stack',
    name: 'Stack',
    description: 'Vertical flex layout primitive with gap, alignment, justification, and optional dividers between items.',
    phase: 'Phase 1 — Layout',
    status: 'available',
  },
  {
    href: '/components/inline',
    name: 'Inline',
    description: 'Horizontal flex layout primitive with wrap support and a responsive collapse-below breakpoint.',
    phase: 'Phase 1 — Layout',
    status: 'available',
  },
  {
    href: '/components/container',
    name: 'Container',
    description: 'Max-width centered wrapper with size and padding variants for page and section gutters.',
    phase: 'Phase 1 — Layout',
    status: 'available',
  },
  {
    href: '/components/section',
    name: 'Section',
    description: 'Full-width semantic band with background variants and a configurable HTML tag.',
    phase: 'Phase 1 — Layout',
    status: 'available',
  },
  {
    href: '/components/grid-layout',
    name: 'GridLayout',
    description: 'Multi-column CSS Grid primitive with number shorthand, arbitrary templates, and a mobile-first responsive cascade.',
    phase: 'Phase 1 — Layout',
    status: 'available',
  },

  // ── Phase 2 — Typography ───────────────────────────────────────────────
  {
    href: '/components/heading',
    name: 'Heading',
    description: 'Semantic h1–h6 with decoupled visual size, weight, color, alignment, and asChild polymorphism.',
    phase: 'Phase 2 — Typography',
    status: 'available',
  },
  {
    href: '/components/text',
    name: 'Text',
    description: 'Universal body text with five variants, weight, color, uppercase, and asChild polymorphism.',
    phase: 'Phase 2 — Typography',
    status: 'available',
  },
  {
    href: '/components/anchor',
    name: 'Anchor',
    description: 'Inline text link with underline strategy, external indicator, and color tone variants.',
    phase: 'Phase 2 — Typography',
    status: 'available',
  },
  {
    href: '/components/eyebrow',
    name: 'Eyebrow',
    description: 'Atelier kicker label — small uppercase caption with numeric prefix and hairline ornament.',
    phase: 'Phase 2 — Typography',
    status: 'available',
  },
  {
    href: '/components/text-link',
    name: 'TextLink',
    description: 'Inline text link styled for inline use within paragraphs and lists.',
    phase: 'Phase 2 — Typography',
    status: 'available',
  },

  // ── Phase 3 — Display ──────────────────────────────────────────────────
  {
    href: '/components/card',
    name: 'Card',
    description: 'Surface container with variants, hoverable state, accent positions, and four flat slot components for header / body / footer / section.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/badge',
    name: 'Badge',
    description: 'Inline status / category indicator with five colors, pill shape, optional icon, and asChild polymorphism.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/separator',
    name: 'Separator',
    description: 'Divider line with subtle / gradient / brand variants and horizontal or vertical orientation.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/icon-box',
    name: 'IconBox',
    description: 'Square icon container with five visual variants, three sizes, and asChild polymorphism for interactive use.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/avatar',
    name: 'Avatar',
    description: 'User identity element with image / initials fallback chain, five sizes, and circle or rounded shape.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/skeleton',
    name: 'Skeleton',
    description: 'Loading placeholder with text / rect / circle variants and pulse / shimmer animations.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/spinner',
    name: 'Spinner',
    description: 'Inline loading indicator with four sizes, three color tones, and accessible status semantics.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/aspect-ratio',
    name: 'AspectRatio',
    description: 'Media container with a fixed aspect ratio for images, video, and embedded iframes.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/edge-bar',
    name: 'EdgeBar',
    description: 'Decorative edge accent — a thin colored strip aligned to one side of a positioned container.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/kpi-value',
    name: 'KpiValue',
    description: 'Universal big-number KPI display with optional unit label and trend indicator. Server-safe with a companion animated count-up wrapper.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/percent-value',
    name: 'KpiValue (percent mode)',
    description: 'Percent-tier rendering via KpiValue — tone-driven color (auto + thresholds + inverse) for low-is-good metrics.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/reveal',
    name: 'Reveal',
    description: 'Scroll-into-view entrance animation primitive with reduced-motion fallback.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/reveal-stack',
    name: 'RevealStack',
    description: 'Stack composition that staggers child Reveal entrances on scroll into view.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/table',
    name: 'Table',
    description: 'Semantic <table> primitives — Table + Header + Body + Footer + Row + Cell. Striped, bordered, and compact variants. Pairs with TanStack Table for sortable / filterable data tables in consumer projects.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },

  // ── Phase 4 — Interactive ──────────────────────────────────────────────
  {
    href: '/components/button',
    name: 'Button',
    description: 'Five variants, three sizes, icon-only mode, href fallback, and asChild polymorphism.',
    phase: 'Phase 4 — Interactive',
    status: 'available',
  },
  {
    href: '/components/button-group',
    name: 'ButtonGroup',
    description: 'Joined row or column of related buttons — collapses inner radii and dedupes 1px borders. Server-safe with required aria-label.',
    phase: 'Phase 4 — Interactive',
    status: 'available',
  },
  {
    href: '/components/input',
    name: 'Input',
    description: 'Headless styled <input> wrapper. Type variants, invalid state, start/end icons, prefix/suffix slots. Pairs with Field for validated form rows.',
    phase: 'Phase 4 — Interactive',
    status: 'available',
  },
  {
    href: '/components/label',
    name: 'Label',
    description: 'Form-coupled label atom with required indicator and visual disabled state. Use directly when composing custom form layouts.',
    phase: 'Phase 4 — Interactive',
    status: 'available',
  },
  {
    href: '/components/textarea',
    name: 'Textarea',
    description: 'Multi-line text input with resize control, error and helper text, and an option for visually-hidden labels.',
    phase: 'Phase 4 — Interactive',
    status: 'available',
  },
  {
    href: '/components/selection',
    name: 'Checkbox + RadioGroup',
    description: 'Native form inputs with custom styling, animated checkmark and radio fill, controlled state, and context-driven groups.',
    phase: 'Phase 4 — Interactive',
    status: 'available',
  },
  {
    href: '/components/toggles',
    name: 'Toggle + Switch + Accordion',
    description: 'Press-state Toggle, segmented ToggleGroup, on/off Switch, and APG-compliant Accordion — four state-heavy interactive primitives.',
    phase: 'Phase 4 — Interactive',
    status: 'available',
  },
  {
    href: '/components/input-production',
    name: 'Input variants',
    description: 'Production input variants — InputGroup, NumberInput, MaskedInput, PhoneInput, PasswordInput.',
    phase: 'Phase 4 — Interactive',
    status: 'available',
  },

  // ── Phase 5 — Feedback ─────────────────────────────────────────────────
  {
    href: '/components/feedback',
    name: 'Feedback',
    description: 'Empty (zero-result slot with optional CTA), Alert (four variants with optional dismiss), Progress (stages or percent — discriminated union).',
    phase: 'Phase 5 — Feedback',
    status: 'available',
  },

  // ── Phase 6 — Specialized ──────────────────────────────────────────────
  {
    href: '/components/specialized',
    name: 'Specialized',
    description: 'Dot, MetricBar, AnimatedCounter, Breadcrumb, Pagination, UsageDonut, AvailabilityBar, and Kbd — focused single-purpose primitives.',
    phase: 'Phase 6 — Specialized',
    status: 'available',
  },
  {
    href: '/components/availability-bar',
    name: 'AvailabilityBar',
    description: 'Day-by-day status strip — ok / warning / down cells in a CSS grid. Summary aria-label with per-day native title tooltips. Server-safe.',
    phase: 'Phase 6 — Specialized',
    status: 'available',
  },
  {
    href: '/components/theme-toggle',
    name: 'ThemeToggle',
    description: 'Single-button light/dark theme switcher driving the html data-theme attribute. Cross-tab sync via the storage event.',
    phase: 'Phase 6 — Specialized',
    status: 'available',
  },

  // ── Phase 7 — Molecules ────────────────────────────────────────────────
  {
    href: '/components/molecules',
    name: 'Molecules',
    description: 'DataRow, BackLink, SectionDivider, AccordionGroup, ToggleGroupFilter, DeadlineBadge — focused two-to-five-atom compositions.',
    phase: 'Phase 7 — Molecules',
    status: 'available',
  },
  {
    href: '/components/header',
    name: 'Header',
    description: 'Universal block-header molecule — body content (children) plus an optional right-aligned actions slot. Renders a semantic <header> element.',
    phase: 'Phase 7 — Molecules',
    status: 'available',
  },
  {
    href: '/components/breakdown-list',
    name: 'BreakdownList',
    description: 'Stacked progress-bar breakdown with label, value, and optional description per item. Brand, success, warning, error, and info tones.',
    phase: 'Phase 7 — Molecules',
    status: 'available',
  },
  {
    href: '/components/metric-tile',
    name: 'MetricTile',
    description: 'Universal metric tile — label, value (free-form ReactNode), optional icon, optional description, and a tone-driven value color.',
    phase: 'Phase 7 — Molecules',
    status: 'available',
  },
  {
    href: '/components/timeline',
    name: 'Timeline',
    description: 'Vertical timeline compound — Timeline + TimelineItem + TimelineMarker + TimelineContent. Connector lines and tone-driven markers.',
    phase: 'Phase 7 — Molecules',
    status: 'available',
  },
  {
    href: '/components/chip',
    name: 'Chip',
    description: 'Display chip with leading icon, label, and optional remove button. Tonal variants for status, category, and tag use cases.',
    phase: 'Phase 7 — Molecules',
    status: 'available',
  },
  {
    href: '/components/file-chip',
    name: 'FileChip',
    description: 'File attachment chip with uploaded / uploading / error variants. Auto-detects the MIME category for the leading icon.',
    phase: 'Phase 7 — Molecules',
    status: 'available',
  },
  {
    href: '/components/icon-button',
    name: 'IconButton',
    description: 'Compact icon-only button molecule — wraps Button with iconOnly = true and a required aria-label.',
    phase: 'Phase 7 — Molecules',
    status: 'available',
  },
  {
    href: '/components/toggle-group-filter',
    name: 'ToggleGroupFilter',
    description: 'Filter-chip row — controlled multi-select wrapper over ToggleGroup with an optional uppercase group label.',
    phase: 'Phase 7 — Molecules',
    status: 'available',
  },

  // ── Phase 8 — Card Presets ─────────────────────────────────────────────
  {
    href: '/components/presets',
    name: 'Card Presets',
    description: 'ContentCard, SidebarCard, FormSurface, StatsCard, ActionCard — opinionated card compositions for common dashboard patterns.',
    phase: 'Phase 8 — Card Presets',
    status: 'available',
  },
  {
    href: '/components/icon-header-card',
    name: 'IconHeaderCard',
    description: 'Universal admin card with an icon-led header, optional badge, and configurable footer. Hosts KpiValue, BreakdownList, or arbitrary content.',
    phase: 'Phase 8 — Card Presets',
    status: 'available',
  },
  {
    href: '/components/entity-card',
    name: 'EntityCard',
    description: 'Universal entity grid-item preset composing Card with structured props for title, badges, meta, and body. (Deprecated — see CHANGELOG.)',
    phase: 'Phase 8 — Card Presets',
    status: 'available',
  },
  {
    href: '/components/entity-hero',
    name: 'EntityHero',
    description: 'Universal entity detail-page hero shell with back-link, title, status indicators, and meta strip. (Deprecated — see CHANGELOG.)',
    phase: 'Phase 8 — Card Presets',
    status: 'available',
  },
  {
    href: '/components/zone-card',
    name: 'ZoneCard',
    description: 'Tonal-zone card preset for status-grouped content. (Deprecated — see CHANGELOG.)',
    phase: 'Phase 8 — Card Presets',
    status: 'available',
  },
  {
    href: '/components/collapsible-zone-card',
    name: 'CollapsibleZoneCard',
    description: 'ZoneCard variant with a built-in expand/collapse summary section. (Deprecated — see CHANGELOG.)',
    phase: 'Phase 8 — Card Presets',
    status: 'available',
  },
  {
    href: '/components/paired-card',
    name: 'PairedCard',
    description: 'Two-pane Card layout for side-by-side comparison patterns. (Deprecated — see CHANGELOG.)',
    phase: 'Phase 8 — Card Presets',
    status: 'available',
  },
  {
    href: '/components/page-header',
    name: 'PageHeader',
    description: 'Page-level hero header with eyebrow, heading, description, and action row. (Deprecated — replaced by Header. See CHANGELOG.)',
    phase: 'Phase 8 — Card Presets',
    status: 'available',
  },
  {
    href: '/components/section-header',
    name: 'SectionHeader',
    description: 'Section-level header with title and action row. (Deprecated — replaced by Header. See CHANGELOG.)',
    phase: 'Phase 8 — Card Presets',
    status: 'available',
  },
  {
    href: '/components/site-header',
    name: 'SiteHeader',
    description: 'Page-level site navigation with mobile drawer. (Deprecated — see CHANGELOG.)',
    phase: 'Phase 8 — Card Presets',
    status: 'available',
  },
  {
    href: '/components/app-shell',
    name: 'AppShell',
    description: 'Application shell composition combining Sidebar, top navigation, and main content. (Deprecated — see CHANGELOG.)',
    phase: 'Phase 8 — Card Presets',
    status: 'available',
  },

  // ── Phase 9 — Demo & Docs ──────────────────────────────────────────────
  {
    href: '/demo',
    name: 'Demo showcase',
    description: 'One-stop showcase of every component with runtime light/dark theme toggle.',
    phase: 'Phase 9 — Demo & Docs',
    status: 'available',
  },

  // ── Phase 10 — Complex Interactive ─────────────────────────────────────
  {
    href: '/components/dialog',
    name: 'Dialog',
    description: 'Modal dialog with portal, focus trap, scroll lock, and Escape close. Implements the WAI-ARIA APG /dialog-modal/ pattern.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/alert-dialog',
    name: 'AlertDialog',
    description: 'Modal alert dialog with required aria-describedby, least-destructive initial focus, and a confirm/cancel action row. APG /alertdialog/.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/drawer',
    name: 'Drawer',
    description: 'Bottom-positioned modal sheet with slide-up animation, sticky footer, and iOS safe-area-inset handling.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/sheet',
    name: 'Sheet',
    description: 'Four-directional side panel (left / right / top / bottom) with per-side animation and width or height variants.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/tooltip',
    name: 'Tooltip',
    description: 'Modeless floating label on hover and focus. Twelve placements with flip and shift, optional delay group provider, and SC 1.4.13 compliance. APG /tooltip/.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/popover',
    name: 'Popover',
    description: 'Floating panel anchored to a trigger. Optional arrow, non-modal default with opt-in modal mode, outside-click and Escape dismiss.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/dropdown-menu',
    name: 'DropdownMenu',
    description: 'Accessible menu with seven compound exports. Full APG /menu/ keyboard model — arrow cycle with wraparound, Home/End, multi-character typeahead, Escape.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/context-menu',
    name: 'ContextMenu',
    description: 'Right-click menu per APG /menu/. Inherits the DropdownMenu keyboard model and adds positioning at the cursor and native context-menu suppression.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/hover-card',
    name: 'HoverCard',
    description: 'Hover-triggered floating surface for rich contextual content (user previews, link previews). Delay group provider and grace-area dismiss.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/navigation-menu',
    name: 'NavigationMenu',
    description: 'Accessible navigation menubar per APG /menubar/. Roving tabindex, hover and click and keyboard activation, scope-aware Home/End and typeahead.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/tabs',
    name: 'Tabs',
    description: 'Accessible tabs widget per APG /tabs/. Three visual variants, horizontal and vertical orientation, automatic or manual activation, RTL support.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/select',
    name: 'Select',
    description: 'Single-value select form field per APG /combobox/ collapsed-listbox + /listbox/. Eight compound exports, full keyboard model with typeahead, hidden-input form participation.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/combobox',
    name: 'Combobox',
    description: 'Editable single- or multi-select form field per APG /combobox/ with live filter. Multi-select renders inline chips with Backspace-to-remove. FormData multi-value serialization.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/calendar',
    name: 'Calendar',
    description: 'Standalone month-view calendar with keyboard navigation, range selection, and locale-aware day labels.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/date-picker',
    name: 'DatePicker',
    description: 'Date input combining a Calendar popover with a typed input fallback. Supports min/max bounds and disabled-date predicates.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/toast',
    name: 'Toast',
    description: 'Non-modal notification toaster with auto-dismiss timer, action slot, and stacked toast queue.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/slider',
    name: 'Slider',
    description: 'Single-thumb value selector per APG /slider/. Keyboard arrow steps with Shift large-step, RTL mirror, decimal-step precision-safe, hidden range input for forms.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/carousel',
    name: 'Carousel',
    description: 'Auto-rotating content slider per APG /carousel/. WCAG 2.2.2 pause control, polite live region, pointer-drag, RTL-mirrored arrow keys.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/scroll-area',
    name: 'ScrollArea',
    description: 'Custom-scrollbar wrapper preserving native scroll. Four visibility modes, proportional thumb sizing, pointer-coarse fallback to native scrollbars.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/input-otp',
    name: 'InputOTP',
    description: 'One-time password / verification code entry. Pattern-aware filter (numeric / alphanumeric / custom), iOS SMS autofill, paste-friendly.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/command',
    name: 'Command',
    description: 'Command palette combining APG /combobox/ + /dialog-modal/. Filtered listbox, Cmd+K shortcut hook, decorative shortcut chips, modal focus trap.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/sidebar',
    name: 'Sidebar',
    description: 'Responsive navigation sidebar — fixed desktop rail and mobile drawer with focus trap. Nine compound exports plus a useSidebar hook for keyboard shortcuts.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/form',
    name: 'Form',
    description: 'Accessible form root with validation gating. Pairs with Field for declarative label / control / description / message wiring.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/field',
    name: 'Field',
    description: 'Form-row compound — Field + Label + Control + Description + Message. Native HTML5 Constraint Validation API; integrates with Form or works standalone.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/toolbar',
    name: 'Toolbar',
    description: 'Accessible toolbar per APG /toolbar/. Roving tabindex, separators, optional orientation, RTL-aware arrow keys.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
];

export default function HomePage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Heading level={1} size="3xl">@bleizlabs/ui</Heading>
        <p>
          Interactive playground for every component shipped by the library.
          Each link below renders a single component in isolation against the
          live token system — switch themes, exercise keyboard models, and
          inspect ARIA contracts in real time.
        </p>
      </header>
      <ul className={styles.grid}>
        {components.map((c) => (
          <li key={c.href} className={styles.card} data-status={c.status}>
            <Link href={c.href}>
              <span className={styles.phase}>{c.phase}</span>
              <strong>{c.name}</strong>
              <span className={styles.description}>{c.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
