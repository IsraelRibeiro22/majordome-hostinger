import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDate } from '@/contexts/DateContext';
import { Button } from '@/components/ui/button';
import { generateForecast } from '@/lib/forecastHelper';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, TrendingUp, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const FutureForecastChart = ({ allData, accountId, updateAllData }) => {
    const { t, i18n } = useTranslation(['forecast', 'common', 'toast']);
    const { formatDate, locale } = useDate();
    const { toast } = useToast();
    const [days, setDays] = useState(7);
    const [negativeAlert, setNegativeAlert] = useState(null);

    const formatCurrency = (value, currency) => {
        const lang = i18n.language === 'fr' ? 'fr-FR' : 'pt-BR';
        return new Intl.NumberFormat(lang, { style: 'currency', currency: currency || 'BRL' }).format(value);
    };

    const forecastData = useMemo(() => {
        const data = generateForecast(allData, accountId, days);
        const dailySummary = data.dailySummary;
        const firstNegativeDay = dailySummary.find(d => d.balance < 0);
        
        if (firstNegativeDay && !negativeAlert) {
            const selectedAccount = allData.bankAccounts.find(acc => acc.id === accountId);
            const sourceAccount = allData.bankAccounts.find(acc => 
                acc.id !== accountId && 
                acc.currency === selectedAccount.currency && 
                acc.current_balance > Math.abs(firstNegativeDay.balance)
            );
            setNegativeAlert({
                date: firstNegativeDay.date,
                amountNeeded: Math.abs(firstNegativeDay.balance) + (selectedAccount.min_balance || 0),
                currency: selectedAccount.currency,
                sourceAccount
            });
        } else if (!firstNegativeDay) {
            setNegativeAlert(null);
        }

        return dailySummary;
    }, [allData, accountId, days, negativeAlert]);

    const handleTransfer = useCallback(() => {
        if (!negativeAlert?.sourceAccount) {
            toast({ title: t('toast:error'), description: t('toast:noSourceAccount'), variant: 'destructive' });
            return;
        }
        
        const transfer = {
            id: crypto.randomUUID(),
            description: t('balanceCorrectionTransfer'),
            from_id: negativeAlert.sourceAccount.id,
            to_id: accountId,
            from_amount: negativeAlert.amountNeeded,
            to_amount: negativeAlert.amountNeeded,
            date: new Date().toISOString().split('T')[0],
        };

        updateAllData({}, { operation: 'add', table: 'transfers', newRecord: transfer });
        toast({ title: t('toast:success'), description: t('toast:transferCompleted') });
        setNegativeAlert(null);

    }, [negativeAlert, accountId, updateAllData, t, toast]);


    return (
        <div className="flex flex-col h-full p-4">
            <div className="flex-shrink-0 flex items-center justify-center gap-2 mb-4">
                <Button onClick={() => setDays(7)} variant={days === 7 ? 'default' : 'outline'}>{t('next7days')}</Button>
                <Button onClick={() => setDays(15)} variant={days === 15 ? 'default' : 'outline'}>{t('next15days')}</Button>
                <Button onClick={() => setDays(30)} variant={days === 30 ? 'default' : 'outline'}>{t('next30days')}</Button>
            </div>

            <AnimatePresence>
                {negativeAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-4 mb-4 bg-amber-100 dark:bg-amber-900/50 border-l-4 border-amber-500 rounded-r-lg"
                    >
                        <div className="flex items-start">
                            <AlertTriangle className="h-6 w-6 text-amber-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-amber-800 dark:text-amber-200">{t('negativeBalanceAlert.title')}</p>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    {t('negativeBalanceAlert.description', { date: formatDate(negativeAlert.date) })}
                                </p>
                                {negativeAlert.sourceAccount ? (
                                    <>
                                        <p className="text-sm mt-2">
                                            {t('negativeBalanceAlert.suggestion', { 
                                                amount: formatCurrency(negativeAlert.amountNeeded, negativeAlert.currency),
                                                account: negativeAlert.sourceAccount.name
                                            })}
                                        </p>
                                        <Button size="sm" className="mt-2 bg-amber-500 hover:bg-amber-600 text-white" onClick={handleTransfer}>
                                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                                            {t('negativeBalanceAlert.transferNow')}
                                        </Button>
                                    </>
                                ) : (
                                    <p className="text-sm mt-2 text-red-600 dark:text-red-400 font-semibold">
                                        {t('negativeBalanceAlert.noSufficientFunds')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ScrollArea className="flex-grow">
                <div className="space-y-2 pr-4">
                    {forecastData.map((day, index) => (
                        <motion.div
                            key={day.date}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`p-3 rounded-lg ${day.balance < 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-slate-800/50'}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                                    {new Date(day.date).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
                                </span>
                                <span className={`font-bold text-xl ${day.balance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {formatCurrency(day.balance, day.currency)}
                                </span>
                            </div>
                            {day.transactions.length > 0 && (
                                <div className="space-y-1 pl-4 border-l-2 border-gray-300 dark:border-slate-600 ml-2">
                                    {day.transactions.map((tx, txIndex) => (
                                        <div key={txIndex} className="text-sm flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                {tx.type === 'income' ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                                                <span>{tx.description}</span>
                                            </div>
                                            <span className={tx.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                                {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount, day.currency)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

export default FutureForecastChart;