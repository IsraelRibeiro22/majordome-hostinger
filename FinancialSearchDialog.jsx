import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import DateRangePicker from '@/components/DateRangePicker';
import { Combobox } from '@/components/ui/combobox';
import { format } from 'date-fns';
import { ptBR, fr, enUS } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useDate } from '@/contexts/DateContext';

const locales = {
  pt: ptBR,
  fr: fr,
  en: enUS,
};

const FinancialSearchDialog = ({ allData, onOpenChange }) => {
  const { t, i18n } = useTranslation(['search', 'actions', 'common', 'transactions']);
  const { locale } = useDate();
  const [searchType, setSearchType] = useState('income');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateRange, setDateRange] = useState({ from: new Date(new Date().getFullYear(), 0, 1), to: new Date() });
  const [searchResult, setSearchResult] = useState(null);

  const currentLocale = locales[i18n.language] || enUS;

  const categories = useMemo(() => {
    const categoryList = searchType === 'expense' ? (allData.expenseCategories || []) : (allData.incomeCategories || []);
    return categoryList.map(cat => ({
      value: cat.key,
      label: cat.name,
    }));
  }, [searchType, allData.expenseCategories, allData.incomeCategories]);

  const handleSearch = () => {
    if (!selectedCategory || !dateRange.from || !dateRange.to) {
      setSearchResult({ totalsByCurrency: {}, transactions: [], error: t('fillAllFields') });
      return;
    }

    const sourceData = searchType === 'expense' ? allData.expenses : allData.income;
    const dataToSearch = (sourceData || []).map(t => {
      if (!t.currency && t.account_id) {
        const account = allData.bankAccounts.find(acc => acc.id === t.account_id);
        return { ...t, currency: account ? account.currency : 'BRL' };
      }
      return t;
    });
    
    const categoryName = categories.find(c => c.value === selectedCategory)?.label;

    const filteredTransactions = dataToSearch.filter(t => {
      const transactionDate = new Date(t.date);
      const startDate = new Date(dateRange.from);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateRange.to);
      endDate.setHours(23, 59, 59, 999);
      return t.category === categoryName && transactionDate >= startDate && transactionDate <= endDate;
    });

    const totalsByCurrency = filteredTransactions.reduce((acc, t) => {
      const currency = t.currency || 'BRL';
      if (!acc[currency]) {
        acc[currency] = 0;
      }
      acc[currency] += t.amount;
      return acc;
    }, {});

    setSearchResult({ totalsByCurrency, transactions: filteredTransactions, error: null });
  };
  
  const getAccountName = (accountId) => {
    const account = allData.bankAccounts.find(acc => acc.id === accountId);
    return account ? account.name : 'N/A';
  };

  const formatCurrency = (value, currency) => {
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: currency || 'BRL' }).format(value);
  };

  return (
    <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
      <DialogHeader className="p-6 pb-4 border-b">
        <DialogTitle>{t('actions:financialSearch')}</DialogTitle>
        <DialogDescription>{t('description')}</DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 flex-grow overflow-hidden">
        <div className="md:col-span-1 p-6 bg-gray-50 dark:bg-slate-800/50 border-r dark:border-slate-700 flex flex-col gap-6">
          <Tabs value={searchType} onValueChange={(value) => { setSearchType(value); setSelectedCategory(''); setSearchResult(null); }} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="income">{t('income')}</TabsTrigger>
              <TabsTrigger value="expense">{t('expenses')}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid w-full items-center gap-1.5">
            <Combobox
              options={categories}
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              placeholder={t('selectCategory')}
              searchPlaceholder={t('searchCategory')}
              notFoundText={t('noCategoryFound')}
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label>{t('statement:period')}</Label>
            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          </div>

          <Button onClick={handleSearch} className="w-full mt-auto">{t('button')}</Button>
        </div>

        <div className="md:col-span-2 p-6 flex flex-col">
          <h3 className="text-lg font-semibold mb-4">{t('results')}</h3>
          {searchResult ? (
            <>
              {searchResult.error ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">{searchResult.error}</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-4 rounded-lg bg-muted dark:bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">{t('totalFoundFor')} <span className="font-bold text-foreground">{categories.find(c => c.value === selectedCategory)?.label}</span></p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {Object.keys(searchResult.totalsByCurrency).length > 0 ? (
                        Object.entries(searchResult.totalsByCurrency).map(([currency, total]) => (
                          <div key={currency}>
                            <span className="text-xs uppercase text-muted-foreground">{`Total ${currency}`}</span>
                            <p className="text-xl font-bold text-primary">{formatCurrency(total, currency)}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xl font-bold text-primary">{formatCurrency(0, 'BRL')}</p>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="flex-grow pr-4">
                    <div className="space-y-2">
                      {searchResult.transactions.length > 0 ? (
                        searchResult.transactions.map((t, index) => (
                          <div key={`${t.id}-${index}`} className="flex justify-between items-center p-3 rounded-md border">
                            <div>
                              <p className="font-medium">{t.description}</p>
                              <p className="text-sm text-muted-foreground">{format(new Date(t.date), 'PPP', { locale })}</p>
                            </div>
                            <div className="text-right">
                                <Badge variant={searchType === 'expense' ? 'destructive' : 'default'}>
                                    {formatCurrency(t.amount, t.currency)}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">{getAccountName(t.account_id)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">{t('noTransactionsFound')}</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  {searchResult.transactions.length > 0 && Object.keys(searchResult.totalsByCurrency).length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-md font-semibold mb-2">{t('finalTotal')}</h4>
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {Object.entries(searchResult.totalsByCurrency).map(([currency, total]) => (
                          <div key={currency}>
                            <span className="text-xs uppercase text-muted-foreground">{`Total ${currency}`}</span>
                            <p className="text-lg font-bold text-primary">{formatCurrency(total, currency)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">{t('performASearch')}</p>
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="p-4 border-t">
        <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common:close')}</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default FinancialSearchDialog;