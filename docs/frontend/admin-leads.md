# Admin Leads (Frontend)

## Overview

Visão operacional de gestão de leads do ENEM Lead Quiz (Epico 2 -
`docs/bdd/features.md`), implementada com TDD estrito (Red-Green-Refactor) na
branch `feature/admin-leads`. Cobre a tabela paginada com busca e filtro
(US-06, RF-06), o modal de detalhes do lead (US-07, RF-06) e a exportação CSV
(US-06, RF-07). Consome os endpoints documentados em `docs/api/admin.md`.

## Estrutura

```
frontend/src/
├── components/admin/
│   ├── leads-table.tsx                       # Tabela paginada de leads
│   ├── leads-toolbar.tsx                     # Busca, filtro e exportação
│   ├── lead-details-modal.tsx                # Modal de detalhes (US-07)
│   └── __tests__/                            # leads-table/leads-toolbar/lead-details-modal
├── hooks/
│   ├── use-leads.ts                          # Lista paginada + filtros
│   ├── use-lead-details.ts                   # Detalhes de um lead
│   └── __tests__/                            # use-leads/use-lead-details
├── lib/
│   ├── export-csv.ts                         # Download do CSV filtrado
│   └── __tests__/export-csv.test.ts
└── routes/admin/
    ├── admin-leads.tsx                       # Página de leads (substitui placeholder)
    └── __tests__/admin-leads.test.tsx
```

## Hooks

### `hooks/use-leads.ts`

| Parâmetro | Descrição |
| --- | --- |
| `search` | Termo de busca (nome ou e-mail); `''` = sem filtro. |
| `diagnostic` | Slug da faixa diagnóstica; `''` = todas. |
| `page` | Página atual (inicia em 1). |
| `limit` | Itens por página (default 10). |

- `GET /api/admin/leads` com `params { search, diagnostic, page, limit }`.
- `queryKey: ['leads', { search, diagnostic, page, limit }]` — refetch
  automático a cada mudança de filtro/página.
- `placeholderData: keepPreviousData` — mantém os dados da página anterior
  enquanto navega, evitando "piscar" do loading.

### `hooks/use-lead-details.ts`

- `GET /api/admin/leads/:id`, `queryKey: ['lead-details', leadId]`.
- `enabled: !!leadId` — só busca quando um lead está selecionado.

## Componentes

### `LeadsTable` (RF-06, US-06)

Tabela com colunas Nome, Email, Telefone, Score, Faixa e Data (formato
`dd/mm/aaaa` via `toLocaleDateString('pt-BR')`). Linhas clicáveis chamam
`onLeadClick(lead)`.

### `LeadsToolbar` (RF-06, RF-07, US-06)

| Controle | Comportamento |
| --- | --- |
| Campo de busca | Placeholder "Buscar por nome ou email..."; `onSearchChange`. |
| Select de faixa | Opções Todas / Starting Point / In Construction / On Right Track / Final Stretch. |
| Botão "Exportar CSV" | Chama `onExport` (verde, ícone Download). |

### `LeadDetailsModal` (RF-06, US-07)

Modal controlado (`leadId`, `onClose`) com overlay `bg-black/50`; fecha ao
clicar no overlay ou no botão X (`aria-label="Fechar"`). Exibe:

- **Informações de Contato** — nome, e-mail, telefone, data de cadastro.
- **Resultado** — pontuação, faixa e mensagem personalizada.
- **Respostas** — resumo com pergunta, alternativa selecionada e score.

## Exportação CSV (`lib/export-csv.ts`) (RF-07)

`exportLeadsCsv({ search, diagnostic })`:

1. `GET /api/admin/leads/export` com `params` e `responseType: 'blob'`.
2. Cria um `Blob` `text/csv` e um object URL (`URL.createObjectURL`).
3. Dispara o download via `<a download="leads-<timestamp>.csv">` e revoga o URL.

## Página `AdminLeads` (US-06, US-07)

- Estado local: `search`, `diagnostic`, `page`, `selectedLead`.
- Trocar busca/filtro volta para a página 1.
- Estados de carregamento ("Carregando...") e erro ("Erro ao carregar leads").
- Paginação: "Mostrando X-Y de Z leads" + botões **Anterior**/**Próxima** com
  desabilitação nos limites.
- Clicar em uma linha abre o `LeadDetailsModal`; exportar usa os filtros atuais.

## Testes

- `npm run test` — suíte completa (108 testes).
- Novos: `useLeads` (3), `useLeadDetails` (3), `LeadsTable` (3),
  `LeadsToolbar` (5), `LeadDetailsModal` (4), `exportLeadsCsv` (2),
  `AdminLeads` (6).
- A importação de um módulo inexistente falha na resolução do Vite mesmo com
  `vi.mock`, por isso `export-csv` foi implementado antes da página.
- jsdom não implementa `URL.createObjectURL` — os testes definem os stubs
  via `Object.defineProperty`.

## Próximos passos

1. E2E Playwright: fluxo admin (login → dashboard → leads → exportar CSV),
   mandatório pelo CONTRIBUTING.
2. Polimento: debounce na busca e estados vazios da tabela.
