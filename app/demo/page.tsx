'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Layout (Phase 1)
import { Stack } from '@/components/layout/Stack';
import { Inline } from '@/components/layout/Inline';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';

// Typography (Phase 2)
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';

// Display (Phase 3)
import {
  Card,
  CardHeader,
  CardBody,
} from '@/components/display/Card';
import { Badge } from '@/components/display/Badge';
import { Separator } from '@/components/display/Separator';
import { IconBox } from '@/components/display/IconBox';
import { Avatar } from '@/components/display/Avatar';
import { Skeleton } from '@/components/display/Skeleton';
import { Spinner } from '@/components/display/Spinner';
import { AspectRatio } from '@/components/display/AspectRatio';

// Interactive (Phase 4)
import { Button } from '@/components/interactive/Button';
import { ButtonGroup } from '@/components/interactive/ButtonGroup';
import { Input } from '@/components/interactive/Input';
import { Textarea } from '@/components/interactive/Textarea';
import { Checkbox } from '@/components/interactive/Checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/interactive/RadioGroup';
import { Toggle } from '@/components/interactive/Toggle';
import { ToggleGroup } from '@/components/interactive/ToggleGroup';
import { Switch } from '@/components/interactive/Switch';
import { Accordion } from '@/components/interactive/Accordion';
import { InputGroup, InputGroupText } from '@/components/interactive/InputGroup';
import { NumberInput } from '@/components/interactive/NumberInput';
import { PhoneInput } from '@/components/interactive/PhoneInput';
import { PasswordInput } from '@/components/interactive/PasswordInput';

// Feedback (Phase 5)
import { Empty } from '@/components/feedback/Empty';
import { Alert } from '@/components/feedback/Alert';
import { Progress } from '@/components/feedback/Progress';

// Specialized (Phase 6)
import { Dot } from '@/components/specialized/Dot';
import { MetricBar } from '@/components/specialized/MetricBar';
import { AnimatedCounter } from '@/components/specialized/AnimatedCounter';
import { Breadcrumb } from '@/components/specialized/Breadcrumb';
import { Pagination } from '@/components/specialized/Pagination';
import { UsageDonut } from '@/components/specialized/UsageDonut';
import { AvailabilityBar } from '@/components/specialized/AvailabilityBar';
import { Kbd } from '@/components/specialized/Kbd';

// Molecules (Phase 7)
import { DataRow } from '@/components/molecules/DataRow';
import { BackLink } from '@/components/molecules/BackLink';
import { SectionDivider } from '@/components/molecules/SectionDivider';
import { AccordionGroup } from '@/components/molecules/AccordionGroup';
import { ToggleGroupFilter } from '@/components/molecules/ToggleGroupFilter';
import { DeadlineBadge } from '@/components/molecules/DeadlineBadge';

// Presets (Phase 8)
import { ContentCard } from '@/components/presets/ContentCard';
import { SidebarCard } from '@/components/presets/SidebarCard';
import { FormCard } from '@/components/presets/FormCard';
import { StatsCard } from '@/components/presets/StatsCard';
import { ActionCard } from '@/components/presets/ActionCard';

// Complex interactive (Phase 10)
import { Dialog } from '@/components/complex/Dialog';
import { AlertDialog } from '@/components/complex/AlertDialog';
import { Drawer } from '@/components/complex/Drawer';

import styles from './page.module.scss';

type Theme = 'light' | 'dark';

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M7 15l4-4 4 4 5-5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

const PHASES = [
  { id: 'phase-1', label: 'Phase 1 Layout' },
  { id: 'phase-2', label: 'Phase 2 Typography' },
  { id: 'phase-3', label: 'Phase 3 Display' },
  { id: 'phase-4', label: 'Phase 4 Interactive' },
  { id: 'phase-5', label: 'Phase 5 Feedback' },
  { id: 'phase-6', label: 'Phase 6 Specialized' },
  { id: 'phase-7', label: 'Phase 7 Molecules' },
  { id: 'phase-8', label: 'Phase 8 Presets' },
  { id: 'phase-10', label: 'Phase 10 Complex' },
];

// Deterministic future dates (SSR-safe via string literal)
const DEADLINE_SOON = '2026-04-17';
const DEADLINE_LATER = '2026-05-01';

