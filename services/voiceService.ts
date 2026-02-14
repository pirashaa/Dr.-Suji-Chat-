
// Simple wrapper for Web Speech API

// Ensure voices are loaded (Chrome requirement)
let voicesLoaded = false;
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    voicesLoaded = true;
  };
}

// Keep a global reference to prevent garbage collection of the utterance during playback
let currentUtterance: SpeechSynthesisUtterance | null = null;

export const speakText = (
  text: string, 
  language: string = 'en-US',
  onEnd?: () => void,
  onStart?: () => void
) => {
  if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
  }
  
  // Cancel current speech immediately
  window.speechSynthesis.cancel();

  // Strip markdown for cleaner speech (basic regex for bold/headings/links)
  const cleanText = text
    .replace(/[*#_`]/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links keeping text
    .replace(/https?:\/\/\S+/g, '') // Remove raw URLs
    .replace(/⚠️/g, 'Warning: ')
    .replace(/🩺|💊|🥗/g, '');

  const utterance = new SpeechSynthesisUtterance(cleanText);
  currentUtterance = utterance; // Prevent GC

  utterance.rate = 1.0; 
  utterance.pitch = 1.0;
  utterance.lang = language;

  const selectVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    // 1. Google US English (Natural on Chrome)
    selectedVoice = voices.find(v => v.name === 'Google US English');
    
    // 2. Microsoft Zira (Natural on Windows)
    if (!selectedVoice) selectedVoice = voices.find(v => v.name.includes('Zira'));
    
    // 3. Samantha (Natural on Mac)
    if (!selectedVoice) selectedVoice = voices.find(v => v.name === 'Samantha');

    // 4. Any "Google" voice matching language
    if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith(language.split('-')[0]) && v.name.includes('Google'));
    }

    // 5. Any voice matching language exact
    if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang === language);
    }
    
    // 6. Any voice matching language broad
    if (!selectedVoice) {
         selectedVoice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  };

  // If voices aren't loaded yet, try to wait briefly or just select what we have
  if (!voicesLoaded && window.speechSynthesis.getVoices().length === 0) {
      // Retry once after small delay
      setTimeout(() => {
          selectVoice();
          startSpeaking();
      }, 50);
  } else {
      selectVoice();
      startSpeaking();
  }

  function startSpeaking() {
      utterance.onend = () => {
        if (onEnd) onEnd();
        currentUtterance = null;
      };
      
      utterance.onstart = () => {
        if (onStart) onStart();
      };
      
      utterance.onerror = (e) => {
        console.error("Speech synthesis error", e);
        // Ensure we clean up state even on error
        if (onEnd) onEnd(); 
        currentUtterance = null;
      };

      // Small delay to allow cancel to process completely
      setTimeout(() => {
         window.speechSynthesis.speak(utterance);
      }, 10);
  }
};

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
};

// Type definition for SpeechRecognition
interface IWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

interface ListeningOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onInterim?: (text: string) => void;
  onEnd?: () => void;
}

export const startListening = (
  onResult: (text: string) => void,
  onError: (error: any) => void,
  options: ListeningOptions = {}
): any => {
  const Win = window as unknown as IWindow;
  const SpeechRecognition = Win.SpeechRecognition || Win.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError("Speech recognition not supported in this browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = options.continuous ?? false;
  recognition.interimResults = options.interimResults ?? false;
  
  // Smart language detection
  let lang = options.language;
  if (!lang || lang === 'auto') {
    lang = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-US';
  }
  recognition.lang = lang;

  recognition.onresult = (event: any) => {
    let finalChunk = '';
    let interimChunk = '';
    
    // Build the transcript
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalChunk += event.results[i][0].transcript;
      } else {
        interimChunk += event.results[i][0].transcript;
      }
    }
    
    // Send final results
    if (finalChunk && onResult) {
       onResult(finalChunk);
    }

    // Send interim results if requested
    if (interimChunk && options.onInterim) {
       options.onInterim(interimChunk);
    }
  };

  recognition.onerror = (event: any) => {
    if (event.error === 'no-speech') return; 
    onError(event.error);
  };

  if (options.onEnd) {
    recognition.onend = options.onEnd;
  }

  try {
    recognition.start();
  } catch (e) {
    console.warn("Recognition already started", e);
  }
  
  return recognition;
};
