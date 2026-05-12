/**
 * date — zero-dep date math helpers for Calendar (E30 CI16) and downstream
 * date components (DatePicker CI17, etc.).
 *
 * Native `Date` + `Intl.DateTimeFormat` only. NO date-fns, dayjs, luxon, moment
 * — per D5 (zero runtime UI deps) and D25 (no external primitives).
 *
 * @layer utils
 * @deps react-free — consumable from server and client modules
 */

// ──────────────────────────────────────────────────────────────────────────
// Locale week-start

/**
 * Fallback week-start per ISO 3166 / CLDR conventions. Used when
 * `Intl.Locale.weekInfo` is unavailable (older browsers / Node < 21) or
 * returns nothing for the given locale.
 *
 * Values: `0` = Sunday, `1` = Monday, `6` = Saturday. Extend as needed — the
 * lookup falls back to base language (e.g. `'en'`) then to ISO default Monday.
 */
export const LOCALE_WEEK_START: Readonly<Record<string, 0 | 1 | 6>> = Object.freeze({
  // Sunday-first (US + Latin America + Japan)
  'en-US': 0,
  'en-CA': 0,
  'es-MX': 0,
  'pt-BR': 0,
  'ja-JP': 0,
  'ko-KR': 0,
  'zh-TW': 0,
  // Saturday-first (Arabic region)
  'ar-SA': 6,
  'ar-EG': 6,
  'he-IL': 0,
  // Monday-first (ISO default — explicit here for common EU locales)
  'en-GB': 1,
  'en-IE': 1,
  'pl-PL': 1,
  'de-DE': 1,
  'de-AT': 1,
  'fr-FR': 1,
  'es-ES': 1,
  'it-IT': 1,
  'nl-NL': 1,
  'pt-PT': 1,
  'sv-SE': 1,
  'fi-FI': 1,
  'da-DK': 1,
  'nb-NO': 1,
  'cs-CZ': 1,
  'sk-SK': 1,
  'hu-HU': 1,
  'ru-RU': 1,
  'uk-UA': 1,
  'zh-CN': 1,
});

/**
 * Resolve week-start day for a locale. Tries `Intl.Locale.weekInfo` first
 * (ES2023, ~90 % browsers 2024+), falls back to the static table, then to
 * ISO default Monday.
 *
 * Returns `0` (Sun), `1` (Mon), or `6` (Sat) — the three real-world values.
 */
export function getWeekStartDay(locale: string): 0 | 1 | 6 {
  try {
    const localeObj = new Intl.Locale(locale);
    // Intl.Locale.prototype.weekInfo — property (spec) OR getWeekInfo() (older polyfill)
    const info =
      (localeObj as unknown as { weekInfo?: { firstDay?: number } }).weekInfo ??
      (localeObj as unknown as { getWeekInfo?: () => { firstDay?: number } }).getWeekInfo?.();
    if (info?.firstDay != null) {
      // CLDR convention: 1 = Mon, 2 = Tue, ..., 7 = Sun
      const day = info.firstDay === 7 ? 0 : info.firstDay;
      if (day === 0 || day === 1 || day === 6) return day;
    }
  } catch {
    // Intl.Locale constructor can throw on invalid tags — fall through to map
  }
  if (LOCALE_WEEK_START[locale] !== undefined) return LOCALE_WEEK_START[locale]!;
  const base = locale.split('-')[0];
  for (const key of Object.keys(LOCALE_WEEK_START)) {
    if (key.startsWith(base + '-') || key === base) return LOCALE_WEEK_START[key]!;
  }
  return 1; // ISO-8601 default
}

// ──────────────────────────────────────────────────────────────────────────
// Arithmetic

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Immutable: returns new Date `n` days after `date`. DST-safe (uses setDate). */
export function addDays(date: Date, n: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + n);
  return result;
}

/**
 * Immutable: returns new Date `n` months after `date`, clamping day-of-month
 * to the last valid day of the target month. Fixes the classic `Jan 31 + 1mo`
 * becoming `Mar 3` bug by setting date to 1 before moving month.
 */
