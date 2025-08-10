import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { parseISO, isWithinInterval } from 'date-fns';
import { useDate } from '@/contexts/DateContext';
import { Badge } from '@/components/ui/badge';

const ConsolidatedStatement = ({ allData, accountId }) => {
  const { t, i18n } = useTranslation(['statement', 'common', 'transactions']);
  const { formatDate, currentPeriod } = useDate();
  
  const formatCurrency = (value, currency) => {
    const lang = i18n.language === 'fr' ? 'fr-FR' : 'pt-BR';
    const currencyCode = currency || 'BRL';
    return new Intl.NumberFormat(lang, { style: 'currency', currency: currencyCode }).format(value || 0);
  };

  const findAccountName = (id) => (allData.bankAccounts || []).find(a => a.id === id)?.name || t('common:unknownAccount');

  const statementData = useMemo(() => {
    if (!accountId || !currentPeriod?.start || !currentPeriod?.end) {
      return { rows: [], initialBalance: 0, finalBalance: 0 };
    }

    const { start, end } = currentPeriod;
    
    const account = allData.bankAccounts.find(acc => acc.id === accountId);
    if (!account) return { rows: [], initialBalance: 0, finalBalance: 0 };

    const allTransactions = [
      ...(allData.income || []).map(tx => ({ ...tx, type: 'income', amount: tx.amount, account_id: tx.account_id })),
      ...(allData.expenses || []).map(tx => ({ ...tx, type: 'expense', amount: -tx.amount, account_id: tx.account_id })),
      ...(allData.transfers || []).flatMap(tx => {
        const transfers = [];
        if (tx.from_id === accountId) {
            transfers.push({ id: tx.id, date: tx.date, description: `${t('transactions:to')} ${findAccountName(tx.to_id)}`, amount: -tx.from_amount, category: t('transactions:types.transfer'), type: 'transfer_out', account_id: tx.from_id });
        }
        if (tx.to_id === accountId) {
            transfers.push({ id: tx.id, date: tx.date, description: `${t('transactions:from')} ${findAccountName(tx.from_id)}`, amount: tx.to_amount, category: t('transactions:types.transfer'), type: 'transfer_in', account_id: tx.to_id });
        }
        return transfers;
      }),
    ].filter(tx => tx.account_id === accountId)
     .sort((a, b) => parseISO(a.date) - parseISO(b.date));
    
    const initialBalance = allTransactions
      .filter(tx => parseISO(tx.date) < start)
      .reduce((sum, tx) => sum + tx.amount, account.initial_balance || 0);
      
    let runningBalance = initialBalance;
    
    const rows = allTransactions
      .filter(tx => {
        const txDate = parseISO(tx.date);
        return isWithinInterval(txDate, { start, end });
      })
      .map(tx => {
        runningBalance += tx.amount;
        return {
          ...tx,
          credit: tx.amount > 0 ? tx.amount : null,
          debit: tx.amount < 0 ? Math.abs(tx.amount) : null,
          balanceAfter: runningBalance,
        };
      });

    return { rows, initialBalance, finalBalance: runningBalance, currency: account.currency };
  }, [allData, accountId, currentPeriod, t, findAccountName]);

  const allCategories = useMemo(() => {
    const incomeCats = (allData.incomeCategories || []).map(c => ({ ...c, key: `income-${c.name}` }));
    const expenseCats = (allData.expenseCategories || []).map(c => ({ ...c, key: `expense-${c.name}` }));
    return [...incomeCats, ...expenseCats, { name: t('transactions:types.transfer'), color: 'bg-cyan-500', key: 'transfer' }];
  }, [allData.incomeCategories, allData.expenseCategories, t]);
  
  const getCategoryColor = (name) => allCategories.find(c => c.name === name)?.color || 'bg-gray-400';

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-slate-800 dark:text-gray-400 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-4 py-3 min-w-[120px]">{t('statement:date')}</th>
              <th scope="col" className="px-4 py-3 min-w-[150px]">{t('common:category')}</th>
              <th scope="col" className="px-4 py-3 min-w-[250px]">{t('common:description')}</th>
              <th scope="col" className="px-4 py-3 text-right min-w-[120px]">{t('statement:incomes')}</th>
              <th scope="col" className="px-4 py-3 text-right min-w-[120px]">{t('statement:expenses')}</th>
              <th scope="col" className="px-4 py-3 text-right min-w-[150px]">{t('statement:balance')}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white dark:bg-slate-800/50 font-semibold border-b dark:border-slate-700">
                <td colSpan="5" className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">{t('statement:initialBalance')}</td>
                <td className={`px-4 py-3 text-right font-bold ${statementData.initialBalance < 0 ? 'text-red-700' : 'text-blue-600 dark:text-blue-400'}`}>
                    {formatCurrency(statementData.initialBalance, statementData.currency)}
                </td>
            </tr>
            {statementData.rows.map((row, index) => (
              <tr key={row.id + '-' + index + '-' + row.type} className="bg-white border-b dark:bg-slate-900/50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-2">{formatDate(row.date)}</td>
                <td className="px-4 py-2">
                    <Badge variant="outline" className={`border-transparent ${getCategoryColor(row.category)} text-white`}>
                        {row.category}
                    </Badge>
                </td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{row.description}</td>
                <td className="px-4 py-2 text-right font-semibold text-green-600 dark:text-green-400">
                    {row.credit ? formatCurrency(row.credit, statementData.currency) : ''}
                </td>
                <td className="px-4 py-2 text-right font-semibold text-red-600 dark:text-red-400">
                    {row.debit ? formatCurrency(row.debit, statementData.currency) : ''}
                </td>
                <td className={`px-4 py-2 text-right font-bold ${row.balanceAfter < 0 ? 'text-red-700' : 'text-blue-600 dark:text-blue-400'}`}>
                    {formatCurrency(row.balanceAfter, statementData.currency)}
                </td>
              </tr>
            ))}
            {statementData.rows.length === 0 && (
                <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-500">
                        {t('statement:noTransactionsInPeriod')}
                    </td>
                </tr>
            )}
            <tr className="bg-gray-100 dark:bg-slate-800 font-bold text-gray-900 dark:text-white border-t-2 dark:border-slate-700 sticky bottom-0">
                <td colSpan="5" className="px-4 py-3">{t('statement:finalBalance')}</td>
                <td className={`px-4 py-3 text-right font-extrabold ${statementData.finalBalance < 0 ? 'text-red-700' : 'text-blue-600 dark:text-blue-400'}`}>
                    {formatCurrency(statementData.finalBalance, statementData.currency)}
                </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsolidatedStatement;