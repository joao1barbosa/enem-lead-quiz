import { test, expect } from '@playwright/test';

/**
 * Fluxo completo do quiz público (US-01, US-02, US-03):
 * responder 10 perguntas -> preencher formulário -> ver resultado.
 */
test.describe('Quiz Flow - Complete Journey', () => {
  test('should complete entire quiz flow', async ({ page }) => {
    await page.goto('/');

    // Tela de introdução (US-01): apresenta o quiz antes de começar
    await expect(page.getByTestId('start-quiz-button')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('start-quiz-button').click();

    // Quiz carregado com 10 perguntas
    await expect(page.getByText('Pergunta 1 de 10')).toBeVisible({ timeout: 10000 });

    // Responder as 10 perguntas selecionando a última alternativa
    // (última alternativa de cada pergunta vale 10 pontos -> score 100)
    for (let i = 1; i <= 10; i++) {
      // Selecionar a última alternativa disponível
      await page.locator('[data-testid^="alternative-"]').last().click();
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

  test('should navigate between questions preserving answers', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('start-quiz-button')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('start-quiz-button').click();
    await expect(page.getByText('Pergunta 1 de 10')).toBeVisible({ timeout: 10000 });

    // Selecionar alternativa na pergunta 1
    await page.getByTestId('alternative-0').click();

    // Avançar para a pergunta 2
    await page.getByTestId('next-button').click();
    await expect(page.getByText('Pergunta 2 de 10')).toBeVisible();

    // Voltar para a pergunta 1
    await page.getByTestId('previous-button').click();
    await expect(page.getByText('Pergunta 1 de 10')).toBeVisible();

    // A alternativa selecionada anteriormente continua marcada
    await expect(page.getByTestId('alternative-0')).toHaveClass(/bg-primary/);
  });
});
