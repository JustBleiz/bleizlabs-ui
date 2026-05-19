import Link from 'next/link';
import { Stack } from '@/components/layout/Stack';
import styles from './page.module.scss';

export default function StackPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <h1>Stack</h1>
        <p>
          Vertical flex layout atom. Six variants demonstrating gap, align, justify, divider, and
          asChild.
        </p>
      </header>

      <section className={styles.demo}>
        <h2>1. Default (gap=3, align=stretch, justify=start)</h2>
        <div className={styles.frame}>
          <Stack>
            <Box>One</Box>
            <Box>Two</Box>
            <Box>Three</Box>
          </Stack>
        </div>
      </section>

      <section className={styles.demo}>
        <h2>2. Gap variants</h2>
        <div className={styles.row}>
          {([0, 1, 2, 3, 4, 6, 8, 12, 20] as const).map((g) => (
            <div key={g} className={styles.frame}>
              <span className={styles.label}>gap={g}</span>
              <Stack gap={g}>
                <Box>A</Box>
                <Box>B</Box>
                <Box>C</Box>
              </Stack>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <h2>3. Align variants (cross-axis)</h2>
        <div className={styles.row}>
          {(['start', 'center', 'end', 'stretch', 'baseline'] as const).map((a) => (
            <div key={a} className={styles.frame}>
              <span className={styles.label}>align={a}</span>
              <Stack gap={2} align={a}>
                <Box style={{ width: '40%' }}>narrow</Box>
                <Box style={{ width: '70%' }}>wider</Box>
                <Box style={{ width: '50%' }}>mid</Box>
              </Stack>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <h2>4. Justify variants (main-axis, fixed-height container)</h2>
        <div className={styles.row}>
          {(['start', 'center', 'end', 'between', 'around', 'evenly'] as const).map((j) => (
            <div key={j} className={`${styles.frame} ${styles.tall}`}>
              <span className={styles.label}>justify={j}</span>
              <Stack gap={2} justify={j} style={{ height: '100%' }}>
                <Box>One</Box>
                <Box>Two</Box>
                <Box>Three</Box>
              </Stack>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <h2>5. Divider between children</h2>
        <div className={styles.frame}>
          <Stack gap={3} divider={<hr className={styles.hr} />}>
            <Box>First item</Box>
            <Box>Second item</Box>
            <Box>Third item</Box>
            <Box>Fourth item</Box>
          </Stack>
        </div>
      </section>

      <section className={styles.demo}>
        <h2>6. asChild — renders semantic &lt;ul&gt; with Stack layout</h2>
        <div className={styles.frame}>
          <Stack asChild gap={2}>
            <ul className={styles.list}>
              <li>List item alpha</li>
              <li>List item beta</li>
              <li>List item gamma</li>
            </ul>
          </Stack>
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
