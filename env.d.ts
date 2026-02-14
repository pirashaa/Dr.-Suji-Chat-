// Manually define ImportMetaEnv as vite/client types are missing
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Augment NodeJS namespace to type process.env without redeclaring 'process'
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    OPENAI_API_KEY: string;
    FIREBASE_CONFIG: string;
    [key: string]: string | undefined;
  }
}