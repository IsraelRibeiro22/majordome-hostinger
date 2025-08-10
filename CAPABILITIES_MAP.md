# Mapa de Capacidades da Plataforma Majordome Financeiro

**Data do Relatório:** 08/08/2025

---

## Sumário Executivo (Para Leigos)

O **Majordome Financeiro** é uma aplicação web desenhada para ser o seu assistente pessoal de finanças. O objetivo principal é dar-lhe uma visão clara e controlo total sobre o seu dinheiro, de forma simples e intuitiva.

Atualmente, a plataforma permite:

1.  **Gerir Todas as Suas Contas:** Pode adicionar todas as suas contas bancárias, carteiras de dinheiro e cartões, incluindo contas em diferentes moedas (Real, Dólar, Euro). O sistema calcula e atualiza automaticamente o saldo de cada uma.

2.  **Registar Todas as Transações:** Pode lançar todas as suas receitas (salários, rendas) e despesas (aluguer, supermercado, lazer). Também pode registar transferências de dinheiro entre as suas contas.

3.  **Automatizar Despesas Fixas:** Despesas recorrentes como aluguer, assinaturas ou mensalidades podem ser configuradas uma vez, e a aplicação gera-as automaticamente todos os meses.

4.  **Visualizar a Saúde Financeira:** Um painel principal (Dashboard) mostra um resumo do seu dinheiro: quanto entrou, quanto saiu e qual o saldo para o período que escolher (mês, ciclo financeiro, etc.). Um gráfico anual mostra a evolução das suas finanças ao longo do tempo, ajudando a perceber se está a ganhar ou a perder dinheiro.

5.  **Atingir Metas de Poupança:** Pode criar objetivos financeiros, como "Viagem para a Europa" ou "Fundo de Emergência", definir um valor e um prazo, e acompanhar o seu progresso.

6.  **Analisar e Projetar o Futuro:**
    *   **Extrato Detalhado:** Pode ver um extrato consolidado de qualquer conta, semelhante ao do seu banco.
    *   **Previsão de Saldo:** A aplicação consegue prever como estará o seu saldo nos próximos 7, 15 ou 30 dias, com base nas suas despesas fixas.
    *   **Pesquisa Avançada:** Pode encontrar facilmente qualquer transação pesquisando por categoria e data.
    *   **Análise por IA (Inteligência Artificial):** Um "mordomo" virtual analisa os seus dados e dá-lhe dicas personalizadas para melhorar a sua gestão financeira.

A plataforma funciona inteiramente no seu navegador, guardando os dados de forma segura no seu próprio dispositivo (`localStorage`). É multilingue (Português, Francês) e adapta-se a diferentes tamanhos de ecrã (computador, tablet, telemóvel).

Em resumo, o Majordome Financeiro é uma ferramenta completa para quem quer organizar a sua vida financeira, desde o registo diário até ao planeamento de longo prazo, com a ajuda de visualizações gráficas e inteligência artificial.

---

## Apêndice Técnico (Para Desenvolvedores)

Este apêndice detalha a arquitetura, fluxos de dados e regras de negócio da aplicação Majordome Financeiro.

### Esquema de Dados e Rotas

#### Rotas da Aplicação

A aplicação utiliza `react-router-dom` com a seguinte estrutura de rotas:

-   `/`: Rota principal, renderiza o `Dashboard.jsx`.
-   `/scheduler`: Renderiza a página de agendamento, `Scheduler.jsx`.

#### Modelo de Dados (Schema)

Os dados são geridos localmente através de um único objeto de estado em `App.jsx`, persistido no `localStorage` sob a chave `majordome-data`. A estrutura principal (`allData`) assemelha-se ao seguinte schema:

-   **`bankAccounts`**: `Array<Object>`
    -   `id`: `Number` (Identificador único)
    -   `name`: `String` (Nome da conta)
    -   `initial_balance`: `Number` (Saldo inicial)
    -   `currency`: `String` (Ex: 'BRL', 'USD', 'EUR')
    -   `min_balance`: `Number` (Saldo de segurança)
    -   `balance_date`: `String` ('yyyy-MM-dd', Data de referência do saldo inicial)
    -   `current_balance`: `Number` (Calculado dinamicamente, não persistido)

-   **`income` / `expenses`**: `Array<Object>`
    -   `id`: `String|Number`
    -   `account_id`: `Number` (FK para `bankAccounts.id`)
    -   `description`: `String`
    -   `amount`: `Number`
    -   `category`: `String`
    -   `date`: `String` ('yyyy-MM-dd')
    -   `fixed_item_id`: `Number` (Opcional, FK para `fixedExpenses.id`)

