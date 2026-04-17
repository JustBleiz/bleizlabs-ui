'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Dialog } from '@/components/complex/Dialog';
import { Button } from '@/components/interactive/Button';
import { Input } from '@/components/interactive/Input';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function DialogPlaygroundPage() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [noDescOpen, setNoDescOpen] = useState(false);
  const [noEscapeOpen, setNoEscapeOpen] = useState(false);
  const [customFocusOpen, setCustomFocusOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState<'sm' | 'md' | 'lg' | 'xl' | null>(null);
  const [triggerAOpen, setTriggerAOpen] = useState(false);
  const [triggerBOpen, setTriggerBOpen] = useState(false);
  const [nestedOuterOpen, setNestedOuterOpen] = useState(false);
  const [nestedInnerOpen, setNestedInnerOpen] = useState(false);

  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          Dialog
        </Heading>
        <Text className={styles.intro}>
          Accessible modal dialog for focused tasks and confirmations. Traps
          focus, locks background scroll, closes on Escape or overlay click,
          and restores focus to the trigger on dismiss.
        </Text>
      </header>

      {/* ==================================================================== */}
      {/* BASIC                                                                  */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Basic dialog
        </Heading>
        <Text color="muted">
          Title + description + body + footer slots. Escape closes, overlay
          click closes, focus trap via <code>useFocusTrap</code>.
        </Text>

        <div className={styles.row}>
          <Button onClick={() => setBasicOpen(true)}>Open basic dialog</Button>
        </div>

        <Dialog
          open={basicOpen}
          onOpenChange={setBasicOpen}
          title="Confirm delete"
          description="This action cannot be undone."
          footer={
            <>
              <Button variant="ghost" onClick={() => setBasicOpen(false)}>
                Cancel
              </Button>
              <Button variant="warning" onClick={() => setBasicOpen(false)}>
                Delete
              </Button>
            </>
          }
        >
          <Text>
            The selected item and all its metadata will be permanently removed
            from your workspace. Collaborators will lose access immediately.
          </Text>
        </Dialog>
      </section>

      {/* ==================================================================== */}
      {/* NO DESCRIPTION                                                         */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Without description
        </Heading>
        <Text color="muted">
          When <code>description</code> is omitted, <code>aria-describedby</code>{' '}
          is NOT set (Radix #3007 regression guard — no orphan aria reference).
        </Text>

        <div className={styles.row}>
          <Button onClick={() => setNoDescOpen(true)}>
            Open no-description dialog
          </Button>
        </div>

        <Dialog
          open={noDescOpen}
          onOpenChange={setNoDescOpen}
          title="Quick action"
          footer={
            <Button onClick={() => setNoDescOpen(false)}>Got it</Button>
          }
        >
          <Text>Short body content, no description slot used.</Text>
        </Dialog>
      </section>

      {/* ==================================================================== */}
      {/* NO ESCAPE                                                              */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          closeOnEscape=false
        </Heading>
        <Text color="muted">
          Disables the Escape handler — user must click an explicit button to
          close. Use sparingly (APG allows it for destructive confirmations).
        </Text>

        <div className={styles.row}>
          <Button onClick={() => setNoEscapeOpen(true)}>
            Open no-escape dialog
          </Button>
        </div>

        <Dialog
          open={noEscapeOpen}
          onOpenChange={setNoEscapeOpen}
          title="Important notice"
          description="Escape is disabled. Use the button to close."
          closeOnEscape={false}
          closeOnOverlayClick={false}
          footer={
            <Button onClick={() => setNoEscapeOpen(false)}>
              Acknowledge
            </Button>
          }
        >
          <Text>
            This variant is useful when a user must explicitly confirm before
            dismissing — e.g., a payment or deletion confirmation.
          </Text>
        </Dialog>
      </section>

      {/* ==================================================================== */}
      {/* CUSTOM INITIAL FOCUS                                                   */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Custom initial focus
        </Heading>
        <Text color="muted">
          <code>initialFocusRef</code> overrides the default (first tabbable) —
          APG allows designation for destructive actions (least-destructive
          button) or info dialogs (OK button).
        </Text>

        <div className={styles.row}>
          <Button onClick={() => setCustomFocusOpen(true)}>
            Open custom focus dialog
          </Button>
        </div>

        <Dialog
          open={customFocusOpen}
          onOpenChange={setCustomFocusOpen}
          title="Payment confirmation"
          description="Initial focus lands on Confirm button, not Close."
          initialFocusRef={confirmButtonRef}
          footer={
            <>
              <Button variant="ghost" onClick={() => setCustomFocusOpen(false)}>
                Cancel
              </Button>
              <Button
                ref={confirmButtonRef}
                variant="primary"
                onClick={() => setCustomFocusOpen(false)}
              >
                Confirm
              </Button>
            </>
          }
        >
          <Text>Amount: $49.00</Text>
        </Dialog>
      </section>

      {/* ==================================================================== */}
      {/* FORM                                                                   */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Dialog with form
        </Heading>
        <Text color="muted">
          Body contains form inputs. Focus trap cycles through inputs; browser
          handles native input keyboard; Escape closes (Radix #1951 fix).
        </Text>

        <div className={styles.row}>
          <Button onClick={() => setFormOpen(true)}>Open form dialog</Button>
        </div>

        <Dialog
          open={formOpen}
          onOpenChange={setFormOpen}
          title="Create project"
          description="Start a new project in your workspace."
          footer={
            <>
              <Button variant="ghost" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setFormOpen(false)}>
                Create
              </Button>
            </>
          }
        >
          <Input name="projectName" label="Project name" placeholder="My project" />
          <Input
            name="projectSlug"
            label="Slug"
            placeholder="my-project"
            helperText="Lowercase letters, numbers and hyphens only."
          />
        </Dialog>
      </section>

      {/* ==================================================================== */}
      {/* SIZES                                                                  */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Size variants
        </Heading>
        <Text color="muted">
          <code>sm</code> (420px), <code>md</code> (560px, default),{' '}
          <code>lg</code> (720px), <code>xl</code> (960px).
        </Text>

        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setSizeOpen('sm')}>
            sm
          </Button>
          <Button variant="secondary" onClick={() => setSizeOpen('md')}>
            md
          </Button>
          <Button variant="secondary" onClick={() => setSizeOpen('lg')}>
            lg
          </Button>
          <Button variant="secondary" onClick={() => setSizeOpen('xl')}>
            xl
          </Button>
        </div>

        {sizeOpen !== null ? (
          <Dialog
            open={sizeOpen !== null}
            onOpenChange={(next) => setSizeOpen(next ? sizeOpen : null)}
            title={`Size: ${sizeOpen}`}
            description={`This is a ${sizeOpen} dialog demonstrating max-width.`}
            size={sizeOpen}
            footer={
              <Button onClick={() => setSizeOpen(null)}>Close</Button>
            }
          >
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
          </Dialog>
        ) : null}
      </section>

      {/* ==================================================================== */}
      {/* MULTI-TRIGGER                                                          */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Multi-trigger (Radix #2270 regression guard)
        </Heading>
        <Text color="muted">
          Focus returns to the specific trigger that opened the dialog —
          <code>document.activeElement</code> saved at open time, restored at
          close time.
        </Text>

        <div className={styles.row}>
          <Button onClick={() => setTriggerAOpen(true)}>Open trigger A</Button>
          <Button onClick={() => setTriggerBOpen(true)}>Open trigger B</Button>
        </div>

        <Dialog
          open={triggerAOpen}
          onOpenChange={setTriggerAOpen}
          title="Opened by A"
          description="Closing returns focus to the A button."
          footer={<Button onClick={() => setTriggerAOpen(false)}>Close</Button>}
        >
          <Text>Multi-trigger test — focus return validation.</Text>
        </Dialog>

        <Dialog
          open={triggerBOpen}
          onOpenChange={setTriggerBOpen}
          title="Opened by B"
          description="Closing returns focus to the B button."
          footer={<Button onClick={() => setTriggerBOpen(false)}>Close</Button>}
        >
          <Text>Multi-trigger test — focus return validation.</Text>
        </Dialog>
      </section>

      {/* ==================================================================== */}
      {/* NESTED                                                                 */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Nested dialogs (Radix #1249 regression guard)
        </Heading>
        <Text color="muted">
          Opening a second dialog inside the first. Escape closes only the
          topmost dialog (each has its own <code>document.keydown</code>{' '}
          listener added on open, removed on close — topmost listener fires
          last).
        </Text>

        <div className={styles.row}>
          <Button onClick={() => setNestedOuterOpen(true)}>
            Open nested outer
          </Button>
        </div>

        <Dialog
          open={nestedOuterOpen}
          onOpenChange={setNestedOuterOpen}
          title="Outer dialog"
          description="Open the inner dialog below."
          footer={
            <Button onClick={() => setNestedOuterOpen(false)}>Close</Button>
          }
        >
          <Text>
            This is the outer modal. Click below to open an inner modal on top.
          </Text>
          <Button
            variant="secondary"
            onClick={() => setNestedInnerOpen(true)}
          >
            Open nested inner
          </Button>
        </Dialog>

        <Dialog
          open={nestedInnerOpen}
          onOpenChange={setNestedInnerOpen}
          title="Inner dialog"
          description="Escape closes this one; outer stays open."
          footer={
            <Button onClick={() => setNestedInnerOpen(false)}>Close</Button>
          }
        >
          <Text>
            Inner modal. Pressing Escape here closes only this dialog — the
            outer remains visible.
          </Text>
        </Dialog>
      </section>
    </main>
  );
}
