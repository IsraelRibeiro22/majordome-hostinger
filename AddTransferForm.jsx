import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR, fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Send, Calendar as CalendarIcon, Info, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AddTransferForm = ({ allData, updateAllData }) => {
    const { t, i18n } = useTranslation(['transactions', 'common', 'toast']);
    const locale = i18n.language === 'fr' ? fr : ptBR;
    const { toast } = useToast();

    const initialTransferState = {
        from: '', to: '', amount: '',
        amountToSend: '', amountToReceive: '', 
        date: new Date(), description: ''
    };
    const [transfer, setTransfer] = useState(initialTransferState);

    const fromAccount = useMemo(() => 
        allData.bankAccounts.find(acc => String(acc.id) === transfer.from),
        [transfer.from, allData.bankAccounts]
    );

    const toAccount = useMemo(() => 
        allData.bankAccounts.find(acc => String(acc.id) === transfer.to),
        [transfer.to, allData.bankAccounts]
    );

    const isMultiCurrency = useMemo(() => 
        fromAccount && toAccount && fromAccount.currency !== toAccount.currency,
        [fromAccount, toAccount]
    );

    useEffect(() => {
        if (!isMultiCurrency) {
            setTransfer(prev => ({ ...prev, amountToSend: '', amountToReceive: '' }));
        } else {
            setTransfer(prev => ({ ...prev, amount: '' }));
        }
    }, [isMultiCurrency]);

    const exchangeRate = useMemo(() => {
        if (!isMultiCurrency) return null;
        const send = parseFloat(transfer.amountToSend);
        const receive = parseFloat(transfer.amountToReceive);
        if (send > 0 && receive > 0) {
            return (receive / send).toFixed(6);
        }
        return null;
    }, [isMultiCurrency, transfer.amountToSend, transfer.amountToReceive]);

    const formatCurrency = (value, currency) => {
        const lang = i18n.language === 'fr' ? 'fr-FR' : 'pt-BR';
        return new Intl.NumberFormat(lang, { style: 'currency', currency }).format(value || 0);
    };

    const handleTransfer = () => {
        const { from, to, amount, amountToSend, amountToReceive, date, description } = transfer;
        
        const isMulti = fromAccount && toAccount && fromAccount.currency !== toAccount.currency;
        
        const sendAmount = parseFloat(isMulti ? amountToSend : amount);
        const receiveAmount = parseFloat(isMulti ? amountToReceive : amount);

        if (!from || !to || !sendAmount || sendAmount <= 0 || (isMulti && (!receiveAmount || receiveAmount <= 0))) {
            toast({ title: t('toast:invalidData'), description: t('toast:fillAllFields'), variant: "destructive" });
            return;
        }
        
        if (fromAccount.current_balance < sendAmount) {
            toast({ title: t('toast:insufficientBalance'), description: t('toast:insufficientBalanceError'), variant: "destructive" });
            return;
        }

        const newTransfer = {
            id: crypto.randomUUID(),
            from_id: parseInt(from), 
            to_id: parseInt(to),
            from_amount: sendAmount, 
            to_amount: receiveAmount,
            from_currency: fromAccount.currency,
            to_currency: toAccount.currency,
            date: date.toISOString().split('T')[0],
            description: description || `${t('transfer')} ${t('from')} ${fromAccount.name} ${t('to')} ${toAccount.name}`
        };

        updateAllData({}, { operation: 'add', table: 'transfers', newRecord: newTransfer });
        toast({ title: t('toast:transferSuccess'), description: t('toast:transferSuccessMessage') });
        setTransfer(initialTransferState);
    };

    return (
        <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>{t('sourceAccount')}</Label>
                    <Select value={transfer.from} onValueChange={value => setTransfer({ ...transfer, from: value, to: '' })}>
                        <SelectTrigger><SelectValue placeholder={t('sourceAccount')} /></SelectTrigger>
                        <SelectContent>{allData.bankAccounts.map(acc => <SelectItem key={acc.id} value={String(acc.id)}>{acc.name} ({acc.currency})</SelectItem>)}</SelectContent>
                    </Select>
                    {fromAccount && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Wallet size={12} />
                            {t('common:balance')}: {formatCurrency(fromAccount.current_balance, fromAccount.currency)}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label>{t('destinationAccount')}</Label>
                    <Select value={transfer.to} onValueChange={value => setTransfer({ ...transfer, to: value })} disabled={!transfer.from}>
                        <SelectTrigger><SelectValue placeholder={t('destinationAccount')} /></SelectTrigger>
                        <SelectContent>{allData.bankAccounts.filter(acc => String(acc.id) !== transfer.from).map(acc => <SelectItem key={acc.id} value={String(acc.id)}>{acc.name} ({acc.currency})</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>

            {isMultiCurrency ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                        <Label htmlFor="amountToSend">{t('amountToSend')} ({fromAccount?.currency})</Label>
                        <Input id="amountToSend" type="number" step="0.01" value={transfer.amountToSend} onChange={e => setTransfer({ ...transfer, amountToSend: e.target.value })} placeholder="1000.00" />
                    </div>
                    <div>
                        <Label htmlFor="amountToReceive">{t('amountToReceive')} ({toAccount?.currency})</Label>
                        <Input id="amountToReceive" type="number" step="0.01" value={transfer.amountToReceive} onChange={e => setTransfer({ ...transfer, amountToReceive: e.target.value })} placeholder="180.00" />
                    </div>
                    {exchangeRate && (
                        <div className="md:col-span-2 bg-blue-50 dark:bg-slate-800 p-3 rounded-md flex items-center text-sm text-blue-800 dark:text-blue-200">
                            <Info className="h-5 w-5 mr-3 flex-shrink-0" />
                            <span>{t('exchangeRateInfo', { fromCurrency: fromAccount.currency, toCurrency: toAccount.currency, rate: exchangeRate })}</span>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <Label htmlFor="amount">{t('common:amount')}</Label>
                    <Input id="amount" type="number" step="0.01" value={transfer.amount} onChange={e => setTransfer({ ...transfer, amount: e.target.value })} placeholder={t('common:amount')} />
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="description">{t('common:description')} ({t('common:optional')})</Label>
                <Input id="description" value={transfer.description} onChange={e => setTransfer({ ...transfer, description: e.target.value })} placeholder={t('transferDescriptionPlaceholder')} />
            </div>

            <div className="space-y-2">
                <Label>{t('common:date')}</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !transfer.date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {transfer.date ? format(transfer.date, "PPP", { locale }) : <span>{t('common:selectDate')}</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={transfer.date} onSelect={date => setTransfer(prev => ({ ...prev, date }))} initialFocus locale={locale} /></PopoverContent>
                </Popover>
            </div>

            <div className="flex justify-end"><Button onClick={handleTransfer} className="bg-gradient-to-r from-cyan-500 to-sky-600"><Send className="h-4 w-4 mr-2" />{t('common:confirm')}</Button></div>
        </div>
    );
};

export default AddTransferForm;