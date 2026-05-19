'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/complex/Collapsible';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Button } from '@/components/interactive/Button';
import styles from './page.module.scss';

function Chevron() {
  return (
    <svg
      className={styles.chevron}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function CollapsiblePlaygroundPage() {
  const [controlledOpen, setControlledOpen] = useState(false);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          Collapsible
        </Heading>
        <p className={styles.intro}>
          APG <code>/disclosure/</code> compound — single-pane show/hide primitive distinct from{' '}
          <code>AccordionGroup</code> (which is the <code>/accordion/</code> Q+A pattern). Use
          Collapsible for &quot;show more&quot; toggles, expandable details, optional settings —
          anywhere the question/answer semantic is wrong. Compound: <code>&lt;Collapsible&gt;</code>{' '}
          + <code>&lt;CollapsibleTrigger&gt;</code> + <code>&lt;CollapsibleContent&gt;</code>.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Uncontrolled — default closed
        </Heading>
        <Text variant="small" color="secondary">
          Most common case — Collapsible owns its own open state.
        </Text>
        <Collapsible className={styles.surface}>
          <CollapsibleTrigger>
            <span className={styles.triggerLine}>
              Show advanced options <Chevron />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className={styles.contentBody}>
              <Text>
                Hidden options surface only when the user opts in. Native button semantics — Enter
                and Space both toggle.
              </Text>
              <Text variant="small" color="muted">
                Heights animate via CSS Grid <code>0fr → 1fr</code>; no JavaScript height
                measurement needed, supports content-aware heights, and{' '}
                <code>prefers-reduced-motion</code> disables the transition.
              </Text>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Uncontrolled — defaultOpen
        </Heading>
        <Text variant="small" color="secondary">
          <code>defaultOpen=true</code> renders in the open state initially.
        </Text>
        <Collapsible defaultOpen className={styles.surface}>
          <CollapsibleTrigger>
            <span className={styles.triggerLine}>
              Diagnostics (already visible) <Chevron />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className={styles.contentBody}>
              <Text variant="small">CPU usage: 42%</Text>
              <Text variant="small">Memory: 2.1 GB / 8 GB</Text>
              <Text variant="small">Open connections: 18</Text>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Controlled mode
        </Heading>
        <Text variant="small" color="secondary">
          Consumer owns <code>open</code> + reacts to <code>onOpenChange</code>. Use when state
          needs to live outside the component (URL hash, parent disclosure orchestration, etc.).
        </Text>
        <Collapsible
          open={controlledOpen}
          onOpenChange={setControlledOpen}
          className={styles.surface}
        >
          <CollapsibleTrigger>
            <span className={styles.triggerLine}>
              {controlledOpen ? 'Hide' : 'Show'} JSON payload <Chevron />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className={styles.contentBody}>
              <pre>
                {JSON.stringify(
                  {
                    user: 'anna',
                    role: 'admin',
                    lastLogin: '2026-05-12T18:42:00Z',
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </CollapsibleContent>
        </Collapsible>
        <span className={styles.state}>
          External state: <strong>{controlledOpen ? 'open' : 'closed'}</strong>
        </span>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. Trigger asChild — wrap a Button
        </Heading>
        <Text variant="small" color="secondary">
          <code>asChild</code> projects trigger semantics + aria wiring onto consumer&apos;s element
          (here: <code>&lt;Button variant=&quot;ghost&quot;&gt;</code>).
        </Text>
        <Collapsible className={styles.surface}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              Toggle release notes
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className={styles.contentBody}>
              <Text>
                v0.21.0 ships AvatarGroup + Rating + Collapsible + Banner plus an opt-in TimeInput
                stepper amendment. See CHANGELOG for full detail.
              </Text>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. Disabled state
        </Heading>
        <Text variant="small" color="secondary">
          <code>disabled</code> on root short-circuits the toggle handler; trigger renders with{' '}
          <code>aria-disabled</code> + reduced opacity.
        </Text>
        <Collapsible disabled className={styles.surface}>
          <CollapsibleTrigger>
            <span className={styles.triggerLine}>
              Unavailable section <Chevron />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className={styles.contentBody}>
              <Text>This content cannot be revealed in the demo.</Text>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          6. forceMount — keep content in DOM when closed
        </Heading>
        <Text variant="small" color="secondary">
          Default behavior unmounts content when closed (clean DOM, lose internal state). Set{' '}
          <code>forceMount</code> to preserve form drafts / video playback / animation state across
          toggle cycles. Content is hidden from a11y tree via the <code>hidden</code> attribute when
          closed.
        </Text>
        <Collapsible className={styles.surface}>
          <CollapsibleTrigger>
            <span className={styles.triggerLine}>
              Toggle (forceMount) <Chevron />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent forceMount>
            <div className={styles.contentBody}>
              <Text>
                I stay in the DOM even when collapsed — inspect the document to verify. Useful when
                downstream state would be lost on unmount.
              </Text>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </section>
    </main>
  );
}
