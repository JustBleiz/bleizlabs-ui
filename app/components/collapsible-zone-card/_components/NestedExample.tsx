'use client';

import { CollapsibleZoneCard } from '@/components/presets/CollapsibleZoneCard';
import { Text } from '@/components/typography/Text';

export function NestedExample({ innerClassName }: { innerClassName?: string }) {
  return (
    <div data-testid="nested-outer">
      <CollapsibleZoneCard
        title="Outer card"
        subtitle="Contains another CollapsibleZoneCard inside its body"
      >
        <Text variant="body" color="secondary">
          Outer body content. Below is a nested CollapsibleZoneCard — toggle
          independently. Verifies no infinite re-render loop (Radix #2717,
          #2390 closed-issue precedent).
        </Text>
        <div data-testid="nested-inner" className={innerClassName}>
          <CollapsibleZoneCard
            title="Inner card"
            subtitle="Nested disclosure — opens/closes independently"
            density="compact"
          >
            <Text variant="caption" color="muted">
              Inner body content. Closing outer should not crash inner state.
            </Text>
          </CollapsibleZoneCard>
        </div>
      </CollapsibleZoneCard>
    </div>
  );
}
