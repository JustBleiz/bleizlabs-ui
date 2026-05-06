'use client';

import { useState } from 'react';
import {
  SiteHeader,
  SiteHeaderBrand,
  SiteHeaderNav,
  SiteHeaderActions,
  SiteHeaderMobileToggle,
} from '@/components/presets/SiteHeader';
import { Button } from '@/components/interactive/Button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Stack } from '@/components/layout/Stack';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

export default function SiteHeaderPlayground() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          SiteHeader
        </Heading>
        <Text variant="lead" color="muted">
          Site-level top navigation preset composed from Section + Container +
          Sheet + Slot. Compound flat API with five slots (Brand / Nav / Actions
          / MobileToggle) and a built-in mobile drawer. Zero new runtime deps.
          Resize the viewport below 768px to see the responsive drawer.
        </Text>
      </header>

      <BasicDemo />
      <VariantsDemo />
      <SizesDemo />
      <PositionDemo />
      <ResponsiveDemo />
      <AsChildToggleDemo />
    </main>
  );
}

// ============================================================================
// 1. Basic — default solid, sticky, md, bordered=false
// ============================================================================

function BasicDemo() {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <Heading level={2} size="lg">
          1. Basic
        </Heading>
        <Text variant="small" color="muted">
          Default configuration — solid surface, sticky position, medium height
          (72px), no border. Brand on the left, Nav centered, Actions on the
          right, MobileToggle visible only below 768px.
        </Text>
      </header>
      <div className={styles.previewShell}>
        <SiteHeader>
          <SiteHeaderBrand>
            <strong>Acme</strong>
          </SiteHeaderBrand>
          <SiteHeaderNav>
            <a href="#products">Products</a>
            <a href="#pricing">Pricing</a>
            <a href="#docs">Docs</a>
            <a href="#about">About</a>
          </SiteHeaderNav>
          <SiteHeaderActions>
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
            <Button size="sm">Get started</Button>
          </SiteHeaderActions>
          <SiteHeaderMobileToggle />
        </SiteHeader>
        <div className={styles.previewBody}>
          <Text variant="body" color="muted">
            Page content placeholder — scroll to observe sticky behavior.
          </Text>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// 2. Variants — solid vs blur
// ============================================================================

function VariantsDemo() {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <Heading level={2} size="lg">
          2. Variants
        </Heading>
        <Text variant="small" color="muted">
          Solid surface vs translucent blur (glassmorphism). Blur uses
          <code className={styles.inlineCode}>color-mix</code> fallback +
          <code className={styles.inlineCode}>backdrop-filter</code> — readable
          in browsers without backdrop-filter support.
        </Text>
      </header>

      <Stack gap={6}>
        <div className={styles.previewShell}>
          <SiteHeader variant="solid" bordered>
            <SiteHeaderBrand>
              <strong>Solid</strong>
            </SiteHeaderBrand>
            <SiteHeaderNav aria-label="Solid variant primary">
              <a href="#a">Products</a>
              <a href="#b">Pricing</a>
            </SiteHeaderNav>
            <SiteHeaderActions>
              <Button size="sm">Sign up</Button>
            </SiteHeaderActions>
            <SiteHeaderMobileToggle />
          </SiteHeader>
          <PreviewBodyWithGradient />
        </div>

        <div className={styles.previewShell}>
          <SiteHeader variant="blur" bordered>
            <SiteHeaderBrand>
              <strong>Blur</strong>
            </SiteHeaderBrand>
            <SiteHeaderNav aria-label="Blur variant primary">
              <a href="#a">Products</a>
              <a href="#b">Pricing</a>
            </SiteHeaderNav>
            <SiteHeaderActions>
              <Button size="sm">Sign up</Button>
            </SiteHeaderActions>
            <SiteHeaderMobileToggle />
          </SiteHeader>
          <PreviewBodyWithGradient />
        </div>
      </Stack>
    </section>
  );
}

// ============================================================================
// 3. Sizes — sm / md / lg
// ============================================================================

function SizesDemo() {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <Heading level={2} size="lg">
          3. Sizes
        </Heading>
        <Text variant="small" color="muted">
          Three height presets — sm 64px, md 72px (default), lg 88px. Padding
          and typography scale with height.
        </Text>
      </header>

      <Stack gap={4}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} className={styles.previewShell}>
            <SiteHeader size={size} bordered>
              <SiteHeaderBrand>
                <strong>Size {size}</strong>
              </SiteHeaderBrand>
              <SiteHeaderNav aria-label={`Size ${size} primary`}>
                <a href="#a">Products</a>
                <a href="#b">Pricing</a>
              </SiteHeaderNav>
              <SiteHeaderActions>
                <Badge label={size} color="brand" />
              </SiteHeaderActions>
              <SiteHeaderMobileToggle />
            </SiteHeader>
          </div>
        ))}
      </Stack>
    </section>
  );
}

// ============================================================================
// 4. Position — sticky vs static
// ============================================================================

