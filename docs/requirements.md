# Especificações Técnicas do Sistema

Este documento consolida todos os requisitos funcionais e não-funcionais da aplicação, incluindo detalhes técnicos de implementação.

---

## 1. Arquitetura Geral

### 1.1 Arquitetura SPA com Nested Layouts

A aplicação frontend é uma **Single Page Application (SPA)** que utiliza nested layouts do React Router DOM para simular o comportamento de layouts persistentes:

**Quiz Público (`/`):**
- Fluxo contínuo de página única
- Estado local (Zustand) gerencia navegação entre perguntas, formulário e resultado
- Sem recarregamentos durante todo o fluxo

**Área Administrativa (`/admin/*`):**
- **AdminLayout:** Componente de layout persistente que contém:
  - Sidebar (desktop)
  - Mobile Header + Bottom Navigation Bar (mobile)
- **Nested Routes:** Rotas filhas renderizadas via `<Outlet />`
  - `/admin/dashboard` → Visão executiva (KPIs + gráficos)
  - `/admin/leads` → Visão operacional (tabela + toolbar)
- A estrutura de navegação permanece montada sem recarregar ao alternar entre rotas

**Estrutura de Rotas:**
```typescript
// frontend/src/routes/index.tsx
const routes = [
  { path: '/', element: <QuizFlow /> },              // SPA contínua
  { path: '/admin/login', element: <AdminLogin /> },
  {
    path: '/admin',
    element: <AdminLayout />,                        // Layout persistente
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'leads', element: <AdminLeads /> },
    ],
  },
];
```

### 1.2 Estrutura do Monorepo

```
enem-lead-quiz/
├── docker-compose.yml              # Orquestração dos serviços
├── .devcontainer/                  # Configuração do Dev Container
├── .gitignore                      # Ignorar arquivos do Git
├── .dockerignore                   # Ignorar arquivos no build Docker
├── .env.example                    # Template de variáveis de ambiente
├── README.md                       # Documentação principal
├── docs/                           # Documentação
│   ├── bdd/
│   │   └── features.md             # Especificações de negócio (BDD)
│   ├── requirements.md             # Especificações técnicas
│   ├── adr/                        # Decision Records
│   └── agents/                     # Configuração de agentes
├── backend/                        # API NestJS
│   ├── .env.example
│   ├── .dockerignore
│   └── ...
└── frontend/                       # SPA React + Vite
    ├── .env.example
    ├── .dockerignore
    └── ...
```

### 1.2 Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Runtime** | Node.js | 22 LTS |
| **Backend Framework** | NestJS | 10.x |
| **ORM** | Prisma | 5.x |
| **Database** | PostgreSQL | 16 |
| **Backend Tests** | Vitest | 1.x |
| **Frontend Build** | Vite | 5.x |
| **Frontend Framework** | React | 18.x |
| **Routing** | React Router DOM | 6.x |
| **Styling** | Tailwind CSS | 3.x |
| **UI Components** | shadcn/ui | latest |
| **Icons** | Lucide React | latest |
| **Data Fetching** | TanStack React Query | 5.x |
| **Forms** | React Hook Form + Zod | latest |
| **Charts** | Recharts | 2.x |
| **Animations** | Framer Motion | 11.x |
| **Frontend Tests** | Vitest + Testing Library | latest |

---

## 2. Requisitos Funcionais (RFs)

### RF-01: Quiz Dinâmico via Seed/Migrations

**Descrição:** As perguntas e alternativas do quiz devem ser carregadas do banco de dados, sem nenhum conteúdo hardcoded no frontend.

**Implementação:**
- Seed no Prisma popula tabela `questions` com 10 perguntas
- Cada pergunta possui alternativas com pontuação (0-10 pontos)
- Endpoint `GET /api/quizzes/active` retorna quiz completo

