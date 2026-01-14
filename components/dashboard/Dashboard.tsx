

import React, { FC, useState, useEffect } from 'react';
import { FreelancerProfile, QAItem, Task, Currency } from '../../types';
import { View } from '../../App';
import { Button } from '../ui/Button';
import { QuestionMarkCircleIcon, UserIcon, ClipboardDocumentListIcon, BoltIcon, CoinIcon, CalendarDaysIcon, WalletIcon, PlusCircleIcon, ArrowDownTrayIcon, ChevronDownIcon } from '../icons/Icons';
import { useTranslation } from '../../context/LanguageContext';

const CREDITS_KEY = 'clarity-ai-user-credits';
const WALLET_CURRENCY_KEY = 'clarity-ai-wallet-currency';


// Mock data snippets - in a real app, this would come from a data store or API
const freelancers: FreelancerProfile[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    title: 'Senior React & TypeScript Developer',
    skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'Node.js'],
    rate: 95,
    avatarUrl: 'https://i.pravatar.cc/150?u=alice',
    email: 'alice.johnson@example.com',
    domain: 'Web Development',
    experience: 7,
    rating: 4.8,
  },
  {
    id: 4,
    name: 'Diana Miller',
    title: 'AI & Machine Learning Specialist',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Gemini API', 'Data Science'],
    rate: 125,
    avatarUrl: 'https://i.pravatar.cc/150?u=diana',
    email: 'diana.miller@example.com',
    domain: 'AI/ML',
    experience: 6,
    rating: 5.0,
  },
];

const initialQuestions: Pick<QAItem, 'id' | 'question'>[] = [
  { id: 1, question: "What are the best practices for state management in large React applications?" },
  { id: 2, question: "How does the Gemini API's function calling work?" },
];

