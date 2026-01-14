

import React, { FC, useState, FormEvent } from 'react';
import { Button } from './ui/Button';
import { useTranslation } from '../context/LanguageContext';

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export const Contact: FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<SubmissionStatus>('idle');
    const { t } = useTranslation();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if(!name || !email || !message) return;

        setStatus('submitting');
        // Simulate API call
        setTimeout(() => {
            console.log({ name, email, message });
            setStatus('success');
            setName('');
            setEmail('');
            setMessage('');

            // Reset status after a few seconds
            setTimeout(() => setStatus('idle'), 3000);
        }, 1500);
    };

    return (
        <div className="py-8 animate-fade-in mb-16 md:mb-0">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12 animate-slide-up">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-dark dark:text-primary font-display [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{t('contact.title')}</h1>
                    <p className="mt-2 text-lg text-light dark:text-slate-400 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{t('contact.subtitle')}</p>
                </div>
                
                <div className="bg-primary dark:bg-slate-800 p-8 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 animate-slide-up" style={{animationDelay: '100ms'}}>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{t('contact.name.label')}</label>
                                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full p-3 bg-secondary dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition text-dark dark:text-secondary" placeholder={t('contact.name.placeholder')} />
                            </div>
                             <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{t('contact.email.label')}</label>
                                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 bg-secondary dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition text-dark dark:text-secondary" placeholder={t('contact.email.placeholder')} />
                            </div>
                        </div>
                        <div className="mt-6">
                             <label htmlFor="message" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{t('contact.message.label')}</label>
                             <textarea id="message" rows={5} value={message} onChange={e => setMessage(e.target.value)} required className="w-full p-3 bg-secondary dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition text-dark dark:text-secondary" placeholder={t('contact.message.placeholder')}></textarea>
                        </div>
                        <div className="mt-6 flex justify-end items-center gap-4">
                            {status === 'success' && (
                                <p className="text-green-600 dark:text-green-400 text-sm animate-fade-in">{t('contact.successMessage')}</p>
                            )}
                            <Button
                                type="submit"
                                className="py-3 px-6 min-w-[150px]"
                                isLoading={status === 'submitting'}
                            >
                                {t('contact.sendMessage')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};