**Schema Prisma:**
```prisma
model Question {
  id          String   @id @default(uuid())
  order       Int      @unique
  text        String
  alternatives Alternative[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Alternative {
  id         String   @id @default(uuid())
  questionId String
  question   Question @relation(fields: [questionId], references: [id])
  text       String
  score      Int      // 0-10
  createdAt  DateTime @default(now())
}
```

---

### RF-02: Cálculo de Pontuação e Faixa de Diagnóstico

**Descrição:** O backend calcula a pontuação total e mapeia a faixa de diagnóstico via Enums/Slugs.

**Enums de Diagnóstico:**
```typescript
enum DiagnosticSlug {
  STARTING_POINT = 'STARTING_POINT',      // 0-25 pontos
  IN_CONSTRUCTION = 'IN_CONSTRUCTION',    // 26-50 pontos
  ON_RIGHT_TRACK = 'ON_RIGHT_TRACK',      // 51-75 pontos
  FINAL_STRETCH = 'FINAL_STRETCH',        // 76-100 pontos
}
```

**Configuração das Faixas:**
```typescript
const DIAGNOSTICS = [
  {
    slug: 'STARTING_POINT',
    title: 'Ponto de Partida',
    message: 'Você está começando sua jornada de preparação. Não desanime! Com dedicação e os recursos certos, você pode evoluir rapidamente.',
    minScore: 0,
    maxScore: 25,
  },
  {
    slug: 'IN_CONSTRUCTION',
    title: 'Em Construção',
    message: 'Você está construindo suas bases. Continue estudando e focando nos pontos fracos para avançar.',
    minScore: 26,
    maxScore: 50,
  },
  {
    slug: 'ON_RIGHT_TRACK',
    title: 'Na Trilha Certa',
    message: 'Você está indo muito bem! Mantenha o ritmo e refine suas habilidades para alcançar a excelência.',
    minScore: 51,
    maxScore: 75,
  },
  {
    slug: 'FINAL_STRETCH',
    title: 'Reta Final',
    message: 'Excelente! Você está quase lá. Continue com foco e confiança para garantir um ótimo resultado.',
    minScore: 76,
    maxScore: 100,
  },
];
```

**Lógica de Cálculo:**
```typescript
// backend/src/modules/scoring/scoring.calculator.ts
export class ScoringCalculator {
  calculate(answers: { alternativeId: string; score: number }[]): number {
    return answers.reduce((total, answer) => total + answer.score, 0);
  }

  getDiagnostic(score: number): DiagnosticConfig {
    return DIAGNOSTICS.find(d => score >= d.minScore && score <= d.maxScore);
  }
}
```

---

### RF-03: Payload de Resultado Público (Minimização de Dados)

**Descrição:** A API retorna apenas os dados necessários para montar a tela de resultado, seguindo o princípio de Privacy by Design. Dados pessoais (PII) e IDs não são retornados na resposta pública, pois o frontend já possui essas informações no estado do formulário.

**Endpoint:** `POST /api/leads`

**Request Body:**
```typescript
{
  name: string;
  email: string;
  phone: string;
  answers: Array<{
    questionId: string;
    alternativeId: string;
  }>;
  honeypot?: string; // Campo oculto para detecção de bots
}
```

**Response Body (201 Created):**
```typescript
{
  score: number;                      // 0-100
  diagnosticSlug: string;             // "ON_RIGHT_TRACK"
  diagnosticTitle: string;            // "Na Trilha Certa"
  diagnosticMessage: string;          // Mensagem personalizada completa
  answersSummary: Array<{
    questionText: string;
    selectedOptionText: string;
  }>;
}
```

**Princípios Aplicados:**
- **Imutabilidade:** Lead não possui `updatedAt` (tentativas de reenvio geram HTTP 409)
- **Minimização de Dados:** Não retorna `id`, `name`, `email` ou `phone`
- **Privacy by Design:** Dados sensíveis não trafegam desnecessariamente na rede
- **State Management:** Frontend já possui dados do formulário no estado local

---

### RF-04: Bloqueio de E-mail Duplicado

**Descrição:** Se o e-mail já existir no banco, a API retorna HTTP 409 Conflict sem sobrescrever dados.

**Lógica:**
```typescript
// backend/src/modules/lead/lead.service.ts
async create(dto: CreateLeadDto) {
  const existingLead = await this.prisma.lead.findUnique({
    where: { email: dto.email }
  });

  if (existingLead) {
    throw new ConflictException('Este e-mail já realizou o quiz.');
  }

  // ... criar novo lead
}
```

**Response (409 Conflict):**
```typescript
{
  statusCode: 409,
  message: 'Este e-mail já realizou o quiz.',
  error: 'Conflict'
}
```

**Frontend:** Exibir mensagem de validação no formulário sem expor dados anteriores.

---

### RF-05: Rotas Separadas do Admin

**Descrição:** O painel administrativo possui duas rotas distintas com propósitos específicos.

**Estrutura de Rotas:**
```typescript
// frontend/src/routes/index.tsx
const routes = [
  { path: '/admin/login', element: <AdminLogin /> },
  { path: '/admin/dashboard', element: <AdminDashboard /> },  // KPIs + Gráficos
  { path: '/admin/leads', element: <AdminLeads /> },          // Tabela + Toolbar
];
```

**Rota `/admin/dashboard` (Visão Executiva):**
- Cards de KPIs: Total de Leads, Média de Pontuação, Distribuição por Faixa
- Gráfico Donut/Pie: Distribuição por faixas de diagnóstico
- Gráfico Area: Evolução diária de novos leads

**Rota `/admin/leads` (Visão Operacional):**
- Toolbar integrada com:
  - Campo de busca textual (nome/e-mail)
  - Filtro select por faixa de diagnóstico
  - Botão "Exportar CSV"
- Tabela paginada com leads
- Modal/Drawer de detalhes ao clicar em um lead

---

### RF-06: Modal de Detalhes do Lead

**Descrição:** Modal que exibe informações completas de um lead específico.

**Conteúdo do Modal:**
```typescript
interface LeadDetails {
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    createdAt: string;
  };
  result: {
    score: number;
    diagnosticSlug: string;
    diagnosticTitle: string;
    diagnosticMessage: string;
  };
  answersSummary: Array<{
    questionText: string;
    selectedOptionText: string;
    score: number;
  }>;
}
```

**Endpoint:** `GET /api/admin/leads/:id`

---

### RF-07: Exportação CSV

**Descrição:** Exportar leads filtrados em formato CSV.

**Endpoint:** `GET /api/admin/leads/export?search={term}&diagnostic={slug}`

**Response:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="leads-{timestamp}.csv"

