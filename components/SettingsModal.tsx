import React, { FC, useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Palette, 
  Settings2, 
  Languages, 
  Check, 
  Type, 
  Sliders, 
  Info,
  Sparkles,
  Save,
  RefreshCw,
  Mail,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const applyDynamicStyles = (color: string, font: string) => {
  if (typeof document === 'undefined') return;

  // 1. Accent color variables & style overrides
  let styleEl = document.getElementById('dynamic-accent-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamic-accent-styles';
    document.head.appendChild(styleEl);
  }

  // 2. Select font import URL
  let fontLinkEl = document.getElementById('dynamic-font-link');
  if (fontLinkEl) fontLinkEl.remove();

  let fontStyleRule = '';
  if (font === 'playfair') {
    fontLinkEl = document.createElement('link');
    fontLinkEl.id = 'dynamic-font-link';
    fontLinkEl.setAttribute('rel', 'stylesheet');
    fontLinkEl.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
    document.head.appendChild(fontLinkEl);
    fontStyleRule = `font-family: 'Playfair Display', serif !important;`;
  } else if (font === 'space-mono') {
    fontLinkEl = document.createElement('link');
    fontLinkEl.id = 'dynamic-font-link';
    fontLinkEl.setAttribute('rel', 'stylesheet');
    fontLinkEl.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
    document.head.appendChild(fontLinkEl);
    fontStyleRule = `font-family: 'Space Mono', monospace !important;`;
  } else if (font === 'fira-code') {
    fontLinkEl = document.createElement('link');
    fontLinkEl.id = 'dynamic-font-link';
    fontLinkEl.setAttribute('rel', 'stylesheet');
    fontLinkEl.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap');
    document.head.appendChild(fontLinkEl);
    fontStyleRule = `font-family: 'Fira Code', monospace !important;`;
  } else if (font === 'poppins') {
    fontStyleRule = `font-family: 'Poppins', sans-serif !important;`;
  } else {
    // Default system font rule (will let index.html's Inter or standard fallbacks render)
    fontStyleRule = `font-family: 'Inter', sans-serif !important;`;
  }

  // Generate color styles, support clean override of accent colors
  styleEl.innerHTML = `
    :root {
      --accent-custom: ${color};
    }
    .text-accent, .text-emerald-500, .text-emerald-600, .text-emerald-450, .text-teal-500 {
      color: var(--accent-custom) !important;
    }
    .hover\\:text-accent:hover, .hover\\:text-emerald-600:hover, .hover\\:text-teal-650:hover, .hover\\:text-emerald-500:hover {
      color: var(--accent-custom) !important;
      opacity: 0.85;
    }
    .bg-accent, .bg-emerald-500, .bg-teal-500, .bg-gradient-to-r.from-emerald-500, .bg-gradient-to-r.to-teal-500 {
      background-color: var(--accent-custom) !important;
    }
    .bg-emerald-500\\/10 {
      background-color: ${color}1a !important; /* 10% opacity */
    }
    .bg-emerald-500\\/20 {
      background-color: ${color}33 !important; /* 20% opacity */
    }
    .hover\\:bg-accent:hover, .hover\\:bg-green-600:hover, .hover\\:bg-emerald-600:hover, .hover\\:bg-teal-650:hover {
      background-color: var(--accent-custom) !important;
      filter: brightness(0.9);
    }
    .border-accent, .border-emerald-500, .border-emerald-500\\/20, .border-emerald-500\\/30 {
      border-color: var(--accent-custom) !important;
    }
    body, html, button, input, select, textarea, p, h1, h2, h3, h4, h5, h6 {
      ${fontStyleRule}
    }
  `;
};

export const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'profile' | 'style' | 'features'>('profile');

  // Profile forms state
  const [profileName, setProfileName] = useState('Madhav Kalsiya');
  const [profileRole, setProfileRole] = useState('Full Stack AI Specialist');
  const [profileEmail, setProfileEmail] = useState('madhav@clarity.ai');
  const [profileStatus, setProfileStatus] = useState('Bringing clarity to complex challenges.');

  // Color / Font styling state
  const [accentColor, setAccentColor] = useState('#10b981'); // default emerald
  const [fontFamily, setFontFamily] = useState('inter');

  // Feature Toggles state
  const [voiceWaves, setVoiceWaves] = useState(true);
  const [autoSuggestions, setAutoSuggestions] = useState(true);
  const [pushTickers, setPushTickers] = useState(true);
  const [developerTools, setDeveloperTools] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Available color choices
  const colorChoices = [
    { name: 'Emerald green', value: '#10b981', ring: 'ring-emerald-400' },
    { name: 'Brilliant blue', value: '#3b82f6', ring: 'ring-blue-400' },
    { name: 'Electric violet', value: '#8b5cf6', ring: 'ring-purple-400' },
    { name: 'Golden amber', value: '#f59e0b', ring: 'ring-amber-400' },
    { name: 'Crimson rose', value: '#f43f5e', ring: 'ring-rose-400' },
    { name: 'Cosmic indigo', value: '#6366f1', ring: 'ring-indigo-400' },
  ];

  // Available font choices
  const fontChoices = [
    { id: 'inter', name: 'Clean Modern (Inter)', desc: 'Clean, professional & highly legible' },
    { id: 'poppins', name: 'Chic Display (Poppins)', desc: 'Friendly geometric branding sans-serif' },
    { id: 'playfair', name: 'Elegant Literary (Playfair)', desc: 'Charming editorial serif layout' },
    { id: 'space-mono', name: 'Structured Engineer (Space Mono)', desc: 'Retro-tech typewriter monospace style' },
    { id: 'fira-code', name: 'Interactive Pro (Fira Code)', desc: 'Modern ligatures code console' },
  ];

  // Load from database (localStorage) on open
  useEffect(() => {
    if (isOpen) {
      setProfileName(localStorage.getItem('clarity_user_name') || 'Madhav Kalsiya');
      setProfileRole(localStorage.getItem('clarity_user_role') || 'Full Stack AI Specialist');
      setProfileEmail(localStorage.getItem('clarity_user_email') || 'madhav@clarity.ai');
      setProfileStatus(localStorage.getItem('clarity_user_status') || 'Bringing clarity to complex challenges.');

      setAccentColor(localStorage.getItem('clarity_accent_color') || '#10b981');
      setFontFamily(localStorage.getItem('clarity_font_family') || 'inter');

      setVoiceWaves(localStorage.getItem('clarity_feature_voice_waves') !== 'false');
      setAutoSuggestions(localStorage.getItem('clarity_feature_suggestions') !== 'false');
      setPushTickers(localStorage.getItem('clarity_feature_push_tickers') !== 'false');
      setDeveloperTools(localStorage.getItem('clarity_feature_dev') === 'true');
    }
  }, [isOpen]);

  const saveSettings = () => {
    try {
      localStorage.setItem('clarity_user_name', profileName);
      localStorage.setItem('clarity_user_role', profileRole);
      localStorage.setItem('clarity_user_email', profileEmail);
      localStorage.setItem('clarity_user_status', profileStatus);

      localStorage.setItem('clarity_accent_color', accentColor);
      localStorage.setItem('clarity_font_family', fontFamily);

      localStorage.setItem('clarity_feature_voice_waves', String(voiceWaves));
      localStorage.setItem('clarity_feature_suggestions', String(autoSuggestions));
      localStorage.setItem('clarity_feature_push_tickers', String(pushTickers));
      localStorage.setItem('clarity_feature_dev', String(developerTools));

      // Trigger dynamic system styles instantly
      applyDynamicStyles(accentColor, fontFamily);

      // Trigger state dispatch for other app panels
      window.dispatchEvent(new Event('settings_updated'));
      
      setToastMessage("Settings saved successfully! Changes applied instantly.");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setToastMessage("Failed to save changes.");
    }
  };

  const handleReset = () => {
    if (confirm("Reset layout preferences and profile variables to defaults?")) {
      setProfileName('Madhav Kalsiya');
      setProfileRole('Full Stack AI Specialist');
      setProfileEmail('madhav@clarity.ai');
      setProfileStatus('Bringing clarity to complex challenges.');
      setAccentColor('#10b981');
      setFontFamily('inter');
      setVoiceWaves(true);
      setAutoSuggestions(true);
      setPushTickers(true);
      setDeveloperTools(false);
      setLanguage('en');

      setTimeout(() => {
        applyDynamicStyles('#10b981', 'inter');
        window.dispatchEvent(new Event('settings_updated'));
      }, 50);

      setToastMessage("Settings restored back to factory defaults.");
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity"
      ></div>

      {/* Modal Alignment Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all animate-slide-up">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 rounded-xl">
                <Settings2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                  Interactive Preference Hub
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-500">
                  Configure fonts, accents, personal records & functional flags
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 pt-3 gap-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'profile'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <User className="w-4 h-4" />
              Personal Info & Language
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'style'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <Palette className="w-4 h-4" />
              Color Accents & Font Type
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'features'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Application Flags & Toggles
            </button>
          </div>

          {/* Tab Contents Area */}
          <div className="p-6 max-h-[380px] overflow-y-auto">
            
            {/* TAB 1: PROFILE & LANGUAGE */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-450 uppercase tracking-widest flex items-center gap-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full text-xs font-medium p-2.5 pl-9 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-855 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="e.g. Madhav Kalsiya"
                      />
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Professional role field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-450 uppercase tracking-widest flex items-center gap-1">
                      Professional Specialty
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileRole}
                        onChange={(e) => setProfileRole(e.target.value)}
                        className="w-full text-xs font-medium p-2.5 pl-9 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-854 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="e.g. AI Specialist"
                      />
                      <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Custom Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-450 uppercase tracking-widest flex items-center gap-1">
                      E-Mail Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full text-xs font-medium p-2.5 pl-9 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-854 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="e.g. madhav@clarity.ai"
                      />
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Language Context Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-450 uppercase tracking-widest flex items-center gap-1">
                      System Language Environment
                    </label>
                    <div className="relative">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="w-full text-xs font-semibold p-2.5 pl-9 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-854 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 select-none cursor-pointer"
                      >
                        <option value="en">🇺🇸 English (US Language)</option>
                        <option value="es">🇪🇸 Español (Spanish Accent)</option>
                        <option value="fr">🇫🇷 Français (French Translation)</option>
                        <option value="de">🇩🇪 Deutsch (German Standard)</option>
                      </select>
                      <Languages className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Tagline message mapping */}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-450 uppercase tracking-widest">
                    Status Message Tagline
                  </label>
                  <textarea
                    value={profileStatus}
                    onChange={(e) => setProfileStatus(e.target.value)}
                    rows={2}
                    className="w-full text-xs font-medium p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-855 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                    placeholder="Enter short profile motto statement..."
                  />
                </div>

                <div className="flex gap-2 p-2.5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-slate-650 dark:text-slate-350">
                  <Info className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>These personal details sync across the dashboard, active secure developer logs, and client billing transcripts.</span>
                </div>
              </div>
            )}

            {/* TAB 2: ACCENT COLOR SELECTION & FONTS */}
            {activeTab === 'style' && (
              <div className="space-y-5">
                {/* Visual Color swatches */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-550 dark:text-slate-400 uppercase tracking-widest">
                    Select Interactive Aesthetic Color Accent
                  </label>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {colorChoices.map((choice) => {
                      const isSelected = accentColor.toLowerCase() === choice.value.toLowerCase();
                      return (
                        <button
                          key={choice.value}
                          onClick={() => setAccentColor(choice.value)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                            isSelected
                              ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 ring-2 ring-emerald-500/40'
                              : 'bg-slate-50/50 dark:bg-slate-850/50 border-slate-150 dark:border-slate-800 hover:bg-slate-150/50 dark:hover:bg-slate-800/80'
                          }`}
                          title={`Select ${choice.name}`}
                        >
                          <span 
                            className="w-6 h-6 rounded-full block border shadow-xs"
                            style={{ backgroundColor: choice.value }}
                          />
                          <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 truncate w-full">
                            {choice.name.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font Choices */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-550 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Type className="w-3.5 h-3.5 text-accent" />
                    Select Global Typography (Font-family mapping)
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto">
                    {fontChoices.map((fc) => {
                      const isSelected = fontFamily === fc.id;
                      return (
                        <div
                          key={fc.id}
                          onClick={() => setFontFamily(fc.id)}
                          className={`p-2 px-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30'
                              : 'bg-slate-50/50 dark:bg-slate-850/50 border-slate-150 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="text-left">
                            <h5 className="text-[11px] font-bold text-slate-850 dark:text-slate-200">{fc.name}</h5>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{fc.desc}</p>
                          </div>
                          <div className={`p-1 rounded-full ${isSelected ? 'bg-emerald-500 text-white animate-pulse' : 'bg-transparent text-transparent'}`}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 animate-bounce" />
                  <span>The customized styling overrides active elements instantly using physical stylesheet injections.</span>
                </div>
              </div>
            )}

            {/* TAB 3: APP FEATURE TOGGLES */}
            {activeTab === 'features' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-extrabold text-slate-550 dark:text-slate-400 uppercase tracking-widest">
                    Manage Platform Capabilities & Functional Swithes
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Enable or restrict specific system engines, animated features, and development logs.
                  </p>
                </div>

                <div className="space-y-2">
                  {/* Voice Assistant Ticker */}
                  <div className="flex items-center justify-between p-3 bg-slate-50/70 dark:bg-slate-850/70 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <div className="text-left max-w-[80%]">
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-250 block">LARA Auditory Waveforms</span>
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 block">Render live bouncing waves during speech narration.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={voiceWaves} 
                        onChange={(e) => setVoiceWaves(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-705 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {/* Proactive Suggestions */}
                  <div className="flex items-center justify-between p-3 bg-slate-50/70 dark:bg-slate-850/70 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <div className="text-left max-w-[80%]">
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-250 block">Live Smart Advice suggestions</span>
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 block">Proactively propose cross-views (Search/Marketplace) inside chat bubbles.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoSuggestions} 
                        onChange={(e) => setAutoSuggestions(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-705 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {/* Simulated push tickers */}
                  <div className="flex items-center justify-between p-3 bg-slate-50/70 dark:bg-slate-850/70 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <div className="text-left max-w-[80%]">
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-250 block">Realtime Milestone simulation</span>
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 block">Simulate active escrow milestone mock status alerts speed.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={pushTickers} 
                        onChange={(e) => setPushTickers(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-705 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {/* Dev settings */}
                  <div className="flex items-center justify-between p-3 bg-slate-50/70 dark:bg-slate-850/70 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <div className="text-left max-w-[80%] flex items-center gap-1.5">
                      <div>
                        <span className="text-xs font-bold text-slate-850 dark:text-slate-250 flex items-center gap-1">
                          System Debugging Mode
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        </span>
                        <span className="text-[10px] text-slate-450 dark:text-slate-500 block">Expose low-level process parameters and server health monitors.</span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={developerTools} 
                        onChange={(e) => setDeveloperTools(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-705 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Toast Notification for instant feedback */}
          {toastMessage && (
            <div className="px-6 py-2 bg-emerald-500 text-white text-center text-xs font-bold select-none animate-pulse">
              {toastMessage}
            </div>
          )}

          {/* Footer controls */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-extrabold text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              title="Factory Reset Settings"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-transparent text-xs font-extrabold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all flex items-center gap-1.5"
                title="Save preferences to database"
              >
                <Save className="w-4 h-4" />
                Apply & Save Preferences
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
