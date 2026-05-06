'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { Button } from '../../interactive/Button';
import styles from './ThemeToggle.module.scss';

/**
 * ThemeToggle — single-button light/dark theme switcher (Phase 6 Specialized).
 *
 * @layer   atom (specialized)
 * @tokens  --color-text-primary (icon stroke via `currentColor`),
 *          tokens consumed transitively through the Button atom
 *          (variant=ghost / size=sm) — `--color-surface-raised`,
 *          `--focus-ring`, `--space-{2,3}`, `--duration-fast`,
 *          `--easing-default`. No new tokens introduced.
 * @deps    Button (composition: `variant="ghost" size="sm" iconOnly`),
 *          cn, React: `useCallback`, `useMemo`, `useSyncExternalStore`.
 *          Zero runtime UI dependencies (D5/D25) — sun/moon icons are
 *          inline SVGs defined in this file.
 * @a11y    Renders the lib Button atom which forwards to a native
 *          `<button>` (focusable + keyboard semantics for free). The
 *          accessible name is a dynamic `aria-label` reflecting the
 *          NEXT state ("Switch to light theme" / "Switch to dark
 *          theme") — consumers can override via the `aria-label` prop
 *          for i18n. The icon is decorative (`aria-hidden="true"`,
 *          `focusable="false"`); the label carries the meaning.
 *          `aria-pressed` is intentionally NOT used: this is a
 *          click-to-toggle action button, not a stateful toggle widget
 *          (cf. WAI-ARIA APG `/button/` "button that toggles state"
 *          vs. `/switch/`). Visual feedback (icon swap) is sufficient.
 *          Touch target 44×44 + focus-visible ring inherited from
 *          Button atom (`@include mx.touch-target` + `@include
 *          mx.focus-ring` per D13).
 * @notes   State strategy: the `<html>` `data-theme` attribute is the
 *          single source of truth. `useSyncExternalStore` subscribes
 *          to a `MutationObserver` on that attribute (covers ALL
 *          mutation paths: this component, settings pages, cross-tab
 *          via the storage-event bridge below, programmatic dev-tools
 *          changes). `localStorage` is best-effort persistence with
 *          try/catch (private-mode safe). Cross-tab sync: a `storage`
 *          event in tab B triggers a `setAttribute` on tab A's `<html>`
 *          which the MutationObserver picks up. The component renders
 *          consistently on server (`getServerSnapshot` returns
 *          `defaultTheme`) and re-renders on client mount once the
 *          MutationObserver subscribes — `suppressHydrationWarning`
 *          on the Button absorbs the expected initial-paint mismatch.
 *
 *          Pre-hydration script (consumer responsibility) MUST live in
 *          `<head>` of `app/layout.tsx` to prevent FOUC:
 *
 *          ```tsx
 *          <script dangerouslySetInnerHTML={{
 *            __html: `(function(){try{var t=localStorage.getItem('bleizlabs-ui:theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`
 *          }} />
 *          ```
 *
 *          Animation: v1 ships hard icon swap (no transition). The
 *          `prefers-reduced-motion` guard structure exists in
 *          `ThemeToggle.module.scss` as a scaffold for a future v1.x
 *          icon-morph enhancement; the current build has no animation
 *          to guard.
 *
 * @example
 * // Default — drop into any toolbar / app shell:
 * <ThemeToggle />
 *
 * // Polish locale + custom storage key:
 * <ThemeToggle
 *   aria-label="Przełącz motyw"
 *   storageKey="my-app:theme"
 * />
 *
 * // SSR initial-render override (e.g., light-default product):
 * <ThemeToggle defaultTheme="light" />
 */
export type Theme = 'light' | 'dark';

export interface ThemeToggleProps {
  /**
   * `localStorage` key for theme persistence + cross-tab sync.
   * Default `'bleizlabs-ui:theme'`. Must match the key used by the
   * consumer's pre-hydration script in `<head>`.
   */
  storageKey?: string;
  /**
   * SSR / first-mount fallback theme used by `getServerSnapshot` and
   * when the `<html>` `data-theme` attribute is unset. Default `'dark'`
   * (matches the lib's `<html data-theme="dark">` default).
   */
  defaultTheme?: Theme;
  /** Class forwarded to the underlying Button root. */
  className?: string;
  /**
   * Override for the dynamic `aria-label`. When omitted, an English
   * label is generated from the next state ("Switch to light theme" /
   * "Switch to dark theme"). i18n consumers should provide a localized
   * static label.
   */
  'aria-label'?: string;
}

const DEFAULT_STORAGE_KEY = 'bleizlabs-ui:theme';

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function readDomTheme(defaultTheme: Theme): Theme {
  const current = document.documentElement.getAttribute('data-theme');
  if (current === 'light' || current === 'dark') return current;
  return defaultTheme;
}

export function ThemeToggle({
  storageKey = DEFAULT_STORAGE_KEY,
  defaultTheme = 'dark',
  className,
  'aria-label': ariaLabelOverride,
}: ThemeToggleProps) {
  const subscribe = useMemo(
    () => (callback: () => void) => {
      // Cross-tab bridge — storage event in another tab triggers a
      // local setAttribute, which the MutationObserver below picks up
      // (single re-render path).
      const onStorage = (event: StorageEvent) => {
        if (event.key !== storageKey) return;
        const next = event.newValue;
        if (next === 'light' || next === 'dark') {
          document.documentElement.setAttribute('data-theme', next);
        }
      };

      const observer = new MutationObserver(callback);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });

      window.addEventListener('storage', onStorage);

      return () => {
        observer.disconnect();
        window.removeEventListener('storage', onStorage);
      };
    },
    [storageKey],
  );

  const getSnapshot = useCallback(
    () => readDomTheme(defaultTheme),
    [defaultTheme],
  );

  const getServerSnapshot = useCallback(() => defaultTheme, [defaultTheme]);

  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      window.localStorage.setItem(storageKey, next);
    } catch {
      // Private mode / quota exceeded — persistence is best-effort.
      // Toggle still works for the current tab via setAttribute above.
    }
  }, [theme, storageKey]);

  const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
  const label = ariaLabelOverride ?? `Switch to ${nextTheme} theme`;

  return (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      icon={
        <span className={styles.icon}>
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </span>
      }
      onClick={toggle}
      aria-label={label}
      className={className}
      suppressHydrationWarning
    />
  );
}
