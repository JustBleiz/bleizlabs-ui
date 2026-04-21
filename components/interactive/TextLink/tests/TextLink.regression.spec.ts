/**
 * TextLink regression spec — asChild + hideArrow matrix (E164 Wave 3, v0.4.2).
 *
 * Coverage:
 * - Default (`<TextLink href>…</TextLink>`) renders `<a>` with text + arrow
 * - `hideArrow` renders `<a>` with text only
 * - `asChild` with <Link> renders anchor with text + arrow (THE REGRESSION)
 * - `asChild + hideArrow` with <Link> renders anchor with text only, no arrow
 *
 * Root cause fixed in v0.4.2: Slot requires exactly one React element child
 * (isValidElement guard). Passing children + arrow-span produces an array
 * → Slot returns null → empty DOM. Fix mirrors Button B3 (v0.3.3) —
 * cloneElement injects arrow into consumer's child.
 *
 * Consumer site-wide: BleizLabs /o-nas Hero `<TextLink asChild>…</TextLink>`.
 */

import { expect, test } from '@playwright/test';

test.describe('TextLink — asChild + hideArrow regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/text-link');
  });

  test('default — href renders <a> with text + arrow', async ({ page }) => {
    const link = page.getByTestId('tl-default');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/foo');
    const tagName = await link.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('a');
    await expect(link).toContainText('Sprawdź rozwiązania');
    await expect(link.locator('span[aria-hidden="true"]')).toContainText('→');
  });

  test('hideArrow — href renders <a> with text only', async ({ page }) => {
    const link = page.getByTestId('tl-hide-arrow');
    await expect(link).toBeVisible();
    const tagName = await link.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('a');
    await expect(link).toContainText('Sprawdź rozwiązania');
    await expect(link.locator('span[aria-hidden="true"]')).toHaveCount(0);
  });

  test('asChild + next/link — renders anchor with text + arrow (regression)', async ({
    page,
  }) => {
    const link = page.getByTestId('tl-aschild');
    // Pre-fix: Slot received children array → returned null → DOM empty.
    // Post-fix (v0.4.2): cloneElement injects arrow into Link's child list.
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/foo');
    const tagName = await link.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('a');
    await expect(link).toContainText('Sprawdź rozwiązania');
    await expect(link.locator('span[aria-hidden="true"]')).toContainText('→');
  });

  test('asChild + hideArrow + next/link — renders anchor with text only', async ({
    page,
  }) => {
    const link = page.getByTestId('tl-aschild-hidearrow');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/foo');
    const tagName = await link.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('a');
    await expect(link).toContainText('Sprawdź rozwiązania');
    await expect(link.locator('span[aria-hidden="true"]')).toHaveCount(0);
  });
});
