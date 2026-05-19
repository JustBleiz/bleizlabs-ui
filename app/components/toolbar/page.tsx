'use client';

import { useState } from 'react';
import { Toolbar } from '@/components/complex/Toolbar';
import { Button } from '@/components/interactive/Button';
import { Toggle } from '@/components/interactive/Toggle';
import { ToggleGroup } from '@/components/interactive/ToggleGroup';
import { Separator } from '@/components/display/Separator';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Stack } from '@/components/layout/Stack';
import { Kbd } from '@/components/specialized/Kbd';
import styles from './page.module.scss';

export default function ToolbarPlayground() {
  const [boldValue, setBoldValue] = useState<string[]>(['bold']);
  const [alignValue, setAlignValue] = useState<string>('left');

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          Toolbar
        </Heading>
        <Text variant="lead" color="muted">
          Accessible toolbar container per WAI-ARIA APG <code>/toolbar/</code>. Lightweight
          Radix-pattern: ships <code>role=&quot;toolbar&quot;</code> + roving tabindex + arrow-key
          navigation. Composes existing lib
          <code> &lt;Button&gt;</code>, <code>&lt;ToggleGroup&gt;</code>,
          <code> &lt;Separator&gt;</code> directly — no Toolbar.Button compound parts. Single
          tab-stop into the toolbar; arrow keys move within; Tab exits.
        </Text>
      </header>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          1. Formatting toolbar (horizontal, default)
        </Heading>
        <Text variant="body" color="muted">
          The canonical use case — text formatting in a rich editor. Mixes a
          <code> ToggleGroup type=&quot;multiple&quot;</code> (bold/italic/ underline) with a
          vertical <code>Separator</code> and standalone ghost <code>Button</code>s.
        </Text>
        <div className={styles.demo}>
          <Toolbar aria-label="Formatting">
            <ToggleGroup
              type="multiple"
              value={boldValue}
              onValueChange={setBoldValue}
              aria-label="Text style"
            >
              <Toggle value="bold" aria-label="Bold">
                <strong>B</strong>
              </Toggle>
              <Toggle value="italic" aria-label="Italic">
                <em>I</em>
              </Toggle>
              <Toggle value="underline" aria-label="Underline">
                <u>U</u>
              </Toggle>
            </ToggleGroup>
            <Separator orientation="vertical" />
            <ToggleGroup
              type="single"
              value={alignValue}
              onValueChange={setAlignValue}
              aria-label="Text alignment"
            >
              <Toggle value="left" aria-label="Align left">
                ⇤
              </Toggle>
              <Toggle value="center" aria-label="Align center">
                ☰
              </Toggle>
              <Toggle value="right" aria-label="Align right">
                ⇥
              </Toggle>
            </ToggleGroup>
            <Separator orientation="vertical" />
            <Button variant="ghost" size="sm">
              Save
            </Button>
            <Button variant="ghost" size="sm">
              Discard
            </Button>
          </Toolbar>
          <ul className={styles.keyList}>
            <li>
              <Kbd>Tab</Kbd> enters the toolbar at the first item (or last-focused item on
              re-entry).
            </li>
            <li>
              <Kbd>→</Kbd> / <Kbd>←</Kbd> moves focus between items (wraparound).
            </li>
            <li>
              <Kbd>Home</Kbd> / <Kbd>End</Kbd> jumps to first / last item.
            </li>
            <li>
              <Kbd>Tab</Kbd> from any item exits the toolbar to the next document tabbable.
            </li>
          </ul>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          2. Vertical orientation
        </Heading>
        <Text variant="body" color="muted">
          Left-rail editor toolbar.
          <code> orientation=&quot;vertical&quot;</code> swaps keyboard nav from Right/Left to
          Down/Up, and the flex axis switches to column.
        </Text>
        <div className={styles.demo}>
          <Toolbar aria-label="Tools" orientation="vertical">
            <Button variant="ghost" size="sm" aria-label="Pencil">
              ✎
            </Button>
            <Button variant="ghost" size="sm" aria-label="Eraser">
              ⌫
            </Button>
            <Button variant="ghost" size="sm" aria-label="Brush">
              🖌
            </Button>
            <Separator orientation="horizontal" />
            <Button variant="ghost" size="sm" aria-label="Settings">
              ⚙
            </Button>
            <Button variant="ghost" size="sm" aria-label="Help">
              ?
            </Button>
          </Toolbar>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          3. Disabled item is skipped by arrow nav
        </Heading>
        <Text variant="body" color="muted">
          Disabled buttons (<code>disabled</code> or
          <code> aria-disabled=&quot;true&quot;</code>) are filtered out of the roving sequence.
          Arrow keys jump over them.
        </Text>
        <div className={styles.demo}>
          <Toolbar aria-label="Document actions">
            <Button variant="ghost" size="sm">
              New
            </Button>
            <Button variant="ghost" size="sm">
              Open
            </Button>
            <Button variant="ghost" size="sm" disabled>
              Save (disabled)
            </Button>
            <Button variant="ghost" size="sm">
              Export
            </Button>
            <Separator orientation="vertical" />
            <Button variant="ghost" size="sm">
              Print
            </Button>
          </Toolbar>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          4. <code>loop=&#123;false&#125;</code> — clamped navigation
        </Heading>
        <Text variant="body" color="muted">
          By default arrow keys wrap around. Set <code>loop=&#123;false&#125;</code> to clamp at the
          ends — useful when toolbar order has linear semantics (back/forward, prev/next).
        </Text>
        <div className={styles.demo}>
          <Toolbar aria-label="Navigation history" loop={false}>
            <Button variant="ghost" size="sm" aria-label="Back">
              ←
            </Button>
            <Button variant="ghost" size="sm" aria-label="Forward">
              →
            </Button>
            <Separator orientation="vertical" />
            <Button variant="ghost" size="sm" aria-label="Reload">
              ↻
            </Button>
          </Toolbar>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          5. RTL support
        </Heading>
        <Text variant="body" color="muted">
          With <code>dir=&quot;rtl&quot;</code> in horizontal orientation, Right Arrow moves to the
          PREVIOUS item and Left Arrow to the NEXT — matching reading direction. Layout is also
          visually reversed (children appear right-to-left).
        </Text>
        <div className={styles.demo}>
          <Toolbar aria-label="Editor (RTL)" dir="rtl">
            <Button variant="ghost" size="sm">
              يحفظ
            </Button>
            <Button variant="ghost" size="sm">
              يفتح
            </Button>
            <Separator orientation="vertical" />
            <Button variant="ghost" size="sm">
              يطبع
            </Button>
          </Toolbar>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          6. Keyboard model summary
        </Heading>
        <Stack gap={2}>
          <Text variant="body">
            Keyboard model (APG <code>/toolbar/</code> verbatim):
          </Text>
          <ul className={styles.keyList}>
            <li>
              <Kbd>Tab</Kbd> — enter / exit the toolbar. Toolbar is a single tab-stop in the
              document.
            </li>
            <li>
              <Kbd>Right Arrow</Kbd> / <Kbd>Down Arrow</Kbd> — next item (axis depends on
              orientation; reversed in RTL horizontal).
            </li>
            <li>
              <Kbd>Left Arrow</Kbd> / <Kbd>Up Arrow</Kbd> — previous item.
            </li>
            <li>
              <Kbd>Home</Kbd> — first focusable item.
            </li>
            <li>
              <Kbd>End</Kbd> — last focusable item.
            </li>
            <li>
              <Kbd>Enter</Kbd> / <Kbd>Space</Kbd> — activates the focused child (handled by Button /
              Toggle / Anchor itself, not by Toolbar root).
            </li>
            <li>
              Modifier keys + arrows (e.g. <Kbd>Cmd</Kbd>+<Kbd>←</Kbd>) — skipped by toolbar so
              browser hotkeys still work.
            </li>
          </ul>
        </Stack>
      </section>
    </main>
  );
}
