"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Play, Loader2, CheckCircle2, XCircle, Server, Cloud } from "lucide-react";

export default function Dashboard() {
  const { incident, setIncident, updateIncidentStatus, addTicket, apiKey, model } = useStore();
  const [appName, setAppName] = useState("");
  const [description, setDescription] = useState("");
  const [cloudProvider, setCloudProvider] = useState("aws");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName || !description) return;

    setIsGenerating(true);
    setError("");
    
    const newIncidentId = Math.random().toString(36).substring(7);
    setIncident({
      id: newIncidentId,
      appName,
      description,
      cloudProvider,
      status: "generating",
    });

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName, description, cloudProvider, incidentId: newIncidentId, apiKey, model }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate application");
      }

      const data = await response.json();
      
      updateIncidentStatus("active", data.containerId, data.port);
      
      // Add the initial ticket
      addTicket({
        id: Math.random().toString(36).substring(7),
        subject: `URGENT: Issue with ${appName}`,
        sender: "customer.support@example.com",
        body: data.ticketBody,
        timestamp: new Date().toISOString(),
        read: false,
      });

    } catch (err: any) {
      setError(err.message);
      setIncident(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Incident Dashboard</h1>
          <p className="text-gray-500 mt-2">Generate a new practice scenario or manage your current incident.</p>
        </header>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
            <XCircle className="text-red-500 mt-0.5" size={20} />
            <div>
              <h3 className="text-red-800 font-medium">Error generating scenario</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {incident ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Server size={20} className="text-blue-400" />
                  {incident.appName}
                </h2>
                <p className="text-gray-400 text-sm mt-1">ID: {incident.id}</p>
              </div>
              <div className="flex items-center gap-2">
                {incident.status === "generating" && (
                  <span className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                    <Loader2 size={16} className="animate-spin" />
                    Provisioning...
                  </span>
                )}
                {incident.status === "active" && (
                  <span className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    Active Incident
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-gray-800">{incident.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Cloud size={16} /> Environment
                  </h3>
                  <p className="text-gray-900 font-medium capitalize">{incident.cloudProvider}</p>
                </div>
                
                {incident.status === "active" && incident.port && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Application URL</h3>
                    <a href={`http://localhost:${incident.port}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                      http://localhost:{incident.port}
                    </a>
                  </div>
                )}
              </div>

              {incident.status === "active" && (
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={() => setIncident(null)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                  >
                    End Incident
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Scenario</h2>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label htmlFor="appName" className="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
                <input
                  type="text"
                  id="appName"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g., User Authentication Service"
                  required
                  disabled={isGenerating}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Application Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="Describe what the application should do. Gemini will build it and inject a bug."
                  required
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Simulated Cloud Provider</label>
                <div className="grid grid-cols-3 gap-4">
                  {['aws', 'gcp', 'azure'].map((provider) => (
                    <label 
                      key={provider} 
                      className={`
                        cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all
                        ${cloudProvider === provider ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}
                        ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <input
                        type="radio"
                        name="cloudProvider"
                        value={provider}
                        checked={cloudProvider === provider}
                        onChange={(e) => setCloudProvider(e.target.value)}
                        className="sr-only"
                        disabled={isGenerating}
                      />
                      <Cloud size={24} />
                      <span className="font-medium uppercase">{provider}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Provisioning Infrastructure...
                    </>
                  ) : (
                    <>
                      <Play size={20} />
                      Generate Scenario
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}