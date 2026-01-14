



import React, { FC } from 'react';
import { View } from '../../App';
import { Button } from '../ui/Button';
import { BellIcon, PaintBrushIcon, LogoIcon, GlobeAltIcon } from '../icons/Icons';
import { useTranslation } from '../../context/LanguageContext';

interface NavLinkProps {
  view: View;
  label: string;
  activeView: View;
  onNavigate: (view: View) => void;
}

const NavLink: FC<NavLinkProps> = ({ view, label, activeView, onNavigate }) => (
    <button
      onClick={() => onNavigate(view)}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${activeView === view ? 'text-accent font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-dark dark:hover:text-secondary'}`}
    >
      {label}
    </button>
  );

interface HeaderProps {
    activeView: View;
    isAuthenticated: boolean;
    onNavigate: (view: View) => void;
    onLoginClick: () => void;
    onSignUpClick: () => void;
    onLogout: () => void;
    onToggleAppearancePanel: () => void;
    onToggleNotificationsPanel: () => void;
    onToggleLanguagePanel: () => void;
}

export const Header: FC<HeaderProps> = ({ activeView, isAuthenticated, onNavigate, onLoginClick, onSignUpClick, onLogout, onToggleAppearancePanel, onToggleNotificationsPanel, onToggleLanguagePanel }) => {
    const { t } = useTranslation();
    
    return (
    <header className="sticky top-0 z-40 bg-primary/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/80 dark:border-slate-700/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <button onClick={() => onNavigate('home')} className="flex items-center">
                    <LogoIcon className="h-10 w-auto" />
                </button>
                <nav className="hidden md:flex items-center gap-1">
                    <NavLink view="home" label={t('header.home')} activeView={activeView} onNavigate={onNavigate} />
                    <NavLink view="chatbot" label={t('header.chatbot')} activeView={activeView} onNavigate={onNavigate} />
                    <NavLink view="search" label={t('header.search')} activeView={activeView} onNavigate={onNavigate} />
                    <NavLink view="knowledge" label={t('header.knowledgeHub')} activeView={activeView} onNavigate={onNavigate} />
                    <NavLink view="hire" label={t('header.hireUs')} activeView={activeView} onNavigate={onNavigate} />
                </nav>
                 <div className="hidden md:flex items-center gap-2">
                    <button
                        onClick={onToggleNotificationsPanel}
                        className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-dark dark:hover:text-secondary transition-colors"
                        aria-label={t('header.aria.viewNotifications')}
                    >
                        <BellIcon className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-primary dark:ring-slate-900"></span>
                    </button>
                    <button
                        onClick={onToggleAppearancePanel}
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-dark dark:hover:text-secondary transition-colors"
                        aria-label={t('header.aria.customizeAppearance')}
                    >
                        <PaintBrushIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onToggleLanguagePanel}
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-dark dark:hover:text-secondary transition-colors"
                        aria-label={t('header.aria.changeLanguage')}
                    >
                        <GlobeAltIcon className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    {isAuthenticated ? (
                         <>
                            <NavLink view="dashboard" label={t('header.dashboard')} activeView={activeView} onNavigate={onNavigate} />
                            <button onClick={onLogout} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-dark dark:hover:text-secondary transition-colors">{t('header.logout')}</button>
                         </>
                    ) : (
                         <>
                            <button onClick={onLoginClick} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-dark dark:hover:text-secondary transition-colors">{t('header.login')}</button>
                            <Button onClick={onSignUpClick} className="px-4 py-2 text-sm">{t('header.signUp')}</Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    </header>
    )
};