import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { parseISO } from 'date-fns';
import { ArrowDown, ArrowUp, Scale, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDate } from '@/contexts/DateContext';

const TransactionTable = ({ transactions, type, currency, onEdit, onDelete, allData, t, formatCurrency }) => {
  const { formatDate } = useDate();
  return (
  <div className="flex-1">
    <h4 className={`text-lg font-semibold mb-2 flex items-center ${type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
      {t(type === 'income' ? 'evolution.income' : 'evolution.expenses')}
    </h4>
    <div className="overflow-y-auto max-h-48 pr-2 custom-scrollbar">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-gray-100 dark:bg-slate-700 z-10">
          <tr>
            <th className="text-left p-2 font-semibold">{t('common:description')}</th>
            <th className="text-left p-2 font-semibold">{t('common:category')}</th>
            <th className="text-right p-2 font-semibold">{t('common:amount')}</th>
            <th className="text-right p-2 font-semibold">{t('common:actions')}</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? transactions.map(tx => (
            <tr key={tx.id} className="border-b border-gray-200 dark:border-slate-700">
              <td className="p-2">
                <div className="font-medium">{tx.description}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{tx.accountName || allData.bankAccounts.find(a => a.id === tx.account_id)?.name} - {formatDate(tx.date)}</div>
              </td>
              <td className="p-2">{tx.category}</td>
              <td className="text-right p-2 font-mono">{formatCurrency(tx.amount, currency)}</td>
              <td className="p-2 text-right">
                {!tx.isProjected && (
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(tx)} className="h-7 w-7">
                      <Edit3 className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(tx)} className="h-7 w-7">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-500">{t('statement:noTransactions')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)};

const MonthlyDetailView = ({ data, currency, onEdit, onDelete, allData }) => {
  const { t, i18n } = useTranslation(['savings', 'common', 'statement', 'financialOverview']);
  if (!data) return null;

  const formatCurrency = (value, currencyCode) => {
    const lang = i18n.language === 'fr' ? 'fr-FR' : 'pt-BR';
    return new Intl.NumberFormat(lang, { style: 'currency', currency: currencyCode }).format(value || 0);
  };

  const { incomeTransactions, expenseTransactions, income, expenses, balance, fullPeriod } = data;

  return (
    <motion.div
      className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700"
      initial={{ opacity: 0, y: 20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: 20, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl font-bold mb-4 text-center">{t('common:monthlySummary')} - {fullPeriod}</h3>
      <div className="flex flex-col md:flex-row gap-6">
        <TransactionTable transactions={incomeTransactions} type="income" currency={currency} onEdit={onEdit} onDelete={onDelete} allData={allData} t={t} formatCurrency={formatCurrency} />
        <div className="border-l border-gray-200 dark:border-slate-700 mx-4 hidden md:block"></div>
        <TransactionTable transactions={expenseTransactions} type="expenses" currency={currency} onEdit={onEdit} onDelete={onDelete} allData={allData} t={t} formatCurrency={formatCurrency} />
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex flex-wrap justify-around items-center gap-4 text-center">
        <div className="text-green-500">
          <p className="text-sm font-semibold">{t('common:totalIncome')}</p>
          <p className="text-lg font-bold">{formatCurrency(income, currency)}</p>
        </div>
        <div className="text-red-500">
          <p className="text-sm font-semibold">{t('common:totalExpenses')}</p>
          <p className="text-lg font-bold">{formatCurrency(expenses, currency)}</p>
        </div>
        <div className={'text-blue-500'}>
          <p className="text-sm font-semibold flex items-center justify-center"><Scale className="mr-2 h-4 w-4" />{t('financialOverview:balance')}</p>
          <p className={`text-lg font-bold ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>{formatCurrency(balance, currency)}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default MonthlyDetailView;