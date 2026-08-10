# 🎯 ENEM Lead Quiz

> Um funil de captura de leads gamificado que diagnostica o nível de preparo do estudante para o ENEM através de um quiz interativo, gerando leads qualificados com pontuação e faixa diagnóstica para uma equipe de vendas.

## 📋 Visão Geral

Solução completa de um desafio técnico full-stack. A aplicação permite que estudantes respondam um quiz de 10 perguntas sobre seus hábitos de estudo, recebam um diagnóstico personalizado com pontuação e faixa de preparo, e tenham seus dados capturados como leads qualificados para uma equipe comercial.

- **Tela de introdução** apresentando o quiz com botão para começar
- **Quiz interativo** com 10 perguntas, barra de progresso e navegação entre questões
- **Formulário de captura** com validação, máscara de telefone e campo honeypot anti-bot
- **Página de resultado** com score circular colorido por faixa diagnóstica e respostas opcionais
- **Painel administrativo** protegido por autenticação JWT com dashboard, tabela de leads e exportação CSV
- **Diagnóstico automatizado** em 4 faixas: Ponto de Partida, Em Construção, Na Trilha Certa e Reta Final
- **Rate limiting** para proteger a API contra abuso
- **Testes abrangentes**: unitários, de integração e E2E com Playwright

##  Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | TypeScript, React 18, React Router DOM, React Query, Zustand, React Hook Form, Zod, Tailwind CSS, shadcn/ui, Recharts, Framer Motion |
| **Backend** | TypeScript, NestJS, Prisma ORM, Passport JWT, bcrypt, class-validator |
| **Banco de Dados** | PostgreSQL 16 |
| **Testes** | Vitest, Testing Library, Playwright |
| **Runtime** | Docker / Docker Compose |
| **Deploy** | Vercel (frontend) + Render (backend + banco) |

## 🌐 Deploy em Produção

- **Quiz**: https://enem-lead-quiz.vercel.app/
- **Admin**: https://enem-lead-quiz.vercel.app/admin/login

## 🏗 Arquitetura

Aplicação full-stack com separação clara entre frontend e backend, comunicando via API REST:

```
┌─────────────────────┐     ┌──────────────────────┐     ┌───────────────────┐
│  Vercel (Frontend)  │────▶│  Render (Backend)    │────▶│  Render (Postgres)│
│  React + Vite       │HTTPS│  NestJS API          │     │  Managed DB       │
│  CDN global         │     │  Port 10000          │     │                   │
└─────────────────────┘     └──────────────────────┘     └───────────────────┘
```

**Frontend:** SPA React com React Router para navegação, React Query para gerenciamento de estado servidor, Zustand para estado local do quiz, e shadcn/ui para componentes visuais consistentes.

**Backend:** API NestJS com arquitetura modular (AuthModule, QuizModule, LeadModule, AdminModule), Prisma ORM para acesso ao banco, e Passport JWT para autenticação.

**Banco:** PostgreSQL com schema normalizado (questions, alternatives, leads, answers, admins) e migrations versionadas via Prisma.

## 🧠 Decisões Técnicas Importantes

### 1. Autenticação JWT com Refresh Token

**Decisão:** Implementar autenticação via JWT Bearer token com senha hasheada em bcrypt.

**Motivo:** Stateless, escalável, padrão da indústria para APIs REST. O token é armazenado no localStorage do frontend e enviado no header `Authorization` de cada requisição protegida.

**Trade-off:** Tokens JWT não podem ser invalidados individualmente sem blacklist (não implementado — aceitável para este escopo).

### 2. Campo Honeypot Anti-Bot

**Decisão:** Adicionar campo `website` invisível no formulário de lead que deve permanecer vazio.

**Motivo:** Bots automáticos preenchem todos os campos visíveis. Se o honeypot estiver preenchido, o backend rejeita a submissão silenciosamente (retorna 201 mas não salva).

**Trade-off:** Proteção básica contra bots simples. Para produção, complementar com CAPTCHA ou análise de comportamento.

### 3. Rate Limiting com Throttler

**Decisão:** Usar `@nestjs/throttler` para limitar requisições a 5 por minuto por IP.

**Motivo:** Proteger a API contra abuso, brute force no login, e submissão em massa de leads falsos.

**Trade-off:** Limite fixo por IP pode afetar usuários atrás de NAT compartilhado. Para produção, considerar limite por usuário autenticado.


##  API Reference

### Público

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Health check |
| GET | `/api/quiz` | Obter perguntas do quiz |
| POST | `/api/leads` | Submeter lead com respostas |

### Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Autenticar admin (form-urlencoded) |

### Protegidas (Bearer token)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/admin/leads` | Listar leads (paginação, filtros, busca) |
| GET | `/api/admin/leads/:id` | Detalhes de um lead |
| GET | `/api/admin/leads/export` | Exportar leads em CSV |
| GET | `/api/admin/dashboard` | KPIs e dados para gráficos |

