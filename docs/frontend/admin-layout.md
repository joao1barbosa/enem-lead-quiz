# Admin Layout & Login (Frontend)

## Overview

Painel administrativo do ENEM Lead Quiz (Epico 2 - `docs/bdd/features.md`),
implementado com TDD estrito (Red-Green-Refactor) na branch
`feature/admin-frontend-layout`. Cobre a autenticação JWT (US-04), o layout
persistente responsivo (US-08, RNF-03) e o logout (US-09).

## Estrutura

```
frontend/src/
├── components/admin/
│   ├── sidebar.tsx                             # Sidebar desktop (≥1024px)
│   ├── mobile-header.tsx                       # Header mobile (<1024px)
│   ├── bottom-nav.tsx                          # Bottom navigation mobile
│   └── __tests__/                              # sidebar/mobile-header/bottom-nav
├── hooks/
│   ├── use-auth.ts                             # Store Zustand de autenticação
│   └── __tests__/use-auth.test.ts
├── routes/
│   ├── index.tsx                               # Configuração central de rotas
│   └── admin/
│       ├── admin-layout.tsx                    # Layout persistente (Outlet)
│       ├── admin-login.tsx                     # Página de login (US-04)
│       ├── admin-dashboard.tsx                 # Placeholder (Ticket #10)
│       ├── admin-leads.tsx                     # Placeholder (Ticket #11)
│       ├── protected-route.tsx                 # Guarda de autenticação
│       └── __tests__/                          # admin-layout/admin-login/protected-route
└── lib/
    └── auth.ts                                 # decodeJwtToken (helper JWT)
```

## Autenticação (`hooks/use-auth.ts`)

Store Zustand com middleware `persist` (`auth-storage` no localStorage).

| Estado/Ação | Comportamento |
| --- | --- |
| `login(email, password)` | `POST /api/auth/login`; decodifica o JWT; armazena token+user; define `Authorization: Bearer` no axios. |
| `logout()` | Remove token, user e o header `Authorization`. |
| `isAuthenticated` | `true` enquanto existir token persistido. |

- `lib/auth.ts` expõe `decodeJwtToken(token)` — decodifica o payload JWT
  (segmento do meio, base64url) sem validar assinatura; extrai `email` do admin
  (payload backend: `{ sub, email }`).
- Credenciais de seed (RF-08): `admin@admin.com` / `admin123`.

## Layout responsivo (RNF-03)

`AdminLayout` renderiza `Sidebar` + `MobileHeader` + `<main><Outlet /></main>` +
`BottomNavigation`. As rotas aninhadas (`dashboard`, `leads`) são renderizadas
pelo `<Outlet />` — a navegação persiste sem reload (US-08).

| Breakpoint | Sidebar | MobileHeader | BottomNavigation |
| --- | --- | --- | --- |
| Desktop (≥1024px) | `lg:flex` | `lg:hidden` | `lg:hidden` |
| Mobile (<1024px) | `hidden` | visível | `fixed bottom` |

- **Sidebar** (`components/admin/sidebar.tsx`): logo, links Dashboard/Leads com
  estado ativo (`bg-blue-100`), avatar + email do admin e botão **Sair** no rodapé.
- **MobileHeader** (`components/admin/mobile-header.tsx`): logo + avatar; clique no
  avatar abre popover com email e **Sair da Conta** (US-09).
- **BottomNavigation** (`components/admin/bottom-nav.tsx`): links fixos no rodapé.

## Rotas (`routes/index.tsx`)

```tsx
const routes = [
  { path: '/', element: <QuizFlow /> },
  { path: '*', element: <QuizFlow /> },
  { path: '/admin/login', element: <AdminLogin /> },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'leads', element: <AdminLeads /> },
    ],
  },
];
```

- `ProtectedRoute` redireciona para `/admin/login` quando não autenticado (US-04).
- `App.tsx` consome a configuração `routes` e monta as rotas aninhadas.

## Testes

- `npm run test` — suíte completa (84 testes).
- Novo: `use-auth` (4), `ProtectedRoute` (2), `Sidebar` (4), `MobileHeader` (3),
  `BottomNavigation` (2), `AdminLayout` (4), `AdminLogin` (4).
- AdminLayout e AdminLogin usam `useAuth.setState(...)` para controlar o estado
  autenticado sem depender do localStorage entre testes.

## Próximos passos

1. `admin-dashboard.tsx` — KPIs + gráficos (Ticket #10).
2. `admin-leads.tsx` — tabela, toolbar e export CSV (Ticket #11).
3. E2E Playwright: fluxo de login admin (mandatório pelo CONTRIBUTING).
