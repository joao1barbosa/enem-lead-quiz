# Admin Dashboard (Frontend)

## Overview

Dashboard executivo do painel administrativo do ENEM Lead Quiz (RF-05, US-05,
Epico 2 - `docs/bdd/features.md`), implementado com TDD estrito
(Red-Green-Refactor) na branch `feature/admin-dashboard`. Consome o endpoint
`GET /api/admin/dashboard` (documentado em `docs/api/admin.md`) e exibe KPIs,
o gráfico donut de distribuição por faixa diagnóstica e o gráfico de área com
a evolução diária de leads.

## Estrutura

```
frontend/src/
├── components/admin/
│   ├── kpi-card.tsx                            # Card de indicador (KPI)
│   ├── diagnostic-donut.tsx                    # Donut por faixa diagnóstica
│   ├── leads-area-chart.tsx                    # Área: evolução diária de leads
│   └── __tests__/                              # kpi-card/diagnostic-donut/leads-area-chart
├── hooks/
│   ├── use-dashboard.ts                        # Query do GET /api/admin/dashboard
│   └── __tests__/use-dashboard.test.ts
├── routes/admin/
│   ├── admin-dashboard.tsx                     # Página Dashboard (RF-05)
│   └── __tests__/admin-dashboard.test.tsx
└── test/
    └── setup.ts                                # Mock do ResponsiveContainer (recharts)
```

## Hook (`hooks/use-dashboard.ts`)

| Estado | Comportamento |
| --- | --- |
| `data` | `{ totalLeads, averageScore, distributionByDiagnostic[], dailyLeads[] }` |
| `isLoading` | `true` enquanto a requisição está em andamento |
| `error` | exceção propagada da chamada HTTP (renderizada como erro na página) |

- `useQuery` com `queryKey: ['dashboard']` e `staleTime: 30000` (30s) para
  evitar chamadas excessivas ao backend.
- `averageScore` e a distribuição são sempre preenchidos pelo backend (as 4
  faixas vêm com contagem zerada quando não há leads).

## Componentes

### `KpiCard`

Card de indicador com `title`, `value`, `icon` (lucide-react) e `description`
opcional.

### `DiagnosticDonut`

Donut (Recharts `PieChart` + `Legend` + `Tooltip`) com a distribuição de leads
pelas 4 faixas diagnósticas. Cores fixas por slug:

| Faixa | Cor |
| --- | --- |
| `STARTING_POINT` | `#ef4444` (vermelho) |
| `IN_CONSTRUCTION` | `#f59e0b` (âmbar) |
| `ON_RIGHT_TRACK` | `#3b82f6` (azul) |
| `FINAL_STRETCH` | `#10b981` (verde) |

Slugs desconhecidos caem para cinza (`#6b7280`).

### `LeadsAreaChart`

Área (Recharts `AreaChart`) com a evolução diária de leads (últimos 30 dias).
Datas `YYYY-MM-DD` são formatadas como `dd/MM` de forma determinística
(parse manual), evitando o deslocamento de um dia causado por
`new Date('YYYY-MM-DD')` (UTC) + `toLocaleDateString` em fusos negativos.

## Página (`routes/admin/admin-dashboard.tsx`)

- Estados de carregamento (`Carregando dashboard...`) e erro
  (`Erro ao carregar dashboard`).
- 3 KPIs: **Total de Leads**, **Pontuação Média** (1 casa decimal) e
  **Faixas Diagnósticas** (quantidade de categorias ativas).
- Grade `lg:grid-cols-2` com `DiagnosticDonut` e `LeadsAreaChart`.
- Rota `admin/dashboard` já configurada em `routes/index.tsx` sob o
  `AdminLayout` protegido por `ProtectedRoute`.

## Testes

- `npm run test` — suíte completa (96 testes).
- Novo: `useDashboard` (2), `KpiCard` (2), `DiagnosticDonut` (3),
  `LeadsAreaChart` (2), `AdminDashboard` (3).
- O jsdom não implementa `ResizeObserver` (usado pelo `ResponsiveContainer` do
  recharts para medir o container), então `src/test/setup.ts` substitui o
  `ResponsiveContainer` por um wrapper de dimensões fixas (800×300) que injeta
  `width`/`height` numéricos nos charts — necessário para os gráficos e a
  legend renderizarem nos testes.

## Próximos passos

1. `admin-leads.tsx` — tabela, toolbar e export CSV (Ticket #11).
2. E2E Playwright: fluxo de login admin e visualização do dashboard
   (mandatório pelo CONTRIBUTING).
