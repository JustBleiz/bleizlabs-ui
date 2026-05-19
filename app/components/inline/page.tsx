import Link from 'next/link';
import { Inline } from '@/components/layout/Inline';
import styles from './page.module.scss';

export default function InlinePlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <h1>Inline</h1>
        <p>Horizontal flex layout atom. Wrap, collapseBelow, asChild demos.</p>
      </header>

      <section className={styles.demo}>
        <h2>1. Default (gap=2, align=center, justify=start)</h2>
        <div className={styles.frame}>
          <Inline>
            <Box>One</Box>
            <Box>Two</Box>
            <Box>Three</Box>
          </Inline>
        </div>
      </section>

      <section className={styles.demo}>
        <h2>2. Justify variants</h2>
        <div className={styles.col}>
          {(['start', 'center', 'end', 'between', 'around', 'evenly'] as const).map((j) => (
            <div key={j} className={styles.frame}>
              <span className={styles.label}>justify={j}</span>
              <Inline gap={2} justify={j}>
                <Box>A</Box>
                <Box>B</Box>
                <Box>C</Box>
              </Inline>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <h2>3. Wrap (overflow flows to new line)</h2>
        <div className={styles.frame}>
          <Inline gap={2} wrap>
            {Array.from({ length: 18 }).map((_, i) => (
              <Box key={i}>tag-{i + 1}</Box>
            ))}
          </Inline>
        </div>
      </section>

      <section className={styles.demo}>
        <h2>4. collapseBelow=&quot;md&quot; — resize viewport to see</h2>
        <div className={styles.frame}>
          <Inline gap={4} collapseBelow="md" align="start">
            <Box>Sidebar (collapses to top on small screens)</Box>
            <Box style={{ flex: 1 }}>Main content (collapses to bottom)</Box>
          </Inline>
        </div>
      </section>

      <section className={styles.demo}>
        <h2>5. asChild — renders &lt;nav&gt;</h2>
        <div className={styles.frame}>
          <Inline asChild gap={3}>
            <nav className={styles.nav} aria-label="Primary">
              <a href="#a">Home</a>
              <a href="#b">Docs</a>
              <a href="#c">About</a>
            </nav>
          </Inline>
        </div>
      </section>
    </main>
  );
}

function Box({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className={styles.box} style={style}>
      {children}
    </div>
  );
}
