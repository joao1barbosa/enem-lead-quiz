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
