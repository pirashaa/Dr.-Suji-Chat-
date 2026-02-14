
import React from 'react';
import { MessageSquare, Mic, Volume2, Globe, Settings, Shield, HelpCircle, Bot, Zap, Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowToUsePage: React.FC = () => {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto overflow-y-auto h-full pb-20">
      
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 font-medium mb-6 transition-colors">
        <ArrowLeft size={20} />
        <span>Back to Chat</span>
      </Link>

      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
           <div className="p-3 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl">
             <HelpCircle size={32} />
           </div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Guide & Tutorials</h1>
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          Master Dr.Suji Chat with our comprehensive step-by-step guides to get the best medical insights.
        </p>
      </div>

      <div className="space-y-12">
        
        {/* Section 1: Quick Start */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap className="text-amber-500" /> Quick Start Guide
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                  <MessageSquare size={24} />
                </div>
                <h3 className="font-bold text-lg dark:text-white">1. Start a Consultation</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                Click <strong>"New Consultation"</strong> in the sidebar. Type your symptoms or health question in the input box at the bottom.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-xs text-slate-500 font-mono border border-slate-100 dark:border-slate-700">
                "I have a sharp pain in my lower back..."
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                  <Bot size={24} />
                </div>
                <h3 className="font-bold text-lg dark:text-white">2. Receive Analysis</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                Dr.Suji will analyze your input using insights derived from thousands of experts across diverse medical fields and provide a structured response including potential causes and home remedies.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Voice Features */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Mic className="text-red-500" /> Audio Features
          </h2>
          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <Volume2 size={18} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Audio Response (Text-to-Speech)</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    Dr.Suji can read responses aloud. You can enable <strong>Auto-Read</strong> in Settings, or click the speaker icon on any specific message.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Prompting Guide */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Heart className="text-rose-500" /> Best Practices for Medical AI
          </h2>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            To get the most accurate guidance, try to be specific. Here are examples of good vs. bad prompts.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-xl p-5">
              <h3 className="font-bold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                ❌ Too Vague
              </h3>
              <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                <li>"My stomach hurts."</li>
                <li>"I feel sick."</li>
                <li>"What should I eat?"</li>
              </ul>
            </div>

            <div className="border border-teal-200 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/10 rounded-xl p-5">
              <h3 className="font-bold text-teal-700 dark:text-teal-400 mb-3 flex items-center gap-2">
                ✅ Detailed & Helpful
              </h3>
              <ul className="space-y-2 text-sm text-teal-800 dark:text-teal-200">
                <li>"I have a sharp pain in my upper right stomach after eating fatty foods."</li>
                <li>"I have a fever of 38.5°C, sore throat, and body aches for 2 days."</li>
                <li>"Plan a low-sodium diet for a 60-year-old with hypertension."</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4: Settings */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Settings className="text-slate-500" /> Customization
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
            <p>
              Open the <strong>Settings</strong> menu from the sidebar to customize your experience:
            </p>
            <ul className="grid md:grid-cols-2 gap-4 list-none pl-0 mt-4">
              <li className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <Globe className="shrink-0 text-teal-500" />
                <span><strong>Language:</strong> Choose from over 50 languages (English, Tamil, Spanish, etc.). The AI will reply and speak in this language.</span>
              </li>
              <li className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <Volume2 className="shrink-0 text-teal-500" />
                <span><strong>Auto-Read:</strong> Toggle this to have every response read aloud automatically (great for accessibility).</span>
              </li>
              <li className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <Settings className="shrink-0 text-teal-500" />
                <span><strong>Theme:</strong> Switch between Light, Dark, or System mode to suit your environment.</span>
              </li>
              <li className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <Shield className="shrink-0 text-teal-500" />
                <span><strong>Data:</strong> Clear your local chat history anytime for privacy.</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HowToUsePage;
