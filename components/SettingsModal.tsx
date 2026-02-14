
import React, { useEffect, useState } from 'react';
import { X, Globe, Volume2, Shield, FileText, Mail, ChevronRight, Moon, Sun, Monitor, ChevronDown, HelpCircle, Cpu, Trash2, AlertTriangle, WifiOff, LayoutGrid, HardDrive, Database, Accessibility, User, LogOut, LogIn, Download, Smartphone, Laptop } from 'lucide-react';
import { storageService } from '../services/storageService';
import { deleteLocalModel, hasLocalModel, getModelStorageUsage } from '../services/localLlmService';
import { UserSettings, SUPPORTED_LANGUAGES, ThemeOption, ModelType } from '../types';
import { Link, useNavigate } from 'react-router-dom';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSettingsChanged }) => {
  const [settings, setSettings] = useState<UserSettings>(storageService.getSettings());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [localModelSize, setLocalModelSize] = useState<string>("0 MB");
  const [hasOfflineModel, setHasOfflineModel] = useState(false);
  
  // Account State (Mock for UI demonstration)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showLoginInput, setShowLoginInput] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setSettings(storageService.getSettings());
      setShowDeleteConfirm(false);
      checkStorage();
      
      // Load mock user data if available
      const storedUser = localStorage.getItem('dr_suji_user');
      if (storedUser) {
        setIsLoggedIn(true);
        setUserEmail(storedUser);
      }
    }
  }, [isOpen]);

  const checkStorage = async () => {
    const exists = await hasLocalModel();
    setHasOfflineModel(exists);
    const usage = await getModelStorageUsage();
    // Convert to GB or MB
    if (usage > 1024 * 1024 * 1024) {
      setLocalModelSize((usage / (1024 * 1024 * 1024)).toFixed(2) + " GB");
    } else {
      setLocalModelSize((usage / (1024 * 1024)).toFixed(0) + " MB");
    }
  };

  const handleSave = (newSettings: UserSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
    onSettingsChanged();
  };

  const toggleVoiceOutput = () => {
    handleSave({ ...settings, useVoiceOutput: !settings.useVoiceOutput });
  };
  
  const toggleSeniorMode = () => {
    handleSave({ ...settings, isSeniorMode: !settings.isSeniorMode });
  };

  const handleLanguageChange = (code: string) => {
    handleSave({ ...settings, language: code });
  };

  const handleThemeChange = (theme: ThemeOption) => {
    handleSave({ ...settings, theme });
  };

  const handleModelChange = (model: string) => {
    let provider: any = 'gemini';
    if (model.startsWith('gpt')) provider = 'openai';
    if (model.includes('MLC')) provider = 'local';
    
    handleSave({ ...settings, preferredModel: model, provider: provider });
  };

  const executeClearHistory = async () => {
    try {
      await storageService.deleteAllSessions();
      onSettingsChanged(); 
      onClose();
      navigate('/', { replace: true });
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };
  
  const handleDeleteModel = async () => {
    if (window.confirm("Are you sure you want to delete the offline AI model? You will need to redownload it to use offline mode.")) {
       await deleteLocalModel();
       await checkStorage();
       // Switch back to cloud if we deleted the local model while it was selected
       if (settings.provider === 'local') {
          handleModelChange(ModelType.GEMINI_FLASH);
       }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userEmail.trim()) {
      localStorage.setItem('dr_suji_user', userEmail);
      setIsLoggedIn(true);
      setShowLoginInput(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dr_suji_user');
    setIsLoggedIn(false);
    setUserEmail("");
  };

  const handleDownloadApp = (platform: 'mobile' | 'desktop') => {
    const filename = platform === 'mobile' ? 'DrSuji_App_Installer.apk' : 'DrSuji_Desktop_Setup.exe';
    // Create a dummy blob to simulate the file download
    const blob = new Blob(["Simulated Installer File for Dr.Suji Chat"], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getLanguageName = (code: string) => {
    if (code === 'auto') return 'System Default';
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
      <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-sm md:max-w-md overflow-hidden flex flex-col max-h-[85vh] border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Settings</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Preferences & Support</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-8 bg-slate-50/50 dark:bg-slate-900/50 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          
          {/* Account Section */}
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <User size={14} className="text-teal-600 dark:text-teal-400" />
              <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Account
              </h3>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              {isLoggedIn ? (
                <div className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-xl">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">User Account</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail}</div>
                      <div className="flex items-center gap-1 mt-1">
                         <div className="w-2 h-2 rounded-full bg-green-500"></div>
                         <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Sync Active</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="p-4">
                   {!showLoginInput ? (
                     <div className="flex flex-col gap-3">
                        <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                          Sign in to sync your medical history across devices.
                        </p>
                        <button 
                          onClick={() => setShowLoginInput(true)}
                          className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-colors"
                        >
                          <LogIn size={16} /> Sign In / Register
                        </button>
                     </div>
                   ) : (
                     <form onSubmit={handleLogin} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
                          <input 
                            type="email" 
                            required
                            placeholder="name@example.com"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                          />
                        </div>
                        <div className="flex gap-2">
                           <button 
                             type="button" 
                             onClick={() => setShowLoginInput(false)}
                             className="flex-1 py-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                           >
                             Cancel
                           </button>
                           <button 
                             type="submit" 
                             className="flex-1 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg"
                           >
                             Continue
                           </button>
                        </div>
                     </form>
                   )}
                </div>
              )}
            </div>
          </section>

          <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />

          {/* AI Intelligence */}
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Cpu size={14} className="text-teal-600 dark:text-teal-400" />
              <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                AI Intelligence
              </h3>
            </div>
            
            <div className="relative group">
              <select
                value={settings.preferredModel}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all shadow-sm group-hover:border-slate-300 dark:group-hover:border-slate-700"
              >
                <optgroup label="Offline (Privacy Focused)">
                  <option value={ModelType.LOCAL_GEMMA}>Dr.Suji Offline (Browser Model)</option>
                </optgroup>
                <optgroup label="Cloud API (High Performance)">
                  <option value={ModelType.GEMINI_FLASH}>Gemini Flash (Fastest)</option>
                  <option value={ModelType.GEMINI_PRO}>Gemini Pro (Smartest)</option>
                  <option value={ModelType.GPT35}>OpenAI GPT-3.5</option>
                  <option value={ModelType.GPT4}>OpenAI GPT-4 Turbo</option>
                </optgroup>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                <ChevronDown size={14} />
              </div>
            </div>
            
            {settings.provider === 'local' ? (
              <div className="mt-3 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/20 flex gap-3 items-start">
                 <div className="p-1.5 bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                    <WifiOff size={14} />
                 </div>
                 <div className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                   <strong className="block font-bold mb-0.5">Offline Mode Active</strong> 
                   Runs entirely on your device GPU. Secure & Private.
                 </div>
              </div>
            ) : null}

            {/* Offline Storage Manager */}
            <div className="mt-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg">
                   <HardDrive size={14} />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Storage Usage</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{localModelSize} used</span>
                 </div>
               </div>
               
               {hasOfflineModel && (
                  <button 
                    onClick={handleDeleteModel}
                    className="px-3 py-1.5 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-100 dark:border-red-900/30"
                  >
                    Clear
                  </button>
               )}
            </div>
          </section>

          <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />

          {/* Accessibility Settings */}
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
               <Accessibility size={14} className="text-teal-600 dark:text-teal-400" />
               <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                 Accessibility
               </h3>
            </div>
            
            <div className="space-y-3">
              {/* Senior Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                      <Accessibility size={16} />
                   </div>
                   <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Senior Mode</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                         Larger text, high contrast
                      </div>
                   </div>
                </div>
                <button 
                  onClick={toggleSeniorMode}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/40
                    ${settings.isSeniorMode ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'}
                  `}
                >
                  <span 
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                      ${settings.isSeniorMode ? 'translate-x-6' : 'translate-x-1'}
                    `} 
                  />
                </button>
              </div>

              {/* Voice Output Toggle */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                      <Volume2 size={16} />
                   </div>
                   <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Auto-Read Response</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                         Text-to-speech in <span className="text-indigo-500 dark:text-indigo-400 font-semibold">{getLanguageName(settings.language)}</span>
                      </div>
                   </div>
                </div>
                <button 
                  onClick={toggleVoiceOutput}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/40
                    ${settings.useVoiceOutput ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'}
                  `}
                >
                  <span 
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                      ${settings.useVoiceOutput ? 'translate-x-6' : 'translate-x-1'}
                    `} 
                  />
                </button>
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />

          {/* Appearance & Language Grid */}
          <div className="grid grid-cols-1 gap-6">
              {/* Theme */}
              <section>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Sun size={14} className="text-teal-600 dark:text-teal-400" />
                  <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Appearance
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'Auto', icon: Monitor },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleThemeChange(option.id as ThemeOption)}
                      className={`
                        flex flex-col items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all
                        ${settings.theme === option.id 
                          ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}
                      `}
                    >
                      <option.icon size={14} />
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Language */}
              <section>
                 <div className="flex items-center gap-2 mb-3 px-1">
                    <Globe size={14} className="text-teal-600 dark:text-teal-400" />
                    <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Language
                    </h3>
                  </div>
                 <div className="relative group">
                    <select
                      value={settings.language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all shadow-sm"
                    >
                      <option value="auto">Auto (System Default)</option>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                      <ChevronDown size={14} />
                    </div>
                  </div>
              </section>
          </div>

           <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />

           {/* Legal & Support - List Layout */}
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <LayoutGrid size={14} className="text-teal-600 dark:text-teal-400" />
              <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Support & Legal
              </h3>
            </div>
            
            <div className="flex flex-col gap-2">
              {[
                { to: "/how-to-use", icon: HelpCircle, label: "User Guide", desc: "Tutorials & tips", color: "teal" },
                { to: "/contact", icon: Mail, label: "Contact Support", desc: "Get help & feedback", color: "blue" },
                { to: "/privacy", icon: Shield, label: "Privacy Policy", desc: "Data safety info", color: "purple" },
                { to: "/terms", icon: FileText, label: "Terms of Service", desc: "Usage rules", color: "amber" },
              ].map((item) => (
                <Link 
                  key={item.to}
                  to={item.to} 
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all group"
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    item.color === 'teal' ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400' :
                    item.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                    item.color === 'purple' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                    'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                  }`}>
                    <item.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.label}
                     </div>
                     <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                        {item.desc}
                     </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 shrink-0" />
                </Link>
              ))}
            </div>
          </section>

           <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />
           
           {/* App Download Section */}
           <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Download size={14} className="text-teal-600 dark:text-teal-400" />
              <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Get the App
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
               <button 
                 onClick={() => handleDownloadApp('mobile')}
                 className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/10 hover:border-teal-200 dark:hover:border-teal-800 transition-all group"
               >
                 <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/30 group-hover:text-teal-600 dark:group-hover:text-teal-400 mb-2">
                    <Smartphone size={20} />
                 </div>
                 <span className="text-xs font-bold text-slate-900 dark:text-white">Install App</span>
                 <span className="text-[10px] text-slate-500 dark:text-slate-400">iOS & Android</span>
               </button>
               
               <button 
                 onClick={() => handleDownloadApp('desktop')}
                 className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-800 transition-all group"
               >
                 <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2">
                    <Laptop size={20} />
                 </div>
                 <span className="text-xs font-bold text-slate-900 dark:text-white">Desktop</span>
                 <span className="text-[10px] text-slate-500 dark:text-slate-400">Win & Mac</span>
               </button>
            </div>
           </section>

           <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />

           {/* Data Management */}
           <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Database size={14} className="text-teal-600 dark:text-teal-400" />
              <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Data Management
              </h3>
            </div>
            
            <div className="space-y-3">
              {/* Clear History Button */}
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => {
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 dark:hover:border-red-900/30 transition-all group text-left"
                >
                   <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/30 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                   </div>
                   <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-red-700 dark:group-hover:text-red-400">Clear History</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Delete all local chats</div>
                   </div>
                </button>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-2 text-red-700 dark:text-red-400">
                    <AlertTriangle size={14} />
                    <span className="text-xs font-bold">Confirm Delete?</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                    <button onClick={executeClearHistory} className="flex-1 py-1.5 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm">Delete Everything</button>
                  </div>
                </div>
              )}
            </div>
           </section>

          {/* Developer Credit */}
          <div className="text-center pt-2">
            <p className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">
              Dr.Suji Chat v1.0.0 • Pira Code
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
