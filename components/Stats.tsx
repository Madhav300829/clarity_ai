import React, { FC, useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';

const useCountUp = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const totalFrames = duration / 16; // Assumes 60fps (1000ms / 60fps ≈ 16ms)
        const increment = end / totalFrames;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.ceil(current));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [end, duration]);

    return count;
};

// Function to format large numbers for display (e.g., 1.5K, 2.1M)
const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M+`;
    }
    if (num >= 1000) {
        return `${Math.floor(num / 1000)}K+`;
    }
    return num.toLocaleString();
};


interface StatCardProps {
    value: string;
    label: string;
    icon: React.ReactNode;
}

const StatCard: FC<StatCardProps> = ({ value, label, icon }) => (
    <div className="bg-primary dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center shadow-md">
        <div className="flex justify-center text-accent mb-3">{icon}</div>
        <p className="font-display text-4xl font-bold text-dark dark:text-secondary">{value}</p>
        <p className="text-light dark:text-slate-400 uppercase tracking-wider text-sm">{label}</p>
    </div>
);

const Icons = {
    Queries: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    ),
    Experts: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    Projects: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
    )
};


export const Stats: FC = () => {
    const { t } = useTranslation();
    const queriesCount = useCountUp(157345);
    const expertsCount = useCountUp(532);
    const projectsCount = useCountUp(2419);

    return (
        <div className="py-16 md:py-24">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard value={formatNumber(queriesCount)} label={t('stats.queriesResolved')} icon={<Icons.Queries />} />
                    <StatCard value={formatNumber(expertsCount)} label={t('stats.expertsOnboarded')} icon={<Icons.Experts />} />
                    <StatCard value={formatNumber(projectsCount)} label={t('stats.projectsCompleted')} icon={<Icons.Projects />} />
                </div>
            </div>
        </div>
    );
};