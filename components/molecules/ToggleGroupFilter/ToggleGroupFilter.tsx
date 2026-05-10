import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { ToggleGroup } from '../../interactive/ToggleGroup';
import { Toggle } from '../../interactive/Toggle';
import { Text } from '../../typography/Text';
import { cn } from '../../utils/cn';
import styles from './ToggleGroupFilter.module.scss';

/**
 * ToggleGroupFilter — filter-chip row composing ToggleGroup + Toggle + Text
 * (Phase 7 M5, server-safe).
 *
 * @layer   molecule
 * @tokens  --space-2 (.root column gap) — ToggleGroup handles its own
 *          flex/wrap layout tokens internally
 * @deps    ToggleGroup atom (type="multiple", value, onValueChange,
 *          aria-label), Toggle atom (value, icon, children), Text atom
 *          (variant="caption", color="muted", uppercase), cn,
 *          React: `forwardRef`
 * @a11y    The wrapping `<div>` (ToggleGroupFilter's own root) is a
 *          presentational container; the semantic `role="group"` +
 *          `aria-label` landmark is owned by the inner ToggleGroup atom.
 *          `label` (required) is forwarded as ToggleGroup's `aria-label`.
 *          The optional `groupLabel` renders as a visible uppercase
 *          caption above the toggle row — it is **independent** from the
 *          accessible `label` so the visual heading and the ARIA name can
 *          differ, or the visual heading can be omitted entirely without
 *          losing accessibility.
 * @notes   Thin wrapper over `ToggleGroup type="multiple"` — controlled
 *          only (consumer owns `value` + `onValueChange` state). Maps
 *          the flat `options` array to `Toggle` children internally so
 *          consumers don't have to compose JSX manually. For custom
 *          Toggle children layouts, drop down to `ToggleGroup` directly.
 *
 * @example
 * const [statuses, setStatuses] = useState<string[]>(['active']);
 *
 * <ToggleGroupFilter
 *   label="Filtr statusów"
 *   groupLabel="Status"
 *   options={[
 *     { value: 'active', label: 'Aktywne' },
 *     { value: 'paused', label: 'Wstrzymane' },
 *     { value: 'done', label: 'Zakończone' },
 *   ]}
 *   value={statuses}
 *   onValueChange={setStatuses}
 * />
 */
export interface ToggleGroupFilterOption {
  /** Stable value string — included in `onValueChange` when selected. */
  value: string;
  /** Visible label inside the Toggle. */
  label: string;
  /** Optional leading icon rendered by the underlying Toggle. */
  icon?: ReactNode;
}

export interface ToggleGroupFilterProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'aria-label' | 'defaultValue' | 'onChange'
  > {
  /** Filter options rendered as `Toggle` children inside the group. */
  options: ToggleGroupFilterOption[];
  /** Controlled active values — subset of `options[].value`. */
  value: string[];
  /** Called with the new array of active values. */
  onValueChange: (value: string[]) => void;
  /** Accessible name for `role="group"` (required). */
  label: string;
  /** Optional visible uppercase caption above the toggle row. */
  groupLabel?: string;
}

/**
 * @deprecated Since 0.14.0 — duplicates lib `<ToggleGroup>` atom z thin wrapping.
 *             Will be REMOVED in 0.15.0 BREAKING release.
 *
 *             **Why deprecated (per Charter sharpening 2026-05-10):**
 *             ToggleGroupFilter duplicates lib `interactive/ToggleGroup` atom z thin wrapping
 *             (label + groupLabel + forced typed `options: ToggleGroupFilterOption[]` array).
 *             Klocek test #2 violation (forced data shape array) + R6 reuse-first violation.
 *             Lib already ships ToggleGroup z proper APG behavior — consumer should use directly.
 *
 *             **Migration pattern:**
 *             ```tsx
 *             // BEFORE:
 *             <ToggleGroupFilter
 *               label="Filter status"
 *               groupLabel="Status"
 *               options={[
 *                 { value: 'all', label: 'Wszystkie' },
 *                 { value: 'active', label: 'Aktywne', icon: <DotIcon /> },
 *               ]}
 *               value={filter}
 *               onValueChange={setFilter}
 *             />
 *
 *             // AFTER (consumer composition z lib ToggleGroup atom):
 *             <Stack gap={2}>
 *               <Eyebrow>Status</Eyebrow>
 *               <ToggleGroup
 *                 type="single"
 *                 value={filter}
 *                 onValueChange={setFilter}
 *                 aria-label="Filter status"
 *               >
 *                 <Toggle value="all">Wszystkie</Toggle>
 *                 <Toggle value="active"><DotIcon /> Aktywne</Toggle>
 *               </ToggleGroup>
 *             </Stack>
 *             ```
 *
 *             Lib `<ToggleGroup>` + `<Toggle>` atoms STAY — they're klocki. Only this thin
 *             wrapper z forced array is deprecated.
 */
export const ToggleGroupFilter = forwardRef<
  HTMLDivElement,
  ToggleGroupFilterProps
>(function ToggleGroupFilter(
  {
    options,
    value,
    onValueChange,
    label,
    groupLabel,
    className,
    ...rest
  },
  ref,
) {
  return (
    <div ref={ref} className={cn(styles.root, className)} {...rest}>
      {groupLabel ? (
        <Text variant="caption" color="muted" uppercase className={styles.caption}>
          {groupLabel}
        </Text>
      ) : null}
      <ToggleGroup
        type="multiple"
        value={value}
        onValueChange={onValueChange}
        aria-label={label}
        className={styles.group}
      >
        {options.map((option) => (
          <Toggle
            key={option.value}
            value={option.value}
            icon={option.icon}
          >
            {option.label}
          </Toggle>
        ))}
      </ToggleGroup>
    </div>
  );
});
