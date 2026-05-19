import { expect, test } from '@playwright/test';

test.describe('Text - color token regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/text');
  });

  test('color="brand" maps to the canonical brand token', async ({ page }) => {
    const text = page.getByText('Live · awaiting input');

    await expect(text).toBeVisible();

    const colors = await text.evaluate((el) => {
      const textStyles = getComputedStyle(el);
      const probe = document.createElement('span');
      probe.style.color = 'var(--color-brand)';
      document.body.append(probe);
      const brandColor = getComputedStyle(probe).color;
      probe.remove();

      return {
        textColor: textStyles.color,
        brandColor,
      };
    });

    expect(colors.textColor).toBe(colors.brandColor);
  });
});