Nome,E-mail,Telefone,Faixa,Pontuação,Data
João Silva,joao@email.com,11999999999,Na Trilha Certa,75,2024-01-15
```

---

### RF-08: Autenticação JWT Stateless

**Descrição:** Autenticação do admin via JWT com credenciais padrão via Seed.

**Seed de Admin:**
```typescript
// backend/prisma/seed.ts
await prisma.admin.create({
  data: {
    email: 'admin@admin.com',
    password: await bcrypt.hash('admin123', 10),
    name: 'Administrador',
  }
});
```

**Endpoints:**
- `POST /api/auth/login` → Retorna JWT
- `GET /api/admin/*` → Requer header `Authorization: Bearer {token}`

**Guard NestJS:**
```typescript
// backend/src/common/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

---

## 3. Requisitos Não-Funcionais (RNFs)

### RNF-01: Proteção contra Bots (Honeypot)

**Descrição:** Campo oculto no formulário para detecção silenciosa de bots.

**Implementação:**
```typescript
// Frontend: Campo oculto via CSS
<input
  type="text"
  name="honeypot"
  tabIndex={-1}
  autoComplete="off"
  style={{ position: 'absolute', left: '-9999px' }}
/>

// Backend: Validação silenciosa
if (dto.honeypot) {
  this.logger.warn('Bot detected', { ip: request.ip });
  return { success: true }; // Resposta silenciosa
}
```

**Comportamento:**
- Se honeypot preenchido → HTTP 200 sem persistir dados
- Log interno registrado para auditoria
- Nenhuma mensagem de erro exposta

---

### RNF-02: Rate Limiting

**Descrição:** Proteção contra abuso nas rotas públicas.

**Configuração:**
```typescript
// backend/src/app.module.ts
@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,      // 1 minuto
      limit: 5,       // 5 requisições
    }]),
  ],
})
```

**Endpoints Protegidos:**
- `POST /api/leads`
- `GET /api/quizzes/active`

**Response (429 Too Many Requests):**
```typescript
{
  statusCode: 429,
  message: 'Muitas requisições. Tente novamente em breve.',
  error: 'Too Many Requests'
}
```

---

### RNF-03: Interface Responsiva

**Descrição:** UX adaptada para desktop e mobile com padrões específicos.

**Desktop (≥1024px):**
- Sidebar fixa à esquerda com navegação
- Avatar/Nome do Admin + Botão Logout no rodapé da sidebar

**Mobile (<1024px):**
- Header superior com Logo + Avatar do Admin
- Popover ao clicar no Avatar com opção "Sair da Conta"
- Bottom Navigation Bar fixa com ícones Dashboard/Leads

**Componentes Responsivos:**
```typescript
// Sidebar (Desktop)
<Sidebar className="hidden lg:flex" />

// Mobile Header + Bottom Nav
<MobileHeader className="lg:hidden" />
<BottomNavigation className="lg:hidden" />
```

---

### RNF-04: Docker Compose

**Descrição:** Orquestração completa via Docker Compose com Node 22 LTS.

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: quiz_user
      POSTGRES_PASSWORD: quiz_password
      POSTGRES_DB: quiz_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://quiz_user:quiz_password@db:5432/quiz_db
      JWT_SECRET: your-secret-key
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Dockerfile Backend:**
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
CMD ["node", "dist/main"]
```

**Dockerfile Frontend:**
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "5173"]
```

---

### RNF-05: Dev Container

**Descrição:** Ambiente de desenvolvimento padronizado via Dev Container.

**.devcontainer/devcontainer.json:**
```json
{
  "name": "ENEM Lead Quiz",
  "dockerComposeFile": "../docker-compose.yml",
  "service": "backend",
  "workspaceFolder": "/workspace",
  "features": {
    "ghcr.io/devcontainers/features/node:1": {
      "version": "22"
    }
  },
  "forwardPorts": [3000, 5173, 5432],
  "postCreateCommand": "cd backend && npm install && cd ../frontend && npm install"
}
```

---

### RNF-06: Testes Automatizados

**Descrição:** Cobertura de testes para lógica crítica.

**Backend (Vitest):**
```typescript
// backend/src/modules/scoring/__tests__/scoring.calculator.spec.ts
describe('ScoringCalculator', () => {
  it('should calculate total score correctly', () => {
    const answers = [
      { alternativeId: '1', score: 7 },
      { alternativeId: '2', score: 5 },
    ];
    expect(calculator.calculate(answers)).toBe(12);
  });

  it('should return correct diagnostic for score', () => {
    expect(calculator.getDiagnostic(75).slug).toBe('ON_RIGHT_TRACK');
  });
});

// backend/src/modules/lead/__tests__/lead.service.spec.ts
describe('LeadService', () => {
  it('should reject duplicate email with 409', async () => {
    // ... teste de e-mail duplicado
  });

  it('should silently discard bot submissions', async () => {
    // ... teste de honeypot
  });
});
```

**Frontend (Vitest + Testing Library):**
```typescript
// frontend/src/components/quiz/__tests__/quiz-form.test.tsx
describe('QuizForm', () => {
  it('should display validation error for duplicate email', async () => {
    // ... teste de validação
  });
});
```

---

## 4. Estrutura de Diretórios Detalhada

### Backend
```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   └── filters/
│   │       └── http-exception.filter.ts
│   ├── modules/
│   │   ├── quiz/
│   │   │   ├── quiz.module.ts
│   │   │   ├── quiz.controller.ts
│   │   │   ├── quiz.service.ts
│   │   │   └── dto/
│   │   │       └── quiz-response.dto.ts
│   │   ├── lead/
│   │   │   ├── lead.module.ts
│   │   │   ├── lead.controller.ts
│   │   │   ├── lead.service.ts
│   │   │   ├── lead.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-lead.dto.ts
│   │   │   │   └── lead-response.dto.ts
│   │   │   └── __tests__/
│   │   │       └── lead.service.spec.ts
│   │   ├── scoring/
│   │   │   ├── scoring.module.ts
│   │   │   ├── scoring.service.ts
│   │   │   ├── scoring.calculator.ts
│   │   │   ├── diagnostic.enum.ts
│   │   │   └── __tests__/
│   │   │       └── scoring.calculator.spec.ts
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── strategies/
│   │   │       └── jwt.strategy.ts
│   │   └── admin/
│   │       ├── admin.module.ts
│   │       ├── admin.controller.ts
│   │       ├── admin.service.ts
│   │       └── csv-export.service.ts
│   └── config/
│       └── env.validation.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── test/
│   └── e2e/
├── Dockerfile
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Frontend
```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   ├── index.tsx                 # Configuração de rotas
│   │   ├── quiz/
│   │   │   ├── quiz-flow.tsx         # SPA contínua (perguntas + formulário + resultado)
│   │   │   ├── question-card.tsx
│   │   │   ├── lead-form.tsx
│   │   │   └── result-page.tsx
│   │   └── admin/
│   │       ├── admin-login.tsx
│   │       ├── admin-layout.tsx      # Layout persistente (Sidebar + Mobile Header + Bottom Nav)
│   │       ├── admin-dashboard.tsx
│   │       └── admin-leads.tsx
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── admin/
│   │   │   ├── sidebar.tsx
│   │   │   ├── mobile-header.tsx
│   │   │   ├── bottom-nav.tsx
│   │   │   ├── kpi-card.tsx
│   │   │   ├── lead-details-modal.tsx
│   │   │   ├── leads-table.tsx
│   │   │   └── leads-toolbar.tsx
│   │   └── charts/
│   │       ├── diagnostic-donut.tsx
│   │       └── leads-area-chart.tsx
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-leads.ts
│   │   └── use-quiz.ts
│   ├── lib/
│   │   ├── api.ts                    # Axios instance
│   │   └── auth.ts                   # JWT helpers
│   ├── stores/
│   │   └── quiz-store.ts             # Zustand store (estado do quiz)
│   └── types/
│       ├── quiz.ts
│       ├── lead.ts
│       └── api.ts
├── public/
├── index.html
├── Dockerfile
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── vitest.config.ts
```

---

## 5. Arquivos Globais do Repositório

### 5.1 `.gitignore`

**Localização:** Raiz do repositório

**Conteúdo:**
```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.log

# Production
dist/
build/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Docker
.docker/

# Prisma
backend/prisma/*.db
backend/prisma/*.db-journal

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Misc
.cache/
.temp/
```

### 5.2 `.dockerignore`

**Localização:** Raiz do repositório, `backend/` e `frontend/`

**Conteúdo (raiz):**
```dockerignore
**/node_modules
**/dist
**/build
**/coverage
**/.env
**/.env.local
**/.git
**/.github
**/.vscode
**/.idea
**/README.md
**/docs
**/.dockerignore
**/Dockerfile
```

**Conteúdo (backend/):**
```dockerignore
node_modules
dist
coverage
.env
.env.local
*.log
.git
.gitignore
README.md
docs
test
```

**Conteúdo (frontend/):**
```dockerignore
node_modules
dist
build
coverage
.env
.env.local
*.log
.git
.gitignore
README.md
docs
```

### 5.3 `.env.example`

**Localização:** Raiz, `backend/` e `frontend/`

**Raiz (`.env.example`):**
```bash
# Database
POSTGRES_USER=quiz_user
POSTGRES_PASSWORD=quiz_password
POSTGRES_DB=quiz_db

