import { test, expect } from '@playwright/test';
import { stubNetworkSac, stubNominatimEmpty, stubNetworkFallback, stubNominatimLargeBbox } from './helpers.js';

test.describe('Initial state', () => {
  test('shows overlay with prompt message and no spinner', async ({ page }) => {
    await page.goto('/map-generator.html');
    await expect(page.locator('#loading')).not.toHaveClass(/hidden/);
    await expect(page.locator('.loader-ring')).not.toHaveClass(/visible/);
    await expect(page.locator('#loading p')).toContainText('Enter a place name');
  });

  test('Go button is present and enabled', async ({ page }) => {
    await page.goto('/map-generator.html');
    await expect(page.locator('#btn-go')).toBeEnabled();
  });
});

test.describe('Successful search', () => {
  test('hides overlay and updates title after search', async ({ page }) => {
    await stubNetworkSac(page);
    await page.goto('/map-generator.html');

    await page.fill('#place-input', 'Triglav');
    await page.click('#btn-go');

    await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 10000 });
    await expect(page.locator('#map-title')).toContainText('Triglav');
  });

  test('Enter key triggers search the same as clicking Go', async ({ page }) => {
    await stubNetworkSac(page);
    await page.goto('/map-generator.html');

    await page.fill('#place-input', 'Triglav');
    await page.press('#place-input', 'Enter');

    await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 10000 });
  });

  test('URL gains ?q= parameter after search', async ({ page }) => {
    await stubNetworkSac(page);
    await page.goto('/map-generator.html');

    await page.fill('#place-input', 'Triglav');
    await page.click('#btn-go');

    await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 10000 });
    expect(page.url()).toContain('?q=Triglav');
  });

  test('whitespace-only input does not trigger search', async ({ page }) => {
    await page.goto('/map-generator.html');
    await page.fill('#place-input', '   ');
    await page.click('#btn-go');
    // Overlay should remain as-is (no search started)
    await expect(page.locator('#loading')).not.toHaveClass(/hidden/);
  });
});

test.describe('Error state', () => {
  test('shows error in status when place is not found', async ({ page }) => {
    await stubNominatimEmpty(page);
    await page.goto('/map-generator.html');

    await page.fill('#place-input', 'xyzzy');
    await page.click('#btn-go');

    await expect(page.locator('#status')).toContainText('Not found', { timeout: 10000 });
    await expect(page.locator('#loading')).not.toHaveClass(/hidden/);
    await expect(page.locator('.loader-ring')).not.toHaveClass(/visible/);
  });
});

test.describe('Cap banner', () => {
  test('appears when returned bbox is larger than 50 km', async ({ page }) => {
    await stubNominatimLargeBbox(page);
    await page.goto('/map-generator.html');

    await page.fill('#place-input', 'Slovenia');
    await page.click('#btn-go');

    await expect(page.locator('#cap-banner')).toBeVisible({ timeout: 10000 });
  });

  test('is hidden for a normally-sized area', async ({ page }) => {
    await stubNetworkSac(page);
    await page.goto('/map-generator.html');

    await page.fill('#place-input', 'Triglav');
    await page.click('#btn-go');

    await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 10000 });
    await expect(page.locator('#cap-banner')).toBeHidden();
  });
});

test.describe('Fallback mode', () => {
  test('legend title changes to generic mode when no SAC trails found', async ({ page }) => {
    await stubNetworkFallback(page);
    await page.goto('/map-generator.html');

    await page.fill('#place-input', 'Triglav');
    await page.click('#btn-go');

    await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 15000 });
    await expect(page.locator('#legend-title')).not.toContainText('SAC');
  });
});
