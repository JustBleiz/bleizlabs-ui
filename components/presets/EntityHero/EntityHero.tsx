import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Heading } from '../../typography/Heading/Heading';
import { Inline } from '../../layout/Inline/Inline';
import { Stack } from '../../layout/Stack/Stack';
import { Text } from '../../typography/Text/Text';
import { BackLink } from '../../molecules/BackLink/BackLink';
import { cn } from '../../utils/cn';
import styles from './EntityHero.module.scss';

/**
 * EntityHero — universal entity detail-view hero shell (renamed from
 * DetailPageHero in v0.7.0; original name remains as deprecated alias).
 *
 * @layer   preset (Phase 8 CP7, sister to IconHeaderCard CP6)
 * @tokens  --space-{1,2,3,4} (gaps between backLink + header row + description +
 *          status + progression + meta strip + metaItem inline); all visual
 *          tokens delegated to BackLink / Heading / Text / Inline / Stack
 *          dependencies.
 * @deps    BackLink (lib molecule M2), Heading + Text (lib typography),
 *          Inline + Stack (lib layout), cn (lib utils). Server-Component safe —
 *          pure compositional shell.
 * @a11y    Renders semantic `<header>` element (NOT `<div>`) — page-level
 *          landmark. BackLink delegated (own a11y). Heading defaults to
 *          `level=1 size=4xl` for canonical detail-page H1; consumers needing
 *          a different level (e.g. nested detail panel) must wrap externally.
 *          Meta strip rendered as `<ul role="list">` for SR navigation.
 *          `aria-label` on root via spread for live data scenarios.
 *
 * @notes   Like IconHeaderCard (CP6 sister preset), EntityHero uses
 *          ReactNode SLOTS (titleBadges, statusIndicators, progression) —
 *          INTENTIONAL family divergence from KpiValue/BreakdownList
 *          children?:never convention. Justified because entity diversity
 *          REQUIRES flexible slots: ServiceDetailHero composes PillarChipGroup
 *          + type label, ProjectDetailHeader composes PillarChipGroup + type
 *          badge + StageProgress, TicketDetailHeader composes status + SLA +
 *          conversion banner. Lib cannot prescribe one shape across all entity
 *          taxonomies. Body composition is consumer-driven; EntityHero owns
 *          shell layout + spacing + semantic landmark only.
 *
 *          Meta strip is structured (typed array) rather than ReactNode slot
 *          because every consumer renders the same shape (icon + label +
 *          value rows) — typed array gives compile-time consistency and
 *          enforces the standard meta-row pattern across panel detail pages.
 *
 * @example
 * // Service detail (driving consumer)
 * <EntityHero
 *   backLink={{ href: '/panel/services', label: 'Wszystkie usługi' }}
 *   title="Chatbot obsługi sklepu"
 *   titleBadges={
 *     <>
 *       <PillarChipGroup pillars={['ai-voice-chat']} />
 *       <Badge color="default" label="Voicebot" />
 *     </>
 *   }
 *   description="Inteligentna obsługa zamówień 24/7 z eskalacją do agenta."
 *   statusIndicators={<Badge color="success" label="Aktywna" dot />}
 *   metaStrip={[
 *     { icon: <IconBriefcase size={14} />, label: 'Projekt', value: <a href="/panel/projects/sklep">Sklep online</a> },
 *     { icon: <IconUser size={14} />, label: 'Account manager', value: 'Anna Kowalska' },
 *     { icon: <IconClock size={14} />, label: 'Ostatnia aktualizacja', value: '2 godz. temu' },
 *   ]}
 * />
 *
 * @example
 * // Minimal
 * <EntityHero
 *   backLink={{ href: '/panel/tickets', label: 'Wszystkie zgłoszenia' }}
 *   title="Zgłoszenie #1234"
 *   statusIndicators={<Badge color="warning" label="W toku" dot />}
 * />
 *
 * @example
 * // No back-link (top-level detail)
 * <EntityHero title="Twoje konto" description="Ustawienia profilu i preferencje." />
 */