# Backend
DATABASE_URL=postgresql://quiz_user:quiz_password@db:5432/quiz_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000

# Frontend
VITE_API_URL=http://localhost:3000
```

**Backend (`backend/.env.example`):**
```bash
# Database
DATABASE_URL=postgresql://quiz_user:quiz_password@localhost:5432/quiz_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server
PORT=3000
NODE_ENV=development

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=5
```

**Frontend (`frontend/.env.example`):**
```bash
# API
VITE_API_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 5.4 `README.md`

**Localização:** Raiz do repositório

**Conteúdo:**
```markdown
# ENEM Lead Quiz

Sistema de quiz para captura de leads com diagnóstico personalizado de preparo para o ENEM.

## 🚀 Tecnologias

- **Backend:** NestJS + Prisma + PostgreSQL
- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui
- **Infraestrutura:** Docker Compose + Node.js 22 LTS

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 22 LTS (para desenvolvimento local)

## 🛠️ Instalação e Execução

### Usando Docker (Recomendado)

1. Clone o repositório:
```bash
git clone <repository-url>
cd enem-lead-quiz
```

2. Copie os arquivos de ambiente:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Suba os containers:
```bash
docker compose up --build
```

4. Acesse a aplicação:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Admin: http://localhost:5173/admin/login

### Desenvolvimento Local

1. Instale as dependências:
```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Configure as variáveis de ambiente (veja `.env.example`)

