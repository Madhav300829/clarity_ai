

import React, { useState, FC, ChangeEvent, useEffect } from 'react';
import { generateAnswer } from '../services/geminiService';
import { QAItem, CommunityAnswer } from '../types';
import { SearchIcon, ChatBubbleLeftRightIcon, PhotoIcon, SpinnerIcon, UserIcon, QuestionMarkCircleIcon, HandThumbUpIcon } from './icons/Icons';
import { AskQuestionModal } from './AskQuestionModal';
import { ImageEditorModal } from './ImageEditorModal';
import { Button } from './ui/Button';
import { logActivity, ActivityType } from '../services/logService';
import { getUserId } from '../services/logService';
import { useTranslation } from '../context/LanguageContext';

// Local storage keys
const MY_QUESTIONS_KEY = 'clarity-ai-my-questions';
const LIKED_ANSWERS_KEY = 'clarity-ai-liked-answers';
const CREDITS_KEY = 'clarity-ai-user-credits';


// Initial data for demonstration
const getInitialQuestions = (t: (key: string) => string) => [
  { id: 1, question: t('knowledge.initialQuestions.q1') },
  { id: 2, question: t('knowledge.initialQuestions.q2') },
  { id: 3, question: t('knowledge.initialQuestions.q3') },
  { id: 4, question: t('knowledge.initialQuestions.q4') },
  { id: 5, question: t('knowledge.initialQuestions.q5') },
];


