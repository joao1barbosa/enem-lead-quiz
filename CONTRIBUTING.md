# Guia de Contribuição

Este documento estabelece as regras e diretrizes para contribuição no projeto ENEM Lead Quiz.

---

## 📋 Princípios Fundamentais

1. **Qualidade sobre quantidade** - Código bem testado e documentado
2. **Commits atômicos** - Cada commit representa uma mudança lógica completa
3. **Testes primeiro** - TDD para lógica de negócio
4. **Documentação viva** - Documentação atualizada junto com o código
5. **Revisão obrigatória** - Todo código passa por revisão antes do merge

---

## 🌿 Estratégia de Branches (Feature Branch Workflow)

### Regra Fundamental
**NUNCA** fazer commits diretos na branch `main`.

### Fluxo de Trabalho

1. **Criar branch específica** a partir de `main`:
```bash
git checkout main
git pull origin main
git checkout -b feature/nome-da-feature
```

2. **Desenvolver e testar** na branch de feature

3. **Merge para `main`** apenas após:
   - Funcionalidade 100% concluída
   - Todos os testes passando
   - Documentação atualizada
   - Code review aprovado

### Nomenclatura de Branches

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

# Correções
fix/bug-description
hotfix/critical-issue
```

---

## 📝 Convenção de Commits (Conventional Commits)

### Formato

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, ponto e vírgula, etc (sem mudança de lógica)
- `refactor`: Refatoração de código (sem mudar funcionalidade)
- `test`: Adição ou modificação de testes
- `chore`: Tarefas de manutenção (build, CI, dependencies)
- `perf`: Melhorias de performance
- `ci`: Mudanças em CI/CD

### Scopes

- `backend`: API NestJS
- `frontend`: SPA React
- `docker`: Configuração Docker
- `quiz`: Módulo de quiz
- `lead`: Módulo de leads
- `auth`: Autenticação
- `admin`: Painel administrativo
- `db`: Banco de dados / Prisma

### Exemplos

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

---

## 🎯 Commits Atômicos

### Regra de Ouro

**Cada commit deve representar UMA mudança lógica completa e independente.**

### O que EVITAR

❌ **Commits gigantes com múltiplas mudanças não relacionadas:**
```bash
git commit -m "feat: add complete application"  # ❌ RUIM
```

❌ **Commits incompletos que quebram o build:**
```bash
git commit -m "feat: add user service"  # ❌ Se não compila
```

### O que FAZER

✅ **Commits atômicos e significativos:**

```bash
# Infraestrutura
git commit -m "chore: add .gitignore and .dockerignore files"
git commit -m "chore: add .env.example templates"
git commit -m "docs: add README.md with project documentation"

# Backend
git commit -m "feat(backend): initialize NestJS project structure"
git commit -m "feat(backend): add Prisma schema with Question and Alternative models"
git commit -m "feat(backend): add seed script with 10 ENEM questions"
git commit -m "feat(backend): implement scoring calculator service"
git commit -m "test(backend): add unit tests for scoring calculator"

# Frontend
git commit -m "feat(frontend): initialize React + Vite project"
git commit -m "feat(frontend): add Tailwind CSS configuration"
git commit -m "feat(frontend): create quiz flow component"
git commit -m "feat(frontend): add Framer Motion animations"

