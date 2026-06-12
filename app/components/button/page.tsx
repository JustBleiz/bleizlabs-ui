import Link from 'next/link';
import { Button } from '@/components/interactive/Button';
import { ButtonGroup } from '@/components/interactive/ButtonGroup';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { ClickBehaviorDemo } from './ClickBehaviorDemo';
import styles from './page.module.scss';

const VARIANTS = ['primary', 'secondary', 'ghost', 'link', 'warning'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;
const SHAPES = ['rounded', 'pill'] as const;

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
          Server-safe Button with five variants, three sizes, optional icon, and polymorphic
          rendering via <code>asChild</code> (use as a Next.js Link, anchor, or any custom element).
          ButtonGroup wraps siblings into a single joined control with collapsed inner radii.
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
          Shapes
        </Heading>
        <Text className={styles.intro}>
          The <code>shape</code> prop is orthogonal to <code>variant</code> and <code>size</code>.
          Default <code>&quot;rounded&quot;</code> uses the standard radius scale;{' '}
          <code>&quot;pill&quot;</code> resolves to <code>--radius-full</code> for fully-rounded
          edges.
        </Text>
        <div className={styles.row}>
          {SHAPES.map((shape) => (
            <Button key={shape} shape={shape}>
              shape=&quot;{shape}&quot;
            </Button>
          ))}
          <Button shape="pill" variant="secondary">
            Pill + secondary
          </Button>
          <Button shape="pill" variant="ghost">
            Pill + ghost
          </Button>
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
          <Button variant="ghost" iconOnly icon={<ArrowIcon />} aria-label="Next page" />
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
          Click behavior &mdash; disabled href
        </Heading>
        <Text className={styles.intro}>
          Disabled <code>href</code> buttons strip the anchor&apos;s <code>href</code>, keep{' '}
          <code>role=&quot;link&quot;</code> and suppress <code>onClick</code> — programmatic and
          assistive-tech activation cannot invoke the handler.
        </Text>
        <ClickBehaviorDemo />
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
