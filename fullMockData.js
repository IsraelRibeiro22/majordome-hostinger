import { startOfYear, endOfMonth, eachDayOfInterval, format, differenceInMonths, addMonths, subDays } from 'date-fns';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const formatDateISO = (date) => format(date, 'yyyy-MM-dd');
const getRandomDayOfMonth = (year, month) => rand(1, new Date(year, month + 1, 0).getDate());

const generateFullMockData = () => {
    const today = new Date('2025-08-08');
    const startOfUniverse = new Date('2025-01-01');
    const monthsToGenerate = differenceInMonths(today, startOfUniverse);

    const rawCategories = [
        { id: 1, name: 'Aluguel', type: 'expense', color: 'bg-red-700' },
        { id: 2, name: 'Internet', type: 'expense', color: 'bg-blue-400' },
        { id: 3, name: 'Energia', type: 'expense', color: 'bg-yellow-400' },
        { id: 4, name: 'Educação', type: 'expense', color: 'bg-indigo-500' },
        { id: 5, name: 'Supermercado', type: 'expense', color: 'bg-orange-500' },
        { id: 6, name: 'Lazer', type: 'expense', color: 'bg-purple-500' },
        { id: 7, name: 'Transporte', type: 'expense', color: 'bg-gray-500' },
        { id: 8, name: 'Restaurantes', type: 'expense', color: 'bg-pink-500' },
        { id: 9, name: 'Compras', type: 'expense', color: 'bg-teal-500' },
        { id: 10, name: 'Serviços', type: 'expense', color: 'bg-cyan-500' },
        { id: 11, name: 'Salário', type: 'income', color: 'bg-green-500' },
        { id: 12, name: 'Aluguel Recebido', type: 'income', color: 'bg-lime-500' },
        { id: 13, name: 'Aposentadoria', type: 'income', color: 'bg-emerald-500' },
        { id: 14, name: 'Freelance', type: 'income', color: 'bg-sky-500' },
        { id: 15, name: 'Dividendos', type: 'income', color: 'bg-violet-500' },
        { id: 16, name: 'Reembolso', type: 'income', color: 'bg-fuchsia-500' },
        { id: 17, name: 'Assinatura Software', type: 'expense', color: 'bg-gray-600' },
        { id: 18, name: 'Plano de Saúde', type: 'expense', color: 'bg-rose-500' },
        { id: 19, name: 'Poupança e Investimentos', type: 'expense', color: 'bg-amber-600' },
    ];

    let bankAccounts = [
        { id: 1, name: 'Conta Corrente Principal', initial_balance: 1500, currency: 'BRL', min_balance: 100, balance_date: '2025-01-01' },
        { id: 2, name: 'Conta Poupança', initial_balance: 7500, currency: 'BRL', min_balance: 200, balance_date: '2025-01-01' },
        { id: 3, name: 'Conta Viagem (EUR)', initial_balance: 200, currency: 'EUR', min_balance: 50, balance_date: '2025-01-01' },
        { id: 4, name: 'Conta Internacional (USD)', initial_balance: 150, currency: 'USD', min_balance: 30, balance_date: '2025-01-01' },
    ];

    let incomes = [];
    let expenses = [];
    let transfers = [];
    let transactionId = 1;

    for (let i = 0; i <= monthsToGenerate; i++) {
        const monthDate = addMonths(startOfUniverse, i);
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();
        
        if (monthDate > today) continue;

        // --- VARIABLE INCOMES (1-2 per month) ---
        for (let j = 0; j < rand(1, 2); j++) {
            const acc = bankAccounts[rand(0, 3)];
            incomes.push({ id: transactionId++, account_id: acc.id, description: 'Serviço de Freelance', amount: randFloat(50, 200), category: 'Freelance', date: formatDateISO(new Date(year, month, getRandomDayOfMonth(year, month))) });
        }
        if (i % 3 === 0) { // Quarterly dividend
            incomes.push({ id: transactionId++, account_id: 2, description: 'Dividendos Ações', amount: randFloat(50, 150), category: 'Dividendos', date: formatDateISO(new Date(year, month, 20)) });
        }

        // --- VARIABLE EXPENSES ---
        ['Supermercado', 'Restaurantes', 'Transporte', 'Lazer', 'Compras', 'Serviços'].forEach(category => {
            for (let j = 0; j < rand(2, 4); j++) {
                const acc = bankAccounts[rand(0, 3)];
                expenses.push({ id: transactionId++, account_id: acc.id, description: `${category} ${j+1}`, amount: randFloat(10, 80), category, date: formatDateISO(new Date(year, month, getRandomDayOfMonth(year, month))) });
            }
        });

        // --- TRANSFERS ---
        const transferPairs = [[1, 3], [3, 4], [4, 1]]; // BRL->EUR, EUR->USD, USD->BRL
        transferPairs.forEach(([from, to]) => {
            const fromAcc = bankAccounts.find(a => a.id === from);
            const toAcc = bankAccounts.find(a => a.id === to);
            const amount = rand(50, 200);
            const transfer = { id: transactionId++, from_id: from, to_id: to, from_amount: amount, to_amount: amount * randFloat(0.18, 0.95), from_currency: fromAcc.currency, to_currency: toAcc.currency, date: formatDateISO(new Date(year, month, getRandomDayOfMonth(year, month))), description: `Câmbio ${fromAcc.currency} para ${toAcc.currency}` };
            transfers.push(transfer);
        });
    }

    const fixedExpenses = [
      { id: 1, account_id: 1, description: 'Aluguel Fixo', amount: 800, category: 'Aluguel', recurrence: 'monthly', start_date: '2025-01-01', end_date: null },
      { id: 2, account_id: 1, description: 'Internet', amount: 80, category: 'Internet', recurrence: 'monthly', start_date: '2025-01-05', end_date: null },
      { id: 3, account_id: 1, description: 'Energia', amount: 120, category: 'Energia', recurrence: 'monthly', start_date: '2025-01-10', end_date: null },
      { id: 4, account_id: 1, description: 'Plano de Saúde', amount: 250, category: 'Plano de Saúde', recurrence: 'monthly', start_date: '2025-01-15', end_date: null },
      { id: 5, account_id: 1, description: 'Salário', amount: 3000, category: 'Salário', recurrence: 'monthly', start_date: '2025-01-05', end_date: null, type: 'income' },
    ];
    
    const savingsGoals = [
        { id: 1, name: 'Viagem Curta', target_amount: 1500, current_amount: 0, deadline: '2026-05-01', accountId: 1 },
        { id: 2, name: 'Reserva de Emergência', target_amount: 5000, current_amount: 0, deadline: '2026-12-31', accountId: 2 },
    ];

    // Add contributions to goals as expenses
    expenses.push({ id: transactionId++, account_id: 1, description: 'Contribuição para a meta "Viagem Curta"', amount: 200, category: 'Poupança e Investimentos', date: '2025-02-15' });
    expenses.push({ id: transactionId++, account_id: 1, description: 'Contribuição para a meta "Viagem Curta"', amount: 250, category: 'Poupança e Investimentos', date: '2025-05-15' });
    savingsGoals[0].current_amount = 450;

    expenses.push({ id: transactionId++, account_id: 2, description: 'Contribuição para a meta "Reserva de Emergência"', amount: 500, category: 'Poupança e Investimentos', date: '2025-03-20' });
    expenses.push({ id: transactionId++, account_id: 2, description: 'Contribuição para a meta "Reserva de Emergência"', amount: 600, category: 'Poupança e Investimentos', date: '2025-06-20' });
    savingsGoals[1].current_amount = 1100;

    const budget = {
        "2025-06": {
            "Aluguel": { "amount": 800, "currency": "BRL" },
            "Supermercado": { "amount": 400, "currency": "BRL" },
            "Restaurantes": { "amount": 150, "currency": "BRL" },
            "Lazer": { "amount": 100, "currency": "BRL" },
        },
        "2025-07": {
            "Aluguel": { "amount": 800, "currency": "BRL" },
            "Supermercado": { "amount": 420, "currency": "BRL" },
            "Restaurantes": { "amount": 140, "currency": "BRL" },
            "Lazer": { "amount": 110, "currency": "BRL" },
        },
        "2025-08": {
            "Aluguel": { "amount": 800, "currency": "BRL" },
            "Supermercado": { "amount": 400, "currency": "BRL" },
            "Restaurantes": { "amount": 130, "currency": "BRL" },
            "Lazer": { "amount": 100, "currency": "BRL" },
            "Transporte": { "amount": 80, "currency": "BRL" },
        }
    };

    return {
        name: 'Usuário Fictício',
        bankAccounts,
        rawCategories,
        expenses,
        income: incomes,
        transfers,
        fixedExpenses,
        savingsGoals,
        budget,
        appointments: [],
        descriptionMemory: [
            ...new Set([...expenses.map(e => e.description), ...incomes.map(i => i.description)])
        ].map((desc, i) => ({ id: i + 1, description: desc, type: 'expense' })),
    };
};

const fullMockData = generateFullMockData();

export default fullMockData;