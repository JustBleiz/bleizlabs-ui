'use client';

import { useEffect, useState } from 'react';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/complex/Sidebar';
import { Button } from '@/components/interactive/Button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

export default function SidebarPlayground() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          Sidebar
        </Heading>
        <Text variant="lead" color="muted">
          Responsive application sidebar — a fixed aside on desktop, a modal drawer on mobile.
          Groups, items, separators, and an optional hamburger trigger compose however the product
          needs. Opt-in cookie persistence keeps the open state across reloads without hydration
          flash.
        </Text>
      </header>

      <BasicDemo />
      <GroupsDemo />
      <ControlledDemo />
      <ShortcutDemo />
      <SideRightDemo />
      <KeyboardWalkthrough />
    </main>
  );
}

// ============================================================================
// 1. Basic (default uncontrolled, offcanvas)
// ============================================================================

function BasicDemo() {
  const [active, setActive] = useState<string>('Dashboard');

  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <Heading level={2} size="lg">
          1. Basic
        </Heading>
        <Text variant="small" color="muted">
          Default uncontrolled sidebar with header, grouped items, and footer. Resize viewport below
          768px to see mobile drawer mode.
        </Text>
        <Inline gap={2} align="center">
          <Badge label="active" color="brand" />
          <Text variant="small" className={styles.mono}>
            {active}
          </Text>
        </Inline>
      </header>
      <div className={styles.previewShell}>
        <SidebarProvider defaultOpen={true}>
          <Sidebar aria-label="Basic sidebar">
            <SidebarHeader>
              <strong>Acme Inc.</strong>
            </SidebarHeader>
            <SidebarContent aria-label="Primary navigation">
              <SidebarGroup label="Workspace">
                <SidebarItem
                  href="#dashboard"
                  isActive={active === 'Dashboard'}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive('Dashboard');
                  }}
                >
                  Dashboard
                </SidebarItem>
                <SidebarItem
                  href="#reports"
                  isActive={active === 'Reports'}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive('Reports');
                  }}
                >
                  Reports
                </SidebarItem>
                <SidebarItem
                  href="#settings"
                  isActive={active === 'Settings'}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive('Settings');
                  }}
                >
                  Settings
                </SidebarItem>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <Text variant="small" color="muted">
                v1.0.0
              </Text>
            </SidebarFooter>
          </Sidebar>
          <div className={styles.previewMain}>
            <Inline gap={3} align="center">
              <SidebarTrigger aria-label="Toggle sidebar" />
              <Text variant="small" color="muted">
                Click an item — active highlight follows. Trigger ↑ toggles.
              </Text>
            </Inline>
          </div>
        </SidebarProvider>
      </div>
    </section>
  );
}

// ============================================================================
// 2. Groups + separators + disabled item
// ============================================================================

function GroupsDemo() {
  const [active, setActive] = useState<string>('p1');
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <Heading level={2} size="lg">
          2. Groups + separator + disabled
        </Heading>
        <Text variant="small" color="muted">
          Multiple groups with inline labels, SidebarSeparator between them, and a disabled item
          (aria-disabled + tabIndex=-1).
        </Text>
      </header>
      <div className={styles.previewShell}>
        <SidebarProvider defaultOpen={true}>
          <Sidebar aria-label="Grouped sidebar">
            <SidebarHeader>
              <strong>Projects</strong>
            </SidebarHeader>
            <SidebarContent aria-label="Project navigation">
              <SidebarGroup label="Recent">
                <SidebarItem
                  href="#p1"
                  isActive={active === 'p1'}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive('p1');
                  }}
                >
                  Project Alpha
                </SidebarItem>
                <SidebarItem
                  href="#p2"
                  isActive={active === 'p2'}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive('p2');
                  }}
                >
                  Project Beta
                </SidebarItem>
                <SidebarItem
                  href="#p3"
                  isActive={active === 'p3'}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive('p3');
                  }}
                >
                  Project Gamma
                </SidebarItem>
              </SidebarGroup>
              <SidebarSeparator />
              <SidebarGroup label="Archived">
                <SidebarItem
                  href="#a1"
                  isActive={active === 'a1'}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive('a1');
                  }}
                >
                  Legacy tool
                </SidebarItem>
                <SidebarItem href="#a2" disabled>
                  Permission denied
                </SidebarItem>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <div className={styles.previewMain}>
            <Text variant="small" color="muted">
              Tab through the items. The &quot;Permission denied&quot; item is disabled.
            </Text>
          </div>
        </SidebarProvider>
      </div>
    </section>
  );
}

// ============================================================================
// 3. Controlled state + external trigger
// ============================================================================

