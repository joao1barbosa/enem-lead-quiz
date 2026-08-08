# Animations Polish (Frontend)

## Overview

Transições suaves entre perguntas do quiz público, implementadas com TDD estrito
(Red-Green-Refactor) na branch `feature/quiz-animations-polish`. Atende US-01
(`docs/bdd/features.md`) e a seção 7.4 de `docs/requirements.md` (Framer Motion
obrigatório para troca de perguntas com AnimatePresence).

## Estrutura

```
frontend/src/components/quiz/
├── animation-variants.ts          # NOVO: Variantes de animação reutilizáveis
├── quiz-flow.tsx                  # ATUALIZADO: AnimatePresence + direção
├── question-card.tsx              # ATUALIZADO: Animação de entrada + stagger
└── __tests__/
    ├── animations.test.tsx        # NOVO: 6 testes das variantes
    ├── quiz-flow.test.tsx         # ATUALIZADO: testes de transição (async)
    └── visual.test.tsx            # NOVO: 4 snapshots (regressão visual)
```

## Variantes (`animation-variants.ts`)

- `slideVariants`: estados `enter` / `center` / `exit` como funções de
  `direction` (custom prop):
  - `enter(direction > 0)` → `x: 1000` (entra da direita ao avançar)
  - `enter(direction < 0)` → `x: -1000` (entra da esquerda ao voltar)
  - `exit(direction < 0)` → `x: 1000` (sai para a direita ao voltar)
  - `exit(direction > 0)` → `x: -1000` (sai para a esquerda ao avançar)
- `fadeVariants`: fade + deslocamento vertical para o conteúdo interno
  (`initial: y 20`, `animate: y 0`, `exit: y -20`).
- `slideTransition`: spring compartilhado (`stiffness 300`, `damping 30` para x,
  `duration 0.2` para opacity), centralizado para manter enter/exit em sincronia.

## QuizFlow (`quiz-flow.tsx`)

- `direction` em estado local (`useState(0)`): `handleNext` seta `1`, `handlePrevious`
  seta `-1` antes de chamar o store.
- `AnimatePresence initial={false} custom={direction} mode="wait"` com filho
  `motion.div` chaveado por `currentQuestion.id`, variantes `slideVariants`,
  `initial="enter" animate="center" exit="exit"` e `transition={slideTransition}`.
- `mode="wait"` garante que a pergunta atual permanece montada durante a animação
  de saída; a próxima entra somente após o exit concluir.

## QuestionCard (`question-card.tsx`)

- Container `motion.div` com `fadeVariants` (entrada com fade + `y`).
- Alternativas como `motion.button` com `initial={{ opacity: 0, x: -20 }}`,
  `animate={{ opacity: 1, x: 0 }}` e `transition={{ delay: index * 0.1 }}` —
  aparecem em sequência (stagger).
- `whileTap={{ scale: 0.98 }}` mantido para feedback de toque.

## Testes

- `npm run test` — 39 testes, 7 arquivos (`vitest run`).
  - `animations.test.tsx`: direção do slide (positiva/negativa), centro, fade.
  - `quiz-flow.test.tsx`: transição assíncrona (question permanece durante exit,
    próxima aparece após completar, navegação voltar preserva seleção).
  - `visual.test.tsx`: snapshots de QuizFlow, QuestionCard (com/sem seleção) e
    ProgressBar capturam os estilos animados iniciais (opacity/transform).

## Próximos passos

1. Aplicar AnimatePresence em `result-page.tsx` e modais do admin (seção 7.4).
2. Substituir `mockQuiz` por `GET /api/quizzes/active` (TanStack Query).
3. Playwright MCP E2E para o fluxo completo do quiz (10 perguntas).
