/**
 * Stepper visual-state matrix spec.
 *
 * Coverage: status derivation from currentStep, orientation horizontal/vertical
 * data attribute, size scale data attribute, error icon rendering, custom
 * icon override behavior.
 *
 * Total: 8 cases (STEP-S01..STEP-S08).
 */

import { test, expect } from '@playwright/test';
import { stepperBy, stepsOf } from './_helpers';

const URL = '/components/stepper';

test.describe('Stepper — visual states', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('STEP-S01: status derived from currentStep (complete < active < pending)', async ({
    page,
  }) => {
    const stepper = stepperBy(page, 'Order progress');
    // currentStep=1 — step 0 = complete, step 1 = active, step 2 = pending
    const steps = stepsOf(stepper);
    await expect(steps.nth(0)).toHaveAttribute('data-status', 'complete');
    await expect(steps.nth(1)).toHaveAttribute('data-status', 'active');
    await expect(steps.nth(2)).toHaveAttribute('data-status', 'pending');
  });

  test('STEP-S02: horizontal orientation propagated via data-orientation', async ({
    page,
  }) => {
    const stepper = stepperBy(page, 'Order progress');
    await expect(stepper).toHaveAttribute('data-orientation', 'horizontal');
    const list = stepper.locator('ol[role="list"]');
    await expect(list).toHaveAttribute('data-orientation', 'horizontal');
  });

  test('STEP-S03: vertical orientation flips data-orientation', async ({
    page,
  }) => {
    const stepper = stepperBy(page, 'Contract negotiation phases');
    await expect(stepper).toHaveAttribute('data-orientation', 'vertical');
  });

  test('STEP-S04: size scale propagated via data-size', async ({ page }) => {
    const stepper = stepperBy(page, 'Hydrogen contract phases');
    await expect(stepper).toHaveAttribute('data-size', 'lg');
  });

  test('STEP-S05: error status renders warning icon regardless of custom icon (D4)', async ({
    page,
  }) => {
    const stepper = stepperBy(page, 'Import wizard');
    const steps = stepsOf(stepper);
    const errorStep = steps.nth(2);
    await expect(errorStep).toHaveAttribute('data-status', 'error');
    // The error step contains an SVG (the warning icon)
    const svg = errorStep.locator('svg').first();
    await expect(svg).toBeVisible();
  });

  test('STEP-S06: complete status renders checkmark when no custom icon', async ({
    page,
  }) => {
    const stepper = stepperBy(page, 'Order progress');
    const steps = stepsOf(stepper);
    const completeStep = steps.nth(0);
    await expect(completeStep).toHaveAttribute('data-status', 'complete');
    const svg = completeStep.locator('svg').first();
    await expect(svg).toBeVisible();
  });

  test('STEP-S07: pending/active without custom icon render numeric badge', async ({
    page,
  }) => {
    const stepper = stepperBy(page, 'Order progress');
    const steps = stepsOf(stepper);
    // Step 1 is active (Shipping). No custom icon → "2" digit visible.
    const activeStepEl = steps.nth(1);
    const badge = activeStepEl.locator('span[aria-hidden="true"]').first();
    const text = await badge.textContent();
    // Badge text may include both the digit and aria-hidden wrapper text;
    // it should contain "2".
    expect(text).toContain('2');
  });

  test('STEP-S08: custom icon prop renders SVG instead of number for non-error/non-complete', async ({
    page,
  }) => {
    const stepper = stepperBy(page, 'Hydrogen contract phases');
    // size=lg + custom icons per Step. Active = index 1 (Review). The
    // active step's circle should contain the custom Review SVG (not a number).
    const steps = stepsOf(stepper);
    const activeStepEl = steps.nth(1);
    const svg = activeStepEl.locator('svg').first();
    await expect(svg).toBeVisible();
  });
});
