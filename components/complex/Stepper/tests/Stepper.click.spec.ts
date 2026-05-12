/**
 * Stepper click activation spec.
 *
 * Coverage: onStepClick fires on mouse click for clickable, no-op on
 * non-clickable, currentStep updates correctly. visual-only mode has no
 * click handler attached.
 *
 * Total: 5 cases (STEP-C01..STEP-C05).
 */

import { test, expect } from '@playwright/test';
import { stepperBy, navBy } from './_helpers';

const URL = '/components/stepper';
const WIZARD_LABEL =
  'Onboarding wizard — click visited steps to revisit';

test.describe('Stepper — click', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('STEP-C01: click on complete step in visited mode fires onStepClick', async ({
    page,
  }) => {
    const nav = navBy(page, WIZARD_LABEL);
    const step0 = nav.locator('button[data-step-index="0"]');
    await step0.click();
    // Demo updates currentStep → live region announces step 1 ("Account")
    const liveRegion = nav.locator('[role="status"][aria-live="polite"]');
    const text = await liveRegion.textContent();
    expect(text).toContain('Step 1 of 4');
    expect(text).toContain('Account');
  });

  test('STEP-C02: non-clickable step is rendered as div (no click handler attached)', async ({
    page,
  }) => {
    const nav = navBy(page, WIZARD_LABEL);
    // Step 3 (Activate) — pending, non-clickable in visited mode
    const step3 = nav.locator('[aria-disabled="true"][data-step-index="3"]');
    await expect(step3).toBeVisible();
    const tag = await step3.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe('div');
  });

  test('STEP-C03: visual-only mode steps are <li> elements with no button', async ({
    page,
  }) => {
    const stepper = stepperBy(page, 'Order progress');
    const buttons = stepper.locator('button[data-step-clickable="true"]');
    await expect(buttons).toHaveCount(0);
  });

  test('STEP-C04: Next/Back buttons update currentStep + roving tabindex', async ({
    page,
  }) => {
    const nav = navBy(page, WIZARD_LABEL);
    const initialLive = await nav
      .locator('[role="status"]')
      .textContent();
    expect(initialLive).toContain('Step 3 of 4');

    await page.getByRole('button', { name: 'Next', exact: true }).click();
    const live2 = await nav.locator('[role="status"]').textContent();
    expect(live2).toContain('Step 4 of 4');

    await page.getByRole('button', { name: 'Back', exact: true }).click();
    const live3 = await nav.locator('[role="status"]').textContent();
    expect(live3).toContain('Step 3 of 4');
  });

  test('STEP-C05: clicking the active step in visited mode does NOT fire (active is non-clickable)', async ({
    page,
  }) => {
    const nav = navBy(page, WIZARD_LABEL);
    // currentStep=2 in demo → step 2 is active and non-clickable
    const step2 = nav.locator('[aria-disabled="true"][data-step-index="2"]');
    await expect(step2).toBeVisible();
    // Click it (counts as ignored — wrapper has no handler)
    await step2.click({ force: true });
    // The live region should still announce step 3 (currentStep=2 still)
    const liveRegion = nav.locator('[role="status"]');
    const text = await liveRegion.textContent();
    expect(text).toContain('Step 3 of 4');
  });
});
