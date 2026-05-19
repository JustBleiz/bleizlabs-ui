'use client';

import { forwardRef, useEffect, useMemo, useRef, useState, type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import styles from './AnimatedCounter.module.scss';

/**
 * AnimatedCounter — count-up animation from 0 to a target value (Phase 6 P3).
 *
 * @layer   atom (specialized)
 * @tokens  --color-text-primary (inherited), font tokens inherited from context
 * @deps    cn, React: `forwardRef`, `useState`, `useEffect`, `useRef`,
 *          `useMemo`, type import `HTMLAttributes<HTMLSpanElement>`;
 *          native `Intl.NumberFormat` (zero deps per D25)
 * @a11y    Renders `<span>` with **no role** and **no `aria-live`** —
 *          rapidly-changing intermediate values would spam assistive tech.
 *          SR users hear the final static text after animation completes.
 *          Users with `prefers-reduced-motion: reduce` jump straight to the
 *          final value without animation (checked via `matchMedia` inside
 *          `useEffect` so SSR stays clean).
 * @notes   Animation uses `requestAnimationFrame` + an eased `easeOutCubic`
 *          curve (`1 - (1 - t)^3`). `rafId` is cancelled on every effect
 *          cleanup so value / duration / start changes reset cleanly
 *          without leaking frame callbacks. The initial client render
 *          matches SSR (displays `0` before the first paint) which avoids
 *          hydration mismatches.
 *
 * @example
 * <AnimatedCounter value={12500} prefix="$" suffix=" PLN" duration={1500} />
 *
 * <AnimatedCounter value={98.5} suffix="%" decimals={1} locale="en-US" />
 *
 * <AnimatedCounter value={145} suffix="h" start={isVisible} />
 */
export interface AnimatedCounterProps extends HTMLAttributes<HTMLSpanElement> {
  /** Target numeric value the counter animates toward. */
  value: number;
  /** Gate the animation. When `false`, counter stays at `0`. Default `true`. */
  start?: boolean;
  /** Static prefix rendered before the number (e.g. `"$"`). */
  prefix?: string;
  /** Static suffix rendered after the number (e.g. `" PLN"`, `"%"`). */
  suffix?: string;
  /** Animation duration in ms. Default `1500`. */
  duration?: number;
  /** Fraction digits passed to `Intl.NumberFormat`. Default `0`. */
  decimals?: number;
  /** BCP 47 locale tag. Default `'pl-PL'`. */
  locale?: string;
}

const DEFAULT_DURATION = 1500;
const DEFAULT_LOCALE = 'pl-PL';

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export const AnimatedCounter = forwardRef<HTMLSpanElement, AnimatedCounterProps>(
  function AnimatedCounter(
    {
      value,
      start = true,
      prefix,
      suffix,
      duration = DEFAULT_DURATION,
      decimals = 0,
      locale = DEFAULT_LOCALE,
      className,
      ...rest
    },
    ref,
  ) {
    // `animated` is only meaningful while `start=true`. When `start=false`,
    // we derive the display value as 0 directly in render — no setState
    // inside the effect (avoids react-hooks/set-state-in-effect).
    const [animated, setAnimated] = useState(0);
    const rafRef = useRef<number | null>(null);

    const formatter = useMemo(() => {
      try {
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      } catch {
        return new Intl.NumberFormat(DEFAULT_LOCALE, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      }
    }, [locale, decimals]);

    useEffect(() => {
      if (!start) {
        return;
      }

      const prefersReduced =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced || duration <= 0) {
        // Defer setState into a rAF callback so react-hooks does not flag
        // synchronous setState-in-effect. A single frame delay is invisible.
        rafRef.current = requestAnimationFrame(() => {
          setAnimated(value);
          rafRef.current = null;
        });
        return () => {
          if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
        };
      }

      const startValue = 0;
      const deltaValue = value - startValue;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = easeOutCubic(progress);
        setAnimated(startValue + deltaValue * eased);
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setAnimated(value);
          rafRef.current = null;
        }
      };

      rafRef.current = requestAnimationFrame(tick);

      return () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };
    }, [value, duration, start]);

    const display = start ? animated : 0;
    const formatted = formatter.format(display);

    return (
      <span ref={ref} className={cn(styles.root, className)} {...rest}>
        {prefix}
        {formatted}
        {suffix}
      </span>
    );
  },
);
