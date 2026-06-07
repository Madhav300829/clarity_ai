import { SearchResult, GroundingChunk } from '../types';

export interface ChatPart {
  text: string;
}

export interface ChatContent {
  role: 'user' | 'model';
  parts: ChatPart[];
}

const CHAT_HISTORY_KEY = 'clarity-ai-chat-history';

export class ProxyChat {
  private history: ChatContent[] = [];

  constructor() {
    const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    if (storedHistory) {
      try {
        this.history = JSON.parse(storedHistory);
      } catch (e) {
        console.error("Failed to parse local history:", e);
      }
    }
  }

  async getHistory(): Promise<ChatContent[]> {
    return this.history;
  }

  async sendMessage(params: { message: string }) {
    this.history.push({
      role: 'user',
      parts: [{ text: params.message }]
    });
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(this.history));

    const response = await fetch('/api/gemini/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: params.message,
        history: this.history.slice(0, -1)
      })
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(txt || 'Failed answer generation');
    }

    const text = await response.text();
    this.history.push({
      role: 'model',
      parts: [{ text }]
    });
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(this.history));
    return { text };
  }

  async sendMessageStream(params: { message: string }) {
    this.history.push({
      role: 'user',
      parts: [{ text: params.message }]
    });
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(this.history));

    const response = await fetch('/api/gemini/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: params.message,
        history: this.history.slice(0, -1)
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Failed to communicate with AI server');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";
    const self = this;

    async function* makeGenerator() {
      if (!reader) {
        throw new Error('Response body has no reader');
      }
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkStr = decoder.decode(value, { stream: true });
          accumulatedText += chunkStr;
          yield { text: chunkStr };
        }
      } finally {
        reader.releaseLock();
        self.history.push({
          role: 'model',
          parts: [{ text: accumulatedText }]
        });
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(self.history));
      }
    }

    return makeGenerator();
  }
}

export const startChat = (): ProxyChat => {
  return new ProxyChat();
};

export const searchWithGoogle = async (query: string): Promise<SearchResult> => {
  try {
    const response = await fetch('/api/gemini/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(errTxt || 'API search failed');
    }

    const result = await response.json();
    const text = result.text || "";
    const sources = (result.sources || []) as GroundingChunk[];

    let summary = '';
    const keyPoints: string[] = [];
    const imageSearchSuggestions: string[] = [];
    const relatedSearches: string[] = [];

    if (!text) {
        return { summary: `No response generated for "${query}".`, keyPoints, imageSearchSuggestions, relatedSearches, sources };
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
    console.error("Error with Google Search API backend:", error);
    return { summary: "Sorry, I couldn't perform the search. Please make sure GEMINI_API_KEY is configured in your Settings under Secrets.", keyPoints: [], imageSearchSuggestions: [], relatedSearches: [], sources: [] };
  }
};

export const generateAnswer = async (question: string): Promise<string> => {
    try {
        const response = await fetch('/api/gemini/generate-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question })
        });
        if (!response.ok) {
          throw new Error('Generate answer API failed');
        }
        const data = await response.json();
        return data.text || "I apologize, but I was unable to generate an answer at this time.";
    } catch (error) {
        console.error("Error generating answer:", error);
        return "I apologize, but I was unable to generate an answer at this time. Please make sure GEMINI_API_KEY is configured in your Secrets.";
    }
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string | null> => {
    try {
        const response = await fetch('/api/gemini/edit-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64ImageData, mimeType, prompt })
        });
        if (!response.ok) {
          throw new Error('Edit image API failed');
        }
        const data = await response.json();
        return data.imageData || null;
    } catch (error) {
        console.error("Error editing image:", error);
        return null;
    }
};
