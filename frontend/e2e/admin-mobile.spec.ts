import { test, expect, devices } from '@playwright/test';

test.use(devices['Pixel 5']);

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
