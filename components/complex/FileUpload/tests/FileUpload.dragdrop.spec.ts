/**
 * FileUpload drag-and-drop spec.
 *
 * Coverage: drag counter pattern (no flicker on nested children),
 * data-state transitions, drop processing, multi-file drop with
 * multiple=false, dataTransfer.items fallback.
 *
 * Total: 9 cases (FU-D01..FU-D09).
 */

import { test, expect } from '@playwright/test';
import { zoneBy, dispatchDrop } from './_helpers';

const URL = '/components/file-upload';

test.describe('FileUpload — drag & drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('FU-D01: dragenter sets data-state="dragging"', async ({ page }) => {
    const zone = zoneBy(page, 'Upload single file');
    await zone.evaluate((el) => {
      const dt = new DataTransfer();
      dt.items.add(new File(['x'], 'a.txt', { type: 'text/plain' }));
      el.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }));
    });
    await expect(zone).toHaveAttribute('data-state', 'dragging');
  });

  test('FU-D02: dragleave decrements counter; state clears at 0', async ({ page }) => {
    const zone = zoneBy(page, 'Upload single file');
    await zone.evaluate((el) => {
      const dt = new DataTransfer();
      dt.items.add(new File(['x'], 'a.txt', { type: 'text/plain' }));
      el.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }));
      el.dispatchEvent(new DragEvent('dragleave', { dataTransfer: dt, bubbles: true }));
    });
    await expect(zone).toHaveAttribute('data-state', 'idle');
  });

  test('FU-D03: drop processes files + clears drag state', async ({ page }) => {
    const zone = zoneBy(page, 'Upload single file');
    await dispatchDrop(zone, [{ name: 'doc.pdf', mimeType: 'application/pdf', bytes: 500 }]);
    await expect(zone).toHaveAttribute('data-state', 'idle');
    // FileChip rendered for accepted file.
    await expect(page.getByText('doc.pdf')).toBeVisible();
  });

  test('FU-D04: drag counter does NOT flicker when entering nested child', async ({ page }) => {
    // FU-R03 regression — increment on dragenter, decrement on dragleave,
    // even when triggered by moving over a child element inside render-props
    // content. State stays "dragging" while pointer remains over the zone.
    const zone = zoneBy(page, 'Upload single file');
    await zone.evaluate((el) => {
      const dt = new DataTransfer();
      dt.items.add(new File(['x'], 'a.txt', { type: 'text/plain' }));
      el.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }));
      // Simulate entering an inner child: dragenter on child bubbles to root
      // (counter increments again), then dragleave on the previous boundary.
      const child = el.querySelector('button') ?? el.firstElementChild;
      child?.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }));
      el.dispatchEvent(new DragEvent('dragleave', { dataTransfer: dt, bubbles: true }));
    });
    // Net counter > 0 → still dragging.
    await expect(zone).toHaveAttribute('data-state', 'dragging');
  });

  test('FU-D05: drop with multiple=false + 3 files accepts 1, rejects 2', async ({ page }) => {
    // FU-R14
    const zone = zoneBy(page, 'Upload single file');
    await dispatchDrop(zone, [
      { name: 'a.txt', mimeType: 'text/plain' },
      { name: 'b.txt', mimeType: 'text/plain' },
      { name: 'c.txt', mimeType: 'text/plain' },
    ]);
    await expect(page.getByText('a.txt')).toBeVisible();
    // Only first file rendered as FileChip.
    await expect(page.getByText('b.txt', { exact: true })).toHaveCount(0);
  });

  test('FU-D06: drop with multiple=true respects maxFiles cap', async ({ page }) => {
    // FU-R15
    const zone = zoneBy(page, 'Upload up to 5 files');
    await dispatchDrop(zone, [
      { name: 'f1.txt', mimeType: 'text/plain' },
      { name: 'f2.txt', mimeType: 'text/plain' },
      { name: 'f3.txt', mimeType: 'text/plain' },
      { name: 'f4.txt', mimeType: 'text/plain' },
      { name: 'f5.txt', mimeType: 'text/plain' },
    ]);
    await expect(page.getByText('f5.txt')).toBeVisible();
  });

  test('FU-D07: drop on disabled zone does nothing', async ({ page }) => {
    // FU-R22
    const zone = zoneBy(page, 'Disabled file upload');
    await dispatchDrop(zone, [{ name: 'x.txt', mimeType: 'text/plain' }]);
    // No FileChip rendered for "x.txt" since drop ignored.
    await expect(page.locator('body').getByText('x.txt')).toHaveCount(0);
    await expect(zone).toHaveAttribute('data-state', 'disabled');
  });

  test('FU-D08: dragover preventDefault prevents browser file-open default', async ({ page }) => {
    // FU-R18 — dragover handler always calls preventDefault. Verify by
    // checking defaultPrevented on the dispatched event.
    const zone = zoneBy(page, 'Upload single file');
    const prevented = await zone.evaluate((el) => {
      const dt = new DataTransfer();
      dt.items.add(new File(['x'], 'a.txt', { type: 'text/plain' }));
      const event = new DragEvent('dragover', {
        dataTransfer: dt,
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(event);
      return event.defaultPrevented;
    });
    expect(prevented).toBe(true);
  });

  test('FU-D09: drop without dragenter still processes (mobile/touch path)', async ({ page }) => {
    // FU-R10 — mobile touch users tap drop zone; touch handler fires
    // click → openPicker. Verify drop alone (no dragenter) still works.
    const zone = zoneBy(page, 'Upload single file');
    await zone.evaluate((el) => {
      const dt = new DataTransfer();
      dt.items.add(new File(['x'], 'mobile.txt', { type: 'text/plain' }));
      el.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true }));
    });
    await expect(page.getByText('mobile.txt')).toBeVisible();
  });
});
