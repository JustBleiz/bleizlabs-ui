'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuGroup,
} from '@/components/complex/ContextMenu';
import { Button } from '@/components/interactive/Button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

interface FileItem {
  id: number;
  name: string;
  icon: string;
}

const FILES: FileItem[] = [
  { id: 1, name: 'report.pdf', icon: '📄' },
  { id: 2, name: 'image.png', icon: '🖼️' },
  { id: 3, name: 'archive.zip', icon: '🗜️' },
];

export default function ContextMenuPlaygroundPage() {
  const [controlledOpen, setControlledOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [gridVisible, setGridVisible] = useState(true);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          ContextMenu
        </Heading>
        <Text className={styles.intro}>
          Right-click menu anchored to the pointer position. Shares the full keyboard model with
          DropdownMenu, suppresses the native browser menu, and closes on scroll to match OS
          conventions. Wrap any element — table rows, cards, tree nodes — with{' '}
          <code>ContextMenuTrigger</code>.
        </Text>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setLastAction(null)}
          aria-label="Focus anchor"
        >
          Focus anchor (click to clear action log)
        </Button>
        {/* E148: reserve space unconditionally — conditional mount on first
            click adds a layout-shift ABOVE the viewport scroll position that
            triggers Chromium's scroll-anchoring adjustment, firing a real
            scroll event that dismisses any open ContextMenu (closeOnScroll
            default true). Renders placeholder line when lastAction is null so
            subsequent menuitem clicks cause no layout delta in CI. */}
        <Text variant="small" color={lastAction ? 'brand' : 'muted'} aria-live="polite">
          {lastAction ? (
            <>
              Last action: <code>{lastAction}</code>
            </>
          ) : (
            'Last action: (none yet — right-click a drop zone and pick an item)'
          )}
        </Text>
      </header>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Basic drop-zone context menu
        </Heading>
        <Text>
          Right-click inside the zone below to open the context menu at cursor coordinates. The
          native browser context menu is suppressed via <code>event.preventDefault()</code>.
        </Text>
        <ContextMenu>
          <ContextMenuTrigger asChild={false}>
            <div className={styles.dropZone}>Right-click me</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={() => setLastAction('Cut')}>Cut</ContextMenuItem>
            <ContextMenuItem onSelect={() => setLastAction('Copy')}>Copy</ContextMenuItem>
            <ContextMenuItem onSelect={() => setLastAction('Paste')}>Paste</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => setLastAction('Duplicate')}>Duplicate</ContextMenuItem>
            <ContextMenuItem onSelect={() => setLastAction('Delete')}>Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Per-row context menu (asChild on list items)
        </Heading>
        <Text>
          Each file row has its own <code>ContextMenu</code> with <code>asChild</code> wrapping the
          row element — no wrapper div breaks the list DOM.
        </Text>
        <div className={styles.fileList}>
          {FILES.map((file) => (
            <ContextMenu key={file.id}>
              <ContextMenuTrigger asChild>
                <div className={styles.fileRow}>
                  <span className={styles.fileIcon} aria-hidden="true">
                    {file.icon}
                  </span>
                  <Text>{file.name}</Text>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuGroup labelledBy={`context-file-${file.id}-label`}>
                  <ContextMenuLabel id={`context-file-${file.id}-label`}>
                    File actions
                  </ContextMenuLabel>
                  <ContextMenuItem onSelect={() => setLastAction(`Open ${file.name}`)}>
                    Open
                  </ContextMenuItem>
                  <ContextMenuItem onSelect={() => setLastAction(`Rename ${file.name}`)}>
                    Rename
                  </ContextMenuItem>
                  <ContextMenuItem onSelect={() => setLastAction(`Duplicate ${file.name}`)}>
                    Duplicate
                  </ContextMenuItem>
                </ContextMenuGroup>
                <ContextMenuSeparator />
                <ContextMenuItem onSelect={() => setLastAction(`Delete ${file.name}`)}>
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Disabled items
        </Heading>
        <Text>
          Disabled items are skipped by arrow nav and typeahead. Native{' '}
          <code>&lt;button disabled&gt;</code> blocks click events; <code>aria-disabled</code>{' '}
          signals state to AT.
        </Text>
        <ContextMenu>
          <ContextMenuTrigger asChild={false}>
            <div className={styles.dropZone}>Right-click with disabled</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={() => setLastAction('Save')}>Save</ContextMenuItem>
            <ContextMenuItem disabled>Save as... (coming soon)</ContextMenuItem>
            <ContextMenuItem onSelect={() => setLastAction('Export')}>Export</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem disabled>Archive (not available)</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Disabled trigger — allows native browser menu
        </Heading>
        <Text>
          When the trigger has <code>disabled=true</code>, <code>onContextMenu</code> does NOT call{' '}
          <code>preventDefault()</code> — the user gets their native browser context menu instead of
          ours.
        </Text>
        <ContextMenu>
          <ContextMenuTrigger disabled asChild={false}>
            <div className={styles.dropZone}>Right-click disabled trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>You should not see this menu</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          preventDefault keeps menu open
        </Heading>
        <Text>
          <code>onSelect</code> receives a cancelable <code>CustomEvent</code>. Calling{' '}
          <code>event.preventDefault()</code> keeps the menu open — useful for toggle actions (grid
          / ruler) or future CheckboxItem patterns.
        </Text>
        <ContextMenu>
          <ContextMenuTrigger asChild={false}>
            <div className={styles.dropZone}>Right-click with preventDefault</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setGridVisible((prev) => !prev);
                setLastAction(`Toggle grid (now ${!gridVisible ? 'visible' : 'hidden'})`);
              }}
            >
              Toggle grid {gridVisible ? '✓' : ' '}
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setLastAction('Toggle ruler (menu stayed open)');
              }}
            >
              Toggle ruler
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => setLastAction('Fullscreen — menu closed')}>
              Fullscreen (closes menu)
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </section>

      {/* ──────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Controlled state
        </Heading>
        <Text>
          Consumer owns open state via <code>open</code> + <code>onOpenChange</code>. Escape,
          outside click, item select, and scroll all trigger <code>onOpenChange(false)</code>.
        </Text>
        <div className={styles.row}>
          <ContextMenu open={controlledOpen} onOpenChange={setControlledOpen}>
            <ContextMenuTrigger asChild={false}>
              <div className={styles.dropZone}>Right-click controlled</div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onSelect={() => setLastAction('Controlled: Option 1')}>
                Option 1
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => setLastAction('Controlled: Option 2')}>
                Option 2
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
        <Text variant="small" color="muted">
          External state: <code>{controlledOpen ? 'open' : 'closed'}</code>
        </Text>
      </section>
    </main>
  );
}
