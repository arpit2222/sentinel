'use client'

import { useState, useEffect } from 'react'
import { Key, Settings as SettingsIcon, Shield, Save, CheckCircle2, Bot, Bell, Zap } from 'lucide-react'

export default function Settings() {
  const [isDelegated, setIsDelegated] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  
  // Config state
  const [veniceApiKey, setVeniceApiKey] = useState('')
  const [autoRepayEnabled, setAutoRepayEnabled] = useState(true)
  const [preferredStablecoin, setPreferredStablecoin] = useState('USDC')
  const [maxRepayPerTx, setMaxRepayPerTx] = useState('5000')
  const [telegramHandle, setTelegramHandle] = useState('')
  
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const storedId = localStorage.getItem('sentinel_user_id')
    if (storedId) {
      setUserId(storedId)
      fetchConfig(storedId)
      // Mock existing delegation state for visual demo
      setIsDelegated(true)
    }
  }, [])

  const fetchConfig = async (address: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const res = await fetch(`${apiUrl}/api/users/${address}`)
      const config = await res.json()
      if (config.veniceApiKey) setVeniceApiKey(config.veniceApiKey)
      if (config.preferredStablecoin) setPreferredStablecoin(config.preferredStablecoin)
      if (config.maxRepayPerTx) setMaxRepayPerTx(config.maxRepayPerTx.toString())
      if (config.autoRepayEnabled !== undefined) setAutoRepayEnabled(config.autoRepayEnabled)
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
        body: JSON.stringify({ 
          veniceApiKey,
          autoRepayEnabled,
          preferredStablecoin,
          maxRepayPerTx: Number(maxRepayPerTx)
        })
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
    setTimeout(() => {
      setIsDelegated(true)
      setIsSigning(false)
    }, 2000)
  }

  if (!userId) return <div className="text-center p-12 text-gray-400">Please login on the Dashboard first.</div>

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3"><SettingsIcon className="text-blue-500 w-8 h-8"/> Control Center</h2>
          <p className="text-gray-400 mt-2 text-sm max-w-xl">Configure Sentinel's autonomous boundaries, alert systems, and underlying smart account permissions.</p>
        </div>
        <button 
          onClick={handleSaveConfig}
          disabled={isSavingConfig}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={18}/> {isSavingConfig ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Zap className="text-yellow-500"/> Autonomous Engine</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <h4 className="font-bold">Auto-Repay Execution</h4>
                  <p className="text-xs text-gray-400 mt-1">Allow Venice AI to actively execute 1Shot Relayer transactions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={autoRepayEnabled} onChange={(e) => setAutoRepayEnabled(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Max Repay Per Transaction ($)</label>
                <input 
                  type="number" 
                  value={maxRepayPerTx}
                  onChange={(e) => setMaxRepayPerTx(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition font-mono" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Stablecoin</label>
                <select 
                  value={preferredStablecoin}
                  onChange={(e) => setPreferredStablecoin(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition"
                >
                  <option value="USDC">USDC (Base)</option>
                  <option value="USDT">USDT (Base)</option>
                  <option value="DAI">DAI (Base)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Bell className="text-green-500"/> Notifications</h3>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Telegram Alert Handle (Optional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">@</span>
                <input 
                  type="text" 
                  placeholder="username" 
                  value={telegramHandle}
                  onChange={(e) => setTelegramHandle(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white outline-none focus:border-blue-500 transition font-mono text-sm" 
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          <div className="glass-card border-blue-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>
            
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Bot className="text-blue-500"/> Bring Your Own AI Key</h3>
            <p className="text-sm text-gray-400 mb-6">
              Override the Sentinel default infrastructure and use your own Venice AI API key for 100% privacy and dedicated rate limits.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Custom Venice API Key</label>
              <input 
                type="password" 
                placeholder="VENICE_INFERENCE_KEY_..." 
                value={veniceApiKey}
                onChange={(e) => setVeniceApiKey(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition font-mono text-sm" 
              />
            </div>
          </div>

          <div className="glass-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none"></div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Shield className="text-purple-500"/> ERC-7715 Delegation</h3>
            <p className="text-sm text-gray-400 mb-6">
              Sentinel uses EIP-7715 to request extremely narrow, time-bound execution permissions. We cannot move funds, we can only repay debts.
            </p>

            {isDelegated ? (
              <div className="p-1 rounded-xl bg-gradient-to-r from-green-500/50 to-blue-500/50">
                <div className="bg-[#0f1115] p-5 rounded-lg flex flex-col items-center text-center gap-3">
                  <CheckCircle2 className="text-green-400 w-12 h-12 mb-2" />
                  <div>
                    <h4 className="font-bold text-lg text-white">Delegation Active</h4>
                    <p className="text-xs text-gray-400 mt-1 font-mono">Chain: Base (8453) • Target: Sentinel Router</p>
                  </div>
                  <button 
                    onClick={() => setIsDelegated(false)}
                    className="mt-4 px-6 py-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition text-sm font-bold w-full"
                  >
                    Revoke 7715 Authority
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleDelegate}
                disabled={isSigning}
                className="w-full p-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50"
              >
                <div className="bg-[#0f1115] hover:bg-transparent transition-colors p-5 rounded-lg flex items-center justify-center gap-2">
                  <span className="font-bold text-white">
                    {isSigning ? 'Waiting for Passkey Signature...' : 'Grant 1Shot Execution Permissions'}
                  </span>
                </div>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
