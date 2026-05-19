'use client';

/**
 * Stepper — visual + semantic multi-step progress indicator with optional
 * keyboard navigation when clickable.
 *
 * @layer complex-interactive (Phase 10, E01.3 of 0.19.0)
 * @apg https://www.w3.org/TR/wai-aria-1.2/#list (visual-only mode)
 *      https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/navigation.html (interactive mode)
 *      W3C does NOT define an APG "stepper / wizard" pattern. Behavior here is
 *      synthesized from the list semantic primitive (visual-only) + the
 *      navigation landmark (interactive) per Material UI / Mantine / Chakra
 *      Stepper convention (Q1 (γ)).
 * @tokens --color-brand, --color-success, --color-error, --color-warning,
 *   --color-text-{primary,secondary,muted,on-brand}, --color-error-strong,
 *   --color-border, --color-border-strong, --color-surface, --color-surface-raised,
 *   --radius-full, --radius-md, --space-{1,2,3,4,6,8,10}, --duration-fast,
 *   --easing-default, --focus-ring. ZERO new design tokens — all values map
 *   1:1 onto existing _semantics.scss scale (R7 token reuse-first).
 *   Component-local channels (`--stepper-circle-size`, `--stepper-number-size`,
 *   `--stepper-label-size`, `--stepper-description-size`) tied to `data-size`
 *   selector — FileChip precedent (R7-compliant: every concrete value reuses
 *   existing --space-* scale).
 * @deps cn (internal); inline SVG icons (D25 zero-deps — CheckIcon, WarningIcon).
 *   ZERO external runtime deps.
 * @a11y Visual mode (clickableSteps='none'): root `<ol role="list">` + `<li>`
 *   children, `aria-current="step"` on the active step. Step circle is
 *   `aria-hidden` (decorative — digit conveys no semantic info beyond label+
 *   status). Each step ships a visually-hidden verbose announcement
 *   "Step N of M: label, status" so AT users get explicit context. Live
 *   region (sr-only, `role="status" aria-live="polite"`) re-announces on
 *   currentStep change via `key={currentStep}` mount-trick (TagsInput
 *   precedent — textContent-only changes are unreliable across AT;
 *   key-mount is the canonical re-announce vehicle).
 *
 *   Interactive mode (clickableSteps='visited'|'all'): root `<nav role=
 *   "navigation" aria-label|labelledby>` wrapping `<ol>`. Clickable steps
 *   render as real `<button type="button">`. Non-clickable steps render
 *   as `<div aria-disabled="true">` (NOT focusable, NOT a button — axe
 *   `nested-interactive` safe). Roving tabindex (Tabs precedent) ensures
 *   exactly ONE clickable step has `tabindex="0"`. Arrow keys move focus
 *   between clickable steps only (skips aria-disabled), Home/End jump to
 *   first/last clickable, Space/Enter activate. RTL flips horizontal
 *   arrows. Modifier keys (Cmd/Ctrl/Alt/Shift + arrow) skipped — browser
 *   hotkeys take precedence (Tabs TB-R04 precedent).
 *
 *   Error icon (D4): ALWAYS renders the warning glyph regardless of
 *   `<Step icon={...}>` override. WCAG 1.4.1 — don't rely on color alone.
 *
 *   currentStep prop change does NOT call `.focus()` (STEP-R09) — AT users
 *   prefer announcement-based feedback. Live region announces; focus
 *   stays put unless user explicitly moves it.
 *
 *   Touch targets: `size='sm'` (24px circle) gets `padding: var(--space-2)`
 *   on the interactive button wrapper to reach ≥40px effective hit area.
 *
 *   Reduced motion: connecting-line + step-circle transitions disabled
 *   under `prefers-reduced-motion: reduce`.
 * @budget Stepper root: 7 props (currentStep + orientation + size +
 *   clickableSteps + onStepClick + aria-label/labelledby pair + children).
 *   Step part: 4 props (label, description, icon, status). Compound counts
 *   as ONE component for R2 budget per charter §"Compound exports OK" —
 *   Stepper + Step together = ONE concept (visual step indicator with named
 *   regions). Splitting would force consumers into multiple imports where
 *   one is sufficient.
 * @tested tsc --noEmit ✓ | eslint + jsx-a11y ✓ | next build ✓ |
 *   Playwright suites: keyboard / focus / aria / states / click /
 *   regression (~38-44 cases total) | axe-core zero violations across 6
 *   demo use cases.
 * @regressions tests/Stepper.regression.spec.ts — STEP-R01..R18 (18 cases)
 *   derived from Material UI / Mantine / Chakra Stepper closed issues +
 *   W3C ARIA navigation landmark edge cases.
 * @example
 *   <Stepper currentStep={1} aria-label="Order progress">
 *     <Step label="Cart" />
 *     <Step label="Shipping" />
 *     <Step label="Payment" />
 *   </Stepper>
 *
 *   // Interactive (visited-only navigation)
 *   <Stepper
 *     currentStep={currentStep}
 *     clickableSteps="visited"
 *     onStepClick={setCurrentStep}
 *     aria-label="Lead intake wizard"
 *   >
 *     <Step label="Identity" description="Contact details" />
 *     <Step label="Company" />
 *     <Step label="Qualification" status={hasError ? 'error' : undefined} />
 *     <Step label="Submit" />
 *   </Stepper>
 *
 *   // Vertical with custom icons + lg size
 *   <Stepper currentStep={2} orientation="vertical" size="lg" aria-label="Phases">
 *     <Step label="Draft" icon={<DraftIcon />} />
 *     <Step label="Review" icon={<ReviewIcon />} />
 *     <Step label="Signature" icon={<SignIcon />} />
 *     <Step label="Archive" icon={<ArchiveIcon />} />
 *   </Stepper>
 */

