import React, { FC } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { XMarkIcon } from './icons/Icons';

interface LanguageSwitcherProps {
    isOpen: boolean;
    onClose: () => void;
}

const languages: { code: 'en' | 'es' | 'fr' | 'de'; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
];

export const LanguageSwitcher: FC<LanguageSwitcherProps> = ({ isOpen, onClose }) => {
    const { language, setLanguage, t } = useTranslation();

    const handleLanguageChange = (langCode: 'en' | 'es' | 'fr' | 'de') => {
        setLanguage(langCode);
        onClose();
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-30"
                    onClick={onClose}
                    aria-hidden="true"
                ></div>
            )}
            <div className={`fixed top-20 right-6 z-50 bg-primary dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 w-64 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <div className="flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-dark dark:text-secondary text-base">{t('languageSwitcher.title')}</h3>
                    <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-dark dark:hover:text-secondary p-1 rounded-full"><XMarkIcon /></button>
                </div>

                <div className="p-2">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${language === lang.code ? 'bg-accent text-white' : 'text-dark dark:text-secondary hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};
