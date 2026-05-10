'use client';

import { Input } from '@/components/interactive/Input';
import { CollapsibleZoneCard } from '@/components/presets/CollapsibleZoneCard';

export function ForceMountExample() {
  return (
    <div data-testid="force-mount-czc">
      <CollapsibleZoneCard
        title="forceMount — preserves form state"
        subtitle="Type something, collapse, expand — value persists"
        forceMount
      >
        <Input
          name="czc-demo-input"
          placeholder="Type here, then toggle"
        />
      </CollapsibleZoneCard>
    </div>
  );
}
