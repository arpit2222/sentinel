import mongoose from 'mongoose';

const PasskeySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  webAuthnUserId: { type: String, required: true }, // Internal SimpleWebAuthn User ID
  credentialID: { type: String, required: true, unique: true }, // base64url encoded
  credentialPublicKey: { type: Buffer, required: true },
  counter: { type: Number, required: true },
  credentialDeviceType: { type: String, required: true },
  credentialBackedUp: { type: Boolean, required: true },
  transports: { type: [String] }
}, { timestamps: true });

export const Passkey = mongoose.model('Passkey', PasskeySchema);

// In-memory challenge store for the MVP (in production use Redis)
export const activeChallenges: Record<string, string> = {};
