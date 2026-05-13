'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Banner } from '@/components/feedback/Banner';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Button } from '@/components/interactive/Button';
import { Anchor } from '@/components/typography/Anchor';
import styles from './page.module.scss';

export default function BannerPlaygroundPage() {
  const [infoVisible, setInfoVisible] = useState(true);
  const [warnVisible, setWarnVisible] = useState(true);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          Banner
        </Heading>
        <p className={styles.intro}>
          Page-level notification primitive. Distinct from{' '}
          <code>&lt;Alert&gt;</code> (contextual inline feedback near a form
          field). Banner is a broadcast: maintenance windows, billing-overdue
          notices, terms updates, global system status. Tone enum drives both
          color palette and ARIA live politeness —{' '}
          <code>tone=&quot;error&quot;</code> announces assertively (interrupts
          AT), other tones announce politely.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Four tones
        </Heading>
        <Text variant="small" color="secondary">
          <code>info</code> · <code>warning</code> · <code>error</code> ·{' '}
          <code>success</code>. Each maps to a tinted background +{' '}
          <code>-strong</code> border + ARIA semantics.
        </Text>
        <div className={styles.stack}>
          <Banner tone="info">
            We&apos;ve updated our terms of service. Please review the changes.
          </Banner>
          <Banner tone="warning">
            Maintenance window scheduled for 2026-05-15 02:00 UTC. Expect ~10
            minutes of downtime.
          </Banner>
          <Banner tone="error">
            Payment failed — your subscription will lapse on May 20.
          </Banner>
          <Banner tone="success">
            Your invoice FV-2026-042 has been paid. Receipt sent to your email.
          </Banner>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Dismissible
        </Heading>
        <Text variant="small" color="secondary">
          <code>dismissible</code> renders a ✕ button; consumer owns the
          dismissal state via <code>onDismiss</code> (unmount, persist in
          localStorage, schedule re-show).
        </Text>
        <div className={styles.stack}>
          {infoVisible ? (
            <Banner
              tone="info"
              dismissible
              onDismiss={() => setInfoVisible(false)}
            >
              Click the × to dismiss this banner.
            </Banner>
          ) : (
            <Text variant="small" color="muted">
              Info banner dismissed.{' '}
              <Anchor href="#" onClick={(e) => { e.preventDefault(); setInfoVisible(true); }}>
                Restore
              </Anchor>
              .
            </Text>
          )}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. With action slot
        </Heading>
        <Text variant="small" color="secondary">
          <code>actions</code> slot accepts arbitrary children (typically{' '}
          <code>&lt;Button&gt;</code> or <code>&lt;Anchor&gt;</code>). Renders
          on the right, before the dismiss button.
        </Text>
        <div className={styles.stack}>
          <Banner
            tone="warning"
            dismissible
            onDismiss={() => setWarnVisible(false)}
            actions={
              <Button size="sm" variant="ghost">
                Review changes
              </Button>
            }
            style={{ display: warnVisible ? undefined : 'none' }}
          >
            New compliance policy goes into effect on 2026-06-01.
          </Banner>
          <Banner
            tone="info"
            actions={<Anchor href="#docs">Read documentation →</Anchor>}
          >
            v0.21.0 ships AvatarGroup, Rating, Collapsible, Banner.
          </Banner>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. Sticky variant
        </Heading>
        <Text variant="small" color="secondary">
          <code>sticky</code> applies <code>position: sticky; top: 0</code> so
          the banner anchors above scrolling content. Consumer is responsible
          for the layout slot — wrap the page main in a positioning context if
          needed. Scroll the viewport below to see the effect.
        </Text>
        <Banner tone="error" sticky>
          System-wide read-only mode active until 18:00 UTC.
        </Banner>
        <div className={styles.scrollProbe}>
          <Text variant="small" color="secondary">
            Filler content — scroll to see the sticky banner stay anchored.
          </Text>
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. Long message wrap
        </Heading>
        <Text variant="small" color="secondary">
          Body text wraps naturally — message column flexes, action +
          dismiss columns stay rigid on the right.
        </Text>
        <Banner
          tone="warning"
          dismissible
          actions={
            <Button size="sm" variant="ghost">
              View details
            </Button>
          }
        >
          We detected unusual activity on your account from a new device in
          Frankfurt, Germany. If this was you, no action is needed — otherwise
          revoke the session immediately and rotate your password from the
          security settings page.
        </Banner>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          6. ARIA live semantics
        </Heading>
        <Text variant="small" color="secondary">
          <code>tone=&quot;error&quot;</code> →{' '}
          <code>role=&quot;alert&quot;</code> +{' '}
          <code>aria-live=&quot;assertive&quot;</code> (interrupts screen
          readers). Other tones → <code>role=&quot;status&quot;</code> +{' '}
          <code>aria-live=&quot;polite&quot;</code> (announces at next pause).
          Inspect the DOM to verify ARIA attributes per tone.
        </Text>
        <div className={styles.stack}>
          <Banner tone="info">role=&quot;status&quot; · polite</Banner>
          <Banner tone="warning">role=&quot;status&quot; · polite</Banner>
          <Banner tone="success">role=&quot;status&quot; · polite</Banner>
          <Banner tone="error">role=&quot;alert&quot; · assertive</Banner>
        </div>
      </section>
    </main>
  );
}
