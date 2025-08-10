import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Settings, List } from 'lucide-react';
import CategoryManager from '@/components/transactions/CategoryManager';
import AddIncomeForm from '@/components/transactions/AddIncomeForm';
import AddExpenseForm from '@/components/transactions/AddExpenseForm';
import AddTransferForm from '@/components/transactions/AddTransferForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import AllTransactionsDialog from '@/components/AllTransactionsDialog';

const TransactionsHub = ({ allData, updateAllData }) => {
    const { t } = useTranslation('transactions');
    const [activeTab, setActiveTab] = useState("income");
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [isAllTransactionsOpen, setIsAllTransactionsOpen] = useState(false);
    
    return (
        <motion.div 
            className="financial-card rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{t('title')}</h2>
                <div className="flex items-center gap-2">
                    <Dialog open={isAllTransactionsOpen} onOpenChange={setIsAllTransactionsOpen}>
                        <DialogTrigger asChild>
                             <Button size="icon" variant="ghost">
                                <List className="h-5 w-5"/>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
                            <AllTransactionsDialog
                                allData={allData}
                                updateAllData={updateAllData}
                                onOpenChange={setIsAllTransactionsOpen}
                            />
                        </DialogContent>
                    </Dialog>
                    {activeTab !== 'transfer' && (
                        <Button onClick={() => setShowCategoryManager(prev => !prev)} size="icon" variant="ghost">
                            <Settings className="h-5 w-5"/>
                        </Button>
                    )}
                </div>
            </div>
            
            {showCategoryManager && (
                <CategoryManager
                    type={activeTab}
                    allData={allData}
                    updateAllData={updateAllData}
                    onClose={() => setShowCategoryManager(false)}
                />
            )}

            <Tabs defaultValue="income" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger 
                        value="income" 
                        className="data-[state=active]:bg-green-500 data-[state=active]:text-white dark:data-[state=active]:bg-green-600 dark:data-[state=active]:text-white"
                    >
                        {t('tabIncome')}
                    </TabsTrigger>
                    <TabsTrigger 
                        value="expense" 
                        className="data-[state=active]:bg-red-500 data-[state=active]:text-white dark:data-[state=active]:bg-red-600 dark:data-[state=active]:text-white"
                    >
                        {t('tabExpense')}
                    </TabsTrigger>
                    <TabsTrigger 
                        value="transfer" 
                        className="data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white"
                    >
                        {t('tabTransfer')}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="income" className="mt-4">
                    <AddIncomeForm allData={allData} updateAllData={updateAllData} />
                </TabsContent>
                <TabsContent value="expense" className="mt-4">
                    <AddExpenseForm allData={allData} updateAllData={updateAllData} />
                </TabsContent>
                <TabsContent value="transfer" className="mt-4">
                    <AddTransferForm allData={allData} updateAllData={updateAllData} />
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};

export default TransactionsHub;