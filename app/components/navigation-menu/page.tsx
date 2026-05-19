'use client';

import { useState } from 'react';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuProvider,
} from '@/components/complex/NavigationMenu';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Stack } from '@/components/layout/Stack';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

export default function NavigationMenuPlayground() {
  const [controlledValue, setControlledValue] = useState<string | null>(null);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          NavigationMenu
        </Heading>
        <Text variant="lead" color="muted">
          Horizontal menubar with dropdown submenus — the pattern used by most product navigation
          headers. Hover, click, and full keyboard nav are wired. An optional Provider coordinates
          open/close delays across sibling menus so the whole bar feels responsive.
        </Text>
      </header>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          1. Basic horizontal menubar
        </Heading>
        <Text variant="body" color="muted">
          Hover or focus any trigger to open its submenu. Right/Left arrow keys cycle menubar items.
          Down/Enter/Space opens the submenu with focus on the first item.
        </Text>
        <div className={styles.demo}>
          <NavigationMenu>
            <NavigationMenuList aria-label="Main">
              <NavigationMenuItem value="products">
                <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#products-web">Web Apps</NavigationMenuLink>
                  <NavigationMenuLink href="#products-mobile">Mobile Apps</NavigationMenuLink>
                  <NavigationMenuLink href="#products-desktop">Desktop Apps</NavigationMenuLink>
                  <NavigationMenuLink href="#products-cli">CLI Tools</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem value="solutions">
                <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#solutions-startups">For Startups</NavigationMenuLink>
                  <NavigationMenuLink href="#solutions-enterprise">
                    For Enterprise
                  </NavigationMenuLink>
                  <NavigationMenuLink href="#solutions-agencies">For Agencies</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem value="resources">
                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#resources-docs">Documentation</NavigationMenuLink>
                  <NavigationMenuLink href="#resources-blog">Blog</NavigationMenuLink>
                  <NavigationMenuLink href="#resources-changelog">Changelog</NavigationMenuLink>
                  <NavigationMenuLink href="#resources-community">Community</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem value="pricing">
                <NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          2. Standalone menubar links (no submenu)
        </Heading>
        <Text variant="body" color="muted">
          NavigationMenuItem can contain just a NavigationMenuLink (no Trigger/Content) — the link
          renders as a menubar item without <code>aria-haspopup</code>. Use <code>active</code> prop
          to wire <code>aria-current=&quot;page&quot;</code>.
        </Text>
        <div className={styles.demo}>
          <NavigationMenu>
            <NavigationMenuList aria-label="Footer">
              <NavigationMenuItem value="home">
                <NavigationMenuLink href="#home">Home</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem value="about">
                <NavigationMenuLink href="#about" active>
                  About
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem value="contact">
                <NavigationMenuLink href="#contact">Contact</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem value="privacy">
                <NavigationMenuLink href="#privacy">Privacy</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          3. Mixed: submenu + standalone links
        </Heading>
        <Text variant="body" color="muted">
          Real-world top nav usually mixes dropdown sections (Products, Solutions) with direct page
          links (Pricing, Docs). Right/Left arrows still cycle through both kinds — the standalone
          links are still keyboard-navigable menubar items.
        </Text>
        <div className={styles.demo}>
          <NavigationMenu>
            <NavigationMenuList aria-label="Marketing">
              <NavigationMenuItem value="features">
                <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#features-tokens">Design Tokens</NavigationMenuLink>
                  <NavigationMenuLink href="#features-components">Components</NavigationMenuLink>
                  <NavigationMenuLink href="#features-theming">Theming</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem value="docs">
                <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem value="enterprise">
                <NavigationMenuTrigger>Enterprise</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#enterprise-sso">SSO &amp; SCIM</NavigationMenuLink>
                  <NavigationMenuLink href="#enterprise-audit">Audit Logging</NavigationMenuLink>
                  <NavigationMenuLink href="#enterprise-sla">SLA</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem value="pricing-mix">
                <NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          4. Provider — coordinated skip-delay across menubars
        </Heading>
        <Text variant="body" color="muted">
          Wrap multiple NavigationMenu instances in <code>NavigationMenuProvider</code> to share a
          skip-delay window. Once any submenu opens, hovering another within{' '}
          <code>skipDelayDuration</code> (default 300ms) opens it instantly. Try hovering the first
          menu, then immediately moving to the second.
        </Text>
        <div className={styles.demo}>
          <NavigationMenuProvider openDelay={200} skipDelayDuration={300}>
            <Stack gap={3}>
              <NavigationMenu>
                <NavigationMenuList aria-label="App nav">
                  <NavigationMenuItem value="dashboard">
                    <NavigationMenuTrigger>Dashboard</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink href="#dash-overview">Overview</NavigationMenuLink>
                      <NavigationMenuLink href="#dash-metrics">Metrics</NavigationMenuLink>
                      <NavigationMenuLink href="#dash-alerts">Alerts</NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem value="projects">
                    <NavigationMenuTrigger>Projects</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink href="#proj-active">Active</NavigationMenuLink>
                      <NavigationMenuLink href="#proj-archive">Archive</NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <NavigationMenu>
                <NavigationMenuList aria-label="Account nav">
                  <NavigationMenuItem value="account">
                    <NavigationMenuTrigger>Account</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink href="#account-profile">Profile</NavigationMenuLink>
                      <NavigationMenuLink href="#account-billing">Billing</NavigationMenuLink>
                      <NavigationMenuLink href="#account-team">Team</NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem value="settings">
                    <NavigationMenuTrigger>Settings</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink href="#settings-general">General</NavigationMenuLink>
                      <NavigationMenuLink href="#settings-security">Security</NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </Stack>
          </NavigationMenuProvider>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          5. Custom timings (snappy 100ms / lingering 600ms)
        </Heading>
        <Text variant="body" color="muted">
          Override <code>delayDuration</code> for snappier (or slower) hover reveal. Focus path
          always opens instantly regardless of timing.
        </Text>
        <Stack gap={4}>
          <div>
            <Text variant="small" color="muted">
              <strong>Snappy:</strong> 100ms open / 100ms close
            </Text>
            <div className={styles.demo}>
              <NavigationMenu delayDuration={100} closeDelay={100}>
                <NavigationMenuList aria-label="Snappy">
                  <NavigationMenuItem value="snappy-a">
                    <NavigationMenuTrigger>Quick A</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink href="#snappy-a-1">Item 1</NavigationMenuLink>
                      <NavigationMenuLink href="#snappy-a-2">Item 2</NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem value="snappy-b">
                    <NavigationMenuTrigger>Quick B</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink href="#snappy-b-1">Item 1</NavigationMenuLink>
                      <NavigationMenuLink href="#snappy-b-2">Item 2</NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div>
            <Text variant="small" color="muted">
              <strong>Lingering:</strong> 600ms open / 800ms close
            </Text>
            <div className={styles.demo}>
              <NavigationMenu delayDuration={600} closeDelay={800}>
                <NavigationMenuList aria-label="Lingering">
                  <NavigationMenuItem value="ling-a">
                    <NavigationMenuTrigger>Slow A</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink href="#ling-a-1">Item 1</NavigationMenuLink>
                      <NavigationMenuLink href="#ling-a-2">Item 2</NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem value="ling-b">
                    <NavigationMenuTrigger>Slow B</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink href="#ling-b-1">Item 1</NavigationMenuLink>
                      <NavigationMenuLink href="#ling-b-2">Item 2</NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </Stack>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          6. Controlled mode
        </Heading>
        <Text variant="body" color="muted">
          Pass <code>value</code> + <code>onValueChange</code> for controlled state. Currently open:{' '}
          <Badge color="brand">{controlledValue ?? 'none'}</Badge>
        </Text>
        <div className={styles.demo}>
          <NavigationMenu value={controlledValue} onValueChange={setControlledValue}>
            <NavigationMenuList aria-label="Controlled">
              <NavigationMenuItem value="alpha">
                <NavigationMenuTrigger>Alpha</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#alpha-1">Alpha One</NavigationMenuLink>
                  <NavigationMenuLink href="#alpha-2">Alpha Two</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem value="beta">
                <NavigationMenuTrigger>Beta</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#beta-1">Beta One</NavigationMenuLink>
                  <NavigationMenuLink href="#beta-2">Beta Two</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem value="gamma">
                <NavigationMenuTrigger>Gamma</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#gamma-1">Gamma One</NavigationMenuLink>
                  <NavigationMenuLink href="#gamma-2">Gamma Two</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          7. Keyboard parity walkthrough
        </Heading>
        <Text variant="body" color="muted">
          Tab into the menubar below, then try every key from the APG <code>/menubar/</code> spec:
        </Text>
        <ul className={styles.keyList}>
          <li>
            <kbd>Tab</kbd> — enter the menubar (focuses first item)
          </li>
          <li>
            <kbd>Right Arrow</kbd> / <kbd>Left Arrow</kbd> — cycle menubar items (with wraparound)
          </li>
          <li>
            <kbd>Enter</kbd> / <kbd>Space</kbd> / <kbd>Down Arrow</kbd> — open submenu, focus first
            item
          </li>
          <li>
            <kbd>Up Arrow</kbd> on trigger — open submenu, focus LAST item
          </li>
          <li>
            <kbd>Down Arrow</kbd> / <kbd>Up Arrow</kbd> in submenu — cycle items
          </li>
          <li>
            <kbd>Home</kbd> / <kbd>End</kbd> — first / last (scope-aware: menubar OR submenu)
          </li>
          <li>
            <kbd>Escape</kbd> — close submenu, focus returns to parent menubar item
          </li>
          <li>
            <kbd>Tab</kbd> — exits the menubar entirely (browser propagates Tab)
          </li>
          <li>
            <kbd>a</kbd>-<kbd>z</kbd> typeahead — jumps to next item starting with that letter
            (500ms reset)
          </li>
        </ul>
        <div className={styles.demo}>
          <NavigationMenu>
            <NavigationMenuList aria-label="Keyboard demo">
              <NavigationMenuItem value="alpine">
                <NavigationMenuTrigger>Alpine</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#alpine-trail">Trail Routes</NavigationMenuLink>
                  <NavigationMenuLink href="#alpine-gear">Gear Lists</NavigationMenuLink>
                  <NavigationMenuLink href="#alpine-weather">Weather</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem value="boreal">
                <NavigationMenuTrigger>Boreal</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#boreal-cabins">Cabins</NavigationMenuLink>
                  <NavigationMenuLink href="#boreal-canoe">Canoe Rentals</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem value="coastal">
                <NavigationMenuTrigger>Coastal</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#coastal-beaches">Beaches</NavigationMenuLink>
                  <NavigationMenuLink href="#coastal-tides">Tide Charts</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem value="desert">
                <NavigationMenuTrigger>Desert</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#desert-routes">Routes</NavigationMenuLink>
                  <NavigationMenuLink href="#desert-water">Water Caches</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </section>
    </main>
  );
}
