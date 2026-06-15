import mongoose, { Schema, Document } from 'mongoose';

export interface IPosition extends Document {
  id: string;
  userAddress: string;
  protocolId: string;
  collateralToken: string;
  collateralAmount: number;
  debtToken: string;
  debtAmount: number;
  ltvPercent: number;
  monitored: boolean;
  rescueCount: number;
  lastRescueTime: Date;
}

const PositionSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  userAddress: { type: String, required: true },
  protocolId: { type: String, required: true },
  collateralToken: { type: String, required: true },
  collateralAmount: { type: Number, required: true },
  debtToken: { type: String, required: true },
  debtAmount: { type: Number, required: true },
  ltvPercent: { type: Number, required: true },
  monitored: { type: Boolean, default: true },
  rescueCount: { type: Number, default: 0 },
  lastRescueTime: { type: Date }
}, { timestamps: true });

export default mongoose.model<IPosition>('Position', PositionSchema);
