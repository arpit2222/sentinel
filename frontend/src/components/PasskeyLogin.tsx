'use client';

import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { Key } from 'lucide-react';

export default function PasskeyLogin({ onLogin }: { onLogin: (userId: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = '0xMockUser'; // In a real app, this would be generated or derived

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const resp = await fetch(`${apiUrl}/api/auth/generate-registration-options?userId=${userId}`);
      const options = await resp.json();

      if (options.error) throw new Error(options.error);

      if (options.extensions?.prf?.eval?.first) {
        options.extensions.prf.eval.first = new TextEncoder().encode('sentinel-wallet-seed-v1'.padEnd(32, ' '));
      }

      let attResp;
      try {
        attResp = await startRegistration(options);
      } catch (error: any) {
        if (error.name === 'InvalidStateError') {
          throw new Error('Passkey already registered on this device.');
        }
        throw error;
      }

      const verificationResp = await fetch(`${apiUrl}/api/auth/verify-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, body: attResp }),
      });
      const verificationJSON = await verificationResp.json();

      if (verificationJSON.verified) {
        onLogin(userId);
      } else {
        throw new Error('Verification failed');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const resp = await fetch(`${apiUrl}/api/auth/generate-authentication-options?userId=${userId}`);
      const options = await resp.json();

      if (options.error) throw new Error(options.error);

      if (options.extensions?.prf?.eval?.first) {
        options.extensions.prf.eval.first = new TextEncoder().encode('sentinel-wallet-seed-v1'.padEnd(32, ' '));
      }

      const asseResp = await startAuthentication(options);

      const verificationResp = await fetch(`${apiUrl}/api/auth/verify-authentication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, body: asseResp }),
      });
      const verificationJSON = await verificationResp.json();

      if (verificationJSON.verified) {
        onLogin(userId);
      } else {
        throw new Error('Login failed');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={handleRegister}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg font-bold transition disabled:opacity-50"
        >
          <Key size={20} /> Create Passkey
        </button>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-xl text-lg font-bold transition disabled:opacity-50"
        >
          Login
        </button>
      </div>
      <button
          onClick={() => onLogin(userId)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl text-sm font-semibold transition"
      >
          Demo Login (Bypass Passkey)
      </button>
      {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">{error}</div>}
    </div>
  );
}
