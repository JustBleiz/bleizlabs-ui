'use client';

/**
 * toastStore — module-scoped event emitter + `useSyncExternalStore` bridge
 * for zero-dep global toast queue.
 *
 * React Provider-less by design: consumers call imperative `toast("saved")`
 * from anywhere (event handlers, module scope, outside React tree), not via
 * a hook. Classic React "external store" pattern per React 18+ docs.
 *
 * Timer lifecycle: each toast owns a `setTimeout` handle stored in
 * `timerMap`. Dismissal clears the handle before splicing the toast from
 * the queue. Visibility-change (tab backgrounded) + hover/focus on any
 * toast pauses ALL timers; resume restarts with remaining duration.
 *
 * SSR: `getServerSnapshot` returns a frozen empty array reference so
 * server HTML is always "no toasts"; hydration matches when Toaster
 * mounts client-side with the same initial empty state.
 *
 * @layer complex-interactive (Phase 10 CI15 — notification-layer sub-family)
 * @deps zero runtime deps per D5/D25. Native `setTimeout` + module-scoped
 *   state + React `useSyncExternalStore`. No event-emitter libraries.
 */

import { useSyncExternalStore } from 'react';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  /** Button label. */
  label: string;
  /**
   * Fires when user clicks. Return value is ignored (fire-and-forget) —
   * widened to `unknown` so consumers can inline expressions like
   * `onClick: () => toast.success('undone')` without TS complaining about
   * the discarded string return.
   */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => unknown;
  /** Close the toast after onClick fires. Default `true`. */
  dismissOnClick?: boolean;
}

export interface ToastOptions {
  /** Explicit id for dedup. When present, subsequent calls with same id UPDATE existing toast instead of appending. */
  id?: string;
  /** Visual variant. Default `'default'`. Drives ARIA role + live politeness + color + icon. */
  variant?: ToastVariant;
  /** Primary title (required for most patterns). */
  title?: React.ReactNode;
  /** Optional supporting body. */
  description?: React.ReactNode;
  /** Optional action button. */
  action?: ToastAction;
  /** Optional leading icon override (replaces variant default). */
  icon?: React.ReactNode;
  /** Show close X button. Default `true`. */
  closable?: boolean;
  /**
   * Auto-dismiss duration in ms. Default `4000`. Use `Infinity` to make the
   * toast sticky (requires manual dismiss via close button or action).
   */
  duration?: number;
  /** Fires when toast is dismissed manually (close click OR dismiss() call). */
  onDismiss?: (id: string) => void;
  /** Fires when auto-dismiss timer expires (NOT manual). */
  onAutoClose?: (id: string) => void;
}

export interface ToastItem extends Required<
  Pick<ToastOptions, 'id' | 'variant' | 'closable' | 'duration'>
> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastAction;
  icon?: React.ReactNode;
  onDismiss?: (id: string) => void;
  onAutoClose?: (id: string) => void;
  /** Monotonic timestamp (ms) for stack ordering. */
  createdAt: number;
  /** Remaining ms when paused. Null when running. */
  remainingOnPause: number | null;
}

// ──────────────────────────────────────────────────────────────────────────
// Module-scoped state

type Listener = (toasts: ReadonlyArray<ToastItem>) => void;

let queue: ReadonlyArray<ToastItem> = [];
const listeners = new Set<Listener>();
const timerMap = new Map<
  string,
  { handle: ReturnType<typeof setTimeout>; startedAt: number; duration: number }
>();
let isPausedGlobally = false;
let idCounter = 0;

const FALLBACK_DURATION = 4000;
let globalDefaultDuration = FALLBACK_DURATION;

/**
 * Wired by `<Toaster duration>` (E02 audit fix — the prop was a silent no-op).
 * Single-Toaster contract: last mounted/updated Toaster wins; its unmount
 * resets to the 4000ms fallback. Per-toast `duration` always overrides.
 */
export function setGlobalDefaultDuration(ms?: number): void {
  globalDefaultDuration = ms ?? FALLBACK_DURATION;
}

const EMPTY_SNAPSHOT: ReadonlyArray<ToastItem> = Object.freeze([]);

