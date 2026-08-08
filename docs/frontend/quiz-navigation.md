# Quiz Navigation (Frontend)

## Overview

Núcleo de navegação do quiz público, implementado com TDD estrito (Red-Green-Refactor)
na branch `feature/quiz-frontend-spa`. O usuário responde as 10 perguntas do ENEM,
podendo avançar (`Próxima`) e voltar (`Anterior`) livremente; as respostas já
selecionadas são preservadas ao navegar entre perguntas.

Estado do quiz é gerenciado por **Zustand** (sem recarregamentos), conforme RF-01
do `docs/requirements.md`.

## Estrutura

```
frontend/src/
├── types/quiz.ts                              # Tipos compartilhados
├── stores/
│   ├── quiz-store.ts                          # Store Zustand
│   └── __tests__/quiz-store.test.ts           # 9 testes (store)
├── components/quiz/
│   ├── quiz-flow.tsx                          # Fluxo principal (raiz do quiz)
│   ├── question-card.tsx                      # Card de pergunta + alternativas
│   └── __tests__/
│       ├── quiz-flow.test.tsx                 # 4 testes (navegação)
│       └── question-card.test.tsx             # 4 testes (render/click/selected)
└── App.tsx                                    # Integração (rotas + mock)
```

## Store (`stores/quiz-store.ts`)

Criada com `create<QuizStore>((set) => ...)`. O estado inicial é extraído para a
constante `initialQuizState` (fonte única de verdade), reutilizada em `reset()`.

| Ação | Comportamento |
| --- | --- |
| `setQuiz(quiz)` | Armazena o quiz recebido. |
| `selectAnswer(questionId, alternativeId)` | Grava/atualiza a resposta da pergunta (spread imutável). |
| `nextQuestion()` | Incrementa o índice; nunca ultrapassa `questions.length - 1`; no-op sem quiz. |
| `previousQuestion()` | Decrementa o índice; nunca fica abaixo de 0. |
| `setStage(stage)` | Alterna entre `'quiz' | 'form' | 'result'`. |
| `reset()` | Restaura `quiz=null`, `currentQuestionIndex=0`, `selectedAnswers={}`, `stage='quiz'`. |

## Componentes

### `quiz-flow.tsx`

- Renderiza `Carregando...` quando `quiz` é nulo.
- Mostra `Pergunta X de Y` e o `QuestionCard` da pergunta corrente.
- `Anterior` desabilitado na primeira pergunta
  (`rounded-lg bg-secondary px-6 py-2 text-secondary-foreground disabled:opacity-50`).
- `Próxima` desabilitada na última pergunta **ou** sem resposta selecionada
  (`rounded-lg bg-primary px-6 py-2 text-primary-foreground disabled:opacity-50`).
- Container: `mx-auto max-w-2xl space-y-8 p-6`.

### `question-card.tsx`

- Props: `question`, `selectedAnswer: string | null`, `onSelectAnswer`.
- `<h2 className="text-2xl font-semibold">` com o texto da pergunta.
- Botões de alternativa em largura total
  (`w-full rounded-lg border-2 p-4 text-left transition-colors`):
  selecionada → `border-primary bg-primary text-primary-foreground`;
  não selecionada → `border-border hover:border-primary`.

## Integração (`App.tsx`)

`QuizPage` seleciona `setQuiz` do store e, via `useEffect`, injeta o `mockQuiz`
(10 perguntas estilo ENEM, `id: 'active-quiz'`) — placeholder até a integração com
`GET /api/quizzes/active` (ver `docs/api/quiz.md`). Rotas `/` e `*` → `QuizPage`.

## Testes

- `npm run test` — 19 testes, 4 arquivos (`vitest run`).
- O fluxo de teste do QuizFlow depende do store compartilhado: o `beforeEach`
  chama `useQuizStore.getState().reset()` + `setQuiz(mockQuiz)`.
- Nota: o caminho do store importado pelo teste de fluxo é `../../../stores/quiz-store`
  (três níveis acima de `__tests__/`).

## Próximos passos

1. Substituir o `mockQuiz` por fetch de `GET /api/quizzes/active` (TanStack Query).
2. `lead-form.tsx` (etapa `stage === 'form'`) — US-02.
3. `result-page.tsx` (etapa `stage === 'result'`) — US-03.
4. Transições com Framer Motion (obrigatório para troca de perguntas/progresso).
5. Barra de progresso (`Pergunta X de Y` → componente visual).
