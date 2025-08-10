import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import FinancialAnalysis from '@/components/FinancialAnalysis';
import FinancialSearchDialog from '@/components/FinancialSearchDialog';

const QuickActions = ({ allData, settings, updateAllData }) => {
    const { t } = useTranslation('actions');
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const actions = [
        {
            icon: Lightbulb,
            titleKey: 'financialAnalysis',
            descriptionKey: 'customInsights',
            gradient: 'from-purple-500 to-violet-600',
            iconBg: 'bg-white/20',
            onClick: () => setIsAnalysisOpen(true),
        },
        {
            icon: Search,
            titleKey: 'financialSearch',
            descriptionKey: 'searchByCategory',
            gradient: 'from-yellow-500 to-amber-600',
            iconBg: 'bg-white/20',
            onClick: () => setIsSearchOpen(true),
        },
    ];

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: 'easeOut',
            },
        }),
        hover: {
            scale: 1.03,
            boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)',
            transition: {
                duration: 0.2,
                ease: 'easeOut',
            },
        },
    };

    return (
        <>
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <FinancialSearchDialog allData={allData} onOpenChange={setIsSearchOpen} />
            </Dialog>

            <Dialog open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
                 <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0">
                    <FinancialAnalysis allData={allData} settings={settings} onOpenChange={setIsAnalysisOpen} />
                </DialogContent>
            </Dialog>

            <div className="rounded-xl p-6 bg-white dark:bg-slate-900 shadow-md">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('quickActionsTitle')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {actions.map((action, i) => (
                        <motion.div
                            key={action.titleKey}
                            custom={i}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            className={`rounded-lg p-4 text-white cursor-pointer transform transition-all duration-300 ease-in-out bg-gradient-to-br ${action.gradient}`}
                            onClick={action.onClick}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${action.iconBg}`}>
                                    <action.icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-lg">{t(action.titleKey)}</p>
                                    <p className="text-sm opacity-90">{t(action.descriptionKey)}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default QuickActions;