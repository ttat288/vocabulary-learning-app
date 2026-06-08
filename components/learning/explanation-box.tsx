import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/hooks/use-translations';
import { ExplainButton } from './explain-button';

interface ExplanationBoxProps {
  explanation: string | null;
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
}

export function ExplanationBox({
  explanation,
  error,
  isLoading,
  onRetry,
}: ExplanationBoxProps) {
  const t = useTranslations();

  return (
    <AnimatePresence mode="wait">
      {explanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-accent/5 border-2 border-accent rounded-lg p-4 mb-4"
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-accent flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm3-1a1 1 0 11-2 0 1 1 0 012 0z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold text-accent mb-2">
                {t('learning.aiExplanation')}
              </h4>
              <p className="text-sm text-foreground leading-relaxed">
                {explanation}
              </p>
              <button
                onClick={onRetry}
                className="mt-3 text-xs font-semibold text-accent hover:underline transition-colors"
              >
                {t('learning.retryExplanation')}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-red-500/10 border-2 border-red-500/50 rounded-lg p-4 mb-4"
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={onRetry}
                className="mt-2 text-xs font-semibold text-red-600 hover:underline transition-colors"
              >
                {t('learning.tryAgain')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
