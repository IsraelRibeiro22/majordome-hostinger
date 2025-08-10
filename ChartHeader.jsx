import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ChartHeader = ({ title, selectedCurrency, setSelectedCurrency, availableCurrencies, selectedYear, setSelectedYear, availableYears }) => {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
      <div className="flex flex-wrap items-center gap-4">
        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder={t('selectCurrency')} />
          </SelectTrigger>
          <SelectContent>
            {availableCurrencies.map(currency => <SelectItem key={currency} value={currency}>{currency}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedYear.toString()} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder={t('selectYear')} />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map(year => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ChartHeader;