// Helper function to generate dates for mock data
const getDateString = (daysOffset: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const mockTasks: Task[] = [
    { id: 1, title: 'Draft Q3 marketing strategy', priority: 'High', status: 'In Progress', deadline: getDateString(2) },
    { id: 2, title: 'Develop new search result component', priority: 'High', status: 'To Do', deadline: getDateString(0) },
    { id: 3, title: 'Review freelancer applications', priority: 'Medium', status: 'To Do', deadline: getDateString(7) },
    { id: 4, title: 'Update Help Center documentation', priority: 'Low', status: 'Done' },
    { id: 5, title: 'Prepare for weekly sync meeting', priority: 'Medium', status: 'In Progress', deadline: getDateString(-1) },
    { id: 6, title: 'Onboard new design intern', priority: 'Medium', status: 'To Do', deadline: getDateString(14) },
];

const FreelancerCard: FC<{ freelancer: FreelancerProfile }> = ({ freelancer }) => {
    const { t } = useTranslation();
    return (
    <div className="bg-primary dark:bg-slate-800 rounded-xl p-6 flex flex-col items-center text-center shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-500">
        <img src={freelancer.avatarUrl} alt={freelancer.name} className="w-20 h-20 rounded-full mb-4 border-4 border-slate-200 dark:border-slate-600" />
        <h3 className="text-lg font-bold text-dark dark:text-secondary">{freelancer.name}</h3>
        <p className="text-accent font-medium mb-3 text-sm">{freelancer.title}</p>
        <div className="mt-auto flex items-center justify-between w-full pt-3 border-t border-slate-200 dark:border-slate-700">
             <span className="text-xl font-bold text-dark dark:text-secondary">${freelancer.rate}<span className="text-sm font-normal text-light dark:text-slate-400">/{t('common.hourAbr')}</span></span>
             <a href={`mailto:${freelancer.email}`} className="bg-accent text-white font-bold py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm">{t('common.contact')}</a>
        </div>
    </div>
)};

const QAItemCard: FC<{ item: Pick<QAItem, 'id' | 'question'>, navigate: (view: View) => void }> = ({ item, navigate }) => (
    <button onClick={() => navigate('knowledge')} className="w-full text-left p-4 bg-secondary dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors border border-slate-200 dark:border-slate-700">
        <p className="font-semibold text-dark dark:text-slate-300">{item.question}</p>
    </button>
);

const TaskItem: FC<{ task: Task }> = ({ task }) => {
    const { t, language } = useTranslation();
    const priorityStyles = {
        High: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
        Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
        Low: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
    };
    
    const statusStyles = {
        'To Do': 'text-dark dark:text-slate-300',
        'In Progress': 'text-dark dark:text-slate-300',
        'Done': 'text-slate-400 dark:text-slate-500 line-through'
    };
    
    const getDeadlineInfo = () => {
        if (!task.deadline || task.status === 'Done') {
            return null;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const deadlineDate = new Date(task.deadline + 'T00:00:00');
        
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const formattedDate = new Intl.DateTimeFormat(language, { month: 'short', day: 'numeric' }).format(deadlineDate);

        if (diffDays < 0) {
            return { text: t('dashboard.myTasks.overdue'), className: 'text-rose-500 dark:text-rose-400' };
        }
        if (diffDays === 0) {
            return { text: t('dashboard.myTasks.dueToday'), className: 'text-rose-500 dark:text-rose-400' };
        }
        if (diffDays <= 7) {
            return { text: t('dashboard.myTasks.due', { date: formattedDate }), className: 'text-amber-600 dark:text-amber-400' };
        }
        return { text: t('dashboard.myTasks.due', { date: formattedDate }), className: 'text-light dark:text-slate-400' };
    };

    const deadlineInfo = getDeadlineInfo();

    return (
        <div className="flex items-start justify-between gap-4 p-3 bg-secondary dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex-grow">
                <p className={`font-medium ${statusStyles[task.status]}`}>
                    {task.title}
                </p>
                {deadlineInfo && (
                    <div className={`flex items-center gap-1.5 mt-1 text-sm font-medium ${deadlineInfo.className}`}>
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>{deadlineInfo.text}</span>
                    </div>
                )}
            </div>
            <div className="flex flex-col items-end flex-shrink-0 text-right">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${priorityStyles[task.priority]}`}>
                    {task.priority}
                </span>
                 <p className="text-sm text-light dark:text-slate-500 mt-1">{task.status}</p>
            </div>
        </div>
    );
};

const DashboardCard: FC<{ title: string, icon?: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-primary dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4 text-slate-700 dark:text-slate-200">
            {icon}
            <h2 className="text-xl font-bold">{title}</h2>
        </div>
        {children}
    </div>
);

const WalletCard: FC = () => {
    const { t, language } = useTranslation();
    const [credits, setCredits] = useState(0);
    const [funds] = useState(1250.75); // Mock funds
    const [currency, setCurrency] = useState<Currency>(() => {
        try {
            const savedCurrency = localStorage.getItem(WALLET_CURRENCY_KEY) as Currency;
            return savedCurrency || 'USD';
        } catch (e) {
            return 'USD';
        }
    });

    // Credits logic
    const GOAL = 100;
    const progress = (credits % GOAL) / GOAL;
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - progress * circumference;

    const updateCredits = () => {
        try {
            const storedCredits = localStorage.getItem(CREDITS_KEY);
            setCredits(storedCredits ? parseInt(storedCredits, 10) : 0);
        } catch (e) {
            console.error("Failed to read credits", e);
            setCredits(0);
        }
    };

    useEffect(() => {
        updateCredits();
        window.addEventListener('storage', updateCredits);
        return () => {
            window.removeEventListener('storage', updateCredits);
        };
    }, []);

    // Currency formatting
    const formattedFunds = new Intl.NumberFormat(language, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(funds);

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCurrency = e.target.value as Currency;
        setCurrency(newCurrency);
        try {
            localStorage.setItem(WALLET_CURRENCY_KEY, newCurrency);
        } catch (e) {
            console.error("Failed to save currency", e);
        }
    };

    const currencies: { code: Currency, nameKey: string }[] = [
        { code: 'USD', nameKey: 'currency.USD' },
        { code: 'EUR', nameKey: 'currency.EUR' },
        { code: 'GBP', nameKey: 'currency.GBP' },
        { code: 'JPY', nameKey: 'currency.JPY' },
    ];
    
    return (
        <DashboardCard title={t('dashboard.myWallet.title')} icon={<WalletIcon className="w-6 h-6 text-accent" />}>
            <div className="space-y-6">
                {/* Credits Section */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{t('dashboard.myWallet.credits')}</h3>
                    <div className="flex flex-col items-center text-center">
                         <div className="relative group w-32 h-32 flex items-center justify-center">
                            <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                                <circle className="text-slate-200 dark:text-slate-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                                <circle className="text-amber-400" strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease-out' }} />
                            </svg>
                            <div className="flex flex-col items-center">
                                <CoinIcon className="w-8 h-8 text-amber-400" />
                                <span className="text-3xl font-bold text-dark dark:text-secondary -mt-1">{credits}</span>
                            </div>
                            <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 text-xs text-white bg-slate-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                {t('dashboard.myCredits.tooltip')}
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{t('dashboard.myCredits.description')}</p>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700"></div>

                {/* Funds Section */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('dashboard.myWallet.funds')}</h3>
                    <p className="text-xs text-slate-400 mb-4">{t('dashboard.myWallet.balance')}</p>
                    <div className="flex items-end justify-between gap-4 mb-4">
                        <span className="text-4xl font-bold text-dark dark:text-secondary">{formattedFunds}</span>
                        <div className="relative">
                            <select
                                value={currency}
                                onChange={handleCurrencyChange}
                                className="appearance-none bg-secondary dark:bg-slate-700 text-dark dark:text-secondary font-semibold text-sm rounded-md py-1.5 pl-3 pr-8 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-accent focus:outline-none"
                            >
                                {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                <ChevronDownIcon className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="secondary" className="w-full !py-2 !text-sm">
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            {t('dashboard.myWallet.addFunds')}
                        </Button>
                        <Button variant="secondary" className="w-full !py-2 !text-sm">
                            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                            {t('dashboard.myWallet.withdraw')}
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
};


interface DashboardProps {
    navigate: (view: View) => void;
}

export const Dashboard: FC<DashboardProps> = ({ navigate }) => {
    const { t } = useTranslation();
    return (
        <div className="py-8 animate-fade-in mb-16 md:mb-0">
             <div className="animate-slide-up">
                <h1 className="text-4xl md:text-5xl font-extrabold text-dark dark:text-primary font-display [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{t('dashboard.title')}</h1>
                <p className="mt-2 text-lg text-light dark:text-slate-400 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{t('dashboard.subtitle')}</p>
            </div>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <DashboardCard title={t('dashboard.quickActions.title')} icon={<BoltIcon className="w-6 h-6 text-accent"/>}>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button onClick={() => navigate('search')} variant="secondary" className="w-full sm:w-auto">{t('dashboard.quickActions.startSearch')}</Button>
                            <Button onClick={() => navigate('hire')} variant="secondary" className="w-full sm:w-auto">{t('dashboard.quickActions.hireExpert')}</Button>
                        </div>
                    </DashboardCard>
                     <DashboardCard title={t('dashboard.myTasks.title')} icon={<ClipboardDocumentListIcon className="w-6 h-6 text-accent"/>}>
                        <div className="space-y-3">
                            {mockTasks.map(task => <TaskItem key={task.id} task={task} />)}
                        </div>
                    </DashboardCard>
                    <DashboardCard title={t('dashboard.recentKnowledge.title')} icon={<QuestionMarkCircleIcon />}>
                        <div className="space-y-3">
                            {initialQuestions.map(q => <QAItemCard key={q.id} item={q} navigate={navigate} />)}
                        </div>
                    </DashboardCard>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <WalletCard />
                    <DashboardCard title={t('dashboard.featuredExperts.title')} icon={<UserIcon />}>
                        <div className="space-y-4">
                            {freelancers.map(f => <FreelancerCard key={f.id} freelancer={f} />)}
                        </div>
                    </DashboardCard>
                </div>
            </div>
        </div>
    );
};
