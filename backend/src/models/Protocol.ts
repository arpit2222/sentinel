import mongoose, { Schema, Document } from 'mongoose';

export interface IProtocol extends Document {
  id: string;
  name: string;
  chainId: number;
  poolAddress: string;
  oracleAddress: string;
  liquidationThreshold: number; // e.g. 8000 for 80%
  liquidationPenalty: number; // e.g. 1500 for 15%
  isActive: boolean;
  riskScore: number; // 0-100 (Venice AI Computed)
  tvl: number;
  lastUpdated: Date;
  audited: boolean;
  exploits: number;
  veniceReasoning: string;
}

const ProtocolSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  chainId: { type: Number, required: true },
  poolAddress: { type: String, required: true },
  oracleAddress: { type: String, required: true },
  liquidationThreshold: { type: Number, required: true },
  liquidationPenalty: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  riskScore: { type: Number, default: 50 },
  tvl: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  audited: { type: Boolean, default: false },
  exploits: { type: Number, default: 0 },
  veniceReasoning: { type: String }
}, { timestamps: true });

export default mongoose.model<IProtocol>('Protocol', ProtocolSchema);
