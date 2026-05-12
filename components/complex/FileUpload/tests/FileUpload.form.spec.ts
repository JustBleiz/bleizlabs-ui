/**
 * FileUpload form integration spec — FormData multipart, required, Field.
 *
 * Total: 5 cases (FU-F01..FU-F05).
 */

import { test, expect } from '@playwright/test';
import { zoneBy, selectFiles, hiddenInputOf } from './_helpers';

const URL = '/components/file-upload';

test.describe('FileUpload — form integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('FU-F01: hidden input carries name attribute for FormData capture', async ({ page }) => {
    const zone = zoneBy(page, 'Attachment file');
    const input = hiddenInputOf(zone);
    await expect(input).toHaveAttribute('name', 'attachment');
  });

  test('FU-F02: required attribute mirrors prop on hidden input', async ({ page }) => {
    // FU-R04 — required attr present but element not focusable (tabIndex=-1)
    // → browser surfaces :invalid without "not focusable" crash.
    const zone = zoneBy(page, 'Attachment file');
    const input = hiddenInputOf(zone);
    await expect(input).toHaveAttribute('required', '');
  });

  test('FU-F03: empty required field blocks form submit', async ({ page }) => {
    // FU-R20 — Constraint Validation API blocks submit on empty required.
    const submit = page.getByRole('button', { name: /^submit$/i }).first();
    await submit.click();
    // No "Submitted:" badge should appear.
    await expect(page.getByText(/Submitted/i)).not.toBeVisible();
  });

  test('FU-F04: filled required field allows submit; FormData captures file', async ({ page }) => {
    const zone = zoneBy(page, 'Attachment file');
    await selectFiles(zone, [
      { name: 'contract.pdf', mimeType: 'application/pdf', bytes: 2048 },
    ]);
    await page.getByRole('button', { name: /^submit$/i }).first().click();
    // Submitted line shows file name.
    await expect(page.getByText('contract.pdf').first()).toBeVisible();
  });

  test('FU-F05: hidden input accept attribute reflects normalized prop', async ({ page }) => {
    // FU-R05 — accept normalized (trim + lowercase + dedupe) — joined for native input.
    const zone = zoneBy(page, 'Attachment file');
    const input = hiddenInputOf(zone);
    const accept = await input.getAttribute('accept');
    expect(accept).toContain('application/pdf');
    expect(accept).toContain('image/*');
  });
});
