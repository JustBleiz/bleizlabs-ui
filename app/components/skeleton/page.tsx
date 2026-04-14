import Link from 'next/link';
import { Skeleton } from '@/components/display/Skeleton';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function SkeletonPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← back</Link>
        <Heading level={1} size="4xl">Skeleton</Heading>
        <p className={styles.intro}>
          Loading placeholder with three variants (text, rect, circle) and two animations
          (pulse, shimmer). Reduced-motion users get a static surface.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">1. Text variant — single line</Heading>
        <Skeleton variant="text" />
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">2. Text variant — multiple lines</Heading>
        <Skeleton variant="text" lines={4} />
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">3. Rect variant — explicit dimensions</Heading>
        <Skeleton variant="rect" height={120} />
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">4. Circle variant — avatar placeholder</Heading>
        <div className={styles.row}>
          <Skeleton variant="circle" width={32} height={32} />
          <Skeleton variant="circle" width={56} height={56} />
          <Skeleton variant="circle" width={80} height={80} />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">5. Animation = shimmer</Heading>
        <Skeleton variant="rect" height={80} animation="shimmer" />
        <Text variant="caption" color="muted">
          Gradient sweeps left-to-right (more visually present than pulse).
        </Text>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">6. Card-shaped composition</Heading>
        <div className={styles.cardSkeleton}>
          <Skeleton variant="rect" height={160} />
          <Skeleton variant="text" lines={3} />
          <div className={styles.row}>
            <Skeleton variant="circle" width={32} height={32} />
            <Skeleton variant="text" width="60%" />
          </div>
        </div>
      </section>
    </main>
  );
}
