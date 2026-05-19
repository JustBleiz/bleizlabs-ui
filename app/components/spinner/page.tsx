import Link from 'next/link';
import { Spinner, type SpinnerSize, type SpinnerColor } from '@/components/display/Spinner';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

const SIZES: SpinnerSize[] = ['xs', 'sm', 'md', 'lg'];
const COLORS: SpinnerColor[] = ['brand', 'current', 'muted'];

export default function SpinnerPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          Spinner
        </Heading>
        <p className={styles.intro}>
          Inline loading indicator with 4 sizes, 3 colors. role=&quot;status&quot; with hidden
          screen-reader label. Reduced-motion users get a paused indicator.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Sizes
        </Heading>
        <div className={styles.row}>
          {SIZES.map((size) => (
            <div key={size} className={styles.cell}>
              <Spinner size={size} />
              <Text variant="caption" color="muted">
                {size}
              </Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Colors
        </Heading>
        <div className={styles.row}>
          {COLORS.map((color) => (
            <div key={color} className={styles.cell}>
              <Spinner color={color} size="md" />
              <Text variant="caption" color="muted">
                {color}
              </Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Inline with text (color=current)
        </Heading>
        <p className={styles.inlineRow}>
          <Spinner size="xs" color="current" /> Loading results…
        </p>
        <p className={styles.inlineRow}>
          <Spinner size="sm" color="current" /> Saving changes
        </p>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. Custom label
        </Heading>
        <Spinner size="lg" label="Fetching dashboard data" />
        <Text variant="caption" color="muted">
          Hidden text passed to screen readers (`label` prop)
        </Text>
      </section>
    </main>
  );
}
