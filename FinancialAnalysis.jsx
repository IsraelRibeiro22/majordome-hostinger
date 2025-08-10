import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { Loader2, Wand2, AlertTriangle, CheckCircle, Target, Lightbulb } from 'lucide-react';
import { runAI } from '@/lib/ai';

const FinancialAnalysis = ({ allData, settings, onOpenChange }) => {
    const { t, i18n } = useTranslation(['analysis', 'toast']);
    const [isLoading, setIsLoading] = useState(true);
    const [insights, setInsights] = useState([]);
    const { toast } = useToast();

    const formatCurrency = (value, currency = 'BRL') => {
        const locale = i18n.language === 'fr' ? 'fr-FR' : 'pt-BR';
        return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
    };

    const generateInsights = useCallback(async () => {
        setIsLoading(true);
        setInsights([]);
        try {
            const financialContext = {
                bankAccounts: allData.bankAccounts,
                expenses: allData.expenses,
                income: allData.income,
                fixedExpenses: allData.fixedExpenses,
                fixedIncomes: allData.fixedIncomes,
                savingsGoals: allData.savingsGoals,
                budget: allData.budget,
            };

            const prompt = `
                Analise os seguintes dados financeiros de um usuário e forneça 3 a 5 insights ou dicas práticas e personalizadas.
                Seja conciso, útil e direto. Fale diretamente com o usuário (ex: "Notei que...", "Você poderia...").
                Categorize cada insight como 'account_health', 'expense_analysis', 'goal_progress' ou 'general_tip'.
            `;
            
            const result = await runAI(prompt, [], financialContext);

            if (result && result.insights) {
                setInsights(result.insights);
            } else {
                 throw new Error("Resposta da IA em formato inesperado.");
            }

        } catch (error) {
            console.error("Error generating financial insights:", error);
            toast({
                title: t('toast:error'),
                description: "Não foi possível obter os insights da IA. Por favor, tente novamente.",
                variant: "destructive",
            });
            // Fallback to simple analysis if AI fails
            setInsights([
                {
                    category: 'general_tip',
                    content: t('analysis:noData')
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [allData, t, toast]);

    useEffect(() => {
        generateInsights();
    }, []);

    const getIconForCategory = (category) => {
        switch (category) {
            case 'account_health':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'expense_analysis':
                return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'goal_progress':
                return <Target className="h-5 w-5 text-blue-500" />;
            case 'general_tip':
            default:
                return <Lightbulb className="h-5 w-5 text-purple-500" />;
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('analysis:title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('analysis:description')}</p>
            </div>

            <div className="flex-grow overflow-y-auto px-6 pb-6 space-y-4">
                <AnimatePresence>
                    {isLoading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-full text-center"
                        >
                            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Analisando suas finanças...</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">O mordomo está preparando seus insights.</p>
                        </motion.div>
                    ) : (
                        insights.map((insight, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="flex items-start gap-4 p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700"
                            >
                                <div className="flex-shrink-0 mt-1">
                                    {getIconForCategory(insight.category)}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">{insight.content}</p>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 mt-auto">
                 <Button onClick={generateInsights} disabled={isLoading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    {isLoading ? "Analisando..." : "Gerar Nova Análise"}
                </Button>
            </div>
        </div>
    );
};

export default FinancialAnalysis;