import Link from 'next/link';
import { MetricTile } from '@/components/molecules/MetricTile';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

function PlaceholderIcon({ d }: { d: string }) {
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
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const ICON_USER =
  'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z';
const ICON_CLOCK = 'M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z';
const ICON_BRIEFCASE =
  'M20 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16';
const ICON_CHART =
  'M3 3v18h18M7 14l4-4 4 4 5-5';
const ICON_TICKET =
  'M3 9a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4V9zM13 5v14';

export default function MetricTilePlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          MetricTile
        </Heading>
        <p className={styles.intro}>
          Universal compact metric tile (icon? + label + value [+ description]).
          Frameless by design — consumer wraps in <code>&lt;Card&gt;</code>{' '}
          when framed display is needed. Subsumes 4 project-local name-drift
          cases (DetailMetric / SummaryMetric / CardMetric / MetaItem).
          Server-safe; composes Inline + Stack + Text atoms with zero raw
          HTML primitives outside the root <code>&lt;div&gt;</code> +
          icon-slot <code>&lt;span&gt;</code>.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Basic — label + value
        </Heading>
        <Text variant="small" color="secondary">
          Stacked layout: caption-tier label above body-strong value
          (with optional icon flanking value + optional description below).
          Suitable for card-grid tiles where each metric gets equal real-estate.
          Icon optional.
        </Text>
        <div className={styles.metaStrip}>
          <MetricTile label="Status" value="Aktywna" />
          <MetricTile
            label="Account manager"
            value="Anna Kowalska"
            icon={<PlaceholderIcon d={ICON_USER} />}
          />
          <MetricTile
            label="Ostatnia aktualizacja"
            value="2 godz. temu"
            icon={<PlaceholderIcon d={ICON_CLOCK} />}
          />
          <MetricTile
            label="Projekt"
            value={<Link href="#">Sklep online</Link>}
            icon={<PlaceholderIcon d={ICON_BRIEFCASE} />}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. With description (custom typography via Text wrapper)
        </Heading>
        <Text variant="small" color="secondary">
          Stack layout: uppercase caption label above body-strong value
          (with optional icon flanking value + description below).
          Suitable for card-grid tiles where each metric gets equal
          real-estate.
        </Text>
        <div className={styles.cardGrid}>
          <div className={styles.cardFrame}>
            <MetricTile
              label="Następna faktura"
              value="1 500 PLN"
              description="Termin: 15 maja"
            />
          </div>
          <div className={styles.cardFrame}>
            <MetricTile
              label="Otwarte zgłoszenia"
              value="12"
              description="ostatnie 7 dni"
              icon={<PlaceholderIcon d={ICON_TICKET} />}
            />
          </div>
          <div className={styles.cardFrame}>
            <MetricTile
              label="Konwersje"
              value="42"
              description="+12% vs poprzedni okres"
              icon={<PlaceholderIcon d={ICON_CHART} />}
            />
          </div>
          <div className={styles.cardFrame}>
            <MetricTile
              label="Account manager"
              value="Anna Kowalska"
              icon={<PlaceholderIcon d={ICON_USER} />}
            />
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Tone variants — value emphasis signal
        </Heading>
        <Text variant="small" color="secondary">
          Tone affects ONLY the value text color (label and description
          stay neutral). `brand` uses `--color-brand-strong` for AA contrast.
        </Text>
        <div className={styles.toneRow}>
          <div className={styles.cardFrame}>
            <MetricTile
              label="Default"
              value="42"
              description="primary text color"
            />
          </div>
          <div className={styles.cardFrame}>
            <MetricTile
              label="Success"
              value="98.5%"
              tone="success"
              description="dostępność, satysfakcja"
            />
          </div>
          <div className={styles.cardFrame}>
            <MetricTile
              label="Warning"
              value="22%"
              tone="warning"
              description="eskalacje, opóźnienia"
            />
          </div>
          <div className={styles.cardFrame}>
            <MetricTile
              label="Error"
              value="3"
              tone="error"
              description="overdue invoices"
            />
          </div>
          <div className={styles.cardFrame}>
            <MetricTile
              label="Brand"
              value="MRR"
              tone="brand"
              description="brand emphasis"
            />
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. With and without icon
        </Heading>
        <Text variant="small" color="secondary">
          Icon slot is optional and decorative (slot wrapper applies
          aria-hidden automatically). Icon flanks value in the inline row.
        </Text>
        <div className={styles.cardGrid}>
          <div className={styles.cardFrame}>
            <MetricTile
              label="Bez ikony"
              value="—"
              description="MetricTile without icon prop"
            />
          </div>
          <div className={styles.cardFrame}>
            <MetricTile
              label="Z ikoną"
              value="42"
              icon={<PlaceholderIcon d={ICON_CHART} />}
              description="MetricTile with icon prop"
            />
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. Edge cases — value as ReactNode
        </Heading>
        <Text variant="small" color="secondary">
          Value accepts any ReactNode — plain string, formatted number,
          link, badge, or composed inline node. Lib does NOT format
          numbers (consumer pre-formats; keeps molecule format-agnostic).
        </Text>
        <div className={styles.cardGrid}>
          <div className={styles.cardFrame}>
            <MetricTile
              label="Composed value"
              value={
                <>
                  1 500{' '}
                  <Text variant="small" color="secondary" asChild>
                    <span>PLN</span>
                  </Text>
                </>
              }
            />
          </div>
          <div className={styles.cardFrame}>
            <MetricTile
              label="Link value"
              value={<Link href="#">Sklep online</Link>}
              icon={<PlaceholderIcon d={ICON_BRIEFCASE} />}
            />
          </div>
          <div className={styles.cardFrame}>
            <MetricTile
              label="Pre-formatted"
              value="1 234,56 PLN"
              description="consumer-formatted z Intl.NumberFormat"
            />
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          6. With vs without description
        </Heading>
        <Text variant="small" color="secondary">
          Description slot is optional. When omitted, MetricTile renders
          label + value only. When provided, consumer brings own typography
          (or uses default `.description` class styling for plain ReactNode).
        </Text>
        <div className={styles.row}>
          <div className={styles.cell}>
            <Text variant="caption" color="muted">
              without description
            </Text>
            <div className={styles.cardFrame}>
              <MetricTile
                label="Status"
                value="Aktywna"
                icon={<PlaceholderIcon d={ICON_USER} />}
              />
            </div>
          </div>
          <div className={styles.cell}>
            <Text variant="caption" color="muted">
              with description
            </Text>
            <div className={styles.cardFrame}>
              <MetricTile
                label="Status"
                value="Aktywna"
                icon={<PlaceholderIcon d={ICON_USER} />}
                description="active service"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
