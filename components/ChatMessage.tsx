
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { Bot, User, Volume2, StopCircle, Copy, Check, Share2, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
  onStop: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isSpeaking, onSpeak, onStop }) => {
  const isBot = message.role === 'model';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dr.Suji Chat Advice',
          text: message.content,
        });
      } catch (err) {
        console.log('Share skipped');
      }
    } else {
      handleCopy();
    }
  };

  const toggleLike = () => setLiked(prev => (prev === true ? null : true));
  const toggleDislike = () => setLiked(prev => (prev === false ? null : false));

  // --- TRAFFIC LIGHT PARSING ---
  // We scan the message for [STATUS: RED], [STATUS: YELLOW], [STATUS: GREEN]
  // We extract it for a badge, then hide it from the main markdown render (optional)
  
  let trafficStatus: 'RED' | 'YELLOW' | 'GREEN' | null = null;
  let cleanContent = message.content;

  if (isBot) {
    if (message.content.includes('[STATUS: RED]')) {
      trafficStatus = 'RED';
      cleanContent = message.content.replace('[STATUS: RED]', '').trim();
    } else if (message.content.includes('[STATUS: YELLOW]')) {
      trafficStatus = 'YELLOW';
      cleanContent = message.content.replace('[STATUS: YELLOW]', '').trim();
    } else if (message.content.includes('[STATUS: GREEN]')) {
      trafficStatus = 'GREEN';
      cleanContent = message.content.replace('[STATUS: GREEN]', '').trim();
    }
  }

  return (
    <div className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'} mb-6`}>
      <div className={`flex max-w-full md:max-w-[95%] lg:max-w-[92%] gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`
          shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm mt-1
          ${isBot 
            ? 'bg-teal-100 text-teal-700 border border-teal-200 dark:bg-teal-900/40 dark:text-teal-400 dark:border-teal-800' 
            : 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800'}
        `}>
          {isBot ? <Bot size={20} /> : <User size={20} />}
        </div>

        {/* Bubble */}
        <div className={`
          relative p-4 md:p-6 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden w-full
          ${isBot 
            ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none' 
            : 'bg-blue-600 text-white dark:bg-blue-700 rounded-tr-none'}
        `}>
          
          {/* TRAFFIC LIGHT BADGE (Safety Layer) */}
          {isBot && trafficStatus === 'RED' && (
            <div className="mb-4 bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-3 animate-pulse">
               <AlertTriangle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={20} />
               <div>
                  <h4 className="font-bold text-red-700 dark:text-red-300">EMERGENCY DETECTED</h4>
                  <p className="text-xs text-red-600 dark:text-red-200 mt-1">This condition may require immediate medical attention.</p>
               </div>
            </div>
          )}
          {isBot && trafficStatus === 'YELLOW' && (
            <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-3">
               <Info className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
               <div>
                  <h4 className="font-bold text-amber-700 dark:text-amber-300">Medical Attention Recommended</h4>
                  <p className="text-xs text-amber-600 dark:text-amber-200 mt-1">Consult a doctor soon to rule out underlying issues.</p>
               </div>
            </div>
          )}
          {isBot && trafficStatus === 'GREEN' && (
            <div className="mb-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 flex items-start gap-3">
               <CheckCircle className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={20} />
               <div>
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-300">General Wellness Advice</h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-200 mt-1">Safe to manage at home with proper care.</p>
               </div>
            </div>
          )}

          {/* Message Content */}
          {isBot ? (
            <div className="markdown-body dark:text-slate-100 mb-2">
              <ReactMarkdown 
                components={{
                  strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-5 mb-3 text-teal-700 dark:text-teal-400" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 text-slate-800 dark:text-slate-200 leading-7" {...props} />,
                  li: ({node, ...props}) => <li className="text-slate-800 dark:text-slate-200 mb-1 ml-4" {...props} />,
                  // Wrap tables in a div for horizontal scrolling
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto my-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                      <table {...props} />
                    </div>
                  )
                }}
              >
                {cleanContent}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Bot Action Bar (Footer) */}
          {isBot && (
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={14} className="text-teal-500" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  title="Share response"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
              </div>

              {/* Feedback Buttons */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={toggleLike}
                  className={`p-1.5 rounded-lg transition-all ${liked === true ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' : 'text-slate-300 hover:text-teal-600 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  title="Helpful"
                >
                  <ThumbsUp size={14} className={liked === true ? 'fill-current' : ''} />
                </button>
                <button 
                  onClick={toggleDislike}
                  className={`p-1.5 rounded-lg transition-all ${liked === false ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-slate-300 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  title="Not helpful"
                >
                  <ThumbsDown size={14} className={liked === false ? 'fill-current' : ''} />
                </button>
              </div>
            </div>
          )}

          {/* Floating Voice Controls for Bot */}
          {isBot && (
            <div className="absolute top-3 right-3 flex gap-1">
              <button 
                onClick={() => isSpeaking ? onStop() : onSpeak(cleanContent)}
                className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-teal-600 dark:text-slate-500 dark:hover:text-teal-400 transition-colors shadow-sm border border-slate-100 dark:border-slate-700"
                title="Read aloud"
              >
                {isSpeaking ? <StopCircle size={14} className="text-red-500 fill-current" /> : <Volume2 size={14} />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
