import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { TrendingDown, TrendingUp, Send, DollarSign } from 'lucide-react';

export const useChatLogic = ({ allData, updateAllData, t }) => {
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState('start');
  const [tempData, setTempData] = useState({});
  const { toast } = useToast();

  const formatCurrency = (value, currency = 'BRL') => {
    const lang = t.language === 'fr' ? 'fr-FR' : 'pt-BR';
    return new Intl.NumberFormat(lang, { style: 'currency', currency }).format(value);
  };

  const addMessage = (sender, text, options = [], isComponent = false) => {
    setMessages(prev => [...prev, { sender, text, options, id: Date.now(), isComponent }]);
  };

  const resetChat = useCallback(() => {
    setMessages([]);
    setCurrentStep('start');
    setTempData({});
    addMessage('bot', t('chatbot.hello'), [
      { text: t('chatbot.options.addExpense'), step: 'addExpense_askAmount', icon: TrendingDown },
      { text: t('chatbot.options.addIncome'), step: 'addIncome_askAmount', icon: TrendingUp },
      { text: t('chatbot.options.makeTransfer'), step: 'makeTransfer_askFromAccount', icon: Send },
      { text: t('chatbot.options.checkBalance'), step: 'checkBalance_askAccount', icon: DollarSign },
    ]);
  }, [t]);

  const processStep = useCallback((nextStep, data) => {
    setCurrentStep(nextStep);
    let newTempData = { ...tempData, ...data };
    setTempData(newTempData);

    const flowHandlers = {
      start: resetChat,
      addExpense_askAmount: () => addMessage('bot', t('chatbot.askAmount')),
      addExpense_askCategory: () => addMessage('bot', t('chatbot.askCategory'), allData.expenseCategories.map(cat => ({ text: cat.name, step: 'addExpense_askAccount', data: { category: cat.name } }))),
      addExpense_askAccount: () => addMessage('bot', t('chatbot.askAccount'), allData.bankAccounts.map(acc => ({ text: `${acc.name} (${formatCurrency(acc.balance, acc.currency)})`, step: 'addExpense_askDate', data: { account_id: acc.id } }))),
      addExpense_askDate: () => addMessage('bot', t('chatbot.askDate'), [], true),
      addExpense_askDescription: () => addMessage('bot', t('chatbot.askDescription')),
      addExpense_confirm: () => {
        const finalData = { ...newTempData, ...data };
        const account = allData.bankAccounts.find(a => a.id === finalData.account_id);
        addMessage('bot', t('chatbot.confirmExpense', { amount: formatCurrency(finalData.amount, account.currency), description: finalData.description, category: finalData.category, account: account.name, date: format(new Date(finalData.date), 'dd/MM/yyyy') }), [{ text: t('confirm'), step: 'addExpense_execute', data: finalData }, { text: t('cancel'), step: 'start' }]);
      },
      addExpense_execute: () => {
        const expenseData = { ...data, id: Date.now(), date: format(new Date(data.date), 'yyyy-MM-dd') };
        const updatedExpenses = [...allData.expenses, expenseData];
        const accountIndex = allData.bankAccounts.findIndex(a => a.id === expenseData.account_id);
        const updatedAccounts = [...allData.bankAccounts];
        updatedAccounts[accountIndex].balance -= expenseData.amount;
        updateAllData({ expenses: updatedExpenses, bankAccounts: updatedAccounts });
        toast({ title: t('toast.expenseAdded'), description: t('toast.expenseAddedSuccess') });
        addMessage('bot', t('chatbot.done'));
        setTimeout(resetChat, 2000);
      },
      addIncome_askAmount: () => addMessage('bot', t('chatbot.askAmount')),
      addIncome_askCategory: () => addMessage('bot', t('chatbot.askCategory'), allData.incomeCategories.map(cat => ({ text: cat.name, step: 'addIncome_askAccount', data: { category: cat.name } }))),
      addIncome_askAccount: () => addMessage('bot', t('chatbot.askAccount'), allData.bankAccounts.map(acc => ({ text: `${acc.name} (${formatCurrency(acc.balance, acc.currency)})`, step: 'addIncome_askDate', data: { account_id: acc.id } }))),
      addIncome_askDate: () => addMessage('bot', t('chatbot.askDate'), [], true),
      addIncome_askDescription: () => addMessage('bot', t('chatbot.askDescription')),
      addIncome_confirm: () => {
        const finalData = { ...newTempData, ...data };
        const account = allData.bankAccounts.find(a => a.id === finalData.account_id);
        addMessage('bot', t('chatbot.confirmIncome', { amount: formatCurrency(finalData.amount, account.currency), description: finalData.description, category: finalData.category, account: account.name, date: format(new Date(finalData.date), 'dd/MM/yyyy') }), [{ text: t('confirm'), step: 'addIncome_execute', data: finalData }, { text: t('cancel'), step: 'start' }]);
      },
      addIncome_execute: () => {
        const incomeData = { ...data, id: Date.now(), date: format(new Date(data.date), 'yyyy-MM-dd') };
        const updatedIncomes = [...allData.income, incomeData];
        const accountIndex = allData.bankAccounts.findIndex(a => a.id === incomeData.account_id);
        const updatedAccounts = [...allData.bankAccounts];
        updatedAccounts[accountIndex].balance += incomeData.amount;
        updateAllData({ income: updatedIncomes, bankAccounts: updatedAccounts });
        toast({ title: t('toast.incomeAdded'), description: t('toast.incomeAddedSuccess') });
        addMessage('bot', t('chatbot.done'));
        setTimeout(resetChat, 2000);
      },
      checkBalance_askAccount: () => {
        const balanceOptions = allData.bankAccounts.map(acc => ({ text: `${acc.name} (${acc.currency})`, step: 'checkBalance_show', data: { accountId: acc.id } }));
        balanceOptions.push({ text: t('chatbot.options.allAccounts'), step: 'checkBalance_show', data: { accountId: 'all' } });
        addMessage('bot', t('chatbot.whichAccount'), balanceOptions);
      },
      checkBalance_show: () => {
        if (data.accountId === 'all') {
          const totalBalances = allData.bankAccounts.reduce((acc, account) => { acc[account.currency] = (acc[account.currency] || 0) + account.balance; return acc; }, {});
          const balanceText = Object.entries(totalBalances).map(([currency, balance]) => formatCurrency(balance, currency)).join(' + ');
          addMessage('bot', t('chatbot.totalBalance', { balance: balanceText }));
        } else {
          const account = allData.bankAccounts.find(acc => acc.id === data.accountId);
          addMessage('bot', t('chatbot.accountBalance', { accountName: account.name, balance: formatCurrency(account.balance, account.currency) }));
        }
        setTimeout(resetChat, 3000);
      },
      makeTransfer_askFromAccount: () => addMessage('bot', t('chatbot.transfer.askFrom'), allData.bankAccounts.map(acc => ({ text: `${acc.name} (${formatCurrency(acc.balance, acc.currency)})`, step: 'makeTransfer_askToAccount', data: { from_id: acc.id } }))),
      makeTransfer_askToAccount: () => {
        const toAccounts = allData.bankAccounts.filter(acc => acc.id !== newTempData.from_id);
        const toGoals = allData.savingsGoals;
        const transferToOptions = [
            ...toAccounts.map(acc => ({ text: `${t('account')}: ${acc.name}`, step: 'makeTransfer_askAmount', data: { to_id: acc.id, to_type: 'account' }})),
            ...toGoals.map(goal => ({ text: `${t('goal')}: ${goal.name}`, step: 'makeTransfer_askAmount', data: { to_id: goal.id, to_type: 'goal' }}))
        ];
        addMessage('bot', t('chatbot.transfer.askTo'), transferToOptions);
      },
      makeTransfer_askAmount: () => addMessage('bot', t('chatbot.askAmount')),
      makeTransfer_confirm: () => {
        const finalData = { ...newTempData, ...data };
        const fromAccount = allData.bankAccounts.find(a => a.id === finalData.from_id);
        let toName = '';
        if (finalData.to_type === 'account') {
            toName = allData.bankAccounts.find(a => a.id === finalData.to_id).name;
        } else {
            toName = allData.savingsGoals.find(g => g.id === finalData.to_id).name;
        }
        addMessage('bot', t('chatbot.transfer.confirm', { amount: formatCurrency(finalData.amount, fromAccount.currency), fromAccount: fromAccount.name, toName: toName }), [{ text: t('confirm'), step: 'makeTransfer_execute', data: finalData }, { text: t('cancel'), step: 'start' }]);
      },
      makeTransfer_execute: () => {
        const { from_id, to_id, to_type, amount } = data;
        const fromAccount = allData.bankAccounts.find(a => a.id === from_id);
        if (fromAccount.balance < amount) {
            addMessage('bot', t('toast.insufficientBalanceError'));
            setTimeout(resetChat, 3000);
            return;
        }
        const updatedAccounts = [...allData.bankAccounts];
        const updatedGoals = [...allData.savingsGoals];
        const fromAccountIndex = updatedAccounts.findIndex(a => a.id === from_id);
        updatedAccounts[fromAccountIndex].balance -= amount;
        if (to_type === 'account') {
            const toAccountIndex = updatedAccounts.findIndex(a => a.id === to_id);
            updatedAccounts[toAccountIndex].balance += amount;
        } else {
            const toGoalIndex = updatedGoals.findIndex(g => g.id === to_id);
            updatedGoals[toGoalIndex].current_amount += amount;
        }
        const newTransfer = { id: Date.now(), from_id, to_id, from_amount: amount, to_amount: amount, from_currency: fromAccount.currency, to_currency: to_type === 'account' ? updatedAccounts.find(a => a.id === to_id).currency : fromAccount.currency, date: format(new Date(), 'yyyy-MM-dd') };
        updateAllData({ bankAccounts: updatedAccounts, savingsGoals: updatedGoals, transfers: [...allData.transfers, newTransfer] });
        toast({ title: t('toast.transferSuccess'), description: t('toast.transferSuccessMessage') });
        addMessage('bot', t('chatbot.done'));
        setTimeout(resetChat, 2000);
      },
    };

    if (flowHandlers[nextStep]) {
      flowHandlers[nextStep]();
    }
  }, [allData, tempData, t, resetChat, updateAllData, toast]);

  const handleOptionClick = (option) => {
    addMessage('user', option.text);
    processStep(option.step, option.data);
  };

  const handleTextInput = (text) => {
    addMessage('user', text);
    const numValue = parseFloat(text.replace(',', '.'));

    if (currentStep.includes('askAmount')) {
      if (isNaN(numValue) || numValue <= 0) {
        addMessage('bot', t('chatbot.invalidAmount'));
        return;
      }
      let nextFlowStep = '';
      if (currentStep.startsWith('addExpense')) nextFlowStep = 'addExpense_askCategory';
      else if (currentStep.startsWith('addIncome')) nextFlowStep = 'addIncome_askCategory';
      else if (currentStep.startsWith('makeTransfer')) nextFlowStep = 'makeTransfer_confirm';
      
      processStep(nextFlowStep, { amount: numValue });

    } else if (currentStep.includes('askDescription')) {
      const nextFlowStep = currentStep.startsWith('addExpense') ? 'addExpense_confirm' : 'addIncome_confirm';
      processStep(nextFlowStep, { description: text });
    }
  };

  const handleDateChange = (date) => {
    if (!date) {
      addMessage('bot', t('chatbot.invalidDate'));
      return;
    }
    addMessage('user', format(date, 'dd/MM/yyyy'));
    let nextFlowStep = '';
    if (currentStep.startsWith('addExpense')) nextFlowStep = 'addExpense_askDescription';
    else if (currentStep.startsWith('addIncome')) nextFlowStep = 'addIncome_askDescription';
    
    processStep(nextFlowStep, { date: date.toISOString() });
  };

  const isInputStep = currentStep.includes('askAmount') || currentStep.includes('askDescription');
  const isDateStep = currentStep.includes('askDate');

  return {
    messages,
    currentStep,
    tempData,
    isInputStep,
    isDateStep,
    handleOptionClick,
    handleTextInput,
    handleDateChange,
    resetChat,
  };
};