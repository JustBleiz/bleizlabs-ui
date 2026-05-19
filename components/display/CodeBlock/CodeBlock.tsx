'use client';

import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import styles from './CodeBlock.module.scss';

/**
 * CodeBlock — preformatted code surface with optional language badge,
 * copy button, and line-number gutter.
 *
 * Structural-only — the lib does NOT perform syntax highlighting (zero-deps
 * charter). Consumers feed pre-tokenized highlighted markup as `children`
 * from their own Shiki / Prism / Highlight.js pipeline, or plain string for
 * a raw monospace block.
 *
 * @layer   display (molecule)
 * @tokens  --color-surface-raised, --color-border, --color-text-primary,
 *          --color-text-muted, --space-{2,3,4,6}, --font-mono,
 *          --font-size-{xs,sm}, --line-height-relaxed, --radius-md.
 * @deps    cn, React: `forwardRef`, `useState`, `useCallback`, `useMemo`,
 *          types `HTMLAttributes<HTMLPreElement>`, `ReactNode`.
 * @a11y    Renders `<pre><code>`, native semantics announce as a code
 *          block region. Copy button uses native `<button type="button">`
 *          with `aria-label` (default "Copy code"). Toggles to `aria-live`
 *          polite confirmation ("Copied") for ~2s after success. Language
 *          badge is decorative (`aria-hidden="true"`) — the language is
 *          inferred by sighted users from the badge and by AT users from
 *          the code content itself; force-announcing the language would be
 *          noisy. Line numbers are decorative (`aria-hidden="true"`) — AT
 *          reads the code content, not numbering chrome.
 *
 * @example raw string code
 * <CodeBlock language="ts">
 *   {`const greet = (name: string) => \`Hello \${name}\`;`}
 * </CodeBlock>
 *
 * @example pre-tokenized (Shiki output)
 * <CodeBlock language="tsx" copy>
 *   <span dangerouslySetInnerHTML={{ __html: shikiHtml }} />
 * </CodeBlock>
 *
 * @example with line numbers, no copy
 * <CodeBlock language="bash" showLineNumbers>
 *   {scriptSource}
 * </CodeBlock>
 */
export interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
  /** Code content — plain string (preserved as-is) or pre-tokenized nodes. */
  children: ReactNode;
  /**
   * Optional language label rendered in the top-right corner as a decorative
   * badge (e.g. `'ts'`, `'tsx'`, `'bash'`, `'json'`, `'sql'`). Free-form —
   * no validation against a fixed list so consumers using rare grammars
   * (Cypher, GraphQL, Nix) get the same badge surface.
   */
  language?: string;
  /** Show a 1-indexed line-number gutter. Default `false`. */
  showLineNumbers?: boolean;
  /**
   * Show a copy-to-clipboard button. When `children` is a plain string the
   * raw text is copied. Otherwise pass `copyText` to control what lands in
   * the clipboard. Default `false`.
   */
  copy?: boolean;
  /**
   * Override for the clipboard payload. Required when `copy` is true AND
   * `children` is not a plain string (the lib does not extract text from
   * React node trees).
   */
  copyText?: string;
  /** Accessible label for the copy button. Default `'Copy code'`. */
  copyLabel?: string;
  /** Accessible label announced after a successful copy. Default `'Copied'`. */
  copiedLabel?: string;
}

export const CodeBlock = forwardRef<HTMLPreElement, CodeBlockProps>(function CodeBlock(
  {
    children,
    language,
    showLineNumbers = false,
    copy = false,
    copyText,
    copyLabel = 'Copy code',
    copiedLabel = 'Copied',
    className,
    ...rest
  },
  ref,
) {
  const [copied, setCopied] = useState(false);

  const childIsString = typeof children === 'string';

  const lineCount = useMemo(() => {
    if (!showLineNumbers || !childIsString) return 0;
    const trimmed = (children as string).replace(/\n$/, '');
    return trimmed.split('\n').length;
  }, [children, showLineNumbers, childIsString]);

  const handleCopy = useCallback(async () => {
    const payload = copyText !== undefined ? copyText : childIsString ? (children as string) : '';
    if (!payload || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard refused (permissions / insecure context) — leave state
      // unchanged; consumer can wrap with its own toast feedback.
    }
  }, [copyText, childIsString, children]);

  return (
    <pre ref={ref} className={cn(styles.root, className)} {...rest}>
      {(language || copy) && (
        <div className={styles.chrome}>
          {language && (
            <span aria-hidden="true" className={styles.language}>
              {language}
            </span>
          )}
          {copy && (
            <button
              type="button"
              className={styles.copy}
              onClick={handleCopy}
              aria-label={copied ? copiedLabel : copyLabel}
            >
              <span aria-hidden="true">{copied ? copiedLabel : copyLabel}</span>
            </button>
          )}
        </div>
      )}
      <code className={cn(styles.code, showLineNumbers && styles.withLines)}>
        {showLineNumbers && lineCount > 0 ? (
          <span aria-hidden="true" className={styles.lines}>
            {Array.from({ length: lineCount }, (_, i) => (
              <span key={i} className={styles.line}>
                {i + 1}
              </span>
            ))}
          </span>
        ) : null}
        <span className={styles.content}>{children}</span>
      </code>
    </pre>
  );
});