function emit(): void {
  for (const listener of listeners) listener(queue);
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ReadonlyArray<ToastItem> {
  return queue;
}

function getServerSnapshot(): ReadonlyArray<ToastItem> {
  return EMPTY_SNAPSHOT;
}

function generateId(): string {
  idCounter += 1;
  return `toast-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

function scheduleAutoDismiss(item: ToastItem): void {
  if (item.duration === Infinity || item.duration <= 0) return;
  if (isPausedGlobally) {
    // Defer — will be scheduled on resume using remainingOnPause.
    return;
  }
  const handle = setTimeout(() => {
    timerMap.delete(item.id);
    const existing = queue.find((t) => t.id === item.id);
    if (existing) existing.onAutoClose?.(item.id);
    removeFromQueue(item.id);
  }, item.duration);
  timerMap.set(item.id, { handle, startedAt: Date.now(), duration: item.duration });
}

function clearTimerFor(id: string): void {
  const existing = timerMap.get(id);
  if (existing) {
    clearTimeout(existing.handle);
    timerMap.delete(id);
  }
}

function removeFromQueue(id: string): void {
  const next = queue.filter((t) => t.id !== id);
  if (next.length === queue.length) return;
  queue = Object.freeze(next);
  emit();
}

// ──────────────────────────────────────────────────────────────────────────
// Queue mutations

function upsert(partial: ToastOptions): string {
  const id = partial.id ?? generateId();
  const existing = queue.find((t) => t.id === id);

  const duration = partial.duration ?? existing?.duration ?? globalDefaultDuration;

  const next: ToastItem = {
    id,
    variant: partial.variant ?? existing?.variant ?? 'default',
    title: partial.title ?? existing?.title,
    description: partial.description ?? existing?.description,
    action: partial.action ?? existing?.action,
    icon: partial.icon ?? existing?.icon,
    closable: partial.closable ?? existing?.closable ?? true,
    duration,
    onDismiss: partial.onDismiss ?? existing?.onDismiss,
    onAutoClose: partial.onAutoClose ?? existing?.onAutoClose,
    createdAt: existing?.createdAt ?? Date.now(),
    // E02 audit fix: a toast created OR updated while globally paused must
    // carry its remaining time, or resumeAllTimers skips it (null) and it
    // never auto-dismisses. Infinity/<=0 stay null — the store's sticky
    // semantic (also covers toast.promise loading state).
    remainingOnPause:
      isPausedGlobally && Number.isFinite(duration) && duration > 0 ? duration : null,
  };

  // Reset timer on update — duration counts from the latest call.
  clearTimerFor(id);

  const nextQueue = existing ? queue.map((t) => (t.id === id ? next : t)) : [...queue, next];
  queue = Object.freeze(nextQueue);
  emit();

  scheduleAutoDismiss(next);
  return id;
}

function dismissOne(id: string): void {
  const existing = queue.find((t) => t.id === id);
  if (!existing) return;
  clearTimerFor(id);
  existing.onDismiss?.(id);
  removeFromQueue(id);
}

function dismissAll(): void {
  for (const t of queue) {
    clearTimerFor(t.id);
    t.onDismiss?.(t.id);
  }
  queue = EMPTY_SNAPSHOT;
  emit();
}

// ──────────────────────────────────────────────────────────────────────────
// Global pause/resume (hover over toaster, focus, visibilitychange)

export function pauseAllTimers(): void {
  if (isPausedGlobally) return;
  isPausedGlobally = true;
  const now = Date.now();
  const remaining = new Map<string, number>();
  for (const [id, entry] of timerMap) {
    const elapsed = now - entry.startedAt;
    const rest = Math.max(0, entry.duration - elapsed);
    remaining.set(id, rest);
    clearTimeout(entry.handle);
  }
  timerMap.clear();
  // Store remaining on the items themselves so future queue updates preserve it.
  queue = Object.freeze(
    queue.map((t) => ({ ...t, remainingOnPause: remaining.get(t.id) ?? t.remainingOnPause })),
  );
  emit();
}

export function resumeAllTimers(): void {
  if (!isPausedGlobally) return;
  isPausedGlobally = false;
  for (const t of queue) {
    const rest = t.remainingOnPause;
    if (rest != null && rest > 0 && Number.isFinite(t.duration)) {
      const tempItem: ToastItem = { ...t, duration: rest };
      scheduleAutoDismiss(tempItem);
    }
  }
  // Clear remainingOnPause markers.
  queue = Object.freeze(queue.map((t) => ({ ...t, remainingOnPause: null })));
  emit();
}

// ──────────────────────────────────────────────────────────────────────────
// Public hook (rarely used by consumers — Toaster uses it internally)

export function useToastQueue(): ReadonlyArray<ToastItem> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ──────────────────────────────────────────────────────────────────────────
// Imperative API — the primary surface

type MessageOrOptions = string | ToastOptions;

function normalize(input: MessageOrOptions, variantDefault?: ToastVariant): ToastOptions {
  if (typeof input === 'string') {
    return variantDefault ? { title: input, variant: variantDefault } : { title: input };
  }
  return variantDefault ? { variant: variantDefault, ...input } : input;
}

type ToastFn = ((input: MessageOrOptions) => string) & {
  success: (input: MessageOrOptions) => string;
  error: (input: MessageOrOptions) => string;
  warning: (input: MessageOrOptions) => string;
  info: (input: MessageOrOptions) => string;
  promise: <T>(
    promise: Promise<T>,
    opts: {
      loading: MessageOrOptions;
      success: MessageOrOptions | ((value: T) => MessageOrOptions);
      error: MessageOrOptions | ((reason: unknown) => MessageOrOptions);
    },
  ) => Promise<T>;
  dismiss: (id?: string) => void;
  /** Current queue snapshot. Rarely needed; prefer `useToastQueue` in React. */
  getQueue: () => ReadonlyArray<ToastItem>;
};

function baseToast(input: MessageOrOptions): string {
  return upsert(normalize(input));
}

export const toast: ToastFn = Object.assign(baseToast, {
  success: (input: MessageOrOptions) => upsert(normalize(input, 'success')),
  error: (input: MessageOrOptions) => upsert(normalize(input, 'error')),
  warning: (input: MessageOrOptions) => upsert(normalize(input, 'warning')),
  info: (input: MessageOrOptions) => upsert(normalize(input, 'info')),
  promise: <T>(
    promise: Promise<T>,
    opts: {
      loading: MessageOrOptions;
      success: MessageOrOptions | ((value: T) => MessageOrOptions);
      error: MessageOrOptions | ((reason: unknown) => MessageOrOptions);
    },
  ): Promise<T> => {
    const id = upsert({
      ...normalize(opts.loading),
      duration: Infinity,
      variant: 'info',
    });
    return promise.then(
      (value) => {
        const nextOpts = typeof opts.success === 'function' ? opts.success(value) : opts.success;
        upsert({ ...normalize(nextOpts, 'success'), id });
        return value;
      },
      (reason) => {
        const nextOpts = typeof opts.error === 'function' ? opts.error(reason) : opts.error;
        upsert({ ...normalize(nextOpts, 'error'), id });
        throw reason;
      },
    );
  },
  dismiss: (id?: string) => {
    if (id === undefined) dismissAll();
    else dismissOne(id);
  },
  getQueue: () => queue,
});
