
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { jsPDF } from 'jspdf';
import { Message, ChatSession, UserSettings, SUPPORTED_LANGUAGES, ModelType } from '../types';
import { storageService } from '../services/storageService';
import { generateMultiModelResponse } from '../services/aiService';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import OfflinePermissionModal from '../components/OfflinePermissionModal';
import EmergencyAlert from '../components/EmergencyAlert';
import { speakText, stopSpeaking } from '../services/voiceService';
import { Clock, DownloadCloud, StopCircle, Bot, Activity, Brain, Search, Database, Stethoscope, FileText, ShieldCheck, Sparkles, FileDown } from 'lucide-react';
import { EMERGENCY_KEYWORDS } from '../constants';

const EXAMPLE_PROMPTS = [
  "What are the early signs of diabetes?",
  "Create a diet plan for high blood pressure.",
  "I have a headache and stiff neck.",
  "How do I manage anxiety without medication?",
  "What foods are high in iron?",
  "How can I improve my sleep quality?",
  "Exercises for lower back pain.",
  "Symptoms of vitamin D deficiency?",
  "Is intermittent fasting safe?",
  "How to treat a burn at home?",
  "Signs of dehydration in adults.",
  "Best foods for heart health.",
  "How to stop a panic attack?",
  "Remedies for a sore throat.",
  "What causes sudden dizziness?",
  "Difference between cold and flu.",
  "How to lower cortisol levels?",
  "Meal plan for weight loss.",
  "Side effects of antibiotics?",
  "How to manage acid reflux?",
  "Signs of a migraine vs headache.",
  "Benefits of drinking lemon water.",
  "How to prevent kidney stones?",
  "What is the keto diet?",
  "Exercises to strengthen knees.",
  "How to reduce belly fat?",
  "Symptoms of thyroid issues.",
  "Natural remedies for nausea.",
  "How to quit smoking?",
  "What is sleep apnea?",
  "Foods to avoid with gout.",
  "How to improve posture?",
  "Signs of high blood sugar.",
  "Mental health tips for stress.",
  "How to treat a sprained ankle?",
  "What is the DASH diet?",
  "Causes of hair loss in women.",
  "How to boost immune system?",
  "Managing arthritis pain.",
  "What causes bad breath?",
  "Yoga for flexibility.",
  "How to lower triglycerides?",
  "Signs of lactose intolerance.",
  "Benefits of omega-3s.",
  "How to stop snoring?",
  "Dealing with seasonal allergies.",
  "What to eat before a workout?",
  "Early warning signs of stroke.",
  "How to manage IBS?",
  "Tips for healthy skin.",
  "Identifying skin cancer moles.",
  "What is gluten sensitivity?",
  "How to reduce screen time eye strain?",
  "Benefits of meditation.",
  "How to check my pulse?",
  "Foods that spike insulin.",
  "Natural ways to lower fever.",
  "What causes ringing in ears?",
  "How to improve digestion?",
  "Healthy snack ideas."
];

const THINKING_STEPS = [
  { text: "Analyzing symptoms & context...", icon: Search },
  { text: "Consulting medical knowledge base...", icon: Database },
  { text: "Reviewing specialist guidelines...", icon: Stethoscope },
  { text: "Formulating comprehensive advice...", icon: FileText },
  { text: "Checking preventive strategies...", icon: ShieldCheck }
];

const ChatPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Track loading state specifically for local model downloading
  const [localLoadProgress, setLocalLoadProgress] = useState<string | null>(null);
  
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>(storageService.getSettings());
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [sessionTitle, setSessionTitle] = useState<string>('New Consultation');
  
  // Offline Modal State
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  
  // Emergency Alert State
  const [isEmergencyAlertOpen, setIsEmergencyAlertOpen] = useState(false);

  // Random prompts state
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  
  // Thinking Animation State
  const [thinkingStep, setThinkingStep] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Guard against double session creation in StrictMode or re-renders
  const creatingSessionRef = useRef(false);

  // Initialize random prompts on mount & cleanup speech on unmount
  useEffect(() => {
    // Shuffle the example prompts and pick 4
    const shuffled = [...EXAMPLE_PROMPTS].sort(() => 0.5 - Math.random());
    setSuggestedPrompts(shuffled.slice(0, 4));

    // Cleanup speech when leaving chat page
    return () => {
      stopSpeaking();
    };
  }, []);

  // Cycle thinking steps
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setThinkingStep((prev) => (prev + 1) % THINKING_STEPS.length);
      }, 2000); 
      return () => clearInterval(interval);
    } else {
      setThinkingStep(0);
    }
  }, [isLoading]);

  // Poll for settings changes
  useEffect(() => {
    const checkSettings = () => {
       const saved = storageService.getSettings();
       // Deep compare
       if (JSON.stringify(saved) !== JSON.stringify(settings)) {
         setSettings(saved);
         // If user switched to local, we might need to check permissions/download
         if (saved.provider === 'local' && settings.provider !== 'local') {
           setIsOfflineModalOpen(true);
         }
       }
    };
    const interval = setInterval(checkSettings, 1000);
    return () => clearInterval(interval);
  }, [settings]);

  // Initial check if we boot up in offline mode
  useEffect(() => {
    const saved = storageService.getSettings();
    if (saved.provider === 'local') {
      setIsOfflineModalOpen(true);
    }
  }, []);

  // Initialize or load session (Async now)
  useEffect(() => {
    const initSession = async () => {
      if (!sessionId) {
        // Prevent multiple creations if one is already in progress
        if (creatingSessionRef.current) return;
        creatingSessionRef.current = true;

        const newSession = await storageService.createSession();
        setSearchParams({ session: newSession.id });
        
        // Reset ref after a delay to ensure params update propagated
        setTimeout(() => { creatingSessionRef.current = false; }, 1000);
      } else {
        const session = await storageService.getSession(sessionId);
        if (session) {
          setMessages(session.messages);
          setLastUpdated(session.lastUpdated);
          setSessionTitle(session.title);
        } else {
          // If session ID invalid, create new (guard applied here too)
          if (creatingSessionRef.current) return;
          creatingSessionRef.current = true;
          
          const newSession = await storageService.createSession();
          setSearchParams({ session: newSession.id });

          setTimeout(() => { creatingSessionRef.current = false; }, 1000);
        }
      }
    };
    initSession();
  }, [sessionId, setSearchParams]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, localLoadProgress]);

  // Function to export chat to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(13, 148, 136); // Teal 600
    doc.text("Dr.Suji Chat", margin, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text("Medical Consultation Report", margin, 26);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, 31);
    
    doc.line(margin, 36, pageWidth - margin, 36);

    let yPos = 46;

    // Content
    messages.forEach((msg) => {
       const isUser = msg.role === 'user';
       const roleName = isUser ? "Patient:" : "Dr.Suji AI:";
       
       // Role Label
       doc.setFontSize(11);
       doc.setFont("helvetica", "bold");
       doc.setTextColor(isUser ? 37 : 13, isUser ? 99 : 148, isUser ? 235 : 136); // Blue or Teal
       
       // Check page bounds
       if (yPos > 270) {
         doc.addPage();
         yPos = 20;
       }
       
       doc.text(roleName, margin, yPos);
       yPos += 6;

       // Content Body
       doc.setFont("helvetica", "normal");
       doc.setTextColor(51, 65, 85); // Slate 700
       doc.setFontSize(10);

       // Clean markdown for PDF basic text
       const cleanContent = msg.content
         .replace(/\*\*/g, '') // bold
         .replace(/#/g, '') // headers
         .replace(/`/g, '') // code
         .replace(/\n\n/g, '\n'); 

       const lines = doc.splitTextToSize(cleanContent, maxWidth);
       
       lines.forEach((line: string) => {
         if (yPos > 280) {
            doc.addPage();
            yPos = 20;
         }
         doc.text(line, margin, yPos);
         yPos += 5;
       });

       yPos += 8; // Spacing between messages
    });
    
    // Footer / Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const disclaimer = "DISCLAIMER: This report is generated by an AI assistant and is for informational purposes only. It does not constitute a medical diagnosis. Consult a qualified physician for medical advice.";
    const footerLines = doc.splitTextToSize(disclaimer, maxWidth);
    
    // Position at bottom of last page or new page
    if (yPos > 260) {
        doc.addPage();
        yPos = 20;
    }
    
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
    footerLines.forEach((line: string) => {
       doc.text(line, margin, yPos);
       yPos += 4;
    });

    doc.save(`DrSuji_Report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const handleSendMessage = async (content: string) => {
    if (!sessionId) return;

    // Emergency Check
    const lowerContent = content.toLowerCase();
    const isEmergency = EMERGENCY_KEYWORDS.some(k => lowerContent.includes(k));
    if (isEmergency) {
      setIsEmergencyAlertOpen(true);
    }

    // Check if offline modal needs to be shown (e.g. if we are local but it wasn't triggered yet)
    if (settings.provider === 'local' && !localLoadProgress) {
      // Just a safety check, usually the modal handles init.
    }

    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    
    // Optimistic Update
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLastUpdated(Date.now());
    await storageService.saveMessage(sessionId, userMsg);
    
    setIsLoading(true);
    setThinkingStep(0); // Reset animation
    setLocalLoadProgress(null);

    // Create a temporary bot message for streaming
    const botMsgId = uuidv4();
    const tempBotMsg: Message = {
      id: botMsgId,
      role: 'model',
      content: '', // Start empty
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, tempBotMsg]);

    try {
      const responseText = await generateMultiModelResponse(
        updatedMessages, 
        content, 
        settings,
        (progress) => {
          setLocalLoadProgress(progress);
        },
        (streamedText) => {
          // Update the specific message in state as data streams in
          setMessages((prev) => 
            prev.map(msg => 
              msg.id === botMsgId 
              ? { ...msg, content: streamedText }
              : msg
            )
          );
        }
      );

      // Finalize the message
      const finalBotMsg: Message = {
        id: botMsgId,
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
      };

      // Ensure state is perfectly consistent with final response
      setMessages((prev) => prev.map(msg => msg.id === botMsgId ? finalBotMsg : msg));
      setLastUpdated(Date.now());
      await storageService.saveMessage(sessionId, finalBotMsg);
      
      if (settings.useVoiceOutput) {
         handleSpeak(responseText, finalBotMsg.id);
      }
    } catch (error) {
      console.error("Critical AI Failure:", error);
      // If failed, remove the temp message or show error state?
      // For now, the error message from aiService likely returned a text error which we rendered.
      // If exception was thrown:
      setMessages((prev) => prev.filter(msg => msg.id !== botMsgId)); 
    } finally {
      setIsLoading(false);
      setLocalLoadProgress(null);
    }
  };

  const handleSpeak = (text: string, id: string) => {
    setCurrentSpeakingId(id);
    const lang = storageService.resolveLanguage(settings.language);
    speakText(text, lang, () => setCurrentSpeakingId(null));
  };

  const handleStopSpeak = () => {
    stopSpeaking();
    setCurrentSpeakingId(null);
  };

  const formatLastUpdated = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getLanguageName = (code: string) => {
    if (code === 'auto') return 'Auto (System)';
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name || 'English';
  };

  const getProgressPercent = (text: string | null) => {
    if (!text) return 0;
    const match = text.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  };

  const effectiveLanguage = storageService.resolveLanguage(settings.language);
  const CurrentThinkingIcon = THINKING_STEPS[thinkingStep].icon;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative transition-colors duration-200">
      
      {/* Offline Permission Modal */}
      <OfflinePermissionModal 
        isOpen={isOfflineModalOpen}
        onClose={() => {
          setIsOfflineModalOpen(false);
        }}
        onDownloadComplete={() => {
          setIsOfflineModalOpen(false);
        }}
      />

      {/* Emergency Alert Modal */}
      <EmergencyAlert 
        isOpen={isEmergencyAlertOpen}
        onClose={() => setIsEmergencyAlertOpen(false)}
      />
      
      {/* Session Header with Last Updated */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm z-10 sticky top-0 transition-colors duration-200">
        <div className="flex flex-col">
          <h2 className="font-bold text-slate-900 dark:text-white text-sm md:text-base truncate max-w-[200px] md:max-w-md">
            {sessionTitle}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Clock size={12} />
            <span>Last Updated: {formatLastUpdated(lastUpdated)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          
          {/* PDF Download Button */}
          {messages.length > 0 && (
            <button
              onClick={handleExportPDF}
              className="p-2 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hidden sm:flex"
              title="Download Medical Report (PDF)"
            >
              <FileDown size={20} />
            </button>
          )}

          {/* Global Stop Speaking Button */}
          {currentSpeakingId && (
            <button
              onClick={handleStopSpeak}
              className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors animate-pulse"
              title="Stop Speaking"
            >
               <StopCircle size={18} className="fill-current" />
            </button>
          )}

          <div className="text-xs font-semibold px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 hidden sm:block">
            {settings.provider === 'local' ? 'OFFLINE MODE' : settings.preferredModel.replace('-preview', '')}
          </div>
          <div className="text-xs font-semibold px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full border border-teal-100 dark:border-teal-800 hidden sm:block">
             {getLanguageName(settings.language)}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 mt-10 md:mt-0">
            <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/20 rounded-full flex items-center justify-center mb-6 text-teal-600 dark:text-teal-400 ring-4 ring-teal-50 dark:ring-teal-900/10">
              <span className="text-4xl">🩺</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Hello, I’m Dr. Suji Chat 👩‍⚕️</h2>
            <p className="max-w-md mb-8 text-slate-600 dark:text-slate-300 leading-relaxed">
              I simulate the collective intelligence of thousands of experts across diverse medical fields. Ask me anything about symptoms, 
              diseases, diet plans, or mental health.
            </p>
            {/* Display 4 random prompts from the 60 examples */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
              {suggestedPrompts.map((text) => (
                <button 
                  key={text}
                  onClick={() => handleSendMessage(text)}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-md transition-all text-sm font-medium text-left text-slate-700 dark:text-slate-200"
                >
                  "{text}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isSpeaking={currentSpeakingId === msg.id}
              onSpeak={(text) => handleSpeak(text, msg.id)}
              onStop={handleStopSpeak}
            />
          ))
        )}
        
        {/* Loading Indicator */}
        {isLoading && !messages[messages.length - 1]?.content && (
          <div className="flex justify-start mb-6 w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex gap-3 w-full max-w-2xl">
              <div className="shrink-0 w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm mt-1 animate-pulse">
                <Bot size={20} />
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm flex flex-col items-start gap-3 w-full sm:min-w-[320px]">
                
                {/* Header Phase */}
                <div className="flex items-center gap-3 w-full">
                  <div className="flex gap-1.5 shrink-0">
                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-[bounce_1s_infinite_0ms]"></span>
                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-[bounce_1s_infinite_200ms]"></span>
                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-[bounce_1s_infinite_400ms]"></span>
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                     <span className="text-sm font-bold text-teal-600 dark:text-teal-400 flex items-center gap-2">
                        <Sparkles size={14} className="animate-pulse" />
                        Dr.Suji is thinking...
                     </span>
                  </div>
                </div>
                
                {/* Dynamic Reasoning Step */}
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg w-full transition-all duration-300 border border-slate-100 dark:border-slate-700/50">
                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded-md text-teal-500 shadow-sm transition-all duration-500 transform">
                        <CurrentThinkingIcon size={16} className="animate-[pulse_2s_infinite]" />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium transition-opacity duration-300">
                        {THINKING_STEPS[thinkingStep].text}
                    </span>
                </div>

                {/* Progress Bar for Local Loading */}
                {!isOfflineModalOpen && localLoadProgress && (
                  <div className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 mt-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400">
                        <DownloadCloud size={14} className="animate-bounce" />
                        <span>Initializing AI Brain...</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{getProgressPercent(localLoadProgress)}%</span>
                    </div>
                    
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-300 ease-out rounded-full relative overflow-hidden"
                        style={{ width: `${getProgressPercent(localLoadProgress)}%` }}
                      >
                         <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_1.5s_infinite] -translate-x-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                       <Activity size={12} className="text-slate-400 animate-pulse" />
                       <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[250px] sm:max-w-md">
                         {localLoadProgress}
                       </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput onSend={handleSendMessage} disabled={isLoading} language={effectiveLanguage} />
    </div>
  );
};

export default ChatPage;