-   **`transfers`**: `Array<Object>`
    -   `id`: `String|Number`
    -   `from_id`: `Number` (FK para `bankAccounts.id`)
    -   `to_id`: `Number` (FK para `bankAccounts.id`)
    -   `from_amount`: `Number`
    -   `to_amount`: `Number`
    -   `date`: `String` ('yyyy-MM-dd')
    -   `description`: `String`

-   **`fixedExpenses`**: `Array<Object>`
    -   `id`: `Number`
    -   `account_id`: `Number` (FK para `bankAccounts.id`)
    -   `description`: `String`
    -   `amount`: `Number`
    -   `category`: `String`
    -   `recurrence`: `String` (Ex: 'monthly', 'weekly')
    -   `start_date`: `String` ('yyyy-MM-dd')
    -   `end_date`: `String|null` ('yyyy-MM-dd')

-   **`savingsGoals`**: `Array<Object>`
    -   `id`: `Number`
    -   `name`: `String`
    -   `target_amount`: `Number`
    -   `current_amount`: `Number`
    -   `deadline`: `String|null` ('yyyy-MM-dd')
    -   `accountId`: `Number` (FK para `bankAccounts.id`)

-   **`rawCategories`**: `Array<Object>`
    -   `id`: `Number`
    -   `name`: `String` (Chave de tradução, ex: 'salario')
    -   `type`: `String` ('income' ou 'expense')
    -   `color`: `String` (Classe Tailwind CSS, ex: 'bg-red-700')

#### Fluxo de Dados Principal (Event Flow)

1.  **Inicialização (`App.jsx`):**
    -   Carrega dados do `fullMockData.js` para o estado `allData`.
    -   Os dados de `localStorage` (`majordome-data`, `majordome-settings`) são usados para popular o estado inicial, caso existam.
    -   As categorias (`rawCategories`) são traduzidas com base no idioma (i18n) e divididas em `incomeCategories` e `expenseCategories`.
    -   `calculateAllAccountBalances` é chamado para calcular o `current_balance` de todas as contas.
    -   O estado `allData` é passado para os componentes filhos.

2.  **Operações CRUD:**
    -   Componentes filhos (ex: `AddIncomeForm`, `BankAccounts`) não modificam o estado diretamente.
    -   Eles invocam a função `updateAllData` (passada por props desde `App.jsx`).
    -   `updateAllData` recebe os novos dados e/ou detalhes da operação (add, update, delete).
    -   Dentro do `updateAllData`, o estado `allData` é atualizado de forma imutável.
    -   Após a atualização, `calculateAllAccountBalances` é re-executado para refletir as mudanças nos saldos.
    -   O novo estado `allData` é persistido no `localStorage`.
    -   A atualização do estado causa uma re-renderização dos componentes com os novos dados.

### Módulo 1: Finanças

#### 1.1. Gestão de Contas (Bank Accounts)

-   **O que faz:** Permite ao utilizador criar, visualizar, editar e apagar contas financeiras, incluindo contas multimoeda.
-   **Onde fica:** No Dashboard, dentro do card "Minhas Contas" (`BankAccounts.jsx`).
-   **Como usar:**
    1.  Clicar em "Adicionar Conta" para abrir o formulário.
    2.  Preencher nome, saldo inicial, data do saldo, moeda e saldo de segurança (opcional).
    3.  Clicar em "Salvar".
    4.  Para editar ou apagar, usar os ícones de ação no card da conta.
-   **Entradas/Saídas:**
    -   **Entrada:** Dados do formulário (nome, saldo, etc.).
    -   **Saída:** Adiciona/atualiza/remove um objeto no array `allData.bankAccounts`.
-   **Regras de Negócio:**
    -   É obrigatório manter pelo menos uma conta. A remoção da última conta é bloqueada.
    -   O saldo atual (`current_balance`) é um campo calculado, não editável diretamente. É o resultado do `initial_balance` mais todas as transações desde a `balance_date`.
-   **Dependências:** `allData.bankAccounts`, `lib/balanceCalculator.js`.

#### 1.2. Lançamentos (Receitas, Despesas, Transferências)

