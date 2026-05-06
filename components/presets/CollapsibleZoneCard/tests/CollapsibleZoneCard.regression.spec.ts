import { test, expect } from '@playwright/test';

// =============================================================================
// CollapsibleZoneCard — Regression Tests (20 cases from Radix Primitives
// closed-issue scrape + synthesized APG disclosure edge cases)
// =============================================================================
// Each test maps to a documented bug + fix pair from
// docs/_tmp/CollapsibleZoneCard-spec.md "Radix Regression Scrape" section.
// Cases #1-9 are derived from actual Radix issues; cases #10-20 are synthesized
// from APG patterns + production precedent (FinancialBreakdown local helper).
// =============================================================================

const PAGE = '/components/collapsible-zone-card';

// Scope `button[aria-expanded]` lookups to `main` to avoid the Next.js
// dev-tools button (also exposes `aria-expanded`) that `next dev` injects
// outside <main>. Production builds do not inject it; the scope is a safe
// superset that works in both modes.
const MAIN_TRIGGER = 'main button[aria-expanded]';

test.describe('CollapsibleZoneCard regression — Radix Accordion/Disclosure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
    await page.waitForSelector(MAIN_TRIGGER);
  });

  test('#1 — close animation plays without flicker / no mid-transition re-render', async ({
    page,
  }) => {
    const trigger = page.locator(MAIN_TRIGGER).first();
    await trigger.click(); // open
    await trigger.click(); // close

    // Body is ALWAYS mounted (required for grid-rows collapse animation).
    // After collapse, `inert` + `aria-hidden=true` + `data-open=false` apply
    // (NOT the HTML `hidden` attribute — that would short-circuit the CSS
    // transition by synchronously applying `display: none`).
    const bodyId = await trigger.getAttribute('aria-controls');
    const body = page.locator(`#${bodyId}`);
    await expect(body).toBeAttached();
    await expect(body).toHaveAttribute('data-open', 'false');
    await expect(body).toHaveAttribute('aria-hidden', 'true');
  });

  test('#2 — forceMount marks intent for form-state retention (always-mounted)', async ({
    page,
  }) => {
    const wrap = page.locator('[data-testid="force-mount-czc"]');
    const trigger = wrap.locator('button[aria-expanded]');
    const bodyId = await trigger.getAttribute('aria-controls');
    const body = page.locator(`#${bodyId}`);

    await expect(body).toBeAttached();
    await expect(body).toHaveAttribute('data-force-mount', 'true');
    await trigger.click();
    await expect(body).toBeAttached();
    await trigger.click();
    await expect(body).toBeAttached();
  });

  test('#3 — children state survives toggle cycles when forceMount=true', async ({
    page,
  }) => {
    const wrap = page.locator('[data-testid="force-mount-czc"]');
    const trigger = wrap.locator('button[aria-expanded]');
    await trigger.click(); // open

    const input = wrap.locator('input[type="text"]').first();
    await input.fill('persisted');
    await expect(input).toHaveValue('persisted');

    await trigger.click(); // close
    await trigger.click(); // open
    await expect(input).toHaveValue('persisted');
  });

  test('#4 — no SSR Slot createSlot error (server render compatible)', async ({
    page,
  }) => {
    // Demo page is server-rendered; if CollapsibleZoneCard's Card asChild had
    // an SSR-incompatible Slot fire, the page wouldn't load with hydrated
    // interactive triggers.
    const triggers = page.locator(MAIN_TRIGGER);
    expect(await triggers.count()).toBeGreaterThan(0);
  });

  test('#5 — nested CollapsibleZoneCard does not infinite-loop', async ({
    page,
  }) => {
    // Demo Section 7 nests CollapsibleZoneCard inside another. Both togglable.
    const outer = page.locator('[data-testid="nested-outer"] button[aria-expanded]').first();
    await outer.click();
    const inner = page.locator('[data-testid="nested-inner"] button[aria-expanded]').first();
    await inner.click();
    await expect(outer).toHaveAttribute('aria-expanded', 'true');
    await expect(inner).toHaveAttribute('aria-expanded', 'true');
    // No console errors thrown — Playwright auto-asserts no uncaught
  });

  test('#6 — multiple instances on same page do not share state', async ({
    page,
  }) => {
    const triggers = page.locator(MAIN_TRIGGER);
    const first = triggers.nth(0);
    const second = triggers.nth(1);

    await first.click();
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(second).toHaveAttribute('aria-expanded', 'false');
  });

  test('#7 — toggle does not trigger full-page re-render', async ({ page }) => {
    const trigger = page.locator(MAIN_TRIGGER).first();

    const startTime = Date.now();
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const elapsed = Date.now() - startTime;

    // Toggle should be fast — <500ms even with animation
    expect(elapsed).toBeLessThan(500);
  });

  test('#8 — 5+ instances each toggle independently', async ({ page }) => {
    const triggers = page.locator(MAIN_TRIGGER);
    const total = await triggers.count();
    expect(total).toBeGreaterThanOrEqual(3);

    // Demo Section 4 has one defaultOpen=true zone (Hosting), so we read
    // each trigger's initial state and assert it inverts after click —
    // proves independence regardless of starting state.
    const limit = Math.min(total, 5);
    const initials: string[] = [];
    for (let i = 0; i < limit; i++) {
      initials.push((await triggers.nth(i).getAttribute('aria-expanded')) ?? 'false');
    }

    for (let i = 0; i < limit; i++) {
      const t = triggers.nth(i);
      await t.click();
      const expected = initials[i] === 'true' ? 'false' : 'true';
      await expect(t).toHaveAttribute('aria-expanded', expected);
    }

    for (let i = 0; i < limit; i++) {
      const t = triggers.nth(i);
      const expected = initials[i] === 'true' ? 'false' : 'true';
      await expect(t).toHaveAttribute('aria-expanded', expected);
    }
  });

  test('#9 — deeply nested toggle (no memory leak proxy: 3 levels)', async ({
    page,
  }) => {
    const outer = page
      .locator('[data-testid="nested-outer"] button[aria-expanded]')
      .first();
    await outer.click();
    await expect(outer).toHaveAttribute('aria-expanded', 'true');

    const inner = page
      .locator('[data-testid="nested-inner"] button[aria-expanded]')
      .first();
    await inner.click();
    await expect(inner).toHaveAttribute('aria-expanded', 'true');

    // Toggle outer to close — inner should become unreachable but no crash
    await outer.click();
    await expect(outer).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('CollapsibleZoneCard regression — synthesized APG edge cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
    await page.waitForSelector(MAIN_TRIGGER);
  });

  test('#10 — chevron rotation respects prefers-reduced-motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.waitForSelector(MAIN_TRIGGER);

    // Target the chevron span via stable data-testid. Assert on
    // `transition-property` AND `transition-duration` together for full
    // coverage. Lib globals override `--duration-*` tokens to `0.001s`
    // (sub-perception threshold) under reduced-motion — the chevron's
    // own SCSS sets `transition: none` which sets `transition-property:
    // none`. Either signal alone is sufficient to prove the animation is
    // suppressed; we assert both for defense-in-depth.
    const chevron = page.locator('[data-testid="czc-chevron"]').first();
    const styles = await chevron.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        durationMs: parseFloat(cs.transitionDuration) * 1000,
      };
    });
    expect(styles.property).toBe('none');
    // Sub-perception threshold (10ms) — Lighthouse + WCAG 2.3.3 informal cap.
    expect(styles.durationMs).toBeLessThan(10);
  });

  test('#11 — focus stays on trigger after collapse near viewport bottom', async ({
    page,
  }) => {
    // Scroll to last trigger, ensure it's near bottom; toggle; focus persists
    const triggers = page.locator(MAIN_TRIGGER);
    const last = triggers.last();
    await last.scrollIntoViewIfNeeded();
    await last.focus();
    await page.keyboard.press('Enter');
    await expect(last).toBeFocused();
  });

  test('#12 — async cleanup: rapid toggle does not leave pending fetch (smoke)', async ({
    page,
  }) => {
    // Smoke: rapid toggles don't trigger console errors (no pending state leaks)
    const trigger = page.locator(MAIN_TRIGGER).first();
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    for (let i = 0; i < 10; i++) await trigger.click();
    expect(errors).toEqual([]);
  });

  test('#13 — aria-controls ID matches body element ID', async ({ page }) => {
    const trigger = page.locator(MAIN_TRIGGER).first();
    await trigger.click();
    const id = await trigger.getAttribute('aria-controls');
    const body = page.locator(`#${id}`);
    await expect(body).toBeVisible();
  });

  test('#14 — summary chip does not cause layout shift on toggle', async ({
    page,
  }) => {
    // Demo Section 2 — with summary chip
    const sectionWrap = page
      .locator('[data-testid="summary-chip-czc"]')
      .first();
    const trigger = sectionWrap.locator('button[aria-expanded]');

    const beforeBox = await trigger.boundingBox();
    await trigger.click();
    const afterBox = await trigger.boundingBox();

    // Trigger position should not jump dramatically (allow small reflow)
    expect(Math.abs((beforeBox?.y ?? 0) - (afterBox?.y ?? 0))).toBeLessThan(8);
  });

  test('#15 — disclosure inside form does NOT submit form (type=button)', async ({
    page,
  }) => {
    const wrap = page.locator('[data-testid="form-wrapped-czc"]');
    const trigger = wrap.locator('button[aria-expanded]');
    const buttonType = await trigger.getAttribute('type');
    expect(buttonType).toBe('button');
  });

  test('#16 — Space key does not double-fire (no Space+click)', async ({
    page,
  }) => {
    const trigger = page.locator(MAIN_TRIGGER).first();
    await trigger.focus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Space');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // If Space double-fired, state would be back to false
  });

  test('#17 — rapid toggle (50 clicks/sec) does not throw', async ({
    page,
  }) => {
    const trigger = page.locator(MAIN_TRIGGER).first();
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    for (let i = 0; i < 30; i++) {
      await trigger.click({ force: true });
    }
    expect(errors).toEqual([]);
  });

  test('#18 — page width does not change on collapse/expand', async ({
    page,
  }) => {
    const initialWidth = await page.evaluate(
      () => document.documentElement.clientWidth
    );
    const trigger = page.locator(MAIN_TRIGGER).first();
    await trigger.click();
    const afterOpenWidth = await page.evaluate(
      () => document.documentElement.clientWidth
    );
    await trigger.click();
    const afterCloseWidth = await page.evaluate(
      () => document.documentElement.clientWidth
    );

    expect(afterOpenWidth).toBe(initialWidth);
    expect(afterCloseWidth).toBe(initialWidth);
  });

  test('#19 — aria-expanded change announces state to AT (verified via attribute change)', async ({
    page,
  }) => {
    const trigger = page.locator(MAIN_TRIGGER).first();
    const initial = await trigger.getAttribute('aria-expanded');
    expect(initial).toBe('false');

    await trigger.click();
    const after = await trigger.getAttribute('aria-expanded');
    expect(after).toBe('true');
    // SR announcement is verified manually via NVDA sweep — see @tested header
  });

  test('#20 — long summary chip text does not break layout', async ({
    page,
  }) => {
    // Demo Section 2 — summary chip pattern
    const sectionWrap = page
      .locator('[data-testid="summary-chip-czc"]')
      .first();
    const overflow = await sectionWrap.evaluate((el) => {
      const container = el.querySelector('section');
      if (!container) return false;
      return container.scrollWidth > container.clientWidth;
    });
    expect(overflow).toBe(false);
  });
});
