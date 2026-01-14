import React, { FC } from 'react';
import { SparklesIcon, SearchIcon, QuestionMarkCircleIcon, BriefcaseIcon } from './icons/Icons';
import { useTranslation } from '../context/LanguageContext';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: FC<FeatureCardProps> = ({ icon, title, description }) => (
    <div className="bg-primary dark:bg-slate-800 rounded-xl p-6 text-center shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-500">
        <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-accent">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-dark dark:text-secondary">{title}</h3>
        <p className="text-light dark:text-slate-400 mt-2">{description}</p>
    </div>
);


export const Features: FC = () => {
  const { t } = useTranslation();
  return (
    <div className="py-8 animate-fade-in mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-extrabold text-dark dark:text-primary font-display [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{t('features.title')}</h1>
            <p className="mt-2 text-lg text-light dark:text-slate-400 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{t('features.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-slide-up" style={{animationDelay: '100ms'}}>
            <FeatureCard 
                icon={<SearchIcon />}
                title={t('features.search.title')}
                description={t('features.search.description')}
            />
            <FeatureCard 
                icon={<SparklesIcon />}
                title={t('features.chatbot.title')}
                description={t('features.chatbot.description')}
            />
            <FeatureCard 
                icon={<QuestionMarkCircleIcon />}
                title={t('features.knowledge.title')}
                description={t('features.knowledge.description')}
            />
            <FeatureCard 
                icon={<BriefcaseIcon />}
                title={t('features.hire.title')}
                description={t('features.hire.description')}
            />
        </div>
      </div>
    </div>
  );
};