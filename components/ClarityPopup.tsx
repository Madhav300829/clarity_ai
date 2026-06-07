import React, { FC, useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';

interface ClarityPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClarityPopup: FC<ClarityPopupProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger class animation delay
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={`relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full max-w-xl p-8 rounded-3xl shadow-2xl m-4 transform transition-all duration-500 ease-out ${
          isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'
        }`}
      >
        {/* Decorative Grid Background and Ambient Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] rounded-3xl -z-10" />
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/10 dark:emerald-500/20 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-teal-500/10 dark:teal-500/20 rounded-full blur-3xl -z-10" />

        {/* Header/Close Icon button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          aria-label="Close popup"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Bold Letter Visual Icon Representing C for Clarity */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="relative group mb-6">
            {/* Extremely Bold "C" visual backplate and outer ring */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-slate-50 dark:bg-slate-800 border-2 border-emerald-400 dark:border-emerald-500/30 overflow-hidden shadow-lg">
              <span className="font-display font-extrabold text-7xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 animate-pulse select-none leading-none pt-1">
                C
              </span>
            </div>
          </div>

          {/* Clarity.AI Prominent Bold Branding */}
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
            Clarity<span className="text-emerald-500">.AI</span>
          </h2>
          
          <p className="text-sm tracking-wider text-emerald-600 dark:text-emerald-400 font-mono font-semibold uppercase mb-6 px-3 py-1 bg-emerald-500/10 rounded-full">
            INTELLIGENT INTEGRATION PLATFORM
          </p>

          <p className="text-slate-600 dark:text-slate-300 max-w-md text-base leading-relaxed mb-8">
            Welcome to <strong className="font-bold text-slate-900 dark:text-white">Clarity.AI</strong>, where cutting-edge artificial intelligence meets seamless professional productivity. Experience smarter learning, expert search depth, and freelance talent collaboration in one unified cloud ecosystem.
          </p>
        </div>

        {/* Interactive Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Conversational AI</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Brainstorm with intelligent context-aware support.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Dual Smart Search</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Aggregated insights and real web reference maps.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Expert Collaboration</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cooperate with top-tier freelance experts live.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Workspace Design</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Custom front background and layout options.</p>
            </div>
          </div>
        </div>

        {/* Enter/CTA Button */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onClose}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-lg shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] transition-all duration-200"
          >
            Enter Clarity.AI Workspace
          </button>
          <div className="text-center">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              Press anywhere or click entering to clear this overlay
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
