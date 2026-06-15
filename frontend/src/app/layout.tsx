import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Shield, LayoutDashboard, ShieldCheck, Settings, FileCode2 } from "lucide-react";
import Link from "next/link";
import ChatTerminal from "@/components/ChatTerminal";
import LogoutButton from "@/components/LogoutButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SENTINEL - Auto-Liquidation Agent",
  description: "Autonomous liquidation prevention agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0f1115] text-white overflow-hidden`}>
        {/* Animated Gradient Mesh Background */}
        <div className="fixed inset-0 z-[-1] opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/30 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <Providers>
          <div className="flex h-screen overflow-hidden relative z-10">
            <nav className="w-64 border-r border-white/10 p-6 flex flex-col justify-between bg-black/20 backdrop-blur-md">
              <div>
                <div className="flex items-center gap-2 text-2xl font-black tracking-tighter text-blue-400 mb-12">
                  <Shield className="w-8 h-8"/>
                  SENTINEL
                </div>
                <ul className="space-y-4">
                  <li>
                    <Link href="/" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
                      <LayoutDashboard size={20} /> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/whitelist" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
                      <ShieldCheck size={20} /> Universal Directory
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
                      <Settings size={20} /> Settings
                    </Link>
                  </li>
                  <li>
                    <Link href="/contracts" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
                      <FileCode2 size={20} /> Smart Contracts
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <LogoutButton />
              </div>
            </nav>
            <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-transparent to-black/40">
              <header className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Overview</h2>
              </header>
              {children}
            </main>
          </div>
          <ChatTerminal />
        </Providers>
      </body>
    </html>
  );
}
