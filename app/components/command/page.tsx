'use client';

import { useState } from 'react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
  useCommandShortcut,
} from '@/components/complex/Command';
import { Button } from '@/components/interactive/Button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

export default function CommandPlayground() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [groupedOpen, setGroupedOpen] = useState(false);
  const [filteredOpen, setFilteredOpen] = useState(false);
  const [shortcutOpen, setShortcutOpen] = useState(false);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [customFilterOpen, setCustomFilterOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  useCommandShortcut('k', () => setShortcutOpen((o) => !o));

  const handleSelect = (value: string) => {
    setLastAction(value);
    setBasicOpen(false);
    setGroupedOpen(false);
    setFilteredOpen(false);
    setShortcutOpen(false);
    setLoadingOpen(false);
    setCustomFilterOpen(false);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          Command
        </Heading>
        <Text variant="lead" color="muted">
          Cmd+K command palette — a modal, searchable action launcher. Type
          to filter, arrow keys to navigate, Enter to run. Groups, shortcuts,
          loading states, and custom filter functions are built in.
        </Text>
        {lastAction !== null ? (
          <Inline gap={2} align="center">
            <Badge label="selected" color="brand" />
            <Text variant="small" className={styles.mono}>
              {lastAction}
            </Text>
          </Inline>
        ) : null}
      </header>

      {/* 1. Basic */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <Heading level={2} size="lg">
            1. Basic
          </Heading>
          <Text variant="small" color="muted">
            Minimal palette — list of actions, substring filter default.
          </Text>
        </header>
        <Button size="sm" variant="primary" onClick={() => setBasicOpen(true)}>
          Open palette
        </Button>
        <Command
          open={basicOpen}
          onOpenChange={setBasicOpen}
          aria-label="Basic command palette"
        >
          <CommandInput placeholder="Type a command…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandItem value="new-file" onSelect={handleSelect}>
              New file
            </CommandItem>
            <CommandItem value="open-file" onSelect={handleSelect}>
              Open file
            </CommandItem>
            <CommandItem value="save-file" onSelect={handleSelect}>
              Save file
            </CommandItem>
            <CommandItem value="close-file" onSelect={handleSelect}>
              Close file
            </CommandItem>
          </CommandList>
        </Command>
      </section>

      {/* 2. Grouped with separator + shortcuts */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <Heading level={2} size="lg">
            2. Grouped with separator + shortcuts
          </Heading>
          <Text variant="small" color="muted">
            CommandGroup with heading; CommandShortcut inline kbd pill.
          </Text>
        </header>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setGroupedOpen(true)}
        >
          Open grouped palette
        </Button>
        <Command
          open={groupedOpen}
          onOpenChange={setGroupedOpen}
          aria-label="Grouped command palette"
        >
          <CommandInput placeholder="Search commands…" />
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup heading="Files">
              <CommandItem value="new-file" onSelect={handleSelect}>
                New file
                <CommandShortcut>⌘N</CommandShortcut>
              </CommandItem>
              <CommandItem value="open-file" onSelect={handleSelect}>
                Open file
                <CommandShortcut>⌘O</CommandShortcut>
              </CommandItem>
              <CommandItem value="save-file" onSelect={handleSelect}>
                Save file
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Edit">
              <CommandItem value="undo" onSelect={handleSelect}>
                Undo
                <CommandShortcut>⌘Z</CommandShortcut>
              </CommandItem>
              <CommandItem value="redo" onSelect={handleSelect}>
                Redo
                <CommandShortcut>⇧⌘Z</CommandShortcut>
              </CommandItem>
              <CommandItem value="cut" disabled onSelect={handleSelect}>
                Cut (disabled)
                <CommandShortcut>⌘X</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="View">
              <CommandItem value="toggle-sidebar" onSelect={handleSelect}>
                Toggle sidebar
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
              <CommandItem value="toggle-theme" onSelect={handleSelect}>
                Toggle theme
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </section>

      {/* 3. Search filtering in action */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <Heading level={2} size="lg">
            3. Filter behavior
          </Heading>
          <Text variant="small" color="muted">
            Type &quot;paris&quot; to see contains filter; group heading hides
            when all items filter out.
          </Text>
        </header>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setFilteredOpen(true)}
        >
          Open city picker
        </Button>
        <Command
          open={filteredOpen}
          onOpenChange={setFilteredOpen}
          aria-label="City picker"
        >
          <CommandInput placeholder="Search cities…" />
          <CommandList>
            <CommandEmpty>No cities found.</CommandEmpty>
            <CommandGroup heading="Europe">
              <CommandItem value="paris" onSelect={handleSelect}>
                Paris
              </CommandItem>
              <CommandItem value="london" onSelect={handleSelect}>
                London
              </CommandItem>
              <CommandItem value="berlin" onSelect={handleSelect}>
                Berlin
              </CommandItem>
              <CommandItem value="madrid" onSelect={handleSelect}>
                Madrid
              </CommandItem>
              <CommandItem value="rome" onSelect={handleSelect}>
                Rome
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Asia">
              <CommandItem value="tokyo" onSelect={handleSelect}>
                Tokyo
              </CommandItem>
              <CommandItem value="seoul" onSelect={handleSelect}>
                Seoul
              </CommandItem>
              <CommandItem value="singapore" onSelect={handleSelect}>
                Singapore
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Americas">
              <CommandItem value="new-york" onSelect={handleSelect}>
                New York
              </CommandItem>
              <CommandItem value="san-francisco" onSelect={handleSelect}>
                San Francisco
              </CommandItem>
              <CommandItem value="toronto" onSelect={handleSelect}>
                Toronto
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </section>

      {/* 4. useCommandShortcut hook */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <Heading level={2} size="lg">
            4. Keyboard shortcut (Cmd+K / Ctrl+K)
          </Heading>
          <Text variant="small" color="muted">
            Press <code>⌘K</code> (or <code>Ctrl+K</code>) anywhere on this
            page to toggle. Consumer binds the key via{' '}
            <code>useCommandShortcut</code> hook.
          </Text>
        </header>
        <Inline gap={2}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShortcutOpen(true)}
          >
            Or click here
          </Button>
        </Inline>
        <Command
          open={shortcutOpen}
          onOpenChange={setShortcutOpen}
          aria-label="Shortcut palette"
        >
          <CommandInput placeholder="⌘K palette — type a command…" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup heading="Quick actions">
              <CommandItem value="goto-home" onSelect={handleSelect}>
                Go to home
                <CommandShortcut>⌘H</CommandShortcut>
              </CommandItem>
              <CommandItem value="goto-settings" onSelect={handleSelect}>
                Open settings
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
              <CommandItem value="goto-inbox" onSelect={handleSelect}>
                Open inbox
                <CommandShortcut>⌘I</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </section>

      {/* 5. Loading state */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <Heading level={2} size="lg">
            5. Async loading state
          </Heading>
          <Text variant="small" color="muted">
            <code>loading</code> prop shows CommandLoading placeholder.
          </Text>
        </header>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setLoadingOpen(true)}
        >
          Open loading palette
        </Button>
        <Command
          open={loadingOpen}
          onOpenChange={setLoadingOpen}
          loading
          aria-label="Loading palette"
        >
          <CommandInput placeholder="Loading…" />
          <CommandList />
        </Command>
      </section>

      {/* 6. Custom filter function */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <Heading level={2} size="lg">
            6. Custom filter (startsWith)
          </Heading>
          <Text variant="small" color="muted">
            Custom filter function overrides default substring contains.
          </Text>
        </header>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setCustomFilterOpen(true)}
        >
          Open startsWith palette
        </Button>
        <Command
          open={customFilterOpen}
          onOpenChange={setCustomFilterOpen}
          aria-label="startsWith palette"
          filter={(items, search) =>
            items
              .filter((item) =>
                item.textContent
                  .toLowerCase()
                  .startsWith(search.toLowerCase()),
              )
              .map((item) => item.id)
          }
        >
          <CommandInput placeholder="Type start of name…" />
          <CommandList>
            <CommandEmpty>No startsWith matches.</CommandEmpty>
            <CommandItem value="alice" onSelect={handleSelect}>
              Alice
            </CommandItem>
            <CommandItem value="bob" onSelect={handleSelect}>
              Bob
            </CommandItem>
            <CommandItem value="charlie" onSelect={handleSelect}>
              Charlie
            </CommandItem>
            <CommandItem value="dave" onSelect={handleSelect}>
              Dave
            </CommandItem>
            <CommandItem value="eve" onSelect={handleSelect}>
              Eve
            </CommandItem>
          </CommandList>
        </Command>
      </section>

      {/* 7. Keyboard walkthrough */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <Heading level={2} size="lg">
            7. Keyboard walkthrough
          </Heading>
        </header>
        <ul className={styles.keyboardList}>
          <li>
            <code>⌘K / Ctrl+K</code> — toggle shortcut palette (section 4)
          </li>
          <li>
            <code>type</code> — filter listbox live
          </li>
          <li>
            <code>ArrowDown / ArrowUp</code> — navigate items (skip disabled,
            wrap)
          </li>
          <li>
            <code>Home / End</code> — first / last item
          </li>
          <li>
            <code>PageDown / PageUp</code> — jump ±10 items
          </li>
          <li>
            <code>Enter</code> — commit highlighted item (calls{' '}
            <code>onSelect</code>)
          </li>
          <li>
            <code>Escape</code> — close dialog, restore focus to trigger
          </li>
          <li>
            <code>click outside</code> — backdrop dismiss
          </li>
          <li>
            <code>Tab / Shift+Tab</code> — focus trap cycles inside dialog
          </li>
        </ul>
      </section>
    </main>
  );
}
