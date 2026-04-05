import { test, expect } from '@playwright/test';
import { stubNetworkSac } from './helpers.js';

test('GPX button is disabled before any search', async ({ page }) => {
  await page.goto('/map-generator.html');
  await expect(page.locator('#btn-gpx')).toBeDisabled();
});

test('GPX button is enabled after a successful search', async ({ page }) => {
  await stubNetworkSac(page);
  await page.goto('/map-generator.html');
  await page.fill('#place-input', 'Triglav');
  await page.click('#btn-go');
  await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 10000 });
  await expect(page.locator('#btn-gpx')).toBeEnabled();
});

test('clicking GPX triggers a file download with a .gpx extension', async ({ page }) => {
  await stubNetworkSac(page);
  await page.goto('/map-generator.html');
  await page.fill('#place-input', 'Triglav');
  await page.click('#btn-go');
  await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 10000 });

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#btn-gpx').click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/\.gpx$/);
});

test('downloaded GPX filename is derived from the place name', async ({ page }) => {
  await stubNetworkSac(page);
  await page.goto('/map-generator.html');
  await page.fill('#place-input', 'Triglav');
  await page.click('#btn-go');
  await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 10000 });

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#btn-gpx').click(),
  ]);

  expect(download.suggestedFilename().toLowerCase()).toContain('triglav');
});
