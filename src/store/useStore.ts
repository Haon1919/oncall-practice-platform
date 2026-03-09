import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Ticket {
  id: string;
  subject: string;
  sender: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Incident {
  id: string;
  appName: string;
  description: string;
  cloudProvider: string;
  status: 'generating' | 'active' | 'resolved';
  containerId?: string;
  port?: number;
  bugDescription?: string; // Hidden from user, used for hints
}

interface AppState {
  incident: Incident | null;
  tickets: Ticket[];
  chatHistory: ChatMessage[];
  apiKey: string;
  model: string;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setIncident: (incident: Incident | null) => void;
  updateIncidentStatus: (status: Incident['status'], containerId?: string, port?: number) => void;
  addTicket: (ticket: Ticket) => void;
  markTicketRead: (id: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearState: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      incident: null,
      tickets: [],
      chatHistory: [],
      apiKey: '',
      model: 'gemini-2.5-flash',
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      setIncident: (incident) => set({ incident }),
      updateIncidentStatus: (status, containerId, port) =>
        set((state) => ({
          incident: state.incident ? { ...state.incident, status, containerId, port } : null,
        })),
      addTicket: (ticket) => set((state) => ({ tickets: [ticket, ...state.tickets] })),
      markTicketRead: (id) =>
        set((state) => ({
          tickets: state.tickets.map((t) => (t.id === id ? { ...t, read: true } : t)),
        })),
      addChatMessage: (message) =>
        set((state) => ({ chatHistory: [...state.chatHistory, message] })),
      clearState: () => set({ incident: null, tickets: [], chatHistory: [] }),
    }),
    {
      name: 'oncall-storage',
      partialize: (state) => ({ apiKey: state.apiKey, model: state.model }),
    }
  )
);
