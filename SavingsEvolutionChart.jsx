
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDate } from '@/contexts/DateContext';
import { useToast } from '@/components/ui/use-toast';
import ChartHeader from '@/components/charts/ChartHeader';
import ChartDisplay from '@/components/charts/ChartDisplay';
import MonthlyDetailView from '@/components/charts/MonthlyDetailView';
import TransactionEditDialog from '@/components/TransactionEditDialog';
import DeleteConfirmationDialog from '@/components/charts/DeleteConfirmationDialog';
import { getChartData } from '@/lib/chartHelper';

const SavingsEvolutionChart = ({ allData, settings, updateAllData }) => {
  const { t } = useTranslation(['savings', 'common', 'toast', 'transactions', 'actions']);
  const { toast } = useToast();
  const { getPeriodsForYear, formatPeriod, getPeriodLabel, locale } = useDate();
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedData, setSelectedData] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);

  const availableCurrencies = useMemo(() => settings.selectedCurrencies || [], [settings.selectedCurrencies]);
  const [selectedCurrency, setSelectedCurrency] = useState(availableCurrencies[0] || 'BRL');

  useEffect(() => {
    if (availableCurrencies.length > 0 && !availableCurrencies.includes(selectedCurrency)) {
      setSelectedCurrency(availableCurrencies[0]);
    }
  }, [availableCurrencies, selectedCurrency]);

  const availableYears = useMemo(() => {
    const years = new Set();
    const allTransactions = [
      ...(allData.income || []), 
      ...(allData.expenses || []), 
      ...(allData.fixedExpenses || [])
    ];
    allTransactions.forEach(t => years.add(new Date(t.date || t.start_date).getFullYear()));
    if (years.size === 0) years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [allData.income, allData.expenses, allData.fixedExpenses, currentYear]);

  const chartData = useMemo(() => getChartData({
    allData,
    selectedCurrency,
    selectedYear,
    getPeriodsForYear,
    formatPeriod,
    getPeriodLabel,
    settings,
    locale,
  }), [allData, selectedCurrency, selectedYear, getPeriodsForYear, formatPeriod, getPeriodLabel, settings, locale]);

  const handleChartClick = useCallback((e) => {
    if (e && e.activePayload && e.activePayload.length > 0) {
      const clickedPayload = e.activePayload[0].payload;
      setSelectedData(prev => prev?.fullPeriod === clickedPayload.fullPeriod ? null : clickedPayload);
    }
  }, []);

  const handleUpdateTransaction = useCallback((originalTx, updatedTxData) => {
    updateAllData({}, { operation: 'update', newRecord: updatedTxData, originalRecord: originalTx });
    toast({ title: t('toast:transactionUpdated'), description: t('toast:transactionUpdatedSuccess') });
    setEditingTransaction(null);
    setSelectedData(null);
  }, [updateAllData, toast, t]);

  const handleDeleteTransaction = useCallback(() => {
    if (!deletingTransaction) return;
    const table = `${deletingTransaction.type}s`;
    updateAllData({}, { operation: 'delete', table, originalRecord: deletingTransaction });
    toast({ title: t('toast:transactionDeleted'), description: t('toast:transactionDeletedSuccess') });
    setDeletingTransaction(null);
    setSelectedData(null);
  }, [deletingTransaction, updateAllData, toast, t]);

  useEffect(() => {
    setSelectedData(null);
  }, [selectedCurrency, selectedYear]);

  return (
    <motion.div className="financial-card rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <ChartHeader
        title={t('evolution.title')}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        availableCurrencies={availableCurrencies}
        selectedYear={selectedYear}
        setSelectedYear={(val) => { setSelectedYear(parseInt(val)); setSelectedData(null); }}
        availableYears={availableYears}
      />
      <div>
        <ChartDisplay
          chartData={chartData}
          handleChartClick={handleChartClick}
          selectedCurrency={selectedCurrency}
        />
        <AnimatePresence>
          {selectedData && (
            <MonthlyDetailView
              data={selectedData}
              currency={selectedCurrency}
              onEdit={setEditingTransaction}
              onDelete={setDeletingTransaction}
              allData={allData}
            />
          )}
        </AnimatePresence>
      </div>
      {editingTransaction && (
        <TransactionEditDialog
          isOpen={!!editingTransaction}
          onOpenChange={(isOpen) => !isOpen && setEditingTransaction(null)}
          transaction={editingTransaction}
          allData={allData}
          onSave={handleUpdateTransaction}
        />
      )}
      <DeleteConfirmationDialog
        isOpen={!!deletingTransaction}
        onOpenChange={(isOpen) => !isOpen && setDeletingTransaction(null)}
        onConfirm={handleDeleteTransaction}
      />
    </motion.div>
  );
};

export default SavingsEvolutionChart;
