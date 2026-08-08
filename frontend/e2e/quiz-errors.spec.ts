import { test, expect, type Page } from '@playwright/test';

/**
 * Tratamento de erros (US-02 / RF-04): e-mail duplicado deve retornar
 * HTTP 409 e exibir mensagem de erro no formulário.
 */
test.describe('Quiz Flow - Error Handling', () => {
  async function answerAllQuestions(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByText('Pergunta 1 de 10')).toBeVisible({ timeout: 10000 });

    for (let i = 1; i <= 10; i++) {
      // Selecionar a última alternativa disponível (maior pontuação)
      await page.locator('[data-testid^="alternative-"]').last().click();
      await page.waitForTimeout(100); // Aguardar animação
      await page.getByTestId('next-button').click();

      if (i < 10) {
        await expect(page.getByText(`Pergunta ${i + 1} de 10`)).toBeVisible();
      } else {
        await expect(page.getByText('Quase lá!')).toBeVisible();
      }
    }
  }

  async function submitForm(
    page: Page,
    name: string,
    email: string,
    phone: string,
  ): Promise<void> {
    await page.getByLabel('Nome').fill(name);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Telefone').fill(phone);
    await page.getByTestId('submit-button').click();
  }

  test('should show error for duplicate email (409)', async ({ page }) => {
    test.setTimeout(90000);
    const email = `duplicate${Date.now()}@email.com`;

    // Primeira submissão com o e-mail -> sucesso (lead persistido)
    await answerAllQuestions(page);
    await submitForm(page, 'João Silva', email, '11999999999');
    await expect(page.getByTestId('score')).toBeVisible({ timeout: 10000 });

    // Segunda submissão com o mesmo e-mail -> 409 Conflict
    await answerAllQuestions(page);
    await submitForm(page, 'João Silva 2', email, '11888888888');
    await expect(page.getByText('Este e-mail já realizou o quiz')).toBeVisible({
      timeout: 5000,
    });
  });
});
