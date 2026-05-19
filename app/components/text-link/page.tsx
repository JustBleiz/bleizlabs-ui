import Link from 'next/link';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { TextLink } from '@/components/interactive/TextLink';
import styles from './page.module.scss';

export default function TextLinkPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          TextLink
        </Heading>
        <Text variant="lead" color="secondary">
          Inline atelier link atom. Animated arrow suffix + underline-on-hover. Framework-agnostic;
          `asChild` projects styling onto consumer&apos;s Link component (e.g. next/link).
        </Text>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Default — anchor with arrow
        </Heading>
        <div className={styles.frame}>
          <span className={styles.label}>href=&quot;/foo&quot;</span>
          <TextLink href="/foo" data-testid="tl-default">
            Sprawdź rozwiązania
          </TextLink>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. hideArrow — anchor with text only
        </Heading>
        <div className={styles.frame}>
          <span className={styles.label}>href=&quot;/foo&quot; hideArrow</span>
          <TextLink href="/foo" hideArrow data-testid="tl-hide-arrow">
            Sprawdź rozwiązania
          </TextLink>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. asChild — Next Link with arrow
        </Heading>
        <div className={styles.frame}>
          <span className={styles.label}>asChild + next/link (regression test)</span>
          <TextLink asChild data-testid="tl-aschild">
            <Link href="/foo">Sprawdź rozwiązania</Link>
          </TextLink>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. asChild + hideArrow — Next Link, no arrow
        </Heading>
        <div className={styles.frame}>
          <span className={styles.label}>asChild + hideArrow + next/link</span>
          <TextLink asChild hideArrow data-testid="tl-aschild-hidearrow">
            <Link href="/foo">Sprawdź rozwiązania</Link>
          </TextLink>
        </div>
      </section>
    </main>
  );
}
