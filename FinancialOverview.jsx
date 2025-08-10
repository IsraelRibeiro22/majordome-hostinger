import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const FinancialOverview = ({ userData, settings }) => {
  const { t, i18n } = useTranslation('common');

  const { incomeByCurrency, expensesByCurrency } = userData;
  const selectedCurrencies = settings.selectedCurrencies || [];
  const numCurrencies = selectedCurrencies.length;

  const formatCurrency = (value, currency) => {
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'pt-BR';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  };

  const gridClasses = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
  };
  
  const gridLayoutClass = gridClasses[numCurrencies] || 'lg:grid-cols-3';

  return (
    <motion.div
      className="financial-card rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">{t('financialOverview.periodSummaryTitle')}</h2>
      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", gridLayoutClass)}>
        {selectedCurrencies.map((currency, index) => {
          const income = incomeByCurrency?.[currency] || 0;
          const expense = expensesByCurrency?.[currency] || 0;
          const result = income - expense;

          return (
            <motion.div
              key={currency}
              className="bg-white/30 dark:bg-slate-800/50 rounded-lg p-4 border border-white/20 dark:border-slate-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">{currency}</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                    <span>{t('periodRevenue')}</span>
                  </div>
                  <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(income, currency)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
                    <span>{t('periodExpenses')}</span>
                  </div>
                  <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(expense, currency)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-slate-700 my-2"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Scale className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{t('periodResult')}</span>
                  </div>
                  <span className={`font-bold text-lg ${result >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(result, currency)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
        {numCurrencies === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            <p>{t('settings:currency.noSelection')}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FinancialOverview;