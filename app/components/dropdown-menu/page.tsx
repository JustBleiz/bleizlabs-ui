'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  type DropdownMenuPlacement,
} from '@/components/complex/DropdownMenu';
import { Button } from '@/components/interactive/Button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

const PLACEMENTS: DropdownMenuPlacement[] = [
  'top-start',
  'top',
  'top-end',
  'left',
  'right',
  'bottom-start',
  'bottom',
  'bottom-end',
];

export default function DropdownMenuPlaygroundPage() {
  const [controlledOpen, setControlledOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          DropdownMenu
        </Heading>
        <Text className={styles.intro}>
          Phase 10 CI7 (E21) — accessible menu per WAI-ARIA APG{' '}
          <a
            href="https://www.w3.org/WAI/ARIA/apg/patterns/menu/"
            target="_blank"
            rel="noreferrer"
          >
            /menu/
          </a>
          . Compound flat API (D24): <code>DropdownMenu</code> +{' '}
          <code>DropdownMenuTrigger</code> + <code>DropdownMenuContent</code> +{' '}
          <code>DropdownMenuItem</code> + <code>DropdownMenuSeparator</code> +{' '}
          <code>DropdownMenuLabel</code> + <code>DropdownMenuGroup</code>. Full keyboard model:
          Enter/Space/ArrowDown on trigger opens + focuses first item, ArrowUp opens + focuses
          last, Arrow keys cycle with wraparound (skipping disabled), Home/End jump, typeahead
          by first character (multi-char buffer, 500ms reset), Escape closes + restores focus
          to trigger, Tab closes (APG convention — differs from Dialog trap). Roving tabindex
          + `onSelect` cancelable event for future checkbox/radio items.
        </Text>
        {lastAction && (
          <Text variant="small" color="brand">
            Last action: <code>{lastAction}</code>
          </Text>
        )}
      </header>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Basic menu
        </Heading>
        <Text>
          Default placement <code>bottom-start</code> aligns menu left edge to trigger left
          edge. Click trigger (or press Enter/Space/ArrowDown) to open.
        </Text>
        <div className={styles.row}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setLastAction('Save')}>
                Save
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLastAction('Open')}>
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLastAction('Rename')}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLastAction('Delete')}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Disabled items + labels + separators
        </Heading>
        <Text>
          Disabled items are skipped by arrow-key navigation and typeahead. Separators and
          labels are visual-only — clicking them does not close the menu.
        </Text>
        <div className={styles.row}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">File</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup labelledBy="dropdown-file-label">
                <DropdownMenuLabel id="dropdown-file-label">Document</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setLastAction('New document')}>
                  New document
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setLastAction('Open')}>
                  Open&hellip;
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setLastAction('Save')}>
                  Save
                </DropdownMenuItem>
                <DropdownMenuItem disabled>Save as&hellip; (coming soon)</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup labelledBy="dropdown-export-label">
                <DropdownMenuLabel id="dropdown-export-label">Export</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setLastAction('Export PDF')}>
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setLastAction('Export DOCX')}>
                  DOCX
                </DropdownMenuItem>
                <DropdownMenuItem disabled>HTML (coming soon)</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setLastAction('Close')}>
                Close
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Typeahead (long list)
        </Heading>
        <Text>
          Type a letter (or several quickly) to jump to matching items. Buffer resets after
          500ms of no input. Try typing <code>b</code>, then <code>o</code>&rsquo;, then{' '}
          <code>l</code> to land on &ldquo;Bold&rdquo; vs &ldquo;Bullet list&rdquo;.
        </Text>
        <div className={styles.row}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">Format</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Align left</DropdownMenuItem>
              <DropdownMenuItem>Align center</DropdownMenuItem>
              <DropdownMenuItem>Align right</DropdownMenuItem>
              <DropdownMenuItem>Bold</DropdownMenuItem>
              <DropdownMenuItem>Bullet list</DropdownMenuItem>
              <DropdownMenuItem>Clear formatting</DropdownMenuItem>
              <DropdownMenuItem>Code block</DropdownMenuItem>
              <DropdownMenuItem>Italic</DropdownMenuItem>
              <DropdownMenuItem>Link</DropdownMenuItem>
              <DropdownMenuItem>Numbered list</DropdownMenuItem>
              <DropdownMenuItem>Quote</DropdownMenuItem>
              <DropdownMenuItem>Strikethrough</DropdownMenuItem>
              <DropdownMenuItem>Underline</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Placement grid
        </Heading>
        <Text>
          8 placements on display. Flip + shift middleware keeps the menu within viewport
          bounds regardless of trigger position.
        </Text>
        <div className={styles.placementGrid}>
          {PLACEMENTS.map((placement) => (
            <DropdownMenu key={placement} placement={placement}>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary">{placement}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Action 1</DropdownMenuItem>
                <DropdownMenuItem>Action 2</DropdownMenuItem>
                <DropdownMenuItem>Action 3</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Match trigger width
        </Heading>
        <Text>
          <code>matchTriggerWidth</code> forces menu min-width to match the trigger&rsquo;s
          width. Useful when the menu items are short and the trigger is wide (Radix #17 fix).
        </Text>
        <div className={styles.row}>
          <DropdownMenu matchTriggerWidth>
            <DropdownMenuTrigger asChild>
              <Button className={styles.wideTrigger}>Select account &darr;</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Alice</DropdownMenuItem>
              <DropdownMenuItem>Bob</DropdownMenuItem>
              <DropdownMenuItem>Carol</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          preventDefault keeps menu open
        </Heading>
        <Text>
          <code>onSelect</code> receives a cancelable <code>CustomEvent</code>. Calling{' '}
          <code>event.preventDefault()</code> keeps the menu open — useful for future
          CheckboxItem/RadioItem patterns where toggling state should not dismiss the menu.
        </Text>
        <div className={styles.row}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">View</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setLastAction('Toggle grid (menu stayed open)');
                }}
              >
                Toggle grid (stays open)
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setLastAction('Toggle ruler (menu stayed open)');
                }}
              >
                Toggle ruler (stays open)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setLastAction('Fullscreen — menu closed')}>
                Fullscreen (closes menu)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Controlled state
        </Heading>
        <Text>
          Consumer owns the open state via <code>open</code> + <code>onOpenChange</code>.
        </Text>
        <div className={styles.row}>
          <DropdownMenu open={controlledOpen} onOpenChange={setControlledOpen}>
            <DropdownMenuTrigger asChild>
              <Button>Controlled menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setLastAction('Option 1')}>
                Option 1
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLastAction('Option 2')}>
                Option 2
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="secondary" onClick={() => setControlledOpen((prev) => !prev)}>
            {controlledOpen ? 'Close' : 'Open'} from outside
          </Button>
        </div>
      </section>
    </main>
  );
}
