'use client'

import { ShieldCheck, Server, Users, Save, RefreshCw, Plus, Star, MessageSquare } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Whitelist() {
  const [protocols, setProtocols] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Local state for toggles
  const [whitelistedProtocols, setWhitelistedProtocols] = useState<string[]>([])
  const [whitelistedAgents, setWhitelistedAgents] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  // Modal States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [newAgentData, setNewAgentData] = useState({ name: '', agentType: 'Strategy', url: '' })
  
  const [rateModalAgentId, setRateModalAgentId] = useState<string | null>(null)
  const [ratingData, setRatingData] = useState({ rating: 5, comment: '' })

  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null)

  useEffect(() => {
    const storedId = localStorage.getItem('sentinel_user_id')
    if (storedId) {
      setUserId(storedId)
    }
  }, [])

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId])

  const fetchData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const [protoRes, agentRes, userRes] = await Promise.all([
        fetch(`${apiUrl}/api/protocols`),
        fetch(`${apiUrl}/api/agents`),
        fetch(`${apiUrl}/api/users/${userId}`)
      ])
      
      const protos = await protoRes.json()
      const ags = await agentRes.json()
      const userConfig = await userRes.json()
      
      setProtocols(protos)
      setAgents(ags)
      
      if (userConfig.whitelistedProtocols) setWhitelistedProtocols(userConfig.whitelistedProtocols)
      if (userConfig.whitelistedAgents) setWhitelistedAgents(userConfig.whitelistedAgents)
      
    } catch (e) {
      console.error("Make sure the backend is running", e)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score < 20) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (score < 50) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await fetch(`${apiUrl}/api/users/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whitelistedProtocols, whitelistedAgents })
      });
      alert('Whitelist Configuration Saved Successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await fetch(`${apiUrl}/api/seed`, { method: 'POST' });
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  const submitNewAgent = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await fetch(`${apiUrl}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAgentData, owner: userId })
      });
      setIsSubmitModalOpen(false);
      setNewAgentData({ name: '', agentType: 'Strategy', url: '' });
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const submitRating = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await fetch(`${apiUrl}/api/agents/${rateModalAgentId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, rating: ratingData.rating, comment: ratingData.comment })
      });
      setRateModalAgentId(null);
      setRatingData({ rating: 5, comment: '' });
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleProtocol = (id: string) => {
    setWhitelistedProtocols(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAgent = (id: string) => {
    setWhitelistedAgents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1 text-yellow-400">
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={14} className={s <= rating ? 'fill-yellow-400' : 'text-gray-600'} />
        ))}
      </div>
    );
  };

  if (!userId) {
    return <div className="text-center p-12 text-gray-400">Please login on the Dashboard first.</div>
  }

  if (loading) return <div className="text-center p-12 text-gray-400">Loading live data from Venice AI...</div>

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="text-blue-500"/> Trust Center & Venice AI Ratings</h2>
          <p className="text-gray-400 mt-2">Manage which protocols and agents are allowed to interact with your funds. Risk scores are dynamically generated by Venice AI.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={18} /> {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="glass-card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2"><Server className="text-purple-500"/> Protocol Whitelist</h3>
          {protocols.length === 0 && (
            <button 
              onClick={handleSeed}
              disabled={isSeeding}
              className="px-4 py-1.5 bg-purple-600/20 text-purple-400 hover:bg-purple-600/40 rounded-lg text-sm border border-purple-500/30 flex items-center gap-2 transition"
            >
              <RefreshCw size={14} className={isSeeding ? 'animate-spin' : ''} /> 
              {isSeeding ? 'Syncing...' : 'Sync Venice AI Ratings'}
            </button>
          )}
        </div>
        <div className="grid gap-4">
          {protocols.map(p => (
            <div key={p.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition cursor-pointer" onClick={() => toggleProtocol(p.id)}>
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox" 
                  checked={whitelistedProtocols.includes(p.id)}
                  onChange={() => {}} 
                  className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700 cursor-pointer" 
                />
                <div>
                  <h4 className="font-bold text-lg">{p.name}</h4>
                  <p className="text-sm text-gray-400 max-w-xl">Venice AI: &quot;{p.veniceReasoning || 'Risk assessed.'}&quot;</p>
                </div>
              </div>
              <div className="mt-4 md:mt-0 text-right w-full md:w-auto flex justify-end">
                <span className={`px-3 py-1 rounded-full text-xs border ${getRiskColor(p.riskScore)}`}>
                  Risk Score: {p.riskScore}/100
                </span>
              </div>
            </div>
          ))}
          {protocols.length === 0 && <p className="text-gray-500 text-sm">No protocols synced yet. Click "Sync Venice AI Ratings".</p>}
        </div>
      </div>

      <div className="glass-card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2"><Users className="text-orange-500"/> Universal AI Agent Directory</h3>
            <p className="text-gray-400 text-sm mt-1">Browse, evaluate, and securely delegate permissions to community-curated AI agents.</p>
          </div>
          <button 
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-2 bg-green-600/20 text-green-400 hover:bg-green-600/40 rounded-lg text-sm border border-green-500/30 flex items-center gap-2 transition font-bold"
          >
            <Plus size={16} /> Submit New Agent
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map(a => {
            const isInstalled = whitelistedAgents.includes(a.id);
            const isExpanded = expandedAgentId === a.id;
            return (
              <div key={a.id} className={`flex flex-col p-5 bg-white/5 border ${isInstalled ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/10'} rounded-xl hover:bg-white/10 transition relative`}>
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isInstalled ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
                      <Users size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg leading-tight">{a.name}</h4>
                      <p className="text-xs text-gray-400">{a.agentType} Agent</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getRiskColor(a.riskScore)}`}>
                    Risk: {a.riskScore}/100
                  </span>
                </div>

                {/* Rating & Stats */}
                <div className="flex items-center justify-between mb-4 bg-black/20 rounded-lg p-3">
                  <div>
                    {renderStars(Math.round(a.ratingScore || 0))}
                    <p className="text-xs text-gray-400 mt-1">{a.ratingScore?.toFixed(1)}/5 ({a.ratingCount || 0} reviews)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Audited</p>
                    <p className={a.audited ? 'text-blue-400 font-bold text-sm' : 'text-red-400 font-bold text-sm'}>{a.audited ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {/* Venice Reasoning */}
                <div className="mb-4 flex-1">
                  <p className="text-sm text-gray-400 italic bg-white/5 p-3 rounded-lg border-l-2 border-blue-500">
                    "{a.veniceReasoning || 'Trust verified by Venice AI.'}"
                  </p>
                </div>

                {/* Feedbacks Expand */}
                {a.feedbacks && a.feedbacks.length > 0 && (
                  <div className="mb-4">
                    <button onClick={() => setExpandedAgentId(isExpanded ? null : a.id)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                      <MessageSquare size={12}/> {isExpanded ? 'Hide Reviews' : `Read ${a.feedbacks.length} Reviews`}
                    </button>
                    {isExpanded && (
                      <div className="mt-2 space-y-2 max-h-32 overflow-y-auto pr-2">
                        {a.feedbacks.map((f: any, i: number) => (
                          <div key={i} className="bg-black/30 p-2 rounded text-xs border border-white/5">
                            <div className="flex justify-between text-gray-500 mb-1">
                              <span>{f.userId.substring(0,6)}...</span>
                              <span className="text-yellow-400">{f.rating} ★</span>
                            </div>
                            <p className="text-gray-300">{f.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                  <button onClick={() => setRateModalAgentId(a.id)} className="text-xs text-gray-400 hover:text-white underline">
                    Rate this Agent
                  </button>
                  <button 
                    onClick={() => toggleAgent(a.id)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
                      isInstalled 
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                    }`}
                  >
                    {isInstalled ? 'Uninstall Agent' : 'Install Agent'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {agents.length === 0 && <p className="text-gray-500 text-sm mt-4">No agents synced yet. Click "Sync Venice AI Ratings".</p>}
      </div>

      {/* Modals */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151821] border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus className="text-green-500"/> Submit New Agent</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Agent Name</label>
                <input type="text" value={newAgentData.name} onChange={e => setNewAgentData({...newAgentData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-blue-500" placeholder="e.g. Aave Auto-Compounder"/>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Agent Type</label>
                <select value={newAgentData.agentType} onChange={e => setNewAgentData({...newAgentData, agentType: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-blue-500">
                  <option>Strategy</option><option>Security</option><option>Executor</option><option>Trading</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Contract / API URL</label>
                <input type="text" value={newAgentData.url} onChange={e => setNewAgentData({...newAgentData, url: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-blue-500" placeholder="https://..."/>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsSubmitModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
              <button onClick={submitNewAgent} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition">Submit to Venice AI</button>
            </div>
          </div>
        </div>
      )}

      {rateModalAgentId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151821] border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Star className="text-yellow-500"/> Rate Agent</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Rating (1-5)</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setRatingData({...ratingData, rating: s})}>
                      <Star size={24} className={s <= ratingData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Public Comment</label>
                <textarea value={ratingData.comment} onChange={e => setRatingData({...ratingData, comment: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-blue-500 h-24 resize-none" placeholder="Share your experience..."></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setRateModalAgentId(null)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
              <button onClick={submitRating} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition">Post Review</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
