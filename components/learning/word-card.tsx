'use client';

import { Word } from '@/lib/types';
import { motion } from 'framer-motion';
import { useTranslations } from '@/hooks/use-translations';
import { useExplain } from '@/hooks/use-explain';
import { ExplainButton } from './explain-button';
import { ExplanationBox } from './explanation-box';

interface WordCardProps {
  word: Word;
  key: string;
}

export function WordCard({ word }: WordCardProps) {
  const t = useTranslations();
  const { explanation, isLoading, error, explain, clear } = useExplain();

  const handleExplain = async () => {
    if (explanation) {
      clear();
    } else {
      await explain(word);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-xl hover:shadow-2xl transition-shadow duration-300">
        {/* Word */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-2">
            {word.word}
          </h1>
        </div>

        {/* Phonetic */}
        <div className="text-center mb-8 pb-8 border-b border-border">
          <p className="text-xl md:text-2xl text-muted-foreground font-mono">
            {word.phonetic}
          </p>
        </div>

        {/* Meaning */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-primary mb-3">{t('learning.definition')}</h2>
          <p className="text-base md:text-lg text-foreground leading-relaxed">
            {word.meaning}
          </p>
        </div>

        {/* Example */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-primary mb-3">{t('learning.example')}</h2>
          <blockquote className="border-l-4 border-primary pl-4 py-2 mb-3">
            <p className="text-base md:text-lg text-foreground italic">
              {'\u201c'}{word.example}{'\u201d'}
            </p>
          </blockquote>
          <p className="text-sm md:text-base text-muted-foreground">
            {word.exampleMeaning}
          </p>
        </div>

        {/* AI Explanation */}
        <ExplanationBox
          explanation={explanation}
          error={error}
          isLoading={isLoading}
          onRetry={handleExplain}
        />

        {/* Explain Button */}
        <div className="flex justify-center mt-8">
          <ExplainButton
            onClick={handleExplain}
            isLoading={isLoading}
            hasExplanation={!!explanation}
          />
        </div>
      </div>
    </motion.div>
  );
}
