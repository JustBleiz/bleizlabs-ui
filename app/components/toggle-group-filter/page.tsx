'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ToggleGroupFilter } from '@/components/molecules/ToggleGroupFilter';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const CATEGORY_OPTIONS = [
  { value: 'design', label: 'Design', icon: <span>✏</span> },
  { value: 'code', label: 'Code', icon: <span>⌨</span> },
  { value: 'docs', label: 'Docs', icon: <span>📄</span> },
  { value: 'ops', label: 'Ops', icon: <span>⚙</span> },
];

export default function ToggleGroupFilterPlaygroundPage() {
  const [statuses, setStatuses] = useState<string[]>(['active']);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [bareStatuses, setBareStatuses] = useState<string[]>([]);
  const [tasks, setTasks] = useState<string[]>(['active', 'paused']);
  const [categories, setCategories] = useState<string[]>(['design']);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← back</Link>
        <Heading level={1} size="4xl">ToggleGroupFilter</Heading>
        <p className={styles.intro}>
          Filter-chip row composing ToggleGroup (`type=&quot;multiple&quot;`) + Toggle + Text caption.
          Controlled-only molecule — consumer owns `value: string[]` + `onValueChange` state.
          The `label` prop wires the inner ToggleGroup's `aria-label`; optional `groupLabel`
          renders a visible uppercase caption above the row.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">1. Default — status filter</Heading>
        <Text variant="caption" color="muted">
          Selected: {statuses.length === 0 ? '(none)' : statuses.join(', ')}
        </Text>
        <div className={styles.row}>
          <ToggleGroupFilter
            label="Status filter"
            groupLabel="Status"
            options={STATUS_OPTIONS}
            value={statuses}
            onValueChange={setStatuses}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">2. With groupLabel — visible uppercase caption</Heading>
        <Text variant="caption" color="muted">
          Selected: {priorities.length === 0 ? '(none)' : priorities.join(', ')}
        </Text>
        <div className={styles.row}>
          <ToggleGroupFilter
            label="Priority filter"
            groupLabel="Priority"
            options={PRIORITY_OPTIONS}
            value={priorities}
            onValueChange={setPriorities}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">3. Without groupLabel — accessible label only</Heading>
        <Text variant="caption" color="muted">
          No visible caption. The `label` prop still wires `aria-label` on the inner ToggleGroup
          so screen readers announce the group name.
        </Text>
        <div className={styles.row}>
          <ToggleGroupFilter
            label="Status filter (no visible label)"
            options={STATUS_OPTIONS}
            value={bareStatuses}
            onValueChange={setBareStatuses}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">4. Multi-select with controlled state</Heading>
        <Text variant="caption" color="muted">
          Multiple values can be active simultaneously — `value` is `string[]`, `onValueChange`
          receives the new array. Currently selected: {tasks.length === 0 ? '(none)' : tasks.join(', ')}
        </Text>
        <div className={styles.row}>
          <ToggleGroupFilter
            label="Task status"
            groupLabel="Task status (multi)"
            options={STATUS_OPTIONS}
            value={tasks}
            onValueChange={setTasks}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">5. With icons in options</Heading>
        <Text variant="caption" color="muted">
          Selected: {categories.length === 0 ? '(none)' : categories.join(', ')}
        </Text>
        <div className={styles.row}>
          <ToggleGroupFilter
            label="Category filter"
            groupLabel="Category"
            options={CATEGORY_OPTIONS}
            value={categories}
            onValueChange={setCategories}
          />
        </div>
      </section>
    </main>
  );
}
