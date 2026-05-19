'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Drawer } from '@/components/complex/Drawer';
import { Button } from '@/components/interactive/Button';
import { Checkbox } from '@/components/interactive/Checkbox';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function DrawerPlaygroundPage() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [textOnlyOpen, setTextOnlyOpen] = useState(false);
  const [lockedOpen, setLockedOpen] = useState(false);
  const [withCloseOpen, setWithCloseOpen] = useState(false);
  const [scrollOpen, setScrollOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState<'sm' | 'md' | 'lg' | null>(null);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          Drawer
        </Heading>
        <Text className={styles.intro}>
          Bottom-anchored modal sheet, optimised for mobile-first flows where a full dialog would
          feel heavy. Slides up from the edge, respects iOS safe-area insets, and keeps header and
          footer pinned while the body scrolls.
        </Text>
      </header>

      {/* BASIC */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Basic drawer
        </Heading>
        <Text color="muted">
          Title + body + footer action row. Escape closes, overlay click closes (
          <code>closeOnOverlayClick</code> default <code>true</code>).
        </Text>
        <div className={styles.row}>
          <Button onClick={() => setBasicOpen(true)}>Open basic drawer</Button>
        </div>
        <Drawer
          open={basicOpen}
          onOpenChange={setBasicOpen}
          title="Confirm action"
          footer={
            <>
              <Button variant="ghost" onClick={() => setBasicOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setBasicOpen(false)}>Continue</Button>
            </>
          }
        >
          <Text>
            A basic drawer with title + body + footer action row. No description provided —
            aria-describedby is absent by design.
          </Text>
        </Drawer>
      </section>

      {/* FILTERS (with description + interactive form) */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Filters drawer (with description)
        </Heading>
        <Text color="muted">
          Real-world use: filter panel with form controls. Description present →{' '}
          <code>aria-describedby</code> wired.
        </Text>
        <div className={styles.row}>
          <Button onClick={() => setFiltersOpen(true)}>Open filters drawer</Button>
        </div>
        <Drawer
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          title="Filter products"
          description="Narrow results by category, price, and availability."
          size="md"
          footer={
            <>
              <Button variant="ghost" onClick={() => setFiltersOpen(false)}>
                Reset
              </Button>
              <Button onClick={() => setFiltersOpen(false)}>Apply filters</Button>
            </>
          }
        >
          <Checkbox name="category-new">In stock</Checkbox>
          <Checkbox name="category-sale">On sale</Checkbox>
          <Checkbox name="category-free">Free shipping</Checkbox>
        </Drawer>
      </section>

      {/* TEXT ONLY (no description, no footer) */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Text-only drawer
        </Heading>
        <Text color="muted">
          Minimal drawer — title + body only. No footer, no interactive content. Focus falls back to
          content container (<code>tabIndex=-1</code>).
        </Text>
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setTextOnlyOpen(true)}>
            Open text-only drawer
          </Button>
        </div>
        <Drawer open={textOnlyOpen} onOpenChange={setTextOnlyOpen} title="About this feature">
          <Text>
            Drawers are flexible bottom-sheet containers. Use them for filter panels, action sheets,
            and mobile-first detail views. For blocking destructive confirms use AlertDialog
            instead.
          </Text>
        </Drawer>
      </section>

      {/* LOCKED (no escape, no overlay close) */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Locked drawer
        </Heading>
        <Text color="muted">
          <code>closeOnEscape=false</code> + <code>closeOnOverlayClick=false</code> — user must
          explicitly complete action via footer button.
        </Text>
        <div className={styles.row}>
          <Button variant="warning" onClick={() => setLockedOpen(true)}>
            Open locked drawer
          </Button>
        </div>
        <Drawer
          open={lockedOpen}
          onOpenChange={setLockedOpen}
          title="Terms of service"
          description="Review and accept to continue."
          closeOnEscape={false}
          closeOnOverlayClick={false}
          footer={<Button onClick={() => setLockedOpen(false)}>Accept & continue</Button>}
        >
          <Text>
            Escape and overlay click are disabled. Use this pattern sparingly — only when keyboard
            dismissal would be a security or UX footgun.
          </Text>
        </Drawer>
      </section>

      {/* WITH CLOSE BUTTON */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          With close button
        </Heading>
        <Text color="muted">
          <code>showCloseButton=true</code> renders an X icon at top-right (Dialog parity). Default
          is <code>false</code> — drawers are typically action-driven.
        </Text>
        <div className={styles.row}>
          <Button onClick={() => setWithCloseOpen(true)}>Open with close button</Button>
        </div>
        <Drawer
          open={withCloseOpen}
          onOpenChange={setWithCloseOpen}
          title="Settings"
          description="Close via top-right X, Escape, or tap overlay."
          showCloseButton
        >
          <Text>
            Close button uses <code>touch-target</code> mixin for 44×44 mobile minimum (WCAG 2.5.5).
          </Text>
        </Drawer>
      </section>

      {/* SCROLLABLE (tall content, sticky footer) */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Scrollable drawer (sticky footer)
        </Heading>
        <Text color="muted">
          Long content scrolls inside drawer while footer stays sticky at bottom via{' '}
          <code>flex-shrink: 0</code> on footer and <code>flex: 1 1 auto; overflow-y: auto</code> on
          body.
        </Text>
        <div className={styles.row}>
          <Button onClick={() => setScrollOpen(true)}>Open scrollable drawer</Button>
        </div>
        <Drawer
          open={scrollOpen}
          onOpenChange={setScrollOpen}
          title="Long content"
          size="lg"
          footer={<Button onClick={() => setScrollOpen(false)}>Close</Button>}
        >
          <div className={styles.scrollContent}>
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className={styles.scrollItem}>
                <Text variant="small">
                  Item {i + 1} — scrollable content inside drawer body. Footer stays sticky at the
                  bottom of the drawer.
                </Text>
              </div>
            ))}
          </div>
        </Drawer>
      </section>

      {/* SIZES */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Size variants
        </Heading>
        <Text color="muted">
          Three sizes: <code>sm</code> (360px max-height), <code>md</code> (560px, default),{' '}
          <code>lg</code> (80dvh with 80vh fallback for older iOS Safari).
        </Text>
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setSizeOpen('sm')}>
            Open sm drawer
          </Button>
          <Button variant="secondary" onClick={() => setSizeOpen('md')}>
            Open md drawer
          </Button>
          <Button variant="secondary" onClick={() => setSizeOpen('lg')}>
            Open lg drawer
          </Button>
        </div>
        <Drawer
          open={sizeOpen !== null}
          onOpenChange={(v) => !v && setSizeOpen(null)}
          title={`Drawer size — ${sizeOpen ?? 'md'}`}
          description="Height variants use max-height instead of max-width (Drawer is always full-width on mobile)."
          size={sizeOpen ?? 'md'}
          footer={<Button onClick={() => setSizeOpen(null)}>Close</Button>}
        >
          <Text>
            Content fills the drawer up to the configured max-height. Overflowing content scrolls
            inside the body while the footer stays sticky at the bottom.
          </Text>
        </Drawer>
      </section>
    </main>
  );
}