import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';

import { cn } from '../../utils/cn';

import styles from './Stepper.module.scss';

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

export type StepStatus = 'pending' | 'active' | 'complete' | 'error';
export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperSize = 'sm' | 'md' | 'lg';
export type StepperClickableSteps = 'none' | 'visited' | 'all';

interface StepperPropsBase extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'role'> {
  /**
   * Index of the currently active step (0-indexed). Used to derive default
   * status for each `<Step>` (index < currentStep → complete; === → active;
   * > → pending). Out-of-bounds values clamp: `< 0` treats all steps as
   * pending; `>= step count` treats all steps as complete (STEP-R01/R02).
   */
  currentStep: number;
  /** Layout axis. Default `'horizontal'`. */
  orientation?: StepperOrientation;
  /** Visual scale. Default `'md'`. */
  size?: StepperSize;
  /** Step children. MUST be `<Step>` elements. */
  children: ReactNode;
}

interface StepperPropsVisual extends StepperPropsBase {
  clickableSteps?: 'none';
  /** Not applicable in visual mode. */
  onStepClick?: never;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

interface StepperPropsInteractive extends StepperPropsBase {
  clickableSteps: 'visited' | 'all';
  /**
   * Fires when a clickable step is activated (mouse click OR Space/Enter
   * keyboard on focused step).
   */
  onStepClick: (index: number) => void;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export type StepperProps = StepperPropsVisual | StepperPropsInteractive;

export interface StepProps {
  /** Visible step label. */
  label: string;
  /** Optional secondary description rendered below the label. */
  description?: ReactNode;
  /**
   * Optional icon override. Replaces the default numbered badge for
   * `pending`/`active` AND replaces the default checkmark for `complete`.
   * `error` status ALWAYS renders the warning icon (D4) — `icon` is
   * ignored when `status === 'error'`.
   */
  icon?: ReactNode;
  /**
   * Explicit status override. Wins over derivation from `currentStep`.
   * Primary use case: marking `'error'` on a step that failed validation
   * even though `currentStep` has moved past it.
   */
  status?: StepStatus;
}

// ──────────────────────────────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────────────────────────────

interface StepperContextValue {
  currentStep: number;
  totalSteps: number;
  orientation: StepperOrientation;
  size: StepperSize;
  clickableSteps: StepperClickableSteps;
  onStepClick?: (index: number) => void;
}

const StepperContext = createContext<StepperContextValue | null>(null);

function useStepperContext(): StepperContextValue {
  const ctx = useContext(StepperContext);
  if (!ctx) {
    throw new Error('<Step> must be rendered inside <Stepper>');
  }
  return ctx;
}

// Each <Step> reads its own index via context too, so we don't depend on
// React internals for sibling ordering.
const StepIndexContext = createContext<number>(0);

// ──────────────────────────────────────────────────────────────────────────
// Inline SVG icons (D25 zero-deps)
// ──────────────────────────────────────────────────────────────────────────

interface IconProps {
  size: number;
}

function CheckIcon({ size }: IconProps): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable={false}
    >
      <polyline points="3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}

function WarningIcon({ size }: IconProps): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable={false}
    >
      <line x1="8" y1="4" x2="8" y2="9" />
      <circle cx="8" cy="11.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Status helpers
// ──────────────────────────────────────────────────────────────────────────

function deriveStatus(index: number, currentStep: number): StepStatus {
  if (index < currentStep) return 'complete';
  if (index === currentStep) return 'active';
  return 'pending';
}

function isClickableForMode(mode: StepperClickableSteps, derivedStatus: StepStatus): boolean {
  if (mode === 'none') return false;
  if (mode === 'all') return true;
  // 'visited' — only complete steps are clickable
  return derivedStatus === 'complete';
}

function statusToText(status: StepStatus): string {
  switch (status) {
    case 'complete':
      return 'complete';
    case 'active':
      return 'current';
    case 'error':
      return 'error';
    default:
      return 'pending';
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Roving tabindex helper (Tabs precedent — DOM attribute updates, no React
// re-render churn).
// ──────────────────────────────────────────────────────────────────────────

const CLICKABLE_STEP_SELECTOR = '[data-step-clickable="true"]';

function getClickableSteps(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(CLICKABLE_STEP_SELECTOR));
}

function setRovingTabindex(steps: HTMLElement[], activeIndex: number): void {
  steps.forEach((step, idx) => {
    step.setAttribute('tabindex', idx === activeIndex ? '0' : '-1');
  });
}

// ──────────────────────────────────────────────────────────────────────────
// Stepper root
// ──────────────────────────────────────────────────────────────────────────

export const Stepper = forwardRef<HTMLElement, StepperProps>(function Stepper(props, forwardedRef) {
  // Destructure ONCE via a unified read-shape — TypeScript's discriminated
  // union is preserved at the call site (consumers can't supply `onStepClick`
  // with `clickableSteps='none'` because of `StepperProps` union typing).
  // Internally we read both fields with runtime defaults.
  const {
    currentStep,
    orientation = 'horizontal',
    size = 'md',
    clickableSteps: clickableStepsProp,
    onStepClick,
    children,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  } = props as StepperPropsBase & {
    clickableSteps?: StepperClickableSteps;
    onStepClick?: (index: number) => void;
    className?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
  };
  const clickableSteps: StepperClickableSteps = clickableStepsProp ?? 'none';

  // Filter children to Step elements only — Fragments + conditionals supported.
  const stepElements = useMemo(() => {
    const list: React.ReactElement<StepProps>[] = [];
    Children.forEach(children, (child) => {
      if (isValidElement<StepProps>(child) && (child.type as unknown) === Step) {
        list.push(child);
      }
    });
    return list;
  }, [children]);

  const totalSteps = stepElements.length;
  const interactive = clickableSteps !== 'none';

  // Dev-only landmark name check — interactive mode requires aria-label OR
  // aria-labelledby for the <nav> landmark.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      if (interactive && !ariaLabel && !ariaLabelledBy) {
        console.warn(
          '<Stepper> in interactive mode should have `aria-label` or `aria-labelledby` — the <nav> landmark needs an accessible name.',
        );
      }
    }
  }, [interactive, ariaLabel, ariaLabelledBy]);