3. Execute as migrations e seed:
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

4. Inicie os serviços:
```bash
# Backend
cd backend
npm run start:dev

# Frontend (em outro terminal)
cd frontend
npm run dev
```

## 🔐 Credenciais Padrão

**Admin:**
- Email: admin@admin.com
- Senha: admin123

## 📚 Documentação

- [Especificações de Negócio (BDD)](docs/bdd/features.md)
- [Requisitos Técnicos](docs/requirements.md)

## 🧪 Testes

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

## 📦 Estrutura do Projeto

```
enem-lead-quiz/
├── backend/          # API NestJS
├── frontend/         # SPA React + Vite
├── docs/             # Documentação
└── docker-compose.yml
```

## 📝 Licença

Este projeto foi desenvolvido como teste técnico.
```

---

## 6. Fluxo de Implementação Sugerido

1. **Infraestrutura & Arquivos Globais**
   - Arquivos globais (.gitignore, .dockerignore, .env.example, README.md)
   - Docker Compose + Dev Container
   - Prisma Schema + Migrations + Seed

2. **Backend Core**
   - Módulo Quiz (GET /api/quizzes/active)
   - Módulo Scoring (calculator + diagnostics)
   - Módulo Lead (POST /api/leads + duplicate check + payload minimizado)
   - Módulo Auth (JWT + login)
   - Módulo Admin (dashboard metrics + leads list + CSV export)

3. **Frontend Quiz Público (SPA)**
   - Quiz Flow (perguntas + alternativas + estado local)
   - Lead Form (dados pessoais + honeypot)
   - Result Page (exibição com payload minimizado)

4. **Frontend Admin (Nested Layouts)**
   - AdminLayout (Sidebar + Mobile Header + Bottom Nav)
   - Login Page
   - Dashboard (KPIs + gráficos)
   - Leads (tabela + toolbar + modal)

5. **Testes & Refinamento**
   - Testes unitários (scoring, lead service)
   - Testes E2E (fluxos críticos)
   - Responsividade mobile
   - Acessibilidade

---

## 7. Diretrizes de Workflow e Contribuição

### 7.1 Estratégia de Branches (Feature Branch Workflow)

**Regra Fundamental:** Nunca fazer commits diretos na branch principal (`main`).

**Fluxo de Trabalho:**
1. Criar branch específica a partir de `main` para cada funcionalidade
2. Desenvolver e testar na branch de feature
3. Merge para `main` apenas após funcionalidade 100% concluída e testada

**Nomenclatura de Branches:**
```bash
# Infraestrutura
feature/docker-setup
feature/devcontainer-config

