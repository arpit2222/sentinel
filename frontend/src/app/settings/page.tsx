'use client'

import { useState, useEffect } from 'react'
import { Key, Settings as SettingsIcon, AlertTriangle, Save } from 'lucide-react'

export default function Settings() {
  const [isDelegated, setIsDelegated] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [veniceApiKey, setVeniceApiKey] = useState('')
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const storedId = localStorage.getItem('sentinel_user_id')
    if (storedId) {
      setUserId(storedId)
      fetchConfig(storedId)
    }
  }, [])

  const fetchConfig = async (address: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const res = await fetch(`${apiUrl}/api/users/${address}`)
      const config = await res.json()
      if (config.veniceApiKey) {
        setVeniceApiKey(config.veniceApiKey)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSaveConfig = async () => {
    if (!userId) return
    setIsSavingConfig(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      await fetch(`${apiUrl}/api/users/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ veniceApiKey })
      })
      alert("Configuration saved securely to your Smart Account!")
    } catch (e) {
      console.error(e)
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleDelegate = () => {
    setIsSigning(true)
    // Simulate MetaMask EIP-7715 signing flow
    setTimeout(() => {
      setIsDelegated(true)
      setIsSigning(false)
    }, 2000)
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2"><SettingsIcon className="text-blue-500"/> Configuration & Permissions</h2>
        <p className="text-gray-400 mt-2">Manage your autonomous agent settings and ERC-7715 delegations.</p>
      </div>

      <div className="glass-card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Key className="text-yellow-500"/> Venice AI API Configuration</h3>
        <p className="text-sm text-gray-400 mb-6">
          Provide your own Venice AI API key. The Sentinel agent will use your exact credits to evaluate positions. If left blank, it falls back to the default or mock logic.
        </p>

        <div className="bg-white/5 border border-white/10 p-6 rounded-xl mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Custom Venice AI API Key</label>
            <input 
              type="password" 
              placeholder="VENICE_INFERENCE_KEY_..." 
              value={veniceApiKey}
              onChange={(e) => setVeniceApiKey(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition font-mono text-sm" 
            />
          </div>
          <button 
            onClick={handleSaveConfig}
            disabled={isSavingConfig}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2"
          >
            <Save size={16}/> {isSavingConfig ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Key className="text-blue-500"/> Smart Account Delegation (ERC-7715)</h3>
        <p className="text-sm text-gray-400 mb-6">
          To allow SENTINEL to save your positions from liquidation, you must delegate limited spending authority. 
        </p>

        <div className="bg-white/5 border border-white/10 p-6 rounded-xl mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Stablecoin</label>
              <select className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition">
                <option>USDC (Base)</option>
                <option>USDT (Base)</option>
                <option>DAI (Base)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Max Repay Budget (Monthly)</label>
              <input type="text" defaultValue="10000" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition" />
            </div>
          </div>
        </div>

        {isDelegated ? (
          <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-400 font-medium">Delegation Active</span>
            </div>
            <button 
              onClick={() => setIsDelegated(false)}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 transition text-sm font-medium"
            >
              Revoke Authority
            </button>
          </div>
        ) : (
          <button 
            onClick={handleDelegate}
            disabled={isSigning}
            className="w-full px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSigning ? 'Requesting wallet signature...' : 'Grant Execution Permissions'}
          </button>
        )}
      </div>

    </div>
  )
}