export interface EntityHeroMetaItem {
  /** Optional stable React key. Falls back to `${label}-${index}` when omitted. */
  key?: string;
  /**
   * Optional leading icon (rendered left of label). MUST set `aria-hidden="true"`
   * on the consumer-supplied icon node — otherwise SR users hear icon name as
   * noise inside the meta row label. Type system cannot enforce DOM attribute
   * on ReactNode; this is a documented consumer contract.
   */
  icon?: ReactNode;
  /** Meta-item label (e.g. "Account manager"). */
  label: string;
  /** Meta-item value (string, link node, badge — consumer-rendered). */
  value: ReactNode;
}

export interface EntityHeroProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  /** Page title. String → wrapped in `<Heading level=1 size=4xl>`; ReactNode passed through verbatim (consumer owns Heading). NB: shadows native `title` tooltip attribute (intentional — EntityHero `title` is the page H1, not a hover tooltip). */
  title: string | ReactNode;
  /** Optional BackLink config. When omitted no back-link is rendered. */
  backLink?: { href: string; label: string };
  /** Optional ReactNode slot for chips/badges next to title (PillarChipGroup, type label, etc.). Consumer composes. */
  titleBadges?: ReactNode;
  /** Optional subtitle / lead description below title. String → wrapped in `<Text variant=body color=secondary>`. */
  description?: string | ReactNode;
  /** Optional ReactNode slot for status row below description (state badges, payment status, SLA — consumer-driven). */
  statusIndicators?: ReactNode;
  /** Optional ReactNode slot for progression indicator (e.g. StageProgress — projects only; absent for services/tickets). */
  progression?: ReactNode;
  /** Optional structured meta strip rendered below status/progression. Each item: `{ key?, icon?, label, value }`. */
  metaStrip?: EntityHeroMetaItem[];
  /**
   * @internal EntityHero owns its inner layout — children are not accepted.
   * Use named slot props (titleBadges / statusIndicators / progression) or
   * the structured `metaStrip` prop for additional content.
   */
  children?: never;
  // Note: `aria-label` and other aria-* props are inherited from
  // HTMLAttributes via `...rest` spread onto the <header> root.
}

export const EntityHero = forwardRef<HTMLElement, EntityHeroProps>(
  function EntityHero(
    {
      title,
      backLink,
      titleBadges,
      description,
      statusIndicators,
      progression,
      metaStrip,
      className,
      ...rest
    },
    ref
  ) {
    const hasMeta = metaStrip && metaStrip.length > 0;
    const titleNode =
      typeof title === 'string' ? (
        <Heading level={1} size="4xl">
          {title}
        </Heading>
      ) : (
        title
      );
    const descriptionNode =
      typeof description === 'string' ? (
        <Text variant="body" color="secondary">
          {description}
        </Text>
      ) : (
        description
      );

    return (
      <header
        ref={ref}
        className={cn(styles.root, className)}
        {...rest}
      >
        {backLink && <BackLink href={backLink.href} label={backLink.label} />}
        <Stack gap={3}>
          <Inline gap={3} align="start" wrap className={styles.titleRow}>
            {titleNode}
            {titleBadges && (
              <Inline gap={2} align="center" wrap className={styles.titleBadges}>
                {titleBadges}
              </Inline>
            )}
          </Inline>
          {description && descriptionNode}
          {statusIndicators && (
            <Inline gap={2} align="center" wrap className={styles.statusRow}>
              {statusIndicators}
            </Inline>
          )}
          {progression && <div className={styles.progression}>{progression}</div>}
          {hasMeta && (
            <ul role="list" className={styles.metaStrip}>
              {metaStrip.map((item, index) => {
                const key = item.key ?? `${item.label}-${index}`;
                return (
                  <li key={key} className={styles.metaItem}>
                    <Inline gap={1} align="center" className={styles.metaInline}>
                      {item.icon}
                      <Text variant="caption" color="muted" asChild>
                        <span>{item.label}:</span>
                      </Text>
                      <Text variant="caption" color="primary" asChild>
                        <span>{item.value}</span>
                      </Text>
                    </Inline>
                  </li>
                );
              })}
            </ul>
          )}
        </Stack>
      </header>
    );
  }
);
