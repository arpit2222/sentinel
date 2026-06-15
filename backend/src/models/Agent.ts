import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback {
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IAgent extends Document {
  id: string;
  name: string;
  agentType: string; // 'Monitor', 'Executor', 'RiskScorer', 'Strategy', 'Trading', 'Security'
  url?: string;
  isActive: boolean;
  successCount: number;
  failCount: number;
  riskScore: number; // 0-100 (Venice AI Computed)
  owner: string;
  audited: boolean;
  veniceReasoning: string;
  ratingScore: number;
  ratingCount: number;
  feedbacks: IFeedback[];
}

const AgentSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  agentType: { type: String, required: true },
  url: { type: String },
  isActive: { type: Boolean, default: true },
  successCount: { type: Number, default: 0 },
  failCount: { type: Number, default: 0 },
  riskScore: { type: Number, default: 50 },
  owner: { type: String, required: true },
  audited: { type: Boolean, default: false },
  veniceReasoning: { type: String },
  ratingScore: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  feedbacks: [{
    userId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model<IAgent>('Agent', AgentSchema);
