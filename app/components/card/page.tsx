import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardSection,
} from '@/components/display/Card';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

const VARIANTS = ['default', 'elevated', 'accent', 'glass'] as const;

export default function CardPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← back</Link>
        <Heading level={1} size="4xl">Card</Heading>
        <p className={styles.intro}>
          Surface container with 4 variants, opt-in hover, accent border modes, and 4 flat slot
          components (CardHeader, CardBody, CardFooter, CardSection). Polymorphism via asChild.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">1. Variants</Heading>
        <div className={styles.grid}>
          {VARIANTS.map((variant) => (
            <Card key={variant} variant={variant}>
              <CardHeader border>
                <Heading level={3} size="lg">{variant}</Heading>
                <Text variant="caption" color="muted">Card variant=&quot;{variant}&quot;</Text>
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
        <Heading level={2} size="2xl">2. Accent border position</Heading>
        <div className={styles.grid}>
          <Card variant="accent">
            <CardHeader>
              <Heading level={3} size="lg">Accent left</Heading>
            </CardHeader>
            <CardBody>
              <Text>Default brand accent on the left edge.</Text>
            </CardBody>
          </Card>
          <Card variant="accent">
            <CardHeader>
              <Heading level={3} size="lg">Accent top — success</Heading>
            </CardHeader>
            <CardBody>
              <Text>Custom accentColor token override.</Text>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">3. Hoverable + asChild interactive</Heading>
        <div className={styles.grid}>
          <Card asChild>
            <a href="#hover-demo">
              <CardHeader>
                <Heading level={3} size="lg">Hoverable link card</Heading>
                <Text variant="caption" color="muted">Click me — uses asChild + a tag</Text>
              </CardHeader>
              <CardBody>
                <Text>
                  Hover lifts the card 1px and adds a stronger shadow. Focus-visible adds a ring.
                </Text>
              </CardBody>
            </a>
          </Card>
          <Card variant="elevated">
            <CardHeader>
              <Heading level={3} size="lg">Elevated +</Heading>
            </CardHeader>
            <CardBody>
              <Text>Combination: starting shadow + hover lift.</Text>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">4. CardSection separator</Heading>
        <Card>
          <CardHeader border>
            <Heading level={3} size="lg">Multi-section card</Heading>
          </CardHeader>
          <CardBody>
            <CardSection separator>
              <Text variant="body-strong">Section A</Text>
              <Text>First grouped block.</Text>
            </CardSection>
            <CardSection separator>
              <Text variant="body-strong">Section B</Text>
              <Text>Second block — gets a top border because the previous section is also marked separator.</Text>
            </CardSection>
            <CardSection separator>
              <Text variant="body-strong">Section C</Text>
              <Text>Third block — same rule.</Text>
            </CardSection>
          </CardBody>
        </Card>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">5. Card with action footer</Heading>
        <Card padding={5}>
          <CardHeader>
            <Heading level={3} size="lg">Action footer demo</Heading>
            <Text variant="caption" color="muted">Footer extends to card edges and uses raised bg.</Text>
          </CardHeader>
          <CardBody>
            <Text>The action prop on CardFooter creates a full-bleed footer suitable for primary CTAs.</Text>
          </CardBody>
          <CardFooter action>
            <Text variant="small">3 items selected</Text>
            <Text variant="small" color="brand">View all →</Text>
          </CardFooter>
        </Card>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">6. Padding + radius matrix</Heading>
        <div className={styles.grid}>
          <Card padding={3} radius="sm">
            <Text variant="caption" color="muted">padding=3 radius=sm</Text>
            <Text>Compact</Text>
          </Card>
          <Card padding={5} radius="lg">
            <Text variant="caption" color="muted">padding=5 radius=lg (default)</Text>
            <Text>Standard</Text>
          </Card>
          <Card padding={8} radius="2xl">
            <Text variant="caption" color="muted">padding=8 radius=2xl</Text>
            <Text>Spacious hero</Text>
          </Card>
        </div>
      </section>
    </main>
  );
}
