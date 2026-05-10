'use client';

import { useState, type FormEvent } from 'react';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxSeparator,
} from '@/components/complex/Combobox';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Stack } from '@/components/layout/Stack';
import { Button } from '@/components/interactive/Button';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

const COUNTRIES: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'au', label: 'Australia' },
  { value: 'at', label: 'Austria' },
  { value: 'be', label: 'Belgium' },
  { value: 'br', label: 'Brazil' },
  { value: 'ca', label: 'Canada' },
  { value: 'cl', label: 'Chile' },
  { value: 'cn', label: 'China' },
  { value: 'co', label: 'Colombia' },
  { value: 'hr', label: 'Croatia' },
  { value: 'cz', label: 'Czech Republic' },
  { value: 'dk', label: 'Denmark' },
  { value: 'eg', label: 'Egypt' },
  { value: 'fi', label: 'Finland' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'gr', label: 'Greece' },
  { value: 'in', label: 'India' },
  { value: 'id', label: 'Indonesia' },
  { value: 'ie', label: 'Ireland' },
  { value: 'it', label: 'Italy' },
  { value: 'jp', label: 'Japan' },
  { value: 'mx', label: 'Mexico' },
  { value: 'nl', label: 'Netherlands' },
  { value: 'no', label: 'Norway' },
  { value: 'pl', label: 'Poland' },
  { value: 'pt', label: 'Portugal' },
  { value: 'es', label: 'Spain' },
  { value: 'se', label: 'Sweden' },
  { value: 'ch', label: 'Switzerland' },
  { value: 'ua', label: 'Ukraine' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'us', label: 'United States' },
];

