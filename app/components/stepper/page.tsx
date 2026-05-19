'use client';

import { useState } from 'react';
import { Stepper, Step } from '@/components/complex/Stepper';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import { Badge } from '@/components/display/Badge';
import { Button } from '@/components/interactive/Button';
import styles from './page.module.scss';

// Tiny inline SVG icons for use case 6 (custom icons + lg size).
function DraftIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable={false}
    >
      <path d="M3 12.5V13h.5l7-7L9 4.5l-7 7Z" />
      <path d="M11 4 12 3l1 1-1 1" />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable={false}
    >
      <circle cx="7" cy="7" r="4" />
      <path d="M10 10l3 3" />
    </svg>
  );
}

function SignIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable={false}
    >
      <path d="M2 13c2-3 5-5 8-5l1-2 2 2-2 1c-3 1-5 4-5 6Z" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable={false}
    >
      <rect x="2" y="3" width="12" height="3" rx="0.5" />
      <rect x="3" y="6" width="10" height="7" rx="0.5" />
      <line x1="6.5" y1="9" x2="9.5" y2="9" />
    </svg>
  );
}

export default function StepperPlayground() {
  // USE CASE 4: Interactive (visited-only)
  const [wizardStep, setWizardStep] = useState(2);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          Stepper
        </Heading>
        <Text color="secondary">
          Multi-step visual progress indicator with optional keyboard navigation when clickable.
          Compound: <code>&lt;Stepper&gt;</code> +<code>&lt;Step&gt;</code>. Auto-derives status
          from <code>currentStep</code> (complete / active / pending). Explicit{' '}
          <code>status=&quot;error&quot;</code> overrides derivation.
        </Text>
        <Inline gap={2} wrap>
          <Badge color="info">complex/Stepper</Badge>
          <Badge color="success">Phase 10</Badge>
          <Badge>Zero deps</Badge>
        </Inline>
      </header>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Basic horizontal">
        <Heading level={2} size="lg">
          1. Basic horizontal (visual only)
        </Heading>
        <Text color="secondary">
          Three steps, second is active. List landmark; no keyboard navigation. Step circles
          aria-hidden, sr-only verbose announcements per step.
        </Text>
        <div className={styles.demo}>
          <Stepper currentStep={1} aria-label="Order progress">
            <Step label="Cart" />
            <Step label="Shipping" />
            <Step label="Payment" />
          </Stepper>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Vertical orientation">
        <Heading level={2} size="lg">
          2. Vertical orientation
        </Heading>
        <Text color="secondary">
          Same component, orientation=&quot;vertical&quot;. Connecting line flips axis; flex
          direction toggles via data-orientation.
        </Text>
        <div className={styles.demo}>
          <Stepper currentStep={2} orientation="vertical" aria-label="Contract negotiation phases">
            <Step label="Draft" />
            <Step label="Review" />
            <Step label="Signature" />
            <Step label="Archive" />
          </Stepper>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="With descriptions">
        <Heading level={2} size="lg">
          3. With descriptions
        </Heading>
        <Text color="secondary">
          Each step accepts an optional description ReactNode rendered below the label. Lib does NOT
          auto-wrap into Text variants — consumer supplies any ReactNode.
        </Text>
        <div className={styles.demo}>
          <Stepper currentStep={1} aria-label="Lead intake wizard">
            <Step label="Identity" description="Contact details" />
            <Step label="Company" description="Org info + size" />
            <Step label="Qualification" description="Budget + timeline" />
            <Step label="Submit" description="Confirm + send" />
          </Stepper>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Interactive (visited)">
        <Heading level={2} size="lg">
          4. Interactive — visited-only navigation
        </Heading>
        <Text color="secondary">
          clickableSteps=&quot;visited&quot; — only complete steps respond to click + keyboard. Use
          Next/Back to advance, then click any complete step to revisit. Tab + Arrows + Home/End +
          Space/Enter all wired.
        </Text>
        <div className={styles.demo}>
          <Stepper
            currentStep={wizardStep}
            clickableSteps="visited"
            onStepClick={setWizardStep}
            aria-label="Onboarding wizard — click visited steps to revisit"
          >
            <Step label="Account" />
            <Step label="Workspace" />
            <Step label="Invite team" />
            <Step label="Activate" />
          </Stepper>
          <Inline gap={2} className={styles.controls}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setWizardStep((s) => Math.max(0, s - 1))}
              disabled={wizardStep === 0}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setWizardStep((s) => Math.min(3, s + 1))}
              disabled={wizardStep === 3}
            >
              Next
            </Button>
            <span className={styles.controlLabel}>Current step: {wizardStep + 1} / 4</span>
          </Inline>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Error state">
        <Heading level={2} size="lg">
          5. Error state on a step
        </Heading>
        <Text color="secondary">
          Explicit <code>status=&quot;error&quot;</code> overrides currentStep-derived status. The
          error icon is always rendered (D4 — WCAG 1.4.1 don&apos;t rely on color alone).
        </Text>
        <div className={styles.demo}>
          <Stepper currentStep={3} aria-label="Import wizard">
            <Step label="Source" />
            <Step label="Map columns" />
            <Step label="Validate" status="error" />
            <Step label="Confirm" />
          </Stepper>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      <section className={styles.section} aria-label="Custom icons + size">
        <Heading level={2} size="lg">
          6. Custom icons + size scale
        </Heading>
        <Text color="secondary">
          Pass <code>icon</code> per Step. <code>size=&quot;lg&quot;</code> bumps the circle scale
          to 40px. Error status would still force the warning glyph regardless of icon override.
        </Text>
        <div className={styles.demo}>
          <Stepper currentStep={1} size="lg" aria-label="Hydrogen contract phases">
            <Step label="Draft" icon={<DraftIcon />} />
            <Step label="Review" icon={<ReviewIcon />} />
            <Step label="Signature" icon={<SignIcon />} />
            <Step label="Archive" icon={<ArchiveIcon />} />
          </Stepper>
        </div>
      </section>
    </main>
  );
}
