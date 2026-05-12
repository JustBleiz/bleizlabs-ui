'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import styles from './Collapsible.module.scss';

/**
 * Collapsible — APG `disclosure` compound for single-panel show/hide.
 *
 * Distinct from `<AccordionGroup>`/`<Accordion>` (APG `/accordion/`,
 * FAQ-style Q+A panels with optional single/multi expansion mode).
 * Collapsible is the generic toggle: ONE trigger button reveals/hides
 * ONE content region. Use it for "show more", "expand details",
 * settings reveals, optional fields — anywhere the question/answer
 * semantic of Accordion is wrong.
 *
 * Compound API: `<Collapsible>` provides state + ids via context;
 * `<CollapsibleTrigger>` wires `aria-expanded` + `aria-controls`;
 * `<CollapsibleContent>` becomes the controlled region. Controlled
 * (`open` + `onOpenChange`) and uncontrolled (`defaultOpen`) both
 * supported via the standard hybrid pattern.
 *
 * @layer   complex
 * @tokens  --space-{0..20} (consumer-owned via className passthrough),
 *          --duration-normal + --easing-default (height transition;
 *          reduced-motion guard disables it).
 * @deps    React (context + hooks), utils/Slot (asChild on Trigger),
 *          utils/cn.
 * @apg     https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 * @a11y    Trigger is a real `<button type="button">` with
 *          `aria-expanded` mirroring state + `aria-controls` pointing
 *          to the Content's id. Content has `role="region"` +
 *          `aria-labelledby` pointing to the Trigger's id. When closed,
 *          Content is removed from the a11y tree (visibility hidden +
 *          inert via `hidden` attribute) so screen readers don't pick
 *          up off-screen text. Enter/Space toggle (native button
 *          semantics — no custom key handler needed).
 *
 * @example
 * <Collapsible>
 *   <CollapsibleTrigger>Show advanced options</CollapsibleTrigger>
 *   <CollapsibleContent>
 *     <p>Hidden details here…</p>
 *   </CollapsibleContent>
 * </Collapsible>
 *
 * @example
 * // Controlled mode + asChild trigger
 * <Collapsible open={open} onOpenChange={setOpen}>
 *   <CollapsibleTrigger asChild>
 *     <Button variant="ghost">{open ? 'Hide' : 'Show'} JSON</Button>
 *   </CollapsibleTrigger>
 *   <CollapsibleContent>
 *     <pre>{JSON.stringify(data, null, 2)}</pre>
 *   </CollapsibleContent>
 * </Collapsible>
 */

interface CollapsibleContextValue {
  open: boolean;
  toggle: () => void;
  triggerId: string;
  contentId: string;
  disabled: boolean;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext(consumer: string): CollapsibleContextValue {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error(
      `<${consumer}> must be used inside <Collapsible>. Wrap your trigger + content in a <Collapsible> root.`,
    );
  }
  return ctx;
}

export interface CollapsibleProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  /** Uncontrolled initial state. Default `false`. */
  defaultOpen?: boolean;
  /** Fires when the user toggles the disclosure. */
  onOpenChange?: (open: boolean) => void;
  /** Disable the trigger (and prevent toggling). Default `false`. */
  disabled?: boolean;
  /** Compound children — `<CollapsibleTrigger>` + `<CollapsibleContent>`. */
  children: ReactNode;
}

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(
  function Collapsible(
    {
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      disabled = false,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const reactId = useId();
    const triggerId = `${reactId}-trigger`;
    const contentId = `${reactId}-content`;
    const isControlled = controlledOpen !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const open = isControlled ? controlledOpen! : uncontrolledOpen;

    const toggle = useCallback(() => {
      if (disabled) return;
      const next = !open;
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    }, [disabled, isControlled, onOpenChange, open]);

    const value: CollapsibleContextValue = {
      open,
      toggle,
      triggerId,
      contentId,
      disabled,
    };

    return (
      <CollapsibleContext.Provider value={value}>
        <div
          ref={ref}
          data-state={open ? 'open' : 'closed'}
          data-disabled={disabled || undefined}
          className={cn(styles.root, className)}
          {...rest}
        >
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  },
);

export interface CollapsibleTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Project trigger semantics onto a custom child (e.g. `<Button>`). */
  asChild?: boolean;
}

export const CollapsibleTrigger = forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(function CollapsibleTrigger(
  { asChild = false, className, onClick, type, children, ...rest },
  ref,
) {
  const { open, toggle, triggerId, contentId, disabled } =
    useCollapsibleContext('CollapsibleTrigger');

  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? 'button')}
      id={triggerId}
      aria-expanded={open}
      aria-controls={contentId}
      data-state={open ? 'open' : 'closed'}
      data-disabled={disabled || undefined}
      disabled={asChild ? undefined : disabled}
      className={cn(styles.trigger, className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        toggle();
      }}
      {...rest}
    >
      {children}
    </Comp>
  );
});

export interface CollapsibleContentProps
  extends HTMLAttributes<HTMLDivElement> {
  /**
   * Keep content mounted in the DOM when closed (default `false` —
   * unmount on close). Set `true` when consumer needs to preserve
   * internal state (form drafts, video playback position) across
   * toggle cycles.
   */
  forceMount?: boolean;
}

export const CollapsibleContent = forwardRef<
  HTMLDivElement,
  CollapsibleContentProps
>(function CollapsibleContent(
  { forceMount = false, className, hidden, children, ...rest },
  ref,
) {
  const { open, triggerId, contentId } =
    useCollapsibleContext('CollapsibleContent');

  if (!open && !forceMount) {
    return null;
  }

  return (
    <div
      ref={ref}
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      data-state={open ? 'open' : 'closed'}
      hidden={hidden ?? (!open || undefined)}
      className={cn(styles.content, className)}
      {...rest}
    >
      <div className={styles.contentInner}>{children}</div>
    </div>
  );
});
