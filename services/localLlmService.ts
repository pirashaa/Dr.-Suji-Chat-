
import { pipeline, env } from "@huggingface/transformers";
import { Message } from "../types";
import { DR_SUJI_SYSTEM_INSTRUCTION } from "../constants";

// 1. Fix BigInt Serialization globally for this module context
// This prevents "Do not know how to serialize a BigInt" when logging objects containing tokens
if (!('toJSON' in BigInt.prototype)) {
  (BigInt.prototype as any).toJSON = function () { return this.toString(); };
}

// 2. Use a stable model architecture for WebGPU
// TinyLlama 1.1B Chat is robust, fits in ~1.1GB.
const MODEL_ID = "Xenova/TinyLlama-1.1B-Chat-v1.0"; 

// 3. Configure Transformers.js Environment
env.allowLocalModels = false; 
env.useBrowserCache = true;

// Disable proxying to avoid structured cloning issues with complex GPU buffers
// Safety check to prevent TypeScript build errors if types imply undefined
// We use a temporary variable to allow TypeScript to narrow the type safely
const onnxBackend = env.backends?.onnx;
if (onnxBackend?.wasm) {
  onnxBackend.wasm.proxy = false; 
}

let generator: any = null;
let isInitializing = false;

// --- Storage & Detection ---

export const hasLocalModel = async (): Promise<boolean> => {
  if (!('caches' in window)) return false;
  try {
    const cache = await caches.open('transformers-cache');
    const keys = await cache.keys();
    // Check if we have the specific model file (onnx)
    const hasModel = keys.some(key => key.url.includes('TinyLlama-1.1B-Chat') && key.url.endsWith('.onnx'));
    return hasModel;
  } catch (e) {
    console.error("Error checking local model:", e);
    return false;
  }
};

export const deleteLocalModel = async (): Promise<void> => {
  if (generator) {
    generator = null;
  }
  if ('caches' in window) {
    await caches.delete('transformers-cache');
    console.log("Offline model data deleted.");
  }
};

export const getModelStorageUsage = async (): Promise<number> => {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  return 0;
};

// --- WebGPU Engine ---

export const initializeLocalModel = async (
  onProgress: (progress: string) => void
): Promise<void> => {
  if (generator) return; 
  if (isInitializing) return;

  isInitializing = true;
  
  try {
    const progressCallback = (data: any) => {
      // data: { status: 'progress', file: '...', progress: 99.9, ... }
      if (data.status === 'progress') {
        const percent = data.progress ? data.progress.toFixed(0) : 0;
        const file = (data.file || "data").split('/').pop(); // Show only filename
        onProgress(`Downloading ${file}: ${percent}%`);
      } else if (data.status === 'done') {
        onProgress(`Loaded ${data.file}`);
      } else if (data.status === 'initiate') {
         onProgress(`Starting ${data.file}...`);
      }
    };

    console.log("Initializing WebGPU Pipeline...");
    onProgress("Initializing WebGPU engine...");

    // Initialize the pipeline
    generator = await pipeline('text-generation', MODEL_ID, {
      device: 'webgpu',
      dtype: 'q4', // Force 4-bit quantization for memory safety
      progress_callback: progressCallback,
      // Suppress ONNX Runtime warnings (logSeverityLevel: 3 = Error)
      session_options: {
        logSeverityLevel: 3,
      }
    });
    
    console.log("WebGPU Engine Ready");
  } catch (error: any) {
    console.error("WebGPU Init Failed:", error);
    // Extract meaningful message from obscure WebGPU errors
    let msg = error.message || "Unknown error";
    if (msg.includes("createBuffer")) msg = "GPU memory buffer failed. Try closing other tabs.";
    if (msg.includes("BigInt")) msg = "Serialization error (fixed). Retry.";
    
    throw new Error(`Offline AI Init Failed: ${msg}`);
  } finally {
    isInitializing = false;
  }
};

export const generateLocalResponse = async (
  history: Message[],
  userMessage: string,
  language: string,
  onProgress?: (text: string) => void,
  onStream?: (text: string) => void
): Promise<string> => {
  
  if (!generator) {
    if (onProgress) onProgress("Initializing offline engine...");
    await initializeLocalModel((text) => {
      if (onProgress) onProgress(text);
    });
  }

  if (!generator) throw new Error("Offline engine failed to start.");

  // TinyLlama Chat Template:
  // <|system|>\n{system}</s>\n<|user|>\n{user}</s>\n<|assistant|>\n
  
  const systemPrompt = `${DR_SUJI_SYSTEM_INSTRUCTION}\nKeep responses concise. Language: ${language}.`;
  
  let fullPrompt = `<|system|>\n${systemPrompt}</s>\n`;
  
  // Add last 3 messages to conserve context window
  const recentHistory = history.slice(-3);
  for (const msg of recentHistory) {
    const role = msg.role === 'model' ? 'assistant' : 'user';
    fullPrompt += `<|${role}|>\n${msg.content}</s>\n`;
  }
  
  fullPrompt += `<|user|>\n${userMessage}</s>\n<|assistant|>\n`;

  try {
    // Generate
    const output = await generator(fullPrompt, {
      max_new_tokens: 300,
      temperature: 0.7,
      do_sample: true,
      top_k: 40,
      return_full_text: false, // Only return the new text
    });

    // The output object from Transformers.js v3 might contain BigInts in other properties
    // We strictly access the text string to avoid serialization issues elsewhere
    const generatedText = output[0]?.generated_text || "";
    
    if (onStream) onStream(generatedText);

    if (!generatedText) return "I couldn't generate a response.";
    return generatedText;

  } catch (error: any) {
    console.error("Local Generation Error:", error);
    // JSON.stringify protection for BigInts inside the error object
    const errorStr = JSON.stringify(error, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );
    throw new Error(`Local processing failed: ${errorStr}`);
  }
};
