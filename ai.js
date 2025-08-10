import { supabase } from '@/lib/customSupabaseClient';

export const runAI = async (prompt, financialData) => {
    // Remove budget data before sending to AI
    const { budget, ...restOfFinancialData } = financialData;

    try {
        const { data, error } = await supabase.functions.invoke('ai-analysis-proxy', {
            body: { prompt, financialData: restOfFinancialData },
        });

        if (error) {
            console.error('Error invoking Supabase function:', error);
            throw new Error(error.message);
        }
        
        return data;

    } catch (error) {
        console.error("Error running AI analysis:", error);
        return {
            insights: [{
                category: 'general_tip',
                content: "O serviço de IA encontrou um problema. Por favor, tente novamente mais tarde."
            }]
        };
    }
};