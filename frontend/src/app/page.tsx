'use client'

import { Activity, ShieldAlert, Zap, Clock, Play, Lock } from 'lucide-react'
import { useState, useEffect } from 'react'
import PasskeyLogin from '../components/PasskeyLogin'

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (userAddress: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const [posRes, execRes] = await Promise.all([
        fetch(`${apiUrl}/api/users/${userAddress}/positions`),
        fetch(`${apiUrl}/api/users/${userAddress}/executions`)
      ]);
      const pos = await posRes.json();
      const exec = await execRes.json();
      setPositions(pos);
      setExecutions(exec);
    } catch (e) {
      console.error("Failed to fetch live data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check localStorage on mount
    const savedId = localStorage.getItem('sentinel_user_id');
    if (savedId) {
      setUserId(savedId);
    }
  }, []);

  const handleLoginSuccess = (id: string) => {
    localStorage.setItem('sentinel_user_id', id);
    setUserId(id);
  };

  useEffect(() => {
    if (!userId) return;
    fetchDashboardData(userId);
    const interval = setInterval(() => fetchDashboardData(userId), 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleSeed = async () => {
    if (!userId) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    await fetch(`${apiUrl}/api/seed-position`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: userId })
    });
    fetchDashboardData(userId);
  };

  if (!userId) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="glass-card max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Secure Authentication
          </h2>
          <p className="text-gray-400 pb-4">
            Authenticate with your device's biometric scanner to unlock your Smart Account. No MetaMask required.
          </p>
          <PasskeyLogin onLogin={handleLoginSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Positions Column */}
      <div className="col-span-1 lg:col-span-2 space-y-6">
        <div className="glass-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><Activity className="text-blue-500"/> Live Positions</h3>
            <button 
              onClick={handleSeed}
              className="px-3 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 rounded flex items-center gap-1 text-sm border border-blue-500/30 transition"
            >
              <Play size={14}/> Seed Demo Position
            </button>
          </div>
          
          {positions.length === 0 && !loading && (
            <div className="p-8 text-center border border-dashed border-white/20 rounded-xl">
              <p className="text-gray-400 mb-2">No active lending positions found for this Smart Account.</p>
              <p className="text-sm text-gray-500">Click "Seed Demo Position" above to inject a live position.</p>
            </div>
          )}

          {positions.map(pos => {
            const ltv = pos.ltvPercent || 0;
            const ltvColor = ltv < 75 ? 'bg-green-500' : ltv < 80 ? 'bg-yellow-500' : 'bg-red-500';
            
            return (
              <div key={pos._id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition cursor-pointer mb-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-bold text-lg">{pos.protocolId.toUpperCase()}</p>
                    <p className="text-sm text-gray-400">{pos.collateralAmount} {pos.collateralToken} / {pos.debtAmount} {pos.debtToken}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{ltv.toFixed(1)}%</p>
                    <p className="text-sm text-gray-400">Live LTV</p>
                  </div>
                </div>
                
                {/* LTV Bar */}
                <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${ltvColor}`}
                    style={{ width: `${Math.min(ltv, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Safe (0-75%)</span>
                  <span>Liquidation (80%)</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="glass-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><Zap className="text-yellow-500"/> Rescue History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="pb-3 font-medium">Protocol</th>
                  <th className="pb-3 font-medium">Repaid</th>
                  <th className="pb-3 font-medium">Gas Paid</th>
                  <th className="pb-3 font-medium">LTV Drop</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {executions.map(exec => (
                  <tr key={exec._id} className="border-b border-white/5">
                    <td className="py-3">{exec.protocolId || 'Aave V3'}</td>
                    <td className="py-3">{exec.repayAmount} USDC</td>
                    <td className="py-3">${exec.costUSDC || exec.gasFeeUsd || 0.05}</td>
                    <td className="py-3">{exec.ltvBefore?.toFixed(1)}% → {exec.ltvAfter?.toFixed(1)}%</td>
                    <td className="py-3"><span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Success</span></td>
                  </tr>
                ))}
                {executions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-5 text-center text-gray-500">No rescues recorded for this account.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Activity Feed Column */}
      <div className="col-span-1 space-y-6">
        <div className="glass-card h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><Clock className="text-blue-500"/> Venice AI Logs</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4">
            
            {executions.map((exec, i) => (
              <div key={exec._id} className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-sm text-yellow-400 mb-1 flex items-center gap-2"><ShieldAlert size={16}/> Relayer Triggered</p>
                <p className="text-xs text-gray-400 mb-2">{new Date(exec.executedAt).toLocaleString()}</p>
                <p className="text-sm text-gray-200">{exec.monitorReasoning || exec.veniceReasoning}</p>
              </div>
            ))}

            {executions.length === 0 && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm text-gray-300">Monitoring positions securely on Base...</p>
              </div>
            )}
            
          </div>
        </div>
      </div>

    </div>
  )
}
