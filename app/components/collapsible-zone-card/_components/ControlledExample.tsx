'use client';

import { useState } from 'react';
import { CollapsibleZoneCard } from '@/components/presets/CollapsibleZoneCard';
import { Text } from '@/components/typography/Text';

export function ControlledExample({
  className,
}: {
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div data-testid="controlled-czc">
      <CollapsibleZoneCard
        title="Controlled mode"
        subtitle="Parent owns open state — pass open + onOpenChange"
        open={open}
        onOpenChange={setOpen}
      >
        <Text variant="body" color="secondary">
          Body content visible only when parent state is true. Toggle the
          button above — parent updates state, component reflects it. Useful
          for sync with URL params, persisted preferences, multiple cards
          opening together via shared parent state.
        </Text>
      </CollapsibleZoneCard>
      <p className={className}>
        State: <code>open = {String(open)}</code>
      </p>
    </div>
  );
}
