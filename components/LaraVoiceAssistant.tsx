import React, { FC, useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square, 
  HelpCircle, 
  ChevronRight, 
  Sparkles, 
  Settings, 
  Navigation,
  Mic,
  User,
  Activity,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { View } from '../App';

interface LaraVoiceAssistantProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

interface GuideOption {
  id: string;
  title: string;
  view?: View;
  description: string;
  spokenText: string;
  operationTips: string[];
}

export const LaraVoiceAssistant: FC<LaraVoiceAssistantProps> = ({ currentView, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentOptionId, setCurrentOptionId] = useState<string | null>(null);
  
  // Speech controls
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [transcriptContent, setTranscriptContent] = useState<string>('');
  const [soundWaveActive, setSoundWaveActive] = useState<boolean>(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const guides: GuideOption[] = [
    {
      id: 'general_intro',
      title: 'General Interactive Tour',
      description: 'Get an overview of ClarityAI and how to steer the whole platform.',
      spokenText: 'Welcome to Clarity AI, your unified smart workspace combining AI intelligence and real-world execution. I am LARA, your Voice Guide Assistant. At Clarity AI, we bridge the gap between planning and doing. We have designed several interactive features like a chatbot, search engine, knowledge hub, and freelancer marketplace. Let\'s explore how to operate each option under your control!',
      operationTips: [
        'Navigate views using the navigation links at the top center.',
        'Use the quick controls such as the secure Wallet, Notifications, and Export Hub at the top right.',
        'Customize the visual backgrounds with the paint brush icon.'
      ]
    },
    {
      id: 'home_overview',
      title: '1. Home & Quick Actions',
      view: 'home',
      description: 'Get guidelines on how to operate the home elements and widgets.',
      spokenText: 'On the Home Overview view, you will find our quick interactive dashboards. Under the quick actions panel, you can view major announcements, active freelancer updates, and check our services. To operate the interactive page background, click the Paint Brush icon in the header and choose between futuristic digital canvases or soothing color tones.',
      operationTips: [
        'Explore the hero features section for general information.',
        'Toggle dynamic backgrounds through the Appearance setup panel.',
        'Review the community stats grid displaying millions of processed files.'
      ]
    },
    {
      id: 'lara_chatbot',
      title: '2. LARA Chatbot (AI Assistant)',
      view: 'chatbot',
      description: 'Learn to chat with Gemini, export logs, and get automated ideas.',
      spokenText: 'To operate our Chatbot, click on LARA Chatbot in the top navigation. Once here, type any question or project instructions in the input field. I am integrated with live Gemini servers to respond to you. Remember, I am proactive! If your question is better answered by checking our marketplace or searching Google, I will automatically suggest those options in my text bubble. You can also click "Download Chat Transcript" at the top of the chat panel to save our conversation locally.',
      operationTips: [
        'Type your message, then press Enter or click the send button.',
        'Toggle chat history or reset with the interactive widgets.',
        'Look out for helper suggestions guiding you to other pages.'
      ]
    },
    {
      id: 'google_search',
      title: '3. Google Grounded Search',
      view: 'search',
      description: 'Understand search verification, cited sources, and summaries.',
      spokenText: 'To operate our Search Engine, click on Search. This tool is backed by live Google Grounding. Enter any complex query, and hit search. Clarity AI queries the live web, reads standard articles, and returns a verified AI summary, high-quality key bullet points, related searches, and real sources. Click "Download Report" on the right of the summary to export the research findings.',
      operationTips: [
        'Enter specific queries like world news, financial calculations, or code snippets.',
        'Review grounded source links to read the original publications.',
        'Export the full formatted search summary report to a local text file.'
      ]
    },
    {
      id: 'knowledge_hub',
      title: '4. Knowledge Hub Q&A',
      view: 'knowledge',
      description: 'Learn how to ask, find AI answers, and download forum records.',
      spokenText: 'To operate the Knowledge Hub, click on Knowledge Hub. This is our crowdsourced peer community forum. You can post a new question by clicking the "Ask Question" button. Once posted, our automated systems generate synthesized expert answers instantly using Gemini, and you can add user notes. You can filter listings, search by subjects, and click "Export Hub" on the right side of the filter controls to download the whole dialogue archive as a clean JSON file.',
      operationTips: [
        'Add custom questions with categories like Web Dev, Design, or AI.',
        'Mark items solved, or read instantly summarized responses.',
        'Click Export Hub to save the JSON dataset containing community knowledge.'
      ]
    },
    {
      id: 'marketplace',
      title: '5. Freelancer Marketplace',
      view: 'hire',
      description: 'Learn to filter expert talent, negotiate rates, and hire safely.',
      spokenText: 'To operate our Freelancer Marketplace, select "Hire Us" from the navigation. You can filter pre-vetted contractors by industry domains, hourly rates, and star ratings using the Filter icon. Click "Chat with Expert" on any freelancer profile card to fly open an interactive messenger. Direct message the developer or designer about your specs, timeline, and custom milestones. When you are ready to proceed, click "Export" on the right side of the filters to download a structured CSV spreadsheet of matching candidates.',
      operationTips: [
        'Use rate and ranking filters to align with your project goals.',
        'Launch conversational guides with selected candidates immediately.',
        'Export experts directory to CSV for sheets modeling and comparisons.'
      ]
    },
    {
      id: 'secured_wallet',
      title: '6. Escrow Wallet Ledger',
      description: 'Review balance security, active milestone locks, and CSV ledgers.',
      spokenText: 'Your Secured Wallet is linked directly in the header menu. Click on the Wallet icon to open your personal funds control center. Inside, you can review your available balance, add funds securely via simulated UPI, and inspect active milestone vaults. This keeps your hiring contracts fully backed and secure before release. To download an audited account ledger statement, click the "Download Wallet Ledger" button or use our primary Export Panel.',
      operationTips: [
        'Simulate adding escrow deposits ($50 - $500 USD) via UPI.',
        'Verify currently active milestone locks tied to ongoing contracts.',
        'Download instant ledger reports showing timestamped audit lines.'
      ]
    }
  ];

  // Load voices
  const updateVoices = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Try to default to a clean English female or standard Google voice if available
      if (availableVoices.length > 0) {
        const preferred = availableVoices.find(v => 
          v.name.toLowerCase().includes('google') && v.lang.startsWith('en')
        ) || availableVoices.find(v => 
          v.lang.startsWith('en-US') && v.name.toLowerCase().includes('female')
        ) || availableVoices.find(v => 
          v.lang.startsWith('en')
        ) || availableVoices[0];
        
        setSelectedVoiceName(preferred.name);
      }
    }
  };

  useEffect(() => {
    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      // Emergency mute on unmount
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (option: GuideOption) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert("Speech synthesis is not supported on your browser.");
      return;
    }

    // Cancel anything playing
    window.speechSynthesis.cancel();
    
    // Auto-navigate to correct view if provided
    if (option.view && currentView !== option.view) {
      onNavigate(option.view);
    }

    setCurrentOptionId(option.id);
    setTranscriptContent(option.spokenText);
    const voiceWavesEnabled = typeof window !== 'undefined' && localStorage.getItem('clarity_feature_voice_waves') !== 'false';
    setIsPlaying(true);
    setIsPaused(false);
    setSoundWaveActive(voiceWavesEnabled);

    const utterance = new SpeechSynthesisUtterance(option.spokenText);
    utteranceRef.current = utterance;

    // Apply voice settings
    if (selectedVoiceName) {
      const selectedVoice = voices.find(v => v.name === selectedVoiceName);
      if (selectedVoice) utterance.voice = selectedVoice;
    }
    
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Events
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setSoundWaveActive(false);
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis ended or errored: ", e);
      // Only reset states if not cancelled on purpose
      if (e.error !== 'interrupted') {
        setIsPlaying(false);
        setIsPaused(false);
        setSoundWaveActive(false);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePauseResume = () => {
    if (!isPlaying || typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      const voiceWavesEnabled = localStorage.getItem('clarity_feature_voice_waves') !== 'false';
      setSoundWaveActive(voiceWavesEnabled);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setSoundWaveActive(false);
    }
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setSoundWaveActive(false);
    setTranscriptContent('');
  };

  const activeOption = guides.find(g => g.id === currentOptionId);

  return (
    <>
      {/* Absolute Bottom-Left floating or floating toggle controller */}
      <div className="fixed bottom-6 left-6 z-50">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 p-3.5 md:p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all outline-none border border-emerald-400 group relative"
            title="Open LARA AI Voice Guide Assistant"
            id="lara-voice-trigger-btn"
          >
            <div className="relative">
              <Mic className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {soundWaveActive && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
              )}
            </div>
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out font-bold text-xs whitespace-nowrap">
              Secure Voice Guide
            </span>
            
            {/* Quick Pulse ring if talking */}
            {soundWaveActive && (
              <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-pulse pointer-events-none -z-10 bg-emerald-500/10"></span>
            )}
          </button>
        ) : (
          /* Main expanded widget container */
          <div 
            className={`bg-white dark:bg-slate-900 w-[360px] md:w-[400px] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl transition-all duration-300 ${
              isMinimized ? 'h-[64px] overflow-hidden' : 'h-auto max-h-[560px] overflow-y-auto'
            } p-4 flex flex-col`}
          >
            {/* Active Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="relative p-2 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl text-white shadow-md">
                  <Mic className="w-4 h-4" />
                  {soundWaveActive && (
                    <span className="absolute inset-0 rounded-2xl bg-emerald-400 animate-ping opacity-30"></span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-850 dark:text-white flex items-center gap-1">
                    LARA Voice Assistant
                    <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded-md">Live</span>
                  </h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400 inline-block" />
                    Speak interactive operating manual
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                {/* Mode Settings click triggers panel */}
                <button 
                  onClick={() => setShowSettings(!showSettings)} 
                  className={`p-1.5 rounded-lg transition-colors ${showSettings ? 'bg-slate-150 text-emerald-500 dark:bg-slate-800' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  title="Voice Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                {/* Minimize click */}
                <button 
                  onClick={() => setIsMinimized(!isMinimized)} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={isMinimized ? "Maximize Assistant" : "Minimize Assistant"}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                {/* Close click */}
                <button 
                  onClick={() => { setIsOpen(false); handleStop(); }} 
                  className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Close Assistant"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Minimize state doesn't show details */}
            {!isMinimized && (
              <>
                {/* Voice & speed customization drawer */}
                {showSettings && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-150 dark:border-slate-800 mt-2 space-y-3 font-sans animate-slide-up">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-550 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-emerald-500" />
                        Select Assistant Character
                      </label>
                      <select
                        value={selectedVoiceName}
                        onChange={(e) => setSelectedVoiceName(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium"
                      >
                        {voices.map((v, i) => (
                          <option key={v.name + i} value={v.name}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-extrabold text-slate-550 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-emerald-500" />
                          Tempo and Speech Rate
                        </label>
                        <span className="text-[10px] font-semibold text-emerald-600 font-mono">{speechRate.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.6"
                        max="2.0"
                        step="0.1"
                        value={speechRate}
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* Subtitle / Sub-Player if currently speaking */}
                {isPlaying && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl border border-emerald-500/20 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Interactive audio sound frequencies indicator */}
                        <div className="flex items-end gap-1 h-3.5">
                          <span className={`w-0.5 bg-emerald-500 rounded-full ${soundWaveActive ? 'h-3 animate-bounce' : 'h-1.5'}`} style={{ animationDelay: '0.1s' }}></span>
                          <span className={`w-0.5 bg-emerald-500 rounded-full ${soundWaveActive ? 'h-4 animate-bounce' : 'h-2'}`} style={{ animationDelay: '0.3s' }}></span>
                          <span className={`w-0.5 bg-emerald-500 rounded-full ${soundWaveActive ? 'h-3 animate-bounce' : 'h-1'}`} style={{ animationDelay: '0.5s' }}></span>
                          <span className={`w-0.5 bg-emerald-500 rounded-full ${soundWaveActive ? 'h-4.5 animate-bounce' : 'h-2.5'}`} style={{ animationDelay: '0.2s' }}></span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Reading: {activeOption?.title}
                        </span>
                      </div>
                      
                      {/* Sub-Player Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handlePauseResume}
                          className="p-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                          title={isPaused ? "Resume Guidelines" : "Pause Guidelines"}
                        >
                          {isPaused ? <Play className="w-3 h-3 fill-slate-700 dark:fill-white text-transparent" /> : <Pause className="w-3 h-3 fill-slate-700 dark:fill-white text-transparent" />}
                        </button>
                        <button
                          onClick={handleStop}
                          className="p-1 rounded bg-rose-500 text-white hover:bg-rose-600"
                          title="Stop Auditory Guide"
                        >
                          <Square className="w-3 h-3 fill-white" />
                        </button>
                      </div>
                    </div>

                    {/* Interactive spoken text subtitles */}
                    <div className="p-2 bg-white/70 dark:bg-slate-850/80 rounded-xl max-h-[76px] overflow-y-auto text-[11px] text-slate-600 dark:text-slate-300 italic leading-relaxed font-sans border border-slate-100 dark:border-slate-800">
                      "{transcriptContent}"
                    </div>
                  </div>
                )}

                {/* Option Header lists */}
                <div className="mt-3 space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mt-1">Select an Option to Speak & View</p>
                  
                  <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
                    {guides.map((opt) => {
                      const isActive = currentOptionId === opt.id && isPlaying;
                      return (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer text-left ${
                            isActive
                              ? 'bg-emerald-500/10 dark:bg-emerald-500/10 border-emerald-500/30 shadow-xs'
                              : 'bg-slate-50/50 dark:bg-slate-850/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-emerald-500/10'
                          }`}
                          onClick={() => handleSpeak(opt)}
                        >
                          <div className={`p-1.5 rounded-lg ${isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'} flex-shrink-0 mt-0.5`}>
                            {isActive && !isPaused ? (
                              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current text-transparent" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{opt.title}</h5>
                              {opt.view && (
                                <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wide font-mono bg-emerald-500/10 px-1 py-0.2 rounded-md flex items-center gap-0.5">
                                  <Navigation className="w-2 h-2" />
                                  go
                                </span>
                              )}
                            </div>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-normal truncate">{opt.description}</p>
                          </div>
                          <div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 self-center" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Guidelines operation checklist details */}
                {activeOption && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-1.5">
                    <h6 className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200/50 dark:border-slate-700/50 pb-1">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                      How to Operate:
                    </h6>
                    <ul className="space-y-1">
                      {activeOption.operationTips.map((tip, idx) => (
                        <li key={idx} className="text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1 leading-normal">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Disclaimer/Status */}
                <div className="mt-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-center text-[9px] text-slate-450 dark:text-slate-500 font-mono leading-tight">
                  🔊 Uses standard native High-Fidelity SpeechSynthesis synthesis
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};
