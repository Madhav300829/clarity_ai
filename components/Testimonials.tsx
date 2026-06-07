import React, { FC, useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Stats } from './Stats';
import { useTranslation } from '../context/LanguageContext';

interface HeroProps {
  onGetStartedClick: () => void;
}

// Interactive front wallpaper background presets
interface WallpaperPreset {
  id: string;
  name: string;
  css: string;
  badgeColor: string;
  ringColor: string;
}

const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'cosmic-aurora',
    name: 'Cosmic Aurora',
    css: 'bg-gradient-to-br from-slate-950 via-teal-950 via-emerald-900/40 to-slate-950',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    ringColor: 'ring-emerald-500/50'
  },
  {
    id: 'deep-obsidian',
    name: 'Deep Obsidian',
    css: 'bg-gradient-to-tr from-slate-950 via-slate-900 to-zinc-900',
    badgeColor: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
    ringColor: 'ring-zinc-400/50'
  },
  {
    id: 'cyberpunk-matrix',
    name: 'Cyber Grid',
    css: 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] bg-slate-950 border border-slate-900',
    badgeColor: 'text-green-400 bg-green-500/10 border-green-500/20',
    ringColor: 'ring-green-500/50'
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Radiance',
    css: 'bg-gradient-to-br from-slate-950 via-orange-950/40 to-slate-950',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    ringColor: 'ring-amber-500/50'
  }
];

export const Hero: FC<HeroProps> = ({ onGetStartedClick }) => {
  const { t } = useTranslation();
  const [activeWallpaper, setActiveWallpaper] = useState<WallpaperPreset>(WALLPAPER_PRESETS[0]);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Update clock widget in front wallpaper
  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTimeAndDate();
    const interval = setInterval(updateTimeAndDate, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLearnMoreClick = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative w-full py-8 md:py-16">
      {/* Front Wallpaper Container */}
      <div className={`relative w-full rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-200/50 dark:border-slate-800/80 transition-all duration-1000 ease-in-out p-6 md:p-12 ${activeWallpaper.css}`}>
        {/* Subtle grid and glow backplate overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Glowing lights positioning inside front wallpaper */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[80px] -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 dark:bg-indigo-500/10 rounded-full blur-[100px] -z-10 animate-pulse delay-1000" />

        {/* Top bar of the Wallpaper interface containing dynamic environment indicators */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6 mb-12">
          {/* Brand/Wallpaper Status Badge */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500/90 shadow-lg shadow-red-500/20" />
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-400/90 shadow-lg shadow-yellow-400/20" />
              <span className="w-3.5 h-3.5 rounded-full bg-green-500/90 shadow-lg shadow-green-500/20" />
            </div>
            <div className={`px-3 py-1 text-xs font-mono font-semibold rounded-full border ${activeWallpaper.badgeColor} transition-all duration-500`}>
              ACTIVE WALLPAPER: {activeWallpaper.name.toUpperCase()}
            </div>
          </div>

          {/* Real-time Dynamic Clock and Widget inside Front Wallpaper banner */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
            <div className="px-3 py-1 bg-white/5 dark:bg-black/20 rounded-lg border border-white/5 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>{currentDate}</span>
            </div>
            <div className="px-3 py-1 bg-white/5 dark:bg-black/20 rounded-lg border border-white/5 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="tabular-nums">{currentTime || '00:00:00'}</span>
            </div>
          </div>
        </div>

        {/* Central visual panel containing BOLD "CLARITY.AI" branding */}
        <div className="relative z-10 text-center max-w-4xl mx-auto py-6 md:py-12 animate-fade-in">
          {/* Subtitle Accent */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wider uppercase mb-6 shadow-sm filter backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Clarity Intelligent Workspace Engine</span>
          </div>

          {/* The giant BOLD letters wallpaper headline */}
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6 [text-shadow:0_4px_12px_rgba(0,0,0,0.6)] animate-slide-up">
            CLARITY<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400">.AI</span>
          </h1>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-100/90 leading-tight mb-6 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
            {t('hero.title').replace(/<br\s*\/?>/gi, ' ')}
          </h2>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 mb-10 leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] bg-slate-950/20 px-4 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={onGetStartedClick} 
              className="px-8 py-4 text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-none shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/30 text-white rounded-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Get Started Free — Join Now
            </Button>
            <Button 
              onClick={handleLearnMoreClick} 
              variant="secondary" 
              className="px-8 py-4 text-base font-bold bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 text-white border border-white/15 hover:border-white/30 rounded-2xl backdrop-blur-md transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              View Intelligent Features
            </Button>
          </div>
        </div>

        {/* Floating Desktop-style control deck / front wallpaper selector */}
        <div className="relative z-10 mt-12 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">SELECT FRONT WALLPAPER SKIN:</span>
            <div className="flex items-center gap-2.5 ml-2">
              {WALLPAPER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setActiveWallpaper(preset)}
                  className={`w-5 h-5 rounded-full transition-all duration-300 relative ${
                    preset.id === 'cosmic-aurora' ? 'bg-emerald-990 border border-emerald-400 bg-emerald-800' :
                    preset.id === 'deep-obsidian' ? 'bg-slate-900 border border-slate-600' :
                    preset.id === 'cyberpunk-matrix' ? 'bg-black border border-green-500' : 'bg-orange-950 border border-amber-500'
                  } ${
                    activeWallpaper.id === preset.id 
                      ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 scale-125' 
                      : 'hover:scale-110'
                  }`}
                  title={`Switch to ${preset.name}`}
                />
              ))}
            </div>
          </div>
          
          <div className="text-xs font-mono text-slate-400">
            CLARITY ENGINE VERSION <span className="text-emerald-400">V3.5.2</span> • SYSTEM SECURE
          </div>
        </div>
      </div>

      {/* Grid Features metrics below wallpaper */}
      <div className="mt-12">
        <Stats />
      </div>
    </div>
  );
};
