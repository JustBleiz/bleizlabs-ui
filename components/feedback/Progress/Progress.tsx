import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './Progress.module.scss';

/**
 * Progress — step indicator OR percent progress bar.
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
 * @tokens  --color-brand, --color-brand-subtle, --color-brand-strong,
 *          --color-info, --color-success-strong, --color-warning-strong,
 *          --color-error-strong,
 *          --color-surface, --color-surface-raised, --color-border-subtle,
 *          --color-text-{primary,secondary},
 *          --space-{1,2}, --font-size-xs, --font-weight-{medium,semibold},
 *          --letter-spacing-wider, --radius-full,
 *          --duration-normal, --easing-default.
 *          Component-local `--progress-value` (set via tsx inline style as
 *          percent string) drives `.bar` width in percent mode — design-token
 *          channel, not a token itself.
 *
 * @a11y    Stages mode: `<ol aria-label={label}>` + `<li aria-current="step">`
 *          on active stage. Completed and pending stages carry no role/state
 *          beyond their text — `aria-label` scopes the list for SR.
 *          Percent mode: `role="progressbar"` + `aria-valuenow` + `aria-valuemin`
 *          + `aria-valuemax` + `aria-label` for the accessible name.
 *          Non-interactive by design — no keyboard handling (display-only).
 *
 * @example
 * // Stages mode
 * <Progress
 *   label="Project progress"
 *   stages={['Planning', 'Design', 'Development', 'Testing']}
 *   currentStage={1}
 * />
 *
 * // Percent mode
 * <Progress label="File upload" value={65} max={100} />
 */

/**
 * Visual rendering mode for stages-mode Progress.
 *
 * - `pills` (default): numbered circular pill per stage with label inside.
 *   Best for short multi-step flows (3-5 stages) where each stage's status
 *   is referenced individually.
 * - `track`: flat horizontal segmented bar — equal-width segments touch
 *   edge-to-edge, labels render below. Best for longer pipelines (4-8
 *   stages) and project timelines where the overall arc matters more than
 *   per-stage iconography. Numbered index is hidden in this mode.
 */
export type ProgressStageDisplayMode = 'pills' | 'track';

/**
 * Per-bar color for percent-mode Progress.
 *
 * - `brand` (default).
 * - `info` / `success-strong` / `warning-strong`: align with semantic
 *   meaning for multi-phase progress panels (info, success, warning).
 * - `error-strong`: negative-state metrics (failure rate, escalation,
 *   churn, declining KPIs).
 *
 * Stages mode is unaffected — semantic stage colors live in the
 * `.stageActive`/`.stageCompleted` rules and use brand throughout.
 */
export type ProgressPercentColor =
  | 'brand'
  | 'info'
  | 'success-strong'
  | 'warning-strong'
  | 'error-strong';

type ProgressStagesProps = {
  /** Stage names rendered as pills in an `<ol>`. When set, `currentStage` is required and `value`/`max` must NOT be set. */
  stages: string[];
  /** Zero-indexed active stage. Must satisfy `0 ≤ currentStage < stages.length`. */
  currentStage: number;
  /** Visual rendering mode for stages. Default `'pills'`. See `ProgressStageDisplayMode`. */
  displayMode?: ProgressStageDisplayMode;
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
  /**
   * Bar color. Default `'brand'`. See {@link ProgressPercentColor}.
   */
  color?: ProgressPercentColor;
  /** Forbidden in percent mode. */
  stages?: never;
  /** Forbidden in percent mode. */
  currentStage?: never;
};

type ProgressVariant = ProgressStagesProps | ProgressPercentProps;

export type ProgressProps = ProgressVariant &
  Omit<HTMLAttributes<HTMLDivElement>, 'aria-label'> & {
    /** Accessible name for the progress indicator (required). Used as `aria-label` on the root. Examples: `"File upload"`, `"Project progress"`. */
    label: string;
  };

type ProgressPropsFlat = Omit<HTMLAttributes<HTMLDivElement>, 'aria-label'> & {
  label: string;
  stages?: string[];
  currentStage?: number;
  displayMode?: ProgressStageDisplayMode;
  value?: number;
  max?: number;
  color?: ProgressPercentColor;
};

const PERCENT_COLOR_CLASS: Record<ProgressPercentColor, string> = {
  brand: styles.colorBrand!,
  info: styles.colorInfo!,
  'success-strong': styles.colorSuccessStrong!,
  'warning-strong': styles.colorWarningStrong!,
  'error-strong': styles.colorErrorStrong!,
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
      displayMode,
      value,
      max,
      color,
      ...domProps
    } = props as ProgressPropsFlat;

    // Stages mode
    if (stages !== undefined) {
      const resolvedDisplayMode: ProgressStageDisplayMode =
        displayMode ?? 'pills';
      const modeClass =
        resolvedDisplayMode === 'track'
          ? styles.modeStagesTrack
          : styles.modeStages;

      return (
        <div
          ref={ref}
          className={cn(styles.root, modeClass, className)}
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

    const resolvedColor: ProgressPercentColor = color ?? 'brand';

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        className={cn(
          styles.root,
          styles.modePercent,
          PERCENT_COLOR_CLASS[resolvedColor],
          className,
        )}
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
