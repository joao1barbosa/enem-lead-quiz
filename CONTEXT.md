# Context: Refatoração shadcn/ui

## Objetivo
Refatorar o frontend para usar shadcn/ui como biblioteca de componentes base, substituindo componentes customizados e HTML nativo.

## Estado Atual (mapeado)
- shadcn/ui **não inicializado** (sem `components.json`, sem `@radix-ui`)
- Tailwind configurado com tokens parcialmente compatíveis (`primary/secondary/accent/muted/card/border/background/foreground`)
- Faltam tokens: `radius`, `ring`, `destructive`, `input`, `popover`, `sidebar`
- Sem helper `cn()`/clsx/tailwind-merge

## Componentes Customizados Existentes
**Quiz (público):**
- `progress-bar.tsx` → Progress
- `question-card.tsx` → Card + Button
- `lead-form.tsx` → Form + Input + Label + Button
- `result-page.tsx` → Card
- `quiz-flow.tsx` → Button

**Admin:**
- `sidebar.tsx` → manter (simples)
- `mobile-header.tsx` → DropdownMenu/Popover + Avatar
- `bottom-nav.tsx` → manter (sem equivalente)
- `leads-toolbar.tsx` → Input + Select + Button
- `leads-table.tsx` → Table
- `lead-details-modal.tsx` → Dialog
- `kpi-card.tsx` → Card
- `leads-area-chart.tsx` → Card wrapper
- `diagnostic-donut.tsx` → Card wrapper

## Dependências UI Já Instaladas
- lucide-react ^0.428.0 (ícones)
- recharts ^2.12.7 (gráficos)
- framer-motion ^11.3.19 (animações)
- react-hook-form + @hookform/resolvers + zod (forms)

## Problemas Identificados
- Inconsistência de tokens: quiz usa semânticos, admin usa paleta crua
- Modais/popovers manuais sem a11y (focus-trap, ESC, role=dialog)
- Padrões Tailwind repetidos (14 arquivos com `rounded-lg border`)
- Testes usam `data-testid` que precisam ser preservados

## Decisões Tomadas
- **Escopo:** Incremental por página
- **Ordem:** Admin primeiro, depois quiz
- **Tokens:** Semânticos do shadcn (primary, secondary, muted, etc.)
- **Inicialização:** Automática via `npx shadcn@latest init`
- **Componentes (admin):** button, input, label, card, table, dialog, dropdown-menu, avatar, select, progress
- **Mapeamento de cores:** Direto (blue-600 → primary, gray-50/100 → muted, red-600 → destructive)
- **Ordem de substituição:** Por complexidade (kpi-card → toolbar → table → modal → mobile-header)
- **data-testid:** Manter atuais (foco na migração UI)
- **Mobile-header:** DropdownMenu (caso clássico de menu de usuário)

## Próximos Passos
1. `npx shadcn@latest init` (configuração automática)
2. `npx shadcn@latest add button input label card table dialog dropdown-menu avatar select progress`
3. Refatorar componentes admin na ordem definida
4. Validar testes após cada componente
5. Repetir para quiz

## Glossário de Termos Resolvidos

**Viewport mobile**: Viewport com largura < 768px (breakpoint `md:` do Tailwind). Detectado via `window.matchMedia('(max-width: 767px)')` no hook `useIsMobile()`.

**Paginação responsiva**: Comportamento da tabela de leads que ajusta o número de registros por página baseado no viewport — 5 no mobile, 10 no desktop. Implementada no hook `use-leads.ts`.

**Colunas essenciais (mobile)**: Nome e Faixa de Diagnóstico. Demais colunas (Email, Telefone, Score, Data) são ocultas no mobile e acessíveis via modal de detalhes.
