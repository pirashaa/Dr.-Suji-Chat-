
import { Message, UserSettings } from "../types";
import { generateGeminiResponse } from "./geminiService";
import { generateOpenAIResponse } from "./openaiService";
import { generateLocalResponse } from "./localLlmService";
import { storageService } from "./storageService";

// Helper to check if a key appears valid (non-empty)
const hasKey = (key: string | undefined | null) => !!key && key.trim().length > 0 && key !== '""';

export const generateMultiModelResponse = async (
  history: Message[],
  userMessage: string,
  settings: UserSettings,
  onLocalProgress?: (status: string) => void,
  onStream?: (text: string) => void
): Promise<string> => {
  const { provider, preferredModel, language: rawLanguage } = settings;
  const language = storageService.resolveLanguage(rawLanguage);
  
  // 1. Check for Local Provider Request
  if (provider === 'local') {
    try {
      return await generateLocalResponse(history, userMessage, language, onLocalProgress, onStream);
    } catch (localError: any) {
      console.error("Local model failed:", localError);
      return `⚠️ **Offline Mode Error:** \n${localError.message}\n\nPlease ensure your browser supports WebGPU (Chrome/Edge Desktop recommended) or switch back to Cloud Mode in settings.`;
    }
  }

  // 2. Cloud Providers (Gemini/OpenAI) Logic
  const isOpenAIPrimary = provider === 'openai' || preferredModel.startsWith('gpt');
  
  let primaryFn: () => Promise<string>;
  let fallbackFn: () => Promise<string>;
  let primaryName: string;
  let fallbackName: string;

  if (isOpenAIPrimary) {
    primaryName = 'OpenAI';
    primaryFn = () => generateOpenAIResponse(history, userMessage, preferredModel, language, onStream);
    
    fallbackName = 'Gemini';
    fallbackFn = () => generateGeminiResponse(history, userMessage, language, 'gemini-3-flash-preview', onStream);
  } else {
    primaryName = 'Gemini';
    primaryFn = () => generateGeminiResponse(history, userMessage, language, preferredModel, onStream);
    
    fallbackName = 'OpenAI';
    fallbackFn = () => generateOpenAIResponse(history, userMessage, 'gpt-3.5-turbo', language, onStream);
  }

  try {
    // Attempt Primary
    return await primaryFn();
  } catch (primaryError: any) {
    console.warn(`Primary model (${primaryName}) failed:`, primaryError.message || primaryError);
    
    // Check if we can fallback
    const geminiKey = process.env.API_KEY;
    const openAIKey = process.env.OPENAI_API_KEY;

    let canFallback = false;

    // Verify fallback key availability
    if (fallbackName === 'Gemini' && hasKey(geminiKey)) {
      canFallback = true;
    } else if (fallbackName === 'OpenAI' && hasKey(openAIKey)) {
      canFallback = true;
    }

    if (canFallback) {
      console.log(`Attempting fallback to ${fallbackName}...`);
      try {
        return await fallbackFn();
      } catch (fallbackError: any) {
        console.error(`Fallback model (${fallbackName}) also failed:`, fallbackError.message || fallbackError);
      }
    } else {
      console.warn(`Cannot fallback to ${fallbackName}: Missing API Key or configuration.`);
    }

    // Final failure message if both fail
    return `⚠️ **System Alert:** I am currently unable to connect to the medical knowledge base.
    
**Diagnostics:**
- **Primary System (${primaryName}):** Encountered an error.
- **Backup System (${fallbackName}):** ${canFallback ? 'Also unavailable' : 'Not configured or missing API key'}.

Please check your internet connection or switch to **Offline Mode** in settings to use the browser-based AI.`;
  }
};
