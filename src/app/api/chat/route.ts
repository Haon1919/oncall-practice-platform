import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { message, history, incidentContext, apiKey, model } = await req.json();

    const keyToUse = apiKey || process.env.GEMINI_API_KEY;
    if (!keyToUse) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set and no API key was provided" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: keyToUse });
    const modelToUse = model || 'gemini-2.5-flash';

    const systemPrompt = `
      You are a senior software engineer mentoring a junior engineer who is currently on-call.
      They are investigating an issue with an application called "${incidentContext.appName}".
      The application is supposed to: "${incidentContext.description}".
      The application is running on simulated cloud provider: "${incidentContext.cloudProvider}".
      
      CRITICAL: The actual bug in the system is: "${incidentContext.bugDescription}".
      
      Your goal is to help them find and fix the bug, BUT YOU MUST NOT TELL THEM THE ANSWER DIRECTLY.
      Instead, ask guiding questions, suggest places to look (like logs, specific files, or network requests), and provide hints based on their findings.
      Act like a helpful but busy senior engineer. Keep your responses concise and focused on the immediate next step they should take.
      
      If they ask for the answer, refuse politely and point them back to the investigation process.
    `;

    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = ai.chats.create({
      model: modelToUse,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    // We need to send the history to the chat session
    // The @google/genai SDK handles history differently than the old one.
    // We'll just send the whole conversation as a single prompt for simplicity in this prototype,
    // or use the chat session if we can format it correctly.
    
    // Let's construct a single prompt with history for simplicity and reliability
    let fullPrompt = systemPrompt + "\n\nConversation History:\n";
    for (const msg of history) {
      fullPrompt += `${msg.role === 'user' ? 'Junior' : 'Senior'}: ${msg.content}\n`;
    }
    fullPrompt += `\nJunior: ${message}\nSenior:`;

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: fullPrompt,
    });

    return NextResponse.json({ reply: response.text });

  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}