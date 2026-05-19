/**
 * FileUpload test helpers.
 *
 * Demo route at `/components/file-upload`. Each `<FileUpload>` carries a
 * unique `aria-label` on its drop zone (the element with `role="button"`)
 * for deterministic targeting.
 */

import type { Page, Locator } from '@playwright/test';

export function zoneBy(page: Page, ariaLabel: string): Locator {
  // Drop zone is a plain <div tabIndex={0} aria-label> (NOT role="button" —
  // would trigger axe nested-interactive vs. consumer-rendered Browse button).
  return page.locator(`div[tabindex][aria-label="${ariaLabel}"]`);
}

export function hiddenInputOf(zone: Locator): Locator {
  return zone.locator('input[type="file"]').first();
}

export function liveRegionOf(zone: Locator): Locator {
  return zone.locator('[role="status"][aria-live="polite"]').first();
}

/**
 * Build a synthetic File array for Playwright `setInputFiles({ buffer, ... })`
 * usage. Returns the payload shape Playwright expects.
 */
export function makeFilePayloads(
  files: Array<{ name: string; mimeType: string; bytes?: number }>,
): Array<{ name: string; mimeType: string; buffer: Buffer }> {
  return files.map((f) => ({
    name: f.name,
    mimeType: f.mimeType,
    // Default 1 KB buffer of zeroes — small but non-zero so :invalid clears.
    buffer: Buffer.alloc(f.bytes ?? 1024),
  }));
}

/**
 * Set files on the hidden `<input type="file">` directly. Bypasses the
 * native picker dialog (Playwright cannot interact with OS file pickers).
 * Equivalent to a successful drag-drop with the same files.
 */
export async function selectFiles(
  zone: Locator,
  files: Array<{ name: string; mimeType: string; bytes?: number }>,
): Promise<void> {
  const input = hiddenInputOf(zone);
  await input.setInputFiles(makeFilePayloads(files));
}

/**
 * Simulate a drag-and-drop on the drop zone. Uses Playwright's
 * `dispatchEvent` with a custom DataTransfer constructed in the browser.
 * Covers the dragenter/dragover/drop sequence that the component listens
 * to. Drag-leave / drag-counter paths are exercised in dedicated specs.
 */
export async function dispatchDrop(
  zone: Locator,
  files: Array<{ name: string; mimeType: string; bytes?: number }>,
): Promise<void> {
  const payloads = files.map((f) => ({
    name: f.name,
    type: f.mimeType,
    size: f.bytes ?? 1024,
  }));
  await zone.evaluate((el, items) => {
    const dt = new DataTransfer();
    for (const item of items) {
      const file = new File([new ArrayBuffer(item.size)], item.name, {
        type: item.type,
      });
      dt.items.add(file);
    }
    // Counter pattern needs dragenter first.
    el.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }));
    el.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true }));
    el.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true }));
  }, payloads);
}
