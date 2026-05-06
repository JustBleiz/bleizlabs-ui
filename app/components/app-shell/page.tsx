'use client';

import { useState } from 'react';

import {
  AppShell,
  Avatar,
  Badge,
  Button,
  Heading,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarTrigger,
  Stack,
  Text,
} from '@/components';

import styles from './page.module.scss';

// ============================================================================
// AppShell playground — composition preset
// ----------------------------------------------------------------------------
// AppShell takes over its own document area. Each demo renders the actual
// shell at full viewport via Next.js route — there is no contained "preview"
// because the shell IS the layout.
// ============================================================================

interface NavItem {
  href: string;
  label: string;
  badge?: string;
}

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Glowne',
    items: [
      { href: '#dashboard', label: 'Dashboard' },
      { href: '#projects', label: 'Projekty' },
      { href: '#services', label: 'Uslugi' },
    ],
  },
  {
    label: 'Operacje',
    items: [
      { href: '#tickets', label: 'Zgloszenia', badge: '4' },
      { href: '#marketplace', label: 'Marketplace' },
    ],
  },
  {
    label: 'Konto',
    items: [{ href: '#profile', label: 'Profil' }],
  },
];

function DemoSidebar() {
  const [active, setActive] = useState('#dashboard');

  return (
    <Sidebar aria-label="Demo nawigacja">
      <SidebarHeader>
        <Stack gap={2}>
          <Text variant="small" weight="bold">
            AppShell Demo
          </Text>
          <Text variant="caption" color="muted">
            Composition preset
          </Text>
        </Stack>
      </SidebarHeader>

      <SidebarContent aria-label="Glowna nawigacja">
        {NAV_SECTIONS.map((section) => (
          <SidebarGroup
            key={section.label}
            label={
              <Text variant="caption" color="muted" asChild>
                <span>{section.label}</span>
              </Text>
            }
          >
            {section.items.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                isActive={active === item.href}
                asChild
              >
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive(item.href);
                  }}
                >
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <Badge label={item.badge} color="warning" pill />
                  )}
                </a>
              </SidebarItem>
            ))}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <Stack gap={3} align="stretch">
          <Stack gap={3}>
            <Avatar fallback="DU" alt="Demo User" size="sm" />
            <Stack gap={0}>
              <Text variant="small" weight="semibold" color="primary">
                Demo User
              </Text>
              <Text variant="caption" color="muted">
                Operator
              </Text>
            </Stack>
          </Stack>
          <Button variant="ghost" size="sm" fullWidth>
            Wyloguj
          </Button>
        </Stack>
      </SidebarFooter>
    </Sidebar>
  );
}

function DemoTopNav() {
  return (
    <header className={styles.topNav}>
      <Text variant="small" color="muted">
        Dashboard / Demo / AppShell preview
      </Text>
      <Button variant="ghost" size="sm">
        Akcje
      </Button>
    </header>
  );
}

function DemoContent({ withTopNav }: { withTopNav: boolean }) {
  return (
    <Stack gap={6} className={styles.content}>
      <Stack gap={3}>
        <Heading level={1} size="2xl">
          AppShell — composition preset
        </Heading>
        <Text variant="lead" color="muted">
          App-level layout chrome combining lib SidebarProvider + Sidebar slot
          + main scaffold + optional TopNav slot. Composes existing lib
          primitives — zero new runtime deps. Resize below 1024px to see the
          mobile drawer (Sidebar&apos;s offcanvas behavior, owned by lib via
          SidebarProvider). Sidebar is consumer-supplied via the `sidebar`
          slot — feed any compound combination of SidebarHeader / Content /
          Footer / Group / Item / Trigger.
        </Text>
      </Stack>

      <Stack gap={4}>
        <Heading level={2} size="lg">
          Slot configuration: {withTopNav ? 'topNav present' : 'no topNav'}
        </Heading>
        <Text variant="body" color="secondary">
          One pattern omits the topNav slot entirely (logout lives in the
          Sidebar footer card). Another pattern adds a topNav with breadcrumb
          + identity pill + actions row. AppShell handles both via a single
          optional slot — consumer chooses by passing or omitting `topNav`
          prop.
        </Text>
      </Stack>

      <Stack gap={4}>
        <Heading level={2} size="lg">
          Padding-top cancellation built-in
        </Heading>
        <Text variant="body" color="secondary">
          AppShell ships <code>padding-top: 0</code> on its inner{' '}
          <code>&lt;main&gt;</code> element. Marketing-style global rules like{' '}
          <code>main {'{'} padding-top: var(--nav-footprint) {'}'}</code> get
          cancelled automatically — admin shells inherit a clean baseline.
          Single source of truth here prevents the inherited-padding bug class
          entirely.
        </Text>
      </Stack>

      <Stack gap={4}>
        <Heading level={2} size="lg">
          Long content sample
        </Heading>
        {Array.from({ length: 8 }).map((_, i) => (
          <Text key={i} variant="body">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
            enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur.
          </Text>
        ))}
      </Stack>
    </Stack>
  );
}

export default function AppShellPlayground() {
  const [withTopNav, setWithTopNav] = useState(true);

  return (
    <AppShell
      sidebar={<DemoSidebar />}
      topNav={withTopNav ? <DemoTopNav /> : undefined}
      mobileTrigger={
        <SidebarTrigger
          aria-label="Otworz menu"
          className={styles.mobileTrigger}
        >
          Menu
        </SidebarTrigger>
      }
    >
      <DemoContent withTopNav={withTopNav} />
      <div className={styles.toggleRow}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setWithTopNav((v) => !v)}
        >
          {withTopNav ? 'Hide topNav slot' : 'Show topNav slot'}
        </Button>
      </div>
    </AppShell>
  );
}
