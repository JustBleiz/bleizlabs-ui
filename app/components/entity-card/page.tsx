import Link from 'next/link';
import { EntityCard } from '@/components/presets/EntityCard';
import { Heading } from '@/components/typography/Heading';
import { Inline } from '@/components/layout/Inline';
import { KpiValue } from '@/components/display/KpiValue';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

function PlaceholderIcon({ d }: { d: string }) {
  return (
    <svg
      width="18"
      height="18"
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

function MetaIcon({ d }: { d: string }) {
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

const ICON_ROBOT =
  'M12 2v4M5 12h14M7 17h10M9 7h6a3 3 0 013 3v6a3 3 0 01-3 3H9a3 3 0 01-3-3v-6a3 3 0 013-3z';
const ICON_BRIEFCASE =
  'M20 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16';
const ICON_CHART = 'M3 3v18h18M7 14l4-4 4 4 5-5';
const ICON_TICKET =
  'M3 9a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4V9zM13 5v14';
const ICON_CLOCK = 'M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z';
const ICON_USER =
  'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z';

export default function EntityCardPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          EntityCard
        </Heading>
        <p className={styles.intro}>
          Universal entity grid-item preset. Composes Card + Heading + Text +
          Inline + Stack + Badge under one structured-prop API (no 13-slot
          compound). Two density modes, optional accent strip (left or top
          edge), optional body slot. Renders as
          <code> &lt;a&gt;</code> (via Card <code>asChild</code>) when{' '}
          <code>href</code> is set; otherwise <code>&lt;div&gt;</code>.
          Server-safe.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Compact density grid (Panel services list pattern)
        </Heading>
        <Text variant="small" color="secondary">
          <code>density=&quot;compact&quot;</code> → Card padding 4 / radius
          md / gap 2 / heading md.
        </Text>
        <div className={styles.grid}>
          <EntityCard
            title="Chatbot obsługi sklepu"
            href="/panel/services/chatbot-sklep"
            icon={<PlaceholderIcon d={ICON_ROBOT} />}
            description="Voicebot 24/7 z eskalacją do agenta."
            badges={[{ label: 'Aktywna', color: 'success' }]}
            metaItems={[
              {
                icon: <MetaIcon d={ICON_CLOCK} />,
                label: 'Aktualizacja',
                value: '2h temu',
              },
            ]}
            accentPosition="left"
            accentColor="var(--color-success)"
            density="compact"
          />
          <EntityCard
            title="Migracja sklepu Allegro"
            href="/panel/projects/allegro-mig"
            icon={<PlaceholderIcon d={ICON_BRIEFCASE} />}
            description="ETA: 2026-06-15"
            badges={[{ label: 'W trakcie', color: 'info' }]}
            accentPosition="left"
            accentColor="var(--color-info)"
            density="compact"
          />
          <EntityCard
            title="Eskalacja: zwroty Q4"
            href="/panel/tickets/T-2034"
            icon={<PlaceholderIcon d={ICON_TICKET} />}
            description="Wysoki priorytet — odpowiedź w ciągu 4h."
            badges={[{ label: 'Pilne', color: 'error' }]}
            accentPosition="left"
            accentColor="var(--color-error)"
            density="compact"
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Comfortable density (default) — top accent + body slot
        </Heading>
        <Text variant="small" color="secondary">
          <code>density=&quot;comfortable&quot;</code> → Card padding 5 /
          radius lg / gap 3 / heading lg. Top accent strip + custom body
          slot (KpiValue row).
        </Text>
        <div className={styles.grid}>
          <EntityCard
            title="Migracja sklepu Allegro"
            href="/panel/projects/allegro-mig"
            description="3 z 4 etapów ukończone."
            accentPosition="top"
            accentColor="var(--color-brand)"
            metaItems={[
              {
                icon: <MetaIcon d={ICON_USER} />,
                label: 'PM',
                value: 'Anna K.',
              },
              {
                icon: <MetaIcon d={ICON_CLOCK} />,
                label: 'ETA',
                value: '2026-06-15',
              },
            ]}
            body={
              <Inline gap={4}>
                <KpiValue value={75} unit="%" size="md" />
              </Inline>
            }
          />
          <EntityCard
            title="Sklep online — wdrożenie"
            href="/panel/projects/sklep-online"
            description="Faza testów akceptacyjnych."
            accentPosition="top"
            accentColor="var(--color-success)"
            body={
              <Inline gap={4}>
                <KpiValue value={92} unit="%" size="md" color="success" />
              </Inline>
            }
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. No accent — minimal grid item
        </Heading>
        <div className={styles.grid}>
          <EntityCard
            title="Twoje konto"
            href="/panel/account"
            description="Profil, hasło, plan subskrypcji."
            density="compact"
          />
          <EntityCard
            title="Powiadomienia"
            href="/panel/notifications"
            description="Email, push, SMS."
            density="compact"
          />
          <EntityCard
            title="Integracje"
            href="/panel/integrations"
            description="Slack, Linear, GitHub."
            density="compact"
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. Outer Link wrapper (client-side routing)
        </Heading>
        <Text variant="small" color="secondary">
          When omitting <code>href</code> prop and wrapping w outer
          <code> &lt;Link&gt; </code>, Next.js handles client-side routing
          + prefetch. Card renders as <code>&lt;div&gt;</code>; Link wraps
          it as <code>&lt;a&gt;</code>.
        </Text>
        <div className={styles.grid}>
          <Link
            href="/panel/projects/allegro-mig"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <EntityCard
              title="Migracja sklepu Allegro (Link wrapper)"
              description="Client-side nav, with prefetch."
              accentPosition="top"
              accentColor="var(--color-brand)"
              hoverable
            />
          </Link>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. No href, no link — purely static info card
        </Heading>
        <div className={styles.grid}>
          <EntityCard
            title="Statystyki Q2"
            icon={<PlaceholderIcon d={ICON_CHART} />}
            description="Dashboard widget — nieklikalny."
            density="compact"
            metaItems={[
              {
                icon: <MetaIcon d={ICON_CLOCK} />,
                label: 'Odśwież co',
                value: '5 min',
              },
            ]}
            body={
              <Inline gap={4}>
                <KpiValue value={42} unit="%" size="md" />
                <KpiValue value={1820} unit="szt." size="md" />
              </Inline>
            }
          />
        </div>
      </section>
    </main>
  );
}
