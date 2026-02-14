
import { ChatSession, Message, UserSettings, SUPPORTED_LANGUAGES, ModelType } from "../types";
import { v4 as uuidv4 } from 'uuid';
import { db } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

const STORAGE_KEY = 'dr_suji_sessions';
const SETTINGS_KEY = 'dr_suji_settings';

// Helper to detect browser language
const getSystemLanguage = (): string => {
  if (typeof navigator === 'undefined') return 'en-US';
  const lang = navigator.language;
  const exactMatch = SUPPORTED_LANGUAGES.find(l => l.code === lang);
  if (exactMatch) return exactMatch.code;
  const broadMatch = SUPPORTED_LANGUAGES.find(l => l.code.startsWith(lang.split('-')[0]));
  return broadMatch ? broadMatch.code : 'en-US';
};

const DEFAULT_SETTINGS: UserSettings = {
  useVoiceOutput: false,
  isSeniorMode: false,
  language: 'auto',
  theme: 'system',
  preferredModel: ModelType.GEMINI_FLASH,
  provider: 'gemini'
};

export const storageService = {
  // === CHAT HISTORY (Async: Firestore/Local) ===

  getSessions: async (): Promise<ChatSession[]> => {
    // 1. Try Firebase
    if (db) {
      try {
        const sessionsRef = collection(db, 'sessions');
        const q = query(sessionsRef, orderBy('lastUpdated', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as ChatSession);
      } catch (err) {
        console.error("Firestore read error, falling back to local:", err);
      }
    }

    // 2. Fallback to LocalStorage
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getSession: async (id: string): Promise<ChatSession | undefined> => {
    if (db) {
      try {
        const docRef = doc(db, 'sessions', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as ChatSession;
        }
      } catch (err) {
        console.error("Firestore get error:", err);
      }
    }

    // Fallback
    const data = localStorage.getItem(STORAGE_KEY);
    const sessions = data ? JSON.parse(data) : [];
    return sessions.find((s: ChatSession) => s.id === id);
  },

  createSession: async (): Promise<ChatSession> => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Consultation',
      messages: [],
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    if (db) {
      try {
        await setDoc(doc(db, 'sessions', newSession.id), newSession);
      } catch (err) {
        console.error("Firestore create error:", err);
      }
    }

    // Always update local for redundancy/offline potential or as fallback
    const data = localStorage.getItem(STORAGE_KEY);
    const sessions = data ? JSON.parse(data) : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newSession, ...sessions]));

    return newSession;
  },

  saveMessage: async (sessionId: string, message: Message) => {
    // We fetch the current session first to append properly
    // Optimistic update logic for UI is handled in ChatPage, this is persistence
    
    // Local Update first (Sync)
    const localData = localStorage.getItem(STORAGE_KEY);
    const sessions: ChatSession[] = localData ? JSON.parse(localData) : [];
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    let updatedTitle = undefined;

    if (sessionIndex !== -1) {
      sessions[sessionIndex].messages.push(message);
      sessions[sessionIndex].lastUpdated = Date.now();
      
      if (sessions[sessionIndex].messages.length === 1 && message.role === 'user') {
        updatedTitle = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
        sessions[sessionIndex].title = updatedTitle;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }

    // Firebase Update
    if (db) {
      try {
        const sessionRef = doc(db, 'sessions', sessionId);
        const docSnap = await getDoc(sessionRef);
        
        if (docSnap.exists()) {
          const currentData = docSnap.data() as ChatSession;
          const newMessages = [...currentData.messages, message];
          
          const updates: any = {
            messages: newMessages,
            lastUpdated: Date.now()
          };

          if (updatedTitle) {
            updates.title = updatedTitle;
          }

          await updateDoc(sessionRef, updates);
        }
      } catch (err) {
        console.error("Firestore update error:", err);
      }
    }
  },

  deleteSession: async (id: string) => {
    if (db) {
      try {
        await deleteDoc(doc(db, 'sessions', id));
      } catch (err) {
        console.error("Firestore delete error:", err);
      }
    }
    
    const data = localStorage.getItem(STORAGE_KEY);
    const sessions = data ? JSON.parse(data) : [];
    const filtered = sessions.filter((s: ChatSession) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  deleteAllSessions: async () => {
    if (db) {
      try {
        const sessionsRef = collection(db, 'sessions');
        const q = query(sessionsRef);
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      } catch (err) {
        console.error("Firestore delete all error:", err);
      }
    }
    
    localStorage.removeItem(STORAGE_KEY);
  },

  // === SETTINGS (Sync: LocalStorage only for speed) ===

  getSettings: (): UserSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) {
      // Merge with default to ensure new keys like isSeniorMode exist even in old data
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings: (settings: UserSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  clearAllLocalData: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  },

  resolveLanguage: (lang: string): string => {
    if (lang === 'auto' || !lang) return getSystemLanguage();
    return lang;
  }
};
