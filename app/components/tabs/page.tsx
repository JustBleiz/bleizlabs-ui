'use client';

import { useState } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/complex/Tabs';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Stack } from '@/components/layout/Stack';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

export default function TabsPlayground() {
  const [controlledValue, setControlledValue] = useState<string>('pro');

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          Tabs — Phase 10 CI11
        </Heading>
        <Text variant="lead" color="muted">
          Accessible tabs widget per WAI-ARIA APG <code>/tabs/</code>. 4 compound flat exports
          (Tabs + TabsList + TabsTrigger + TabsContent). Self-contained — zero E23 floating
          primitives. Roving tabindex pattern reused from NavigationMenu.
        </Text>
      </header>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          1. Underline variant (default) — horizontal
        </Heading>
        <Text variant="body" color="muted">
          The default visual. Active tab gets a brand-colored bottom border that replaces the
          tablist underline. Automatic activation — focus follows content.
        </Text>
        <div className={styles.demo}>
          <Tabs defaultValue="overview">
            <TabsList aria-label="Project sections">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Stack gap={2}>
                <Heading level={3} size="md">
                  Project overview
                </Heading>
                <Text variant="body">
                  A high-level snapshot of what&apos;s happening — open tasks, team members,
                  upcoming milestones. This panel is unmounted when inactive (default behavior).
                </Text>
              </Stack>
            </TabsContent>
            <TabsContent value="tasks">
              <Stack gap={2}>
                <Heading level={3} size="md">
                  Tasks
                </Heading>
                <Text variant="body">
                  Task list with filters, assignees, and due dates. Typically the busiest panel
                  in project dashboards.
                </Text>
              </Stack>
            </TabsContent>
            <TabsContent value="team">
              <Stack gap={2}>
                <Heading level={3} size="md">
                  Team
                </Heading>
                <Text variant="body">
                  Members, roles, invitations, and access levels. Suitable for Provider-based
                  invite UI patterns.
                </Text>
              </Stack>
            </TabsContent>
            <TabsContent value="activity">
              <Stack gap={2}>
                <Heading level={3} size="md">
                  Activity feed
                </Heading>
                <Text variant="body">
                  Recent changes across the project — comments, status transitions, new uploads.
                </Text>
              </Stack>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          2. Pill variant
        </Heading>
        <Text variant="body" color="muted">
          Pill-shaped buttons with a filled brand active state. Typically used for filter or
          category selection where the tab visual is more prominent.
        </Text>
        <div className={styles.demo}>
          <Tabs defaultValue="week">
            <TabsList aria-label="Time range" variant="pill">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
            <TabsContent value="day">
              <Text variant="body">Metrics for today — hourly breakdown.</Text>
            </TabsContent>
            <TabsContent value="week">
              <Text variant="body">Metrics for this week — daily breakdown.</Text>
            </TabsContent>
            <TabsContent value="month">
              <Text variant="body">Metrics for this month — weekly breakdown.</Text>
            </TabsContent>
            <TabsContent value="year">
              <Text variant="body">Metrics for this year — monthly breakdown.</Text>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          3. Segmented variant
        </Heading>
        <Text variant="body" color="muted">
          iOS-style tight segmented control. Active button is raised via box-shadow. Tightly
          grouped with equal-width triggers via flex:1.
        </Text>
        <div className={styles.demo}>
          <Tabs defaultValue="grid">
            <TabsList aria-label="View mode" variant="segmented">
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
            </TabsList>
            <TabsContent value="grid">
              <Text variant="body">Grid view — cards in a responsive layout.</Text>
            </TabsContent>
            <TabsContent value="list">
              <Text variant="body">List view — rows with columns.</Text>
            </TabsContent>
            <TabsContent value="kanban">
              <Text variant="body">Kanban view — columns by status.</Text>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          4. Vertical orientation
        </Heading>
        <Text variant="body" color="muted">
          Sidebar-style tabs. <code>orientation=&quot;vertical&quot;</code> swaps keyboard nav
          from Right/Left to Down/Up, and the underline variant switches from border-bottom to
          border-right.
        </Text>
        <div className={styles.demo}>
          <Tabs defaultValue="profile" orientation="vertical">
            <TabsList aria-label="Account settings">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <Stack gap={2}>
                <Heading level={3} size="md">
                  Profile
                </Heading>
                <Text variant="body">Display name, avatar, bio, timezone.</Text>
              </Stack>
            </TabsContent>
            <TabsContent value="security">
              <Stack gap={2}>
                <Heading level={3} size="md">
                  Security
                </Heading>
                <Text variant="body">Password, 2FA, recovery codes, active sessions.</Text>
              </Stack>
            </TabsContent>
            <TabsContent value="notifications">
              <Stack gap={2}>
                <Heading level={3} size="md">
                  Notifications
                </Heading>
                <Text variant="body">Email digests, push notifications, quiet hours.</Text>
              </Stack>
            </TabsContent>
            <TabsContent value="billing">
              <Stack gap={2}>
                <Heading level={3} size="md">
                  Billing
                </Heading>
                <Text variant="body">Plan, invoices, payment method, tax info.</Text>
              </Stack>
            </TabsContent>
            <TabsContent value="integrations">
              <Stack gap={2}>
                <Heading level={3} size="md">
                  Integrations
                </Heading>
                <Text variant="body">Connected apps, API keys, webhooks.</Text>
              </Stack>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          5. Manual activation mode
        </Heading>
        <Text variant="body" color="muted">
          Arrows move focus only; Space/Enter activates. Use for async-loaded panels where
          switching on every arrow keypress would fire unnecessary network requests.
        </Text>
        <div className={styles.demo}>
          <Tabs defaultValue="analytics" activationMode="manual">
            <TabsList aria-label="Data panels">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="exports">Exports</TabsTrigger>
            </TabsList>
            <TabsContent value="analytics">
              <Text variant="body">
                <strong>Manual mode:</strong> Tab into this area, use arrows to move focus
                across triggers without activating, then Space/Enter to actually switch panels.
              </Text>
            </TabsContent>
            <TabsContent value="reports">
              <Text variant="body">Reports panel — would normally fetch on activation.</Text>
            </TabsContent>
            <TabsContent value="exports">
              <Text variant="body">Exports panel — would normally fetch on activation.</Text>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          6. Controlled mode + disabled trigger
        </Heading>
        <Text variant="body" color="muted">
          Pass <code>value</code> + <code>onValueChange</code> for controlled state.
          Currently selected: <Badge color="brand">{controlledValue}</Badge>. The Enterprise tab
          is disabled — arrow nav and Home/End skip it.
        </Text>
        <div className={styles.demo}>
          <Tabs value={controlledValue} onValueChange={setControlledValue}>
            <TabsList aria-label="Pricing tier">
              <TabsTrigger value="free">Free</TabsTrigger>
              <TabsTrigger value="pro">Pro</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="enterprise" disabled>
                Enterprise (soon)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="free">
              <Text variant="body">Free tier — 1 project, 3 collaborators, community support.</Text>
            </TabsContent>
            <TabsContent value="pro">
              <Text variant="body">Pro tier — unlimited projects, priority support, SSO.</Text>
            </TabsContent>
            <TabsContent value="team">
              <Text variant="body">Team tier — Pro + advanced audit logs, role-based access.</Text>
            </TabsContent>
            <TabsContent value="enterprise">
              <Text variant="body">Enterprise tier — custom contracts (coming soon).</Text>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          7. Keyboard walkthrough
        </Heading>
        <Text variant="body" color="muted">
          Tab into the tablist below, then try every key from the APG <code>/tabs/</code> spec:
        </Text>
        <ul className={styles.keyList}>
          <li>
            <kbd>Tab</kbd> — enter the tablist (focuses active trigger)
          </li>
          <li>
            <kbd>Right Arrow</kbd> / <kbd>Left Arrow</kbd> — cycle triggers (horizontal) with
            wraparound
          </li>
          <li>
            <kbd>Home</kbd> / <kbd>End</kbd> — first / last enabled trigger
          </li>
          <li>
            <kbd>Tab</kbd> from active trigger — moves focus INTO the tabpanel (panel is{' '}
            <code>tabindex=0</code> per APG composite widget contract)
          </li>
          <li>
            <kbd>Space</kbd> / <kbd>Enter</kbd> in manual mode — activate focused trigger
          </li>
          <li>
            <kbd>Cmd</kbd> + <kbd>Arrow</kbd> — NOT intercepted (browser hotkeys like Cmd+←
            back-nav take precedence, Radix TB-R04 fix)
          </li>
        </ul>
        <div className={styles.demo}>
          <Tabs defaultValue="one">
            <TabsList aria-label="Keyboard demo">
              <TabsTrigger value="one">One</TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
              <TabsTrigger value="three">Three</TabsTrigger>
              <TabsTrigger value="four" disabled>
                Four (disabled)
              </TabsTrigger>
              <TabsTrigger value="five">Five</TabsTrigger>
            </TabsList>
            <TabsContent value="one">
              <Text variant="body">Panel one — tab here to see focus move INTO the panel.</Text>
            </TabsContent>
            <TabsContent value="two">
              <Text variant="body">Panel two.</Text>
            </TabsContent>
            <TabsContent value="three">
              <Text variant="body">Panel three.</Text>
            </TabsContent>
            <TabsContent value="four">
              <Text variant="body">Panel four — never visible (trigger disabled).</Text>
            </TabsContent>
            <TabsContent value="five">
              <Text variant="body">Panel five.</Text>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  );
}
