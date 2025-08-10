import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDate } from '@/contexts/DateContext';
import { getForecast } from '@/lib/forecastHelper';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const FutureForecast = ({ allData, accountId }) => {
    const { t, i18n } = useTranslation(['forecast', 'common', 'transactions']);
    const { formatDate } = useDate();
    const [forecastDays, setForecastDays] = useState(30);

    const formatCurrency = (value, currency) => {
        const lang = i18n.language === 'fr' ? 'fr-FR' : 'pt-BR';
        const currencyCode = currency || 'BRL';
        return new Intl.NumberFormat(lang, { style: 'currency', currency: currencyCode }).format(value || 0);
    };

    const forecastData = useMemo(() => {
        if (!accountId) return { transactions: [], negativeBalanceDate: null, currency: 'BRL' };
        return getForecast(allData, accountId, forecastDays);
    }, [allData, accountId, forecastDays]);

    const allCategories = useMemo(() => {
        const incomeCats = (allData.incomeCategories || []).map(c => ({ ...c, key: `income-${c.name}` }));
        const expenseCats = (allData.expenseCategories || []).map(c => ({ ...c, key: `expense-${c.name}` }));
        return [...incomeCats, ...expenseCats, { name: t('transactions:types.transfer'), color: 'bg-cyan-500', key: 'transfer' }];
    }, [allData.incomeCategories, allData.expenseCategories, t]);

    const getCategoryColor = (name) => allCategories.find(c => c.name === name)?.color || 'bg-gray-400';

    const NegativeBalanceAlert = () => {
        const firstNegative = forecastData.transactions.find(tx => tx.balance < 0);
        return (
            firstNegative && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4 flex items-start"
                >
                    <AlertCircle className="h-5 w-5 mr-3 mt-1 text-red-500" />
                    <div>
                        <p className="font-bold">{t('negativeBalanceAlertTitle')}</p>
                        <p>{t('negativeBalanceAlertText', { date: formatDate(firstNegative.date) })}</p>
                    </div>
                </motion.div>
            )
        );
    }

    return (
        <div className="h-full flex flex-col p-0">
            <div className="flex-shrink-0 px-6 pt-4 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        {[7, 15, 30].map(days => (
                            <Button
                                key={days}
                                variant={forecastDays === days ? 'default' : 'outline'}
                                onClick={() => setForecastDays(days)}
                                className="transition-all duration-200"
                            >
                                {t('common:days', { count: days })}
                            </Button>
                        ))}
                    </div>
                </div>
                <AnimatePresence>
                    <NegativeBalanceAlert />
                </AnimatePresence>
            </div>
            <div className="flex-grow overflow-auto px-6">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-slate-800 dark:text-gray-400 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-4 py-3 min-w-[120px]">{t('common:date')}</th>
                            <th scope="col" className="px-4 py-3 min-w-[150px]">{t('common:category')}</th>
                            <th scope="col" className="px-4 py-3 min-w-[250px]">{t('common:description')}</th>
                            <th scope="col" className="px-4 py-3 text-right min-w-[120px]">{t('common:incomes')}</th>
                            <th scope="col" className="px-4 py-3 text-right min-w-[120px]">{t('common:expenses')}</th>
                            <th scope="col" className="px-4 py-3 text-right min-w-[150px]">{t('common:balance')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {forecastData.transactions.map((tx) => (
                            <tr key={tx.id} className="bg-white border-b dark:bg-slate-900/50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-2">{formatDate(tx.date)}</td>
                                <td className="px-4 py-2">
                                    <Badge variant="outline" className={`border-transparent ${getCategoryColor(tx.category)} text-white`}>
                                        {tx.category}
                                    </Badge>
                                </td>
                                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{tx.description}</td>
                                <td className="px-4 py-2 text-right font-semibold text-green-600 dark:text-green-400">
                                    {tx.type === 'income' ? formatCurrency(tx.amount, forecastData.currency) : ''}
                                </td>
                                <td className="px-4 py-2 text-right font-semibold text-red-600 dark:text-red-400">
                                    {tx.type === 'expense' ? formatCurrency(tx.amount, forecastData.currency) : ''}
                                </td>
                                <td className={`px-4 py-2 text-right font-bold ${tx.balance < 0 ? 'text-red-700' : 'text-blue-600 dark:text-blue-400'}`}>
                                    {formatCurrency(tx.balance, forecastData.currency)}
                                </td>
                            </tr>
                        ))}
                         {forecastData.transactions.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-gray-500">
                                    {t('noFutureTransactions')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FutureForecast;