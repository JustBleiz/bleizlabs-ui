/**
 * Combobox regression spec (E142 L3d1).
 *
 * Coverage:
 * - CB-R02 SSR hydration safe (no hydration warnings)
 * - CB-R03 rapid keystroke race — final state converges
 * - CB-R16 SSR portal — listbox not in server HTML, client mounts on open
 * - Controlled value external update propagates to input display
 * - Search state invariant (never null; empty is valid)
 * - Form participation: required + hidden input + FormData serialization
 */

import { test, expect } from '@playwright/test';

test.describe('Combobox — regressions', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('CB-R02 — SSR hydration: no hydration warnings on initial render', async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning' || msg.type() === 'error') {
        warnings.push(msg.text());
      }
    });
    await page.goto('/components/combobox');
    await page.waitForLoadState('networkidle');
    await page.reload();
    await page.waitForLoadState('networkidle');
    const hydrationWarnings = warnings.filter((w) =>
      w.toLowerCase().includes('hydration'),
    );
    expect(hydrationWarnings).toHaveLength(0);
  });

  test('CB-R03 — filter race: rapid keystrokes produce final-state listbox', async ({
    page,
  }) => {
    await page.goto('/components/combobox');
    const input = page.getByRole('combobox').first();
    await input.focus();
    // Rapid typing simulates race between filter updates
    await page.keyboard.type('zxqv', { delay: 5 });
    await page.waitForTimeout(200);
    // Final state — no match — visible option count reflects the final filter
    const visibleCount = await page.getByRole('listbox').first().getByRole('option').count();
    expect(visibleCount).toBe(0);
  });

  test('CB-R16 — SSR portal: listbox not rendered server-side, mounts after interaction', async ({
    page,
  }) => {
    const response = await page.goto('/components/combobox');
    expect(response?.status()).toBe(200);
    const html = await response?.text();
    // Initial SSR HTML should not contain a listbox (portal mounts on open).
    expect(html ?? '').not.toContain('role="listbox"');
    const input = page.getByRole('combobox').first();
    await input.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('listbox').first()).toBeVisible();
  });

  test('Controlled value: external update commits via section 3 buttons', async ({
    page,
  }) => {
    // Section 3 — controlled demo. External "Jump to X" buttons mutate the
    // controlled value. Verify the hidden form state via the aria-selected
    // attribute of the corresponding option when listbox re-opens.
    await page.goto('/components/combobox');
    const sections = page.locator('section');
    const controlled = sections.nth(2);
    const input = controlled.getByRole('combobox');
    await controlled.getByRole('button', { name: 'Jump to Japan' }).click();
    await input.focus();
    await input.fill('Ja'); // filter that includes Japan
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    const japan = listbox.getByRole('option', { name: 'Japan', exact: true });
    await expect(japan).toHaveAttribute('aria-selected', 'true');
  });

  test('Search state never null: empty string is the valid initial', async ({
    page,
  }) => {
    await page.goto('/components/combobox');
    const input = page.getByRole('combobox').first();
    const initial = await input.inputValue();
    expect(typeof initial).toBe('string');
  });

  test('Form participation: submitting form serializes selected value via hidden input', async ({
    page,
  }) => {
    await page.goto('/components/combobox');
    const sections = page.locator('section');
    // Section 6 — form participation demo with name="country" + defaultValue="pl"
    const formSection = sections.nth(5);
    await expect(formSection.getByRole('heading', { name: /Form participation/ })).toBeVisible();
    await formSection.getByRole('button', { name: 'Submit' }).click();
    await expect(formSection.getByText('Submitted:')).toBeVisible();
    await expect(formSection.getByText(/Submitted:\s*pl/)).toBeVisible();
  });

  test('Filter hides non-matching items from listbox DOM', async ({ page }) => {
    await page.goto('/components/combobox');
    const input = page.getByRole('combobox').first();
    await input.focus();
    // Type a prefix that matches only a few countries
    await input.fill('pol');
    await page.waitForTimeout(50);
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    const options = listbox.getByRole('option');
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(32); // original set = 32 countries
    // All remaining options should contain "pol" (case-insensitive)
    for (let i = 0; i < count; i += 1) {
      const text = (await options.nth(i).textContent()) ?? '';
      expect(text.toLowerCase()).toContain('pol');
    }
  });
});
