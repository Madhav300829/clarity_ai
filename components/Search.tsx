import React, { useState, FC, FormEvent, ChangeEvent } from 'react';
import { searchWithGoogle } from '../services/geminiService';
import { SearchResult } from '../types';
import { SearchIcon, PhotoIcon, ListBulletIcon, LinkIcon, SparklesIcon } from './icons/Icons';
import { logActivity, ActivityType } from '../services/logService';
import { useTranslation } from '../context/LanguageContext';

interface SearchBarProps {
    query: string;
    onQueryChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
    hasSearched: boolean;
}

const SearchBar: FC<SearchBarProps> = ({ query, onQueryChange, onSubmit, isLoading, hasSearched }) => {
    const { t } = useTranslation();
    return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ${hasSearched ? 'mb-8' : 'pt-24'}`}>
        {!hasSearched && (
             <div className="text-center mb-8 animate-slide-up">
                <h1 className="text-4xl md:text-5xl font-extrabold text-dark dark:text-primary font-display [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{t('search.title')}</h1>
                <p className="mt-2 text-lg text-light dark:text-slate-400 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{t('search.subtitle')}</p>
            </div>
        )}
      <form onSubmit={onSubmit} className="relative animate-slide-up" style={{animationDelay: '100ms'}}>
        <input
          type="text"
          value={query}
          onChange={onQueryChange}
          placeholder={t('search.inputPlaceholder')}
          className="w-full py-4 pl-6 pr-14 text-lg bg-primary dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-full focus:ring-2 focus:ring-accent focus:outline-none transition text-dark dark:text-secondary shadow-md dark:shadow-slate-900"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-accent text-white rounded-full disabled:bg-slate-400 hover:bg-green-600 transition transform hover:scale-110"
        >
          <SearchIcon />
        </button>
      </form>
    </div>
    )
};


export const Search: FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { t } = useTranslation();

  // Updated to accept the triggering element for more reliable focus management
  const performSearch = async (searchQuery: string, triggerElement?: HTMLElement) => {
    if (!searchQuery.trim()) return;
    
    logActivity(ActivityType.SEARCH_QUERY, {
        query: searchQuery,
    });

    // Blur the element that triggered the search to prevent scroll jumping
    const elementToBlur = triggerElement || (document.activeElement instanceof HTMLElement ? document.activeElement : document.body);
    elementToBlur?.blur();

    window.scrollTo(0, 0);
    setQuery(searchQuery);
    setIsLoading(true);
    setResult(null);
    setHasSearched(true);
    const searchResult = await searchWithGoogle(searchQuery);
    setResult(searchResult);
    setIsLoading(false);
  };

  // Updated to pass the form element to the search function
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    performSearch(query, e.currentTarget);
  };

  return (
    <div className="relative h-full py-8 animate-fade-in mb-16 md:mb-0">
      <SearchBar 
        query={query}
        onQueryChange={(e) => setQuery(e.target.value)}
        onSubmit={handleSearch}
        isLoading={isLoading}
        hasSearched={hasSearched}
      />
      <div className={`${hasSearched ? 'block' : 'hidden'}`}>
        {isLoading && (
          <div className="text-center pt-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">{t('search.loading')}</span>
            </div>
            <p className="mt-2 text-light dark:text-slate-400">{t('search.synthesizing')}</p>
          </div>
        )}
        {result && (
          <div className="max-w-6xl mx-auto animate-slide-up grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-primary dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold mb-4 text-accent font-display">{t('search.results.summary')}</h2>
                  <p className="text-dark dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{result.summary}</p>
                </div>

                {result.keyPoints && result.keyPoints.length > 0 && (
                    <div className="bg-primary dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <ListBulletIcon className="h-6 w-6 text-accent" />
                            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">{t('search.results.keyPoints')}</h3>
                        </div>
                        <ul className="list-disc list-inside space-y-2 text-dark dark:text-slate-300 pl-2">
                            {result.keyPoints.map((point, index) => (
                            <li key={index} className="marker:text-accent">{point}</li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {result.relatedSearches && result.relatedSearches.length > 0 && (
                     <div className="bg-primary dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <SparklesIcon />
                            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">{t('search.results.relatedSearches')}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {result.relatedSearches.map((suggestion, index) => (
                                <button 
                                    key={index}
                                    onClick={(e) => performSearch(suggestion, e.currentTarget)}
                                    className="bg-secondary dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-dark dark:hover:text-secondary transition-colors duration-200 border border-slate-200 dark:border-slate-600"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="lg:col-span-1 space-y-8">
                {result.sources && result.sources.length > 0 && (
                  <div className="bg-primary dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <LinkIcon className="h-6 w-6 text-accent" />
                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">{t('search.results.sources')}</h3>
                    </div>
                    <div className="space-y-3">
                      {result.sources.map((source, index) => (
                        <a
                          key={index}
                          href={source.web.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-secondary dark:bg-slate-700/50 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition duration-300 border border-slate-200 dark:border-slate-700 hover:border-accent dark:hover:border-accent"
                        >
                          <p className="font-semibold text-accent truncate text-sm">{source.web.title}</p>
                          <p className="text-xs text-light dark:text-slate-400 truncate">{source.web.uri}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {result.imageSearchSuggestions && result.imageSearchSuggestions.length > 0 && (
                     <div className="bg-primary dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <PhotoIcon className="h-6 w-6 text-accent" />
                            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">{t('search.results.imageSuggestions')}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {result.imageSearchSuggestions.map((suggestion, index) => (
                                <span key={index} className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-sm font-medium px-3 py-1 rounded-full">{suggestion}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};