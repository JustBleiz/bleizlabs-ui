import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './Chip.module.scss';

/**
 * Chip — pill-shaped filter chip with toggle (default) or display-only mode.
 *
 * Distinct from `Toggle`: Toggle is a generic on/off button (Bold, Italic);
 * Chip is the filter-row pattern with smaller dimensions, pill-only shape,
 * and brand-on-pressed semantics.
 *
 * @tokens  --color-brand, --color-brand-subtle, --color-brand-strong,
 *          --color-surface, --color-surface-raised, --color-border-subtle,
 *          --color-text-{primary,secondary,muted}, --color-{success,warning,
 *          error,info,brand}-strong, --space-{1,2,3}, --font-size-xs,
 *          --font-weight-medium, --letter-spacing-wide, --radius-full,
 *          --duration-fast, --easing-default, --focus-ring
 *
 * @a11y    Interactive (default `interactive=true`): native
 *          `<button type="button" aria-pressed>` — keyboard activation
 *          (Space/Enter) + AT press semantics. Disabled state uses native
 *          `disabled`. Decorative dot (when `dot={true}`) carries
 *          `aria-hidden="true"` — meaning must live in chip label text.
 *
 *          Display (`interactive=false`): renders `<span>` with NO
 *          aria-pressed (display chips have no toggle semantics — info
 *          is the chip text + optional dot color). Optional `pressed`
 *          drives initial visual state for active-filter summary patterns
 *          where the chip is read-only.
 *
 * @example
 * // Interactive (default)
 * const [active, setActive] = useState<string[]>([]);
 * <Chip
 *   pressed={active.includes('queued')}
 *   onPressedChange={() => toggle('queued')}
 * >
 *   Queued
 * </Chip>
 *
 * // Display-only
 * <Chip interactive={false} pressed dot dotColor="success">Online</Chip>
 * <Chip interactive={false} dot dotColor="info">EU-DACH</Chip>
 */
export type ChipSize = 'sm' | 'md';
export type ChipTone = 'default' | 'brand';
export type ChipDotColor =
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'muted';

// ----------------------------------------------------------------------------
// Shared / variant prop types
// ----------------------------------------------------------------------------

type ChipSharedFields = {
  /** Size scale. Default `'md'`. */
  size?: ChipSize;
  /**
   * Pressed-state color tone. Default `'brand'` (brand-subtle background +
   * brand-strong text). `'default'` swaps to a neutral fill — useful for
   * filter rows where the active state should not compete with brand CTAs.
   */
  tone?: ChipTone;
  /** Render a leading status dot. Default `false`. */
  dot?: boolean;
  /** Status dot color (only applies when `dot={true}`). Default `'brand'`. */
  dotColor?: ChipDotColor;
  /** Chip label text — visible accessible name. */
  children: ReactNode;
};

/**
 * Interactive Chip variant — default. Renders native `<button aria-pressed>`.
 */
export type ChipInteractiveProps = ChipSharedFields &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'value' | 'defaultValue' | 'onChange' | 'children'
  > & {
    /**
     * Default `true` — interactive button. Set `false` to render display-only
     * `<span>`.
     */
    interactive?: true;
    /** Controlled pressed state. Required when interactive. */
    pressed: boolean;
    /** Pressed change callback (fires on click; receives the next value). */
    onPressedChange?: (pressed: boolean) => void;
  };

/**
 * Display Chip variant — renders `<span>` with no toggle semantics.
 * Use for read-only status indicators, summary band-tinted chips, etc.
 */
export type ChipDisplayProps = ChipSharedFields &
  Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
    /** Marks this Chip as display-only (no aria-pressed, no click handler). */
    interactive: false;
    /** Optional initial visual pressed state. No toggle behavior. */
    pressed?: boolean;
    /** Not allowed in display mode — display chips don't toggle. */
    onPressedChange?: never;
  };

export type ChipProps = ChipInteractiveProps | ChipDisplayProps;

// ----------------------------------------------------------------------------
// Style maps
// ----------------------------------------------------------------------------

const SIZE_CLASS: Record<ChipSize, string> = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
};

const TONE_CLASS: Record<ChipTone, string> = {
  default: styles.toneDefault!,
  brand: styles.toneBrand!,
};

const DOT_COLOR_CLASS: Record<ChipDotColor, string> = {
  brand: styles.dotBrand!,
  success: styles.dotSuccess!,
  warning: styles.dotWarning!,
  error: styles.dotError!,
  info: styles.dotInfo!,
  muted: styles.dotMuted!,
};

// ----------------------------------------------------------------------------
// Implementation — single forwardRef with discriminated runtime branch.
// `ref` typing is widened to HTMLElement at the implementation level so the
// internal cast is contained; the exported `Chip` binding narrows the public
// surface back to `HTMLButtonElement` (interactive) or `HTMLSpanElement`
// (display) via overloaded function-type signatures below.
// ----------------------------------------------------------------------------

const ChipImpl = forwardRef<HTMLElement, ChipProps>(function Chip(props, ref) {
  if (props.interactive === false) {
    const {
      interactive: _interactive,
      pressed = false,
      onPressedChange: _onPressedChange,
      size = 'md',
      tone = 'brand',
      dot = false,
      dotColor = 'brand',
      className,
      children,
      ...spanRest
    } = props;
    void _interactive;
    void _onPressedChange;
    return (
      <span
        ref={ref as ForwardedRef<HTMLSpanElement>}
        data-state={pressed ? 'on' : 'off'}
        className={cn(
          styles.root,
          styles.display,
          SIZE_CLASS[size],
          TONE_CLASS[tone],
          pressed && styles.pressed,
          className,
        )}
        {...spanRest}
      >
        {dot ? (
          <span
            aria-hidden="true"
            className={cn(styles.dot, DOT_COLOR_CLASS[dotColor])}
          />
        ) : null}
        <span className={styles.label}>{children}</span>
      </span>
    );
  }

  const {
    interactive: _interactive,
    pressed,
    onPressedChange,
    size = 'md',
    tone = 'brand',
    dot = false,
    dotColor = 'brand',
    disabled,
    className,
    onClick,
    children,
    ...rest
  } = props;
  void _interactive;
  return (
    <button
      ref={ref as ForwardedRef<HTMLButtonElement>}
      type="button"
      aria-pressed={pressed}
      data-state={pressed ? 'on' : 'off'}
      disabled={disabled}
      className={cn(
        styles.root,
        SIZE_CLASS[size],
        TONE_CLASS[tone],
        pressed && styles.pressed,
        className,
      )}
      onClick={(event) => {
        onPressedChange?.(!pressed);
        onClick?.(event);
      }}
      {...rest}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cn(styles.dot, DOT_COLOR_CLASS[dotColor])}
        />
      ) : null}
      <span className={styles.label}>{children}</span>
    </button>
  );
});

ChipImpl.displayName = 'Chip';

/**
 * Function-overloaded public type — TS narrows `ref` per discriminator.
 * Interactive consumers get `Ref<HTMLButtonElement>`; display consumers
 * get `Ref<HTMLSpanElement>`. When `interactive` is omitted the type
 * narrows to the interactive variant.
 */
type ChipComponent = {
  (
    props: ChipInteractiveProps & { ref?: Ref<HTMLButtonElement> },
  ): ReactElement;
  (props: ChipDisplayProps & { ref?: Ref<HTMLSpanElement> }): ReactElement;
  displayName?: string;
};

export const Chip = ChipImpl as unknown as ChipComponent;
