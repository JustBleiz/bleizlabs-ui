'use client';

import { forwardRef, useId, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import styles from './Accordion.module.scss';

/**
 * Accordion — disclosure panel with header trigger (Phase 4 I9).
 *
 * @layer   atom (interactive)
 * @tokens  --color-surface, --color-surface-raised, --color-border,
 *          --color-border-subtle, --color-text-primary,
 *          --color-text-secondary, --focus-ring (consumed via
 *          `@include mx.focus-ring`), --size-touch-min (consumed via
 *          `@include mx.touch-target`), --radius-md, --space-{3,4,5},
 *          --duration-{fast,normal}, --easing-default, --easing-apple,
 *          --font-secondary, --font-size-{sm,base}, --font-weight-medium,
 *          --line-height-normal
 * @deps    cn, React: `forwardRef`, `useId`, `useState`, type imports
 *          `HTMLAttributes<HTMLDivElement>`, `ReactNode`
 * @apg     https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
 * @a11y    Renders a `<button aria-expanded aria-controls>` trigger
 *          contained in a heading element (`headingLevel` prop, default
 *          `<h3>` — APG: "each accordion header is contained in an
 *          element with role heading"), coupled to a
 *          `<div role="region" aria-labelledby>` panel via
 *          auto-generated ids. Native button gives keyboard Space/Enter
 *          activation. When closed, the panel sets `aria-hidden="true"`
 *          and `pointer-events: none` so assistive tech and pointer
 *          interactions both skip the collapsed content; the inner
 *          wrapper carries `visibility: hidden` so it's removed from
 *          tab order without leaving the layout tree (which would break
 *          the open/close animation).
 * @tested  tsc --noEmit ✓ | eslint + jsx-a11y via eslint-config-next ✓ |
 *          Playwright `tests/Accordion.regression.spec.ts` (AC-R01..R04,
 *          CI-gated) + axe smoke on /components/toggles + /components/
 *          molecules. DEFERRED: manual NVDA sweep.
 * @regressions AC-R01..R04 (E04 audit remediation: heading-wrapped
 *          triggers — default level, override, toggle-through-wrapper,
 *          visual margin reset).
 * @notes   Client Component (`'use client'`) for controlled (`open`) +
 *          uncontrolled (`defaultOpen`) state. Single-panel only — for
 *          a group with single/multiple expansion mode, compose with
 *          `<AccordionGroup>` (molecules). Animation: two-tier strategy —
 *          `max-height` transition baseline plus `interpolate-size:
 *          allow-keywords` progressive enhancement (`grid-template-rows`
 *          was abandoned due to Chromium jank — see module.scss). The
 *          panel stays in the layout tree across both states so the
 *          start frame of the transition always renders, eliminating the
 *          flicker inherent to `display: none` / `hidden` toggles. The
 *          chevron uses a separate transform transition. Reduced-motion
 *          disables both transitions. Root renders `data-state="open" |
 *          "closed"` for consumer styling hooks. BEHAVIOR CHANGE
 *          (0.27.0): the trigger button is now wrapped in a heading
 *          element (APG conformance) — DOM depth +1, visual unchanged
 *          (full reset on the wrapper).
 *
 * @example
 * <Accordion question="What's included?">
 *   <Text>Free shipping, returns, and 24/7 support.</Text>
 * </Accordion>
 *
 * <Accordion open={isOpen} onOpenChange={setIsOpen} question="Pricing details">
 *   <Text>Plans start at $10/month.</Text>
 * </Accordion>
 */
export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Visible header / trigger text. */
  question: string;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Open change callback. */
  onOpenChange?: (open: boolean) => void;
  /** Compact spacing variant. */
  compact?: boolean;
  /** Disable the trigger. */
  disabled?: boolean;
  /**
   * Heading level of the element wrapping the trigger button (APG: each
   * accordion header is contained in a heading). Match the surrounding
   * document outline. Default `3`.
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Panel content rendered inside the disclosure region. */
  children: ReactNode;
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  {
    question,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    compact = false,
    disabled = false,
    headingLevel = 3,
    className,
    children,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const triggerId = `${generatedId}-trigger`;
  const panelId = `${generatedId}-panel`;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleToggle = () => {
    const next = !open;
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  // APG: the trigger button is contained in a heading element matching the
  // document outline. The wrapper carries a full visual reset (.headingWrap)
  // so UA heading styles cannot shift the trigger visual.
  // Cast required: the JSX checker needs the literal tag union (the bare
  // template literal widens for JSX element-type resolution).
  const HeadingTag = `h${headingLevel}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return (
    <div
      ref={ref}
      className={cn(styles.root, compact && styles.compact, open && styles.open, className)}
      data-state={open ? 'open' : 'closed'}
      {...rest}
    >
      <HeadingTag className={styles.headingWrap}>
        <button
          type="button"
          id={triggerId}
          aria-expanded={open}
          aria-controls={panelId}
          disabled={disabled}
          className={styles.trigger}
          onClick={handleToggle}
        >
          <span className={styles.question}>{question}</span>
          <span aria-hidden="true" className={styles.chevron}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6L8 10L12 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </HeadingTag>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        aria-hidden={!open}
        className={cn(styles.panel, !open && styles.panelClosed)}
      >
        <div className={styles.panelInner}>{children}</div>
      </div>
    </div>
  );
});
