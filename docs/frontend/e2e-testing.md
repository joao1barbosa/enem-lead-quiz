# E2E Testing (Playwright)

## Overview

Testes E2E do fluxo público do quiz (Ticket #7) usando Playwright, cobrindo
US-01, US-02, US-03 e RNF-03. Implementados com TDD estrito
(Red-Green-Refactor) na branch `feature/quiz-e2e-tests`.

Os testes validam o fluxo completo do usuário real: carregar o quiz via API,
responder as 10 perguntas, preencher o formulário, submeter e visualizar o
resultado — incluindo navegação entre perguntas, responsividade mobile e o
tratamento de e-mail duplicado (HTTP 409).

## Estrutura

```
frontend/
├── e2e/
│   ├── quiz-flow.spec.ts          # Fluxo completo + navegação entre perguntas
│   ├── quiz-mobile.spec.ts        # Responsividade mobile (projeto "Mobile Chrome")
│   └── quiz-errors.spec.ts        # E-mail duplicado (409)
├── playwright.config.ts           # Configuração (2 projetos + webServer)
└── package.json                   # Scripts test:e2e / test:e2e:ui
```

## Configuração

```bash
cd frontend
npm install -D @playwright/test
npx playwright install chromium
```

## Executando os testes

O `webServer` do Playwright inicia o dev server do frontend automaticamente
(`npm run dev` em `http://localhost:5173`). **O backend precisa estar rodando**
em `http://localhost:3000` com o banco migrado e seedado:

```bash
# 1. Banco de dados
docker compose up -d db

# 2. Backend (a partir da raiz do backend)
npx prisma migrate deploy
npx prisma db seed
npm run start:dev

# 3. Testes E2E (a partir de frontend/)
npm run test:e2e            # suite completa (headless)
npm run test:e2e:ui         # modo interativo
npx playwright show-report  # relatório HTML
```

### Rate limiting

O backend limita requisições públicas a 5/min (RNF-02). Para rodar a suíte
com segurança, inicie o backend com limite elevado:

```bash
THROTTLE_LIMIT=1000 npm run start:dev
```

## O que é testado

| Teste | Cobertura | US / RF |
|-------|-----------|---------|
| Complete Journey | 10 perguntas → formulário → resultado (score + faixa + resumo) | US-01, US-02, US-03 |
| Question Navigation | Avançar/voltar preserva a alternativa selecionada | US-01 |
| Duplicate Email | 2ª submissão com mesmo e-mail → erro "já realizou o quiz" | US-02, RF-04 |
| Mobile Responsiveness | Fluxo funcional em viewport mobile (Pixel 5) | RNF-03 |

## Detalhes técnicos

- **Seletores:** os componentes expõem `data-testid` (`alternative-{n}`,
  `next-button`, `previous-button`, `submit-button`, `score`,
  `diagnostic-title`) conforme `docs/requirements.md` §7.3.
- **Animations:** o app respeita `prefers-reduced-motion`
  (`MotionConfig reducedMotion="user"` em `main.tsx`). Os testes rodam com
  `reducedMotion: 'reduce'`, o que desativa as transformações do Framer
  Motion e torna os cliques determinísticos (as animações spring tornavam os
  elementos "instáveis" para o Playwright).
- **Projetos:** `chromium` (Desktop) e `Mobile Chrome` (Pixel 5). O spec de
  mobile roda apenas no projeto mobile; os demais rodam em ambos.
- **Serialização:** `workers: 1` para garantir determinismo, já que os testes
  compartilham o estado do backend (leads persistidos).
- **Timeout:** 60s por teste (fluxos longos: 10 perguntas × 2 projetos).

## Problemas encontrados e soluções

1. **Loading transitório:** o estado "Carregando quiz..." desaparece rápido
   demais com o backend local. A asserção tolera loading **ou** pergunta
   carregada via `locator.or()`.
2. **Instabilidade de cliques:** as animações spring (Framer Motion) mantinham
   o bounding box dos botões em movimento, falhando a checagem de
   actionability. Resolvido com `reducedMotion` (acessibilidade + testes).
3. **Backend sem endpoint de leads:** o `POST /api/leads` não existia no
   backend; foi implementado como passo GREEN do TDD (ver
   `backend/src/modules/lead/` e `backend/src/modules/scoring/`).
