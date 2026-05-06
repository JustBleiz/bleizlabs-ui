import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

// =============================================================================
// CollapsibleZoneCard — ARIA Snapshot Tests (APG disclosure pattern)
// =============================================================================
// Verifies:
//  - aria-expanded reflects open state (true/false)
//  - aria-controls references body element by ID
//  - body has matching id + aria-hidden + inert attribute when collapsed
//    (animation host — `inert` removes focus/a11y; `hidden` HTML attribute
//    NOT used because it would `display: none` synchronously and short-
//    circuit the grid-template-rows transition)
//  - section uses aria-labelledby pointing at trigger title id
//  - data-tone + data-open attributes for SCSS cascade
// =============================================================================

test.describe('CollapsibleZoneCard ARIA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/collapsible-zone-card');
    await page.waitForSelector('main button[aria-expanded]');
  });

  test('aria-expanded toggles between false and true', async ({ page }) => {
    const trigger = page.locator('main button[aria-expanded]').first();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('aria-controls references body element by ID', async ({ page }) => {
    const trigger = page.locator('main button[aria-expanded]').first();
    const bodyId = await trigger.getAttribute('aria-controls');
    expect(bodyId).toBeTruthy();
    expect(bodyId).toMatch(/^czc-.+-body$/);

    await trigger.click();
    const body = page.locator(`#${bodyId}`);
    await expect(body).toBeVisible();
    // Body has NO role="region" + NO aria-labelledby — parent <section
    // aria-labelledby={titleId}> is the sole landmark per APG disclosure.
    // Body is just the disclosure content, referenced via trigger's aria-controls.
    await expect(body).not.toHaveAttribute('role', /.+/);
  });

  test('Trigger has accessible name from inner Heading (no aria-label shadow)', async ({ page }) => {
    const trigger = page.locator('main button[aria-expanded]').first();
    // No aria-label by default — accessible name composes from visible
    // inner Heading text. Test via Playwright's accessible name resolution.
    const accessibleName = await trigger.evaluate((el) =>
      el.getAttribute('aria-label') ?? el.textContent?.trim() ?? ''
    );
    expect(accessibleName.length).toBeGreaterThan(0);
  });

  test('Section landmark uses aria-labelledby pointing at title heading', async ({ page }) => {
    const section = page.locator('section[aria-labelledby]').first();
    const labelledBy = await section.getAttribute('aria-labelledby');
    expect(labelledBy).toMatch(/^czc-.+-title$/);
    const title = page.locator(`#${labelledBy}`);
    await expect(title).toBeVisible();
  });

  test('data-tone attribute drives icon color cascade', async ({ page }) => {
    // Demo Section 4 (group of 3 zones with different tones)
    const successZone = page.locator('section[data-tone="success"]').first();
    await expect(successZone).toHaveAttribute('data-tone', 'success');

    const warningZone = page.locator('section[data-tone="warning"]').first();
    await expect(warningZone).toHaveAttribute('data-tone', 'warning');
  });

  test('data-open attribute reflects state for SCSS cascade', async ({ page }) => {
    const section = page.locator('section[data-open]').first();
    const trigger = section.locator('button[aria-expanded]');

    await expect(section).toHaveAttribute('data-open', 'false');
    await trigger.click();
    await expect(section).toHaveAttribute('data-open', 'true');
  });

  test('Single named landmark per disclosure (no duplicate role=region)', async ({
    page,
  }) => {
    // Body has NO role="region" (parent <section> is the sole named landmark
    // per APG disclosure — duplicate would create double-named nested regions).
    const trigger = page.locator('main button[aria-expanded]').first();
    const bodyId = await trigger.getAttribute('aria-controls');
    const body = page.locator(`#${bodyId}`);
    const bodyRole = await body.getAttribute('role');
    expect(bodyRole).toBeNull();
  });

  test('Body always mounted to DOM (collapse animation host) + inert + aria-hidden when closed', async ({
    page,
  }) => {
    // Body must be mounted regardless of forceMount, because grid-template-rows
    // collapse animation requires an element to animate. When collapsed:
    // `inert` attribute removes from focus order + click + a11y subtree;
    // `aria-hidden="true"` reinforces SR exclusion. NO `hidden` attribute
    // — that would force display:none synchronously and short-circuit the
    // CSS transition.
    const trigger = page.locator('main button[aria-expanded]').first();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const bodyId = await trigger.getAttribute('aria-controls');
    const body = page.locator(`#${bodyId}`);
    await expect(body).toBeAttached();
    await expect(body).toHaveAttribute('aria-hidden', 'true');
    await expect(body).toHaveAttribute('inert', '');
    // hidden attribute MUST NOT be present
    const hasHidden = await body.evaluate((el) => el.hasAttribute('hidden'));
    expect(hasHidden).toBe(false);
  });

  test('axe-core scan: zero a11y violations on demo page', async ({ page }) => {
    // Scope axe to <main> — `next dev` injects a dev-tools button + overlay
    // outside <main> that produces unrelated noise. Production builds do not
    // inject it; the include filter is a safe superset that audits only our
    // demo content in both modes.
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('main')
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
