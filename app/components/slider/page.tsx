'use client';

import { useState } from 'react';
import { Slider } from '@/components/complex/Slider';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Stack } from '@/components/layout/Stack';
import { Inline } from '@/components/layout/Inline';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

export default function SliderPlayground() {
  const [volume, setVolume] = useState(30);
  const [price, setPrice] = useState(250);
  const [temperature, setTemperature] = useState(22);
  const [opacity, setOpacity] = useState(0.65);
  const [rtlValue, setRtlValue] = useState(40);
  const [invertedValue, setInvertedValue] = useState(70);
  const [verticalValue, setVerticalValue] = useState(50);
  const [disabledValue] = useState(45);
  const [readOnlyValue] = useState(60);
  const [commits, setCommits] = useState<number[]>([]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          Slider
        </Heading>
        <Text variant="lead" color="muted">
          Accessible single-thumb value selector. Drag with pointer, or
          navigate with Arrow (±step), Shift+Arrow (±large step), PageUp/Down,
          Home/End. Supports RTL, vertical orientation, inverted layout, and
          form submission via a hidden input.
        </Text>
        <Inline gap={2} wrap>
          <Badge color="success">role=&quot;slider&quot;</Badge>
          <Badge color="success">APG keyboard</Badge>
          <Badge color="brand">RTL mirror</Badge>
          <Badge color="brand">vertical</Badge>
          <Badge color="default">inverted</Badge>
          <Badge color="default">formatValue</Badge>
          <Badge color="warning">form participation</Badge>
        </Inline>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          1. Basic — uncontrolled
        </Heading>
        <Text variant="body" color="muted">
          Default range 0-100, step 1. Click track to jump, drag thumb, or use
          keyboard.
        </Text>
        <Slider defaultValue={25} aria-label="Basic slider" />
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          2. Controlled — volume
        </Heading>
        <div className={styles.fieldRow}>
          <Inline gap={3} align="center">
            <span id="volume-label" className={styles.fieldLabel}>
              Volume
            </span>
            <span className={styles.valueChip}>{volume}%</span>
          </Inline>
          <Slider
            value={volume}
            onValueChange={setVolume}
            aria-labelledby="volume-label"
            formatValue={(v) => `${v} percent`}
          />
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          3. Custom range + format — price filter
        </Heading>
        <Text variant="body" color="muted">
          Range 0-1000, step 10, Shift+Arrow = ±100.
        </Text>
        <div className={styles.fieldRow}>
          <Inline gap={3} align="center">
            <span id="price-label" className={styles.fieldLabel}>
              Max price
            </span>
            <span className={styles.valueChip}>${price}</span>
          </Inline>
          <Slider
            value={price}
            onValueChange={setPrice}
            min={0}
            max={1000}
            step={10}
            aria-labelledby="price-label"
            formatValue={(v) => `${v} US dollars`}
          />
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          4. Signed range — temperature
        </Heading>
        <Text variant="body" color="muted">
          Range -20 to 40, step 0.5 (fractional step precision).
        </Text>
        <div className={styles.fieldRow}>
          <Inline gap={3} align="center">
            <span id="temp-label" className={styles.fieldLabel}>
              Temperature
            </span>
            <span className={styles.valueChip}>{temperature.toFixed(1)}°C</span>
          </Inline>
          <Slider
            value={temperature}
            onValueChange={setTemperature}
            min={-20}
            max={40}
            step={0.5}
            aria-labelledby="temp-label"
            formatValue={(v) => `${v.toFixed(1)} degrees Celsius`}
          />
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          5. Fractional step — opacity
        </Heading>
        <Text variant="body" color="muted">
          Range 0-1, step 0.05. Tests decimal-step precision safety.
        </Text>
        <div className={styles.fieldRow}>
          <Inline gap={3} align="center">
            <span id="opacity-label" className={styles.fieldLabel}>
              Opacity
            </span>
            <span className={styles.valueChip}>{opacity.toFixed(2)}</span>
          </Inline>
          <Slider
            value={opacity}
            onValueChange={setOpacity}
            min={0}
            max={1}
            step={0.05}
            aria-labelledby="opacity-label"
            formatValue={(v) => `${Math.round(v * 100)} percent opacity`}
          />
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          6. RTL direction (horizontal)
        </Heading>
        <Text variant="body" color="muted">
          With <code>dir=&quot;rtl&quot;</code>, Arrow Left = increase, Arrow
          Right = decrease. Drag + track-click visually mirror. Vertical
          unaffected.
        </Text>
        <div className={styles.fieldRow}>
          <Inline gap={3} align="center">
            <span id="rtl-label" className={styles.fieldLabel}>
              RTL
            </span>
            <span className={styles.valueChip}>{rtlValue}</span>
          </Inline>
          <Slider
            value={rtlValue}
            onValueChange={setRtlValue}
            dir="rtl"
            aria-labelledby="rtl-label"
          />
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          7. Inverted rendering
        </Heading>
        <Text variant="body" color="muted">
          <code>inverted</code> flips visual so max renders at start edge. Value
          semantics unchanged.
        </Text>
        <div className={styles.fieldRow}>
          <Inline gap={3} align="center">
            <span id="inverted-label" className={styles.fieldLabel}>
              Inverted
            </span>
            <span className={styles.valueChip}>{invertedValue}</span>
          </Inline>
          <Slider
            value={invertedValue}
            onValueChange={setInvertedValue}
            inverted
            aria-labelledby="inverted-label"
          />
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          8. Vertical orientation
        </Heading>
        <Text variant="body" color="muted">
          Up = increase, Down = decrease regardless of RTL. Useful for
          volume/brightness sliders in media UIs.
        </Text>
        <div className={styles.verticalRow}>
          <Slider
            value={verticalValue}
            onValueChange={setVerticalValue}
            orientation="vertical"
            aria-label="Vertical value"
          />
          <span className={styles.valueChip}>{verticalValue}</span>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          9. Disabled + readOnly states
        </Heading>
        <Stack gap={4}>
          <div className={styles.fieldRow}>
            <span id="disabled-label" className={styles.fieldLabel}>
              Disabled (aria-disabled, focusable)
            </span>
            <Slider
              value={disabledValue}
              disabled
              aria-labelledby="disabled-label"
            />
          </div>
          <div className={styles.fieldRow}>
            <span id="readonly-label" className={styles.fieldLabel}>
              Read-only (focusable, no changes)
            </span>
            <Slider
              value={readOnlyValue}
              readOnly
              aria-labelledby="readonly-label"
            />
          </div>
        </Stack>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          10. Commit boundary — onValueCommit
        </Heading>
        <Text variant="body" color="muted">
          <code>onValueChange</code> fires on every change (drag + keyboard).
          <code>onValueCommit</code> fires on pointerup + keyboard keyup. Useful
          for debounced API calls.
        </Text>
        <Slider
          defaultValue={50}
          onValueCommit={(v) =>
            setCommits((prev) => [...prev.slice(-4), v])
          }
          aria-label="Commit demo"
        />
        <Text variant="small" color="muted">
          Last commits: {commits.length === 0 ? '(none yet)' : commits.join(' → ')}
        </Text>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          11. Form participation
        </Heading>
        <Text variant="body" color="muted">
          When <code>name</code> prop set, renders hidden{' '}
          <code>&lt;input type=&quot;range&quot;&gt;</code> for native form
          submission. Disabled + required propagate.
        </Text>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            alert(`quality=${formData.get('quality')}`);
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          <div className={styles.fieldRow}>
            <span id="quality-label" className={styles.fieldLabel}>
              Quality
            </span>
            <Slider
              name="quality"
              defaultValue={75}
              min={0}
              max={100}
              required
              aria-labelledby="quality-label"
            />
          </div>
          <button
            type="submit"
            style={{
              alignSelf: 'flex-start',
              padding: 'var(--space-3) var(--space-5)',
              border: '1px solid var(--color-brand)',
              background: 'var(--color-brand)',
              color: 'var(--color-text-inverse)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            Submit
          </button>
        </form>
      </section>
    </main>
  );
}
