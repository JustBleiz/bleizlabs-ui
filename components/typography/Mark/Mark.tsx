import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import styles from './Mark.module.scss';

/**
 * Mark — inline highlight atom.
 *
 * Renders `<mark>` with token-driven highlight styling for search-result
 * matches, diff-style emphasis, and quoted inline excerpts. Native HTML
 * semantics — assistive tech announces "highlighted" on supporting screen
 * readers, plain inline text otherwise.
 *
 * @layer   typography (atom)
 * @tokens  `--color-{warning,brand,success,error}-{subtle,strong}` semantic
 *          tokens. Tones remap two CSS custom properties (`--mark-bg`,
 *          `--mark-fg`) so a single rule set handles every tone. Default
 *          tone matches the native `<mark>` warning-soft pairing.
 * @deps    Slot (asChild boundary), cn.
 * @a11y    Native `<mark>` element carries the accessible role on supporting
 *          AT. The visual highlight is decorative when used purely for
 *          aesthetic emphasis — in that case use `asChild` onto `<span>` to
 *          avoid spurious announcements. For search highlighting prefer the
 *          default tag so "found match" semantics survive.
 *
 * @example search highlight
 * <Text>
 *   Witaj <Mark>świecie</Mark>, dzień dobry.
 * </Text>
 *
 * @example brand tone for editorial emphasis
 * <Mark color="brand">kluczowa fraza</Mark>
 *
 * @example decorative on span (no AT announcement)
 * <Mark asChild>
 *   <span>tylko wizualnie</span>
 * </Mark>
 */
export type MarkColor = 'default' | 'brand' | 'success' | 'warning' | 'error';

export interface MarkProps extends HTMLAttributes<HTMLElement> {
  /** Semantic color. Default `'default'` (warning-subtle, native browser pair). */
  color?: MarkColor;
  /** Render as the single child element via Slot. Default `false`. */
  asChild?: boolean;
  /** Highlighted content. */
  children: ReactNode;
}

const COLOR_CLASS: Record<MarkColor, string> = {
  default: styles.colorDefault!,
  brand: styles.colorBrand!,
  success: styles.colorSuccess!,
  warning: styles.colorWarning!,
  error: styles.colorError!,
};

export const Mark = forwardRef<HTMLElement, MarkProps>(function Mark(
  { color = 'default', asChild = false, className, children, ...rest },
  ref,
) {
  const Comp = asChild ? Slot : 'mark';
  return (
    <Comp ref={ref as never} className={cn(styles.root, COLOR_CLASS[color], className)} {...rest}>
      {children}
    </Comp>
  );
});
