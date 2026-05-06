import Link from 'next/link';
import type { ReactElement } from 'react';
import { IconButton } from '@/components/molecules/IconButton';
import { Heading } from '@/components/typography/Heading';
import styles from './page.module.scss';

function PencilIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m11 2 3 3-8 8H3v-3z" />
    </svg>
  );
}

function TrashIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 4h10M5 4V2h6v2M6 7v6M10 7v6M4 4l1 10h6l1-10" />
    </svg>
  );
}

function DotsIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="currentColor"
    >
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
    </svg>
  );
}

function GearIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1v2M8 13v2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M1 8h2M13 8h2M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
    </svg>
  );
}

export default function IconButtonPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          IconButton
        </Heading>
        <p className={styles.intro}>
          Accessibility-enforcing wrapper over <code>Button</code> with{' '}
          <code>iconOnly={'{true}'}</code>. The <code>aria-label</code> prop is
          TS-required so the type-checker rejects icon-only buttons missing an
          accessible name. Renders Button under the hood — inherits all
          variant/size/shape behavior.
        </p>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          1. Variants
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.row}>
            <IconButton aria-label="Edit" icon={<PencilIcon />} variant="primary" />
            <IconButton aria-label="Edit" icon={<PencilIcon />} variant="secondary" />
            <IconButton aria-label="Edit" icon={<PencilIcon />} variant="ghost" />
            <IconButton aria-label="Delete" icon={<TrashIcon />} variant="warning" />
            <IconButton aria-label="More" icon={<DotsIcon />} variant="link" />
          </div>
          <p className={styles.bodyText}>
            All Button variants are inherited (<code>primary</code> /{' '}
            <code>secondary</code> / <code>ghost</code> / <code>warning</code> /{' '}
            <code>link</code>). The icon is automatically <code>aria-hidden</code>{' '}
            — accessible name comes from <code>aria-label</code>.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          2. Sizes
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.row}>
            <IconButton aria-label="Settings" icon={<GearIcon />} size="sm" />
            <IconButton aria-label="Settings" icon={<GearIcon />} size="md" />
            <IconButton aria-label="Settings" icon={<GearIcon />} size="lg" />
          </div>
          <p className={styles.bodyText}>
            Three sizes (<code>sm</code> / <code>md</code> / <code>lg</code>)
            inherited from Button. Touch-target enforcement (44×44 on coarse
            pointers) handled by Button via <code>mx.touch-target</code> mixin —
            see <code>--size-touch-min</code> token.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          3. Shapes (rounded vs pill)
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.row}>
            <IconButton aria-label="Edit" icon={<PencilIcon />} shape="rounded" />
            <IconButton aria-label="Edit" icon={<PencilIcon />} shape="pill" />
          </div>
          <p className={styles.bodyText}>
            <code>shape</code> prop forwards to Button. <code>pill</code> for
            atelier-style CTAs.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          4. Disabled
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.row}>
            <IconButton aria-label="Edit (disabled)" icon={<PencilIcon />} disabled />
          </div>
          <p className={styles.bodyText}>
            Native <code>disabled</code> attribute forwarded to underlying
            <code>{' <button>'}</code>. Removed from Tab order; opacity reduced.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          5. As anchor (href)
        </Heading>
        <div className={styles.sectionBody}>
          <div className={styles.row}>
            <IconButton
              aria-label="Go to settings"
              icon={<GearIcon />}
              href="/components/button"
            />
          </div>
          <p className={styles.bodyText}>
            With <code>href</code>, Button renders as <code>{'<a>'}</code>{' '}
            instead of <code>{'<button>'}</code>. Useful for icon-only
            navigation links — the <code>aria-label</code> remains the sole
            accessible name. For client-side routing with Next.js{' '}
            <code>{'<Link>'}</code>, wrap the IconButton in <code>{'<Link>'}</code>{' '}
            from the outside (IconButton omits <code>children</code> by API
            contract because the icon is the only content slot — direct{' '}
            <code>asChild</code> composition is not supported).
          </p>
        </div>
      </section>
    </main>
  );
}
