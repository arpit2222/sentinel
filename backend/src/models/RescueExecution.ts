import mongoose, { Schema, Document } from 'mongoose';

export interface IRescueExecution extends Document {
  txHash: string;
  userAddress: string;
  positionId: string;
  repayAmount: number;
  costUSDC: number;
  ltvBefore: number;
  ltvAfter: number;
  status: string;
  monitorReasoning: string;
  relayerResponse: any;
  executedAt: Date;
  confirmedAt: Date;
}

const RescueExecutionSchema: Schema = new Schema({
  txHash: { type: String, required: true, unique: true },
  userAddress: { type: String, required: true },
  positionId: { type: String, required: true },
  repayAmount: { type: Number, required: true },
  costUSDC: { type: Number, required: true },
  ltvBefore: { type: Number, required: true },
  ltvAfter: { type: Number, required: true },
  status: { type: String, required: true }, // 'success' | 'failed'
  monitorReasoning: { type: String },
  relayerResponse: { type: Schema.Types.Mixed },
  executedAt: { type: Date, default: Date.now },
  confirmedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model<IRescueExecution>('RescueExecution', RescueExecutionSchema);
