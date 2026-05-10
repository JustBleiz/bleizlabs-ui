import Link from 'next/link';
import { ContentCard } from '@/components/presets/ContentCard';
import { SidebarCard } from '@/components/presets/SidebarCard';
import { FormSurface } from '@/components/presets/FormSurface';
import {
  CardHeader,
  CardBody,
  CardFooter,
} from '@/components/display/Card';
import { Stack } from '@/components/layout/Stack';
import { StatsCard } from '@/components/presets/StatsCard';
import { ActionCard } from '@/components/presets/ActionCard';
import { Button } from '@/components/interactive/Button';
import { Input } from '@/components/interactive/Input';
import { Badge } from '@/components/display/Badge';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

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

function UsersIcon() {
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
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

function CriticalIcon() {
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
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export default function PresetsPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          Card Presets
        </Heading>
        <Text className={styles.intro}>
          Five opinionated Card presets for common product surfaces —{' '}
          <code>ContentCard</code> for articles and blocks,{' '}
          <code>SidebarCard</code> for dashboard rails,{' '}
          <code>FormSurface</code> for native forms with submit actions,{' '}
          <code>StatsCard</code> for numeric displays, and{' '}
          <code>ActionCard</code> for notifications that demand a response.
        </Text>
      </header>

      {/* ==================================================================== */}
      {/* CONTENTCARD                                                           */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          ContentCard
        </Heading>
        <Text color="muted">
          Flagship defaults <code>padding={'{5}'}</code> +{' '}
          <code>radius=&quot;lg&quot;</code>. Title/description slots auto-wrap
          scalars in Heading/Text. Optional footer slot.
        </Text>

        <div className={styles.grid}>
          <ContentCard
            title="Readme"
            description="Comprehensive project overview and setup guide."
          >
            <Text>
              This preset codifies the long-form content pattern: a heading, a
              muted description, and a body block of prose or composed
              components.
            </Text>
          </ContentCard>

          <ContentCard
            title="With header border + footer"
            description="Shows optional divider between header and body."
            headerBorder
            footer={<Text variant="small" color="muted">Last updated 2026-04-14</Text>}
          >
            <Text>
              Header border separates metadata from body. Footer slot accepts
              any ReactNode — timestamp, tags, or action row.
            </Text>
          </ContentCard>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* SIDEBARCARD                                                           */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          SidebarCard
        </Heading>
        <Text color="muted">
          Glass variant by default with optional uppercase <code>label</code>{' '}
          slot above the header. Smaller defaults (<code>padding={'{4}'}</code>{' '}
          + <code>radius=&quot;md&quot;</code>) for narrower viewports.
        </Text>

        <div className={styles.sidebarRow}>
          <SidebarCard
            label="Navigation"
            title="Account"
            description="Manage your profile and preferences."
          >
            <Text variant="small">Profile</Text>
            <Text variant="small">Billing</Text>
            <Text variant="small">Notifications</Text>
            <Text variant="small">Security</Text>
          </SidebarCard>

          <SidebarCard label="Filters" title="Active deadlines">
            <Text variant="small">Today (3)</Text>
            <Text variant="small">This week (12)</Text>
            <Text variant="small">Overdue (2)</Text>
          </SidebarCard>

          <SidebarCard title="No label">
            <Text variant="small">
              Label is optional — preset falls back to title-only header.
            </Text>
          </SidebarCard>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FORMSURFACE                                                           */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          FormSurface
        </Heading>
        <Text color="muted">
          Renders a semantic <code>&lt;form&gt;</code> wrapper around a Card
          surface. Consumer composes <code>&lt;CardHeader&gt;</code>,{' '}
          <code>&lt;CardBody&gt;</code>, <code>&lt;CardFooter&gt;</code> slots
          via children — molecule does NOT auto-wrap title/description strings.
        </Text>

        <div className={styles.grid}>
          <FormSurface noValidate aria-labelledby="contact-title">
            <CardHeader>
              <Heading id="contact-title" level={3} size="lg">
                Contact details
              </Heading>
              <Text variant="body" color="muted">
                Used for delivery and notifications.
              </Text>
            </CardHeader>
            <CardBody>
              <Stack gap={4}>
                <Input
                  name="fullName"
                  label="Full name"
                  placeholder="Jan Kowalski"
                />
                <Input
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="jan@example.com"
                />
              </Stack>
            </CardBody>
            <CardFooter action>
              <Text variant="small" color="secondary">
                We never share your info.
              </Text>
              <Button type="submit">Save</Button>
            </CardFooter>
          </FormSurface>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* STATSCARD                                                             */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          StatsCard
        </Heading>
        <Text color="muted">
          Metric display with discriminated union layout —{' '}
          <code>stacked</code> (default), <code>inline</code>, or{' '}
          <code>icon-lead</code>. Icon is TS-required for{' '}
          <code>icon-lead</code>.
        </Text>

        <div className={styles.grid}>
          <StatsCard
            label="Monthly revenue"
            value="$12,345"
            change={<Badge color="success">+12%</Badge>}
          />

          <StatsCard
            layout="inline"
            label="Active users"
            value={1247}
            change={<Badge color="brand">+4% WoW</Badge>}
          />

          <StatsCard
            layout="icon-lead"
            icon={<UsersIcon />}
            iconVariant="brand"
            label="Team members"
            value={42}
            change={<Badge color="success">+3 this week</Badge>}
          />

          <StatsCard
            layout="icon-lead"
            icon={<ChartIcon />}
            iconVariant="success"
            label="Conversion rate"
            value="3.8%"
            change="+0.4pp vs last month"
          />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* ACTIONCARD                                                            */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          ActionCard
        </Heading>
        <Text color="muted">
          Severity-driven accent border + optional icon + required CTA.
          Severity maps to <code>--color-info</code> / <code>--color-warning</code>{' '}
          / <code>--color-error</code>.
        </Text>

        <div className={styles.grid}>
          <ActionCard
            severity="info"
            icon={<ChartIcon />}
            title="New dashboard available"
            description="Check out the redesigned analytics view with real-time metrics."
            cta={<Button variant="secondary">Open dashboard</Button>}
          />

          <ActionCard
            severity="warning"
            icon={<AlertIcon />}
            title="Storage almost full"
            description="You're using 92% of your 50 GB quota."
            cta={<Button variant="primary">Upgrade plan</Button>}
          />

          <ActionCard
            severity="critical"
            icon={<CriticalIcon />}
            title="Payment failed"
            description="Your last subscription charge was declined. Update your billing to avoid service interruption."
            cta={<Button variant="warning">Update billing</Button>}
          />
        </div>
      </section>
    </main>
  );
}
