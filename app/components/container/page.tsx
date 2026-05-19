import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import styles from './page.module.scss';

export default function ContainerPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <h1>Container</h1>
        <p>Max-width centered wrapper. Five sizes, padding control, asChild.</p>
      </header>

      <section className={styles.demo}>
        <h2>1. Size variants (resize viewport to see clamping)</h2>
        <div className={styles.col}>
          {(['sm', 'md', 'lg', 'xl', 'fluid'] as const).map((s) => (
            <div key={s} className={styles.outer}>
              <span className={styles.label}>size={s}</span>
              <Container size={s} className={styles.demoContainer}>
                <div className={styles.box}>
                  Container size=&quot;{s}&quot; — content visible width depends on viewport.
                </div>
              </Container>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <h2>2. Padding variants</h2>
        <div className={styles.col}>
          {(['none', 0, 2, 4, 6, 8] as const).map((p) => (
            <div key={p} className={styles.outer}>
              <span className={styles.label}>padding={typeof p === 'string' ? `'${p}'` : p}</span>
              <Container size="md" padding={p} className={styles.demoContainer}>
                <div className={styles.box}>padding={String(p)}</div>
              </Container>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <h2>3. centered=false (left-aligned, no auto margins)</h2>
        <Container size="md" centered={false} className={styles.demoContainer}>
          <div className={styles.box}>centered=false</div>
        </Container>
      </section>

      <section className={styles.demo}>
        <h2>4. asChild — renders &lt;main&gt;</h2>
        <Container asChild size="lg" className={styles.demoContainer}>
          <main className={styles.box}>
            I am a real &lt;main&gt; element with Container layout.
          </main>
        </Container>
      </section>
    </main>
  );
}
