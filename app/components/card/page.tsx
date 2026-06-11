import Link from 'next/link';
import { Card, CardHeader, CardBody, CardFooter, CardSection } from '@/components/display/Card';
import { Button } from '@/components/interactive/Button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

const VARIANTS = ['default', 'elevated', 'accent', 'glass'] as const;

export default function CardPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          Card
        </Heading>
        <p className={styles.intro}>
          Surface container with 4 variants (incl. a left accent border) and 4 flat slot components
          (CardHeader, CardBody, CardFooter, CardSection). Polymorphism via asChild.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Variants
        </Heading>
        <div className={styles.grid}>
          {VARIANTS.map((variant) => (
            <Card key={variant} variant={variant}>
              <CardHeader border>
                <Heading level={3} size="lg">
                  {variant}
                </Heading>
                <Text variant="caption" color="muted">
                  Card variant=&quot;{variant}&quot;
                </Text>
              </CardHeader>
              <CardBody>
                <Text>
                  The quick brown fox jumps over the lazy dog. Surface tokens drive the look.
                </Text>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Accent variant
        </Heading>
        <Text variant="small" color="secondary">
          <code>variant=&quot;accent&quot;</code> renders a static brand-color accent on the left
          edge (<code>--card-accent-color</code> token override available). For other positions or
          colors, compose the <code>EdgeBar</code> atom.
        </Text>
        <div className={styles.grid}>
          <Card variant="accent">
            <CardHeader>
              <Heading level={3} size="lg">
                Accent left
              </Heading>
            </CardHeader>
            <CardBody>
              <Text>Default brand accent on the left edge.</Text>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Interactive card via asChild
        </Heading>
        <Text variant="small" color="secondary">
          The previous <code>hoverable</code> prop was dropped in 0.15.0. To make a Card
          interactive, wrap it around a real interactive element (anchor, button) using{' '}
          <code>asChild</code> and apply hover/focus styling via the consumer&apos;s own SCSS module
          on the Card&apos;s
          <code>className</code>. The <code>.interactive</code> class on this page&apos;s module
          shows the canonical pattern (1px lift + stronger shadow on hover, focus-visible ring).
        </Text>
        <div className={styles.grid}>
          <Card asChild className={styles.interactive}>
            <a href="#hover-demo">
              <CardHeader>
                <Heading level={3} size="lg">
                  Interactive link card
                </Heading>
                <Text variant="caption" color="muted">
                  Hover or focus me — anchor tag via asChild
                </Text>
              </CardHeader>
              <CardBody>
                <Text>
                  Hover lifts the card 1px and strengthens the shadow. Focus-visible adds a ring
                  around the whole surface.
                </Text>
              </CardBody>
            </a>
          </Card>
          <Card variant="elevated">
            <CardHeader>
              <Heading level={3} size="lg">
                Elevated (static)
              </Heading>
            </CardHeader>
            <CardBody>
              <Text>
                Static elevated variant — no interactive treatment because the Card is a plain div
                without <code>asChild</code>.
              </Text>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. CardSection separator
        </Heading>
        <Card>
          <CardHeader border>
            <Heading level={3} size="lg">
              Multi-section card
            </Heading>
          </CardHeader>
          <CardBody>
            <CardSection separator>
              <Text variant="body-strong">Section A</Text>
              <Text>First grouped block.</Text>
            </CardSection>
            <CardSection separator>
              <Text variant="body-strong">Section B</Text>
              <Text>
                Second block — gets a top border because the previous section is also marked
                separator.
              </Text>
            </CardSection>
            <CardSection separator>
              <Text variant="body-strong">Section C</Text>
              <Text>Third block — same rule.</Text>
            </CardSection>
          </CardBody>
        </Card>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. Card with action footer
        </Heading>
        <Card padding={5}>
          <CardHeader>
            <Heading level={3} size="lg">
              Action footer demo
            </Heading>
            <Text variant="caption" color="muted">
              Footer extends to card edges and uses a raised background.
            </Text>
          </CardHeader>
          <CardBody>
            <Text>
              The <code>action</code> prop on CardFooter creates a full-bleed footer suitable for
              primary CTAs — drop a real Button into the slot.
            </Text>
          </CardBody>
          <CardFooter action>
            <Text variant="small" color="secondary">
              3 items selected
            </Text>
            <Button variant="primary" size="sm">
              View all
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          6. Padding + radius matrix
        </Heading>
        <div className={styles.grid}>
          <Card padding={3} radius="sm">
            <Text variant="caption" color="muted">
              padding=3 radius=sm
            </Text>
            <Text>Compact</Text>
          </Card>
          <Card padding={5} radius="lg">
            <Text variant="caption" color="muted">
              padding=5 radius=lg (default)
            </Text>
            <Text>Standard</Text>
          </Card>
          <Card padding={8} radius="2xl">
            <Text variant="caption" color="muted">
              padding=8 radius=2xl
            </Text>
            <Text>Spacious hero</Text>
          </Card>
        </div>
      </section>
    </main>
  );
}
