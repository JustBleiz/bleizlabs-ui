import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { type BadgeColor } from '../Badge';
import styles from './EdgeBar.module.scss';

/**
 * EdgeBar — absolute-positioned colored stripe along one edge of a `position:
 * relative` parent. Phase 3 Display atom (server-safe, decorative).
 *
 * @layer   atom (display)
 * @tokens  --color-{brand,success,warning,error,info}, --color-border-strong
 *          (default), --color-surface-raised (default bg), --easing-default,
 *          local `edgeBarPulse` keyframe (2s opacity cycle)
 * @deps    cn, React: `forwardRef`, type import `HTMLAttributes<HTMLSpanElement>`,
 *          `BadgeColor` enum (reused — single source of truth for the 6-color
 *          Display-atom palette: default / brand / success / warning / error /
 *          info).
 * @a11y    Renders `<span>` by default — purely decorative. Color alone never
 *          conveys meaning. The bar exists to *reinforce* a status signal that
 *          must already be in the parent context (text label, icon, heading).
 *          No `role`, no `aria-*` attributes — adding `aria-label` here would
 *          create a phantom landmark on a visual decorator. If the consumer
 *          needs a screen-reader announcement, that label belongs on the
 *          parent component, not on EdgeBar.
 * @notes   PARENT REQUIREMENT — wrapping element MUST set `position: relative`
 *          (or any non-`static` positioning context). EdgeBar uses `position:
 *          absolute` and anchors to the parent's nearest positioned ancestor.
 *          Without this, the bar will escape its intended container and dock
 *          against the viewport.
 *
 *          PULSE — local `@keyframes edgeBarPulse` mirrors the Dot/Checkbox/
 *          RadioGroup precedent (CSS Modules scope keyframe identifiers, so
 *          referencing a global `pulse` from `_animations.scss` silently
 *          no-ops under Turbopack + Next.js 16). The `prefers-reduced-motion:
 *          reduce` guard lives in the same SCSS block.
 *
 *          THICKNESS — sm/md/lg = 2/3/4px. These are component-internal
 *          decorator dimensions outside the lib's 4px spacing scale (D9);
 *          per D28, hardcoded `@raw-px-ok` is the canonical exemption.
 *
 * @example
 * // Top accent on a Card (most common — alert/highlight pattern).
 * // Consumer SCSS: .alertCard { position: relative; }
 * <Card className={styles.alertCard}>
 *   <EdgeBar position="top" color="success" />
 *   <CardBody>...</CardBody>
 * </Card>
 *
 * @example
 * // Left-edge indicator on a list row (selected state).
 * // Consumer SCSS: .row { position: relative; }
 * <div className={styles.row}>
 *   <EdgeBar position="left" color="brand" thickness="lg" />
 *   <RowContent />
 * </div>
 *
 * @example
 * // Pulsing alert accent (respects prefers-reduced-motion).
 * // Consumer SCSS: .incidentCard { position: relative; }
 * <Card className={styles.incidentCard}>
 *   <EdgeBar position="top" color="error" pulse />
 *   <CardBody>System offline</CardBody>
 * </Card>
 */
export type EdgeBarPosition = 'top' | 'left' | 'right' | 'bottom';

export type EdgeBarColor = BadgeColor;

export type EdgeBarThickness = 'sm' | 'md' | 'lg';

export interface EdgeBarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Edge of the positioned parent to which the bar anchors. Default `'top'`. */
  position?: EdgeBarPosition;
  /** Semantic color. Default `'default'` (neutral). Reuses Badge's 6-color palette. */
  color?: EdgeBarColor;
  /** Visual thickness (sm=2px, md=3px, lg=4px). Default `'md'`. */
  thickness?: EdgeBarThickness;
  /** Infinite opacity pulse animation (inherits reduced-motion guard). Default `false`. */
  pulse?: boolean;
}

const POSITION_CLASS: Record<EdgeBarPosition, string> = {
  top: styles.positionTop!,
  left: styles.positionLeft!,
  right: styles.positionRight!,
  bottom: styles.positionBottom!,
};

const COLOR_CLASS: Record<EdgeBarColor, string> = {
  default: styles.colorDefault!,
  brand: styles.colorBrand!,
  success: styles.colorSuccess!,
  warning: styles.colorWarning!,
  error: styles.colorError!,
  info: styles.colorInfo!,
};

const THICKNESS_CLASS: Record<EdgeBarThickness, string> = {
  sm: styles.thicknessSm!,
  md: styles.thicknessMd!,
  lg: styles.thicknessLg!,
};

export const EdgeBar = forwardRef<HTMLSpanElement, EdgeBarProps>(function EdgeBar(
  { position = 'top', color = 'default', thickness = 'md', pulse = false, className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        styles.root,
        POSITION_CLASS[position],
        COLOR_CLASS[color],
        THICKNESS_CLASS[thickness],
        pulse && styles.pulse,
        className,
      )}
      {...rest}
    />
  );
});
