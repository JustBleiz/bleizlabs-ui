'use client';

import { CollapsibleZoneCard } from '@/components/presets/CollapsibleZoneCard';
import { Text } from '@/components/typography/Text';

export function FormWrappedExample() {
  return (
    <div data-testid="form-wrapped-czc">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Demo only — verifies trigger does not submit form (Radix #15)
        }}
      >
        <CollapsibleZoneCard
          title="Inside a <form>"
          subtitle="Trigger has type='button' so it never submits the form"
        >
          <Text variant="body" color="secondary">
            Wrap CollapsibleZoneCard in a form — toggling does not trigger
            form submission. Verified via Radix #15 closed-issue regression.
          </Text>
        </CollapsibleZoneCard>
      </form>
    </div>
  );
}
