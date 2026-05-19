import Link from 'next/link';
import { IconBox, type IconBoxVariant, type IconBoxSize } from '@/components/display/IconBox';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

const VARIANTS: IconBoxVariant[] = ['default', 'brand', 'success', 'error', 'plain'];
const SIZES: IconBoxSize[] = ['sm', 'md', 'lg'];

export default function IconBoxPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          IconBox
        </Heading>
        <p className={styles.intro}>
          Square icon container with bg + color variants. Five variants, three sizes, asChild for
          interactive use cases.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Variants (size md)
        </Heading>
        <div className={styles.row}>
          {VARIANTS.map((variant) => (
            <div key={variant} className={styles.cell}>
              <IconBox variant={variant} icon={<span>★</span>} />
              <Text variant="caption" color="muted">
                {variant}
              </Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Sizes (variant brand)
        </Heading>
        <div className={styles.row}>
          {SIZES.map((size) => (
            <div key={size} className={styles.cell}>
              <IconBox size={size} variant="brand" icon={<span>✓</span>} />
              <Text variant="caption" color="muted">
                {size}
              </Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Variant × size matrix
        </Heading>
        <div className={styles.matrix}>
          {VARIANTS.map((variant) => (
            <div key={variant} className={styles.matrixRow}>
              {SIZES.map((size) => (
                <IconBox
                  key={`${variant}-${size}`}
                  variant={variant}
                  size={size}
                  icon={<span>◆</span>}
                />
              ))}
              <Text variant="caption" color="muted">
                {variant}
              </Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. asChild → interactive button
        </Heading>
        <div className={styles.row}>
          <IconBox asChild variant="brand" icon={<span>+</span>}>
            <button type="button" aria-label="Add item">
              <span aria-hidden="true">+</span>
            </button>
          </IconBox>
          <Text variant="caption" color="muted">
            Slot replaces div with `&lt;button&gt;` — keyboard-accessible by default.
          </Text>
        </div>
      </section>
    </main>
  );
}
