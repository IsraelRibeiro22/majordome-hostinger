import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ConsolidatedStatement from '@/components/ConsolidatedStatement';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDate } from '@/contexts/DateContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FutureForecast from '@/components/FutureForecast';

const FinancialViewsDialog = ({ allData, settings, onOpenChange, initialView = 'statement', initialAccountId, updateAllData }) => {
  const { t } = useTranslation(['actions', 'statement', 'common', 'forecast']);
  const [selectedAccountId, setSelectedAccountId] = useState(initialAccountId || (allData.bankAccounts?.[0]?.id));
  const { currentPeriod, formatPeriod } = useDate();
  const [activeTab, setActiveTab] = useState(initialView);


  useEffect(() => {
    setSelectedAccountId(initialAccountId || (allData.bankAccounts?.[0]?.id));
  }, [initialAccountId, allData.bankAccounts]);
  
  const selectedAccount = allData.bankAccounts.find(acc => acc.id === selectedAccountId);

  return (
    <DialogContent className="max-w-full w-[95vw] h-[90vh] flex flex-col p-0">
      <DialogHeader className="p-6 pb-2 border-b">
        <div className="pt-4">
          <DialogTitle>{t('common:financialViews')}</DialogTitle>
          <DialogDescription>
            {t('statement:descriptionWithForecast')}
          </DialogDescription>
        </div>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col overflow-hidden">
        <div className="flex-shrink-0 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 p-4 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <div className="w-full sm:w-auto sm:min-w-[250px] md:min-w-[300px]">
              <Select value={selectedAccountId?.toString()} onValueChange={(value) => setSelectedAccountId(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('statement:selectAnAccount')} />
                </SelectTrigger>
                <SelectContent>
                  {(allData.bankAccounts || []).map(acc => (
                    <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="statement">{t('statement:title')}</TabsTrigger>
                <TabsTrigger value="forecast">{t('forecast:title')}</TabsTrigger>
            </TabsList>
            <div className="text-center sm:text-right font-semibold text-lg text-gray-700 dark:text-gray-300 p-2 rounded-lg bg-gray-100 dark:bg-slate-800 flex-grow">
                {activeTab === 'statement' ? formatPeriod(currentPeriod) : t('forecast:futureBalance')}
            </div>
        </div>
        
        <TabsContent value="statement" className="flex-grow overflow-hidden focus-visible:ring-0 focus-visible:ring-offset-0">
          <ConsolidatedStatement 
            allData={allData} 
            accountId={selectedAccountId} 
          />
        </TabsContent>
        <TabsContent value="forecast" className="flex-grow overflow-hidden focus-visible:ring-0 focus-visible:ring-offset-0">
          <FutureForecast 
            allData={allData} 
            account={selectedAccount}
            updateAllData={updateAllData}
          />
        </TabsContent>
      </Tabs>

      <DialogFooter className="p-4 border-t">
        <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common:close')}</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default FinancialViewsDialog;