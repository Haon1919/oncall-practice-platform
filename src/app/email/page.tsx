"use client";

import { useStore } from "@/store/useStore";
import { Mail, MailOpen, Clock, User } from "lucide-react";

export default function Email() {
  const { tickets, markTicketRead } = useStore();

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <header className="p-6 border-b border-gray-200 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="text-blue-500" />
          Support Inbox
        </h1>
        <p className="text-gray-500 mt-1">Customer reports and automated alerts.</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {tickets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <MailOpen size={48} className="opacity-50" />
            <p className="text-lg">No new messages.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className={`border rounded-xl p-6 transition-all ${ticket.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200 shadow-sm'}`}
                onClick={() => !ticket.read && markTicketRead(ticket.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${ticket.read ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${ticket.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {ticket.sender}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(ticket.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!ticket.read && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">New</span>
                  )}
                </div>
                
                <h4 className={`text-lg mb-3 ${ticket.read ? 'font-medium text-gray-800' : 'font-bold text-gray-900'}`}>
                  {ticket.subject}
                </h4>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 whitespace-pre-wrap font-mono text-sm">
                  {ticket.body}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
