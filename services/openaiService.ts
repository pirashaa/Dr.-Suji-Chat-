
import { Message } from "../types";
import { DR_SUJI_SYSTEM_INSTRUCTION } from "../constants";

export const generateOpenAIResponse = async (
  history: Message[],
  userMessage: string,
  model: string,
  language: string,
  onStream?: (text: string) => void
): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;

  // Robust check: Ensure key exists and is not an empty string or just quotes
  if (!apiKey || apiKey.trim() === '' || apiKey === '""') {
    throw new Error("OpenAI API Key is missing or invalid. Please configure VITE_OPENAI_API_KEY.");
  }

  // Clean the key just in case of whitespace
  const cleanKey = apiKey.trim();

  const systemInstruction = `${DR_SUJI_SYSTEM_INSTRUCTION}\n\n**IMPORTANT:** Respond in language: ${language}.`;

  const messages = [
    { role: "system", content: systemInstruction },
    ...history.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.content
    })),
    { role: "user", content: userMessage }
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cleanKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.4,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      let errorMsg = response.statusText;
      try {
        const errorData = await response.json();
        if (errorData?.error?.message) {
          errorMsg = errorData.error.message;
        }
      } catch (e) {
        // Ignore JSON parse error, stick to statusText
      }
      throw new Error(`OpenAI API Error (${response.status}): ${errorMsg}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "No response generated.";
    
    // Simulate stream at the end since we used non-streaming fetch
    if (onStream) {
      onStream(text);
    }
    
    return text;
  } catch (error) {
    // Re-throw error so the orchestrator knows this provider failed
    console.error("OpenAI Request Failed:", error);
    throw error;
  }
};
