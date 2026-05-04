import Link from 'next/link';
import { Button } from '@/components/interactive/Button';
import { Heading } from '@/components/typography/Heading';
import { PageHeader } from '@/components/molecules/PageHeader';
import styles from './page.module.scss';

export default function PageHeaderPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          PageHeader
        </Heading>
        <p className={styles.intro}>
          Page-top title section molecule (M7). Composes Heading + Text +
          Badge atoms with optional accent span (char-index slicing on{' '}
          <code>title</code>), subtitle, status badge strip, and right-aligned
          actions slot (v0.7.0). Promoted from{' '}
          <code>bleizlabs-website</code> panel pages — sister to{' '}
          <code>SectionHeader</code> (section-level) and{' '}
          <code>DataRow</code> (row-level).
        </p>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          1. Plain title
        </Heading>
        <div className={styles.sectionBody}>
          <PageHeader title="Profil" />
          <p className={styles.bodyText}>
            Bare-minimum usage — single Heading. Default <code>level=2</code>{' '}
            (use <code>level={'{1}'}</code> for the page-landmark heading).
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          2. Title with accent fragment
        </Heading>
        <div className={styles.sectionBody}>
          <PageHeader
            level={1}
            title="Moje usługi"
            accentStart={5}
            accentEnd={11}
          />
          <p className={styles.bodyText}>
            <code>accentStart</code> + <code>accentEnd</code> render a colored
            <code>{' <span>'}</code> fragment of the title. Char-index slicing
            uses half-open interval <code>[start, end)</code> matching{' '}
            <code>String.slice</code>. Out-of-bounds or inverted indices
            silently fall back to plain title — defensive, never throws.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          3. Custom accent color
        </Heading>
        <div className={styles.sectionBody}>
          <PageHeader
            level={1}
            title="Tickets — pilne"
            accentStart={10}
            accentEnd={16}
            accentColor="var(--color-warning-strong)"
          />
          <p className={styles.bodyText}>
            <code>accentColor</code> accepts any CSS color (variable or
            literal). Forwarded to a CSS custom property channel{' '}
            <code>--page-header-accent</code> on the span — keeps the token
            pipeline + theming + forced-colors remap intact.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          4. With subtitle
        </Heading>
        <div className={styles.sectionBody}>
          <PageHeader
            level={1}
            title="Wykonane projekty"
            accentStart={10}
            accentEnd={17}
            subtitle="Przegląd ukończonych zleceń wraz z metrykami końcowej rentowności."
          />
          <p className={styles.bodyText}>
            <code>subtitle</code> renders below the title via Text atom{' '}
            <code>variant=&quot;lead&quot;</code>. Accepts{' '}
            <code>ReactNode</code> so callers can embed inline links or
            emphasis.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          5. With status badges
        </Heading>
        <div className={styles.sectionBody}>
          <PageHeader
            level={1}
            title="Zgłoszenia"
            subtitle="Tickety wsparcia + incydenty produkcyjne"
            badges={[
              { label: '3 nowe', color: 'info' },
              { label: '1 krytyczne', color: 'error' },
              { label: 'SLA OK', color: 'success', pill: true },
            ]}
          />
          <p className={styles.bodyText}>
            <code>badges</code> is a plain object array (PageHeader owns the
            Badge instantiation) so callers don&apos;t need to import Badge.
            Each entry: <code>{`{ label, color?, pill? }`}</code>.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          6. With actions slot (v0.7.0)
        </Heading>
        <div className={styles.sectionBody}>
          <PageHeader
            level={1}
            title="Tickety"
            subtitle="Zgłoszenia i wsparcie"
            actions={
              <>
                <Button variant="ghost" size="sm">
                  Filtruj
                </Button>
                <Button variant="primary" size="sm">
                  Nowy ticket
                </Button>
              </>
            }
          />
          <p className={styles.bodyText}>
            <code>actions</code> slot renders right of the title at desktop
            widths, wraps below on narrow viewports. Consumer composes the
            action elements (Button order / styling stays at consumer site —
            lib stays universal).
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          7. Full — all slots populated
        </Heading>
        <div className={styles.sectionBody}>
          <PageHeader
            level={1}
            title="Marketplace integratorów"
            accentStart={12}
            accentEnd={24}
            accentColor="var(--color-brand-strong)"
            subtitle="Katalog partnerów technologicznych z certyfikacją BleizLabs"
            badges={[
              { label: '124 integratorów', color: 'default' },
              { label: 'Recently updated', color: 'info', pill: true },
            ]}
            actions={
              <>
                <Button variant="secondary" size="sm">
                  Eksportuj listę
                </Button>
                <Button variant="primary" size="sm">
                  Zgłoś integrację
                </Button>
              </>
            }
          />
          <p className={styles.bodyText}>
            Title accent + subtitle + badges + actions all populated. Layout
            self-organises — desktop puts actions right of title row; narrow
            viewports stack title row → actions → subtitle → badges.
          </p>
        </div>
      </section>
    </main>
  );
}
