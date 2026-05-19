import Link from 'next/link';
import { CodeBlock } from '@/components/display/CodeBlock';
import { Heading } from '@/components/typography/Heading';
import styles from './page.module.scss';

const tsSnippet = `const greet = (name: string) => \`Hello \${name}\`;
greet('świat');`;

const bashSnippet = `# install + run dev server
npm install
npm run dev`;

const sqlSnippet = `select id, total, created_at
from orders
where status = 'paid'
order by created_at desc
limit 10;`;

const longSnippet = `import { useState, useEffect } from 'react';

export function useDebounced<T>(value: T, delay = 250): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return v;
}`;

export default function CodeBlockPlaygroundPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          CodeBlock
        </Heading>
        <p className={styles.intro}>
          Preformatted code surface — structural shell only. Lib does NOT tokenize or highlight
          (zero-deps charter). Feed pre-tokenized children from your own Shiki / Prism /
          Highlight.js pipeline, or plain string for a raw monospace block. Optional language badge,
          copy button, and 1-indexed line-number gutter.
        </p>
      </header>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          1. Plain — raw string, no chrome
        </Heading>
        <div className={styles.sectionBody}>
          <CodeBlock>{tsSnippet}</CodeBlock>
          <p className={styles.bodyText}>Bare preformatted block — surface + border + monospace.</p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          2. Language badge
        </Heading>
        <div className={styles.sectionBody}>
          <CodeBlock language="ts">{tsSnippet}</CodeBlock>
          <CodeBlock language="bash">{bashSnippet}</CodeBlock>
          <CodeBlock language="sql">{sqlSnippet}</CodeBlock>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          3. Copy button (clipboard)
        </Heading>
        <div className={styles.sectionBody}>
          <CodeBlock language="tsx" copy>
            {tsSnippet}
          </CodeBlock>
          <p className={styles.bodyText}>
            Click <em>Copy code</em> — label toggles to <em>Copied</em> for ~2s after success. Falls
            back silently on insecure context.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          4. Line numbers
        </Heading>
        <div className={styles.sectionBody}>
          <CodeBlock language="tsx" showLineNumbers copy>
            {longSnippet}
          </CodeBlock>
          <p className={styles.bodyText}>
            Gutter is decorative (<code>aria-hidden</code>) — screen readers read the code content,
            not numbering chrome. Tabular-nums keeps multi-digit numbers aligned.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} size="lg" className={styles.sectionTitle}>
          5. Pre-tokenized children (consumer-supplied highlighting)
        </Heading>
        <div className={styles.sectionBody}>
          <CodeBlock language="tsx" copyText={tsSnippet} copy>
            <span style={{ color: 'var(--color-brand)' }}>const</span>{' '}
            <span style={{ color: 'var(--color-warning-strong)' }}>greet</span>
            {' = ('}
            <span style={{ color: 'var(--color-success-strong)' }}>name</span>
            {': '}
            <span style={{ color: 'var(--color-brand-strong)' }}>string</span>
            {`) => \`Hello \${name}\`;`}
          </CodeBlock>
          <p className={styles.bodyText}>
            When <code>children</code> is a React tree (not a plain string), pass{' '}
            <code>copyText</code> to control what lands in the clipboard — the lib does not extract
            text from node trees.
          </p>
        </div>
      </section>
    </main>
  );
}