export function addMonths(date: Date, n: number): Date {
  const result = new Date(date);
  const desiredDay = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + n);
  const daysInTarget = getDaysInMonth(result.getFullYear(), result.getMonth());
  result.setDate(Math.min(desiredDay, daysInTarget));
  return result;
}

/** Number of days in a given (year, month) — month is 0-indexed. */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Immutable: first day of month at 00:00 local time. */
export function startOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/** Immutable: last day of month at 23:59:59.999 local time. */
export function endOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  result.setHours(23, 59, 59, 999);
  return result;
}

/** Immutable: first day of week containing `date`, per `weekStart` (0 Sun / 1 Mon / 6 Sat). */
export function startOfWeek(date: Date, weekStart: 0 | 1 | 6): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day - weekStart + 7) % 7;
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/** Immutable: last day of week containing `date`, per `weekStart`. */
export function endOfWeek(date: Date, weekStart: 0 | 1 | 6): Date {
  return addDays(startOfWeek(date, weekStart), 6);
}

/** Immutable: midnight local of the given date — timezone-aware via setHours. */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

// ──────────────────────────────────────────────────────────────────────────
// Comparators

/** True when `a` and `b` fall on the same calendar day (local time). */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** True when `a` and `b` fall in the same calendar month + year. */
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** True when `a` is strictly before `b` at day granularity. */
export function isDateBefore(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

/** True when `a` is strictly after `b` at day granularity. */
export function isDateAfter(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

/** True when `date` is within [min, max] inclusive at day granularity. Missing bound = open. */
export function isDateInRange(date: Date, min?: Date, max?: Date): boolean {
  if (min && isDateBefore(date, min)) return false;
  if (max && isDateAfter(date, max)) return false;
  return true;
}

/**
 * Integer day difference `b - a` at day granularity. Rounds to compensate for
 * DST hours so the result stays accurate across spring-forward / fall-back.
 */
export function diffInDays(a: Date, b: Date): number {
  const aStart = startOfDay(a).getTime();
  const bStart = startOfDay(b).getTime();
  return Math.round((bStart - aStart) / MS_PER_DAY);
}

// ──────────────────────────────────────────────────────────────────────────
// Formatting

/** ISO `yyyy-mm-dd` (timezone-neutral) — safe for `data-*` attrs, URL params, storage. */
export function toIsoDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse `yyyy-mm-dd` into a local-timezone Date at midnight. Returns `null`
 * on malformed input. Does NOT use `new Date(string)` (which interprets ISO
 * strings as UTC and shifts the local day).
 */
export function parseIsoDateString(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]) - 1;
  const d = Number(match[3]);
  const date = new Date(y, m, d);
  if (date.getFullYear() !== y || date.getMonth() !== m || date.getDate() !== d) {
    return null; // guarded against Feb 30 type overflow
  }
  return date;
}

/** Localized month name via `Intl.DateTimeFormat`. */
export function getMonthName(date: Date, locale: string, style: 'long' | 'short' = 'long'): string {
  return new Intl.DateTimeFormat(locale, { month: style }).format(date);
}

/** Localized weekday name via `Intl.DateTimeFormat`. */
export function getWeekdayName(
  date: Date,
  locale: string,
  style: 'long' | 'short' | 'narrow' = 'short',
): string {
  return new Intl.DateTimeFormat(locale, { weekday: style }).format(date);
}

/** Localized month + year header (e.g. "April 2026", "kwiecień 2026"). */
export function formatMonthYear(
  date: Date,
  locale: string,
  monthStyle: 'long' | 'short' = 'long',
): string {
  return new Intl.DateTimeFormat(locale, { month: monthStyle, year: 'numeric' }).format(date);
}

/** Full accessible date (e.g. "Monday, April 20, 2026") — use for cell aria-label. */
export function formatFullDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// ──────────────────────────────────────────────────────────────────────────
// Time (0.18.0 — E01.2 TimeInput)

