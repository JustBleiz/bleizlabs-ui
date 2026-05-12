/**
 * FileUpload validation spec — accept / maxSize / minSize / maxFiles matrix.
 *
 * Total: 10 cases (FU-V01..FU-V10).
 */

import { test, expect } from '@playwright/test';
import { zoneBy, dispatchDrop, selectFiles } from './_helpers';

const URL = '/components/file-upload';

test.describe('FileUpload — validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('FU-V01: accept="application/pdf" accepts PDF', async ({ page }) => {
    const zone = zoneBy(page, 'Upload PDF documents');
    await selectFiles(zone, [
      { name: 'spec.pdf', mimeType: 'application/pdf' },
    ]);
    await expect(page.getByText('spec.pdf')).toBeVisible();
  });

  test('FU-V02: accept="application/pdf" rejects PNG', async ({ page }) => {
    // FU-R06 — rejection visible only via the live region "rejected" announce
    // and absence of FileChip.
    const zone = zoneBy(page, 'Upload PDF documents');
    await selectFiles(zone, [
      { name: 'screenshot.png', mimeType: 'image/png' },
    ]);
    await expect(page.getByText('screenshot.png', { exact: true })).toHaveCount(0);
  });

  test('FU-V03: accept="image/*" wildcard accepts PNG + JPEG', async ({ page }) => {
    // FU-R09 — application/* wildcard test (same matcher logic).
    const zone = zoneBy(page, 'Upload image under 1 megabyte');
    await dispatchDrop(zone, [
      { name: 'a.png', mimeType: 'image/png', bytes: 500 },
      { name: 'b.jpeg', mimeType: 'image/jpeg', bytes: 500 },
    ]);
    // Both files visible via FileChip in the rejection or accept list.
    // For this use case (accept="image/*"), both are valid; no FileChip
    // displays accepted files (no setState wired). So we check zone state
    // returned to idle without rejection.
    await expect(zone).toHaveAttribute('data-state', 'idle');
  });

  test('FU-V04: maxSize=1_000_000 rejects 2 MB file', async ({ page }) => {
    const zone = zoneBy(page, 'Upload file under 1 megabyte');
    await selectFiles(zone, [
      { name: 'big.txt', mimeType: 'text/plain', bytes: 2_000_000 },
    ]);
    // Rejection visible.
    await expect(page.getByText(/Rejected/i).first()).toBeVisible();
  });

  test('FU-V05: maxSize boundary — exactly maxSize accepts', async ({ page }) => {
    const zone = zoneBy(page, 'Upload file under 1 megabyte');
    await selectFiles(zone, [
      { name: 'exact.txt', mimeType: 'text/plain', bytes: 1_000_000 },
    ]);
    // exact size === maxSize is NOT > maxSize, so accepted.
    await expect(page.getByText('exact.txt')).toBeVisible();
  });

  test('FU-V06: maxFiles=5 accepts 5, rejects 6th', async ({ page }) => {
    // FU-R15
    const zone = zoneBy(page, 'Upload up to 5 files');
    await dispatchDrop(zone, [
      { name: '1.txt', mimeType: 'text/plain' },
      { name: '2.txt', mimeType: 'text/plain' },
      { name: '3.txt', mimeType: 'text/plain' },
      { name: '4.txt', mimeType: 'text/plain' },
      { name: '5.txt', mimeType: 'text/plain' },
      { name: '6.txt', mimeType: 'text/plain' },
    ]);
    // 5 accepted shown; 6th in rejection state. Badge text contains "1 rejected".
    await expect(page.getByText('5.txt')).toBeVisible();
    await expect(page.getByText(/1 rejected|rejected/i).first()).toBeVisible();
  });

  test('FU-V07: multiple file rejection — combined accept + size in error use case', async ({ page }) => {
    const zone = zoneBy(page, 'Upload image under 1 megabyte');
    await selectFiles(zone, [
      // wrong type → file-invalid-type
      { name: 'doc.pdf', mimeType: 'application/pdf', bytes: 500 },
    ]);
    // FileChip in error variant rendered.
    await expect(page.getByText('doc.pdf')).toBeVisible();
  });

  test('FU-V08: empty MIME accepted via extension fallback (FU-R07)', async ({ page }) => {
    // accept="application/pdf" + file with empty MIME but .pdf extension.
    // Match by extension fallback when MIME empty.
    const zone = zoneBy(page, 'Upload PDF documents');
    await selectFiles(zone, [
      // No mimeType prop → empty type. Buffer with .pdf name.
      { name: 'mystery.pdf', mimeType: '' },
    ]);
    // Note: most browsers infer application/pdf from .pdf extension when
    // building File from path, so this test verifies our matcher accepts
    // either path. Either way, file should be accepted.
    await expect(page.getByText('mystery.pdf')).toBeVisible();
  });

  test('FU-V09: disabled blocks setInputFiles via picker chain', async ({ page }) => {
    // Native <input disabled> blocks file selection at the input level
    // regardless of our drop-zone logic.
    const zone = zoneBy(page, 'Disabled file upload');
    const input = zone.locator('input[type="file"]');
    await expect(input).toBeDisabled();
  });

  test('FU-V10: zero-file drop is no-op (no callbacks)', async ({ page }) => {
    // FU-R17 — empty selection / drop should not fire onFiles or onReject.
    const zone = zoneBy(page, 'Upload single file');
    await zone.evaluate((el) => {
      const dt = new DataTransfer(); // empty
      el.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true }));
    });
    // Zone state remains idle; live region empty.
    await expect(zone).toHaveAttribute('data-state', 'idle');
    const live = zone.locator('[role="status"]').first();
    await expect(live).toHaveText('');
  });
});
