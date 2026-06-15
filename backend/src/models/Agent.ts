import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  id: string;
  name: string;
  agentType: string; // 'Monitor', 'Executor', 'RiskScorer'
  isActive: boolean;
  successCount: number;
  failCount: number;
  riskScore: number; // 0-100 (Venice AI Computed)
  owner: string;
  audited: boolean;
  veniceReasoning: string;
}

const AgentSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  agentType: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  successCount: { type: Number, default: 0 },
  failCount: { type: Number, default: 0 },
  riskScore: { type: Number, default: 50 },
  owner: { type: String, required: true },
  audited: { type: Boolean, default: false },
  veniceReasoning: { type: String }
}, { timestamps: true });

export default mongoose.model<IAgent>('Agent', AgentSchema);
