'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Empty } from '@/components/feedback/Empty';
import { Alert, type AlertVariant } from '@/components/feedback/Alert';
import { Progress } from '@/components/feedback/Progress';
import { Button } from '@/components/interactive/Button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

function InboxIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="32"
      height="32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

const ALL_VARIANTS: AlertVariant[] = ['critical', 'warning', 'info', 'success'];

export default function FeedbackPlaygroundPage() {
  const [visibleAlerts, setVisibleAlerts] = useState<Set<AlertVariant>>(
    new Set(ALL_VARIANTS),
  );
  const [uploadValue, setUploadValue] = useState(42);
  const [stageIndex, setStageIndex] = useState(1);

  const STAGES = ['Planning', 'Design', 'Development', 'Testing', 'Release'];

  const dismissAlert = (variant: AlertVariant) => {
    setVisibleAlerts((prev) => {
      const next = new Set(prev);
      next.delete(variant);
      return next;
    });
  };

  const resetAlerts = () => setVisibleAlerts(new Set(ALL_VARIANTS));

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          Feedback
        </Heading>
        <Text className={styles.intro}>
          Three feedback primitives. <code>Empty</code> fills placeholder space
          for empty lists and zero-result states. <code>Alert</code> presents
          semantic notifications with optional dismiss. <code>Progress</code>{' '}
          renders either a continuous percent bar or a multi-step stage
          indicator.
        </Text>
      </header>

      {/* ==================================================================== */}
      {/* EMPTY                                                                 */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Empty
        </Heading>
        <Text>
          Placeholder surface for zero-result states. Icon + title +
          description + CTA slot. Add <code>role=&quot;status&quot;</code> via
          spread for async-rendered empty states.
        </Text>

        <div className={styles.stack}>
          <Empty
            icon={<InboxIcon />}
            title="No tickets yet"
            description="You don&rsquo;t have any messages. Create your first ticket to get started."
            cta={<Button>Create ticket</Button>}
          />
          <Empty title="This list is empty" />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* ALERT                                                                 */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Alert
        </Heading>
        <Text>
          Four variants (critical / warning / info / success). Critical uses{' '}
          <code>role=&quot;alert&quot;</code>, the others use{' '}
          <code>status</code>. Optional dismiss, href on body, and timestamp
          slots.
        </Text>

        <div className={styles.stack}>
          {ALL_VARIANTS.map((variant) =>
            visibleAlerts.has(variant) ? (
              <Alert
                key={variant}
                variant={variant}
                title={`${variant[0]!.toUpperCase()}${variant.slice(1)} alert`}
                description="Example notification body for this variant. Descriptions can be long or include inline links."
                onClose={() => dismissAlert(variant)}
              />
            ) : null,
          )}

          <Alert
            variant="info"
            title="New library version available"
            description="Click to view the changelog in a new tab."
            href="#changelog"
            timestamp="2026-04-14T14:30:00Z"
          />

          <Alert
            variant="warning"
            title="Persistent warning (no onClose)"
            description="Cannot be dismissed by the user — without onClose, the close button isn&rsquo;t rendered."
          />
        </div>

        <div className={styles.controls}>
          <Button variant="secondary" size="sm" onClick={resetAlerts}>
            Restore all alerts
          </Button>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PROGRESS — Stages                                                     */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Progress — Stages
        </Heading>
        <Text>
          Horizontal pill strip rendered as <code>&lt;ol aria-label&gt;</code>{' '}
          with <code>aria-current=&quot;step&quot;</code> on the active step.
        </Text>

        <div className={styles.stack}>
          <Progress
            label="Client project progress"
            stages={STAGES}
            currentStage={stageIndex}
          />
        </div>

        <div className={styles.controls}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setStageIndex((i) => Math.max(0, i - 1))}
            disabled={stageIndex === 0}
          >
            ← Previous stage
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setStageIndex((i) => Math.min(STAGES.length - 1, i + 1))
            }
            disabled={stageIndex === STAGES.length - 1}
          >
            Next stage →
          </Button>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PROGRESS — Percent                                                    */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Progress — Percent
        </Heading>
        <Text>
          Linear bar rendered with <code>role=&quot;progressbar&quot;</code>{' '}
          and <code>aria-valuenow/min/max</code>. Width is injected via the{' '}
          <code>--progress-value</code> CSS variable. Values are clamped to{' '}
          [0, max].
        </Text>

        <div className={styles.stack}>
          <Progress label="File upload" value={uploadValue} max={100} />
          <Progress label="Task completion" value={87} max={100} />
          <Progress label="Overflow (clamp test)" value={150} max={100} />
        </div>

        <div className={styles.controls}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setUploadValue((v) => Math.max(0, v - 10))}
          >
            −10%
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setUploadValue((v) => Math.min(100, v + 10))}
          >
            +10%
          </Button>
        </div>
      </section>
    </main>
  );
}
