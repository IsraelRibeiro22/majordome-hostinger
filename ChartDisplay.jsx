import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { useTranslation } from 'react-i18next';

const ChartDisplay = ({ chartData, handleChartClick, selectedCurrency }) => {
  const { t, i18n } = useTranslation(['savings', 'common']);

  const formatCurrency = (value, currency) => {
    const lang = i18n.language === 'fr' ? 'fr-FR' : 'pt-BR';
    return new Intl.NumberFormat(lang, { style: 'currency', currency }).format(value || 0);
  };

  const formatYAxis = (tickItem) => {
    if (Math.abs(tickItem) >= 1000000) return `${(tickItem / 1000000).toLocaleString(i18n.language, { maximumFractionDigits: 1 })}M`;
    if (Math.abs(tickItem) >= 1000) return `${(tickItem / 1000).toLocaleString(i18n.language, { maximumFractionDigits: 1 })}K`;
    return tickItem.toString();
  };

  const CustomTooltip = ({ active, payload, label, currency }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800 dark:text-gray-200">{label}</p>
          {payload.map((pld) => (
            <p key={pld.dataKey} style={{ color: pld.color }} className="text-sm">
              {t(`evolution.${pld.dataKey}`)}: {formatCurrency(pld.value, currency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const hasData = chartData && chartData.length > 0 && chartData.some(d => d.income > 0 || d.expenses > 0 || d.balance !== 0);

  return (
    <div style={{ width: '100%', height: 350 }}>
      {hasData ? (
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} onClick={handleChartClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={{ stroke: 'hsl(var(--muted-foreground))' }} />
            <YAxis yAxisId="left" tickFormatter={formatYAxis} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={{ stroke: 'hsl(var(--muted-foreground))' }} />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tickFormatter={formatYAxis} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
              tickLine={{ stroke: 'hsl(var(--muted-foreground))' }} 
              domain={[min => Math.min(0, min), max => Math.max(0, max)]} 
              allowDataOverflow={true} 
            />
            <Tooltip content={<CustomTooltip currency={selectedCurrency} />} />
            <Legend formatter={(value) => t(`evolution.${value}`)} />
            <ReferenceLine y={0} yAxisId="right" stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <Bar yAxisId="left" dataKey="income" name="income" fill="#22c55e" barSize={20}>
              {chartData.map((entry, index) => (
                <rect key={`bar-income-${index}`} x={0} y={0} width={0} height={0} fill={entry.isProjected ? 'rgba(34, 197, 94, 0.6)' : '#22c55e'} />
              ))}
            </Bar>
            <Bar yAxisId="left" dataKey="fixedExpenses" name="fixedExpenses" stackId="expenses" fill="#a855f7" barSize={20}>
              {chartData.map((entry, index) => (
                <rect key={`bar-fixed-expense-${index}`} x={0} y={0} width={0} height={0} fill={entry.isProjected ? 'rgba(168, 85, 247, 0.6)' : '#a855f7'} />
              ))}
            </Bar>
            <Bar yAxisId="left" dataKey="commonExpenses" name="commonExpenses" stackId="expenses" fill="#ef4444" barSize={20}>
              {chartData.map((entry, index) => (
                <rect key={`bar-common-expense-${index}`} x={0} y={0} width={0} height={0} fill={entry.isProjected ? 'rgba(239, 68, 68, 0.6)' : '#ef4444'} />
              ))}
            </Bar>
            <Line yAxisId="right" type="monotone" dataKey="balance" name="balance" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600 dark:text-gray-400">{t('common:noData')}</p>
        </div>
      )}
    </div>
  );
};

export default ChartDisplay;