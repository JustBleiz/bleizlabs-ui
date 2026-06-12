'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/interactive/Button';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

/**
 * Click-behavior fixture for Button regression specs (BT-R01..BT-R05).
 *
 * Client child by design — the page itself stays a Server Component to keep
 * live-validating Button's "server-safe" JSDoc claim. This island hosts the
 * onClick fixtures the RSC page cannot.
 */
export function ClickBehaviorDemo() {
  const [count, setCount] = useState(0);
  const inc = () => setCount((c) => c + 1);

  return (
    <div className={styles.row}>
      <Text data-testid="btn-click-count">Handler calls: {count}</Text>
      <Button href="#clicked" onClick={inc} data-testid="btn-href-enabled">
        Enabled link
      </Button>
      <Button href="#clicked" onClick={inc} disabled data-testid="btn-href-disabled">
        Disabled link
      </Button>
      <Button onClick={inc} disabled data-testid="btn-native-disabled">
        Disabled button
      </Button>
      <Button asChild variant="secondary" onClick={inc}>
        <Link href="#aschild" data-testid="btn-aschild-enabled">
          asChild enabled
        </Link>
      </Button>
      <Button asChild variant="secondary" onClick={inc} disabled>
        <Link href="#aschild" data-testid="btn-aschild-disabled">
          asChild disabled
        </Link>
      </Button>
    </div>
  );
}