# Docker
git commit -m "feat(docker): add docker-compose.yml with 3 services"
git commit -m "fix(docker): add openssl to backend Dockerfile for Prisma"
git commit -m "fix(docker): adjust PostgreSQL healthcheck to avoid FATAL logs"
```

### Quando Fazer Commit

1. **Após completar uma unidade lógica de trabalho**
   - Um componente completo
   - Um serviço com testes
   - Uma configuração funcional

2. **Antes de iniciar uma nova tarefa**
   - Não acumular mudanças não relacionadas

3. **Quando o código está em estado funcional**
   - Compila sem erros
   - Testes passam
   - Não quebra funcionalidades existentes

---

## 🧪 Desenvolvimento Guiado por Testes (TDD)

### Backend (Unitários com Vitest)

Seguir ciclo estrito do TDD:

1. **RED**: Escrever teste que falha
```typescript
// Teste falha - implementação não existe
it('should calculate total score correctly', () => {
  const calculator = new ScoringCalculator();
  expect(calculator.calculate([{ score: 7 }, { score: 5 }])).toBe(12);
});
```

2. **GREEN**: Implementar código mínimo para passar
```typescript
export class ScoringCalculator {
  calculate(answers: { score: number }[]): number {
    return answers.reduce((total, a) => total + a.score, 0);
  }
}
```

3. **REFACTOR**: Melhorar código mantendo testes passando
```typescript
// Melhorar legibilidade, performance, etc.
```

### Frontend (Componentes com Testing Library)

- Testar comportamento do usuário, não implementação
- Foco em lógica de negócio (quiz state, form validation)
- Testes de acessibilidade (ARIA labels, keyboard navigation)

### Validação E2E com Playwright MCP

**Obrigatório** para fluxos completos:

1. **Quiz Público**: Responder 10 perguntas → Formulário → Resultado
2. **Admin Login**: Login → Dashboard → Leads
3. **Admin Leads**: Filtrar → Exportar CSV → Ver detalhes

---

## 🎨 Animações e Microinterações (Framer Motion)

### Aplicações Obrigatórias

1. **Quiz - Troca de Perguntas**: Slide/fade entre perguntas
2. **Quiz - Barra de Progresso**: Animação suave de progresso
3. **Quiz - Card de Resultado**: Surgimento suave do diagnóstico
4. **Admin - Modais**: Transição ao abrir/fechar
5. **Admin - Filtros**: Animação ao aplicar filtros

### Exemplo

```typescript
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

---

## 📚 Documentação

### O que Documentar

1. **Decisões de arquitetura** - ADRs (Architecture Decision Records)
2. **APIs** - Endpoints, request/response schemas
3. **Componentes** - Props, uso, exemplos
4. **Fluxos de negócio** - Diagramas, user stories
5. **Setup** - Instruções de instalação e configuração

### Onde Documentar

- **README.md**: Visão geral, setup rápido
- **docs/requirements.md**: Especificações técnicas
- **docs/bdd/features.md**: Histórias de usuário
- **Código**: JSDoc/TSDoc para APIs e componentes
- **Comments**: Apenas quando necessário para explicar "porquê"

---

## 🔍 Code Review

### Checklist de Review

- [ ] Código segue padrões do projeto
- [ ] Testes cobrem a lógica de negócio
- [ ] Documentação atualizada
- [ ] Commits atômicos e significativos
- [ ] Sem código comentado ou debug
- [ ] Performance adequada
- [ ] Acessibilidade considerada
- [ ] Responsividade verificada (frontend)

### Processo

1. **Autor** cria PR com descrição clara
2. **Reviewer** analisa código e testes
3. **Discussão** de melhorias (se necessário)
4. **Aprovação** e merge para `main`

---

## 🚀 Deploy

### Ambiente de Desenvolvimento

```bash
# Subir todos os serviços
docker compose up --build

# Ver logs
docker compose logs -f

# Parar serviços
docker compose down
```

### Ambiente de Produção

- Build otimizado (multi-stage Docker)
- Variáveis de ambiente via secrets
- Health checks em todos os serviços
- Logs centralizados

---

## 📞 Suporte

### Dúvidas?

1. Consultar documentação em `docs/`
2. Verificar issues no repositório
3. Entrar em contato com a equipe

### Bugs?

1. Abrir issue com descrição detalhada
2. Incluir passos para reproduzir
3. Anexar logs e screenshots se aplicável

---

## 📖 Recursos

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow)
- [TDD by Example](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)

---

**Obrigado por contribuir com o ENEM Lead Quiz!** 🎓