/**
 * Parse a 24h ISO time string into a `{h, m, s}` tuple. Accepts:
 *   - "HH:MM"     → `{h, m, s: 0}`
 *   - "HH:MM:SS"  → `{h, m, s}`
 *
 * Returns `null` for malformed input or out-of-range values (h > 23, m > 59,
 * s > 59). Validates lexically — does NOT round leap seconds.
 *
 * @example
 *   parseTime('14:30')    // { h: 14, m: 30, s: 0 }
 *   parseTime('09:00:45') // { h: 9, m: 0, s: 45 }
 *   parseTime('25:00')    // null
 *   parseTime('')         // null
 */
export function parseTime(iso: string): { h: number; m: number; s: number } | null {
  if (typeof iso !== 'string' || iso === '') return null;
  const m3 = /^(\d{2}):(\d{2}):(\d{2})$/.exec(iso);
  if (m3) {
    const h = Number(m3[1]);
    const m = Number(m3[2]);
    const s = Number(m3[3]);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59 && s >= 0 && s <= 59) return { h, m, s };
    return null;
  }
  const m2 = /^(\d{2}):(\d{2})$/.exec(iso);
  if (m2) {
    const h = Number(m2[1]);
    const m = Number(m2[2]);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) return { h, m, s: 0 };
    return null;
  }
  return null;
}

/**
 * Format a `{h, m, s?}` tuple as a 24h ISO time string. Zero-padded.
 *   - `withSeconds=false` (default) → `"HH:MM"`
 *   - `withSeconds=true`            → `"HH:MM:SS"` (s defaults to 0 when omitted)
 *
 * Always emits 24h regardless of locale — hourCycle is a DISPLAY concern only.
 *
 * @example
 *   formatTime({ h: 14, m: 30 })                  // "14:30"
 *   formatTime({ h: 9, m: 0, s: 45 }, true)       // "09:00:45"
 *   formatTime({ h: 14, m: 30 }, true)            // "14:30:00"
 */
