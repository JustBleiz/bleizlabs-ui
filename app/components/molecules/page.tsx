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
import { Accordion } from '@/components/interactive/Accordion';
import { Badge } from '@/components/display/Badge';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

const STATUS_OPTIONS: ToggleGroupFilterOption[] = [
  { value: 'active', label: 'Aktywne' },
  { value: 'paused', label: 'Wstrzymane' },
  { value: 'done', label: 'Zakończone' },
  { value: 'archived', label: 'Archiwum' },
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
          Phase 7 (E12) — DataRow, BackLink, SectionDivider, AccordionGroup,
          ToggleGroupFilter, DeadlineBadge. Compositional molecules on top of
          existing atoms — zero new primitives.
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
          Label/value pair z <code>responsive</code> prop (default true —
          collapse do kolumny poniżej md breakpoint). <code>value</code> i{' '}
          <code>children</code> są zamienne; ReactNode przechodzi, scalary
          auto-wrapped w Text.
        </Text>

        <div className={styles.panel}>
          <div className={styles.stack}>
            <DataRow label="Status" value="Aktywne" />
            <DataRow label="Klient" value="BleizLabs Studio" />
            <DataRow label="Wartość" value="12 500 PLN" />
            <DataRow label="Deadline">
              <Badge color="warning" label="za 3 dni" />
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
          Ghost Button wrapper z leading arrow icon. Consumer przekazuje{' '}
          <code>href</code> lub <code>asChild</code> dla next/link.
        </Text>

        <div className={styles.row}>
          <BackLink href="/components" />
          <BackLink href="/panel" label="Do panelu" />
          <BackLink href="/docs" label="Dokumentacja" />
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
          Labeled separator z 3 pozycjami. <code>role=&quot;separator&quot;</code>{' '}
          na wrapperze, gradient Separator lines po bokach.
        </Text>

        <div className={styles.stack}>
          <SectionDivider>Detale zlecenia</SectionDivider>
          <SectionDivider align="left">Sekcja po lewej</SectionDivider>
          <SectionDivider align="right">Sekcja po prawej</SectionDivider>
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
          FAQ wrapper z group-level open state. <code>mode=&quot;single&quot;</code>{' '}
          (only one open) lub <code>&quot;multiple&quot;</code>. Internal{' '}
          <code>Set&lt;number&gt;</code> state, injects open/onOpenChange do
          każdego Accordion child przez React.cloneElement.
        </Text>

        <Text>
          <strong>Single mode</strong> (default, first panel open):
        </Text>
        <AccordionGroup mode="single" defaultOpen={0}>
          <Accordion question="Jak działa biblioteka?">
            <Text>
              Copy-to-project model — kopiujesz bazę, zmieniasz seedy, tree-
              shaking w Next.js. Zero npm dependency.
            </Text>
          </Accordion>
          <Accordion question="Czy mogę nadpisać kolory?">
            <Text>
              Tak — edytuj <code>_project-settings.scss</code> i generator
              kaskaduje zmianę przez cały design system.
            </Text>
          </Accordion>
          <Accordion question="Jak z a11y complex interactive?">
            <Text>
              Phase 10 ma extended pipeline oparty o WAI-ARIA APG + Radix
              issues + NVDA + Playwright + axe-core.
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
          Thin composition nad ToggleGroup type=&quot;multiple&quot;. Flat
          options array → Toggle children. Consumer owns controlled state.
          <code>groupLabel</code> prop dla visible uppercase caption.
        </Text>

        <ToggleGroupFilter
          label="Filtr statusów zleceń"
          groupLabel="Status"
          options={STATUS_OPTIONS}
          value={statuses}
          onValueChange={setStatuses}
        />

        <Text>
          <strong>Zaznaczone:</strong>{' '}
          {statuses.length > 0 ? statuses.join(', ') : '(brak)'}
        </Text>

        <div className={styles.controls}>
          <button type="button" onClick={() => setStatuses([])}>
            Wyczyść
          </button>
          <button type="button" onClick={() => setStatuses(['active', 'paused'])}>
            Aktywne + wstrzymane
          </button>
          <button
            type="button"
            onClick={() => setStatuses(STATUS_OPTIONS.map((o) => o.value))}
          >
            Wszystkie
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
          Badge z Intl.RelativeTimeFormat. Hydration-safe — SSR renderuje
          absolute date, po hydracji swap do relative label via useEffect +
          requestAnimationFrame. Color mapping: overdue → error, ≤ threshold
          → warning, else → success.
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
    </main>
  );
}
