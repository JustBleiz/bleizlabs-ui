import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './Progress.module.scss';

/**
 * Progress — step indicator OR percent progress bar (Phase 5 F3).
 *
 * Discriminated union — exactly one of two modes at a time:
 *
 *   • **Stages mode** — `stages: string[]` + `currentStage: number`. Renders
 *     a horizontal pill strip (`<ol aria-label>`) with `aria-current="step"`
 *     on the active stage. Use for project timelines, multi-step flows.
 *
 *   • **Percent mode** — `value: number` + optional `max` (default 100).
 *     Renders a linear bar (`role="progressbar"` + `aria-valuenow/min/max`).
 *     Use for file upload, task completion, quota meters.
 *
 * @layer   atom (feedback)
 * @tokens  --color-brand, --color-brand-subtle, --color-brand-strong,
 *          --color-surface, --color-surface-raised, --color-border-subtle,
 *          --color-text-{primary,secondary},
 *          --space-{1,2}, --font-size-xs, --font-weight-{medium,semibold},
 *          --letter-spacing-wider, --radius-full,
 *          --duration-normal, --easing-default.
 *          Component-local `--progress-value` (set via tsx inline style as
 *          percent string) drives `.bar` width in percent mode — design-token
 *          channel, not a token itself.
 * @deps    cn, React: `forwardRef`, type imports `CSSProperties`,
 *          `HTMLAttributes<HTMLDivElement>`
 * @a11y    Stages mode: `<ol aria-label={label}>` + `<li aria-current="step">`
 *          on active stage. Completed and pending stages carry no role/state
 *          beyond their text — `aria-label` scopes the list for SR.
 *          Percent mode: `role="progressbar"` + `aria-valuenow` + `aria-valuemin`
 *          + `aria-valuemax` + `aria-label` for the accessible name.
 *          Non-interactive by design — no keyboard handling (display-only).
 * @notes   Width injection uses a CSS custom property (`--progress-value`)
 *          set via inline `style` — this is NOT an inline style rule; it's
 *          a CSS variable channel (the same pattern Stack uses for
 *          `--stack-gap`). The actual `width` declaration lives in
 *          `.bar` in the SCSS module. The percent is clamped to [0, 100]
 *          in JS so assistive tech sees sane `aria-valuenow` values.
 *          Internal type hygiene: `ProgressPropsFlat` is an internal
 *          non-exported flat shape used purely for destructuring the
 *          discriminated union (`ProgressStagesProps | ProgressPercentProps`)
 *          in a single statement. Call-site type safety is enforced by the
 *          exported `ProgressProps` discriminated union; the runtime guard
 *          `stages !== undefined` re-establishes the mode after the flat
 *          cast, so the cast is safe by construction.
 *
 * @example
 * // Stages mode
 * <Progress
 *   label="Postęp projektu"
 *   stages={['Planowanie', 'Projekt', 'Development', 'Testy']}
 *   currentStage={1}
 * />
 *
 * // Percent mode
 * <Progress label="Upload pliku" value={65} max={100} />
 */

type ProgressStagesProps = {
  /** Stage names rendered as pills in an `<ol>`. When set, `currentStage` is required and `value`/`max` must NOT be set. */
  stages: string[];
  /** Zero-indexed active stage. Must satisfy `0 ≤ currentStage < stages.length`. */
  currentStage: number;
  /** Forbidden in stages mode. */
  value?: never;
  /** Forbidden in stages mode. */
  max?: never;
};

type ProgressPercentProps = {
  /** Current progress value (clamped to `[0, max]`). */
  value: number;
  /** Upper bound for `value`. Default `100`. */
  max?: number;
  /** Forbidden in percent mode. */
  stages?: never;
  /** Forbidden in percent mode. */
  currentStage?: never;
};

type ProgressVariant = ProgressStagesProps | ProgressPercentProps;

export type ProgressProps = ProgressVariant &
  Omit<HTMLAttributes<HTMLDivElement>, 'aria-label'> & {
    /** Accessible name for the progress indicator (required). Used as `aria-label` on the root. Examples: `"Upload pliku"`, `"Postęp projektu"`. */
    label: string;
  };

type ProgressPropsFlat = Omit<HTMLAttributes<HTMLDivElement>, 'aria-label'> & {
  label: string;
  stages?: string[];
  currentStage?: number;
  value?: number;
  max?: number;
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  function Progress(props, ref) {
    // Cast discriminated union to a flat shape so TS allows a single
    // destructure that strips every discriminant from the DOM spread.
    // Runtime `stages !== undefined` guard re-establishes the mode.
    const {
      label,
      className,
      stages,
      currentStage,
      value,
      max,
      ...domProps
    } = props as ProgressPropsFlat;

    // Stages mode
    if (stages !== undefined) {
      return (
        <div
          ref={ref}
          className={cn(styles.root, styles.modeStages, className)}
          {...domProps}
        >
          <ol aria-label={label} className={styles.stageList}>
            {stages.map((stageLabel, index) => {
              const isActive = index === currentStage;
              const isCompleted = index < (currentStage ?? 0);
              const stateClass = isActive
                ? styles.stageActive
                : isCompleted
                  ? styles.stageCompleted
                  : styles.stagePending;

              return (
                <li
                  key={`${index}-${stageLabel}`}
                  aria-current={isActive ? 'step' : undefined}
                  className={cn(styles.stageItem, stateClass)}
                >
                  <span className={styles.stageIndex}>{index + 1}</span>
                  <span className={styles.stageLabel}>{stageLabel}</span>
                </li>
              );
            })}
          </ol>
        </div>
      );
    }

    // Percent mode — clamp to [0, max], fall back to 100 on invalid max
    const resolvedMax = max ?? 100;
    const safeMax = resolvedMax > 0 ? resolvedMax : 100;
    const rawValue = value ?? 0;
    const clamped = Math.max(0, Math.min(safeMax, rawValue));
    const percent = (clamped / safeMax) * 100;
    const cssVars = { '--progress-value': `${percent}%` } as CSSProperties;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        className={cn(styles.root, styles.modePercent, className)}
        style={cssVars}
        {...domProps}
      >
        <div className={styles.track}>
          <div className={styles.bar} />
        </div>
      </div>
    );
  },
);
