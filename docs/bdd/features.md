# Especificações de Negócio (BDD)

Este documento contém as histórias de usuário e cenários de comportamento da aplicação, escritos sob a ótica dos atores (Estudante e Admin/Gestor), sem detalhes técnicos de implementação.

---

## Comportamento da Aplicação (SPA)

**Importante:** Toda a aplicação funciona como uma **Single Page Application (SPA)**, proporcionando uma experiência fluida sem recarregamentos de página:

- **Quiz Público:** O estudante navega pelas perguntas, preenche o formulário e vê o resultado em um fluxo contínuo, sem que a página seja recarregada.
- **Painel Administrativo:** A estrutura de navegação (sidebar no desktop, header e barra inferior no mobile) permanece fixa enquanto o conteúdo interno é alternado dinamicamente entre as telas de Dashboard e Leads.

---

## Épico 1: Quiz Público & Captura de Leads

### US-01: Navegar pelo Quiz

**Como** estudante  
**Quero** responder a um quiz com 10 perguntas  
**Para** descobrir meu nível de preparo para o ENEM

#### Cenário: Visualizar perguntas do quiz
```gherkin
Dado que acesso a página do quiz
Quando a página é carregada
Então vejo as 10 perguntas do quiz com suas alternativas
E vejo uma barra de progresso indicando minha posição atual
```

#### Cenário: Avançar entre perguntas
```gherkin
Dado que estou na pergunta número 3 do quiz
Quando seleciono uma alternativa
E clico no botão "Próxima"
Então avanço para a pergunta número 4
E a barra de progresso é atualizada
```

#### Cenário: Voltar para pergunta anterior
```gherkin
Dado que estou na pergunta número 5 do quiz
Quando clico no botão "Anterior"
Então retorno para a pergunta número 4
E vejo minha resposta anterior selecionada
```

---

### US-02: Submeter Formulário e Receber Resultado

**Como** estudante  
**Quero** informar meus dados de contato após responder o quiz  
**Para** receber meu diagnóstico personalizado e ser contatado

#### Cenário: Submeter formulário com sucesso
```gherkin
Dado que respondi todas as 10 perguntas do quiz
Quando preencho meu nome, e-mail e telefone
E clico no botão "Ver Resultado"
Então recebo meu diagnóstico personalizado contendo:
  | Informação              | Descrição                                    |
  | Pontuação               | Minha nota de 0 a 100                        |
  | Faixa de Diagnóstico    | O nível em que me enquadro                   |
  | Mensagem Personalizada  | Orientação específica para minha faixa       |
  | Resumo das Respostas    | As perguntas e minhas respostas selecionadas |
E vejo uma tela de resultado com todas essas informações
```

#### Cenário: Tentar cadastrar com e-mail já utilizado
```gherkin
Dado que já realizei o quiz anteriormente com o e-mail "joao@email.com"
Quando tento submeter o formulário novamente com o mesmo e-mail
Então vejo uma mensagem de erro informando que este e-mail já realizou o quiz
E sou orientado a utilizar um e-mail diferente
E não vejo nenhum resultado ou histórico anterior
```

---

### US-03: Visualizar Resultado Completo

**Como** estudante  
**Quero** ver meu resultado detalhado após submeter o formulário  
**Para** entender meu nível de preparo e revisar minhas respostas

#### Cenário: Exibir tela de resultado
```gherkin
Dado que submeti o formulário com sucesso
Quando a tela de resultado é carregada
Então vejo minha pontuação total destacada
E vejo o nome da minha faixa de diagnóstico
E vejo a mensagem personalizada para minha faixa
E vejo o resumo das 10 perguntas com minhas respostas
```

---

## Épico 2: Painel Administrativo de Leads

### US-04: Autenticar no Painel Administrativo

**Como** administrador  
**Quero** fazer login no painel administrativo  
**Para** acessar os dados dos leads cadastrados

#### Cenário: Login com credenciais válidas
```gherkin
Dado que acesso a página de login do admin
Quando insiro e-mail e senha válidos
E clico no botão "Entrar"
Então sou redirecionado para o painel administrativo
E vejo a visão geral do dashboard
```

#### Cenário: Tentar acessar sem autenticação
```gherkin
Dado que não estou autenticado
Quando tento acessar qualquer página do painel administrativo
Então sou redirecionado para a página de login
E não consigo visualizar nenhum dado
```

---

### US-05: Visualizar Dashboard Executivo

**Como** administrador  
**Quero** ver uma visão geral dos leads e métricas  
**Para** acompanhar o desempenho e volume de cadastros

#### Cenário: Visualizar KPIs no dashboard
```gherkin
Dado que estou autenticado no painel administrativo
Quando acesso a página do dashboard
Então vejo os seguintes indicadores:
  | Indicador              | Descrição                              |
  | Total de Leads         | Quantidade total de leads cadastrados  |
  | Média de Pontuação     | Score médio de todos os leads          |
  | Distribuição por Faixa | Quantidade de leads em cada faixa      |
```

