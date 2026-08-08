# Quiz Module — API Documentation

Módulo responsável por expor o quiz público para o frontend (SPA).

## Endpoints

### `GET /api/quizzes/active`

Retorna o quiz ativo com exatamente **10 perguntas** (quando o seed está completo), ordenadas pelo campo `order`, incluindo suas alternativas.

**Regras aplicadas:**

- Apenas perguntas com `isActive = true` são consideradas.
- As perguntas são ordenadas por `order` (ascendente).
- Máximo de 10 perguntas retornadas (`take`).
- O campo `score` das alternativas **não** é retornado (privacidade da lógica de pontuação).
- A resposta é embrulhada em `{ quiz: { id, questions } }`.

**Rate limiting:** a rota é protegida pelo throttler global (limite padrão `THROTTLE_LIMIT` por `THROTTLE_TTL`). Excesso de requisições retorna `429 Too Many Requests`.

**Response — `200 OK`:**

```json
{
  "quiz": {
    "id": "active-quiz",
    "questions": [
      {
        "id": "1b0c2f3e-...",
        "order": 1,
        "text": "Em uma progressão aritmética...",
        "alternatives": [
          { "id": "aa1b2c3d-...", "text": "32" },
          { "id": "bb2c3d4e-...", "text": "35" }
        ]
      }
    ]
  }
}
```

**Response — `429 Too Many Requests`:**

```json
{
  "statusCode": 429,
  "message": "Muitas requisições. Tente novamente em breve.",
  "error": "Too Many Requests"
}
```

## Estrutura de Arquivos

```
backend/src/modules/quiz/
├── quiz.module.ts          # Registro do módulo (controllers + providers)
├── quiz.controller.ts      # GET /api/quizzes/active
├── quiz.service.ts         # Regras de negócio (filtro, ordenação, privacidade)
├── dto/
│   └── quiz-response.dto.ts # Contratos de resposta pública
└── __tests__/
    ├── quiz.service.spec.ts   # Testes unitários do serviço
    └── quiz.controller.spec.ts # Testes unitários do controller
```

## Modelo de Dados (Prisma)

O campo `isActive` foi adicionado à tabela `Question` para suportar o filtro de quiz ativo:

```prisma
model Question {
  id           String        @id @default(uuid())
  order        Int           @unique
  text         String
  isActive     Boolean       @default(true)
  alternatives Alternative[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}
```
