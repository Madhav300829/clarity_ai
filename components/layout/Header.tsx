



import React, { FC, useState, useEffect } from 'react';
import { View } from '../../App';
import { Button } from '../ui/Button';
import { BellIcon, PaintBrushIcon, LogoIcon, GlobeAltIcon, WalletIcon, ArrowDownTrayIcon } from '../icons/Icons';
import { useTranslation } from '../../context/LanguageContext';
import { Settings as SettingsIcon } from 'lucide-react';

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
    onToggleWalletPanel: () => void;
    onToggleDownloadPanel: () => void;
    onToggleLanguagePanel: () => void;
    onSettingsClick: () => void;
    onClarityAboutClick: () => void;
}

export const Header: FC<HeaderProps> = ({ activeView, isAuthenticated, onNavigate, onLoginClick, onSignUpClick, onLogout, onToggleAppearancePanel, onToggleNotificationsPanel, onToggleWalletPanel, onToggleDownloadPanel, onToggleLanguagePanel, onSettingsClick, onClarityAboutClick }) => {
    const { t } = useTranslation();
    
    // Listen for live Wallet balance updates
    const [balance, setBalance] = useState<number>(250);
    useEffect(() => {
        const updateBalance = () => {
            const saved = localStorage.getItem('clarity_wallet_balance');
            if (saved) setBalance(parseFloat(saved));
        };
        updateBalance();
        window.addEventListener('wallet_updated', updateBalance);
        return () => window.removeEventListener('wallet_updated', updateBalance);
    }, []);
    
    return (
    <header className="sticky top-0 z-40 bg-primary/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/80 dark:border-slate-700/80">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
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
                    <button
                      onClick={onClarityAboutClick}
                      className="px-3 py-2 rounded-md text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all flex items-center gap-1.5 animate-pulse"
                      title="Show Clarity.AI Info Tour Screen"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30"></span>
                      Clarity Tour
                    </button>
                </nav>
                 <div className="hidden md:flex items-center gap-2">
                    <button
                        onClick={onToggleWalletPanel}
                        className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-dark dark:hover:text-secondary transition-colors"
                        title={t('dashboard.myWallet.title')}
                        aria-label={t('dashboard.myWallet.title')}
                    >
                        <WalletIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-450" />
                        <span className="absolute -top-1 -right-1 bg-emerald-500 text-white font-mono text-[8px] font-extrabold px-1 rounded-full scale-90 border border-white dark:border-slate-900">
                          ${balance < 1000 ? balance.toFixed(0) : `${(balance/1000).toFixed(1)}k`}
                        </span>
                    </button>
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
                        onClick={onToggleDownloadPanel}
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-dark dark:hover:text-secondary transition-all"
                        title="Download Data Exports"
                        aria-label="Download Data Exports"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5 text-emerald-500 hover:text-emerald-600 dark:text-emerald-450 dark:hover:text-emerald-500" />
                    </button>
                    <button
                        onClick={onToggleLanguagePanel}
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-dark dark:hover:text-secondary transition-colors"
                        aria-label={t('header.aria.changeLanguage')}
                        title="Change Language"
                    >
                        <GlobeAltIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onSettingsClick}
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-dark dark:hover:text-secondary transition-all"
                        aria-label="Customize Preferences"
                        title="Preference & Settings Hub"
                    >
                        <SettingsIcon className="w-5 h-5 text-emerald-500 hover:text-emerald-600 dark:text-emerald-450 dark:hover:text-emerald-500" />
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