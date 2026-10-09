import { test, expect } from '@playwright/test';

test.describe('smoke · HOP LIMIT carrega', () => {
  test('responde 200 e o título é Hop Limit', async ({ page }) => {
    const res = await page.goto('/', { waitUntil: 'load', timeout: 30_000 });
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/Hop Limit/i);
  });

  test('o container do jogo e o canvas existem', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load', timeout: 30_000 });
    await expect(page.locator('#game')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('#game canvas')).toBeVisible({ timeout: 30_000 });
  });

  test('o Phaser carregou (CDN acessível)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load', timeout: 30_000 });
    await page.waitForFunction(() => typeof (window as any).Phaser !== 'undefined', {
      timeout: 30_000,
    });
    const tipo = await page.evaluate(() => typeof (window as any).Phaser);
    expect(tipo).toBe('object');
  });

  test('sem erros fatais no console', async ({ page }) => {
    const erros: string[] = [];
    page.on('pageerror', (e) => erros.push(e.message));
    await page.goto('/', { waitUntil: 'load', timeout: 30_000 });
    await page.waitForTimeout(3000);
    const fatais = erros.filter(
      (m) => !/Failed to fetch|net::ERR|404|favicon/i.test(m),
    );
    expect(fatais).toEqual([]);
  });
});