-   **O que faz:** Centraliza a entrada de todas as transações financeiras.
-   **Onde fica:** No Dashboard, no card "Transações" (`TransactionsHub.jsx`), com abas para Receita, Despesa e Transferência.
-   **Como usar:**
    1.  Selecionar a aba correspondente (Receita, Despesa, Transferência).
    2.  Preencher o formulário com descrição, valor, categoria, conta e data.
    3.  Clicar em "Salvar".
-   **Entradas/Saídas:**
    -   **Entrada:** Dados do formulário.
    -   **Saída:** Adiciona um novo objeto aos arrays `allData.income`, `allData.expenses` ou `allData.transfers`.
-   **Regras de Negócio:**
    -   Transferências entre a mesma conta são bloqueadas.
    -   Em transferências multimoeda, são requeridos os valores de envio e recebimento.
    -   A validação impede a submissão de formulários com campos obrigatórios em falta.
-   **Limitações:** A edição de transações é feita através do modal "Todas as Transações" ou do detalhe do gráfico anual, não diretamente no hub de criação.
-   **Dependências:** `allData.income`, `allData.expenses`, `allData.transfers`, `allData.bankAccounts`, `allData.incomeCategories`, `allData.expenseCategories`.

#### 1.3. Despesas Fixas (Fixed Expenses)

-   **O que faz:** Permite a gestão de despesas recorrentes.
-   **Onde fica:** No Dashboard, no card "Despesas Fixas" (`FixedExpensesManager.jsx`).
-   **Como usar:**
    1.  Clicar em "Adicionar Despesa Fixa".
    2.  Preencher o formulário com descrição, valor, categoria, conta, recorrência, data de início e data de fim (opcional).
    3.  Salvar.
-   **Regras de Negócio:**
    -   A função `generateRecurringTransactions` (`lib/transactionGenerator.js`) é chamada no `Dashboard.jsx`.
    -   Esta função verifica, para o período atual, se existem despesas fixas que deveriam ocorrer e ainda não foram lançadas no array `allData.expenses`.
    -   Se encontrar, gera as transações e as adiciona, marcando-as com o `fixed_item_id`.
-   **Limitações:** Atualmente, só suporta despesas fixas, não receitas fixas (embora o código no `FixedIncomeTracker.jsx` exista, não está integrado no Dashboard).
-   **Dependências:** `allData.fixedExpenses`, `allData.expenses`, `lib/transactionGenerator.js`.

#### 1.4. Metas de Poupança (Savings Goals)

-   **O que faz:** Permite criar e acompanhar metas financeiras.
-   **Onde fica:** No Dashboard, no card "Metas de Poupança" (`SavingsGoals.jsx`).
-   **Como usar:**
    1.  Adicionar uma nova meta, definindo nome, valor alvo, prazo e a conta associada.
    2.  Para adicionar fundos, clicar em "Contribuir", selecionar uma conta de origem e o valor.
-   **Regras de Negócio:**
    -   Uma contribuição gera uma nova despesa na conta de origem com a categoria "Metas de Poupança".
    -   Atualiza o `current_amount` da meta correspondente.
    -   Valida se a conta de origem tem saldo suficiente para a contribuição.
-   **Dependências:** `allData.savingsGoals`, `allData.expenses`, `allData.bankAccounts`.

#### 1.5. Visualização e Análise (Gráficos, Extratos, Filtros)

-   **Evolução Financeira Anual (`SavingsEvolutionChart.jsx`):**
    -   **O que faz:** Mostra um gráfico de barras e linhas com a evolução de receitas, despesas e saldo ao longo de um ano.
    -   **Lógica Principal:** `lib/chartHelper.js` é a função central.
        1.  Filtra contas pela moeda selecionada.
        2.  Calcula o `balanceAtStartOfYear`: pega o saldo inicial da conta e aplica todas as transações entre a `balance_date` da conta e o início do ano selecionado.
        3.  Gera projeções de despesas futuras com base nas `fixedExpenses`.
        4.  Itera sobre cada período do ano (mensal ou ciclo financeiro), calcula os totais de receitas/despesas e atualiza um `runningBalance`.
        5.  A linha de saldo aceita valores negativos, com o eixo Y a ajustar-se dinamicamente (`domain={[min=>Math.min(0,min), max=>Math.max(0,max)]}`). Uma `ReferenceLine` em `y=0` marca o zero.
    -   **Interatividade:** Clicar numa barra do gráfico abre uma visão detalhada (`MonthlyDetailView.jsx`) com as transações daquele período.

