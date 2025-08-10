import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const BiblicalWisdom = () => {
  const { t } = useTranslation();
  const [currentVerse, setCurrentVerse] = useState(0);

  const verses = [
    { text: "Pois onde estiver o seu tesouro, aí também estará o seu coração.", reference: "Mateus 6:21" },
    { text: "Os planos bem elaborados levam à fartura; mas o apressado sempre acaba na miséria.", reference: "Provérbios 21:5" },
    { text: "Honre o Senhor com todos os seus recursos e com os primeiros frutos de todas as suas plantações.", reference: "Provérbios 3:9" },
    { text: "É melhor ter pouco com o temor do Senhor do que grande riqueza com inquietação.", reference: "Salmos 37:16" },
    { text: "Não acumulem para vocês tesouros na terra, onde a traça e a ferrugem destroem, e onde os ladrões arrombam e furtam.", reference: "Mateus 6:19" },
    { text: "Quem confia em suas riquezas certamente cairá, mas os justos florescerão como a folhagem verdejante.", reference: "Provérbios 11:28" },
    { text: "Deem, e lhes será dado: uma boa medida, calcada, sacudida e transbordante será dada a vocês. Pois a medida que usarem, também será usada para medir vocês.", reference: "Lucas 6:38" },
    { text: "Tragam o dízimo todo ao depósito do templo, para que haja alimento em minha casa. Ponham-me à prova nisto, diz o Senhor dos Exércitos, e vejam se não vou abrir as comportas dos céus e derramar sobre vocês tantas bênçãos que nem terão onde guardá-las.", reference: "Malaquias 3:10" }
  ];

  const nextVerse = () => {
    setCurrentVerse((prev) => (prev + 1) % verses.length);
  };

  useEffect(() => {
    const interval = setInterval(nextVerse, 30000); // Muda a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="financial-card rounded-xl p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-950/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('biblicalWisdom.title')}</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextVerse}
          className="text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <motion.div
        key={currentVerse}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <blockquote className="text-gray-700 dark:text-gray-300 italic mb-3 leading-relaxed">
          "{verses[currentVerse].text}"
        </blockquote>
        <cite className="text-sm font-medium text-amber-700 dark:text-amber-500">
          {verses[currentVerse].reference}
        </cite>
      </motion.div>

      <div className="flex justify-center mt-4">
        <div className="flex space-x-1">
          {verses.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentVerse(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentVerse ? 'bg-amber-600 dark:bg-amber-400' : 'bg-amber-300 dark:bg-amber-700'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default BiblicalWisdom;