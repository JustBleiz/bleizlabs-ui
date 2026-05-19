'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  HoverCard,
  HoverCardProvider,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/complex/HoverCard';
import { Button } from '@/components/interactive/Button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Avatar } from '@/components/display/Avatar';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

const FEED_AUTHORS = [
  {
    handle: 'jane',
    name: 'Jane Doe',
    role: 'Engineering @ Acme',
    bio: 'Building copy-to-project component libraries. Loves SCSS Modules and zero-dep architecture.',
    followers: 1240,
    following: 318,
    pinned: 'Just shipped a refactor sprint extracting 5 composable primitives.',
  },
  {
    handle: 'leo',
    name: 'Leo Park',
    role: 'Design Lead @ Studio Mu',
    bio: 'Type, motion, systems. Currently obsessed with seed-based design tokens.',
    followers: 8412,
    following: 521,
    pinned: 'Three rules of variable typography: spacing first, weight second, size last.',
  },
  {
    handle: 'mira',
    name: 'Mira Singh',
    role: 'Product Manager @ Northwave',
    bio: 'Healthcare CDSS, clinical workflows, and the ethics of AI in medicine.',
    followers: 3220,
    following: 410,
    pinned: 'A good roadmap is one you can defend out loud.',
  },
];

export default function HoverCardPlaygroundPage() {
  const [controlledOpen, setControlledOpen] = useState(false);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          HoverCard
        </Heading>
        <Text className={styles.intro}>
          Floating surface that opens on hover or focus, for rich previews like user cards, link
          metadata, or product details. Unlike Tooltip, HoverCard can contain interactive content —
          links, buttons, nested components — and supports a grace area for pointer travel.
        </Text>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Basic — link with profile preview
        </Heading>
        <Text>
          Default <code>openDelay=700</code> + <code>closeDelay=300</code> (Radix conventions).
          Hover the link to open after the warm-up delay; pointer can travel into the surface via
          grace area; pointer leave (or focus-out via Tab) closes after the close delay.
        </Text>
        <div className={styles.row}>
          <Text>
            Read more about{' '}
            <HoverCard>
              <HoverCardTrigger asChild>
                <a href="#" className={styles.link}>
                  @jane
                </a>
              </HoverCardTrigger>
              <HoverCardContent
                title="Jane Doe"
                description="Engineering @ Acme"
                footer={<Text variant="caption">1,240 followers · 318 following</Text>}
              >
                <Text>
                  Building copy-to-project component libraries. Loves SCSS Modules and zero-dep
                  architecture.
                </Text>
              </HoverCardContent>
            </HoverCard>
            and her latest sprint notes.
          </Text>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Avatar trigger with rich content
        </Heading>
        <Text>
          <code>HoverCardTrigger asChild</code> wraps the Avatar without adding a wrapper element.
          Content slot accepts arbitrary JSX — buttons inside the surface remain interactive (focus
          moves freely, blur with <code>relatedTarget</code> awareness keeps the surface open while
          the user is interacting).
        </Text>
        <div className={styles.row}>
          <HoverCard>
            <HoverCardTrigger asChild>
              <button type="button" className={styles.avatarButton} aria-label="Leo Park profile">
                <Avatar fallback="LP" alt="Leo Park" size="lg" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent
              title="Leo Park"
              description="Design Lead @ Studio Mu"
              footer={
                <>
                  <Text variant="caption">8,412 followers</Text>
                  <Button size="sm" variant="primary">
                    Follow
                  </Button>
                </>
              }
            >
              <Text>
                Type, motion, systems. Currently obsessed with seed-based design tokens and the math
                behind variable typography.
              </Text>
              <Badge color="brand">Design</Badge>
            </HoverCardContent>
          </HoverCard>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Provider — delay group (skip warm-up after first open)
        </Heading>
        <Text>
          Wrap a feed/sidebar in <code>HoverCardProvider</code>. Once one HoverCard opens, siblings
          open instantly within the <code>skipDelayDuration</code> window (default 300ms). Mirror of{' '}
          <code>TooltipProvider</code> — same callback-based pattern for delay-group coordination.
        </Text>
        <HoverCardProvider>
          <ul className={styles.feed}>
            {FEED_AUTHORS.map((author) => (
              <li key={author.handle} className={styles.feedItem}>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <a href="#" className={styles.link}>
                      @{author.handle}
                    </a>
                  </HoverCardTrigger>
                  <HoverCardContent
                    title={author.name}
                    description={author.role}
                    footer={
                      <Text variant="caption">
                        {author.followers.toLocaleString()} followers ·{' '}
                        {author.following.toLocaleString()} following
                      </Text>
                    }
                  >
                    <Text>{author.bio}</Text>
                    <Text variant="small" color="muted">
                      &ldquo;{author.pinned}&rdquo;
                    </Text>
                  </HoverCardContent>
                </HoverCard>
                <Text variant="small" color="muted">
                  {author.pinned}
                </Text>
              </li>
            ))}
          </ul>
        </HoverCardProvider>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Custom delay timings
        </Heading>
        <Text>
          Override <code>openDelay</code> and <code>closeDelay</code> per instance. Inside a
          <code>HoverCardProvider</code> the per-instance <code>openDelay</code> is ignored
          (provider wins).
        </Text>
        <div className={styles.row}>
          <HoverCard openDelay={150} closeDelay={500}>
            <HoverCardTrigger asChild>
              <a href="#" className={styles.link}>
                Quick open / slow close
              </a>
            </HoverCardTrigger>
            <HoverCardContent title="Tunable timing">
              <Text variant="small">
                <code>openDelay=150</code> + <code>closeDelay=500</code>
              </Text>
              <Text>
                Useful for snappy nav links where the preview should appear immediately on hover but
                linger long enough for the user to commit to clicking through.
              </Text>
            </HoverCardContent>
          </HoverCard>

          <HoverCard openDelay={1500} closeDelay={100}>
            <HoverCardTrigger asChild>
              <a href="#" className={styles.link}>
                Slow open / quick close
              </a>
            </HoverCardTrigger>
            <HoverCardContent title="Patient hover">
              <Text variant="small">
                <code>openDelay=1500</code> + <code>closeDelay=100</code>
              </Text>
              <Text>
                Useful when the trigger overlaps with other clickable elements — wait for deliberate
                hover intent before showing the preview.
              </Text>
            </HoverCardContent>
          </HoverCard>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Controlled state
        </Heading>
        <Text>
          Consumer owns <code>open</code> via <code>open</code> + <code>onOpenChange</code>. Hover,
          focus, and blur still drive the open transitions — but consumer code can also force-open
          or force-close programmatically.
        </Text>
        <div className={styles.row}>
          <HoverCard open={controlledOpen} onOpenChange={setControlledOpen}>
            <HoverCardTrigger asChild>
              <a href="#" className={styles.link}>
                Controlled @mira
              </a>
            </HoverCardTrigger>
            <HoverCardContent title="Mira Singh" description="Product Manager @ Northwave">
              <Text>Healthcare CDSS, clinical workflows, and the ethics of AI in medicine.</Text>
            </HoverCardContent>
          </HoverCard>
          <Button size="sm" variant="secondary" onClick={() => setControlledOpen((prev) => !prev)}>
            {controlledOpen ? 'Force close' : 'Force open'}
          </Button>
          <Text variant="caption">
            external state: <code>{controlledOpen ? 'open' : 'closed'}</code>
          </Text>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Keyboard parity (focus path)
        </Heading>
        <Text>
          Tab into the link below — focus opens the HoverCard <strong>instantly</strong> (no warm-up
          delay; SC 2.1.1 explicit intent). Tab again to move into content (the inner link inside
          the HoverCard); the surface stays open because <code>relatedTarget</code> is contained in
          the popper. Tab out to close. Press Escape at any time to close without losing trigger
          focus (SC 1.4.13 dismissable).
        </Text>
        <div className={styles.row}>
          <HoverCard>
            <HoverCardTrigger asChild>
              <a href="#" className={styles.link}>
                Focus me with Tab
              </a>
            </HoverCardTrigger>
            <HoverCardContent
              title="Keyboard parity demo"
              description="Tab into the link below to test focus retention"
            >
              <Text>
                Focus moves into this surface when you press Tab. The HoverCard stays open because{' '}
                <code>onBlur</code> on the trigger checks <code>relatedTarget</code> — if focus
                moved into the popper container, the close is suppressed.
              </Text>
              <a href="#" className={styles.link}>
                Inner action link
              </a>
            </HoverCardContent>
          </HoverCard>
        </div>
      </section>
    </main>
  );
}