export default function ComboboxPlayground() {
  const [controlledValue, setControlledValue] = useState<string | null>('pl');
  const [submittedValue, setSubmittedValue] = useState<string | null>(null);
  const [multiValue, setMultiValue] = useState<string[]>(['pl', 'de']);
  const [submittedMulti, setSubmittedMulti] = useState<string[] | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmittedValue(String(data.get('country') ?? ''));
  }

  function handleMultiSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmittedMulti(data.getAll('countries').map((v) => String(v)));
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          Combobox
        </Heading>
        <Text variant="lead" color="muted">
          Autocomplete input with a filtered listbox. Type any substring to
          narrow results (case-insensitive contains), navigate with arrow keys,
          Enter to commit, Escape to revert. Supports free-text mode for
          tag-input patterns.
        </Text>
      </header>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          1. Basic uncontrolled
        </Heading>
        <Text variant="body" color="muted">
          Type any substring to filter — <code>an</code> matches Canada/Austria/Andorra
          (case-insensitive <code>contains</code>). Arrow keys navigate filtered results,
          Enter commits, Escape clears.
        </Text>
        <div className={styles.demo}>
          <div className={styles.fieldGroup}>
            <Text variant="body" className={styles.fieldLabel}>
              Country
            </Text>
            <Combobox defaultValue={null}>
              <ComboboxInput placeholder="Search countries…" />
              <ComboboxContent>
                {COUNTRIES.map(({ value, label }) => (
                  <ComboboxItem key={value} value={value} textValue={label}>
                    {label}
                  </ComboboxItem>
                ))}
                <ComboboxEmpty>No country matches your search.</ComboboxEmpty>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          2. Grouped options with labels + separators
        </Heading>
        <Text variant="body" color="muted">
          <code>ComboboxGroup</code> + <code>ComboboxLabel</code> create semantic
          groupings (<code>role=&quot;group&quot;</code> + <code>aria-labelledby</code>).
          Groups filter as a unit — empty groups hide automatically.
        </Text>
        <div className={styles.demo}>
          <div className={styles.fieldGroup}>
            <Text variant="body" className={styles.fieldLabel}>
              Deploy target
            </Text>
            <Combobox defaultValue="vercel-prod">
              <ComboboxInput placeholder="Search targets…" />
              <ComboboxContent>
                <ComboboxGroup>
                  <ComboboxLabel>Production</ComboboxLabel>
                  <ComboboxItem value="vercel-prod" textValue="Vercel Production">
                    Vercel (prod)
                  </ComboboxItem>
                  <ComboboxItem value="netlify-prod" textValue="Netlify Production">
                    Netlify (prod)
                  </ComboboxItem>
                  <ComboboxItem value="aws-prod" textValue="AWS ECS Production">
                    AWS ECS (prod)
                  </ComboboxItem>
                </ComboboxGroup>
                <ComboboxSeparator />
                <ComboboxGroup>
                  <ComboboxLabel>Preview</ComboboxLabel>
                  <ComboboxItem value="vercel-preview" textValue="Vercel Preview">
                    Vercel (preview)
                  </ComboboxItem>
                  <ComboboxItem value="netlify-preview" textValue="Netlify Preview">
                    Netlify (preview)
                  </ComboboxItem>
                </ComboboxGroup>
                <ComboboxSeparator />
                <ComboboxGroup>
                  <ComboboxLabel>Local</ComboboxLabel>
                  <ComboboxItem value="docker" textValue="Docker Compose">
                    Docker Compose
                  </ComboboxItem>
                  <ComboboxItem value="dev-server" textValue="Dev server">
                    Dev server
                  </ComboboxItem>
                </ComboboxGroup>
                <ComboboxEmpty>No target matches.</ComboboxEmpty>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          3. Controlled mode with external state
        </Heading>
        <Text variant="body" color="muted">
          Pass <code>value</code> + <code>onValueChange</code> to own the state
          externally. Selected: <Badge color="brand">{controlledValue ?? '(none)'}</Badge>.
          Buttons demonstrate external updates syncing the input display.
        </Text>
        <div className={styles.demo}>
          <div className={styles.fieldGroup}>
            <Text variant="body" className={styles.fieldLabel}>
              Country
            </Text>
            <Combobox value={controlledValue} onValueChange={setControlledValue}>
              <ComboboxInput placeholder="Search countries…" />
              <ComboboxContent>
                {COUNTRIES.map(({ value, label }) => (
                  <ComboboxItem key={value} value={value} textValue={label}>
                    {label}
                  </ComboboxItem>
                ))}
                <ComboboxEmpty>No country matches.</ComboboxEmpty>
              </ComboboxContent>
            </Combobox>
          </div>
          <div className={styles.formRow}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setControlledValue('pl')}
            >
              Jump to Poland
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setControlledValue('jp')}
            >
              Jump to Japan
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setControlledValue(null)}
            >
              Clear
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
          Items marked <code>disabled</code> render with{' '}
          <code>aria-disabled=&quot;true&quot;</code> and are skipped by keyboard nav.
          Filter still applies to disabled items (visible in results but unselectable).
        </Text>
        <div className={styles.demo}>
          <div className={styles.fieldGroup}>
            <Text variant="body" className={styles.fieldLabel}>
              AWS region
            </Text>
            <Combobox defaultValue="eu-west-1">
              <ComboboxInput placeholder="Search regions…" />
              <ComboboxContent>
                <ComboboxItem value="eu-west-1" textValue="EU West (Ireland)">
                  EU West (Ireland)
                </ComboboxItem>
                <ComboboxItem value="eu-central-1" textValue="EU Central (Frankfurt)">
                  EU Central (Frankfurt)
                </ComboboxItem>
                <ComboboxItem value="us-east-1" textValue="US East (Virginia)">
                  US East (Virginia)
                </ComboboxItem>
                <ComboboxItem value="us-west-2" textValue="US West (Oregon)">
                  US West (Oregon)
                </ComboboxItem>
                <ComboboxSeparator />
                <ComboboxItem
                  value="ap-south-1"
                  textValue="AP South (Mumbai)"
                  disabled
                >
                  AP South (Mumbai) — capacity full
                </ComboboxItem>
                <ComboboxItem
                  value="ap-northeast-1"
                  textValue="AP Northeast (Tokyo)"
                  disabled
                >
                  AP Northeast (Tokyo) — capacity full
                </ComboboxItem>
                <ComboboxEmpty>No region matches.</ComboboxEmpty>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          5. Free text mode (<code>acceptFreeText</code>)
        </Heading>
        <Text variant="body" color="muted">
          With <code>acceptFreeText</code>, Enter commits the typed text as the value
          even when no item matches. Useful for tag inputs, custom category entry, or
          autocomplete-with-override flows. Without the prop (default), Enter on no-match
          is a no-op.
        </Text>
        <div className={styles.demo}>
          <div className={styles.fieldGroup}>
            <Text variant="body" className={styles.fieldLabel}>
              Tag
            </Text>
            <Combobox acceptFreeText defaultValue="react">
              <ComboboxInput placeholder="Type or pick a tag…" />
              <ComboboxContent>
                <ComboboxItem value="react">react</ComboboxItem>
                <ComboboxItem value="nextjs">nextjs</ComboboxItem>
                <ComboboxItem value="typescript">typescript</ComboboxItem>
                <ComboboxItem value="scss">scss</ComboboxItem>
                <ComboboxItem value="a11y">a11y</ComboboxItem>
                <ComboboxEmpty>
                  No existing tag — press Enter to create a new one.
                </ComboboxEmpty>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          6. Form participation
        </Heading>
        <Text variant="body" color="muted">
          When <code>name</code> is provided, Combobox renders a hidden{' '}
          <code>&lt;input type=&quot;hidden&quot;&gt;</code> synced with the current
          selection. Submit the form to see <code>FormData</code> serialization work.{' '}
          <code>required</code> propagates for native validation.
        </Text>
        <div className={styles.demo}>
          <form onSubmit={handleSubmit}>
            <Stack gap={3}>
              <div className={styles.fieldGroup}>
                <Text variant="body" className={styles.fieldLabel}>
                  Country
                </Text>
                <Combobox name="country" required defaultValue="pl">
                  <ComboboxInput placeholder="Search countries…" />
                  <ComboboxContent>
                    {COUNTRIES.map(({ value, label }) => (
                      <ComboboxItem key={value} value={value} textValue={label}>
                        {label}
                      </ComboboxItem>
                    ))}
                    <ComboboxEmpty>No country matches.</ComboboxEmpty>
                  </ComboboxContent>
                </Combobox>
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
          7. Multi-select (multiple={`{true}`})
        </Heading>
        <Text variant="body" color="muted">
          Pass <code>multiple</code> to switch the Combobox into multi-select
          mode. Picking an item TOGGLES it in/out of the selection array, the
          listbox stays open, and the search clears for the next pick.
          Selected values render as inline chips left of the input. Backspace
          on empty input removes the last chip — standard tag-input gesture.
        </Text>

        {/* 7.1 Uncontrolled multi-select */}
        <div className={styles.demoBlock}>
          <Text variant="small" weight="semibold">
            7.1 Uncontrolled — defaultValue + onValueChange
          </Text>
          <Combobox
            multiple
            defaultValue={['pl', 'de']}
            onValueChange={(values) => {
              console.log('multi onValueChange', values);
            }}
          >
            <ComboboxInput placeholder="Add countries..." aria-label="Countries" />
            <ComboboxContent>
              {COUNTRIES.map((country) => (
                <ComboboxItem key={country.value} value={country.value}>
                  {country.label}
                </ComboboxItem>
              ))}
              <ComboboxEmpty>No countries match.</ComboboxEmpty>
            </ComboboxContent>
          </Combobox>
        </div>

        {/* 7.2 Controlled multi-select */}
        <div className={styles.demoBlock}>
          <Text variant="small" weight="semibold">
            7.2 Controlled — external state, current value displayed below
          </Text>
          <Combobox
            multiple
            value={multiValue}
            onValueChange={setMultiValue}
          >
            <ComboboxInput
              placeholder="Search countries..."
              aria-label="Controlled multi countries"
            />
            <ComboboxContent>
              {COUNTRIES.map((country) => (
                <ComboboxItem key={country.value} value={country.value}>
                  {country.label}
                </ComboboxItem>
              ))}
              <ComboboxEmpty>No matches.</ComboboxEmpty>
            </ComboboxContent>
          </Combobox>
          <div className={styles.controlledRow}>
            <Text variant="small" color="muted">
              Selected ({multiValue.length}):
            </Text>
            {multiValue.length === 0 ? (
              <Text variant="small" color="muted">
                <em>(empty)</em>
              </Text>
            ) : (
              multiValue.map((v) => {
                const found = COUNTRIES.find((c) => c.value === v);
                return (
                  <Badge key={v} color="brand">
                    {found?.label ?? v}
                  </Badge>
                );
              })
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMultiValue([])}
              disabled={multiValue.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* 7.3 Form participation — FormData multi-value */}
        <div className={styles.demoBlock}>
          <Text variant="small" weight="semibold">
            7.3 Form participation — FormData multi-value (
            <code>formData.getAll(name)</code>)
          </Text>
          <form onSubmit={handleMultiSubmit}>
            <Stack gap={3}>
              <Combobox multiple name="countries" defaultValue={['fr', 'es']}>
                <ComboboxInput
                  placeholder="Pick countries..."
                  aria-label="Form countries"
                />
                <ComboboxContent>
                  {COUNTRIES.map((country) => (
                    <ComboboxItem key={country.value} value={country.value}>
                      {country.label}
                    </ComboboxItem>
                  ))}
                  <ComboboxEmpty>No matches.</ComboboxEmpty>
                </ComboboxContent>
              </Combobox>
              <Button type="submit" variant="primary">
                Submit
              </Button>
              {submittedMulti !== null && (
                <div className={styles.submittedValue}>
                  Submitted (<code>getAll</code>):{' '}
                  <strong>
                    {submittedMulti.length === 0
                      ? '(empty array)'
                      : submittedMulti.join(', ')}
                  </strong>
                </div>
              )}
            </Stack>
          </form>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          8. Keyboard walkthrough
        </Heading>
        <Text variant="body" color="muted">
          Tab into any Combobox input above, then try every key from the APG{' '}
          <code>/combobox/</code> editable spec:
        </Text>
        <ul className={styles.keyList}>
          <li>
            <strong>Typing</strong> — opens the listbox (if closed) and filters results
            via case-insensitive substring match. Highlight resets to first visible
            enabled item.
          </li>
          <li>
            <kbd>ArrowDown</kbd> (closed) — opens listbox, highlights first enabled (or
            current value).
          </li>
          <li>
            <kbd>ArrowUp</kbd> (closed) — opens listbox, highlights last enabled.
          </li>
          <li>
            <kbd>Alt</kbd>+<kbd>ArrowDown</kbd> — opens listbox showing ALL items
            (ignores current filter — Radix convention for &quot;show all&quot;).
          </li>
          <li>
            <kbd>ArrowDown</kbd> / <kbd>ArrowUp</kbd> (open) — move highlight to
            next/prev visible enabled option with wraparound.
          </li>
          <li>
            <kbd>Home</kbd> / <kbd>End</kbd> (open) — first / last visible enabled.
          </li>
          <li>
            <kbd>PageDown</kbd> / <kbd>PageUp</kbd> (open) — ±10 visible enabled items.
          </li>
          <li>
            <kbd>Enter</kbd> (open + highlighted) — commit highlighted option + fire{' '}
            <code>onValueChange</code> + close + sync input to committed label.
          </li>
          <li>
            <kbd>Enter</kbd> (open + empty matches + <code>acceptFreeText</code>) —
            commit the typed search as the value.
          </li>
          <li>
            <kbd>Escape</kbd> (open) — close, revert input to current value&apos;s label.
          </li>
          <li>
            <kbd>Escape</kbd> (closed + non-empty search) — clear input, keep value.
          </li>
          <li>
            <kbd>Tab</kbd> (open) — commit highlighted (if any) + close + propagate to
            next tabstop (Radix convention).
          </li>
          <li>
            <kbd>Blur</kbd> (click elsewhere) — auto-commit if typed text exactly
            matches an item&apos;s label; else revert input to current value&apos;s
            label. Prevents orphaned text (Radix Strategy A).
          </li>
          <li>
            <kbd>Cmd</kbd>+<kbd>Arrow</kbd> / <kbd>Ctrl</kbd>+<kbd>Arrow</kbd> — NOT
            intercepted (text-input navigation preserved).
          </li>
        </ul>
        <Text variant="body" color="muted">
          Multi-mode overrides (
          <code>multiple={`{true}`}</code>):
        </Text>
        <ul className={styles.keyList}>
          <li>
            <kbd>Space</kbd> (open) — TOGGLE highlighted in selection array,
            keep listbox open, clear search. APG <code>/listbox/</code>{' '}
            multi-selectable simple model. (Single mode: Space falls through
            as a literal filter character.)
          </li>
          <li>
            <kbd>Enter</kbd> (open + highlighted) — TOGGLE highlighted (NOT
            commit-and-close as in single mode). Listbox stays open, search
            clears.
          </li>
          <li>
            <kbd>Backspace</kbd> (input value empty, no modifiers) — remove
            LAST selected chip. Standard tag-input gesture (Gmail recipients,
            GitHub topics).
          </li>
          <li>
            <kbd>Tab</kbd> (open) — close + clear search. Does NOT toggle
            highlighted (Tab = &quot;I&apos;m done picking&quot;, not
            commit). Selections persist as chips.
          </li>
          <li>
            <kbd>Escape</kbd> (open) — close + clear search. Selections
            persist (chips remain) — no revert-to-committed-label since multi
            mode has no single committed label.
          </li>
          <li>
            <kbd>Click</kbd> on chip × button — remove that single value,
            restore focus to input.
          </li>
        </ul>
      </section>
    </main>
  );
}
