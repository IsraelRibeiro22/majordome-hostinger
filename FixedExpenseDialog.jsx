import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';
import { ptBR, fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Wallet, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import AutocompleteInput from '@/components/AutocompleteInput';
import { useTranslation } from 'react-i18next';

const FixedExpenseDialog = ({ isOpen, setIsOpen, expense, allData, updateAllData }) => {
  const { t, i18n } = useTranslation(['fixed', 'common', 'toast']);
  const { toast } = useToast();
  const locale = i18n.language === 'fr' ? fr : ptBR;

  const initialFormState = {
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

  useEffect(() => {
    if (expense) {
      setFormData({
        ...expense,
        amount: expense.amount.toString(),
        account_id: expense.account_id.toString(),
        start_date: parseISO(expense.start_date),
        end_date: expense.end_date ? parseISO(expense.end_date) : null,
      });
      setIsEndDateEnabled(!!expense.end_date);
    } else {
      setFormData(initialFormState);
      setIsEndDateEnabled(false);
    }
  }, [expense, isOpen]);

  const recurrenceOptions = useMemo(() => [
    { value: 'daily', label: t('recurrenceOptions.daily') },
    { value: 'weekly', label: t('recurrenceOptions.weekly') },
    { value: 'biweekly', label: t('recurrenceOptions.biweekly') },
    { value: 'monthly', label: t('recurrenceOptions.monthly') },
    { value: 'bimonthly', label: t('recurrenceOptions.bimonthly') },
    { value: 'quarterly', label: t('recurrenceOptions.quarterly') },
    { value: 'semiannually', label: t('recurrenceOptions.semiannually') },
    { value: 'annually', label: t('recurrenceOptions.annually') },
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

    const expenseData = {
      ...formData,
      amount: parseFloat(amount),
      account_id: parseInt(account_id),
      start_date: format(start_date, 'yyyy-MM-dd'),
      end_date: isEndDateEnabled && formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
    };

    if (expense) {
      updateAllData({}, { operation: 'update', table: 'fixedExpenses', originalRecord: expense, newRecord: { ...expense, ...expenseData } });
      toast({
        title: t('expenses.toast.updatedTitle'),
        description: t('expenses.toast.updatedDesc'),
      });
    } else {
      const newFixedExpense = { ...expenseData, id: crypto.randomUUID() };
      updateAllData({}, { operation: 'add', table: 'fixedExpenses', newRecord: newFixedExpense });
      toast({
        title: t('expenses.toast.addedTitle'),
        description: t('expenses.toast.addedDesc'),
      });
    }
    setIsOpen(false);
  };

  const categorySuggestions = useMemo(() => 
    (allData.expenseCategories || []).map(cat => cat.name), 
    [allData.expenseCategories]
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px] glass-card">
        <DialogHeader>
          <DialogTitle className="gradient-text text-2xl">
            {expense ? t('expenses.editTitle') : t('expenses.addTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('common:fillFieldsBelow')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="description">{t('common:description')}</Label>
                    <AutocompleteInput
                        value={formData.description}
                        onChange={(e) => handleInputChange({ target: { name: 'description', value: e.target.value } })}
                        onSuggestionSelect={(description) => setFormData(prev => ({ ...prev, description }))}
                        type="expense"
                        placeholder={t('expenses.descriptionPlaceholder')}
                        allData={allData}
                        onUpdateData={updateAllData}
                        name="description"
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
                    <Select value={formData.account_id.toString()} onValueChange={(value) => handleSelectChange('account_id', value)}>
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
                    <Label>{t('expenses.startsOn')}</Label>
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
                    <input type="checkbox" id="endDateEnabled" checked={isEndDateEnabled} onChange={(e) => setIsEndDateEnabled(e.target.checked)} className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                    <Label htmlFor="endDateEnabled">{t('expenses.setEndDate')}</Label>
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
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>{t('common:cancel')}</Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                    <Wallet className="mr-2 h-4 w-4" /> {expense ? t('common:saveChanges') : t('expenses.addFixedExpense')}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FixedExpenseDialog;