# Backend
feature/quiz-backend-api
feature/lead-backend-api
feature/auth-backend-api
feature/admin-backend-api

# Frontend
feature/quiz-frontend-spa
feature/admin-frontend-layout
feature/admin-dashboard
feature/admin-leads

# Testes
feature/e2e-tests-playwright
```

**Exemplo de Fluxo:**
```bash
# Criar branch para Docker setup
git checkout -b feature/docker-setup

# Desenvolver e testar...
git add .
git commit -m "feat: add docker compose with postgres, backend and frontend"

# Merge para main após validação
git checkout main
git merge feature/docker-setup
```

---

### 7.2 Desenvolvimento Guiado por Testes (TDD)

**Backend (Unitários com Vitest):**

Seguir ciclo estrito do TDD:
1. **Red:** Escrever teste que falha
2. **Green:** Implementar código mínimo para passar
3. **Refactor:** Melhorar código mantendo testes passando

**Exemplo - Scoring Calculator:**
```typescript
// 1. RED: Teste falha (implementação não existe)
describe('ScoringCalculator', () => {
  it('should calculate total score correctly', () => {
    const calculator = new ScoringCalculator();
    const answers = [
      { alternativeId: '1', score: 7 },
      { alternativeId: '2', score: 5 },
    ];
    expect(calculator.calculate(answers)).toBe(12);
  });
});

// 2. GREEN: Implementação mínima
export class ScoringCalculator {
  calculate(answers: { score: number }[]): number {
    return answers.reduce((total, a) => total + a.score, 0);
  }
}

// 3. REFACTOR: Melhorias mantendo testes passando
```

**Frontend (Componentes Críticos):**
- Testes de componentes com Vitest + Testing Library
- Foco em lógica de negócio (quiz state, form validation)

---

### 7.3 Validação E2E com Playwright MCP

**Ferramenta:** `playwright-mcp` disponível no ambiente de execução

**Obrigações de Uso:**

1. **Validação de Design/UX:**
   - Capturar telas durante desenvolvimento
   - Inspecionar layout responsivo (desktop/mobile)
   - Verificar componentes visuais

2. **Testes E2E Práticos:**
   - Executar após conclusão de fluxos completos
   - Simular navegação real do usuário

**Fluxos E2E Obrigatórios:**

**Quiz Público:**
```typescript
// playwright/e2e/quiz-flow.spec.ts
test('complete quiz flow', async ({ page }) => {
  await page.goto('/');
  
  // Responder 10 perguntas
  for (let i = 0; i < 10; i++) {
    await page.click('[data-testid="alternative-0"]');
    await page.click('[data-testid="next-button"]');
  }
  
  // Preencher formulário
  await page.fill('[name="name"]', 'João Silva');
  await page.fill('[name="email"]', 'joao@email.com');
  await page.fill('[name="phone"]', '11999999999');
  await page.click('[data-testid="submit-button"]');
  
  // Verificar resultado
  await expect(page.locator('[data-testid="score"]')).toBeVisible();
  await expect(page.locator('[data-testid="diagnostic-title"]')).toBeVisible();
});
```

**Admin - Login e Dashboard:**
```typescript
// playwright/e2e/admin-auth.spec.ts
test('admin login and dashboard', async ({ page }) => {
  await page.goto('/admin/login');
  
  await page.fill('[name="email"]', 'admin@admin.com');
  await page.fill('[name="password"]', 'admin123');
  await page.click('[data-testid="login-button"]');
  
  await expect(page).toHaveURL('/admin/dashboard');
  await expect(page.locator('[data-testid="kpi-total"]')).toBeVisible();
});
```

**Admin - Leads e Filtros:**
```typescript
// playwright/e2e/admin-leads.spec.ts
test('filter leads and export CSV', async ({ page }) => {
  await page.goto('/admin/leads');
  
  // Buscar por nome
  await page.fill('[data-testid="search-input"]', 'João');
  await expect(page.locator('[data-testid="leads-table"]')).toContainText('João');
  
  // Filtrar por faixa
  await page.selectOption('[data-testid="diagnostic-filter"]', 'ON_RIGHT_TRACK');
  
  // Exportar CSV
  await page.click('[data-testid="export-csv-button"]');
  // Verificar download
});
```

---

### 7.4 Animações e Microinterações (Framer Motion)

**Biblioteca:** Framer Motion para transições suaves

**Aplicações Obrigatórias:**

1. **Quiz - Troca de Perguntas:**
```typescript
// frontend/src/components/quiz/question-card.tsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  <motion.div
    key={currentQuestion.id}
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
    transition={{ duration: 0.3 }}
  >
    <QuestionContent question={currentQuestion} />
  </motion.div>
