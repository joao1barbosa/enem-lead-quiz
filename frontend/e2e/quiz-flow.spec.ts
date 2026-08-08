import { test, expect } from '@playwright/test';

/**
 * Fluxo completo do quiz público (US-01, US-02, US-03):
 * responder 10 perguntas -> preencher formulário -> ver resultado.
 */
test.describe('Quiz Flow - Complete Journey', () => {
  test('should complete entire quiz flow', async ({ page }) => {
    await page.goto('/');

    // Estado de loading inicial (carregamento do quiz via API)
    await expect(page.getByText('Carregando quiz...')).toBeVisible();

    // Quiz carregado com 10 perguntas
    await expect(page.getByText('Pergunta 1 de 10')).toBeVisible({ timeout: 10000 });

    // Responder as 10 perguntas selecionando a primeira alternativa
    // (primeira alternativa de cada pergunta vale 10 pontos -> score 100)
    for (let i = 1; i <= 10; i++) {
      await page.getByTestId('alternative-0').click();
      await page.getByTestId('next-button').click();

      if (i < 10) {
        await expect(page.getByText(`Pergunta ${i + 1} de 10`)).toBeVisible();
      } else {
        // Última pergunta -> transição para o formulário
        await expect(page.getByText('Quase lá!')).toBeVisible();
      }
    }

    // Formulário de contato (US-02)
    await expect(page.getByLabel('Nome')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Telefone')).toBeVisible();

    await page.getByLabel('Nome').fill('João Silva');
    await page.getByLabel('Email').fill(`joao${Date.now()}@email.com`);
    await page.getByLabel('Telefone').fill('11999999999');
    await page.getByTestId('submit-button').click();

    // Resultado (US-03): pontuação + faixa + resumo das respostas
    await expect(page.getByTestId('score')).toHaveText('100', { timeout: 10000 });
    await expect(page.getByTestId('diagnostic-title')).toHaveText('Reta Final');
    await expect(page.getByText('Resumo das Respostas')).toBeVisible();
  });
});
