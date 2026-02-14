
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  language: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled, language }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to allow shrinking
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Cap at specific height (200px) manually or via CSS max-height
      // We set style height to scrollHeight but constrained by CSS max-h
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-colors duration-200 relative z-20">
      
      <div className="max-w-4xl mx-auto flex items-end gap-3 relative z-10">
        <form 
          onSubmit={handleSubmit} 
          className="flex-1 flex items-end gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-500 transition-all"
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Dr.Suji about symptoms, diseases, or health advice..."
            className="flex-1 bg-transparent border-none resize-none focus:ring-0 min-h-[44px] max-h-[200px] py-3 px-3 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-base leading-relaxed scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600"
            rows={1}
            disabled={disabled}
            style={{ overflowY: text.length > 100 ? 'auto' : 'hidden' }}
          />
          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className={`
              h-11 w-11 flex items-center justify-center rounded-xl transition-all shrink-0 mb-0.5
              ${!text.trim() || disabled 
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                : 'bg-teal-600 text-white hover:bg-teal-500 shadow-md transform hover:scale-105 active:scale-95'}
            `}
            title="Send Message"
          >
            <Send size={20} className={text.trim() && !disabled ? "ml-0.5" : ""} />
          </button>
        </form>
      </div>
      <div className="text-center mt-3">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 select-none">
           Dr.Suji uses AI and may make mistakes. Always consult a real doctor for emergencies.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
