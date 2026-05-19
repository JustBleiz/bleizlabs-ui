import Link from 'next/link';
import { Badge } from '@/components/display/Badge';
import { Button } from '@/components/interactive/Button';
import { ButtonGroup } from '@/components/interactive/ButtonGroup';
import { Card } from '@/components/display/Card';
import { Eyebrow } from '@/components/typography/Eyebrow';
import { Header } from '@/components/molecules/Header';
import { Heading } from '@/components/typography/Heading';
import { Inline } from '@/components/layout/Inline';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function HeaderPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.intro}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          Header
        </Heading>
        <p className={styles.lead}>
          Universal block-header molecule. Pure layout primitive — body slot (children) + optional
          actions slot inside flex row. Zero visual chrome by default; visual identity comes from
          composed children (consumer picks Heading size, Text variant, Badge styles). Replaces
          SectionHeader + PageHeader with one ≤3-prop primitive.
        </p>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          1. Minimal — composed body, no actions
        </Heading>
        <Header>
          <Heading level={3} size="xl">
            Recent activity
          </Heading>
          <Text variant="caption">Last 30 days</Text>
        </Header>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          2. Section heading — was SectionHeader
        </Heading>
        <Header
          actions={
            <Button variant="ghost" size="sm">
              View all
            </Button>
          }
        >
          <Eyebrow>Active projects · 6</Eyebrow>
          <Text variant="caption">Last activity 3 days ago</Text>
        </Header>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          3. Page heading — was PageHeader (hero-flavored)
        </Heading>
        <Header
          actions={
            <ButtonGroup aria-label="Save or cancel changes">
              <Button variant="ghost">Cancel</Button>
              <Button variant="primary">Save changes</Button>
            </ButtonGroup>
          }
        >
          <Heading level={3} size="3xl">
            Account settings
          </Heading>
          <Text variant="lead">Manage your profile and notification preferences.</Text>
          <Inline gap={2}>
            <Badge color="success">Verified</Badge>
            <Badge color="info">2FA enabled</Badge>
          </Inline>
        </Header>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          4. Multi-line title — actions stay top-aligned
        </Heading>
        <Header
          actions={
            <Button variant="primary" size="sm">
              Approve
            </Button>
          }
        >
          <Heading level={3} size="xl">
            A noticeably long heading that wraps onto two lines on narrower viewports
          </Heading>
          <Text variant="caption">
            The single-line action button stays at the title baseline rather than
            vertically-centering against the multi-line body.
          </Text>
        </Header>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          5. Inside Card — Card owns padding, Header owns layout
        </Heading>
        <Card>
          <Header
            actions={
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            }
          >
            <Eyebrow>Workspace</Eyebrow>
            <Heading level={3} size="lg">
              BleizLabs design system
            </Heading>
            <Text variant="caption">12 contributors · updated yesterday</Text>
          </Header>
        </Card>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          6. Just a heading — degenerate single-child case
        </Heading>
        <Header>
          <Heading level={3} size="xl">
            Plain title, no subtitle, no actions
          </Heading>
        </Header>
      </section>
    </main>
  );
}
