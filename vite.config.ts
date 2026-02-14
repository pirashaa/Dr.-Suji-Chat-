import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    build: {
      target: 'esnext' // Required for top-level await and WebGPU
    },
    // Security headers for WebGPU
    server: {
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      }
    },
    resolve: {
      // Alias node modules to avoid bundling errors in browser
      alias: {
        'fs': 'rollup-plugin-node-polyfills/polyfills/empty',
        'path': 'rollup-plugin-node-polyfills/polyfills/path',
        'url': 'rollup-plugin-node-polyfills/polyfills/url',
      }
    },
    define: {
      // Strictly define ONLY specific keys to avoid confusing libraries that check for process.env
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.VITE_API_KEY || ''),
      'process.env.OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY || ''),
      'process.env.FIREBASE_CONFIG': JSON.stringify({
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.VITE_FIREBASE_APP_ID
      })
    }
  };
});