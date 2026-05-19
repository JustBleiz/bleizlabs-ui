'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Sheet, type SheetSide, type SheetSize } from '@/components/complex/Sheet';
import { Button } from '@/components/interactive/Button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function SheetPlaygroundPage() {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [topOpen, setTopOpen] = useState(false);
  const [bottomOpen, setBottomOpen] = useState(false);
  const [minimalOpen, setMinimalOpen] = useState(false);
  const [lockedOpen, setLockedOpen] = useState(false);
  const [scrollableOpen, setScrollableOpen] = useState(false);
  const [sizeDemo, setSizeDemo] = useState<{ side: SheetSide; size: SheetSize } | null>(null);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          Sheet
        </Heading>
        <Text className={styles.intro}>
          Side-anchored modal panel that can slide in from the left, right, top, or bottom edge.
          Useful for navigation, filters, and detail views that shouldn&apos;t take over the full
          viewport. Inner corners round, outer edge sits flush, and per-side animations are wired
          for you.
        </Text>
      </header>

      {/* 4 SIDES */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          4 directional variants
        </Heading>
        <Text color="muted">
          <code>{`side: 'left' | 'right' | 'top' | 'bottom'`}</code>. Default{' '}
          <code>{`'right'`}</code>. Each side gets its own slide animation, inner-corner
          border-radius, outer-edge border removal, and matching safe-area-inset padding (iPad notch
          / Dynamic Island / home indicator).
        </Text>
        <div className={styles.row}>
          <Button onClick={() => setLeftOpen(true)}>Open left sheet</Button>
          <Button onClick={() => setRightOpen(true)}>Open right sheet</Button>
          <Button onClick={() => setTopOpen(true)}>Open top sheet</Button>
          <Button onClick={() => setBottomOpen(true)}>Open bottom sheet</Button>
        </div>

        <Sheet
          open={leftOpen}
          onOpenChange={setLeftOpen}
          side="left"
          title="Left sheet"
          description="Slides in from the left edge."
          footer={<Button onClick={() => setLeftOpen(false)}>Close</Button>}
        >
          <Text>
            Typical use: primary navigation drawer on desktop + mobile. Left sheets honor{' '}
            <code>env(safe-area-inset-left)</code>.
          </Text>
        </Sheet>

        <Sheet
          open={rightOpen}
          onOpenChange={setRightOpen}
          side="right"
          title="Product details"
          description="Full specifications and pricing."
          footer={
            <>
              <Button variant="ghost" onClick={() => setRightOpen(false)}>
                Close
              </Button>
              <Button onClick={() => setRightOpen(false)}>Add to cart</Button>
            </>
          }
        >
          <Text>
            Right sheets are the default — common for detail panels, settings, and contextual forms.
            Width: 420px (md). Close button visible by default (<code>showCloseButton=true</code>).
          </Text>
        </Sheet>

        <Sheet
          open={topOpen}
          onOpenChange={setTopOpen}
          side="top"
          title="Notification center"
          description="Slides down from the top."
          footer={<Button onClick={() => setTopOpen(false)}>Dismiss</Button>}
        >
          <Text>
            Top sheets are useful for global notifications, banner alerts, and search overlays.
            Honors <code>env(safe-area-inset-top)</code> for iPhone notch / Dynamic Island.
          </Text>
        </Sheet>

        <Sheet
          open={bottomOpen}
          onOpenChange={setBottomOpen}
          side="bottom"
          title="Action sheet"
          description="Slides up from the bottom."
          footer={<Button onClick={() => setBottomOpen(false)}>Close</Button>}
        >
          <Text>
            Bottom sheets overlap with Drawer functionality. Use Drawer for pure mobile action
            sheets (it&rsquo;s optimized for that case); use Sheet when you want 4-direction
            symmetry.
          </Text>
        </Sheet>
      </section>

      {/* MINIMAL (no description, no close button) */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Minimal sheet (no close button)
        </Heading>
        <Text color="muted">
          <code>showCloseButton=false</code> + no <code>description</code> → header shows only
          title, <code>aria-describedby</code> absent.
        </Text>
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setMinimalOpen(true)}>
            Open minimal sheet
          </Button>
        </div>
        <Sheet
          open={minimalOpen}
          onOpenChange={setMinimalOpen}
          side="right"
          title="Read-only"
          showCloseButton={false}
          footer={<Button onClick={() => setMinimalOpen(false)}>OK</Button>}
        >
          <Text>
            Action-driven sheet — user must dismiss via Escape, overlay click, or footer button. No
            X icon in header.
          </Text>
        </Sheet>
      </section>

      {/* LOCKED */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Locked sheet
        </Heading>
        <Text color="muted">
          <code>closeOnEscape=false</code> + <code>closeOnOverlayClick=false</code> — user must
          complete an explicit action via footer button.
        </Text>
        <div className={styles.row}>
          <Button variant="warning" onClick={() => setLockedOpen(true)}>
            Open locked sheet
          </Button>
        </div>
        <Sheet
          open={lockedOpen}
          onOpenChange={setLockedOpen}
          side="right"
          title="Session timeout"
          description="You must take action to continue."
          closeOnEscape={false}
          closeOnOverlayClick={false}
          showCloseButton={false}
          footer={
            <>
              <Button variant="ghost" onClick={() => setLockedOpen(false)}>
                Log out
              </Button>
              <Button onClick={() => setLockedOpen(false)}>Extend session</Button>
            </>
          }
        >
          <Text>
            Use locked sheets sparingly — only when keyboard dismissal would create a security or UX
            footgun. Overlay click and Escape both blocked.
          </Text>
        </Sheet>
      </section>

      {/* SCROLLABLE */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Scrollable sheet (sticky footer)
        </Heading>
        <Text color="muted">
          Long content scrolls inside body while footer stays sticky. Inherits Drawer&rsquo;s
          overflow isolation pattern (<code>overflow-y: auto</code> on <code>.body</code>, not{' '}
          <code>.content</code>).
        </Text>
        <div className={styles.row}>
          <Button onClick={() => setScrollableOpen(true)}>Open scrollable sheet</Button>
        </div>
        <Sheet
          open={scrollableOpen}
          onOpenChange={setScrollableOpen}
          side="right"
          size="lg"
          title="Long content"
          description="Body scrolls, footer stays pinned."
          footer={<Button onClick={() => setScrollableOpen(false)}>Close</Button>}
        >
          <div className={styles.scrollContent}>
            {Array.from({ length: 25 }, (_, i) => (
              <div key={i} className={styles.scrollItem}>
                <Text variant="small">
                  Item {i + 1} — scrollable content. Body flex-grows with isolated overflow; footer
                  flex-shrinks at 0.
                </Text>
              </div>
            ))}
          </div>
        </Sheet>
      </section>

      {/* SIZE VARIANTS */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Size variants
        </Heading>
        <Text color="muted">
          Horizontal (left/right): <code>sm 320px</code> / <code>md 420px</code> /{' '}
          <code>lg 560px</code> widths. Vertical (top/bottom): <code>sm 240px</code> /{' '}
          <code>md 360px</code> / <code>lg 80vh</code> (with <code>80dvh</code> progressive override
          for iOS Safari).
        </Text>
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setSizeDemo({ side: 'right', size: 'sm' })}>
            Open sm right sheet
          </Button>
          <Button variant="secondary" onClick={() => setSizeDemo({ side: 'right', size: 'lg' })}>
            Open lg right sheet
          </Button>
          <Button variant="secondary" onClick={() => setSizeDemo({ side: 'top', size: 'sm' })}>
            Open sm top sheet
          </Button>
          <Button variant="secondary" onClick={() => setSizeDemo({ side: 'bottom', size: 'lg' })}>
            Open lg bottom sheet
          </Button>
        </div>
        <Sheet
          open={sizeDemo !== null}
          onOpenChange={(v) => !v && setSizeDemo(null)}
          side={sizeDemo?.side ?? 'right'}
          size={sizeDemo?.size ?? 'md'}
          title={`${sizeDemo?.side ?? 'right'} sheet — size ${sizeDemo?.size ?? 'md'}`}
          description="Horizontal uses width, vertical uses height."
          footer={<Button onClick={() => setSizeDemo(null)}>Close</Button>}
        >
          <Text>
            Content fills the sheet up to the configured size. Overflow is isolated to the body.
          </Text>
        </Sheet>
      </section>
    </main>
  );
}
