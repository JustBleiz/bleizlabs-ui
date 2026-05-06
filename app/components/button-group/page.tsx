import Link from 'next/link';
import { Button } from '@/components/interactive/Button';
import { ButtonGroup } from '@/components/interactive/ButtonGroup';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function ButtonGroupPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← back</Link>
        <Heading level={1} size="4xl">ButtonGroup</Heading>
        <p className={styles.intro}>
          Joined row or column of related buttons. Reuses the `joined-group` SCSS mixin —
          inner radii collapse, 1px borders dedupe, and focused / active children lift via z-index.
          Server-safe; for arrow-key single-selection groups use ToggleGroup instead.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">1. Default — attached horizontal</Heading>
        <div className={styles.row}>
          <ButtonGroup aria-label="Text formatting">
            <Button variant="secondary">Bold</Button>
            <Button variant="secondary">Italic</Button>
            <Button variant="secondary">Underline</Button>
          </ButtonGroup>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">2. Vertical orientation</Heading>
        <Text variant="caption" color="muted">
          `orientation=&quot;vertical&quot;` stacks the buttons; the mixin collapses top/bottom inner
          radii instead of left/right.
        </Text>
        <div className={styles.row}>
          <ButtonGroup orientation="vertical" aria-label="Sort">
            <Button variant="secondary">Newest</Button>
            <Button variant="secondary">Oldest</Button>
            <Button variant="secondary">Most relevant</Button>
          </ButtonGroup>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">3. attached=false — gap-based</Heading>
        <Text variant="caption" color="muted">
          Falls back to a gapped row equivalent to `&lt;Inline gap=2&gt;`. Use when the group
          should look like discrete buttons instead of a unified surface.
        </Text>
        <div className={styles.row}>
          <ButtonGroup attached={false} aria-label="Detached actions">
            <Button variant="secondary">Save</Button>
            <Button variant="secondary">Save &amp; close</Button>
            <Button variant="ghost">Cancel</Button>
          </ButtonGroup>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">4. Mixed Button variants</Heading>
        <Text variant="caption" color="muted">
          The `joined-group` mixin handles non-uniform colors — borders dedupe, but each button
          keeps its own background and text color.
        </Text>
        <div className={styles.row}>
          <ButtonGroup aria-label="Mixed variants">
            <Button variant="primary">Confirm</Button>
            <Button variant="secondary">Review</Button>
            <Button variant="ghost">Discard</Button>
          </ButtonGroup>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">5. With icons (text glyph stand-ins)</Heading>
        <div className={styles.row}>
          <ButtonGroup aria-label="Approval">
            <Button variant="secondary" icon={<span>✓</span>} iconPosition="left">Approve</Button>
            <Button variant="secondary" icon={<span>✗</span>} iconPosition="left">Reject</Button>
            <Button variant="secondary" icon={<span>⏸</span>} iconPosition="left">Hold</Button>
          </ButtonGroup>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">6. iconOnly group</Heading>
        <Text variant="caption" color="muted">
          Icon-only buttons require an explicit `aria-label` on each child — the group label
          is not enough for screen readers to identify individual actions.
        </Text>
        <div className={styles.row}>
          <ButtonGroup aria-label="Text alignment">
            <Button variant="secondary" icon={<span>⬅</span>} iconOnly aria-label="Align left" />
            <Button variant="secondary" icon={<span>⬌</span>} iconOnly aria-label="Align center" />
            <Button variant="secondary" icon={<span>➡</span>} iconOnly aria-label="Align right" />
          </ButtonGroup>
        </div>
      </section>
    </main>
  );
}
