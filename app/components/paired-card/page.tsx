import Link from 'next/link';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Inline } from '@/components/layout/Inline';
import { PairedCard } from '@/components/presets/PairedCard';
import styles from './page.module.scss';

export default function PairedCardPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← back</Link>
        <Heading level={1} size="4xl">PairedCard</Heading>
        <p className={styles.intro}>
          Good/bad decision split preset. `variant` drives
          `--paired-card-accent` CSS var forwarded to Card&apos;s accent ribbon.
          Consumer can override the channel via inline style for
          atelier-tinted palettes without changing `variant`.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">1. Default variants — good / bad</Heading>
        <Inline gap={4} align="stretch">
          <PairedCard
            variant="good"
            title="Dobrze"
            description="Tak robimy to u nas"
          >
            <Text>
              Jasne kryteria przyjęcia, pisemna umowa, kamienie milowe z
              konkretną weryfikacją.
            </Text>
          </PairedCard>
          <PairedCard
            variant="bad"
            title="Źle"
            description="Tak NIE robimy"
          >
            <Text>
              Ustna deklaracja „zobaczymy jak pójdzie”, brak kryteriów
              wyjścia, rozliczenie „na zaufanie”.
            </Text>
          </PairedCard>
        </Inline>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">2. Consumer override via CSS var</Heading>
        <p className={styles.label}>
          style={`{{ '--paired-card-accent': 'var(--color-brand)' }}`}
        </p>
        <Inline gap={4} align="stretch">
          <PairedCard
            variant="good"
            title="Brand-tinted"
            description="Override: accent = --color-brand"
            style={{ '--paired-card-accent': 'var(--color-brand)' } as React.CSSProperties}
          >
            <Text>
              Atelier-soft accent zamiast standardowego success. `variant`
              nadal `good` — tylko kolor override.
            </Text>
          </PairedCard>
          <PairedCard
            variant="bad"
            title="Muted"
            description="Override: accent = --color-text-muted"
            style={{ '--paired-card-accent': 'var(--color-text-muted)' } as React.CSSProperties}
          >
            <Text>
              Desaturated &quot;bad&quot; dla mniej agresywnego kontrastu w gęstych
              blokach porównania.
            </Text>
          </PairedCard>
        </Inline>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">3. With footer slot</Heading>
        <Inline gap={4} align="stretch">
          <PairedCard
            variant="good"
            title="Z footer"
            description="Footer w CardFooter"
            headerBorder
            footer={<Text variant="caption" color="muted">→ więcej kontekstu</Text>}
          >
            <Text>Treść body, nad nią headerBorder separator.</Text>
          </PairedCard>
          <PairedCard variant="bad" title="Minimal">
            <Text>Tylko title + children, bez description i footer.</Text>
          </PairedCard>
        </Inline>
      </section>
    </main>
  );
}
