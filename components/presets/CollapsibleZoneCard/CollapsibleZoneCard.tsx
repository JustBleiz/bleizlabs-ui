'use client';

import {
  forwardRef,
  useCallback,
  useId,
  useState,
  type ReactNode,
} from 'react';
import { Badge } from '../../display/Badge';
import { Card } from '../../display/Card';
import { Heading } from '../../typography/Heading';
import { Text } from '../../typography/Text';
import { Inline } from '../../layout/Inline';
import { Stack } from '../../layout/Stack';
import { cn } from '../../utils/cn';
import {
  type ZoneCardDensity,
  type ZoneCardProps,
  type ZoneCardTone,
} from '../ZoneCard';
import styles from './CollapsibleZoneCard.module.scss';

/**
 * CollapsibleZoneCard — universal collapsible info-card preset (client component).
 *
 * Sister to ZoneCard with collapse machinery added; `forceMount` opt-out for
 * form-state-bearing panels.
 *
 * @tokens  Inherits ZoneCard token surface (zero new tokens):
 *            density → Card padding/body-gap maps (compact 4/2, comfortable 5/3)
 *            tone   → --color-{success,warning,error,brand,text-secondary}
 *          Animation on existing motion tokens:
 *            chevron rotate → --motion-duration-fast + --motion-easing-standard
 *            body grid-rows transition → --motion-duration-normal
 *
 * @a11y    APG disclosure pattern (single-item, NOT accordion-multi-item).
 *          Header trigger is `<button type="button">` with native Space/Enter
 *          keyboard handling. `aria-expanded={isOpen}` + `aria-controls={bodyId}`
 *          link button → body. Body is ALWAYS mounted to DOM (required by
 *          grid-template-rows collapse animation — needs an element to
 *          animate). When collapsed: `inert` removes body from focus order +
 *          click + a11y subtree; `aria-hidden="true"` reinforces SR exclusion;
 *          CSS animates `grid-template-rows: 1fr → 0fr` for visual collapse.
 *          The HTML `[hidden]` attribute is intentionally NOT used (would
 *          synchronously apply `display: none` and short-circuit the
 *          transition). `forceMount` is a semantic hint only — body mounts
 *          unconditionally; form state inside body survives toggle cycles
 *          regardless. Section landmark uses `aria-labelledby={titleId}`
 *          (single named region — body has NO `role="region"` to avoid
 *          duplicate-named nested landmark per APG). Heading h3 nests inside
 *          button per APG disclosure precedent. `prefers-reduced-motion:
 *          reduce` disables both chevron rotation + body collapse animation
 *          (instant state change).
 *
 * @apg     https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 *
 * @example
 * // Uncontrolled (most common)
 * <CollapsibleZoneCard
 *   title="Income"
 *   icon={<IconWallet aria-hidden="true" />}
 *   tone="success"
 *   summaryChip={{ label: '€500/mo', tone: 'success' }}
 *   defaultOpen={false}
 * >
 *   <BreakdownList items={incomeItems} />
 * </CollapsibleZoneCard>
 *
 * @example
 * // Controlled — parent owns state
 * const [open, setOpen] = useState(false);
 * <CollapsibleZoneCard
 *   title="Expenses"
 *   open={open}
 *   onOpenChange={setOpen}
 *   collapsedSummary={<Text variant="caption">Last month: -€420</Text>}
 * >
 *   <ExpenseTable rows={expenses} />
 * </CollapsibleZoneCard>
 *
 * @example
 * // Form-state preservation — keep DOM mounted across toggles
 * <CollapsibleZoneCard title="Filters" forceMount>
 *   <FilterForm />
 * </CollapsibleZoneCard>
 */

export type CollapsibleZoneCardSummaryChip = {
  /** Visible chip text. */
  label: string;
  /** Optional tone — drives Badge color. Defaults to 'default'. */
  tone?: ZoneCardTone;
};

