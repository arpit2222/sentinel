import { FileCode2, ExternalLink, ShieldCheck, Zap, Database } from 'lucide-react'
import Link from 'next/link'

export default function Contracts() {
  const contracts = [
    {
      name: "1Shot Smart Account Factory",
      address: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      type: "Infrastructure",
      description: "The core ERC-4337 factory responsible for deploying biometric smart contract wallets. When you log in with a Passkey, this factory computes your deterministic address and deploys your smart account upon your first transaction.",
      icon: <Database className="text-blue-500 w-6 h-6" />,
      link: "https://basescan.org/address/0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
    },
    {
      name: "Sentinel ERC-7715 Router",
      address: "0x8B321baC9a7B720d202Cb5500eB4bb0BEf7d0831",
      type: "Delegation Target",
      description: "This is the secure router contract that the AI is granted permission to interact with via ERC-7715. It enforces rigid boundaries: it can only withdraw USDC and strictly route it into the Aave V3 Pool on your behalf. It physically cannot send funds elsewhere.",
      icon: <ShieldCheck className="text-purple-500 w-6 h-6" />,
      link: "https://basescan.org/address/0x8B321baC9a7B720d202Cb5500eB4bb0BEf7d0831"
    },
    {
      name: "1Shot Paymaster",
      address: "0x14202Da43E745bE677F6e55df59954dF8E4cc5a7",
      type: "Gas Sponsorship",
      description: "Because Sentinel executes liquidations autonomously, the AI needs a way to pay for gas without draining your ETH. The 1Shot Paymaster sponsors the transaction fees for emergency rescues on the Base network.",
      icon: <Zap className="text-yellow-500 w-6 h-6" />,
      link: "https://basescan.org/address/0x14202Da43E745bE677F6e55df59954dF8E4cc5a7"
    },
    {
      name: "Aave V3 Pool (Base)",
      address: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
      type: "DeFi Protocol",
      description: "The official Aave V3 lending pool on Base. This is where your actual debt and collateral live. Sentinel monitors this contract's state to detect your Health Factor and LTV.",
      icon: <Database className="text-green-500 w-6 h-6" />,
      link: "https://basescan.org/address/0xA238Dd80C259a72e81d7e4664a9801593F98d1c5"
    }
  ]

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-3"><FileCode2 className="text-blue-500 w-8 h-8"/> Smart Contracts</h2>
        <p className="text-gray-400 mt-2 text-sm max-w-2xl">
          Complete transparency is a core pillar of Sentinel. Below is a detailed mapping of the infrastructure contracts, delegation targets, and DeFi protocols our AI interacts with.
        </p>
      </div>

      <div className="grid gap-6">
        {contracts.map((contract, i) => (
          <div key={i} className="glass-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition"></div>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                  {contract.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{contract.name}</h3>
                  <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-mono text-gray-400">
                    Type: {contract.type}
                  </span>
                  <p className="text-gray-400 mt-4 text-sm leading-relaxed">
                    {contract.description}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 min-w-[250px]">
                <p className="text-xs text-gray-500 mb-1">Contract Address</p>
                <div className="font-mono text-sm text-blue-400 truncate mb-4">
                  {contract.address.substring(0,6)}...{contract.address.substring(38)}
                </div>
                <Link 
                  href={contract.link} 
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-bold transition text-white"
                >
                  View on Basescan <ExternalLink size={14}/>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
