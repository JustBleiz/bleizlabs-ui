import Link from 'next/link';
import { Badge, type BadgeColor } from '@/components/display/Badge';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

const COLORS: BadgeColor[] = [
  'default',
  'brand',
  'success',
  'warning',
  'error',
  'info',
];

export default function BadgePlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← back</Link>
        <Heading level={1} size="4xl">Badge</Heading>
        <p className={styles.intro}>
          Inline status / category indicator. Six semantic colors, optional pill, dot, icon,
          uppercase, and asChild for `&lt;time&gt;` semantics.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">1. Color variants</Heading>
        <div className={styles.row}>
          {COLORS.map((color) => (
            <Badge key={color} label={color} color={color} />
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">2. Pill shape</Heading>
        <div className={styles.row}>
          {COLORS.map((color) => (
            <Badge key={color} label={color} color={color} pill />
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">3. With dot indicator</Heading>
        <div className={styles.row}>
          <Badge label="Online" color="success" dot />
          <Badge label="Offline" color="default" dot />
          <Badge label="Busy" color="error" dot pill />
          <Badge label="Away" color="warning" dot pill />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">4. Uppercase + label</Heading>
        <div className={styles.row}>
          <Badge label="New" color="brand" uppercase />
          <Badge label="Beta" color="info" uppercase pill />
          <Badge label="Deprecated" color="warning" uppercase />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">5. asChild → semantic time</Heading>
        <div className={styles.row}>
          <Badge color="info" pill asChild>
            <time dateTime="2026-04-14">Apr 14, 2026</time>
          </Badge>
          <Text variant="caption" color="muted">
            (Slot replaces the span with a `&lt;time&gt;` element)
          </Text>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">6. With icon (text glyph stand-in)</Heading>
        <div className={styles.row}>
          <Badge label="Verified" color="success" icon={<span>✓</span>} pill />
          <Badge label="Locked" color="error" icon={<span>🔒</span>} />
          <Badge label="Featured" color="brand" icon={<span>★</span>} uppercase />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">7. Pulse — notification + live status</Heading>
        <div className={styles.row}>
          <Badge label="3" color="warning" icon={<span>🔔</span>} pill pulse />
          <Badge label="LIVE" color="error" pill uppercase pulse />
          <Badge label="Online" color="success" dot pill pulse />
          <Badge label="Updating" color="info" dot pulse />
          <Text variant="caption" color="muted">
            (Pulse inherits global prefers-reduced-motion guard)
          </Text>
        </div>
      </section>
    </main>
  );
}
