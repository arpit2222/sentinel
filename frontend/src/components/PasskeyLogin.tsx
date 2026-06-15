'use client';

import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { Key } from 'lucide-react';

export default function PasskeyLogin() {
  const [walletKey, setWalletKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = '0xMockUser';

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      // 1. Get options from server
      const resp = await fetch(`${apiUrl}/api/auth/generate-registration-options?userId=${userId}`);
      const options = await resp.json();

      if (options.error) throw new Error(options.error);

      // Fix PRF Extension Uint8Array serialization issue
      if (options.extensions?.prf?.eval?.first) {
        options.extensions.prf.eval.first = new TextEncoder().encode('sentinel-wallet-seed-v1'.padEnd(32, ' '));
      }

      // 2. Prompt biometric / passkey
      let attResp;
      try {
        attResp = await startRegistration(options);
      } catch (error: any) {
        if (error.name === 'InvalidStateError') {
          throw new Error('Passkey already registered on this device.');
        }
        throw error;
      }

      // 3. Send response to server
      const verificationResp = await fetch(`${apiUrl}/api/auth/verify-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, body: attResp }),
      });
      const verificationJSON = await verificationResp.json();

      if (verificationJSON.verified) {
        setWalletKey(verificationJSON.derivedWalletKey);
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

      // Fix PRF Extension Uint8Array serialization issue
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
        setWalletKey(verificationJSON.derivedWalletKey);
      } else {
        throw new Error('Login failed');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (walletKey) {
    return (
      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-lg">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-green-400 font-medium text-sm">Passkey Wallet Active</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={handleRegister}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
        >
          <Key size={16} /> Create Passkey
        </button>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-sm font-semibold transition disabled:opacity-50"
        >
          Login
        </button>
      </div>
      <button
          onClick={() => setWalletKey('0xDemoAccountKeyDerivedBy1ShotPasskeyFallback')}
          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-semibold transition"
      >
          Demo Login (Bypass Passkey)
      </button>
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  );
}
