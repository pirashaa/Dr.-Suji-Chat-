
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";
import { DR_SUJI_SYSTEM_INSTRUCTION } from "../constants";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGeminiResponse = async (
  history: Message[],
  userMessage: string,
  language: string = 'en-US',
  modelId: string = "gemini-3-flash-preview",
  onStream?: (text: string) => void
): Promise<string> => {
  try {
    // Modify system instruction based on language
    const languageInstruction = `\n\n**IMPORTANT:** Please respond in the language code: ${language}.`;
    const finalSystemInstruction = DR_SUJI_SYSTEM_INSTRUCTION + languageInstruction;

    // Convert history to Gemini format
    const contents = history.map((msg) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const responseStream = await ai.models.generateContentStream({
      model: modelId,
      contents: contents,
      config: {
        systemInstruction: finalSystemInstruction,
        temperature: 0.4, 
        // Increased to maximum supported output tokens for detailed long-form responses
        maxOutputTokens: 8192,
      },
    });

    let fullText = '';
    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      const text = c.text;
      if (text) {
        fullText += text;
        if (onStream) {
          onStream(fullText);
        }
      }
    }

    return fullText || "I apologize, I could not generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error; // Re-throw to allow fallback in aiService
  }
};

// Deprecated alias for backward compatibility if needed, but we switch to generateMultiModelResponse
export const generateMedicalResponse = generateGeminiResponse;
