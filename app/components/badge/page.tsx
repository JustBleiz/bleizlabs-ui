import Link from 'next/link';
import { Badge, type BadgeColor } from '@/components/display/Badge';
import { Dot } from '@/components/specialized/Dot';
import { Inline } from '@/components/layout/Inline';
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
          Inline status / category indicator. Five semantic colors, optional
          pill shape, optional leading icon, and asChild polymorphism for
          semantic elements like <code>&lt;time&gt;</code>. Compose with{' '}
          <code>&lt;Dot&gt;</code> for status indicators with optional pulse.
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
        <Heading level={2} size="2xl">3. Status indicator — Dot prefix composition</Heading>
        <Text variant="small" color="secondary">
          Compose Badge with a leading <code>&lt;Dot&gt;</code> via the{' '}
          <code>icon</code> slot to produce status pills (online / offline /
          busy / away). Dot color follows Badge tone for visual coherence.
        </Text>
        <div className={styles.row}>
          <Badge label="Online" color="success" pill icon={<Dot color="success" />} />
          <Badge label="Offline" color="default" pill icon={<Dot color="default" />} />
          <Badge label="Busy" color="error" pill icon={<Dot color="error" />} />
          <Badge label="Away" color="warning" pill icon={<Dot color="warning" />} />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">4. Label variants</Heading>
        <div className={styles.row}>
          <Badge label="New" color="brand" />
          <Badge label="Beta" color="info" pill />
          <Badge label="Deprecated" color="warning" />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">5. asChild → semantic time element</Heading>
        <div className={styles.row}>
          <Badge color="info" pill asChild>
            <time dateTime="2026-04-14">Apr 14, 2026</time>
          </Badge>
          <Text variant="caption" color="muted">
            Slot replaces the wrapping span with a <code>&lt;time&gt;</code> element.
          </Text>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">6. With icon (text glyph stand-in)</Heading>
        <div className={styles.row}>
          <Badge label="Verified" color="success" icon={<span>✓</span>} pill />
          <Badge label="Locked" color="error" icon={<span>🔒</span>} />
          <Badge label="Featured" color="brand" icon={<span>★</span>} />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">7. Live status — Dot pulse composition</Heading>
        <Text variant="small" color="secondary">
          The Badge atom is static by design. For live indicators (online,
          recording, streaming), compose Badge with{' '}
          <code>&lt;Dot pulse /&gt;</code> in the icon slot — the dot pulses
          while the frame and label stay legible. The pulse animation
          inherits the global <code>prefers-reduced-motion</code> guard.
        </Text>
        <div className={styles.row}>
          <Badge label="LIVE" color="error" pill icon={<Dot color="error" pulse />} />
          <Badge label="Recording" color="error" pill icon={<Dot color="error" pulse />} />
          <Badge label="Online" color="success" pill icon={<Dot color="success" pulse />} />
          <Badge
            label="Updating"
            color="info"
            icon={<Dot color="info" pulse />}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">8. Notification badge — counter pattern</Heading>
        <Text variant="small" color="secondary">
          For unread-count badges, place a Badge next to (or absolutely
          positioned over) the host element. Use a small numeric label and
          the brand or warning tone.
        </Text>
        <div className={styles.row}>
          <Inline gap={1} align="center">
            <span style={{ fontSize: '1.25rem' }} aria-hidden="true">🔔</span>
            <Badge label="3" color="warning" pill />
          </Inline>
          <Inline gap={1} align="center">
            <span style={{ fontSize: '1.25rem' }} aria-hidden="true">📨</span>
            <Badge label="12" color="brand" pill />
          </Inline>
          <Inline gap={1} align="center">
            <span style={{ fontSize: '1.25rem' }} aria-hidden="true">🛒</span>
            <Badge label="99+" color="error" pill />
          </Inline>
        </div>
      </section>
    </main>
  );
}
