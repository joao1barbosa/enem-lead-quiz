# Progress & Validation (Frontend)

## Overview

Barra de progresso animada e validação de seleção do quiz público, implementados
com TDD estrito (Red-Green-Refactor) na branch `feature/quiz-progress-validation`.
Cobrem os cenários de US-01 (`docs/bdd/features.md`): barra de progresso indicando
a posição atual e impossibilidade de avançar sem selecionar uma alternativa.

## Estrutura

```
frontend/src/components/quiz/
├── progress-bar.tsx                  # NOVO: Barra de progresso animada
└── __tests__/
    ├── progress-bar.test.tsx         # NOVO: 5 testes (render/porcentagem/edge cases)
    ├── quiz-flow.test.tsx            # ATUALIZADO: +4 testes de validação de navegação
    └── question-card.test.tsx        # mantido: 4 testes de feedback de seleção
```

## ProgressBar (`progress-bar.tsx`)

Props: `current: number`, `total: number`.

- Exibe `Pergunta {current} de {total}` com `text-muted-foreground`.
- Container com `role="progressbar"` e atributos ARIA:
  - `aria-valuenow` = porcentagem (0-100)
  - `aria-valuemin` = 0, `aria-valuemax` = 100
- Percentual calculado por `getProgressPercentage(current, total)`:
  `Math.round((current / total) * 100)` — arredondado para evitar artefatos de
  ponto flutuante (ex.: 1/3 * 100 = 33.333...).
- Framer Motion: preenchimento anima de `width: 0` até o percentual com
  `transition={{ duration: 0.5, ease: 'easeInOut' }}` (RNF-01 de animações,
  `docs/requirements.md` §7.4).

## Integração (`quiz-flow.tsx`)

- Substituiu o texto estático `Pergunta X de Y` pelo componente:
  `<ProgressBar current={currentQuestionIndex + 1} total={quiz.questions.length} />`.
- A barra é atualizada automaticamente a cada navegação (avançar/voltar) porque
  o índice corrente vem do store Zustand.

## Validação de seleção

- `Próxima` fica **desabilitada** enquanto nenhuma alternativa estiver selecionada
  (`disabled={isLastQuestion || !selectedAnswer}`).
- `Anterior` fica **desabilitada** na primeira pergunta
  (`disabled={isFirstQuestion}`).
- Feedback visual ao selecionar: alternativa selecionada recebe
  `border-primary bg-primary text-primary-foreground` e `whileTap={{ scale: 0.98 }}`
  (Framer Motion) no `QuestionCard`.

## Testes

- `npm run test` — 28 testes, 5 arquivos (`vitest run`).
  - `progress-bar.test.tsx`: render do texto, atributos ARIA, porcentagem
    (3/10 → 30, 5/10 → 50) e edge cases (primeira → 10, última → 100).
  - `quiz-flow.test.tsx`: +4 testes de validação — botão "Próxima" desabilitado
    sem seleção / habilitado com seleção; "Anterior" desabilitado na primeira
    pergunta / habilitado após avançar.

## Próximos passos

1. Transição entre perguntas com `AnimatePresence mode="wait"` (slide/fade).
2. `lead-form.tsx` (etapa `stage === 'form'`) — US-02.
3. Substituir `mockQuiz` por `GET /api/quizzes/active` (TanStack Query).
