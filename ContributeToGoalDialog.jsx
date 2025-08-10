import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const ContributeToGoalDialog = ({ goal, bankAccounts, onContribute, onOpenChange }) => {
  const { t, i18n } = useTranslation(['savings', 'common', 'toast']);
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [error, setError] = useState('');

  const targetAccount = useMemo(() => bankAccounts.find(acc => acc.id === goal.accountId), [bankAccounts, goal]);
  
  const compatibleAccounts = useMemo(() => {
    if (!targetAccount) return bankAccounts;
    return bankAccounts.filter(acc => acc.currency === targetAccount.currency);
  }, [bankAccounts, targetAccount]);

  const selectedAccount = useMemo(() => bankAccounts.find(acc => acc.id === parseInt(accountId)), [bankAccounts, accountId]);

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError(t('toast:invalidAmount'));
      return;
    }
    if (!accountId) {
      setError(t('toast:selectAccount'));
      return;
    }
    if (selectedAccount && selectedAccount.current_balance < numericAmount) {
      setError(t('toast:insufficientFundsMessage'));
      return;
    }

    onContribute({
      goalId: goal.id,
      amount: numericAmount,
      accountId: parseInt(accountId)
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('savings:goals.contributeTo')} "{goal.name}"</DialogTitle>
          <DialogDescription>
            {t('savings:goals.contributionDescription')}
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t('savings:goals.currentProgress')}: {formatCurrency(goal.current_amount, targetAccount?.currency, i18n.language)} / {formatCurrency(goal.target_amount, targetAccount?.currency, i18n.language)}
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account" className="text-right">
              {t('savings:goals.fromAccount')}
            </Label>
            <Select onValueChange={setAccountId} value={accountId}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t('savings:goals.selectAccountPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                    {compatibleAccounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id.toString()}>
                            {acc.name} ({formatCurrency(acc.current_balance, acc.currency, i18n.language)})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              {t('common:amount')}
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              className="col-span-3"
              placeholder="0.00"
            />
          </div>
          {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('toast:error')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">{t('common:cancel')}</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit}>{t('savings:goals.contribute')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContributeToGoalDialog;