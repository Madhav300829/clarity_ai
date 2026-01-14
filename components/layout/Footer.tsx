

import React, { FC } from 'react';
import { View } from '../../App';
import { TwitterIcon, GithubIcon, LinkedinIcon, LogoIcon } from '../icons/Icons';
import { useTranslation } from '../../context/LanguageContext';

interface FooterLinkProps {
  view: View;
  label: string;
  onNavigate: (view: View) => void;
}

const FooterLink: FC<FooterLinkProps> = ({ view, label, onNavigate }) => (
    <li><button onClick={() => onNavigate(view)} className="text-light dark:text-slate-400 hover:text-accent transition-colors">{label}</button></li>
);

interface FooterProps {
    onNavigate: (view: View) => void;
}

export const Footer: FC<FooterProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    
    const handleScrollLink = (view: View, elementId: string) => {
        onNavigate(view);
        setTimeout(() => document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth' }), 0);
    }
    
    return (
        <footer className="border-t border-slate-200 dark:border-slate-800 mt-auto bg-primary dark:bg-slate-900/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    <div className="col-span-2 lg:col-span-1">
                        <div className="flex items-center">
                           <LogoIcon className="h-10 w-auto" />
                        </div>
                        <p className="text-light dark:text-slate-400 mt-2 text-sm">{t('footer.tagline')}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-dark dark:text-slate-300 tracking-wider uppercase">{t('footer.products.title')}</h3>
                        <ul className="mt-4 space-y-2">
                            <li><button onClick={() => handleScrollLink('home', 'features')} className="text-light dark:text-slate-400 hover:text-accent transition-colors">{t('footer.products.features')}</button></li>
                            <FooterLink view="search" label={t('footer.products.search')} onNavigate={onNavigate}/>
                            <FooterLink view="knowledge" label={t('footer.products.knowledgeHub')} onNavigate={onNavigate}/>
                            <FooterLink view="hire" label={t('footer.products.hireUs')} onNavigate={onNavigate}/>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-dark dark:text-slate-300 tracking-wider uppercase">{t('footer.company.title')}</h3>
                        <ul className="mt-4 space-y-2">
                            <li><button onClick={() => handleScrollLink('home', 'about')} className="text-light dark:text-slate-400 hover:text-accent transition-colors">{t('footer.company.about')}</button></li>
                            <FooterLink view="careers" label={t('footer.company.careers')} onNavigate={onNavigate}/>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-dark dark:text-slate-300 tracking-wider uppercase">{t('footer.support.title')}</h3>
                        <ul className="mt-4 space-y-2">
                            <li><button onClick={() => handleScrollLink('home', 'contact')} className="text-light dark:text-slate-400 hover:text-accent transition-colors">{t('footer.support.contact')}</button></li>
                            <FooterLink view="help" label={t('footer.support.helpCenter')} onNavigate={onNavigate}/>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-light dark:text-slate-500 text-sm">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
                    <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                        <a href="#" className="text-light dark:text-slate-400 hover:text-accent transition-colors"><TwitterIcon /></a>
                        <a href="#" className="text-light dark:text-slate-400 hover:text-accent transition-colors"><GithubIcon /></a>
                        <a href="#" className="text-light dark:text-slate-400 hover:text-accent transition-colors"><LinkedinIcon /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}