import { test, expect } from '@playwright/test';

/**
 * Responsividade mobile (RNF-03): o fluxo do quiz deve funcionar em
 * viewport de dispositivo móvel (projeto "Mobile Chrome" / Pixel 5).
 */
test.describe('Quiz Flow - Mobile Responsiveness', () => {
  test('should render and allow interaction on mobile', async ({ page }) => {
    // Confirma que o teste está rodando em viewport mobile (Pixel 5)
    expect(page.viewportSize()).toEqual({ width: 393, height: 851 });

    await page.goto('/');

    // Quiz carrega normalmente no mobile
    await expect(page.getByText('Pergunta 1 de 10')).toBeVisible({ timeout: 10000 });

    // Elementos de interação visíveis na viewport mobile
    await expect(page.getByTestId('alternative-0')).toBeVisible();
    await expect(page.getByTestId('next-button')).toBeVisible();

    // Selecionar alternativa e avançar funciona no mobile
    await page.getByTestId('alternative-0').click();
    await page.getByTestId('next-button').click();
    await expect(page.getByText('Pergunta 2 de 10')).toBeVisible();
  });
});
