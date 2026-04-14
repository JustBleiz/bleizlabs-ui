'use client';

import {
  forwardRef,
  useId,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/components/utils/cn';
import styles from './Accordion.module.scss';

/**
 * Accordion — disclosure panel with header trigger (Phase 4 I9).
 *
 * @layer   atom (interactive)
 * @tokens  --color-surface, --color-surface-raised, --color-border,
 *          --color-border-subtle, --color-text-primary,
 *          --color-text-secondary, --focus-ring, --radius-md,
 *          --space-{2..5}, --duration-normal, --easing-default
 * @deps    cn
 * @a11y    Renders a `<button aria-expanded aria-controls>` trigger
 *          coupled to a `<div role="region" aria-labelledby>` panel via
 *          auto-generated ids. Native button gives keyboard Space/Enter
 *          activation. The panel uses `hidden` attribute when collapsed
 *          so screen readers skip it. Implements WAI-ARIA APG accordion
 *          pattern (https://w3.org/WAI/ARIA/apg/patterns/accordion/).
 * @notes   Client Component (`'use client'`) for controlled (`open`) +
 *          uncontrolled (`defaultOpen`) state. Single-panel only — for
 *          a group with single/multiple expansion mode, compose multiple
 *          Accordion instances inside a parent (AccordionGroup is
 *          planned for Phase 8). Animations: expandDown / collapseUp
 *          keyframes (E03 _animations.scss).
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
export interface AccordionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
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
  children: ReactNode;
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(
    {
      question,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      compact = false,
      disabled = false,
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

    return (
      <div
        ref={ref}
        className={cn(
          styles.root,
          compact && styles.compact,
          open && styles.open,
          className,
        )}
        data-state={open ? 'open' : 'closed'}
        {...rest}
      >
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
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          hidden={!open}
          className={styles.panel}
        >
          <div className={styles.panelInner}>{children}</div>
        </div>
      </div>
    );
  },
);
