# ADR-001: Migração para shadcn/ui

## Status
Aceito

## Contexto
O projeto ENEM Lead Quiz foi desenvolvido com componentes HTML nativos e estilização Tailwind CSS direta. Embora funcional, essa abordagem apresenta:
- Inconsistência de tokens (quiz usa semânticos, admin usa paleta crua)
- Componentes manuais sem acessibilidade (modais sem focus-trap, popovers sem navegação por teclado)
- Padrões Tailwind repetidos (14 arquivos com `rounded-lg border`)
- Dificuldade para adicionar dark mode no futuro

O documento de requisitos (`docs/requirements.md`) já especificava shadcn/ui como biblioteca de componentes, mas a implementação priorizou funcionalidade sobre polish de UI.

## Decisão
Migrar o frontend para shadcn/ui de forma incremental, seguindo esta estratégia:

1. **Escopo:** Incremental por página (admin primeiro, depois quiz)
2. **Inicialização:** Automática via `npx shadcn@latest init`
3. **Tokens:** Semânticos do shadcn (primary, secondary, muted, etc.)
4. **Mapeamento de cores:** Direto (blue-600 → primary, gray-50/100 → muted, red-600 → destructive)
5. **Componentes (admin):** button, input, label, card, table, dialog, dropdown-menu, avatar, select, progress
6. **Ordem de substituição:** Por complexidade (kpi-card → toolbar → table → modal → mobile-header)
7. **Testes:** Manter data-testid atuais (foco na migração UI)
8. **Mobile-header:** DropdownMenu (caso clássico de menu de usuário)

## Consequências

### Positivas
- Consistência visual entre admin e quiz
- Acessibilidade nativa (focus-trap, navegação por teclado, ARIA)
- Dark mode trivial de adicionar no futuro
- Alinhamento com ecossistema React moderno
- Redução de código customizado (menos manutenção)

### Negativas
- Trabalho de migração (estimativa: 2-3 dias para admin, 1-2 dias para quiz)
- Período de coexistência de dois estilos durante a migração
- Necessidade de atualizar testes se data-testid forem removidos no futuro

### Riscos Mitigados
- **Risco:** Quebrar funcionalidade existente → **Mitigação:** Migração incremental com testes após cada componente
- **Risco:** Perder identidade visual → **Mitigação:** Mapeamento direto de cores mantém paleta atual
- **Risco:** Overhead de contexto → **Mitigação:** Abordagem incremental mantém smart zone

## Referências
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)
