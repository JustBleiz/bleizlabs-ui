'use client';

import { useState, type FormEvent } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from '@/components/complex/Select';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Stack } from '@/components/layout/Stack';
import { Button } from '@/components/interactive/Button';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

export default function SelectPlayground() {
  const [controlledValue, setControlledValue] = useState<string>('pro');
  const [submittedValue, setSubmittedValue] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmittedValue(String(data.get('country') ?? ''));
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          Select
        </Heading>
        <Text variant="lead" color="muted">
          Single-value dropdown form field with full keyboard support — typeahead, arrow navigation,
          Home/End, PageUp/Down. Participates in native forms via a hidden input, so you get
          validation and submission for free.
        </Text>
      </header>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          1. Basic uncontrolled
        </Heading>
        <Text variant="body" color="muted">
          Simplest usage. <code>defaultValue</code> sets initial state, Select manages the rest
          internally. Click the trigger, or focus it and press any arrow/Enter/Space to open.
        </Text>
        <div className={styles.demo}>
          <div className={styles.fieldGroup}>
            <Text variant="body" className={styles.fieldLabel}>
              Framework
            </Text>
            <Select defaultValue="react">
              <SelectTrigger aria-label="Select option">
                <SelectValue placeholder="Pick a framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="vue">Vue</SelectItem>
                <SelectItem value="svelte">Svelte</SelectItem>
                <SelectItem value="solid">SolidJS</SelectItem>
                <SelectItem value="angular">Angular</SelectItem>
                <SelectItem value="qwik">Qwik</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          2. Grouped options with labels + separators
        </Heading>
        <Text variant="body" color="muted">
          <code>SelectGroup</code> + <code>SelectLabel</code> create semantic groupings (
          <code>role=&quot;group&quot;</code> + <code>aria-labelledby</code>).{' '}
          <code>SelectSeparator</code> is a decorative divider between sections.
        </Text>
        <div className={styles.demo}>
          <div className={styles.fieldGroup}>
            <Text variant="body" className={styles.fieldLabel}>
              Deploy target
            </Text>
            <Select defaultValue="vercel-prod">
              <SelectTrigger aria-label="Select option">
                <SelectValue placeholder="Pick a target" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Production</SelectLabel>
                  <SelectItem value="vercel-prod">Vercel (prod)</SelectItem>
                  <SelectItem value="netlify-prod">Netlify (prod)</SelectItem>
                  <SelectItem value="aws-prod">AWS ECS (prod)</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Preview</SelectLabel>
                  <SelectItem value="vercel-preview">Vercel (preview)</SelectItem>
                  <SelectItem value="netlify-preview">Netlify (preview)</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Local</SelectLabel>
                  <SelectItem value="docker">Docker Compose</SelectItem>
                  <SelectItem value="dev-server">Dev server</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          3. Controlled mode with external state
        </Heading>
        <Text variant="body" color="muted">
          Pass <code>value</code> + <code>onValueChange</code> to control the state externally.
          Currently selected: <Badge color="brand">{controlledValue}</Badge>. Buttons below also
          mutate the state to demonstrate external updates.
        </Text>
        <div className={styles.demo}>
          <div className={styles.fieldGroup}>
            <Text variant="body" className={styles.fieldLabel}>
              Pricing tier
            </Text>
            <Select value={controlledValue} onValueChange={setControlledValue}>
              <SelectTrigger aria-label="Select option">
                <SelectValue placeholder="Pick a tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={styles.formRow}>
            <Button variant="secondary" size="sm" onClick={() => setControlledValue('free')}>
              Reset to Free
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setControlledValue('enterprise')}>
              Jump to Enterprise
            </Button>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          4. Disabled items
        </Heading>
        <Text variant="body" color="muted">
          Items marked <code>disabled</code> are rendered with{' '}
          <code>aria-disabled=&quot;true&quot;</code> (never native <code>disabled</code>, per APG
          focusable requirement established in NavigationMenu + Tabs). Arrow nav, Home/End,
          PageDown/Up, and typeahead all skip them.
        </Text>
        <div className={styles.demo}>
          <div className={styles.fieldGroup}>
            <Text variant="body" className={styles.fieldLabel}>
              Region
            </Text>
            <Select defaultValue="eu-west-1">
              <SelectTrigger aria-label="Select option">
                <SelectValue placeholder="Pick a region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eu-west-1">EU West (Ireland)</SelectItem>
                <SelectItem value="eu-central-1">EU Central (Frankfurt)</SelectItem>
                <SelectItem value="us-east-1">US East (Virginia)</SelectItem>
                <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                <SelectSeparator />
                <SelectItem value="ap-south-1" disabled>
                  AP South (Mumbai) — capacity full
                </SelectItem>
                <SelectItem value="ap-northeast-1" disabled>
                  AP Northeast (Tokyo) — capacity full
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          5. Typeahead — long list
        </Heading>
        <Text variant="body" color="muted">
          Type a letter to jump to the first option that starts with it. Type a second letter within
          500ms to refine the match (e.g. &quot;c&quot; → Canada, &quot;ca&quot; → Canada,
          &quot;cr&quot; → Croatia). Scroll-into-view keeps the highlighted option visible.
        </Text>
        <div className={styles.demo}>
          <div className={styles.fieldGroup}>
            <Text variant="body" className={styles.fieldLabel}>
              Country
            </Text>
            <Select defaultValue={null}>
              <SelectTrigger aria-label="Select option">
                <SelectValue placeholder="Pick a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="au">Australia</SelectItem>
                <SelectItem value="at">Austria</SelectItem>
                <SelectItem value="be">Belgium</SelectItem>
                <SelectItem value="br">Brazil</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="cl">Chile</SelectItem>
                <SelectItem value="cn">China</SelectItem>
                <SelectItem value="co">Colombia</SelectItem>
                <SelectItem value="hr">Croatia</SelectItem>
                <SelectItem value="cz">Czech Republic</SelectItem>
                <SelectItem value="dk">Denmark</SelectItem>
                <SelectItem value="eg">Egypt</SelectItem>
                <SelectItem value="fi">Finland</SelectItem>
                <SelectItem value="fr">France</SelectItem>
                <SelectItem value="de">Germany</SelectItem>
                <SelectItem value="gr">Greece</SelectItem>
                <SelectItem value="in">India</SelectItem>
                <SelectItem value="id">Indonesia</SelectItem>
                <SelectItem value="ie">Ireland</SelectItem>
                <SelectItem value="il">Israel</SelectItem>
                <SelectItem value="it">Italy</SelectItem>
                <SelectItem value="jp">Japan</SelectItem>
                <SelectItem value="kr">Korea</SelectItem>
                <SelectItem value="mx">Mexico</SelectItem>
                <SelectItem value="nl">Netherlands</SelectItem>
                <SelectItem value="nz">New Zealand</SelectItem>
                <SelectItem value="no">Norway</SelectItem>
                <SelectItem value="pl">Poland</SelectItem>
                <SelectItem value="pt">Portugal</SelectItem>
                <SelectItem value="ro">Romania</SelectItem>
                <SelectItem value="sg">Singapore</SelectItem>
                <SelectItem value="es">Spain</SelectItem>
                <SelectItem value="se">Sweden</SelectItem>
                <SelectItem value="ch">Switzerland</SelectItem>
                <SelectItem value="tr">Turkey</SelectItem>
                <SelectItem value="ua">Ukraine</SelectItem>
                <SelectItem value="gb">United Kingdom</SelectItem>
                <SelectItem value="us">United States</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          6. Form participation
        </Heading>
        <Text variant="body" color="muted">
          When <code>name</code> is provided, Select renders a hidden{' '}
          <code>&lt;input type=&quot;hidden&quot;&gt;</code> synced with the current value. Submit
          the form below — the selected country is serialized via standard FormData.
          <code>required</code> propagates to the hidden input for native validation.
        </Text>
        <div className={styles.demo}>
          <form onSubmit={handleSubmit}>
            <Stack gap={3}>
              <div className={styles.fieldGroup}>
                <Text variant="body" className={styles.fieldLabel}>
                  Country
                </Text>
                <Select name="country" required defaultValue="pl">
                  <SelectTrigger aria-label="Select option">
                    <SelectValue placeholder="Pick a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pl">Poland</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="fr">France</SelectItem>
                    <SelectItem value="it">Italy</SelectItem>
                    <SelectItem value="es">Spain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className={styles.formRow}>
                <Button type="submit" variant="primary" size="md">
                  Submit
                </Button>
              </div>
              {submittedValue !== null && (
                <div className={styles.submittedValue}>
                  Submitted: <strong>{submittedValue || '(empty)'}</strong>
                </div>
              )}
            </Stack>
          </form>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          7. Disabled Select (entire field)
        </Heading>
        <Text variant="body" color="muted">
          Passing <code>disabled</code> on the root blocks trigger interaction and form submission.
          The trigger still renders with <code>aria-disabled</code> so AT users can discover it.
        </Text>
        <div className={styles.demo}>
          <div className={styles.fieldGroup}>
            <Text variant="body" className={styles.fieldLabel}>
              Plan (locked)
            </Text>
            <Select disabled defaultValue="pro">
              <SelectTrigger aria-label="Select option">
                <SelectValue placeholder="Pick a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          8. Keyboard walkthrough
        </Heading>
        <Text variant="body" color="muted">
          Tab into any Select trigger above, then try every key from the APG <code>/combobox/</code>{' '}
          collapsed-listbox spec:
        </Text>
        <ul className={styles.keyList}>
          <li>
            <kbd>Space</kbd> / <kbd>Enter</kbd> / <kbd>ArrowDown</kbd> / <kbd>ArrowUp</kbd> — open
            listbox. If there&apos;s a value, highlight starts there; else first or last enabled
            option.
          </li>
          <li>
            <kbd>Home</kbd> / <kbd>End</kbd> — open listbox, highlight first / last enabled.
          </li>
          <li>
            <kbd>ArrowDown</kbd> / <kbd>ArrowUp</kbd> (open) — move highlight to next / prev enabled
            option, with wraparound.
          </li>
          <li>
            <kbd>PageDown</kbd> / <kbd>PageUp</kbd> (open) — ±10 options, clamped to range.
          </li>
          <li>
            <kbd>Enter</kbd> / <kbd>Space</kbd> (open) — commit the highlighted option, fire{' '}
            <code>onValueChange</code>, close.
          </li>
          <li>
            <kbd>Escape</kbd> (open) — close without committing.
          </li>
          <li>
            <kbd>Tab</kbd> (open) — commit highlighted option, close, and let Tab propagate to the
            next tabstop (Radix convention).
          </li>
          <li>
            <kbd>Alt</kbd>+<kbd>ArrowUp</kbd> (open) — close without committing.
          </li>
          <li>
            Printable char — typeahead match. 500ms reset, case-insensitive <code>startsWith</code>,
            enabled-only scope.
          </li>
          <li>
            <kbd>Cmd</kbd>+<kbd>Arrow</kbd> / <kbd>Ctrl</kbd>+<kbd>Arrow</kbd> — NOT intercepted
            (browser hotkeys pass through).
          </li>
        </ul>
      </section>
    </main>
  );
}
