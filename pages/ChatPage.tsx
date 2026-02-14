
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
import { Clock, DownloadCloud, StopCircle, Bot, Activity, Brain, Search, Database, Stethoscope, FileText, ShieldCheck, Sparkles, FileDown, Trash2 } from 'lucide-react';
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
  "Healthy snack ideas.",
  "What are the symptoms of appendicitis?",
  "How to treat a bee sting?",
  "Is it safe to exercise while sick?",
  "Foods to avoid during pregnancy.",
  "What causes muscle cramps at night?",
  "How to lower cholesterol naturally?",
  "Signs of iron deficiency anemia.",
  "Best exercises for sciatic nerve pain.",
  "How to get rid of dandruff?",
  "What is the Mediterranean diet?",
  "Symptoms of food poisoning.",
  "How to measure blood pressure at home?",
  "Natural remedies for constipation.",
  "What causes heart palpitations?",
  "Tips for better mental focus.",
  "How to treat acne scars.",
  "Signs of gum disease.",
  "What is metabolic syndrome?",
  "Benefits of green tea.",
  "How to manage chronic fatigue?",
  "What are the stages of sleep?",
  "How to prevent osteoporosis?",
  "Symptoms of a urinary tract infection (UTI).",
  "How to treat a nosebleed.",
  "What foods are high in fiber?",
  "Causes of dry eyes.",
  "How to boost metabolism.",
  "What is vertigo?",
  "Signs of depression in teenagers.",
  "How to relieve sinus congestion.",
  "Benefits of turmeric and curcumin.",
  "What is the difference between type 1 and type 2 diabetes?",
  "How to treat a sunburn.",
  "What causes swollen ankles?",
  "Foods that help with inflammation.",
  "How to improve lung capacity.",
  "What is leaky gut syndrome?",
  "Signs of a panic attack.",
  "How to lower blood sugar quickly.",
  "Best sources of plant-based protein.",
  "What is the glycemic index?",
  "How to treat fungal nail infections.",
  "Symptoms of kidney infection.",
  "How to improve blood circulation.",
  "What causes excessive sweating?",
  "Natural remedies for insomnia.",
  "How to do CPR.",
  "What is endometriosis?",
  "Signs of hormonal imbalance.",
  "How to reduce salt intake.",
  "Benefits of probiotics.",
  "What causes joint stiffness?",
  "How to treat a fever blister.",
  "What is shingles?",
  "Symptoms of pneumonia.",
  "How to prevent deep vein thrombosis (DVT).",
  "What is a deviated septum?",
  "How to treat eczema flare-ups.",
  "Signs of liver damage.",
  "What foods contain probiotics?",
  "How to manage social anxiety.",
  "What is fibromyalgia?",
  "How to treat a blister.",
  "Symptoms of gallstones.",
  "How to improve memory.",
  "What is tinnitus?",
  "Signs of heat exhaustion.",
  "How to treat poison ivy.",
  "What causes chest tightness?",
  "Benefits of magnesium.",
  "How to stop hiccups.",
  "What is rosacea?",
  "Symptoms of mono (mononucleosis).",
  "How to prevent cavities.",
  "What causes bad cholesterol?",
  "How to treat a sty in the eye.",
  "What is psoriasis?",
  "Signs of an allergic reaction.",
  "How to remove a tick.",
  "What is sleep hygiene?",
  "Symptoms of carpal tunnel syndrome.",
  "How to strengthen your core.",
  "What causes restless leg syndrome?",
  "Benefits of drinking water.",
  "How to treat a toothache.",
  "What is prediabetes?",
  "Signs of low testosterone.",
  "How to improve gut health.",
  "What causes blurred vision?",
  "How to treat chapped lips.",
  "What is anemia?",
  "Symptoms of bronchitis.",
  "How to prevent athlete's foot.",
  "What causes dark circles under eyes?",
  "Benefits of apple cider vinegar.",
  "How to treat a bruise.",
  "What is celiac disease?",
  "Signs of eating disorders.",
  "How to manage anger.",
  "What causes ear infections?",
  "How to improve balance.",
  "What is a rotator cuff injury?",
  "Symptoms of pink eye (conjunctivitis).",
  "How to prevent flu.",
  "What causes hair thinning?",
  "Benefits of ginger.",
  "How to treat a corn or callus.",
  "What is lupus?",
  "Signs of chronic stress.",
  "How to improve flexibility.",
  "What causes cold hands and feet?",
  "How to treat a hangover.",
  "What is neuropathy?",
  "Symptoms of appendicitis in kids.",
  "How to prevent varicose veins.",
  "What causes bloating after eating?",
  "Benefits of yoga.",
  "How to treat a canker sore.",
  "What is hypothermia?",
  "Signs of a concussion.",
  "How to improve mood naturally.",
  "What causes frequent urination?",
  "How to treat a black eye.",
  "What is glaucoma?",
  "Symptoms of Crohn's disease.",
  "How to prevent back pain.",
  "What causes skin tags?",
  "Benefits of dark chocolate.",
  "How to treat an ingrown toenail.",
  "What is meningitis?",
  "Signs of sepsis.",
  "How to improve cardiovascular endurance.",
  "What causes night sweats?",
  "How to treat a chemical burn.",
  "What is autoimmune disease?",
  "Symptoms of ulcerative colitis.",
  "How to prevent wrinkles.",
  "What causes dry mouth?",
  "Benefits of avocado.",
  "How to treat a muscle strain.",
  "What is histamine intolerance?",
  "Signs of burnout.",
  "How to manage seasonal affective disorder?",
  "What are the benefits of walking daily?",
  "Foods to help with muscle recovery.",
  "Signs of dehydration in children.",
  "How to treat a splinter.",
  "Symptoms of scarlet fever.",
  "How to remove ear wax safely.",
  "What is the BRAT diet?",
  "Signs of a concussion in children.",
  "How to treat a jellyfish sting.",
  "Benefits of drinking coconut water.",
  "What causes leg cramps?",
  "How to improve grip strength.",
  "Symptoms of heat stroke vs heat exhaustion.",
  "Natural remedies for tooth pain.",
  "What is sleep paralysis?",
  "How to prevent motion sickness.",
  "Signs of OCD.",
  "Benefits of cold showers.",
  "What causes brittle nails?",
  "How to treat a spider bite.",
  "Symptoms of rabies in humans.",
  "What is deep breathing?",
  "Signs of B12 deficiency.",
  "How to improve focus without caffeine.",
  "What causes eye twitching?",
  "Benefits of oatmeal.",
  "How to treat a jammed finger.",
  "Symptoms of rubella.",
  "How to prevent chafing.",
  "What is impetigo?",
  "Signs of whooping cough.",
  "How to manage wrist pain.",
  "Benefits of stretching.",
  "What causes white spots on nails?",
  "How to treat a paper cut.",
  "Symptoms of tetanus.",
  "How to prevent ingrown hairs.",
  "What is a panic disorder?",
  "Signs of ADHD in adults.",
  "How to improve wrist flexibility.",
  "Benefits of swimming.",
  "What causes cracked heels?",
  "How to soothe a crying baby.",
  "Symptoms of chickenpox.",
  "How to prevent blisters when running.",
  "What is a stress fracture?",
  "Signs of dyslexia.",
  "How to improve ankle stability.",
  "Benefits of cycling.",
  "What causes yellow teeth?",
  "How to treat a mosquito bite.",
  "Symptoms of measles.",
  "How to prevent shin splints.",
  "What is tendinitis?",
  "Signs of autism in toddlers.",
  "How to improve handwriting ergonomics.",
  "Benefits of hiking.",
  "What causes dark elbows?",
  "How to treat a cut lip.",
  "Symptoms of mumps.",
  "How to prevent runner's knee.",
  "What is bursitis?",
  "Signs of bipolar disorder.",
  "How to improve shoulder mobility.",
  "Benefits of jumping rope.",
  "What causes puffy eyes?",
  "How to treat a scraped knee.",
  "Symptoms of hand, foot, and mouth disease.",
  "How to prevent tennis elbow.",
  "What is scoliosis?",
  "Signs of schizophrenia.",
  "How to improve hip flexibility.",
  "Benefits of pilates.",
  "What causes dry skin in winter?",
  "How to treat a stubbed toe.",
  "Symptoms of fifth disease.",
  "How to prevent plantar fasciitis.",
  "What is kyphosis?",
  "Signs of eating too much sugar.",
  "How to improve neck mobility.",
  "Benefits of resistance training.",
  "What causes oily skin?",
  "How to treat a smashed finger.",
  "Symptoms of croup.",
  "How to prevent lower back pain while sitting.",
  "What is lordosis?",
  "Signs of caffeine overdose.",
  "How to improve reaction time.",
  "Benefits of tai chi.",
  "What causes split ends?",
  "How to treat a friction burn.",
  "Symptoms of RSV.",
  "How to prevent computer vision syndrome.",
  "What is sciatica?",
  "Signs of nicotine withdrawal.",
  "How to improve lung health.",
  "Benefits of sauna."
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
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
    // Helper to add footer with pagination and disclaimer
    const addFooter = (pageNo: number) => {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150); // Gray
        
        // Page Number
        doc.text(`Page ${pageNo}`, pageWidth - margin - 15, pageHeight - 10);
        
        // Disclaimer (Multi-line)
        const disclaimer = "DISCLAIMER: This report is generated by Dr.Suji AI. It is for informational purposes only and does not constitute a medical diagnosis or professional medical advice. Always consult a qualified healthcare provider for medical concerns.";
        const footerLines = doc.splitTextToSize(disclaimer, maxWidth - 20); 
        doc.text(footerLines, margin, pageHeight - 15);
    };

    // Header (First Page)
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(13, 148, 136); // Teal 600
    doc.text("Dr.Suji Chat", margin, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text("Medical Consultation Report", margin, 26);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 31);
    
    doc.setDrawColor(203, 213, 225); // Slate 300 line
    doc.setLineWidth(0.5);
    doc.line(margin, 36, pageWidth - margin, 36);

    let yPos = 46;
    let pageNum = 1;

    // Iterate Messages
    messages.forEach((msg) => {
       const isUser = msg.role === 'user';
       const roleName = isUser ? "Patient" : "Dr.Suji AI";
       const roleColor: [number, number, number] = isUser ? [59, 130, 246] : [13, 148, 136]; // Blue / Teal

       // Clean Markdown and format text
       let cleanContent = msg.content
         .replace(/\*\*/g, '')      // Remove bold syntax
         .replace(/###/g, '')       // Remove H3
         .replace(/##/g, '')        // Remove H2
         .replace(/#/g, '')         // Remove H1
         .replace(/`/g, '')         // Remove code ticks
         .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
         .replace(/!\[.*?\]\(.*?\)/g, '[Image]') // Remove images
         .replace(/\n\n/g, '\n');   // Reduce double newlines

       // Indent lists
       cleanContent = cleanContent.replace(/^\s*-\s/gm, '  • ');

       const contentLines = doc.splitTextToSize(cleanContent, maxWidth);
       const requiredHeight = 10 + (contentLines.length * 5) + 10; // Header + body + spacing

       // Check if we need a new page
       if (yPos + requiredHeight > pageHeight - 25) { 
         addFooter(pageNum);
         doc.addPage();
         pageNum++;
         yPos = 20;
       }
       
       // Draw Role Header
       doc.setFontSize(11);
       doc.setFont("helvetica", "bold");
       doc.setTextColor(...roleColor);
       doc.text(roleName, margin, yPos);
       yPos += 6;
       
       // Draw Content
       doc.setFontSize(10);
       doc.setFont("helvetica", "normal");
       doc.setTextColor(51, 65, 85); // Slate 700
       
       contentLines.forEach((line: string) => {
         // Safety check for overflow within a single long message
         if (yPos > pageHeight - 25) {
             addFooter(pageNum);
             doc.addPage();
             pageNum++;
             yPos = 20;
         }
         doc.text(line, margin, yPos);
         yPos += 5;
       });

       yPos += 8; // Spacing between messages
    });
    
    // Footer on the last page
    addFooter(pageNum);
    
    doc.save(`DrSuji_Medical_Report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const handleClearChat = async () => {
    if (!sessionId || messages.length === 0) return;
    
    if (window.confirm("Are you sure you want to clear this conversation? This action cannot be undone.")) {
      await storageService.clearSessionMessages(sessionId);
      setMessages([]);
      setLastUpdated(Date.now());
    }
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
              className="p-2 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex"
              title="Download Medical Report (PDF)"
            >
              <FileDown size={20} />
            </button>
          )}

          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex"
              title="Clear Conversation"
            >
              <Trash2 size={20} />
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
            {/* Display 4 random prompts from the examples */}
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
