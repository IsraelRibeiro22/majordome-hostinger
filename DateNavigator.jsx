import React from 'react';
import { useDate } from '@/contexts/DateContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DateNavigator = () => {
  const { handlePreviousPeriod, handleNextPeriod } = useDate();

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon" onClick={handlePreviousPeriod} className="h-10 w-10">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={handleNextPeriod} className="h-10 w-10">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DateNavigator;