

import React, { FC } from 'react';
import { Button } from './ui/Button';
import { useTranslation } from '../context/LanguageContext';

interface JobOpeningProps {
    title: string;
    location: string;
    department: string;
}

const JobOpening: FC<JobOpeningProps> = ({ title, location, department }) => {
    const { t } = useTranslation();
    return (
    <div className="bg-primary dark:bg-slate-800 p-6 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-secondary dark:hover:bg-slate-700 transition-colors duration-300 border border-slate-200 dark:border-slate-700">
        <div>
            <span className="text-sm text-accent font-medium">{department}</span>
            <h3 className="text-xl font-bold text-dark dark:text-secondary mt-1">{title}</h3>
            <p className="text-light dark:text-slate-400 mt-1">{location}</p>
        </div>
        <a href="#" className="font-bold rounded-md transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center bg-accent text-white hover:bg-green-600 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 py-2 px-4 mt-4 sm:mt-0 flex-shrink-0">
            {t('careers.applyNow')}
        </a>
    </div>
    )
};

export const Careers: FC = () => {
    const { t } = useTranslation();
    const jobOpenings = [
        { title: t('careers.jobs.frontend.title'), location: t('careers.jobs.locationRemote'), department: t('careers.jobs.departmentEngineering') },
        { title: t('careers.jobs.ai.title'), location: t('careers.jobs.locationRemote'), department: t('careers.jobs.departmentAI') },
        { title: t('careers.jobs.designer.title'), location: t('careers.jobs.locationRemote'), department: t('careers.jobs.departmentDesign') },
        { title: t('careers.jobs.devops.title'), location: t('careers.jobs.locationRemote'), department: t('careers.jobs.departmentEngineering') },
    ];
    
    return (
        <div className="py-8 animate-fade-in mb-16 md:mb-0">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12 animate-slide-up">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-dark dark:text-primary font-display [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{t('careers.title')}</h1>
                    <p className="mt-2 text-lg text-light dark:text-slate-400 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{t('careers.subtitle')}</p>
                </div>
                
                <div className="space-y-6 animate-slide-up" style={{animationDelay: '100ms'}}>
                    {jobOpenings.map(job => (
                        <JobOpening key={job.title} title={job.title} location={job.location} department={job.department} />
                    ))}
                </div>
            </div>
        </div>
    );
};