-   **Extrato e Previsão (`FinancialViewsDialog.jsx`):**
    -   **O que faz:** Um modal com duas abas: "Extrato Consolidado" e "Saldo Futuro".
    -   **Extrato (`ConsolidatedStatement.jsx`):** Mostra um extrato tradicional para a conta e período selecionados, com saldo inicial, transações e saldo final.
    -   **Previsão (`FutureForecast.jsx`):** Utiliza `lib/forecastHelper.js` para projetar o saldo futuro com base no saldo atual e nas `fixedExpenses` agendadas. Alerta o utilizador se o saldo for ficar negativo.

-   **Filtros e Períodos (`DateContext.jsx`):**
    -   **O que faz:** Um Contexto React que gere o período de análise global da aplicação.
    -   **Lógica:** Suporta 3 modos de visualização (`periodView`): Mês Calendário, Ciclo Financeiro (com dia de início configurável) e Intervalo Personalizado.
    -   **Componentes:** `DateNavigator.jsx` permite avançar/recuar no tempo, e `DateRangePicker.jsx` permite selecionar um intervalo customizado.

### Módulo 2: Plataforma

#### 2.1. Autenticação e Persistência

-   **Autenticação:** Não implementada. O ficheiro `AuthPage.jsx` está vazio. A aplicação funciona em modo "offline" para um único utilizador.
-   **Persistência de Dados:**
    -   **Principal:** `localStorage`. A chave `majordome-data` armazena o objeto `allData`. A chave `majordome-settings` armazena as configurações do utilizador.
    -   **Supabase:** **NÃO CONECTADO.** O `SupabaseAuthContext.jsx` existe, mas não é utilizado. Não há cliente Supabase inicializado ou chamadas à API. A aplicação está 100% local.

#### 2.2. Internacionalização (i18n)

-   **O que faz:** Suporta múltiplos idiomas para a interface.
-   **Tecnologia:** `i18next` com `react-i18next`.
-   **Onde fica:** A configuração está em `i18n.js`. Os ficheiros de tradução JSON estão em `public/locales/pt/` e `public/locales/fr/`, organizados por namespaces (ex: `accounts.json`, `common.json`).
-   **Como funciona:** O componente `useTranslation()` é usado nos componentes para aceder às strings de tradução (ex: `t('title')`). O sistema deteta o idioma do navegador ou permite a troca manual através do `LanguageSwitcher.jsx`.

#### 2.3. Acessibilidade e Responsividade

-   **Responsividade:** A aplicação utiliza TailwindCSS e uma abordagem "mobile-first". Os layouts usam `flexbox` e `grid` para se adaptarem a diferentes tamanhos de ecrã.
-   **Acessibilidade:**
    -   Uso de elementos HTML semânticos (`<main>`, `<nav>`, `<h2>`).
    -   Uso de `aria-labels` e `labels` para formulários.
    -   Componentes da `shadcn/ui` (construídos sobre Radix UI) vêm com acessibilidade (WAI-ARIA) incorporada.
    -   Títulos de página e meta-descrições são geridos pelo `react-helmet`.

### Módulo 3: Operações

#### 3.1. Importação de Extrato

-   **O que faz:** Permite importar transações a partir de um ficheiro CSV, XLS ou XLSX.
-   **Onde fica:** A funcionalidade está no `StatementImportDialog.jsx`, mas não parece estar ligada a nenhum botão na interface principal do Dashboard.
-   **Como usar (se fosse ativada):**
    1.  Fazer upload do ficheiro e selecionar a conta de destino.
    2.  Mapear as colunas do ficheiro (Data, Descrição, Débito, Crédito, Valor) para os campos da aplicação.
    3.  Rever as transações processadas, fazer ajustes e selecionar quais importar.
    4.  Salvar para adicionar as transações à conta selecionada.
-   **Bibliotecas:** `papaparse` para CSV, `xlsx` para Excel.
-   **Limitações:** A funcionalidade existe mas não está acessível a partir da UI principal.

#### 3.2. Notificações

-   **O que faz:** Fornece feedback ao utilizador sobre as ações realizadas.
-   **Tecnologia:** `shadcn/ui` Toaster (`useToast`).
-   **Como funciona:** Componentes invocam `toast({ title: '...', description: '...' })` após operações bem-sucedidas ou com erro. As notificações aparecem no canto do ecrã e desaparecem automaticamente.
-   **Exemplos de Mensagens:**
    -   Sucesso: "Conta Criada", "Transação Adicionada com sucesso!".
    -   Erro: "Fundos Insuficientes", "Campos Obrigatórios".
    -   Informativo: "Funcionalidade não implementada".
