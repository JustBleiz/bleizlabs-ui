import Link from 'next/link';
import { PercentValue, PercentValueAnimated } from '@/components/display/PercentValue';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function PercentValuePlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          PercentValue
        </Heading>
        <p className={styles.intro}>
          Universal large-percentage display atom with tone-derived color.
          Symmetric pair with KpiValue (D10). Server Component since v0.7.0;
          animated count-up via sister <code>PercentValueAnimated</code>
          client wrapper. Auto-derives color from{' '}
          <code>thresholds</code> + <code>inverse</code>, or accepts explicit{' '}
          <code>tone</code> override.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Driving consumer (EscalationRateGauge)
        </Heading>
        <Text variant="small" color="secondary">
          Inverse=true (lower escalation = better), thresholds success≤15%
          warning≤30%, with industry benchmark caption.
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <PercentValueAnimated
              value={8}
              inverse
              thresholds={{ success: 15, warning: 30 }}
              benchmark="industry avg 20%"
            />
            <Text variant="caption" color="muted">
              8% — success (low)
            </Text>
          </div>
          <div className={styles.cell}>
            <PercentValueAnimated
              value={22}
              inverse
              thresholds={{ success: 15, warning: 30 }}
              benchmark="industry avg 20%"
            />
            <Text variant="caption" color="muted">
              22% — warning (mid)
            </Text>
          </div>
          <div className={styles.cell}>
            <PercentValueAnimated
              value={45}
              inverse
              thresholds={{ success: 15, warning: 30 }}
              benchmark="industry avg 20%"
            />
            <Text variant="caption" color="muted">
              45% — error (high)
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
            <PercentValue value={42} size="md" />
            <Text variant="caption" color="muted">
              md
            </Text>
          </div>
          <div className={styles.cell}>
            <PercentValue value={42} size="lg" />
            <Text variant="caption" color="muted">
              lg (default)
            </Text>
          </div>
          <div className={styles.cell}>
            <PercentValue value={42} size="xl" />
            <Text variant="caption" color="muted">
              xl
            </Text>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Auto tone — non-inverted (higher = better, e.g. uptime, satisfaction)
        </Heading>
        <Text variant="small" color="secondary">
          thresholds={`{success: 80, warning: 50}`}
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <PercentValue
              value={95}
              thresholds={{ success: 80, warning: 50 }}
              benchmark="target ≥80%"
            />
            <Text variant="caption" color="muted">
              95% — success
            </Text>
          </div>
          <div className={styles.cell}>
            <PercentValue
              value={65}
              thresholds={{ success: 80, warning: 50 }}
              benchmark="target ≥80%"
            />
            <Text variant="caption" color="muted">
              65% — warning
            </Text>
          </div>
          <div className={styles.cell}>
            <PercentValue
              value={35}
              thresholds={{ success: 80, warning: 50 }}
              benchmark="target ≥80%"
            />
            <Text variant="caption" color="muted">
              35% — error
            </Text>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. Auto tone — inverted (lower = better, e.g. error rate, escalation)
        </Heading>
        <Text variant="small" color="secondary">
          inverse + thresholds={`{success: 15, warning: 30}`}
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <PercentValue
              value={8}
              inverse
              thresholds={{ success: 15, warning: 30 }}
              benchmark="target ≤15%"
            />
            <Text variant="caption" color="muted">
              8% — success
            </Text>
          </div>
          <div className={styles.cell}>
            <PercentValue
              value={22}
              inverse
              thresholds={{ success: 15, warning: 30 }}
              benchmark="target ≤15%"
            />
            <Text variant="caption" color="muted">
              22% — warning
            </Text>
          </div>
          <div className={styles.cell}>
            <PercentValue
              value={45}
              inverse
              thresholds={{ success: 15, warning: 30 }}
              benchmark="target ≤15%"
            />
            <Text variant="caption" color="muted">
              45% — error
            </Text>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. Explicit tone overrides
        </Heading>
        <div className={styles.row}>
          <div className={styles.cell}>
            <PercentValue value={50} tone="primary" />
            <Text variant="caption" color="muted">
              primary
            </Text>
          </div>
          <div className={styles.cell}>
            <PercentValue value={50} tone="success" />
            <Text variant="caption" color="muted">
              success
            </Text>
          </div>
          <div className={styles.cell}>
            <PercentValue value={50} tone="warning" />
            <Text variant="caption" color="muted">
              warning
            </Text>
          </div>
          <div className={styles.cell}>
            <PercentValue value={50} tone="error" />
            <Text variant="caption" color="muted">
              error
            </Text>
          </div>
          <div className={styles.cell}>
            <PercentValue value={50} tone="brand" />
            <Text variant="caption" color="muted">
              brand
            </Text>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          6. Edge cases (no thresholds, decimals, animated)
        </Heading>
        <div className={styles.row}>
          <div className={styles.cell}>
            <PercentValue value={42.5} decimals={1} />
            <Text variant="caption" color="muted">
              decimals=1
            </Text>
          </div>
          <div className={styles.cell}>
            <PercentValueAnimated value={99.95} decimals={2} />
            <Text variant="caption" color="muted">
              decimals=2 + animated
            </Text>
          </div>
          <div className={styles.cell}>
            <PercentValue value={42} />
            <Text variant="caption" color="muted">
              no thresholds = primary
            </Text>
          </div>
          <div className={styles.cell}>
            <PercentValueAnimated value={50} duration={2000} size="xl" />
            <Text variant="caption" color="muted">
              xl animated 2s
            </Text>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          7. Semantic wrapping — compose externally
        </Heading>
        <Text variant="small" color="secondary">
          PercentValue intentionally has no asChild (it owns its inner layout).
          For semantic wrapping, wrap externally — mirrors KpiValue convention.
        </Text>
        <div className={styles.row}>
          <article aria-label="Service uptime">
            <PercentValue
              value={98}
              thresholds={{ success: 95, warning: 85 }}
              benchmark="SLA target 99.5%"
            />
          </article>
        </div>
      </section>
    </main>
  );
}
