import Link from 'next/link';
import { Avatar, type AvatarSize } from '@/components/display/Avatar';
import { Dot, type DotColor } from '@/components/specialized/Dot';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

interface StatusExample {
  key: string;
  label: string;
  color: DotColor;
  pulse?: boolean;
  initials: string;
  name: string;
}

const STATUSES: StatusExample[] = [
  {
    key: 'online',
    label: 'online',
    color: 'success',
    initials: 'AK',
    name: 'Anna online',
    pulse: true,
  },
  { key: 'busy', label: 'busy', color: 'error', initials: 'JD', name: 'John busy' },
  { key: 'away', label: 'away', color: 'warning', initials: 'MS', name: 'Mark away' },
  { key: 'offline', label: 'offline', color: 'default', initials: 'EW', name: 'Eve offline' },
];

const SIZES: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

export default function AvatarPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          Avatar
        </Heading>
        <p className={styles.intro}>
          User identity element with image / initials fallback chain (image → initials → empty), 5
          sizes, circle/rounded shape, and 4 status indicators.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Sizes (initials fallback)
        </Heading>
        <div className={styles.row}>
          {SIZES.map((size) => (
            <div key={size} className={styles.cell}>
              <Avatar fallback="AK" alt="Anna Kowalski" size={size} />
              <Text variant="caption" color="muted">
                {size}
              </Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Shapes
        </Heading>
        <div className={styles.row}>
          <div className={styles.cell}>
            <Avatar fallback="JD" alt="John Doe" size="lg" shape="circle" />
            <Text variant="caption" color="muted">
              circle
            </Text>
          </div>
          <div className={styles.cell}>
            <Avatar fallback="JD" alt="John Doe" size="lg" shape="rounded" />
            <Text variant="caption" color="muted">
              rounded
            </Text>
          </div>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Status indicators — compose Avatar + Dot overlay
        </Heading>
        <Text variant="small" color="secondary">
          Avatar stays focused on identity; status indication is layered on as a consumer
          composition. Wrap an <code>{`<Avatar />`}</code> together with <code>{`<Dot />`}</code> in
          a positioned container to render any status treatment (online, busy, away, offline)
          without bloating the Avatar API.
        </Text>
        <div className={styles.row}>
          {STATUSES.map((s) => (
            <div key={s.key} className={styles.cell}>
              <div className={styles.statusWrapper}>
                <Avatar fallback={s.initials} alt={s.name} size="lg" />
                <Dot
                  color={s.color}
                  size="md"
                  pulse={s.pulse}
                  label={`Status: ${s.label}`}
                  className={styles.statusDot}
                />
              </div>
              <Text variant="caption" color="muted">
                {s.label}
              </Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. With image source
        </Heading>
        <div className={styles.row}>
          <Avatar src="https://i.pravatar.cc/80?img=12" alt="Demo user" size="lg" />
          <Avatar src="https://i.pravatar.cc/80?img=20" alt="Demo user" size="lg" />
          <Text variant="caption" color="muted">
            (External pravatar — used here only for visual demo)
          </Text>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. Empty fallback (no src, no fallback text)
        </Heading>
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