  // Active step label for live region announcement
  const activeLabel = useMemo(() => {
    if (currentStep < 0 || currentStep >= totalSteps) return '';
    return stepElements[currentStep]?.props.label ?? '';
  }, [stepElements, currentStep, totalSteps]);

  const ctxValue = useMemo<StepperContextValue>(
    () => ({
      currentStep,
      totalSteps,
      orientation,
      size,
      clickableSteps,
      onStepClick,
    }),
    [currentStep, totalSteps, orientation, size, clickableSteps, onStepClick],
  );

  // Roving tabindex management — interactive mode only
  const rootRef = useRef<HTMLElement | null>(null);

  const mergedRef = useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  // Sync roving tabindex on mount + currentStep/clickableSteps change.
  // Active index = currentStep if clickable, else first clickable, else none.
  useLayoutEffect(() => {
    if (!interactive) return;
    const root = rootRef.current;
    if (!root) return;
    const clickables = getClickableSteps(root);
    if (clickables.length === 0) {
      // No clickable step — set tabindex=-1 on all (Tab passes through)
      return;
    }
    // Find currentStep among clickables (it may be filtered out in 'visited' mode)
    const currentStepEl = clickables.find((el) => Number(el.dataset.stepIndex) === currentStep);
    const activeIdx = currentStepEl ? clickables.indexOf(currentStepEl) : 0;
    setRovingTabindex(clickables, activeIdx);
  }, [interactive, currentStep, clickableSteps, totalSteps]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (!interactive) return;
      // Skip if any modifier key is pressed (Tabs TB-R04 precedent).
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
        return;
      }

