import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const GoalForm = ({ goal, onSave, onCancel, bankAccounts }) => {
    const { t } = useTranslation(['savings', 'common']);
    const [formState, setFormState] = useState({
        name: '',
        target_amount: '',
        current_amount: '',
        deadline: '',
        accountId: ''
    });

    useEffect(() => {
        if (goal) {
            setFormState({
                name: goal.name || '',
                target_amount: goal.target_amount || '',
                current_amount: goal.current_amount || '',
                deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
                accountId: goal.accountId ? goal.accountId.toString() : ''
            });
        } else {
            setFormState({ name: '', target_amount: '', current_amount: '', deadline: '', accountId: '' });
        }
    }, [goal]);

    const handleSave = () => {
        onSave(formState);
    };

    return (
        <motion.div
            className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4 mb-4 border border-white/30 dark:border-slate-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
        >
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('savings:goals.goalName')}</label>
                    <input
                        type="text"
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder={t('savings:goals.goalNamePlaceholder')}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('savings:goals.accountAssociated')}</label>
                     <Select onValueChange={(value) => setFormState({ ...formState, accountId: value })} value={formState.accountId}>
                        <SelectTrigger className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                            <SelectValue placeholder={t('savings:goals.selectAccountPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {(bankAccounts || []).map(acc => (
                                <SelectItem key={acc.id} value={acc.id.toString()}>
                                    {acc.name} ({acc.currency})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('savings:goals.goalAmount')}</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formState.target_amount}
                            onChange={(e) => setFormState({ ...formState, target_amount: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            placeholder="0,00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('savings:goals.currentAmount')}</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formState.current_amount}
                            onChange={(e) => setFormState({ ...formState, current_amount: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            placeholder="0,00"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('savings:goals.deadline')}</label>
                    <input
                        type="date"
                        value={formState.deadline}
                        onChange={(e) => setFormState({ ...formState, deadline: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" size="sm" onClick={onCancel}>
                    <X className="h-4 w-4 mr-1" /> {t('common:cancel')}
                </Button>
                <Button size="sm" onClick={handleSave} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    <Save className="h-4 w-4 mr-1" /> {t('common:save')}
                </Button>
            </div>
        </motion.div>
    );
};

export default GoalForm;