import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDate } from '@/contexts/DateContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { generateForecast } from '@/lib/forecastHelper';

const FutureForecastTable = ({ allData, account }) => {
    const { t, i18n } = useTranslation(['forecast', 'statement']);
    const { formatDate } = useDate();
    const [days, setDays] = useState(7);

    const formatCurrency = (value, currency) => {
        if (value === null || value === undefined) return '';
        const lang = i18n.language === 'fr' ? 'fr-FR' : 'pt-BR';
        return new Intl.NumberFormat(lang, { style: 'currency', currency: currency || 'BRL' }).format(value);
    };

    const forecastTransactions = useMemo(() => {
        if (!account) return [];
        const { transactions } = generateForecast(allData, account.id, days);
        return transactions;
    }, [allData, account, days]);

    if (!account) {
        return <div className="p-4 text-center">{t('statement:selectAnAccount')}</div>;
    }

    return (
        <div className="flex flex-col h-full p-4">
            <div className="flex-shrink-0 flex items-center justify-center gap-2 mb-4">
                <Button onClick={() => setDays(7)} variant={days === 7 ? 'default' : 'outline'}>{t('next7days')}</Button>
                <Button onClick={() => setDays(15)} variant={days === 15 ? 'default' : 'outline'}>{t('next15days')}</Button>
                <Button onClick={() => setDays(30)} variant={days === 30 ? 'default' : 'outline'}>{t('next30days')}</Button>
            </div>
            <ScrollArea className="flex-grow">
                <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 dark:bg-slate-800 z-10">
                        <TableRow>
                            <TableHead className="w-[120px]">{t('statement:date')}</TableHead>
                            <TableHead>{t('statement:category')}</TableHead>
                            <TableHead>{t('statement:description')}</TableHead>
                            <TableHead className="text-right">{t('statement:income')}</TableHead>
                            <TableHead className="text-right">{t('statement:expenses')}</TableHead>
                            <TableHead className="text-right">{t('statement:balance')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {forecastTransactions.length > 0 ? (
                            forecastTransactions.map(tx => (
                                <TableRow key={tx.id}>
                                    <TableCell>{formatDate(tx.date)}</TableCell>
                                    <TableCell>{tx.category}</TableCell>
                                    <TableCell>{tx.description}</TableCell>
                                    <TableCell className="text-right text-green-600 dark:text-green-400">
                                        {tx.type === 'income' ? formatCurrency(tx.amount, account.currency) : ''}
                                    </TableCell>
                                    <TableCell className="text-right text-red-600 dark:text-red-400">
                                        {tx.type === 'expense' ? formatCurrency(tx.amount, account.currency) : ''}
                                    </TableCell>
                                    <TableCell className={`text-right font-semibold ${tx.balance < 0 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {formatCurrency(tx.balance, account.currency)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan="6" className="h-24 text-center">
                                    {t('noFutureTransactions')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    );
};

export default FutureForecastTable;