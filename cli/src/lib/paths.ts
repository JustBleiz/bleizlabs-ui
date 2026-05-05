import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * Resolve the `@bleizlabs/ui` package root from the running CLI's vantage point.
 *
 * The CLI bundle ships as `<lib-pkg>/cli-dist/bin.js` — when executed via
 * `npx bleizlabs-ui` the cwd is the consumer project, but `import.meta.url`
 * still resolves inside the lib package. This function returns the lib package
 * root (one level above `cli-dist/`).
 *
 * Used to locate `manifest.json`, `README.md`, `package.json` for version
 * reporting + manifest loading without depending on consumer's node_modules
 * resolution rules.
 */
export function getLibPackageRoot(importMetaUrl: string): string {
  const cliDistDir = path.dirname(fileURLToPath(importMetaUrl));
  return path.dirname(cliDistDir);
}

/**
 * Resolve a path relative to the consumer project (process.cwd()).
 */
export function resolveConsumerPath(relPath: string): string {
  return path.resolve(process.cwd(), relPath);
}
