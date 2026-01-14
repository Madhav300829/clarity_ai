import React, { FC } from 'react';
import { useTranslation } from '../context/LanguageContext';

const HelpTopic: FC<{ title: string; description: string }> = ({ title, description }) => (
    <a href="#" className="block p-6 bg-primary dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 hover:border-accent dark:hover:border-accent hover:bg-secondary dark:hover:bg-slate-700 transition-colors duration-300">
        <h3 className="text-xl font-bold text-accent">{title}</h3>
        <p className="text-light dark:text-slate-400 mt-2">{description}</p>
    </a>
);

export const HelpCenter: FC = () => {
    const { t } = useTranslation();
    const topics = [
        { title: t('help.topics.gettingStarted.title'), description: t('help.topics.gettingStarted.description') },
        { title: t('help.topics.billing.title'), description: t('help.topics.billing.description') },
        { title: t('help.topics.marketplace.title'), description: t('help.topics.marketplace.description') },
        { title: t('help.topics.api.title'), description: t('help.topics.api.description') },
    ];

    return (
        <div className="py-8 animate-fade-in mb-16 md:mb-0">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12 animate-slide-up">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-dark dark:text-primary font-display [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{t('help.title')}</h1>
                    <p className="mt-2 text-lg text-light dark:text-slate-400 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{t('help.subtitle')}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{animationDelay: '100ms'}}>
                    {topics.map(topic => (
                        <HelpTopic 
                            key={topic.title}
                            title={topic.title}
                            description={topic.description}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};