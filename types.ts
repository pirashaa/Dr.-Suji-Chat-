
export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  lastUpdated: number;
}

export type AIProvider = 'gemini' | 'openai' | 'local';

export enum ModelType {
  GEMINI_FLASH = 'gemini-3-flash-preview',
  GEMINI_PRO = 'gemini-3-pro-preview',
  GPT4 = 'gpt-4-turbo',
  GPT35 = 'gpt-3.5-turbo',
  LOCAL_GEMMA = 'gemma-2-2b-it-q4f32_1-MLC'
}

export type ThemeOption = 'light' | 'dark' | 'system';

export interface UserSettings {
  useVoiceOutput: boolean;
  isSeniorMode: boolean; // New Accessibility Feature
  language: string;
  theme: ThemeOption;
  preferredModel: string;
  provider: AIProvider;
}

export interface OfflineModelStatus {
  isDownloaded: boolean;
  downloadProgress: number; // 0 to 100
  downloadText: string;
  totalSize: string; // e.g. "1.4 GB"
  isDownloading: boolean;
  error?: string;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'af-ZA', name: 'Afrikaans' },
  { code: 'am-ET', name: 'Amharic' },
  { code: 'ar-SA', name: 'Arabic' },
  { code: 'bg-BG', name: 'Bulgarian' },
  { code: 'bn-BD', name: 'Bengali' },
  { code: 'ca-ES', name: 'Catalan' },
  { code: 'cs-CZ', name: 'Czech' },
  { code: 'da-DK', name: 'Danish' },
  { code: 'de-DE', name: 'German' },
  { code: 'el-GR', name: 'Greek' },
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'et-EE', name: 'Estonian' },
  { code: 'fa-IR', name: 'Persian' },
  { code: 'fi-FI', name: 'Finnish' },
  { code: 'fil-PH', name: 'Filipino' },
  { code: 'fr-FR', name: 'French' },
  { code: 'gu-IN', name: 'Gujarati' },
  { code: 'he-IL', name: 'Hebrew' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'hr-HR', name: 'Croatian' },
  { code: 'hu-HU', name: 'Hungarian' },
  { code: 'id-ID', name: 'Indonesian' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'kn-IN', name: 'Kannada' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'lt-LT', name: 'Lithuanian' },
  { code: 'lv-LV', name: 'Latvian' },
  { code: 'ml-IN', name: 'Malayalam' },
  { code: 'mr-IN', name: 'Marathi' },
  { code: 'ms-MY', name: 'Malay' },
  { code: 'nl-NL', name: 'Dutch' },
  { code: 'no-NO', name: 'Norwegian' },
  { code: 'pl-PL', name: 'Polish' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)' },
  { code: 'ro-RO', name: 'Romanian' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'sk-SK', name: 'Slovak' },
  { code: 'sl-SI', name: 'Slovenian' },
  { code: 'sr-RS', name: 'Serbian' },
  { code: 'sv-SE', name: 'Swedish' },
  { code: 'sw-KE', name: 'Swahili' },
  { code: 'ta-IN', name: 'Tamil' },
  { code: 'te-IN', name: 'Telugu' },
  { code: 'th-TH', name: 'Thai' },
  { code: 'tr-TR', name: 'Turkish' },
  { code: 'uk-UA', name: 'Ukrainian' },
  { code: 'ur-PK', name: 'Urdu' },
  { code: 'vi-VN', name: 'Vietnamese' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
];