const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const KnowledgeHub: FC = () => {
  const { t } = useTranslation();
  const [qaItems, setQaItems] = useState<QAItem[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'community' | 'mine'>('community');
  
  // State for the answer form
  const [newAnswerText, setNewAnswerText] = useState('');
  const [newAnswerImage, setNewAnswerImage] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [likedAnswers, setLikedAnswers] = useState<Set<number>>(new Set());

  useEffect(() => {
    const initialQuestions = getInitialQuestions(t).map(q => ({ 
        ...q, 
        answer: '', 
        isLoading: false, 
        communityAnswers: [],
        userId: 'community_member' 
    }));
    
    let allQuestions: QAItem[] = [...initialQuestions];
    try {
      const storedQuestions = localStorage.getItem(MY_QUESTIONS_KEY);
      if (storedQuestions) {
        const myQuestions: QAItem[] = JSON.parse(storedQuestions);
        const existingIds = new Set(allQuestions.map(item => item.id));
        const newQuestions = myQuestions.filter(q => !existingIds.has(q.id));
        allQuestions = [...newQuestions, ...allQuestions];
      }
    } catch (e) {
      console.error("Failed to load questions from localStorage", e);
      localStorage.removeItem(MY_QUESTIONS_KEY);
    }
    setQaItems(allQuestions);

     try {
      const storedLikes = localStorage.getItem(LIKED_ANSWERS_KEY);
      if (storedLikes) {
        setLikedAnswers(new Set(JSON.parse(storedLikes)));
      }
    } catch (e) {
      console.error("Failed to load liked answers from localStorage", e);
      localStorage.removeItem(LIKED_ANSWERS_KEY);
    }
  }, [t]);
  
  const handleToggleQuestion = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);
    const item = qaItems.find(q => q.id === id);

    if (item) {
        logActivity(ActivityType.KNOWLEDGE_HUB_QUESTION_VIEWED, {
            questionId: item.id,
            questionTitle: item.question,
        });
    }

    if (item && !item.answer && !item.isLoading) {
      setQaItems(prev => prev.map(q => q.id === id ? { ...q, isLoading: true } : q));
      const answer = await generateAnswer(item.question);
      setQaItems(prev => prev.map(q => q.id === id ? { ...q, answer, isLoading: false } : q));
    }
    // Reset answer form when switching questions
    setNewAnswerText('');
    setNewAnswerImage(null);
  };

  const handlePostQuestion = (data: { title: string; description: string; imageUrl?: string }) => {
    const userId = getUserId();
    const newQuestion: QAItem = {
      id: Date.now(),
      question: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      answer: '', // AI will generate on first open
      isLoading: false,
      communityAnswers: [],
      userId: userId,
    };
    
    logActivity(ActivityType.KNOWLEDGE_HUB_QUESTION_ASKED, {
        questionId: newQuestion.id,
        questionTitle: newQuestion.question,
        hasDescription: !!data.description,
        hasImage: !!data.imageUrl,
    });

    setQaItems(prev => [newQuestion, ...prev]);
    
    try {
        const storedQuestions = localStorage.getItem(MY_QUESTIONS_KEY);
        const myQuestions = storedQuestions ? JSON.parse(storedQuestions) : [];
        myQuestions.push(newQuestion);
        localStorage.setItem(MY_QUESTIONS_KEY, JSON.stringify(myQuestions));
    } catch (e) {
        console.error("Failed to save question to localStorage", e);
    }
  };
  
  const handleAnswerSubmit = (questionId: number) => {
      if(!newAnswerText.trim()) return;
      
      const newAnswer: CommunityAnswer = {
          id: Date.now(),
          text: newAnswerText,
          imageUrl: newAnswerImage || undefined,
          likes: 0,
          userId: getUserId(),
      };
      
      const question = qaItems.find(q => q.id === questionId);
      logActivity(ActivityType.KNOWLEDGE_HUB_ANSWER_SUBMITTED, {
          questionId: questionId,
          questionTitle: question?.question,
          answerLength: newAnswerText.length,
          hasImage: !!newAnswerImage,
      });

      setQaItems(prev => prev.map(q => {
          if (q.id === questionId) {
              return { ...q, communityAnswers: [...q.communityAnswers, newAnswer] };
          }
          return q;
      }));

      // Reset form
      setNewAnswerText('');
      setNewAnswerImage(null);
  };

  const handleAnswerFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const base64 = await fileToBase64(file);
          setNewAnswerImage(base64);
      }
  };

  const handleLikeAnswer = (questionId: number, answerId: number) => {
    const answer = qaItems.flatMap(q => q.communityAnswers).find(a => a.id === answerId);
    if (!answer || answer.userId === getUserId()) return;

    const isLiked = likedAnswers.has(answerId);
    const newLikedAnswers = new Set(likedAnswers);

    setQaItems(prevItems => prevItems.map(q => {
        if (q.id === questionId) {
            return {
                ...q,
                communityAnswers: q.communityAnswers.map(ans => 
                    ans.id === answerId ? { ...ans, likes: isLiked ? ans.likes - 1 : ans.likes + 1 } : ans
                )
            };
        }
        return q;
    }));
    
    if (isLiked) {
        newLikedAnswers.delete(answerId);
    } else {
        newLikedAnswers.add(answerId);
    }
    setLikedAnswers(newLikedAnswers);
    localStorage.setItem(LIKED_ANSWERS_KEY, JSON.stringify(Array.from(newLikedAnswers)));
    
    // Simulation: User earns credits for engaging with the community by liking others' answers.
    try {
        const currentCredits = parseInt(localStorage.getItem(CREDITS_KEY) || '0', 10);
        const newCredits = isLiked ? Math.max(0, currentCredits - 1) : currentCredits + 1;
        localStorage.setItem(CREDITS_KEY, String(newCredits));
        window.dispatchEvent(new Event('storage'));
    } catch (e) {
        console.error("Failed to update credits", e);
    }
    
    logActivity(ActivityType.KNOWLEDGE_HUB_ANSWER_LIKED, { questionId, answerId, liked: !isLiked });
  };


  const allQuestions = qaItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const myQuestions = allQuestions.filter(item => item.userId === getUserId());

  const displayedQuestions = activeTab === 'community' ? allQuestions : myQuestions;

  return (
    <>
      <div className="py-8 animate-fade-in mb-16 md:mb-0">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-slide-up">
              <h1 className="text-4xl md:text-5xl font-extrabold text-dark dark:text-primary font-display [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{t('knowledge.title')}</h1>
              <p className="mt-2 text-lg text-light dark:text-slate-400 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{t('knowledge.subtitle')}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
              <div className="relative flex-grow">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <SearchIcon />
                  </div>
                  <input
                      type="text"
                      placeholder={t('knowledge.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-3 pl-12 pr-4 bg-primary dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-full focus:ring-2 focus:ring-accent focus:outline-none transition text-dark dark:text-secondary shadow-md"
                      aria-label={t('knowledge.aria.filter')}
                  />
              </div>
              <Button onClick={() => setIsAskModalOpen(true)} className="py-3 px-5">{t('knowledge.askNewQuestion')}</Button>
          </div>

            <div className="border-b border-slate-200 dark:border-slate-700 mb-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('community')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'community'
                                ? 'border-accent text-accent'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                    >
                        {t('knowledge.tabs.community')}
                    </button>
                    <button
                        onClick={() => setActiveTab('mine')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'mine'
                                ? 'border-accent text-accent'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                    >
                        {t('knowledge.tabs.myQuestions')}
                    </button>
                </nav>
            </div>

          <div className="space-y-4 animate-slide-up" style={{animationDelay: '100ms'}}>
            {displayedQuestions.length > 0 ? displayedQuestions.map(item => (
              <div key={item.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden transition-all duration-300 bg-primary dark:bg-slate-800 shadow-lg">
                <button
                  onClick={() => handleToggleQuestion(item.id)}
                  className="w-full p-5 text-left flex justify-between items-center hover:bg-secondary dark:hover:bg-slate-700/50 transition"
                >
                  <h2 className="text-lg font-semibold text-dark dark:text-secondary">{item.question}</h2>
                  <div className="flex items-center gap-4">
                      {item.communityAnswers.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                              <ChatBubbleLeftRightIcon className="w-5 h-5" />
                              <span>{item.communityAnswers.length}</span>
                          </div>
                      )}
                      <span className={`transform transition-transform duration-300 ${expandedId === item.id ? 'rotate-180 text-accent' : 'text-slate-400'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </span>
                  </div>
                </button>
                {expandedId === item.id && (
                  <div className="p-5 bg-secondary dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
                    {/* User Question Details */}
                    {item.description && <p className="mb-4 text-dark dark:text-slate-300 italic">{item.description}</p>}
                    {item.imageUrl && <img src={item.imageUrl} alt={t('knowledge.questionImageAlt')} className="mb-4 rounded-lg max-h-80" />}

                    {/* AI Answer */}
                    <h3 className="text-md font-bold text-accent mb-2">{t('knowledge.aiAnswer')}</h3>
                    {item.isLoading ? (
                      <div className="flex items-center gap-2 text-light dark:text-slate-400"><SpinnerIcon /> {t('knowledge.generatingAnswer')}</div>
                    ) : (
                      <p className="text-dark dark:text-slate-300 whitespace-pre-wrap leading-relaxed prose prose-p:text-dark dark:prose-p:text-slate-300 prose-strong:text-accent">{item.answer}</p>
                    )}

                    {/* Community Answers */}
                    <div className="mt-8">
                        <h3 className="text-md font-bold text-slate-600 dark:text-slate-300 mb-4">{t('knowledge.communityAnswers', { count: item.communityAnswers.length })}</h3>
                        <div className="space-y-4">
                            {item.communityAnswers.map(ans => (
                                <div key={ans.id} className="p-4 rounded-lg bg-primary dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500"><UserIcon /></div>
                                    <div className="w-full">
                                        <p className="text-dark dark:text-slate-300">{ans.text}</p>
                                        {ans.imageUrl && <img src={ans.imageUrl} alt={t('knowledge.answerImageAlt')} className="mt-2 rounded-md max-h-60" />}
                                        <div className="mt-2 flex items-center">
                                            <button
                                                onClick={() => handleLikeAnswer(item.id, ans.id)}
                                                disabled={ans.userId === getUserId()}
                                                className={`flex items-center gap-1.5 text-sm rounded-full px-2 py-1 transition-colors disabled:opacity-60 disabled:pointer-events-none ${likedAnswers.has(ans.id) ? 'text-accent bg-green-100 dark:bg-green-900/50' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                                aria-label={likedAnswers.has(ans.id) ? t('knowledge.aria.unlikeAnswer') : t('knowledge.aria.likeAnswer')}
                                            >
                                                <HandThumbUpIcon className="w-4 h-4" />
                                                <span>{ans.likes}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {item.communityAnswers.length === 0 && <p className="text-sm text-slate-500">{t('knowledge.noCommunityAnswers')}</p>}
                        </div>
                    </div>
                    
                    {/* Add Answer Form */}
                    <div className="mt-8 pt-6 border-t border-slate-300 dark:border-slate-600">
                        <h3 className="text-md font-bold text-slate-600 dark:text-slate-300 mb-3">{t('knowledge.addYourAnswer')}</h3>
                        <textarea value={newAnswerText} onChange={(e) => setNewAnswerText(e.target.value)} rows={4} className="w-full p-3 bg-primary dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition text-dark dark:text-secondary" placeholder={t('knowledge.shareKnowledgePlaceholder')} />
                        
                        {newAnswerImage ? (
                            <div className="relative group w-40 mt-2">
                                <img src={newAnswerImage} alt={t('knowledge.answerPreviewAlt')} className="rounded h-24 w-auto" />
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                    <Button variant="secondary" onClick={() => setIsEditorOpen(true)}>{t('common.edit')}</Button>
                                    <button onClick={() => setNewAnswerImage(null)} className="mt-1 text-xs text-rose-400 hover:underline">{t('common.remove')}</button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-2">
                                <label htmlFor="answer-file-upload" className="inline-flex items-center gap-2 cursor-pointer rounded-md font-semibold text-accent text-sm hover:text-green-600"><PhotoIcon className="w-5 h-5"/>{t('knowledge.addImage')}</label>
                                <input id="answer-file-upload" type="file" className="sr-only" onChange={handleAnswerFileChange} accept="image/*" />
                            </div>
                        )}
                        
                        <div className="mt-4 flex justify-end">
                            <Button onClick={() => handleAnswerSubmit(item.id)}>{t('knowledge.submitAnswer')}</Button>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            )) : (
                <div className="text-center py-16 bg-primary dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                    <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-lg font-medium text-dark dark:text-secondary">
                        {activeTab === 'mine' ? t('knowledge.noQuestions.mine.title') : t('knowledge.noQuestions.community.title')}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {activeTab === 'mine' ? t('knowledge.noQuestions.mine.subtitle') : t('knowledge.noQuestions.community.subtitle')}
                    </p>
                    <div className="mt-6">
                        <Button onClick={() => setIsAskModalOpen(true)}>
                            {t('knowledge.askQuestion')}
                        </Button>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
      <AskQuestionModal isOpen={isAskModalOpen} onClose={() => setIsAskModalOpen(false)} onSubmit={handlePostQuestion} />
      {newAnswerImage && (
          <ImageEditorModal 
              isOpen={isEditorOpen}
              onClose={() => setIsEditorOpen(false)}
              imageSrc={newAnswerImage}
              onSave={(newImage) => {
                  setNewAnswerImage(newImage);
                  setIsEditorOpen(false);
              }}
          />
      )}
    </>
  );
};