

import React, { FC } from 'react';
import { Button } from './ui/Button';
import { Stats } from './Stats';
import { useTranslation } from '../context/LanguageContext';

interface HeroProps {
  onGetStartedClick: () => void;
}

export const Hero: FC<HeroProps> = ({ onGetStartedClick }) => {
  const { t } = useTranslation();
  
  const handleLearnMoreClick = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="text-center py-24 md:py-32 animate-fade-in">
          <div className="animate-slide-up">
              <h1 className="font-display text-5xl md:text-7xl font-extrabold text-dark dark:text-primary [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]"
                dangerouslySetInnerHTML={{ __html: t('hero.title') }}
              >
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-light dark:text-slate-400 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                  {t('hero.subtitle')}
              </p>
              <p className="mt-4 max-w-3xl mx-auto text-sm text-slate-400 tracking-widest uppercase [text-shadow:0_1px_2px_rgba(0,0,0,0.1)] dark:[text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
                    {t('hero.acronym')}
              </p>
              <div className="mt-8 flex justify-center gap-4">
                  <Button onClick={onGetStartedClick} className="px-8 py-3 text-base">
                      {t('hero.requestDemo')}
                  </Button>
                  <Button onClick={handleLearnMoreClick} variant="secondary" className="px-8 py-3 text-base">
                      {t('hero.learnMore')}
                  </Button>
              </div>
          </div>
      </div>
      <Stats />
    </>
  );
};