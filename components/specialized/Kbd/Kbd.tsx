import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/components/utils/cn';
import styles from './Kbd.module.scss';

/**
 * Kbd — keyboard shortcut key display (Phase 6 P8, Tier B, server-safe).
 *
 * @layer   atom (specialized)
 * @tokens  --color-surface-raised, --color-border, --color-text-primary,
 *          --space-{1,2}, --font-mono, --font-size-{xs,sm},
 *          --font-weight-medium, --line-height-snug, --radius-sm
 * @deps    cn, React: `forwardRef`, type imports
 *          `HTMLAttributes<HTMLElement>`, `ReactNode`
 * @a11y    Renders the native semantic `<kbd>` element, which assistive
 *          tech already announces as "keyboard input". No extra ARIA
 *          roles or labels are added — the native element is its own
 *          accessible marker. Consumers pass the key label as `children`
 *          (e.g. `Ctrl`, `⌘`, `Enter`, `↑`, `K`). Combinations are the
 *          consumer's responsibility (e.g. wrap multiple `Kbd` elements
 *          with `+` separators in a parent `<span>`).
 * @notes   Zero platform detection — the atom stays agnostic. Consumers
 *          decide whether to render `Ctrl+K` or `⌘K` based on their app
 *          context (per E11 design decision). Outlined pill styling uses
 *          `--font-mono` so platform glyphs (`⌘`, `⌥`, `↑`) render in a
 *          monospace font. Server-safe — no hooks, no refs beyond the
 *          forwarded ref.
 *
 * @example
 * <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>
 *
 * <p>
 *   Press <Kbd size="sm">Esc</Kbd> to close the dialog.
 * </p>
 *
 * <Kbd>⌘</Kbd><Kbd>Shift</Kbd><Kbd>P</Kbd>
 */
export type KbdSize = 'sm' | 'md';

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** Key label content (text, symbol, or small inline node). */
  children: ReactNode;
  /** Visual size preset. Default `'md'`. */
  size?: KbdSize;
}

const SIZE_CLASS: Record<KbdSize, string> = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
};

export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { children, size = 'md', className, ...rest },
  ref,
) {
  return (
    <kbd
      ref={ref}
      className={cn(styles.root, SIZE_CLASS[size], className)}
      {...rest}
    >
      {children}
    </kbd>
  );
});
