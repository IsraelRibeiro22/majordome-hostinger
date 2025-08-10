import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UploadCloud, FileText, AlertTriangle, PlusCircle, Trash2, ArrowRight } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const StatementImportDialog = ({ open, onOpenChange, allData, fetchData }) => {
  const { t } = useTranslation(['import', 'common', 'transactions']);
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [headers, setHeaders] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    date: '',
    description: '',
    debit: '',
    credit: '',
    amount: ''
  });

  const resetState = useCallback(() => {
    setStep(1);
    setFile(null);
    setSelectedAccount('');
    setIsParsing(false);
    setTransactions([]);
    setHeaders([]);
    setRawData([]);
    setColumnMapping({ date: '', description: '', debit: '', credit: '', amount: '' });
    setIsSaving(false);
  }, []);

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (allowedTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xls') || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
      } else {
        toast({
          title: t('invalidFileTitle'),
          description: t('invalidFileDescCSV'),
          variant: 'destructive',
        });
      }
    }
  };
  
  const autoMapColumns = (cols) => {
    const mapping = {};
    const lowerCaseCols = cols.map(c => c.toLowerCase());
    
    const dateKeywords = ['date', 'data'];
    const descKeywords = ['description', 'descrição', 'historico', 'histórico', 'reference', 'referência'];
    const debitKeywords = ['debit', 'débito', 'saida', 'saída'];
    const creditKeywords = ['credit', 'crédito', 'entrada'];
    const amountKeywords = ['amount', 'valor', 'value'];

    mapping.date = cols[lowerCaseCols.findIndex(c => dateKeywords.some(kw => c.includes(kw)))] || '';
    mapping.description = cols[lowerCaseCols.findIndex(c => descKeywords.some(kw => c.includes(kw)))] || '';
    mapping.debit = cols[lowerCaseCols.findIndex(c => debitKeywords.some(kw => c.includes(kw)))] || '';
    mapping.credit = cols[lowerCaseCols.findIndex(c => creditKeywords.some(kw => c.includes(kw)))] || '';
    mapping.amount = cols[lowerCaseCols.findIndex(c => amountKeywords.some(kw => c.includes(kw)) && !mapping.debit && !mapping.credit)] || '';

    setColumnMapping(mapping);
  };

  const handleParseFile = () => {
    if (!file || !selectedAccount) {
      toast({ title: t('missingInfoTitle'), description: t('missingInfoDesc'), variant: 'destructive' });
      return;
    }
    setIsParsing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let data;
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          const result = Papa.parse(e.target.result, { header: true, skipEmptyLines: true });
          data = result.data;
          setHeaders(result.meta.fields);
          autoMapColumns(result.meta.fields);
        } else {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          data = XLSX.utils.sheet_to_json(worksheet);
          const firstRow = data.length > 0 ? Object.keys(data[0]) : [];
          setHeaders(firstRow);
          autoMapColumns(firstRow);
        }
        setRawData(data);
        setStep(2);
      } catch (error) {
        toast({ title: t('parseErrorTitle'), description: error.message, variant: 'destructive' });
      } finally {
        setIsParsing(false);
      }
    };

    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const processMappedData = () => {
    if (!columnMapping.date || !columnMapping.description || (!columnMapping.amount && !columnMapping.debit && !columnMapping.credit)) {
      toast({ title: t('mappingErrorTitle'), description: t('mappingErrorDesc'), variant: 'destructive' });
      return;
    }

    const normalizeAmount = (val) => {
        if (typeof val === 'number') return val;
        if (typeof val !== 'string') return 0;
        return parseFloat(val.replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
    };

    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const formats = ['dd/MM/yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy', 'dd-MM-yyyy', 'dd/MM/yy'];
        for (const fmt of formats) {
            const parsed = parse(String(dateStr), fmt, new Date());
            if (isValid(parsed)) return format(parsed, 'yyyy-MM-dd');
        }
        // Try to parse excel date number
        if(typeof dateStr === 'number' && dateStr > 1) {
             const excelEpoch = new Date(1899, 11, 30);
             const parsed = new Date(excelEpoch.getTime() + dateStr * 24 * 60 * 60 * 1000);
             if(isValid(parsed)) return format(parsed, 'yyyy-MM-dd');
        }
        return null;
    };

    const processed = rawData.map((row, index) => {
        const date = parseDate(row[columnMapping.date]);
        const description = row[columnMapping.description];

        if (!date || !description) return null;

        let amount = 0;
        let type = 'expense';

        if (columnMapping.debit && columnMapping.credit) {
            const debit = normalizeAmount(row[columnMapping.debit]);
            const credit = normalizeAmount(row[columnMapping.credit]);
            if (debit > 0) {
                amount = debit;
                type = 'expense';
            } else if (credit > 0) {
                amount = credit;
                type = 'income';
            } else {
                return null;
            }
        } else if (columnMapping.amount) {
            amount = normalizeAmount(row[columnMapping.amount]);
            type = amount >= 0 ? 'income' : 'expense';
            amount = Math.abs(amount);
        } else {
            return null;
        }

        if (amount === 0) return null;
        
        return {
            id: `tx-${index}`,
            date,
            description: String(description).trim(),
            amount,
            type,
            category: '',
            include: true,
        };
    }).filter(Boolean);

    setTransactions(processed);
    setStep(3);
  };
  
  const handleTransactionChange = (index, field, value) => {
    const newTransactions = [...transactions];
    newTransactions[index][field] = value;
    if (field === 'type') newTransactions[index]['category'] = '';
    setTransactions(newTransactions);
  };
  
  const handleAddRow = () => {
    setTransactions(prev => [...prev, {
        id: `manual-${Date.now()}`, date: format(new Date(), 'yyyy-MM-dd'),
        description: '', amount: 0, type: 'expense', category: '', include: true,
    }]);
  };

  const handleRemoveRow = (id) => setTransactions(prev => prev.filter(tx => tx.id !== id));

  const handleSave = async () => {
    setIsSaving(true);
    const toImport = transactions.filter(tx => tx.include && tx.category && tx.amount > 0);
    
    console.log("Saving transactions (local):", toImport);
    
    toast({ title: t('successTitle'), description: t('successDesc', { count: toImport.length }) });
    await fetchData();
    handleOpenChange(false);
    setIsSaving(false);
  };

  const renderStep1 = () => (
    <>
      <DialogHeader>
        <DialogTitle>{t('step1Title')}</DialogTitle>
        <DialogDescription>{t('step1DescCSV')}</DialogDescription>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">{t('uploadLabel')}</Label>
          <div className="relative">
            <Input id="file-upload" type="file" accept=".csv, .xls, .xlsx" onChange={handleFileChange} className="pl-12"/>
            <UploadCloud className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          {file && <p className="text-sm text-gray-500 flex items-center gap-2 pt-2"><FileText className="h-4 w-4"/> {file.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="account-select">{t('accountLabel')}</Label>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger id="account-select"><SelectValue placeholder={t('accountPlaceholder')} /></SelectTrigger>
            <SelectContent>{allData.bankAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => handleOpenChange(false)}>{t('common:cancel')}</Button>
        <Button onClick={handleParseFile} disabled={isParsing || !file || !selectedAccount}>
          {isParsing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t('nextButton')} <ArrowRight className="ml-2 h-4 w-4"/>
        </Button>
      </DialogFooter>
    </>
  );

  const renderStep2 = () => (
    <>
      <DialogHeader>
        <DialogTitle>{t('step2MapTitle')}</DialogTitle>
        <DialogDescription>{t('step2MapDesc')}</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        {[
            { key: 'date', label: t('map.date') },
            { key: 'description', label: t('map.description') },
            { key: 'amount', label: t('map.amountSingle') },
            { key: 'debit', label: t('map.debit') },
            { key: 'credit', label: t('map.credit') },
        ].map(field => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={`map-${field.key}`}>{field.label}</Label>
            <Select value={columnMapping[field.key]} onValueChange={value => setColumnMapping(prev => ({ ...prev, [field.key]: value }))}>
              <SelectTrigger id={`map-${field.key}`}><SelectValue placeholder={t('map.selectColumn')} /></SelectTrigger>
              <SelectContent>{headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500">{t('map.amountDesc')}</p>
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={() => setStep(1)}>{t('common:back')}</Button>
        <Button onClick={processMappedData}>{t('processButton')} <ArrowRight className="ml-2 h-4 w-4"/></Button>
      </DialogFooter>
    </>
  );

  const renderStep3 = () => (
    <>
      <DialogHeader>
        <DialogTitle>{t('step3Title')}</DialogTitle>
        <DialogDescription>{t('step3Desc')}</DialogDescription>
      </DialogHeader>
      <div className="my-4 p-3 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-400 text-amber-800 dark:text-amber-200 text-sm rounded-r-lg">
        <div className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 mt-0.5"/><p>{t('betaWarning')}</p></div>
      </div>
      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 -mr-2">
        {transactions.map((tx, index) => (
          <div key={tx.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-2 border rounded-md dark:border-slate-700">
            <div className="md:col-span-1 flex items-center justify-center"><Checkbox checked={tx.include} onCheckedChange={(c) => handleTransactionChange(index, 'include', c)} /></div>
            <div className="md:col-span-2"><Input type="date" value={tx.date} onChange={(e) => handleTransactionChange(index, 'date', e.target.value)} /></div>
            <div className="md:col-span-3"><Input value={tx.description} onChange={(e) => handleTransactionChange(index, 'description', e.target.value)} /></div>
            <div className="md:col-span-2"><Input type="number" value={tx.amount} onChange={(e) => handleTransactionChange(index, 'amount', parseFloat(e.target.value)||0)} /></div>
            <div className="md:col-span-2">
              <Select value={tx.type} onValueChange={(v) => handleTransactionChange(index, 'type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="income">{t('transactions:income')}</SelectItem><SelectItem value="expense">{t('transactions:expense')}</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={tx.category} onValueChange={(v) => handleTransactionChange(index, 'category', v)}>
                <SelectTrigger><SelectValue placeholder={t('common:selectCategory')} /></SelectTrigger>
                <SelectContent>{(tx.type === 'income' ? allData.incomeCategories : allData.expenseCategories).map(cat => <SelectItem key={cat.key} value={cat.key}>{cat.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-12 flex justify-end">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleRemoveRow(tx.id)}><Trash2 className="h-4 w-4"/></Button>
            </div>
          </div>
        ))}
        {transactions.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('noTransactionsFoundTitle')}</p>}
      </div>
      <div className="mt-4"><Button variant="outline" onClick={handleAddRow} className="w-full"><PlusCircle className="mr-2 h-4 w-4"/>{t('addRow')}</Button></div>
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={() => setStep(2)}>{t('common:back')}</Button>
        <Button onClick={handleSave} disabled={isSaving || transactions.filter(t=>t.include).length === 0}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t('saveButton')}
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </DialogContent>
    </Dialog>
  );
};

export default StatementImportDialog;