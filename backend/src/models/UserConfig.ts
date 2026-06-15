import mongoose, { Schema, Document } from 'mongoose';

export interface IUserConfig extends Document {
  address: string;
  whitelistedProtocols: string[];
  whitelistedAgents: string[];
  whitelistedCollaterals: string[];
  blacklistedTokens: string[];
  maxRepayPercent: number;
  minTimeToLiquidation: number;
  preferredStablecoin: string;
  autoRepayEnabled: boolean;
  parentDelegation: string;
  monitorAgentAddress: string;
  executorAgentAddress: string;
  maxRepayPerTx: number;
  delegationValidUntil: number;
}

const UserConfigSchema: Schema = new Schema({
  address: { type: String, required: true, unique: true },
  whitelistedProtocols: [{ type: String }],
  whitelistedAgents: [{ type: String }],
  whitelistedCollaterals: [{ type: String }],
  blacklistedTokens: [{ type: String }],
  maxRepayPercent: { type: Number, default: 30 },
  minTimeToLiquidation: { type: Number, default: 1800 },
  preferredStablecoin: { type: String, default: 'USDC' },
  autoRepayEnabled: { type: Boolean, default: false },
  parentDelegation: { type: String },
  monitorAgentAddress: { type: String },
  executorAgentAddress: { type: String },
  maxRepayPerTx: { type: Number, default: 5000 },
  delegationValidUntil: { type: Number }
}, { timestamps: true });

export default mongoose.model<IUserConfig>('UserConfig', UserConfigSchema);
