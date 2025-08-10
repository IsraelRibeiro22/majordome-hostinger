import React, { useState, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { useTranslation } from 'react-i18next';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { Input } from '@/components/ui/input';
    import { Save, Trash2 } from 'lucide-react';
    
    const CategoryManager = ({ type, allData, updateAllData, onClose }) => {
        const { t } = useTranslation(['transactions', 'toast']);
        const { toast } = useToast();
        const [newCategoryName, setNewCategoryName] = useState('');
    
        const categories = useMemo(() => {
            return type === 'income' ? allData.incomeCategories : allData.expenseCategories;
        }, [type, allData.incomeCategories, allData.expenseCategories]);
        
        const isCategoryInUse = (categoryToRemove) => {
            const checkIn = (items, key) => (items || []).some(item => item[key] === categoryToRemove.name);
    
            if (type === 'income') {
                return checkIn(allData.income, 'category');
            }
            
            const inExpenses = checkIn(allData.expenses, 'category') || checkIn(allData.fixedExpenses, 'category');
            
            const inBudget = Object.values(allData.budget || {}).some(periodBudget =>
                Object.keys(periodBudget).includes(categoryToRemove.key)
            );
    
            return inExpenses || inBudget;
        };
    
    
        const handleAddCategory = () => {
            const trimmedName = newCategoryName.trim();
            if (!trimmedName) {
                toast({ title: t('toast:invalidName'), description: t('toast:nameCannotBeEmpty'), variant: "destructive" });
                return;
            }
    
            if (categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
                toast({ title: t('toast:categoryExists'), description: t('toast:categoryExistsError'), variant: "destructive" });
                return;
            }
            
            const newCategory = {
                id: crypto.randomUUID(),
                name: trimmedName,
                type: type,
                key: trimmedName.toLowerCase().replace(/\s+/g, '_'),
                color: type === 'income' ? 'bg-sky-500' : 'bg-gray-500'
            };
    
            const updatedCategories = [...allData.rawCategories, newCategory];
            updateAllData({ rawCategories: updatedCategories });
          
            toast({ title: t('toast:categoryAdded'), description: t('toast:categoryAddedSuccess', { name: trimmedName }) });
            setNewCategoryName('');
        };
        
        const handleRemoveCategory = (categoryToRemove) => {
            if (isCategoryInUse(categoryToRemove)) {
                toast({
                    title: t('toast:categoryInUseTitle'),
                    description: t('toast:categoryInUseDesc'),
                    variant: 'destructive',
                });
                return;
            }
    
            const updatedRawCategories = allData.rawCategories.filter(
                c => c.id !== categoryToRemove.id
            );
            updateAllData({ rawCategories: updatedRawCategories });
            toast({
                title: t('toast:categoryRemovedTitle'),
                description: t('toast:categoryRemovedDesc', { name: categoryToRemove.name }),
            });
        };
    
        return (
            <motion.div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4 mt-4 border border-white/30 dark:border-slate-700" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t(`manage_${type}_categories`)}</h3>
                <div className="flex items-center gap-2 mb-4">
                    <Input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder={t(`new_${type}_category`)} />
                    <Button onClick={handleAddCategory} size="icon" className="bg-green-500 hover:bg-green-600"><Save className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {(categories || []).map(cat => (
                        <div key={cat.id} className="flex items-center justify-between bg-white/40 dark:bg-slate-700/50 p-2 rounded">
                            <span className="text-sm text-gray-800 dark:text-gray-300">{cat.name}</span>
                            <Button onClick={() => handleRemoveCategory(cat)} variant="ghost" size="icon" className="h-7 w-7">
                                <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700"/>
                            </Button>
                        </div>
                    ))}
                </div>
                <Button onClick={onClose} size="sm" variant="outline" className="mt-4 w-full">{t('common:close')}</Button>
            </motion.div>
        );
    };
    
    export default CategoryManager;