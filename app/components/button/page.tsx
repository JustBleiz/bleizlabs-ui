import Link from 'next/link';
import { Button } from '@/components/interactive/Button';
import { ButtonGroup } from '@/components/interactive/ButtonGroup';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

const VARIANTS = ['primary', 'secondary', 'ghost', 'link', 'warning'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function ButtonPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; back
        </Link>
        <Heading level={1} size="4xl">
          Button + ButtonGroup
        </Heading>
        <Text className={styles.intro}>
          Phase 4 I1 / I1.5. Server-safe Button (no &quot;use client&quot;)
          with 5 variants, 3 sizes, icon support, href fallback, asChild
          polymorphism. ButtonGroup wraps them with collapsed inner radii
          via the joined-group SCSS mixin (also reused by ToggleGroup).
        </Text>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Variants
        </Heading>
        <div className={styles.row}>
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Sizes
        </Heading>
        <div className={styles.row}>
          {SIZES.map((size) => (
            <Button key={size} size={size}>
              Size {size}
            </Button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          With icon
        </Heading>
        <div className={styles.row}>
          <Button icon={<ArrowIcon />}>Continue</Button>
          <Button variant="secondary" icon={<ArrowIcon />} iconPosition="right">
            Next step
          </Button>
          <Button
            variant="ghost"
            iconOnly
            icon={<ArrowIcon />}
            aria-label="Next page"
          />
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          Disabled
        </Heading>
        <div className={styles.row}>
          <Button disabled>Primary</Button>
          <Button variant="secondary" disabled>
            Secondary
          </Button>
          <Button variant="link" disabled>
            Link
          </Button>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          As link (href)
        </Heading>
        <div className={styles.row}>
          <Button href="#" variant="primary">
            Native &lt;a&gt;
          </Button>
          <Button asChild variant="link">
            <Link href="/">Next Link via asChild</Link>
          </Button>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          ButtonGroup &mdash; horizontal
        </Heading>
        <ButtonGroup aria-label="Text formatting">
          <Button variant="secondary">Bold</Button>
          <Button variant="secondary">Italic</Button>
          <Button variant="secondary">Underline</Button>
          <Button variant="secondary">Strike</Button>
        </ButtonGroup>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          ButtonGroup &mdash; vertical
        </Heading>
        <ButtonGroup orientation="vertical" aria-label="Sort by">
          <Button variant="secondary">Newest first</Button>
          <Button variant="secondary">Oldest first</Button>
          <Button variant="secondary">Alphabetical</Button>
        </ButtonGroup>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="2xl">
          ButtonGroup &mdash; detached fallback
        </Heading>
        <ButtonGroup attached={false} aria-label="Actions">
          <Button>Save</Button>
          <Button variant="secondary">Cancel</Button>
        </ButtonGroup>
      </section>
    </main>
  );
}
