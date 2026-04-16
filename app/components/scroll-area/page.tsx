'use client';

import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaCorner,
} from '@/components/complex/ScrollArea';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import { Badge } from '@/components/display/Badge';
import styles from './page.module.scss';

const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

function longParagraphs(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `${i + 1}. ${LOREM}`);
}

function TallTable({ rows }: { rows: number }) {
  return (
    <table className={styles.demoTable}>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Status</th>
          <th>Value</th>
          <th>Detail column A</th>
          <th>Detail column B</th>
          <th>Detail column C</th>
          <th>Detail column D</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            <td>Item {i + 1}</td>
            <td>{i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Pending' : 'Archived'}</td>
            <td>${((i + 1) * 13.37).toFixed(2)}</td>
            <td>lorem ipsum {i}</td>
            <td>dolor sit amet</td>
            <td>consectetur elit</td>
            <td>adipiscing {i}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ScrollAreaPlayground() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Heading level={1} size="2xl">
          ScrollArea — Phase 10 CI20
        </Heading>
        <Text variant="lead" color="muted">
          Custom-scrollbar wrapper preserving native scroll behavior. 5 compound
          flat exports (ScrollArea + Viewport + Scrollbar + Thumb + Corner).
          Zero-dep pointer drag (3rd consumer — Slider E33 + Carousel E34).
          Native keyboard scroll (PageUp/Dn/Arrow/Home/End/Space) works via
          viewport <code>tabIndex=0</code>; scrollbars are VISUAL + POINTER-DRAG
          only.
        </Text>
        <Inline gap={2} wrap>
          <Badge color="success">native scroll preserved</Badge>
          <Badge color="success">keyboard on viewport</Badge>
          <Badge color="brand">ResizeObserver</Badge>
          <Badge color="brand">auto-hide</Badge>
          <Badge color="default">RTL</Badge>
          <Badge color="warning">3rd drag-gesture consumer</Badge>
        </Inline>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          1. Basic — auto-default children
        </Heading>
        <Text variant="body" color="muted">
          Bare <code>&lt;ScrollArea&gt;</code> auto-renders viewport + both
          scrollbars + corner. Default visibility <code>scroll</code> (visible
          while scrolling, auto-hides after 600ms linger).
        </Text>
        <ScrollArea className={styles.fixedBox}>
          <div className={styles.verticalContent}>
            {longParagraphs(8).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </ScrollArea>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          2. Visibility: always
        </Heading>
        <Text variant="body" color="muted">
          Scrollbar always visible. Useful for design tools and developer UIs
          where persistent scroll indication matters.
        </Text>
        <ScrollArea className={styles.fixedBox} visibility="always">
          <div className={styles.verticalContent}>
            {longParagraphs(6).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </ScrollArea>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          3. Visibility: hover
        </Heading>
        <Text variant="body" color="muted">
          Scrollbar appears only on pointer-enter over the root. Desktop
          minimalist mode; touch devices never see scrollbars (no hover).
        </Text>
        <ScrollArea className={styles.fixedBox} visibility="hover">
          <div className={styles.verticalContent}>
            {longParagraphs(6).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </ScrollArea>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          4. Visibility: auto (touch-aware)
        </Heading>
        <Text variant="body" color="muted">
          Desktop (<code>pointer: fine</code>) → visible on scroll/hover. Touch
          (<code>pointer: coarse</code>) → scrollbars entirely hidden, native
          mobile scrollbars take over.
        </Text>
        <ScrollArea className={styles.fixedBox} visibility="auto">
          <div className={styles.verticalContent}>
            {longParagraphs(6).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </ScrollArea>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          5. Horizontal scroll (wide table)
        </Heading>
        <Text variant="body" color="muted">
          Wide table triggers horizontal scrollbar only. Vertical scrollbar
          auto-hidden because content fits vertically.
        </Text>
        <ScrollArea
          className={styles.wideBox}
          visibility="always"
        >
          <TallTable rows={8} />
        </ScrollArea>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          6. Both axes + corner cell
        </Heading>
        <Text variant="body" color="muted">
          Wide + tall content triggers both scrollbars with corner cell at
          intersection. Each scrollbar drags independently; track click pages
          by one viewport dimension.
        </Text>
        <ScrollArea
          className={styles.fixedBox}
          visibility="always"
        >
          <TallTable rows={40} />
        </ScrollArea>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          7. Content fits — no scrollbars
        </Heading>
        <Text variant="body" color="muted">
          When content fits within viewport, scrollbars don&apos;t render. Clean
          state, no dead scroll affordance.
        </Text>
        <ScrollArea className={styles.fixedBox} visibility="always">
          <div className={styles.verticalContent}>
            <p>Single short paragraph that easily fits.</p>
          </div>
        </ScrollArea>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="xl">
          8. Explicit composition
        </Heading>
        <Text variant="body" color="muted">
          Opt into explicit slot composition for custom scrollbar structure.
          Omit <code>ScrollAreaCorner</code> if content can&apos;t scroll both
          axes simultaneously.
        </Text>
        <ScrollArea className={styles.fixedBox} visibility="always">
          <ScrollAreaViewport>
            <div className={styles.verticalContent}>
              {longParagraphs(8).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar orientation="vertical">
            <ScrollAreaThumb />
          </ScrollAreaScrollbar>
          <ScrollAreaScrollbar orientation="horizontal">
            <ScrollAreaThumb />
          </ScrollAreaScrollbar>
          <ScrollAreaCorner />
        </ScrollArea>
      </section>
    </main>
  );
}
