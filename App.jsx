
import React, { useState, useEffect, useCallback, useMemo } from 'react';
    import { Helmet } from 'react-helmet';
    import Dashboard from '@/components/Dashboard';
    import Scheduler from '@/pages/Scheduler';
    import Chatbot from '@/components/Chatbot';
    import { useTranslation } from 'react-i18next';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    import { useToast } from '@/components/ui/use-toast';
    import { DateProvider } from '@/contexts/DateContext';
    import { calculateAllAccountBalances } from '@/lib/balanceCalculator';
    import fullMockData from '@/lib/fullMockData';
    
    const defaultSettings = {
      theme: 'light',
      selectedCurrencies: ['BRL', 'USD', 'EUR'],
      financialCycleStartDay: 1,
      periodView: 'financial_cycle',
      visibleComponents: {
        savingsGoals: true,
        biblicalWisdom: true,
      },
    };
    
    const AppContent = () => {
      const { t, i18n } = useTranslation(['common', 'categories', 'toast']);
      const { toast } = useToast();
      
      const [settings, setSettings] = useState(() => {
        const savedSettings = localStorage.getItem('majordome-settings');
        const parsedSettings = savedSettings ? JSON.parse(savedSettings) : {};
        if (parsedSettings.budget) {
          delete parsedSettings.budget;
        }
        if(parsedSettings.visibleComponents?.budgetPlanner) {
          delete parsedSettings.visibleComponents.budgetPlanner;
        }
        return { ...defaultSettings, ...parsedSettings };
      });
    
      const [allData, setAllData] = useState({
        bankAccounts: [],
        income: [],
        expenses: [],
        transfers: [],
        savingsGoals: [],
        fixedExpenses: [],
        rawCategories: [],
        incomeCategories: [],
        expenseCategories: [],
        descriptionMemory: [],
      });
    
      const translateCategories = useCallback((rawCategories, currentLang) => {
        if (!rawCategories || rawCategories.length === 0) {
          return { incomeCategories: [], expenseCategories: [] };
        }
        const translatedIncome = rawCategories.filter(c => c.type === 'income').map(cat => ({
          ...cat,
          key: cat.name.toLowerCase().replace(/\s+/g, '_'),
          name: t(`categories:${cat.name.toLowerCase().replace(/\s+/g, '_')}`, { lng: currentLang, defaultValue: cat.name })
        }));
        const translatedExpense = rawCategories.filter(c => c.type === 'expense').map(cat => ({
          ...cat,
          key: cat.name.toLowerCase().replace(/\s+/g, '_'),
          name: t(`categories:${cat.name.toLowerCase().replace(/\s+/g, '_')}`, { lng: currentLang, defaultValue: cat.name })
        }));
        
        return { incomeCategories: translatedIncome, expenseCategories: translatedExpense };
      }, [t]);
    
      useEffect(() => {
        const loadData = () => {
          let dataToLoad = fullMockData;
          
          if (dataToLoad.budget) delete dataToLoad.budget;
          if (dataToLoad.fixedIncomes) delete dataToLoad.fixedIncomes;
          if (!dataToLoad.descriptionMemory) dataToLoad.descriptionMemory = [];
          
          const { incomeCategories, expenseCategories } = translateCategories(dataToLoad.rawCategories || [], i18n.language);
          const balancesCalculated = calculateAllAccountBalances(dataToLoad);
    
          setAllData({
            ...dataToLoad,
            bankAccounts: balancesCalculated,
            incomeCategories,
            expenseCategories,
          });
        };
        loadData();
      }, [i18n.language, translateCategories]);
    
      const updateSettings = useCallback((newSettings) => {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        localStorage.setItem('majordome-settings', JSON.stringify(updatedSettings));
        toast({ title: t("toast:settingsSavedSuccess") });
      }, [settings, toast, t]);
    
      useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(settings.theme);
      }, [settings.theme]);
    
      const updateAllData = useCallback((newData, operationDetails = null) => {
        setAllData(currentAllData => {
            let updatedData = { ...currentAllData, ...newData };
    
            if (operationDetails) {
                const { operation, table, newRecord, originalRecord } = operationDetails;
                if (table && !updatedData[table]) updatedData[table] = [];
    
                switch(operation) {
                    case 'add':
                        updatedData[table] = [...updatedData[table], { ...newRecord, id: newRecord.id || crypto.randomUUID() }];
                        break;
                    case 'update':
                        if (originalRecord.type) { 
                            const originalTable = `${originalRecord.type}s`;
                            const newTable = `${newRecord.type}s`;
                            if (updatedData[originalTable]) updatedData[originalTable] = updatedData[originalTable].filter(item => item.id !== originalRecord.id);
                            updatedData[newTable] = [...(updatedData[newTable] || []), newRecord];
                        } else {
                            updatedData[table] = updatedData[table].map(item => item.id === originalRecord.id ? newRecord : item);
                        }
                        break;
                    case 'delete':
                        updatedData[table] = updatedData[table].filter(record => record.id !== originalRecord.id);
                        break;
                    case 'recalculate_balances':
                        break;
                    default: break;
                }
            }
            
            if (updatedData.budget) delete updatedData.budget;
            if (updatedData.fixedIncomes) delete updatedData.fixedIncomes;
    
            const balancesCalculated = calculateAllAccountBalances(updatedData);
            const { incomeCategories, expenseCategories } = translateCategories(updatedData.rawCategories || [], i18n.language);
    
            const finalData = { 
                ...updatedData, 
                bankAccounts: balancesCalculated,
                incomeCategories,
                expenseCategories,
            };
            
            localStorage.setItem('majordome-data', JSON.stringify(finalData));
            return finalData;
        });
      }, [translateCategories, i18n.language]);

      const memoizedAllData = useMemo(() => {
        const accountMap = new Map((allData.bankAccounts || []).map(acc => [acc.id, acc]));
        return { ...allData, accountMap };
      }, [allData]);
      
      return (
        <Router>
          <Helmet htmlAttributes={{ lang : i18n.language }}>
            <title>{t('helmetTitle')}</title>
            <meta name="description" content={t('helmetDescription')} />
            <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          </Helmet>
          <div className="min-h-screen">
            <Routes>
                <Route path="/" element={<Dashboard settings={settings} setSettings={updateSettings} allData={memoizedAllData} updateAllData={updateAllData} />} />
                <Route path="/scheduler" element={<Scheduler allData={memoizedAllData} updateAllData={updateAllData} settings={settings} setSettings={updateSettings} />} />
            </Routes>
            <Chatbot allData={memoizedAllData} updateAllData={updateAllData} settings={settings} />
          </div>
        </Router>
      );
    }
    
    function App() {
      const savedSettings = JSON.parse(localStorage.getItem('majordome-settings') || '{}');
      const initialSettings = { ...defaultSettings, ...savedSettings };
    
      return (
        <DateProvider settings={initialSettings}>
          <AppContent />
        </DateProvider>
      );
    }
    
    export default App;
