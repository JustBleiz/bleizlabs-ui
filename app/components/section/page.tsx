import Link from 'next/link';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import styles from './page.module.scss';

export default function SectionPlaygroundPage() {
  return (
    <main className={styles.main}>
      <Section bg="brand-subtle" py={8}>
        <Container>
          <Link href="/" className={styles.back}>
            ← back
          </Link>
          <h1>Section</h1>
          <p>Full-width semantic band. Background variants, py, fullBleed, tag, asChild.</p>
        </Container>
      </Section>

      <Section py={10}>
        <Container>
          <h2>1. bg variants — edge-to-edge</h2>
        </Container>
      </Section>

      <Section bg="surface" py={6}>
        <Container>
          <span className={styles.label}>bg=&quot;surface&quot;</span>
          <p className={styles.copy}>Default surface fill. Most common page band.</p>
        </Container>
      </Section>

      <Section bg="raised" py={6}>
        <Container>
          <span className={styles.label}>bg=&quot;raised&quot;</span>
          <p className={styles.copy}>
            Slightly elevated surface — visual separation between bands.
          </p>
        </Container>
      </Section>

      <Section bg="brand-subtle" py={6}>
        <Container>
          <span className={styles.label}>bg=&quot;brand-subtle&quot;</span>
          <p className={styles.copy}>
            Brand tint band — call-to-action regions, feature highlights.
          </p>
        </Container>
      </Section>

      <Section bg="transparent" py={6}>
        <Container>
          <span className={styles.label}>bg=&quot;transparent&quot;</span>
          <p className={styles.copy}>No fill — just spacing rhythm.</p>
        </Container>
      </Section>

      <Section py={10}>
        <Container>
          <h2>2. py variants (vertical padding)</h2>
        </Container>
      </Section>

      {([4, 8, 12, 16, 20] as const).map((p) => (
        <Section key={p} bg="surface" py={p}>
          <Container>
            <span className={styles.label}>py={p}</span>
            <p className={styles.copy}>Vertical padding from the spacing scale.</p>
          </Container>
        </Section>
      ))}

      <Section py={10}>
        <Container>
          <h2>3. fullBleed=&#123;false&#125; (self-contained)</h2>
        </Container>
      </Section>

      <Section bg="raised" py={6} fullBleed={false}>
        <span className={styles.label}>fullBleed=&#123;false&#125;</span>
        <p className={styles.copy}>
          Section auto-applies max-width container-lg + horizontal padding without a wrapping
          Container.
        </p>
      </Section>

      <Section py={10}>
        <Container>
          <h2>4. tag overrides — semantic intrinsic swap</h2>
        </Container>
      </Section>

      <Section tag="header" bg="brand-subtle" py={6}>
        <Container>
          <span className={styles.label}>tag=&quot;header&quot;</span>
          <p className={styles.copy}>Renders as &lt;header&gt; — page or article header band.</p>
        </Container>
      </Section>

      <Section tag="footer" bg="surface" py={8}>
        <Container>
          <span className={styles.label}>tag=&quot;footer&quot;</span>
          <p className={styles.copy}>Renders as &lt;footer&gt;. Inspect the DOM.</p>
        </Container>
      </Section>

      <Section py={10}>
        <Container>
          <h2>5. asChild — projects onto custom element</h2>
        </Container>
      </Section>

      <Section asChild bg="raised" py={6}>
        <article>
          <Container>
            <span className={styles.label}>asChild &lt;article&gt;</span>
            <p className={styles.copy}>
              asChild wins over tag — Section becomes the &lt;article&gt; passed in.
            </p>
          </Container>
        </article>
      </Section>
    </main>
  );
}
