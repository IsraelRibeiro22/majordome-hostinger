import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ChatInput = ({ currentStep, onTextInput }) => {
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const textInput = e.target.elements.textInput;
    onTextInput(textInput.value);
    textInput.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        name="textInput"
        type={currentStep.includes('askAmount') ? 'number' : 'text'}
        placeholder={t('chat.typeHere')}
        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        autoFocus
        step={currentStep.includes('askAmount') ? "0.01" : undefined}
      />
      <Button type="submit" size="icon" className="rounded-full bg-blue-500 hover:bg-blue-600 transition-colors">
        <CheckCircle className="h-5 w-5 text-white" />
      </Button>
    </form>
  );
};

export default ChatInput;