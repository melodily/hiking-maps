import { test, expect } from '@playwright/test';
import { stubNetworkSac } from './helpers.js';

// Run a search before each test in this suite
test.beforeEach(async ({ page }) => {
  await stubNetworkSac(page);
  await page.goto('/map-generator.html');
  await page.fill('#place-input', 'Triglav');
  await page.click('#btn-go');
  await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 10000 });
});

test.describe('Layer toggles', () => {
  test('Trails button removes active class on first click', async ({ page }) => {
    const btn = page.locator('#btn-trails');
    await expect(btn).toHaveClass(/active/);
    await btn.click();
    await expect(btn).not.toHaveClass(/active/);
  });

  test('Trails button restores active class on second click', async ({ page }) => {
    const btn = page.locator('#btn-trails');
    await btn.click();
    await btn.click();
    await expect(btn).toHaveClass(/active/);
  });

  test('Huts button removes active class on first click', async ({ page }) => {
    const btn = page.locator('#btn-huts');
    await expect(btn).toHaveClass(/active/);
    await btn.click();
    await expect(btn).not.toHaveClass(/active/);
  });

  test('Water button removes active class on first click', async ({ page }) => {
    const btn = page.locator('#btn-water');
    await expect(btn).toHaveClass(/active/);
    await btn.click();
    await expect(btn).not.toHaveClass(/active/);
  });
});

test.describe('Difficulty filter', () => {
  test('clicking a difficulty row adds muted class', async ({ page }) => {
    // Open legend via FAB first
    await page.locator('#legend-fab').click();
    const t1Row = page.locator('.legend-row[data-key="T1"]');
    await t1Row.click();
    await expect(t1Row).toHaveClass(/muted/);
  });

  test('clicking a muted difficulty row removes muted class', async ({ page }) => {
    await page.locator('#legend-fab').click();
    const t1Row = page.locator('.legend-row[data-key="T1"]');
    await t1Row.click(); // mute
    await t1Row.click(); // unmute
    await expect(t1Row).not.toHaveClass(/muted/);
  });
});

test.describe('Legend', () => {
  test('legend is hidden by default', async ({ page }) => {
    const legend = page.locator('#legend');
    await expect(legend).not.toHaveClass(/open/);
  });

  test('legend opens when FAB is clicked', async ({ page }) => {
    const legend = page.locator('#legend');
    await page.locator('#legend-fab').click();
    await expect(legend).toHaveClass(/open/);
  });

  test('legend closes when FAB is clicked again', async ({ page }) => {
    const legend = page.locator('#legend');
    await page.locator('#legend-fab').click();
    await page.locator('#legend-fab').click();
    await expect(legend).not.toHaveClass(/open/);
  });

  test('legend closes when map is clicked', async ({ page }) => {
    const legend = page.locator('#legend');
    await page.locator('#legend-fab').click();
    await expect(legend).toHaveClass(/open/);
    await page.locator('#map').click({ position: { x: 300, y: 300 } });
    await expect(legend).not.toHaveClass(/open/);
  });
});