</AnimatePresence>
```

2. **Quiz - Barra de Progresso:**
```typescript
// frontend/src/components/quiz/progress-bar.tsx
<motion.div
  className="h-2 bg-blue-500"
  initial={{ width: 0 }}
  animate={{ width: `${progress}%` }}
  transition={{ duration: 0.5, ease: "easeInOut" }}
/>
```

3. **Quiz - Card de Resultado:**
```typescript
// frontend/src/components/quiz/result-page.tsx
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5 }}
>
  <ResultCard score={score} diagnostic={diagnostic} />
</motion.div>
```

4. **Admin - Modais e Filtros:**
```typescript
// frontend/src/components/admin/lead-details-modal.tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >
        <ModalContent />
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

---

### 7.5 Convenção de Commits (Conventional Commits)

**Formato:**
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, ponto e vírgula, etc (sem mudança de lógica)
- `refactor`: Refatoração de código
- `test`: Adição ou modificação de testes
- `chore`: Tarefas de manutenção (build, CI, dependencies)

**Scopes:**
- `backend`: API NestJS
- `frontend`: SPA React
- `docker`: Configuração Docker
- `quiz`: Módulo de quiz
- `lead`: Módulo de leads
- `auth`: Autenticação
- `admin`: Painel administrativo

**Exemplos:**
```bash
# Nova funcionalidade
git commit -m "feat(backend): add scoring calculator with diagnostic mapping"

# Correção de bug
git commit -m "fix(frontend): resolve quiz progress bar animation"

# Documentação
git commit -m "docs: add BDD specifications and technical requirements"

# Testes
git commit -m "test(backend): add unit tests for lead service duplicate email"

# Refatoração
git commit -m "refactor(frontend): extract admin layout to separate component"

# Chore
git commit -m "chore(docker): update node version to 22 LTS"
```

**Commits Atômicos:**
- Cada commit deve representar uma mudança lógica completa
- Evitar commits com múltiplas mudanças não relacionadas
- Mensagem clara e descritiva

---

## 8. Critérios de Aceite

- [ ] Quiz com 10 perguntas dinâmicas via seed
- [ ] Cálculo de pontuação 0-100 no backend
- [ ] 4 faixas de diagnóstico com mensagens personalizadas
- [ ] Bloqueio de e-mail duplicado (HTTP 409)
- [ ] Honeypot silencioso contra bots
- [ ] Rate limiting nas rotas públicas
- [ ] Dashboard com KPIs e gráficos
- [ ] Leads com tabela, filtros e exportação CSV
- [ ] Modal de detalhes com resumo de respostas
- [ ] Layout responsivo (desktop sidebar / mobile bottom nav)
- [ ] Autenticação JWT stateless
- [ ] Docker Compose funcional (db + backend + frontend)
- [ ] Testes automatizados cobrindo lógica crítica
- [ ] Arquivos globais configurados (.gitignore, .dockerignore, .env.example, README.md)
- [ ] Payload público sem PII (Privacy by Design)
- [ ] SPA com nested layouts (AdminLayout persistente)
