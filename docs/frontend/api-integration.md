# API Integration & Result (Frontend)

## Overview

Integração do frontend com o backend (RF-01, RF-03) e página de resultado
(US-03), implementada com TDD estrito (Red-Green-Refactor) na branch
`feature/quiz-api-integration`.

O quiz agora é buscado de `GET /api/quizzes/active` (substituindo o mock
hardcoded do `App.tsx`), o lead é enviado por `POST /api/leads` com as respostas
do usuário e o resultado completo (score + faixa + mensagem + resumo) é exibido
com animação de entrada.

## Estrutura

```
frontend/src/
├── lib/
│   └── api.ts                     # NOVO: instância Axios (baseURL VITE_API_URL)
├── providers/
│   └── query-provider.tsx         # NOVO: QueryClientProvider global
├── hooks/
│   ├── use-quiz.ts                # NOVO: GET /api/quizzes/active (React Query)
│   ├── use-submit-lead.ts         # NOVO: POST /api/leads (mutation)
│   └── __tests__/
│       ├── use-quiz.test.tsx      # NOVO: 2 testes
│       └── use-submit-lead.test.tsx # NOVO: 2 testes (inclui 409)
├── components/quiz/
│   ├── result-page.tsx            # NOVO: página de resultado (Framer Motion)
│   ├── quiz-flow.tsx              # ATUALIZADO: fetch + submit + loading/error
│   ├── lead-form.tsx              # ATUALIZADO: prop isSubmitting
│   └── __tests__/
│       ├── result-page.test.tsx   # NOVO: 4 testes
│       └── quiz-flow.test.tsx     # ATUALIZADO: mocks de hooks + integração
├── stores/quiz-store.ts           # ATUALIZADO: result + setResult
└── types/quiz.ts                  # ATUALIZADO: LeadResult + result
```

## Hooks

### `useQuiz` (`hooks/use-quiz.ts`)

- `useQuery(['quiz','active'])` chamando `GET /api/quizzes/active`.
- Retorna `{ ...query, data: query.data?.quiz }` (desembrulha o `quiz`).
- `refetchOnWindowFocus: false` e `retry: 1` configurados no provider.

### `useSubmitLead` (`hooks/use-submit-lead.ts`)

- `useMutation<LeadResult, Error, SubmitLeadData>` chamando `POST /api/leads`.
- Payload: `{ name, email, phone, answers: [{questionId, alternativeId}] }`.
- Erros HTTP (ex.: 409 email duplicado) propagam como exceção da mutation.

## QuizFlow (integração)

- `useEffect` sincroniza `fetchedQuiz` → `setQuiz` no store.
- **Loading**: enquanto `isLoading`, tela centralizada "Carregando quiz...".
- **Erro de fetch**: tela "Erro / Não foi possível carregar o quiz".
- **Form**: `handleFormSubmit` monta `answers` a partir de `selectedAnswers` e
  chama `submitLead.mutateAsync`. Sucesso → `setResult` + `setStage('result')`.
  Erro → mensagem inline.
- **Result**: `stage === 'result' && result` renderiza `<ResultPage>`.
- `LeadForm` ganhou a prop `isSubmitting` (ligada a `submitLead.isPending`).

## Tratamento de erro 409 (RF-04)

- No catch da mutation, verifica `err.response.status === 409`.
- Exibe "Este e-mail já realizou o quiz. Use um e-mail diferente." (inline,
  no lugar de `alert`, para manter o fluxo sem interrupção e testável).
- Mantém `stage === 'form'` para o usuário tentar outro e-mail.

## ResultPage (`components/quiz/result-page.tsx`)

- Animação de entrada com Framer Motion: `opacity 0 → 1`, `scale 0.9 → 1`
  (requirements.md §7.4).
- Score em destaque, `diagnosticTitle`, `diagnosticMessage` e lista de
  `answersSummary` ("Sua resposta: ...").

## Testes

- `npm run test` — 61 testes, 11 arquivos (`vitest run`).
  - hooks: fetch OK, fetch error, submit OK (payload exato), 409 detectado.
  - `result-page.test.tsx`: score, título, mensagem, resumo.
  - `quiz-flow.test.tsx`: mocks de hooks via `vi.hoisted`; form envia answers
    corretas; stage → result; ResultPage renderiza; 409 mostra mensagem;
    loading e error states.
  - `quiz-store.test.ts`: `setResult` + reset zera result.
- Nota: os hooks são mockados nos testes de QuizFlow (a cobertura real dos
  hooks fica nos próprios testes de hook e no `App.test.tsx`).

## Próximos passos

1. Botão "Refazer quiz" (`reset()`) na ResultPage.
2. Tratar `429` do throttler (RNF-02) com mensagem amigável.
3. E2E Playwright do fluxo completo contra o backend real.
