

import React, { FC } from 'react';
import { XMarkIcon, ChatBubbleLeftRightIcon, SparklesIcon, BriefcaseIcon } from './icons/Icons';
import { Button } from './ui/Button';
import { useTranslation } from '../context/LanguageContext';

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const getMockNotifications = (t: (key: string, options?: { [key: string]: string | number }) => string) => [
    {
        id: 1,
        icon: <ChatBubbleLeftRightIcon className="w-5 h-5 text-sky-500" />,
        text: t('notifications.mock.newAnswer'),
        time: t('notifications.time.minutes', { count: 5 }),
        read: false,
    },
    {
        id: 2,
        icon: <SparklesIcon />,
        text: t('notifications.mock.aiAnswerReady'),
        time: t('notifications.time.hours', { count: 2 }),
        read: false,
    },
    {
        id: 3,
        icon: <BriefcaseIcon />,
        text: t('notifications.mock.newMessage'),
        time: t('notifications.time.days', { count: 1 }),
        read: true,
    },
    {
        id: 4,
        icon: <SparklesIcon />,
        text: t('notifications.mock.welcome'),
        time: t('notifications.time.days', { count: 3 }),
        read: true,
    }
];

export const NotificationsPanel: FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const mockNotifications = getMockNotifications(t);

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black bg-opacity-30"
                    onClick={onClose}
                    aria-hidden="true"
                ></div>
            )}
            <div className={`fixed top-20 right-6 z-50 bg-primary dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 w-80 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <div className="flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-dark dark:text-secondary text-base">{t('notifications.title')}</h3>
                    <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-dark dark:hover:text-secondary p-1 rounded-full"><XMarkIcon /></button>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                    {mockNotifications.map(notif => (
                        <div key={notif.id} className="p-3 flex items-start gap-3 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            {!notif.read && <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0"></div>}
                            <div className={`flex-shrink-0 ${notif.read ? 'ml-4' : ''}`}>
                                {notif.icon}
                            </div>
                            <div>
                                <p className="text-sm text-dark dark:text-slate-300 leading-snug">{notif.text}</p>
                                <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                    <Button variant="ghost" className="w-full !py-1.5 text-sm">{t('notifications.markAllAsRead')}</Button>
                </div>
            </div>
        </>
    );
};