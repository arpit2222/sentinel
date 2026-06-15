'use client'

import { useState } from 'react'
import { Key, Settings as SettingsIcon, AlertTriangle } from 'lucide-react'

export default function Settings() {
  const [isDelegated, setIsDelegated] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

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
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Key className="text-yellow-500"/> Smart Account Delegation (ERC-7715)</h3>
        <p className="text-sm text-gray-400 mb-6">
          To allow SENTINEL to save your positions from liquidation, you must delegate limited spending authority. 
          SENTINEL will only be able to spend the specific amount you authorize, and only on the whitelisted protocols.
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
            {isSigning ? 'Requesting wallet signature...' : 'Grant Execution Permissions via MetaMask'}
          </button>
        )}
      </div>

      <div className="glass-card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><AlertTriangle className="text-orange-500"/> Auto-Repay Thresholds</h3>
        
        <div className="space-y-6 mt-6">
          <div>
            <label className="flex justify-between text-sm font-medium text-gray-300 mb-2">
              <span>Max Repay % Per Transaction</span>
              <span>30%</span>
            </label>
            <input type="range" min="10" max="100" defaultValue="30" className="w-full accent-blue-500" />
            <p className="text-xs text-gray-500 mt-2">The maximum percentage of debt SENTINEL will repay in a single transaction.</p>
          </div>

          <div>
            <label className="flex justify-between text-sm font-medium text-gray-300 mb-2">
              <span>Time-to-Liquidation Buffer</span>
              <span>30 minutes</span>
            </label>
            <input type="range" min="5" max="120" defaultValue="30" className="w-full accent-blue-500" />
            <p className="text-xs text-gray-500 mt-2">SENTINEL will attempt rescue when liquidation is this close to occurring.</p>
          </div>
        </div>
      </div>

    </div>
  )
}
