'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  type PopoverPlacement,
} from '@/components/complex/Popover';
import { Button } from '@/components/interactive/Button';
import { Input } from '@/components/interactive/Input';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

const PLACEMENTS: PopoverPlacement[] = [
  'top-start',
  'top',
  'top-end',
  'left',
  'right',
  'bottom-start',
  'bottom',
  'bottom-end',
];

export default function PopoverPlaygroundPage() {
  const [controlledOpen, setControlledOpen] = useState(false);
  const [rows, setRows] = useState(3);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          Popover
        </Heading>
        <Text className={styles.intro}>
          Phase 10 CI5 (E20) — floating panel anchored to a trigger for contextual content.
          Implements WAI-ARIA APG{' '}
          <a
            href="https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/"
            target="_blank"
            rel="noreferrer"
          >
            /dialog-modal/
          </a>{' '}
          non-modal variant. Compound flat API (D24): <code>Popover</code> +{' '}
          <code>PopoverTrigger</code> + <code>PopoverContent</code>. Zero runtime deps — extends
          E19 positioning engine with new <code>computeArrowPosition</code> utility + optional
          <code>arrow</code> ref in <code>useFloating</code>. Non-modal by default, optional{' '}
          <code>modal=true</code> reuses <code>useFocusTrap</code> from Dialog.
        </Text>
      </header>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Basic click + focus
        </Heading>
        <Text>
          Default placement <code>bottom</code>. Click opens, click again toggles, Escape or
          outside click closes. Focus moves into popover content on open and restores to
          trigger on close.
        </Text>
        <div className={styles.row}>
          <Popover>
            <PopoverTrigger asChild>
              <Button>Open</Button>
            </PopoverTrigger>
            <PopoverContent title="Account" description="Signed in as user@example.com">
              <Text>
                Your session is active. Manage profile, billing, and preferences from your
                account dashboard.
              </Text>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Placement grid
        </Heading>
        <Text>
          8 placements on display. Flip + shift middleware keep the popover inside the viewport
          bounds regardless of trigger position.
        </Text>
        <div className={styles.placementGrid}>
          {PLACEMENTS.map((placement) => (
            <Popover key={placement} placement={placement}>
              <PopoverTrigger asChild>
                <Button variant="secondary">{placement}</Button>
              </PopoverTrigger>
              <PopoverContent>
                <Text>Placement: {placement}</Text>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          With arrow decoration
        </Heading>
        <Text>
          Opt-in <code>showArrow</code> prop renders a rotated-square arrow pointing at the
          trigger. Arrow position is computed via <code>computeArrowPosition</code> and stays
          aligned with the trigger center even after shift middleware runs.
        </Text>
        <div className={styles.row}>
          <Popover showArrow placement="bottom">
            <PopoverTrigger asChild>
              <Button>With arrow</Button>
            </PopoverTrigger>
            <PopoverContent title="Notifications">
              <Text>Popover with arrow pointing at trigger.</Text>
            </PopoverContent>
          </Popover>
          <Popover showArrow placement="right">
            <PopoverTrigger asChild>
              <Button variant="secondary">Right + arrow</Button>
            </PopoverTrigger>
            <PopoverContent>
              <Text>Right placement with arrow on left edge.</Text>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Interactive form content
        </Heading>
        <Text>
          Popover content can hold any interactive elements. Focus moves to the first tabbable
          on open; the grace area and outside-click handling let users interact freely until
          they click outside or press Escape.
        </Text>
        <div className={styles.row}>
          <Popover>
            <PopoverTrigger asChild>
              <Button>Quick filter</Button>
            </PopoverTrigger>
            <PopoverContent
              title="Filter results"
              description="Narrow by name or email"
              footer={
                <>
                  <Button variant="ghost" size="sm">
                    Clear
                  </Button>
                  <Button size="sm">Apply</Button>
                </>
              }
            >
              <Input label="Name" name="name" placeholder="Search by name" />
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="user@example.com"
              />
            </PopoverContent>
          </Popover>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Modal mode
        </Heading>
        <Text>
          Opt-in <code>modal=true</code> adds full focus trap (reusing Dialog&rsquo;s{' '}
          <code>useFocusTrap</code>), background <code>inert</code> toggle, and body scroll
          lock. Use for destructive confirms or forms that cannot be abandoned mid-entry.
        </Text>
        <div className={styles.row}>
          <Popover modal>
            <PopoverTrigger asChild>
              <Button variant="warning">Open modal</Button>
            </PopoverTrigger>
            <PopoverContent
              title="Confirm action"
              description="This modal popover traps focus."
              footer={<Button size="sm">Confirm</Button>}
            >
              <Text>
                Tab cycles within the popover. Background is <code>inert</code>. Body scroll is
                locked.
              </Text>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Non-dismissable
        </Heading>
        <Text>
          <code>dismissable=false</code> disables Escape and outside-click close. Consumer must
          provide an explicit close action (e.g., a button calling{' '}
          <code>onOpenChange(false)</code>).
        </Text>
        <div className={styles.row}>
          <Popover dismissable={false}>
            <PopoverTrigger asChild>
              <Button variant="secondary">Non-dismissable</Button>
            </PopoverTrigger>
            <PopoverContent
              title="Required choice"
              description="Only an explicit action closes this popover."
              footer={<Button size="sm">Acknowledged</Button>}
            >
              <Text>
                Escape and outside click do not close this popover. Use the footer button.
              </Text>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Controlled state
        </Heading>
        <Text>
          Consumer owns the open state via <code>open</code> + <code>onOpenChange</code>. The
          external button below toggles the popover programmatically.
        </Text>
        <div className={styles.row}>
          <Popover open={controlledOpen} onOpenChange={setControlledOpen}>
            <PopoverTrigger asChild>
              <Button>Controlled target</Button>
            </PopoverTrigger>
            <PopoverContent title="Controlled">
              <Text>
                This popover&rsquo;s open state is managed externally by the Toggle button.
              </Text>
            </PopoverContent>
          </Popover>
          <Button variant="secondary" onClick={() => setControlledOpen((prev) => !prev)}>
            {controlledOpen ? 'Close' : 'Open'} from outside
          </Button>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Dynamic content — auto-reposition
        </Heading>
        <Text>
          Adding content re-measures the popover via <code>ResizeObserver</code>. Positioning
          engine re-runs flip + shift on every size change.
        </Text>
        <div className={styles.row}>
          <Popover>
            <PopoverTrigger asChild>
              <Button>Dynamic content</Button>
            </PopoverTrigger>
            <PopoverContent
              title="List"
              footer={
                <Button size="sm" onClick={() => setRows((prev) => prev + 1)}>
                  Add row
                </Button>
              }
            >
              <div className={styles.dynamicList}>
                {Array.from({ length: rows }).map((_, index) => (
                  <div key={index} className={styles.dynamicItem}>
                    Item {index + 1}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </section>
    </main>
  );
}
