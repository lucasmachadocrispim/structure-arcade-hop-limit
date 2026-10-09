import { test, expect } from '@playwright/test';

test.describe('smoke · HOP LIMIT carrega', () => {
  test('abre a página e o container do jogo existe', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
    await expect(page.locator('#game')).toBeVisible({ timeout: 15_000 });
  });

  test('o canvas do Phaser é criado', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('#game canvas');
    await expect(canvas).toBeVisible({ timeout: 20_000 });
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('o título da página é Hop Limit', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Hop Limit/i);
  });

  test('nenhum erro fatal no console durante o boot', async ({ page }) => {
    const erros: string[] = [];
    page.on('pageerror', (e) => erros.push(e.message));
    await page.goto('/');
    await page.waitForTimeout(3000);
    // filtra erros esperados de rede (CDN externa pode falhar em ambiente isolado)
    const fatais = erros.filter((m) => !/Failed to fetch|net::ERR|404/i.test(m));
    expect(fatais).toEqual([]);
  });
});