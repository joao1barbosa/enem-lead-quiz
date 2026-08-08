import { test, expect } from '@playwright/test';

/**
 * Navegação no painel administrativo (US-08, US-09) — desktop (≥1024px).
 * Alternância entre Dashboard e Leads pela sidebar e logout pelo botão
 * "Sair". Espec exclusivo do projeto "chromium" (testIgnore no
 * playwright.config.ts); a navegação mobile é coberta em admin-mobile.spec.ts.
 */
test.describe('Admin Navigation (Desktop Sidebar)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel('Email').fill('admin@admin.com');
    await page.getByLabel('Senha').fill('admin123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/\/admin\/dashboard/);
  });

  test('should navigate between dashboard and leads via sidebar', async ({ page }) => {
    // Sidebar visível no desktop (RNF-03)
    await expect(page.locator('aside')).toBeVisible();

    // Dashboard -> Leads
    await page.locator('aside').getByRole('link', { name: 'Leads' }).click();
    await expect(page).toHaveURL(/\/admin\/leads/);
    await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible();

    // Leads -> Dashboard (sidebar permanece montada, sem recarregar)
    await page.locator('aside').getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.locator('aside')).toBeVisible();
  });

  test('should logout from desktop sidebar', async ({ page }) => {
    // Botão "Sair" no rodapé da sidebar
    await page.locator('aside').getByRole('button', { name: 'Sair' }).click();

    // Sessão encerrada e redirecionado para a página de login
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(
      page.getByRole('heading', { name: /Admin - ENEM Lead Quiz/ }),
    ).toBeVisible();
  });
});
