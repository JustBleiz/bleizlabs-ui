import Link from 'next/link';
import {
  Avatar,
  type AvatarSize,
  type AvatarStatus,
} from '@/components/display/Avatar';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

const SIZES: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const STATUSES: AvatarStatus[] = ['online', 'offline', 'busy', 'away'];

export default function AvatarPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← back</Link>
        <Heading level={1} size="4xl">Avatar</Heading>
        <p className={styles.intro}>
          User identity element with image / initials fallback chain (image → initials → empty),
          5 sizes, circle/rounded shape, and 4 status indicators.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">1. Sizes (initials fallback)</Heading>
        <div className={styles.row}>
          {SIZES.map((size) => (
            <div key={size} className={styles.cell}>
              <Avatar fallback="AK" alt="Anna Kowalski" size={size} />
              <Text variant="caption" color="muted">{size}</Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">2. Shapes</Heading>
        <div className={styles.row}>
          <div className={styles.cell}>
            <Avatar fallback="JD" alt="John Doe" size="lg" shape="circle" />
            <Text variant="caption" color="muted">circle</Text>
          </div>
          <div className={styles.cell}>
            <Avatar fallback="JD" alt="John Doe" size="lg" shape="rounded" />
            <Text variant="caption" color="muted">rounded</Text>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">3. Status indicators</Heading>
        <div className={styles.row}>
          {STATUSES.map((status) => (
            <div key={status} className={styles.cell}>
              <Avatar
                fallback="UX"
                alt={`User (${status})`}
                size="lg"
                status={status}
              />
              <Text variant="caption" color="muted">{status}</Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">4. With image source</Heading>
        <div className={styles.row}>
          <Avatar
            src="https://i.pravatar.cc/80?img=12"
            alt="Demo user"
            size="lg"
          />
          <Avatar
            src="https://i.pravatar.cc/80?img=20"
            alt="Demo user"
            size="lg"
            status="online"
          />
          <Text variant="caption" color="muted">
            (External pravatar — used here only for visual demo)
          </Text>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">5. Empty fallback (no src, no fallback text)</Heading>
        <div className={styles.row}>
          <Avatar alt="Unknown user" size="lg" />
          <Text variant="caption" color="muted">
            Empty colored surface — KISS fallback chain endpoint.
          </Text>
        </div>
      </section>
    </main>
  );
}
