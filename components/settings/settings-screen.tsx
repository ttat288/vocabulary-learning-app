'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { Bot, Globe2, RotateCcw, Settings, SunMoon, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/language-context';
import { useTranslations } from '@/hooks/use-translations';
import { UserProgress } from '@/lib/types';
import type { Language } from '@/lib/i18n';
import {
  THEME_PRESET_LABELS,
  THEME_PRESET_SWATCHES,
  THEME_PRESETS,
  ThemePreset,
} from '@/lib/themes';

interface SettingsScreenProps {
  progress: UserProgress;
  onToggleTheme: () => void;
  onUpdateThemePreset: (themePreset: ThemePreset) => void;
  onReset: () => void;
  onClose: () => void;
}

const LANGUAGE_OPTIONS: { value: Language; labelKey: string }[] = [
  { value: 'en', labelKey: 'settings.languageEnglish' },
  { value: 'vi', labelKey: 'settings.languageVietnamese' },
];

export function SettingsScreen({
  progress,
  onToggleTheme,
  onUpdateThemePreset,
  onReset,
  onClose,
}: SettingsScreenProps) {
  const t = useTranslations();
  const { language, setLanguage } = useLanguage();
  const aiEnabled = progress.aiEnabled ?? false;

  const handleReset = () => {
    if (window.confirm(t('settings.resetConfirm'))) {
      onReset();
      onClose();
    }
  };

  const handleToggleAi = (enabled: boolean) => {
    window.dispatchEvent(new CustomEvent('toggleAi', { detail: { enabled } }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className='fixed inset-0 z-50 overflow-y-auto bg-background/80 p-3 backdrop-blur-sm sm:p-4'
      onClick={onClose}
    >
      <div className='flex min-h-full items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          onClick={(event) => event.stopPropagation()}
          className='w-full max-w-4xl'
        >
          <Card className='max-h-[calc(100dvh-1.5rem)] overflow-hidden'>
            <CardHeader className='border-b border-border p-4 sm:p-5'>
              <div className='flex items-center justify-between gap-4'>
                <CardTitle className='flex items-center gap-2 text-xl'>
                  <Settings className='h-5 w-5 text-primary' />
                  {t('settings.heading')}
                </CardTitle>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={onClose}
                  aria-label='Close settings'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </CardHeader>

            <CardContent className='max-h-[calc(100dvh-6rem)] overflow-auto p-4 sm:p-5'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <SettingsSection
                  icon={<SunMoon className='h-4 w-4' />}
                  title={t('settings.themeLabel')}
                >
                  <Button
                    type='button'
                    variant='outline'
                    onClick={onToggleTheme}
                    className='w-full justify-start'
                  >
                    {progress.theme === 'dark'
                      ? t('settings.lightMode')
                      : t('settings.darkMode')}
                  </Button>
                  {THEME_PRESETS.length > 1 && (
                    <div className='mt-3 grid grid-cols-2 gap-2'>
                      {THEME_PRESETS.map((themePreset) => (
                        <Button
                          key={themePreset}
                          type='button'
                          variant={
                            progress.themePreset === themePreset
                              ? 'default'
                              : 'outline'
                          }
                          onClick={() => onUpdateThemePreset(themePreset)}
                          className='justify-start gap-2'
                        >
                          <span
                            className='h-3.5 w-3.5 rounded-full border border-border'
                            style={{
                              backgroundColor:
                                THEME_PRESET_SWATCHES[themePreset],
                            }}
                            aria-hidden='true'
                          />
                          {THEME_PRESET_LABELS[themePreset]}
                        </Button>
                      ))}
                    </div>
                  )}
                </SettingsSection>

                <SettingsSection
                  icon={<Globe2 className='h-4 w-4' />}
                  title={t('settings.languageLabel')}
                >
                  <div className='grid grid-cols-2 gap-2'>
                    {LANGUAGE_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        type='button'
                        variant={
                          language === option.value ? 'default' : 'outline'
                        }
                        onClick={() => setLanguage(option.value)}
                      >
                        {t(option.labelKey)}
                      </Button>
                    ))}
                  </div>
                </SettingsSection>

                <SettingsSection icon={<Bot className='h-4 w-4' />} title='AI'>
                  <div className='flex items-center justify-between gap-4 rounded-lg border border-border bg-background/60 p-3'>
                    <span className='text-sm font-medium text-foreground'>
                      AI
                    </span>
                    <Switch
                      checked={aiEnabled}
                      onCheckedChange={handleToggleAi}
                      aria-label='Toggle AI'
                    />
                  </div>
                </SettingsSection>

                <div className='md:col-span-2'>
                  <Button
                    type='button'
                    variant='destructive'
                    onClick={handleReset}
                    className='w-full gap-2'
                  >
                    <RotateCcw className='h-4 w-4' />
                    {t('settings.resetButton')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SettingsSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className='rounded-xl border border-border bg-background/50 p-4'>
      <div className='mb-3 flex items-center gap-2 text-sm font-semibold text-foreground'>
        <span className='text-primary'>{icon}</span>
        {title}
      </div>
      {children}
    </section>
  );
}
