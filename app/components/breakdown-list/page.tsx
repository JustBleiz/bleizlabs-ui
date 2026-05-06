import Link from 'next/link';
import { BreakdownList } from '@/components/molecules/BreakdownList';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

const ESCALATION_REASONS = [
  { label: 'Brak intencji', sharePercent: 45 },
  { label: 'Frustracja użytkownika', sharePercent: 30 },
  { label: 'Pytania spoza zakresu', sharePercent: 25 },
];

const TRAFFIC_SOURCES = [
  { label: 'Direct', sharePercent: 42, description: '12 500 sesji' },
  { label: 'Organic search', sharePercent: 35, description: '10 400 sesji' },
  { label: 'Referral', sharePercent: 23, description: '6 800 sesji' },
];

const TOP_INTENTS = [
  { label: 'Sprawdź status zamówienia', sharePercent: 38 },
  { label: 'Zmień termin dostawy', sharePercent: 24 },
  { label: 'Zwrot produktu', sharePercent: 18 },
  { label: 'Zaloguj się do panelu', sharePercent: 12 },
  { label: 'Inne', sharePercent: 8 },
];

export default function BreakdownListPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          BreakdownList
        </Heading>
        <p className={styles.intro}>
          Universal analytics breakdown list molecule. Composes Progress per
          item to show share of total. Common pattern across BI dashboards
          (top reasons, top sources, top intents). Auto-clusters analytics
          breakdown subtree pattern across multiple consumers.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Driving consumer #1 — EscalationRateGauge.topReasons
        </Heading>
        <Text variant="small" color="secondary">
          tone=&quot;warning&quot; (cautionary breakdown of why AI escalates).
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <BreakdownList
              aria-label="Najczęstsze powody eskalacji"
              items={ESCALATION_REASONS}
              tone="warning"
            />
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Driving consumer #2 — PublicTrafficStats.sources
        </Heading>
        <Text variant="small" color="secondary">
          tone=&quot;info&quot;, with descriptions (raw session counts).
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <BreakdownList
              aria-label="Źródła ruchu"
              items={TRAFFIC_SOURCES}
              tone="info"
            />
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Driving consumer #3 — TopIntentsList
        </Heading>
        <Text variant="small" color="secondary">
          5 items, default tone=&quot;brand&quot;.
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <BreakdownList
              aria-label="Top intencje konwersacji"
              items={TOP_INTENTS}
            />
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. Tone variants (brand / info / success / warning)
        </Heading>
        <div className={styles.toneRow}>
          {(['brand', 'info', 'success', 'warning'] as const).map((tone) => (
            <div key={tone} className={styles.cell}>
              <Text variant="caption" color="muted">
                tone=&quot;{tone}&quot;
              </Text>
              <BreakdownList
                aria-label={`Tone ${tone} demo`}
                items={ESCALATION_REASONS}
                tone={tone}
              />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. Density variants (compact / comfortable)
        </Heading>
        <div className={styles.toneRow}>
          <div className={styles.cell}>
            <Text variant="caption" color="muted">
              density=&quot;compact&quot;
            </Text>
            <BreakdownList
              aria-label="Compact density demo"
              items={ESCALATION_REASONS}
              density="compact"
            />
          </div>
          <div className={styles.cell}>
            <Text variant="caption" color="muted">
              density=&quot;comfortable&quot; (default)
            </Text>
            <BreakdownList
              aria-label="Comfortable density demo"
              items={ESCALATION_REASONS}
              density="comfortable"
            />
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          6. Edge cases (showPercent=false, custom max, empty state)
        </Heading>
        <div className={styles.toneRow}>
          <div className={styles.cell}>
            <Text variant="caption" color="muted">
              showPercent=false (bars only)
            </Text>
            <BreakdownList
              aria-label="Bars only"
              items={ESCALATION_REASONS}
              showPercent={false}
            />
          </div>
          <div className={styles.cell}>
            <Text variant="caption" color="muted">
              max=200 (sharePercent on 0-200 scale)
            </Text>
            <BreakdownList
              aria-label="Custom max"
              items={[
                { label: 'Item A', sharePercent: 150 },
                { label: 'Item B', sharePercent: 80 },
                { label: 'Item C', sharePercent: 40 },
              ]}
              max={200}
            />
          </div>
          <div className={styles.cell}>
            <Text variant="caption" color="muted">
              Empty state
            </Text>
            <BreakdownList
              aria-label="Empty demo"
              items={[]}
              emptyMessage="Brak danych z ostatnich 30 dni"
            />
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          7. Long labels (wrap, not truncate)
        </Heading>
        <div className={styles.row}>
          <div className={styles.cell}>
            <BreakdownList
              aria-label="Long labels demo"
              items={[
                {
                  label: 'Pytania spoza zakresu obsługi sklepu internetowego',
                  sharePercent: 45,
                },
                {
                  label: 'Reklamacje i zwroty produktów premium',
                  sharePercent: 30,
                },
                { label: 'Inne', sharePercent: 25 },
              ]}
              tone="info"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
