import React, { useState, useEffect, useMemo } from 'react';
        import { useTranslation } from 'react-i18next';
        import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
        import { Button } from '@/components/ui/button';
        import { Input } from '@/components/ui/input';
        import { Label } from '@/components/ui/label';
        import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
        import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
        import { Calendar } from '@/components/ui/calendar';
        import { useToast } from '@/components/ui/use-toast';
        import { format, parseISO } from 'date-fns';
        import { ptBR, fr } from 'date-fns/locale';
        import { Calendar as CalendarIcon, Info } from 'lucide-react';
        import { cn } from '@/lib/utils';
        
        const TransactionEditDialog = ({ transaction, isOpen, onOpenChange, onSave, allData }) => {
            const { t, i18n } = useTranslation(['transactions', 'common', 'toast']);
            const { toast } = useToast();
            const locale = i18n.language === 'fr' ? fr : ptBR;
            
            const [formData, setFormData] = useState({});
        
            useEffect(() => {
                if (transaction) {
                    const date = transaction.date ? parseISO(transaction.date) : new Date();
                    setFormData({
                        ...transaction,
                        date: date,
                        amount: transaction.amount ? String(transaction.amount) : '',
                        account_id: transaction.account_id ? String(transaction.account_id) : '',
                        from_id: transaction.from_id ? String(transaction.from_id) : '',
                        to_id: transaction.to_id ? String(transaction.to_id) : '',
                        from_amount: transaction.from_amount ? String(transaction.from_amount) : '',
                        to_amount: transaction.to_amount ? String(transaction.to_amount) : '',
                    });
                }
            }, [transaction]);
        
            const handleInputChange = (e) => {
                const { name, value } = e.target;
                setFormData(prev => ({ ...prev, [name]: value }));
            };
        
            const handleSelectChange = (name, value) => {
                setFormData(prev => ({ ...prev, [name]: value }));
            };
        
            const handleDateChange = (date) => {
                setFormData(prev => ({ ...prev, date }));
            };
        
            const fromAccount = useMemo(() => 
                allData.bankAccounts.find(acc => String(acc.id) === formData.from_id),
                [formData.from_id, allData.bankAccounts]
            );
        
            const toAccount = useMemo(() => 
                allData.bankAccounts.find(acc => String(acc.id) === formData.to_id),
                [formData.to_id, allData.bankAccounts]
            );
        
            const isMultiCurrency = useMemo(() => 
                formData.type === 'transfer' && fromAccount && toAccount && fromAccount.currency !== toAccount.currency,
                [formData.type, fromAccount, toAccount]
            );
        
            const exchangeRate = useMemo(() => {
                if (!isMultiCurrency) return null;
                const send = parseFloat(formData.from_amount);
                const receive = parseFloat(formData.to_amount);
                if (send > 0 && receive > 0) {
                    return (receive / send).toFixed(6);
                }
                return null;
            }, [isMultiCurrency, formData.from_amount, formData.to_amount]);
        
            const handleSave = () => {
                let updatedTransaction = {
                    ...formData,
                    id: formData.id,
                    date: format(formData.date, 'yyyy-MM-dd')
                };
                
                if (formData.type === 'transfer') {
                    updatedTransaction.from_id = parseInt(formData.from_id, 10);
                    updatedTransaction.to_id = parseInt(formData.to_id, 10);
                    updatedTransaction.from_amount = parseFloat(formData.from_amount);
                    updatedTransaction.to_amount = isMultiCurrency ? parseFloat(formData.to_amount) : parseFloat(formData.from_amount);
                    
                    if (isNaN(updatedTransaction.from_id) || isNaN(updatedTransaction.to_id) || isNaN(updatedTransaction.from_amount) || (isMultiCurrency && isNaN(updatedTransaction.to_amount))) {
                        toast({ title: t('toast:invalidData'), description: t('toast:fillAllFields'), variant: "destructive" });
                        return;
                    }
                } else {
                    updatedTransaction.amount = parseFloat(formData.amount);
                    updatedTransaction.account_id = parseInt(formData.account_id, 10);
                    
                    if (isNaN(updatedTransaction.amount) || !updatedTransaction.description || !updatedTransaction.category || isNaN(updatedTransaction.account_id)) {
                        toast({ title: t('toast:invalidData'), description: t('toast:fillAllFields'), variant: "destructive" });
                        return;
                    }
                }
                
                onSave(transaction, updatedTransaction);
                onOpenChange(false);
            };
        
            if (!isOpen || !transaction) return null;
            
            const categories = formData.type === 'income' ? allData.incomeCategories : allData.expenseCategories;
        
            return (
                <Dialog open={isOpen} onOpenChange={onOpenChange}>
                    <DialogContent className="sm:max-w-[480px]">
                        <DialogHeader>
                            <DialogTitle>{t('edit.title')}</DialogTitle>
                            <DialogDescription>{t('edit.description')}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {transaction.type !== 'transfer' ? (
                                <>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">{t('type')}</Label>
                                        <div className="col-span-3">
                                            <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="income">{t('income')}</SelectItem>
                                                    <SelectItem value="expense">{t('expense')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="description" className="text-right">{t('common:description')}</Label>
                                        <Input id="description" name="description" value={formData.description || ''} onChange={handleInputChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="amount" className="text-right">{t('common:amount')}</Label>
                                        <Input id="amount" name="amount" type="number" value={formData.amount || ''} onChange={handleInputChange} className="col-span-3" />
                                    </div>
                                     <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">{t('common:category')}</Label>
                                        <div className="col-span-3">
                                            <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                                                <SelectTrigger><SelectValue placeholder={t('common:selectCategory')} /></SelectTrigger>
                                                <SelectContent>{(categories || []).map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">{t('account')}</Label>
                                        <div className="col-span-3">
                                             <Select value={String(formData.account_id)} onValueChange={(value) => handleSelectChange('account_id', value)}>
                                                <SelectTrigger><SelectValue placeholder={t('common:selectAccount')} /></SelectTrigger>
                                                <SelectContent>{allData.bankAccounts.map(acc => <SelectItem key={acc.id} value={String(acc.id)}>{acc.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">{t('fromAccount')}</Label>
                                        <div className="col-span-3">
                                            <Select value={formData.from_id} onValueChange={(v) => handleSelectChange('from_id', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>{allData.bankAccounts.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                     <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">{t('toAccount')}</Label>
                                        <div className="col-span-3">
                                            <Select value={formData.to_id} onValueChange={(v) => handleSelectChange('to_id', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>{allData.bankAccounts.filter(a=> String(a.id) !== formData.from_id).map(a => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    {isMultiCurrency ? (
                                        <>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="from_amount" className="text-right">{t('amountToSend')} ({fromAccount?.currency})</Label>
                                                <Input id="from_amount" name="from_amount" type="number" value={formData.from_amount} onChange={handleInputChange} className="col-span-3" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="to_amount" className="text-right">{t('amountToReceive')} ({toAccount?.currency})</Label>
                                                <Input id="to_amount" name="to_amount" type="number" value={formData.to_amount} onChange={handleInputChange} className="col-span-3" />
                                            </div>
                                            {exchangeRate && (
                                                <div className="col-span-4 bg-blue-50 dark:bg-slate-800 p-2 rounded-md flex items-center text-sm text-blue-800 dark:text-blue-200">
                                                    <Info className="h-4 w-4 mr-2 flex-shrink-0" />
                                                    <span>{t('exchangeRateInfo', { fromCurrency: fromAccount.currency, toCurrency: toAccount.currency, rate: exchangeRate })}</span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="from_amount" className="text-right">{t('common:amount')}</Label>
                                            <Input id="from_amount" name="from_amount" type="number" value={formData.from_amount} onChange={handleInputChange} className="col-span-3" />
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">{t('date')}</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn("col-span-3 justify-start text-left font-normal", !formData.date && "text-muted-foreground")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.date ? format(formData.date, 'PPP', { locale }) : <span>{t('common:selectDate')}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={formData.date} onSelect={handleDateChange} initialFocus locale={locale} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common:cancel')}</Button>
                            <Button onClick={handleSave}>{t('common:save')}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            );
        };
        
        export default TransactionEditDialog;