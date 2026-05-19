import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import styles from './Eyebrow.module.scss';

/**
 * Eyebrow — small uppercase atelier label with optional numeric prefix.
 *
 * Distinct from `<Text variant="caption" uppercase>` because the atelier
 * eyebrow couples four concerns (0.7rem font / 0.08em tracking / tabular-nums
 * digits / optional numbered prefix with hairline connector) which would
 * require 4 new Text props. Factoring as its own component keeps Text lean.
 *
 * @layer   typography
 * @deps    Slot (asChild boundary), cn.
 * @tokens  --color-text-muted (default), --color-text-secondary,
 *          --color-text-primary, --color-brand-strong (index-tint on strong tone),
 *          --space-2 (gap between index/hairline/label),
 *          --font-secondary, --font-weight-medium.
 *          Component-local literals (0.7rem font / 0.08em letter-spacing /
 *          14px hairline) are atelier vocabulary signatures, intentionally
 *          NOT tokenised — they define the eyebrow scale itself.
 *
 * @a11y    Renders `<span>` by default (inline neutral). The numeric prefix
 *          and hairline connector are decorative (`aria-hidden="true"`) —
 *          the accessible name comes from the label children alone.
 *          Use `asChild` to project onto a different element when paragraph
 *          (`<p>`) or labelling (`<label>`) semantics are needed.
 *
 * @example
 * <Eyebrow>Total cost</Eyebrow>
 *
 * <Eyebrow index={1}>Configure profile</Eyebrow>
 * // Renders: 01 ─── CONFIGURE PROFILE
 *
 * <Eyebrow index="A" tone="strong">Alpha track</Eyebrow>
 *
 * <Eyebrow asChild>
 *   <label htmlFor="status">Filter status</label>
 * </Eyebrow>
 */
export type EyebrowTone = 'muted' | 'secondary' | 'strong';

export interface EyebrowProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * Optional numeric or alphabetic prefix rendered before the label with a
   * hairline connector. Numbers are zero-padded to 2 digits (1 → "01").
   * Strings render verbatim ("A", "II", "i"). Decorative — the label
   * children carry the accessible name.
   */
  index?: number | string;
  /**
   * Color tier. Default `'muted'`.
   * `'secondary'` for nav contexts, `'strong'` for emphatic section markers.
   */
  tone?: EyebrowTone;
  /** Render as the single child element via Slot. Default `false`. */
  asChild?: boolean;
  /** Eyebrow label content. */
  children: ReactNode;
}

const TONE_CLASS: Record<EyebrowTone, string> = {
  muted: styles.toneMuted!,
  secondary: styles.toneSecondary!,
  strong: styles.toneStrong!,
};

function formatIndex(index: number | string): string {
  if (typeof index === 'number') {
    return index >= 0 && index < 10 ? `0${index}` : String(index);
  }
  return index;
}

export const Eyebrow = forwardRef<HTMLSpanElement, EyebrowProps>(function Eyebrow(
  { index, tone = 'muted', asChild = false, className, children, ...rest },
  ref,
) {
  const Comp = asChild ? Slot : 'span';
  const hasIndex = index !== undefined && index !== null && index !== '';

  return (
    <Comp
      ref={ref}
      className={cn(styles.root, TONE_CLASS[tone], hasIndex && styles.withIndex, className)}
      {...rest}
    >
      {hasIndex ? (
        <>
          <span aria-hidden="true" className={styles.index}>
            {formatIndex(index)}
          </span>
          <span aria-hidden="true" className={styles.hairline} />
        </>
      ) : null}
      <span className={styles.label}>{children}</span>
    </Comp>
  );
});
