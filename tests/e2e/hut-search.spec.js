import { test, expect } from '@playwright/test';
import { stubNetworkSac } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await stubNetworkSac(page);
  await page.goto('/map-generator.html');
  await page.fill('#place-input', 'Triglav');
  await page.click('#btn-go');
  await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 10000 });
});

test('typing a partial hut name shows suggestions dropdown', async ({ page }) => {
  await page.fill('#hut-search', 'Dom');
  await expect(page.locator('#hut-suggestions')).toHaveClass(/open/);
  await expect(page.locator('.suggestion-item')).toHaveCount(1);
});

test('typing a non-matching string shows no-results message', async ({ page }) => {
  await page.fill('#hut-search', 'zzzzz');
  await expect(page.locator('#hut-suggestions')).toHaveClass(/open/);
  await expect(page.locator('#search-no-results')).toBeVisible();
});

test('clicking a suggestion closes the dropdown', async ({ page }) => {
  await page.fill('#hut-search', 'Dom');
  await expect(page.locator('.suggestion-item')).toHaveCount(1);
  await page.locator('.suggestion-item').first().click();
  await expect(page.locator('#hut-suggestions')).not.toHaveClass(/open/);
});

test('pressing Escape closes the dropdown', async ({ page }) => {
  await page.fill('#hut-search', 'Dom');
  await expect(page.locator('#hut-suggestions')).toHaveClass(/open/);
  await page.press('#hut-search', 'Escape');
  await expect(page.locator('#hut-suggestions')).not.toHaveClass(/open/);
});
