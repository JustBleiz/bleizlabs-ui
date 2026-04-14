import Link from 'next/link';
import styles from './page.module.scss';

interface ComponentLink {
  href: string;
  name: string;
  description: string;
  phase: string;
  status: 'available' | 'pending';
}

const components: ComponentLink[] = [
  {
    href: '/components/stack',
    name: 'Stack',
    description: 'Vertical flex layout atom with gap, align, justify, divider.',
    phase: 'Phase 1 — Layout',
    status: 'available',
  },
  {
    href: '/components/inline',
    name: 'Inline',
    description: 'Horizontal flex layout atom with wrap and collapseBelow.',
    phase: 'Phase 1 — Layout',
    status: 'available',
  },
  {
    href: '/components/container',
    name: 'Container',
    description: 'Max-width centered wrapper with size + padding variants.',
    phase: 'Phase 1 — Layout',
    status: 'available',
  },
  {
    href: '/components/section',
    name: 'Section',
    description:
      'Full-width semantic band with bg variants and tag override.',
    phase: 'Phase 1 — Layout',
    status: 'available',
  },
  {
    href: '/components/heading',
    name: 'Heading',
    description:
      'Semantic h1-h6 with decoupled visual size, weight, color, align, asChild.',
    phase: 'Phase 2 — Typography',
    status: 'available',
  },
  {
    href: '/components/text',
    name: 'Text',
    description:
      'Universal body text with five variants, weight, color, uppercase, asChild.',
    phase: 'Phase 2 — Typography',
    status: 'available',
  },
  {
    href: '/components/card',
    name: 'Card',
    description:
      'Surface container with 4 variants, hoverable, accent positions, and 4 flat slot components.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/badge',
    name: 'Badge',
    description:
      'Inline status / category indicator with 6 colors, pill, dot, icon, uppercase, asChild.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/separator',
    name: 'Separator',
    description:
      'Divider line with subtle / gradient / brand variants, horizontal + vertical orientation.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/icon-box',
    name: 'IconBox',
    description:
      'Square icon container with 5 variants, 3 sizes, and asChild for interactive use.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/avatar',
    name: 'Avatar',
    description:
      'User identity with image / initials fallback chain, 5 sizes, status indicator.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/skeleton',
    name: 'Skeleton',
    description:
      'Loading placeholder with text / rect / circle variants and pulse / shimmer animations.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/spinner',
    name: 'Spinner',
    description:
      'Inline loading indicator with 4 sizes, 3 colors, and accessible status semantics.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/aspect-ratio',
    name: 'AspectRatio',
    description:
      'Media container with fixed aspect ratio for images, video, iframes (Tier B).',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/button',
    name: 'Button + ButtonGroup',
    description:
      '5 variants, 3 sizes, icon + iconOnly + href fallback + asChild. ButtonGroup joins via joined-group mixin (server-safe).',
    phase: 'Phase 4 — Simple Interactive',
    status: 'available',
  },
  {
    href: '/components/input',
    name: 'Input + Label + Textarea',
    description:
      'Form trio with controlled / uncontrolled state, auto-id label coupling, error + helper, start/end icons.',
    phase: 'Phase 4 — Simple Interactive',
    status: 'available',
  },
  {
    href: '/components/selection',
    name: 'Checkbox + RadioGroup',
    description:
      'Native form inputs with custom styling, checkmark + radioFill animations, controlled state, context-driven group.',
    phase: 'Phase 4 — Simple Interactive',
    status: 'available',
  },
  {
    href: '/components/toggles',
    name: 'Toggle + Switch + Accordion',
    description:
      'Toggle (aria-pressed), ToggleGroup (single/multiple, joined-group reuse), Switch (animated thumb), Accordion (APG disclosure).',
    phase: 'Phase 4 — Simple Interactive',
    status: 'available',
  },
  {
    href: '/components/input-production',
    name: 'Input Production Hardening',
    description:
      'E08 — Input prefix/suffix/counter/clearable/loading, InputGroup + InputGroupText, NumberInput, MaskedInput, PhoneInput, PasswordInput.',
    phase: 'Phase 4 — Simple Interactive (E08)',
    status: 'available',
  },
  {
    href: '/components/feedback',
    name: 'Feedback',
    description:
      'E09 — Empty (zero-result slot + CTA), Alert (4 variants + opt-in dismiss + href body), Progress (discriminated union stages XOR percent).',
    phase: 'Phase 5 — Feedback',
    status: 'available',
  },
  {
    href: '/components/specialized',
    name: 'Specialized',
    description:
      'E10+E11 — Dot, MetricBar, AnimatedCounter, Breadcrumb, Pagination (Tier A) + UsageDonut, AvailabilityBar, Kbd (Tier B). Phase 6 complete.',
    phase: 'Phase 6 — Specialized',
    status: 'available',
  },
  {
    href: '/components/molecules',
    name: 'Molecules',
    description:
      'E12 — DataRow, BackLink, SectionDivider, AccordionGroup (single/multiple), ToggleGroupFilter, DeadlineBadge (hydration-safe countdown).',
    phase: 'Phase 7 — Molecules',
    status: 'available',
  },
  {
    href: '/components/presets',
    name: 'Card Presets',
    description:
      'E13 — ContentCard, SidebarCard, FormCard, StatsCard (stacked/inline/icon-lead), ActionCard (severity-driven accent).',
    phase: 'Phase 8 — Card Presets',
    status: 'available',
  },
  {
    href: '/demo',
    name: 'Demo showcase',
    description:
      'E14 — one-stop showcase of all 58 components in 8 phase sections with runtime theme toggle.',
    phase: 'Phase 9 — Demo & Docs',
    status: 'available',
  },
  {
    href: '/components/dialog',
    name: 'Dialog',
    description:
      'E15 CI1 — modal dialog with portal, focus trap, scroll lock, Escape close. First Phase 10 complex interactive. APG /dialog-modal/ pattern.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/alert-dialog',
    name: 'AlertDialog',
    description:
      'E16 CI2 — modal alert dialog with required aria-describedby, least-destructive initial focus, background inert, confirm/cancel action row. APG /alertdialog/ pattern. Reuses useFocusTrap from Dialog.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/drawer',
    name: 'Drawer',
    description:
      'E17 CI3 — bottom-positioned modal sheet. Slide-up keyframe, top-only border-radius, iOS safe-area-inset, sticky footer with scrollable body, height variants (sm/md/lg dvh). APG /dialog-modal/ modifier. Reuses useFocusTrap from Dialog.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/sheet',
    name: 'Sheet',
    description:
      'E18 CI4 — 4-directional side panel (left/right/top/bottom). Per-side animation, inner-corner border-radius, safe-area-inset. Horizontal uses width variants, vertical uses height. Closes the Drawer family. Reuses useFocusTrap.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
];

export default function HomePage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>bleizlabs-ui</h1>
        <p>
          Internal dev playground. Each link below renders a component in
          isolation against the live token system.
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
