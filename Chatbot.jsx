import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ButlerIcon from '@/components/ButlerIcon';
import { useTranslation } from 'react-i18next';
import { useChatLogic } from '@/hooks/useChatLogic';
import ChatMessage from '@/components/chatbot/ChatMessage';
import ChatFooter from '@/components/chatbot/ChatFooter';
import Logo from '@/components/Logo';

const Chatbot = ({ allData, updateAllData, settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const messagesEndRef = useRef(null);

  const {
    messages,
    currentStep,
    tempData,
    isInputStep,
    isDateStep,
    handleOptionClick,
    handleTextInput,
    handleDateChange,
    resetChat,
  } = useChatLogic({ allData, updateAllData, t });

  useEffect(() => {
    if (isOpen) {
      resetChat();
    }
  }, [isOpen, resetChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-24 right-5 w-full max-w-sm h-[70vh] max-h-[600px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-slate-700 z-50"
          >
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
                  <Logo className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">MAJORDOME IA</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700">
                <X className="h-5 w-5" />
              </Button>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isLastMessage={msg.id === messages[messages.length - 1].id}
                  isDateStep={isDateStep}
                  tempData={tempData}
                  onDateChange={handleDateChange}
                />
              ))}
              <div ref={messagesEndRef} />
            </main>
            <ChatFooter
              isInputStep={isInputStep}
              isDateStep={isDateStep}
              currentStep={currentStep}
              lastMessageOptions={messages[messages.length - 1]?.options}
              onTextInput={handleTextInput}
              onOptionClick={handleOptionClick}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="fixed bottom-5 right-5 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
      >
        <Button
          size="lg"
          className="butler-button rounded-full w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg hover:scale-105 transition-transform"
          onClick={() => setIsOpen(!isOpen)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isOpen ? 'x' : 'butler'}
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X className="h-7 w-7" /> : <ButlerIcon className="h-8 w-8" />}
            </motion.div>
          </AnimatePresence>
        </Button>
      </motion.div>
    </>
  );
};

export default Chatbot;