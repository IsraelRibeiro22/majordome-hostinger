import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import DatePicker from '@/components/DatePicker';
import { Label } from '@/components/ui/label';

const DateRangePicker = ({ className, date, onDateChange }) => {
  const { t } = useTranslation();

  const handleDateChange = (part, value) => {
    onDateChange({ ...date, [part]: value });
  };

  return (
    <div className={cn('grid grid-cols-1 gap-2', className)}>
      <div className="grid gap-1.5">
        <Label htmlFor="date-from">{t('dateRange.from')}</Label>
        <DatePicker
          id="date-from"
          date={date?.from}
          onDateChange={(value) => handleDateChange('from', value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="date-to">{t('dateRange.to')}</Label>
        <DatePicker
          id="date-to"
          date={date?.to}
          onDateChange={(value) => handleDateChange('to', value)}
        />
      </div>
    </div>
  );
};

export default DateRangePicker;