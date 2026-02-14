
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlusCircle, MessageSquare, Settings, Trash2, Cloud, CloudOff } from 'lucide-react';
import { storageService } from '../services/storageService';
import { ChatSession } from '../types';
import SettingsModal from './SettingsModal';
import { db } from '../services/firebase';

const Sidebar: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCloudEnabled, setIsCloudEnabled] = useState(!!db);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentSessionId = searchParams.get('session');

  const loadSessions = async () => {
    const data = await storageService.getSessions();
    setSessions(data);
    setIsCloudEnabled(!!db);
  };

  useEffect(() => {
    loadSessions();
    // Increase polling slightly to ensure sync but not overwhelm
    const interval = setInterval(loadSessions, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleNewChat = async () => {
    const newSession = await storageService.createSession();
    await loadSessions();
    navigate(`/?session=${newSession.id}`);
  };

  const handleSessionClick = (id: string) => {
    navigate(`/?session=${id}`);
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm("Delete this conversation?")) {
      const updatedSessions = sessions.filter(s => s.id !== id);
      setSessions(updatedSessions);

      if (id === currentSessionId) {
        navigate('/', { replace: true });
      }

      try {
        await storageService.deleteSession(id);
      } catch (error) {
        console.error("Failed to delete session:", error);
        loadSessions(); 
      }
    }
  };

  return (
    <>
      <div className="flex flex-col h-full bg-slate-900 text-slate-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 hidden md:block">
          <h1 className="text-xl font-bold text-teal-400 flex items-center gap-2">
            🩺 Dr.Suji Chat
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-slate-500">Simulating Thousands of Experts</p>
            {isCloudEnabled ? (
              <span className="flex items-center gap-1 text-[10px] text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded border border-green-900/30" title="Cloud Sync Active">
                <Cloud size={10} /> Sync
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700" title="Local Storage Only">
                <CloudOff size={10} /> Local
              </span>
            )}
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4 pb-2">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors shadow-lg bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/20"
          >
            <PlusCircle size={20} />
            New Consultation
          </button>
        </div>

        {/* History Header */}
        <div className="px-4 pt-2 pb-2 mt-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            History
          </h3>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {sessions.length === 0 && (
            <p className="px-4 text-sm text-slate-600 italic mt-2">No consultations yet.</p>
          )}
          {sessions.map((session) => {
            const isActive = currentSessionId === session.id;
            return (
                <div
                key={session.id}
                onClick={() => handleSessionClick(session.id)}
                className={`
                    group flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm relative select-none cursor-pointer border border-transparent
                    ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-300'}
                `}
                >
                
                <div className="flex items-center gap-3 overflow-hidden pr-8 relative w-full">
                    <MessageSquare size={16} className={`shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                    <span className="truncate">{session.title}</span>
                </div>
                
                <button
                    type="button"
                    onClick={(e) => handleDeleteSession(e, session.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 text-slate-500 hover:text-red-400 hover:bg-slate-900/80 rounded-full transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
                    title="Delete chat"
                >
                    <Trash2 size={16} />
                </button>
                </div>
            );
          })}
        </div>

        {/* Footer Settings */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-3 text-sm hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white"
          >
             <Settings size={18} /> 
             <span>Settings & Support</span>
          </button>
          <div className="px-3 mt-4 text-xs text-slate-600 space-y-1">
             <div className="font-medium text-slate-500">Developed by Pira Code</div>
          </div>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSettingsChanged={() => {
          loadSessions(); 
        }}
      />
    </>
  );
};

export default Sidebar;
