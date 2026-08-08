# Lead Form & Honeypot (Frontend)

## Overview

Captura de dados do lead (US-02) com validação client-side e proteção
anti-bot via honeypot (RNF-01), implementada com TDD estrito (Red-Green-Refactor)
na branch `feature/quiz-lead-form`.

O formulário é exibido após a última pergunta do quiz. Os dados ficam no store
Zustand (`leadData`) e o POST para a API será integrado no Ticket #6
(`POST /api/leads`, RF-03).

## Estrutura

```
frontend/src/
├── components/quiz/
│   ├── lead-form.tsx                    # NOVO: Formulário com RHF + Zod + honeypot
│   ├── quiz-flow.tsx                    # ATUALIZADO: transição quiz → form
│   └── __tests__/
│       ├── lead-form.test.tsx           # NOVO: 7 testes (validação + honeypot)
│       └── quiz-flow.test.tsx           # ATUALIZADO: +2 testes de transição
├── stores/quiz-store.ts                 # ATUALIZADO: leadData + setLeadData
├── stores/__tests__/quiz-store.test.ts  # ATUALIZADO: +2 testes de store
└── types/quiz.ts                        # ATUALIZADO: LeadData
```

## Store (`stores/quiz-store.ts`, `types/quiz.ts`)

- `LeadData { name; email; phone }`.
- `QuizState.leadData: LeadData | null` (inicial: `null`).
- `QuizActions.setLeadData(data)` persiste no store; `reset` restaura `null`.

## LeadForm (`components/quiz/lead-form.tsx`)

- React Hook Form + `zodResolver` + schema Zod:
  - `name`: `min(1)` → "Nome é obrigatório"
  - `email`: `.email()` → "Email inválido"
  - `phone`: regex `/^\d{10,11}$/` → "Telefone inválido (10-11 dígitos)"
- `<form noValidate>`: desabilita a validação nativa do browser para que as
  mensagens customizadas do Zod sempre apareçam.
- Campo honeypot invisível (`data-testid="honeypot-field"`, posicionado em
  `left: -9999px`, `tabIndex=-1`, `autoComplete="off"`, `aria-hidden`).
  Se preenchido, `handleFormSubmit` retorna silenciosamente (RNF-01) sem chamar
  `onSubmit` — o bot é descartado e o servidor vê um submit como se fosse vazio.
- Botão "Ver Resultado" com `disabled={isSubmitting}`.

## Integração (`quiz-flow.tsx`)

- `stage === 'form'` renderiza "Quase lá!" + LeadForm em vez do quiz.
- `handleNext` na última pergunta chama `setStage('form')` (não navega).
- Botão da última pergunta vira "Ver Resultado"; `disabled={!selectedAnswer}`.
- `onSubmit` do LeadForm: `setLeadData(data)` + `setStage('result')`
  (o POST real é responsabilidade do Ticket #6).

## Testes

- `npm run test` — 49 testes, 8 arquivos (`vitest run`).
  - `lead-form.test.tsx` (7): render dos campos, erro de nome vazio, email
    inválido, telefone inválido, submit válido, honeypot presente com estilo
    oculto, e onSubmit não chamado quando o honeypot está preenchido.
  - `quiz-flow.test.tsx` (11): +2 — form aparece após responder a última
    pergunta; submit grava `leadData` e muda para `stage === 'result'`.
  - `quiz-store.test.ts` (11): +2 — `setLeadData` persiste; `reset` zera.

## Próximos passos

1. `POST /api/leads` (Ticket #6) — envio do `leadData` + score calculado.
2. `result-page.tsx` (US-03) para `stage === 'result'`.
3. E2E Playwright do fluxo completo (10 perguntas → form → resultado).
