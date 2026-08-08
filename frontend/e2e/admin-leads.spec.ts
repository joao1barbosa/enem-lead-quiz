import { test, expect, type APIRequestContext } from '@playwright/test';

const API_URL = 'http://localhost:3000';

/** Título da faixa exibido na tabela (backend pt-BR) por slug do filtro. */
const DIAGNOSTIC_TITLES: Record<string, string> = {
  STARTING_POINT: 'Ponto de Partida',
  IN_CONSTRUCTION: 'Em Construção',
  ON_RIGHT_TRACK: 'Bom Caminho',
  FINAL_STRETCH: 'Reta Final',
};

/** Login via API para obter o JWT (RF-08). */
async function getAdminToken(request: APIRequestContext): Promise<string> {
  const response = await request.post(`${API_URL}/api/auth/login`, {
    data: { email: 'admin@admin.com', password: 'admin123' },
  });
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { access_token: string };
  return body.access_token;
}

/**
 * Cria um lead via API pública (RF-03) respondendo o quiz com a primeira
 * alternativa de cada pergunta (score 100 -> "Reta Final").
 */
async function createLead(
  request: APIRequestContext,
  name: string,
  email: string,
): Promise<void> {
  const quizResponse = await request.get(`${API_URL}/api/quizzes/active`);
  const quiz = (await quizResponse.json()) as {
    questions: Array<{ id: string; alternatives: Array<{ id: string }> }>;
  };
  const answers = quiz.questions.map((question) => ({
    questionId: question.id,
    alternativeId: question.alternatives[0].id,
  }));

  const response = await request.post(`${API_URL}/api/leads`, {
    data: { name, email, phone: '11999999999', answers },
  });
  expect(response.ok()).toBeTruthy();
}

/**
 * Visão operacional de leads (US-06, US-07):
 * tabela paginada, busca por nome/e-mail, filtro por faixa, modal de
 * detalhes e exportação CSV.
 */
test.describe('Admin Leads', () => {
  // Garante pelo menos 11 leads para validar a paginação (10 por página)
  // de forma determinística, independente do estado atual do banco.
  test.beforeAll(async ({ request }) => {
    const token = await getAdminToken(request);
    const listResponse = await request.get(`${API_URL}/api/admin/leads?page=1&limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const list = (await listResponse.json()) as { total: number };
    expect(listResponse.ok()).toBeTruthy();

    const missing = 11 - list.total;
    if (missing > 0) {
      const suffix = Date.now();
      for (let i = 0; i < missing; i++) {
        await createLead(request, `E2E Lead ${i}`, `e2e-lead-${suffix}-${i}@email.com`);
      }
    }
  });

  test.beforeEach(async ({ page }) => {
    // Login e navegação para a visão operacional
    await page.goto('/admin/login');
    await page.getByLabel('Email').fill('admin@admin.com');
    await page.getByLabel('Senha').fill('admin123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/\/admin\/dashboard/);
    await page.goto('/admin/leads');

    // Aguarda a tabela carregar
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('should display leads table with all columns', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    // Cabeçalhos da tabela (US-06)
    for (const header of ['Nome', 'Email', 'Telefone', 'Score', 'Faixa', 'Data']) {
      await expect(page.getByRole('columnheader', { name: header })).toBeVisible();
    }

    // Tabela paginada indica o total de leads
    await expect(page.getByText(/Mostrando \d+-\d+ de \d+ leads/)).toBeVisible();
  });

  test('should search leads by name or email', async ({ page }) => {
    const rows = page.locator('tbody tr');

    // Usa o e-mail do primeiro lead como termo de busca determinístico
    const firstEmail = (await rows.first().locator('td').nth(1).innerText()).trim();
    const searchTerm = firstEmail.split('@')[0];

    await page.getByPlaceholder('Buscar por nome ou email...').fill(searchTerm);

    // A tabela é refiltrada: a primeira linha contém o termo buscado
    await expect(rows.first().locator('td').nth(1)).toContainText(searchTerm);
  });

  test('should filter leads by diagnostic band', async ({ page }) => {
    const rows = page.locator('tbody tr');

    // Pega a faixa do primeiro lead e seleciona o slug correspondente
    const firstTitle = (await rows.first().locator('td').nth(4).innerText()).trim();
    const slug = Object.entries(DIAGNOSTIC_TITLES).find(([, title]) => title === firstTitle)?.[0];
    expect(slug).toBeDefined();

    // Aguarda a resposta filtrada do backend antes de selecionar
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/admin/leads') &&
        response.request().method() === 'GET' &&
        response.url().includes(`diagnostic=${slug}`),
    );

    await page.locator('select').selectOption(slug!);
    await expect(page.locator('select')).toHaveValue(slug!);

    await responsePromise;

    // Todas as linhas visíveis pertencem à faixa selecionada
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator('td').nth(4)).toHaveText(firstTitle);
    }
  });

  test('should paginate through leads', async ({ page }) => {
    const previous = page.getByRole('button', { name: 'Anterior' });
    const next = page.getByRole('button', { name: 'Próxima' });

    // Página 1: "Anterior" desabilitado, "Próxima" habilitada (11+ leads)
    await expect(previous).toBeDisabled();
    await expect(next).toBeEnabled();
    await expect(page.getByText(/Mostrando 1-\d+ de \d+ leads/)).toBeVisible();

    // Avançar para a página 2
    await next.click();
    await expect(page.getByText(/Mostrando 11-\d+ de \d+ leads/)).toBeVisible();
    await expect(previous).toBeEnabled();
  });

  test('should open lead details modal', async ({ page }) => {
    await page.locator('tbody tr').first().click();

    // Seções do modal (US-07)
    await expect(page.getByRole('heading', { name: 'Detalhes do Lead' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Informações de Contato' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Resultado' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Respostas' })).toBeVisible();
  });

  test('should close lead details modal', async ({ page }) => {
    await page.locator('tbody tr').first().click();
    await expect(page.getByRole('heading', { name: 'Detalhes do Lead' })).toBeVisible();

    await page.getByRole('button', { name: 'Fechar' }).click();
    await expect(page.getByRole('heading', { name: 'Detalhes do Lead' })).not.toBeVisible();
  });

  test('should export leads as CSV', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');

    await page.getByRole('button', { name: 'Exportar CSV' }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^leads-\d+\.csv$/);
  });
});
