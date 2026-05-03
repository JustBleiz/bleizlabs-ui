import Link from 'next/link';
import { Badge } from '@/components/display/Badge';
import { DetailPageHero } from '@/components/presets/DetailPageHero';
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

const ICON_BRIEFCASE =
  'M20 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16';
const ICON_USER =
  'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z';
const ICON_CLOCK = 'M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z';
const ICON_LINK =
  'M10 13a5 5 0 007 0l4-4a5 5 0 00-7-7l-1 1m-2 2l-4 4a5 5 0 007 7l1-1';

export default function DetailPageHeroPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          DetailPageHero
        </Heading>
        <p className={styles.intro}>
          Universal entity detail page hero shell. Renders semantic{' '}
          <code>&lt;header&gt;</code> landmark with backLink + title + optional
          slots (titleBadges, description, statusIndicators, progression) +
          optional structured meta strip. Sister to IconHeaderCard (CP6).
          Driving consumers (Faza 3): ServiceDetailHero, ProjectDetailHeader,
          TicketDetailHeader.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Driving consumer #1 — ServiceDetailHero
        </Heading>
        <Text variant="small" color="secondary">
          Service slug page hero with PillarChipGroup (faked), type badge,
          status indicator, and 3-item meta strip.
        </Text>
        <div className={styles.demoSurface}>
          <DetailPageHero
            backLink={{ href: '/panel/services', label: 'Wszystkie usługi' }}
            title="Chatbot obsługi sklepu"
            titleBadges={
              <>
                <Badge color="brand" pill label="AI / Voice / Chat" />
                <Badge color="default" label="Voicebot" />
              </>
            }
            description="Inteligentna obsługa zamówień 24/7 z eskalacją do agenta."
            statusIndicators={<Badge color="success" label="Aktywna" dot />}
            metaStrip={[
              {
                icon: <PlaceholderIcon d={ICON_LINK} />,
                label: 'Projekt',
                value: <a href="#">Sklep online</a>,
              },
              {
                icon: <PlaceholderIcon d={ICON_USER} />,
                label: 'Account manager',
                value: 'Anna Kowalska',
              },
              {
                icon: <PlaceholderIcon d={ICON_CLOCK} />,
                label: 'Ostatnia aktualizacja',
                value: '2 godz. temu',
              },
            ]}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Driving consumer #2 — ProjectDetailHeader (with progression slot)
        </Heading>
        <Text variant="small" color="secondary">
          Project slug page hero with type badge, payment + status badges,
          progression placeholder (StageProgress in real consumer), and meta
          strip.
        </Text>
        <div className={styles.demoSurface}>
          <DetailPageHero
            backLink={{ href: '/panel/projects', label: 'Wszystkie projekty' }}
            title="Migracja sklepu na Shopify"
            titleBadges={
              <>
                <Badge color="brand" pill label="Fundamenty" />
                <Badge color="default" label="E-commerce" />
              </>
            }
            description="Pełna migracja sklepu z Magento 2 do Shopify Plus z zachowaniem SEO i historii zamówień."
            statusIndicators={
              <>
                <Badge color="warning" label="Oczekuje płatności" dot />
                <Badge color="success" label="W realizacji" dot />
              </>
            }
            progression={
              <div className={styles.progressionPlaceholder}>
                <Text variant="caption" color="muted">
                  [StageProgress: analiza → implementacja → testy → akceptacja]
                </Text>
              </div>
            }
            metaStrip={[
              {
                icon: <PlaceholderIcon d={ICON_LINK} />,
                label: 'Usługa',
                value: <a href="#">Sklep online</a>,
              },
              {
                icon: <PlaceholderIcon d={ICON_USER} />,
                label: 'Account manager',
                value: 'Marcin Nowak',
              },
              {
                icon: <PlaceholderIcon d={ICON_CLOCK} />,
                label: 'Ostatnia aktualizacja',
                value: 'wczoraj',
              },
            ]}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Driving consumer #3 — TicketDetailHeader
        </Heading>
        <Text variant="small" color="secondary">
          Ticket slug page hero with status + SLA badges, no progression, no
          meta strip (ticket detail uses different sidebar pattern for meta).
        </Text>
        <div className={styles.demoSurface}>
          <DetailPageHero
            backLink={{ href: '/panel/tickets', label: 'Wszystkie zgłoszenia' }}
            title="Zgłoszenie #1234 — Brak dostępu do panelu"
            titleBadges={<Badge color="default" label="Wsparcie" />}
            description="Klient zgłasza brak możliwości logowania od dziś rana."
            statusIndicators={
              <>
                <Badge color="warning" label="W toku" dot />
                <Badge color="error" label="SLA: 1h" dot />
              </>
            }
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. Minimal — title only
        </Heading>
        <div className={styles.demoSurface}>
          <DetailPageHero title="Twoje konto" />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. No back-link (top-level detail)
        </Heading>
        <div className={styles.demoSurface}>
          <DetailPageHero
            title="Profil użytkownika"
            description="Ustawienia profilu i preferencje konta."
            metaStrip={[
              {
                icon: <PlaceholderIcon d={ICON_USER} />,
                label: 'Plan',
                value: 'Enterprise',
              },
              {
                icon: <PlaceholderIcon d={ICON_CLOCK} />,
                label: 'Dołączył',
                value: '12 marca 2024',
              },
            ]}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          6. Custom title node — consumer-owned Heading
        </Heading>
        <Text variant="small" color="secondary">
          When string-default Heading is insufficient (e.g. need accent span,
          different size, or `level=2`), pass ReactNode title.
        </Text>
        <div className={styles.demoSurface}>
          <DetailPageHero
            backLink={{ href: '/panel', label: 'Do panelu' }}
            title={
              <Heading level={1} size="5xl" weight="bold">
                Witaj <span style={{ color: 'var(--color-brand-500)' }}>z powrotem</span>
              </Heading>
            }
            description="Poniżej znajdziesz przegląd ostatniej aktywności."
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          7. Maximal — wszystkie sloty + długi meta strip
        </Heading>
        <div className={styles.demoSurface}>
          <DetailPageHero
            backLink={{ href: '/panel/services', label: 'Usługi' }}
            title="Voicebot premium z analityką"
            titleBadges={
              <>
                <Badge color="brand" pill label="AI / Voice / Chat" />
                <Badge color="info" pill label="Pakiety" />
                <Badge color="default" label="Voicebot Premium" />
              </>
            }
            description="Pełna obsługa głosowa z transkrypcją, analityką sentymentu i eskalacją do agenta. Dostępna 24/7 w 5 językach."
            statusIndicators={
              <>
                <Badge color="success" label="Aktywna" dot />
                <Badge color="success" label="Płatność OK" dot />
                <Badge color="info" label="Wersja 2.4" />
              </>
            }
            progression={
              <div className={styles.progressionPlaceholder}>
                <Text variant="caption" color="muted">
                  [Onboarding: konfig → integracja → testy → DONE]
                </Text>
              </div>
            }
            metaStrip={[
              {
                icon: <PlaceholderIcon d={ICON_LINK} />,
                label: 'Projekt',
                value: <a href="#">Sklep premium</a>,
              },
              {
                icon: <PlaceholderIcon d={ICON_USER} />,
                label: 'Account manager',
                value: 'Anna Kowalska',
              },
              {
                icon: <PlaceholderIcon d={ICON_USER} />,
                label: 'Tech lead',
                value: 'Jan Nowak',
              },
              {
                icon: <PlaceholderIcon d={ICON_CLOCK} />,
                label: 'Ostatnia aktualizacja',
                value: '15 min temu',
              },
              {
                icon: <PlaceholderIcon d={ICON_BRIEFCASE} />,
                label: 'Klient',
                value: 'Acme Sp. z o.o.',
              },
            ]}
          />
        </div>
      </section>
    </main>
  );
}
