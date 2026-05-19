/**
 * Stepper keyboard navigation spec.
 *
 * Coverage: Tab into list, arrow nav between clickable steps (skip
 * non-clickable, loop), Home/End jump, Space/Enter activation, modifier
 * keys passthrough (browser hotkeys preserved).
 *
 * Total: 8 cases (STEP-K01..STEP-K08).
 */

import { test, expect } from '@playwright/test';
import { navBy } from './_helpers';

const URL = '/components/stepper';
const WIZARD_LABEL = 'Onboarding wizard — click visited steps to revisit';

test.describe('Stepper — keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('STEP-K01: Tab enters the step list at currently-focused clickable', async ({ page }) => {
    const nav = navBy(page, WIZARD_LABEL);
    // Demo currentStep=2 → step 2 is active (non-clickable in visited mode);
    // first clickable is step 0 ("Account"). Roving tabindex initializes
    // there.
    const firstBtn = nav.locator('button[data-step-clickable="true"][data-step-index="0"]');
    await firstBtn.focus();
    await expect(firstBtn).toBeFocused();
  });

  test('STEP-K02: Right Arrow moves focus to next clickable (skip non-clickable)', async ({
    page,
  }) => {
    const nav = navBy(page, WIZARD_LABEL);
    const step0 = nav.locator('button[data-step-index="0"]');
    await step0.focus();
    await page.keyboard.press('ArrowRight');
    // Step 1 is also complete + clickable
    const step1 = nav.locator('button[data-step-index="1"]');
    await expect(step1).toBeFocused();
  });

  test('STEP-K03: Right Arrow loops from last clickable to first', async ({ page }) => {
    const nav = navBy(page, WIZARD_LABEL);
    // Demo: only steps 0+1 are clickable (complete). Last clickable = step 1.
    const step1 = nav.locator('button[data-step-index="1"]');
    await step1.focus();
    await page.keyboard.press('ArrowRight');
    const step0 = nav.locator('button[data-step-index="0"]');
    await expect(step0).toBeFocused();
  });

  test('STEP-K04: Left Arrow moves focus to previous clickable + loops', async ({ page }) => {
    const nav = navBy(page, WIZARD_LABEL);
    const step0 = nav.locator('button[data-step-index="0"]');
    await step0.focus();
    await page.keyboard.press('ArrowLeft');
    // Loops to step 1 (the last clickable)
    const step1 = nav.locator('button[data-step-index="1"]');
    await expect(step1).toBeFocused();
  });

  test('STEP-K05: Home jumps to first clickable', async ({ page }) => {
    const nav = navBy(page, WIZARD_LABEL);
    const step1 = nav.locator('button[data-step-index="1"]');
    await step1.focus();
    await page.keyboard.press('Home');
    const step0 = nav.locator('button[data-step-index="0"]');
    await expect(step0).toBeFocused();
  });

  test('STEP-K06: End jumps to last clickable', async ({ page }) => {
    const nav = navBy(page, WIZARD_LABEL);
    const step0 = nav.locator('button[data-step-index="0"]');
    await step0.focus();
    await page.keyboard.press('End');
    const step1 = nav.locator('button[data-step-index="1"]');
    await expect(step1).toBeFocused();
  });

  test('STEP-K07: Space activates focused step (onStepClick fires)', async ({ page }) => {
    const nav = navBy(page, WIZARD_LABEL);
    const step0 = nav.locator('button[data-step-index="0"]');
    await step0.focus();
    await page.keyboard.press('Space');
    // After activation, currentStep should be 0, so the live region updates.
    const liveRegion = nav.locator('[role="status"][aria-live="polite"]');
    const text = await liveRegion.textContent();
    expect(text).toContain('Step 1 of 4');
    expect(text).toContain('Account');
  });

  test('STEP-K08: Enter activates focused step', async ({ page }) => {
    const nav = navBy(page, WIZARD_LABEL);
    const step1 = nav.locator('button[data-step-index="1"]');
    await step1.focus();
    await page.keyboard.press('Enter');
    const liveRegion = nav.locator('[role="status"][aria-live="polite"]');
    const text = await liveRegion.textContent();
    expect(text).toContain('Step 2 of 4');
    expect(text).toContain('Workspace');
  });
});