## 📐 Regras de Negócio

- **RB-01:** Quiz tem exatamente 10 perguntas
- **RB-02:** Cada alternativa tem score de 0 a 10
- **RB-03:** Score total é soma dos scores das respostas (0-100)
- **RB-04:** Faixa diagnóstica é determinada pelo score: 0-25 (Ponto de Partida), 26-50 (Em Construção), 51-75 (Na Trilha Certa), 76-100 (Reta Final)
- **RB-05:** Formulário exige nome, email válido e telefone com 11 dígitos
- **RB-06:** Honeypot deve estar vazio para submissão válida
- **RB-07:** Rate limit de 5 requisições por minuto por IP
- **RB-08:** Admin requer autenticação JWT para acessar rotas protegidas

## 🧪 Testes

Suite abrangente com 178 testes unitários e 38 testes E2E:

```bash
# Testes unitários (frontend)
cd frontend && npm test

# Testes E2E (desktop)
cd frontend && npm run test:e2e -- --project=chromium

# Testes E2E (mobile)
cd frontend && npm run test:e2e -- --project="Mobile Chrome"
```

**Cobertura:**
- Componentes React (quiz, admin, UI)
- Hooks customizados (use-leads, use-auth, quiz-store)
- Rotas e redirecionamentos
- Fluxos E2E completos (quiz, login, dashboard, leads, mobile)

## 🔧 Como Rodar Localmente

**Pré-requisitos:** Docker + Docker Compose

```bash
# Clonar repositório
git clone https://github.com/joao1barbosa/enem-lead-quiz.git
cd enem-lead-quiz

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com valores reais (especialmente JWT_SECRET)

# Subir containers
docker compose up -d --build

# Acessar aplicação
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

### Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `POSTGRES_USER` | sim | Usuário do banco (default: `quiz_user`) |
| `POSTGRES_PASSWORD` | sim | Senha do banco |
| `POSTGRES_DB` | sim | Nome do banco (default: `quiz_db`) |
| `DATABASE_URL` | sim | URL de conexão PostgreSQL |
| `JWT_SECRET` | sim | Segredo para assinar JWT (mínimo 32 bytes) |
| `PORT` | não | Porta do backend (default: `3000`) |
| `NODE_ENV` | não | Ambiente (default: `production`) |
| `THROTTLE_TTL` | não | Janela do rate limit em segundos (default: `60`) |
| `THROTTLE_LIMIT` | não | Requisições por janela (default: `5`) |
| `VITE_API_URL` | sim | URL do backend para o frontend |

## 📈 Melhorias Futuras

| Melhoria | Motivo |
|----------|--------|
| CI/CD com GitHub Actions | Rodar testes automaticamente em cada push |
| Blacklist de JWT | Invalidar tokens individualmente (logout forçado) |
| CAPTCHA no formulário | Proteção mais robusta contra bots |
| Rate limit por usuário autenticado | Proteção mais granular no admin |
| Cache de queries frequentes | Performance do dashboard com muitos leads |
| Webhooks para novos leads | Integração com CRM em tempo real |
| Exportação agendada de relatórios | Automação para equipe comercial |
| Testes de carga | Validar performance sob tráfego real |

## 🤖 Processo de Engenharia

Projeto desenvolvido com **TDD rigoroso** e commits atômicos. Cada funcionalidade foi implementada seguindo o ciclo red-green-refactor:

1. **Especificação:** Requisitos do desafio técnico documentados
2. **Testes falhando:** Testes unitários e E2E escritos antes da implementação
3. **Implementação:** Código mínimo para passar nos testes
4. **Refatoração:** Melhorias sem quebrar testes
5. **Validação:** Testes E2E com Playwright para fluxos críticos

**Uso de IA:** Assistente de codificação usado para acelerar implementação de decisões já tomadas (boilerplate, sintaxe, scaffolding). Todas as sugestões foram revisadas antes de aplicar. Decisões arquiteturais, regras de negócio e estratégia de testes foram humanas.

| Área | Humano | IA |
|------|--------|-----|
| Requisitos e regras de negócio | ✅ | ❌ |
| Arquitetura (modularidade, JWT, honeypot) | ✅ | ❌ |
| Estratégia de testes (TDD, E2E) | ✅ | ❌ |
| Design de UI/UX (shadcn, responsividade) | ✅ | ❌ |
| Implementação contra testes vermelhos | ❌ | ✅ |
| Boilerplate e scaffolding | ❌ | ✅ |

## 👤 Autor

**João Barbosa** — Software Engineer (backend / platform).
[LinkedIn](https://www.linkedin.com/in/joao1barbosa/) · [GitHub](https://github.com/joao1barbosa)
