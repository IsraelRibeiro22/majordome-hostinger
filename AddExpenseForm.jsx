
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AutocompleteInput from '@/components/AutocompleteInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from 'lucide-react';

const AddExpenseForm = ({ allData, updateAllData }) => {
    const { t } = useTranslation(['transactions', 'common', 'toast']);
    const { toast } = useToast();
    const getDefaultDate = () => new Date().toISOString().split('T')[0];

    const sortedExpenseCategories = useMemo(() =>
        [...(allData.expenseCategories || [])].sort((a, b) => a.name.localeCompare(b.name)),
        [allData.expenseCategories]
    );

    const getInitialState = useCallback(() => ({
        description: '',
        amount: '',
        category: sortedExpenseCategories[0]?.name || '',
        account_id: allData.bankAccounts[0]?.id || '',
        date: getDefaultDate(),
    }), [sortedExpenseCategories, allData.bankAccounts]);

    const [formState, setFormState] = useState(getInitialState());

    useEffect(() => {
        setFormState(getInitialState());
    }, [getInitialState]);
    
    const handleSave = () => {
        try {
            if (!formState.description || !formState.amount || !formState.account_id || !formState.category) {
                toast({ title: t('toast:requiredFields'), description: t('toast:fillAllFields'), variant: "destructive" });
                return;
            }

            const amount = parseFloat(formState.amount);
            const accountId = parseInt(formState.account_id, 10);

            if (isNaN(amount) || amount <= 0) {
                toast({ title: t('toast:invalidData'), description: t('toast:amountMustBePositive'), variant: 'destructive' });
                return;
            }

            const expenseData = {
                id: crypto.randomUUID(),
                type: 'expense',
                ...formState,
                amount,
                account_id: accountId,
            };
            
            updateAllData({}, { operation: 'add', table: 'expenses', newRecord: expenseData });

            const descriptionMemory = allData.descriptionMemory || [];
            if (!descriptionMemory.some(item => item.description === formState.description && item.type === 'expense')) {
                const newMemoryEntry = {
                    id: crypto.randomUUID(),
                    type: 'expense',
                    description: formState.description,
                };
                updateAllData({ descriptionMemory: [...descriptionMemory, newMemoryEntry] });
            }

            toast({ title: t('toast:expenseAdded'), description: t('toast:expenseAddedSuccess') });
            
            setFormState(getInitialState());
        } catch (error) {
            console.error("Error saving expense:", error);
            toast({ title: t('toast:error'), description: t('toast:genericError'), variant: "destructive" });
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AutocompleteInput
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    onSuggestionSelect={(description) => setFormState({ ...formState, description })}
                    type="expense"
                    placeholder={t('common:description')}
                    allData={allData}
                    onUpdateData={updateAllData}
                />
                <input type="number" step="0.01" value={formState.amount} onChange={e => setFormState({ ...formState, amount: e.target.value })} placeholder={t('common:value')} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
                <Select value={formState.category} onValueChange={value => setFormState({ ...formState, category: value })}>
                    <SelectTrigger className="w-full"><SelectValue placeholder={t('common:selectCategory')} /></SelectTrigger>
                    <SelectContent>{sortedExpenseCategories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={formState.account_id ? String(formState.account_id) : ''} onValueChange={value => setFormState({ ...formState, account_id: Number(value) })}>
                    <SelectTrigger className="w-full"><SelectValue placeholder={t('common:selectAccount')} /></SelectTrigger>
                    <SelectContent>{allData.bankAccounts.map(acc => <SelectItem key={acc.id} value={String(acc.id)}>{acc.name}</SelectItem>)}</SelectContent>
                </Select>
                <div className="md:col-span-2">
                    <input type="date" value={formState.date} onChange={e => setFormState({ ...formState, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md" />
                </div>
            </div>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-gradient-to-r from-red-500 to-rose-600">
                    <Save className="h-4 w-4 mr-2" />
                    {t('common:saveExpense')}
                </Button>
            </div>
        </div>
    );
};

export default AddExpenseForm;
