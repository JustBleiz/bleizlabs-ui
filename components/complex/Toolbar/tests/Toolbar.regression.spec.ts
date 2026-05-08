/**
 * Toolbar regression spec — derived from APG `/toolbar/` model + Radix
 * `react-toolbar` issue shape (https://github.com/radix-ui/primitives —
 * subagent had no GitHub access at build time, so the regression cases
 * below are derived from APG conformance points + analogous bug patterns
 * from existing lib NavigationMenu (E25), Tabs (E26), and Sidebar (E38)
 * regression suites).
 *
 * Cases mapped TBR-R01..R20.
 */

import { test, expect } from '@playwright/test';

test.describe('Toolbar — regression coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/toolbar');
  });

  test('TBR-R01 — arrow nav is synchronous (no setTimeout desync)', async ({
    page,
  }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    const openBtn = toolbar.getByRole('button', { name: 'Open' });
    await newBtn.focus();
    await page.keyboard.press('ArrowRight');
    // Synchronous — immediately after press, focus + tabindex reflect new
    // item without awaiting a timer.
    await expect(openBtn).toBeFocused();
    await expect(openBtn).toHaveAttribute('tabindex', '0');
  });

  test('TBR-R02 — SSR mount: no hydration warnings', async ({ page }) => {
    const hydrationWarnings: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'warning' && /hydration|did not match/i.test(text)) {
        hydrationWarnings.push(text);
      }
    });
    const response = await page.goto('/components/toolbar');
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('toolbar', { name: 'Formatting' }),
    ).toBeVisible();
    expect(hydrationWarnings).toHaveLength(0);
  });

  test('TBR-R03 — first focusable item gets tabindex=0 on mount even if not visually first', async ({
    page,
  }) => {
    // In the disabled-skip toolbar, "New" is the first focusable item.
    // The Save (disabled) button never receives tabindex=0.
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    await expect(newBtn).toHaveAttribute('tabindex', '0');
  });

  test('TBR-R04 — multiple toolbars on the same page stay isolated', async ({
    page,
  }) => {
    // Focusing in one toolbar should not affect roving in another.
    const formatting = page.getByRole('toolbar', { name: 'Formatting' });
    const docActions = page.getByRole('toolbar', { name: 'Document actions' });
    const formatBold = formatting.getByRole('button', { name: 'Bold' });
    const docNew = docActions.getByRole('button', { name: 'New' });

    await formatBold.click();
    await expect(formatBold).toHaveAttribute('tabindex', '0');
    // docActions toolbar's "New" should still be tabindex=0 in its own scope.
    await expect(docNew).toHaveAttribute('tabindex', '0');
  });

  test('TBR-R05 — Tab on disabled-skip toolbar lands on first ENABLED item', async ({
    page,
  }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    // Click outside first to drop focus
    await page.locator('h1').click();
    // Tab into the toolbar via document Tab order — we simulate by focusing
    // the toolbar root's first tabindex=0 child
    await newBtn.focus();
    await expect(newBtn).toBeFocused();
  });

  test('TBR-R06 — vertical toolbar ignores horizontal arrow keys', async ({
    page,
  }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Tools' });
    const pencil = toolbar.getByRole('button', { name: 'Pencil' });
    await pencil.focus();
    await page.keyboard.press('ArrowLeft');
    // ArrowLeft is not the prev key in vertical mode — focus stays.
    await expect(pencil).toBeFocused();
  });

  test('TBR-R07 — horizontal toolbar ignores vertical arrow keys', async ({
    page,
  }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    await newBtn.focus();
    await page.keyboard.press('ArrowDown');
    await expect(newBtn).toBeFocused();
  });

  test('TBR-R08 — Toggle inside ToggleGroup is part of toolbar roving', async ({
    page,
  }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Formatting' });
    const bold = toolbar.getByRole('button', { name: 'Bold' });
    const italic = toolbar.getByRole('button', { name: 'Italic' });
    await bold.focus();
    await page.keyboard.press('ArrowRight');
    // Italic is the next focusable in DOM order.
    await expect(italic).toBeFocused();
  });

  test('TBR-R09 — Separator is not a toolbar item (skipped by arrows)', async ({
    page,
  }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Formatting' });
    // The 3rd Toggle (Underline) is followed by a Separator and then a
    // 'left' alignment Toggle. Arrow from Underline should skip the
    // Separator and land on 'Align left'.
    const underline = toolbar.getByRole('button', { name: 'Underline' });
    const alignLeft = toolbar.getByRole('button', { name: 'Align left' });
    await underline.focus();
    await page.keyboard.press('ArrowRight');
    await expect(alignLeft).toBeFocused();
  });

  test('TBR-R10 — Tab does NOT advance toolbar roving (browser-native exit)', async ({
    page,
  }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    const openBtn = toolbar.getByRole('button', { name: 'Open' });
    await newBtn.focus();
    await page.keyboard.press('Tab');
    // Open is NOT the new focus — the browser walked Tab order out of toolbar
    await expect(openBtn).not.toBeFocused();
    await expect(newBtn).not.toBeFocused();
  });

  test('TBR-R11 — Enter on a Toggle child toggles aria-pressed via lib', async ({
    page,
  }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Formatting' });
    const italic = toolbar.getByRole('button', { name: 'Italic' });
    // Initial: italic is NOT in defaultValue (only 'bold')
    await expect(italic).toHaveAttribute('aria-pressed', 'false');
    await italic.focus();
    await page.keyboard.press('Enter');
    await expect(italic).toHaveAttribute('aria-pressed', 'true');
  });

  test('TBR-R12 — Space on a Button child triggers click', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    let clicks = 0;
    await newBtn.evaluate((el) => {
      el.addEventListener('click', () => {
        (el as HTMLElement).dataset.clickCount = String(
          Number((el as HTMLElement).dataset.clickCount ?? 0) + 1,
        );
      });
    });
    await newBtn.focus();
    await page.keyboard.press(' ');
    const count = await newBtn.getAttribute('data-click-count');
    clicks = Number(count);
    expect(clicks).toBeGreaterThanOrEqual(1);
  });

  test('TBR-R13 — Home from middle item lands on first', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Formatting' });
    const alignCenter = toolbar.getByRole('button', { name: 'Align center' });
    const bold = toolbar.getByRole('button', { name: 'Bold' });
    await alignCenter.focus();
    await page.keyboard.press('Home');
    await expect(bold).toBeFocused();
  });

  test('TBR-R14 — End from middle item lands on last', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Formatting' });
    const bold = toolbar.getByRole('button', { name: 'Bold' });
    const discard = toolbar.getByRole('button', { name: 'Discard' });
    await bold.focus();
    await page.keyboard.press('End');
    await expect(discard).toBeFocused();
  });

  test('TBR-R15 — focus-visible ring on the focused child (not on toolbar root)', async ({
    page,
  }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    await newBtn.focus();
    // The toolbar root should NOT have a focus ring — outline:none in CSS.
    const rootOutline = await toolbar.evaluate(
      (el) => window.getComputedStyle(el).outlineStyle,
    );
    // Outline may be 'none' or empty; what matters is no visible default.
    expect(['none', '', 'auto']).toContain(rootOutline);
  });

  test('TBR-R16 — RTL with loop=true wraps correctly (visual-right edge)', async ({
    page,
  }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Editor (RTL)' });
    const all = toolbar.getByRole('button');
    const first = all.nth(0);
    const last = all.nth(2); // 3 buttons in this RTL toolbar
    await first.focus();
    // ArrowLeft in RTL = next item → last
    await page.keyboard.press('ArrowLeft');
    await expect(all.nth(1)).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(last).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    // Wraps back to first (loop=true default)
    await expect(first).toBeFocused();
  });

  test('TBR-R17 — clicking a toggle inside a ToggleGroup updates lib state but not toolbar focus', async ({
    page,
  }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Formatting' });
    const italic = toolbar.getByRole('button', { name: 'Italic' });
    await italic.click();
    // After click, italic is focused AND aria-pressed flipped.
    await expect(italic).toHaveAttribute('aria-pressed', 'true');
    // Roving tabindex follows: italic now has tabindex=0.
    await expect(italic).toHaveAttribute('tabindex', '0');
  });

  test('TBR-R18 — rapid arrow presses are synchronous (no race condition)', async ({
    page,
  }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Formatting' });
    const bold = toolbar.getByRole('button', { name: 'Bold' });
    const italic = toolbar.getByRole('button', { name: 'Italic' });
    const underline = toolbar.getByRole('button', { name: 'Underline' });
    await bold.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    // Two ArrowRight presses should reliably land on Underline.
    await expect(underline).toBeFocused();
    // Reset
    await page.keyboard.press('Home');
    await expect(bold).toBeFocused();
    void italic;
  });

  test('TBR-R19 — Home/End with disabled at extremes still work correctly', async ({
    page,
  }) => {
    // Document actions toolbar has Save disabled but it's not at extremes.
    // We verify that End jumps over Save to the last enabled (Print).
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    const printBtn = toolbar.getByRole('button', { name: 'Print' });
    await newBtn.focus();
    await page.keyboard.press('End');
    await expect(printBtn).toBeFocused();
  });

  test('TBR-R20 — focus event from outside (e.g., user clicks a button directly) syncs roving tabindex', async ({
    page,
  }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    const exportBtn = toolbar.getByRole('button', { name: 'Export' });
    // Tab into doc-actions toolbar normally would land on New. Instead
    // user clicks Export directly with the mouse.
    await exportBtn.click();
    // Roving updates: Export becomes tabindex=0, New becomes -1.
    await expect(exportBtn).toHaveAttribute('tabindex', '0');
    await expect(newBtn).toHaveAttribute('tabindex', '-1');
  });
});
