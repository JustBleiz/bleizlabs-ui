import Link from 'next/link';
import {
  BreakdownList,
  BreakdownListItem,
} from '@/components/molecules/BreakdownList';
import { KpiValue, KpiValueAnimated } from '@/components/display/KpiValue';
import { IconHeaderCard } from '@/components/presets/IconHeaderCard';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

// Inline placeholder icons (the lib has no icon dep — consumer provides icons).
function PlaceholderIcon({
  d,
  ariaLabel,
}: {
  d: string;
  ariaLabel?: string;
}) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <path d={d} />
    </svg>
  );
}

const ICON_BARS = 'M4 19V9m6 10V5m6 14v-7';
const ICON_USERS = 'M9 11a4 4 0 100-8 4 4 0 000 8zm6 8v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2m18 0v-2a4 4 0 00-3-3.87m-3-12a4 4 0 010 7.75';
const ICON_CLOCK = 'M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z';
const ICON_TRENDING_UP = 'M3 17l6-6 4 4 8-8M14 7h7v7';
const ICON_HEART = 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z';
const ICON_SHIELD = 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z';

const ESCALATION_REASONS = [
  { label: 'Brak intencji', value: 45 },
  { label: 'Frustracja użytkownika', value: 30 },
  { label: 'Pytania spoza zakresu', value: 25 },
];

const TRAFFIC_SOURCES = [
  { label: 'Direct', value: 42 },
  { label: 'Organic search', value: 35 },
  { label: 'Referral', value: 23 },
];

export default function IconHeaderCardPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          IconHeaderCard
        </Heading>
        <p className={styles.intro}>
          Universal admin / dashboard card shell with an icon-led header.
          Composes Card + IconBox + optional Badge + optional CardSection
          footers. Hosts KpiValue, PercentValue, BreakdownList, MetricBar, or
          any arbitrary content via the <code>children</code> body slot. Part
          of the ContentCard / StatsCard / ActionCard family.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. KpiValue body — typical conversion-stats pattern
        </Heading>
        <Text variant="small" color="secondary">
          Conversion stats card pattern: IconHeaderCard shell wrapping a KpiValue body.
        </Text>
        <div className={styles.cardGrid}>
          <IconHeaderCard
            headerIcon={<PlaceholderIcon d={ICON_BARS} />}
            headerLabel="Konwersje"
            iconVariant="brand"
            headerBadge={{ label: 'Ostatnie 30 dni', color: 'default' }}
          >
            <KpiValueAnimated
              value={42}
              unit="konwersji"
              trend={{ direction: 'up', label: '+12%' }}
            />
          </IconHeaderCard>

          <IconHeaderCard
            headerIcon={<PlaceholderIcon d={ICON_TRENDING_UP} />}
            headerLabel="Przychód pakietu"
            iconVariant="success"
            headerBadge={{ label: 'Aktywny', color: 'success' }}
          >
            <KpiValueAnimated
              value={1500}
              unit="PLN"
              size="xl"
              trend={{ direction: 'up', label: '+8%' }}
            />
          </IconHeaderCard>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. PercentValue body + BreakdownList footer
        </Heading>
        <Text variant="small" color="secondary">
          Escalation rate card pattern: PercentValue body + footer with
          BreakdownList in CardSection.
        </Text>
        <div className={styles.cardGrid}>
          <IconHeaderCard
            headerIcon={<PlaceholderIcon d={ICON_USERS} />}
            headerLabel="Eskalacje do człowieka"
            iconVariant="warning"
            headerBadge={{ label: 'Wysoki', color: 'warning' }}
            footerSections={[
              {
                title: 'Najczęstsze powody eskalacji',
                children: (
                  <BreakdownList aria-label="Powody eskalacji">
                    {ESCALATION_REASONS.map((item) => (
                      <BreakdownListItem
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        tone="warning"
                      />
                    ))}
                  </BreakdownList>
                ),
              },
            ]}
          >
            <KpiValueAnimated
              value={22}
              unit="%"
              color="auto"
              inverse
              thresholds={{ success: 15, warning: 30 }}
              benchmark="industry avg 20%"
            />
          </IconHeaderCard>

          <IconHeaderCard
            headerIcon={<PlaceholderIcon d={ICON_BARS} />}
            headerLabel="Ruch publiczny"
            iconVariant="brand"
            footerSections={[
              {
                title: 'Źródła ruchu',
                children: (
                  <BreakdownList aria-label="Źródła ruchu">
                    {TRAFFIC_SOURCES.map((item) => (
                      <BreakdownListItem
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        tone="info"
                      />
                    ))}
                  </BreakdownList>
                ),
              },
            ]}
          >
            <KpiValueAnimated
              value={29700}
              unit="sesji"
              trend={{ direction: 'up', label: '+5%' }}
            />
          </IconHeaderCard>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Minimal — header only + body, no badge, no footer
        </Heading>
        <div className={styles.cardGrid}>
          <IconHeaderCard
            headerIcon={<PlaceholderIcon d={ICON_CLOCK} />}
            headerLabel="SLA"
          >
            <KpiValue value={4} unit="h" />
          </IconHeaderCard>

          <IconHeaderCard
            headerIcon={<PlaceholderIcon d={ICON_HEART} />}
            headerLabel="Satysfakcja"
            iconVariant="success"
          >
            <KpiValueAnimated value={4.7} unit="/5" decimals={1} />
          </IconHeaderCard>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. IconBox variants (default / brand / success / warning / error / plain)
        </Heading>
        <div className={styles.cardGrid}>
          {(['default', 'brand', 'success', 'warning', 'error', 'plain'] as const).map(
            (iconVariant) => (
              <IconHeaderCard
                key={iconVariant}
                headerIcon={<PlaceholderIcon d={ICON_SHIELD} />}
                headerLabel={`iconVariant="${iconVariant}"`}
                iconVariant={iconVariant}
              >
                <KpiValue value={42} unit="konwersji" />
              </IconHeaderCard>
            )
          )}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. Multiple footer sections (max 3 per design guidance)
        </Heading>
        <div className={styles.cardGrid}>
          <IconHeaderCard
            headerIcon={<PlaceholderIcon d={ICON_USERS} />}
            headerLabel="Statystyki konwersacji"
            iconVariant="brand"
            footerSections={[
              {
                title: 'Top intencje',
                children: (
                  <BreakdownList aria-label="Top intencje">
                    <BreakdownListItem label="Status zamówienia" value={38} />
                    <BreakdownListItem label="Zmiana terminu" value={24} />
                    <BreakdownListItem label="Zwrot produktu" value={18} />
                  </BreakdownList>
                ),
              },
              {
                title: 'Powody eskalacji',
                children: (
                  <BreakdownList aria-label="Powody eskalacji">
                    {ESCALATION_REASONS.map((item) => (
                      <BreakdownListItem
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        tone="warning"
                      />
                    ))}
                  </BreakdownList>
                ),
              },
            ]}
          >
            <KpiValueAnimated value={1240} unit="rozmów" trend={{ direction: 'up', label: '+18%' }} />
          </IconHeaderCard>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          6. Card variants (default / elevated / accent / glass)
        </Heading>
        <div className={styles.cardGrid}>
          {(['default', 'elevated', 'accent', 'glass'] as const).map((variant) => (
            <IconHeaderCard
              key={variant}
              headerIcon={<PlaceholderIcon d={ICON_BARS} />}
              headerLabel={`variant="${variant}"`}
              iconVariant="brand"
              variant={variant}
            >
              <KpiValue value={42} unit="konwersji" size="md" />
            </IconHeaderCard>
          ))}
        </div>
      </section>
    </main>
  );
}
