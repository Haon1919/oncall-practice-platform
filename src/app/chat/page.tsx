"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Send, Bot, User, Loader2, AlertCircle } from "lucide-react";

export default function Chat() {
  const { incident, chatHistory, addChatMessage } = useStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    addChatMessage({ role: "user", content: userMessage });
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory,
          incidentContext: incident,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      addChatMessage({ role: "assistant", content: data.reply });
    } catch (error) {
      console.error("Chat error:", error);
      addChatMessage({
        role: "assistant",
        content: "Sorry, I encountered an error trying to process your request.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!incident) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500 p-8">
        <Bot size={64} className="mb-4 opacity-20" />
        <h2 className="text-2xl font-semibold text-gray-700">Senior Engineer Assistant</h2>
        <p className="mt-2 text-center max-w-md">
          Start an incident from the dashboard to get help from your AI senior engineer.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <header className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
          <Bot size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Senior Engineer</h1>
          <p className="text-sm text-gray-500">Here to help, but won't do the work for you.</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {chatHistory.length === 0 && (
          <div className="text-center text-gray-500 my-8 flex flex-col items-center gap-3">
            <AlertCircle size={32} className="text-blue-400" />
            <p>I see you're looking into the {incident.appName} issue.</p>
            <p>What have you found so far? Need a hint on where to look?</p>
          </div>
        )}
        
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-blue-100 text-blue-600'
            }`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${
              msg.role === 'user' 
                ? 'bg-gray-900 text-white rounded-tr-none' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-500" />
              <span className="text-gray-500 text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for a hint or explain your findings..."
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
