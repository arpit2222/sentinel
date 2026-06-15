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

// Dynamic Origin and RP ID detection from headers
const getOriginInfo = (req: any) => {
  const origin = req.headers.origin || (process.env.FRONTEND_URL || 'http://localhost:3000');
  let rpID = 'localhost';
  try {
    const url = new URL(origin);
    rpID = url.hostname;
  } catch (e) {
    // fallback
  }
  return { origin, rpID };
};

// 1. Generate Registration Options
router.get('/generate-registration-options', async (req, res) => {
  try {
    const { origin, rpID } = getOriginInfo(req);
    const userId = (req.query.userId as string) || '0xMockUser';
    
    // Check for existing passkeys to exclude them
    const existingPasskeys = await Passkey.find({ userId });
    
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new Uint8Array(Buffer.from(userId)),
      userName: userId,
      attestationType: 'none',
      excludeCredentials: existingPasskeys.map(pk => ({
        id: pk.credentialID, // v10+ uses string
        type: 'public-key',
        transports: pk.transports as any,
      })),
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
      extensions: {
        prf: {
          eval: {
            first: new Uint8Array(Buffer.from('sentinel-wallet-seed-v1'.padEnd(32, ' '))),
          }
        }
      } as any // Bypass strict typing for experimental PRF
    });

    activeChallenges[userId] = options.challenge;
    res.json(options);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Verify Registration Response
router.post('/verify-registration', async (req, res) => {
  try {
    const { origin, rpID } = getOriginInfo(req);
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
      // v13 typings have `credential` instead of flat properties
      const cred = verification.registrationInfo.credential;
      const credentialID = cred ? cred.id : (verification.registrationInfo as any).credentialID;
      const credentialPublicKey = cred ? cred.publicKey : (verification.registrationInfo as any).credentialPublicKey;
      const counter = cred ? cred.counter : (verification.registrationInfo as any).counter;
      const credentialDeviceType = (verification.registrationInfo as any).credentialDeviceType || 'singleDevice';
      const credentialBackedUp = (verification.registrationInfo as any).credentialBackedUp || false;

      await Passkey.create({
        userId,
        webAuthnUserId: userId,
        credentialID: credentialID instanceof Uint8Array ? Buffer.from(credentialID).toString('base64url') : credentialID,
        credentialPublicKey: Buffer.from(credentialPublicKey),
        counter,
        credentialDeviceType,
        credentialBackedUp,
        transports: body.response.transports || [],
      });

      delete activeChallenges[userId];
      
      const prfResults = body.clientExtensionResults?.prf;
      const derivedKey = prfResults?.results?.first 
        ? Buffer.from(prfResults.results.first).toString('hex') 
        : Buffer.from(credentialID).toString('hex').substring(0, 64);

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
    const { rpID } = getOriginInfo(req);
    const userId = (req.query.userId as string) || '0xMockUser';
    const userPasskeys = await Passkey.find({ userId });

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userPasskeys.map(pk => ({
        id: pk.credentialID, // v10+ uses string
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
      } as any
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
    const { origin, rpID } = getOriginInfo(req);
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
      // v13 uses `credential` instead of `authenticator`
      credential: {
        id: passkey.credentialID,
        publicKey: passkey.credentialPublicKey,
        counter: passkey.counter,
        transports: passkey.transports as any,
      } as any,
      requireUserVerification: true,
    } as any);

    if (verification.verified) {
      passkey.counter = verification.authenticationInfo.newCounter;
      await passkey.save();
      delete activeChallenges[userId];

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
