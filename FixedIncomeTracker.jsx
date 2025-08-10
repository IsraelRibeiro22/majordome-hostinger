import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit3, Repeat, Landmark, Tag, Calendar, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDate } from '@/contexts/DateContext';

const FixedIncomeTracker = ({ allData, updateAllData }) => {
  const { t, i18n } = useTranslation(['fixed', 'common', 'toast']);
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const { formatDate } = useDate();

  const getDefaultDate = () => new Date().toISOString().split('T')[0];

  const [formState, setFormState] = useState({
    description: '',
    amount: '',
    category: '',
    account_id: '',
    recurrence: 'monthly',
    start_date: getDefaultDate(),
    end_date: '',
  });

  useEffect(() => {
    if (!editingIncome && showForm) {
      setFormState({
        description: '',
        amount: '',
        category: allData.incomeCategories[0]?.name || '',
        account_id: allData.bankAccounts[0]?.id || '',
        recurrence: 'monthly',
        start_date: getDefaultDate(),
        end_date: '',
      });
    }
  }, [allData.incomeCategories, allData.bankAccounts, editingIncome, showForm]);

  const handleEditClick = (income) => {
    setEditingIncome(income);
    setFormState({
      id: income.id,
      description: income.description,
      amount: income.amount.toString(),
      category: income.category,
      account_id: income.account_id,
      recurrence: income.recurrence,
      start_date: new Date(income.start_date).toISOString().split('T')[0],
      end_date: income.end_date ? new Date(income.end_date).toISOString().split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingIncome(null);
    setFormState({
        description: '',
        amount: '',
        category: '',
        account_id: '',
        recurrence: 'monthly',
        start_date: getDefaultDate(),
        end_date: '',
    });
  };

  const handleSaveIncome = () => {
    if (!formState.description || !formState.amount || !formState.account_id || !formState.category || !formState.recurrence || !formState.start_date) {
      toast({ title: t('toast:requiredFields'), description: t('toast:fillAllRequiredFields'), variant: "destructive" });
      return;
    }

    const incomeData = {
        ...formState,
        amount: parseFloat(formState.amount),
        account_id: parseInt(formState.account_id),
        end_date: formState.end_date || null,
    };

    if (editingIncome) {
      const updatedIncomes = allData.fixedIncomes.map(inc => inc.id === editingIncome.id ? { ...inc, ...incomeData } : inc);
      updateAllData({ fixedIncomes: updatedIncomes });
      toast({ title: t('toast:incomes.updatedTitle'), description: t('toast:incomes.updatedDesc') });
    } else {
      const newIncome = { ...incomeData, id: Date.now() };
      updateAllData({ fixedIncomes: [...allData.fixedIncomes, newIncome] });
      toast({ title: t('toast:incomes.addedTitle'), description: t('toast:incomes.addedDesc') });
    }

    handleCancelForm();
  };

  const handleDeleteIncome = (incomeToDelete) => {
    const updatedIncomes = allData.fixedIncomes.filter(inc => inc.id !== incomeToDelete.id);
    updateAllData({ fixedIncomes: updatedIncomes });
    toast({ title: t('toast:incomes.removedTitle'), description: t('toast:incomes.removedDesc') });
  };

  const formatCurrency = (value, currency = 'BRL') => {
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'pt-BR';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  };

  const getAccountName = (id) => allData.bankAccounts.find(acc => acc.id === id)?.name || 'N/A';
  const getAccountCurrency = (id) => allData.bankAccounts.find(acc => acc.id === id)?.currency || 'BRL';
  const getRecurrenceName = (key) => t(`recurrenceOptions.${key}`);

  const recurrenceOptions = [
    'daily', 'weekly', 'biweekly', 'monthly', 'bimonthly', 'quarterly', 'semiannually', 'annually'
  ];

  const sortedFixedIncomes = [...(allData.fixedIncomes || [])].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

  return (
    <motion.div className="financial-card rounded-xl p-6 h-full flex flex-col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{t('incomes.title')}</h2>
        <Button onClick={() => { setEditingIncome(null); setShowForm(true); }} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 dark:from-green-400 dark:to-emerald-500 dark:hover:from-green-500 dark:hover:to-emerald-600">
          <Plus className="h-4 w-4 mr-2" /> {t('incomes.add')}
        </Button>
      </div>

      {showForm && (
        <motion.div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4 mb-6 border border-white/30 dark:border-slate-700" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{editingIncome ? t('incomes.editTitle') : t('incomes.addTitle')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={formState.description} onChange={e => setFormState({ ...formState, description: e.target.value })} placeholder={t('common:description')} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
            <input type="number" step="0.01" value={formState.amount} onChange={e => setFormState({ ...formState, amount: e.target.value })} placeholder={t('common:value')} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
            
            <Select value={formState.account_id ? formState.account_id.toString() : ""} onValueChange={value => setFormState({ ...formState, account_id: Number(value) })}>
              <SelectTrigger className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <SelectValue placeholder={t('common:selectAccount')} />
              </SelectTrigger>
              <SelectContent>
                {allData.bankAccounts.map(acc => <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={formState.category} onValueChange={value => setFormState({ ...formState, category: value })}>
              <SelectTrigger className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <SelectValue placeholder={t('common:selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {allData.incomeCategories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={formState.recurrence} onValueChange={value => setFormState({ ...formState, recurrence: value })}>
              <SelectTrigger className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <SelectValue placeholder={t('incomes.recurrence')} />
              </SelectTrigger>
              <SelectContent>
                {recurrenceOptions.map(opt => <SelectItem key={opt} value={opt}>{getRecurrenceName(opt)}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="relative">
              <label className="absolute -top-2 left-2 -mt-px inline-block bg-white dark:bg-slate-800 px-1 text-xs font-medium text-gray-500 dark:text-gray-400">{t('incomes.startsOn')}</label>
              <input type="date" value={formState.start_date} onChange={e => setFormState({ ...formState, start_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <div className="relative">
              <label className="absolute -top-2 left-2 -mt-px inline-block bg-white dark:bg-slate-800 px-1 text-xs font-medium text-gray-500 dark:text-gray-400">{t('incomes.endsOn')}</label>
              <input type="date" value={formState.end_date} onChange={e => setFormState({ ...formState, end_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={handleCancelForm}>{t('common:cancel')}</Button>
            <Button onClick={handleSaveIncome} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"><Save className="h-4 w-4 mr-2" />{t('common:save')}</Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3 flex-1 overflow-y-auto pr-2">
        {sortedFixedIncomes.length > 0 ? (
          sortedFixedIncomes.map((income, index) => (
            <motion.div key={income.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white/30 dark:bg-slate-800/50 rounded-lg border border-white/20 dark:border-slate-700" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{income.description}</p>
                <div className="flex items-center flex-wrap space-x-2 sm:space-x-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span className="flex items-center"><Tag className="h-3 w-3 mr-1" />{income.category}</span>
                  <span className="flex items-center"><Landmark className="h-3 w-3 mr-1" />{getAccountName(income.account_id)}</span>
                  <span className="flex items-center"><Repeat className="h-3 w-3 mr-1" />{getRecurrenceName(income.recurrence)}</span>
                  <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" />{t('incomes.startsOn')} {formatDate(income.start_date)}</span>
                  {income.end_date && <span className="flex items-center"><Calendar className="h-3 w-3 mr-1 text-red-500" />{t('incomes.endsOn')} {formatDate(income.end_date)}</span>}
                </div>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 mt-2 sm:mt-0 self-end sm:self-center">
                <span className="font-semibold text-green-700 dark:text-green-400 text-sm sm:text-base">{formatCurrency(income.amount, getAccountCurrency(income.account_id))}</span>
                <Button variant="ghost" size="icon" onClick={() => handleEditClick(income)} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 h-7 w-7"><Edit3 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteIncome(income)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50 h-7 w-7"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 flex-1 flex flex-col justify-center items-center">
            <p>{t('incomes.noData')}</p>
            <p className="text-sm">{t('incomes.clickToAdd')}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FixedIncomeTracker;