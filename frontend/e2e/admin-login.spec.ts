import { test, expect } from '@playwright/test';

/**
 * Autenticação no painel administrativo (US-04):
 * - login com credenciais válidas -> redirect para /admin/dashboard
 * - credenciais inválidas -> mensagem de erro na página de login
 * - acesso a rota protegida sem autenticação -> redirect para /admin/login
 */
test.describe('Admin Login Flow', () => {
  test('should login with valid credentials and redirect to dashboard', async ({ page }) => {
    await page.goto('/admin/login');

    await page.getByLabel('Email').fill('admin@admin.com');
    await page.getByLabel('Senha').fill('admin123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Redirecionado para o dashboard (US-04)
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');

    await page.getByLabel('Email').fill('admin@admin.com');
    await page.getByLabel('Senha').fill('wrong-password');
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Mensagem de erro exibida e permanece na página de login
    await expect(
      page.getByText('Credenciais inválidas. Tente novamente.'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Sem autenticação, a rota protegida redireciona via ProtectedRoute
    await page.goto('/admin/dashboard');

    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(
      page.getByRole('heading', { name: /Admin - ENEM Lead Quiz/ }),
    ).toBeVisible();
  });
});
