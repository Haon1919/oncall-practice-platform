"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Terminal, Activity, RefreshCw, AlertTriangle, Server } from "lucide-react";

export default function CloudConsole() {
  const { incident } = useStore();
  const [logs, setLogs] = useState<string[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchLogs = async () => {
    if (!incident?.containerId) return;
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/logs?containerId=${incident.containerId}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs.split('\n').filter(Boolean));
      }
    } catch (e) {
      console.error("Failed to fetch logs", e);
    }
    finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (incident?.status === 'active') {
      fetchLogs();
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [incident]);

  if (!incident || incident.status !== 'active') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 text-gray-400 p-8">
        <Server size={64} className="mb-4 opacity-20" />
        <h2 className="text-2xl font-semibold text-gray-300">No Active Resources</h2>
        <p className="mt-2 text-center max-w-md">
          Start an incident from the dashboard to view cloud resources and logs.
        </p>
      </div>
    );
  }

  const providerColors = {
    aws: 'text-orange-500 border-orange-500',
    gcp: 'text-blue-500 border-blue-500',
    azure: 'text-cyan-500 border-cyan-500',
  };

  const colorClass = providerColors[incident.cloudProvider as keyof typeof providerColors] || 'text-gray-500 border-gray-500';

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-900 text-gray-100 font-mono">
      <header className={`p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950`}>
        <div className="flex items-center gap-3">
          <Terminal className={colorClass.split(' ')[0]} />
          <h1 className="text-xl font-bold uppercase tracking-wider">
            {incident.cloudProvider} Console
          </h1>
          <span className="text-gray-500 text-sm ml-4">| {incident.appName}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-sm text-green-400">
            <Activity size={16} /> Status: Running
          </span>
          <button 
            onClick={fetchLogs}
            disabled={loadingLogs}
            className="p-2 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={18} className={loadingLogs ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col p-4">
        <div className="mb-4 flex items-center gap-2 text-yellow-500 bg-yellow-500/10 p-3 rounded border border-yellow-500/20">
          <AlertTriangle size={18} />
          <span className="text-sm">Viewing live container logs for {incident.containerId?.substring(0, 12)}</span>
        </div>
        
        <div className="flex-1 bg-black rounded-lg border border-gray-800 p-4 overflow-y-auto font-mono text-sm shadow-inner">
          {logs.length === 0 ? (
            <div className="text-gray-600 italic">Waiting for logs...</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="mb-1 hover:bg-gray-900 px-2 py-0.5 rounded">
                <span className="text-gray-500 mr-4">{new Date().toISOString().split('T')[1].substring(0, 8)}</span>
                <span className={log.toLowerCase().includes('error') ? 'text-red-400' : 'text-gray-300'}>
                  {log}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}