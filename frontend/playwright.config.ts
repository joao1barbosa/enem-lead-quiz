import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração E2E (Ticket #7). Requer o backend rodando em
 * http://localhost:3000 (ver docs/frontend/e2e-testing.md).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Serializado para garantir determinismo: os testes compartilham o
  // estado do backend (leads persistidos + rate limiting).
  workers: 1,
  // Fluxos longos (10 perguntas x 2 projetos) precisam de margem.
  timeout: 60_000,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    // Desativa animações de transform (Framer Motion respeita
    // prefers-reduced-motion via MotionConfig) para cliques estáveis.
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // Specs específicos de mobile rodam apenas no projeto Mobile Chrome.
      testIgnore: [/quiz-mobile\.spec\.ts/, /admin-mobile\.spec\.ts/],
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      // Spec de navegação por sidebar é exclusivo do desktop (≥1024px).
      testIgnore: [/admin-navigation\.spec\.ts/],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
