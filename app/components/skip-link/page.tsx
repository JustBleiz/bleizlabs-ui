import Link from 'next/link';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { SkipLink } from '@/components/interactive/SkipLink';
import styles from './page.module.scss';

export default function SkipLinkPlaygroundPage() {
  return (
    <>
      {/* The component under test — FIRST focusable element on the page, the
          position it is designed for. Press Tab once to reveal it. */}
      <SkipLink href="#skip-link-demo-main" data-testid="skip-link-default" />

      <main id="skip-link-demo-main" tabIndex={-1} className={styles.main}>
        <header className={styles.header}>
          <Link href="/" className={styles.back}>
            ← back
          </Link>
          <Heading level={1} size="4xl">
            SkipLink
          </Heading>
          <p className={styles.intro}>
            WCAG 2.4.1 Bypass Blocks anchor. Visually hidden (sr-only clip) until keyboard-focused,
            then revealed as a fixed pill at the top-left of the viewport, above every layer. Press{' '}
            <kbd>Tab</kbd> from the address bar to reveal the one mounted at the top of this page;
            press <kbd>Enter</kbd> to jump to this main landmark.
          </p>
        </header>

        <section className={styles.section}>
          <Heading level={2} size="lg" className={styles.sectionTitle}>
            1. Default — first focusable element
          </Heading>
          <div className={styles.sectionBody}>
            <Text>
              <code>&lt;SkipLink /&gt;</code> renders an{' '}
              <code>&lt;a href=&quot;#main&quot;&gt;</code> with the default label &ldquo;Skip to
              main content&rdquo;. This demo page mounts it before all content with{' '}
              <code>href=&quot;#skip-link-demo-main&quot;</code> — Tab once and it appears top-left.
            </Text>
          </div>
        </section>

        <section className={styles.section}>
          <Heading level={2} size="lg" className={styles.sectionTitle}>
            2. Custom target + localized label
          </Heading>
          <div className={styles.sectionBody}>
            <SkipLink href="#skip-link-demo-target" data-testid="skip-link-custom">
              Przejdź do treści
            </SkipLink>
            <Text>
              The label is the accessible name — pass a localized string (the library ships no i18n
              layer). This instance targets the box below; it is inside the page flow, so you reach
              it with Tab after the links above.
            </Text>
            <div id="skip-link-demo-target" tabIndex={-1} className={styles.target}>
              <Text>
                Landing zone — <code>id=&quot;skip-link-demo-target&quot;</code> with{' '}
                <code>tabIndex=&#123;-1&#125;</code>.
              </Text>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <Heading level={2} size="lg" className={styles.sectionTitle}>
            3. Target wiring (consumer responsibility)
          </Heading>
          <div className={styles.sectionBody}>
            <Text>
              The target must exist and should carry <code>tabIndex=&#123;-1&#125;</code> when it is
              not natively focusable — browsers then move focus (not just scroll) on activation:
            </Text>
            <pre className={styles.code}>
              {`<body>
  <SkipLink />
  <SiteHeader />
  <main id="main" tabIndex={-1}>{children}</main>
</body>`}
            </pre>
          </div>
        </section>
      </main>
    </>
  );
}
