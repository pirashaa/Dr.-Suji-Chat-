
import React from 'react';
import { AlertTriangle, Phone, X } from 'lucide-react';

interface EmergencyAlertProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border-2 border-red-500">
        <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3 text-white">
              <AlertTriangle size={28} className="animate-pulse" />
              <h2 className="text-xl font-bold uppercase tracking-wider">Critical Warning</h2>
           </div>
           <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
             <X size={24} />
           </button>
        </div>
        
        <div className="p-8 text-center">
           <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
             Are you experiencing a medical emergency?
           </h3>
           <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg leading-relaxed">
             Dr. Suji Chat is an AI assistant and <strong>cannot</strong> provide emergency medical help. If you or someone else is in danger, please call emergency services immediately.
           </p>
           
           <div className="flex flex-col gap-4">
             <a 
               href="tel:911" 
               className="flex items-center justify-center gap-3 w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
             >
               <Phone size={24} />
               Call Emergency Services (911/112)
             </a>
             <button 
               onClick={onClose}
               className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium py-2"
             >
               I understand, continue to chat
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlert;