      const root = rootRef.current;
      if (!root) return;
      const clickables = getClickableSteps(root);
      if (clickables.length === 0) return;

      const activeIndex = clickables.findIndex((el) => el === document.activeElement);
      if (activeIndex === -1) return;

      const isHorizontal = orientation === 'horizontal';
      const isRtl = (root.getAttribute('dir') || document.dir || '').toLowerCase() === 'rtl';
      const nextKey = isHorizontal ? (isRtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
      const prevKey = isHorizontal ? (isRtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';

      const focusAt = (idx: number) => {
        const target = clickables[idx];
        if (!target) return;
        setRovingTabindex(clickables, idx);
        target.focus();
      };

      switch (event.key) {
        case nextKey: {
          event.preventDefault();
          const nextIdx = activeIndex < clickables.length - 1 ? activeIndex + 1 : 0;
          focusAt(nextIdx);
          return;
        }
        case prevKey: {
          event.preventDefault();
          const prevIdx = activeIndex > 0 ? activeIndex - 1 : clickables.length - 1;
          focusAt(prevIdx);
          return;
        }
        case 'Home': {
          event.preventDefault();
          focusAt(0);
          return;
        }
        case 'End': {
          event.preventDefault();
          focusAt(clickables.length - 1);
          return;
        }
        default:
          break;
      }
    },
    [interactive, orientation],
  );

  // Render the ordered list of steps wrapping each <Step> with an index
  // context so the part knows where it sits.
  const stepItems = stepElements.map((stepEl, idx) => (
    <StepIndexContext.Provider key={idx} value={idx}>
      {stepEl}
    </StepIndexContext.Provider>
  ));

  const liveRegion =
    activeLabel && currentStep >= 0 && currentStep < totalSteps ? (
      <div key={`live-${currentStep}`} role="status" aria-live="polite" className={styles.srOnly}>
        {`Step ${currentStep + 1} of ${totalSteps}: ${activeLabel}`}
      </div>
    ) : null;

  // `{...rest}` BEFORE fixed attrs so the lib's structural attrs (role,
  // data-orientation, data-size, onKeyDown) always win over consumer rest.
  // Prevents accidental override via spread.

  if (interactive) {
    return (
      <StepperContext.Provider value={ctxValue}>
        <nav
          {...rest}
          ref={mergedRef as React.Ref<HTMLElement>}
          role="navigation"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={cn(styles.root, className)}
          data-orientation={orientation}
          data-size={size}
          onKeyDown={handleKeyDown}
        >
          <ol role="list" className={styles.list} data-orientation={orientation} data-size={size}>
            {stepItems}
          </ol>
          {liveRegion}
        </nav>
      </StepperContext.Provider>
    );
  }

