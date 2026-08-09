import { test, expect } from '@playwright/test';

/**
 * Dashboard executivo (US-05):
 * - KPIs: total de leads, pontuação média e leads qualificados
 * - gráfico donut com a distribuição de leads por faixa
 * - gráfico de área com a evolução diária de novos leads
 */
test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste (US-04)
    await page.goto('/admin/login');
    await page.getByLabel('Email').fill('admin@admin.com');
    await page.getByLabel('Senha').fill('admin123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/\/admin\/dashboard/);
  });

  test('should display KPIs', async ({ page }) => {
    await expect(page.getByText('Total de Leads')).toBeVisible();
    await expect(page.getByText('Pontuação Média')).toBeVisible();
    await expect(page.getByText('Leads Qualificados')).toBeVisible();
  });

  test('should display diagnostic donut chart', async ({ page }) => {
    await expect(
      page.getByText('Distribuição por Faixa'),
    ).toBeVisible();

    // O ResponsiveContainer do Recharts monta a área do gráfico
    // Usa .first() porque há 2 gráficos na página (donut + area)
    await expect(page.locator('.recharts-responsive-container').first()).toBeVisible();
  });

  test('should display leads area chart', async ({ page }) => {
    await expect(
      page.getByText('Leads por Dia'),
    ).toBeVisible();

    // Usa .nth(1) para selecionar o segundo gráfico (area chart)
    await expect(page.locator('.recharts-responsive-container').nth(1)).toBeVisible();
  });
});
