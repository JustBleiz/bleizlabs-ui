'use client';

import { useState } from 'react';
import {
  Carousel,
  CarouselViewport,
  CarouselSlide,
  CarouselPrev,
  CarouselNext,
  CarouselPause,
} from '@/components/complex/Carousel';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import { Stack } from '@/components/layout/Stack';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

const GRADIENT_SLIDES = [
  { bg: 'linear-gradient(135deg, #1e293b, #334155)', title: 'Slide One' },
  { bg: 'linear-gradient(135deg, #0f172a, #1e40af)', title: 'Slide Two' },
  { bg: 'linear-gradient(135deg, #134e4a, #0f766e)', title: 'Slide Three' },
  { bg: 'linear-gradient(135deg, #7c2d12, #c2410c)', title: 'Slide Four' },
  { bg: 'linear-gradient(135deg, #581c87, #7e22ce)', title: 'Slide Five' },
];

export default function CarouselPlayground() {
  const [controlledIndex, setControlledIndex] = useState(0);
  const [lastAutoIndex, setLastAutoIndex] = useState(0);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          Carousel
        </Heading>
        <Text variant="lead" color="muted">
          Content slider with optional auto-rotation, pointer drag, and
          keyboard navigation. Pauses automatically on hover, focus, tab
          visibility loss, or reduced-motion preference — and exposes an
          explicit pause button whenever auto-rotation is active.
        </Text>
        <Inline gap={2} wrap>
          <Badge color="success">role=&quot;region&quot;</Badge>
          <Badge color="success">APG keyboard</Badge>
          <Badge color="brand">WCAG 2.2.2 pause</Badge>
          <Badge color="brand">WCAG 1.4.13 hover-pause</Badge>
          <Badge color="default">RTL mirror</Badge>
          <Badge color="default">loop</Badge>
        </Inline>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          1. Basic — uncontrolled, manual nav only
        </Heading>
        <Text variant="body" color="muted">
          Default linear clamp (Prev disabled at first, Next disabled at last).
          Drag the slide left/right, click nav buttons, or use keyboard arrows
          when viewport focused.
        </Text>
        <Carousel aria-label="Basic gallery" defaultIndex={0}>
          <CarouselViewport>
            {GRADIENT_SLIDES.map((slide) => (
              <CarouselSlide key={slide.title}>
                <div
                  className={styles.demoSlide}
                  style={{ background: slide.bg }}
                >
                  <span>{slide.title}</span>
                </div>
              </CarouselSlide>
            ))}
          </CarouselViewport>
          <Inline gap={2} className={styles.controlsRow}>
            <CarouselPrev />
            <CarouselNext />
          </Inline>
        </Carousel>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          2. Auto-rotate + pause control (WCAG 2.2.2)
        </Heading>
        <Text variant="body" color="muted">
          Rotates every 3 seconds. Pauses on hover, on keyboard focus, on tab
          hidden, on <code>prefers-reduced-motion: reduce</code>. Pause button
          (first in tab order per APG) offers manual override — once pressed,
          rotation stays paused until re-pressed.
        </Text>
        <Carousel
          aria-label="Auto-rotating showcase"
          autoRotate
          autoRotateInterval={3000}
          onIndexChange={setLastAutoIndex}
        >
          <Inline gap={2} className={styles.controlsRow}>
            <CarouselPause />
            <CarouselPrev />
            <CarouselNext />
          </Inline>
          <CarouselViewport>
            {GRADIENT_SLIDES.map((slide) => (
              <CarouselSlide key={slide.title}>
                <div
                  className={styles.demoSlide}
                  style={{ background: slide.bg }}
                >
                  <span>{slide.title}</span>
                </div>
              </CarouselSlide>
            ))}
          </CarouselViewport>
          <Text variant="small" color="muted">
            Last auto-advance fired for index {lastAutoIndex}.
          </Text>
        </Carousel>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          3. Infinite loop
        </Heading>
        <Text variant="body" color="muted">
          <code>loop</code> enables wrap-around: Prev from first → wraps to
          last; Next from last → wraps to first. Nav buttons never disable.
        </Text>
        <Carousel aria-label="Looping testimonials" loop>
          <CarouselViewport>
            {GRADIENT_SLIDES.slice(0, 3).map((slide) => (
              <CarouselSlide key={slide.title}>
                <div
                  className={styles.demoSlide}
                  style={{ background: slide.bg }}
                >
                  <span>{slide.title}</span>
                </div>
              </CarouselSlide>
            ))}
          </CarouselViewport>
          <Inline gap={2} className={styles.controlsRow}>
            <CarouselPrev />
            <CarouselNext />
          </Inline>
        </Carousel>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          4. Controlled
        </Heading>
        <Text variant="body" color="muted">
          Parent owns index. Clicking dots syncs external state; carousel
          respects prop updates. Compose your own picker UI on top of the
          controlled API.
        </Text>
        <Carousel
          aria-label="Controlled gallery"
          index={controlledIndex}
          onIndexChange={setControlledIndex}
        >
          <CarouselViewport>
            {GRADIENT_SLIDES.map((slide) => (
              <CarouselSlide key={slide.title}>
                <div
                  className={styles.demoSlide}
                  style={{ background: slide.bg }}
                >
                  <span>{slide.title}</span>
                </div>
              </CarouselSlide>
            ))}
          </CarouselViewport>
          <Inline gap={3} className={styles.controlsRow}>
            <CarouselPrev />
            <CarouselNext />
            <Inline gap={1} className={styles.dots}>
              {GRADIENT_SLIDES.map((slide, i) => (
                <button
                  key={slide.title}
                  type="button"
                  className={styles.dot}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-pressed={controlledIndex === i}
                  onClick={() => setControlledIndex(i)}
                />
              ))}
            </Inline>
          </Inline>
        </Carousel>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          5. RTL direction
        </Heading>
        <Text variant="body" color="muted">
          With <code>dir=&quot;rtl&quot;</code>, ArrowLeft = Next, ArrowRight =
          Previous (mirror APG convention). Drag direction visually mirrors too.
        </Text>
        <Carousel aria-label="RTL demo" dir="rtl">
          <CarouselViewport>
            {GRADIENT_SLIDES.slice(0, 3).map((slide) => (
              <CarouselSlide key={slide.title}>
                <div
                  className={styles.demoSlide}
                  style={{ background: slide.bg }}
                >
                  <span>{slide.title}</span>
                </div>
              </CarouselSlide>
            ))}
          </CarouselViewport>
          <Inline gap={2} className={styles.controlsRow}>
            <CarouselPrev />
            <CarouselNext />
          </Inline>
        </Carousel>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          6. Singleton carousel (edge case)
        </Heading>
        <Text variant="body" color="muted">
          Single slide: nav buttons both disabled, pause hidden, drag disabled.
          Valid structural state during content loading.
        </Text>
        <Carousel aria-label="Single slide">
          <CarouselViewport>
            <CarouselSlide>
              <div
                className={styles.demoSlide}
                style={{ background: 'linear-gradient(135deg, #1e293b, #475569)' }}
              >
                <span>Only Slide</span>
              </div>
            </CarouselSlide>
          </CarouselViewport>
          <Inline gap={2} className={styles.controlsRow}>
            <CarouselPrev />
            <CarouselNext />
          </Inline>
        </Carousel>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          7. Drag disabled
        </Heading>
        <Text variant="body" color="muted">
          <code>dragEnabled={'{false}'}</code> disables pointer drag. Keyboard
          arrow + button nav still works. Useful for slides with clickable
          content where drag would interfere.
        </Text>
        <Carousel aria-label="Button-only nav" dragEnabled={false}>
          <CarouselViewport>
            {GRADIENT_SLIDES.slice(0, 3).map((slide) => (
              <CarouselSlide key={slide.title}>
                <Stack gap={3} className={styles.textSlide}>
                  <Heading level={3} size="lg">
                    {slide.title}
                  </Heading>
                  <Text variant="body">
                    Rich content with clickable links: visit{' '}
                    <a href="#nowhere">this link</a> without accidentally
                    triggering slide nav.
                  </Text>
                </Stack>
              </CarouselSlide>
            ))}
          </CarouselViewport>
          <Inline gap={2} className={styles.controlsRow}>
            <CarouselPrev />
            <CarouselNext />
          </Inline>
        </Carousel>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          8. Announce auto-rotation (opt-in live region)
        </Heading>
        <Text variant="body" color="muted">
          By default, the live region is silent during auto-rotation to avoid
          SR chatter. Set <code>announceAutoRotate</code> to announce each
          auto-advance as &quot;Slide N of M&quot; — useful when the carousel is the
          primary content and rotation itself is meaningful.
        </Text>
        <Carousel
          aria-label="Announced auto-rotation"
          autoRotate
          autoRotateInterval={4000}
          announceAutoRotate
          loop
        >
          <Inline gap={2} className={styles.controlsRow}>
            <CarouselPause />
            <CarouselPrev />
            <CarouselNext />
          </Inline>
          <CarouselViewport>
            {GRADIENT_SLIDES.map((slide) => (
              <CarouselSlide key={slide.title}>
                <div
                  className={styles.demoSlide}
                  style={{ background: slide.bg }}
                >
                  <span>{slide.title}</span>
                </div>
              </CarouselSlide>
            ))}
          </CarouselViewport>
        </Carousel>
      </section>
    </main>
  );
}
