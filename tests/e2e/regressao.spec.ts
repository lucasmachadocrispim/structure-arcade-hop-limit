import { test, expect } from '@playwright/test';

test.describe('regressão · fluxo básico', () => {
  test('o jogo responde a cliques no canvas sem travar', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('#game canvas');
    await expect(canvas).toBeVisible({ timeout: 20_000 });

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    // clica em alguns pontos plausíveis (menu INICIAR + área de jogo)
    const pontos = [
      { x: 0.64, y: 0.36 }, // botão INICIAR (desktop)
      { x: 0.5,  y: 0.5  },
      { x: 0.64, y: 0.48 }, // botão CODEX
      { x: 0.5,  y: 0.5  },
    ];

    for (const p of pontos) {
      await page.mouse.click(box!.x + box!.width * p.x, box!.y + box!.height * p.y);
      await page.waitForTimeout(500);
    }

    // o canvas continua vivo e visível
    await expect(canvas).toBeVisible();
  });

  test('o jogo mantém o canvas em proporção correta (letterbox do Phaser)', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('#game canvas');
    await expect(canvas).toBeVisible({ timeout: 20_000 });

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    // aspect ratio deve ser 16:9 (desktop) ou ~0.46 (mobile), nunca algo arbitrário
    const ratio = box!.width / box!.height;
    const ok = Math.abs(ratio - 16 / 9) < 0.05 || Math.abs(ratio - 450 / 975) < 0.05;
    expect(ok).toBe(true);
  });

  test('a build responde rápido (primeira renderização < 15 s)', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await expect(page.locator('#game canvas')).toBeVisible({ timeout: 15_000 });
    const dt = Date.now() - start;
    expect(dt).toBeLessThan(15_000);
  });
});