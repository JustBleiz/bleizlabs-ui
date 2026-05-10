'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DataRow } from '@/components/molecules/DataRow';
import { BackLink } from '@/components/molecules/BackLink';
import { SectionDivider } from '@/components/molecules/SectionDivider';
import { AccordionGroup } from '@/components/molecules/AccordionGroup';
import {
  ToggleGroupFilter,
  type ToggleGroupFilterOption,
} from '@/components/molecules/ToggleGroupFilter';
import { DeadlineBadge } from '@/components/molecules/DeadlineBadge';
import { FileChip } from '@/components/molecules/FileChip';
import { PageHeader } from '@/components/molecules/PageHeader';
import { Accordion } from '@/components/interactive/Accordion';
import { Badge } from '@/components/display/Badge';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

const STATUS_OPTIONS: ToggleGroupFilterOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'done', label: 'Done' },
  { value: 'archived', label: 'Archived' },
];

// Deterministic future dates relative to a fixed session date.
// Using string inputs so SSR output is stable regardless of when the
// page is built; the DeadlineBadge itself is hydration-safe.
const DEADLINES = {
  overdue: '2026-04-10',
  tomorrow: '2026-04-15',
  soon: '2026-04-17',
  later: '2026-05-01',
};

export default function MoleculesPlaygroundPage() {
  const [statuses, setStatuses] = useState<string[]>(['active']);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          Molecules
        </Heading>
        <Text className={styles.intro}>
          Eight composite components built from the atom layer —{' '}
          <code>DataRow</code>, <code>BackLink</code>,{' '}
          <code>SectionDivider</code>, <code>AccordionGroup</code>,{' '}
          <code>ToggleGroupFilter</code>, <code>DeadlineBadge</code>,{' '}
          <code>FileChip</code>, and <code>PageHeader</code>. They codify
          recurring patterns so consumers don&apos;t reinvent them per
          project.
        </Text>
      </header>

      {/* ==================================================================== */}
      {/* DATAROW                                                               */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          DataRow
        </Heading>
        <Text>
          Label / value pair with a <code>responsive</code> prop (default true
          — collapses to a column below the md breakpoint).{' '}
          <code>value</code> and <code>children</code> are interchangeable;
          ReactNode passes through, scalars are auto-wrapped in <code>Text</code>.
        </Text>

        <div className={styles.panel}>
          <div className={styles.stack}>
            <DataRow label="Status" value="Active" />
            <DataRow label="Client" value="BleizLabs Studio" />
            <DataRow label="Amount" value="$12,500" />
            <DataRow label="Deadline">
              <Badge color="warning" label="in 3 days" />
            </DataRow>
            <DataRow
              label="Non-responsive"
              value="Always horizontal"
              responsive={false}
            />
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* BACKLINK                                                              */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          BackLink
        </Heading>
        <Text>
          Ghost Button wrapper with a leading arrow icon. Pass{' '}
          <code>href</code> directly, or use <code>asChild</code> for{' '}
          <code>next/link</code>.
        </Text>

        <div className={styles.row}>
          <BackLink href="/components" label="Back to components" />
          <BackLink href="/panel" label="Back to panel" />
          <BackLink href="/docs" label="Documentation" />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTIONDIVIDER                                                        */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          SectionDivider
        </Heading>
        <Text>
          Labeled separator with 3 label positions.{' '}
          <code>role=&quot;separator&quot;</code> on the wrapper, gradient
          Separator lines on each side.
        </Text>

        <div className={styles.stack}>
          <SectionDivider>Order details</SectionDivider>
          <SectionDivider align="left">Left-aligned section</SectionDivider>
          <SectionDivider align="right">Right-aligned section</SectionDivider>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* ACCORDIONGROUP                                                        */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          AccordionGroup
        </Heading>
        <Text>
          FAQ wrapper with group-level open state.{' '}
          <code>mode=&quot;single&quot;</code> opens one panel at a time;{' '}
          <code>mode=&quot;multiple&quot;</code> allows several open in
          parallel. Group injects open state and change handlers into each
          child Accordion.
        </Text>

        <Text>
          <strong>Single mode</strong> (default, first panel open):
        </Text>
        <AccordionGroup mode="single" defaultOpen={0}>
          <Accordion question="How do I install the library?">
            <Text>
              Copy <code>styles/</code> and <code>components/</code> into your
              project, import the token system, and start composing. No npm
              dependency required today.
            </Text>
          </Accordion>
          <Accordion question="Can I override the colors?">
            <Text>
              Yes — edit <code>_project-settings.scss</code> seed values and
              the generator cascades the change through the entire design
              system, light and dark.
            </Text>
          </Accordion>
          <Accordion question="What about accessibility?">
            <Text>
              Every interactive component maps to a documented WAI-ARIA APG
              pattern with a full keyboard model and regression catalogue.
            </Text>
          </Accordion>
        </AccordionGroup>

        <Text>
          <strong>Multiple mode</strong> (multiple panels open):
        </Text>
        <AccordionGroup
          mode="multiple"
          defaultOpen={[0, 2]}
          gap={3}
          onOpenChange={(open) => console.log('Open indexes:', open)}
        >
          <Accordion question="Feature A">
            <Text>Multiple-open FAQ with custom gap and callback.</Text>
          </Accordion>
          <Accordion question="Feature B">
            <Text>Any combination can be open simultaneously.</Text>
          </Accordion>
          <Accordion question="Feature C">
            <Text>onOpenChange callback returns sorted open indexes.</Text>
          </Accordion>
        </AccordionGroup>
      </section>

      {/* ==================================================================== */}
      {/* TOGGLEGROUPFILTER                                                     */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          ToggleGroupFilter
        </Heading>
        <Text>
          Thin composition over <code>ToggleGroup type=&quot;multiple&quot;</code>.
          Flat options array → Toggle children. Consumer owns controlled state.
          <code>groupLabel</code> prop for a visible caption.
        </Text>

        <ToggleGroupFilter
          label="Order status filter"
          groupLabel="Status"
          options={STATUS_OPTIONS}
          value={statuses}
          onValueChange={setStatuses}
        />

        <Text>
          <strong>Selected:</strong>{' '}
          {statuses.length > 0 ? statuses.join(', ') : '(none)'}
        </Text>

        <div className={styles.controls}>
          <button type="button" onClick={() => setStatuses([])}>
            Clear
          </button>
          <button type="button" onClick={() => setStatuses(['active', 'paused'])}>
            Active + paused
          </button>
          <button
            type="button"
            onClick={() => setStatuses(STATUS_OPTIONS.map((o) => o.value))}
          >
            All
          </button>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* DEADLINEBADGE                                                         */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          DeadlineBadge
        </Heading>
        <Text>
          Badge wrapping <code>Intl.RelativeTimeFormat</code>. Hydration-safe —
          SSR renders the absolute date, then a <code>useEffect</code> +{' '}
          <code>requestAnimationFrame</code> pair swaps in the relative label
          after hydration. Color mapping: overdue → error, ≤ threshold →
          warning, else → success.
        </Text>

        <div className={styles.stack}>
          <DeadlineBadge deadline={DEADLINES.overdue} label="Overdue:" />
          <DeadlineBadge deadline={DEADLINES.tomorrow} label="Soon:" />
          <DeadlineBadge deadline={DEADLINES.soon} label="This week:" />
          <DeadlineBadge deadline={DEADLINES.later} label="Later:" />
          <DeadlineBadge
            deadline={DEADLINES.later}
            label="Custom threshold (7):"
            urgentThreshold={7}
          />
          <DeadlineBadge deadline={DEADLINES.soon} locale="en-US" />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FILECHIP                                                              */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          FileChip
        </Heading>
        <Text>
          Rounded pill chip for file attachments — composes a MIME icon
          (or <code>Spinner</code> while uploading), filename (CSS-truncated),
          human-readable size, and optional ghost <code>Button</code>s for
          remove / retry. Three variants:{' '}
          <code>uploaded</code> (default), <code>uploading</code>,{' '}
          <code>error</code>. Server-safe in the read-only case; the parent
          naturally becomes a Client Component when <code>onRemove</code> /
          <code>onRetry</code> are supplied. Demo handlers below are no-ops.
        </Text>

        <div className={styles.stack}>
          <FileChip
            name="brief.pdf"
            size={245_760}
            mimeType="application/pdf"
          />
          <FileChip
            name="screenshot.png"
            size={1_474_560}
            mimeType="image/png"
            onRemove={() => {}}
            removeLabel="Remove screenshot"
          />
          <FileChip
            name="intro.mp4"
            size={82_944_000}
            mimeType="video/mp4"
            variant="uploading"
            uploadingLabel="Uploading intro.mp4"
          />
          <FileChip
            name="archive-q3-full-backup-with-assets.zip"
            size={524_288_000}
            mimeType="application/zip"
            variant="error"
            onRetry={() => {}}
            onRemove={() => {}}
            retryLabel="Retry"
            removeLabel="Discard upload"
          />
          <FileChip
            name="podcast-episode.mp3"
            size={12_582_912}
            mimeType="audio/mpeg"
            onRemove={() => {}}
          />
          <FileChip name="unknown-format-file" size={4096} />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PAGEHEADER                                                            */}
      {/* ==================================================================== */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          PageHeader
        </Heading>
        <Text>
          Page-top title section composing <code>Heading</code> +{' '}
          <code>Text</code> (subtitle) + optional <code>Badge</code> strip via{' '}
          <code>Stack</code> / <code>Inline</code>. Accent fragment via{' '}
          <code>accentStart</code> / <code>accentEnd</code> char-index
          slicing (defensive — out-of-bounds falls back to plain title).
          Token override channel <code>--page-header-accent</code> (defaults{' '}
          <code>var(--color-brand)</code>). Server-safe.
        </Text>

        <div className={styles.panel}>
          <div className={styles.stack}>
            <Text variant="small" color="secondary">
              Plain title (level=1, no accent, no subtitle)
            </Text>
            <PageHeader level={1} title="Profil" />
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.stack}>
            <Text variant="small" color="secondary">
              Accent fragment + subtitle (level=1)
            </Text>
            <PageHeader
              level={1}
              title="Moje usługi"
              accentStart={5}
              accentEnd={11}
              subtitle="Przegląd Twoich usług."
            />
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.stack}>
            <Text variant="small" color="secondary">
              Full — title + accent + subtitle + status badges
            </Text>
            <PageHeader
              level={1}
              title="Wykonane projekty"
              accentStart={10}
              accentEnd={17}
              subtitle="Przegląd ukończonych zleceń."
              badges={[
                { label: 'Aktywne 3', color: 'success' },
                { label: '1 ostrzeżenie', color: 'warning' },
              ]}
            />
          </div>
        </div>

      </section>
    </main>
  );
}
