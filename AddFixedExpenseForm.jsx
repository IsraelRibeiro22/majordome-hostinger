import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR, fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Wallet, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import AutocompleteInput from '@/components/AutocompleteInput';

const AddFixedExpenseForm = ({ allData, updateAllData }) => {
    const { t, i18n } = useTranslation(['fixed', 'common', 'toast']);
    const { toast } = useToast();
    const locale = i18n.language === 'fr' ? fr : ptBR;

    const initialFormState = {
        type: 'expense',
        description: '',
        amount: '',
        category: '',
        account_id: '',
        start_date: new Date(),
        recurrence: 'monthly',
        end_date: null,
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isEndDateEnabled, setIsEndDateEnabled] = useState(false);

    const recurrenceOptions = useMemo(() => [
        { value: 'daily', label: t('recurrence.daily') },
        { value: 'weekly', label: t('recurrence.weekly') },
        { value: 'biweekly', label: t('recurrence.biweekly') },
        { value: 'monthly', label: t('recurrence.monthly') },
        { value: 'bimonthly', label: t('recurrence.bimonthly') },
        { value: 'quarterly', label: t('recurrence.quarterly') },
        { value: 'semiannually', label: t('recurrence.semiannually') },
        { value: 'annually', label: t('recurrence.annually') },
    ], [t]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name, date) => {
        setFormData(prev => ({ ...prev, [name]: date }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { description, amount, category, account_id, start_date, recurrence } = formData;
        
        if (!description || !amount || !category || !account_id || !start_date || !recurrence) {
            toast({
                title: t('toast:error'),
                description: t('toast:fillAllFields'),
                variant: 'destructive',
            });
            return;
        }

        const newFixedExpense = {
            id: crypto.randomUUID(),
            ...formData,
            amount: parseFloat(amount),
            start_date: format(start_date, 'yyyy-MM-dd'),
            end_date: isEndDateEnabled && formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
        };

        updateAllData({}, { operation: 'add', table: 'fixedExpenses', newRecord: newFixedExpense });
        
        toast({
            title: t('toast:success'),
            description: t('toast:fixedExpenseAdded'),
        });
        setFormData(initialFormState);
        setIsEndDateEnabled(false);
    };

    const categorySuggestions = useMemo(() => 
        (allData.expenseCategories || []).map(cat => cat.name), 
        [allData.expenseCategories]
    );

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-6 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">{t('common:description')}</Label>
                        <AutocompleteInput
                            value={formData.description}
                            onChange={(e) => handleInputChange(e)}
                            onSuggestionSelect={(description) => setFormData(prev => ({ ...prev, description }))}
                            type="expense"
                            placeholder={t('descriptionPlaceholder')}
                            allData={allData}
                            onUpdateData={updateAllData}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount">{t('common:amount')}</Label>
                        <Input id="amount" name="amount" type="number" value={formData.amount} onChange={handleInputChange} placeholder="0.00" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>{t('common:category')}</Label>
                        <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('common:selectCategory')} />
                            </SelectTrigger>
                            <SelectContent>
                                {categorySuggestions.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('common:account')}</Label>
                        <Select value={formData.account_id} onValueChange={(value) => handleSelectChange('account_id', value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('common:selectAccount')} />
                            </SelectTrigger>
                            <SelectContent>
                                {(allData.bankAccounts || []).map(acc => (
                                    <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name} - {acc.currency}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                        <Label>{t('recurrence.title')}</Label>
                         <Select value={formData.recurrence} onValueChange={(value) => handleSelectChange('recurrence', value)}>
                            <SelectTrigger className="w-full" icon={<Repeat />}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {recurrenceOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('startDate')}</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !formData.start_date && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.start_date ? format(formData.start_date, 'PPP', { locale }) : <span>{t('common:selectDate')}</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={formData.start_date} onSelect={(date) => handleDateChange('start_date', date)} initialFocus locale={locale} />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                 <div className="space-y-2">
                    <div className="flex items-center">
                        <input type="checkbox" id="endDateEnabled" checked={isEndDateEnabled} onChange={(e) => setIsEndDateEnabled(e.target.checked)} className="mr-2"/>
                        <Label htmlFor="endDateEnabled">{t('setEndDate')}</Label>
                    </div>
                    {isEndDateEnabled && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal mt-2", !formData.end_date && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.end_date ? format(formData.end_date, 'PPP', { locale }) : <span>{t('common:selectDate')}</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={formData.end_date} onSelect={(date) => handleDateChange('end_date', date)} initialFocus locale={locale} />
                            </PopoverContent>
                        </Popover>
                    )}
                </div>

            </div>
            <div className="flex justify-end">
                <Button type="submit" className="w-full md:w-auto bg-red-600 hover:bg-red-700">
                    <Wallet className="mr-2 h-4 w-4" /> {t('addFixedExpense')}
                </Button>
            </div>
        </form>
    );
};

export default AddFixedExpenseForm;