#### Cenário: Visualizar gráficos no dashboard
```gherkin
Dado que estou na página do dashboard
Quando a página é carregada
Então vejo um gráfico de pizza/donut mostrando a distribuição por faixa
E vejo um gráfico de área mostrando a evolução diária de novos leads
```

---

### US-06: Gerenciar Leads na Visão Operacional

**Como** administrador  
**Quero** visualizar e filtrar a lista de leads  
**Para** consultar dados específicos e exportar relatórios

#### Cenário: Visualizar lista de leads
```gherkin
Dado que estou autenticado no painel administrativo
Quando acesso a página de leads
Então vejo uma tabela com os seguintes dados:
  | Coluna      | Descrição                           |
  | Nome        | Nome do lead                        |
  | E-mail      | E-mail do lead                      |
  | Telefone    | Telefone do lead                    |
  | Faixa       | Faixa de diagnóstico                |
  | Pontuação   | Score do lead                       |
  | Data        | Data de cadastro                    |
E a tabela é paginada
```

#### Cenário: Buscar leads por nome ou e-mail
```gherkin
Dado que estou na página de leads
Quando digito um termo no campo de busca
Então a tabela é filtrada mostrando apenas leads que correspondem ao termo
E o filtro considera nome e e-mail
```

#### Cenário: Filtrar leads por faixa de diagnóstico
```gherkin
Dado que estou na página de leads
Quando seleciono uma faixa no filtro de diagnóstico
Então a tabela é filtrada mostrando apenas leads daquela faixa
```

#### Cenário: Exportar leads em CSV
```gherkin
Dado que estou na página de leads
Quando clico no botão "Exportar CSV"
Então um arquivo CSV é baixado contendo todos os leads visíveis
E o arquivo considera os filtros aplicados (busca e faixa)
```

---

### US-07: Inspecionar Detalhes de um Lead

**Como** administrador  
**Quero** ver os detalhes completos de um lead específico  
**Para** analisar suas respostas e dados de contato

#### Cenário: Abrir modal de detalhes
```gherkin
Dado que estou na página de leads
Quando clico em um lead na tabela
Então um modal é aberto exibindo:
  | Seção               | Conteúdo                              |
  | Dados de Contato    | Nome, e-mail, telefone, data cadastro |
  | Resultado           | Pontuação, faixa, mensagem personalizada |
  | Resumo de Respostas | As 10 perguntas com respostas selecionadas |
```

#### Cenário: Fechar modal de detalhes
```gherkin
Dado que o modal de detalhes está aberto
Quando clico no botão de fechar ou fora do modal
Então o modal é fechado
E retorno para a lista de leads
```

---

### US-08: Navegar entre Páginas do Admin

**Como** administrador  
**Quero** navegar entre as páginas do painel  
**Para** acessar diferentes visões dos dados sem recarregar a interface

#### Cenário: Navegar no desktop (Sidebar)
```gherkin
Dado que estou autenticado no painel administrativo
Quando clico no menu "Dashboard" na sidebar
Então o conteúdo é alternado para a página do dashboard
E a sidebar permanece visível sem recarregar
Quando clico no menu "Leads" na sidebar
Então o conteúdo é alternado para a página de leads
E a sidebar permanece visível sem recarregar
```

#### Cenário: Navegar no mobile (Bottom Navigation)
```gherkin
Dado que estou autenticado no painel administrativo em um dispositivo móvel
Quando clico no ícone "Dashboard" na barra inferior
Então o conteúdo é alternado para a página do dashboard
E a barra de navegação inferior permanece visível sem recarregar
Quando clico no ícone "Leads" na barra inferior
Então o conteúdo é alternado para a página de leads
E a barra de navegação inferior permanece visível sem recarregar
```

---

### US-09: Realizar Logout

**Como** administrador  
**Quero** sair da minha conta  
**Para** encerrar minha sessão de forma segura

#### Cenário: Logout no desktop
```gherkin
Dado que estou autenticado no painel administrativo
Quando clico no botão "Sair" na sidebar
Então minha sessão é encerrada
E sou redirecionado para a página de login
```

#### Cenário: Logout no mobile
```gherkin
Dado que estou autenticado no painel em um dispositivo móvel
Quando clico no meu avatar no cabeçalho superior
Então um menu é aberto com meus dados e opção de sair
Quando clico em "Sair da Conta"
Então minha sessão é encerrada
E sou redirecionado para a página de login
```

---

## Glossário de Termos de Negócio

| Termo | Descrição |
|-------|-----------|
| **Quiz** | Conjunto de 10 perguntas com alternativas para avaliar o nível de preparo |
| **Lead** | Pessoa que realizou o quiz e forneceu seus dados de contato |
| **Faixa de Diagnóstico** | Categoria que classifica o nível de preparo do lead |
| **Pontuação** | Nota de 0 a 100 calculada com base nas respostas do quiz |
| **Dashboard** | Visão executiva com métricas e gráficos |
| **Visão Operacional** | Visão detalhada com lista de leads e ferramentas de gestão |
