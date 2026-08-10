import { test, expect, devices, type APIRequestContext } from '@playwright/test';

const API_URL = 'http://localhost:3000';

test.use(devices['Pixel 5']);

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
 * Responsividade mobile (RNF-03, US-08, US-09):
 * header mobile com avatar, bottom navigation com os links Dashboard/Leads
 * e logout via popover do avatar. Espec exclusivo do projeto "Mobile Chrome"
 * (testIgnore no playwright.config.ts).
 */
test.describe('Admin Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    // Confirma o viewport do device Pixel 5 (393x727)
    expect(page.viewportSize()).toEqual({ width: 393, height: 727 });

    await page.goto('/admin/login');
    await page.getByLabel('Email').fill('admin@admin.com');
    await page.getByLabel('Senha').fill('admin123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/\/admin\/dashboard/);
  });

  test('should show mobile header and bottom navigation', async ({ page }) => {
    // Header mobile visível; sidebar desktop oculta (<1024px)
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('aside')).toBeHidden();

    // Bottom navigation fixa com os links Dashboard/Leads
    await expect(page.locator('nav.fixed.bottom-0')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Leads' })).toBeVisible();
  });

  test('should navigate between dashboard and leads via bottom nav', async ({ page }) => {
    // Dashboard -> Leads
    await page.getByRole('link', { name: 'Leads' }).click();
    await expect(page).toHaveURL(/\/admin\/leads/);
    await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible();

    // Leads -> Dashboard (bottom nav permanece montada)
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.locator('nav.fixed.bottom-0')).toBeVisible();
  });

  test('should logout via mobile avatar popover', async ({ page }) => {
    // Clicar no avatar no header mobile
    await page.locator('header button').click();

    // Popover com a opção de sair (US-09). O DropdownMenu (shadcn/Radix)
    // renderiza os itens com role "menuitem", não "button".
    await expect(page.getByRole('menuitem', { name: 'Sair da Conta' })).toBeVisible();

    await page.getByRole('menuitem', { name: 'Sair da Conta' }).click();

    // Sessão encerrada e redirecionado para a página de login
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

/**
 * Tabela de leads no mobile (RNF-03, US-06): 5 registros por página, apenas
 * as colunas Nome/Faixa visíveis e detalhes completos via modal.
 */
test.describe('Leads Table on Mobile', () => {
  // Garante pelo menos 6 leads para validar a paginação de 5 por página de
  // forma determinística, independente do estado atual do banco.
  test.beforeAll(async ({ request }) => {
    const token = await getAdminToken(request);
    const listResponse = await request.get(
      `${API_URL}/api/admin/leads?page=1&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const list = (await listResponse.json()) as { total: number };
    expect(listResponse.ok()).toBeTruthy();

    const missing = 6 - list.total;
    if (missing > 0) {
      const suffix = Date.now();
      for (let i = 0; i < missing; i++) {
        await createLead(
          request,
          `Mobile E2E Lead ${i}`,
          `mobile-e2e-${suffix}-${i}@email.com`,
        );
      }
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel('Email').fill('admin@admin.com');
    await page.getByLabel('Senha').fill('admin123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/\/admin\/dashboard/);
    await page.goto('/admin/leads');

    // Aguarda a tabela carregar
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('should display 10 leads per page on mobile', async ({ page }) => {
    // Paginação: 10 registros por página (mobile e desktop)
    await expect(page.locator('tbody tr')).toHaveCount(10);
    await expect(page.getByText(/Mostrando 1-10 de \d+ leads/)).toBeVisible();
  });

  test('should show only Nome and Faixa columns on mobile', async ({ page }) => {
    // Colunas essenciais permanecem visíveis
    await expect(page.getByRole('columnheader', { name: 'Nome' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Faixa' })).toBeVisible();

    // Colunas ocultas no mobile (hidden md:table-cell) não são visíveis
    for (const header of ['Email', 'Telefone', 'Score', 'Data']) {
      await expect(page.locator('th', { hasText: header })).toBeHidden();
    }

    // Cada linha visível exibe apenas Nome + Faixa
    await expect(
      page.locator('tbody tr').first().locator('td:visible'),
    ).toHaveCount(2);
  });

  test('should open details modal with all lead info on mobile', async ({
    page,
  }) => {
    await page.locator('tbody tr').first().click();

    // Seções do modal de detalhes (US-07) — acessíveis mesmo com colunas ocultas
    await expect(
      page.getByRole('heading', { name: 'Detalhes do Lead' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Informações de Contato' }),
    ).toBeVisible();
    // ScoreCircle e faixa diagnóstica
    await expect(page.getByText(/Pontuação:/)).toBeVisible();
    // Botão de toggle de respostas
    await expect(page.getByRole('button', { name: 'Ver respostas' })).toBeVisible();
  });
});
