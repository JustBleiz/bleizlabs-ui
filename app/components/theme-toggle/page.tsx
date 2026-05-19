import Link from 'next/link';
import { ThemeToggle } from '@/components/specialized/ThemeToggle';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

export default function ThemeTogglePlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          ThemeToggle
        </Heading>
        <p className={styles.intro}>
          Single-button light/dark theme switcher. Built on the lib <code>Button</code> atom (
          <code>variant=&quot;ghost&quot;</code> <code>size=&quot;sm&quot;</code>{' '}
          <code>iconOnly</code>) with inline sun/moon SVGs. The <code>&lt;html data-theme&gt;</code>{' '}
          attribute is the single source of truth — the component subscribes via{' '}
          <code>useSyncExternalStore</code> + <code>MutationObserver</code>, persists to{' '}
          <code>localStorage</code>, and syncs across tabs via the <code>storage</code> event. Zero
          runtime UI dependencies.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Default — drop into any toolbar
        </Heading>
        <Text variant="small" color="secondary">
          Click to flip <code>data-theme</code> on <code>&lt;html&gt;</code> and watch every
          token-driven surface in the page repaint live.
        </Text>
        <div className={styles.frame}>
          <ThemeToggle />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. i18n — Polish locale via aria-label override
        </Heading>
        <Text variant="small" color="secondary">
          Consumers passing a custom <code>aria-label</code> get a static localized string instead
          of the default dynamic English label. Same icon swap, same persistence, same DOM contract.
        </Text>
        <div className={styles.frame}>
          <ThemeToggle aria-label="Przełącz motyw" />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Custom storage key
        </Heading>
        <Text variant="small" color="secondary">
          Useful when a project hosts multiple <code>@bleizlabs/ui</code> surfaces that should keep
          independent theme preferences (e.g., marketing site + admin panel served from the same
          origin). Cross-tab sync still works — it scopes by <code>storageKey</code>.
        </Text>
        <div className={styles.frame}>
          <ThemeToggle storageKey="playground:theme-toggle:demo" />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. Light-default product (defaultTheme override)
        </Heading>
        <Text variant="small" color="secondary">
          When <code>&lt;html&gt;</code> has no <code>data-theme</code> attribute set yet (no
          pre-hydration script), the SSR fallback follows <code>defaultTheme</code>. Useful for
          marketing surfaces that ship light-mode-first.
        </Text>
        <div className={styles.frame}>
          <ThemeToggle defaultTheme="light" aria-label="Toggle theme" />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. Inside a toolbar row (composition example)
        </Heading>
        <Text variant="small" color="secondary">
          ThemeToggle drops into any horizontal layout — its Button atom inherits the surrounding
          flex / inline rhythm. The touch target stays 44×44 px on coarse pointers (WCAG 2.2 AAA).
        </Text>
        <div className={styles.frame}>
          <div className={styles.toolbar}>
            <span className={styles.toolbarLabel}>Toolbar</span>
            <ThemeToggle />
          </div>
        </div>
      </section>
    </main>
  );
}
