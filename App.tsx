import React, { useState, FC, ReactNode, useEffect } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { Search } from './components/Search';
import { KnowledgeHub } from './components/KnowledgeHub';
import { HireUs } from './components/HireUs';
import { Features } from './components/Features';
import { About } from './components/About';
import { Careers } from './components/Careers';
import { Contact } from './components/Contact';
import { HelpCenter } from './components/HelpCenter';
import { AnimatedBackground } from './components/AnimatedBackground';
import { LoginModal } from './components/LoginModal';
import { SignUpModal } from './components/SignUpModal';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Chatbot } from './components/Chatbot';
import { Background, FreelancerProfile, ChatMessage, ChatRole } from './types';
import { AppearancePanel } from './components/AppearancePanel';
import { useTheme } from './context/ThemeContext';
import { ChatWidget } from './components/ui/ChatWidget';
import { Hero } from './components/Testimonials';
import { logActivity, ActivityType } from './services/logService';
import { NotificationsPanel } from './components/NotificationsPanel';
import { LanguageSwitcher } from './components/LanguageSwitcher';


export type View = 'home' | 'search' | 'knowledge' | 'hire' | 'careers' | 'help' | 'dashboard' | 'chatbot';
const BACKGROUND_KEY = 'clarity-ai-background';

const App: FC = () => {
  const { theme } = useTheme();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<View>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [background, setBackground] = useState<Background>({ type: 'vanta', value: 'globe' });
  const [isAppearancePanelOpen, setIsAppearancePanelOpen] = useState(false);
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
  const [isLanguagePanelOpen, setIsLanguagePanelOpen] = useState(false);
  
  // State for the Chat Widget
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);
  const [chatWithFreelancer, setChatWithFreelancer] = useState<FreelancerProfile | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    try {
        const savedBg = localStorage.getItem(BACKGROUND_KEY);
        if (savedBg) {
            setBackground(JSON.parse(savedBg));
        }
    } catch (e) {
        console.error("Failed to load background from localStorage", e);
        localStorage.removeItem(BACKGROUND_KEY);
    }
  }, []);
  
  const handleStartChat = (freelancer: FreelancerProfile) => {
    logActivity(ActivityType.HIRE_CONTACT_INITIATED, {
        freelancerId: freelancer.id,
        freelancerName: freelancer.name,
    });

    setChatWithFreelancer(freelancer);
    setChatMessages([
        {
            role: ChatRole.MODEL,
            text: `Hi there! I'm ${freelancer.name}. Thanks for your interest. To start, could you please briefly describe your project?`
        }
    ]);
    setIsChatWidgetOpen(true);
  };

  const handleSendChatMessage = (text: string) => {
      const userMessage: ChatMessage = { role: ChatRole.USER, text };
      setChatMessages(prev => [...prev, userMessage]);
      setIsSendingMessage(true);
      
      // Simulate freelancer response
      setTimeout(() => {
          const freelancerResponse: ChatMessage = {
              role: ChatRole.MODEL,
              text: "Thanks for sharing. That sounds like an exciting project! What's your estimated budget or timeline?"
          };
          setChatMessages(prev => [...prev, freelancerResponse]);
          setIsSendingMessage(false);
      }, 1500);
  };
  
  const handleCloseChatWidget = () => {
      setIsChatWidgetOpen(false);
      // Delay clearing to allow for close animation
      setTimeout(() => {
          setChatWithFreelancer(null);
          setChatMessages([]);
      }, 300);
  };

  const handleBackgroundChange = (bg: Background) => {
      setBackground(bg);
      try {
          localStorage.setItem(BACKGROUND_KEY, JSON.stringify(bg));
      } catch (e) {
          console.error("Failed to save background to localStorage", e);
      }
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    const fallbackBgColor = theme === 'dark' ? '#0f172a' : '#f8fafc'; // slate-900 and slate-50

    if (!background || background.type === 'vanta') {
        return {}; // Vanta handles its own background
    }
    if (background.type === 'color') {
        return { backgroundColor: background.value };
    }
    if (background.type === 'image' || background.type === 'custom') {
        return {
            backgroundColor: fallbackBgColor,
            backgroundImage: `url(${background.value})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        };
    }
    return { backgroundColor: fallbackBgColor };
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setActiveView('dashboard');
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveView('home');
  };

  const navigate = (view: View) => {
    setActiveView(view);
    window.scrollTo(0, 0);
  };

  const renderContent = (): ReactNode => {
    switch(activeView) {
        case 'home':
            return (
                <>
                  <div id="home" className="pt-16"><Hero onGetStartedClick={() => setIsSignUpModalOpen(true)} /></div>
                  <div id="features"><Features /></div>
                  <div id="about"><About /></div>
                  <div id="contact"><Contact /></div>
                </>
            );
        case 'chatbot':
            return <Chatbot />;
        case 'dashboard':
            return <div className="pt-16"><Dashboard navigate={navigate} /></div>;
        case 'search':
            return <div className="pt-16"><Search /></div>;
        case 'knowledge':
            return <div className="pt-16"><KnowledgeHub /></div>;
        case 'hire':
            return <div className="pt-16"><HireUs onStartChat={handleStartChat} /></div>;
        case 'careers':
            return <div className="pt-16"><Careers /></div>;
        case 'help':
            return <div className="pt-16"><HelpCenter /></div>;
        default:
             return <div id="home" className="pt-16"><Hero onGetStartedClick={() => setIsSignUpModalOpen(true)} /></div>;
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Layer */}
      <div className="fixed inset-0 w-full h-full -z-10" style={getBackgroundStyle()}>
        {background.type === 'vanta' && <AnimatedBackground theme={theme} />}
      </div>
      
      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          activeView={activeView}
          isAuthenticated={isAuthenticated}
          onNavigate={navigate}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onSignUpClick={() => setIsSignUpModalOpen(true)}
          onLogout={handleLogout}
          onToggleAppearancePanel={() => setIsAppearancePanelOpen(prev => !prev)}
          onToggleNotificationsPanel={() => setIsNotificationsPanelOpen(prev => !prev)}
          onToggleLanguagePanel={() => setIsLanguagePanelOpen(prev => !prev)}
        />
        <main className={`flex-1 w-full ${activeView !== 'chatbot' ? 'container mx-auto px-4 sm:px-6 lg:px-8' : ''}`}>
          {renderContent()}
        </main>
        <Footer onNavigate={navigate} />

        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        <SignUpModal isOpen={isSignUpModalOpen} onClose={() => setIsSignUpModalOpen(false)} />
        <AppearancePanel 
          isOpen={isAppearancePanelOpen}
          onClose={() => setIsAppearancePanelOpen(false)}
          onBackgroundChange={handleBackgroundChange} 
          currentBackground={background} 
        />
        <NotificationsPanel
            isOpen={isNotificationsPanelOpen}
            onClose={() => setIsNotificationsPanelOpen(false)}
        />
        <LanguageSwitcher
            isOpen={isLanguagePanelOpen}
            onClose={() => setIsLanguagePanelOpen(false)}
        />
        <ChatWidget 
            isOpen={isChatWidgetOpen}
            onClose={handleCloseChatWidget}
            freelancer={chatWithFreelancer}
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
            isSending={isSendingMessage}
        />
      </div>
    </div>
  );
};

export default App;