/**
 * Stepper ARIA + axe-core spec.
 *
 * Coverage: role transitions visual ↔ interactive, aria-current="step" on
 * active, aria-disabled on non-clickable steps, live region presence + format,
 * aria-label required in interactive mode, sr-only verbose announcement per
 * step, axe-core zero violations on demo route.
 *
 * Total: 10 cases (STEP-A01..STEP-A10).
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { stepperBy, navBy, stepsOf, liveRegionOf, activeStep } from './_helpers';

const URL = '/components/stepper';

test.describe('Stepper — ARIA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('STEP-A01: visual mode renders <ol role="list">, NOT <nav>', async ({ page }) => {
    const stepper = stepperBy(page, 'Order progress');
    await expect(stepper).toBeVisible();
    const tag = await stepper.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe('div');
    const list = stepper.locator('ol[role="list"]');
    await expect(list).toBeVisible();
  });

  test('STEP-A02: interactive mode renders <nav role="navigation"> wrapping <ol>', async ({
    page,
  }) => {
    const nav = navBy(page, 'Onboarding wizard — click visited steps to revisit');
    await expect(nav).toBeVisible();
    await expect(nav).toHaveAttribute('role', 'navigation');
    const list = nav.locator('ol[role="list"]');
    await expect(list).toBeVisible();
  });

  test('STEP-A03: active step carries aria-current="step"', async ({ page }) => {
    const stepper = stepperBy(page, 'Order progress');
    const current = activeStep(stepper);
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute('data-status', 'active');
  });

  test('STEP-A04: complete/pending steps DO NOT carry aria-current', async ({ page }) => {
    const stepper = stepperBy(page, 'Order progress');
    const completeSteps = stepper.locator('li[data-status="complete"]');
    const pendingSteps = stepper.locator('li[data-status="pending"]');
    // None of the complete/pending should have aria-current
    for (const step of [completeSteps, pendingSteps]) {
      const count = await step.count();
      for (let i = 0; i < count; i++) {
        const ariaCurrent = await step.nth(i).getAttribute('aria-current');
        expect(ariaCurrent).toBeNull();
      }
    }
  });

  test('STEP-A05: interactive non-clickable steps render aria-disabled="true"', async ({
    page,
  }) => {
    const nav = navBy(page, 'Onboarding wizard — click visited steps to revisit');
    // Default currentStep=2 in demo → step 2 ("Invite team") is active,
    // steps 0+1 complete (clickable), steps 2+3 non-clickable.
    const disabled = nav.locator('[aria-disabled="true"]');
    const count = await disabled.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('STEP-A06: clickable steps render as <button type="button">', async ({ page }) => {
    const nav = navBy(page, 'Onboarding wizard — click visited steps to revisit');
    const buttons = nav.locator('button[data-step-clickable="true"]');
    await expect(buttons.first()).toBeVisible();
    const type = await buttons.first().getAttribute('type');
    expect(type).toBe('button');
  });

  test('STEP-A07: live region exists with role=status + aria-live=polite', async ({ page }) => {
    const stepper = stepperBy(page, 'Order progress');
    const live = liveRegionOf(stepper);
    await expect(live).toHaveAttribute('aria-live', 'polite');
    // Visually hidden but present
    const text = await live.textContent();
    expect(text).toContain('Step 2 of 3');
    expect(text).toContain('Shipping');
  });

  test('STEP-A08: sr-only verbose announcement per NON-ACTIVE step includes total + status', async ({
    page,
  }) => {
    // The active step OMITS its verbose announcement because the root live
    // region already announces the active step transition — duplicating both
    // would cause double announcement. Non-active steps (complete/pending/
    // error) carry the verbose span so AT users get context when navigating
    // the list item-by-item.
    const stepper = stepperBy(page, 'Order progress');
    const steps = stepsOf(stepper);
    // First step: complete (currentStep=1, index=0)
    const firstStepText = await steps.nth(0).textContent();
    expect(firstStepText).toContain('Step 1 of 3');
    expect(firstStepText).toContain('Cart');
    expect(firstStepText).toContain('complete');
    // Third step: pending
    const thirdStepText = await steps.nth(2).textContent();
    expect(thirdStepText).toContain('Step 3 of 3');
    expect(thirdStepText).toContain('Payment');
    expect(thirdStepText).toContain('pending');
    // Live region covers the active step (asserted in STEP-A07).
    const liveRegion = stepper.locator('[role="status"][aria-live="polite"]');
    const liveText = await liveRegion.textContent();
    expect(liveText).toContain('Step 2 of 3');
    expect(liveText).toContain('Shipping');
  });

  test('STEP-A09: explicit status="error" overrides currentStep derivation', async ({ page }) => {
    const stepper = stepperBy(page, 'Import wizard');
    // Demo: currentStep=3, steps 0..3. Step 2 has explicit status="error".
    const steps = stepsOf(stepper);
    const errorStep = steps.nth(2);
    await expect(errorStep).toHaveAttribute('data-status', 'error');
  });

  test('STEP-A10: axe-core zero violations on demo route', async ({ page }) => {
    const results = await new AxeBuilder({ page }).disableRules(['region']).analyze();
    expect(results.violations).toEqual([]);
  });
});
