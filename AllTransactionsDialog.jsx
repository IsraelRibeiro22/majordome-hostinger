
import React, { useState, useMemo, useCallback } from 'react';
        import { useTranslation } from 'react-i18next';
        import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
        import { Button } from '@/components/ui/button';
        import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
        import DateRangePicker from '@/components/DateRangePicker';
        import { ScrollArea } from '@/components/ui/scroll-area';
        import { parseISO, isWithinInterval, compareDesc } from 'date-fns';
        import { Badge } from '@/components/ui/badge';
        import { ArrowDown, ArrowUp, ArrowRightLeft, Edit3, Trash2 } from 'lucide-react';
        import { useToast } from '@/components/ui/use-toast';
        import {
          AlertDialog,
          AlertDialogAction,
          AlertDialogCancel,
          AlertDialogContent,
          AlertDialogDescription,
          AlertDialogFooter,
          AlertDialogHeader,
          AlertDialogTitle,
          AlertDialogTrigger,
        } from "@/components/ui/alert-dialog";
        import TransactionEditDialog from '@/components/TransactionEditDialog';
        import { useDate } from '@/contexts/DateContext';
        
        const AllTransactionsDialog = ({ allData, updateAllData, onOpenChange }) => {
          const { t, i18n } = useTranslation(['transactions', 'common', 'toast', 'statement', 'accounts']);
          const { toast } = useToast();
          const { formatDate } = useDate();
          const { accountMap } = allData;
        
          const [filters, setFilters] = useState({
            type: 'all',
            accountId: 'all',
            dateRange: { from: new Date(new Date().getFullYear(), 0, 1), to: new Date() },
          });
          
          const [editingTransaction, setEditingTransaction] = useState(null);
        
          const handleFilterChange = (key, value) => {
            setFilters(prev => ({ ...prev, [key]: value }));
          };
          
          const handleDateChange = (date) => {
            setFilters(prev => ({ ...prev, dateRange: date }));
          }
        
          const findAccountName = useCallback((id) => accountMap.get(id)?.name || t('common:notApplicable'), [accountMap, t]);
          const findAccountCurrency = useCallback((id) => accountMap.get(id)?.currency || 'BRL', [accountMap]);
        
          const allTransactions = useMemo(() => {
            const incomes = (allData.income || []).map(tx => ({...tx, type: 'income', currency: findAccountCurrency(tx.account_id) }));
            const expenses = (allData.expenses || []).map(tx => ({...tx, type: 'expense', currency: findAccountCurrency(tx.account_id) }));
            const transfers = (allData.transfers || []).map(tx => ({
                ...tx, 
                type: 'transfer', 
                from_currency: findAccountCurrency(tx.from_id), 
                to_currency: findAccountCurrency(tx.to_id),
                from_name: findAccountName(tx.from_id),
                to_name: findAccountName(tx.to_id)
            }));
            return [...incomes, ...expenses, ...transfers].sort((a,b) => compareDesc(parseISO(a.date), parseISO(b.date)));
          }, [allData.income, allData.expenses, allData.transfers, findAccountName, findAccountCurrency]);
        
          const filteredTransactions = useMemo(() => {
            return allTransactions.filter(tx => {
              if (filters.type !== 'all' && tx.type !== filters.type) return false;
              
              const { from, to } = filters.dateRange;
              if (from && to && !isWithinInterval(parseISO(tx.date), { start: from, end: to })) return false;
        
              if (filters.accountId !== 'all') {
                const accountIdNumber = Number(filters.accountId);
                if (tx.type === 'transfer') {
                  if (tx.from_id !== accountIdNumber && tx.to_id !== accountIdNumber) return false;
                } else {
                  if (tx.account_id !== accountIdNumber) return false;
                }
              }
              return true;
            });
          }, [allTransactions, filters]);
          
          const formatCurrency = useCallback((value, currency) => {
            const lang = i18n.language === 'fr' ? 'fr-FR' : 'pt-BR';
            const currencyCode = currency || 'BRL';
            return new Intl.NumberFormat(lang, { style: 'currency', currency: currencyCode }).format(value || 0);
          }, [i18n.language]);
          
          const categoryColorMap = useMemo(() => {
            const map = new Map();
            (allData.incomeCategories || []).forEach(c => map.set(`income-${c.name}`, c.color));
            (allData.expenseCategories || []).forEach(c => map.set(`expense-${c.name}`, c.color));
            return map;
          }, [allData.incomeCategories, allData.expenseCategories]);
        
          const getCategoryColor = useCallback((name, type) => categoryColorMap.get(`${type}-${name}`) || 'bg-gray-400', [categoryColorMap]);
        
          const handleDelete = (transaction) => {
            const table = `${transaction.type}s`;
            updateAllData({}, { operation: 'delete', table, originalRecord: transaction });
            toast({ title: t('toast:transactionDeleted'), description: t('toast:transactionDeletedSuccess') });
          };
        
          const handleUpdateTransaction = (originalTx, updatedTxData) => {
            updateAllData({}, { operation: 'update', newRecord: updatedTxData, originalRecord: originalTx });
            toast({
              title: t('toast:transactionUpdated'),
              description: t('toast:transactionUpdatedSuccess'),
            });
            setEditingTransaction(null);
          };
          
          const renderTransaction = (tx) => {
            if (tx.type === 'income') {
                return <div key={`${tx.id}-income`} className="flex items-center p-3 border-b dark:border-slate-700">
                    <ArrowUp className="h-6 w-6 text-green-500 mr-4"/>
                    <div className="flex-grow">
                        <p className="font-semibold">{tx.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{findAccountName(tx.account_id)}</span> &bull; <span>{formatDate(tx.date)}</span>
                        </div>
                    </div>
                    <div className="text-right mr-4">
                        <p className="font-bold text-green-500">{formatCurrency(tx.amount, tx.currency)}</p>
                        <Badge variant="outline" className={`border-transparent ${getCategoryColor(tx.category, 'income')} text-white text-xs`}>{tx.category}</Badge>
                    </div>
                    {renderActions(tx)}
                </div>
            }
            if (tx.type === 'expense') {
                return <div key={`${tx.id}-expense`} className="flex items-center p-3 border-b dark:border-slate-700">
                    <ArrowDown className="h-6 w-6 text-red-500 mr-4"/>
                    <div className="flex-grow">
                        <p className="font-semibold">{tx.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{findAccountName(tx.account_id)}</span> &bull; <span>{formatDate(tx.date)}</span>
                        </div>
                    </div>
                    <div className="text-right mr-4">
                        <p className="font-bold text-red-500">{formatCurrency(tx.amount, tx.currency)}</p>
                        <Badge variant="outline" className={`border-transparent ${getCategoryColor(tx.category, 'expense')} text-white text-xs`}>{tx.category}</Badge>
                    </div>
                    {renderActions(tx)}
                </div>
            }
            if (tx.type === 'transfer') {
                return <div key={`${tx.id}-transfer`} className="flex items-center p-3 border-b dark:border-slate-700">
                    <ArrowRightLeft className="h-6 w-6 text-blue-500 mr-4"/>
                    <div className="flex-grow">
                        <p className="font-semibold">{tx.description || t('transactions:transfer')}</p>
                        <div className="flex flex-col text-sm text-gray-500 dark:text-gray-400">
                            <span>{t('transactions:from')}: {tx.from_name}</span>
                            <span>{t('transactions:to')}: {tx.to_name}</span>
                            <span>{formatDate(tx.date)}</span>
                        </div>
                    </div>
                    <div className="text-right mr-4">
                        <p className="font-bold text-blue-500">{formatCurrency(tx.from_amount, tx.from_currency)}</p>
                        {tx.from_currency !== tx.to_currency && <p className="text-sm text-blue-400">{`(${formatCurrency(tx.to_amount, tx.to_currency)})`}</p>}
                        <Badge variant="outline" className="border-transparent bg-blue-500 text-white text-xs">{t('transactions:transfer')}</Badge>
                    </div>
                    {renderActions(tx)}
                </div>
            }
            return null;
          }
          
          const renderActions = (transaction) => (
            <div className="flex items-center">
                <Button size="icon" variant="ghost" onClick={() => setEditingTransaction(transaction)}>
                    <Edit3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost">
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('toast:areYouSure')}</AlertDialogTitle>
                            <AlertDialogDescription>{t('toast:deleteTransactionWarning')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(transaction)}>
                                {t('common:delete')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        );
        
          return (
            <>
              <DialogHeader className="p-6 pb-4 border-b">
                <DialogTitle>{t('transactions:allTransactions')}</DialogTitle>
                <DialogDescription>{t('transactions:allTransactionsDesc')}</DialogDescription>
              </DialogHeader>
              
              <div className="flex-shrink-0 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 p-4 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                <div className="flex flex-wrap gap-4">
                  <Select value={filters.type} onValueChange={(v) => handleFilterChange('type', v)}>
                      <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder={t('transactions:type')} />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">{t('transactions:allTypes')}</SelectItem>
                          <SelectItem value="income">{t('transactions:incomeOnly')}</SelectItem>
                          <SelectItem value="expense">{t('transactions:expensesOnly')}</SelectItem>
                          <SelectItem value="transfer">{t('transactions:transfer')}</SelectItem>
                      </SelectContent>
                  </Select>
                  <Select value={String(filters.accountId)} onValueChange={(v) => handleFilterChange('accountId', v)}>
                      <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={t('accounts:account')} />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">{t('accounts:allAccounts')}</SelectItem>
                          {(allData.bankAccounts || []).map(acc => (
                              <SelectItem key={acc.id} value={String(acc.id)}>{acc.name}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-auto">
                    <DateRangePicker date={filters.dateRange} onDateChange={handleDateChange} />
                </div>
              </div>
        
              <ScrollArea className="flex-grow p-2">
                {filteredTransactions.length > 0 ? (
                    filteredTransactions.map(tx => renderTransaction(tx))
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 dark:text-gray-400">{t('transactions:noTransactionsFound')}</p>
                    </div>
                )}
              </ScrollArea>
              
              <DialogFooter className="p-4 border-t">
                <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common:close')}</Button>
              </DialogFooter>
        
              {editingTransaction && (
                <TransactionEditDialog
                  isOpen={!!editingTransaction}
                  onOpenChange={(isOpen) => !isOpen && setEditingTransaction(null)}
                  transaction={editingTransaction}
                  allData={allData}
                  onSave={handleUpdateTransaction}
                />
              )}
            </>
          );
        };
        
        export default AllTransactionsDialog;
