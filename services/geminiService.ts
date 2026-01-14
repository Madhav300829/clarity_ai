import { GoogleGenAI, Chat, GenerateContentResponse, Content, Modality } from "@google/genai";
import { GroundingChunk, SearchResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const CHAT_HISTORY_KEY = 'clarity-ai-chat-history';

const saveHistory = (history: Content[]) => {
    try {
        // The history objects from the Gemini API might contain circular references
        // or other non-serializable data. We need to convert them to plain objects
        // before saving to localStorage.
        const serializableHistory = history.map(item => ({
            role: item.role,
            // This app only uses text parts, so we can safely map them.
            parts: item.parts.map(part => ({ text: (part as {text: string}).text })),
        }));
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(serializableHistory));
    } catch (e) {
        console.error("Failed to save chat history to localStorage", e);
    }
};

const loadHistory = (): Content[] | undefined => {
    try {
        const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
        if (storedHistory) {
            return JSON.parse(storedHistory);
        }
    } catch (e) {
        console.error("Failed to load chat history from localStorage", e);
        // If parsing fails, clear corrupted data
        localStorage.removeItem(CHAT_HISTORY_KEY);
    }
    return undefined;
};

export const startChat = (): Chat => {
  const history = loadHistory();

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: history,
    config: {
        systemInstruction: `You are LARA (Learning And Research Assistant), the AI heart of "ClarityAI". Your personality is witty, encouraging, and exceptionally helpful. You are not just a chatbot; you are a proactive guide to the entire ClarityAI ecosystem. Your goal is to make users feel empowered and clear-headed.

ClarityAI has these key features:
- **Chatbot:** (Your current interface) For direct conversation, brainstorming, and problem-solving.
- **Search:** For AI-powered summaries of web information.
- **Knowledge Hub:** A community Q&A section for crowdsourced wisdom.
- **Hire Us:** A marketplace to find and hire expert freelancers.

Your Core Directives:
1.  **Be Proactive:** Don't just answer questions. Anticipate user needs. If a query could be better served by another feature, *always* suggest it.
    -   *Example 1:* If a user asks "How do I hire a good React developer?", you should answer the question and then say something like, "For a curated list of experts, you should definitely check out our 'Hire Us' section!"
    -   *Example 2:* If a user asks a very specific technical question like "What's the best way to handle global state in a large Next.js app?", answer it and then add, "This is a great question! You might get diverse opinions from experienced developers in our 'Knowledge Hub'. Have you considered posting it there?"
    -   *Example 3:* If a user asks for recent news like "What were the results of the F1 race last weekend?", you can provide a summary and mention, "For the most up-to-date info with sources, our 'Search' feature is perfect for queries like this."

2.  **Maintain Your Persona:**
    -   **Tone:** Be friendly, approachable, and slightly enthusiastic. Use emojis where appropriate to add warmth, but don't overdo it. 😉
    -   **Clarity is Key:** Break down complex topics into simple, digestible chunks. Use Markdown (headings, lists, bold text) to structure your responses for maximum readability in the UI.
    -   **Encourage Interaction:** End your responses with open-ended questions to keep the conversation flowing.

3.  **Be an Expert Assistant:** Provide accurate, high-quality answers. If you don't know something, say so. If a query is ambiguous, ask for clarification. Never provide harmful or unethical advice.

Remember, you are the face of ClarityAI. Make every interaction a delightful and productive one!`,
    },
  });

  // Wrap sendMessage to save history after the call
  const originalSendMessage = chat.sendMessage.bind(chat);
  chat.sendMessage = async (params) => {
      const response = await originalSendMessage(params);
      const history = await chat.getHistory();
      saveHistory(history);
      return response;
  };

  // Wrap sendMessageStream to save history after the stream is consumed
  const originalSendMessageStream = chat.sendMessageStream.bind(chat);
  chat.sendMessageStream = async (params) => {
      const stream = await originalSendMessageStream(params);
      
      async function* wrappedStream() {
          for await (const chunk of stream) {
              yield chunk;
          }
          // After the stream is fully consumed, the history is updated.
          const history = await chat.getHistory();
          saveHistory(history);
      }

      return wrappedStream();
  };

  return chat;
};

export const searchWithGoogle = async (query: string): Promise<SearchResult> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `For the query "${query}", provide a detailed and comprehensive answer. Structure your response with the following sections: a "Summary:", a list of "Key Points:", a list of "Image Search Suggestions:", and a list of "Related Searches:". Each key point, suggestion, and related search should be on a new line and start with a hyphen. The "Summary:" should be a paragraph.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    
    let summary = '';
    const keyPoints: string[] = [];
    const imageSearchSuggestions: string[] = [];
    const relatedSearches: string[] = [];
    
    if (!text) {
        return { summary: `No text response for "${query}".`, keyPoints, imageSearchSuggestions, relatedSearches, sources };
    }

    const lines = text.split('\n');
    let currentSection: 'summary' | 'keyPoints' | 'imageSuggestions' | 'relatedSearches' | 'none' = 'none';

    for (const line of lines) {
        const trimmedLine = line.trim();
        const lowerLine = trimmedLine.toLowerCase();

        if (lowerLine.startsWith('summary:')) {
            currentSection = 'summary';
            summary += trimmedLine.substring('summary:'.length).trim();
            continue;
        } else if (lowerLine.startsWith('key points:')) {
            currentSection = 'keyPoints';
            continue;
        } else if (lowerLine.startsWith('image search suggestions:')) {
            currentSection = 'imageSuggestions';
            continue;
        } else if (lowerLine.startsWith('related searches:')) {
            currentSection = 'relatedSearches';
            continue;
        }

        switch (currentSection) {
            case 'summary':
                if (trimmedLine) summary += ' ' + trimmedLine;
                break;
            case 'keyPoints':
                if (trimmedLine.startsWith('-')) keyPoints.push(trimmedLine.substring(1).trim());
                break;
            case 'imageSuggestions':
                if (trimmedLine.startsWith('-')) imageSearchSuggestions.push(trimmedLine.substring(1).trim());
                break;
            case 'relatedSearches':
                if (trimmedLine.startsWith('-')) relatedSearches.push(trimmedLine.substring(1).trim());
                break;
            case 'none':
                if (trimmedLine) {
                    currentSection = 'summary';
                    summary += trimmedLine;
                }
                break;
        }
    }
    
    summary = summary.trim();

    if (!summary && !keyPoints.length && !imageSearchSuggestions.length && !relatedSearches.length) {
        summary = text;
    } else if (!summary && (keyPoints.length || imageSearchSuggestions.length || relatedSearches.length)) {
        summary = `An AI summary could not be generated for "${query}", but see key points and related searches below.`;
    }

    return { summary, keyPoints, imageSearchSuggestions, relatedSearches, sources };

  } catch (error) {
    console.error("Error with Google Search grounding:", error);
    return { summary: "Sorry, I couldn't perform the search. Please try again later.", keyPoints: [], imageSearchSuggestions: [], relatedSearches: [], sources: [] };
  }
};


export const generateAnswer = async (question: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `As LARA, the ClarityAI assistant, provide an expert, clear, and structured answer to the following question. Use headings and bullet points for readability where appropriate. Keep the tone professional and helpful. Question: "${question}"`,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating answer:", error);
        return "I apologize, but I was unable to generate an answer at this time.";
    }
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        // Find the image part in the response
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                return part.inlineData.data; // Return the base64 of the new image
            }
        }
        return null; // No image found in response
    } catch (error) {
        console.error("Error editing image:", error);
        return null;
    }
};