export interface CollapsibleZoneCardProps
  extends Omit<ZoneCardProps, 'children'> {
  /**
   * Body content rendered when expanded. Conditionally mounted to DOM by
   * default (`forceMount={false}`); pass `forceMount` to keep mounted across
   * toggles (preserves form state per Radix #2446/#3601).
   */
  children: ReactNode;

  /**
   * Initial open state for uncontrolled mode. Ignored when `open` is set
   * (controlled mode). Default `false` (collapsed).
   */
  defaultOpen?: boolean;

  /**
   * Controlled open state. When set, component does not own state — caller
   * must pair with `onOpenChange`. Pass `undefined` to use uncontrolled mode.
   */
  open?: boolean;

  /**
   * Callback fired when user toggles open state. Required when `open` is
   * controlled. Optional in uncontrolled mode (use as state-observer hook).
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Optional summary chip rendered in header right-slot **only when
   * collapsed**. Hidden when expanded (body content is the summary). Renders
   * as a lib `<Badge>` with `tone` mapped to badge color. Mutually exclusive
   * with `collapsedSummary` — pass one or the other, not both.
   *
   * Coexists with `rightSlot` — when both pass AND collapsed, both render
   * in the same header slot side-by-side (chip first, then rightSlot). When
   * expanded, only `rightSlot` renders.
   */
  summaryChip?: CollapsibleZoneCardSummaryChip;

  /**
   * Optional richer collapsed-state slot (alt to `summaryChip`). Renders
   * arbitrary ReactNode in the header right-slot when collapsed. Use when
   * a single `<Badge>` chip is insufficient (e.g., multiple chips, custom
   * formatting, animated counter). Mutually exclusive with `summaryChip`.
   *
   * Coexists with `rightSlot` — same composition rules as `summaryChip`.
   */
  collapsedSummary?: ReactNode;

  /**
   * Optional override for trigger button `aria-label`. Defaults to language-
   * agnostic auto-generated label `Toggle ${title}` so screen readers always
   * announce the toggle action regardless of which heading text is set.
   * Override when consumer needs locale-specific phrasing.
   */
  toggleAriaLabel?: string;

  /**
   * Optional override for the chevron icon node. By default renders an inline
   * SVG chevron-down rotated 180deg when open (zero icon-library dependency).
   * Override when consumer wants @tabler/icons-react or another icon set.
   * The icon receives `aria-hidden="true"` automatically — consumer's icon
   * should NOT redeclare it.
   */
  chevronIcon?: ReactNode;

  /**
   * Semantic hint only — body is ALWAYS mounted to DOM regardless of this
   * prop value (required by the `grid-template-rows` collapse animation,
   * which needs an element to animate). Form state inside body therefore
   * survives toggle cycles unconditionally.
   *
   * When `true`, sets `data-force-mount='true'` on the body element so
   * consumers can observe / scope styles to "intentionally form-state-bearing"
   * panels (e.g., wrapping form code paths, persistence audit, integration
   * test selectors). Default `false`. Per Radix Accordion #2446 / #3601
   * closed-issue precedent — Radix exposes the same prop name for the same
   * intent but only as observable metadata in our implementation.
   */
  forceMount?: boolean;
}

const PADDING_BY_DENSITY: Record<ZoneCardDensity, 4 | 5> = {
  compact: 4,
  comfortable: 5,
};

const BODY_GAP_BY_DENSITY: Record<ZoneCardDensity, 2 | 3> = {
  compact: 2,
  comfortable: 3,
};

function DefaultChevronIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/**
 * @deprecated since 0.13.0 — preset bundle (ZoneCard + APG disclosure = 2 concerns; Collapsible primitive already covers behavior). Zero equivalent in shadcn/Radix/react-aria — they ship `<Collapsible>` / `<Disclosure>` separately, consumer wraps own content. Will be removed in 0.15.0.
 *
 * Migration: consumer composes `<Collapsible><Card><CollapsibleTrigger>...</CollapsibleTrigger><CollapsibleContent>...</CollapsibleContent></Card></Collapsible>` z lib primitives. See `docs/borderline-resolution-2026-05-08.md` §2.
 */
export const CollapsibleZoneCard = forwardRef<
  HTMLElement,
  CollapsibleZoneCardProps
