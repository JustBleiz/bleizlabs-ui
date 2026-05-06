import Link from 'next/link';
import { KpiValue, KpiValueAnimated } from '@/components/display/KpiValue';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function KpiValuePlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          KpiValue
        </Heading>
        <p className={styles.intro}>
          Universal KPI big-number display atom (Server Component since
          v0.7.0). Numeric or string value + unit label + optional trend
          indicator. Symmetric pair with PercentValue. Animated count-up via
          sister <code>KpiValueAnimated</code> client wrapper.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Driving consumers (4 panel/services pillar cards)
        </Heading>
        <Text variant="small" color="secondary">
          Mirrors Faza 3 wrapper use cases: ConversionStats, PackageRevenueOverview,
          PublicTrafficStats, SatisfactionScore.
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <KpiValueAnimated
              value={42}
              unit="konwersji"
              trend={{ direction: 'up', label: '+12%' }}
            />
            <Text variant="caption" color="muted">
              ConversionStats
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValueAnimated
              value={1500}
              unit="PLN"
              size="xl"
              trend={{ direction: 'up', label: '+8%' }}
            />
            <Text variant="caption" color="muted">
              PackageRevenueOverview
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValueAnimated
              value={12500}
              unit="sesji"
              trend={{ direction: 'down', label: '-3%' }}
            />
            <Text variant="caption" color="muted">
              PublicTrafficStats
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValueAnimated value={4.7} unit="/5" decimals={1} />
            <Text variant="caption" color="muted">
              SatisfactionScore
            </Text>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Sizes (md / lg / xl)
        </Heading>
        <div className={styles.row}>
          <div className={styles.cell}>
            <KpiValue value={42} unit="konwersji" size="md" />
            <Text variant="caption" color="muted">
              md
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue value={42} unit="konwersji" size="lg" />
            <Text variant="caption" color="muted">
              lg (default)
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue value={42} unit="konwersji" size="xl" />
            <Text variant="caption" color="muted">
              xl
            </Text>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Color variants
        </Heading>
        <div className={styles.row}>
          <div className={styles.cell}>
            <KpiValue value={100} unit="%" color="primary" />
            <Text variant="caption" color="muted">
              primary
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue value={98} unit="%" color="success" />
            <Text variant="caption" color="muted">
              success
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue value={75} unit="%" color="warning" />
            <Text variant="caption" color="muted">
              warning
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue value={32} unit="%" color="error" />
            <Text variant="caption" color="muted">
              error
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue value={250} unit="MRR" color="brand" />
            <Text variant="caption" color="muted">
              brand
            </Text>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. Trend variants (up / down / flat)
        </Heading>
        <div className={styles.row}>
          <div className={styles.cell}>
            <KpiValue
              value={1250}
              unit="PLN"
              trend={{ direction: 'up', label: '+12%' }}
            />
            <Text variant="caption" color="muted">
              up
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue
              value={1250}
              unit="PLN"
              trend={{ direction: 'down', label: '-8%' }}
            />
            <Text variant="caption" color="muted">
              down
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue
              value={1250}
              unit="PLN"
              trend={{ direction: 'flat', label: '0%' }}
            />
            <Text variant="caption" color="muted">
              flat
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue
              value={1250}
              unit="PLN"
              trend={{ direction: 'up' }}
            />
            <Text variant="caption" color="muted">
              up (no label)
            </Text>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. Edge cases (string fallback, no unit, no animation)
        </Heading>
        <div className={styles.row}>
          <div className={styles.cell}>
            <KpiValue value="—" unit="brak danych" />
            <Text variant="caption" color="muted">
              string fallback
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue value="N/A" unit="—" color="warning" />
            <Text variant="caption" color="muted">
              N/A with warning color
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue value={42} />
            <Text variant="caption" color="muted">
              no unit
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue value={42} unit="konwersji" />
            <Text variant="caption" color="muted">
              static (Server Component)
            </Text>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          6. Animated count-up (refresh page to replay)
        </Heading>
        <div className={styles.row}>
          <div className={styles.cell}>
            <KpiValueAnimated value={12500} unit="PLN" duration={2000} />
            <Text variant="caption" color="muted">
              integer 12,500 (KpiValueAnimated)
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValueAnimated value={4.7} unit="/5" decimals={1} />
            <Text variant="caption" color="muted">
              decimal 4.7 (KpiValueAnimated)
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValueAnimated value={250} unit="$" locale="en-US" />
            <Text variant="caption" color="muted">
              en-US locale (KpiValueAnimated)
            </Text>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          7. Semantic wrapping — compose externally
        </Heading>
        <Text variant="small" color="secondary">
          KpiValue intentionally has no asChild Slot (it owns its inner layout). For
          semantic wrapping, wrap externally:
        </Text>
        <div className={styles.row}>
          <article aria-label="Service uptime">
            <KpiValue
              value={98}
              unit="%"
              color="success"
              trend={{ direction: 'up', label: '+2pp' }}
            />
          </article>
        </div>
      </section>
    </main>
  );
}
