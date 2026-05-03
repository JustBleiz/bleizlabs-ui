import { useSyncExternalStore } from 'react';

/**
 * useResolvedLocale — SSR-safe BCP 47 locale detection for form inputs.
 *
 * @extracted Cluster 5 (E04, primitive-purity-sweep) per `bleizlabs-ui`
 * v0.7.0 batch. Mirrors `useMatchMedia` pattern: `useSyncExternalStore`
 * for tear-free reads, deterministic server snapshot, browser-event
 * subscription on the client.
 *
 * @pattern Server snapshot returns `'en-US'` (deterministic, locale-
 * neutral baseline). Client snapshot returns `navigator.language` after
 * hydration. React reconciles the post-hydration value via the standard
 * `useSyncExternalStore` flow — first paint matches SSR, then the
 * locale-correct format takes over without a hydration warning.
 *
 * @subscription `languagechange` event fires when the user changes
 * browser language preferences mid-session (rare but supported).
 *
 * @consumers NumberInput + PhoneInput (locale defaults runtime fallback,
 * audit-approved 2026-05-03 option (c)). Other inputs that depend on
 * locale-aware formatting can adopt this hook without re-implementing
 * the SSR-safe shell.
 *
 * @example
 * ```tsx
 * function NumberInput({ locale: explicit }: { locale?: string }) {
 *   const locale = useResolvedLocale(explicit);
 *   const formatted = new Intl.NumberFormat(locale).format(value);
 *   // ...
 * }
 * ```
 *
 * @serverSnapshot Always `'en-US'`. Server-rendered Intl output uses
 * this fallback; client takes over post-hydration. Acceptable per audit
 * — flicker is bounded to one frame on first interaction page load.
 *
 * @zero-dep Per D5/D25. Uses only React + native `navigator.language`.
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
