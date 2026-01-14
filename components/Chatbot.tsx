

import React, { useState, useEffect, useRef, FC, FormEvent } from 'react';
import { Chat as GenAIChat } from '@google/genai';
import { startChat } from '../services/geminiService';
import { ChatMessage, ChatRole } from '../types';
import { Button } from './ui/Button';
import { PaperAirplaneIcon, SparklesIcon, UserIcon } from './icons/Icons';
import { logActivity, ActivityType } from '../services/logService';
import { useTranslation } from '../context/LanguageContext';

// A simple component to render basic Markdown for AI responses
const SimpleMarkdown: FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\n)/).map((part, index) => {
        if (part === '\n') return <br key={index} />;

        let processedPart = part;
        // Bold: **text** -> <strong>text</strong>
        processedPart = processedPart.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // List items: - item
        if (processedPart.trim().startsWith('- ')) {
            return (
                <div key={index} className="flex items-start">
                    <span className="mr-2 mt-1 text-accent">•</span>
                    <span dangerouslySetInnerHTML={{ __html: processedPart.trim().substring(2) }} />
                </div>
            );
        }
        // Headings: ## Heading
        if (processedPart.startsWith('## ')) {
            return <h2 key={index} className="text-xl font-bold mt-4 mb-2" dangerouslySetInnerHTML={{ __html: processedPart.substring(3) }}></h2>;
        }
        if (processedPart.startsWith('# ')) {
             return <h1 key={index} className="text-2xl font-bold mt-6 mb-3" dangerouslySetInnerHTML={{ __html: processedPart.substring(2) }}></h1>;
        }

        return <span key={index} dangerouslySetInnerHTML={{ __html: processedPart }} />;
    });

    return <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1">{parts}</div>;
};

const ChatBubble: FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === ChatRole.USER;
    return (
        <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''} animate-fade-in`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-accent text-white order-2' : 'bg-secondary dark:bg-slate-700 text-dark dark:text-secondary'}`}>
                {isUser ? <UserIcon /> : <SparklesIcon />}
            </div>
            <div className={`p-4 rounded-xl max-w-2xl shadow-md ${isUser ? 'bg-accent text-white order-1' : 'bg-primary dark:bg-slate-800'}`}>
                {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                ) : (
                    <SimpleMarkdown text={message.text} />
                )}
            </div>
        </div>
    );
};

export const Chatbot: FC = () => {
    const [chat, setChat] = useState<GenAIChat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const hasInitiatedChat = useRef(false);
    const { t } = useTranslation();

    useEffect(() => {
        const chatInstance = startChat();
        setChat(chatInstance);
        const loadHistory = async () => {
            setIsLoading(true);
            const history = await chatInstance.getHistory();
            const formattedHistory: ChatMessage[] = history.map(item => ({
                role: item.role === 'user' ? ChatRole.USER : ChatRole.MODEL,
                text: item.parts.map(part => ('text' in part ? (part as {text: string}).text : '')).join('')
            }));
            
            if (formattedHistory.length === 0) {
                setMessages([
                    {
                        role: ChatRole.MODEL,
                        text: t('chatbot.welcomeMessage')
                    }
                ]);
            } else {
                setMessages(formattedHistory);
            }
            hasInitiatedChat.current = formattedHistory.length > 0;
            setIsLoading(false);
        };
        loadHistory();
    }, [t]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);
    
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [input]);

    const sendMessage = async (messageText: string) => {
        if (!messageText.trim() || !chat || isLoading) return;
        
        logActivity(ActivityType.CHAT_MESSAGE, {
            message: messageText,
            length: messageText.length,
        });
        
        hasInitiatedChat.current = true;

        const userMessage: ChatMessage = { role: ChatRole.USER, text: messageText };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = messageText;
        setInput('');
        setIsLoading(true);

        try {
            const stream = await chat.sendMessageStream({ message: currentInput });
            
            let modelResponse = '';
            setMessages(prev => [...prev, { role: ChatRole.MODEL, text: '' }]);

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === ChatRole.MODEL && lastMessage.text === '') {
                    lastMessage.text = t('chatbot.errorMessage');
                } else {
                     newMessages.push({ role: ChatRole.MODEL, text: t('chatbot.errorMessage') })
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const examplePrompts = [
        t('chatbot.prompt1'),
        t('chatbot.prompt2'),
        t('chatbot.prompt3'),
    ];

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto py-4">
            <div className="flex-1 overflow-y-auto pr-4 space-y-6 pb-4">
                {messages.length <= 1 && !hasInitiatedChat.current && !isLoading && (
                    <div className="text-center pt-8 md:pt-16 text-slate-400 animate-fade-in">
                        <h2 className="text-3xl font-bold mt-4 text-dark dark:text-secondary">{t('chatbot.title')}</h2>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                            {examplePrompts.map(prompt => (
                                <button
                                    key={prompt}
                                    onClick={() => sendMessage(prompt)}
                                    className="p-4 bg-primary dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-accent dark:hover:border-accent transition"
                                >
                                    <p className="font-semibold text-dark dark:text-secondary">{prompt}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <ChatBubble key={index} message={msg} />
                ))}
                {isLoading && messages[messages.length - 1]?.role === ChatRole.USER && (
                     <div className="flex items-start gap-4 animate-fade-in">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-secondary dark:bg-slate-700 text-dark dark:text-secondary">
                            <SparklesIcon />
                        </div>
                        <div className="p-4 rounded-xl max-w-lg bg-primary dark:bg-slate-800">
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
            <div className="pt-4">
                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder={t('chatbot.inputPlaceholder')}
                        disabled={isLoading}
                        className="w-full py-3 pl-6 pr-16 bg-primary dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-accent focus:outline-none transition text-dark dark:text-secondary shadow-lg resize-none max-h-48 overflow-y-auto"
                        rows={1}
                        aria-label={t('chatbot.aria.chatInput')}
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 bottom-2 !p-2.5 !rounded-full"
                        aria-label={t('chatbot.aria.sendMessage')}
                    >
                        <PaperAirplaneIcon />
                    </Button>
                </form>
            </div>
        </div>
    );
};