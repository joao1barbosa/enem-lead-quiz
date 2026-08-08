# Admin Module — API Documentation

Módulo responsável pela administração: autenticação via JWT (RF-08) e gestão de leads (RF-05, RF-06, RF-07).

## Autenticação

### `POST /api/auth/login`

Autentica o admin e retorna um token JWT.

**Request body:**

```json
{
  "email": "admin@admin.com",
  "password": "admin123"
}
```

**Regras aplicadas:**

- Credenciais inválidas (e-mail inexistente ou senha incorreta) retornam `401 Unauthorized`.
- O admin padrão é criado pelo seed com `admin@admin.com` / `admin123`.

**Response — `201 Created`:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response — `401 Unauthorized`:**

```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas.",
  "error": "Unauthorized"
}
```

## Rotas protegidas

Todas as rotas `/api/admin/*` exigem o header:

```
Authorization: Bearer <access_token>
```

Sem token (ou token inválido/expirado), a resposta é `401 Unauthorized`.

### `GET /api/admin/dashboard`

Retorna KPIs e métricas do dashboard.

**Query params:** nenhum.

**Response — `200 OK`:**

```json
{
  "totalLeads": 42,
  "averageScore": 58.3,
  "distributionByDiagnostic": [
    { "slug": "STARTING_POINT", "title": "Ponto de Partida", "count": 5 },
    { "slug": "IN_CONSTRUCTION", "title": "Em Construção", "count": 12 },
    { "slug": "ON_RIGHT_TRACK", "title": "Na Trilha Certa", "count": 18 },
    { "slug": "FINAL_STRETCH", "title": "Reta Final", "count": 7 }
  ],
  "dailyLeads": [
    { "date": "2026-08-01", "count": 3 },
    { "date": "2026-08-02", "count": 5 }
  ]
}
```

**Regras aplicadas:**

- `distributionByDiagnostic` inclui **todas** as 4 faixas de diagnóstico, mesmo com zero leads.
- `dailyLeads` agrega por dia (`YYYY-MM-DD`) em ordem cronológica.

### `GET /api/admin/leads`

Lista paginada de leads com filtros opcionais.

**Query params:**

| Parâmetro    | Tipo   | Obrigatório | Padrão | Descrição                              |
| ------------ | ------ | ----------- | ------ | -------------------------------------- |
| `search`     | string | não         | —      | Busca por nome ou e-mail (case-insensitive) |
| `diagnostic` | string | não         | —      | Filtra por `diagnosticSlug`            |
| `page`       | number | não         | `1`    | Página atual (1-based)                 |
| `limit`      | number | não         | `10`   | Quantidade de itens por página         |

**Response — `200 OK`:**

```json
{
  "leads": [
    {
      "id": "a1b2c3d4-...",
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "11999999999",
      "score": 62,
      "diagnosticSlug": "ON_RIGHT_TRACK",
      "diagnosticTitle": "Na Trilha Certa",
      "createdAt": "2026-08-01T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

**Regras aplicadas:**

- Ordenação por `createdAt` (decrescente).

### `GET /api/admin/leads/:id`

Detalhes completos de um lead: contato, resultado e resumo das respostas.

**Response — `200 OK`:**

```json
{
  "contactInfo": {
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "11999999999",
    "createdAt": "2026-08-01T10:00:00.000Z"
  },
  "result": {
    "score": 62,
    "diagnosticSlug": "ON_RIGHT_TRACK",
    "diagnosticTitle": "Na Trilha Certa",
    "diagnosticMessage": "Você está indo muito bem! ..."
  },
  "answersSummary": [
    {
      "questionText": "Em uma progressão aritmética...",
      "selectedOptionText": "35",
      "score": 2
    }
  ]
}
```

**Response — `404 Not Found`:** lead inexistente.

```json
{
  "statusCode": 404,
  "message": "Lead não encontrado.",
  "error": "Not Found"
}
```

### `GET /api/admin/leads/export`

Exporta leads filtrados em CSV.

**Query params:** `search` e `diagnostic` (opcionais, mesmos filtros da listagem).

**Response — `200 OK`:**

```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="leads-<timestamp>.csv"

Nome,E-mail,Telefone,Faixa,Pontuação,Data
João Silva,joao@email.com,11999999999,Na Trilha Certa,75,2026-08-01
```

**Regras aplicadas:**

- Colunas: `Nome`, `E-mail`, `Telefone`, `Faixa`, `Pontuação`, `Data`.
- `Data` no formato `YYYY-MM-DD`.
- Campos com vírgula, aspas ou quebra de linha são escapados entre aspas.
- Ordenação por `createdAt` (ascendente).

## Estrutura de Arquivos

```
backend/src/
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts          # Registro do módulo (JwtModule + PassportModule)
│   │   ├── auth.controller.ts      # POST /api/auth/login
│   │   ├── auth.service.ts         # Validação de credenciais + geração do JWT
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts     # Validação do Bearer token
│   │   └── dto/
│   │       └── login.dto.ts        # Contrato de entrada do login
│   └── admin/
│       ├── admin.module.ts         # Registro do módulo
│       ├── admin.controller.ts     # Rotas /api/admin/*
│       ├── admin.service.ts        # KPIs, listagem e detalhes de leads
│       ├── csv-export.service.ts   # Geração do CSV (RF-07)
│       └── __tests__/
│           ├── admin.service.spec.ts
│           └── csv-export.service.spec.ts
└── common/
    ├── guards/
    │   └── jwt-auth.guard.ts       # Guard de proteção das rotas admin
    └── decorators/
        └── current-user.decorator.ts # Injeta o admin autenticado
```

## Configuração

| Variável     | Descrição                 |
| ------------ | ------------------------- |
| `JWT_SECRET` | Segredo para assinar tokens JWT (obrigatória) |
| `JWT`        | Tokens expiram em `1d`    |

O admin padrão (`admin@admin.com` / `admin123`) é criado pelo seed (`prisma/seed.ts`).
