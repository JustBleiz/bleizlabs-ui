import Link from 'next/link';
import { KpiValue, KpiValueAnimated } from '@/components/display/KpiValue';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

/**
 * Percent display playground — formerly the PercentValue page; v0.7.0+
 * canonical API is `<KpiValue unit="%">` (PercentValue merged into KpiValue
 * 2026-05-04 per `bleizlabs/feedback_audit_before_create_or_keep`). This
 * page demonstrates percent semantics on the unified atom.
 */
export default function PercentDisplayPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          KpiValue (percent mode)
        </Heading>
        <p className={styles.intro}>
          Universal large-percentage display via the unified KpiValue atom.
          Pass <code>unit=&quot;%&quot;</code> for tight inline percent rendering,
          add <code>color=&quot;auto&quot;</code> + <code>thresholds</code> +
          <code>inverse</code> for tone-derived color. PercentValue merged
          into KpiValue v0.7.0; legacy alias path retained through v0.7.x
          (deprecated).
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Driving consumer (EscalationRateGauge)
        </Heading>
        <Text variant="small" color="secondary">
          inverse=true (lower escalation = better), thresholds success≤15%
          warning≤30%, with industry benchmark caption. Uses animated
          wrapper for entrance count-up.
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <KpiValueAnimated
              value={8}
              unit="%"
              color="auto"
              inverse
              thresholds={{ success: 15, warning: 30 }}
              benchmark="industry avg 20%"
            />
            <Text variant="caption" color="muted">
              8% — success (low)
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValueAnimated
              value={22}
              unit="%"
              color="auto"
              inverse
              thresholds={{ success: 15, warning: 30 }}
              benchmark="industry avg 20%"
            />
            <Text variant="caption" color="muted">
              22% — warning (mid)
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValueAnimated
              value={45}
              unit="%"
              color="auto"
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
            <KpiValue value={42} unit="%" size="md" />
            <Text variant="caption" color="muted">
              md
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue value={42} unit="%" size="lg" />
            <Text variant="caption" color="muted">
              lg (default)
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue value={42} unit="%" size="xl" />
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
          color=&quot;auto&quot; + thresholds=&#123;success: 80, warning: 50&#125;
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <KpiValue
              value={95}
              unit="%"
              color="auto"
              thresholds={{ success: 80, warning: 50 }}
              benchmark="target ≥80%"
            />
            <Text variant="caption" color="muted">
              95% — success
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue
              value={65}
              unit="%"
              color="auto"
              thresholds={{ success: 80, warning: 50 }}
              benchmark="target ≥80%"
            />
            <Text variant="caption" color="muted">
              65% — warning
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue
              value={35}
              unit="%"
              color="auto"
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
          inverse + thresholds=&#123;success: 15, warning: 30&#125;
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <KpiValue
              value={8}
              unit="%"
              color="auto"
              inverse
              thresholds={{ success: 15, warning: 30 }}
              benchmark="target ≤15%"
            />
            <Text variant="caption" color="muted">
              8% — success
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue
              value={22}
              unit="%"
              color="auto"
              inverse
              thresholds={{ success: 15, warning: 30 }}
              benchmark="target ≤15%"
            />
            <Text variant="caption" color="muted">
              22% — warning
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue
              value={45}
              unit="%"
              color="auto"
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
          5. Explicit color overrides
        </Heading>
        <div className={styles.row}>
          <div className={styles.cell}>
            <KpiValue value={50} unit="%" color="primary" />
            <Text variant="caption" color="muted">
              primary
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue value={50} unit="%" color="success" />
            <Text variant="caption" color="muted">
              success
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue value={50} unit="%" color="warning" />
            <Text variant="caption" color="muted">
              warning
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue value={50} unit="%" color="error" />
            <Text variant="caption" color="muted">
              error
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue value={50} unit="%" color="brand" />
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
            <KpiValue value={42.5} unit="%" decimals={1} />
            <Text variant="caption" color="muted">
              decimals=1
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValueAnimated value={99.95} unit="%" decimals={2} />
            <Text variant="caption" color="muted">
              decimals=2 + animated
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValue value={42} unit="%" />
            <Text variant="caption" color="muted">
              no thresholds = primary
            </Text>
          </div>
          <div className={styles.cell}>
            <KpiValueAnimated value={50} unit="%" duration={2000} size="xl" />
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
          KpiValue intentionally has no asChild (it owns its inner layout).
          For semantic wrapping, wrap externally.
        </Text>
        <div className={styles.row}>
          <article aria-label="Service uptime">
            <KpiValue
              value={98}
              unit="%"
              color="auto"
              thresholds={{ success: 95, warning: 85 }}
              benchmark="SLA target 99.5%"
            />
          </article>
        </div>
      </section>
    </main>
  );
}