export function formatTime(
  t: { h: number; m: number; s?: number },
  withSeconds = false,
): string {
  const hh = String(t.h).padStart(2, '0');
  const mm = String(t.m).padStart(2, '0');
  if (withSeconds) {
    const ss = String(t.s ?? 0).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${hh}:${mm}`;
}

/**
 * Clamp a 24h ISO time string to `[min, max]` inclusive. Compares lexically
 * — works because zero-padded `HH:MM[:SS]` is monotonic.
 *
 * Returns the clamped ISO string (unchanged if `min`/`max` omitted or `t`
 * already within range). Does NOT validate `t`, `min`, `max` — caller's
 * responsibility (use `parseTime` first if uncertain).
 *
 * @example
 *   clampTime('08:00', '09:00', '17:00')  // "09:00"
 *   clampTime('14:30', '09:00', '17:00')  // "14:30"
 *   clampTime('18:00', '09:00', '17:00')  // "17:00"
 */
export function clampTime(t: string, min?: string, max?: string): string {
  let result = t;
  if (min && result < min) result = min;
  if (max && result > max) result = max;
  return result;
}

/**
 * Combine a `Date` (date component) with a 24h ISO time string into a new
 * `Date`. Uses `setHours` which is DST-aware: non-existent local times on
 * Spring-forward day get normalized forward (`02:30` on a DST-skip day
 * becomes `03:30`); ambiguous times on Fall-back day pick the first occurrence
 * per JS Date defaults. Document this behavior in caller JSDoc when relevant.
 *
 * Returns a new Date (immutable). Falls back to `new Date(date)` (input
 * cloned, time unchanged) when `time` is malformed.
 *
 * @example
 *   combineDateTime(new Date(2026, 4, 15), '14:30')      // 2026-05-15 14:30:00
 *   combineDateTime(new Date(2026, 4, 15), '09:00:45')   // 2026-05-15 09:00:45
 *   combineDateTime(new Date(2026, 4, 15), 'bogus')      // 2026-05-15 00:00:00 (cloned)
 */
export function combineDateTime(date: Date, time: string): Date {
  const parsed = parseTime(time);
  const result = new Date(date);
  if (!parsed) return result;
  result.setHours(parsed.h, parsed.m, parsed.s, 0);
  return result;
}

/**
 * Format Date as ISO 8601 local datetime string `"YYYY-MM-DDTHH:MM:SS"` —
 * NO timezone suffix. Represents local wall-clock time at the user's device.
 *
 * Server-side parsers MUST treat the string as local naive datetime (NOT UTC).
 * Useful for combining `<DateTimePicker>` value with backend storage that
 * keeps the wall-clock semantic (e.g. meeting at "14:00 local", recurring
 * deadlines).
 *
 * @example
 *   toIsoDateTimeString(new Date(2026, 4, 15, 14, 30, 0))
 *   // → "2026-05-15T14:30:00"
 */
export function toIsoDateTimeString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${mm}:${ss}`;
}

/**
 * Parse ISO 8601 local datetime string `"YYYY-MM-DDTHH:MM:SS"` (no tz suffix)
 * into a local-timezone Date. Returns `null` on malformed input or invalid
 * date/time components. Symmetric counterpart to `toIsoDateTimeString`.
 *
 * Accepts trailing `":SS"` optional → also parses `"YYYY-MM-DDTHH:MM"`.
 *
 * @example
 *   parseIsoDateTimeString('2026-05-15T14:30:00')  // local Date
 *   parseIsoDateTimeString('2026-05-15T14:30')     // local Date (seconds=0)
 *   parseIsoDateTimeString('bogus')                // null
 */
export function parseIsoDateTimeString(iso: string): Date | null {
  if (typeof iso !== 'string' || iso === '') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(iso);
  if (!match || !match[1] || !match[2] || !match[3] || !match[4] || !match[5]) return null;
  const y = Number(match[1]);
  const mo = Number(match[2]) - 1;
  const d = Number(match[3]);
  const h = Number(match[4]);
  const mi = Number(match[5]);
  const s = match[6] ? Number(match[6]) : 0;
  if (
    Number.isNaN(y) ||
    Number.isNaN(mo) ||
    Number.isNaN(d) ||
    Number.isNaN(h) ||
    Number.isNaN(mi) ||
    Number.isNaN(s)
  ) {
    return null;
  }
  if (mo < 0 || mo > 11 || d < 1 || d > 31) return null;
  if (h < 0 || h > 23 || mi < 0 || mi > 59 || s < 0 || s > 59) return null;
  const dt = new Date(y, mo, d, h, mi, s, 0);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== mo ||
    dt.getDate() !== d
  ) {
    return null;
  }
  return dt;
}

/**
 * Resolve display hour cycle for a locale.
 *
 * Maps `Intl.DateTimeFormat(locale).resolvedOptions().hourCycle`:
 *   - `'h11'` / `'h12'` → `'12h'` (am/pm cultures: en-US, en-CA, en-AU, etc.)
 *   - `'h23'` / `'h24'` → `'24h'` (24h cultures: pl-PL, de-DE, fr-FR, etc.)
 *
 * Falls back to `hour12` boolean when `hourCycle` is unset (older browsers),
 * then to `'24h'` on any throw (invalid locale tag).
 *
 * @example
 *   resolveHourCycle('en-US')  // '12h'
 *   resolveHourCycle('pl-PL')  // '24h'
 *   resolveHourCycle('ja-JP')  // '24h'
 */
export function resolveHourCycle(locale: string): '12h' | '24h' {
  try {
    const opts = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions();
    const hc = (opts as { hourCycle?: string }).hourCycle;
    if (hc === 'h11' || hc === 'h12') return '12h';
    if (hc === 'h23' || hc === 'h24') return '24h';
    return opts.hour12 ? '12h' : '24h';
  } catch {
    return '24h';
  }
}
