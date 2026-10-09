import { test, expect } from '@playwright/test';

test.describe('regressão · fluxo básico', () => {
  test('o jogo carrega e o canvas do Phaser é criado', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load', timeout: 30_000 });

    // confirma que o script do Phaser (CDN) carregou
    await page.waitForFunction(() => typeof (window as any).Phaser !== 'undefined', {
      timeout: 30_000,
    });

    const canvas = page.locator('#game canvas');
    await expect(canvas).toBeVisible({ timeout: 30_000 });

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('o jogo responde a cliques no canvas sem travar', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load', timeout: 30_000 });
    const canvas = page.locator('#game canvas');
    await expect(canvas).toBeVisible({ timeout: 30_000 });

    const box = (await canvas.boundingBox())!;

    // clica em pontos que, no menu, ativam botões e no jogo, movem o pacote
    const pontos = [
      { x: 0.64, y: 0.36 }, // INICIAR
      { x: 0.5,  y: 0.5  },
      { x: 0.64, y: 0.48 }, // CODEX (não abre se tutorial ainda está ativo — ok)
      { x: 0.5,  y: 0.5  },
    ];
    for (const p of pontos) {
      await page.mouse.click(box.x + box.width * p.x, box.y + box.height * p.y);
      await page.waitForTimeout(500);
    }

    await expect(canvas).toBeVisible();
  });

  test('a página e o canvas carregam em menos de 30 s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/', { waitUntil: 'load', timeout: 30_000 });
    await expect(page.locator('#game canvas')).toBeVisible({ timeout: 30_000 });
    const dt = Date.now() - start;
    expect(dt).toBeLessThan(30_000);
  });
});