function ControlledDemo() {
  const [open, setOpen] = useState(false);

  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <Heading level={2} size="lg">
          3. Controlled state
        </Heading>
        <Text variant="small" color="muted">
          Controlled via <code>open</code> + <code>onOpenChange</code>. External buttons drive
          state. Start closed; open manually.
        </Text>
      </header>
      <Inline gap={2}>
        <Button size="sm" variant="primary" onClick={() => setOpen(true)}>
          Open
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>
          Close
        </Button>
        <Badge label={open ? 'open' : 'closed'} color="default" />
      </Inline>
      <div className={styles.previewShell}>
        <SidebarProvider open={open} onOpenChange={setOpen}>
          <Sidebar aria-label="Controlled sidebar">
            <SidebarHeader>
              <strong>Controlled</strong>
            </SidebarHeader>
            <SidebarContent aria-label="Main">
              <SidebarGroup>
                <SidebarItem href="#one" onClick={(e) => e.preventDefault()}>
                  One
                </SidebarItem>
                <SidebarItem href="#two" onClick={(e) => e.preventDefault()}>
                  Two
                </SidebarItem>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <div className={styles.previewMain}>
            <Text variant="small" color="muted">
              Sidebar is <code>{open ? 'open' : 'closed'}</code>.
            </Text>
          </div>
        </SidebarProvider>
      </div>
    </section>
  );
}

// ============================================================================
// 4. useSidebar hook + Cmd+B shortcut
// ============================================================================

function ShortcutInner() {
  const { open, toggle, isMobile } = useSidebar();

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      const isMod = event.metaKey || event.ctrlKey;
      if (isMod && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [toggle]);

  return (
    <div className={styles.previewMain}>
      <Inline gap={2} align="center">
        <Badge label={open ? 'open' : 'closed'} color="default" />
        <Badge label={isMobile ? 'mobile' : 'desktop'} color="default" />
        <Text variant="small" color="muted">
          Press <code>Cmd+B</code> / <code>Ctrl+B</code> to toggle.
        </Text>
      </Inline>
    </div>
  );
}

function ShortcutDemo() {
  const [active, setActive] = useState<string>('home');
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <Heading level={2} size="lg">
          4. useSidebar hook + Cmd+B shortcut
        </Heading>
        <Text variant="small" color="muted">
          Consumers bind keyboard shortcuts via the <code>useSidebar()</code> hook. The library
          never binds keys automatically — keyboard policy stays the consumer&apos;s responsibility.
        </Text>
      </header>
      <div className={styles.previewShell}>
        <SidebarProvider defaultOpen={true}>
          <Sidebar aria-label="Shortcut sidebar">
            <SidebarHeader>
              <strong>Hotkey demo</strong>
            </SidebarHeader>
            <SidebarContent aria-label="Hotkey navigation">
              <SidebarGroup>
                <SidebarItem
                  href="#home"
                  isActive={active === 'home'}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive('home');
                  }}
                >
                  Home
                </SidebarItem>
                <SidebarItem
                  href="#docs"
                  isActive={active === 'docs'}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive('docs');
                  }}
                >
                  Docs
                </SidebarItem>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <ShortcutInner />
        </SidebarProvider>
      </div>
    </section>
  );
}

// ============================================================================
// 5. side="right"
// ============================================================================

function SideRightDemo() {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <Heading level={2} size="lg">
          5. side=&quot;right&quot;
        </Heading>
        <Text variant="small" color="muted">
          Explicit side prop (no auto-mirror on dir=&quot;rtl&quot;). Layout flips to row-reverse;
          drawer animation slides from right.
        </Text>
      </header>
      <div className={styles.previewShell}>
        <SidebarProvider defaultOpen={true}>
          <div className={styles.previewMain}>
            <Inline gap={3} align="center">
              <SidebarTrigger aria-label="Toggle sidebar" />
              <Text variant="small" color="muted">
                Right-anchored sidebar.
              </Text>
            </Inline>
          </div>
          <Sidebar side="right" aria-label="Right sidebar">
            <SidebarHeader>
              <strong>Details</strong>
            </SidebarHeader>
            <SidebarContent aria-label="Details panel">
              <SidebarGroup>
                <SidebarItem href="#info" onClick={(e) => e.preventDefault()}>
                  Info
                </SidebarItem>
                <SidebarItem href="#activity" onClick={(e) => e.preventDefault()}>
                  Activity
                </SidebarItem>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </div>
    </section>
  );
}

// ============================================================================
// 6. Keyboard walkthrough
// ============================================================================

function KeyboardWalkthrough() {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <Heading level={2} size="lg">
          Keyboard + A11y reference
        </Heading>
        <Text variant="small" color="muted">
          Plain <code>&lt;nav&gt;</code> + <code>&lt;a&gt;</code> semantics — not menubar APG.
          Browser default Tab navigation covers the entire keyboard UX.
        </Text>
      </header>
      <ul className={styles.keyboardList}>
        <li>
          <code>Tab</code> / <code>Shift+Tab</code> — walk through items in DOM order (browser
          default)
        </li>
        <li>
          <code>Enter</code> on SidebarItem — activates link href (browser default)
        </li>
        <li>
          <code>Enter</code> / <code>Space</code> on SidebarTrigger — toggles sidebar open/closed
        </li>
        <li>
          <code>Escape</code> (mobile drawer only) — closes drawer, restores focus to trigger
        </li>
        <li>
          <code>Tab</code> (mobile drawer only) — cycles focus within drawer via{' '}
          <code>useFocusTrap</code>
        </li>
        <li>
          <code>Cmd+B</code> / <code>Ctrl+B</code> — consumer-bound via <code>useSidebar()</code>,
          not built-in
        </li>
      </ul>
    </section>
  );
}
