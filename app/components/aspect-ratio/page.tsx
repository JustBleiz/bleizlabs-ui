import Link from 'next/link';
import { AspectRatio } from '@/components/display/AspectRatio';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

const RATIOS: { label: string; value: number }[] = [
  { label: '16:9 (widescreen)', value: 16 / 9 },
  { label: '4:3 (classic)', value: 4 / 3 },
  { label: '1:1 (square)', value: 1 },
  { label: '21:9 (cinematic)', value: 21 / 9 },
  { label: '3:4 (portrait)', value: 3 / 4 },
];

export default function AspectRatioPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← back</Link>
        <Heading level={1} size="4xl">AspectRatio</Heading>
        <p className={styles.intro}>
          Media container with fixed aspect ratio. Uses native CSS aspect-ratio property.
          Children are positioned absolutely to fill the box (object-fit: cover).
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">1. Common ratios with placeholder</Heading>
        <div className={styles.grid}>
          {RATIOS.map(({ label, value }) => (
            <div key={label} className={styles.cell}>
              <AspectRatio ratio={value}>
                <div className={styles.placeholder}>{label}</div>
              </AspectRatio>
              <Text variant="caption" color="muted">{label}</Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">2. With image</Heading>
        <div className={styles.singleColumn}>
          <AspectRatio ratio={16 / 9}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://picsum.photos/seed/aspect/1280/720"
              alt="Random demo content from picsum.photos"
            />
          </AspectRatio>
          <Text variant="caption" color="muted">
            16:9 with object-fit: cover (external picsum source)
          </Text>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">3. With iframe</Heading>
        <div className={styles.singleColumn}>
          <AspectRatio ratio={16 / 9}>
            <iframe
              title="Wikipedia frame demo"
              src="https://en.wikipedia.org/wiki/Aspect_ratio_(image)"
            />
          </AspectRatio>
          <Text variant="caption" color="muted">
            iframe stretches to the box automatically
          </Text>
        </div>
      </section>
    </main>
  );
}
