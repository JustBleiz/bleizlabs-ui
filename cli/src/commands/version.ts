import pc from 'picocolors';
import { loadLibPackage } from '../lib/registry-loader.js';

const CLI_VERSION = '0.10.0';

/**
 * `bleizlabs-ui --version` / `-v` handler.
 *
 * Prints both the lib version (resolved from the installed package) and the
 * CLI version (compiled in via this constant). They MAY differ when consumer
 * runs `npx @bleizlabs/ui@latest <cmd>` against an older installed copy.
 */
export function printVersion(importMetaUrl: string): void {
  let libName = '@bleizlabs/ui';
  let libVersion = '(not installed)';
  try {
    const pkg = loadLibPackage(importMetaUrl);
    libName = pkg.name;
    libVersion = pkg.version;
  } catch {
    // Lib not resolvable — running from sandbox / dev. Continue with placeholder.
  }
  console.log(`${pc.bold(libName)} v${libVersion}`);
  console.log(`${pc.dim('cli')} v${CLI_VERSION}`);
}

export { CLI_VERSION };
