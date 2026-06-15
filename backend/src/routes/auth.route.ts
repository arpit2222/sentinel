import { Router } from 'express';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server';
import { Passkey, activeChallenges } from '../models/Passkey';

const router = Router();
const rpName = 'SENTINEL Watchdog';

// Detect origin for WebAuthn dynamically
const getRPID = () => {
  if (process.env.FRONTEND_URL) {
    try {
      const url = new URL(process.env.FRONTEND_URL);
      return url.hostname;
    } catch (e) {
      return 'localhost';
    }
  }
  return 'localhost';
};

const rpID = getRPID();
const origin = process.env.FRONTEND_URL || `http://${rpID}:3000`;

// 1. Generate Registration Options
router.get('/generate-registration-options', async (req, res) => {
  try {
    const userId = req.query.userId as string || '0xMockUser';
    
    // Check for existing passkeys to exclude them
    const existingPasskeys = await Passkey.find({ userId });
    
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new Uint8Array(Buffer.from(userId)),
      userName: userId,
      attestationType: 'none',
      excludeCredentials: existingPasskeys.map(pk => ({
        id: new Uint8Array(Buffer.from(pk.credentialID, 'base64url')),
        type: 'public-key',
        transports: pk.transports as any,
      })),
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
      // PRF extension
      extensions: {
        prf: {
          eval: {
            first: new Uint8Array(Buffer.from('sentinel-wallet-seed-v1'.padEnd(32, ' '))),
          }
        }
      }
    });

    // Save challenge
    activeChallenges[userId] = options.challenge;

    res.json(options);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Verify Registration Response
router.post('/verify-registration', async (req, res) => {
  try {
    const { userId, body } = req.body;
    const expectedChallenge = activeChallenges[userId];

    if (!expectedChallenge) {
      return res.status(400).json({ error: 'Challenge not found' });
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

      await Passkey.create({
        userId,
        webAuthnUserId: userId,
        credentialID: Buffer.from(credentialID).toString('base64url'),
        credentialPublicKey: Buffer.from(credentialPublicKey),
        counter,
        credentialDeviceType,
        credentialBackedUp,
        transports: body.response.transports || [],
      });

      delete activeChallenges[userId];
      
      // Simulate PRF derivation if not present
      const prfResults = body.clientExtensionResults?.prf;
      const derivedKey = prfResults?.results?.first 
        ? Buffer.from(prfResults.results.first).toString('hex') 
        : Buffer.from(credentialID).toString('hex').substring(0, 64); // Fallback deterministic EVM key sim

      return res.json({ verified: true, derivedWalletKey: derivedKey });
    }
    
    res.status(400).json({ verified: false });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Generate Authentication Options
router.get('/generate-authentication-options', async (req, res) => {
  try {
    const userId = req.query.userId as string || '0xMockUser';
    const userPasskeys = await Passkey.find({ userId });

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userPasskeys.map(pk => ({
        id: new Uint8Array(Buffer.from(pk.credentialID, 'base64url')),
        type: 'public-key',
        transports: pk.transports as any,
      })),
      userVerification: 'preferred',
      extensions: {
        prf: {
          eval: {
            first: new Uint8Array(Buffer.from('sentinel-wallet-seed-v1'.padEnd(32, ' '))),
          }
        }
      }
    });

    activeChallenges[userId] = options.challenge;

    res.json(options);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Verify Authentication Response
router.post('/verify-authentication', async (req, res) => {
  try {
    const { userId, body } = req.body;
    const expectedChallenge = activeChallenges[userId];

    if (!expectedChallenge) {
      return res.status(400).json({ error: 'Challenge not found' });
    }

    const passkey = await Passkey.findOne({ 
      userId, 
      credentialID: body.id 
    });

    if (!passkey) {
      return res.status(400).json({ error: 'Passkey not found' });
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: new Uint8Array(Buffer.from(passkey.credentialID, 'base64url')),
        credentialPublicKey: passkey.credentialPublicKey,
        counter: passkey.counter,
        transports: passkey.transports as any,
      },
      requireUserVerification: true,
    });

    if (verification.verified) {
      // Update counter
      passkey.counter = verification.authenticationInfo.newCounter;
      await passkey.save();

      delete activeChallenges[userId];

      // PRF derivation fallback logic
      const prfResults = body.clientExtensionResults?.prf;
      const derivedKey = prfResults?.results?.first 
        ? Buffer.from(prfResults.results.first).toString('hex') 
        : Buffer.from(passkey.credentialID).toString('hex').substring(0, 64);

      return res.json({ verified: true, derivedWalletKey: derivedKey });
    }

    res.status(400).json({ verified: false });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
