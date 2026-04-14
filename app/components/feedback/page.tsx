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

  const STAGES = ['Planowanie', 'Projekt', 'Development', 'Testy', 'Release'];

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
          Phase 5 (E09) — Empty, Alert, Progress. Placeholder slot dla pustych
          list, semantyczne notifications z opt-in dismiss i href body,
          dwumodalny progress (stages XOR percent).
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
          Placeholder dla zero-result. Icon + title + description + cta slot.
          Opcjonalne <code>role=&quot;status&quot;</code> via spread (dla
          async-rendered empty states).
        </Text>

        <div className={styles.stack}>
          <Empty
            icon={<InboxIcon />}
            title="Brak zgłoszeń"
            description="Nie masz jeszcze żadnych wiadomości. Utwórz pierwsze zgłoszenie aby zacząć."
            cta={<Button>Utwórz zgłoszenie</Button>}
          />
          <Empty title="Lista jest pusta" />
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
          4 warianty (critical/warning/info/success). Critical →{' '}
          <code>role=&quot;alert&quot;</code>, pozostałe → <code>status</code>.
          Opt-in dismiss, opcjonalny href na body, opcjonalny timestamp.
        </Text>

        <div className={styles.stack}>
          {ALL_VARIANTS.map((variant) =>
            visibleAlerts.has(variant) ? (
              <Alert
                key={variant}
                variant={variant}
                title={`${variant[0]!.toUpperCase()}${variant.slice(1)} alert`}
                description="Przykładowa treść notyfikacji dla tego wariantu. Może mieć długi opis lub inline link."
                onClose={() => dismissAlert(variant)}
              />
            ) : null,
          )}

          <Alert
            variant="info"
            title="Nowa wersja biblioteki"
            description="Kliknij aby zobaczyć changelog w nowej karcie."
            href="#changelog"
            timestamp="2026-04-14T14:30:00Z"
          />

          <Alert
            variant="warning"
            title="Persistent warning (bez onClose)"
            description="Nie może być zamknięty przez użytkownika — bez onClose nie renderuje się przycisk X."
          />
        </div>

        <div className={styles.controls}>
          <Button variant="secondary" size="sm" onClick={resetAlerts}>
            Przywróć wszystkie alerty
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
          Horizontal pill strip, <code>&lt;ol aria-label&gt;</code> +{' '}
          <code>aria-current=&quot;step&quot;</code> na aktywnym elemencie.
        </Text>

        <div className={styles.stack}>
          <Progress
            label="Postęp projektu klienta"
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
            ← Poprzedni etap
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setStageIndex((i) => Math.min(STAGES.length - 1, i + 1))
            }
            disabled={stageIndex === STAGES.length - 1}
          >
            Następny etap →
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
          Linear bar, <code>role=&quot;progressbar&quot;</code> +{' '}
          <code>aria-valuenow/min/max</code>. Width injection via
          <code> --progress-value</code> CSS variable. Value clamped do [0, max].
        </Text>

        <div className={styles.stack}>
          <Progress label="Upload pliku" value={uploadValue} max={100} />
          <Progress label="Task completion" value={87} max={100} />
          <Progress label="Kwota (clamp test)" value={150} max={100} />
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
