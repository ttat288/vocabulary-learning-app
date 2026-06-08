import { motion } from 'framer-motion';
import { useTranslations } from '@/hooks/use-translations';

interface ExplainButtonProps {
  onClick: () => void;
  isLoading: boolean;
  hasExplanation: boolean;
}

export function ExplainButton({
  onClick,
  isLoading,
  hasExplanation,
}: ExplainButtonProps) {
  const t = useTranslations();

  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200
        ${
          hasExplanation
            ? 'bg-accent/10 border border-accent text-accent hover:bg-accent/20'
            : 'bg-primary/10 border border-primary text-primary hover:bg-primary/20'
        }
        disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label={t('learning.explainButton')}
    >
      {isLoading ? (
        <>
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{t('learning.explaining')}</span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {hasExplanation
              ? t('learning.explainAgain')
              : t('learning.explainButton')}
          </span>
        </>
      )}
    </motion.button>
  );
}
