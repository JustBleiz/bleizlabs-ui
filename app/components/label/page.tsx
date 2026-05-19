import Link from 'next/link';
import { Label } from '@/components/interactive/Label';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import styles from './page.module.scss';

/**
 * Label showcase intentionally pairs the atom with raw `<input>` / `<select>`
 * elements to demonstrate `htmlFor` coupling in isolation. The library `Input`
 * component renders its own internal `Label` via the `label` prop — this page
 * is for consumers that need the Label atom standalone (custom form layouts,
 * multi-line groupings, fieldset legends).
 */
export default function LabelPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          Label
        </Heading>
        <p className={styles.intro}>
          Form-coupled `&lt;label&gt;` element with optional required indicator and visual disabled
          state. The library `Input` renders its own Label automatically; use this atom directly
          when composing custom form layouts.
        </p>
      </header>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Default — coupled to a native input
        </Heading>
        <div className={styles.field}>
          <Label htmlFor="email-default">Email address</Label>
          <input // @library-first-ok: Label playground demonstrating standalone htmlFor coupling
            id="email-default"
            name="email"
            type="email"
            placeholder="you@example.com"
            className={styles.rawInput}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Required indicator
        </Heading>
        <Text variant="caption" color="muted">
          The `*` is decorative (`aria-hidden`). Real semantics live on the input via the native
          `required` attribute, which screen readers announce as &ldquo;required&rdquo;.
        </Text>
        <div className={styles.field}>
          <Label htmlFor="email-required" required>
            Email address
          </Label>
          <input // @library-first-ok: Label playground
            id="email-required"
            name="email"
            type="email"
            required
            className={styles.rawInput}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Visual disabled state
        </Heading>
        <Text variant="caption" color="muted">
          The `disabled` prop dims the label only — the input owns real disabled semantics.
        </Text>
        <div className={styles.field}>
          <Label htmlFor="email-disabled" disabled>
            Email address
          </Label>
          <input // @library-first-ok: Label playground
            id="email-disabled"
            name="email"
            type="email"
            disabled
            placeholder="Disabled"
            className={styles.rawInput}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. Required + disabled together
        </Heading>
        <div className={styles.field}>
          <Label htmlFor="email-both" required disabled>
            Email address
          </Label>
          <input // @library-first-ok: Label playground
            id="email-both"
            name="email"
            type="email"
            required
            disabled
            className={styles.rawInput}
          />
        </div>
      </section>

      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. asChild → semantic legend
        </Heading>
        <Text variant="caption" color="muted">
          When the consumer needs a `&lt;legend&gt;` inside a `&lt;fieldset&gt;` or another semantic
          wrapper, render the Label children inside that element via `asChild`.
        </Text>
        <fieldset className={styles.fieldset}>
          <Label asChild required>
            <legend>Account preferences</legend>
          </Label>
          <Text variant="caption" color="muted">
            (Styling matches a regular Label, rendered element is `&lt;legend&gt;`.)
          </Text>
        </fieldset>
      </section>
    </main>
  );
}
