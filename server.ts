import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, Type } from "@google/genai";

const app = express();
const PORT = 3000;

// Parse json and urlencoded payloads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize Gemini client server-side lazily to handle missing key gracefully on startup
let aiInstance: GoogleGenAI | null = null;
const getGeminiClient = (): GoogleGenAI => {
  if (aiInstance) return aiInstance;
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  if (!key) {
    throw new Error("Gemini API key is not configured. Please add GEMINI_API_KEY under Settings > Secrets.");
  }
  aiInstance = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  return aiInstance;
};

// Guard API access if key is missing (fails fast with clear message)
const checkApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  if (!key) {
    res.status(500).json({ 
      error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your Secrets panel under Settings." 
    });
    return;
  }
  next();
};

// 1. CHATBOT STREAM ENDPOINT
app.post("/api/gemini/chat/stream", checkApiKey, async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    res.status(400).send("Message is required.");
    return;
  }

  try {
    const formattedHistory = Array.isArray(history) 
      ? history.map((h: any) => ({
          role: h.role,
          parts: [{ text: h.parts?.[0]?.text || "" }]
        }))
      : [];

    const ai = getGeminiClient();
    const chatInstance = ai.chats.create({
      model: "gemini-3.5-flash",
      history: formattedHistory,
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

3.  **Be an Expert Assistant:** Provide accurate, high-quality answers. If you don't know something, say so. If a query is ambiguous, ask for clarification. Never provide harmful or unethical advice.`,
      }
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const responseStream = await chatInstance.sendMessageStream({ message });
    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }
    res.end();
  } catch (error: any) {
    console.error("Chat streaming error in server:", error);
    if (!res.headersSent) {
      res.status(500).send("Error generating content stream: " + (error.message || error));
    } else {
      res.end();
    }
  }
});

// 2. SEARCH GROUNDING ENDPOINT
app.post("/api/gemini/search", checkApiKey, async (req, res) => {
  const { query } = req.body;
  if (!query) {
    res.status(400).json({ error: "Query is required." });
    return;
  }

  try {
    const ai = getGeminiClient();
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `For the query "${query}", provide a detailed and comprehensive answer. Structure your response with the following sections: a "Summary:", a list of "Key Points:", a list of "Image Search Suggestions:", and a list of "Related Searches:". Each key point, suggestion, and related search should be on a new line and start with a hyphen. The "Summary:" should be a paragraph.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
    } catch (groundingError) {
      console.warn("Google Search grounding failed, falling back to standard models... ", groundingError);
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `For the query "${query}", provide a detailed and comprehensive answer. Structure your response with the following sections: a "Summary:", a list of "Key Points:", a list of "Image Search Suggestions:", and a list of "Related Searches:". Each key point, suggestion, and related search should be on a new line and start with a hyphen. The "Summary:" should be a paragraph.`,
      });
    }

    const text = response.text || "";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({ text, sources });
  } catch (error: any) {
    console.error("Search API error on server:", error);
    res.status(500).json({ error: error.message || "Failed to search" });
  }
});

// 3. GENERATE ANSWER ENDPOINT (FOR KNOWLEDGE HUB)
app.post("/api/gemini/generate-answer", checkApiKey, async (req, res) => {
  const { question } = req.body;
  if (!question) {
    res.status(400).json({ error: "Question is required." });
    return;
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `As LARA, the ClarityAI assistant, provide an expert, clear, and structured answer to the following question. Use headings and bullet points for readability where appropriate. Keep the tone professional and helpful. Question: "${question}"`,
    });

    res.json({ text: response.text || "" });
  } catch (error: any) {
    console.error("Generate answer error in server:", error);
    res.status(500).json({ error: error.message || "Failed to generate answer" });
  }
});

// 4. IMAGE EDIT ENDPOINT
app.post("/api/gemini/edit-image", checkApiKey, async (req, res) => {
  const { base64ImageData, mimeType, prompt } = req.body;
  if (!base64ImageData || !mimeType || !prompt) {
    res.status(400).json({ error: "Missing required fields: base64ImageData, mimeType, or prompt." });
    return;
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
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

    let imageData: string | null = null;
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.mimeType.startsWith("image/")) {
        imageData = part.inlineData.data;
        break;
      }
    }

    if (imageData) {
      res.json({ imageData });
    } else {
      res.status(500).json({ error: "No image was generated by Gemini in response parts" });
    }
  } catch (error: any) {
    console.error("Image editing error in server:", error);
    res.status(500).json({ error: error.message || "Failed to edit image" });
  }
});

// INTEGRATE VITE FOR SPA FLOW
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Full-stack ClarityAI running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
