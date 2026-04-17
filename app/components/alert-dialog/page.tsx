'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AlertDialog } from '@/components/complex/AlertDialog';
import { Button } from '@/components/interactive/Button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function AlertDialogPlaygroundPage() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [criticalOpen, setCriticalOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [customLabelsOpen, setCustomLabelsOpen] = useState(false);
  const [noEscapeOpen, setNoEscapeOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState<'sm' | 'md' | 'lg' | null>(null);

  const [confirmCount, setConfirmCount] = useState(0);
  const [cancelCount, setCancelCount] = useState(0);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          AlertDialog
        </Heading>
        <Text className={styles.intro}>
          Blocking confirmation dialog for destructive or irreversible actions.
          Requires an explicit Confirm or Cancel choice — overlay click and
          Escape default to Cancel. Severity prop drives tone (info / warning /
          critical) and the default confirm button style.
        </Text>
        <div className={styles.counters}>
          <span data-testid="confirm-count">confirm: {confirmCount}</span>
          <span data-testid="cancel-count">cancel: {cancelCount}</span>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* BASIC (severity=warning default)                                     */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Basic alert (severity=warning)
        </Heading>
        <Text color="muted">
          Default <code>severity=&quot;warning&quot;</code>. Initial focus on
          Cancel (least destructive per APG). Escape calls{' '}
          <code>onCancel</code>, not <code>onConfirm</code>. Overlay click
          blocked (<code>closeOnOverlayClick=false</code> default).
        </Text>

        <div className={styles.row}>
          <Button onClick={() => setBasicOpen(true)}>Open basic alert</Button>
        </div>

        <AlertDialog
          open={basicOpen}
          onOpenChange={setBasicOpen}
          title="Discard unsaved changes?"
          description="Your changes will be lost if you continue without saving."
          confirmLabel="Discard"
          onConfirm={() => {
            setConfirmCount((c) => c + 1);
            setBasicOpen(false);
          }}
          onCancel={() => {
            setCancelCount((c) => c + 1);
            setBasicOpen(false);
          }}
        />
      </section>

      {/* ==================================================================== */}
      {/* CRITICAL (destructive delete)                                        */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Critical alert (destructive)
        </Heading>
        <Text color="muted">
          <code>severity=&quot;critical&quot;</code> — red border glow, confirm
          variant inferred as <code>warning</code> (destructive button). Used
          for irreversible operations (delete, purge, drop).
        </Text>

        <div className={styles.row}>
          <Button variant="warning" onClick={() => setCriticalOpen(true)}>
            Open critical alert
          </Button>
        </div>

        <AlertDialog
          open={criticalOpen}
          onOpenChange={setCriticalOpen}
          title="Delete project?"
          description="This action cannot be undone. All project data will be permanently removed."
          severity="critical"
          confirmLabel="Delete"
          onConfirm={() => {
            setConfirmCount((c) => c + 1);
            setCriticalOpen(false);
          }}
          onCancel={() => {
            setCancelCount((c) => c + 1);
            setCriticalOpen(false);
          }}
        />
      </section>

      {/* ==================================================================== */}
      {/* INFO (neutral, confirmatory)                                         */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Info alert (neutral)
        </Heading>
        <Text color="muted">
          <code>severity=&quot;info&quot;</code> — blue border glow, confirm
          variant inferred as <code>primary</code>. Used for confirmatory
          non-destructive actions (proceed, acknowledge, continue).
        </Text>

        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setInfoOpen(true)}>
            Open info alert
          </Button>
        </div>

        <AlertDialog
          open={infoOpen}
          onOpenChange={setInfoOpen}
          title="Session expires in 5 minutes"
          description="You will be logged out automatically. Save any work now to avoid losing changes."
          severity="info"
          confirmLabel="Extend session"
          onConfirm={() => {
            setConfirmCount((c) => c + 1);
            setInfoOpen(false);
          }}
          onCancel={() => {
            setCancelCount((c) => c + 1);
            setInfoOpen(false);
          }}
        />
      </section>

      {/* ==================================================================== */}
      {/* CUSTOM LABELS                                                        */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Custom labels
        </Heading>
        <Text color="muted">
          Both <code>cancelLabel</code> and <code>confirmLabel</code> accept
          custom strings. Default Cancel label is &quot;Cancel&quot;.
        </Text>

        <div className={styles.row}>
          <Button onClick={() => setCustomLabelsOpen(true)}>
            Open custom labels
          </Button>
        </div>

        <AlertDialog
          open={customLabelsOpen}
          onOpenChange={setCustomLabelsOpen}
          title="Leave this page?"
          description="Any unsaved form data will be lost."
          cancelLabel="Stay here"
          confirmLabel="Leave"
          severity="warning"
          onConfirm={() => {
            setConfirmCount((c) => c + 1);
            setCustomLabelsOpen(false);
          }}
          onCancel={() => {
            setCancelCount((c) => c + 1);
            setCustomLabelsOpen(false);
          }}
        />
      </section>

      {/* ==================================================================== */}
      {/* NO ESCAPE (uncloseable via keyboard)                                 */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Escape disabled
        </Heading>
        <Text color="muted">
          <code>closeOnEscape=false</code> — user must make explicit button
          choice. Use for critical security prompts where keyboard dismissal is
          a footgun. Overlay click also blocked by default.
        </Text>

        <div className={styles.row}>
          <Button variant="warning" onClick={() => setNoEscapeOpen(true)}>
            Open uncloseable alert
          </Button>
        </div>

        <AlertDialog
          open={noEscapeOpen}
          onOpenChange={setNoEscapeOpen}
          title="Two-factor authentication required"
          description="Enter your 2FA code or cancel to log out. Escape key is disabled for security."
          severity="critical"
          closeOnEscape={false}
          confirmLabel="Enter code"
          cancelLabel="Log out"
          onConfirm={() => {
            setConfirmCount((c) => c + 1);
            setNoEscapeOpen(false);
          }}
          onCancel={() => {
            setCancelCount((c) => c + 1);
            setNoEscapeOpen(false);
          }}
        />
      </section>

      {/* ==================================================================== */}
      {/* SIZES                                                                */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Size variants
        </Heading>
        <Text color="muted">
          Three sizes: <code>sm</code> (360px), <code>md</code> (480px,
          default), <code>lg</code> (600px). Narrower than Dialog because
          alerts stay compact.
        </Text>

        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setSizeOpen('sm')}>
            Open sm alert
          </Button>
          <Button variant="secondary" onClick={() => setSizeOpen('md')}>
            Open md alert
          </Button>
          <Button variant="secondary" onClick={() => setSizeOpen('lg')}>
            Open lg alert
          </Button>
        </div>

        <AlertDialog
          open={sizeOpen !== null}
          onOpenChange={(v) => !v && setSizeOpen(null)}
          title={`Alert size — ${sizeOpen ?? 'md'}`}
          description="Alerts are intentionally narrower than Dialogs to keep them visually compact and focused on the decision at hand."
          size={sizeOpen ?? 'md'}
          confirmLabel="OK"
          onConfirm={() => {
            setConfirmCount((c) => c + 1);
            setSizeOpen(null);
          }}
          onCancel={() => {
            setCancelCount((c) => c + 1);
            setSizeOpen(null);
          }}
        />
      </section>
    </main>
  );
}
