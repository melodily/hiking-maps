import { test, expect } from '@playwright/test';
import { stubNetworkSac } from './helpers.js';

test('URL updates to ?q= after a successful search', async ({ page }) => {
  await stubNetworkSac(page);
  await page.goto('/map-generator.html');
  await page.fill('#place-input', 'Triglav');
  await page.click('#btn-go');
  await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 10000 });
  expect(page.url()).toContain('?q=Triglav');
});

test('URL updates without a full page reload (no navigation event)', async ({ page }) => {
  await stubNetworkSac(page);
  await page.goto('/map-generator.html');

  let navigated = false;
  page.on('framenavigated', () => { navigated = true; });

  await page.fill('#place-input', 'Triglav');
  await page.click('#btn-go');
  await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 10000 });

  expect(navigated).toBe(false);
});

test('loading ?q=Triglav pre-fills the input', async ({ page }) => {
  await stubNetworkSac(page);
  await page.goto('/map-generator.html?q=Triglav');
  await expect(page.locator('#place-input')).toHaveValue('Triglav');
});

test('loading ?q=Triglav auto-fires the search', async ({ page }) => {
  await stubNetworkSac(page);
  await page.goto('/map-generator.html?q=Triglav');
  await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 10000 });
  await expect(page.locator('#map-title')).toContainText('Triglav');
});

test('second search updates ?q= to the new query', async ({ page }) => {
  await stubNetworkSac(page);
  await page.goto('/map-generator.html');

  await page.fill('#place-input', 'Triglav');
  await page.click('#btn-go');
  await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 10000 });

  await page.fill('#place-input', 'Bled');
  await page.click('#btn-go');
  await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 10000 });

  expect(page.url()).toContain('?q=Bled');
  expect(page.url()).not.toContain('Triglav');
});
