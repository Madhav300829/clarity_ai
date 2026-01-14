

import React, { FC, useState, useRef, useEffect, KeyboardEvent } from 'react';
import { FreelancerProfile, ChatMessage, ChatRole } from '../../types';
import { PaperAirplaneIcon, XMarkIcon } from '../icons/Icons';
import { useTranslation } from '../../context/LanguageContext';

interface ChatWidgetProps {
    isOpen: boolean;
    onClose: () => void;
    freelancer: FreelancerProfile | null;
    messages: ChatMessage[];
    onSendMessage: (text: string) => void;
    isSending: boolean;
}

export const ChatWidget: FC<ChatWidgetProps> = ({ isOpen, onClose, freelancer, messages, onSendMessage, isSending }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isSending]);

    if (!freelancer) {
        return (
             <div className={`fixed bottom-6 right-6 z-50 w-full max-w-sm transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}></div>
        );
    }
    
    const handleSend = () => {
        if (input.trim() && !isSending) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={`fixed bottom-6 right-6 z-50 bg-primary dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-sm flex flex-col transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`} style={{height: '500px'}}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <img src={freelancer.avatarUrl} alt={freelancer.name} className="w-10 h-10 rounded-full" />
                    <div>
                        <h3 className="font-bold text-dark dark:text-secondary">{freelancer.name}</h3>
                        <p className="text-xs text-green-500">{t('chatWidget.online')}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <XMarkIcon />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.role === ChatRole.USER ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === ChatRole.MODEL && <img src={freelancer.avatarUrl} className="w-6 h-6 rounded-full" />}
                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === ChatRole.USER ? 'bg-accent text-white rounded-br-none' : 'bg-secondary dark:bg-slate-700 text-dark dark:text-secondary rounded-bl-none'}`}>
                            <p className="text-sm break-words">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isSending && (
                    <div className="flex items-end gap-2 justify-start">
                        <img src={freelancer.avatarUrl} className="w-6 h-6 rounded-full" />
                        <div className="max-w-[80%] p-3 rounded-lg bg-secondary dark:bg-slate-700 text-dark dark:text-secondary rounded-bl-none">
                           <div className="flex items-center gap-2">
                               <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                               <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                               <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></span>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                <div className="relative">
                    <input 
                        type="text"
                        placeholder={t('chatWidget.inputPlaceholder')}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={isSending}
                        className="w-full p-3 pr-12 bg-secondary dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full focus:ring-2 focus:ring-accent focus:outline-none transition text-dark dark:text-secondary"
                    />
                    <button onClick={handleSend} disabled={isSending || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent text-white rounded-full disabled:bg-slate-400 hover:bg-green-600 transition">
                        <PaperAirplaneIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};