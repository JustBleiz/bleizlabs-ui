import {
  forwardRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  type CardProps,
} from '../../display/Card';
import { Heading } from '../../typography/Heading';
import { Text } from '../../typography/Text';
import { cn } from '../../utils/cn';
import styles from './PairedCard.module.scss';

/**
 * PairedCard — good/bad decision split preset (v0.4.0, E146).
 *
 * Atelier comparison primitive — a Card with a semantic accent line driven by
 * a single `variant` prop so consumers can render "how to do it" / "how NOT
 * to do it" cells side-by-side without per-page accent logic. Used by the
 * website MeetsSection S6 and homepage atelier comparison blocks.
 *
 * Accent routing: `variant` drives a local CSS var `--paired-card-accent`,
 * which is forwarded to Card's `accentColor` prop. Consumers can override the
 * color without changing `variant` by setting `--paired-card-accent` at the
 * call site (e.g., for atelier-tinted soft palettes that differ from the
 * default success/error semantic tokens).
 *
 * @layer   preset
 * @tokens  --color-success (variant="good" default accent),
 *          --color-error (variant="bad" default accent),
 *          --paired-card-accent (consumer-overridable channel — resolves to
 *          one of the above per variant); Card atom handles outer padding /
 *          radius / border / accent ribbon tokens
 * @deps    Card (variant="accent", accentPosition="left", accentColor, CardProps type),
 *          CardHeader (border flag), CardBody, CardFooter,
 *          Heading (level={3}, size="lg"),
 *          Text (variant="body", color="muted"), cn,
 *          React: `forwardRef`, `CSSProperties`, `ReactNode`
 * @a11y    Inherits Card semantic `<div>` root. Accent color is presentational
 *          only — consumers who need the good/bad distinction announced to
 *          screen readers should include it in the `title` text itself (e.g.,
 *          "Dobrze: …" / "Źle: …"), since color alone is WCAG 1.4.1 violation
 *          for conveying meaning. `variant` is visual emphasis, not accessible
 *          semantics.
 * @apg          N/A — composition preset, no new ARIA semantics; inherited via composed atoms.
 * @tested       tsc + eslint + next build clean. No runtime a11y suite (presets transitively covered by atom tests).
 * @regressions  N/A — preset composition. Bug fixes land in composed atoms.
 * @notes   Card's `variant`, `accentColor`, `accentPosition`, `direction`,
 *          `children`, and native HTML `title` attribute are preset-owned
 *          (TS-enforced Omit) — PairedCard drives them from its own
 *          `variant` + slots. `headerBorder` default `false` for tight
 *          atelier comparison rhythm.
 *          Scope note — v0.4.0 keeps API minimal: two variants + slots,
 *          no neutral/info variants (Rule-of-Three not met), no icon slot
 *          (consumer renders marker inside `title`). Future extensions land
 *          when new consumers amortize them.
 *          Defaults — `padding=5` (20px, matches ContentCard/StatsCard preset
 *          rhythm) and `radius='lg'`. Both are forwarded as destructure
 *          defaults, so consumers CAN override via the usual Card prop spread
 *          (`<PairedCard padding={6} radius="xl" …/>`) — the Omit list
 *          intentionally leaves them tunable for layout-density tuning.
 * @example
 * <Inline gap={4} align="stretch">
 *   <PairedCard variant="good" title="Dobrze" description="Wytłumaczenie">
 *     <Text>Treść "tak to robimy".</Text>
 *   </PairedCard>
 *   <PairedCard variant="bad" title="Źle" description="Wytłumaczenie">
 *     <Text>Treść "tak NIE robimy".</Text>
 *   </PairedCard>
 * </Inline>
 */
export type PairedCardVariant = 'good' | 'bad';

export interface PairedCardProps
  extends Omit<
    CardProps,
    | 'variant'
    | 'accentColor'
    | 'accentPosition'
    | 'direction'
    | 'children'
    | 'title'
  > {
  /**
   * Semantic variant driving the accent line color. `good` = success token;
   * `bad` = error token. Consumers override via `--paired-card-accent` CSS
   * var at the call site (inline style or page-scoped SCSS) without touching
   * this prop.
   */
  variant: PairedCardVariant;
  /** Heading slot. Scalar strings/numbers auto-wrap in `<Heading level={3} size="lg">`; ReactNode passes through. */
  title?: ReactNode;
  /** Description slot. Scalar strings/numbers auto-wrap in `<Text variant="body" color="muted">`; ReactNode passes through. */
  description?: ReactNode;
  /** Primary body content rendered inside CardBody. */
  children?: ReactNode;
  /** Optional footer slot — renders CardFooter when provided. Consumer owns layout of footer children. */
  footer?: ReactNode;
  /** Separate header from body with a top divider inside CardHeader. Default: `false`. */
  headerBorder?: boolean;
}

const VARIANT_ACCENT_DEFAULT: Record<PairedCardVariant, string> = {
  good: 'var(--color-success)',
  bad: 'var(--color-error)',
};

function wrapTitle(title: ReactNode): ReactNode {
  if (title === undefined || title === null) return null;
  if (typeof title === 'string' || typeof title === 'number') {
    return (
      <Heading level={3} size="lg">
        {title}
      </Heading>
    );
  }
  return title;
}

function wrapDescription(description: ReactNode): ReactNode {
  if (description === undefined || description === null) return null;
  if (typeof description === 'string' || typeof description === 'number') {
    return (
      <Text variant="body" color="muted">
        {description}
      </Text>
    );
  }
  return description;
}

export const PairedCard = forwardRef<HTMLDivElement, PairedCardProps>(
  function PairedCard(
    {
      variant,
      title,
      description,
      children,
      footer,
      headerBorder = false,
      padding = 5,
      radius = 'lg',
      className,
      style,
      ...cardProps
    },
    ref,
  ) {
    const titleNode = wrapTitle(title);
    const descriptionNode = wrapDescription(description);
    const hasHeader = titleNode !== null || descriptionNode !== null;
    const hasBody = children !== undefined && children !== null;
    const hasFooter = footer !== undefined && footer !== null;

    const pairedVars: CSSProperties = {
      '--paired-card-accent': VARIANT_ACCENT_DEFAULT[variant],
    } as CSSProperties;
    const mergedStyle = { ...pairedVars, ...style };

    return (
      <Card
        ref={ref}
        variant="accent"
        accentPosition="left"
        accentColor="var(--paired-card-accent)"
        padding={padding}
        radius={radius}
        className={cn(
          styles.root,
          styles[`variant-${variant}`],
          className,
        )}
        style={mergedStyle}
        {...cardProps}
      >
        {hasHeader ? (
          <CardHeader border={headerBorder} className={styles.header}>
            {titleNode}
            {descriptionNode}
          </CardHeader>
        ) : null}
        {hasBody ? <CardBody className={styles.body}>{children}</CardBody> : null}
        {hasFooter ? <CardFooter className={styles.footer}>{footer}</CardFooter> : null}
      </Card>
    );
  },
);
