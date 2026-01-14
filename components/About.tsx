import React, { FC } from 'react';
import { useTranslation } from '../context/LanguageContext';

export const About: FC = () => {
    const { t } = useTranslation();

    return (
        <div className="py-16 md:py-24 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12 animate-slide-up">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-accent [text-shadow:0_1px_2px_rgba(0,0,0,0.1)] dark:[text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">{t('about.mission')}</h2>
                    <h1 className="mt-2 font-display text-4xl md:text-5xl font-extrabold text-dark dark:text-primary [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{t('about.title')}</h1>
                </div>
                
                <div className="bg-primary dark:bg-slate-800 p-8 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 animate-slide-up text-center" style={{animationDelay: '100ms'}}>
                    <h3 className="text-2xl font-bold text-accent mb-4">{t('about.subtitle')}</h3>
                    <p className="text-dark dark:text-slate-300 leading-relaxed mb-6 text-lg">
                       {t('about.paragraph1')}
                    </p>
                    <p className="text-dark dark:text-slate-300 leading-relaxed text-lg">
                       {t('about.paragraph2')}
                    </p>
                </div>
            </div>
        </div>
    );
};