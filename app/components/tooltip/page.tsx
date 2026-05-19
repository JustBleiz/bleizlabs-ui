'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Tooltip, TooltipProvider, type TooltipPlacement } from '@/components/complex/Tooltip';
import { Button } from '@/components/interactive/Button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

const PLACEMENTS: TooltipPlacement[] = [
  'top-start',
  'top',
  'top-end',
  'left',
  'bottom',
  'right',
  'bottom-start',
  'bottom',
  'bottom-end',
];

export default function TooltipPlaygroundPage() {
  const [controlledOpen, setControlledOpen] = useState(false);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          Tooltip
        </Heading>
        <Text className={styles.intro}>
          Short contextual label shown on hover or keyboard focus. Dismissable with Escape,
          hoverable via a grace area so the pointer can travel into the content, and fully
          keyboard-accessible — focus and hover behave identically.
        </Text>
      </header>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Basic hover + focus
        </Heading>
        <Text>
          Default placement <code>top</code>, default <code>delayDuration=700</code>. Keyboard: Tab
          to focus — tooltip shows instantly (focus is explicit intent, no delay). Mouse: hover and
          wait 700ms.
        </Text>
        <div className={styles.row}>
          <Tooltip content="Save file (Ctrl+S)">
            <Button>Save</Button>
          </Tooltip>
          <Tooltip content="Undo last action (Ctrl+Z)">
            <Button variant="secondary">Undo</Button>
          </Tooltip>
          <Tooltip content="Permanently delete. Cannot be undone.">
            <Button variant="warning">Delete</Button>
          </Tooltip>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Grouped — TooltipProvider
        </Heading>
        <Text>
          Wrapping multiple tooltips in <code>TooltipProvider</code> enables a shared skip-delay
          window. After the first tooltip opens, moving to sibling triggers opens them instantly
          (Radix convention, #2372). Defaults: <code>delayDuration=700</code>,{' '}
          <code>skipDelayDuration=300</code>.
        </Text>
        <TooltipProvider>
          <div className={styles.row}>
            <Tooltip content="Bold (Ctrl+B)">
              <Button variant="ghost">B</Button>
            </Tooltip>
            <Tooltip content="Italic (Ctrl+I)">
              <Button variant="ghost">I</Button>
            </Tooltip>
            <Tooltip content="Underline (Ctrl+U)">
              <Button variant="ghost">U</Button>
            </Tooltip>
            <Tooltip content="Strikethrough (Ctrl+Shift+X)">
              <Button variant="ghost">S</Button>
            </Tooltip>
            <Tooltip content="Inline code (Ctrl+E)">
              <Button variant="ghost">{'<>'}</Button>
            </Tooltip>
          </div>
        </TooltipProvider>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Placement grid
        </Heading>
        <Text>
          12 placements available. Positioning engine flips to the opposite axis when the preferred
          placement would clip the viewport, and shifts along the cross-axis to stay within bounds.
        </Text>
        <div className={styles.placementGrid}>
          {PLACEMENTS.map((placement, index) => (
            <Tooltip key={`${placement}-${index}`} content={placement} placement={placement}>
              <Button variant="secondary">{placement}</Button>
            </Tooltip>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Interactive content (hoverable)
        </Heading>
        <Text>
          Grace area <code>closeDelay=100</code> allows the pointer to travel from trigger into
          tooltip content. Interactive children (links) stay reachable. This is required by SC
          1.4.13 &ldquo;hoverable&rdquo; for keyboard users who zoom content.
        </Text>
        <div className={styles.row}>
          <Tooltip
            content={
              <>
                See the{' '}
                <a
                  href="https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.tooltipLink}
                >
                  APG spec
                </a>{' '}
                for full requirements.
              </>
            }
          >
            <Button>APG reference</Button>
          </Tooltip>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Long content — max-width + wrap
        </Heading>
        <Text>
          Default <code>maxWidth=&quot;min(320px, 90vw)&quot;</code> caps long tooltips, word-wrap
          handles overflow, shift middleware keeps it within viewport bounds (Radix #1476).
        </Text>
        <div className={styles.row}>
          <Tooltip content="This tooltip contains a longer explanation that will wrap to multiple lines rather than overflow the viewport. The positioning engine's shift middleware ensures it stays inside the visible area no matter where the trigger sits.">
            <Button>Hover for details</Button>
          </Tooltip>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Controlled state
        </Heading>
        <Text>
          Consumer owns open state via <code>open</code> + <code>onOpenChange</code>. Useful for
          guided tours and programmatic reveals.
        </Text>
        <div className={styles.row}>
          <Tooltip
            content="This tooltip is controlled externally"
            open={controlledOpen}
            onOpenChange={setControlledOpen}
          >
            <Button>Programmatic target</Button>
          </Tooltip>
          <Button variant="secondary" onClick={() => setControlledOpen((prev) => !prev)}>
            {controlledOpen ? 'Hide' : 'Show'} tooltip
          </Button>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Placement spec — keyboard walkthrough
        </Heading>
        <Text>
          Tab through the buttons below with the keyboard. Each shows its tooltip on focus and hides
          on blur. Press <span className={styles.kbd}>Esc</span> to dismiss without losing focus —
          the trigger remains active.
        </Text>
        <div className={styles.row}>
          <Tooltip content="First in tab order" placement="bottom">
            <Button>First</Button>
          </Tooltip>
          <Tooltip content="Second — tab here" placement="bottom">
            <Button>Second</Button>
          </Tooltip>
          <Tooltip content="Third — tab here too" placement="bottom">
            <Button>Third</Button>
          </Tooltip>
        </div>
      </section>
    </main>
  );
}
