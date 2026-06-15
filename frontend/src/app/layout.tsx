import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Shield, LayoutDashboard, ShieldCheck, Settings } from "lucide-react";
import Link from "next/link";
import PasskeyLogin from "@/components/PasskeyLogin";
import ChatTerminal from "@/components/ChatTerminal";

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
      <body className={inter.className}>
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <nav className="w-64 border-r border-white/10 p-6 flex flex-col justify-between">
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
                      <ShieldCheck size={20} /> Whitelists & AI
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
                      <Settings size={20} /> Settings
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <PasskeyLogin />
              </div>
            </nav>
            <main className="flex-1 overflow-y-auto p-8">
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
