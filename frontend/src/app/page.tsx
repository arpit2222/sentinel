'use client'

import { Activity, ShieldAlert, Zap, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [ltv, setLtv] = useState(72);
  const [isRescuing, setIsRescuing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Simulate live LTV changes and rescue
    const interval = setInterval(() => {
      setLtv(prev => {
        if (prev >= 80) {
          setIsRescuing(true);
          setLogs(l => ["[Monitor] AI Risk Score HIGH. Liquidation imminent. Triggering rescue...", ...l]);
          setTimeout(() => {
            setLtv(71);
            setIsRescuing(false);
            setLogs(l => ["[Executor] Successfully repaid 2,000 USDC via 1Shot Relayer. LTV reduced to 71%.", ...l]);
          }, 3000);
          return prev;
        }
        if (isRescuing) return prev;
        const newLtv = prev + Math.random() * 2;
        return newLtv;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isRescuing]);

  const ltvColor = ltv < 75 ? 'bg-green-500' : ltv < 80 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Positions Column */}
      <div className="col-span-1 lg:col-span-2 space-y-6">
        <div className="glass-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><Activity className="text-blue-500"/> Monitored Positions</h3>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition cursor-pointer">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-bold text-lg">Aave V3 (Base)</p>
                <p className="text-sm text-gray-400">10.5 WETH / 25,000 USDC</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{ltv.toFixed(1)}%</p>
                <p className="text-sm text-gray-400">Current LTV</p>
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
              <span>Liquidation (82%)</span>
            </div>
          </div>
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
                <tr className="border-b border-white/5">
                  <td className="py-3">Aave V3</td>
                  <td className="py-3">2,000 USDC</td>
                  <td className="py-3">0.05 USDC</td>
                  <td className="py-3">80.1% → 71.0%</td>
                  <td className="py-3"><span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Success</span></td>
                </tr>
                <tr>
                  <td className="py-3">Morpho</td>
                  <td className="py-3">500 USDC</td>
                  <td className="py-3">0.02 USDC</td>
                  <td className="py-3">85.0% → 80.0%</td>
                  <td className="py-3"><span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Success</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Activity Feed Column */}
      <div className="col-span-1 space-y-6">
        <div className="glass-card h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><Clock className="text-blue-500"/> Live Activity</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4">
            {isRescuing && (
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 animate-pulse">
                <p className="text-sm text-yellow-400 mb-1 flex items-center gap-2"><ShieldAlert size={16}/> Action Required</p>
                <p className="text-sm">Venice AI scoring risk at 95/100. Executing emergency debt repayment via 1Shot Relayer...</p>
              </div>
            )}
            
            {logs.map((log, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-gray-500 mb-1">Just now</p>
                <p className="text-sm text-gray-300">{log}</p>
              </div>
            ))}
            
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-gray-500 mb-1">1 hour ago</p>
              <p className="text-sm text-gray-300">[Venice AI] Agent &quot;Sentinel-Executor-V1&quot; verified. Trust score updated to 95/100.</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-gray-500 mb-1">2 hours ago</p>
              <p className="text-sm text-gray-300">User delegated ERC-7710 spending authority to Sentinel.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
