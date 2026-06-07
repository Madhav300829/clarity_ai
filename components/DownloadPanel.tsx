import React, { FC, useState } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from './icons/Icons';
import { Button } from './ui/Button';
import { useTranslation } from '../context/LanguageContext';
import { ShieldCheck, FileText, Table, BookOpen, Bot, Archive, Check } from 'lucide-react';

interface DownloadPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DownloadPanel: FC<DownloadPanelProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [downloadedId, setDownloadedId] = useState<number | null>(null);

    const handleDownload = (id: number, label: string, action: () => void) => {
        setDownloadingId(id);
        setDownloadedId(null);
        
        setTimeout(() => {
            try {
                action();
                setDownloadingId(null);
                setDownloadedId(id);
                
                // Clear success state after 2 seconds
                setTimeout(() => {
                    setDownloadedId(null);
                }, 2000);
            } catch (err) {
                console.error("Export failure: ", err);
                setDownloadingId(null);
            }
        }, 800);
    };

    const exportOptions = [
        {
            id: 1,
            title: "Wallet Transactions Ledger",
            desc: "Full details of secure escrow deposits, withdrawals, and platform balances.",
            format: "CSV File",
            icon: <Table className="w-5 h-5 text-emerald-500" />,
            action: () => {
                const transactionsStr = localStorage.getItem('clarity_wallet_transactions');
                const transactions = transactionsStr ? JSON.parse(transactionsStr) : [
                    { id: 'tx_101', type: 'deposit', amount: 150.00, currency: 'USD', date: '2026-05-28 14:32', label: 'Secure UPI Escrow Deposit', status: 'completed' },
                    { id: 'tx_103', type: 'escrow_hold', amount: 100.00, currency: 'USD', date: '2026-05-26 18:45', label: 'Hired Expert Active Milestone Vault Lock', status: 'completed' }
                ];
                const csvHeader = "ID,Type,Amount,Currency,Date,Label,Status\n";
                const csvRows = transactions.map((tx: any) => `${tx.id},${tx.type},${tx.amount},${tx.currency},"${tx.date}","${tx.label}",${tx.status}`).join("\n");
                const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `clarity_wallet_ledger_${Date.now()}.csv`;
                link.click();
                URL.revokeObjectURL(url);
            }
        },
        {
            id: 2,
            title: "Expert Freelancer Directory",
            desc: "Active list of verified talent candidates, domains, rates, stars, and key skills.",
            format: "CSV Spreadsheet",
            icon: <FileText className="w-5 h-5 text-indigo-500" />,
            action: () => {
                const freelancers = [
                  { id: 1, name: 'Alice Johnson', title: 'Senior React Developer', rate: 95, domain: 'Web Dev', rating: 4.8 },
                  { id: 2, name: 'Bob Williams', title: 'UI/UX Designer', rate: 80, domain: 'Design', rating: 4.9 },
                  { id: 3, name: 'Charlie Brown', title: 'Cloud & DevOps Engineer', rate: 110, domain: 'Infrastructure', rating: 4.7 },
                  { id: 4, name: 'Diana Miller', title: 'AI Specialist', rate: 125, domain: 'AI/ML', rating: 5.0 },
                  { id: 5, name: 'Ethan Davis', title: 'Mobile App Developer', rate: 100, domain: 'Mobile Dev', rating: 4.6 },
                  { id: 6, name: 'Fiona Garcia', title: 'Project Manager', rate: 85, domain: 'Project Mgmt', rating: 4.9 }
                ];
                const csvHeader = "ID,Name,Title,RatePerHour,Domain,Rating\n";
                const csvRows = freelancers.map(f => `${f.id},"${f.name}","${f.title}",${f.rate},"${f.domain}",${f.rating}`).join("\n");
                const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `clarity_experts_directory_${Date.now()}.csv`;
                link.click();
                URL.revokeObjectURL(url);
            }
        },
        {
            id: 3,
            title: "Knowledge Hub discussions",
            desc: "Curated questions list, synthesized AI answers, and active peer clarifications.",
            format: "JSON Data",
            icon: <BookOpen className="w-5 h-5 text-sky-500" />,
            action: () => {
                const myQuestions = localStorage.getItem('clarity-ai-my-questions');
                const qaList = myQuestions ? JSON.parse(myQuestions) : [];
                const blob = new Blob([JSON.stringify(qaList, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `clarity_knowledge_exports_${Date.now()}.json`;
                link.click();
                URL.revokeObjectURL(url);
            }
        },
        {
            id: 4,
            title: "AI Chatbot transcripts",
            desc: "Full records of conversational summaries and intelligent agent chats.",
            format: "TXT / Log Document",
            icon: <Bot className="w-5 h-5 text-emerald-500" />,
            action: () => {
                const logs = localStorage.getItem('clarity_activities_log') || "[]";
                const chatTx = JSON.parse(logs)
                    .filter((act: any) => act.type === 'chat_message')
                    .map((act: any) => `[${act.timestamp}] MESSAGE: ${act.details.message}`)
                    .join("\n\n");
                const blob = new Blob([chatTx || "Welcome conversation initiated."], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `clarity_assistant_chat_${Date.now()}.txt`;
                link.click();
                URL.revokeObjectURL(url);
            }
        },
        {
            id: 5,
            title: "Full Secure Backup State",
            desc: "Consolidates workspace setup, localized settings, credentials, and app preferences.",
            format: "JSON Backup",
            icon: <Archive className="w-5 h-5 text-amber-500" />,
            action: () => {
                const backup: any = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key) {
                        backup[key] = localStorage.getItem(key);
                    }
                }
                const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `clarity_full_system_backup_${Date.now()}.json`;
                link.click();
                URL.revokeObjectURL(url);
            }
        }
    ];

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs transition-opacity"
                    onClick={onClose}
                    aria-hidden="true"
                ></div>
            )}
            <div className={`fixed top-20 right-4 md:right-16 z-50 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-250/80 dark:border-slate-800 w-[380px] transform transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}`}>
                {/* Header title */}
                <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-850 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-t-3xl">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-500/10 text-emerald-550 rounded-lg">
                            <ArrowDownTrayIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">Clarity Export Hub</h3>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                Secured client file generation active
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white p-1 rounded-full transition-colors bg-slate-100/50 dark:bg-slate-800/50"
                    >
                        <XMarkIcon />
                    </button>
                </div>

                {/* Body lists */}
                <div className="p-4 max-h-[460px] overflow-y-auto space-y-3">
                    <p className="text-xs text-slate-500 leading-normal">
                        Generate and download files with your customized configurations, saved templates, activity transcripts, and secure balance sheets.
                    </p>

                    <div className="space-y-2.5 pt-1">
                        {exportOptions.map((opt) => (
                            <div key={opt.id} className="p-3 bg-slate-50/50 dark:bg-slate-850/50 rounded-2xl border border-slate-200/40 dark:border-slate-800 hover:border-emerald-500/10 dark:hover:border-emerald-500/20 transition-all flex items-start gap-3">
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xs flex-shrink-0">
                                    {opt.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 truncate">{opt.title}</h4>
                                        <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                            {opt.format}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-normal mt-0.5">{opt.desc}</p>
                                    
                                    <button
                                        onClick={() => handleDownload(opt.id, opt.title, opt.action)}
                                        disabled={downloadingId !== null}
                                        className={`mt-2.5 w-full py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                                            downloadedId === opt.id 
                                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                                                : downloadingId === opt.id 
                                                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                                    : 'bg-white dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs'
                                        }`}
                                    >
                                        {downloadedId === opt.id ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                Ready & Saved!
                                            </>
                                        ) : downloadingId === opt.id ? (
                                            <>
                                                <span className="w-2.5 h-2.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                                                Compiling...
                                            </>
                                        ) : (
                                            <>
                                                <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                                                Download {opt.title.split(' ')[0]}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer status bar */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-b-3xl text-[10px] text-slate-400 text-center border-t border-slate-100 dark:border-slate-800/85 font-mono">
                    🛡️ Secure, client-side, dynamic export compilation
                </div>
            </div>
        </>
    );
};
