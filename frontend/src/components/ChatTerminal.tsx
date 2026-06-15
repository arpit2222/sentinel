'use client';

import { useState } from 'react';
import { Bot, Send, X, MessageSquare } from 'lucide-react';

export default function ChatTerminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'agent', content: string}[]>([
    { role: 'agent', content: 'Hello! I am SENTINEL. How can I help you manage your positions today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const resp = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: '0xMockUser', message: userMessage })
      });
      const data = await resp.json();
      
      setMessages(prev => [...prev, { role: 'agent', content: data.reply || 'Sorry, I encountered an error.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'agent', content: 'Connection error to SENTINEL brain.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-900/50 transition-transform hover:scale-105 z-50"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-80 md:w-96 glass-card shadow-2xl z-50 flex flex-col overflow-hidden border border-white/10 p-0">
      {/* Header */}
      <div className="bg-blue-900/40 p-4 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="text-blue-400" size={20} />
          <h3 className="font-bold text-white">Ask Venice AI</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition">
          <X size={20} />
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 p-4 h-80 overflow-y-auto space-y-4 bg-black/40">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl p-3 text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-200 border border-white/5'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-xl p-3 text-sm text-gray-400 flex gap-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce delay-100">.</span>
              <span className="animate-bounce delay-200">.</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10 bg-black/60 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about your positions..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-white px-2"
        />
        <button 
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
