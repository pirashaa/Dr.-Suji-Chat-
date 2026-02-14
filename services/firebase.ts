import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Environment variable interface
interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// Get config from process.env (injected via vite.config.ts)
// process.env.FIREBASE_CONFIG is injected as a string JSON by Vite's define
const configInput = process.env.FIREBASE_CONFIG;

let rawConfig: FirebaseConfig | undefined;

try {
  if (typeof configInput === 'string') {
    // If it's a string (which it usually is via JSON.stringify in vite config), parse it
    rawConfig = JSON.parse(configInput);
  } else {
    // Fallback if it somehow comes through as an object
    rawConfig = configInput as unknown as FirebaseConfig;
  }
} catch (error) {
  console.error("Error parsing Firebase configuration:", error);
}

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

// Check if critical config exists
const hasValidConfig = rawConfig && rawConfig.apiKey && rawConfig.projectId;

if (hasValidConfig) {
  try {
    if (!getApps().length) {
      app = initializeApp(rawConfig!);
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
    console.log("🔥 Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.log("⚠️ No valid Firebase config found. Falling back to LocalStorage.");
}

export { db };