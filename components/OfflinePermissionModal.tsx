
import React, { useState, useEffect, useRef } from 'react';
import { DownloadCloud, WifiOff, X, AlertTriangle, CheckCircle, HardDrive, Clock } from 'lucide-react';
import { initializeLocalModel, hasLocalModel } from '../services/localLlmService';

interface OfflinePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadComplete: () => void;
}

const OfflinePermissionModal: React.FC<OfflinePermissionModalProps> = ({ isOpen, onClose, onDownloadComplete }) => {
  const [step, setStep] = useState<'permission' | 'downloading' | 'complete'>('permission');
  const [progressText, setProgressText] = useState("Initializing...");
  const [progressPercent, setProgressPercent] = useState(0);
  const [downloadedSize, setDownloadedSize] = useState("0.00");
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const startTimeRef = useRef<number>(0);
  const lastPercentRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      checkExisting();
    }
  }, [isOpen]);

  const checkExisting = async () => {
    const exists = await hasLocalModel();
    if (exists) {
      setStep('downloading');
      handleDownload();
    }
  };

  const parseProgress = (text: string) => {
    // Transformers.js progress string: "Downloading model.onnx: 45%"
    const percentMatch = text.match(/(\d+)%/);
    let currentPercent = 0;

    if (percentMatch) {
      currentPercent = parseInt(percentMatch[1]);
    }

    if (currentPercent > 0) {
      const now = Date.now();
      if (startTimeRef.current === 0) startTimeRef.current = now;
      
      // GB Calculation (~1.1GB for TinyLlama)
      const TOTAL_SIZE_GB = 1.1;
      const dl = (TOTAL_SIZE_GB * (currentPercent / 100)).toFixed(2);
      setDownloadedSize(dl);

      // Time Estimation
      const elapsed = (now - startTimeRef.current) / 1000;
      if (currentPercent > lastPercentRef.current && currentPercent < 100) {
        const rate = currentPercent / elapsed;
        const remainingPercent = 100 - currentPercent;
        const remainingSeconds = remainingPercent / rate;
        
        if (remainingSeconds < 60) {
          setTimeRemaining(`${Math.ceil(remainingSeconds)}s`);
        } else {
          setTimeRemaining(`${Math.ceil(remainingSeconds / 60)}m`);
        }
      }

      lastPercentRef.current = currentPercent;
      setProgressPercent(currentPercent);
    }
  };

  const handleDownload = async () => {
    setStep('downloading');
    setError(null);
    setProgressPercent(0);
    setDownloadedSize("0.00");
    startTimeRef.current = 0;
    lastPercentRef.current = 0;

    try {
      await initializeLocalModel((text) => {
        setProgressText(text);
        parseProgress(text);
      });
      setStep('complete');
      setTimeout(() => {
        onDownloadComplete();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to download model. Ensure you have ~1.5GB free space and WebGPU support.");
      setStep('permission');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <WifiOff className="text-teal-600 dark:text-teal-400" size={20} />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Enable Offline Mode</h2>
          </div>
          {step === 'permission' && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-6">
          {step === 'permission' && (
            <div className="space-y-4">
               <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                    <DownloadCloud size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Download AI Brain?</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      This feature downloads a <strong>~1.1 GB</strong> AI model (TinyLlama) to run locally on your device GPU. Works without internet.
                    </p>
                  </div>
               </div>

               <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <HardDrive size={14} /> <span>Req: ~1.2GB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} /> <span>Est: 2-4 mins</span>
                  </div>
               </div>

               {error && (
                 <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                   <AlertTriangle size={16} />
                   {error}
                 </div>
               )}

               <div className="flex gap-3 mt-4">
                 <button 
                   onClick={onClose}
                   className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleDownload}
                   className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2"
                 >
                   <DownloadCloud size={18} /> Download
                 </button>
               </div>
            </div>
          )}

          {step === 'downloading' && (
            <div className="space-y-6 text-center py-4">
               {/* Progress Circle */}
               <div className="relative w-24 h-24 mx-auto">
                 <svg className="w-full h-full transform -rotate-90">
                   <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                   <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={264} strokeDashoffset={264 - (264 * progressPercent) / 100} className="text-teal-500 transition-all duration-300" />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center flex-col">
                   <span className="text-xl font-bold text-slate-900 dark:text-white">{progressPercent}%</span>
                 </div>
               </div>

               {/* Text Stats */}
               <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Downloaded</p>
                    <p className="text-sm font-mono text-slate-900 dark:text-white">{downloadedSize} <span className="text-xs text-slate-400">/ 1.1 GB</span></p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Remaining</p>
                    <p className="text-sm font-mono text-slate-900 dark:text-white">{timeRemaining || "--"}</p>
                  </div>
               </div>

               <div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-mono px-4 truncate mb-2">
                   {progressText}
                 </p>
                 <button 
                   onClick={onClose} 
                   className="text-xs text-red-500 hover:text-red-600 underline"
                 >
                   Cancel Download
                 </button>
               </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Offline Ready!</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                The AI model has been verified and stored locally. You can now use Dr.Suji without an internet connection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflinePermissionModal;
