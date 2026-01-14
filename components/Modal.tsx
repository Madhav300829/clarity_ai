import React, { FC, ReactNode } from 'react';
import { XMarkIcon } from './icons/Icons';
import { useTranslation } from '../context/LanguageContext';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm animate-fade-in"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative bg-primary dark:bg-slate-800 w-full max-w-md p-6 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 m-4 animate-slide-up">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 id="modal-title" className="text-xl font-bold text-dark dark:text-secondary">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-dark dark:hover:text-secondary transition-colors"
                        aria-label={t('modal.close')}
                    >
                        <XMarkIcon />
                    </button>
                </div>
                <div className="mt-4">
                    {children}
                </div>
            </div>
        </div>
    );
};