import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import ChatInput from '@/components/chatbot/ChatInput';

const ChatFooter = ({ isInputStep, isDateStep, currentStep, lastMessageOptions, onTextInput, onOptionClick }) => {
  const { t } = useTranslation();

  return (
    <footer className="p-4 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
      {isInputStep ? (
        <ChatInput
          currentStep={currentStep}
          onTextInput={onTextInput}
        />
      ) : isDateStep ? (
        <div className="flex justify-center text-sm text-gray-500 dark:text-gray-400">
          {t('chat.selectDatePrompt')}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-2">
          {lastMessageOptions?.map((opt, i) => (
            <Button key={i} variant="outline" onClick={() => onOptionClick(opt)} className="flex items-center gap-2">
              {opt.icon && <opt.icon className="h-4 w-4" />}
              {opt.text}
            </Button>
          ))}
        </div>
      )}
    </footer>
  );
};

export default ChatFooter;