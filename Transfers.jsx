import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Send, Repeat, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR, fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const Transfers = ({ allData, updateAllData }) => {
    const { t, i18n } = useTranslation(['transactions', 'common', 'toast']);
    const locale = i18n.language === 'fr' ? fr : ptBR;
    const [showForm, setShowForm] = useState(false);
    const [transfer, setTransfer] = useState({
        from: '',
        to: '',
        amount: '',
        toType: 'account',
        amountToSend: '',
        amountToReceive: '',
        date: new Date(),
    });
    const { toast } = useToast();

    const fromAccount = allData.bankAccounts.find(acc => acc.id === parseInt(transfer.from));
    const toAccount = transfer.toType === 'account' ? allData.bankAccounts.find(acc => acc.id === parseInt(transfer.to)) : null;

    const isCrossCurrency = fromAccount && toAccount && fromAccount.currency !== toAccount.currency;

    const effectiveRate = useMemo(() => {
        if (isCrossCurrency) {
            const send = parseFloat(transfer.amountToSend);
            const receive = parseFloat(transfer.amountToReceive);
            if (send > 0 && receive > 0) {
                return (receive / send).toFixed(4);
            }
        }
        return null;
    }, [isCrossCurrency, transfer.amountToSend, transfer.amountToReceive]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTransfer(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date) => {
        setTransfer(prev => ({ ...prev, date }));
    };

    const handleTransfer = () => {
        const { from, to, toType, amount, amountToSend, amountToReceive, date } = transfer;
        
        const sendAmount = isCrossCurrency ? parseFloat(amountToSend) : parseFloat(amount);
        const receiveAmount = isCrossCurrency ? parseFloat(amountToReceive) : parseFloat(amount);

        if (!from || !to || !sendAmount || sendAmount <= 0) {
            toast({ title: t('toast:invalidData'), description: t('toast:fillAllRequiredFields'), variant: "destructive" });
            return;
        }

        const sourceAccount = allData.bankAccounts.find(acc => acc.id === parseInt(from));
        
        if (sourceAccount.current_balance < sendAmount) {
            toast({ title: t('toast:insufficientBalance'), description: t('toast:insufficientBalanceError'), variant: "destructive" });
            return;
        }
        
        const updatedAccounts = [...allData.bankAccounts];
        const updatedGoals = [...allData.savingsGoals];

        const fromAccountIndex = updatedAccounts.findIndex(acc => acc.id === parseInt(from));
        updatedAccounts[fromAccountIndex] = { ...updatedAccounts[fromAccountIndex], current_balance: updatedAccounts[fromAccountIndex].current_balance - sendAmount };

        if (toType === 'account') {
            const toAccountIndex = updatedAccounts.findIndex(acc => acc.id === parseInt(to));
            updatedAccounts[toAccountIndex] = { ...updatedAccounts[toAccountIndex], current_balance: updatedAccounts[toAccountIndex].current_balance + receiveAmount };
        } else { // toType === 'goal'
            const toGoalIndex = updatedGoals.findIndex(g => g.id === parseInt(to));
            updatedGoals[toGoalIndex] = { ...updatedGoals[toGoalIndex], current_amount: updatedGoals[toGoalIndex].current_amount + sendAmount };
        }

        const newTransfer = {
            id: Date.now(),
            from_id: parseInt(from),
            to_id: parseInt(to),
            from_amount: sendAmount,
            to_amount: receiveAmount,
            from_currency: fromAccount.currency,
            to_currency: toType === 'account' ? toAccount.currency : fromAccount.currency,
            date: date.toISOString().split('T')[0],
            description: `${t('transfer')} ${t('from')} ${fromAccount.name} ${t('to')} ${toType === 'account' ? toAccount.name : allData.savingsGoals.find(g => g.id === parseInt(to)).name}`
        };

        updateAllData({
            bankAccounts: updatedAccounts,
            savingsGoals: updatedGoals,
            transfers: [...(allData.transfers || []), newTransfer]
        });

        toast({ title: t('toast:transferSuccess'), description: t('toast:transferSuccessMessage') });
        setShowForm(false);
        setTransfer({ from: '', to: '', amount: '', toType: 'account', amountToSend: '', amountToReceive: '', date: new Date() });
    };

    const fromAccounts = allData.bankAccounts;
    const toAccounts = allData.bankAccounts.filter(acc => acc.id !== parseInt(transfer.from));
    const toGoals = allData.savingsGoals;
    
    const getCurrencySymbol = (currencyCode) => {
        const symbols = { 'BRL': 'R$', 'USD': '$', 'EUR': '€' };
        return symbols[currencyCode] || currencyCode;
    };

    return (
        <motion.div className="financial-card rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('transfers')}</h2>
                <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 dark:from-cyan-600 dark:to-sky-700 dark:hover:from-cyan-700 dark:hover:to-sky-800">
                    <ArrowRightLeft className="h-4 w-4 mr-1" /> {t('transferTitle')}
                </Button>
            </div>

            {showForm && (
                <motion.div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4 mt-4 border border-white/30 dark:border-slate-700" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('from')}</label>
                            <select name="from" value={transfer.from} onChange={e => setTransfer({ ...transfer, from: e.target.value, to: '' })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm">
                                <option value="" disabled>{t('sourceAccount')}</option>
                                {fromAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({getCurrencySymbol(acc.currency)})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('to')}</label>
                             <div className="flex gap-2 mb-2">
                                <Button size="sm" variant={transfer.toType === 'account' ? 'default' : 'outline'} onClick={() => setTransfer({...transfer, toType: 'account', to: ''})} className="text-xs">{t('account')}</Button>
                                <Button size="sm" variant={transfer.toType === 'goal' ? 'default' : 'outline'} onClick={() => setTransfer({...transfer, toType: 'goal', to: ''})} className="text-xs">{t('goal')}</Button>
                            </div>
                            <select name="to" value={transfer.to} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" disabled={!transfer.from}>
                                <option value="" disabled>{t('destination')}</option>
                                {transfer.toType === 'account' && toAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({getCurrencySymbol(acc.currency)})</option>)}
                                {transfer.toType === 'goal' && toGoals.map(goal => <option key={goal.id} value={goal.id}>{goal.name}</option>)}
                            </select>
                        </div>
                        
                        {isCrossCurrency && transfer.toType === 'account' ? (
                             <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amountToSendLabel')} ({fromAccount.currency}):</label>
                                    <input type="number" name="amountToSend" step="0.01" value={transfer.amountToSend} onChange={handleInputChange} placeholder="0,00" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
                                </div>
                                <div className="text-center my-2 text-gray-600 dark:text-gray-400">
                                    <Repeat className="inline-block h-4 w-4" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amountToReceiveLabel')} ({toAccount.currency}):</label>
                                    <input type="number" name="amountToReceive" step="0.01" value={transfer.amountToReceive} onChange={handleInputChange} placeholder="0,00" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
                                </div>
                                {effectiveRate && (
                                    <div className="mt-2 text-center text-sm text-gray-600 dark:text-cyan-300 bg-blue-100/50 dark:bg-cyan-900/30 p-2 rounded-md">
                                        {t('exchangeRateInfo', { fromCurrency: fromAccount.currency, toCurrency: toAccount.currency, rate: effectiveRate })}
                                    </div>
                                )}
                             </>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('common:amount')}:</label>
                                <input type="number" name="amount" step="0.01" value={transfer.amount} onChange={handleInputChange} placeholder="0,00" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('date')}</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !transfer.date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {transfer.date ? format(transfer.date, "PPP", { locale }) : <span>{t('common:selectDate')}</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={transfer.date}
                                        onSelect={handleDateChange}
                                        initialFocus
                                        locale={locale}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                     <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>{t('common:cancel')}</Button>
                        <Button size="sm" onClick={handleTransfer} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                           <Send className="h-4 w-4 mr-1" /> {t('common:confirm')}
                        </Button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Transfers;