function PositionDemo() {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <Heading level={2} size="lg">
          4. Position
        </Heading>
        <Text variant="small" color="muted">
          <code className={styles.inlineCode}>sticky</code> pins to top on
          scroll (requires non-scrollable ancestors —
          <code className={styles.inlineCode}>overflow: hidden</code> can break
          it). <code className={styles.inlineCode}>static</code> scrolls
          naturally.
        </Text>
      </header>

      <div className={styles.previewShellScroll}>
        <SiteHeader position="sticky" bordered>
          <SiteHeaderBrand>
            <strong>Sticky</strong>
          </SiteHeaderBrand>
          <SiteHeaderNav aria-label="Sticky demo primary">
            <a href="#a">Home</a>
            <a href="#b">Features</a>
            <a href="#c">Contact</a>
          </SiteHeaderNav>
          <SiteHeaderActions>
            <Button size="sm">CTA</Button>
          </SiteHeaderActions>
          <SiteHeaderMobileToggle />
        </SiteHeader>
        <FillerContent paragraphs={12} />
      </div>
    </section>
  );
}

// ============================================================================
// 5. Responsive behavior — mobile Sheet
// ============================================================================

function ResponsiveDemo() {
  const [forceOpen, setForceOpen] = useState(false);

  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <Heading level={2} size="lg">
          5. Responsive behavior
        </Heading>
        <Text variant="small" color="muted">
          Narrow viewports (&lt;768px) hide Nav and show MobileToggle. Clicking
          toggles a Sheet (left-side drawer) containing the same Nav links in a
          vertical stack. Control state externally via{' '}
          <code className={styles.inlineCode}>mobileOpen</code> +{' '}
          <code className={styles.inlineCode}>onMobileOpenChange</code>.
        </Text>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setForceOpen((prev) => !prev)}
        >
          {forceOpen ? 'Close mobile drawer (external)' : 'Open mobile drawer (external)'}
        </Button>
      </header>
      <div className={styles.previewShell}>
        <SiteHeader
          bordered
          mobileOpen={forceOpen}
          onMobileOpenChange={setForceOpen}
        >
          <SiteHeaderBrand>
            <strong>Responsive</strong>
          </SiteHeaderBrand>
          <SiteHeaderNav aria-label="Responsive demo primary">
            <a href="#a">Dashboard</a>
            <a href="#b">Reports</a>
            <a href="#c">Team</a>
            <a href="#d">Settings</a>
          </SiteHeaderNav>
          <SiteHeaderActions>
            <Button size="sm" variant="ghost">
              Help
            </Button>
            <Button size="sm">Upgrade</Button>
          </SiteHeaderActions>
          <SiteHeaderMobileToggle />
        </SiteHeader>
      </div>
    </section>
  );
}

// ============================================================================
// 6. asChild MobileToggle — custom trigger
// ============================================================================

function AsChildToggleDemo() {
  return (
    <section className={styles.section} data-demo-section="asChild">
      <header className={styles.sectionHeader}>
        <Heading level={2} size="lg">
          6. asChild custom toggle
        </Heading>
        <Text variant="small" color="muted">
          Replace the built-in hamburger button with a custom trigger via{' '}
          <code className={styles.inlineCode}>asChild</code>. The slot forwards{' '}
          <code className={styles.inlineCode}>onClick</code>,{' '}
          <code className={styles.inlineCode}>aria-expanded</code>,{' '}
          <code className={styles.inlineCode}>aria-controls</code>, and{' '}
          <code className={styles.inlineCode}>aria-label</code> to the custom
          element.
        </Text>
      </header>
      <div className={styles.previewShell}>
        <SiteHeader bordered>
          <SiteHeaderBrand>
            <strong>Custom</strong>
          </SiteHeaderBrand>
          <SiteHeaderNav aria-label="Custom toggle demo primary">
            <a href="#a">Docs</a>
            <a href="#b">API</a>
          </SiteHeaderNav>
          <SiteHeaderActions>
            <Button size="sm">Get started</Button>
          </SiteHeaderActions>
          <SiteHeaderMobileToggle asChild>
            <Button variant="secondary" size="sm">
              Menu
            </Button>
          </SiteHeaderMobileToggle>
        </SiteHeader>
      </div>
    </section>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function PreviewBodyWithGradient() {
  return <div className={styles.previewGradient} aria-hidden="true" />;
}

function FillerContent({ paragraphs }: { paragraphs: number }) {
  return (
    <div className={styles.filler}>
      {Array.from({ length: paragraphs }).map((_, i) => (
        <Text key={i} variant="body" color="muted">
          Paragraph {i + 1} — Lorem ipsum dolor sit amet, consectetur adipiscing
          elit. Nullam quis elementum orci. Vivamus lobortis faucibus enim at
          venenatis. Nunc blandit cursus nunc, ac sollicitudin quam tincidunt
          eget.
        </Text>
      ))}
    </div>
  );
}
