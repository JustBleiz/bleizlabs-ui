import { useSyncExternalStore } from 'react';

/**
 * useResolvedLocale — SSR-safe BCP 47 locale detection for form inputs.
 *
 * Mirrors `useMatchMedia` pattern: `useSyncExternalStore` for tear-free
 * reads, deterministic server snapshot, browser-event subscription on the
 * client.
 *
 * Server snapshot returns `'en-US'` (deterministic, locale-neutral
 * baseline). Client snapshot returns `navigator.language` after hydration.
 * React reconciles the post-hydration value via the standard
 * `useSyncExternalStore` flow — first paint matches SSR, then the
 * locale-correct format takes over without a hydration warning.
 *
 * The `languagechange` event fires when the user changes browser language
 * preferences mid-session (rare but supported).
 *
 * Used by NumberInput and PhoneInput as the locale-defaults runtime
 * fallback. Other inputs that depend on locale-aware formatting can adopt
 * this hook without re-implementing the SSR-safe shell.
 *
 * Zero-dependency — uses only React + native `navigator.language`.
 *
 * @example
 * ```tsx
 * function NumberInput({ locale: explicit }: { locale?: string }) {
 *   const locale = useResolvedLocale(explicit);
 *   const formatted = new Intl.NumberFormat(locale).format(value);
 *   // ...
 * }
 * ```
 */
const SERVER_FALLBACK = 'en-US';

function subscribe(notify: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('languagechange', notify);
  return () => window.removeEventListener('languagechange', notify);
}

function getSnapshot(): string {
  if (typeof navigator === 'undefined') return SERVER_FALLBACK;
  return navigator.language || SERVER_FALLBACK;
}

function getServerSnapshot(): string {
  return SERVER_FALLBACK;
}

export function useResolvedLocale(explicit?: string): string {
  const detected = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return explicit ?? detected;
}
