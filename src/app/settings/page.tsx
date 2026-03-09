"use client";

import { useStore } from "@/store/useStore";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { useState, useEffect } from "react";

export default function Settings() {
  const { apiKey, model, setApiKey, setModel } = useStore();
  const [localApiKey, setLocalApiKey] = useState("");
  const [localModel, setLocalModel] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalApiKey(apiKey);
    setLocalModel(model);
  }, [apiKey, model]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(localApiKey);
    setModel(localModel);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <SettingsIcon size={32} className="text-gray-700" />
            Settings
          </h1>
          <p className="text-gray-500 mt-2">Configure your API keys and model preferences.</p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                Gemini API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="AIzaSy..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Your API key is stored locally in your browser and is only sent to the server when generating scenarios or chatting.
              </p>
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <select
                id="model"
                value={localModel}
                onChange={(e) => setLocalModel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Experimental</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              </select>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                <Save size={18} />
                Save Settings
              </button>
              {saved && <span className="text-green-600 text-sm font-medium">Settings saved!</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
