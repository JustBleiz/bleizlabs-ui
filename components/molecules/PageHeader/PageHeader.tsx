import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Badge, type BadgeColor } from '../../display/Badge';
import { Inline } from '../../layout/Inline';
import { Stack } from '../../layout/Stack';
import { Heading, type HeadingSize } from '../../typography/Heading';
import { Text } from '../../typography/Text';
import { cn } from '../../utils/cn';
import styles from './PageHeader.module.scss';

/**
 * PageHeader — page-top title section with optional accent span fragment,
 * subtitle, and status badges (Phase 7 M7, server-safe).
 *
 * Standard top-of-page block for product surfaces (panel pages, list views,
 * detail screens). Composes Heading + Text + Badge atoms via Stack/Inline
 * layout — zero new structural primitives, zero hardcoded typography.
 *
 * @layer   molecule
 * @tokens  --color-text-primary (Heading, inherited),
 *          --color-text-secondary (subtitle Text, inherited),
 *          --color-brand (default accent span color),
 *          --space-2 (badge strip gap, via Inline gap=2),
 *          --space-3 (root vertical gap, via Stack gap=3).
 *          Component-local override channel: `--page-header-accent` —
 *          consumer-supplied `accentColor` prop is forwarded as a CSS custom
 *          property on the root span (not a raw color rule), so the token
 *          pipeline + theming + forced-colors remap stay intact. Default
 *          fallback chain: `var(--page-header-accent, var(--color-brand))`.
 * @deps    Heading atom (level, size), Text atom (variant, color),
 *          Badge atom (label, color, pill), Inline atom (gap, wrap),
 *          Stack atom (gap, flex-direction), cn
 * @a11y    Heading renders semantic <h1>/<h2>/<h3> per `level` prop —
 *          consumer is responsible for picking the right level for the page
 *          outline (typically `1` for landmark page top, `2` for nested
 *          sections). Accent span is a non-semantic inline `<span>` that
 *          inherits font-weight from Heading and only overrides color — it
 *          remains part of the same accessible name read by screen readers.
 *          Subtitle is a `<p>` via Text atom (variant="lead"), semantically
 *          paired with the heading. Badges inherit Badge a11y (status colors
 *          carry meaning via label text, not color alone). PageHeader itself
 *          is presentational — non-interactive, no focus, no role.
 * @notes   Accent span uses [accentStart, accentEnd) char-index slicing on
 *          `title` (half-open interval, exclusive end — matches String.slice).
 *          Out-of-bounds or inverted indices fall back to plain title with
 *          no accent span (defensive — never throws on misconfigured props).
 *          `accentColor` defaults to `var(--color-brand)` and accepts any
 *          valid CSS color value (variable or literal) via inline style on
 *          the span — keeps customization at consumer site without bloating
 *          variant API. `subtitle` accepts ReactNode so callers can embed
 *          links or inline emphasis; pure strings render naturally inside
 *          the Text atom. `badges` is intentionally a plain object array
 *          (not Badge children) so callers don't need to import Badge —
 *          PageHeader owns the Badge instantiation via `key={index}` to
 *          keep the API declarative.
 *
 * @example
 * // Plain title
 * <PageHeader title="Profil" />
 *
 * // Title with accent fragment
 * <PageHeader
 *   title="Moje usługi"
 *   accentStart={5}
 *   accentEnd={11}
 *   subtitle="Przegląd Twoich usług."
 * />
 *
 * // Full — title + accent + subtitle + status badges
 * <PageHeader
 *   level={1}
 *   title="Wykonane projekty"
 *   accentStart={10}
 *   accentEnd={17}
 *   subtitle="Przegląd ukończonych zleceń"
 *   badges={[
 *     { label: 'Aktywne 3', color: 'success' },
 *     { label: '1 ostrzeżenie', color: 'warning' },
 *   ]}
 * />
 */

export type PageHeaderLevel = 1 | 2 | 3;

export interface PageHeaderBadge {
  /** Visible badge label. Required. */
  label: string;
  /** Semantic Badge color. Default `default`. */
  color?: BadgeColor;
  /** Fully rounded pill shape (per Badge.pill). */
  pill?: boolean;
}

export interface PageHeaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Page title text. Required. */
  title: string;
  /** Semantic heading level (h1/h2/h3). Default `2`. */
  level?: PageHeaderLevel;
  /** Visual heading size override. Defaults to Heading's level→size mapping. */
  size?: HeadingSize;
  /**
   * Character index where accent span starts (inclusive).
   * Pair with `accentEnd` to render a colored fragment within the title.
   * Out-of-bounds or inverted indices fall back to plain title.
   */
  accentStart?: number;
  /**
   * Character index where accent span ends (exclusive — matches String.slice).
   */
  accentEnd?: number;
  /**
   * CSS color for the accent span. Default `var(--color-brand)`.
   * Accepts any valid CSS color value (variable or literal).
   */
  accentColor?: string;
  /** Optional subtitle rendered below title (Text variant="lead"). */
  subtitle?: ReactNode;
  /** Optional status badge strip rendered below subtitle. */
  badges?: PageHeaderBadge[];
}

export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  function PageHeader(
    {
      title,
      level = 2,
      size,
      accentStart,
      accentEnd,
      accentColor,
      subtitle,
      badges,
      className,
      ...rest
    },
    ref,
  ) {
    const hasAccent =
      accentStart !== undefined &&
      accentEnd !== undefined &&
      accentStart >= 0 &&
      accentEnd > accentStart &&
      accentEnd <= title.length;

    const titleContent: ReactNode = hasAccent ? (
      <>
        {title.slice(0, accentStart)}
        <span
          className={styles.accent}
          style={
            accentColor
              ? ({
                  ['--page-header-accent']: accentColor,
                } as CSSProperties)
              : undefined
          }
        >
          {title.slice(accentStart, accentEnd)}
        </span>
        {title.slice(accentEnd)}
      </>
    ) : (
      title
    );

    const hasBadges = Array.isArray(badges) && badges.length > 0;

    return (
      <Stack
        ref={ref}
        gap={3}
        className={cn(styles.root, className)}
        {...rest}
      >
        <Heading level={level} size={size} className={styles.title}>
          {titleContent}
        </Heading>

        {subtitle ? (
          <Text variant="lead" color="secondary" className={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}

        {hasBadges ? (
          <Inline gap={2} wrap className={styles.badges}>
            {badges.map((badge, index) => (
              <Badge
                key={`${badge.label}-${index}`}
                label={badge.label}
                color={badge.color}
                pill={badge.pill}
              />
            ))}
          </Inline>
        ) : null}
      </Stack>
    );
  },
);