>(function CollapsibleZoneCard(
  {
    icon,
    title,
    subtitle,
    rightSlot,
    density = 'comfortable',
    tone = 'default',
    ariaLabel,
    className,
    children,
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange,
    summaryChip,
    collapsedSummary,
    toggleAriaLabel,
    chevronIcon,
    forceMount = false,
    ...rest
  },
  ref
) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const reactId = useId();
  const bodyId = `czc-${reactId}-body`;
  const triggerId = `czc-${reactId}-trigger`;
  const titleId = `czc-${reactId}-title`;

  // Toggle handler — no ref-based onOpenChange shim. The deps array already
  // re-binds on every state change, and useState setter + onOpenChange direct
  // call are React-safe inside the same event tick (no infinite-loop risk
  // from this code path; Radix #2717 / #2390 originated from cross-context
  // state, not local handler stability).
  const handleToggle = useCallback(() => {
    const next = !isOpen;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }, [isControlled, isOpen, onOpenChange]);

  const padding = PADDING_BY_DENSITY[density];
  const bodyGap = BODY_GAP_BY_DENSITY[density];

  const collapsedSlot = !isOpen
    ? collapsedSummary ??
      (summaryChip ? (
        <Badge color={badgeColorForTone(summaryChip.tone)} label={summaryChip.label} />
      ) : null)
    : null;

  // Body is ALWAYS mounted to DOM (grid-template-rows collapse transition
  // requires an element to animate — `display: none` from HTML `hidden`
  // attribute would short-circuit the transition the same render the state
  // flips). When closed: `inert` removes body from focus order + click +
  // a11y tree; `aria-hidden="true"` reinforces SR exclusion; CSS animates
  // `grid-template-rows: 1fr → 0fr` + `overflow: hidden` for visual collapse.
  // `inert` is supported in Chrome 102+, Firefox 112+, Safari 15.5+ — every
  // browser the lib targets per package.json#browserslist.
  // `forceMount` is now a SEMANTIC HINT for consumers — body is always in
  // DOM regardless. The data-force-mount attribute exists for consumer
  // observation (e.g., wrapping form code paths). Form state inside body
  // survives toggle cycles unconditionally.

  return (
    <Card variant="default" padding={padding} radius="lg" asChild>
      <section
        ref={ref}
        aria-labelledby={titleId}
        {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
        data-tone={tone}
        data-open={isOpen ? 'true' : 'false'}
        className={cn(styles.root, className)}
        {...rest}
      >
        <Stack gap={bodyGap}>
          <button
            id={triggerId}
            type="button"
            className={styles.trigger}
            onClick={handleToggle}
            aria-expanded={isOpen}
            aria-controls={bodyId}
            {...(toggleAriaLabel ? { 'aria-label': toggleAriaLabel } : {})}
          >
            <Inline gap={3} align="center" className={styles.header}>
              {icon && (
                <span className={styles.icon} aria-hidden="true">
                  {icon}
                </span>
              )}
              <Stack gap={1} className={styles.titleStack}>
                <Heading
                  level={3}
                  size="md"
                  weight="semibold"
                  className={styles.title}
                  id={titleId}
                >
                  {title}
                </Heading>
                {subtitle && (
                  <Text
                    variant="caption"
                    color="muted"
                    className={styles.subtitle}
                  >
                    {subtitle}
                  </Text>
                )}
              </Stack>
              {(rightSlot || collapsedSlot) && (
                <span className={styles.rightSlot}>
                  {collapsedSlot}
                  {rightSlot}
                </span>
              )}
              <span
                className={styles.chevron}
                data-open={isOpen ? 'true' : 'false'}
                data-testid="czc-chevron"
                aria-hidden="true"
              >
                {chevronIcon ?? <DefaultChevronIcon />}
              </span>
            </Inline>
          </button>
          <div
            id={bodyId}
            className={styles.body}
            data-open={isOpen ? 'true' : 'false'}
            data-force-mount={forceMount ? 'true' : undefined}
            aria-hidden={!isOpen}
            // No `role="region"` — the parent <section aria-labelledby={titleId}>
            // is already the named landmark per APG disclosure pattern. Adding
            // role=region here would create a duplicate-named nested landmark
            // (NVDA/JAWS announce twice). `aria-labelledby` is also omitted
            // for the same reason — body is just the disclosure content,
            // referenced by the trigger via aria-controls.
            //
            // `inert` is the semantic disclosure-pattern attribute for
            // disabling focus + click + a11y on the collapsed body without
            // removing it from layout (animation host). React 19 supports
            // `inert` natively as a boolean prop — `inert={true}` renders as
            // `inert=""` (HTML boolean attribute convention).
            {...(!isOpen ? { inert: true } : {})}
          >
            {children}
          </div>
        </Stack>
      </section>
    </Card>
  );
});

/**
 * Map ZoneCardTone → BadgeColor (accepts ZoneCardTone subset 1:1; `default`
 * passes through; `info` is not a ZoneCardTone option so no mapping needed).
 * Type-safe — rejects future ZoneCardTone additions at compile time without
 * an unsafe `as` cast.
 */
function badgeColorForTone(
  tone: ZoneCardTone | undefined
): 'default' | 'brand' | 'success' | 'warning' | 'error' {
  switch (tone) {
    case 'success':
    case 'warning':
    case 'error':
    case 'brand':
      return tone;
    case 'default':
    case undefined:
      return 'default';
  }
}

export type { ZoneCardDensity, ZoneCardTone, ZoneCardProps };
