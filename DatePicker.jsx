import React, { useState, useEffect } from 'react';
import { format, parse, isValid } from 'date-fns';
import { ptBR, fr } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTranslation } from 'react-i18next';
import { useDate } from '@/contexts/DateContext';

const DatePicker = ({ date, onDateChange, className, placeholder }) => {
  const { i18n, t } = useTranslation();
  const { locale } = useDate();
  const dateFormat = 'P'; // Use 'P' for localized short date format

  const [inputValue, setInputValue] = useState(date ? format(date, dateFormat, { locale }) : '');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    if (date) {
      if (isValid(date)) {
        setInputValue(format(date, dateFormat, { locale }));
      }
    } else {
      setInputValue('');
    }
  }, [date, dateFormat, locale]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    // Attempt to parse using the localized format
    const parsedDate = parse(inputValue, format(new Date(), dateFormat, { locale }), new Date(), { locale });
    if (isValid(parsedDate)) {
      onDateChange(parsedDate);
    } else {
      onDateChange(null);
      setInputValue('');
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  }

  const handleDateSelect = (selectedDate) => {
    onDateChange(selectedDate);
    setIsPopoverOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <Input
        type="text"
        placeholder={placeholder || format(new Date(), dateFormat, { locale })}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        className="pr-10"
      />
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={'ghost'}
            size="sm"
            className={cn(
              'absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent'
            )}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            locale={locale}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;