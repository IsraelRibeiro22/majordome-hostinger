import React from 'react';
import { motion } from 'framer-motion';
import DatePicker from '@/components/DatePicker';
import { useTranslation } from 'react-i18next';

const ChatMessage = ({ message, isLastMessage, isDateStep, tempData, onDateChange }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col gap-1 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
    >
      <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${message.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
      {message.isComponent && isDateStep && isLastMessage && (
        <div className="mt-2 w-full max-w-[85%]">
          <DatePicker
            date={tempData.date ? new Date(tempData.date) : new Date()}
            onDateChange={onDateChange}
            placeholder={t('selectDate')}
          />
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;