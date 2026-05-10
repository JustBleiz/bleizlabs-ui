import Link from 'next/link';
import {
  BreakdownList,
  BreakdownListItem,
} from '@/components/molecules/BreakdownList';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import styles from './page.module.scss';

const ESCALATION_REASONS = [
  { label: 'Brak intencji', value: 45 },
  { label: 'Frustracja użytkownika', value: 30 },
  { label: 'Pytania spoza zakresu', value: 25 },
];

const TRAFFIC_SOURCES = [
  { label: 'Direct', value: 42, sessions: '12 500 sesji' },
  { label: 'Organic search', value: 35, sessions: '10 400 sesji' },
  { label: 'Referral', value: 23, sessions: '6 800 sesji' },
];

const TOP_INTENTS = [
  { label: 'Sprawdź status zamówienia', value: 38 },
  { label: 'Zmień termin dostawy', value: 24 },
  { label: 'Zwrot produktu', value: 18 },
  { label: 'Zaloguj się do panelu', value: 12 },
  { label: 'Inne', value: 8 },
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
          Universal labeled progress list (compound molecule). Shell{' '}
          <code>&lt;BreakdownList&gt;</code> + item{' '}
          <code>&lt;BreakdownListItem&gt;</code> — consumer iterates own data,
          composes own label slot (plain string OR inline percent OR any
          ReactNode), wraps own description typography. Klocek-discipline:
          5-prop item, 2-prop shell, no forced typed array, no auto-wrap, no
          density lockup. Bar styling delegated to Progress dependency.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Cautionary breakdown — top escalation reasons
        </Heading>
        <Text variant="small" color="secondary">
          tone=&quot;warning&quot; (cautionary breakdown of why AI escalates).
          Plain string label — no inline percent display.
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <BreakdownList aria-label="Najczęstsze powody eskalacji">
              {ESCALATION_REASONS.map((item) => (
                <BreakdownListItem
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  tone="warning"
                />
              ))}
            </BreakdownList>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Traffic-source breakdown — composed labels with inline percent
        </Heading>
        <Text variant="small" color="secondary">
          tone=&quot;info&quot;. Label slot composes inline percent via{' '}
          <code>&lt;Inline justify=&quot;between&quot;&gt;</code>; description
          slot wraps raw count via <code>&lt;Text variant=&quot;small&quot;&gt;</code>.
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <BreakdownList aria-label="Źródła ruchu">
              {TRAFFIC_SOURCES.map((item) => (
                <BreakdownListItem
                  key={item.label}
                  label={
                    <Inline justify="between" gap={2}>
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </Inline>
                  }
                  value={item.value}
                  tone="info"
                  description={
                    <Text variant="small" color="muted">
                      {item.sessions}
                    </Text>
                  }
                />
              ))}
            </BreakdownList>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Top-N list pattern — five items, brand tone
        </Heading>
        <Text variant="small" color="secondary">
          5 items, default tone=&quot;brand&quot;. Inline percent in label slot.
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <BreakdownList aria-label="Top intencje konwersacji">
              {TOP_INTENTS.map((item) => (
                <BreakdownListItem
                  key={item.label}
                  label={
                    <Inline justify="between" gap={2}>
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </Inline>
                  }
                  value={item.value}
                />
              ))}
            </BreakdownList>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. Tone variants (brand / info / success / warning / error)
        </Heading>
        <Text variant="small" color="secondary">
          Tone affects ONLY the Progress bar color. Label and description stay
          neutral (consumer typography).
        </Text>
        <div className={styles.toneRow}>
          {(['brand', 'info', 'success', 'warning', 'error'] as const).map(
            (tone) => (
              <div key={tone} className={styles.cell}>
                <Text variant="caption" color="muted">
                  tone=&quot;{tone}&quot;
                </Text>
                <BreakdownList aria-label={`Tone ${tone} demo`}>
                  {ESCALATION_REASONS.map((item) => (
                    <BreakdownListItem
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      tone={tone}
                    />
                  ))}
                </BreakdownList>
              </div>
            )
          )}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. Custom max scale (value=150 on max=200)
        </Heading>
        <Text variant="small" color="secondary">
          Pass <code>max</code> prop on item when value isn&apos;t a 0-100
          percentage. ARIA label still derives correct percent for SR scan.
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <BreakdownList aria-label="Custom max">
              <BreakdownListItem label="Item A" value={150} max={200} />
              <BreakdownListItem label="Item B" value={80} max={200} />
              <BreakdownListItem label="Item C" value={40} max={200} />
            </BreakdownList>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          6. Empty state (consumer-owned)
        </Heading>
        <Text variant="small" color="secondary">
          Molecule never auto-wraps. Consumer renders own empty fallback when
          data is missing — no <code>emptyMessage</code> prop bundling concerns.
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <Text variant="small" color="muted">
              Brak danych z ostatnich 30 dni
            </Text>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          7. Long labels (wrap, not truncate)
        </Heading>
        <Text variant="small" color="secondary">
          Multi-word analytics labels wrap in label slot; Progress bar stays
          full-width below.
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <BreakdownList aria-label="Long labels demo">
              <BreakdownListItem
                label="Pytania spoza zakresu obsługi sklepu internetowego"
                value={45}
                tone="info"
              />
              <BreakdownListItem
                label="Reklamacje i zwroty produktów premium"
                value={30}
                tone="info"
              />
              <BreakdownListItem label="Inne" value={25} tone="info" />
            </BreakdownList>
          </div>
        </div>
      </section>
    </main>
  );
}
