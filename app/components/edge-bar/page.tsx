import Link from 'next/link';
import { EdgeBar } from '@/components/display/EdgeBar';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function EdgeBarPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          EdgeBar
        </Heading>
        <p className={styles.intro}>
          Absolute-positioned decorative stripe along one edge of a positioned
          parent. Display atom — server-safe, decorative-by-default
          (<code>aria-hidden=&quot;true&quot;</code>). Reuses Badge&apos;s
          6-color palette. <strong>Parent must set <code>position:
          relative</code></strong> for anchoring to work.
        </p>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          1. Minimal — top edge, default color, default thickness
        </Heading>
        <p className={styles.sectionDescription}>
          Bare minimum. Just <code>&lt;EdgeBar /&gt;</code> on a positioned
          parent. Defaults: <code>position=&quot;top&quot;</code>,{' '}
          <code>color=&quot;default&quot;</code>,{' '}
          <code>thickness=&quot;md&quot;</code>.
        </p>
        <div className={styles.demoCard}>
          <EdgeBar />
          <p className={styles.cardLabel}>&lt;EdgeBar /&gt;</p>
          <Text variant="body" color="secondary" className={styles.bodyText}>
            Card body content. Notice the thin neutral stripe along the top
            edge — that&apos;s the EdgeBar.
          </Text>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          2. All 4 positions (top / bottom / left / right)
        </Heading>
        <p className={styles.sectionDescription}>
          Each position anchors to one edge of the positioned parent and
          spans the perpendicular axis fully.
        </p>
        <div className={styles.cardRow}>
          <div className={styles.demoCard}>
            <EdgeBar position="top" color="brand" />
            <p className={styles.cardLabel}>position=&quot;top&quot;</p>
          </div>
          <div className={styles.demoCard}>
            <EdgeBar position="bottom" color="brand" />
            <p className={styles.cardLabel}>position=&quot;bottom&quot;</p>
          </div>
          <div className={styles.demoCard}>
            <EdgeBar position="left" color="brand" />
            <p className={styles.cardLabel}>position=&quot;left&quot;</p>
          </div>
          <div className={styles.demoCard}>
            <EdgeBar position="right" color="brand" />
            <p className={styles.cardLabel}>position=&quot;right&quot;</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          3. All 6 colors (top position)
        </Heading>
        <p className={styles.sectionDescription}>
          Reuses <code>BadgeColor</code> palette: default / brand / success /
          warning / error / info. Color alone never conveys meaning — pair
          with adjacent text or icon.
        </p>
        <div className={styles.cardRow}>
          <div className={styles.demoCard}>
            <EdgeBar color="default" />
            <p className={styles.cardLabel}>default</p>
          </div>
          <div className={styles.demoCard}>
            <EdgeBar color="brand" />
            <p className={styles.cardLabel}>brand</p>
          </div>
          <div className={styles.demoCard}>
            <EdgeBar color="success" />
            <p className={styles.cardLabel}>success</p>
          </div>
          <div className={styles.demoCard}>
            <EdgeBar color="warning" />
            <p className={styles.cardLabel}>warning</p>
          </div>
          <div className={styles.demoCard}>
            <EdgeBar color="error" />
            <p className={styles.cardLabel}>error</p>
          </div>
          <div className={styles.demoCard}>
            <EdgeBar color="info" />
            <p className={styles.cardLabel}>info</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          4. Thickness — sm / md / lg (2 / 3 / 4 px)
        </Heading>
        <p className={styles.sectionDescription}>
          Component-internal decorator dimensions outside the 4px space scale
          (raw-px exemption for fine decorator strokes).
        </p>
        <div className={styles.cardRow}>
          <div className={styles.demoCard}>
            <EdgeBar color="brand" thickness="sm" />
            <p className={styles.cardLabel}>sm = 2px</p>
          </div>
          <div className={styles.demoCard}>
            <EdgeBar color="brand" thickness="md" />
            <p className={styles.cardLabel}>md = 3px (default)</p>
          </div>
          <div className={styles.demoCard}>
            <EdgeBar color="brand" thickness="lg" />
            <p className={styles.cardLabel}>lg = 4px</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          5. Pulsing — opacity cycle for alert / live indicators
        </Heading>
        <p className={styles.sectionDescription}>
          <code>pulse</code> runs an infinite 2s opacity cycle.{' '}
          <code>prefers-reduced-motion: reduce</code> disables the animation
          (instant static state).
        </p>
        <div className={styles.cardRow}>
          <div className={styles.demoCard}>
            <EdgeBar color="success" pulse />
            <p className={styles.cardLabel}>success + pulse</p>
          </div>
          <div className={styles.demoCard}>
            <EdgeBar color="warning" pulse />
            <p className={styles.cardLabel}>warning + pulse</p>
          </div>
          <div className={styles.demoCard}>
            <EdgeBar color="error" pulse thickness="lg" />
            <p className={styles.cardLabel}>error + pulse + lg</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          6. Top-edge accent on Card
        </Heading>
        <p className={styles.sectionDescription}>
          Common card-status pattern. EdgeBar replaces ad-hoc raw{' '}
          <code>&lt;span className=&quot;edge&quot;&gt;</code> markup with a
          structured atom.
        </p>
        <div className={styles.demoCard}>
          <EdgeBar position="top" color="success" thickness="lg" />
          <Heading level={3} size="md">
            Sample project — operational
          </Heading>
          <Text variant="body" color="secondary" className={styles.bodyText}>
            Status indicator: success edge accent at the top of the card.
            Color reinforces the textual status, never replaces it.
          </Text>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          7. Left-edge accent on row items
        </Heading>
        <p className={styles.sectionDescription}>
          Selected / status row indicator. Replaces ad-hoc raw{' '}
          <code>&lt;span className=&quot;rowLeftEdge&quot;&gt;</code> markup
          across list rows.
        </p>
        <div className={styles.rowList}>
          <div className={styles.demoRow}>
            <EdgeBar position="left" color="brand" thickness="lg" />
            <p className={styles.rowTitle}>Selected: Hosting</p>
            <p className={styles.rowMeta}>brand left-edge — selected state</p>
          </div>
          <div className={styles.demoRow}>
            <EdgeBar position="left" color="success" />
            <p className={styles.rowTitle}>Operational: Database</p>
            <p className={styles.rowMeta}>success left-edge — healthy</p>
          </div>
          <div className={styles.demoRow}>
            <EdgeBar position="left" color="warning" />
            <p className={styles.rowTitle}>Degraded: Storage (76% capacity)</p>
            <p className={styles.rowMeta}>warning left-edge — needs attention</p>
          </div>
          <div className={styles.demoRow}>
            <EdgeBar position="left" color="error" pulse />
            <p className={styles.rowTitle}>Outage: Edge CDN</p>
            <p className={styles.rowMeta}>
              error left-edge + pulse — active incident
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
