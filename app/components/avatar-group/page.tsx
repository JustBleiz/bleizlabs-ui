import Link from 'next/link';
import { Avatar } from '@/components/display/Avatar';
import { AvatarGroup } from '@/components/molecules/AvatarGroup';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

const TEAM = [
  { fallback: 'AK', alt: 'Anna Kowalska' },
  { fallback: 'JS', alt: 'Jan Smith' },
  { fallback: 'TK', alt: 'Tomek Kowalski' },
  { fallback: 'MW', alt: 'Maria Wójcik' },
  { fallback: 'PN', alt: 'Piotr Nowak' },
  { fallback: 'DG', alt: 'Daria Górska' },
] as const;

export default function AvatarGroupPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          AvatarGroup
        </Heading>
        <p className={styles.intro}>
          Stacked-avatar molecule with overflow chip. Children-slot pattern — consumer passes{' '}
          <code>&lt;Avatar&gt;</code> elements freely; molecule clips the visible count to{' '}
          <code>max</code>, collapses the remainder into a final &quot;+N&quot; chip, and applies
          negative-margin overlap between siblings. Klocek-discipline: 4 props (<code>max</code>,{' '}
          <code>size</code>, <code>overlap</code>, <code>asChild</code>), no forced typed array, no
          auto-wrap.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Basic — 3 avatars, default overlap + size
        </Heading>
        <Text variant="small" color="secondary">
          Default <code>max=3</code> shows all three without an overflow chip.
        </Text>
        <div className={styles.row}>
          <AvatarGroup>
            {TEAM.slice(0, 3).map((m) => (
              <Avatar key={m.fallback} fallback={m.fallback} alt={m.alt} />
            ))}
          </AvatarGroup>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Overflow — 6 avatars, max=3 → 2 visible + &quot;+4&quot; chip
        </Heading>
        <Text variant="small" color="secondary">
          When total exceeds <code>max</code>, last visible slot becomes a fallback-only Avatar
          showing the excess count. Tooltip via <code>aria-label=&quot;4 more&quot;</code>.
        </Text>
        <div className={styles.row}>
          <AvatarGroup max={3}>
            {TEAM.map((m) => (
              <Avatar key={m.fallback} fallback={m.fallback} alt={m.alt} />
            ))}
          </AvatarGroup>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Sizes — xs / sm / md / lg / xl
        </Heading>
        <Text variant="small" color="secondary">
          <code>size</code> prop forwards to every child Avatar. Per-avatar size overrides win when
          set explicitly on the child.
        </Text>
        <div className={styles.row}>
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
            <div key={size} className={styles.cell}>
              <span className={styles.caption}>size=&quot;{size}&quot;</span>
              <AvatarGroup size={size} max={3}>
                {TEAM.slice(0, 4).map((m) => (
                  <Avatar key={m.fallback} fallback={m.fallback} alt={m.alt} />
                ))}
              </AvatarGroup>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. Overlap depth — 1 (4px) / 2 (default 8px) / 4 (16px) / 0 (gap-less)
        </Heading>
        <Text variant="small" color="secondary">
          <code>overlap</code> is a <code>--space-N</code> token index. Higher values pull avatars
          closer together. <code>0</code> renders them flush (no overlap, no gap).
        </Text>
        <div className={styles.row}>
          {([1, 2, 4, 0] as const).map((overlap) => (
            <div key={overlap} className={styles.cell}>
              <span className={styles.caption}>overlap={overlap}</span>
              <AvatarGroup overlap={overlap} max={4}>
                {TEAM.slice(0, 4).map((m) => (
                  <Avatar key={m.fallback} fallback={m.fallback} alt={m.alt} />
                ))}
              </AvatarGroup>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. With image avatars
        </Heading>
        <Text variant="small" color="secondary">
          Mixed image + initials fallback children. Stack order: first child on top (highest
          z-index), descending.
        </Text>
        <div className={styles.row}>
          <AvatarGroup size="lg">
            <Avatar src="https://i.pravatar.cc/120?u=anna" alt="Anna Kowalska" />
            <Avatar src="https://i.pravatar.cc/120?u=jan" alt="Jan Smith" />
            <Avatar fallback="TK" alt="Tomek Kowalski" />
            <Avatar src="https://i.pravatar.cc/120?u=maria" alt="Maria Wójcik" />
          </AvatarGroup>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          6. asChild — semantic projection
        </Heading>
        <Text variant="small" color="secondary">
          When <code>asChild=true</code>, the molecule projects layout +{' '}
          <code>role=&quot;list&quot;</code> onto the consumer&apos;s element (e.g. semantic{' '}
          <code>&lt;ul&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;aside&gt;</code>). The
          consumer keeps its own label / aria attributes.
        </Text>
        <div className={styles.row}>
          <AvatarGroup asChild max={4}>
            <ul aria-label="Assignees">
              {TEAM.slice(0, 5).map((m) => (
                <Avatar key={m.fallback} fallback={m.fallback} alt={m.alt} />
              ))}
            </ul>
          </AvatarGroup>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          7. Single avatar — no overflow, no stack
        </Heading>
        <Text variant="small" color="secondary">
          Edge case: 1 child &lt; <code>max</code> → renders as a normal Avatar with no negative
          margin (first-child has no offset).
        </Text>
        <div className={styles.row}>
          <AvatarGroup>
            <Avatar fallback="AK" alt="Anna Kowalska" size="md" />
          </AvatarGroup>
        </div>
      </section>
    </main>
  );
}
