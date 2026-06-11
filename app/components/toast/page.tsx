'use client';

import { useState } from 'react';
import { Toaster, toast, type ToasterPosition } from '@/components/complex/Toast';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import { Stack } from '@/components/layout/Stack';
import { Button } from '@/components/interactive/Button';
import { Badge } from '@/components/display/Badge';
import { Separator } from '@/components/display/Separator';
import styles from './page.module.scss';

function fakePromise(shouldSucceed: boolean, ms = 1500): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldSucceed) resolve('OK');
      else reject(new Error('Network error'));
    }, ms);
  });
}

export default function ToastPlayground() {
  const [position, setPosition] = useState<ToasterPosition>('bottom-right');
  const [richColors, setRichColors] = useState(false);
  const [globalDuration, setGlobalDuration] = useState<number | undefined>(undefined);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          Toast
        </Heading>
        <Text variant="lead" color="muted">
          Transient notifications with an imperative API — call <code>toast(...)</code> from
          anywhere, a single <code>&lt;Toaster /&gt;</code> mounted once renders the queue. Pauses
          on hover, focus, or tab visibility loss; integrates with promises for async feedback.
        </Text>
        <Inline gap={2} wrap>
          <Badge color="success">ARIA live regions</Badge>
          <Badge color="info">Zero deps</Badge>
          <Badge color="default">Imperative API</Badge>
          <Badge color="default">Pause on hover/focus</Badge>
          <Badge color="default">Visibility API</Badge>
          <Badge color="default">Promise integration</Badge>
        </Inline>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          Toaster configuration
        </Heading>
        <Text variant="body" color="muted">
          One <code>&lt;Toaster /&gt;</code> mounted at the bottom of this page. Change position +
          richColors to see live behavior.
        </Text>
        <Inline gap={2} wrap>
          {(
            [
              'top-left',
              'top-center',
              'top-right',
              'bottom-left',
              'bottom-center',
              'bottom-right',
            ] as ToasterPosition[]
          ).map((p) => (
            <Button
              key={p}
              variant={p === position ? 'primary' : 'ghost'}
              onClick={() => setPosition(p)}
            >
              {p}
            </Button>
          ))}
        </Inline>
        <Inline gap={2}>
          <Button
            variant={richColors ? 'primary' : 'ghost'}
            onClick={() => setRichColors((v) => !v)}
          >
            richColors: {richColors ? 'on' : 'off'}
          </Button>
        </Inline>
        <Inline gap={2}>
          <Button
            variant={globalDuration === undefined ? 'primary' : 'ghost'}
            onClick={() => setGlobalDuration(undefined)}
          >
            duration: default
          </Button>
          <Button
            variant={globalDuration === 1000 ? 'primary' : 'ghost'}
            onClick={() => setGlobalDuration(1000)}
          >
            duration: 1000 ms
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setTimeout(() => {
                toast({ title: 'Delayed toast', description: 'Spawned 1.5s after click.' });
              }, 1500);
            }}
          >
            Spawn delayed (1.5s)
          </Button>
        </Inline>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          1. Basic variants
        </Heading>
        <Text variant="body" color="muted">
          <code>toast()</code> default + 4 variants with inline icons. Error variant uses{' '}
          <code>role=&quot;alert&quot;</code> + <code>aria-live=&quot;assertive&quot;</code>; others
          use <code>role=&quot;status&quot;</code> + <code>aria-live=&quot;polite&quot;</code>.
        </Text>
        <Inline gap={2} wrap>
          <Button variant="secondary" onClick={() => toast('Default notification')}>
            toast()
          </Button>
          <Button variant="secondary" onClick={() => toast.success('Saved successfully')}>
            toast.success()
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.error({
                title: 'Failed to save',
                description: 'Network request timed out.',
              })
            }
          >
            toast.error()
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.warning({
                title: 'Unsaved changes',
                description: 'Navigate away and lose work?',
              })
            }
          >
            toast.warning()
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.info('Update available — version 2.1 released')}
          >
            toast.info()
          </Button>
        </Inline>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          2. Title + description
        </Heading>
        <Text variant="body" color="muted">
          Rich content. <code>title</code> renders bold, <code>description</code> renders muted
          supporting text. <code>aria-atomic=&quot;true&quot;</code> so SRs read both as one unit.
        </Text>
        <Inline gap={2}>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: 'Invitation sent',
                description: 'Anna will receive an email shortly.',
              })
            }
          >
            title + description
          </Button>
        </Inline>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          3. Action slot — Undo / Retry
        </Heading>
        <Text variant="body" color="muted">
          Action button inside the toast. Click fires <code>onClick</code> + dismisses (unless{' '}
          <code>dismissOnClick: false</code>).
        </Text>
        <Inline gap={2}>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: 'Message archived',
                action: {
                  label: 'Undo',
                  onClick: () => toast.success('Restored'),
                },
              })
            }
          >
            Show undo toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.error({
                title: 'Failed to load',
                action: {
                  label: 'Retry',
                  onClick: () => toast.info('Retrying…'),
                },
              })
            }
          >
            Show retry toast
          </Button>
        </Inline>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          4. Sticky toast (<code>duration: Infinity</code>)
        </Heading>
        <Text variant="body" color="muted">
          Disables auto-dismiss. User must click close or action to dismiss. Ideal for critical
          errors that MUST be acknowledged.
        </Text>
        <Inline gap={2}>
          <Button
            variant="secondary"
            onClick={() =>
              toast.error({
                title: 'Connection lost',
                description: 'Changes are not being saved. Reconnect to continue.',
                duration: Infinity,
                action: {
                  label: 'Reconnect',
                  onClick: () => toast.info('Reconnecting…'),
                },
              })
            }
          >
            Show sticky error
          </Button>
        </Inline>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          5. Dedup by explicit <code>id</code>
        </Heading>
        <Text variant="body" color="muted">
          Subsequent calls with same <code>id</code> UPDATE the existing toast instead of adding a
          duplicate. Useful for save-status patterns.
        </Text>
        <Inline gap={2}>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                id: 'save-status',
                title: 'Saving…',
                variant: 'info',
                duration: Infinity,
              })
            }
          >
            1. saving
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                id: 'save-status',
                title: 'Saved',
                variant: 'success',
                duration: 2500,
              })
            }
          >
            2. saved (same id)
          </Button>
        </Inline>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          6. Promise toast
        </Heading>
        <Text variant="body" color="muted">
          <code>toast.promise(promise, &#123; loading, success, error &#125;)</code> transitions a
          single toast from loading → success/error as the promise resolves. Fires three lifecycle
          states on ONE toast id.
        </Text>
        <Inline gap={2}>
          <Button
            variant="secondary"
            onClick={() =>
              toast.promise(fakePromise(true), {
                loading: 'Publishing article…',
                success: 'Article published',
                error: 'Publish failed',
              })
            }
          >
            promise (success)
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast
                .promise(fakePromise(false), {
                  loading: 'Publishing article…',
                  success: 'Published',
                  error: (err) => ({
                    title: 'Publish failed',
                    description: err instanceof Error ? err.message : String(err),
                  }),
                })
                .catch(() => {
                  // swallow — toast.promise rethrows for caller handling;
                  // demo doesn't need further action.
                })
            }
          >
            promise (error)
          </Button>
        </Inline>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          7. Dismiss programmatically
        </Heading>
        <Text variant="body" color="muted">
          <code>toast.dismiss(id?)</code> — pass id to dismiss one, omit to clear all.
        </Text>
        <Inline gap={2}>
          <Button
            variant="secondary"
            onClick={() => {
              toast.success('Toast A');
              toast.success('Toast B');
              toast.success('Toast C');
            }}
          >
            Spawn 3
          </Button>
          <Button variant="ghost" onClick={() => toast.dismiss()}>
            Dismiss all
          </Button>
        </Inline>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Heading level={2} size="lg">
          8. Stack behavior
        </Heading>
        <Text variant="body" color="muted">
          Hover over the stack to pause ALL timers. Tab-backgrounded pauses globally via{' '}
          <code>visibilitychange</code>. Switch tabs and back to verify.
        </Text>
        <Stack gap={2}>
          <Button
            variant="secondary"
            onClick={() => {
              for (let i = 1; i <= 5; i++) {
                setTimeout(() => toast(`Notification ${i}`), i * 200);
              }
            }}
          >
            Spawn 5 in sequence
          </Button>
        </Stack>
      </section>

      <Separator />

      <Toaster position={position} richColors={richColors} duration={globalDuration} />
    </main>
  );
}
