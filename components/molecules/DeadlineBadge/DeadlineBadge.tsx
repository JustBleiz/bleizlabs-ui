'use client';

import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
} from 'react';
import { Badge, type BadgeColor } from '@/components/display/Badge';
import { Text } from '@/components/typography/Text';
import { cn } from '@/components/utils/cn';
import styles from './DeadlineBadge.module.scss';

/**
 * DeadlineBadge — relative countdown badge (Phase 7 M6, `'use client'`).
 *
 * @layer   molecule
 * @tokens  --space-2 (used in .root gap; color tokens are applied by
 *          Badge atom's variants, not directly here)
 * @deps    Badge atom (color, asChild), Text atom (caption), cn,
 *          native `Intl.RelativeTimeFormat` + `Intl.DateTimeFormat`,
 *          React: `forwardRef`, `useState`, `useEffect`, `useMemo`
 * @a11y    The relative countdown is wrapped in a semantic `<time
 *          dateTime={iso}>` element via Badge's `asChild` projection —
 *          assistive tech exposes both the ISO machine-readable value
 *          AND the human-readable relative label. Color is decorative;
 *          the word "overdue" / "za 2 dni" etc. carries the meaning.
 * @notes   **Hydration-safe pattern:** during SSR and the first client
 *          render we display the absolute date (`toLocaleDateString`)
 *          so server and client output match exactly. A `useEffect`
 *          recomputes the relative label after hydration, swapping to
 *          `"za 3 dni"` / `"yesterday"` / etc. This avoids
 *          hydration-mismatch warnings on `Date.now()` differing
 *          between server and client. Thresholds: `diffDays < 0` →
 *          `error` badge (overdue), `<= urgentThreshold` → `warning`,
 *          otherwise → `success`. The static `Intl.RelativeTimeFormat`
 *          handles natural phrasing for `numeric: 'auto'` (e.g.
 *          `'today'` / `'tomorrow'` / `'yesterday'` instead of `'in 0
 *          days'`).
 *
 * @example
 * <DeadlineBadge deadline="2026-04-20" />
 *
 * <DeadlineBadge
 *   deadline={order.dueAt}
 *   label="Deadline:"
 *   locale="en-US"
 *   urgentThreshold={5}
 * />
 */
export interface DeadlineBadgeProps extends HTMLAttributes<HTMLDivElement> {
  /** Target deadline — ISO string or `Date` object. */
  deadline: string | Date;
  /** Optional visible prefix rendered as a caption (e.g. `"Deadline:"`). */
  label?: string;
  /** BCP 47 locale for `Intl.RelativeTimeFormat`. Default `'pl-PL'`. */
  locale?: string;
  /**
   * Days remaining at which the badge switches from `success` →
   * `warning`. Default `3`. Overdue (`< 0`) always maps to `error`.
   */
  urgentThreshold?: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDeadline(deadline: string | Date): Date | null {
  const parsed = deadline instanceof Date ? deadline : new Date(deadline);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function resolveColor(
  diffDays: number,
  urgentThreshold: number,
): BadgeColor {
  if (diffDays < 0) return 'error';
  if (diffDays <= urgentThreshold) return 'warning';
  return 'success';
}

export const DeadlineBadge = forwardRef<HTMLDivElement, DeadlineBadgeProps>(
  function DeadlineBadge(
    {
      deadline,
      label,
      locale = 'pl-PL',
      urgentThreshold = 3,
      className,
      ...rest
    },
    ref,
  ) {
    const parsed = useMemo(() => parseDeadline(deadline), [deadline]);
    const [diffDays, setDiffDays] = useState<number | null>(null);

    useEffect(() => {
      if (parsed === null) {
        return;
      }
      // Defer setState into a rAF callback so react-hooks does not flag
      // synchronous setState-in-effect (same pattern as AnimatedCounter).
      const rafId = requestAnimationFrame(() => {
        const ms = parsed.getTime() - Date.now();
        setDiffDays(Math.round(ms / MS_PER_DAY));
      });
      return () => cancelAnimationFrame(rafId);
    }, [parsed]);

    const relativeFormatter = useMemo(() => {
      try {
        return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      } catch {
        return new Intl.RelativeTimeFormat('pl-PL', { numeric: 'auto' });
      }
    }, [locale]);

    const absoluteFormatter = useMemo(() => {
      try {
        return new Intl.DateTimeFormat(locale, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      } catch {
        return new Intl.DateTimeFormat('pl-PL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }
    }, [locale]);

    if (parsed === null) {
      return null;
    }

    const iso = parsed.toISOString();
    const absoluteText = absoluteFormatter.format(parsed);

    // `diffDays` is computed inside a `useEffect` (see above) so that
    // `Date.now()` is never called during render — this keeps the
    // component hydration-safe and compliant with React's purity rules.
    const color: BadgeColor =
      diffDays === null
        ? 'default'
        : resolveColor(diffDays, urgentThreshold);

    const displayText =
      diffDays === null
        ? absoluteText
        : relativeFormatter.format(diffDays, 'day');

    return (
      <div ref={ref} className={cn(styles.root, className)} {...rest}>
        {label ? (
          <Text variant="caption" color="muted" className={styles.label}>
            {label}
          </Text>
        ) : null}
        <Badge asChild color={color}>
          <time dateTime={iso}>{displayText}</time>
        </Badge>
      </div>
    );
  },
);
