import { test, expect } from '@playwright/test';

test.describe('Formatação de Telefone', () => {
  test.beforeEach(async ({ page }) => {
    // Faz login antes de cada teste
    await page.goto('/admin/login');
    await page.getByLabel('Email').fill('admin@admin.com');
    await page.getByLabel('Senha').fill('admin123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/\/admin\/dashboard/);
  });

  test('deve exibir telefone formatado na tabela de leads', async ({ page }) => {
    // Navega para a página de leads
    await page.goto('/admin/leads');
    
    // Aguarda a tabela carregar
    await page.waitForSelector('table');
    
    // Verifica se há pelo menos um telefone formatado no padrão (xx) xxxxx-xxxx
    const phonePattern = /\(\d{2}\) \d{5}-\d{4}/;
    
    // Busca todas as células da coluna de telefone
    const phoneCells = page.locator('table tbody tr td').filter({ hasText: phonePattern });
    
    // Verifica se existe pelo menos um telefone formatado
    const count = await phoneCells.count();
    expect(count).toBeGreaterThan(0);
    
    // Verifica o formato específico do primeiro telefone encontrado
    const firstPhone = await phoneCells.first().textContent();
    expect(firstPhone).toMatch(phonePattern);
  });

  test('deve exibir telefone formatado no modal de detalhes', async ({ page }) => {
    // Navega para a página de leads
    await page.goto('/admin/leads');
    
    // Aguarda a tabela carregar
    await page.waitForSelector('table');
    
    // Clica na primeira linha da tabela para abrir o modal
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.click();
    
    // Aguarda o modal abrir
    const modal = page.locator('[role="dialog"]');
    await modal.waitFor({ state: 'visible' });
    
    // Verifica se o telefone no modal está formatado
    const phonePattern = /\(\d{2}\) \d{5}-\d{4}/;
    const phoneText = await modal.locator('text=/\\(\\d{2}\\) \\d{5}-\\d{4}/').textContent();
    
    expect(phoneText).toMatch(phonePattern);
  });
});