const AVAILABILITY_DAYS = Array.from({ length: 21 }, (_, i) => {
  const day = new Date(2026, 3, i + 1);
  const iso = day.toISOString().slice(0, 10);
  const status = i === 5 || i === 12 ? 'warning' : i === 18 ? 'down' : 'ok';
  return { date: iso, status: status as 'ok' | 'warning' | 'down' };
});

export default function DemoPage() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const [checked, setChecked] = useState(true);
  const [switched, setSwitched] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [radio, setRadio] = useState('b');
  const [toggle, setToggle] = useState(false);
  const [toggleGroup, setToggleGroup] = useState('grid');
  const [page, setPage] = useState(3);
  const [filter, setFilter] = useState<string[]>(['active']);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back to dev index
        </Link>
        <div className={styles.titleRow}>
          <div>
            <Heading level={1} size="4xl">
              bleizlabs-ui demo
            </Heading>
            <Text className={styles.intro}>
              Complete showcase of all 58 components — 47 atoms + 6 molecules +
              5 Card presets. Toggle theme to inspect light + dark tokens.
              Per-component deep dives live under{' '}
              <Link href="/">/components/*</Link>.
            </Text>
          </div>
          <button
            type="button"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            className={styles.themeToggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        <nav aria-label="Phase sections" className={styles.anchorNav}>
          {PHASES.map((phase) => (
            <a key={phase.id} href={`#${phase.id}`} className={styles.anchor}>
              {phase.label}
            </a>
          ))}
        </nav>
      </header>

      {/* ==================================================================== */}
      {/* PHASE 1 — LAYOUT                                                      */}
      {/* ==================================================================== */}
      <section id="phase-1" className={styles.section}>
        <Heading level={2} size="2xl">
          Phase 1 — Layout
        </Heading>
        <Text color="muted">Stack, Inline, Container, Section — flex primitives + semantic bands.</Text>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            Stack
          </Text>
          <Stack gap={3}>
            <Text>Vertical flex.</Text>
            <Text>Divider prop, align/justify, asChild.</Text>
            <Text>SpaceIndex gap.</Text>
          </Stack>
        </div>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            Inline
          </Text>
          <Inline gap={3} align="center">
            <Badge color="brand">Tag 1</Badge>
            <Badge color="success">Tag 2</Badge>
            <Badge color="warning">Tag 3</Badge>
            <Badge color="info">Tag 4</Badge>
          </Inline>
        </div>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            Container + Section
          </Text>
          <Section bg="raised" py={4}>
            <Container size="md">
              <Text>Container caps max-width + Section adds a semantic band with background.</Text>
            </Container>
          </Section>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PHASE 2 — TYPOGRAPHY                                                  */}
      {/* ==================================================================== */}
      <section id="phase-2" className={styles.section}>
        <Heading level={2} size="2xl">
          Phase 2 — Typography
        </Heading>
        <Text color="muted">Heading, Text — semantic scale + decoupled visual size.</Text>

        <div className={styles.demoCard}>
          <Stack gap={2}>
            <Heading level={3} size="3xl">
              Heading 3xl
            </Heading>
            <Heading level={3} size="xl" color="brand">
              Heading xl brand color
            </Heading>
            <Text variant="lead">Lead text — larger intro paragraph.</Text>
            <Text variant="body">Body text — default paragraph.</Text>
            <Text variant="body-strong">Body strong — semibold emphasis.</Text>
            <Text variant="small" color="muted">
              Small muted — secondary metadata.
            </Text>
            <Text variant="caption" uppercase color="muted">
              Caption uppercase
            </Text>
          </Stack>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PHASE 3 — DISPLAY                                                     */}
      {/* ==================================================================== */}
      <section id="phase-3" className={styles.section}>
        <Heading level={2} size="2xl">
          Phase 3 — Display
        </Heading>
        <Text color="muted">
          Card + 4 slots, Badge, Separator, IconBox, Avatar, Skeleton, Spinner, AspectRatio.
        </Text>

        <div className={styles.grid}>
          <Card variant="default">
            <CardHeader border>
              <Heading level={3} size="md">
                Default card
              </Heading>
              <Text variant="caption" color="muted">
                With header border
              </Text>
            </CardHeader>
            <CardBody>
              <Text>Card atom + slots composed manually.</Text>
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardBody>
              <Stack gap={2}>
                <Heading level={3} size="md">
                  Elevated
                </Heading>
                <Text variant="small" color="muted">
                  Adds shadow-md at rest.
                </Text>
              </Stack>
            </CardBody>
          </Card>

          <Card variant="accent" accentPosition="left">
            <CardBody>
              <Stack gap={2}>
                <Heading level={3} size="md">
                  Accent
                </Heading>
                <Text variant="small" color="muted">
                  Left brand accent stripe.
                </Text>
              </Stack>
            </CardBody>
          </Card>

          <Card variant="glass">
            <CardBody>
              <Stack gap={2}>
                <Heading level={3} size="md">
                  Glass
                </Heading>
                <Text variant="small" color="muted">
                  backdrop-filter blur + semi-transparent.
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </div>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            Badges
          </Text>
          <Inline gap={2} wrap>
            <Badge color="default">Default</Badge>
            <Badge color="brand">Brand</Badge>
            <Badge color="success">Success</Badge>
            <Badge color="warning">Warning</Badge>
            <Badge color="error">Error</Badge>
            <Badge color="info">Info</Badge>
            <Badge color="brand" dot>
              With dot
            </Badge>
            <Badge color="success" pill>
              Pill
            </Badge>
            <Badge color="warning" uppercase>
              Uppercase
            </Badge>
          </Inline>
        </div>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            Separators, IconBoxes, Avatars
          </Text>
          <Stack gap={4}>
            <Separator />
            <Separator variant="gradient" />
            <Separator variant="brand" />
            <Inline gap={3}>
              <IconBox icon={<ChartIcon />} variant="default" />
              <IconBox icon={<ChartIcon />} variant="brand" />
              <IconBox icon={<ChartIcon />} variant="success" />
              <IconBox icon={<ChartIcon />} variant="error" />
              <IconBox icon={<ChartIcon />} variant="plain" />
            </Inline>
            <Inline gap={3} align="center">
              <Avatar alt="Anna Kowalska" fallback="AK" size="xs" />
              <Avatar alt="Jan Kowalski" fallback="JK" size="sm" />
              <Avatar alt="Marta Bak" fallback="MB" size="md" status="online" />
              <Avatar alt="Piotr Wolski" fallback="PW" size="lg" status="busy" />
              <Avatar
                alt="Tomasz Nowak"
                fallback="TN"
                size="xl"
                shape="rounded"
                status="away"
              />
            </Inline>
          </Stack>
        </div>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            Skeleton, Spinner, AspectRatio
          </Text>
          <Stack gap={3}>
            <Skeleton variant="text" lines={3} />
            <Skeleton variant="rect" style={{ height: 64 }} />
            <Inline gap={3} align="center">
              <Spinner size="xs" />
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" color="brand" />
            </Inline>
            <AspectRatio ratio={16 / 9}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'var(--color-surface-raised)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text variant="small" color="muted">
                  16:9
                </Text>
              </div>
            </AspectRatio>
          </Stack>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PHASE 4 — INTERACTIVE                                                 */}
      {/* ==================================================================== */}
      <section id="phase-4" className={styles.section}>
        <Heading level={2} size="2xl">
          Phase 4 — Interactive
        </Heading>
        <Text color="muted">
          Button, ButtonGroup, Input + production hardening (InputGroup, NumberInput, PhoneInput, PasswordInput), form controls, Accordion.
        </Text>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            Buttons
          </Text>
          <Inline gap={3} wrap>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </Inline>
          <Inline gap={3}>
            <ButtonGroup aria-label="Sizes">
              <Button variant="secondary" size="sm">
                Small
              </Button>
              <Button variant="secondary" size="md">
                Medium
              </Button>
              <Button variant="secondary" size="lg">
                Large
              </Button>
            </ButtonGroup>
          </Inline>
        </div>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            Inputs
          </Text>
          <Stack gap={3}>
            <Input
              name="demoName"
              label="Name"
              placeholder="Jan Kowalski"
              helperText="Imię i nazwisko"
            />
            <Input
              name="demoEmail"
              label="Email"
              type="email"
              placeholder="jan@example.com"
              error="Nieprawidłowy email"
            />
            <InputGroup aria-label="Price with currency">
              <InputGroupText>$</InputGroupText>
              <Input label="Price" name="demoPrice" hideLabel placeholder="100" />
              <InputGroupText>USD</InputGroupText>
            </InputGroup>
            <NumberInput
              name="demoNumber"
              label="Amount"
              locale="pl-PL"
              currency="PLN"
              defaultValue={1234.56}
            />
            <PhoneInput name="demoPhone" label="Phone" defaultValue="+48 500 100 200" />
            <PasswordInput
              name="demoPassword"
              label="Password"
              showStrength
              defaultValue="Hello123!"
            />
            <Textarea
              name="demoBio"
              label="Bio"
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </Stack>
        </div>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            Selection controls
          </Text>
          <Stack gap={3}>
            <Checkbox
              name="demoTerms"
              checked={checked}
              onChange={(e) => setChecked(e.currentTarget.checked)}
            >
              Accept terms
            </Checkbox>
            <Switch
              name="demoNotifs"
              label="Enable notifications"
              checked={switched}
              onCheckedChange={setSwitched}
            />
            <RadioGroup
              name="demoRadio"
              value={radio}
              onValueChange={setRadio}
              aria-label="Plan"
            >
              <RadioGroupItem value="a" title="Basic" />
              <RadioGroupItem value="b" title="Pro" />
              <RadioGroupItem value="c" title="Enterprise" />
            </RadioGroup>
            <Inline gap={3}>
              <Toggle
                pressed={toggle}
                onPressedChange={setToggle}
                aria-label="Bold"
              >
                Bold
              </Toggle>
              <ToggleGroup
                type="single"
                value={toggleGroup}
                onValueChange={(v) => setToggleGroup(v ?? 'grid')}
                aria-label="Layout"
              >
                <Toggle value="grid">Grid</Toggle>
                <Toggle value="list">List</Toggle>
                <Toggle value="compact">Compact</Toggle>
              </ToggleGroup>
            </Inline>
          </Stack>
        </div>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            Accordion
          </Text>
          <Accordion defaultOpen question="What is bleizlabs-ui?">
            <Text>
              A universal fully-styled React component library for BleizLabs.
              Copy-to-project. Zero runtime UI dependencies.
            </Text>
          </Accordion>
          <Accordion question="Can I theme it?">
            <Text>
              Yes — change seeds in `_project-settings.scss`. Light + dark themes
              via `[data-theme]` attribute (toggle in header).
            </Text>
          </Accordion>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PHASE 5 — FEEDBACK                                                    */}
      {/* ==================================================================== */}
      <section id="phase-5" className={styles.section}>
        <Heading level={2} size="2xl">
          Phase 5 — Feedback
        </Heading>
        <Text color="muted">Empty, Alert, Progress — state indicators.</Text>

        <div className={styles.grid}>
          <Empty
            icon={<InboxIcon />}
            title="No messages"
            description="You're all caught up."
            cta={<Button variant="secondary">Refresh</Button>}
          />
          <Alert variant="info" title="Heads up">
            A new version is available — reload to update.
          </Alert>
        </div>

        <div className={styles.demoCard}>
          <Stack gap={3}>
            <Alert variant="success" title="Saved">
              Your changes have been saved successfully.
            </Alert>
            <Alert variant="warning" title="Storage warning">
              You&apos;re using 85% of your quota.
            </Alert>
            <Alert variant="critical" title="Payment failed">
              Your last subscription charge was declined.
            </Alert>
          </Stack>
        </div>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            Progress
          </Text>
          <Stack gap={3}>
            <Progress label="Upload" value={72} max={100} />
            <Progress
              label="Setup"
              stages={['Account', 'Profile', 'Billing', 'Done']}
              currentStage={2}
            />
          </Stack>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PHASE 6 — SPECIALIZED                                                 */}
      {/* ==================================================================== */}
      <section id="phase-6" className={styles.section}>
        <Heading level={2} size="2xl">
          Phase 6 — Specialized
        </Heading>
        <Text color="muted">
          Dot, MetricBar, AnimatedCounter, Breadcrumb, Pagination, UsageDonut, AvailabilityBar, Kbd.
        </Text>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            Dots + MetricBar + AnimatedCounter
          </Text>
          <Stack gap={3}>
            <Inline gap={3} align="center">
              <Dot color="success" label="Online" />
              <Dot color="warning" pulse label="Pending" />
              <Dot color="error" label="Offline" />
              <Dot color="info" label="Syncing" />
            </Inline>
            <MetricBar label="Storage used" used={42} total={100} unit="GB" />
            <Heading level={3} size="3xl">
              <AnimatedCounter value={1247} start />
            </Heading>
          </Stack>
        </div>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            Navigation
          </Text>
          <Stack gap={3}>
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Components', href: '/' },
                { label: 'Demo' },
              ]}
            />
            <Pagination
              variant="full"
              currentPage={page}
              totalPages={12}
              onPageChange={setPage}
            />
          </Stack>
        </div>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            UsageDonut, AvailabilityBar, Kbd
          </Text>
          <div className={styles.specializedGrid}>
            <UsageDonut
              label="Monthly spend"
              segments={[
                { label: 'Compute', value: 45 },
                { label: 'Storage', value: 25 },
                { label: 'Network', value: 15 },
                { label: 'Other', value: 10 },
              ]}
              total={100}
            />
            <Stack gap={3}>
              <AvailabilityBar label="Last 21 days uptime" segments={AVAILABILITY_DAYS} />
              <Inline gap={2} align="center">
                <Kbd>Ctrl</Kbd>
                <Text variant="small" color="muted">
                  +
                </Text>
                <Kbd>K</Kbd>
                <Text variant="small" color="muted">
                  opens the command palette
                </Text>
              </Inline>
            </Stack>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PHASE 7 — MOLECULES                                                   */}
      {/* ==================================================================== */}
      <section id="phase-7" className={styles.section}>
        <Heading level={2} size="2xl">
          Phase 7 — Molecules
        </Heading>
        <Text color="muted">
          DataRow, BackLink, SectionDivider, AccordionGroup, ToggleGroupFilter, DeadlineBadge.
        </Text>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            DataRow + DeadlineBadge
          </Text>
          <Stack gap={2}>
            <DataRow label="Status" value={<Badge color="success">Active</Badge>} />
            <DataRow label="Plan" value="Pro" />
            <DataRow label="Next charge" value="2026-05-01" />
            <DataRow label="Deadline" value={<DeadlineBadge deadline={DEADLINE_SOON} />} />
            <DataRow label="Review" value={<DeadlineBadge deadline={DEADLINE_LATER} />} />
          </Stack>
        </div>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            SectionDivider + BackLink
          </Text>
          <Stack gap={3}>
            <BackLink href="/" label="Back to list" />
            <SectionDivider align="left">Details</SectionDivider>
            <Text>Content in first section.</Text>
            <SectionDivider align="center">Metadata</SectionDivider>
            <Text>Content in second section.</Text>
          </Stack>
        </div>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            AccordionGroup (single mode)
          </Text>
          <AccordionGroup mode="single">
            <Accordion question="Account settings">
              <Text>Profile, password, email preferences.</Text>
            </Accordion>
            <Accordion question="Billing">
              <Text>Plan, invoices, payment method.</Text>
            </Accordion>
            <Accordion question="Team">
              <Text>Invite members, assign roles.</Text>
            </Accordion>
          </AccordionGroup>
        </div>

        <div className={styles.demoCard}>
          <Text variant="caption" color="muted" uppercase>
            ToggleGroupFilter
          </Text>
          <ToggleGroupFilter
            label="Filter status"
            value={filter}
            onValueChange={setFilter}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'paused', label: 'Paused' },
              { value: 'done', label: 'Done' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PHASE 8 — CARD PRESETS                                                */}
      {/* ==================================================================== */}
      <section id="phase-8" className={styles.section}>
        <Heading level={2} size="2xl">
          Phase 8 — Card Presets
        </Heading>
        <Text color="muted">
          ContentCard, SidebarCard, FormCard, StatsCard, ActionCard — compositional presets over Card + slots.
        </Text>

        <div className={styles.grid}>
          <ContentCard
            title="ContentCard"
            description="Flagship defaults p=5 r=lg with title/description/footer slots and scalar auto-wrap."
          >
            <Text>
              Title strings auto-wrap in a Heading level 3; descriptions in a
              muted Text. Pass ReactNode to bypass the wrapper.
            </Text>
          </ContentCard>

          <SidebarCard label="Navigation" title="Sidebar">
            <Text variant="small">Profile</Text>
            <Text variant="small">Billing</Text>
            <Text variant="small">Settings</Text>
          </SidebarCard>

          <FormCard
            asForm={false}
            title="FormCard"
            description="Renders a <form> element by default; asForm=false switches to plain card."
            footer={<Button variant="ghost">Close preview</Button>}
          >
            <Text>
              Wraps the inner Card via display: contents so the form has zero
              visual footprint.
            </Text>
          </FormCard>

          <StatsCard
            label="Monthly revenue"
            value="$12,345"
            change={<Badge color="success">+12%</Badge>}
          />

          <StatsCard
            layout="icon-lead"
            icon={<ChartIcon />}
            iconVariant="brand"
            label="Conversions"
            value={428}
            change={<Badge color="brand">+18 WoW</Badge>}
          />

          <ActionCard
            severity="warning"
            icon={<AlertIcon />}
            title="Storage almost full"
            description="You're using 92% of your 50 GB quota."
            cta={<Button variant="primary">Upgrade plan</Button>}
          />
        </div>
      </section>

      <section id="phase-10" className={styles.section}>
        <Heading level={2} size="2xl">
          Phase 10 — Complex Interactive
        </Heading>
        <Text color="muted">
          Dialog (E15 CI1) + AlertDialog (E16 CI2) + Drawer (E17 CI3) — portal + focus trap + scroll lock + background inert. Own build per WAI-ARIA APG (zero runtime UI deps, D5/D25). Remaining 19 components land per-Epic.
        </Text>

        <div className={styles.grid}>
          <Card>
            <CardHeader>
              <Heading level={3} size="lg">Dialog</Heading>
            </CardHeader>
            <CardBody>
              <Stack gap={3}>
                <Text variant="small" color="muted">
                  Generic modal with optional description. Overlay click + Escape close by default.
                </Text>
                <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
              </Stack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading level={3} size="lg">AlertDialog</Heading>
            </CardHeader>
            <CardBody>
              <Stack gap={3}>
                <Text variant="small" color="muted">
                  Blocking alert with required description + severity. Initial focus on Cancel. Overlay click blocked.
                </Text>
                <Button variant="warning" onClick={() => setAlertOpen(true)}>
                  Open AlertDialog
                </Button>
              </Stack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading level={3} size="lg">Drawer</Heading>
            </CardHeader>
            <CardBody>
              <Stack gap={3}>
                <Text variant="small" color="muted">
                  Bottom-positioned sheet. Slide-up animation, sticky footer, iOS safe-area. Reuses useFocusTrap.
                </Text>
                <Button onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
              </Stack>
            </CardBody>
          </Card>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Generic dialog"
          description="This is a Dialog — dismissible via Escape, overlay click, or the close button."
          footer={
            <>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setDialogOpen(false)}>OK</Button>
            </>
          }
        >
          <Text>
            Dialog is the flexible modal primitive. Use it for forms, settings,
            info panes. For blocking destructive confirms use AlertDialog.
          </Text>
        </Dialog>

        <AlertDialog
          open={alertOpen}
          onOpenChange={setAlertOpen}
          title="Delete workspace?"
          description="This action cannot be undone. All workspace data will be permanently removed."
          severity="critical"
          confirmLabel="Delete"
          onConfirm={() => setAlertOpen(false)}
          onCancel={() => setAlertOpen(false)}
        />

        <Drawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title="Filter results"
          description="Bottom-positioned sheet with slide-up animation and sticky footer."
          footer={
            <>
              <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setDrawerOpen(false)}>Apply</Button>
            </>
          }
        >
          <Text>
            Drawer is the bottom-sheet primitive. Use it for mobile filter
            panels, action sheets, and detail views. Reuses <code>useFocusTrap</code>,
            portal, scroll lock, Escape, and inert from Dialog pattern.
          </Text>
        </Drawer>
      </section>

      <footer className={styles.footer}>
        <Text variant="small" color="muted">
          61/80 components live · Phase 0-9 complete + Phase 10 in progress (3/22) · See{' '}
          <Link href="/">dev index</Link> for per-component playgrounds.
        </Text>
      </footer>
    </main>
  );
}