  // Visual-only mode — root <div> wraps the <ol> + live region. The <ol>
  // owns the list semantic; the wrapper exists so the live region can sit
  // as a sibling of <ol> without violating "<ol> may only contain <li>"
  // (axe `aria-required-parent` / HTML structural validity).
  // aria-label is harmless on a <div> (not a landmark) but supports test
  // targeting and gives AT users a labelled container.
  return (
    <StepperContext.Provider value={ctxValue}>
      <div
        {...rest}
        ref={mergedRef as React.Ref<HTMLDivElement>}
        className={cn(styles.root, className)}
        data-orientation={orientation}
        data-size={size}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        <ol role="list" className={styles.list} data-orientation={orientation} data-size={size}>
          {stepItems}
        </ol>
        {liveRegion}
      </div>
    </StepperContext.Provider>
  );
});

// ──────────────────────────────────────────────────────────────────────────
// Step — compound part
// ──────────────────────────────────────────────────────────────────────────

const STEP_CIRCLE_ICON_SIZE: Record<StepperSize, number> = {
  sm: 12,
  md: 16,
  lg: 20,
};

export function Step(props: StepProps): React.JSX.Element {
  const { label, description, icon, status: explicitStatus } = props;
  const ctx = useStepperContext();
  const index = useContext(StepIndexContext);

  const derivedStatus = deriveStatus(index, ctx.currentStep);
  const status: StepStatus = explicitStatus ?? derivedStatus;
  const clickable = isClickableForMode(ctx.clickableSteps, status);
  const iconSize = STEP_CIRCLE_ICON_SIZE[ctx.size];

  const ariaCurrent: 'step' | undefined = status === 'active' ? 'step' : undefined;

  // Render badge content per status. Error icon mandatory (D4).
  // Otherwise: complete → CheckIcon (or icon override), pending/active → icon
  // override OR number badge.
  const badgeContent =
    status === 'error' ? (
      <WarningIcon size={iconSize} />
    ) : status === 'complete' ? (
      (icon ?? <CheckIcon size={iconSize} />)
    ) : (
      (icon ?? <span aria-hidden="true">{index + 1}</span>)
    );

  // Per-step verbose announcement gives AT context when the user navigates
  // the list item-by-item. We OMIT it on the active step because the root's
  // live region (role="status" aria-live="polite") already announces the
  // active step transition — duplicating both would cause double announcement.
  const verboseAnnouncement =
    status === 'active'
      ? null
      : `Step ${index + 1} of ${ctx.totalSteps}: ${label}, ${statusToText(status)}`;

  const content = (
    <>
      <span aria-hidden="true" className={styles.stepCircle}>
        {badgeContent}
      </span>
      <span className={styles.stepContent}>
        <span className={styles.stepLabel}>{label}</span>
        {description != null ? <span className={styles.stepDescription}>{description}</span> : null}
      </span>
      {verboseAnnouncement != null ? (
        <span className={styles.srOnly}>{verboseAnnouncement}</span>
      ) : null}
    </>
  );

  if (clickable && ctx.onStepClick) {
    const onStepClick = ctx.onStepClick;
    return (
      <li className={styles.step} data-status={status} aria-current={ariaCurrent}>
        <button
          type="button"
          className={styles.stepButton}
          data-step-clickable="true"
          data-step-index={index}
          aria-label={`Step ${index + 1} of ${ctx.totalSteps}: ${label}`}
          // Roving tabindex — Stepper root sets the actual tabindex via DOM
          // attribute on mount + on currentStep change. Initial DOM value
          // here is -1; root effect promotes the correct one to 0.
          tabIndex={-1}
          onClick={() => onStepClick(index)}
        >
          {content}
        </button>
      </li>
    );
  }

  // Non-clickable step in interactive mode → <div aria-disabled="true">
  // Visual-only mode → plain <li>
  if (ctx.clickableSteps !== 'none') {
    return (
      <li className={styles.step} data-status={status} aria-current={ariaCurrent}>
        <div className={styles.stepInner} aria-disabled="true" data-step-index={index}>
          {content}
        </div>
      </li>
    );
  }

  return (
    <li className={styles.step} data-status={status} aria-current={ariaCurrent}>
      {content}
    </li>
  );
}
